'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { StickySubmitBar, Input } from '@repo/ui';
import { dispatchContractFlowDirty, dispatchContractFlowSaved } from './contractFlowSignals';
import { ensureActiveDraftId } from '../../../../lib/contractDraftClient';
import { FieldGroup, SectionCard, SectionHeader } from './ContractFormPrimitives';
import { getContractTechnicalSpecs, upsertContractTechnicalSpecs, type TechnicalSpecItem } from '../../../../actions/contractSteps789';

const DEFAULT_SPECS: TechnicalSpecItem[] = [
  { id: 'structure', systemKey: 'structure', title: 'نوع سازه', standard: '', location: '' },
  { id: 'facade', systemKey: 'facade', title: 'متریال نما', standard: '', location: '' },
  { id: 'flooring', systemKey: 'flooring', title: 'کف‌پوش', standard: '', location: '' },
  { id: 'hvac', systemKey: 'hvac', title: 'سیستم سرمایش/گرمایش', standard: '', location: '' },
];

function normalizeInitial(items: TechnicalSpecItem[] | null) {
  const base = items?.length ? items : DEFAULT_SPECS;
  const seen = new Set(base.map((i) => i.systemKey).filter(Boolean));
  const missing = DEFAULT_SPECS.filter((i) => i.systemKey && !seen.has(i.systemKey));
  return [...base, ...missing].map((item, idx) => ({
    ...item,
    id: item.id || `${item.systemKey ?? 'custom'}-${idx + 1}`,
    title: item.title ?? '',
    standard: item.standard ?? '',
    location: item.location ?? '',
  }));
}

export function TechnicalSpecsStep({ title }: { title: string }) {
  const initialSnapshotRef = useRef('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [specs, setSpecs] = useState<TechnicalSpecItem[]>(DEFAULT_SPECS);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStandard, setNewStandard] = useState('');
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const remote = await getContractTechnicalSpecs(id);
        if (!mounted) return;
        setDraftId(id);
        if (remote.ok) {
          setSpecs(normalizeInitial(remote.specs));
        } else {
          setFormError('message' in remote ? remote.message : 'بارگذاری اطلاعات انجام نشد.');
          setSpecs(normalizeInitial(null));
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
        .map((s) => ({ ...s, title: s.title.trim(), standard: s.standard.trim(), location: s.location.trim() }))
        .filter((s) => s.title),
    [specs],
  );

  const startAdd = () => {
    setAdding(true);
    setNewTitle('');
    setNewStandard('');
    setNewLocation('');
  };

  const confirmAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    setSpecs((current) => [
      ...current,
      {
        id: `custom-${crypto.randomUUID()}`,
        title,
        standard: newStandard.trim(),
        location: newLocation.trim(),
      },
    ]);
    setAdding(false);
    setNewTitle('');
    setNewStandard('');
    setNewLocation('');
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
      dispatchContractFlowSaved('technicalSpecs', Date.now(), payload);
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
          description="مشخص می‌کند چه متریالی در ساخت این واحد به کار رفته است. مواد و مصالح استفاده‌شده در بخش‌های مختلف واحد از جمله نما، سقف، درب‌ها و سایر جزئیات باید دقیق انتخاب شوند. این اطلاعات در قرارداد ثبت شده و تعهدات سازنده را مشخص می‌کند."
        />

        <div className="space-y-4 px-5 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={startAdd}
              className="app-button rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
            >
              ثبت مشخصات فنی
            </button>
          </div>

          {adding ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FieldGroup label="عنوان مشخصه">
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="مثال: متریال نما" />
                </FieldGroup>
                <FieldGroup label="شرح/استاندارد فنی">
                  <Input value={newStandard} onChange={(e) => setNewStandard(e.target.value)} placeholder="مثال: سنگ تراورتن" />
                </FieldGroup>
                <FieldGroup label="محل اجرا">
                  <Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="مثال: پذیرایی" />
                </FieldGroup>
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  className="app-button rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
                  onClick={() => setAdding(false)}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  className="app-button app-button-primary rounded-xl px-4 py-2 text-[13px] font-bold"
                  onClick={confirmAdd}
                >
                  افزودن
                </button>
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-right text-[13px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-600">عنوان مشخصه</th>
                  <th className="px-4 py-3 font-bold text-slate-600">شرح/استاندارد فنی</th>
                  <th className="px-4 py-3 font-bold text-slate-600">محل اجرا</th>
                  <th className="w-16 px-4 py-3 text-left font-bold text-slate-600"> </th>
                </tr>
              </thead>
              <tbody>
                {specs.length ? (
                  specs.map((spec) => (
                    <tr key={spec.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <Input
                          value={spec.title}
                          onChange={(e) => setSpecs((c) => c.map((s) => (s.id === spec.id ? { ...s, title: e.target.value } : s)))}
                          placeholder="عنوان..."
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={spec.standard}
                          onChange={(e) => setSpecs((c) => c.map((s) => (s.id === spec.id ? { ...s, standard: e.target.value } : s)))}
                          placeholder="شرح..."
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={spec.location}
                          onChange={(e) => setSpecs((c) => c.map((s) => (s.id === spec.id ? { ...s, location: e.target.value } : s)))}
                          placeholder="محل..."
                        />
                      </td>
                      <td className="px-4 py-3 text-left">
                        {spec.systemKey ? null : (
                          <button
                            type="button"
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                            onClick={() => setSpecs((c) => c.filter((s) => s.id !== spec.id))}
                          >
                            حذف
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      هنوز مشخصه‌ای ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

