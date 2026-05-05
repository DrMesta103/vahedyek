'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { StickySubmitBar } from '@repo/ui';
import { dispatchContractFlowDirty, dispatchContractFlowSaved } from './contractFlowSignals';
import { ensureActiveDraftId } from '../../../../lib/contractDraftClient';
import { FieldGroup, SectionCard, SectionHeader } from './ContractFormPrimitives';
import { getContractAttachments, upsertContractAttachments, type AttachmentItem } from '../../../../actions/contractSteps789';

const DEFAULT_DOCS: AttachmentItem[] = [
  { id: 'nationalId', systemKey: 'nationalId', title: 'کارت ملی', provided: false, file: null },
  { id: 'titleDeed', systemKey: 'titleDeed', title: 'سند مالکیت', provided: false, file: null },
  { id: 'maps', systemKey: 'maps', title: 'نقشه‌ها', provided: false, file: null },
  { id: 'constructionPermit', systemKey: 'constructionPermit', title: 'پروانه ساخت', provided: false, file: null },
];

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('خواندن فایل انجام نشد.'));
    reader.readAsDataURL(file);
  });
}

function normalizeInitial(items: AttachmentItem[] | null) {
  const base = items?.length ? items : DEFAULT_DOCS;
  const seen = new Set(base.map((i) => i.systemKey).filter(Boolean));
  const missing = DEFAULT_DOCS.filter((i) => i.systemKey && !seen.has(i.systemKey));
  return [...base, ...missing].map((item, idx) => ({
    ...item,
    id: item.id || `${item.systemKey ?? 'custom'}-${idx + 1}`,
    title: item.title ?? '',
    provided: Boolean(item.provided),
    file: item.file ?? null,
  }));
}

export function ContractAttachmentsStep({ title }: { title: string }) {
  const initialSnapshotRef = useRef('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [documents, setDocuments] = useState<AttachmentItem[]>(DEFAULT_DOCS);
  const [notes, setNotes] = useState('');
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const remote = await getContractAttachments(id);
        if (!mounted) return;
        setDraftId(id);
        if (remote.ok) {
          setDocuments(normalizeInitial(remote.documents));
          setNotes(remote.notes ?? '');
        } else {
          setFormError('message' in remote ? remote.message : 'بارگذاری اطلاعات انجام نشد.');
          setDocuments(normalizeInitial(null));
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

  const payloadDocuments = useMemo(
    () =>
      documents
        .map((d) => ({ ...d, title: d.title.trim() }))
        .filter((d) => d.title),
    [documents],
  );

  const payloadSnapshot = useMemo(() => JSON.stringify({ documents: payloadDocuments, notes: notes.trim() }), [payloadDocuments, notes]);

  const handleSubmit = async () => {
    if (!draftId) return;
    setSaving(true);
    setFormError('');
    try {
      const remote = await upsertContractAttachments(draftId, payloadDocuments, notes);
      if (!remote.ok) throw new Error('message' in remote ? remote.message : 'ذخیره اطلاعات انجام نشد.');
      initialSnapshotRef.current = payloadSnapshot;
      dispatchContractFlowDirty('contractAttachments', false);
      dispatchContractFlowSaved('contractAttachments', Date.now(), { documents: payloadDocuments, notes });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ذخیره اطلاعات انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!initialSnapshotRef.current) {
      initialSnapshotRef.current = payloadSnapshot;
      dispatchContractFlowDirty('contractAttachments', false);
      return;
    }
    dispatchContractFlowDirty('contractAttachments', payloadSnapshot !== initialSnapshotRef.current);
  }, [loading, payloadSnapshot]);

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
          description="اسناد و مدارک موردنیاز این قرارداد را بارگذاری کنید. این بخش شامل مستنداتی مانند نقشه‌ها، تاییدیه‌های فنی، مدارک مالکیت و سایر اسناد مرتبط است که برای تکمیل و اعتباربخشی به قرارداد ضروری هستند."
        />

        <div className="space-y-4 px-5 py-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-right text-[13px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-600">مدرک</th>
                  <th className="px-4 py-3 font-bold text-slate-600">وضعیت</th>
                  <th className="px-4 py-3 font-bold text-slate-600">فایل</th>
                  <th className="w-40 px-4 py-3 text-left font-bold text-slate-600"> </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{doc.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={doc.provided}
                          onChange={(e) =>
                            setDocuments((current) =>
                              current.map((d) => (d.id === doc.id ? { ...d, provided: e.target.checked } : d)),
                            )
                          }
                          className="h-4 w-4"
                        />
                        <span className="text-slate-700">{doc.provided ? 'ارائه شده' : 'ارائه نشده'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      {doc.file?.name ? (
                        <div className="truncate text-slate-700" title={doc.file.name}>
                          {doc.file.name}
                        </div>
                      ) : (
                        <div className="text-slate-400">فایلی انتخاب نشده</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center justify-end gap-2 space-x-reverse">
                        <button
                          type="button"
                          className="app-button rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          onClick={() => fileInputsRef.current[doc.id]?.click()}
                        >
                          بارگذاری
                        </button>
                        <input
                          ref={(el) => {
                            fileInputsRef.current[doc.id] = el;
                          }}
                          type="file"
                          accept="application/pdf,image/*"
                          hidden
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            event.currentTarget.value = '';
                            if (!file) return;
                            void (async () => {
                              try {
                                const dataUrl = await fileToDataUrl(file);
                                setDocuments((current) =>
                                  current.map((d) =>
                                    d.id === doc.id
                                      ? {
                                          ...d,
                                          provided: true,
                                          file: {
                                            dataUrl,
                                            mimeType: file.type || null,
                                            name: file.name,
                                            size: file.size,
                                          },
                                        }
                                      : d,
                                  ),
                                );
                              } catch (err) {
                                setFormError(err instanceof Error ? err.message : 'بارگذاری فایل انجام نشد.');
                              }
                            })();
                          }}
                        />

                        {doc.file ? (
                          <button
                            type="button"
                            className="app-button rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                            onClick={() =>
                              setDocuments((current) =>
                                current.map((d) => (d.id === doc.id ? { ...d, file: null } : d)),
                              )
                            }
                          >
                            حذف فایل
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <FieldGroup label="توضیحات و ملاحظات پیوست">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="app-textarea h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              placeholder="توضیحات..."
            />
          </FieldGroup>
        </div>
      </SectionCard>

      <StickySubmitBar
        label="ذخیره پیوست و اسناد"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving || !draftId}
        onClick={handleSubmit}
        submitId="contractAttachments"
        embedded
      />
    </div>
  );
}

