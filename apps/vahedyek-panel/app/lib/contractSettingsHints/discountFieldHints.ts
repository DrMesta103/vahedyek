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

/**
 * Per-field alignment for discount RuleEditor UI keys.
 * Emits hints only when settings target this type/entry (card tag covers the rest).
 */
export function resolveDiscountFieldHints(
  reference: ContractRuleState | null | undefined,
  rule: DiscountRuleData | null | undefined,
  typeActive: boolean,
): Record<string, DomainFieldHint> {
  if (!reference || !settingsTargetsDiscountCard(reference, rule?.discountTypeId || '', rule)) {
    return {};
  }
  if (!typeActive || !rule) return {};

  const values = reference.values ?? {};
  const isEarly = draftTypeToSettingsTab(rule.discountTypeId) === 'early-payment';

  const settingsValueModeLabel = isEarly
    ? mapDraftValueModeToSettingsLabel(mapSettingsTargetToDraftValueMode(values.discountEarlyTarget) || String(values.discountValueMode ?? ''))
    : mapDraftValueModeToSettingsLabel(mapSettingsTargetToDraftValueMode(values.discountContractTarget) || String(values.discountValueMode ?? ''));

  const draftValueModeLabel = mapDraftValueModeToSettingsLabel(rule.valueMode);

  const settingsMax = isEarly
    ? stripNoise(values.discountEarlyValue || values.discountMaxValue)
    : stripNoise(values.discountContractValue || values.discountMaxValue);
  const settingsMin = stripNoise(values.discountMinValue);
  const hasSettingsMin = Boolean(settingsMin);

  const settingsManagerApproval = isEarly
    ? Boolean(values.discountManagerApproval)
    : Boolean(values.discountContractNeedApproval ?? values.discountManagerApproval);
  const settingsApprovalThreshold = stripNoise(values.discountApprovalThreshold);

  const hints: Record<string, DomainFieldHint> = {
    valueMode: makeFieldHint(settingsValueModeLabel, draftValueModeLabel),
    maxValue: makeFieldHint(settingsMax, stripNoise(rule.maxValue)),
    managerApproval: makeFieldHint(settingsManagerApproval, Boolean(rule.managerApproval)),
  };

  if (hasSettingsMin) {
    hints.minValue = makeFieldHint(settingsMin, stripNoise(rule.minValue));
  }

  if (settingsManagerApproval || Boolean(rule.managerApproval) || settingsApprovalThreshold) {
    hints.approvalThreshold = makeFieldHint(settingsApprovalThreshold, stripNoise(rule.approvalThreshold));
  }

  // Condition fields (stored as discountCondition* extras on settings)
  const settingsDueBasisRaw = values.discountConditionDueBasis;
  const settingsDueBasis = typeof settingsDueBasisRaw === 'string' && settingsDueBasisRaw.trim()
    ? settingsDueBasisRaw.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
  const draftDueBasis = Array.isArray(rule.conditionDueBasis) ? rule.conditionDueBasis : [];

  if (stripNoise(values.discountConditionMaxDelayCount) || stripNoise(rule.conditionMaxDelayCount)) {
    hints.maxDelayCount = makeFieldHint(values.discountConditionMaxDelayCount, rule.conditionMaxDelayCount);
  }
  if (stripNoise(values.discountConditionGraceDays) || stripNoise(rule.conditionGraceDays)) {
    hints.graceDays = makeFieldHint(values.discountConditionGraceDays, rule.conditionGraceDays);
  }
  if (settingsDueBasis.length || draftDueBasis.length) {
    // Only compare when settings actually configure dueBasis.
    if (settingsDueBasis.length) {
      hints.dueBasis = makeFieldHint(settingsDueBasis, draftDueBasis);
    }
  }

  if (isEarly) {
    hints.keepOnDelay = makeFieldHint(Boolean(values.discountEarlyKeepOnDelay), Boolean(rule.conditionKeepOnDelay));
  } else if (
    values.discountConditionKeepOnDelay === true ||
    values.discountConditionKeepOnDelay === false ||
    rule.conditionKeepOnDelay !== undefined
  ) {
    // Prefer explicit condition key when present in settings input extras.
    hints.keepOnDelay = makeFieldHint(Boolean(values.discountConditionKeepOnDelay), Boolean(rule.conditionKeepOnDelay));
  }

  if (
    values.discountConditionPenaltyOnDiscount === true ||
    values.discountConditionPenaltyOnDiscount === false ||
    rule.conditionPenaltyOnDiscount !== undefined
  ) {
    if (stripNoise(values.discountConditionMaxDelayCount) || rule.conditionConfigured) {
      hints.penaltyOnDiscount = makeFieldHint(
        Boolean(values.discountConditionPenaltyOnDiscount),
        Boolean(rule.conditionPenaltyOnDiscount),
      );
    }
  }

  const settingsSettlement = stripNoise(values.discountConditionSettlementTiming);
  if (settingsSettlement || stripNoise(rule.conditionSettlementTiming)) {
    if (settingsSettlement) {
      hints.settlementTiming = makeFieldHint(settingsSettlement, rule.conditionSettlementTiming);
    }
  }

  return hints;
}

export { getDomainFieldHint };
export type { DomainFieldHint };
