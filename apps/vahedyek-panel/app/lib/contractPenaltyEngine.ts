import { buildReceiptAllocation } from './contractReceiptAllocation';
import { computeContractTotalRialFromFinancial } from './contractFinancialPricing';
import {
  buildPaymentHistoryMonthBuckets,
  buildPaymentHistoryMonthBucketsFromRows,
  type PaymentHistoryDueRow,
  type PaymentHistoryMonthBucket,
} from './contractPaymentMonthBuckets';
import type { RegisteredReceiptRecord } from './contractReceipts';
import { formatJalaliDate, toComparableDateFromDueString } from './financialUtils';
import type { ContractFinancialData, ContractPenaltiesData } from '../types/contract';

type PenaltyRowDetail = PaymentHistoryDueRow & {
  sourceKind: 'penalty';
  sourceId: string;
  principalDueRowId: string;
  penaltyRuleId: string;
  penaltyTypeId: string;
  lineBaseAmountRial: number;
};

type PenaltyEngineParams = {
  financial: ContractFinancialData | null | undefined;
  penalties: ContractPenaltiesData | null | undefined;
  receipts?: RegisteredReceiptRecord[];
  asOfDate?: Date;
};

type PenaltyEngineResult = {
  contractBaseTotalRial: number;
  principalRows: PaymentHistoryDueRow[];
  principalBuckets: PaymentHistoryMonthBucket[];
  penaltyRows: PenaltyRowDetail[];
  combinedRows: PaymentHistoryDueRow[];
  combinedBuckets: PaymentHistoryMonthBucket[];
};

const PERIOD_DAY_COUNT: Record<string, number> = {
  daily: 1,
  monthly: 30,
  yearly: 365,
};

function toNumber(value: unknown) {
  const normalized = typeof value === 'string' ? Number(String(value).replace(/,/g, '')) : Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

function roundAmount(value: number, rule: string | null | undefined) {
  const unit = rule === '1000' ? 1000 : rule === '100' ? 100 : 1;
  return Math.max(0, Math.round(value / unit) * unit);
}

function addDaysJalali(value: string, offsetDays: number) {
  const baseDate = toComparableDateFromDueString(value);
  if (!baseDate) return value;
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + offsetDays);
  return formatJalaliDate(nextDate);
}

function diffDaysInclusive(fromDate: Date, toDate: Date) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - start.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / 86_400_000) + 1;
}

function countStartedPeriods(fromDate: Date, toDate: Date, period: string) {
  if (period === 'daily') return diffDaysInclusive(fromDate, toDate);

  const from = new Date(fromDate);
  const to = new Date(toDate);
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  if (period === 'monthly') {
    const rawMonths = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    return rawMonths + 1;
  }

  return to.getFullYear() - from.getFullYear() + 1;
}

function computeProgressivePercent(rows: unknown[], overdueDays: number) {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  let totalPercent = 0;

  for (const raw of normalizedRows) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as { fromDay?: unknown; toDay?: unknown; rate?: unknown; openEnded?: unknown };
    const fromDay = Math.max(1, Math.trunc(toNumber(row.fromDay)));
    const openEnded = Boolean(row.openEnded);
    const toDay = openEnded ? Number.POSITIVE_INFINITY : Math.max(fromDay, Math.trunc(toNumber(row.toDay)));
    const rate = toNumber(row.rate);
    if (!(rate > 0) || overdueDays < fromDay) continue;
    const coveredDays = Math.min(overdueDays, toDay) - fromDay + 1;
    if (coveredDays > 0) totalPercent += coveredDays * rate;
  }

  return totalPercent;
}

function createPrincipalRows(financial: ContractFinancialData | null | undefined) {
  if (!financial) {
    return {
      rows: [] as PaymentHistoryDueRow[],
      buckets: [] as PaymentHistoryMonthBucket[],
    };
  }

  const categories = Array.isArray(financial.categories) ? financial.categories : [];
  const dueItems = Array.isArray(financial.dueItems) ? financial.dueItems : [];
  const categoryTitleById = new Map<string, string>();
  for (const category of categories) {
    categoryTitleById.set(String(category.id), String(category.name ?? category.id));
  }

  const buckets = buildPaymentHistoryMonthBuckets({ dueItems, categoryById: categoryTitleById });
  return {
    rows: buckets.flatMap((bucket) => bucket.items),
    buckets,
  };
}

function buildPenaltyRows(params: {
  principalRows: PaymentHistoryDueRow[];
  remainingPrincipalByDueId: Record<string, number>;
  penalties: ContractPenaltiesData | null | undefined;
  contractBaseTotalRial: number;
  asOfDate: Date;
}) {
  const payload = params.penalties;
  if (!payload) return [] as PenaltyRowDetail[];

  const activeTypeIds = new Set(
    (Array.isArray(payload.types) ? payload.types : [])
      .filter((type) => Boolean(type?.active))
      .map((type) => String(type.id)),
  );
  const rows: PenaltyRowDetail[] = [];

  for (const principalRow of params.principalRows) {
    const dueDate = String(principalRow.dueDate ?? '').trim();
    if (!dueDate || dueDate === '—') continue;

    const parsedDueDate = toComparableDateFromDueString(dueDate);
    if (!parsedDueDate) continue;

    const baseRemainingAmount = Math.max(0, Math.round(params.remainingPrincipalByDueId[principalRow.id] ?? principalRow.amount ?? 0));
    if (baseRemainingAmount <= 0) continue;

    for (const rule of Array.isArray(payload.rules) ? payload.rules : []) {
      if (!rule?.penaltyTypeId) continue;
      if (activeTypeIds.size > 0 && !activeTypeIds.has(String(rule.penaltyTypeId))) continue;

      const graceDays = Math.max(0, Math.trunc(toNumber(rule.graceDays)));
      const effectiveDate = new Date(parsedDueDate);
      effectiveDate.setDate(effectiveDate.getDate() + graceDays);
      if (effectiveDate > params.asOfDate) continue;

      const period = String(rule.period || 'daily');
      const periods = countStartedPeriods(effectiveDate, params.asOfDate, period);
      const overdueDays = diffDaysInclusive(effectiveDate, params.asOfDate);
      if (periods <= 0 || overdueDays <= 0) continue;

      const mode = String(rule.mode || 'fixed');
      const baseAmount = mode === 'contract' ? Math.max(0, Math.round(params.contractBaseTotalRial)) : baseRemainingAmount;
      let rawPenaltyAmount = 0;

      if (mode === 'fixed') {
        rawPenaltyAmount += toNumber(rule.fixedAmount) * periods;
      } else if (mode === 'progressive') {
        const progressivePercent = computeProgressivePercent(rule.progressiveRows, overdueDays);
        rawPenaltyAmount += (baseAmount * progressivePercent) / 100;
      } else {
        const percentPerPeriod = toNumber(rule.penaltyPercent);
        rawPenaltyAmount += ((baseAmount * percentPerPeriod) / 100) * periods;
      }

      const bankInterestPercent = toNumber(rule.bankInterestPercent);
      if (bankInterestPercent > 0) {
        rawPenaltyAmount += ((baseAmount * bankInterestPercent) / 100) * periods;
      }

      let roundedPenaltyAmount = roundAmount(rawPenaltyAmount, rule.roundRule);
      if (!(roundedPenaltyAmount > 0)) continue;

      if (rule.extraFeeEnabled) {
        const extraFeeAmount = toNumber(rule.extraFeeAmount);
        const extraFeeRaw =
          String(rule.extraFeeType || 'fixed') === 'percent' ? (baseAmount * extraFeeAmount) / 100 : extraFeeAmount;
        roundedPenaltyAmount += roundAmount(extraFeeRaw, rule.extraFeeRoundRule);
      }

      if (!(roundedPenaltyAmount > 0)) continue;

      rows.push({
        id: `penalty:${principalRow.id}:${String(rule.id)}`,
        categoryId: principalRow.categoryId,
        categoryTitle: `${principalRow.categoryTitle} · جریمه`,
        title: `جریمه ${principalRow.title}`,
        amount: Math.round(roundedPenaltyAmount),
        dueDate: addDaysJalali(dueDate, graceDays),
        isOverdueUnpaid: true,
        sourceKind: 'penalty',
        sourceId: `penalty:${principalRow.id}:${String(rule.id)}`,
        principalDueRowId: principalRow.id,
        penaltyRuleId: String(rule.id),
        penaltyTypeId: String(rule.penaltyTypeId),
        lineBaseAmountRial: baseAmount,
      });
    }
  }

  return rows;
}

export function buildContractPenaltyTimeline({
  financial,
  penalties,
  receipts = [],
  asOfDate = new Date(),
}: PenaltyEngineParams): PenaltyEngineResult {
  const contractBaseTotalRial = Math.max(0, Math.round(computeContractTotalRialFromFinancial(financial ?? null)));
  const { rows: principalRows, buckets: principalBuckets } = createPrincipalRows(financial);
  const principalOnlyAllocation = buildReceiptAllocation({ buckets: principalBuckets, receipts });
  const remainingPrincipalByDueId = Object.fromEntries(
    Object.values(principalOnlyAllocation.dueById).map((summary) => [summary.row.id, summary.remainingAmountRial]),
  );

  const penaltyRows = buildPenaltyRows({
    principalRows,
    remainingPrincipalByDueId,
    penalties,
    contractBaseTotalRial,
    asOfDate,
  });

  const combinedRows = [...principalRows, ...penaltyRows];
  const combinedBuckets = buildPaymentHistoryMonthBucketsFromRows(combinedRows);

  return {
    contractBaseTotalRial,
    principalRows,
    principalBuckets,
    penaltyRows,
    combinedRows,
    combinedBuckets,
  };
}

export function estimateContractPenaltiesTotalRial(
  contractTotal: number,
  penalties: unknown,
  dueItems: unknown[] = [],
  receipts: RegisteredReceiptRecord[] = [],
  asOfDate = new Date(),
) {
  const financial: ContractFinancialData = {
    pricingType: 'fixed',
    totalArea: '',
    pricePerMeter: '',
    fixedTotalAmount: String(contractTotal),
    activeTab: 'principal',
    categories: [],
    dueItems: Array.isArray(dueItems) ? (dueItems as ContractFinancialData['dueItems']) : [],
  };
  return buildContractPenaltyTimeline({
    financial,
    penalties: (penalties ?? null) as ContractPenaltiesData | null,
    receipts,
    asOfDate,
  }).penaltyRows.reduce((sum, row) => sum + row.amount, 0);
}
