import { RULE_CONFIGS, type ContractRuleState } from '../businessContractRules';
import type { DiscountRuleData } from '../../types/contract';
import { getDomainFieldHint, resolveActiveTabFieldHints, type DomainFieldHint } from './domainFieldHints';

function draftTypeToSettingsTab(discountTypeId: string): string {
  if (discountTypeId === 'contract-base') return 'on-contract';
  if (discountTypeId === 'early-payment') return 'early-payment';
  return discountTypeId;
}

function settingsTabToDraftType(activeTab: string): string {
  if (activeTab === 'on-contract') return 'contract-base';
  return activeTab;
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
      discountMinValue: String(rule.minValue ?? '').replace(/,/g, ''),
      discountMaxValue: String(rule.maxValue ?? '').replace(/,/g, ''),
      discountManagerApproval: Boolean(rule.managerApproval),
      discountApprovalThreshold: String(rule.approvalThreshold ?? '').replace(/,/g, ''),
      discountScope: rule.scope ?? '',
      discountEntryId: rule.entryId ?? '',
      discountConditionConfigured: Boolean(rule.conditionConfigured),
      discountEarlyTarget: rule.valueMode === 'percent' ? 'درصد' : 'مبلغ',
      discountEarlyValue: String(rule.maxValue || rule.minValue || '').replace(/,/g, ''),
      discountContractTarget: rule.valueMode === 'percent' ? 'درصد' : 'مبلغ',
      discountContractValue: String(rule.maxValue || rule.minValue || '').replace(/,/g, ''),
      discountContractNeedApproval: Boolean(rule.managerApproval),
    },
  };
}

export function resolveDiscountFieldHints(
  reference: ContractRuleState | null | undefined,
  rule: DiscountRuleData | null | undefined,
  typeActive: boolean,
): Record<string, DomainFieldHint> {
  if (!reference?.active) return {};
  const settingsType = settingsTabToDraftType(reference.activeTab || '');
  if (rule && rule.discountTypeId !== settingsType && settingsType) {
    // Settings target a different discount type — still show mode-level mismatch if this type is active
    if (!typeActive) return {};
  }
  const current = buildDiscountRuleHintState(rule, typeActive);
  // Align current activeTab to settings tab ids for comparison
  const alignedCurrent: ContractRuleState = {
    ...current,
    activeTab: draftTypeToSettingsTab(rule?.discountTypeId || current.activeTab),
  };
  const hints = resolveActiveTabFieldHints(RULE_CONFIGS.discount, reference, alignedCurrent);
  // Also expose UI-friendly aliases used in DiscountsStep FieldBlocks
  if (hints.discountValueMode) hints.valueMode = hints.discountValueMode;
  if (hints.discountMinValue) hints.minValue = hints.discountMinValue;
  if (hints.discountMaxValue) hints.maxValue = hints.discountMaxValue;
  if (hints.discountApprovalThreshold) hints.approvalThreshold = hints.discountApprovalThreshold;
  if (hints.discountManagerApproval) hints.managerApproval = hints.discountManagerApproval;

  // on-contract tab uses different settings keys than the draft RuleEditor labels
  if (hints.discountContractTarget) hints.valueMode = hints.discountContractTarget;
  if (hints.discountContractValue) {
    hints.minValue = hints.discountContractValue;
    hints.maxValue = hints.discountContractValue;
  }
  if (hints.discountContractNeedApproval) hints.managerApproval = hints.discountContractNeedApproval;

  // early-payment value mode aliases
  if (hints.discountEarlyTarget && !hints.valueMode) hints.valueMode = hints.discountEarlyTarget;
  if (hints.discountEarlyValue) {
    if (!hints.minValue) hints.minValue = hints.discountEarlyValue;
    if (!hints.maxValue) hints.maxValue = hints.discountEarlyValue;
  }

  return hints;
}

export { getDomainFieldHint };
export type { DomainFieldHint };
