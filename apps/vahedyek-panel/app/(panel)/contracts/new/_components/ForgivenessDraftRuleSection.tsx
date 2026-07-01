'use client';

import { useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronLeft, Save } from 'lucide-react';
import { Input } from '@repo/ui';
import { PENALTY_ITEMS } from './penaltiesConfig';
import { TagPills } from './ContractFormPrimitives';
import type { ContractRuleState } from '../../../../lib/businessContractRules';

type ForgivenessScope = 'whole' | 'itemized';
type ForgivenessValueMode = 'amount' | 'percent';

type ForgivenessEntry = {
  id: string;
  scope: ForgivenessScope;
  title: string;
  description: string;
};

type ForgivenessEntryValues = Record<string, string | boolean>;

const WHOLE_ENTRY: ForgivenessEntry = {
  id: 'whole-contract',
  scope: 'whole',
  title: 'بخشودگی روی کل قرارداد',
  description: 'شرایط و سقف بخشودگی جرایم برای کل قرارداد را مشخص می‌کند.',
};

const ITEMIZED_ENTRIES: ForgivenessEntry[] = PENALTY_ITEMS.filter((item) => item.id !== 'discount-cancelled').map((item) => ({
  id: item.id,
  scope: 'itemized',
  title: item.title.replace(/جریمه/g, 'بخشودگی'),
  description: item.description.replace(/جریمه/g, 'بخشودگی جریمه'),
}));

const ENTRIES = [WHOLE_ENTRY, ...ITEMIZED_ENTRIES];

const VALUE_MODE_OPTIONS: Array<{ value: ForgivenessValueMode; label: string }> = [
  { value: 'amount', label: 'مبلغ ثابت' },
  { value: 'percent', label: 'درصدی' },
];

const FORGIVENESS_ENTRY_VALUE_KEYS = [
  'forgiveMaxDelayCount',
  'forgiveValueMode',
  'forgiveMinValue',
  'forgiveMaxValue',
  'forgiveOutsideBuyerControl',
  'forgiveManagerApproval',
] as const;

function formatInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function Switch({ checked, disabled = false, onChange }: { checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      className={`business-switch shrink-0 ${disabled ? 'opacity-55 ring-2 ring-slate-200 grayscale' : ''}`}
      aria-disabled={disabled}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="business-switch-option is-on">فعال</span>
      <span className="business-switch-option is-off">غیرفعال</span>
    </button>
  );
}

function FieldBlock({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2 text-right">
      <label className="block text-sm font-bold text-slate-700">{label}</label>
      {children}
      {hint ? <p className="text-xs leading-6 text-slate-500">{hint}</p> : null}
    </div>
  );
}

function WarningDialog({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4" dir="rtl" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-[8px] border border-amber-200 bg-white p-6 text-right shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-base font-black text-slate-900">انتخاب نوع بخشودگی ممکن نیست</h3>
            <p className="text-sm font-medium leading-7 text-slate-600">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="rounded-[8px] bg-teal-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-teal-800">
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
}

function getEntry(values: ContractRuleState['values']) {
  const entryId = String(values.forgiveEntryId || WHOLE_ENTRY.id);
  return ENTRIES.find((entry) => entry.id === entryId) ?? WHOLE_ENTRY;
}

function getValueMode(values: ContractRuleState['values']): ForgivenessValueMode {
  return values.forgiveValueMode === 'percent' ? 'percent' : 'amount';
}

function formatSummary(state: ContractRuleState) {
  const valueMode = getValueMode(state.values);
  const min = String(state.values.forgiveMinValue ?? '').trim();
  const max = String(state.values.forgiveMaxValue ?? '').trim();
  const unit = valueMode === 'percent' ? 'درصد' : 'تومان';
  if (!min && !max) return 'هنوز بخشودگی‌ای ثبت نشده است.';
  if (min && max) return `خلاصه: ${min} تا ${max} ${unit}`;
  return `خلاصه: ${max || min} ${unit}`;
}

function parseJsonArray(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function parseEntryValuesMap(value: unknown): Record<string, ForgivenessEntryValues> {
  if (typeof value !== 'string' || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter(([, entryValue]) => entryValue && typeof entryValue === 'object' && !Array.isArray(entryValue))
        .map(([entryId, entryValue]) => [entryId, entryValue as ForgivenessEntryValues]),
    );
  } catch {
    return {};
  }
}

function getEntrySnapshot(values: ContractRuleState['values']) {
  return FORGIVENESS_ENTRY_VALUE_KEYS.reduce<ForgivenessEntryValues>((snapshot, key) => {
    snapshot[key] = values[key] ?? (key === 'forgiveValueMode' ? 'amount' : '');
    return snapshot;
  }, {});
}

function serializeEntryValuesMap(map: Record<string, ForgivenessEntryValues>) {
  return JSON.stringify(map);
}

function serializeEnabledEntryIds(ids: string[]) {
  return JSON.stringify(Array.from(new Set(ids.filter((id) => ITEMIZED_ENTRIES.some((entry) => entry.id === id)))));
}

function getEnabledEntryIds(state: ContractRuleState) {
  const currentEntry = getEntry(state.values);
  if (state.active && currentEntry.scope === 'whole') return [];
  const persistedIds = parseJsonArray(state.values.forgiveEnabledEntryIds);
  if (persistedIds.length > 0) return persistedIds.filter((id) => ITEMIZED_ENTRIES.some((entry) => entry.id === id));
  if (state.active && currentEntry.scope === 'itemized' && state.values.forgiveAllowed) return [currentEntry.id];
  return [];
}

export function ForgivenessDraftRuleSection({
  state,
  onValueChange,
  onSave,
}: {
  state: ContractRuleState;
  onValueChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
}) {
  const currentEntry = getEntry(state.values);
  const valueMode = getValueMode(state.values);
  const enabledEntryIds = getEnabledEntryIds(state);
  const wholeEnabled = state.active && currentEntry.scope === 'whole';
  const activeCount = wholeEnabled ? 1 : enabledEntryIds.length;
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);

  const writeCurrentEntrySnapshot = () => {
    if (currentEntry.scope !== 'itemized') return parseEntryValuesMap(state.values.forgiveEntryValues);
    const nextMap = {
      ...parseEntryValuesMap(state.values.forgiveEntryValues),
      [currentEntry.id]: getEntrySnapshot(state.values),
    };
    onValueChange('forgiveEntryValues', serializeEntryValuesMap(nextMap));
    return nextMap;
  };

  const loadEntryValues = (entry: ForgivenessEntry, entryValuesMap: Record<string, ForgivenessEntryValues>) => {
    const nextValues = entryValuesMap[entry.id] ?? {};
    FORGIVENESS_ENTRY_VALUE_KEYS.forEach((key) => {
      if (key in nextValues) {
        onValueChange(key, nextValues[key]);
      } else if (key === 'forgiveValueMode') {
        onValueChange(key, 'amount');
      } else if (key === 'forgiveOutsideBuyerControl' || key === 'forgiveManagerApproval') {
        onValueChange(key, false);
      } else {
        onValueChange(key, '');
      }
    });
  };

  const selectEntry = (entry: ForgivenessEntry, active = true) => {
    setSelectionNotice(null);
    const entryValuesMap = writeCurrentEntrySnapshot();
    onValueChange('active', active);
    onValueChange('forgiveScope', entry.scope);
    onValueChange('forgiveEntryId', entry.id);
    onValueChange('forgiveAllowed', active);
    if (entry.scope === 'whole') {
      onValueChange('forgiveEnabledEntryIds', serializeEnabledEntryIds([]));
      return;
    }
    onValueChange('forgiveEnabledEntryIds', serializeEnabledEntryIds(active ? [...enabledEntryIds, entry.id] : enabledEntryIds));
    loadEntryValues(entry, entryValuesMap);
  };

  const deactivateEntry = (entry: ForgivenessEntry) => {
    setSelectionNotice(null);
    if (entry.scope === 'whole') {
      if (!wholeEnabled) return;
      onValueChange('active', false);
      onValueChange('forgiveAllowed', false);
      onValueChange('forgiveEnabledEntryIds', serializeEnabledEntryIds([]));
      return;
    }

    const nextEnabledEntryIds = enabledEntryIds.filter((id) => id !== entry.id);
    onValueChange('forgiveEnabledEntryIds', serializeEnabledEntryIds(nextEnabledEntryIds));

    if (currentEntry.id === entry.id) {
      const nextEntry = nextEnabledEntryIds.length > 0 ? ITEMIZED_ENTRIES.find((item) => item.id === nextEnabledEntryIds[0]) : null;
      if (nextEntry) {
        const entryValuesMap = writeCurrentEntrySnapshot();
        onValueChange('forgiveEntryId', nextEntry.id);
        onValueChange('forgiveScope', 'itemized');
        loadEntryValues(nextEntry, entryValuesMap);
      } else {
        onValueChange('active', false);
        onValueChange('forgiveAllowed', false);
      }
    }
  };

  const getSelectionConflictMessage = (entry: ForgivenessEntry) => {
    if (currentEntry.id === entry.id) return '';
    if (wholeEnabled && entry.scope === 'itemized') {
      return 'برای فعال‌سازی این مورد، ابتدا بخشودگی روی کل قرارداد را غیرفعال کنید. بخشودگی یا روی کل قرارداد اعمال می‌شود یا به‌صورت بخش‌به‌بخش تعریف می‌شود.';
    }
    if (enabledEntryIds.length > 0 && entry.scope === 'whole') {
      return 'برای فعال‌سازی بخشودگی روی کل قرارداد، ابتدا بخشودگی بخش‌به‌بخش فعلی را غیرفعال کنید. بخشودگی یا روی کل قرارداد اعمال می‌شود یا به‌صورت بخش‌به‌بخش تعریف می‌شود.';
    }
    return '';
  };

  const trySelectEntry = (entry: ForgivenessEntry) => {
    const conflictMessage = getSelectionConflictMessage(entry);
    if (conflictMessage) {
      setSelectionNotice(conflictMessage);
      return;
    }
    selectEntry(entry, true);
  };

  const updateEntryValue = (key: string, value: string | boolean) => {
    onValueChange(key, value);
    if (currentEntry.scope !== 'itemized' || !enabledEntryIds.includes(currentEntry.id)) return;
    const nextMap = {
      ...parseEntryValuesMap(state.values.forgiveEntryValues),
      [currentEntry.id]: {
        ...getEntrySnapshot(state.values),
        [key]: value,
      },
    };
    onValueChange('forgiveEntryValues', serializeEntryValuesMap(nextMap));
  };

  return (
    <div className="overflow-hidden rounded-[8px] border border-gray-200 bg-white text-right shadow-sm" dir="rtl">
      {selectionNotice ? <WarningDialog message={selectionNotice} onClose={() => setSelectionNotice(null)} /> : null}
      <div className="space-y-6 p-5 sm:p-8">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">فهرست انواع بخشودگی</h2>
            <span className="text-xs text-slate-400">{activeCount} مورد فعال</span>
          </div>

          <div className="space-y-3">
            {ENTRIES.map((entry) => {
              const isExpanded = state.active && currentEntry.id === entry.id;
              const isEnabled = entry.scope === 'whole' ? wholeEnabled : enabledEntryIds.includes(entry.id);
              const isBlocked = Boolean(getSelectionConflictMessage(entry));

              return (
                <div
                  key={entry.id}
                  className={`overflow-hidden rounded-[8px] border transition ${
                    isExpanded
                      ? 'border-cyan-200 bg-cyan-50/40'
                      : isBlocked
                        ? 'border-slate-200 bg-slate-50/80 opacity-65 grayscale'
                        : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => trySelectEntry(entry)}
                        aria-disabled={isBlocked}
                        className={`flex min-w-0 flex-1 flex-col gap-3 text-right sm:flex-row-reverse sm:items-center sm:gap-4 ${
                          isBlocked ? 'cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-800">{entry.title}</h3>
                            {isBlocked ? (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                ابتدا مورد فعال را غیرفعال کنید
                              </span>
                            ) : null}
                            {isEnabled ? (
                              <span className="rounded-full border border-cyan-200 bg-white px-2 py-0.5 text-[11px] font-medium text-cyan-700">
                                تنظیم شده
                              </span>
                            ) : (
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                غیرفعال
                              </span>
                            )}
                          </div>
                          <p className="text-xs leading-6 text-slate-500">{entry.description}</p>
                        </div>
                        <ChevronLeft className={`h-5 w-5 shrink-0 text-slate-400 transition ${isExpanded ? '-rotate-90' : ''}`} aria-hidden />
                      </button>

                      <Switch
                        checked={isEnabled}
                        disabled={isBlocked}
                        onChange={(checked) => {
                          if (checked) trySelectEntry(entry);
                          else deactivateEntry(entry);
                        }}
                      />
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="border-t border-cyan-100 bg-white/80 p-4">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xs font-semibold text-slate-500">{formatSummary(state)}</div>
                        </div>

                        <FieldBlock label="حداکثر دفعات تاخیر قابل بخشودگی در یک قرارداد">
                          <Input
                            value={String(state.values.forgiveMaxDelayCount ?? '')}
                            onChange={(event) => updateEntryValue('forgiveMaxDelayCount', event.target.value)}
                            placeholder="مثال: 3"
                          />
                        </FieldBlock>

                        <FieldBlock label="نوع مقدار بخشودگی">
                          <TagPills options={VALUE_MODE_OPTIONS} value={valueMode} onChange={(value) => updateEntryValue('forgiveValueMode', value)} />
                        </FieldBlock>

                        <div className="grid gap-4 md:grid-cols-2">
                          <FieldBlock
                            label={valueMode === 'percent' ? 'حداقل درصد جریمه قابل بخشش' : 'حداقل مبلغ جریمه قابل بخشش'}
                            hint="حداقل مقداری که در صورت اعمال بخشودگی می‌تواند کاهش داده شود."
                          >
                            <Input
                              value={String(state.values.forgiveMinValue ?? '')}
                              onChange={(event) =>
                                updateEntryValue('forgiveMinValue', valueMode === 'amount' ? formatInput(event.target.value) : event.target.value)
                              }
                              placeholder={valueMode === 'percent' ? 'مثال: 10' : 'مثال: 1,000,000'}
                            />
                          </FieldBlock>

                          <FieldBlock
                            label={valueMode === 'percent' ? 'حداکثر درصد جریمه قابل بخشش' : 'حداکثر مبلغ جریمه قابل بخشش'}
                            hint="حداکثر مقداری که مجاز به بخشودگی است."
                          >
                            <Input
                              value={String(state.values.forgiveMaxValue ?? '')}
                              onChange={(event) =>
                                updateEntryValue('forgiveMaxValue', valueMode === 'amount' ? formatInput(event.target.value) : event.target.value)
                              }
                              placeholder={valueMode === 'percent' ? 'مثال: 30' : 'مثال: 10,000,000'}
                            />
                          </FieldBlock>
                        </div>

                        <div className="space-y-4 rounded-[8px] border border-cyan-100 bg-cyan-50 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">تاخیر خارج از اختیار خریدار</h4>
                              <p className="mt-1 text-xs leading-6 text-slate-500">
                                اگر تاخیر خارج از اختیار خریدار تشخیص داده شود، امکان اعمال بخشودگی فراهم است.
                              </p>
                            </div>
                            <Switch
                              checked={Boolean(state.values.forgiveOutsideBuyerControl)}
                              onChange={(checked) => updateEntryValue('forgiveOutsideBuyerControl', checked)}
                            />
                          </div>
                        </div>

                        <div className="space-y-4 rounded-[8px] border border-cyan-100 bg-cyan-50 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">تایید مدیر برای بخشودگی‌های بزرگ</h4>
                              <p className="mt-1 text-xs leading-6 text-slate-500">
                                بخشودگی‌های بالاتر از حد مشخص فقط با تایید نقش‌های مدیریتی انجام می‌شود.
                              </p>
                            </div>
                            <Switch
                              checked={Boolean(state.values.forgiveManagerApproval)}
                              onChange={(checked) => updateEntryValue('forgiveManagerApproval', checked)}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={onSave}
                            className="inline-flex items-center gap-2 rounded-[8px] bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
                          >
                            <Save className="h-4 w-4" />
                            ذخیره بخشودگی
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}


