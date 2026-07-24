import { RULE_CONFIGS, type ContractRuleState } from '../businessContractRules';
import { getDomainFieldHint, resolveActiveTabFieldHints, type DomainFieldHint } from './domainFieldHints';

const SECTION_PREFIX: Record<string, string> = {
  'unit-delivery-delay': 'unitDeliveryDelay',
  'material-specs-change': 'materialSpecsChange',
  'area-difference': 'areaDifference',
};

export function resolveBuilderPenaltyFieldHints(
  reference: ContractRuleState | null | undefined,
  current: ContractRuleState | null | undefined,
  sectionId?: string,
): Record<string, DomainFieldHint> {
  const hints = resolveActiveTabFieldHints(RULE_CONFIGS['builder-penalty'], reference, current, {
    requireReferenceActive: false,
  });
  if (!reference) return {};
  // When settings inactive, still allow equal/different on active flag via empty
  if (!reference.active && !current?.active) return {};

  if (!sectionId) return hints;

  const prefix = SECTION_PREFIX[sectionId];
  if (!prefix) return hints;

  const scoped: Record<string, DomainFieldHint> = {};
  for (const [key, value] of Object.entries(hints)) {
    if (key === 'activeTab' || key === 'mode' || key.startsWith(prefix) || key.toLowerCase().includes(prefix.toLowerCase())) {
      scoped[key] = value;
    }
  }
  // UI aliases
  if (hints[`${prefix}Mode`]) scoped.mode = hints[`${prefix}Mode`];
  if (hints[`${prefix}Period`]) scoped.period = hints[`${prefix}Period`];
  if (hints[`${prefix}FixedAmount`]) scoped.fixedAmount = hints[`${prefix}FixedAmount`];
  if (hints[`${prefix}GraceDays`]) scoped.graceDays = hints[`${prefix}GraceDays`];
  if (hints[`${prefix}PenaltyCap`]) scoped.cap = hints[`${prefix}PenaltyCap`];
  return { ...hints, ...scoped };
}

export { getDomainFieldHint };
export type { DomainFieldHint };
