import { formatFaNumber } from './format-fa';
import { compareCollections, compareValues, type BaseDifference } from './payroll-business-settings';

export type PayrollComparisonMode = 'tenant' | 'template';

export function buildNumericCompareLabels(
  mode: PayrollComparisonMode,
  fieldLabel: string,
  options?: { unit?: string; formatAmount?: (value: number) => string },
) {
  const formatAmount = options?.formatAmount ?? formatFaNumber;
  const unitSuffix = options?.unit ? ` ${options.unit}` : '';
  const basePhrase = mode === 'template' ? 'قالب انتخاب‌شده' : 'تنظیمات پایه';

  return {
    changed: mode === 'template' ? 'متفاوت با قالب' : 'متفاوت با مبنای پایه',
    tooltip: `${fieldLabel} در ${basePhrase} ${mode === 'template' ? 'برابر با مقدار زیر است' : 'مطابق مقدار مرجع است'}.`,
    higher: (difference: number) =>
      `${formatAmount(difference)}${unitSuffix} بیشتر از ${mode === 'template' ? 'قالب' : 'مبنای پایه'}`.trim(),
    lower: (difference: number) =>
      `${formatAmount(difference)}${unitSuffix} کمتر از ${mode === 'template' ? 'قالب' : 'مبنای پایه'}`.trim(),
  };
}

export function buildCollectionCompareLabels(mode: PayrollComparisonMode, fieldLabel: string) {
  const basePhrase = mode === 'template' ? 'قالب انتخاب‌شده' : 'تنظیمات پایه';
  return {
    changed: mode === 'template' ? 'متفاوت با قالب' : 'متفاوت با مبنای پایه',
    tooltip: `${fieldLabel} در ${basePhrase} متفاوت است.`,
  };
}

export function compareNumbersForMode(
  mode: PayrollComparisonMode,
  baseValue: number,
  currentValue: number,
  fieldLabel: string,
  options?: { unit?: string; formatAmount?: (value: number) => string },
): BaseDifference | null {
  return compareValues(baseValue, currentValue, buildNumericCompareLabels(mode, fieldLabel, options));
}

export function compareCollectionsForMode<T>(
  mode: PayrollComparisonMode,
  baseValue: T,
  currentValue: T,
  fieldLabel: string,
): BaseDifference | null {
  return compareCollections(baseValue, currentValue, buildCollectionCompareLabels(mode, fieldLabel));
}

export function buildToggleCompareDifference(
  mode: PayrollComparisonMode,
  enabled: boolean,
  baseEnabled: boolean,
  fieldLabel: string,
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
  return {
    isDifferent: true,
    direction: enabled ? 'added' : 'removed',
    message: enabled ? 'فعال شده نسبت به مبنا' : 'غیرفعال نسبت به مبنا',
    tooltip: `${fieldLabel} در تنظیمات پایه ${baseEnabled ? 'فعال' : 'غیرفعال'} بود.`,
  };
}
