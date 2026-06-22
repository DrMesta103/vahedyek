'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { StickySubmitBar, Input } from '@repo/ui';
import { dispatchContractFlowDirty, dispatchContractFlowSavedForDraft } from './contractFlowSignals';
import { ensureActiveDraftId } from '../../../../lib/contractDraftClient';
import { FieldGroup, SectionCard, SectionHeader } from './ContractFormPrimitives';
import { getContractTechnicalSpecs, upsertContractTechnicalSpecs, type TechnicalSpecItem } from '../../../../actions/contractSteps789';

type ProjectTechnicalSpecs = {
  structureSystem: string;
  facadeMaterial: string;
  cabinetType: string;
  floorMaterial: string;
  coolingSystem: string;
  heatingSystem: string;
  windowType: string;
  elevatorCount: number;
  securitySystem: string;
  fireSystem: string;
  internetStatus: string;
  parkingAccess: string;
  technicalNotes: string;
};

const PROJECT_TECHNICAL_SPEC_FIELDS: Array<{ key: keyof ProjectTechnicalSpecs; title: string; location: string }> = [
  { key: 'structureSystem', title: 'سیستم سازه', location: 'اسکلت و سازه' },
  { key: 'facadeMaterial', title: 'نمای پروژه', location: 'نما' },
  { key: 'cabinetType', title: 'کابینت', location: 'آشپزخانه' },
  { key: 'floorMaterial', title: 'کف واحد', location: 'کف' },
  { key: 'coolingSystem', title: 'سیستم سرمایش', location: 'تاسیسات مکانیکی' },
  { key: 'heatingSystem', title: 'سیستم گرمایش', location: 'تاسیسات مکانیکی' },
  { key: 'windowType', title: 'پنجره‌ها', location: 'بازشوها' },
  { key: 'securitySystem', title: 'سیستم امنیتی', location: 'مشاعات و امنیت' },
  { key: 'fireSystem', title: 'سیستم حریق', location: 'ایمنی' },
  { key: 'internetStatus', title: 'زیرساخت اینترنت', location: 'زیرساخت ارتباطی' },
  { key: 'parkingAccess', title: 'دسترسی پارکینگ', location: 'پارکینگ' },
];

const PROJECT_TECHNICAL_SPECS_SHORTCUT_HREF = `/business-settings/project/technical-specs?returnTo=${encodeURIComponent('/contracts/new?section=technicalSpecs')}`;

function normalizeProjectSpecText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeProjectTechnicalSpecs(projectSpecs: TechnicalSpecItem[] | null): TechnicalSpecItem[] {
  return normalizeInitial(projectSpecs);
}

function projectTechnicalSpecsToItems(projectSpecs: ProjectTechnicalSpecs | null): TechnicalSpecItem[] {
  if (!projectSpecs) return [];

  const items = PROJECT_TECHNICAL_SPEC_FIELDS.map<TechnicalSpecItem | null>((field) => {
    const standard = normalizeProjectSpecText(projectSpecs[field.key]);
    if (!standard || standard === 'ندارد') return null;
    return {
      id: `project-${field.key}`,
      systemKey: `project-${field.key}`,
      title: field.title,
      standard,
      location: field.location,
    };
  }).filter((item): item is TechnicalSpecItem => Boolean(item));

  if (projectSpecs.elevatorCount > 0) {
    items.push({
      id: 'project-elevatorCount',
      systemKey: 'project-elevatorCount',
      title: 'آسانسور',
      standard: `${projectSpecs.elevatorCount} دستگاه`,
      location: 'مشاعات',
    });
  }

  const technicalNotes = normalizeProjectSpecText(projectSpecs.technicalNotes);
  if (technicalNotes) {
    items.push({
      id: 'project-technicalNotes',
      systemKey: 'project-technicalNotes',
      title: 'توضیحات فنی پروژه',
      standard: technicalNotes,
      location: 'عمومی',
    });
  }

  return items;
}

async function fetchProjectTechnicalSpecs(): Promise<Array<Partial<TechnicalSpecItem>>> {
  const response = await fetch('/api/business-settings/project/technical-specs', { cache: 'no-store' });
  const data = (await response.json()) as { technicalSpecs?: unknown; message?: string };
  if (!response.ok) throw new Error(data.message ?? 'دریافت مشخصات فنی پروژه ناموفق بود.');
  return Array.isArray(data.technicalSpecs) ? (data.technicalSpecs as Array<Partial<TechnicalSpecItem>>) : [];
}

function normalizeInitial(items: Array<Partial<TechnicalSpecItem> | null | undefined> | null) {
  const base = items?.length ? items : [];
  return base.map((item, idx) => {
    const spec = (item ?? {}) as Partial<TechnicalSpecItem>;
    return {
      ...spec,
      id: spec.id || `${spec.systemKey ?? 'custom'}-${idx + 1}`,
      title: spec.title ?? '',
      standard: spec.standard ?? '',
      location: spec.location ?? '',
    };
  });
}

export function TechnicalSpecsStep({ title }: { title: string }) {
  const initialSnapshotRef = useRef('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [specs, setSpecs] = useState<TechnicalSpecItem[]>([]);
  const [projectSpecs, setProjectSpecs] = useState<TechnicalSpecItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const [remote, projectTechnicalSpecs] = await Promise.all([getContractTechnicalSpecs(id), fetchProjectTechnicalSpecs().catch(() => [])]);
        if (!mounted) return;

        const projectItems = normalizeInitial(projectTechnicalSpecs);
        const remoteItems = remote.ok ? normalizeInitial(remote.specs) : [];

        setDraftId(id);
        setProjectSpecs(normalizeInitial(projectTechnicalSpecs));

        if (remote.ok) {
          setSpecs(remote.exists ? remoteItems : normalizeInitial(projectItems));
        } else {
          setFormError('message' in remote ? remote.message : 'بارگذاری اطلاعات انجام نشد.');
          setSpecs(normalizeInitial(projectItems));
        }
      } catch (error) {
        if (mounted) setFormError(error instanceof Error ? error.message : 'بارگذاری اطلاعات انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const payload = useMemo(
    () =>
      specs
        .map((s) => ({ ...s, title: s.title.trim(), standard: (s.standard ?? '').trim(), location: (s.location ?? '').trim() }))
        .filter((s) => s.title),
    [specs],
  );

  const startAdd = () => {
    setAdding(true);
    setNewTitle('');
  };

  const importFromProjectSpecs = () => {
    const projectItems = normalizeProjectTechnicalSpecs(projectSpecs);
    if (!projectItems.length) {
      setFormError('برای بارگذاری، ابتدا مشخصات فنی پروژه را در اطلاعات مجتمع ثبت کنید.');
      return;
    }
    setFormError('');
    setSpecs(normalizeInitial(projectItems));
  };

  const startEdit = (spec: TechnicalSpecItem) => {
    setEditingId(spec.id);
    setEditTitle(spec.title ?? '');
  };

  const confirmAdd = () => {
    const newSpecTitle = newTitle.trim();
    if (!newSpecTitle) return;
    setSpecs((current) => [
      ...current,
      {
        id: `custom-${crypto.randomUUID()}`,
        title: newSpecTitle,
        standard: '',
        location: '',
      },
    ]);
    setAdding(false);
    setNewTitle('');
  };

  const confirmEdit = () => {
    if (!editingId) return;
    const nextTitle = editTitle.trim();
    if (!nextTitle) return;
    setSpecs((current) => current.map((s) => (s.id === editingId ? { ...s, title: nextTitle } : s)));
    setEditingId(null);
    setEditTitle('');
  };

  const handleSubmit = async () => {
    if (!draftId) return;
    setSaving(true);
    setFormError('');
    try {
      const remote = await upsertContractTechnicalSpecs(draftId, payload);
      if (!remote.ok) throw new Error('message' in remote ? remote.message : 'ذخیره اطلاعات انجام نشد.');
      initialSnapshotRef.current = JSON.stringify(payload);
      dispatchContractFlowDirty('technicalSpecs', false);
      dispatchContractFlowSavedForDraft(draftId, 'technicalSpecs', Date.now(), payload);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ذخیره اطلاعات انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    const snapshot = JSON.stringify(payload);
    if (!initialSnapshotRef.current) {
      initialSnapshotRef.current = snapshot;
      dispatchContractFlowDirty('technicalSpecs', false);
      return;
    }
    dispatchContractFlowDirty('technicalSpecs', snapshot !== initialSnapshotRef.current);
  }, [loading, payload]);

  return (
    <div className="space-y-4" dir="rtl">
      {formError ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
          {formError}
        </div>
      ) : null}

      <SectionCard>
        <SectionHeader
          label={title}
          description="مشخص می‌کند چه متریالی در ساخت این واحد به کار رفته است. اگر مشخصات فنی در اطلاعات مجتمع ثبت شده باشد، می‌توانید آن را مستقیم وارد پیش‌نویس قرارداد کنید."
        />

        <div className="space-y-4 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 px-4 py-3">
            <div>
              <div className="text-[13px] font-extrabold text-cyan-950">اطلاعات مجتمع</div>
              <p className="mt-1 text-[12px] leading-6 text-slate-500">
                مشخصات فنی ثبت‌شده در بخش اطلاعات مجتمع، مرجع اصلی این مرحله است.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={importFromProjectSpecs}
                disabled={projectSpecs.length === 0}
                className="app-button rounded-xl border border-cyan-200 bg-white px-4 py-2 text-[13px] font-bold text-cyan-800 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                بارگذاری از اطلاعات مجتمع
              </button>
              <Link
                href={PROJECT_TECHNICAL_SPECS_SHORTCUT_HREF}
                className="rounded-xl border border-teal-200 bg-white px-4 py-2 text-[13px] font-bold text-teal-700 transition hover:bg-teal-50"
              >
                افزودن در اطلاعات مجتمع
              </Link>
              <button
                type="button"
                onClick={startAdd}
                className="app-button rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
              >
                افزودن مورد دستی
              </button>
            </div>
          </div>

          {adding ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setAdding(false)}>
              <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="text-[14px] font-extrabold text-slate-900">ثبت مشخصات فنی</div>
                  <div className="mt-1 text-[12px] text-slate-500">فقط عنوان مشخصه را وارد کنید.</div>
                </div>

                <div className="px-5 py-4">
                  <FieldGroup label="عنوان مشخصه">
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="مثال: متریال نما" autoFocus />
                  </FieldGroup>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">
                  <button
                    type="button"
                    className="app-button rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
                    onClick={() => setAdding(false)}
                  >
                    انصراف
                  </button>
                  <button type="button" className="app-button app-button-primary rounded-xl px-4 py-2 text-[13px] font-bold" onClick={confirmAdd} disabled={!newTitle.trim()}>
                    ثبت
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {editingId ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setEditingId(null)}>
              <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="text-[14px] font-extrabold text-slate-900">ویرایش مشخصه</div>
                  <div className="mt-1 text-[12px] text-slate-500">عنوان مشخصه را ویرایش کنید.</div>
                </div>

                <div className="px-5 py-4">
                  <FieldGroup label="عنوان مشخصه">
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="عنوان..." autoFocus />
                  </FieldGroup>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">
                  <button
                    type="button"
                    className="app-button rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
                    onClick={() => setEditingId(null)}
                  >
                    انصراف
                  </button>
                  <button type="button" className="app-button app-button-primary rounded-xl px-4 py-2 text-[13px] font-bold" onClick={confirmEdit} disabled={!editTitle.trim()}>
                    ذخیره
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {specs.length ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[420px] text-right text-[13px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-600">عنوان مشخصه</th>
                    <th className="w-52 px-4 py-3 text-left font-bold text-slate-600"> </th>
                  </tr>
                </thead>
                <tbody>
                  {specs.map((spec) => (
                    <tr key={spec.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{spec.title}</div>
                        {spec.standard || spec.location ? (
                          <div className="mt-1 flex flex-wrap gap-2 text-[12px] text-slate-500">
                            {spec.standard ? <span>مقدار: {spec.standard}</span> : null}
                            {spec.location ? <span>محل استفاده: {spec.location}</span> : null}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center justify-end gap-2 space-x-reverse">
                          <button
                            type="button"
                            className="app-button rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            onClick={() => startEdit(spec)}
                          >
                            ویرایش
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                            onClick={() => setSpecs((current) => current.filter((s) => s.id !== spec.id))}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-6 py-10 text-center">
              <p className="text-[13px] font-bold text-slate-600">هنوز مشخصه‌ای ثبت نشده است.</p>
              <p className="mt-1 text-[12px] text-slate-400">برای شروع، از اطلاعات مجتمع بارگذاری کنید یا یک مورد دستی اضافه کنید.</p>
            </div>
          )}
        </div>
      </SectionCard>

      <StickySubmitBar
        label="ذخیره مشخصات فنی"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving || !draftId}
        onClick={handleSubmit}
        submitId="technicalSpecs"
        embedded
      />
    </div>
  );
}
