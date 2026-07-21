import {
  normalizeRuleState,
  type ContractRuleId,
  type ContractRuleState,
} from './businessContractRules';
import { resolvePrepaymentAmountReference } from './contractSettingsHints';
import { DISCOUNT_GROUPS, ITEMIZED_DISCOUNT_ENTRIES, WHOLE_DISCOUNT_ENTRY } from '../(panel)/contracts/new/_components/discountsConfig';
import { PENALTY_ITEMS } from '../(panel)/contracts/new/_components/penaltiesConfig';
import type {
  ContractDiscountsData,
  ContractFinancialData,
  ContractPenaltiesData,
  DiscountRuleData,
  DiscountScope,
  DiscountValueMode,
  PenaltyExtraFeeType,
  PenaltyMode,
  PenaltyPeriod,
  PenaltyRoundRule,
  PenaltyRuleData,
} from '../types/contract';

const BOOTSTRAP_FINANCIAL_CATEGORIES = [
  { id: 'principal', name: 'اصل قرارداد', requiresDue: false },
  { id: 'advance', name: 'پیش‌پرداخت', requiresDue: true },
  { id: 'installment', name: 'اقساط', requiresDue: true },
  { id: 'loan', name: 'وام بانکی', requiresDue: false },
  { id: 'handover', name: 'تحویل واحد', requiresDue: false },
  { id: 'document', name: 'تحویل سند', requiresDue: false },
] as const;

const DEFAULT_PROGRESSIVE_ROWS = [
  { id: 'row-1', fromDay: '1', toDay: '4', rate: '0.5' },
  { id: 'row-2', fromDay: '5', toDay: '6', rate: '0.5' },
  { id: 'row-3', fromDay: '7', toDay: '65', rate: '3.3' },
  { id: 'row-4', fromDay: '66', toDay: '', rate: '', openEnded: false },
];

export function normalizeDiscountRule(rule: DiscountRuleData): DiscountRuleData {
  const scope = rule.scope === 'itemized' ? 'itemized' : 'whole';
  return {
    ...rule,
    scope,
    entryId: scope === 'itemized' ? rule.entryId || ITEMIZED_DISCOUNT_ENTRIES[0]?.id || '' : WHOLE_DISCOUNT_ENTRY.id,
    valueMode: rule.valueMode === 'percent' ? 'percent' : 'amount',
    enabled: rule.enabled === true,
    minValue: String(rule.minValue ?? ''),
    maxValue: String(rule.maxValue ?? ''),
    conditionNote: String(rule.conditionNote ?? ''),
    conditionConfigured: Boolean(rule.conditionConfigured),
    conditionMaxDelayCount: String(rule.conditionMaxDelayCount ?? ''),
    conditionGraceDays: String(rule.conditionGraceDays ?? ''),
    conditionDueBasis: Array.isArray(rule.conditionDueBasis) && rule.conditionDueBasis.length ? rule.conditionDueBasis : ['all-payment-types'],
    conditionKeepOnDelay: Boolean(rule.conditionKeepOnDelay),
    conditionPenaltyOnDiscount: Boolean(rule.conditionPenaltyOnDiscount),
    conditionSettlementTiming: String(rule.conditionSettlementTiming ?? 'unit-handover'),
    approvalThreshold: String(rule.approvalThreshold ?? ''),
  };
}

export function normalizeDiscountsPayload(data: ContractDiscountsData | null): ContractDiscountsData {
  const typeMap = new Map((data?.types ?? []).map((item) => [item.id, item]));
  const types = DISCOUNT_GROUPS.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    active: typeMap.get(item.id)?.active ?? false,
  }));
  const validTypeIds = new Set(types.map((item) => item.id));
  const rules = (data?.rules ?? [])
    .map((rule) => normalizeDiscountRule(rule))
    .filter((rule) => validTypeIds.has(rule.discountTypeId));
  const activeTab = types.find((item) => item.active)?.id ?? types[0]?.id ?? '';
  return { activeTab, types, rules };
}

export function buildBootstrapDiscountsPayload(ruleState: ContractRuleState | null): ContractDiscountsData | null {
  if (!ruleState) return null;

  const activeGroupId =
    ruleState.active && ruleState.activeChip
      ? (ruleState.activeChip as 'contract-base' | 'early-payment')
      : ruleState.active && (ruleState.activeTab === 'on-contract' || ruleState.activeTab === 'early-payment')
        ? (ruleState.activeTab === 'on-contract' ? 'contract-base' : 'early-payment')
        : null;

  const baseTypes = DISCOUNT_GROUPS.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    active: activeGroupId === item.id,
  }));

  if (!activeGroupId) {
    return {
      activeTab: baseTypes[0]?.id ?? '',
      types: baseTypes,
      rules: [],
    };
  }

  const isContractBase = activeGroupId === 'contract-base';
  const amountValue = isContractBase
    ? String(ruleState.values.discountContractValue ?? '')
    : String(ruleState.values.discountEarlyValue ?? '');
  const scope = String(ruleState.values.discountScope || 'whole') as DiscountScope;
  const entryId =
    scope === 'whole'
      ? WHOLE_DISCOUNT_ENTRY.id
      : String(ruleState.values.discountEntryId || ITEMIZED_DISCOUNT_ENTRIES[0]?.id || WHOLE_DISCOUNT_ENTRY.id);

  return normalizeDiscountsPayload({
    activeTab: activeGroupId,
    types: baseTypes,
    rules: [
      normalizeDiscountRule({
        id: `discount-bootstrap-${activeGroupId}`,
        discountTypeId: activeGroupId,
        scope,
        entryId,
        valueMode: String(ruleState.values.discountValueMode || 'amount') as DiscountValueMode,
        enabled: true,
        minValue: amountValue,
        maxValue: amountValue,
        conditionNote: isContractBase
          ? String(ruleState.values.discountContractSettlement ?? '')
          : String(ruleState.values.discountEarlyDeadline ?? ''),
        conditionConfigured: Boolean(ruleState.values.discountConditionConfigured),
        conditionMaxDelayCount: String(ruleState.values.discountApprovalThreshold ?? ''),
        conditionGraceDays: isContractBase ? '' : String(ruleState.values.discountEarlyDeadline ?? ''),
        conditionDueBasis: ['all-payment-types'],
        conditionKeepOnDelay: Boolean(ruleState.values.discountEarlyKeepOnDelay),
        conditionPenaltyOnDiscount: Boolean(ruleState.values.discountContractNeedApproval),
        conditionSettlementTiming: String(ruleState.values.discountContractSettlement ?? 'unit-handover'),
        managerApproval: Boolean(ruleState.values.discountManagerApproval),
        approvalThreshold: String(ruleState.values.discountApprovalThreshold ?? ''),
      }),
    ],
  });
}

function normalizePenaltyRule(rule: PenaltyRuleData): PenaltyRuleData {
  const normalizeRoundRuleValue = (value: string | undefined): PenaltyRoundRule => {
    if (value === '00' || value === '0' || value === '100' || value === '1000') return value;
    if (value === '0.5') return '00';
    if (value === '5') return '0';
    return '100';
  };

  return {
    ...rule,
    fixedAmount: String(rule.fixedAmount ?? ''),
    penaltyPercent: String(rule.penaltyPercent ?? ''),
    bankInterestPercent: String(rule.bankInterestPercent ?? ''),
    graceDays: String(rule.graceDays ?? ''),
    roundRule: normalizeRoundRuleValue(rule.roundRule),
    extraFeeAmount: String(rule.extraFeeAmount ?? ''),
    extraFeeRoundRule: normalizeRoundRuleValue(rule.extraFeeRoundRule),
    progressiveRows: (rule.progressiveRows?.length ? rule.progressiveRows : DEFAULT_PROGRESSIVE_ROWS).map((row, index) => ({
      id: row.id || `row-${index + 1}`,
      fromDay: String(row.fromDay ?? ''),
      toDay: String(row.toDay ?? ''),
      rate: String(row.rate ?? ''),
      openEnded: Boolean(row.openEnded),
    })),
  };
}

export function normalizePenaltiesPayload(data: ContractPenaltiesData | null): ContractPenaltiesData {
  const typeMap = new Map((data?.types ?? []).map((item) => [item.id, item]));
  const types = PENALTY_ITEMS.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    active: typeMap.get(item.id)?.active ?? false,
  }));
  const validTypeIds = new Set(types.map((item) => item.id));
  const rules = (data?.rules ?? []).filter((item) => validTypeIds.has(item.penaltyTypeId)).map(normalizePenaltyRule);
  const activeTab = types.find((item) => item.active)?.id ?? types[0]?.id ?? '';
  return { activeTab, types, rules };
}

export function buildBootstrapPenaltiesPayload(
  ruleState: Pick<ContractRuleState, 'active' | 'activeTab' | 'values'> | null,
): ContractPenaltiesData | null {
  if (!ruleState) return null;
  const typeId = 'installment-delay';
  const active = Boolean(ruleState.active);
  const rawTab = ruleState.activeTab;
  const draftMode: PenaltyMode =
    rawTab === 'debt-percent' || rawTab === 'overdue'
      ? 'overdue'
      : rawTab === 'contract-percent' || rawTab === 'contract'
        ? 'contract'
        : rawTab === 'progressive'
          ? 'progressive'
          : 'fixed';
  const prefix =
    draftMode === 'overdue'
      ? 'penaltyDebt'
      : draftMode === 'contract'
        ? 'penaltyContract'
        : draftMode === 'progressive'
          ? 'penaltyProgressive'
          : 'penaltyFixed';
  const get = (key: string) => String(ruleState.values[`${prefix}${key}`] ?? '');
  const percent = draftMode === 'overdue' || draftMode === 'contract' ? get('Percent') : '';

  const rule = normalizePenaltyRule({
    id: 'penalty-bootstrap-installment-delay',
    penaltyTypeId: typeId,
    mode: draftMode,
    period: (get('Period') || 'monthly') as PenaltyPeriod,
    fixedAmount: get('Amount'),
    penaltyPercent: percent,
    bankInterestPercent: get('BankPercent'),
    graceDays: get('GraceDays') || '2',
    roundRule: (get('Round') || '100') as PenaltyRoundRule,
    extraFeeEnabled: ruleState.values[`${prefix}ExtraFeeEnabled`] === true,
    extraFeeType: (get('ExtraFeeType') || 'percent') as PenaltyExtraFeeType,
    extraFeeAmount: get('ExtraFeeAmount'),
    extraFeeRoundRule: (get('ExtraFeeRound') || '100') as PenaltyRoundRule,
    progressiveRows: [1, 2, 3, 4].map((index) => ({
      id: `row-${index}`,
      fromDay: String(ruleState.values[`penaltyProgressiveRow${index}From`] ?? ''),
      toDay: String(ruleState.values[`penaltyProgressiveRow${index}To`] ?? ''),
      rate: String(ruleState.values[`penaltyProgressiveRow${index}Rate`] ?? ''),
    })),
  });

  return normalizePenaltiesPayload({
    activeTab: typeId,
    types: PENALTY_ITEMS.map((item) => ({ ...item, active: active && item.id === typeId })),
    rules: active ? [rule] : [],
  });
}

export function buildBootstrapFinancialPayload(
  prepayment: ContractRuleState | null | undefined,
): ContractFinancialData | null {
  if (!prepayment?.active) return null;
  const fixedAmount = resolvePrepaymentAmountReference(prepayment, 0).referenceAmount;
  if (!fixedAmount) return null;

  const categories = BOOTSTRAP_FINANCIAL_CATEGORIES.map((item) => ({
    id: item.id,
    name: item.name,
    capAmount: item.id === 'advance' ? fixedAmount : 0,
    dueAmount: 0,
    noDueAmount: 0,
    system: true,
    requiresDue: item.requiresDue,
  }));

  return {
    pricingType: 'fixed',
    totalArea: '0',
    pricePerMeter: '0',
    fixedTotalAmount: '0',
    activeTab: 'advance',
    categories,
    dueItems: [],
  };
}

export function buildBootstrapRuleState(ruleId: ContractRuleId, ruleState: unknown): ContractRuleState {
  return normalizeRuleState(ruleId, ruleState);
}

/** Rule IDs seeded into draft rule-settings (excludes adjustment, additional-costs, loan). */
export const BOOTSTRAP_DRAFT_RULE_IDS = [
  'interest',
  'forgiveness',
  'builder-penalty',
  'builder-cancellation',
  'buyer-cancellation',
] as const satisfies readonly ContractRuleId[];
