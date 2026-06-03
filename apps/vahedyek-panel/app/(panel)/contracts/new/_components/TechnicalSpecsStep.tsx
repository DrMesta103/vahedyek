'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { StickySubmitBar, Input } from '@repo/ui';
import { dispatchContractFlowDirty, dispatchContractFlowSavedForDraft } from './contractFlowSignals';
import { ensureActiveDraftId } from '../../../../lib/contractDraftClient';
import { FieldGroup, SectionCard, SectionHeader } from './ContractFormPrimitives';
import { getContractTechnicalSpecs, upsertContractTechnicalSpecs, type TechnicalSpecItem } from '../../../../actions/contractSteps789';

function normalizeInitial(items: TechnicalSpecItem[] | null) {
  const base = items?.length ? items : [];
  return base.map((item, idx) => ({
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

  const [specs, setSpecs] = useState<TechnicalSpecItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

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
        .map((s) => ({ ...s, title: s.title.trim(), standard: (s.standard ?? '').trim(), location: (s.location ?? '').trim() }))
        .filter((s) => s.title),
    [specs],
  );

  const startAdd = () => {
    setAdding(true);
    setNewTitle('');
  };

  const startEdit = (spec: TechnicalSpecItem) => {
    setEditingId(spec.id);
    setEditTitle(spec.title ?? '');
  };

  const confirmAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    setSpecs((current) => [
      ...current,
      {
        id: `custom-${crypto.randomUUID()}`,
        title,
        standard: '',
        location: '',
      },
    ]);
    setAdding(false);
    setNewTitle('');
  };

  const confirmEdit = () => {
    if (!editingId) return;
    const title = editTitle.trim();
    if (!title) return;
    setSpecs((current) => current.map((s) => (s.id === editingId ? { ...s, title } : s)));
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setAdding(false)}>
              <div
                className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="text-[14px] font-extrabold text-slate-900">ثبت مشخصات فنی</div>
                  <div className="mt-1 text-[12px] text-slate-500">فقط عنوان مشخصه را وارد کنید.</div>
                </div>

                <div className="px-5 py-4">
                  <FieldGroup label="عنوان مشخصه">
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="مثال: متریال نما"
                      autoFocus
                    />
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
                  <button
                    type="button"
                    className="app-button app-button-primary rounded-xl px-4 py-2 text-[13px] font-bold"
                    onClick={confirmAdd}
                    disabled={!newTitle.trim()}
                  >
                    ثبت
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {editingId ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setEditingId(null)}>
              <div
                className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="text-[14px] font-extrabold text-slate-900">ویرایش مشخصه</div>
                  <div className="mt-1 text-[12px] text-slate-500">عنوان مشخصه را ویرایش کنید.</div>
                </div>

                <div className="px-5 py-4">
                  <FieldGroup label="عنوان مشخصه">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="عنوان..."
                      autoFocus
                    />
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
                  <button
                    type="button"
                    className="app-button app-button-primary rounded-xl px-4 py-2 text-[13px] font-bold"
                    onClick={confirmEdit}
                    disabled={!editTitle.trim()}
                  >
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
                            onClick={() => setSpecs((c) => c.filter((s) => s.id !== spec.id))}
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
              <p className="mt-1 text-[12px] text-slate-400">برای شروع روی «ثبت مشخصات فنی» کلیک کنید.</p>
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

