'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  Eye,
  EyeOff,
  FileAudio2,
  FileText,
  Info,
  Loader2,
  Mic,
  Pause,
  Pencil,
  Plus,
  Tag,
  Trash2,
  Upload,
  User2,
  X,
} from 'lucide-react';
import { Input } from '@repo/ui';
import { currentAppConfig } from '../config/current';
import { getDocTypeLabel, normalizeLabels, PAGE_DOC_TYPES, type PageDocRecord, type PageDocType } from '../lib/page-docs';

type SortMode = 'updated-desc' | 'created-desc' | 'title-asc' | 'author-asc';
type WidgetMode = 'list' | 'view' | 'create' | 'edit';

type PageDocsResponse = {
  pagePath: string;
  pageKey: string;
  docs: PageDocRecord[];
};

const SORT_LABELS: Record<SortMode, string> = {
  'updated-desc': 'جدیدترین بروزرسانی',
  'created-desc': 'جدیدترین ثبت',
  'title-asc': 'عنوان',
  'author-asc': 'نویسنده',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function sortDocs(docs: PageDocRecord[], sortMode: SortMode) {
  const items = [...docs];
  items.sort((left, right) => {
    if (sortMode === 'updated-desc') return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    if (sortMode === 'created-desc') return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    if (sortMode === 'title-asc') return left.title.localeCompare(right.title, 'fa');
    return (left.author?.fullName || '').localeCompare(right.author?.fullName || '', 'fa');
  });
  return items;
}

function toolbarButtonClass() {
  return 'rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] px-3 py-2 text-xs font-medium text-[color:var(--text-body)] transition hover:border-[color:var(--theme-accent)] hover:text-[color:var(--theme-accent-strong)]';
}

function actionButtonClass(primary = false) {
  return primary
    ? 'app-button app-button-primary rounded-xl px-4 py-2 text-sm font-bold'
    : 'app-button rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] px-4 py-2 text-sm font-medium text-[color:var(--text-body)]';
}

function iconButtonClass(active = false, danger = false) {
  if (danger) {
    return 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100';
  }

  return `inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
    active
      ? 'border-[color:var(--theme-accent)] bg-[color:var(--surface-soft)] text-[color:var(--theme-accent-strong)]'
      : 'border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-body)] hover:border-[color:var(--theme-accent)] hover:text-[color:var(--theme-accent-strong)]'
  }`;
}

function chipClass() {
  return 'inline-flex items-center rounded-full bg-[color:var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[color:var(--text-body)]';
}

function HtmlEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || '');
  };

  return (
    <div className="overflow-hidden rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)]">
      <div className="flex flex-wrap gap-2 border-b border-[color:var(--border-color)] bg-[color:var(--surface-soft)] p-3">
        <button type="button" className={toolbarButtonClass()} onClick={() => runCommand('formatBlock', '<p>')}>
          پاراگراف
        </button>
        <button type="button" className={toolbarButtonClass()} onClick={() => runCommand('formatBlock', '<h2>')}>
          تیتر
        </button>
        <button type="button" className={toolbarButtonClass()} onClick={() => runCommand('bold')}>
          بولد
        </button>
        <button type="button" className={toolbarButtonClass()} onClick={() => runCommand('italic')}>
          ایتالیک
        </button>
        <button type="button" className={toolbarButtonClass()} onClick={() => runCommand('underline')}>
          زیرخط
        </button>
        <button type="button" className={toolbarButtonClass()} onClick={() => runCommand('insertUnorderedList')}>
          لیست
        </button>
        <button type="button" className={toolbarButtonClass()} onClick={() => runCommand('insertOrderedList')}>
          شماره‌دار
        </button>
        <button type="button" className={toolbarButtonClass()} onClick={() => runCommand('formatBlock', '<blockquote>')}>
          نقل‌قول
        </button>
        <button type="button" className={toolbarButtonClass()} onClick={() => runCommand('removeFormat')}>
          پاک‌سازی
        </button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[220px] w-full px-4 py-4 text-right text-sm leading-8 text-[color:var(--text-body)] outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
      />
    </div>
  );
}

export default function PageDocsWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mode, setMode] = useState<WidgetMode>('list');
  const [sortMode, setSortMode] = useState<SortMode>('updated-desc');
  const [docs, setDocs] = useState<PageDocRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<PageDocType>('free');
  const [labelsInput, setLabelsInput] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pageKey, setPageKey] = useState('');

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const selectedDoc = useMemo(() => docs.find((item) => item.id === selectedId) ?? null, [docs, selectedId]);
  const sortedDocs = useMemo(() => sortDocs(docs, sortMode), [docs, sortMode]);

  useEffect(() => {
    setOpen(false);
    setMode('list');
    setError('');
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const fetchDocs = async () => {
    const response = await fetch(`/api/page-docs?pagePath=${encodeURIComponent(pathname)}`, { cache: 'no-store' });
    const payload = (await response.json().catch(() => null)) as PageDocsResponse | { message?: string } | null;
    if (!response.ok) throw new Error((payload as { message?: string } | null)?.message || 'بارگذاری مستندات انجام نشد.');
    return payload as PageDocsResponse;
  };

  const loadDocs = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await fetchDocs();
      setDocs(payload.docs);
      setPageKey(payload.pageKey);
      setSelectedId((current) => (current && payload.docs.some((doc) => doc.id === current) ? current : payload.docs[0]?.id ?? null));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'بارگذاری مستندات انجام نشد.');
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = async () => {
    if (open) {
      setOpen(false);
      setMode('list');
      return;
    }
    setOpen(true);
    setMode('list');
    await loadDocs();
  };

  const resetForm = () => {
    setTitle('');
    setDocType('free');
    setLabelsInput('');
    setContentHtml('');
    setAudioDataUrl(null);
    setAudioMimeType(null);
    setError('');
  };

  const openCreateMode = () => {
    resetForm();
    setMode('create');
  };

  const openEditMode = (doc: PageDocRecord) => {
    setSelectedId(doc.id);
    setTitle(doc.title);
    setDocType(doc.docType);
    setLabelsInput(doc.labels.join(', '));
    setContentHtml(doc.contentHtml);
    setAudioDataUrl(doc.audioDataUrl);
    setAudioMimeType(doc.audioMimeType);
    setError('');
    setMode('edit');
  };

  const toggleDocRead = async (doc: PageDocRecord, nextRead: boolean) => {
    try {
      const response = await fetch(`/api/page-docs/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: nextRead }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(payload?.message || 'بروزرسانی وضعیت مطالعه انجام نشد.');
      setDocs((current) => current.map((item) => (item.id === doc.id ? { ...item, isRead: nextRead } : item)));
      if (selectedDoc?.id === doc.id) {
        setSelectedId(doc.id);
      }
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'بروزرسانی وضعیت مطالعه انجام نشد.');
    }
  };

  const openViewMode = async (doc: PageDocRecord) => {
    setSelectedId(doc.id);
    setMode('view');
    setError('');
    if (!doc.isRead) {
      await toggleDocRead(doc, true);
    }
  };

  const handleAudioFile = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('خواندن فایل صوتی انجام نشد.'));
      reader.readAsDataURL(file);
    });
    setAudioDataUrl(dataUrl);
    setAudioMimeType(file.type || 'audio/webm');
  };

  const toggleRecording = async () => {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const file = new File([blob], 'voice-note.webm', { type: blob.type });
        await handleAudioFile(file);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setRecording(true);
    } catch {
      setError('دسترسی میکروفون در دسترس نیست.');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('عنوان مستند الزامی است.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await fetch(mode === 'edit' && selectedId ? `/api/page-docs/${selectedId}` : '/api/page-docs', {
        method: mode === 'edit' && selectedId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagePath: pathname,
          title: title.trim(),
          docType,
          labels: normalizeLabels(labelsInput.split(',')),
          contentHtml,
          audioDataUrl,
          audioMimeType,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(payload?.message || 'ذخیره مستند انجام نشد.');

      const refreshed = await fetchDocs();
      setDocs(refreshed.docs);
      setPageKey(refreshed.pageKey);
      setSelectedId(refreshed.docs[0]?.id ?? null);
      setMode('list');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره مستند انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doc: PageDocRecord) => {
    if (!confirm(`مستند "${doc.title}" حذف شود؟`)) return;

    try {
      const response = await fetch(`/api/page-docs/${doc.id}`, { method: 'DELETE' });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(payload?.message || 'حذف مستند انجام نشد.');
      const refreshed = await fetchDocs();
      setDocs(refreshed.docs);
      setSelectedId(refreshed.docs[0]?.id ?? null);
      setMode('list');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'حذف مستند انجام نشد.');
    }
  };

  return (
    <div className="pointer-events-none fixed inset-y-0 left-0 z-50 flex items-center">
      <button
        type="button"
        onClick={() => void openDrawer()}
        className="pointer-events-auto ml-4 flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] text-[color:var(--theme-accent-strong)] shadow-[0_18px_45px_var(--shadow-soft)] transition"
        aria-label="مستندات توسعه این صفحه"
        title="مستندات توسعه این صفحه"
      >
        {open ? <X className="h-5 w-5" /> : <Info className="h-5 w-5" />}
      </button>

      {open ? (
        <section
          role="dialog"
          aria-modal="false"
          className="pointer-events-auto ml-3 flex h-[94vh] w-[min(620px,calc(100vw-88px))] flex-col overflow-hidden rounded-[26px] border border-[color:var(--border-color)] bg-[color:var(--surface)] shadow-[0_24px_70px_var(--shadow-soft)]"
        >
          <div className="border-b border-[color:var(--border-color)] bg-[color:var(--surface)] px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[color:var(--text-muted)]">{currentAppConfig.appName}</div>
                <h2 className="text-lg font-black text-[color:var(--text-strong)]">مستندات توسعه صفحه</h2>
                <p className="font-mono text-xs text-[color:var(--text-muted)]">{pageKey || pathname}</p>
              </div>
              {mode !== 'list' ? (
                <button type="button" className={actionButtonClass(false)} onClick={() => setMode('list')}>
                  بازگشت
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[color:var(--surface-soft)] p-4">
            {loading ? (
              <div className="rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-8 text-center text-sm text-[color:var(--text-muted)]">
                <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                در حال بارگذاری مستندات...
              </div>
            ) : mode === 'create' || mode === 'edit' ? (
              <div className="space-y-4">
                <div className="rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4">
                  <div className="grid gap-4">
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-[color:var(--text-body)]">عنوان</span>
                      <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="عنوان مستند" />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-[color:var(--text-body)]">نوع مستند</span>
                      <select
                        value={docType}
                        onChange={(event) => setDocType(event.target.value as PageDocType)}
                        className="h-10 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface)] px-3 text-[13px] text-[color:var(--text-body)] outline-none"
                      >
                        {PAGE_DOC_TYPES.map((item) => (
                          <option key={item} value={item}>
                            {getDocTypeLabel(item)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-[color:var(--text-body)]">لیبل‌ها</span>
                      <Input
                        value={labelsInput}
                        onChange={(event) => setLabelsInput(event.target.value)}
                        placeholder="مثلا: dto, onboarding, validation"
                      />
                      <span className="text-xs text-[color:var(--text-muted)]">لیبل‌ها را با ویرگول جدا کن.</span>
                    </label>
                    <div className="grid gap-2">
                      <span className="text-sm font-semibold text-[color:var(--text-body)]">محتوا</span>
                      <HtmlEditor value={contentHtml} onChange={setContentHtml} />
                    </div>
                    <div className="grid gap-3 rounded-[18px] border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" className={actionButtonClass(false)} onClick={() => void toggleRecording()}>
                          {recording ? <Pause className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {recording ? 'پایان ضبط' : 'ضبط ویس'}
                        </button>
                        <label className={actionButtonClass(false)}>
                          <Upload className="h-4 w-4" />
                          آپلود ویس
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) void handleAudioFile(file);
                            }}
                          />
                        </label>
                        {audioDataUrl ? (
                          <button
                            type="button"
                            className={actionButtonClass(false)}
                            onClick={() => {
                              setAudioDataUrl(null);
                              setAudioMimeType(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف ویس
                          </button>
                        ) : null}
                      </div>
                      {audioDataUrl ? <audio controls src={audioDataUrl} className="w-full" /> : <p className="text-sm text-[color:var(--text-muted)]">هنوز ویسی برای این مستند ثبت نشده است.</p>}
                    </div>
                  </div>
                </div>

                {error ? <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

                <div className="flex justify-end gap-2">
                  <button type="button" className={actionButtonClass(false)} onClick={() => setMode('list')}>
                    انصراف
                  </button>
                  <button type="button" className={actionButtonClass(true)} disabled={saving} onClick={() => void handleSave()}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {mode === 'edit' ? 'ذخیره تغییرات' : 'ثبت مستند'}
                  </button>
                </div>
              </div>
            ) : mode === 'view' && selectedDoc ? (
              <div className="space-y-4">
                <div className="rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="inline-flex rounded-full bg-[color:var(--surface-soft)] px-3 py-1 text-xs font-bold text-[color:var(--text-body)]">
                        {getDocTypeLabel(selectedDoc.docType)}
                      </div>
                      <h3 className="text-lg font-black text-[color:var(--text-strong)]">{selectedDoc.title}</h3>
                      {selectedDoc.labels.length ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedDoc.labels.map((label) => (
                            <span key={label} className={chipClass()}>
                              <Tag className="ml-1 h-3.5 w-3.5" />
                              {label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={iconButtonClass(selectedDoc.isRead)}
                        onClick={() => void toggleDocRead(selectedDoc, !selectedDoc.isRead)}
                        title={selectedDoc.isRead ? 'مارک به عنوان نخوانده' : 'مارک به عنوان خوانده‌شده'}
                        aria-label={selectedDoc.isRead ? 'مارک به عنوان نخوانده' : 'مارک به عنوان خوانده‌شده'}
                      >
                        {selectedDoc.isRead ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button type="button" className={iconButtonClass()} onClick={() => openEditMode(selectedDoc)} title="ویرایش" aria-label="ویرایش">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className={iconButtonClass(false, true)}
                        onClick={() => void handleDelete(selectedDoc)}
                        title="حذف"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-[color:var(--text-body)]">
                    <div className="inline-flex items-center gap-2">
                      <User2 className="h-4 w-4" />
                      نویسنده: {selectedDoc.author?.fullName || 'نامشخص'}
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <User2 className="h-4 w-4" />
                      آخرین ویرایش: {selectedDoc.updatedBy?.fullName || 'نامشخص'}
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      ثبت: {formatDate(selectedDoc.createdAt)}
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      بروزرسانی: {formatDate(selectedDoc.updatedAt)}
                    </div>
                  </div>
                </div>
                {selectedDoc.audioDataUrl ? (
                  <div className="rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4">
                    <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--text-body)]">
                      <FileAudio2 className="h-4 w-4" />
                      فایل صوتی
                    </div>
                    <audio controls src={selectedDoc.audioDataUrl} className="w-full" />
                  </div>
                ) : null}
                <div className="prose prose-slate max-w-none rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4 text-right prose-headings:text-[color:var(--text-strong)] prose-p:text-[color:var(--text-body)] prose-li:text-[color:var(--text-body)]">
                  <div dangerouslySetInnerHTML={{ __html: selectedDoc.contentHtml || '<p>محتوایی ثبت نشده است.</p>' }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4">
                  <button type="button" className={actionButtonClass(true)} onClick={openCreateMode}>
                    <Plus className="h-4 w-4" />
                    مستند جدید
                  </button>
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                    className="h-10 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface)] px-3 text-[13px] text-[color:var(--text-body)] outline-none"
                  >
                    {(Object.keys(SORT_LABELS) as SortMode[]).map((item) => (
                      <option key={item} value={item}>
                        {SORT_LABELS[item]}
                      </option>
                    ))}
                  </select>
                </div>

                {error ? <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

                {sortedDocs.length ? (
                  <div className="space-y-3">
                    {sortedDocs.map((doc) => (
                      <article key={doc.id} className="rounded-[22px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-2">
                            <div className="inline-flex rounded-full bg-[color:var(--surface-soft)] px-3 py-1 text-xs font-bold text-[color:var(--text-body)]">
                              {getDocTypeLabel(doc.docType)}
                            </div>
                            <h3 className="truncate text-base font-black text-[color:var(--text-strong)]">{doc.title}</h3>
                            <div className="flex flex-wrap gap-3 text-xs text-[color:var(--text-muted)]">
                              <span>{doc.author?.fullName || 'نامشخص'}</span>
                              <span>{formatDate(doc.updatedAt)}</span>
                              {doc.audioDataUrl ? <span>دارای ویس</span> : null}
                            </div>
                            {doc.labels.length ? (
                              <div className="flex flex-wrap gap-2">
                                {doc.labels.map((label) => (
                                  <span key={label} className={chipClass()}>
                                    {label}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className={iconButtonClass(doc.isRead)}
                              onClick={() => void toggleDocRead(doc, !doc.isRead)}
                              title={doc.isRead ? 'مارک به عنوان نخوانده' : 'مارک به عنوان خوانده‌شده'}
                              aria-label={doc.isRead ? 'مارک به عنوان نخوانده' : 'مارک به عنوان خوانده‌شده'}
                            >
                              {doc.isRead ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button type="button" className={iconButtonClass()} onClick={() => void openViewMode(doc)} title="مشاهده" aria-label="مشاهده">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button type="button" className={iconButtonClass()} onClick={() => openEditMode(doc)} title="ویرایش" aria-label="ویرایش">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className={iconButtonClass(false, true)}
                              onClick={() => void handleDelete(doc)}
                              title="حذف"
                              aria-label="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[22px] border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface)] px-6 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--surface-soft)] text-[color:var(--theme-accent-strong)]">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-base font-black text-[color:var(--text-strong)]">هنوز مستندی برای این صفحه ثبت نشده است</h3>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-muted)]">می‌توانی مستند فنی، بیزینسی، API / DTO، یادداشت یا هر متن آزاد دیگری را برای این صفحه ثبت کنی.</p>
                    <button type="button" className={`${actionButtonClass(true)} mt-5`} onClick={openCreateMode}>
                      <Plus className="h-4 w-4" />
                      ثبت اولین مستند
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
