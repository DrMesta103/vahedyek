import { BUILDER_PENALTY_SECTION_META, type BuilderPenaltySectionId } from '../builderPenalty';
import { RULE_CONFIGS, type ContractRuleState } from '../businessContractRules';
import type { BusinessSettingsComparison } from '../contractSettingsReference';
import { getDomainFieldHint, resolveActiveTabFieldHints, type DomainFieldHint } from './domainFieldHints';
import { resolveDomainRuleHint } from './domainRuleHints';

const SECTION_PREFIX: Record<string, string> = {
  'unit-delivery-delay': 'unitDeliveryDelay',
  'material-specs-change': 'materialSpecsChange',
  'area-difference': 'areaDifference',
};

function clonePrefixValues(
  source: Record<string, string | boolean> | undefined,
  prefix: string,
): Record<string, string | boolean> {
  const values: Record<string, string | boolean> = {};
  if (!source) return values;
  for (const [key, value] of Object.entries(source)) {
    if (key.startsWith(prefix)) values[key] = value;
  }
  return values;
}

function buildSectionRuleState(
  source: ContractRuleState | null | undefined,
  sectionId: BuilderPenaltySectionId,
): ContractRuleState {
  const meta = BUILDER_PENALTY_SECTION_META[sectionId];
  const prefix = SECTION_PREFIX[sectionId] ?? '';
  const enabled = Boolean(source?.values?.[meta.stateKey]);
  return {
    active: enabled,
    activeTab: source?.activeTab || RULE_CONFIGS['builder-penalty'].tabs[0]?.id || '',
    values: clonePrefixValues(source?.values, prefix),
  };
}

/**
 * Card-level alignment for one builder-penalty section.
 * No reference → missing. Section not configured in settings → treat as settings inactive.
 */
export function resolveBuilderPenaltySectionHint(
  reference: ContractRuleState | null | undefined,
  current: ContractRuleState | null | undefined,
  sectionId: BuilderPenaltySectionId,
): BusinessSettingsComparison {
  if (!reference) {
    return resolveDomainRuleHint(RULE_CONFIGS['builder-penalty'], null, buildSectionRuleState(current, sectionId));
  }

  const meta = BUILDER_PENALTY_SECTION_META[sectionId];
  const refEnabled = Boolean(reference.values?.[meta.stateKey]);
  const settingsForSection = refEnabled
    ? buildSectionRuleState(reference, sectionId)
    : { active: false, activeTab: '', values: {} };

  return resolveDomainRuleHint(
    RULE_CONFIGS['builder-penalty'],
    settingsForSection,
    buildSectionRuleState(current, sectionId),
  );
}

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
