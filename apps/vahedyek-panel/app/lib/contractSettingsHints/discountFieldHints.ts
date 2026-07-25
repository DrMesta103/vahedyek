import { RULE_CONFIGS, type ContractRuleState } from '../businessContractRules';
import type { DiscountRuleData } from '../../types/contract';
import type { BusinessSettingsComparison } from '../contractSettingsReference';
import {
  formatBusinessSettingValue,
  parseBusinessSettingNumber,
} from '../contractSettingsReference';
import { buildFieldHint, getDomainFieldHint, type DomainFieldHint } from './domainFieldHints';
import { resolveDomainRuleHint } from './domainRuleHints';

function draftTypeToSettingsTab(discountTypeId: string): string {
  if (discountTypeId === 'contract-base') return 'on-contract';
  if (discountTypeId === 'early-payment') return 'early-payment';
  return discountTypeId;
}

function settingsTabToDraftType(activeTab: string): string {
  if (activeTab === 'on-contract') return 'contract-base';
  return activeTab;
}

function stripNoise(value: unknown): string {
  return String(value ?? '')
    .replace(/,/g, '')
    .replace(/[٬\s]/g, '')
    .trim();
}

function mapDraftValueModeToSettingsLabel(mode: string | undefined): string {
  const value = String(mode ?? '').trim();
  if (value === 'percent' || value === 'درصد') return 'درصد';
  if (value === 'amount' || value === 'مبلغ') return 'مبلغ';
  return value;
}

function mapSettingsTargetToDraftValueMode(target: unknown): string {
  const value = String(target ?? '').trim();
  if (value === 'درصد' || value === 'percent') return 'percent';
  if (value === 'مبلغ' || value === 'amount') return 'amount';
  return value;
}

function formatHintLabel(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return formatBusinessSettingValue(String(value));
  if (Array.isArray(value)) {
    const joined = value.map(String).filter(Boolean).join('، ');
    return joined || null;
  }
  const raw = stripNoise(value);
  const asNumber = parseBusinessSettingNumber(raw);
  if (asNumber !== null && /^\d/.test(raw)) return formatBusinessSettingValue(raw);
  return formatBusinessSettingValue(String(value));
}

function makeFieldHint(referenceValue: unknown, currentValue: unknown): DomainFieldHint {
  const refRaw =
    typeof referenceValue === 'boolean'
      ? referenceValue
      : Array.isArray(referenceValue)
        ? referenceValue.map(String).sort().join(',') || null
        : stripNoise(referenceValue) || null;
  const curRaw =
    typeof currentValue === 'boolean'
      ? currentValue
      : Array.isArray(currentValue)
        ? currentValue.map(String).sort().join(',') || null
        : stripNoise(currentValue) || null;
  return buildFieldHint(refRaw, curRaw, formatHintLabel(referenceValue));
}

function settingsTargetsDiscountCard(
  reference: ContractRuleState,
  discountTypeId: string,
  rule: DiscountRuleData | null | undefined,
): boolean {
  if (!reference.active) return false;
  const settingsType = settingsTabToDraftType(reference.activeTab || '');
  if (settingsType !== discountTypeId) return false;

  const settingsScope = String(reference.values?.discountScope || 'whole');
  if (rule?.scope === 'itemized') {
    return settingsScope === 'itemized' && String(reference.values?.discountEntryId || '') === rule.entryId;
  }
  // Whole / section card: settings itemized-only does not target this card.
  return settingsScope !== 'itemized';
}

export function buildDiscountRuleHintState(rule: DiscountRuleData | null | undefined, typeActive: boolean): ContractRuleState {
  if (!rule || !typeActive) {
    return { active: false, activeTab: '', values: {} };
  }
  return {
    active: rule.enabled !== false,
    activeTab: draftTypeToSettingsTab(rule.discountTypeId),
    values: {
      discountValueMode: rule.valueMode ?? '',
      discountMinValue: stripNoise(rule.minValue),
      discountMaxValue: stripNoise(rule.maxValue),
      discountManagerApproval: Boolean(rule.managerApproval),
      discountApprovalThreshold: stripNoise(rule.approvalThreshold),
      discountScope: rule.scope ?? '',
      discountEntryId: rule.entryId ?? '',
      discountConditionConfigured: Boolean(rule.conditionConfigured),
      discountEarlyTarget: mapDraftValueModeToSettingsLabel(rule.valueMode),
      discountEarlyValue: stripNoise(rule.maxValue || rule.minValue),
      discountContractTarget: mapDraftValueModeToSettingsLabel(rule.valueMode),
      discountContractValue: stripNoise(rule.maxValue || rule.minValue),
      discountContractNeedApproval: Boolean(rule.managerApproval),
      discountConditionMaxDelayCount: stripNoise(rule.conditionMaxDelayCount),
      discountConditionGraceDays: stripNoise(rule.conditionGraceDays),
      discountConditionDueBasis: Array.isArray(rule.conditionDueBasis) ? rule.conditionDueBasis.join(',') : '',
      discountConditionKeepOnDelay: Boolean(rule.conditionKeepOnDelay),
      discountConditionPenaltyOnDiscount: Boolean(rule.conditionPenaltyOnDiscount),
      discountConditionSettlementTiming: String(rule.conditionSettlementTiming ?? ''),
    },
  };
}

/**
 * Card-level alignment for one discount type/entry.
 * Settings targeting another tab/entry → treat as settings inactive for this card.
 */
export function resolveDiscountTypeHint(
  reference: ContractRuleState | null | undefined,
  discountTypeId: string,
  typeActive: boolean,
  rule: DiscountRuleData | null | undefined,
): BusinessSettingsComparison {
  const current = buildDiscountRuleHintState(rule, typeActive);
  if (!reference) {
    return resolveDomainRuleHint(RULE_CONFIGS.discount, null, current);
  }

  const settingsForType = settingsTargetsDiscountCard(reference, discountTypeId, rule)
    ? { ...reference, active: true }
    : { active: false, activeTab: '', values: {} };

  return resolveDomainRuleHint(RULE_CONFIGS.discount, settingsForType, {
    ...current,
    activeTab: draftTypeToSettingsTab(discountTypeId),
  });
}

const DISCOUNT_UI_FIELD_KEYS = [
  'valueMode',
  'minValue',
  'maxValue',
  'managerApproval',
  'approvalThreshold',
  'maxDelayCount',
  'graceDays',
  'dueBasis',
  'keepOnDelay',
  'penaltyOnDiscount',
  'settlementTiming',
] as const;

function missingFieldHints(): Record<string, DomainFieldHint> {
  return Object.fromEntries(DISCOUNT_UI_FIELD_KEYS.map((key) => [key, { status: 'missing' as const, settingsLabel: null }]));
}

function readOptionalBool(value: unknown): boolean | null {
  if (value === true || value === false) return value;
  return null;
}

/**
 * Per-field alignment for discount RuleEditor UI keys.
 * Untargeted type/entry → all keys missing (same idea as buyer-penalty unconfigured types).
 * Targeted → always emit UI keys via makeFieldHint (empty settings → missing).
 */
export function resolveDiscountFieldHints(
  reference: ContractRuleState | null | undefined,
  rule: DiscountRuleData | null | undefined,
  typeActive: boolean,
): Record<string, DomainFieldHint> {
  if (!reference) return {};
  if (!typeActive || !rule) return {};

  if (!settingsTargetsDiscountCard(reference, rule.discountTypeId || '', rule)) {
    return missingFieldHints();
  }

  const values = reference.values ?? {};
  const isEarly = draftTypeToSettingsTab(rule.discountTypeId) === 'early-payment';

  const settingsValueModeRaw = isEarly
    ? mapSettingsTargetToDraftValueMode(values.discountEarlyTarget) || String(values.discountValueMode ?? '')
    : mapSettingsTargetToDraftValueMode(values.discountContractTarget) || String(values.discountValueMode ?? '');
  const settingsValueModeLabel = settingsValueModeRaw
    ? mapDraftValueModeToSettingsLabel(settingsValueModeRaw)
    : '';
  const draftValueModeLabel = mapDraftValueModeToSettingsLabel(rule.valueMode);

  const settingsMax = isEarly
    ? stripNoise(values.discountEarlyValue || values.discountMaxValue)
    : stripNoise(values.discountContractValue || values.discountMaxValue);
  const settingsMin = stripNoise(values.discountMinValue);

  const settingsManagerApproval = isEarly
    ? readOptionalBool(values.discountManagerApproval)
    : readOptionalBool(values.discountContractNeedApproval) ?? readOptionalBool(values.discountManagerApproval);
  const settingsApprovalThreshold = stripNoise(values.discountApprovalThreshold);

  const settingsDueBasisRaw = values.discountConditionDueBasis;
  const settingsDueBasis =
    typeof settingsDueBasisRaw === 'string' && settingsDueBasisRaw.trim()
      ? settingsDueBasisRaw.split(',').map((item) => item.trim()).filter(Boolean)
      : [];
  const draftDueBasis = Array.isArray(rule.conditionDueBasis) ? rule.conditionDueBasis : [];

  const settingsKeepOnDelay = isEarly
    ? readOptionalBool(values.discountEarlyKeepOnDelay)
    : readOptionalBool(values.discountConditionKeepOnDelay);
  const settingsPenaltyOnDiscount = readOptionalBool(values.discountConditionPenaltyOnDiscount);
  const settingsSettlement = stripNoise(values.discountConditionSettlementTiming);

  return {
    valueMode: makeFieldHint(settingsValueModeLabel, draftValueModeLabel),
    minValue: makeFieldHint(settingsMin, stripNoise(rule.minValue)),
    maxValue: makeFieldHint(settingsMax, stripNoise(rule.maxValue)),
    managerApproval: makeFieldHint(settingsManagerApproval, Boolean(rule.managerApproval)),
    approvalThreshold: makeFieldHint(settingsApprovalThreshold, stripNoise(rule.approvalThreshold)),
    maxDelayCount: makeFieldHint(values.discountConditionMaxDelayCount, rule.conditionMaxDelayCount),
    graceDays: makeFieldHint(values.discountConditionGraceDays, rule.conditionGraceDays),
    dueBasis: makeFieldHint(settingsDueBasis.length ? settingsDueBasis : null, draftDueBasis),
    keepOnDelay: makeFieldHint(settingsKeepOnDelay, Boolean(rule.conditionKeepOnDelay)),
    penaltyOnDiscount: makeFieldHint(settingsPenaltyOnDiscount, Boolean(rule.conditionPenaltyOnDiscount)),
    settlementTiming: makeFieldHint(settingsSettlement, rule.conditionSettlementTiming),
  };
}

export { getDomainFieldHint };
export type { DomainFieldHint };
