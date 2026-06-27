import {
  calculateBuyerPenalties,
  type BuyerPenaltyCalculationDetail,
  penaltyTypeKeysMatch,
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
  forgivenRial?: number | null;
  claimableAmountRial?: number;
  forgivenessStatus?: 'applied' | 'pending' | 'inactive';
};

type ForgivenessRuleSnapshot = {
  active?: boolean;
  activeTab?: string;
  values?: Record<string, string | boolean>;
};

type ForgivenessRuleConfig = {
  entryId: string;
  scope: 'whole' | 'itemized';
  active: boolean;
  valueMode: 'amount' | 'percent';
  minValue: number;
  maxValue: number;
  maxDelayCount: number;
  outsideBuyerControl: boolean;
  managerApproval: boolean;
};

type ForgivenessApplication = {
  forgivenRial: number | null;
  forgivenessStatus: 'applied' | 'pending' | 'inactive';
};

type PenaltyEngineParams = {
  financial: ContractFinancialData | null | undefined;
  penalties: ContractPenaltiesData | null | undefined;
  receipts?: RegisteredReceiptRecord[];
  asOfDate?: Date;
  forgiveness?: ForgivenessRuleSnapshot | null;
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

function toNumber(value: unknown) {
  const parsed = typeof value === 'string' ? Number(String(value).replace(/,/g, '')) : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseEnabledIds(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item ?? '').trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function parseEntryValueMap(value: unknown): Record<string, Record<string, string | boolean>> {
  if (typeof value !== 'string' || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter(([, entryValue]) => entryValue && typeof entryValue === 'object' && !Array.isArray(entryValue))
        .map(([entryId, entryValue]) => [entryId, entryValue as Record<string, string | boolean>]),
    );
  } catch {
    return {};
  }
}

function parseForgivenessRuleConfigs(snapshot: ForgivenessRuleSnapshot | null | undefined): ForgivenessRuleConfig[] {
  const values = snapshot?.values ?? {};
  const active = Boolean(snapshot?.active || values.forgiveAllowed);
  if (!active) return [];

  const currentScope = String(values.forgiveScope ?? 'whole') === 'itemized' ? 'itemized' : 'whole';
  const enabledEntryIds = parseEnabledIds(values.forgiveEnabledEntryIds);
  const entryValuesMap = parseEntryValueMap(values.forgiveEntryValues);

  const buildConfigFromValues = (entryId: string, scope: 'whole' | 'itemized', entryValues: Record<string, string | boolean>): ForgivenessRuleConfig => ({
    entryId,
    scope,
    active: true,
    valueMode: String(entryValues.forgiveValueMode ?? values.forgiveValueMode ?? 'amount') === 'percent' ? 'percent' : 'amount',
    minValue: Math.max(0, toNumber(entryValues.forgiveMinValue ?? values.forgiveMinValue)),
    maxValue: Math.max(0, toNumber(entryValues.forgiveMaxValue ?? values.forgiveMaxValue)),
    maxDelayCount: Math.max(0, Math.trunc(toNumber(entryValues.forgiveMaxDelayCount ?? values.forgiveMaxDelayCount))),
    outsideBuyerControl: Boolean(entryValues.forgiveOutsideBuyerControl ?? values.forgiveOutsideBuyerControl),
    managerApproval: Boolean(entryValues.forgiveManagerApproval ?? values.forgiveManagerApproval),
  });

  const configs: ForgivenessRuleConfig[] = [];

  if (enabledEntryIds.length > 0 || currentScope === 'itemized') {
    const itemizedIds =
      enabledEntryIds.length > 0
        ? enabledEntryIds
        : String(values.forgiveEntryId ?? '').trim()
          ? [String(values.forgiveEntryId).trim()]
          : [];
    for (const entryId of itemizedIds) {
      const entryValues = entryValuesMap[entryId] ?? values;
      configs.push(buildConfigFromValues(entryId, 'itemized', entryValues));
    }
  }

  if (currentScope === 'whole') {
    configs.push(buildConfigFromValues('whole-contract', 'whole', values));
  }

  return configs;
}

function calculateForgivenMainPenaltyRial(baseRial: number, config: ForgivenessRuleConfig): number {
  if (!(baseRial > 0)) return 0;
  if (config.managerApproval) return 0;
  if (!(config.maxValue > 0)) return 0;

  const minValue = Math.max(0, config.minValue);
  const maxValue = Math.max(0, config.maxValue);
  if (baseRial < minValue) return 0;

  if (config.valueMode === 'percent') {
    if (maxValue < minValue) return 0;
    return Math.max(0, Math.min(baseRial, baseRial * (maxValue / 100)));
  }

  if (maxValue < minValue) return 0;
  return Math.max(0, Math.min(baseRial, maxValue));
}

function evaluateForgivenessApplication(baseRial: number, config: ForgivenessRuleConfig): ForgivenessApplication {
  if (!(baseRial > 0) || !(config.maxValue > 0)) {
    return {
      forgivenRial: null,
      forgivenessStatus: 'inactive',
    };
  }

  if (config.managerApproval) {
    const eligibleWithoutApproval = Math.max(0, Math.round(calculateForgivenMainPenaltyRial(baseRial, { ...config, managerApproval: false })));
    if (eligibleWithoutApproval <= 0) {
      return {
        forgivenRial: null,
        forgivenessStatus: 'inactive',
      };
    }
    return {
      forgivenRial: null,
      forgivenessStatus: 'pending',
    };
  }

  const forgivenRial = calculateForgivenMainPenaltyRial(baseRial, config);
  if (!(forgivenRial > 0)) {
    return {
      forgivenRial: null,
      forgivenessStatus: 'inactive',
    };
  }

  return {
    forgivenRial,
    forgivenessStatus: 'applied',
  };
}

function selectPenaltyRowsForForgiveness(
  rows: PenaltyRowDetail[],
  config: ForgivenessRuleConfig,
  alreadyAppliedRowIds: Set<string>,
) {
  const matched = rows.filter((row) => !alreadyAppliedRowIds.has(row.id) && (config.scope === 'whole' || penaltyTypeKeysMatch(String(row.penaltyTypeId ?? ''), config.entryId)));
  const limit = config.maxDelayCount > 0 ? config.maxDelayCount : matched.length;
  return matched.slice(0, limit);
}

function applyForgivenessToPenaltyRows(rows: PenaltyRowDetail[], forgiveness: ForgivenessRuleSnapshot | null | undefined) {
  const configs = parseForgivenessRuleConfigs(forgiveness);
  if (configs.length === 0) {
    return rows.map((row) => ({
      ...row,
      forgivenRial: null,
      claimableAmountRial: Math.max(0, Math.round(Number(row.amount ?? 0))),
      forgivenessStatus: 'inactive' as const,
    }));
  }

  const appliedRowIds = new Set<string>();
  const outputRows: PenaltyRowDetail[] = rows.map((row) => ({
    ...row,
    forgivenRial: null as number | null,
    claimableAmountRial: Math.max(0, Math.round(Number(row.amount ?? 0))),
    forgivenessStatus: 'inactive' as const,
  }));
  const indexById = new Map(outputRows.map((row, index) => [row.id, index]));

  for (const config of configs.sort((a, b) => {
    if (a.scope !== b.scope) return a.scope === 'itemized' ? -1 : 1;
    return a.entryId.localeCompare(b.entryId);
  })) {
    const matchedRows = selectPenaltyRowsForForgiveness(outputRows, config, appliedRowIds);
    for (const row of matchedRows) {
      const evaluation = evaluateForgivenessApplication(row.mainPenaltyRial, config);
      if (evaluation.forgivenessStatus === 'inactive') continue;
      const index = indexById.get(row.id);
      if (index == null) continue;

      outputRows[index] = {
        ...row,
        forgivenRial: evaluation.forgivenessStatus === 'applied' ? evaluation.forgivenRial : null,
        claimableAmountRial:
          evaluation.forgivenessStatus === 'applied' && evaluation.forgivenRial != null
            ? Math.max(0, Math.round(Number(row.amount ?? 0) - evaluation.forgivenRial))
            : Math.max(0, Math.round(Number(row.amount ?? 0))),
        forgivenessStatus: evaluation.forgivenessStatus,
      } satisfies PenaltyRowDetail;
      appliedRowIds.add(row.id);
    }
  }

  return outputRows;
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
  forgiveness = null,
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
  const penaltyRowsWithForgiveness = applyForgivenessToPenaltyRows(penaltyRows, forgiveness);

  const combinedRows = [...principalRows, ...penaltyRowsWithForgiveness];
  const combinedBuckets = buildPaymentHistoryMonthBucketsFromRows(combinedRows);

  return {
    contractBaseTotalRial,
    principalRows,
    principalBuckets,
    penaltyRows: penaltyRowsWithForgiveness,
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
