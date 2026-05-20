import type {
  ConstructorTerminationSubsectionId,
  ContractTerminationData,
  TerminationConstructorPanel,
  TerminationPartyTab,
  TerminationBuyerPanel,
} from '../../../../../types/contract';
import {
  defaultBuyerTerminationCompletion,
  defaultBuyerTerminationTerms,
  mergeBuyerFieldsFromDraftRecord,
  normalizePersistedBuyerRules,
} from '../../../../../lib/terminationBuyerRules';
import { normalizeStoredMoneyGrouped } from '../../../../../lib/moneyInputFormat';
import { BUYER_SUBSECTION_IDS } from './buyerSubsections';
import { CONSTRUCTOR_SUBSECTION_IDS, isLegacyTerminationShape, migrateLegacyTerminationPayload } from './migrateLegacyTermination';

function isTerminationBuyerPanel(value: unknown): value is TerminationBuyerPanel {
  return value === 'list' || (typeof value === 'string' && (BUYER_SUBSECTION_IDS as readonly string[]).includes(value));
}

export const DEFAULT_TERMINATION_DATA: ContractTerminationData = {
  terminationEnabled: false,
  terminationPartyTab: 'seller',
  terminationConstructorPanel: 'list',
  terminationBuyerPanel: 'list',
  sellerTerminationEngaged: false,
  buyerTerminationEngaged: false,
  buyerCompletion: defaultBuyerTerminationCompletion(),
  constructorCompletion: {
    lateInstallment: false,
    financialObligations: false,
    documentDeficiencies: false,
    otherBreach: false,
    notifications: false,
  },
  constructorTerms: {
    lateInstallment: {
      ruleEnabled: false,
      gracePreset: '7',
      graceDaysCustom: '',
      detectionBasis: 'per-installment',
      minDebtAmount: '',
      consecutiveInstallmentsCount: '',
      partialHandling: 'if-not-full',
    },
    financialObligations: {
      ruleEnabled: false,
      obligationTypes: [],
      gracePreset: '7',
      graceDaysCustom: '',
      officialDemandRequired: false,
    },
    documentDeficiencies: {
      ruleEnabled: false,
      mandatoryItems: [],
      completionDeadlineDays: '7',
      completionDeadlineDaysCustom: '',
      autoReminderEnabled: false,
    },
    otherBreach: {
      ruleEnabled: false,
      violationTypes: [],
      rectificationDays: '7',
      rectificationDaysCustom: '',
      requiresContractManagerApproval: false,
    },
    notifications: {
      ruleEnabled: false,
      notifyConstructor: false,
      notifyManager: false,
      showTerminationActionInContractDetails: false,
    },
  },
  buyerTerms: defaultBuyerTerminationTerms(),
};

function pickConstructorTerms(partial: Partial<ContractTerminationData>): Partial<ContractTerminationData['constructorTerms']> | undefined {
  if (partial.constructorTerms) return partial.constructorTerms;
  const fromJson = (partial as Record<string, unknown>)['constructor'];
  if (fromJson && typeof fromJson === 'object') {
    return fromJson as Partial<ContractTerminationData['constructorTerms']>;
  }
  return undefined;
}

/** پیش‌نویس‌های قبلی با فیلد `terminationUi` به تب و پنل جدید نگاشت می‌شوند. */
function resolveTabsFromLegacyTerminationUi(record: Record<string, unknown>): {
  terminationPartyTab: TerminationPartyTab;
  terminationConstructorPanel: TerminationConstructorPanel;
} | null {
  const ui = record['terminationUi'];
  if (typeof ui !== 'string') return null;
  if (ui === 'main-cards' || ui === 'constructor-list') {
    return { terminationPartyTab: 'seller', terminationConstructorPanel: 'list' };
  }
  if (ui === 'buyer-dev') {
    return { terminationPartyTab: 'buyer', terminationConstructorPanel: 'list' };
  }
  if (CONSTRUCTOR_SUBSECTION_IDS.includes(ui as ConstructorTerminationSubsectionId)) {
    return {
      terminationPartyTab: 'seller',
      terminationConstructorPanel: ui as ConstructorTerminationSubsectionId,
    };
  }
  return null;
}

function mergeTerminationPayload(partial: Partial<ContractTerminationData>): ContractTerminationData {
  const raw = partial as Partial<ContractTerminationData> & Record<string, unknown>;
  const terms = pickConstructorTerms(partial);
  const tabsFromLegacy = resolveTabsFromLegacyTerminationUi(raw);
  let terminationPartyTab: TerminationPartyTab =
    partial.terminationPartyTab ?? tabsFromLegacy?.terminationPartyTab ?? DEFAULT_TERMINATION_DATA.terminationPartyTab;
  let terminationConstructorPanel: TerminationConstructorPanel =
    partial.terminationConstructorPanel ??
    tabsFromLegacy?.terminationConstructorPanel ??
    DEFAULT_TERMINATION_DATA.terminationConstructorPanel;

  if (terminationPartyTab === 'buyer' && terminationConstructorPanel !== 'list') {
    terminationConstructorPanel = 'list';
  }

  const buyerCoerced = mergeBuyerFieldsFromDraftRecord(raw);
  const partialBt = partial.buyerTerms;

  const terminationBuyerPanel: TerminationBuyerPanel = isTerminationBuyerPanel(partial.terminationBuyerPanel)
    ? partial.terminationBuyerPanel
    : buyerCoerced.terminationBuyerPanel;

  const defBt = DEFAULT_TERMINATION_DATA.buyerTerms;
  const areaDiscrepancy = normalizePersistedBuyerRules({
    buyerTerms: {
      areaDiscrepancy: {
        ...defBt.areaDiscrepancy,
        ...buyerCoerced.buyerTerms.areaDiscrepancy,
        ...partialBt?.areaDiscrepancy,
      },
    },
  })?.buyerTerms.areaDiscrepancy ?? defBt.areaDiscrepancy;
  const buyerTerms: ContractTerminationData['buyerTerms'] = {
    lateDelivery: { ...defBt.lateDelivery, ...buyerCoerced.buyerTerms.lateDelivery, ...partialBt?.lateDelivery },
    specificationChanges: {
      ...defBt.specificationChanges,
      ...buyerCoerced.buyerTerms.specificationChanges,
      ...partialBt?.specificationChanges,
      includedTypes: partialBt?.specificationChanges?.includedTypes ?? buyerCoerced.buyerTerms.specificationChanges.includedTypes,
    },
    breachOfObligations: {
      ...defBt.breachOfObligations,
      ...buyerCoerced.buyerTerms.breachOfObligations,
      ...partialBt?.breachOfObligations,
      obligationTypes:
        partialBt?.breachOfObligations?.obligationTypes ?? buyerCoerced.buyerTerms.breachOfObligations.obligationTypes,
    },
    physicalProgressDelay: {
      ...defBt.physicalProgressDelay,
      ...buyerCoerced.buyerTerms.physicalProgressDelay,
      ...partialBt?.physicalProgressDelay,
      milestoneTypes:
        partialBt?.physicalProgressDelay?.milestoneTypes ?? buyerCoerced.buyerTerms.physicalProgressDelay.milestoneTypes,
      milestoneSettings: {
        ...buyerCoerced.buyerTerms.physicalProgressDelay.milestoneSettings,
        ...partialBt?.physicalProgressDelay?.milestoneSettings,
      },
    },
    areaDiscrepancy: {
      ...areaDiscrepancy,
    },
    notification: { ...defBt.notification, ...buyerCoerced.buyerTerms.notification, ...partialBt?.notification },
    draftTemplateUsage: {
      ...defBt.draftTemplateUsage,
      ...partialBt?.draftTemplateUsage,
    },
  };

  return {
    terminationEnabled: Boolean(partial.terminationEnabled),
    terminationPartyTab,
    terminationConstructorPanel,
    terminationBuyerPanel,
    sellerTerminationEngaged: Boolean(partial.sellerTerminationEngaged),
    buyerTerminationEngaged: Boolean(partial.buyerTerminationEngaged),
    constructorCompletion: {
      ...DEFAULT_TERMINATION_DATA.constructorCompletion,
      ...partial.constructorCompletion,
    },
    buyerCompletion: {
      ...DEFAULT_TERMINATION_DATA.buyerCompletion,
      ...buyerCoerced.buyerCompletion,
      ...partial.buyerCompletion,
    },
    constructorTerms: {
      lateInstallment: (() => {
        const li = {
          ...DEFAULT_TERMINATION_DATA.constructorTerms.lateInstallment,
          ...terms?.lateInstallment,
        };
        return {
          ...li,
          minDebtAmount: normalizeStoredMoneyGrouped(li.minDebtAmount),
        };
      })(),
      financialObligations: {
        ...DEFAULT_TERMINATION_DATA.constructorTerms.financialObligations,
        ...terms?.financialObligations,
      },
      documentDeficiencies: {
        ...DEFAULT_TERMINATION_DATA.constructorTerms.documentDeficiencies,
        ...terms?.documentDeficiencies,
      },
      otherBreach: {
        ...DEFAULT_TERMINATION_DATA.constructorTerms.otherBreach,
        ...terms?.otherBreach,
      },
      notifications: {
        ...DEFAULT_TERMINATION_DATA.constructorTerms.notifications,
        ...terms?.notifications,
      },
    },
    buyerTerms,
  };
}

export function normalizeTerminationPayload(raw: ContractTerminationData | Record<string, unknown> | null): ContractTerminationData {
  if (raw == null) return DEFAULT_TERMINATION_DATA;
  if (isLegacyTerminationShape(raw)) return migrateLegacyTerminationPayload(raw);
  return mergeTerminationPayload(raw as Partial<ContractTerminationData>);
}
