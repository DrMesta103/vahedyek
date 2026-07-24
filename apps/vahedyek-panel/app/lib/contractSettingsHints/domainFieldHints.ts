import type { ContractRuleState, RuleConfig } from '../businessContractRules';
import {
  compareBusinessSetting,
  formatBusinessSettingValue,
  parseBusinessSettingNumber,
} from '../contractSettingsReference';

export type DomainFieldHint = {
  status: 'equal' | 'different' | 'idle';
  settingsLabel: string | null;
};

function normalizeComparable(value: unknown): string | boolean | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  const asString = String(value).replace(/,/g, '').replace(/[٬\s]/g, '').trim();
  return asString || null;
}

function formatLabel(value: unknown): string {
  const normalized = normalizeComparable(value);
  if (normalized === null) return 'ثبت نشده';
  if (typeof normalized === 'boolean') return formatBusinessSettingValue(String(normalized));
  const asNumber = parseBusinessSettingNumber(normalized);
  if (asNumber !== null && String(normalized).match(/^\d/)) {
    return formatBusinessSettingValue(String(normalized));
  }
  return formatBusinessSettingValue(String(normalized));
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

  const modeEqual = Boolean(referenceTab) && referenceTab?.id === (current?.activeTab || '');
  hints.activeTab = {
    status: modeEqual ? 'equal' : 'different',
    settingsLabel: referenceTab?.title ?? null,
  };
  hints.mode = hints.activeTab;

  if (!referenceTab) return hints;

  for (const field of referenceTab.fields) {
    const refRaw = normalizeComparable(reference.values[field.key]);
    const curRaw = normalizeComparable(current?.values?.[field.key]);
    const comparison = compareBusinessSetting(refRaw, curRaw);
    const equal = comparison.status === 'equal' || (refRaw === null && curRaw === null);
    hints[field.key] = {
      status: equal ? 'equal' : 'different',
      settingsLabel: formatLabel(reference.values[field.key]),
    };
  }

  return hints;
}

export function getDomainFieldHint(
  hints: Record<string, DomainFieldHint> | Partial<Record<string, DomainFieldHint>>,
  key: string,
): DomainFieldHint {
  return hints[key] ?? { status: 'idle', settingsLabel: null };
}
