import type { ContractRuleState } from '../businessContractRules';
import {
  buildBusinessSettingsComparison,
  formatBusinessSettingPercent,
  formatBusinessSettingValue,
  parseBusinessSettingNumber,
  type BusinessSettingsComparison,
  type BusinessSettingsLine,
} from '../contractSettingsReference';
import {
  compareJalaliDate,
  describeDueInterval,
  isDueIntervalAligned,
  parseInstallmentWindow,
  parseJalaliDate,
  type JalaliDateParts,
} from './dueScheduleUtils';
import type { DueItemLike, SettingsRuleLike } from './prepaymentHints';

function installmentModeLabel(activeTab: string) {
  if (activeTab === 'regular') return 'منظم';
  if (activeTab === 'irregular') return 'نامنظم';
  if (activeTab === 'progress-based') return 'مبتنی بر پیشرفت';
  return activeTab || 'ثبت نشده';
}

function buildInstallmentBreakdown(installments: Pick<ContractRuleState, 'activeTab' | 'values'>): BusinessSettingsLine[] {
  const { activeTab, values } = installments;

  if (activeTab === 'regular') {
    const balloonEnabled = values.regularBalloonEnabled === true;
    const balloonPercent = parseBusinessSettingNumber(values.regularBalloonPercent);
    return [
      { label: 'بازه زمانی اقساط', value: formatBusinessSettingValue(String(values.regularInterval ?? '')) },
      { label: 'تاریخ آخرین قسط', value: formatBusinessSettingValue(String(values.regularLastDueDate ?? '')) },
      { label: 'پرداخت بالونی', value: formatBusinessSettingValue(String(balloonEnabled)) },
      ...(balloonEnabled
        ? [
            { label: 'بازه بالونی', value: formatBusinessSettingValue(String(values.regularBalloonWindow ?? '')) },
            ...(balloonPercent !== null ? [{ label: 'درصد بالونی', value: formatBusinessSettingPercent(balloonPercent) }] : []),
          ]
        : []),
    ].filter((line) => line.value !== 'ثبت نشده' || line.label === 'پرداخت بالونی');
  }

  if (activeTab === 'irregular') {
    const balloonEnabled = values.irregularBalloonEnabled === true;
    const balloonPercent = parseBusinessSettingNumber(values.irregularBalloonPercent);
    return [
      { label: 'تاریخ آخرین قسط', value: formatBusinessSettingValue(String(values.irregularLastDueDate ?? '')) },
      { label: 'پرداخت بالونی', value: formatBusinessSettingValue(String(balloonEnabled)) },
      ...(balloonEnabled
        ? [
            { label: 'بازه بالونی', value: formatBusinessSettingValue(String(values.irregularBalloonWindow ?? '')) },
            ...(balloonPercent !== null ? [{ label: 'درصد بالونی', value: formatBusinessSettingPercent(balloonPercent) }] : []),
          ]
        : []),
    ].filter((line) => line.value !== 'ثبت نشده' || line.label === 'پرداخت بالونی');
  }

  return [
    { label: 'روش محاسبه مبلغ', value: formatBusinessSettingValue(String(values.progressAmountMode ?? '')) },
    { label: 'مرجع اعلام پیشرفت', value: formatBusinessSettingValue(String(values.progressCompletionAuthority ?? '')) },
    { label: 'مبنای سنجش پیشرفت', value: formatBusinessSettingValue(String(values.progressMeasurementBasis ?? '')) },
  ].filter((line) => line.value !== 'ثبت نشده');
}

/** Amount/mode hint for the installment financial row (prepayment-quality). */
export function resolveInstallmentHintReference(
  installments: SettingsRuleLike,
  currentHasInstallments: boolean,
  currentDueCount: number,
): BusinessSettingsComparison {
  if (!installments) {
    return buildBusinessSettingsComparison({
      status: 'missing',
      helperText: 'برای اقساط تنظیم مرجعی در تنظیمات کسب‌وکار ثبت نشده است.',
    });
  }

  if (!installments.active) {
    return buildBusinessSettingsComparison({
      reference: false,
      current: currentHasInstallments,
      referenceLines: [{ label: 'اقساط در تنظیمات', value: 'غیرفعال' }],
      currentLines: [
        { label: 'وضعیت فعلی قرارداد', value: currentHasInstallments ? 'دارای مبلغ/سررسید' : 'بدون اقساط' },
        { label: 'تعداد سررسیدهای فعلی', value: `${currentDueCount.toLocaleString('fa-IR')} مورد` },
      ],
      helperText: currentHasInstallments
        ? 'اقساط در تنظیمات غیرفعال است اما در پیش‌نویس مبلغ یا سررسید ثبت شده است.'
        : 'اقساط در تنظیمات کسب‌وکار فعال نیست.',
    });
  }

  const modeLabel = installmentModeLabel(installments.activeTab);
  const breakdownLines = buildInstallmentBreakdown(installments);
  const status = currentHasInstallments ? 'equal' : 'info';

  return buildBusinessSettingsComparison({
    status,
    reference: installments.activeTab,
    current: currentHasInstallments ? 'has-installments' : 'empty',
    referenceLines: [
      { label: 'اقساط در تنظیمات', value: 'فعال' },
      { label: 'حالت تنظیمات اقساط', value: modeLabel },
    ],
    currentLines: [
      { label: 'وضعیت فعلی قرارداد', value: currentHasInstallments ? 'دارای مبلغ/سررسید' : 'هنوز مبلغ/سررسید ثبت نشده' },
      { label: 'تعداد سررسیدهای فعلی', value: `${currentDueCount.toLocaleString('fa-IR')} مورد` },
    ],
    breakdownLines,
    helperText:
      installments.activeTab === 'progress-based'
        ? 'اقساط مبتنی بر پیشرفت است؛ سررسیدها باید با سیاست پیشرفت فیزیکی پروژه هماهنگ شوند.'
        : currentHasInstallments
          ? 'چارچوب اقساط از تنظیمات کسب‌وکار خوانده شده و با وضعیت فعلی قرارداد مقایسه می‌شود.'
          : 'اقساط در تنظیمات فعال است؛ مبلغ و سررسیدها را مطابق چارچوب بالا تکمیل کنید.',
  });
}

export function resolveInstallmentDueScheduleHint(
  installments: SettingsRuleLike,
  dueItems: DueItemLike[],
): BusinessSettingsComparison {
  if (!installments?.active) {
    return buildBusinessSettingsComparison({
      status: dueItems.length ? 'different' : 'info',
      referenceLines: [{ label: 'اقساط در تنظیمات', value: 'غیرفعال' }],
      currentLines: [{ label: 'سررسیدهای فعلی اقساط', value: `${dueItems.length.toLocaleString('fa-IR')} مورد` }],
      differenceText: dueItems.length ? 'در تنظیمات کسب‌وکار، اقساط فعال نیست اما در پیش‌نویس سررسید اقساط ثبت شده است.' : null,
      helperText: 'این Hint از تنظیمات اقساط کسب‌وکار خوانده می‌شود.',
    });
  }

  if (installments.activeTab === 'progress-based') {
    return buildBusinessSettingsComparison({
      status: 'info',
      referenceLines: [
        { label: 'حالت تنظیمات اقساط', value: 'مبتنی بر پیشرفت' },
        ...buildInstallmentBreakdown(installments).slice(0, 3),
      ],
      currentLines: [{ label: 'سررسیدهای فعلی اقساط', value: `${dueItems.length.toLocaleString('fa-IR')} مورد` }],
      helperText: 'در حالت پیشرفت فیزیکی، زمان‌بندی سررسیدها به تحقق مراحل وابسته است و فاصله زمانی ثابت ملاک نیست.',
    });
  }

  if (installments.activeTab === 'irregular') {
    const lastDue = String(installments.values.irregularLastDueDate ?? '');
    return buildBusinessSettingsComparison({
      status: 'info',
      referenceLines: [
        { label: 'حالت تنظیمات اقساط', value: 'نامنظم' },
        { label: 'تاریخ آخرین قسط تنظیمات', value: formatBusinessSettingValue(lastDue) },
        ...buildInstallmentBreakdown(installments).filter((line) => line.label.includes('بالونی')),
      ],
      currentLines: [{ label: 'سررسیدهای فعلی اقساط', value: `${dueItems.length.toLocaleString('fa-IR')} مورد` }],
      helperText: 'اقساط نامنظم است؛ تاریخ و مبلغ هر سررسید باید با سیاست آخرین قسط تنظیمات هماهنگ شود.',
    });
  }

  const windowLabel = String(installments.values.regularInterval ?? '');
  const expectedInterval = parseInstallmentWindow(windowLabel);
  const sortedDues = dueItems
    .map((item) => ({ item, date: parseJalaliDate(item.dueDate) }))
    .filter((entry): entry is { item: DueItemLike; date: JalaliDateParts } => Boolean(entry.date))
    .sort((a, b) => compareJalaliDate(a.date, b.date));
  const intervals = sortedDues.slice(1).map((entry, index) => describeDueInterval(sortedDues[index].date, entry.date));
  const currentLines = [
    { label: 'تعداد سررسیدهای فعلی', value: `${dueItems.length.toLocaleString('fa-IR')} مورد` },
    ...(intervals.length ? [{ label: 'فاصله‌های فعلی', value: intervals.map((interval) => interval.label).join('، ') }] : []),
  ];
  const balloonEnabled = installments.values.regularBalloonEnabled === true;
  const referenceExtras: BusinessSettingsLine[] = [
    ...(balloonEnabled
      ? [
          { label: 'پرداخت بالونی', value: 'فعال' },
          { label: 'بازه بالونی', value: formatBusinessSettingValue(String(installments.values.regularBalloonWindow ?? '')) },
        ]
      : [{ label: 'پرداخت بالونی', value: 'غیرفعال' }]),
  ];

  if (!expectedInterval) {
    return buildBusinessSettingsComparison({
      status: 'info',
      referenceLines: [
        { label: 'حالت تنظیمات اقساط', value: 'منظم' },
        { label: 'بازه مرجع تنظیمات', value: windowLabel || 'ثبت نشده' },
        ...referenceExtras,
      ],
      currentLines,
      helperText: 'بازه تنظیمات اقساط آزاد یا قابل تعیین در زمان قرارداد است؛ سیستم فقط سررسیدهای فعلی را برای بررسی نمایش می‌دهد.',
    });
  }

  if (dueItems.length < 2) {
    return buildBusinessSettingsComparison({
      status: 'info',
      referenceLines: [
        { label: 'حالت تنظیمات اقساط', value: 'منظم' },
        { label: 'بازه مرجع تنظیمات', value: windowLabel },
        ...referenceExtras,
      ],
      currentLines,
      helperText: 'برای سنجش فاصله اقساط، حداقل دو سررسید لازم است.',
    });
  }

  const intervalMismatch = intervals.some((interval) => !isDueIntervalAligned(interval, expectedInterval));
  return buildBusinessSettingsComparison({
    status: intervalMismatch ? 'different' : 'equal',
    referenceLines: [
      { label: 'حالت تنظیمات اقساط', value: 'منظم' },
      { label: 'بازه مرجع تنظیمات', value: windowLabel },
      ...referenceExtras,
    ],
    currentLines,
    breakdownLines: intervals.map((interval, index) => ({
      label: `فاصله سررسید ${index + 1}`,
      value: interval.label,
    })),
    differenceText: intervalMismatch ? `زمان‌بندی فعلی اقساط با بازه ${windowLabel} تنظیمات هماهنگ نیست.` : null,
    helperText: intervalMismatch
      ? 'سررسیدهای اقساط باید با بازه مرجع تنظیمات کسب‌وکار هماهنگ شوند.'
      : 'زمان‌بندی سررسیدهای اقساط با تنظیمات کسب‌وکار هماهنگ است.',
  });
}
