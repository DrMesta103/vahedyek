import type { ContractFlowBootstrapSettings } from './contractDraftClient';
import type { ContractRuleId, ContractRuleState, RuleConfig } from './businessContractRules';

export type BusinessSettingsSnapshot = ContractFlowBootstrapSettings;

export type BusinessSettingsHintStatus = 'equal' | 'different' | 'missing' | 'info';

export type BusinessSettingsLine = {
  label: string;
  value: string;
};

export type BusinessSettingsComparison = {
  reference: string | null;
  current: string | null;
  differs: boolean;
  missing: boolean;
  numericDifference: number | null;
  differenceDirection: 'under' | 'over' | null;
  status: BusinessSettingsHintStatus;
  referenceLines: BusinessSettingsLine[];
  currentLines: BusinessSettingsLine[];
  breakdownLines: BusinessSettingsLine[];
  differenceText: string | null;
  unitLabel: string | null;
  helperText: string | null;
};

type BuildComparisonInput = {
  reference?: unknown;
  current?: unknown;
  status?: BusinessSettingsHintStatus;
  referenceLines?: BusinessSettingsLine[];
  currentLines?: BusinessSettingsLine[];
  breakdownLines?: BusinessSettingsLine[];
  differenceText?: string | null;
  unitLabel?: string | null;
  helperText?: string | null;
};

const numberFormatter = new Intl.NumberFormat('fa-IR');

export function compareBusinessSetting(reference: unknown, current: unknown, unitLabel: string | null = null): BusinessSettingsComparison {
  const referenceValue = normalizeComparableValue(reference);
  const currentValue = normalizeComparableValue(current);
  const missing = referenceValue === null;
  const referenceNumber = parseBusinessSettingNumber(reference);
  const currentNumber = parseBusinessSettingNumber(current);
  const numericDifference = !missing && referenceNumber !== null && currentNumber !== null ? currentNumber - referenceNumber : null;
  const sameValue =
    referenceNumber !== null && currentNumber !== null
      ? referenceNumber === currentNumber
      : referenceValue === currentValue;
  const status: BusinessSettingsHintStatus = missing ? 'missing' : sameValue ? 'equal' : 'different';

  return buildBusinessSettingsComparison({
    reference,
    current,
    status,
    unitLabel,
  });
}

export function buildBusinessSettingsComparison(input: BuildComparisonInput): BusinessSettingsComparison {
  const referenceValue = normalizeComparableValue(input.reference);
  const currentValue = normalizeComparableValue(input.current);
  const referenceNumber = parseBusinessSettingNumber(input.reference);
  const currentNumber = parseBusinessSettingNumber(input.current);
  const numericDifference = referenceValue !== null && referenceNumber !== null && currentNumber !== null ? currentNumber - referenceNumber : null;
  const sameValue =
    referenceNumber !== null && currentNumber !== null
      ? referenceNumber === currentNumber
      : referenceValue === currentValue;
  const missing = input.status === 'missing' || (input.status === undefined && referenceValue === null);
  const status = input.status ?? (missing ? 'missing' : sameValue ? 'equal' : 'different');
  const differs = status === 'different';
  const unitLabel = input.unitLabel ?? null;

  return {
    reference: referenceValue,
    current: currentValue,
    differs,
    missing,
    numericDifference,
    differenceDirection: numericDifference === null || numericDifference === 0 ? null : numericDifference < 0 ? 'under' : 'over',
    status,
    referenceLines: input.referenceLines ?? (referenceValue !== null ? [{ label: 'مقدار تنظیمات', value: formatBusinessSettingValue(referenceValue) }] : []),
    currentLines: input.currentLines ?? (currentValue !== null ? [{ label: 'مقدار فعلی قرارداد', value: formatBusinessSettingValue(currentValue) }] : []),
    breakdownLines: input.breakdownLines ?? [],
    differenceText: input.differenceText ?? buildNumericDifferenceText(numericDifference, unitLabel),
    unitLabel,
    helperText: input.helperText ?? null,
  };
}

export function getRuleSettingComparison(snapshot: BusinessSettingsSnapshot | null, ruleId: ContractRuleId, key: string, current: unknown) {
  const rule = snapshot?.rules?.[ruleId] as ContractRuleState | undefined;
  return compareBusinessSetting(rule?.values?.[key], current);
}

export function buildRuleStateComparison(
  config: RuleConfig,
  reference: ContractRuleState | null | undefined,
  current: ContractRuleState | null | undefined,
): BusinessSettingsComparison {
  if (!reference) {
    return buildBusinessSettingsComparison({
      status: 'missing',
      helperText: 'برای این بخش تنظیم مرجعی در تنظیمات کسب‌وکار ثبت نشده است.',
    });
  }

  const referenceTab = config.tabs.find((tab) => tab.id === reference.activeTab) ?? config.tabs[0] ?? null;
  const currentTab = config.tabs.find((tab) => tab.id === current?.activeTab) ?? null;
  const activeFields = referenceTab?.fields ?? [];
  const referenceLines: BusinessSettingsLine[] = [
    { label: 'وضعیت تنظیمات', value: formatBusinessSettingValue(String(reference.active)) },
    ...(referenceTab ? [{ label: 'حالت تنظیمات', value: referenceTab.title }] : []),
  ];
  const currentLines: BusinessSettingsLine[] = [
    { label: 'وضعیت فعلی قرارداد', value: formatBusinessSettingValue(String(Boolean(current?.active))) },
    ...(currentTab ? [{ label: 'حالت فعلی قرارداد', value: currentTab.title }] : []),
  ];
  const breakdownLines = activeFields
    .map((field) => ({
      label: field.label,
      value: formatBusinessSettingValue(normalizeComparableValue(reference.values[field.key])),
    }))
    .filter((line) => line.value !== 'ثبت نشده');

  const sameActive = Boolean(reference.active) === Boolean(current?.active);
  const sameTab = (reference.activeTab || '') === (current?.activeTab || '');
  const comparableFields = activeFields.filter((field) => normalizeComparableValue(reference.values[field.key]) !== null);
  const sameFields = comparableFields.every((field) => {
    const ref = compareBusinessSetting(reference.values[field.key], current?.values?.[field.key]);
    return !ref.differs && !ref.missing;
  });

  return buildBusinessSettingsComparison({
    reference: reference.activeTab || reference.active,
    current: current?.activeTab || current?.active,
    status: sameActive && sameTab && sameFields ? 'equal' : 'different',
    referenceLines,
    currentLines,
    breakdownLines,
    helperText: breakdownLines.length
      ? 'جزئیات بالا از تب فعال تنظیمات کسب‌وکار خوانده شده و با مقدار فعلی این بخش مقایسه می‌شود.'
      : 'برای تب فعال تنظیمات، مقدار قابل‌نمایش بیشتری ثبت نشده است.',
  });
}

export function formatBusinessSettingValue(value: string | null) {
  if (value === null || value === '') return 'ثبت نشده';
  if (value === 'true') return 'فعال';
  if (value === 'false') return 'غیرفعال';
  return toPersianDigits(value);
}

export function formatBusinessSettingAmount(value: number, unitLabel = 'تومان') {
  return `${numberFormatter.format(Math.round(value))} ${unitLabel}`;
}

export function formatBusinessSettingPercent(value: number) {
  return `${numberFormatter.format(value)}٪`;
}

export function parseBusinessSettingNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return null;
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[٬,\s]/g, '')
    .replace(/٪/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeComparableValue(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  return String(value);
}

function buildNumericDifferenceText(numericDifference: number | null, unitLabel: string | null) {
  if (numericDifference === null || numericDifference === 0) return null;
  const direction = numericDifference < 0 ? 'کمتر' : 'بیشتر';
  const unit = unitLabel ? ` ${unitLabel}` : '';
  return `مقدار فعلی ${numberFormatter.format(Math.abs(numericDifference))}${unit} ${direction} از تنظیمات است.`;
}

function toPersianDigits(value: string) {
  return value.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)] ?? digit);
}
