import type { ContractRuleState, RuleConfig } from '../businessContractRules';
import {
  compareBusinessSetting,
  formatBusinessSettingValue,
  parseBusinessSettingNumber,
} from '../contractSettingsReference';

export type DomainFieldHint = {
  status: 'equal' | 'different' | 'missing' | 'idle';
  settingsLabel: string | null;
};

function normalizeComparable(value: unknown): string | boolean | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  const asString = String(value).replace(/,/g, '').replace(/[٬\s]/g, '').trim();
  return asString || null;
}

/** Format a real settings value for the "در تنظیمات: …" pill. Returns null when unset. */
export function formatFieldSettingsLabel(value: unknown): string | null {
  const normalized = normalizeComparable(value);
  if (normalized === null) return null;
  if (typeof normalized === 'boolean') return formatBusinessSettingValue(String(normalized));
  const asNumber = parseBusinessSettingNumber(normalized);
  if (asNumber !== null && String(normalized).match(/^\d/)) {
    return formatBusinessSettingValue(String(normalized));
  }
  return formatBusinessSettingValue(String(normalized));
}

/**
 * Build equal / missing / different field hint from comparable sides.
 * - both null → equal
 * - only settings null → missing
 * - equal values → equal
 * - else → different with real settings label (never "ثبت نشده")
 */
export function buildFieldHint(
  refRaw: string | boolean | null,
  curRaw: string | boolean | null,
  settingsLabel: string | null,
): DomainFieldHint {
  if (refRaw === null && curRaw === null) {
    return { status: 'equal', settingsLabel: null };
  }
  if (refRaw === null) {
    return { status: 'missing', settingsLabel: null };
  }
  const comparison = compareBusinessSetting(refRaw, curRaw);
  const equal = comparison.status === 'equal' || (refRaw === null && curRaw === null);
  if (equal) {
    return { status: 'equal', settingsLabel: null };
  }
  return { status: 'different', settingsLabel };
}

/**
 * Generic per-field hints for a RuleConfig: activeTab + each field on the reference active tab.
 * Returns empty object when reference is missing or inactive.
 */
export function resolveActiveTabFieldHints(
  config: RuleConfig,
  reference: ContractRuleState | null | undefined,
  current: ContractRuleState | null | undefined,
  options?: { requireReferenceActive?: boolean },
): Record<string, DomainFieldHint> {
  if (!reference) return {};
  if (options?.requireReferenceActive !== false && !reference.active) return {};

  const referenceTab = config.tabs.find((tab) => tab.id === reference.activeTab) ?? config.tabs[0] ?? null;
  const hints: Record<string, DomainFieldHint> = {};

  if (!referenceTab) {
    hints.activeTab = { status: 'missing', settingsLabel: null };
  } else if (referenceTab.id === (current?.activeTab || '')) {
    hints.activeTab = { status: 'equal', settingsLabel: null };
  } else {
    hints.activeTab = { status: 'different', settingsLabel: referenceTab.title ?? null };
  }
  hints.mode = hints.activeTab;

  if (!referenceTab) return hints;

  for (const field of referenceTab.fields) {
    const refRaw = normalizeComparable(reference.values[field.key]);
    const curRaw = normalizeComparable(current?.values?.[field.key]);
    hints[field.key] = buildFieldHint(refRaw, curRaw, formatFieldSettingsLabel(reference.values[field.key]));
  }

  return hints;
}

export function getDomainFieldHint(
  hints: Record<string, DomainFieldHint> | Partial<Record<string, DomainFieldHint>>,
  key: string,
): DomainFieldHint {
  return hints[key] ?? { status: 'idle', settingsLabel: null };
}
