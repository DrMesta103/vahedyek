'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Input, StickySubmitBar } from '@repo/ui';
import { Camera, FileAudio, FileImage, FileText, Plus, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { dispatchContractFlowDirty, dispatchContractFlowSavedForDraft } from './contractFlowSignals';
import { ensureActiveDraftId } from '../../../../lib/contractDraftClient';
import { FieldGroup, SectionCard, SectionHeader, TagPill, FormDateInput } from './ContractFormPrimitives';
import { getContractAttachments, upsertContractAttachments, type AttachmentItem } from '../../../../actions/contractSteps789';

const SUGGESTED_CATEGORIES = ['نقشه و مستندات فنی', 'اسناد و مدارک ملکی', 'قراردادها و الحاقیه‌ها', 'سایر'] as const;
const SUGGESTED_TITLES = ['قوانین مجتمع', 'بیمه‌نامه ساختمان', 'نقشه معماری', 'نقشه سازه', 'پروانه ساخت', 'سند مالکیت'] as const;

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('خواندن فایل انجام نشد.'));
    reader.readAsDataURL(file);
  });
}

function createId(prefix = 'id') {
  try {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `${prefix}-${uuid}`;
  } catch {
    // ignore and fallback
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

type DraftFile = {
  id: string;
  name: string;
  size: number;
  mimeType: string | null;
  dataUrl: string | null;
  loading: boolean;
};

function normalizeInitial(items: AttachmentItem[] | null) {
  const base = items?.length ? items : [];
  return base.map((item, idx) => ({
    ...item,
    id: item.id || `${item.systemKey ?? 'doc'}-${idx + 1}`,
    category: item.category ?? '',
    title: item.title ?? '',
    date: item.date ?? '',
    description: item.description ?? '',
    provided: Boolean(item.provided ?? item.file ?? (item.files?.length ?? 0) > 0),
    files: Array.isArray(item.files) ? item.files : item.file ? [item.file] : [],
    file: item.file ?? null,
  }));
}

function formatFaDate(value: string) {
  return value?.trim() ? value.trim() : 'بدون تاریخ';
}

function getFileKind(mimeType: string | null) {
  const mime = (mimeType ?? '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.includes('pdf')) return 'pdf';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('text/')) return 'text';
  return 'file';
}

function getDraftIcon(mimeType: string | null) {
  const kind = getFileKind(mimeType);
  if (kind === 'image') return FileImage;
  if (kind === 'audio') return FileAudio;
  if (kind === 'pdf' || kind === 'text') return FileText;
  return Upload;
}

function FilePreview({ file }: { file: NonNullable<NonNullable<AttachmentItem['files']>[number]> }) {
  const kind = getFileKind(file.mimeType);
  if (kind === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.dataUrl}
        alt={file.name}
        className="h-full w-full rounded-[8px] object-cover"
      />
    );
  }
  const Icon = kind === 'pdf' ? FileText : kind === 'audio' ? FileAudio : Upload;
  return (
    <div className="flex h-full w-full items-center justify-center rounded-[8px] bg-slate-50 text-slate-500">
      <Icon className="h-7 w-7" />
    </div>
  );
}

export function ContractAttachmentsStep({ title }: { title: string }) {
  const router = useRouter();
  const initialSnapshotRef = useRef('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [documents, setDocuments] = useState<AttachmentItem[]>([]);
  const [notes] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [docDate, setDocDate] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [draftFiles, setDraftFiles] = useState<DraftFile[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        .map((d) => ({
          ...d,
          category: (d.category ?? '').trim(),
          title: d.title.trim(),
          date: (d.date ?? '').trim(),
          description: (d.description ?? '').trim(),
          files: Array.isArray(d.files) ? d.files : d.file ? [d.file] : [],
          provided: Boolean(d.files?.length ?? d.file ?? d.provided),
        }))
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
      dispatchContractFlowSavedForDraft(draftId, 'contractAttachments', Date.now(), { documents: payloadDocuments, notes });
      router.push(`/contracts/${draftId}`);
      router.refresh();
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

  const categories = useMemo(() => {
    const fromDocs = documents.map((d) => (d.category ?? '').trim()).filter(Boolean);
    return Array.from(new Set([...SUGGESTED_CATEGORIES, ...fromDocs]));
  }, [documents]);

  const titles = useMemo(() => {
    const fromDocs = documents.map((d) => d.title.trim()).filter(Boolean);
    return Array.from(new Set([...SUGGESTED_TITLES, ...fromDocs]));
  }, [documents]);

  const resetDialog = () => {
    setCategoryInput('');
    setSelectedCategory('');
    setTitleInput('');
    setSelectedTitle('');
    setDocDate('');
    setDocDescription('');
    setDraftFiles([]);
    setUploading(false);
  };

  const openDialog = () => {
    setDialogOpen(true);
    resetDialog();
  };

  const confirmDialog = () => {
    const category = (selectedCategory || categoryInput).trim();
    const title = (selectedTitle || titleInput).trim();
    if (!title) return;
    if (draftFiles.some((f) => f.loading)) return;
    const readyFiles = draftFiles
      .filter((f) => !f.loading && Boolean(f.dataUrl))
      .map((f) => ({
        dataUrl: f.dataUrl as string,
        mimeType: f.mimeType,
        name: f.name,
        size: f.size,
      }));
    const next: AttachmentItem = {
      id: createId('doc'),
      category,
      title,
      date: docDate.trim(),
      description: docDescription.trim(),
      files: readyFiles,
      provided: readyFiles.length > 0,
    };
    setDocuments((current) => [next, ...current]);
    setDialogOpen(false);
    resetDialog();
  };

  const dialogUploading = uploading || draftFiles.some((f) => f.loading);

  const handleFilesPicked = async (picked: File[]) => {
    if (!picked.length) return;
    setFormError('');
    const arr = picked;
    const placeholders: DraftFile[] = arr.map((file) => ({
      id: createId('file'),
      name: file.name,
      size: file.size,
      mimeType: file.type || null,
      dataUrl: null,
      loading: true,
    }));
    setDraftFiles((current) => [...current, ...placeholders]);
    setUploading(true);
    try {
      await Promise.all(
        arr.map(async (file, idx) => {
          const id = placeholders[idx]!.id;
          const dataUrl = await fileToDataUrl(file);
          setDraftFiles((current) =>
            current.map((item) => (item.id === id ? { ...item, dataUrl, loading: false } : item)),
          );
        }),
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'بارگذاری فایل انجام نشد.');
      setDraftFiles((current) => current.filter((f) => !placeholders.some((p) => p.id === f.id)));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {formError ? (
        <div className="flex items-start gap-2.5 rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
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
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-bold text-slate-700">اسناد و مدارک</div>
            <button
              type="button"
              onClick={openDialog}
              className="app-button app-button-primary inline-flex items-center gap-2 rounded-[8px] px-4 py-2 text-[13px] font-bold"
            >
              <Plus className="h-4 w-4" />
              افزودن سند
            </button>
          </div>

          {documents.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {documents.map((doc) => {
                const firstFile = (doc.files?.[0] ?? doc.file ?? null) as any;
                const previewFile =
                  firstFile && 'dataUrl' in firstFile
                    ? (firstFile as NonNullable<NonNullable<AttachmentItem['files']>[number]>)
                    : null;
                return (
                  <div key={doc.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-[13px] font-extrabold text-slate-900">{doc.title}</div>
                        <div className="text-[12px] text-slate-500">
                          {doc.category ? doc.category : 'بدون دسته‌بندی'} · {formatFaDate(doc.date ?? '')}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-[8px] p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                        onClick={() => setDocuments((current) => current.filter((d) => d.id !== doc.id))}
                        aria-label="حذف"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {previewFile ? (
                        <div className="col-span-1 h-20 w-full overflow-hidden rounded-[8px] border border-slate-100">
                          <FilePreview file={previewFile} />
                        </div>
                      ) : (
                        <div className="col-span-1 flex h-20 w-full items-center justify-center rounded-[8px] border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                          <Upload className="h-6 w-6" />
                        </div>
                      )}
                      <div className="col-span-2">
                        {doc.description ? (
                          <p className="line-clamp-3 text-[12px] leading-6 text-slate-600">{doc.description}</p>
                        ) : (
                          <p className="text-[12px] leading-6 text-slate-400">بدون توضیحات</p>
                        )}
                        <div className="mt-2 text-[11px] text-slate-400">
                          {((doc.files?.length ?? 0) || (doc.file ? 1 : 0)) ? `${(doc.files?.length ?? 0) || 1} فایل` : 'بدون فایل'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 px-6 py-12 text-center">
              <p className="text-[13px] font-bold text-slate-600">هنوز سندی اضافه نشده است.</p>
              <p className="mt-1 text-[12px] text-slate-400">برای شروع روی «افزودن سند» کلیک کنید.</p>
            </div>
          )}
        </div>
      </SectionCard>

      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6" onClick={() => setDialogOpen(false)}>
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            dir="rtl"
          >
            {dialogUploading ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-6 py-5 shadow-lg">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                  <div className="text-[13px] font-bold text-slate-700">در حال آپلود فایل…</div>
                  <div className="text-[12px] text-slate-500">لطفاً چند لحظه صبر کنید.</div>
                </div>
              </div>
            ) : null}

            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3">
              <div>
                <div className="text-[15px] font-extrabold text-slate-900">افزودن سند</div>
                <div className="mt-1 text-[12px] text-slate-500">اطلاعات سند و فایل(ها) را ثبت کنید.</div>
              </div>
              <button
                type="button"
                className="rounded-[8px] p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                onClick={() => setDialogOpen(false)}
                aria-label="بستن"
                disabled={dialogUploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-4 py-3">
              <FieldGroup label="دسته بندی">
                <div className="flex items-center gap-2">
                  <Input value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} placeholder="مثال: اسناد و مدارک ملکی" />
                  <button
                    type="button"
                    className="app-button rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      const value = categoryInput.trim();
                      if (!value) return;
                      setSelectedCategory(value);
                    }}
                    aria-label="افزودن دسته‌بندی"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const active = selectedCategory === cat;
                    return (
                      <TagPill
                        key={cat}
                        label={cat}
                        active={active}
                        onClick={() => setSelectedCategory(active ? '' : cat)}
                      />
                    );
                  })}
                </div>
              </FieldGroup>

              <FieldGroup label="عنوان">
                <div className="flex items-center gap-2">
                  <Input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} placeholder="مثال: بیمه‌نامه ساختمان" />
                  <button
                    type="button"
                    className="app-button rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      const value = titleInput.trim();
                      if (!value) return;
                      setSelectedTitle(value);
                    }}
                    aria-label="افزودن عنوان"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {titles.map((t) => {
                    const active = selectedTitle === t;
                    return (
                      <TagPill
                        key={t}
                        label={t}
                        active={active}
                        onClick={() => setSelectedTitle(active ? '' : t)}
                      />
                    );
                  })}
                </div>
              </FieldGroup>

              <FieldGroup label="تاریخ">
                <FormDateInput value={docDate} onChange={setDocDate} placeholder="انتخاب تاریخ" />
              </FieldGroup>

              <FieldGroup label="توضیحات">
                <textarea
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  className="app-textarea h-28 w-full resize-none rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                  placeholder="یادداشت..."
                />
              </FieldGroup>

              <FieldGroup label="فایل‌ها">
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 p-4">
                  <div className="text-center text-[13px] font-bold text-slate-600">انتخاب فایل</div>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={dialogUploading}
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      aria-label="دوربین"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      disabled={dialogUploading}
                      onClick={() => imageInputRef.current?.click()}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      aria-label="تصویر"
                    >
                      <FileImage className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      disabled={dialogUploading}
                      onClick={() => audioInputRef.current?.click()}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      aria-label="صدا"
                    >
                      <FileAudio className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      disabled={dialogUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      aria-label="فایل"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                  </div>

                  {draftFiles.length ? (
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700">
                        {draftFiles.length} فایل انتخاب شد
                      </div>
                      {draftFiles.slice(0, 6).map((f) => {
                        const Icon = getDraftIcon(f.mimeType);
                        return (
                          <div
                            key={`inline-${f.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-2 text-[12px] text-slate-700"
                            title={f.name}
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="max-w-[180px] truncate">{f.name}</span>
                          </div>
                        );
                      })}
                      {draftFiles.length > 6 ? (
                        <div className="text-[12px] font-medium text-slate-500">+{draftFiles.length - 6}</div>
                      ) : null}
                    </div>
                  ) : null}

                  <input
                    ref={cameraInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={(event) => {
                      const picked = Array.from(event.target.files ?? []);
                      event.currentTarget.value = '';
                      void handleFilesPicked(picked);
                    }}
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(event) => {
                      const picked = Array.from(event.target.files ?? []);
                      event.currentTarget.value = '';
                      void handleFilesPicked(picked);
                    }}
                  />
                  <input
                    ref={audioInputRef}
                    type="file"
                    multiple
                    accept="audio/*"
                    hidden
                    onChange={(event) => {
                      const picked = Array.from(event.target.files ?? []);
                      event.currentTarget.value = '';
                      void handleFilesPicked(picked);
                    }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="application/pdf,video/*,.doc,.docx,.xls,.xlsx,.txt,image/*,audio/*"
                    hidden
                    onChange={(event) => {
                      const picked = Array.from(event.target.files ?? []);
                      event.currentTarget.value = '';
                      void handleFilesPicked(picked);
                    }}
                  />

                  {draftFiles.length ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {draftFiles.map((f) => {
                        const kind = getFileKind(f.mimeType);
                        const showImage = kind === 'image' && f.dataUrl;
                        return (
                          <div key={f.id} className="flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white p-2">
                            <div className="h-12 w-12 overflow-hidden rounded-[8px] border border-slate-100 bg-slate-50">
                              {f.loading ? (
                                <div className="flex h-full w-full items-center justify-center">
                                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                                </div>
                              ) : showImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={f.dataUrl!} alt={f.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-500">
                                  {kind === 'pdf' || kind === 'text' ? (
                                    <FileText className="h-5 w-5" />
                                  ) : kind === 'audio' ? (
                                    <FileAudio className="h-5 w-5" />
                                  ) : (
                                    <Upload className="h-5 w-5" />
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[12px] font-bold text-slate-700" title={f.name}>
                                {f.name}
                              </div>
                              <div className="text-[11px] text-slate-400">{f.loading ? 'در حال بارگذاری...' : 'آماده'}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-3 text-center text-[12px] text-slate-400">یکی از گزینه‌ها را انتخاب کنید.</div>
                  )}
                </div>
              </FieldGroup>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                className="app-button rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
                onClick={() => setDialogOpen(false)}
                disabled={dialogUploading}
              >
                انصراف
              </button>
              <button
                type="button"
                className="app-button app-button-primary rounded-[8px] px-4 py-2 text-[13px] font-bold"
                onClick={confirmDialog}
                disabled={dialogUploading || !(selectedTitle || titleInput).trim()}
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      ) : null}

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



