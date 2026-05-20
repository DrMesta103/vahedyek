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
  'physicalProgressDelay',
  'areaDiscrepancy',
  'notification',
  'draftTemplateUsage',
] as const satisfies readonly BuyerTerminationSubsectionId[];

const DEFAULT_BUYER_COMPLETION: BuyerTerminationCompletion = {
  lateDelivery: false,
  specificationChanges: false,
  breachOfObligations: false,
  physicalProgressDelay: false,
  areaDiscrepancy: false,
  notification: false,
  draftTemplateUsage: false,
};

export function defaultBuyerTerminationTerms(): BuyerTerminationTerms {
  return {
    lateDelivery: {
      ruleEnabled: false,
      calculationBasis: ['contract-delivery-date', 'last-addendum', 'mutual-adjusted-date'],
      gracePreset: '6',
      graceMonthsCustom: '',
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
    physicalProgressDelay: {
      ruleEnabled: false,
      milestoneTypes: [],
      timelinePreset: '6',
      timelineMonthsCustom: '',
      timelineSpecificDate: '',
      gracePreset: '30',
      graceDaysCustom: '',
      milestoneSettings: {},
      triggerCondition: 'any-milestone',
      progressCertificationSource: 'project-supervisor-report',
    },
    areaDiscrepancy: {
      ruleEnabled: false,
      thresholdPreset: '2',
      thresholdPercentCustom: '',
      discrepancyScopes: ['deficit-only', 'surplus-only'],
      referenceSources: [],
      financialSettlementInsteadOfTermination: false,
      settlementPricingBasis: 'contract-price',
    },
    notification: {
      ruleEnabled: false,
      notifyBuyer: false,
      notifyContractManager: false,
      showManagementOptionInGrid: false,
    },
    draftTemplateUsage: {
      ruleEnabled: false,
      allowPerContractOverride: false,
    },
  };
}

export function defaultBuyerTerminationCompletion(): BuyerTerminationCompletion {
  return { ...DEFAULT_BUYER_COMPLETION };
}

const GRACE: BuyerTerminationTerms['lateDelivery']['gracePreset'][] = ['1', '3', '6', '9', '12', '18', '24', 'other'];

const RECT: BuyerTerminationTerms['breachOfObligations']['rectificationPreset'][] = ['3', '7', '10', '15', '30', 'other'];

const THRESH: BuyerTerminationTerms['areaDiscrepancy']['thresholdPreset'][] = ['1', '2', '3', '5', '10', 'other'];
const PROGRESS_TIMELINE: BuyerTerminationTerms['physicalProgressDelay']['timelinePreset'][] = [
  '1',
  '3',
  '6',
  '9',
  '12',
  '18',
  '24',
  'specific-date',
  'other',
];
const PROGRESS_GRACE: BuyerTerminationTerms['physicalProgressDelay']['gracePreset'][] = ['15', '30', '45', '60', '90', 'other'];

function coerceGracePreset(value: unknown): BuyerTerminationTerms['lateDelivery']['gracePreset'] {
  const s = String(value ?? '');
  return GRACE.includes(s as BuyerTerminationTerms['lateDelivery']['gracePreset'])
    ? (s as BuyerTerminationTerms['lateDelivery']['gracePreset'])
    : '6';
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

function coerceProgressTimelinePreset(value: unknown): BuyerTerminationTerms['physicalProgressDelay']['timelinePreset'] {
  const s = String(value ?? '');
  return PROGRESS_TIMELINE.includes(s as BuyerTerminationTerms['physicalProgressDelay']['timelinePreset'])
    ? (s as BuyerTerminationTerms['physicalProgressDelay']['timelinePreset'])
    : '6';
}

function coerceProgressGracePreset(value: unknown): BuyerTerminationTerms['physicalProgressDelay']['gracePreset'] {
  const s = String(value ?? '');
  return PROGRESS_GRACE.includes(s as BuyerTerminationTerms['physicalProgressDelay']['gracePreset'])
    ? (s as BuyerTerminationTerms['physicalProgressDelay']['gracePreset'])
    : '30';
}

function coerceProgressMilestoneSettings(
  value: unknown,
  fallback: {
    timelinePreset: BuyerTerminationTerms['physicalProgressDelay']['timelinePreset'];
    timelineMonthsCustom: string;
    timelineSpecificDate: string;
    gracePreset: BuyerTerminationTerms['physicalProgressDelay']['gracePreset'];
    graceDaysCustom: string;
  },
): BuyerTerminationTerms['physicalProgressDelay']['milestoneSettings'] {
  if (!value || typeof value !== 'object') return {};
  const input = value as Record<string, unknown>;
  const settings: BuyerTerminationTerms['physicalProgressDelay']['milestoneSettings'] = {};

  for (const [key, raw] of Object.entries(input)) {
    if (!PROGRESS_MILESTONE_TYPES.has(key) || !raw || typeof raw !== 'object') continue;
    const item = raw as Record<string, unknown>;
    settings[key as BuyerTerminationTerms['physicalProgressDelay']['milestoneTypes'][number]] = {
      timelinePreset: coerceProgressTimelinePreset(item.timelinePreset ?? fallback.timelinePreset),
      timelineMonthsCustom: String(item.timelineMonthsCustom ?? fallback.timelineMonthsCustom).replace(/\D/g, ''),
      timelineSpecificDate: String(item.timelineSpecificDate ?? fallback.timelineSpecificDate).trim(),
      gracePreset: coerceProgressGracePreset(item.gracePreset ?? fallback.gracePreset),
      graceDaysCustom: String(item.graceDaysCustom ?? fallback.graceDaysCustom).replace(/\D/g, ''),
    };
  }

  return settings;
}

function coerceDiscrepancyScopes(value: unknown): BuyerTerminationTerms['areaDiscrepancy']['discrepancyScopes'] {
  const allowed = new Set<BuyerTerminationTerms['areaDiscrepancy']['discrepancyScopes'][number]>([
    'deficit-only',
    'surplus-only',
  ]);
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value.filter(
        (x): x is BuyerTerminationTerms['areaDiscrepancy']['discrepancyScopes'][number] => typeof x === 'string' && allowed.has(x as never),
      ),
    ),
  );
}

function coerceSettlementPricingBasis(value: unknown): BuyerTerminationTerms['areaDiscrepancy']['settlementPricingBasis'] {
  return value === 'market-price' || value === 'official-expert' || value === 'contract-price' ? value : 'contract-price';
}

const CALCULATION_BASIS_LEGACY_MAP: Record<string, BuyerTerminationTerms['lateDelivery']['calculationBasis'][number]> = {
  'contract-date': 'contract-delivery-date',
  'project-end': 'mutual-adjusted-date',
};

const CALCULATION_BASIS_OPTIONS = new Set<BuyerTerminationTerms['lateDelivery']['calculationBasis'][number]>([
  'contract-delivery-date',
  'last-addendum',
  'mutual-adjusted-date',
]);

function coerceCalculationBasis(value: unknown): BuyerTerminationTerms['lateDelivery']['calculationBasis'] {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  const next = values
    .filter((item): item is string => typeof item === 'string')
    .map((item) => CALCULATION_BASIS_LEGACY_MAP[item] ?? (item as BuyerTerminationTerms['lateDelivery']['calculationBasis'][number]))
    .filter((item): item is BuyerTerminationTerms['lateDelivery']['calculationBasis'][number] => CALCULATION_BASIS_OPTIONS.has(item));
  return next.length ? Array.from(new Set(next)) : ['contract-delivery-date', 'last-addendum', 'mutual-adjusted-date'];
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
  'other',
]);

const AREA_REF_LEGACY_MAP: Record<string, BuyerTerminationTerms['areaDiscrepancy']['referenceSources'][number]> = {
  'title-deed': 'official-title-deed',
  'final-survey': 'partition-statement',
  'property-registration': 'official-title-deed',
};

const AREA_REFS = new Set<string>([
  'official-title-deed',
  'partition-statement',
  'official-expert-report',
  'parties-agreement',
  'court-or-arbitration-award',
]);

const PROGRESS_MILESTONE_TYPES = new Set<string>([
  'progress-20',
  'progress-30',
  'progress-50',
  'progress-70',
  'progress-90',
  'skeleton-complete',
  'shell-complete',
  'finishing-complete',
  'mep-complete',
  'final-delivery',
  'other',
]);

function coerceAreaReferenceSources(value: unknown): BuyerTerminationTerms['areaDiscrepancy']['referenceSources'] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((x): x is string => typeof x === 'string')
        .map((x) => AREA_REF_LEGACY_MAP[x] ?? x)
        .filter((x): x is BuyerTerminationTerms['areaDiscrepancy']['referenceSources'][number] => AREA_REFS.has(x)),
    ),
  );
}

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
      graceMonthsCustom: String(ld.graceMonthsCustom ?? ld.graceDaysCustom ?? '').replace(/\D/g, ''),
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

    const pp = (t.physicalProgressDelay && typeof t.physicalProgressDelay === 'object' ? t.physicalProgressDelay : {}) as Record<
      string,
      unknown
    >;
    const milestoneTypes = Array.isArray(pp.milestoneTypes)
      ? pp.milestoneTypes.filter((x): x is string => typeof x === 'string' && PROGRESS_MILESTONE_TYPES.has(x))
      : [];
    const progressFallback = {
      timelinePreset: coerceProgressTimelinePreset(pp.timelinePreset),
      timelineMonthsCustom: String(pp.timelineMonthsCustom ?? '').replace(/\D/g, ''),
      timelineSpecificDate: String(pp.timelineSpecificDate ?? '').trim(),
      gracePreset: coerceProgressGracePreset(pp.gracePreset),
      graceDaysCustom: String(pp.graceDaysCustom ?? '').replace(/\D/g, ''),
    };
    buyerTerms.physicalProgressDelay = {
      ruleEnabled: Boolean(pp.ruleEnabled),
      milestoneTypes: milestoneTypes as BuyerTerminationTerms['physicalProgressDelay']['milestoneTypes'],
      timelinePreset: progressFallback.timelinePreset,
      timelineMonthsCustom: progressFallback.timelineMonthsCustom,
      timelineSpecificDate: progressFallback.timelineSpecificDate,
      gracePreset: progressFallback.gracePreset,
      graceDaysCustom: progressFallback.graceDaysCustom,
      milestoneSettings: coerceProgressMilestoneSettings(pp.milestoneSettings, progressFallback),
      triggerCondition: pp.triggerCondition === 'all-milestones' ? 'all-milestones' : 'any-milestone',
      progressCertificationSource:
        pp.progressCertificationSource === 'official-expert-report' ||
        pp.progressCertificationSource === 'constructor-reported-progress' ||
        pp.progressCertificationSource === 'contract-manager-approval' ||
        pp.progressCertificationSource === 'parties-agreement'
          ? pp.progressCertificationSource
          : 'project-supervisor-report',
    };

    const ar = (t.areaDiscrepancy && typeof t.areaDiscrepancy === 'object' ? t.areaDiscrepancy : {}) as Record<string, unknown>;
    const refs = coerceAreaReferenceSources(ar.referenceSources);
    buyerTerms.areaDiscrepancy = {
      ruleEnabled: Boolean(ar.ruleEnabled),
      thresholdPreset: coerceThresholdPreset(ar.thresholdPreset),
      thresholdPercentCustom: String(ar.thresholdPercentCustom ?? '').replace(/[^\d.]/g, ''),
      discrepancyScopes:
        coerceDiscrepancyScopes(ar.discrepancyScopes).length > 0
          ? coerceDiscrepancyScopes(ar.discrepancyScopes)
          : coerceDiscrepancyScopes(
              ar.discrepancyScope === 'both'
                ? ['deficit-only', 'surplus-only']
                : ar.discrepancyScope === 'deficit-only' || ar.discrepancyScope === 'surplus-only'
                  ? [ar.discrepancyScope]
                  : [],
            ),
      referenceSources: refs,
      financialSettlementInsteadOfTermination: Boolean(ar.financialSettlementInsteadOfTermination),
      settlementPricingBasis: coerceSettlementPricingBasis(ar.settlementPricingBasis),
    };

    const no = (t.notification && typeof t.notification === 'object' ? t.notification : {}) as Record<string, unknown>;
    buyerTerms.notification = {
      ruleEnabled: Boolean(no.ruleEnabled),
      notifyBuyer: Boolean(no.notifyBuyer),
      notifyContractManager: Boolean(no.notifyContractManager),
      showManagementOptionInGrid: Boolean(no.showManagementOptionInGrid),
    };

    const du = (t.draftTemplateUsage && typeof t.draftTemplateUsage === 'object' ? t.draftTemplateUsage : {}) as Record<string, unknown>;
    buyerTerms.draftTemplateUsage = {
      ruleEnabled: Boolean(du.ruleEnabled),
      allowPerContractOverride: Boolean(du.allowPerContractOverride),
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
      physicalProgressDelay: Boolean(c.physicalProgressDelay),
      areaDiscrepancy: Boolean(c.areaDiscrepancy),
      notification: Boolean(c.notification),
      draftTemplateUsage: Boolean(c.draftTemplateUsage),
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
