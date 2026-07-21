import type { ContractRuleState } from '../businessContractRules';
import {
  buildBusinessSettingsComparison,
  formatBusinessSettingAmount,
  formatBusinessSettingPercent,
  parseBusinessSettingNumber,
  type BusinessSettingsComparison,
} from '../contractSettingsReference';
import {
  compareJalaliDate,
  describeDueInterval,
  isDueIntervalAligned,
  parseInstallmentWindow,
  parseJalaliDate,
  type JalaliDateParts,
} from './dueScheduleUtils';

export type SettingsRuleLike = Pick<ContractRuleState, 'active' | 'activeTab' | 'values'> | null | undefined;

export type DueItemLike = {
  dueDate: string;
};

export function resolvePrepaymentAmountReference(
  prepayment: SettingsRuleLike,
  totalContractAmount: number,
) {
  if (!prepayment?.active) {
    return {
      comparisonReference: prepayment?.active,
      referenceAmount: null as number | null,
      helperText: null as string | null,
    };
  }

  const fixedAmount = parseBusinessSettingNumber(prepayment.values.preFixedAmount);
  const combinedAmount = parseBusinessSettingNumber(prepayment.values.preCombinedAmount);
  const percent = parseBusinessSettingNumber(prepayment.values.prePercent);
  const combinedPercent = parseBusinessSettingNumber(prepayment.values.preCombinedPercent);

  if (prepayment.activeTab === 'fixed' && fixedAmount !== null) {
    return {
      comparisonReference: fixedAmount,
      referenceAmount: fixedAmount,
      helperText: 'مرجع از مبلغ ثابت پیش‌پرداخت در تنظیمات کسب‌وکار خوانده شده است.',
    };
  }

  if (prepayment.activeTab === 'combined') {
    const percentAmount = combinedPercent !== null && totalContractAmount > 0 ? Math.round((totalContractAmount * combinedPercent) / 100) : 0;
    const directAmount = combinedAmount ?? 0;
    const totalReference = directAmount + percentAmount;
    if (totalReference > 0) {
      return {
        comparisonReference: totalReference,
        referenceAmount: totalReference,
        helperText:
          combinedPercent !== null
            ? 'مرجع از ترکیب مبلغ ثابت و درصد پیش‌پرداخت تنظیمات محاسبه شده است.'
            : 'مرجع از مبلغ ثابت بخش ترکیبی تنظیمات خوانده شده است.',
      };
    }
    return {
      comparisonReference: undefined,
      referenceAmount: null,
      helperText: 'تنظیمات پیش‌پرداخت ترکیبی است، اما تا وقتی مبلغ کل قرارداد مشخص نباشد بخش درصدی به تومان تبدیل نمی‌شود.',
    };
  }

  if (prepayment.activeTab === 'percent') {
    if (percent !== null && totalContractAmount > 0) {
      const referenceAmount = Math.round((totalContractAmount * percent) / 100);
      return {
        comparisonReference: referenceAmount,
        referenceAmount,
        helperText: `مرجع از ${percent.toLocaleString('fa-IR')}٪ مبلغ کل قرارداد محاسبه شده است.`,
      };
    }
    return {
      comparisonReference: undefined,
      referenceAmount: null,
      helperText: 'تنظیمات پیش‌پرداخت درصدی است؛ بعد از تکمیل مبلغ کل قرارداد، مرجع تومان محاسبه و مقایسه می‌شود.',
    };
  }

  return {
    comparisonReference: undefined,
    referenceAmount: null,
    helperText: 'تنظیمات پیش‌پرداخت مبلغ ثابت مرجع ندارد و در حالت اختیار کارشناس فروش ثبت شده است.',
  };
}

export function resolvePrepaymentHintReference(
  prepayment: SettingsRuleLike,
  totalContractAmount: number,
  currentAmount: number,
): BusinessSettingsComparison {
  if (!prepayment?.active) {
    return buildBusinessSettingsComparison({
      reference: prepayment?.active,
      current: currentAmount > 0,
      unitLabel: 'تومان',
      helperText: 'پیش‌پرداخت در تنظیمات کسب‌وکار فعال نیست.',
    });
  }

  const fixedAmount = parseBusinessSettingNumber(prepayment.values.preFixedAmount);
  const combinedAmount = parseBusinessSettingNumber(prepayment.values.preCombinedAmount);
  const percent = parseBusinessSettingNumber(prepayment.values.prePercent);
  const combinedPercent = parseBusinessSettingNumber(prepayment.values.preCombinedPercent);

  if (prepayment.activeTab === 'fixed' && fixedAmount !== null) {
    return buildBusinessSettingsComparison({
      reference: fixedAmount,
      current: currentAmount,
      unitLabel: 'تومان',
      referenceLines: [{ label: 'مبلغ مرجع تنظیمات', value: formatBusinessSettingAmount(fixedAmount) }],
      currentLines: [{ label: 'مبلغ فعلی پیش‌پرداخت', value: formatBusinessSettingAmount(currentAmount) }],
      breakdownLines: [{ label: 'مبلغ ثابت تنظیمات', value: formatBusinessSettingAmount(fixedAmount) }],
      helperText: 'مرجع از مبلغ ثابت پیش‌پرداخت در تنظیمات کسب‌وکار خوانده شده است.',
    });
  }

  if (prepayment.activeTab === 'combined') {
    const directAmount = combinedAmount ?? 0;
    const percentAmount = combinedPercent !== null && totalContractAmount > 0 ? Math.round((totalContractAmount * combinedPercent) / 100) : 0;
    const totalReference = directAmount + percentAmount;
    const breakdownLines = [
      ...(combinedPercent !== null ? [{ label: 'درصد تنظیمات', value: formatBusinessSettingPercent(combinedPercent) }] : []),
      { label: 'مبلغ ثابت تنظیمات', value: formatBusinessSettingAmount(directAmount) },
      ...(combinedPercent !== null
        ? [{ label: 'مبلغ محاسبه‌شده از درصد', value: totalContractAmount > 0 ? formatBusinessSettingAmount(percentAmount) : 'بعد از تکمیل مبلغ کل قرارداد محاسبه می‌شود' }]
        : []),
      { label: 'جمع مرجع تنظیمات', value: totalReference > 0 ? formatBusinessSettingAmount(totalReference) : 'قابل محاسبه نیست' },
    ];

    if (totalReference > 0) {
      return buildBusinessSettingsComparison({
        reference: totalReference,
        current: currentAmount,
        unitLabel: 'تومان',
        referenceLines: [{ label: 'جمع مرجع تنظیمات', value: formatBusinessSettingAmount(totalReference) }],
        currentLines: [{ label: 'مبلغ فعلی پیش‌پرداخت', value: formatBusinessSettingAmount(currentAmount) }],
        breakdownLines,
        helperText: 'مرجع از ترکیب مبلغ ثابت و درصد پیش‌پرداخت تنظیمات محاسبه شده است.',
      });
    }

    return buildBusinessSettingsComparison({
      status: 'info',
      unitLabel: 'تومان',
      breakdownLines,
      helperText: 'تنظیمات پیش‌پرداخت ترکیبی است، اما تا وقتی مبلغ کل قرارداد مشخص نباشد بخش درصدی به تومان تبدیل نمی‌شود.',
    });
  }

  if (prepayment.activeTab === 'percent') {
    if (percent !== null && totalContractAmount > 0) {
      const referenceAmount = Math.round((totalContractAmount * percent) / 100);
      return buildBusinessSettingsComparison({
        reference: referenceAmount,
        current: currentAmount,
        unitLabel: 'تومان',
        referenceLines: [{ label: 'مبلغ مرجع تنظیمات', value: formatBusinessSettingAmount(referenceAmount) }],
        currentLines: [{ label: 'مبلغ فعلی پیش‌پرداخت', value: formatBusinessSettingAmount(currentAmount) }],
        breakdownLines: [
          { label: 'درصد تنظیمات', value: formatBusinessSettingPercent(percent) },
          { label: 'مبلغ محاسبه‌شده از درصد', value: formatBusinessSettingAmount(referenceAmount) },
        ],
        helperText: `مرجع از ${formatBusinessSettingPercent(percent)} مبلغ کل قرارداد محاسبه شده است.`,
      });
    }

    return buildBusinessSettingsComparison({
      status: 'info',
      unitLabel: 'تومان',
      breakdownLines: percent !== null ? [{ label: 'درصد تنظیمات', value: formatBusinessSettingPercent(percent) }] : [],
      helperText: 'تنظیمات پیش‌پرداخت درصدی است؛ بعد از تکمیل مبلغ کل قرارداد، مرجع تومان محاسبه و مقایسه می‌شود.',
    });
  }

  return buildBusinessSettingsComparison({
    status: 'info',
    unitLabel: 'تومان',
    breakdownLines: [{ label: 'حالت تنظیمات', value: 'اختیار کارشناس فروش' }],
    helperText: 'تنظیمات پیش‌پرداخت مبلغ ثابت مرجع ندارد و در حالت اختیار کارشناس فروش ثبت شده است.',
  });
}

export function resolvePrepaymentDueScheduleHint(
  prepayment: SettingsRuleLike,
  dueItems: DueItemLike[],
): BusinessSettingsComparison {
  if (!prepayment?.active) {
    return buildBusinessSettingsComparison({
      status: dueItems.length ? 'different' : 'info',
      referenceLines: [{ label: 'اقساط پیش‌پرداخت در تنظیمات', value: 'غیرفعال' }],
      currentLines: [{ label: 'سررسیدهای فعلی پیش‌پرداخت', value: `${dueItems.length.toLocaleString('fa-IR')} مورد` }],
      helperText: dueItems.length
        ? 'در تنظیمات کسب‌وکار، اقساط پیش‌پرداخت فعال نیست اما در پیش‌نویس سررسید ثبت شده است.'
        : 'در تنظیمات کسب‌وکار، اقساط پیش‌پرداخت فعال نیست.',
    });
  }

  const config = getPrepaymentInstallmentConfig(prepayment);
  const enabled = config.enabled;
  const windowLabel = config.windowLabel;
  const expectedInterval = parseInstallmentWindow(windowLabel);
  const sortedDues = dueItems
    .map((item) => ({ item, date: parseJalaliDate(item.dueDate) }))
    .filter((entry): entry is { item: DueItemLike; date: JalaliDateParts } => Boolean(entry.date))
    .sort((a, b) => compareJalaliDate(a.date, b.date));
  const intervals = sortedDues.slice(1).map((entry, index) => describeDueInterval(sortedDues[index].date, entry.date));
  const intervalMismatch =
    Boolean(enabled && expectedInterval && intervals.length) &&
    intervals.some((interval) => !isDueIntervalAligned(interval, expectedInterval));
  const currentLines = [
    { label: 'تعداد سررسیدهای فعلی', value: `${dueItems.length.toLocaleString('fa-IR')} مورد` },
    ...(intervals.length ? [{ label: 'فاصله‌های فعلی', value: intervals.map((interval) => interval.label).join('، ') }] : []),
  ];

  if (!enabled) {
    return buildBusinessSettingsComparison({
      status: dueItems.length ? 'different' : 'equal',
      referenceLines: [
        { label: 'اقساط پیش‌پرداخت در تنظیمات', value: 'غیرفعال' },
        { label: 'بازه مرجع تنظیمات', value: windowLabel || 'ثبت نشده' },
      ],
      currentLines,
      differenceText: dueItems.length ? 'برای پیش‌پرداخت سررسید ثبت شده، اما در تنظیمات اقساط پیش‌پرداخت غیرفعال است.' : null,
      helperText: 'این Hint از تنظیمات اقساط پیش‌پرداخت خوانده می‌شود.',
    });
  }

  if (!expectedInterval) {
    return buildBusinessSettingsComparison({
      status: 'info',
      referenceLines: [
        { label: 'اقساط پیش‌پرداخت در تنظیمات', value: 'فعال' },
        { label: 'بازه مرجع تنظیمات', value: windowLabel || 'ثبت نشده' },
      ],
      currentLines,
      helperText: 'بازه تنظیمات حالت آزاد دارد؛ سیستم فقط تعداد و سررسیدهای فعلی را برای مقایسه دستی نمایش می‌دهد.',
    });
  }

  if (dueItems.length < 2) {
    return buildBusinessSettingsComparison({
      status: 'info',
      referenceLines: [
        { label: 'اقساط پیش‌پرداخت در تنظیمات', value: 'فعال' },
        { label: 'بازه مرجع تنظیمات', value: windowLabel },
      ],
      currentLines,
      helperText: 'برای سنجش فاصله اقساط، حداقل دو سررسید پیش‌پرداخت لازم است.',
    });
  }

  return buildBusinessSettingsComparison({
    status: intervalMismatch ? 'different' : 'equal',
    referenceLines: [
      { label: 'اقساط پیش‌پرداخت در تنظیمات', value: 'فعال' },
      { label: 'بازه مرجع تنظیمات', value: windowLabel },
    ],
    currentLines,
    breakdownLines: intervals.map((interval, index) => ({
      label: `فاصله سررسید ${index + 1}`,
      value: interval.label,
    })),
    differenceText: intervalMismatch ? `زمان‌بندی فعلی با بازه ${windowLabel} تنظیمات هماهنگ نیست.` : null,
    helperText: intervalMismatch
      ? 'سررسیدهای پیش‌پرداخت باید با بازه مرجع تنظیمات کسب‌وکار هماهنگ شوند.'
      : 'زمان‌بندی سررسیدهای پیش‌پرداخت با تنظیمات کسب‌وکار هماهنگ است.',
  });
}

export function getPrepaymentInstallmentConfig(prepayment: Pick<ContractRuleState, 'activeTab' | 'values'>) {
  const prefix =
    prepayment.activeTab === 'percent'
      ? 'prePercent'
      : prepayment.activeTab === 'combined'
        ? 'preCombined'
        : prepayment.activeTab === 'sales'
          ? 'preSales'
          : 'preFixed';
  return {
    enabled: prepayment.values[`${prefix}InstallmentEnabled`] === true,
    windowLabel: String(prepayment.values[`${prefix}InstallmentWindow`] ?? ''),
  };
}
