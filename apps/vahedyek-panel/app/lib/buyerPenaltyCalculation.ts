import { isPrimaryFinancialCategoryId } from './financialLineShared';
import { formatJalaliDate, toComparableDateFromDueString } from './financialUtils';
import type { ContractPenaltiesData, PenaltyMode, PenaltyPeriod, PenaltyRuleData } from '../types/contract';

export const PENALTY_TYPE_BY_SECTION = {
  advance: 'advance-payment-delay',
  installment: 'installment-delay',
  loan: 'bank-loan-case-delay',
  handover: 'unit-handover-delay',
  document: 'document-delay',
} as const;

export const MISC_COST_PENALTY_TYPE_ID = 'misc-cost-delay';

export type BuyerPenaltyProgressiveRangeDetail = {
  fromDay: number;
  toDay: number | null;
  openEnded: boolean;
  ratePercent: number;
  daysInsideRange: number;
  baseAmountRial: number;
  calculatedAmountRial: number;
};

export type BuyerPenaltyRuleSettingsSnapshot = {
  mode: PenaltyMode;
  period: PenaltyPeriod;
  fixedAmountRial: number | null;
  penaltyPercent: number | null;
  bankInterestPercent: number | null;
  graceDays: number;
  roundRule: string;
  extraFeeEnabled: boolean;
  extraFeeType: 'fixed' | 'percent' | null;
  extraFeeAmount: number | null;
  extraFeeRoundRule: string;
  progressiveRows: Array<{
    fromDay: number;
    toDay: number | null;
    openEnded: boolean;
    ratePercent: number;
  }>;
  summaryLine: string;
};

export type BuyerPenaltyCalculationDetail = {
  principalDueId: string;
  penaltyTypeId: string;
  penaltyTypeTitle: string;
  ruleId: string;
  ruleSettings: BuyerPenaltyRuleSettingsSnapshot | null;
  calculationMethod: PenaltyMode;
  period: PenaltyPeriod;
  dueDate: string;
  calculationDate: string;
  rawDelayDays: number;
  gracePeriodDays: number;
  chargeableDelayDays: number;
  periodCount: number;
  overdueRemainingDebtRial: number;
  totalMainContractAmountRial: number;
  mainPenaltyCoreRawRial: number;
  mainPenaltyCoreRoundedRial: number;
  mainPenaltyRawRial: number;
  mainPenaltyRoundedRial: number;
  bankInterestRawRial: number;
  bankInterestRoundedRial: number;
  lateFeeType: 'fixed' | 'percent' | null;
  lateFeeConfiguredValue: number | null;
  lateFeeBaseRial: number;
  lateFeeRawRial: number;
  lateFeeRoundedRial: number;
  totalPenaltyRial: number;
  totalCollectibleRial: number;
  roundingRule: string;
  lateFeeRoundingRule: string;
  progressiveBreakdown: BuyerPenaltyProgressiveRangeDetail[] | null;
  calculationNotes: string[];
  zeroReason: string | null;
};

export type BuyerPenaltyDueInput = {
  id: string;
  categoryId: string;
  title: string;
  dueDate: string;
  dueAmountRial: number;
  paidAmountRial: number;
};

export type CalculateBuyerPenaltiesParams = {
  dues: BuyerPenaltyDueInput[];
  penalties: ContractPenaltiesData | null | undefined;
  totalMainContractAmountRial: number;
  calculationDate?: Date;
  penaltyTypeTitleById?: Record<string, string>;
};

export type BuyerPenaltyCalculationResult = {
  byDueId: Record<string, BuyerPenaltyCalculationDetail>;
  details: BuyerPenaltyCalculationDetail[];
  totalMainPenaltyRial: number;
  totalLateFeeRial: number;
  totalPenaltyRial: number;
};

function toNumber(value: unknown) {
  const normalized = typeof value === 'string' ? Number(String(value).replace(/,/g, '')) : Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

/** Calendar-day difference: calculationDate minus dueDate (not inclusive). */
export function diffCalendarDays(dueDate: Date, calculationDate: Date) {
  const start = new Date(dueDate);
  const end = new Date(calculationDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - start.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / 86_400_000);
}

export function computeChargeableDelayDays(rawDelayDays: number, gracePeriodDays: number) {
  return Math.max(0, rawDelayDays - Math.max(0, gracePeriodDays));
}

export function computePeriodCount(chargeableDelayDays: number, period: PenaltyPeriod | string) {
  if (chargeableDelayDays <= 0) return 0;
  if (period === 'monthly') return Math.ceil(chargeableDelayDays / 30);
  if (period === 'yearly') return Math.ceil(chargeableDelayDays / 365);
  return chargeableDelayDays;
}

export function applyPenaltyRounding(value: number, rule: string | null | undefined) {
  const unit = rule === '1000' ? 1000 : rule === '100' || rule === '00' ? 100 : 1;
  return Math.max(0, Math.round(value / unit) * unit);
}

export function extractPenaltyTypeKey(id: string) {
  const trimmed = String(id ?? '').trim();
  if (!trimmed) return '';
  const colon = trimmed.lastIndexOf(':');
  return colon >= 0 ? trimmed.slice(colon + 1) : trimmed;
}

export function penaltyTypeKeysMatch(storedId: string, logicalKey: string) {
  const stored = String(storedId ?? '').trim();
  const logical = String(logicalKey ?? '').trim();
  if (!stored || !logical) return false;
  return stored === logical || extractPenaltyTypeKey(stored) === logical;
}

export function resolvePenaltyTypeId(categoryId: string) {
  if (categoryId.includes(':') || categoryId.startsWith('custom-')) {
    return MISC_COST_PENALTY_TYPE_ID;
  }

  if (isPrimaryFinancialCategoryId(categoryId) && categoryId !== 'principal') {
    const mapped = PENALTY_TYPE_BY_SECTION[categoryId as keyof typeof PENALTY_TYPE_BY_SECTION];
    if (mapped) return mapped;
  }

  return MISC_COST_PENALTY_TYPE_ID;
}

function daysInsideProgressiveRange(chargeableDelayDays: number, fromDay: number, toDay: number | null, openEnded: boolean) {
  if (chargeableDelayDays < fromDay) return 0;
  const effectiveTo = openEnded || toDay == null ? chargeableDelayDays : Math.min(chargeableDelayDays, toDay);
  return Math.max(0, effectiveTo - fromDay + 1);
}

export function computeProgressivePenaltyRaw(params: {
  progressiveRows: unknown[];
  chargeableDelayDays: number;
  baseAmountRial: number;
}) {
  const breakdown: BuyerPenaltyProgressiveRangeDetail[] = [];
  let total = 0;

  for (const raw of Array.isArray(params.progressiveRows) ? params.progressiveRows : []) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as { fromDay?: unknown; toDay?: unknown; rate?: unknown; openEnded?: unknown };
    const fromDay = Math.max(1, Math.trunc(toNumber(row.fromDay)));
    const openEnded = Boolean(row.openEnded);
    const toDayRaw = openEnded ? null : Math.max(fromDay, Math.trunc(toNumber(row.toDay)));
    const ratePercent = toNumber(row.rate);
    const daysInsideRange = daysInsideProgressiveRange(params.chargeableDelayDays, fromDay, toDayRaw, openEnded);
    if (daysInsideRange <= 0 || !(ratePercent > 0)) continue;

    const calculatedAmountRial = (params.baseAmountRial * (ratePercent / 100)) * daysInsideRange;
    total += calculatedAmountRial;
    breakdown.push({
      fromDay,
      toDay: toDayRaw,
      openEnded,
      ratePercent,
      daysInsideRange,
      baseAmountRial: params.baseAmountRial,
      calculatedAmountRial,
    });
  }

  return { total, breakdown };
}

function findActiveRule(
  penalties: ContractPenaltiesData | null | undefined,
  penaltyTypeKey: string,
): PenaltyRuleData | null {
  if (!penalties) return null;

  const activeTypes = (Array.isArray(penalties.types) ? penalties.types : []).filter((type) => Boolean(type?.active));
  const hasActiveTypeFilter = activeTypes.length > 0;
  const isActiveType = activeTypes.some((type) => penaltyTypeKeysMatch(String(type.id), penaltyTypeKey));
  if (hasActiveTypeFilter && !isActiveType) return null;

  const rule = (Array.isArray(penalties.rules) ? penalties.rules : []).find((item) =>
    penaltyTypeKeysMatch(String(item?.penaltyTypeId ?? ''), penaltyTypeKey),
  );
  return rule ?? null;
}

function resolvePenaltyTypeTitle(
  penalties: ContractPenaltiesData | null | undefined,
  penaltyTypeKey: string,
  penaltyTypeTitleById?: Record<string, string>,
) {
  const types = Array.isArray(penalties?.types) ? penalties.types : [];
  const matchedType = types.find((type) => penaltyTypeKeysMatch(String(type.id), penaltyTypeKey));
  if (matchedType?.title) return String(matchedType.title);
  if (matchedType?.id && penaltyTypeTitleById?.[String(matchedType.id)]) {
    return penaltyTypeTitleById[String(matchedType.id)]!;
  }
  if (penaltyTypeTitleById?.[penaltyTypeKey]) return penaltyTypeTitleById[penaltyTypeKey]!;
  return penaltyTypeKey;
}

function resolveStoredPenaltyTypeId(
  penalties: ContractPenaltiesData | null | undefined,
  penaltyTypeKey: string,
) {
  const types = Array.isArray(penalties?.types) ? penalties.types : [];
  const matchedType = types.find((type) => penaltyTypeKeysMatch(String(type.id), penaltyTypeKey));
  return matchedType ? String(matchedType.id) : penaltyTypeKey;
}

function methodLabel(mode: PenaltyMode) {
  switch (mode) {
    case 'fixed':
      return 'مبلغ ثابت';
    case 'overdue':
      return 'درصد مانده بدهی معوق';
    case 'contract':
      return 'درصد مبلغ کل قرارداد';
    case 'progressive':
      return 'تصاعدی بر اساس روزهای تأخیر';
    default:
      return mode;
  }
}

function periodLabel(period: PenaltyPeriod) {
  switch (period) {
    case 'daily':
      return 'روزانه';
    case 'monthly':
      return 'ماهانه';
    case 'yearly':
      return 'سالانه';
    default:
      return period;
  }
}

function formatMoneyRialLabel(valueRial: number) {
  if (!valueRial) return '۰ ریال';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ریال`;
}

function formatPercentLabel(value: number) {
  return `${value.toLocaleString('fa-IR', { maximumFractionDigits: 4 })}٪`;
}

export function getPenaltyRoundRuleLabel(rule: string | null | undefined) {
  if (rule === '1000') return 'گرد به ۱٬۰۰۰ ریال';
  if (rule === '100' || rule === '00') return 'گرد به ۱۰۰ ریال';
  return 'بدون گرد کردن';
}

export function buildPenaltyRuleSettingsSnapshot(rule: PenaltyRuleData | null): BuyerPenaltyRuleSettingsSnapshot | null {
  if (!rule) return null;

  const mode = rule.mode ?? 'fixed';
  const period = rule.period ?? 'daily';
  const fixedAmountRial = toNumber(rule.fixedAmount) > 0 ? toNumber(rule.fixedAmount) : null;
  const penaltyPercent = toNumber(rule.penaltyPercent) > 0 ? toNumber(rule.penaltyPercent) : null;
  const bankInterestPercent = toNumber(rule.bankInterestPercent) > 0 ? toNumber(rule.bankInterestPercent) : null;
  const graceDays = Math.max(0, Math.trunc(toNumber(rule.graceDays)));
  const extraFeeEnabled = Boolean(rule.extraFeeEnabled);
  const extraFeeType = extraFeeEnabled
    ? String(rule.extraFeeType || 'fixed') === 'percent'
      ? 'percent'
      : 'fixed'
    : null;
  const extraFeeAmount = extraFeeEnabled && toNumber(rule.extraFeeAmount) > 0 ? toNumber(rule.extraFeeAmount) : null;

  const progressiveRows = (Array.isArray(rule.progressiveRows) ? rule.progressiveRows : [])
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const row = raw as { fromDay?: unknown; toDay?: unknown; rate?: unknown; openEnded?: unknown };
      const fromDay = Math.max(1, Math.trunc(toNumber(row.fromDay)));
      const openEnded = Boolean(row.openEnded);
      const toDayRaw = openEnded ? null : Math.max(fromDay, Math.trunc(toNumber(row.toDay)));
      const ratePercent = toNumber(row.rate);
      if (!(ratePercent > 0)) return null;
      return { fromDay, toDay: toDayRaw, openEnded, ratePercent };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  let summaryLine = '';
  switch (mode) {
    case 'fixed':
      summaryLine = `${formatMoneyRialLabel(fixedAmountRial ?? 0)} · ${periodLabel(period)}`;
      break;
    case 'overdue':
      summaryLine = `${formatPercentLabel(penaltyPercent ?? 0)} از مانده بدهی معوق · ${periodLabel(period)}`;
      break;
    case 'contract':
      summaryLine = `${formatPercentLabel(penaltyPercent ?? 0)} از مبلغ کل قرارداد · ${periodLabel(period)}`;
      break;
    case 'progressive':
      summaryLine = `${progressiveRows.length.toLocaleString('fa-IR')} بازه تصاعدی · ${periodLabel(period)}`;
      break;
    default:
      summaryLine = methodLabel(mode);
  }

  return {
    mode,
    period,
    fixedAmountRial,
    penaltyPercent,
    bankInterestPercent,
    graceDays,
    roundRule: String(rule.roundRule ?? '0'),
    extraFeeEnabled,
    extraFeeType,
    extraFeeAmount,
    extraFeeRoundRule: String(rule.extraFeeRoundRule ?? '0'),
    progressiveRows,
    summaryLine,
  };
}

export function getPenaltyRuleSettingRows(snapshot: BuyerPenaltyRuleSettingsSnapshot | null) {
  if (!snapshot) return [] as Array<{ label: string; value: string }>;

  const rows: Array<{ label: string; value: string }> = [
    { label: 'روش محاسبه جریمه', value: methodLabel(snapshot.mode) },
    { label: 'دوره محاسبه', value: periodLabel(snapshot.period) },
    { label: 'مهلت تنفس', value: `${snapshot.graceDays.toLocaleString('fa-IR')} روز` },
    { label: 'قاعده گرد کردن جریمه اصلی', value: getPenaltyRoundRuleLabel(snapshot.roundRule) },
  ];

  if (snapshot.mode === 'fixed' && snapshot.fixedAmountRial != null) {
    rows.push({ label: 'مبلغ ثابت هر دوره', value: formatMoneyRialLabel(snapshot.fixedAmountRial) });
  }
  if ((snapshot.mode === 'overdue' || snapshot.mode === 'contract') && snapshot.penaltyPercent != null) {
    rows.push({
      label: snapshot.mode === 'contract' ? 'درصد از مبلغ کل قرارداد' : 'درصد از مانده بدهی معوق',
      value: `${formatPercentLabel(snapshot.penaltyPercent)} در هر دوره`,
    });
  }
  if (snapshot.bankInterestPercent != null) {
    rows.push({
      label: 'درصد سود بانکی اضافه',
      value: `${formatPercentLabel(snapshot.bankInterestPercent)} در هر دوره`,
    });
  }
  if (snapshot.extraFeeEnabled) {
    rows.push({
      label: 'هزینه دیرکرد',
      value:
        snapshot.extraFeeType === 'percent'
          ? `${formatPercentLabel(snapshot.extraFeeAmount ?? 0)} از مانده بدهی معوق (یک‌بار)`
          : `${formatMoneyRialLabel(snapshot.extraFeeAmount ?? 0)} ثابت (یک‌بار)`,
    });
    rows.push({
      label: 'قاعده گرد کردن هزینه دیرکرد',
      value: getPenaltyRoundRuleLabel(snapshot.extraFeeRoundRule),
    });
  } else {
    rows.push({ label: 'هزینه دیرکرد', value: 'غیرفعال' });
  }

  return rows;
}

export function calculateBuyerPenaltyForDue(params: {
  due: BuyerPenaltyDueInput;
  rule: PenaltyRuleData | null;
  penaltyTypeId: string;
  penaltyTypeTitle: string;
  totalMainContractAmountRial: number;
  calculationDate: Date;
}): BuyerPenaltyCalculationDetail {
  const { due, rule, penaltyTypeId, penaltyTypeTitle, totalMainContractAmountRial, calculationDate } = params;
  const dueDateParsed = toComparableDateFromDueString(due.dueDate);
  const calculationDateLabel = formatJalaliDate(calculationDate);
  const overdueRemainingDebtRial = Math.max(0, Math.round(due.dueAmountRial - due.paidAmountRial));

  const ruleSettings = buildPenaltyRuleSettingsSnapshot(rule);

  const baseDetail: BuyerPenaltyCalculationDetail = {
    principalDueId: due.id,
    penaltyTypeId,
    penaltyTypeTitle,
    ruleId: rule ? String(rule.id) : '',
    ruleSettings,
    calculationMethod: rule?.mode ?? 'fixed',
    period: rule?.period ?? 'daily',
    dueDate: due.dueDate,
    calculationDate: calculationDateLabel,
    rawDelayDays: 0,
    gracePeriodDays: 0,
    chargeableDelayDays: 0,
    periodCount: 0,
    overdueRemainingDebtRial,
    totalMainContractAmountRial,
    mainPenaltyCoreRawRial: 0,
    mainPenaltyCoreRoundedRial: 0,
    mainPenaltyRawRial: 0,
    mainPenaltyRoundedRial: 0,
    bankInterestRawRial: 0,
    bankInterestRoundedRial: 0,
    lateFeeType: null,
    lateFeeConfiguredValue: null,
    lateFeeBaseRial: 0,
    lateFeeRawRial: 0,
    lateFeeRoundedRial: 0,
    totalPenaltyRial: 0,
    totalCollectibleRial: overdueRemainingDebtRial,
    roundingRule: rule?.roundRule ?? '0',
    lateFeeRoundingRule: rule?.extraFeeRoundRule ?? '0',
    progressiveBreakdown: null,
    calculationNotes: [],
    zeroReason: null,
  };

  if (!dueDateParsed) {
    return { ...baseDetail, zeroReason: 'تاریخ سررسید معتبر نیست.' };
  }

  if (!rule) {
    return { ...baseDetail, zeroReason: 'قانون جریمه برای این نوع فعال یا ثبت نشده است.' };
  }

  if (overdueRemainingDebtRial <= 0) {
    return { ...baseDetail, zeroReason: 'مانده بدهی معوق برای این سررسید صفر است.' };
  }

  const rawDelayDays = diffCalendarDays(dueDateParsed, calculationDate);
  const gracePeriodDays = Math.max(0, Math.trunc(toNumber(rule.graceDays)));
  const chargeableDelayDays = computeChargeableDelayDays(rawDelayDays, gracePeriodDays);
  const period = rule.period ?? 'daily';
  const periodCount = computePeriodCount(chargeableDelayDays, period);
  const mode = rule.mode ?? 'fixed';

  if (chargeableDelayDays <= 0) {
    return {
      ...baseDetail,
      rawDelayDays,
      gracePeriodDays,
      chargeableDelayDays,
      zeroReason:
        rawDelayDays <= 0
          ? 'سررسید هنوز فرا نرسیده است.'
          : 'این سررسید هنوز در مهلت تنفس است یا روز قابل محاسبه‌ای ندارد.',
    };
  }

  const percentBaseAmountRial =
    mode === 'contract' ? Math.max(0, Math.round(totalMainContractAmountRial)) : overdueRemainingDebtRial;

  let mainPenaltyRawRial = 0;
  let progressiveBreakdown: BuyerPenaltyProgressiveRangeDetail[] | null = null;

  if (mode === 'fixed') {
    mainPenaltyRawRial = toNumber(rule.fixedAmount) * periodCount;
  } else if (mode === 'progressive') {
    const progressive = computeProgressivePenaltyRaw({
      progressiveRows: rule.progressiveRows,
      chargeableDelayDays,
      baseAmountRial: overdueRemainingDebtRial,
    });
    mainPenaltyRawRial = progressive.total;
    progressiveBreakdown = progressive.breakdown.length > 0 ? progressive.breakdown : null;
  } else {
    const percentPerPeriod = toNumber(rule.penaltyPercent);
    mainPenaltyRawRial = (percentBaseAmountRial * (percentPerPeriod / 100)) * periodCount;
  }

  const bankInterestPercent = toNumber(rule.bankInterestPercent);
  const bankInterestRawRial =
    bankInterestPercent > 0 ? (percentBaseAmountRial * (bankInterestPercent / 100)) * periodCount : 0;

  const mainPenaltyRoundedRial = applyPenaltyRounding(mainPenaltyRawRial, rule.roundRule);
  const bankInterestRoundedRial = applyPenaltyRounding(bankInterestRawRial, rule.roundRule);

  let lateFeeType: 'fixed' | 'percent' | null = null;
  let lateFeeConfiguredValue: number | null = null;
  let lateFeeBaseRial = 0;
  let lateFeeRawRial = 0;
  let lateFeeRoundedRial = 0;
  const calculationNotes: string[] = [];

  // Late fee is applied once per due item on the first chargeable delay day.
  // It is calculated on overdue remaining debt, not on the main penalty amount.
  if (rule.extraFeeEnabled) {
    lateFeeType = String(rule.extraFeeType || 'fixed') === 'percent' ? 'percent' : 'fixed';
    lateFeeConfiguredValue = toNumber(rule.extraFeeAmount);
    lateFeeBaseRial = overdueRemainingDebtRial;
    lateFeeRawRial =
      lateFeeType === 'percent'
        ? overdueRemainingDebtRial * (lateFeeConfiguredValue / 100)
        : lateFeeConfiguredValue;
    lateFeeRoundedRial = applyPenaltyRounding(lateFeeRawRial, rule.extraFeeRoundRule);
  }

  if (mode === 'fixed' && ruleSettings?.fixedAmountRial != null) {
    calculationNotes.push(
      `جریمه اصلی = ${formatMoneyRialLabel(ruleSettings.fixedAmountRial)} × ${periodCount.toLocaleString('fa-IR')} دوره ${periodLabel(period)} = ${formatMoneyRialLabel(mainPenaltyRawRial)}`,
    );
  } else if (mode === 'overdue' && ruleSettings?.penaltyPercent != null) {
    calculationNotes.push(
      `جریمه اصلی = ${formatMoneyRialLabel(percentBaseAmountRial)} × ${formatPercentLabel(ruleSettings.penaltyPercent)} × ${periodCount.toLocaleString('fa-IR')} دوره = ${formatMoneyRialLabel(mainPenaltyRawRial)}`,
    );
  } else if (mode === 'contract' && ruleSettings?.penaltyPercent != null) {
    calculationNotes.push(
      `جریمه اصلی = ${formatMoneyRialLabel(percentBaseAmountRial)} × ${formatPercentLabel(ruleSettings.penaltyPercent)} × ${periodCount.toLocaleString('fa-IR')} دوره = ${formatMoneyRialLabel(mainPenaltyRawRial)}`,
    );
  } else if (mode === 'progressive' && progressiveBreakdown && progressiveBreakdown.length > 0) {
    for (const range of progressiveBreakdown) {
      calculationNotes.push(
        `بازه ${range.fromDay.toLocaleString('fa-IR')}${range.openEnded ? ' به بعد' : ` تا ${String(range.toDay ?? '').toLocaleString('fa-IR')}`}: ${formatMoneyRialLabel(range.baseAmountRial)} × ${formatPercentLabel(range.ratePercent)} × ${range.daysInsideRange.toLocaleString('fa-IR')} روز = ${formatMoneyRialLabel(range.calculatedAmountRial)}`,
      );
    }
  }

  if (bankInterestRawRial > 0 && ruleSettings?.bankInterestPercent != null) {
    calculationNotes.push(
      `سود بانکی = ${formatMoneyRialLabel(percentBaseAmountRial)} × ${formatPercentLabel(ruleSettings.bankInterestPercent)} × ${periodCount.toLocaleString('fa-IR')} دوره = ${formatMoneyRialLabel(bankInterestRawRial)}`,
    );
  }

  if (lateFeeType === 'percent' && lateFeeConfiguredValue != null) {
    calculationNotes.push(
      `هزینه دیرکرد = ${formatMoneyRialLabel(overdueRemainingDebtRial)} × ${formatPercentLabel(lateFeeConfiguredValue)} = ${formatMoneyRialLabel(lateFeeRawRial)}`,
    );
  } else if (lateFeeType === 'fixed' && lateFeeConfiguredValue != null) {
    calculationNotes.push(`هزینه دیرکرد = ${formatMoneyRialLabel(lateFeeConfiguredValue)} (ثابت، یک‌بار)`);
  }

  const totalPenaltyRial = mainPenaltyRoundedRial + bankInterestRoundedRial + lateFeeRoundedRial;
  const totalCollectibleRial = overdueRemainingDebtRial + totalPenaltyRial;

  return {
    ...baseDetail,
    rawDelayDays,
    gracePeriodDays,
    chargeableDelayDays,
    periodCount,
    mainPenaltyCoreRawRial: mainPenaltyRawRial,
    mainPenaltyCoreRoundedRial: mainPenaltyRoundedRial,
    mainPenaltyRawRial: mainPenaltyRawRial + bankInterestRawRial,
    mainPenaltyRoundedRial: mainPenaltyRoundedRial + bankInterestRoundedRial,
    bankInterestRawRial,
    bankInterestRoundedRial,
    lateFeeType,
    lateFeeConfiguredValue,
    lateFeeBaseRial,
    lateFeeRawRial,
    lateFeeRoundedRial,
    totalPenaltyRial,
    totalCollectibleRial,
    progressiveBreakdown,
    calculationNotes,
    zeroReason: totalPenaltyRial > 0 ? null : 'مبلغ جریمه پس از گرد کردن صفر شد.',
  };
}

export function calculateBuyerPenalties(params: CalculateBuyerPenaltiesParams): BuyerPenaltyCalculationResult {
  const calculationDate = params.calculationDate ?? new Date();
  calculationDate.setHours(0, 0, 0, 0);

  const details: BuyerPenaltyCalculationDetail[] = [];
  const byDueId: Record<string, BuyerPenaltyCalculationDetail> = {};

  for (const due of params.dues) {
    const penaltyTypeKey = resolvePenaltyTypeId(due.categoryId);
    const rule = findActiveRule(params.penalties, penaltyTypeKey);
    const penaltyTypeId = resolveStoredPenaltyTypeId(params.penalties, penaltyTypeKey);
    const penaltyTypeTitle = resolvePenaltyTypeTitle(params.penalties, penaltyTypeKey, params.penaltyTypeTitleById);
    const detail = calculateBuyerPenaltyForDue({
      due,
      rule,
      penaltyTypeId,
      penaltyTypeTitle,
      totalMainContractAmountRial: params.totalMainContractAmountRial,
      calculationDate,
    });
    details.push(detail);
    byDueId[due.id] = detail;
  }

  const totalMainPenaltyRial = details.reduce(
    (sum, item) => sum + item.mainPenaltyRoundedRial,
    0,
  );
  const totalLateFeeRial = details.reduce((sum, item) => sum + item.lateFeeRoundedRial, 0);
  const totalPenaltyRial = details.reduce((sum, item) => sum + item.totalPenaltyRial, 0);

  return {
    byDueId,
    details,
    totalMainPenaltyRial,
    totalLateFeeRial,
    totalPenaltyRial,
  };
}

export function getPenaltyMethodLabel(mode: PenaltyMode) {
  return methodLabel(mode);
}

export function getPenaltyPeriodLabel(period: PenaltyPeriod) {
  return periodLabel(period);
}
