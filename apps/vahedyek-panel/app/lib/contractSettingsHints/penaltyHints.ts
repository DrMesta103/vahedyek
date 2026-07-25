import type { ContractRuleState } from '../businessContractRules';
import {
  getPenaltyTypeSettingsSlice,
  listConfiguredPenaltyTypeIds,
  RULE_CONFIGS,
} from '../businessContractRules';
import type { PenaltyMode, PenaltyRuleData } from '../../types/contract';
import { PENALTY_ITEMS } from '../../(panel)/contracts/new/_components/penaltiesConfig';
import { resolveDomainRuleHint } from './domainRuleHints';
import { buildFieldHint } from './domainFieldHints';
import {
  formatBusinessSettingValue,
  type BusinessSettingsComparison,
  type BusinessSettingsHintStatus,
} from '../contractSettingsReference';

const BOOTSTRAP_DEFAULT_PENALTY_TYPE_ID = 'installment-delay';

export type BuyerPenaltyFieldHintKey =
  | 'mode'
  | 'period'
  | 'fixedAmount'
  | 'penaltyPercent'
  | 'bankInterestPercent'
  | 'graceDays'
  | 'roundRule'
  | 'extraFeeEnabled'
  | 'extraFeeType'
  | 'extraFeeAmount'
  | 'extraFeeRound'
  | `progressiveRow${1 | 2 | 3 | 4}From`
  | `progressiveRow${1 | 2 | 3 | 4}To`
  | `progressiveRow${1 | 2 | 3 | 4}Rate`;

export type BuyerPenaltyFieldHint = {
  status: 'equal' | 'different' | 'missing' | 'idle';
  settingsLabel: string | null;
};

function settingsFieldKeyToUiKey(fieldKey: string): BuyerPenaltyFieldHintKey | null {
  if (fieldKey.endsWith('Period')) return 'period';
  if (fieldKey === 'penaltyFixedAmount') return 'fixedAmount';
  if (fieldKey.endsWith('Percent') && fieldKey.includes('Bank')) return 'bankInterestPercent';
  if (fieldKey.endsWith('Percent') && !fieldKey.includes('Bank') && !fieldKey.includes('Extra')) return 'penaltyPercent';
  if (fieldKey.endsWith('GraceDays')) return 'graceDays';
  if (fieldKey.endsWith('Round') && fieldKey.includes('ExtraFee')) return 'extraFeeRound';
  if (fieldKey.endsWith('Round')) return 'roundRule';
  if (fieldKey.endsWith('ExtraFeeEnabled')) return 'extraFeeEnabled';
  if (fieldKey.endsWith('ExtraFeeType')) return 'extraFeeType';
  if (fieldKey.endsWith('ExtraFeeAmount')) return 'extraFeeAmount';
  const progressiveMatch = fieldKey.match(/^penaltyProgressiveRow([1-4])(From|To|Rate)$/);
  if (progressiveMatch) {
    return `progressiveRow${progressiveMatch[1] as '1' | '2' | '3' | '4'}${progressiveMatch[2] as 'From' | 'To' | 'Rate'}`;
  }
  return null;
}

function normalizeHintComparable(fieldKey: string, value: unknown): string | boolean | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  const asString = String(value);
  if (fieldKey.endsWith('Period')) return mapPeriodToSettingsLabel(asString);
  if (fieldKey.includes('Round')) return mapRoundToSettingsLabel(asString);
  if (fieldKey.endsWith('ExtraFeeType')) return mapExtraFeeTypeToSettingsLabel(asString);
  if (fieldKey.endsWith('Amount') || fieldKey.endsWith('Percent')) return stripAmountNoise(asString) || null;
  return asString;
}

function formatHintSettingsLabel(fieldKey: string, value: unknown): string | null {
  const normalized = normalizeHintComparable(fieldKey, value);
  if (normalized === null) return null;
  if (typeof normalized === 'boolean') return formatBusinessSettingValue(String(normalized));
  return formatBusinessSettingValue(normalized);
}

export function resolveBuyerPenaltySettingsTargetTypeId(
  reference: Pick<ContractRuleState, 'active' | 'activeChip' | 'valuesByType'> | null | undefined,
): string | null {
  if (!reference) return null;
  const configured = listConfiguredPenaltyTypeIds(reference);
  if (configured.length === 1) return configured[0] ?? null;
  const chip = typeof reference.activeChip === 'string' ? reference.activeChip.trim() : '';
  if (chip && PENALTY_ITEMS.some((item) => item.id === chip)) return chip;
  return null;
}

/** Settings slice for one penalty type only; null when that type has no settings. */
export function scopeBuyerPenaltySettingsToType(
  reference: ContractRuleState | null | undefined,
  typeId: string,
): ContractRuleState | null {
  return getPenaltyTypeSettingsSlice(reference, typeId);
}

function mapDraftModeToSettingsTab(mode: PenaltyMode | string | undefined): string {
  if (mode === 'overdue' || mode === 'debt-percent') return 'debt-percent';
  if (mode === 'contract' || mode === 'contract-percent') return 'contract-percent';
  if (mode === 'progressive') return 'progressive';
  return 'fixed';
}

function mapPeriodToSettingsLabel(period: string | undefined): string {
  const value = String(period ?? '').trim();
  if (value === 'daily' || value === 'روزانه') return 'روزانه';
  if (value === 'yearly' || value === 'سالانه') return 'سالانه';
  if (value === 'monthly' || value === 'ماهانه') return 'ماهانه';
  return value;
}

function mapRoundToSettingsLabel(round: string | undefined): string {
  const value = String(round ?? '').trim();
  if (value === '00' || value === '0.00') return '0.00';
  if (value === '0' || value === '0.0') return '0.0';
  if (value === '100' || value === 'کسر 100') return 'کسر 100';
  if (value === '1000' || value === 'کسر 1000') return 'کسر 1000';
  return value;
}

function mapExtraFeeTypeToSettingsLabel(feeType: string | undefined): string {
  const value = String(feeType ?? '').trim();
  if (value === 'percent' || value === 'درصد') return 'درصد';
  if (value === 'fixed' || value === 'مبلغ ثابت') return 'مبلغ ثابت';
  return value;
}

function stripAmountNoise(value: string | undefined): string {
  return String(value ?? '')
    .replace(/,/g, '')
    .replace(/[٬\s]/g, '')
    .trim();
}

/** Convert a draft buyer-penalty rule into settings-shaped ContractRuleState for hint comparison. */
export function buildBuyerPenaltyTypeRuleState(
  typeActive: boolean,
  rule: PenaltyRuleData | null | undefined,
): ContractRuleState {
  if (!typeActive) {
    return { active: false, activeTab: '', values: {} };
  }

  if (!rule) {
    return { active: true, activeTab: '', values: {} };
  }

  const activeTab = mapDraftModeToSettingsTab(rule.mode);
  const period = mapPeriodToSettingsLabel(rule.period);
  const graceDays = String(rule.graceDays ?? '');
  const round = mapRoundToSettingsLabel(rule.roundRule);
  const extraEnabled = Boolean(rule.extraFeeEnabled);
  const extraType = mapExtraFeeTypeToSettingsLabel(rule.extraFeeType);
  const extraAmount = stripAmountNoise(rule.extraFeeAmount);
  const extraRound = mapRoundToSettingsLabel(rule.extraFeeRoundRule);
  const values: Record<string, string | boolean> = {};

  if (activeTab === 'fixed') {
    values.penaltyFixedPeriod = period;
    values.penaltyFixedAmount = stripAmountNoise(rule.fixedAmount);
    values.penaltyFixedGraceDays = graceDays;
    values.penaltyFixedExtraFeeEnabled = extraEnabled;
    values.penaltyFixedExtraFeeType = extraType;
    values.penaltyFixedExtraFeeAmount = extraAmount;
    values.penaltyFixedExtraFeeRound = extraRound;
  } else if (activeTab === 'debt-percent') {
    values.penaltyDebtPeriod = period;
    values.penaltyDebtPercent = String(rule.penaltyPercent ?? '');
    values.penaltyDebtBankPercent = String(rule.bankInterestPercent ?? '');
    values.penaltyDebtGraceDays = graceDays;
    values.penaltyDebtRound = round;
    values.penaltyDebtExtraFeeEnabled = extraEnabled;
    values.penaltyDebtExtraFeeType = extraType;
    values.penaltyDebtExtraFeeAmount = extraAmount;
    values.penaltyDebtExtraFeeRound = extraRound;
  } else if (activeTab === 'contract-percent') {
    values.penaltyContractPeriod = period;
    values.penaltyContractPercent = String(rule.penaltyPercent ?? '');
    values.penaltyContractBankPercent = String(rule.bankInterestPercent ?? '');
    values.penaltyContractGraceDays = graceDays;
    values.penaltyContractRound = round;
    values.penaltyContractExtraFeeEnabled = extraEnabled;
    values.penaltyContractExtraFeeType = extraType;
    values.penaltyContractExtraFeeAmount = extraAmount;
    values.penaltyContractExtraFeeRound = extraRound;
  } else {
    values.penaltyProgressivePeriod = period;
    values.penaltyProgressiveBankPercent = String(rule.bankInterestPercent ?? '');
    values.penaltyProgressiveGraceDays = graceDays;
    values.penaltyProgressiveRound = round;
    values.penaltyProgressiveExtraFeeEnabled = extraEnabled;
    values.penaltyProgressiveExtraFeeType = extraType;
    values.penaltyProgressiveExtraFeeAmount = extraAmount;
    values.penaltyProgressiveExtraFeeRound = extraRound;
    (rule.progressiveRows ?? []).slice(0, 4).forEach((row, index) => {
      const n = index + 1;
      values[`penaltyProgressiveRow${n}From`] = String(row.fromDay ?? '');
      values[`penaltyProgressiveRow${n}To`] = String(row.toDay ?? '');
      values[`penaltyProgressiveRow${n}Rate`] = String(row.rate ?? '');
    });
  }

  return { active: true, activeTab, values };
}

export function resolveBuyerPenaltyTypeHint(
  reference: ContractRuleState | null | undefined,
  typeId: string,
  typeActive: boolean,
  rule: PenaltyRuleData | null | undefined,
): BusinessSettingsComparison {
  if (!reference) {
    return resolveDomainRuleHint(RULE_CONFIGS.penalty, null, buildBuyerPenaltyTypeRuleState(typeActive, rule));
  }

  const scoped = scopeBuyerPenaltySettingsToType(reference, typeId);
  // No slice for this type → settings do not require it (treat as inactive template).
  const settingsForType = scoped ?? { active: false, activeTab: '', values: {} };
  return resolveDomainRuleHint(RULE_CONFIGS.penalty, settingsForType, buildBuyerPenaltyTypeRuleState(typeActive, rule));
}

export function buyerPenaltyAlignmentTag(status: BusinessSettingsHintStatus | null | undefined): {
  label: string;
  className: string;
} | null {
  if (!status || status === 'missing') return null;
  if (status === 'equal') {
    return {
      label: 'سازگار با تنظیمات',
      className: 'border-cyan-200 bg-cyan-50 text-cyan-800',
    };
  }
  return {
    label: 'مغایرت با تنظیمات',
    className: 'border-amber-200 bg-amber-50 text-amber-900',
  };
}

/** Aggregate buyer penalty types into one party-level alignment status. */
export function resolveBuyerPenaltiesPartyHint(
  reference: ContractRuleState | null | undefined,
  types: Array<{ id: string; active: boolean }>,
  rules: PenaltyRuleData[],
): BusinessSettingsComparison {
  if (!reference) {
    return resolveDomainRuleHint(RULE_CONFIGS.penalty, null, null);
  }

  const comparisons = (types.length ? types : [{ id: 'installment-delay', active: false }]).map((type) => {
    const rule = rules.find((item) => item.penaltyTypeId === type.id) ?? null;
    return resolveBuyerPenaltyTypeHint(reference, type.id, type.active, rule);
  });

  if (comparisons.some((item) => item.status === 'different')) {
    return comparisons.find((item) => item.status === 'different')!;
  }
  if (comparisons.some((item) => item.status === 'info')) {
    return comparisons.find((item) => item.status === 'info')!;
  }
  if (comparisons.some((item) => item.status === 'missing')) {
    return comparisons.find((item) => item.status === 'missing')!;
  }
  return comparisons[0] ?? resolveDomainRuleHint(RULE_CONFIGS.penalty, reference, { active: false, activeTab: '', values: {} });
}

/**
 * Per-field alignment hints for buyer penalty form fields.
 * When settings have no active slice for this type, compares against an inactive/empty
 * template (same idea as resolveBuyerPenaltyTypeHint) so every type still gets field tags.
 * Returns {} only when the penalty domain itself is missing from settings.
 */
export function resolveBuyerPenaltyFieldHints(
  reference: ContractRuleState | null | undefined,
  typeId: string,
  typeActive: boolean,
  rule: PenaltyRuleData | null | undefined,
): Partial<Record<BuyerPenaltyFieldHintKey, BuyerPenaltyFieldHint>> {
  if (!reference) return {};

  const scoped = scopeBuyerPenaltySettingsToType(reference, typeId);
  const current = buildBuyerPenaltyTypeRuleState(typeActive, rule);
  const settingsConfigured = Boolean(scoped?.active);
  const settingsValues = settingsConfigured ? (scoped!.values ?? {}) : {};
  const settingsTabId = settingsConfigured ? scoped!.activeTab : current.activeTab;
  const referenceTab =
    RULE_CONFIGS.penalty.tabs.find((tab) => tab.id === settingsTabId) ?? RULE_CONFIGS.penalty.tabs[0] ?? null;
  const hints: Partial<Record<BuyerPenaltyFieldHintKey, BuyerPenaltyFieldHint>> = {};

  if (!settingsConfigured) {
    hints.mode = { status: 'missing', settingsLabel: null };
  } else if (referenceTab && referenceTab.id === current.activeTab) {
    hints.mode = { status: 'equal', settingsLabel: null };
  } else {
    hints.mode = {
      status: 'different',
      settingsLabel: referenceTab?.title ?? null,
    };
  }

  if (!referenceTab) return hints;

  for (const field of referenceTab.fields) {
    const uiKey = settingsFieldKeyToUiKey(field.key);
    if (!uiKey) continue;

    const refRaw = normalizeHintComparable(field.key, settingsValues[field.key]);
    const curRaw = normalizeHintComparable(field.key, current.values[field.key]);
    hints[uiKey] = buildFieldHint(refRaw, curRaw, formatHintSettingsLabel(field.key, settingsValues[field.key]));
  }

  return hints;
}

export function getBuyerPenaltyFieldHint(
  hints: Partial<Record<BuyerPenaltyFieldHintKey, BuyerPenaltyFieldHint>>,
  key: BuyerPenaltyFieldHintKey,
): BuyerPenaltyFieldHint {
  return hints[key] ?? { status: 'idle', settingsLabel: null };
}

export { BOOTSTRAP_DEFAULT_PENALTY_TYPE_ID };
