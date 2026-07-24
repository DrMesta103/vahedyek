import { RULE_CONFIGS, type ContractRuleState } from '../businessContractRules';
import { getDomainFieldHint, resolveActiveTabFieldHints, type DomainFieldHint } from './domainFieldHints';

export function resolveForgivenessFieldHints(
  reference: ContractRuleState | null | undefined,
  current: ContractRuleState | null | undefined,
): Record<string, DomainFieldHint> {
  return resolveActiveTabFieldHints(RULE_CONFIGS.forgiveness, reference, current);
}

export function resolveInterestFieldHints(
  reference: ContractRuleState | null | undefined,
  current: ContractRuleState | null | undefined,
): Record<string, DomainFieldHint> {
  return resolveActiveTabFieldHints(RULE_CONFIGS.interest, reference, current);
}

export { getDomainFieldHint };
export type { DomainFieldHint };
