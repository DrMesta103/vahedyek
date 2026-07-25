import type { ContractRuleState, RuleConfig } from '../businessContractRules';
import {
  buildBusinessSettingsComparison,
  buildRuleStateComparison,
  compareBusinessSetting,
  formatBusinessSettingValue,
  type BusinessSettingsComparison,
  type BusinessSettingsLine,
} from '../contractSettingsReference';

function normalizeValue(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  return String(value);
}

/**
 * Domain-quality rule hint: shows reference vs current field-by-field for the active settings tab.
 */
export function resolveDomainRuleHint(
  config: RuleConfig,
  reference: ContractRuleState | null | undefined,
  current: ContractRuleState | null | undefined,
): BusinessSettingsComparison {
  if (!reference) {
    return buildBusinessSettingsComparison({
      status: 'missing',
      helperText: `برای «${config.title}» تنظیم مرجعی در تنظیمات کسب‌وکار ثبت نشده است.`,
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
    ...(currentTab ? [{ label: 'حالت فعلی قرارداد', value: currentTab.title }] : [{ label: 'حالت فعلی قرارداد', value: 'ثبت نشده' }]),
  ];

  const fieldComparisons = activeFields.map((field) => {
    const refRaw = reference.values[field.key];
    const curRaw = current?.values?.[field.key];
    const comparison = compareBusinessSetting(refRaw, curRaw);
    return { field, comparison, refRaw, curRaw };
  });

  const breakdownLines: BusinessSettingsLine[] = fieldComparisons
    .map(({ field, refRaw, curRaw }) => {
      const refText = formatBusinessSettingValue(normalizeValue(refRaw));
      const curText = formatBusinessSettingValue(normalizeValue(curRaw));
      if (refText === 'ثبت نشده' && curText === 'ثبت نشده') return null;
      return {
        label: field.label,
        value: refText === curText ? refText : `تنظیمات: ${refText} | قرارداد: ${curText}`,
      };
    })
    .filter((line): line is BusinessSettingsLine => Boolean(line));

  const sameActive = Boolean(reference.active) === Boolean(current?.active);
  const sameTab = (reference.activeTab || '') === (current?.activeTab || '');
  const comparableFields = fieldComparisons.filter(({ comparison }) => !comparison.missing);
  const sameFields = comparableFields.every(({ comparison }) => !comparison.differs);

  if (!reference.active && !current?.active) {
    return buildBusinessSettingsComparison({
      status: 'equal',
      referenceLines,
      currentLines,
      helperText: `«${config.title}» در تنظیمات و پیش‌نویس هر دو غیرفعال است.`,
    });
  }

  if (!reference.active && current?.active) {
    return buildBusinessSettingsComparison({
      status: 'different',
      referenceLines,
      currentLines,
      breakdownLines,
      differenceText: `در تنظیمات کسب‌وکار «${config.title}» غیرفعال است اما در پیش‌نویس فعال شده است.`,
      helperText: 'وضعیت فعال‌سازی با تنظیمات کسب‌وکار مغایرت دارد.',
    });
  }

  if (reference.active && !current?.active) {
    return buildBusinessSettingsComparison({
      status: 'info',
      referenceLines,
      currentLines,
      breakdownLines,
      helperText: `«${config.title}» در تنظیمات فعال است؛ برای اعمال در قرارداد این بخش را فعال و مقادیر را تکمیل کنید.`,
    });
  }

  return buildBusinessSettingsComparison({
    reference: reference.activeTab || reference.active,
    current: current?.activeTab || current?.active,
    status: sameActive && sameTab && sameFields ? 'equal' : 'different',
    referenceLines,
    currentLines,
    breakdownLines,
    differenceText:
      sameActive && sameTab && sameFields
        ? null
        : !sameTab
          ? 'حالت (تب) فعلی قرارداد با تب فعال تنظیمات متفاوت است.'
          : 'برخی مقادیر فیلدها با تنظیمات کسب‌وکار مغایرت دارند.',
    helperText: breakdownLines.length
      ? 'جزئیات بالا از تب فعال تنظیمات خوانده شده و ردیف‌به‌ردیف با مقدار فعلی قرارداد مقایسه می‌شود.'
      : 'برای تب فعال تنظیمات، مقدار قابل‌نمایش بیشتری ثبت نشده است.',
  });
}

export function resolveRuleHintOrFallback(
  config: RuleConfig,
  reference: ContractRuleState | null | undefined,
  current: ContractRuleState | null | undefined,
): BusinessSettingsComparison {
  try {
    return resolveDomainRuleHint(config, reference, current);
  } catch {
    return buildRuleStateComparison(config, reference, current);
  }
}
