import type { ContractRuleState } from '../businessContractRules';
import {
  buildBusinessSettingsComparison,
  formatBusinessSettingValue,
  type BusinessSettingsComparison,
  type BusinessSettingsLine,
} from '../contractSettingsReference';
import { getDomainFieldHint, buildFieldHint, type DomainFieldHint } from './domainFieldHints';

type TerminationTermsLike = Partial<Record<string, { ruleEnabled?: boolean }>> | null | undefined;

type TerminationLike = {
  terminationEnabled?: boolean;
  sellerTerminationEngaged?: boolean;
  buyerTerminationEngaged?: boolean;
  terminationPartyTab?: string;
  constructorTerms?: TerminationTermsLike & Record<string, Record<string, unknown> | undefined>;
  buyerTerms?: TerminationTermsLike & Record<string, Record<string, unknown> | undefined>;
} | null | undefined;

function asTerminationLike(value: unknown): TerminationLike {
  if (!value || typeof value !== 'object') return null;
  return value as TerminationLike;
}

const SELLER_LABELS: Record<string, string> = {
  lateInstallment: 'تأخیر اقساط',
  financialObligations: 'تعهدات مالی',
  documentDeficiencies: 'نقص مدارک',
  otherBreach: 'سایر تخلفات',
  notifications: 'اعلان‌ها',
};

const BUYER_LABELS: Record<string, string> = {
  lateDelivery: 'تأخیر تحویل',
  specificationChanges: 'تغییر مشخصات',
  breachOfObligations: 'نقض تعهدات',
  physicalProgressDelay: 'تأخیر پیشرفت فیزیکی',
  areaDiscrepancy: 'اختلاف مساحت',
  notification: 'اعلان',
  draftTemplateUsage: 'استفاده از قالب',
};

const SELLER_ENABLE_RULE_KEYS: Record<string, string> = {
  lateInstallment: 'builderCancellationPaymentDelayEnabled',
  financialObligations: 'builderCancellationUnpaidFinancialEnabled',
  documentDeficiencies: 'builderCancellationMissingDocumentsEnabled',
  otherBreach: 'builderCancellationOtherBreachEnabled',
  notifications: 'builderCancellationNotificationEnabled',
};

const BUYER_ENABLE_RULE_KEYS: Record<string, string> = {
  lateDelivery: 'buyerCancellationLateDeliveryEnabled',
  specificationChanges: 'buyerCancellationSpecificationChangesEnabled',
  breachOfObligations: 'buyerCancellationBreachEnabled',
  physicalProgressDelay: 'buyerCancellationPhysicalProgressDelayEnabled',
  areaDiscrepancy: 'buyerCancellationAreaDiscrepancyEnabled',
  notification: 'buyerCancellationNotificationEnabled',
  draftTemplateUsage: 'buyerCancellationDraftTemplateUsageEnabled',
};

/** Draft field path → builder-cancellation rule value key (when termination snapshot lacks detail). */
const SELLER_FIELD_RULE_KEYS: Record<string, string> = {
  'lateInstallment.gracePreset': 'builderCancellationPaymentDelayPreset',
  'lateInstallment.graceDaysCustom': 'builderCancellationPaymentDelayCustomDays',
  'lateInstallment.minDebtAmount': 'builderCancellationPaymentDelayMinDebt',
  'financialObligations.gracePreset': 'builderCancellationUnpaidFinancialGracePreset',
  'financialObligations.graceDaysCustom': 'builderCancellationUnpaidFinancialGraceDays',
  'documentDeficiencies.completionDeadlineDays': 'builderCancellationMissingDocsGracePreset',
  'documentDeficiencies.completionDeadlineDaysCustom': 'builderCancellationMissingDocsGraceDays',
};

function enabledCount(terms: TerminationTermsLike) {
  if (!terms) return 0;
  return Object.values(terms).filter((term) => term?.ruleEnabled).length;
}

function termLines(
  terms: TerminationTermsLike,
  labels: Record<string, string>,
  prefix: string,
): BusinessSettingsLine[] {
  if (!terms) return [];
  return Object.entries(labels).map(([key, label]) => ({
    label: `${prefix}: ${label}`,
    value: formatBusinessSettingValue(String(Boolean(terms[key]?.ruleEnabled))),
  }));
}

function normalizeComparable(value: unknown): string | boolean | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    const joined = value.map(String).sort().join(',');
    return joined || null;
  }
  const asString = String(value).replace(/,/g, '').replace(/[٬\s]/g, '').trim();
  return asString || null;
}

/** Settings presets like "3 روز" / "روزانه" ↔ draft "3" / "other". */
function normalizeGraceComparable(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  const raw = String(value).trim();
  if (raw === 'other' || raw === 'روزانه') return 'other';
  const digits = raw.replace(/[^\d]/g, '');
  return digits || normalizeComparable(raw);
}

function makeHint(referenceValue: unknown, currentValue: unknown, normalize = normalizeComparable): DomainFieldHint {
  const refRaw = normalize(referenceValue);
  const curRaw = normalize(currentValue);
  const settingsLabel =
    referenceValue === undefined || referenceValue === null || referenceValue === ''
      ? null
      : Array.isArray(referenceValue)
        ? referenceValue.length
          ? referenceValue.map(String).join('، ')
          : null
        : formatBusinessSettingValue(String(referenceValue));
  return buildFieldHint(
    refRaw === null || typeof refRaw === 'boolean' || typeof refRaw === 'string' ? refRaw : String(refRaw),
    curRaw === null || typeof curRaw === 'boolean' || typeof curRaw === 'string' ? curRaw : String(curRaw),
    settingsLabel,
  );
}

function readTermField(terms: TerminationLike['constructorTerms'], sectionId: string, field: string): unknown {
  const section = terms?.[sectionId];
  if (!section || typeof section !== 'object') return undefined;
  return (section as Record<string, unknown>)[field];
}

export function resolveTerminationHint(
  referenceInput: unknown,
  currentInput: unknown,
  cancellationRules?: {
    builder?: ContractRuleState | null;
    buyer?: ContractRuleState | null;
  },
): BusinessSettingsComparison {
  const reference = asTerminationLike(referenceInput);
  const current = asTerminationLike(currentInput);
  if (!reference) {
    return buildBusinessSettingsComparison({
      status: 'missing',
      helperText: 'برای فسخ تنظیم مرجعی در تنظیمات کسب‌وکار ثبت نشده است.',
    });
  }

  const refSeller = Boolean(reference.sellerTerminationEngaged);
  const refBuyer = Boolean(reference.buyerTerminationEngaged);
  const curSeller = Boolean(current?.sellerTerminationEngaged);
  const curBuyer = Boolean(current?.buyerTerminationEngaged);
  const refEnabled = Boolean(reference.terminationEnabled);
  const curEnabled = Boolean(current?.terminationEnabled);

  const referenceLines: BusinessSettingsLine[] = [
    { label: 'وضعیت فسخ در تنظیمات', value: refEnabled ? 'فعال' : 'غیرفعال' },
    { label: 'فسخ سازنده در تنظیمات', value: refSeller ? 'فعال' : 'غیرفعال' },
    { label: 'فسخ خریدار در تنظیمات', value: refBuyer ? 'فعال' : 'غیرفعال' },
  ];

  if (cancellationRules?.builder) {
    referenceLines.push({
      label: 'تنظیمات فسخ سازنده (rule)',
      value: formatBusinessSettingValue(String(cancellationRules.builder.active)),
    });
  }
  if (cancellationRules?.buyer) {
    referenceLines.push({
      label: 'تنظیمات فسخ خریدار (rule)',
      value: formatBusinessSettingValue(String(cancellationRules.buyer.active)),
    });
  }

  const currentLines: BusinessSettingsLine[] = [
    { label: 'وضعیت فعلی فسخ', value: curEnabled ? 'فعال' : 'غیرفعال' },
    { label: 'فسخ سازنده در پیش‌نویس', value: curSeller ? 'فعال' : 'غیرفعال' },
    { label: 'فسخ خریدار در پیش‌نویس', value: curBuyer ? 'فعال' : 'غیرفعال' },
    {
      label: 'تب فعلی پیش‌نویس',
      value: current?.terminationPartyTab === 'seller' ? 'سازنده' : 'خریدار',
    },
  ];

  const breakdownLines: BusinessSettingsLine[] = [
    ...termLines(reference.constructorTerms, SELLER_LABELS, 'سازنده (تنظیمات)'),
    ...termLines(current?.constructorTerms, SELLER_LABELS, 'سازنده (پیش‌نویس)').filter(
      (line) => line.value === 'فعال' || enabledCount(current?.constructorTerms) > 0,
    ),
    ...termLines(reference.buyerTerms, BUYER_LABELS, 'خریدار (تنظیمات)'),
    ...termLines(current?.buyerTerms, BUYER_LABELS, 'خریدار (پیش‌نویس)').filter(
      (line) => line.value === 'فعال' || enabledCount(current?.buyerTerms) > 0,
    ),
  ].slice(0, 16);

  const same =
    refEnabled === curEnabled &&
    refSeller === curSeller &&
    refBuyer === curBuyer;

  return buildBusinessSettingsComparison({
    reference: refEnabled,
    current: curEnabled,
    status: same ? 'equal' : 'different',
    referenceLines,
    currentLines,
    breakdownLines,
    differenceText: same ? null : 'وضعیت فعال‌سازی فسخ یا طرفین با تنظیمات کسب‌وکار مغایرت دارد.',
    helperText: 'این مرجع از تنظیمات فسخ کسب‌وکار خوانده شده و تغییر دستی پیش‌نویس را بازنویسی نمی‌کند.',
  });
}

/**
 * Per-field alignment for termination draft vs business settings.
 * Prefers same-shape `termination` snapshot; falls back to builder/buyer-cancellation rule keys for enables and key thresholds.
 */
export function resolveTerminationFieldHints(
  referenceInput: unknown,
  currentInput: unknown,
  cancellationRules?: {
    builder?: ContractRuleState | null;
    buyer?: ContractRuleState | null;
  },
): Record<string, DomainFieldHint> {
  const reference = asTerminationLike(referenceInput);
  const current = asTerminationLike(currentInput);
  const builderRule = cancellationRules?.builder ?? null;
  const buyerRule = cancellationRules?.buyer ?? null;

  if (!reference && !builderRule && !buyerRule) return {};

  const hints: Record<string, DomainFieldHint> = {};

  if (reference) {
    hints.terminationEnabled = makeHint(Boolean(reference.terminationEnabled), Boolean(current?.terminationEnabled));
    hints.sellerEngaged = makeHint(Boolean(reference.sellerTerminationEngaged), Boolean(current?.sellerTerminationEngaged));
    hints.buyerEngaged = makeHint(Boolean(reference.buyerTerminationEngaged), Boolean(current?.buyerTerminationEngaged));
  } else {
    if (builderRule) {
      hints.sellerEngaged = makeHint(Boolean(builderRule.active), Boolean(current?.sellerTerminationEngaged));
    }
    if (buyerRule) {
      hints.buyerEngaged = makeHint(Boolean(buyerRule.active), Boolean(current?.buyerTerminationEngaged));
    }
  }

  for (const sectionId of Object.keys(SELLER_LABELS)) {
    const key = `seller.${sectionId}.enabled`;
    const ruleKey = SELLER_ENABLE_RULE_KEYS[sectionId];
    // Settings present but section unconfigured → inactive template (false).
    const refEnabled = reference
      ? Boolean(readTermField(reference.constructorTerms, sectionId, 'ruleEnabled'))
      : builderRule
        ? Boolean(ruleKey ? builderRule.values?.[ruleKey] : false)
        : null;
    if (refEnabled === null) continue;
    const curEnabled = Boolean(readTermField(current?.constructorTerms, sectionId, 'ruleEnabled'));
    hints[key] = makeHint(refEnabled, curEnabled);
  }

  for (const sectionId of Object.keys(BUYER_LABELS)) {
    const key = `buyer.${sectionId}.enabled`;
    const ruleKey = BUYER_ENABLE_RULE_KEYS[sectionId];
    // Settings present but section unconfigured → inactive template (false).
    const refEnabled = reference
      ? Boolean(readTermField(reference.buyerTerms, sectionId, 'ruleEnabled'))
      : buyerRule
        ? Boolean(ruleKey ? buyerRule.values?.[ruleKey] : false)
        : null;
    if (refEnabled === null) continue;
    const curEnabled = Boolean(readTermField(current?.buyerTerms, sectionId, 'ruleEnabled'));
    hints[key] = makeHint(refEnabled, curEnabled);
  }

  const sellerFieldSpecs: Array<{ sectionId: string; field: string; normalize?: typeof normalizeComparable }> = [
    { sectionId: 'lateInstallment', field: 'gracePreset', normalize: normalizeGraceComparable },
    { sectionId: 'lateInstallment', field: 'graceDaysCustom' },
    { sectionId: 'lateInstallment', field: 'minDebtAmount' },
    { sectionId: 'lateInstallment', field: 'detectionBasis' },
    { sectionId: 'lateInstallment', field: 'consecutiveInstallmentsCount' },
    { sectionId: 'financialObligations', field: 'obligationTypes' },
    { sectionId: 'financialObligations', field: 'gracePreset', normalize: normalizeGraceComparable },
    { sectionId: 'financialObligations', field: 'graceDaysCustom' },
    { sectionId: 'documentDeficiencies', field: 'mandatoryItems' },
    { sectionId: 'documentDeficiencies', field: 'completionDeadlineDays', normalize: normalizeGraceComparable },
    { sectionId: 'documentDeficiencies', field: 'completionDeadlineDaysCustom' },
    { sectionId: 'otherBreach', field: 'rectificationDays', normalize: normalizeGraceComparable },
    { sectionId: 'otherBreach', field: 'rectificationDaysCustom' },
  ];

  for (const spec of sellerFieldSpecs) {
    const hintKey = `seller.${spec.sectionId}.${spec.field}`;
    const path = `${spec.sectionId}.${spec.field}`;
    let refValue = reference ? readTermField(reference.constructorTerms, spec.sectionId, spec.field) : undefined;
    if ((refValue === undefined || refValue === null || refValue === '') && builderRule) {
      const ruleKey = SELLER_FIELD_RULE_KEYS[path];
      if (ruleKey) refValue = builderRule.values?.[ruleKey];
    }
    if (refValue === undefined) continue;
    const curValue = readTermField(current?.constructorTerms, spec.sectionId, spec.field);
    hints[hintKey] = makeHint(refValue, curValue, spec.normalize ?? normalizeComparable);
  }

  const buyerFieldSpecs: Array<{ sectionId: string; field: string; normalize?: typeof normalizeComparable }> = [
    { sectionId: 'lateDelivery', field: 'calculationBasis' },
    { sectionId: 'lateDelivery', field: 'gracePreset', normalize: normalizeGraceComparable },
    { sectionId: 'lateDelivery', field: 'graceMonthsCustom' },
    { sectionId: 'specificationChanges', field: 'includedTypes' },
    { sectionId: 'specificationChanges', field: 'priorApprovalRequired' },
    { sectionId: 'breachOfObligations', field: 'obligationTypes' },
    { sectionId: 'breachOfObligations', field: 'rectificationPreset', normalize: normalizeGraceComparable },
    { sectionId: 'breachOfObligations', field: 'rectificationDaysCustom' },
    { sectionId: 'physicalProgressDelay', field: 'milestoneTypes' },
    { sectionId: 'areaDiscrepancy', field: 'thresholdPreset', normalize: normalizeGraceComparable },
    { sectionId: 'areaDiscrepancy', field: 'thresholdPercentCustom' },
    { sectionId: 'areaDiscrepancy', field: 'discrepancyScopes' },
    { sectionId: 'areaDiscrepancy', field: 'referenceSources' },
    { sectionId: 'areaDiscrepancy', field: 'financialSettlementInsteadOfTermination' },
    { sectionId: 'areaDiscrepancy', field: 'settlementPricingBasis' },
  ];

  for (const spec of buyerFieldSpecs) {
    const hintKey = `buyer.${spec.sectionId}.${spec.field}`;
    if (!reference) continue;
    const refValue = readTermField(reference.buyerTerms, spec.sectionId, spec.field);
    if (refValue === undefined) continue;
    const curValue = readTermField(current?.buyerTerms, spec.sectionId, spec.field);
    hints[hintKey] = makeHint(refValue, curValue, spec.normalize ?? normalizeComparable);
  }

  return hints;
}

export function getTerminationFieldHint(
  hints: Record<string, DomainFieldHint> | Partial<Record<string, DomainFieldHint>>,
  key: string,
): DomainFieldHint {
  return getDomainFieldHint(hints, key);
}

export type { DomainFieldHint };
