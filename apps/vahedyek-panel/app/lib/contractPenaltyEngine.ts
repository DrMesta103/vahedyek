import {
  calculateBuyerPenalties,
  type BuyerPenaltyCalculationDetail,
} from './buyerPenaltyCalculation';
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
  mainPenaltyRial: number;
  lateFeeRial: number;
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
  penaltyDetailsByPrincipalDueId: Record<string, BuyerPenaltyCalculationDetail>;
  penaltyCalculation: ReturnType<typeof calculateBuyerPenalties>;
  combinedRows: PaymentHistoryDueRow[];
  combinedBuckets: PaymentHistoryMonthBucket[];
};

function addDaysJalali(value: string, offsetDays: number) {
  const baseDate = toComparableDateFromDueString(value);
  if (!baseDate) return value;
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + offsetDays);
  return formatJalaliDate(nextDate);
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

function buildPenaltyRowsFromCalculation(params: {
  principalRows: PaymentHistoryDueRow[];
  penaltyDetailsByPrincipalDueId: Record<string, BuyerPenaltyCalculationDetail>;
  penalties: ContractPenaltiesData | null | undefined;
}) {
  const penaltyTypeTitleById = new Map(
    (Array.isArray(params.penalties?.types) ? params.penalties.types : []).map((type) => [
      String(type.id),
      String(type.title ?? type.id),
    ]),
  );
  const rows: PenaltyRowDetail[] = [];

  for (const principalRow of params.principalRows) {
    const detail = params.penaltyDetailsByPrincipalDueId[principalRow.id];
    if (!detail || detail.totalPenaltyRial <= 0) continue;

    const penaltyTypeTitle = penaltyTypeTitleById.get(detail.penaltyTypeId) ?? detail.penaltyTypeTitle;
    const graceDays = detail.gracePeriodDays;

    rows.push({
      id: `penalty:${principalRow.id}:${detail.ruleId || detail.penaltyTypeId}`,
      categoryId: principalRow.categoryId,
      categoryTitle: `${principalRow.categoryTitle} · جریمه`,
      title: `جریمه ${principalRow.title}`,
      amount: Math.round(detail.totalPenaltyRial),
      dueDate: addDaysJalali(String(principalRow.dueDate ?? ''), graceDays),
      isOverdueUnpaid: true,
      sourceKind: 'penalty',
      sourceId: `penalty:${principalRow.id}:${detail.ruleId || detail.penaltyTypeId}`,
      principalDueRowId: principalRow.id,
      penaltyRuleId: detail.ruleId,
      penaltyTypeId: detail.penaltyTypeId,
      lineBaseAmountRial: detail.overdueRemainingDebtRial,
      mainPenaltyRial: detail.mainPenaltyRoundedRial,
      lateFeeRial: detail.lateFeeRoundedRial,
    });
  }

  return rows;
}

export function buildContractPenaltyTimeline({
  financial,
  penalties,
  receipts = [],
  asOfDate = new Date(),
}: PenaltyEngineParams): PenaltyEngineResult {
  const normalizedAsOfDate = new Date(asOfDate);
  normalizedAsOfDate.setHours(0, 0, 0, 0);

  const contractBaseTotalRial = Math.max(0, Math.round(computeContractTotalRialFromFinancial(financial ?? null)));
  const { rows: principalRows, buckets: principalBuckets } = createPrincipalRows(financial);
  const principalOnlyAllocation = buildReceiptAllocation({ buckets: principalBuckets, receipts });
  const penaltyTypeTitleById = Object.fromEntries(
    (Array.isArray(penalties?.types) ? penalties.types : []).map((type) => [String(type.id), String(type.title ?? type.id)]),
  );

  const penaltyCalculation = calculateBuyerPenalties({
    dues: principalRows.map((row) => {
      const summary = principalOnlyAllocation.dueById[row.id];
      return {
        id: row.id,
        categoryId: row.categoryId,
        title: row.title,
        dueDate: row.dueDate,
        dueAmountRial: Math.max(0, Math.round(Number(row.amount ?? 0))),
        paidAmountRial: Math.max(0, Math.round(summary?.paidAmountRial ?? 0)),
      };
    }),
    penalties,
    totalMainContractAmountRial: contractBaseTotalRial,
    calculationDate: normalizedAsOfDate,
    penaltyTypeTitleById,
  });

  const penaltyDetailsByPrincipalDueId = penaltyCalculation.byDueId;
  const penaltyRows = buildPenaltyRowsFromCalculation({
    principalRows,
    penaltyDetailsByPrincipalDueId,
    penalties,
  });

  const combinedRows = [...principalRows, ...penaltyRows];
  const combinedBuckets = buildPaymentHistoryMonthBucketsFromRows(combinedRows);

  return {
    contractBaseTotalRial,
    principalRows,
    principalBuckets,
    penaltyRows,
    penaltyDetailsByPrincipalDueId,
    penaltyCalculation,
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

export type { PenaltyEngineResult, PenaltyRowDetail, BuyerPenaltyCalculationDetail };
