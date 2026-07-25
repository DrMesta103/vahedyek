import { RULE_CONFIGS, type ContractRuleState } from '../businessContractRules';
import type { BusinessSettingsComparison } from '../contractSettingsReference';
import { resolveActiveTabFieldHints, type DomainFieldHint } from './domainFieldHints';
import { resolveDomainRuleHint } from './domainRuleHints';

function parseEnabledEntryIds(raw: unknown): string[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return [];
  }
}

function settingsTargetsForgivenessEntry(reference: ContractRuleState, entryId: string): boolean {
  if (!reference.active) return false;
  const scope = String(reference.values?.forgiveScope || '');
  const settingsEntryId = String(reference.values?.forgiveEntryId || '');
  if (entryId === 'whole-contract') {
    return scope === 'whole' || settingsEntryId === 'whole-contract';
  }
  const enabledIds = parseEnabledEntryIds(reference.values?.forgiveEnabledEntryIds);
  if (enabledIds.includes(entryId)) return true;
  return scope === 'itemized' && settingsEntryId === entryId;
}

/**
 * Card-level alignment for one forgiveness entry.
 * Settings without that entry → treat as settings inactive.
 */
export function resolveForgivenessEntryHint(
  reference: ContractRuleState | null | undefined,
  entryId: string,
  entryEnabled: boolean,
  state: ContractRuleState | null | undefined,
): BusinessSettingsComparison {
  const current: ContractRuleState = {
    active: entryEnabled,
    activeTab: state?.activeTab || RULE_CONFIGS.forgiveness.tabs[0]?.id || '',
    values: entryEnabled ? { ...(state?.values ?? {}) } : {},
  };

  if (!reference) {
    return resolveDomainRuleHint(RULE_CONFIGS.forgiveness, null, current);
  }

  const settingsForEntry = settingsTargetsForgivenessEntry(reference, entryId)
    ? { ...reference, active: true }
    : { active: false, activeTab: '', values: {} };

  return resolveDomainRuleHint(RULE_CONFIGS.forgiveness, settingsForEntry, current);
}

const FORGIVENESS_VALUE_KEYS = [
  'forgiveMaxDelayCount',
  'forgiveValueMode',
  'forgiveMinValue',
  'forgiveMaxValue',
  'forgiveOutsideBuyerControl',
  'forgiveManagerApproval',
] as const;

function parseEntryValuesMap(raw: unknown): Record<string, Record<string, string | boolean>> {
  if (typeof raw !== 'string' || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, Record<string, string | boolean>>;
  } catch {
    return {};
  }
}

function normalizeInterestComparableValues(
  values: Record<string, string | boolean> | undefined,
): Record<string, string | boolean> {
  const next: Record<string, string | boolean> = { ...(values ?? {}) };
  for (const [key, value] of Object.entries(next)) {
    if (typeof value !== 'string') continue;
    if (value === 'تا 100' || value === 'کسر 100') next[key] = 'کسر 100';
    else if (value === 'تا 1000' || value === 'کسر 1000') next[key] = 'کسر 1000';
    else if (value === 'فصلی' || value === 'سه‌ماهه') next[key] = 'سه‌ماهه';
  }
  return next;
}

/**
 * Per-entry field hints for forgiveness.
 * When settings target another entry, returns {} (card tag covers enable mismatch).
 */
export function resolveForgivenessFieldHints(
  reference: ContractRuleState | null | undefined,
  current: ContractRuleState | null | undefined,
): Record<string, DomainFieldHint> {
  if (!reference?.active || !current) {
    return resolveActiveTabFieldHints(RULE_CONFIGS.forgiveness, reference, current);
  }

  const currentEntryId =
    String(current.values?.forgiveScope || '') === 'whole' || String(current.values?.forgiveEntryId || '') === 'whole-contract'
      ? 'whole-contract'
      : String(current.values?.forgiveEntryId || '');

  if (!currentEntryId || !settingsTargetsForgivenessEntry(reference, currentEntryId)) {
    return {};
  }

  // Prefer per-entry snapshot values when present on either side.
  const refMap = parseEntryValuesMap(reference.values?.forgiveEntryValues);
  const curMap = parseEntryValuesMap(current.values?.forgiveEntryValues);
  const refEntryValues = currentEntryId !== 'whole-contract' ? refMap[currentEntryId] : undefined;
  const curEntryValues = currentEntryId !== 'whole-contract' ? curMap[currentEntryId] : undefined;

  const scopedReference: ContractRuleState = {
    ...reference,
    active: true,
    values: {
      ...reference.values,
      ...(refEntryValues
        ? Object.fromEntries(FORGIVENESS_VALUE_KEYS.map((key) => [key, refEntryValues[key] ?? reference.values?.[key]]))
        : {}),
    },
  };
  const scopedCurrent: ContractRuleState = {
    ...current,
    active: true,
    values: {
      ...current.values,
      ...(curEntryValues
        ? Object.fromEntries(FORGIVENESS_VALUE_KEYS.map((key) => [key, curEntryValues[key] ?? current.values?.[key]]))
        : {}),
    },
  };

  return resolveActiveTabFieldHints(RULE_CONFIGS.forgiveness, scopedReference, scopedCurrent);
}

export function resolveInterestFieldHints(
  reference: ContractRuleState | null | undefined,
  current: ContractRuleState | null | undefined,
): Record<string, DomainFieldHint> {
  const normalizedReference = reference
    ? { ...reference, values: normalizeInterestComparableValues(reference.values) }
    : reference;
  const normalizedCurrent = current
    ? { ...current, values: normalizeInterestComparableValues(current.values) }
    : current;
  return resolveActiveTabFieldHints(RULE_CONFIGS.interest, normalizedReference, normalizedCurrent);
}

export { getDomainFieldHint } from './domainFieldHints';
export type { DomainFieldHint } from './domainFieldHints';
