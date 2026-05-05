import type {
  ContractTerminationData,
  ConstructorTerminationSubsectionId,
  TerminationConstructorCompletion,
} from '../../../../../types/contract';
import { normalizeStoredMoneyGrouped } from '../../../../../lib/moneyInputFormat';
import { defaultBuyerTerminationCompletion, defaultBuyerTerminationTerms } from '../../../../../lib/terminationBuyerRules';

const DEFAULT_COMPLETION: TerminationConstructorCompletion = {
  lateInstallment: false,
  financialObligations: false,
  documentDeficiencies: false,
  otherBreach: false,
  notifications: false,
};

const DEADLINE_DAYS = new Set(['3', '7', '10', '15', '20', '25', '30']);

function coerceDeadlinePreset(preset: string | undefined, customDays: string | undefined): ContractTerminationData['constructorTerms']['documentDeficiencies']['completionDeadlineDays'] {
  if (preset && DEADLINE_DAYS.has(preset)) return preset as ContractTerminationData['constructorTerms']['documentDeficiencies']['completionDeadlineDays'];
  const n = Number(String(customDays ?? '').replace(/\D/g, '') || NaN);
  if (Number.isFinite(n)) {
    const allowed: ContractTerminationData['constructorTerms']['documentDeficiencies']['completionDeadlineDays'][] = [
      '3',
      '7',
      '10',
      '15',
      '20',
      '25',
      '30',
    ];
    const closest = allowed.reduce((best, cur) =>
      Math.abs(Number(cur) - n) < Math.abs(Number(best) - n) ? cur : best,
    allowed[2]);
    return closest;
  }
  return '7';
}

function coerceOtherBreachRectification(preset: string | undefined, days: string | undefined): {
  rectificationDays: ContractTerminationData['constructorTerms']['otherBreach']['rectificationDays'];
  rectificationDaysCustom: string;
} {
  const p = String(preset ?? '');
  if (DEADLINE_DAYS.has(p)) {
    return { rectificationDays: p as ContractTerminationData['constructorTerms']['otherBreach']['rectificationDays'], rectificationDaysCustom: '' };
  }
  const d = String(days ?? '');
  const digits = d.replace(/\D/g, '');
  return { rectificationDays: 'other', rectificationDaysCustom: digits };
}

function isLegacyPayload(data: Record<string, unknown>): boolean {
  const builder = data.builder;
  return Boolean(builder && typeof builder === 'object' && 'activeForm' in builder);
}

export function migrateLegacyTerminationPayload(raw: Record<string, unknown>): ContractTerminationData {
  type LegacyBuilder = Record<string, unknown>;
  type LegacyFinancial = Record<string, unknown>;

  const b = raw.builder as LegacyBuilder;

  const inst = (b.installmentDelay ?? {}) as LegacyFinancial;
  const fin = (b.financialDefault ?? {}) as LegacyFinancial & { obligationTypes?: string[] };
  const doc = (b.documentDefect ?? {}) as LegacyFinancial & {
    requiredItems?: string[];
    reminderBeforeTermination?: boolean;
    gracePeriodPreset?: string;
    gracePeriodDays?: string;
  };
  const other = (b.otherBreach ?? {}) as LegacyFinancial & {
    breachTypes?: string[];
    gracePeriodPreset?: string;
    gracePeriodDays?: string;
  };
  const notif = (b.notifications ?? {}) as LegacyFinancial;

  const delayBasisRaw = String(inst.delayBasis ?? '');
  const detectionBasis =
    delayBasisRaw === 'debt-amount'
      ? 'total-debt'
      : delayBasisRaw === 'consecutive-unpaid-installments'
        ? 'consecutive-installments'
        : 'per-installment';

  const partialRaw = String(inst.partialPaymentMode ?? '');
  const partialHandling =
    partialRaw === 'ignore-partial'
      ? 'if-partial'
      : partialRaw === 'decide-by-balance'
        ? 'by-remaining-debt'
        : 'if-not-full';

  const obligationMap: Record<
    string,
    ContractTerminationData['constructorTerms']['financialObligations']['obligationTypes'][number] | null
  > = {
    'contract-costs': 'contract-costs',
    'contract-penalties': 'penalties',
    'custom-financial': 'custom-commitments',
    'extra-costs': 'extra-costs',
    'side-costs': 'side-costs',
    installments: null,
  };

  const docItemMap: Record<string, ContractTerminationData['constructorTerms']['documentDeficiencies']['mandatoryItems'][number]> = {
    'identity-documents': 'identity',
    'signature-completion': 'signing-docs',
    'legal-permits': 'legal-permits',
    'payment-documents': 'payment-docs',
    'physical-attendance': 'physical-presence',
  };

  const breachMap: Record<string, ContractTerminationData['constructorTerms']['otherBreach']['violationTypes'][number]> = {
    'transfer-restriction': 'transfer-restrictions',
    'refusal-to-sign': 'refusal-to-sign',
    'false-information': 'false-information',
    'non-cooperation': 'lack-cooperation',
  };

  const enabled = Boolean(raw.terminationEnabled);
  const legacyBuyer = raw.buyer as { enabled?: boolean } | undefined;
  const migrated: ContractTerminationData = {
    terminationEnabled: enabled,
    terminationPartyTab: 'seller',
    terminationConstructorPanel: 'list',
    terminationBuyerPanel: 'list',
    sellerTerminationEngaged: enabled && Boolean((b as { enabled?: boolean }).enabled),
    buyerTerminationEngaged: enabled && Boolean(legacyBuyer?.enabled),
    buyerCompletion: defaultBuyerTerminationCompletion(),
    constructorCompletion: raw.terminationEnabled
      ? {
          lateInstallment: true,
          financialObligations: true,
          documentDeficiencies: true,
          otherBreach: true,
          notifications: true,
        }
      : { ...DEFAULT_COMPLETION },
    constructorTerms: {
      lateInstallment: {
        ruleEnabled: Boolean(inst.enabled),
        gracePreset:
          ['3', '7', '10', '15', '30'].includes(String(inst.allowedDelayPreset))
            ? (String(inst.allowedDelayPreset) as ContractTerminationData['constructorTerms']['lateInstallment']['gracePreset'])
            : 'other',
        graceDaysCustom: String(inst.allowedDelayDays ?? ''),
        detectionBasis,
        minDebtAmount: String(inst.minDebtAmount ?? ''),
        partialHandling,
      },
      financialObligations: {
        ruleEnabled: Boolean(fin.enabled),
        obligationTypes: (fin.obligationTypes ?? [])
          .map((code) => obligationMap[String(code)])
          .filter((v): v is NonNullable<typeof v> => Boolean(v)),
        ...(function resolveFinancialGrace() {
          const preset = String(fin.gracePeriodPreset ?? '');
          if (preset === '3' || preset === '7' || preset === '15' || preset === '30') {
            return {
              gracePreset: preset as ContractTerminationData['constructorTerms']['financialObligations']['gracePreset'],
              graceDaysCustom: '',
            };
          }
          if (preset === 'other') {
            return {
              gracePreset: 'other' as const,
              graceDaysCustom: String(fin.gracePeriodDays ?? ''),
            };
          }
          return {
            gracePreset: 'other' as const,
            graceDaysCustom: preset.match(/^\d+$/) ? preset : String(fin.gracePeriodDays ?? ''),
          };
        })(),
        officialDemandRequired: Boolean(fin.officialNoticeRequired),
      },
      documentDeficiencies: {
        ruleEnabled: Boolean(doc.enabled),
        mandatoryItems: (doc.requiredItems ?? [])
          .map((code) => docItemMap[String(code)])
          .filter(Boolean) as ContractTerminationData['constructorTerms']['documentDeficiencies']['mandatoryItems'],
        completionDeadlineDays: coerceDeadlinePreset(
          String(doc.gracePeriodPreset),
          String(doc.gracePeriodDays ?? ''),
        ),
        autoReminderEnabled: Boolean(doc.reminderBeforeTermination),
      },
      otherBreach: {
        ruleEnabled: Boolean(other.enabled),
        violationTypes: (other.breachTypes ?? [])
          .map((code) => breachMap[String(code)])
          .filter(Boolean) as ContractTerminationData['constructorTerms']['otherBreach']['violationTypes'],
        ...coerceOtherBreachRectification(String(other.gracePeriodPreset), String(other.gracePeriodDays ?? '')),
        requiresContractManagerApproval: Boolean(other.managerApprovalRequired),
      },
      notifications: {
        ruleEnabled: Boolean(notif.enabled),
        notifyConstructor: Boolean(notif.notifyBuilderOnActivation),
        notifyManager: Boolean(notif.notifyContractManager),
        showTerminationActionInContractDetails: Boolean(notif.showTerminationSectionInDetails),
      },
    },
    buyerTerms: defaultBuyerTerminationTerms(),
  };

  if (Boolean(fin.enabled) && migrated.constructorTerms.financialObligations.obligationTypes.length === 0) {
    migrated.constructorTerms.financialObligations.obligationTypes = ['contract-costs'];
  }
  if (Boolean(doc.enabled) && migrated.constructorTerms.documentDeficiencies.mandatoryItems.length === 0) {
    migrated.constructorTerms.documentDeficiencies.mandatoryItems = ['identity'];
  }
  if (Boolean(other.enabled) && migrated.constructorTerms.otherBreach.violationTypes.length === 0) {
    migrated.constructorTerms.otherBreach.violationTypes = ['lack-cooperation'];
  }

  migrated.constructorTerms.lateInstallment.minDebtAmount = normalizeStoredMoneyGrouped(
    migrated.constructorTerms.lateInstallment.minDebtAmount,
  );

  return migrated;
}

export function isLegacyTerminationShape(data: unknown): data is Record<string, unknown> {
  return Boolean(data && typeof data === 'object' && isLegacyPayload(data as Record<string, unknown>));
}

/** Valid subsection ids for navigation (excludes structural routes). */
export const CONSTRUCTOR_SUBSECTION_IDS: ConstructorTerminationSubsectionId[] = [
  'lateInstallment',
  'financialObligations',
  'documentDeficiencies',
  'otherBreach',
  'notifications',
];
