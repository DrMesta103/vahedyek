import type {
  BuyerRulesPersisted,
  BuyerTerminationCompletion,
  BuyerTerminationSubsectionId,
  BuyerTerminationTerms,
  TerminationBuyerPanel,
} from '../types/contract';

const BUYER_PANEL_IDS = [
  'lateDelivery',
  'specificationChanges',
  'breachOfObligations',
  'areaDiscrepancy',
  'notification',
] as const satisfies readonly BuyerTerminationSubsectionId[];

const DEFAULT_BUYER_COMPLETION: BuyerTerminationCompletion = {
  lateDelivery: false,
  specificationChanges: false,
  breachOfObligations: false,
  areaDiscrepancy: false,
  notification: false,
};

export function defaultBuyerTerminationTerms(): BuyerTerminationTerms {
  return {
    lateDelivery: {
      ruleEnabled: false,
      calculationBasis: 'contract-date',
      gracePreset: '30',
      graceDaysCustom: '',
      expertApprovalRequired: false,
    },
    specificationChanges: {
      ruleEnabled: false,
      includedTypes: [],
      priorApprovalRequired: false,
    },
    breachOfObligations: {
      ruleEnabled: false,
      obligationTypes: [],
      rectificationPreset: '30',
      rectificationDaysCustom: '',
    },
    areaDiscrepancy: {
      ruleEnabled: false,
      thresholdPreset: '2',
      thresholdPercentCustom: '',
      referenceSources: [],
      financialSettlementInsteadOfTermination: false,
    },
    notification: {
      ruleEnabled: false,
      notifyBuyer: false,
      notifyContractManager: false,
      showManagementOptionInGrid: false,
    },
  };
}

export function defaultBuyerTerminationCompletion(): BuyerTerminationCompletion {
  return { ...DEFAULT_BUYER_COMPLETION };
}

const GRACE: BuyerTerminationTerms['lateDelivery']['gracePreset'][] = ['10', '30', '60', '90', '180', 'other'];

const RECT: BuyerTerminationTerms['breachOfObligations']['rectificationPreset'][] = ['7', '14', '21', '30', '45', '60', 'other'];

const THRESH: BuyerTerminationTerms['areaDiscrepancy']['thresholdPreset'][] = ['1', '2', '3', 'other'];

function coerceGracePreset(value: unknown): BuyerTerminationTerms['lateDelivery']['gracePreset'] {
  const s = String(value ?? '');
  return GRACE.includes(s as BuyerTerminationTerms['lateDelivery']['gracePreset'])
    ? (s as BuyerTerminationTerms['lateDelivery']['gracePreset'])
    : '30';
}

function coerceRectPreset(value: unknown): BuyerTerminationTerms['breachOfObligations']['rectificationPreset'] {
  const s = String(value ?? '');
  return RECT.includes(s as BuyerTerminationTerms['breachOfObligations']['rectificationPreset'])
    ? (s as BuyerTerminationTerms['breachOfObligations']['rectificationPreset'])
    : '30';
}

function coerceThresholdPreset(value: unknown): BuyerTerminationTerms['areaDiscrepancy']['thresholdPreset'] {
  const s = String(value ?? '');
  return THRESH.includes(s as BuyerTerminationTerms['areaDiscrepancy']['thresholdPreset'])
    ? (s as BuyerTerminationTerms['areaDiscrepancy']['thresholdPreset'])
    : '2';
}

function coerceCalculationBasis(value: unknown): BuyerTerminationTerms['lateDelivery']['calculationBasis'] {
  return value === 'last-addendum' || value === 'project-end' || value === 'contract-date' ? value : 'contract-date';
}

const SPEC_TYPES = new Set<string>([
  'unit-plan',
  'floor-change',
  'facility-reduction',
  'block-change',
  'material-quality',
]);

const BREACH_TYPES = new Set<string>([
  'construction-progress',
  'quality-standards',
  'infrastructure-delivery',
  'legal-docs',
  'service-connections',
]);

const AREA_REFS = new Set<string>(['title-deed', 'final-survey', 'property-registration']);

/** خواندن JSONB از پایگاه یا پیش‌نویس محلی */
export function normalizePersistedBuyerRules(raw: unknown): BuyerRulesPersisted | null {
  if (raw == null || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  let buyerTerms = defaultBuyerTerminationTerms();
  const termsIn = obj.buyerTerms;
  if (termsIn && typeof termsIn === 'object') {
    const t = termsIn as Record<string, unknown>;
    const ld = (t.lateDelivery && typeof t.lateDelivery === 'object' ? t.lateDelivery : {}) as Record<string, unknown>;
    buyerTerms.lateDelivery = {
      ruleEnabled: Boolean(ld.ruleEnabled),
      calculationBasis: coerceCalculationBasis(ld.calculationBasis),
      gracePreset: coerceGracePreset(ld.gracePreset),
      graceDaysCustom: String(ld.graceDaysCustom ?? '').replace(/\D/g, ''),
      expertApprovalRequired: Boolean(ld.expertApprovalRequired),
    };

    const sc = (t.specificationChanges && typeof t.specificationChanges === 'object' ? t.specificationChanges : {}) as Record<
      string,
      unknown
    >;
    const inc = Array.isArray(sc.includedTypes) ? sc.includedTypes.filter((x): x is string => typeof x === 'string' && SPEC_TYPES.has(x)) : [];
    buyerTerms.specificationChanges = {
      ruleEnabled: Boolean(sc.ruleEnabled),
      includedTypes: inc as BuyerTerminationTerms['specificationChanges']['includedTypes'],
      priorApprovalRequired: Boolean(sc.priorApprovalRequired),
    };

    const br = (t.breachOfObligations && typeof t.breachOfObligations === 'object' ? t.breachOfObligations : {}) as Record<
      string,
      unknown
    >;
    const obl = Array.isArray(br.obligationTypes)
      ? br.obligationTypes.filter((x): x is string => typeof x === 'string' && BREACH_TYPES.has(x))
      : [];
    buyerTerms.breachOfObligations = {
      ruleEnabled: Boolean(br.ruleEnabled),
      obligationTypes: obl as BuyerTerminationTerms['breachOfObligations']['obligationTypes'],
      rectificationPreset: coerceRectPreset(br.rectificationPreset),
      rectificationDaysCustom: String(br.rectificationDaysCustom ?? '').replace(/\D/g, ''),
    };

    const ar = (t.areaDiscrepancy && typeof t.areaDiscrepancy === 'object' ? t.areaDiscrepancy : {}) as Record<string, unknown>;
    const refs = Array.isArray(ar.referenceSources)
      ? ar.referenceSources.filter((x): x is string => typeof x === 'string' && AREA_REFS.has(x))
      : [];
    buyerTerms.areaDiscrepancy = {
      ruleEnabled: Boolean(ar.ruleEnabled),
      thresholdPreset: coerceThresholdPreset(ar.thresholdPreset),
      thresholdPercentCustom: String(ar.thresholdPercentCustom ?? '').replace(/[^\d.]/g, ''),
      referenceSources: refs as BuyerTerminationTerms['areaDiscrepancy']['referenceSources'],
      financialSettlementInsteadOfTermination: Boolean(ar.financialSettlementInsteadOfTermination),
    };

    const no = (t.notification && typeof t.notification === 'object' ? t.notification : {}) as Record<string, unknown>;
    buyerTerms.notification = {
      ruleEnabled: Boolean(no.ruleEnabled),
      notifyBuyer: Boolean(no.notifyBuyer),
      notifyContractManager: Boolean(no.notifyContractManager),
      showManagementOptionInGrid: Boolean(no.showManagementOptionInGrid),
    };
  }

  let buyerCompletion = defaultBuyerTerminationCompletion();
  const compIn = obj.buyerCompletion;
  if (compIn && typeof compIn === 'object') {
    const c = compIn as Record<string, unknown>;
    buyerCompletion = {
      lateDelivery: Boolean(c.lateDelivery),
      specificationChanges: Boolean(c.specificationChanges),
      breachOfObligations: Boolean(c.breachOfObligations),
      areaDiscrepancy: Boolean(c.areaDiscrepancy),
      notification: Boolean(c.notification),
    };
  }

  let terminationBuyerPanel: TerminationBuyerPanel | undefined;
  const panelRaw = obj.terminationBuyerPanel;
  if (panelRaw === 'list') terminationBuyerPanel = 'list';
  else if (
    typeof panelRaw === 'string' &&
    (BUYER_PANEL_IDS as readonly string[]).includes(panelRaw)
  ) {
    terminationBuyerPanel = panelRaw as BuyerTerminationSubsectionId;
  }

  return { buyerTerms, buyerCompletion, terminationBuyerPanel };
}

function isLegacyBuyerPlaceholder(buyerBlock: unknown): boolean {
  if (!buyerBlock || typeof buyerBlock !== 'object') return false;
  const o = buyerBlock as Record<string, unknown>;
  return 'underDevelopment' in o && !('buyerTerms' in o);
}

/** ادغام فیلدهای خریدار از پیش‌نویس خام (بدون بازنویسی کامل قرارداد) */
export function mergeBuyerFieldsFromDraftRecord(partial: Record<string, unknown>): {
  terminationBuyerPanel: TerminationBuyerPanel;
  buyerCompletion: BuyerTerminationCompletion;
  buyerTerms: BuyerTerminationTerms;
} {
  if (partial.buyer && isLegacyBuyerPlaceholder(partial.buyer)) {
    return {
      terminationBuyerPanel: 'list',
      buyerCompletion: defaultBuyerTerminationCompletion(),
      buyerTerms: defaultBuyerTerminationTerms(),
    };
  }

  const normalized = normalizePersistedBuyerRules({
    buyerTerms: partial.buyerTerms,
    buyerCompletion: partial.buyerCompletion,
    terminationBuyerPanel: partial.terminationBuyerPanel,
  });

  const terminationBuyerPanelCandidate = partial.terminationBuyerPanel;
  let terminationBuyerPanel: TerminationBuyerPanel = 'list';
  if (terminationBuyerPanelCandidate === 'list') terminationBuyerPanel = 'list';
  else if (
    typeof terminationBuyerPanelCandidate === 'string' &&
    (BUYER_PANEL_IDS as readonly string[]).includes(terminationBuyerPanelCandidate)
  ) {
    terminationBuyerPanel = terminationBuyerPanelCandidate as BuyerTerminationSubsectionId;
  } else if (normalized?.terminationBuyerPanel) {
    terminationBuyerPanel = normalized.terminationBuyerPanel;
  }

  return {
    terminationBuyerPanel,
    buyerCompletion: normalized?.buyerCompletion ?? defaultBuyerTerminationCompletion(),
    buyerTerms: normalized?.buyerTerms ?? defaultBuyerTerminationTerms(),
  };
}

export function buyerRulesPersistedFromTerminationPayload(payload: {
  buyerTerms: BuyerTerminationTerms;
  buyerCompletion: BuyerTerminationCompletion;
  terminationBuyerPanel: TerminationBuyerPanel;
}): BuyerRulesPersisted {
  const cleaned = normalizePersistedBuyerRules({
    buyerTerms: payload.buyerTerms,
    buyerCompletion: payload.buyerCompletion,
    terminationBuyerPanel: payload.terminationBuyerPanel,
  });
  return {
    buyerTerms: cleaned?.buyerTerms ?? payload.buyerTerms,
    buyerCompletion: cleaned?.buyerCompletion ?? payload.buyerCompletion,
    terminationBuyerPanel: payload.terminationBuyerPanel,
  };
}
