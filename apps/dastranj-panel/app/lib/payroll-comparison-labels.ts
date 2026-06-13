import { formatFaNumber } from './format-fa';
import { compareCollections, compareValues, type BaseDifference } from './payroll-business-settings';

export type PayrollComparisonMode = 'tenant' | 'template' | 'tenant_base';

function formatTenantBaseLabel(baseYear?: number) {
  return baseYear ? `مبنای ${formatFaNumber(baseYear, { useGrouping: false })}` : 'مبنای تنظیمات';
}

export function buildNumericCompareLabels(
  mode: PayrollComparisonMode,
  fieldLabel: string,
  options?: { unit?: string; formatAmount?: (value: number) => string; baseYear?: number },
) {
  const formatAmount = options?.formatAmount ?? formatFaNumber;
  const unitSuffix = options?.unit ? ` ${options.unit}` : '';
  const tenantBaseLabel = formatTenantBaseLabel(options?.baseYear);
  const basePhrase =
    mode === 'template' ? 'قالب انتخاب‌شده' : mode === 'tenant_base' ? `تنظیمات ${tenantBaseLabel}` : 'تنظیمات پایه';
  const shortReference = mode === 'template' ? 'قالب' : mode === 'tenant_base' ? tenantBaseLabel : 'مبنای پایه';

  return {
    changed:
      mode === 'template' ? 'متفاوت با قالب' : mode === 'tenant_base' ? `متفاوت با ${tenantBaseLabel}` : 'متفاوت با مبنای پایه',
    tooltip: `${fieldLabel} در ${basePhrase}، مقدار این فیلد ${mode === 'template' ? 'برابر با مقدار زیر است' : 'مطابق مقدار مرجع است'}.`,
    higher: (difference: number) => `${formatAmount(difference)}${unitSuffix} بیشتر از ${shortReference}`.trim(),
    lower: (difference: number) => `${formatAmount(difference)}${unitSuffix} کمتر از ${shortReference}`.trim(),
  };
}

export function buildCollectionCompareLabels(mode: PayrollComparisonMode, fieldLabel: string, baseYear?: number) {
  const tenantBaseLabel = formatTenantBaseLabel(baseYear);
  const basePhrase =
    mode === 'template' ? 'قالب انتخاب‌شده' : mode === 'tenant_base' ? `تنظیمات ${tenantBaseLabel}` : 'تنظیمات پایه';
  return {
    changed:
      mode === 'template' ? 'متفاوت با قالب' : mode === 'tenant_base' ? `متفاوت با ${tenantBaseLabel}` : 'متفاوت با مبنای پایه',
    tooltip: `${fieldLabel} در ${basePhrase} متفاوت است.`,
  };
}

export function compareNumbersForMode(
  mode: PayrollComparisonMode,
  baseValue: number,
  currentValue: number,
  fieldLabel: string,
  options?: { unit?: string; formatAmount?: (value: number) => string; baseYear?: number },
): BaseDifference | null {
  return compareValues(baseValue, currentValue, buildNumericCompareLabels(mode, fieldLabel, options));
}

export function compareCollectionsForMode<T>(
  mode: PayrollComparisonMode,
  baseValue: T,
  currentValue: T,
  fieldLabel: string,
  baseYear?: number,
): BaseDifference | null {
  return compareCollections(baseValue, currentValue, buildCollectionCompareLabels(mode, fieldLabel, baseYear));
}

export function buildToggleCompareDifference(
  mode: PayrollComparisonMode,
  enabled: boolean,
  baseEnabled: boolean,
  fieldLabel: string,
  baseYear?: number,
): BaseDifference | null {
  if (enabled === baseEnabled) return null;
  if (mode === 'template') {
    return {
      isDifferent: true,
      direction: enabled ? 'added' : 'removed',
      message: enabled ? 'فعال شده نسبت به قالب' : 'غیرفعال نسبت به قالب',
      tooltip: `${fieldLabel} در قالب انتخاب‌شده ${baseEnabled ? 'فعال' : 'غیرفعال'} بود.`,
    };
  }
  if (mode === 'tenant_base') {
    const tenantBaseLabel = formatTenantBaseLabel(baseYear);
    return {
      isDifferent: true,
      direction: enabled ? 'added' : 'removed',
      message: enabled ? `فعال شده نسبت به ${tenantBaseLabel}` : `غیرفعال نسبت به ${tenantBaseLabel}`,
      tooltip: `${fieldLabel} در تنظیمات ${tenantBaseLabel} ${baseEnabled ? 'فعال' : 'غیرفعال'} بود.`,
    };
  }
  return {
    isDifferent: true,
    direction: enabled ? 'added' : 'removed',
    message: enabled ? 'فعال شده نسبت به مبنا' : 'غیرفعال نسبت به مبنا',
    tooltip: `${fieldLabel} در تنظیمات پایه ${baseEnabled ? 'فعال' : 'غیرفعال'} بود.`,
  };
}
