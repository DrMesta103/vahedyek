'use client';

import { useEffect, useState } from 'react';
import { Input } from '@repo/ui';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppendixEditor } from './AppendixEditorContext';
import { normalizeTechnicalSpecGroups } from '../../../lib/appendixPayloads';
import type { AppendixMaterialSpecsChangePayload, AppendixTechnicalSpecGroup } from '../../../types/contract';

type TechnicalSpecItem = {
  id: string;
  title: string;
  standard: string;
  location: string;
  systemKey?: string;
};

type DialogState =
  | {
      mode: 'create';
    }
  | {
      mode: 'edit';
      groupId: string;
    }
  | null;

type GroupFormState = {
  title: string;
  selectedSpecIds: string[];
};

type AppendixMaterialSpecsChangeEditorProps = {
  value?: AppendixMaterialSpecsChangePayload;
  onChange?: (value: AppendixMaterialSpecsChangePayload) => void;
};

function normalizeSpecItem(item: Partial<TechnicalSpecItem>, index: number): TechnicalSpecItem {
  return {
    id: item.id?.trim() || `spec-${index + 1}`,
    title: item.title?.trim() || '',
    standard: item.standard?.trim() || '',
    location: item.location?.trim() || '',
    systemKey: item.systemKey?.trim() || undefined,
  };
}

function normalizeProjectSpecs(items: Array<Partial<TechnicalSpecItem> | null | undefined>) {
  return items.map((item, index) => normalizeSpecItem(item ?? {}, index)).filter((item) => item.title);
}

async function fetchProjectTechnicalSpecs(): Promise<Array<Partial<TechnicalSpecItem>>> {
  const response = await fetch('/api/business-settings/project/technical-specs', { cache: 'no-store' });
  const data = (await response.json()) as { technicalSpecs?: unknown; message?: string };
  if (!response.ok) throw new Error(data.message ?? 'دریافت مشخصات فنی پروژه ناموفق بود.');
  return Array.isArray(data.technicalSpecs) ? (data.technicalSpecs as Array<Partial<TechnicalSpecItem>>) : [];
}

function getGroupSpecs(group: AppendixTechnicalSpecGroup, projectSpecs: TechnicalSpecItem[]) {
  return group.selectedSpecIds
    .map((specId) => projectSpecs.find((spec) => spec.id === specId))
    .filter((item): item is TechnicalSpecItem => Boolean(item));
}

function GroupRow({ spec }: { spec: TechnicalSpecItem }) {
  return (
    <div className="rounded-[18px] border border-slate-300 bg-slate-100/90 px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      <div className="text-[14px] font-black text-slate-700">{spec.title}</div>
      <div className="mt-0.5 text-[12px] leading-5 text-slate-500">{spec.standard || '—'}</div>
    </div>
  );
}

export function AppendixMaterialSpecsChangeEditor({ value: externalValue, onChange }: AppendixMaterialSpecsChangeEditorProps = {}) {
  const { payloads, updateTagPayload } = useAppendixEditor();
  const contextPayload = (payloads['material-specs-change'] ?? { specs: [] }) as AppendixMaterialSpecsChangePayload;
  const payload = externalValue ?? contextPayload;
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [projectSpecs, setProjectSpecs] = useState<TechnicalSpecItem[]>([]);
  const [groups, setGroups] = useState<AppendixTechnicalSpecGroup[]>(normalizeTechnicalSpecGroups(payload.specs ?? payload.groups));
  const [dialog, setDialog] = useState<DialogState>(null);
  const [form, setForm] = useState<GroupFormState>({ title: '', selectedSpecIds: [] });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const projectTechnicalSpecs = await fetchProjectTechnicalSpecs().catch(() => []);
        if (!mounted) return;
        setProjectSpecs(normalizeProjectSpecs(projectTechnicalSpecs));
      } catch (error) {
        if (mounted) setFormError(error instanceof Error ? error.message : 'دریافت مشخصات فنی پروژه ناموفق بود.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const nextGroups = normalizeTechnicalSpecGroups(payload.specs ?? payload.groups);
    setGroups((current) => (JSON.stringify(current) === JSON.stringify(nextGroups) ? current : nextGroups));
  }, [payload.groups, payload.specs]);

  useEffect(() => {
    if (!dialog) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDialog(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog]);

  function syncPayload(nextGroups: AppendixTechnicalSpecGroup[]) {
    const nextPayload = {
      ...payload,
      specs: nextGroups,
    };

    if (onChange) {
      onChange(nextPayload);
      return;
    }

    updateTagPayload('material-specs-change', nextPayload);
  }

  function openCreateDialog() {
    setForm({ title: '', selectedSpecIds: [] });
    setDialog({ mode: 'create' });
  }

  function openEditDialog(group: AppendixTechnicalSpecGroup) {
    setForm({
      title: group.title,
      selectedSpecIds: [...group.selectedSpecIds],
    });
    setDialog({ mode: 'edit', groupId: group.id });
  }

  function closeDialog() {
    setDialog(null);
    setForm({ title: '', selectedSpecIds: [] });
  }

  function toggleSpec(specId: string) {
    setForm((current) => ({
      ...current,
      selectedSpecIds: current.selectedSpecIds.includes(specId)
        ? current.selectedSpecIds.filter((item) => item !== specId)
        : [...current.selectedSpecIds, specId],
    }));
  }

  function removeGroup(groupId: string) {
    const group = groups.find((item) => item.id === groupId);
    if (!group) return;
    if (!window.confirm(`گروه "${group.title}" حذف شود؟`)) return;
    const nextGroups = groups.filter((item) => item.id !== groupId);
    setGroups(nextGroups);
    syncPayload(nextGroups);
  }

  function submitDialog() {
    const title = form.title.trim();
    const selectedSpecIds = [...new Set(form.selectedSpecIds)].filter(Boolean);
    if (!title || !selectedSpecIds.length) return;

    const nextGroups =
      dialog?.mode === 'edit'
        ? groups.map((group) =>
            group.id === dialog.groupId
              ? {
                  ...group,
                  title,
                  selectedSpecIds,
                }
              : group,
          )
        : [
            ...groups,
            {
              id: `group-${crypto.randomUUID()}`,
              title,
              selectedSpecIds,
            },
          ];

    setGroups(nextGroups);
    syncPayload(nextGroups);
    closeDialog();
  }

  const visibleGroups = groups.map((group) => ({
    ...group,
    specs: getGroupSpecs(group, projectSpecs),
  }));

  return (
    <div className="space-y-4" dir="rtl">
      {formError ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
          {formError}
        </div>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="max-w-[760px] text-right">
            <h2 className="text-[24px] font-black text-slate-700">مشخصات فنی پروژه</h2>
            <p className="mt-2 text-[13px] leading-7 text-slate-500">
              در این بخش برای هر گروه، مشخصه فنی بسازید و سپس از بین مشخصه‌های فنی تعریف‌شده در مجتمع، موارد مرتبط را انتخاب کنید.
            </p>
          </div>
          <button type="button" onClick={openCreateDialog} className="business-blocks-add">
            <span>ثبت مشخصه فنی</span>
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {loading ? <div className="business-blocks-state">در حال دریافت مشخصات فنی...</div> : null}
        {!loading && !visibleGroups.length ? (
          <div className="business-blocks-state">
            هنوز گروهی ثبت نشده است. برای شروع، یک گروه مشخصه فنی بسازید و موارد مرتبط را از فهرست زیر انتخاب کنید.
          </div>
        ) : null}

        {!loading ? (
          <div className="mt-4 space-y-3">
            {visibleGroups.map((group) => (
              <article key={group.id} className="rounded-[24px] border border-slate-300/80 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="text-right">
                    <div className="text-[20px] font-black text-slate-700">{group.title}</div>
                    <div className="mt-1 text-[13px] text-slate-500">{group.specs.length} مشخصه انتخاب شده</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => openEditDialog(group)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-cyan-600 transition hover:bg-cyan-50 hover:text-cyan-700"
                      aria-label={`ویرایش ${group.title}`}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeGroup(group.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                      aria-label={`حذف ${group.title}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {group.specs.length ? (
                    group.specs.map((spec) => <GroupRow key={spec.id} spec={spec} />)
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-right text-[13px] text-slate-400">
                      هنوز مشخصه‌ای برای این گروه انتخاب نشده است.
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {dialog ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={closeDialog}
        >
          <div
            className="w-full max-w-[720px] overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.32)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="technical-specs-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-8 pt-8 text-right">
              <h2 id="technical-specs-dialog-title" className="text-[26px] font-black leading-10 text-slate-700">
                {dialog.mode === 'edit' ? 'ویرایش مشخصه فنی پروژه' : 'افزودن مشخصه فنی پروژه'}
              </h2>
              <p className="mt-4 text-[13px] leading-7 text-slate-600">
                عنوان گروه را وارد کنید و سپس از بین مشخصه‌های فنی پروژه، موارد مرتبط را انتخاب کنید.
              </p>
            </div>

            <div className="grid gap-5 px-8 pb-8 pt-6">
              <label className="grid gap-2 text-right">
                <span className="text-[15px] font-bold text-slate-600">
                  عنوان <span className="text-rose-500">*</span>
                </span>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="مثلاً: تاسیسات برقی"
                  autoFocus
                  maxLength={120}
                  className="h-12 rounded-[16px] border-slate-300 px-4 text-[14px] font-medium text-slate-700 placeholder:text-slate-400 focus:border-[color:var(--dark-teal)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--dark-teal)_12%,transparent)]"
                />
              </label>

              <div className="grid gap-3 text-right">
                <div>
                  <h3 className="text-[18px] font-black text-slate-700">انتخاب مشخصه‌های فنی</h3>
                  <p className="mt-1 text-[12px] leading-6 text-slate-500">
                    برای هر گروه می‌توانید چند مشخصه فنی انتخاب کنید. موارد انتخابی به همان شکل داخل متمم ذخیره می‌شوند.
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-3">
                  <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1">
                    {projectSpecs.length ? (
                      projectSpecs.map((spec) => {
                        const active = form.selectedSpecIds.includes(spec.id);
                        return (
                          <button
                            key={spec.id}
                            type="button"
                            onClick={() => toggleSpec(spec.id)}
                            className={`flex w-full items-center gap-3 rounded-[18px] border px-4 py-3 text-right transition ${
                              active
                                ? 'border-[color-mix(in_srgb,var(--dark-teal)_45%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_10%,white)]'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 ${
                                active ? 'border-[var(--dark-teal)] bg-[var(--dark-teal)]' : 'border-slate-400 bg-white'
                              }`}
                            >
                              {active ? <span className="text-[11px] font-black leading-none text-white">✓</span> : null}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[14px] font-black text-slate-700">{spec.title}</div>
                              <div className="mt-0.5 text-[12px] leading-5 text-slate-500">{spec.standard || '—'}</div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-[18px] border border-dashed border-slate-200 bg-white px-4 py-5 text-right text-[13px] text-slate-400">
                        هنوز مشخصه‌ای در اطلاعات مجتمع ثبت نشده است.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-8 py-6">
              <button
                type="button"
                className="text-[15px] font-bold text-slate-500 transition hover:text-slate-700"
                onClick={closeDialog}
              >
                انصراف
              </button>
              <button
                type="button"
                className="text-[15px] font-bold text-[var(--dark-teal)] transition hover:text-[color-mix(in_srgb,var(--dark-teal)_80%,black)] disabled:cursor-not-allowed disabled:opacity-40"
                onClick={submitDialog}
                disabled={!form.title.trim() || !form.selectedSpecIds.length}
              >
                ثبت
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
