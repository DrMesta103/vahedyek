import { validateShares } from './contractValidation';
import {
  createInitialFinancialCategories,
  buildFinancialLineCategories,
  createFinancialLineId,
  FINANCIAL_SUB_CATEGORY_IDS,
  mergeWithSystemCategories,
  orderFinancialCategories,
} from './financialLineShared';
import {
  isFinancialLineHeaderCategoryId,
  isFinancialLineSubtreeCategoryId,
  isLegacyCustomRootCategoryId,
  normalizeFinancialCategories,
  normalizeFinancialDueItems,
  sortFinancialCategoriesForPersistence,
} from './financialUtils';
import type {
  AppendixAdjustmentPayload,
  AppendixContractBaseCostsPayload,
  AppendixDeliveryDatePayload,
  AppendixLoanPayload,
  AppendixMaterialSpecsChangePayload,
  AppendixPenaltyWaiverPayload,
  AppendixPartiesPayload,
  AppendixSideCostsPayload,
  AppendixTechnicalSpecGroup,
  AppendixTagKey,
  Contract,
  ContractAppendix,
  ContractFinancialData,
  ContractTerminationData,
  FinancialCategoryData,
  FinancialDueItemData,
  ShareMode,
  PenaltyExtraFeeType,
  PenaltyMode,
  PenaltyPeriod,
  PenaltyProgressiveRowData,
  PenaltyRoundRule,
  SupportedAppendixTagKey,
} from '../types/contract';
import { createInitialRuleState } from './businessContractRules';
import { isSupportedAppendixTag } from './appendixTagSupport';
import { getAppendixTagTitle } from './contractAppendixConfig';
import {
  normalizeProgressiveRows,
  sanitizeDecimalInput,
  validateProgressiveRows,
} from './progressivePenalty';
import {
  normalizeBuilderPenaltyRuleState,
  validateBuilderPenaltyRuleState,
} from './builderPenalty';
import {
  MATERIAL_SPECS_CHANGE_COMPARISON_REFERENCES,
  MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS,
  MATERIAL_SPECS_CHANGE_OUTCOMES,
  MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENTS,
  MATERIAL_SPECS_CHANGE_TYPES,
} from './materialSpecsChangeRule';
import { normalizeTerminationPayload } from '../(panel)/contracts/new/_components/termination/terminationDefaults';

export const APPENDIX_ADJUSTMENT_LINE_ID = createFinancialLineId('appendix-adjustment');
export const APPENDIX_ADJUSTMENT_TITLE = 'تعدیل';
export const APPENDIX_CONTRACT_BASE_TITLE = 'مبلغ اصل قرارداد';

export type SupportedAppendixPayload =
  | AppendixLoanPayload
  | AppendixDeliveryDatePayload
  | AppendixPartiesPayload
  | AppendixAdjustmentPayload
  | AppendixBuilderPenaltyPayload
  | ContractTerminationData
  | AppendixContractBaseCostsPayload
  | AppendixSideCostsPayload
  | AppendixMaterialSpecsChangePayload
  | AppendixPenaltyWaiverPayload
  | AppendixGenericPayload;

export type AppendixBuilderPenaltyPayload = ReturnType<typeof createInitialRuleState>;

export interface AppendixGenericPayload {
  title: string;
  detailText: string;
  amount: string;
  previousDate: string;
  nextDate: string;
  notes: string;
}

type FinancialAppendixPayload =
  | AppendixAdjustmentPayload
  | AppendixContractBaseCostsPayload
  | AppendixSideCostsPayload;

export const GENERIC_FINANCIAL_APPENDIX_TAGS = ['unit-delivery', 'forgiveness', 'contract-costs'] as const;
export const GENERIC_CONDITION_APPENDIX_TAGS = ['workshop-conditions', 'arbitration'] as const;
export const GENERIC_DATE_APPENDIX_TAGS = ['due-dates', 'commitment-date'] as const;

const GENERIC_APPENDIX_TAG_SET = new Set<SupportedAppendixTagKey>([
  ...GENERIC_FINANCIAL_APPENDIX_TAGS,
  ...GENERIC_CONDITION_APPENDIX_TAGS,
  ...GENERIC_DATE_APPENDIX_TAGS,
]);

const APPENDIX_LOAN_PAYMENT_STATUSES = new Set<AppendixLoanPayload['paymentStatus']>(['unselected', 'full', 'less', 'more', 'none']);
const APPENDIX_LOAN_TIMINGS = new Set<AppendixLoanPayload['loanTiming']>(['undated', 'contract-date', 'before-contract', 'dated']);
const APPENDIX_LOAN_REPAYMENT_TIMINGS = new Set<AppendixLoanPayload['repaymentTiming']>([
  'before-contract-started',
  'with-appendix-contract',
  'undated',
  'with-contract-bank-installments',
]);
const DEFAULT_LOAN_BANK = 'ملت';

const PRIMARY_CATEGORY_IDS = ['principal', ...FINANCIAL_SUB_CATEGORY_IDS] as const;
const PRIMARY_CATEGORY_ID_SET = new Set<string>(PRIMARY_CATEGORY_IDS);

function getDefaultFinancialActiveTab(categories: FinancialCategoryData[]) {
  return (
    categories.find((item) => item.requiresDue)?.id ??
    categories.find((item) => item.id !== 'principal')?.id ??
    categories[0]?.id ??
    ''
  );
}

function createEmptyFinancialPayload(categories: FinancialCategoryData[]): FinancialAppendixPayload {
  return {
    activeTab: getDefaultFinancialActiveTab(categories),
    categories,
    dueItems: [],
  };
}

function getFinancialData(contract: Contract | null | undefined) {
  return contract?.data?.financial ?? null;
}

function pickFinancialCategories(categories: FinancialCategoryData[], predicate: (category: FinancialCategoryData) => boolean) {
  return categories.filter(predicate).map((item) => ({
    ...item,
    capAmount: Number(item.capAmount ?? 0),
    dueAmount: Number(item.dueAmount ?? 0),
    noDueAmount: Number(item.noDueAmount ?? 0),
  }));
}

function normalizeFixedLineCategories(input: unknown, lineId: string, title: string) {
  const source = Array.isArray(input) ? (input as FinancialCategoryData[]) : [];
  const merged = mergeWithSystemCategories(source);
  const lineCategories = merged.filter((item) => item.id === lineId || item.id.startsWith(`${lineId}:`));
  if (!lineCategories.length) {
    return buildFinancialLineCategories({ lineId, title });
  }

  return buildFinancialLineCategories({
    lineId,
    title,
    capAmount: Number(lineCategories.find((item) => item.id === lineId)?.capAmount ?? 0),
  }).map((item) => {
    const existing = lineCategories.find((entry) => entry.id === item.id);
    if (!existing) return item;
    return {
      ...item,
      capAmount: Number(existing.capAmount ?? item.capAmount),
      dueAmount: Number(existing.dueAmount ?? item.dueAmount),
      noDueAmount: Number(existing.noDueAmount ?? item.noDueAmount),
    };
  });
}

function normalizePrimaryContractCategories(input: unknown) {
  const source = normalizeFinancialCategories(Array.isArray(input) ? input : []);
  const merged = mergeWithSystemCategories(source as FinancialCategoryData[]);
  const primary = pickFinancialCategories(merged as FinancialCategoryData[], (category) => PRIMARY_CATEGORY_ID_SET.has(category.id));
  return orderFinancialCategories(primary);
}

function normalizeSideCostCategories(input: unknown) {
  const source = normalizeFinancialCategories(Array.isArray(input) ? input : []) as FinancialCategoryData[];
  const headers = new Set<string>();

  for (const item of source) {
    if (isFinancialLineHeaderCategoryId(item.id)) headers.add(item.id);
    if (isFinancialLineSubtreeCategoryId(item.id)) headers.add(item.id.slice(0, item.id.lastIndexOf(':')));
  }

  const byId = new Map(source.map((item) => [item.id, item]));
  const normalizedLines: FinancialCategoryData[] = [];

  for (const headerId of headers) {
    const header = byId.get(headerId);
    const built = buildFinancialLineCategories({
      lineId: headerId,
      title: String(header?.name ?? 'ردیف مالی'),
      capAmount: Number(header?.capAmount ?? 0),
    }).map((item) => {
      const existing = byId.get(item.id);
      if (!existing) return item;
      return {
        ...item,
        name: item.id === headerId ? String(existing.name ?? item.name) : item.name,
        capAmount: Number(existing.capAmount ?? item.capAmount),
        dueAmount: Number(existing.dueAmount ?? item.dueAmount),
        noDueAmount: Number(existing.noDueAmount ?? item.noDueAmount),
      };
    });
    normalizedLines.push(...built);
  }

  const legacyRoots = source.filter(
    (item) =>
      item.id !== 'principal' &&
      !PRIMARY_CATEGORY_ID_SET.has(item.id) &&
      !isFinancialLineHeaderCategoryId(item.id) &&
      !isFinancialLineSubtreeCategoryId(item.id),
  );

  return sortFinancialCategoriesForPersistence([...normalizedLines, ...legacyRoots]);
}

function normalizeFinancialDueItemsForCategories(input: unknown, categories: FinancialCategoryData[]) {
  return normalizeFinancialDueItems(Array.isArray(input) ? input : [], new Set(categories.map((item) => item.id))) as FinancialDueItemData[];
}

function normalizeFinancialPayload(
  row: Record<string, unknown>,
  categories: FinancialCategoryData[],
): FinancialAppendixPayload {
  const dueItems = normalizeFinancialDueItemsForCategories(row.dueItems, categories);
  const activeTabRaw = String(row.activeTab ?? '');
  const activeTab = categories.some((item) => item.id === activeTabRaw) ? activeTabRaw : getDefaultFinancialActiveTab(categories);

  return {
    activeTab,
    categories,
    dueItems,
  };
}

function normalizeDeliveryDatePayload(input: unknown): AppendixDeliveryDatePayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  return {
    previousDate: String(row.previousDate ?? ''),
    nextDate: String(row.nextDate ?? ''),
    reason: String(row.reason ?? ''),
  };
}

function sanitizeMoneyString(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(Math.max(0, Math.round(value)));
  if (typeof value !== 'string') return '';
  const digits = value.replace(/\D/g, '');
  return digits ? String(Number(digits)) : '';
}

function createInitialLoanPayload(contractLoanAmount = ''): AppendixLoanPayload {
  return {
    flowStep: 'status',
    paymentStatus: 'unselected',
    contractLoanAmount,
    allocations: {
      adjustment: '',
      landscaping: '',
      utilities: '',
    },
    loanAmount: '',
    loanTiming: 'contract-date',
    loanReceivedDate: '',
    repaymentTiming: 'undated',
    repaymentSettledBy: 'seller',
    repaymentFirstInstallmentDate: '',
    loanGracePeriodUnit: 'month',
    loanGracePeriodValue: '',
    loanBankInterestEnabled: false,
    loanBankInterestRate: '',
    loanBankFeePayer: 'buyer',
    loanBankFeeBankPolicyEnabled: false,
    loanBankFeeMode: 'fixed',
    loanBankFeeValue: '',
    loanParticipationPayer: 'buyer',
    loanParticipationBankPolicyEnabled: false,
    loanParticipationRate: '',
    loanExpertPayer: 'buyer',
    loanExpertBankPolicyEnabled: false,
    loanExpertRate: '',
    loanPriorityBondPayer: 'buyer',
    loanPriorityBondBankPolicyEnabled: false,
    loanPriorityBondRate: '',
    loanPenaltyEnabled: false,
    loanPenaltyMode: 'progressive',
    loanPenaltyPeriod: 'daily',
    loanPenaltyFixedAmount: '',
    loanPenaltyPercent: '',
    loanPenaltyBankPercent: '',
    loanPenaltyGraceDays: '',
    loanPenaltyRoundingMode: '0.0',
    loanPenaltyExtraFeeEnabled: false,
    loanPenaltyExtraFeeMode: 'percent',
    loanPenaltyExtraFeeValue: '',
    loanPenaltyProgressiveRows: [
      { fromDay: '1', toDay: '30', rate: '0.5' },
      { fromDay: '31', toDay: '60', rate: '1' },
      { fromDay: '61', toDay: '120', rate: '1.5' },
      { fromDay: '121', toDay: '999', rate: '2' },
    ],
    loanDiscountEnabled: false,
    loanDiscountMode: 'amount',
    loanDiscountMinValue: '',
    loanDiscountMaxValue: '',
    loanDiscountConditionEnabled: true,
    loanDiscountConditionMaxDelayCount: '',
    loanDiscountConditionGraceDays: '10',
    loanDiscountConditionDueKeys: ['all-dues'],
    loanDiscountConditionInstallmentAllowed: false,
    loanDiscountConditionPenaltyEnabled: false,
    loanDiscountSettlementTargets: ['unit-handover'],
    loanDiscountManagerApprovalEnabled: false,
    loanDiscountApprovalThreshold: '',
    loanForgivenessEnabled: true,
    loanForgivenessMode: 'amount',
    loanForgivenessMinValue: '',
    loanForgivenessMaxValue: '',
    loanForgivenessOutsideBuyerControlEnabled: true,
    loanForgivenessManagerApprovalEnabled: true,
    loanForgivenessApprovalThreshold: '',
    loanRemainingDebtPrepaymentDueItems: [],
    loanRemainingDebtInstallmentDueItems: [],
    loanRemainingDebtLateInstallmentDueItems: [],
    loanRemainingDebtPrepaymentAmount: '',
    loanRemainingDebtPrepaymentCount: '',
    loanRemainingDebtPrepaymentTotal: '',
    loanRemainingDebtInstallmentAmount: '',
    loanRemainingDebtInstallmentCount: '',
    loanRemainingDebtInstallmentTotal: '',
    loanRemainingDebtLateInstallmentCount: '',
    loanRemainingDebtLateInstallmentTotal: '',
    loanRemainingDebtUnitDeliveryAmount: '',
    loanRemainingDebtDocumentDeliveryAmount: '',
    selectedBank: DEFAULT_LOAN_BANK,
  };
}

function extractContractLoanAmount(contract: Contract | null | undefined) {
  const categories = Array.isArray(contract?.data?.financial?.categories) ? contract?.data?.financial?.categories : [];
  const loanCategory = categories.find((item) => item.id === 'loan');
  return sanitizeMoneyString(loanCategory?.capAmount ?? 0);
}

function normalizeLoanPayload(input: unknown): AppendixLoanPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const initial = createInitialLoanPayload();
  const paymentStatus = APPENDIX_LOAN_PAYMENT_STATUSES.has(row.paymentStatus as AppendixLoanPayload['paymentStatus'])
    ? (row.paymentStatus as AppendixLoanPayload['paymentStatus'])
    : initial.paymentStatus;
  const requestedFlowStep = row.flowStep === 'details' ? 'details' : 'status';

  return {
    flowStep: paymentStatus === 'less' && requestedFlowStep === 'details' ? 'details' : 'status',
    paymentStatus,
    contractLoanAmount: sanitizeMoneyString(row.contractLoanAmount),
    allocations: {
      adjustment: sanitizeMoneyString((row.allocations as Record<string, unknown> | undefined)?.adjustment),
      landscaping: sanitizeMoneyString((row.allocations as Record<string, unknown> | undefined)?.landscaping),
      utilities: sanitizeMoneyString((row.allocations as Record<string, unknown> | undefined)?.utilities),
    },
    loanAmount: sanitizeMoneyString(row.loanAmount),
    loanTiming: APPENDIX_LOAN_TIMINGS.has(row.loanTiming as AppendixLoanPayload['loanTiming'])
      ? (row.loanTiming as AppendixLoanPayload['loanTiming'])
      : initial.loanTiming,
    loanReceivedDate: String(row.loanReceivedDate ?? ''),
    repaymentTiming: APPENDIX_LOAN_REPAYMENT_TIMINGS.has(row.repaymentTiming as AppendixLoanPayload['repaymentTiming'])
      ? (row.repaymentTiming as AppendixLoanPayload['repaymentTiming'])
      : initial.repaymentTiming,
    repaymentSettledBy: row.repaymentSettledBy === 'buyer' ? 'buyer' : 'seller',
    repaymentFirstInstallmentDate: String(row.repaymentFirstInstallmentDate ?? ''),
    loanGracePeriodUnit: row.loanGracePeriodUnit === 'day' ? 'day' : 'month',
    loanGracePeriodValue: sanitizeMoneyString(row.loanGracePeriodValue),
    loanBankInterestEnabled: typeof row.loanBankInterestEnabled === 'boolean' ? row.loanBankInterestEnabled : initial.loanBankInterestEnabled,
    loanBankInterestRate: sanitizeMoneyString(row.loanBankInterestRate),
    loanBankFeePayer: row.loanBankFeePayer === 'seller' ? 'seller' : 'buyer',
    loanBankFeeBankPolicyEnabled:
      typeof row.loanBankFeeBankPolicyEnabled === 'boolean' ? row.loanBankFeeBankPolicyEnabled : initial.loanBankFeeBankPolicyEnabled,
    loanBankFeeMode: row.loanBankFeeMode === 'percent' || row.loanBankFeeMode === 'combined' ? row.loanBankFeeMode : 'fixed',
    loanBankFeeValue: sanitizeMoneyString(row.loanBankFeeValue),
    loanParticipationPayer: row.loanParticipationPayer === 'seller' ? 'seller' : 'buyer',
    loanParticipationBankPolicyEnabled:
      typeof row.loanParticipationBankPolicyEnabled === 'boolean'
        ? row.loanParticipationBankPolicyEnabled
        : initial.loanParticipationBankPolicyEnabled,
    loanParticipationRate: sanitizeMoneyString(row.loanParticipationRate),
    loanExpertPayer: row.loanExpertPayer === 'seller' ? 'seller' : 'buyer',
    loanExpertBankPolicyEnabled:
      typeof row.loanExpertBankPolicyEnabled === 'boolean' ? row.loanExpertBankPolicyEnabled : initial.loanExpertBankPolicyEnabled,
    loanExpertRate: sanitizeMoneyString(row.loanExpertRate),
    loanPriorityBondPayer: row.loanPriorityBondPayer === 'seller' ? 'seller' : 'buyer',
    loanPriorityBondBankPolicyEnabled:
      typeof row.loanPriorityBondBankPolicyEnabled === 'boolean'
        ? row.loanPriorityBondBankPolicyEnabled
        : initial.loanPriorityBondBankPolicyEnabled,
    loanPriorityBondRate: sanitizeMoneyString(row.loanPriorityBondRate),
    loanPenaltyEnabled: typeof row.loanPenaltyEnabled === 'boolean' ? row.loanPenaltyEnabled : initial.loanPenaltyEnabled,
    loanPenaltyMode:
      row.loanPenaltyMode === 'progressive' ||
      row.loanPenaltyMode === 'contract-percent' ||
      row.loanPenaltyMode === 'debt-percent' ||
      row.loanPenaltyMode === 'fixed'
        ? row.loanPenaltyMode
        : initial.loanPenaltyMode,
    loanPenaltyPeriod: row.loanPenaltyPeriod === 'monthly' ? 'monthly' : 'daily',
    loanPenaltyFixedAmount: sanitizeMoneyString(row.loanPenaltyFixedAmount),
    loanPenaltyPercent: sanitizeMoneyString(row.loanPenaltyPercent),
    loanPenaltyBankPercent: sanitizeMoneyString(row.loanPenaltyBankPercent),
    loanPenaltyGraceDays: sanitizeMoneyString(row.loanPenaltyGraceDays),
    loanPenaltyRoundingMode: typeof row.loanPenaltyRoundingMode === 'string' && row.loanPenaltyRoundingMode.trim() ? row.loanPenaltyRoundingMode : initial.loanPenaltyRoundingMode,
    loanPenaltyExtraFeeEnabled:
      typeof row.loanPenaltyExtraFeeEnabled === 'boolean' ? row.loanPenaltyExtraFeeEnabled : initial.loanPenaltyExtraFeeEnabled,
    loanPenaltyExtraFeeMode: row.loanPenaltyExtraFeeMode === 'fixed' ? 'fixed' : 'percent',
    loanPenaltyExtraFeeValue: sanitizeMoneyString(row.loanPenaltyExtraFeeValue),
    loanPenaltyProgressiveRows: Array.isArray(row.loanPenaltyProgressiveRows)
      ? row.loanPenaltyProgressiveRows.slice(0, 4).map((item, index) => {
          const source = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
          const fallback = initial.loanPenaltyProgressiveRows[index] ?? { fromDay: '', toDay: '', rate: '' };
          return {
            fromDay: sanitizeMoneyString(source.fromDay ?? fallback.fromDay),
            toDay: sanitizeMoneyString(source.toDay ?? fallback.toDay),
            rate: sanitizeMoneyString(source.rate ?? fallback.rate),
          };
        })
      : initial.loanPenaltyProgressiveRows,
    loanDiscountEnabled: typeof row.loanDiscountEnabled === 'boolean' ? row.loanDiscountEnabled : initial.loanDiscountEnabled,
    loanDiscountMode: row.loanDiscountMode === 'percent' ? 'percent' : 'amount',
    loanDiscountMinValue: sanitizeMoneyString(row.loanDiscountMinValue),
    loanDiscountMaxValue: sanitizeMoneyString(row.loanDiscountMaxValue),
    loanDiscountConditionEnabled:
      typeof row.loanDiscountConditionEnabled === 'boolean' ? row.loanDiscountConditionEnabled : initial.loanDiscountConditionEnabled,
    loanDiscountConditionMaxDelayCount: sanitizeMoneyString(row.loanDiscountConditionMaxDelayCount),
    loanDiscountConditionGraceDays: sanitizeMoneyString(row.loanDiscountConditionGraceDays),
    loanDiscountConditionDueKeys: Array.isArray(row.loanDiscountConditionDueKeys)
      ? row.loanDiscountConditionDueKeys.map((item) => String(item)).filter(Boolean)
      : initial.loanDiscountConditionDueKeys,
    loanDiscountConditionInstallmentAllowed:
      typeof row.loanDiscountConditionInstallmentAllowed === 'boolean'
        ? row.loanDiscountConditionInstallmentAllowed
        : initial.loanDiscountConditionInstallmentAllowed,
    loanDiscountConditionPenaltyEnabled:
      typeof row.loanDiscountConditionPenaltyEnabled === 'boolean'
        ? row.loanDiscountConditionPenaltyEnabled
        : initial.loanDiscountConditionPenaltyEnabled,
    loanDiscountSettlementTargets: Array.isArray(row.loanDiscountSettlementTargets)
      ? row.loanDiscountSettlementTargets.map((item) => String(item)).filter(Boolean)
      : initial.loanDiscountSettlementTargets,
    loanDiscountManagerApprovalEnabled:
      typeof row.loanDiscountManagerApprovalEnabled === 'boolean'
        ? row.loanDiscountManagerApprovalEnabled
        : initial.loanDiscountManagerApprovalEnabled,
    loanDiscountApprovalThreshold: sanitizeMoneyString(row.loanDiscountApprovalThreshold),
    loanForgivenessEnabled: typeof row.loanForgivenessEnabled === 'boolean' ? row.loanForgivenessEnabled : initial.loanForgivenessEnabled,
    loanForgivenessMode: row.loanForgivenessMode === 'percent' ? 'percent' : 'amount',
    loanForgivenessMinValue: sanitizeMoneyString(row.loanForgivenessMinValue),
    loanForgivenessMaxValue: sanitizeMoneyString(row.loanForgivenessMaxValue),
    loanForgivenessOutsideBuyerControlEnabled:
      typeof row.loanForgivenessOutsideBuyerControlEnabled === 'boolean'
        ? row.loanForgivenessOutsideBuyerControlEnabled
        : initial.loanForgivenessOutsideBuyerControlEnabled,
    loanForgivenessManagerApprovalEnabled:
      typeof row.loanForgivenessManagerApprovalEnabled === 'boolean'
        ? row.loanForgivenessManagerApprovalEnabled
        : initial.loanForgivenessManagerApprovalEnabled,
    loanForgivenessApprovalThreshold: sanitizeMoneyString(row.loanForgivenessApprovalThreshold),
    loanRemainingDebtPrepaymentDueItems: Array.isArray(row.loanRemainingDebtPrepaymentDueItems)
      ? row.loanRemainingDebtPrepaymentDueItems
          .map((item) => {
            const source = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            return {
              id: String(source.id ?? ''),
              categoryId: String(source.categoryId ?? 'loan-remaining-prepayment'),
              title: String(source.title ?? ''),
              amount: Number(source.amount ?? 0),
              dueDate: String(source.dueDate ?? ''),
            };
          })
          .filter((item) => item.id && item.title)
      : [],
    loanRemainingDebtInstallmentDueItems: Array.isArray(row.loanRemainingDebtInstallmentDueItems)
      ? row.loanRemainingDebtInstallmentDueItems
          .map((item) => {
            const source = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            return {
              id: String(source.id ?? ''),
              categoryId: String(source.categoryId ?? 'loan-remaining-installment'),
              title: String(source.title ?? ''),
              amount: Number(source.amount ?? 0),
              dueDate: String(source.dueDate ?? ''),
            };
          })
          .filter((item) => item.id && item.title)
      : [],
    loanRemainingDebtLateInstallmentDueItems: Array.isArray(row.loanRemainingDebtLateInstallmentDueItems)
      ? row.loanRemainingDebtLateInstallmentDueItems
          .map((item) => {
            const source = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            return {
              id: String(source.id ?? ''),
              categoryId: String(source.categoryId ?? 'loan-remaining-late-installment'),
              title: String(source.title ?? ''),
              amount: Number(source.amount ?? 0),
              dueDate: String(source.dueDate ?? ''),
            };
          })
          .filter((item) => item.id && item.title)
      : [],
    loanRemainingDebtPrepaymentAmount: sanitizeMoneyString(row.loanRemainingDebtPrepaymentAmount),
    loanRemainingDebtPrepaymentCount: sanitizeMoneyString(row.loanRemainingDebtPrepaymentCount),
    loanRemainingDebtPrepaymentTotal: sanitizeMoneyString(row.loanRemainingDebtPrepaymentTotal),
    loanRemainingDebtInstallmentAmount: sanitizeMoneyString(row.loanRemainingDebtInstallmentAmount),
    loanRemainingDebtInstallmentCount: sanitizeMoneyString(row.loanRemainingDebtInstallmentCount),
    loanRemainingDebtInstallmentTotal: sanitizeMoneyString(row.loanRemainingDebtInstallmentTotal),
    loanRemainingDebtLateInstallmentCount: sanitizeMoneyString(row.loanRemainingDebtLateInstallmentCount),
    loanRemainingDebtLateInstallmentTotal: sanitizeMoneyString(row.loanRemainingDebtLateInstallmentTotal),
    loanRemainingDebtUnitDeliveryAmount: sanitizeMoneyString(row.loanRemainingDebtUnitDeliveryAmount),
    loanRemainingDebtDocumentDeliveryAmount: sanitizeMoneyString(row.loanRemainingDebtDocumentDeliveryAmount),
    selectedBank: typeof row.selectedBank === 'string' && row.selectedBank.trim() ? row.selectedBank.trim() : initial.selectedBank,
  };
}

function normalizePartiesPayload(input: unknown): AppendixPartiesPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  return {
    shareMode: ((row.shareMode ?? 'dang') as ShareMode) === 'percent' ? 'percent' : 'dang',
    parties: Array.isArray(row.parties) ? row.parties : [],
  };
}

function normalizeAdjustmentPayload(input: unknown): AppendixAdjustmentPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  return normalizeFinancialPayload(row, normalizeFixedLineCategories(row.categories, APPENDIX_ADJUSTMENT_LINE_ID, APPENDIX_ADJUSTMENT_TITLE));
}

function normalizeContractBaseCostsPayload(input: unknown): AppendixContractBaseCostsPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  return normalizeFinancialPayload(row, normalizePrimaryContractCategories(row.categories));
}

function normalizeSideCostsPayload(input: unknown): AppendixSideCostsPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  return normalizeFinancialPayload(row, normalizeSideCostCategories(row.categories));
}

function normalizeStringList(input: unknown, validOptions: readonly string[]) {
  const validSet = new Set(validOptions);
  const source = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(input) as unknown;
            return Array.isArray(parsed) ? parsed : [input];
          } catch {
            return input.split('||');
          }
        })()
      : [];

  return source
    .map((item) => String(item ?? '').trim())
    .filter((item): item is string => Boolean(item) && validSet.has(item))
    .filter((item, index, arr) => arr.indexOf(item) === index);
}

function normalizeTechnicalSpecGroup(input: unknown, index: number): AppendixTechnicalSpecGroup | null {
  if (!input || typeof input !== 'object') return null;

  const raw = input as Record<string, unknown>;
  const title = typeof raw.title === 'string' ? raw.title.trim() : typeof raw.name === 'string' ? raw.name.trim() : '';
  const fromSelectedIds = Array.isArray(raw.selectedSpecIds)
    ? raw.selectedSpecIds.map((item) => String(item ?? '').trim()).filter(Boolean)
    : [];
  const fromSpecIds = Array.isArray(raw.specIds) ? raw.specIds.map((item) => String(item ?? '').trim()).filter(Boolean) : [];
  const fromItems = Array.isArray(raw.items)
    ? raw.items
        .map((item) => (item && typeof item === 'object' ? String((item as Record<string, unknown>).id ?? '').trim() : ''))
        .filter(Boolean)
    : [];
  const legacySingleId = typeof raw.id === 'string' ? raw.id.trim() : '';
  const selectedSpecIds = fromSelectedIds.length ? fromSelectedIds : fromSpecIds.length ? fromSpecIds : fromItems;

  if (!title && !selectedSpecIds.length && !legacySingleId) return null;

  return {
    id: legacySingleId || `group-${index + 1}`,
    title: title || `گروه ${index + 1}`,
    selectedSpecIds: [...new Set(selectedSpecIds.length ? selectedSpecIds : legacySingleId ? [legacySingleId] : [])],
  };
}

export function normalizeTechnicalSpecGroups(input: unknown): AppendixTechnicalSpecGroup[] {
  if (Array.isArray(input)) {
    return input
      .map((item, index) => normalizeTechnicalSpecGroup(item, index))
      .filter((item): item is AppendixTechnicalSpecGroup => Boolean(item));
  }

  if (!input || typeof input !== 'object') return [];

  const raw = input as Record<string, unknown>;
  const directGroups = Array.isArray(raw.specs) ? raw.specs : Array.isArray(raw.groups) ? raw.groups : null;
  if (!directGroups) return [];

  return directGroups
    .map((item, index) => normalizeTechnicalSpecGroup(item, index))
    .filter((item): item is AppendixTechnicalSpecGroup => Boolean(item));
}

function createInitialMaterialSpecsChangePayload(): AppendixMaterialSpecsChangePayload {
  return {
    specs: [],
  };
}

function normalizeMaterialSpecsChangePayload(input: unknown): AppendixMaterialSpecsChangePayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const specs = normalizeTechnicalSpecGroups(row);
  const legacy = {
    changeTypes: normalizeStringList(row.changeTypes, MATERIAL_SPECS_CHANGE_TYPES),
    importanceLevel: String(row.importanceLevel ?? '').trim(),
    comparisonReferences: normalizeStringList(row.comparisonReferences, MATERIAL_SPECS_CHANGE_COMPARISON_REFERENCES),
    equivalentReplacementAllowed: row.equivalentReplacementAllowed === undefined ? undefined : Boolean(row.equivalentReplacementAllowed),
    equivalentReplacementApplied: row.equivalentReplacementApplied === undefined ? undefined : Boolean(row.equivalentReplacementApplied),
    buyerApprovalRequired: row.buyerApprovalRequired === undefined ? undefined : Boolean(row.buyerApprovalRequired),
    buyerApproved: row.buyerApproved === undefined ? undefined : Boolean(row.buyerApproved),
    selectedOutcomes: normalizeStringList(row.selectedOutcomes, MATERIAL_SPECS_CHANGE_OUTCOMES),
    requiredDocuments: normalizeStringList(row.requiredDocuments, MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENTS),
    enforcementEnabled: row.enforcementEnabled === undefined ? undefined : Boolean(row.enforcementEnabled),
    enforcementReason: String(row.enforcementReason ?? '').trim(),
    caseSummary: String(row.caseSummary ?? '').trim(),
    internalNotes: String(row.internalNotes ?? '').trim(),
  };

  return specs.length
    ? { specs }
    : {
        specs: [],
        ...legacy,
      };
}

const DEFAULT_PENALTY_WAIVER_PROGRESSIVE_ROWS: PenaltyProgressiveRowData[] = [
  { id: 'row-1', fromDay: '1', toDay: '4', rate: '0.5' },
  { id: 'row-2', fromDay: '5', toDay: '6', rate: '0.5' },
  { id: 'row-3', fromDay: '7', toDay: '65', rate: '3.3' },
  { id: 'row-4', fromDay: '66', toDay: '', rate: '', openEnded: false },
];

function normalizePenaltyRoundRuleValue(value: unknown): PenaltyRoundRule {
  if (value === '00' || value === '0' || value === '100' || value === '1000') return value;
  return '100';
}

function createInitialPenaltyWaiverPayload(): AppendixPenaltyWaiverPayload {
  return {
    mode: 'fixed',
    period: 'monthly',
    fixedAmount: '100,000',
    penaltyPercent: '0.5',
    bankInterestPercent: '',
    graceDays: '2',
    roundRule: '100',
    extraFeeEnabled: false,
    extraFeeType: 'percent',
    extraFeeAmount: '',
    extraFeeRoundRule: '100',
    progressiveRows: DEFAULT_PENALTY_WAIVER_PROGRESSIVE_ROWS.map((row) => ({ ...row })),
  };
}

function createInitialBuilderPenaltyPayload(): AppendixBuilderPenaltyPayload {
  return normalizeBuilderPenaltyRuleState({
    ...createInitialRuleState('builder-penalty'),
    active: true,
  });
}

function normalizeBuilderPenaltyPayload(input: unknown): AppendixBuilderPenaltyPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const base = input && typeof input === 'object' ? (input as AppendixBuilderPenaltyPayload) : createInitialBuilderPenaltyPayload();
  const active = typeof row.active === 'boolean' ? row.active : true;

  return normalizeBuilderPenaltyRuleState({
    ...base,
    active,
  });
}

type TerminationAppendixSide = 'builder' | 'buyer';

function createInitialTerminationAppendixPayload(side: TerminationAppendixSide): ContractTerminationData {
  const payload = normalizeTerminationPayload(null);
  return {
    ...payload,
    terminationPartyTab: side === 'builder' ? 'seller' : 'buyer',
  };
}

function normalizeTerminationAppendixPayload(side: TerminationAppendixSide, input: unknown): ContractTerminationData {
  const normalized = normalizeTerminationPayload(input as ContractTerminationData | Record<string, unknown> | null);
  return {
    ...normalized,
    terminationPartyTab: side === 'builder' ? 'seller' : 'buyer',
  };
}

function hasEnabledTerminationSections(payload: ContractTerminationData, side: TerminationAppendixSide) {
  return side === 'builder'
    ? Object.values(payload.constructorTerms).some((section) => section.ruleEnabled)
    : Object.values(payload.buyerTerms).some((section) => section.ruleEnabled);
}

function validateTerminationAppendixPayload(payload: ContractTerminationData, side: TerminationAppendixSide) {
  if (!hasEnabledTerminationSections(payload, side)) {
    return side === 'builder'
      ? 'حداقل یک بخش فسخ سازنده را فعال کنید.'
      : 'حداقل یک بخش فسخ خریدار را فعال کنید.';
  }

  return '';
}

function normalizePenaltyWaiverPayload(input: unknown): AppendixPenaltyWaiverPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const initial = createInitialPenaltyWaiverPayload();
  const mode =
    row.mode === 'fixed' || row.mode === 'overdue' || row.mode === 'contract' || row.mode === 'progressive'
      ? (row.mode as PenaltyMode)
      : initial.mode;

  return {
    mode,
    period: row.period === 'daily' || row.period === 'monthly' || row.period === 'yearly' ? (row.period as PenaltyPeriod) : initial.period,
    fixedAmount: sanitizeMoneyString(row.fixedAmount ?? row.amount),
    penaltyPercent: sanitizeDecimalInput(String(row.penaltyPercent ?? '')),
    bankInterestPercent: sanitizeDecimalInput(String(row.bankInterestPercent ?? '')),
    graceDays: sanitizeMoneyString(row.graceDays),
    roundRule: normalizePenaltyRoundRuleValue(row.roundRule),
    extraFeeEnabled: typeof row.extraFeeEnabled === 'boolean' ? row.extraFeeEnabled : initial.extraFeeEnabled,
    extraFeeType: row.extraFeeType === 'fixed' ? 'fixed' : 'percent',
    extraFeeAmount:
      row.extraFeeType === 'fixed'
        ? sanitizeMoneyString(row.extraFeeAmount)
        : sanitizeDecimalInput(String(row.extraFeeAmount ?? '')),
    extraFeeRoundRule: normalizePenaltyRoundRuleValue(row.extraFeeRoundRule),
    progressiveRows: normalizeProgressiveRows(
      (Array.isArray(row.progressiveRows) && row.progressiveRows.length ? row.progressiveRows : initial.progressiveRows).map((item, index) => {
        const source = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
        const fallback = initial.progressiveRows[index] ?? { id: `row-${index + 1}`, fromDay: '', toDay: '', rate: '' };
        return {
          id: String(source.id ?? fallback.id ?? `row-${index + 1}`),
          fromDay: String(source.fromDay ?? fallback.fromDay ?? ''),
          toDay: String(source.toDay ?? fallback.toDay ?? ''),
          rate: String(source.rate ?? fallback.rate ?? ''),
          openEnded: Boolean(source.openEnded),
        };
      }),
    ),
  };
}

function hasPositiveMoneyValue(value: string) {
  return Number(value.replace(/,/g, '')) > 0;
}

function validatePenaltyWaiverPayload(payload: AppendixPenaltyWaiverPayload) {
  if (payload.mode === 'fixed' && !hasPositiveMoneyValue(payload.fixedAmount)) {
    return 'مبلغ ثابت جریمه را وارد کنید.';
  }

  if ((payload.mode === 'overdue' || payload.mode === 'contract') && !(Number(payload.penaltyPercent) > 0)) {
    return 'درصد جریمه را وارد کنید.';
  }

  if (!(Number(payload.graceDays) >= 0)) {
    return 'مهلت تنفس معتبر نیست.';
  }

  if (payload.mode === 'progressive') {
    const validation = validateProgressiveRows(payload.progressiveRows);
    if (!validation.ok) {
      return validation.message;
    }
  }

  if (payload.extraFeeEnabled && payload.extraFeeType === 'fixed' && !hasPositiveMoneyValue(payload.extraFeeAmount)) {
    return 'مبلغ هزینه دیرکرد را وارد کنید.';
  }

  if (payload.extraFeeEnabled && payload.extraFeeType !== 'fixed' && !(Number(payload.extraFeeAmount) > 0)) {
    return 'مبلغ هزینه دیرکرد را وارد کنید.';
  }

  return '';
}

function createInitialGenericPayload(tag: SupportedAppendixTagKey): AppendixGenericPayload {
  return {
    title: getAppendixTagTitle(tag),
    detailText: '',
    amount: '',
    previousDate: '',
    nextDate: '',
    notes: '',
  };
}

function normalizeGenericPayload(tag: SupportedAppendixTagKey, input: unknown): AppendixGenericPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const initial = createInitialGenericPayload(tag);
  return {
    title: String(row.title ?? initial.title).trim() || initial.title,
    detailText: String(row.detailText ?? '').trim(),
    amount: sanitizeMoneyString(row.amount),
    previousDate: String(row.previousDate ?? '').trim(),
    nextDate: String(row.nextDate ?? '').trim(),
    notes: String(row.notes ?? '').trim(),
  };
}

function validateGenericPayload(tag: SupportedAppendixTagKey, payload: AppendixGenericPayload) {
  if (!payload.title.trim()) {
    return 'عنوان متمم را وارد کنید.';
  }

  if (GENERIC_DATE_APPENDIX_TAGS.includes(tag as (typeof GENERIC_DATE_APPENDIX_TAGS)[number]) && !payload.nextDate.trim()) {
    return 'تاریخ جدید را وارد کنید.';
  }

  if (
    GENERIC_FINANCIAL_APPENDIX_TAGS.includes(tag as (typeof GENERIC_FINANCIAL_APPENDIX_TAGS)[number]) &&
    !payload.amount.trim() &&
    !payload.detailText.trim()
  ) {
    return 'مبلغ یا توضیح مالی را وارد کنید.';
  }

  if (GENERIC_CONDITION_APPENDIX_TAGS.includes(tag as (typeof GENERIC_CONDITION_APPENDIX_TAGS)[number]) && !payload.detailText.trim()) {
    return 'شرح تغییر را وارد کنید.';
  }

  if (!payload.detailText.trim() && !payload.amount.trim() && !payload.previousDate.trim() && !payload.nextDate.trim() && !payload.notes.trim()) {
    return 'حداقل یک اطلاعات تکمیلی برای متمم وارد کنید.';
  }

  return '';
}

function extractContractBaseCategories(financial: ContractFinancialData | null) {
  if (!financial) return createInitialFinancialCategories();
  const source = Array.isArray(financial.categories) ? financial.categories : [];
  const normalized = normalizePrimaryContractCategories(source);
  return normalized.length ? normalized : createInitialFinancialCategories();
}

function extractContractBaseDueItems(financial: ContractFinancialData | null, categories: FinancialCategoryData[]) {
  if (!financial) return [];
  return normalizeFinancialDueItemsForCategories(financial.dueItems, categories);
}

function extractSideCostCategories(financial: ContractFinancialData | null) {
  if (!financial) return [];
  return normalizeSideCostCategories(financial.categories);
}

function extractSideCostDueItems(financial: ContractFinancialData | null, categories: FinancialCategoryData[]) {
  if (!financial) return [];
  return normalizeFinancialDueItemsForCategories(financial.dueItems, categories);
}

function buildContractBasePayload(financial: ContractFinancialData | null): AppendixContractBaseCostsPayload {
  const categories = extractContractBaseCategories(financial);
  return {
    activeTab: getDefaultFinancialActiveTab(categories),
    categories,
    dueItems: extractContractBaseDueItems(financial, categories),
  };
}

function buildSideCostsPayload(financial: ContractFinancialData | null): AppendixSideCostsPayload {
  const categories = extractSideCostCategories(financial);
  return {
    activeTab: getDefaultFinancialActiveTab(categories),
    categories,
    dueItems: extractSideCostDueItems(financial, categories),
  };
}

function validateCommonFinancialPayload(payload: FinancialAppendixPayload) {
  const validCategoryIds = new Set(payload.categories.map((item) => item.id));
  const invalidDueItem = payload.dueItems.find(
    (item) => !validCategoryIds.has(item.categoryId) || !String(item.title ?? '').trim() || !String(item.dueDate ?? '').trim() || Number(item.amount ?? 0) <= 0,
  );
  return invalidDueItem ? 'اطلاعات سررسیدهای مالی معتبر نیست.' : '';
}

function validateFixedLinePayload(payload: FinancialAppendixPayload, lineId: string, title: string) {
  const header = payload.categories.find((item) => item.id === lineId);
  if (!header) return `ردیف مالی ${title} ثبت نشده است.`;
  if (String(header.name).trim() !== title) return `نام ردیف مالی ${title} قابل تغییر نیست.`;

  const expectedCategoryIds = new Set(buildFinancialLineCategories({ lineId, title }).map((item) => item.id));
  for (const category of payload.categories) {
    if (!expectedCategoryIds.has(category.id)) {
      return `ساختار ردیف مالی ${title} معتبر نیست.`;
    }
  }

  return validateCommonFinancialPayload(payload);
}

function validateContractBaseCostsPayload(payload: AppendixContractBaseCostsPayload) {
  const principal = payload.categories.find((item) => item.id === 'principal');
  if (!principal) return 'ردیف مالی اصل قرارداد ثبت نشده است.';
  if (String(principal.name).trim() !== APPENDIX_CONTRACT_BASE_TITLE) return 'نام ردیف مالی اصل قرارداد قابل تغییر نیست.';

  for (const category of payload.categories) {
    if (!PRIMARY_CATEGORY_ID_SET.has(category.id)) {
      return 'ساختار ردیف مالی اصل قرارداد معتبر نیست.';
    }
  }

  return validateCommonFinancialPayload(payload);
}

function validateSideCostsPayload(payload: AppendixSideCostsPayload) {
  const invalidCategory = payload.categories.find((category) => {
    if (category.id === 'principal' || PRIMARY_CATEGORY_ID_SET.has(category.id)) return true;
    return !isFinancialLineHeaderCategoryId(category.id) && !isFinancialLineSubtreeCategoryId(category.id) && !isLegacyCustomRootCategoryId(category.id);
  });
  if (invalidCategory) return 'ساختار هزینه های جانبی معتبر نیست.';
  return validateCommonFinancialPayload(payload);
}

export function createInitialAppendixPayload(tag: SupportedAppendixTagKey): SupportedAppendixPayload {
  switch (tag) {
    case 'loan':
      return createInitialLoanPayload();
    case 'unit-delivery-date':
      return { previousDate: '', nextDate: '', reason: '' };
    case 'first-party':
    case 'second-party':
      return { shareMode: 'dang', parties: [] };
    case 'adjustment':
      return createEmptyFinancialPayload(buildFinancialLineCategories({ lineId: APPENDIX_ADJUSTMENT_LINE_ID, title: APPENDIX_ADJUSTMENT_TITLE }));
    case 'contract-base-costs':
      return createEmptyFinancialPayload(createInitialFinancialCategories());
    case 'side-costs':
      return createEmptyFinancialPayload([]);
    case 'material-specs-change':
      return createInitialMaterialSpecsChangePayload();
    case 'penalty-waiver':
      return createInitialPenaltyWaiverPayload();
    case 'builder-penalty':
      return createInitialBuilderPenaltyPayload();
    case 'builder-cancellation':
      return createInitialTerminationAppendixPayload('builder');
    case 'buyer-cancellation':
      return createInitialTerminationAppendixPayload('buyer');
    case 'unit-delivery':
    case 'forgiveness':
    case 'contract-costs':
    case 'workshop-conditions':
    case 'arbitration':
    case 'due-dates':
    case 'commitment-date':
      return createInitialGenericPayload(tag);
  }
}

export function normalizeAppendixPayload(tag: SupportedAppendixTagKey, input: unknown): SupportedAppendixPayload {
  switch (tag) {
    case 'loan':
      return normalizeLoanPayload(input);
    case 'unit-delivery-date':
      return normalizeDeliveryDatePayload(input);
    case 'first-party':
    case 'second-party':
      return normalizePartiesPayload(input);
    case 'adjustment':
      return normalizeAdjustmentPayload(input);
    case 'contract-base-costs':
      return normalizeContractBaseCostsPayload(input);
    case 'side-costs':
      return normalizeSideCostsPayload(input);
    case 'material-specs-change':
      return normalizeMaterialSpecsChangePayload(input);
    case 'penalty-waiver':
      return normalizePenaltyWaiverPayload(input);
    case 'builder-penalty':
      return normalizeBuilderPenaltyPayload(input);
    case 'builder-cancellation':
      return normalizeTerminationAppendixPayload('builder', input);
    case 'buyer-cancellation':
      return normalizeTerminationAppendixPayload('buyer', input);
    case 'unit-delivery':
    case 'forgiveness':
    case 'contract-costs':
    case 'workshop-conditions':
    case 'arbitration':
    case 'due-dates':
    case 'commitment-date':
      return normalizeGenericPayload(tag, input);
  }
}

export function isSupportedAppendixPayloadTag(tag: AppendixTagKey): tag is SupportedAppendixTagKey {
  return isSupportedAppendixTag(tag);
}

export function getContractBaselinePayload(tag: SupportedAppendixTagKey, contract: Contract): SupportedAppendixPayload {
  if (tag === 'loan') {
    return createInitialLoanPayload(extractContractLoanAmount(contract));
  }

  if (tag === 'unit-delivery-date') {
    return {
      previousDate: String(contract.data.subject?.deliveryDate ?? ''),
      nextDate: '',
      reason: '',
    };
  }

  if (tag === 'first-party' || tag === 'second-party') {
    return {
      shareMode: tag === 'first-party' ? contract.data.parties?.partyOneMode ?? 'dang' : contract.data.parties?.partyTwoMode ?? 'dang',
      parties: tag === 'first-party' ? contract.data.parties?.partyOne ?? [] : contract.data.parties?.partyTwo ?? [],
    };
  }

  if (tag === 'adjustment') {
    return createInitialAppendixPayload('adjustment');
  }

  if (tag === 'contract-base-costs') {
    return buildContractBasePayload(getFinancialData(contract));
  }

  if (tag === 'material-specs-change') {
    return createInitialMaterialSpecsChangePayload();
  }

  if (tag === 'penalty-waiver') {
    return createInitialPenaltyWaiverPayload();
  }

  if (tag === 'builder-penalty') {
    return createInitialBuilderPenaltyPayload();
  }

  if (tag === 'builder-cancellation') {
    const baseline = normalizeTerminationPayload(contract.data?.termination ?? null);
    return {
      ...baseline,
      terminationPartyTab: 'seller',
    };
  }

  if (tag === 'buyer-cancellation') {
    const baseline = normalizeTerminationPayload(contract.data?.termination ?? null);
    return {
      ...baseline,
      terminationPartyTab: 'buyer',
    };
  }

  if (
    GENERIC_APPENDIX_TAG_SET.has(tag)
  ) {
    return createInitialGenericPayload(tag);
  }

  return buildSideCostsPayload(getFinancialData(contract));
}

export function getAppendixBaselinePayload(tag: SupportedAppendixTagKey, appendix: ContractAppendix): SupportedAppendixPayload | null {
  const item = appendix.items.find((entry) => entry.tagKey === tag);
  if (!item) return null;
  return normalizeAppendixPayload(tag, item.payload);
}

export function validateAdjustmentPayload(payload: AppendixAdjustmentPayload): string {
  return validateFixedLinePayload(payload, APPENDIX_ADJUSTMENT_LINE_ID, APPENDIX_ADJUSTMENT_TITLE);
}

function validateLoanPayload(payload: AppendixLoanPayload): string {
  if (payload.paymentStatus === 'unselected') {
    return 'وضعیت پرداخت بانک در زمان عقد قرارداد را مشخص کنید.';
  }

  if (payload.paymentStatus !== 'less') return '';

  if (payload.flowStep !== 'details') {
    return 'جزئیات وام را برای حالت پرداخت کمتر از مبلغ قرارداد تکمیل کنید.';
  }

  if (!sanitizeMoneyString(payload.loanAmount)) {
    return 'مبلغ وام دریافتی در الحاقیه وام را وارد کنید.';
  }

  if (!payload.selectedBank.trim()) {
    return 'بانک عامل وام را انتخاب کنید.';
  }

  if (payload.loanTiming === 'before-contract' || payload.loanTiming === 'dated') {
    if (!payload.loanReceivedDate.trim()) {
      return 'برای زمان دریافت انتخاب‌شده، تاریخ دریافت وام را ثبت کنید.';
    }
  }

  if (
    payload.repaymentTiming === 'before-contract-started' ||
    payload.repaymentTiming === 'with-appendix-contract' ||
    payload.repaymentTiming === 'with-contract-bank-installments'
  ) {
    if (!payload.repaymentFirstInstallmentDate.trim()) {
      return 'برای این حالت، تاریخ شروع اولین قسط را ثبت کنید.';
    }
  }

  return '';
}

function validateMaterialSpecsChangePayload(payload: AppendixMaterialSpecsChangePayload): string {
  return '';
}

export function validateAppendixPayload(tag: SupportedAppendixTagKey, payload: SupportedAppendixPayload): string {
  if (tag === 'loan') {
    return validateLoanPayload(payload as AppendixLoanPayload);
  }

  if (tag === 'unit-delivery-date') {
    const row = payload as AppendixDeliveryDatePayload;
    if (!row.nextDate.trim()) {
      return 'برای تاریخ تحویل واحد، تاریخ جدید را وارد کنید.';
    }
    return '';
  }

  if (tag === 'first-party' || tag === 'second-party') {
    const row = payload as AppendixPartiesPayload;
    if (!row.parties.length || !validateShares(row.parties, row.shareMode).valid) {
      return 'اطلاعات طرفین متمم کامل یا معتبر نیست.';
    }
    return '';
  }

  if (tag === 'adjustment') {
    return validateAdjustmentPayload(payload as AppendixAdjustmentPayload);
  }

  if (tag === 'contract-base-costs') {
    return validateContractBaseCostsPayload(payload as AppendixContractBaseCostsPayload);
  }

  if (tag === 'material-specs-change') {
    return validateMaterialSpecsChangePayload(payload as AppendixMaterialSpecsChangePayload);
  }

  if (tag === 'penalty-waiver') {
    return validatePenaltyWaiverPayload(payload as AppendixPenaltyWaiverPayload);
  }

  if (tag === 'builder-penalty') {
    const validation = validateBuilderPenaltyRuleState(payload as AppendixBuilderPenaltyPayload);
    return validation.ok ? '' : validation.message;
  }

  if (tag === 'builder-cancellation') {
    return validateTerminationAppendixPayload(payload as ContractTerminationData, 'builder');
  }

  if (tag === 'buyer-cancellation') {
    return validateTerminationAppendixPayload(payload as ContractTerminationData, 'buyer');
  }

  if (GENERIC_APPENDIX_TAG_SET.has(tag)) {
    return validateGenericPayload(tag, payload as AppendixGenericPayload);
  }

  return validateSideCostsPayload(payload as AppendixSideCostsPayload);
}
