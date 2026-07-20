'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, FileText, Image as ImageIcon, Loader2, Mic, Paperclip, Pencil, Play, Plus, RotateCcw, Trash2, Upload, Video, X } from 'lucide-react';
import type { BrandInfoDto, BrandInfoType } from '@/app/lib/brand-info/types';

type Props = { businessId: string; brandId: string; initialItems: BrandInfoDto[] };
type FormType = Exclude<BrandInfoType, never>;

const labels: Record<BrandInfoType, string> = { TEXT: 'متن', IMAGE: 'تصویر', FILE: 'فایل', VOICE: 'صوت', VIDEO: 'ویدئو' };
const icons: Record<BrandInfoType, typeof FileText> = { TEXT: FileText, IMAGE: ImageIcon, FILE: Paperclip, VOICE: Mic, VIDEO: Video };

function apiBase(businessId: string, brandId: string) { return `/api/businesses/${businessId}/taavia/brands/${brandId}/brand-info`; }
function formatDate(value: string) { return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)); }

export function BrandInfoEditor({ businessId, brandId, initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<BrandInfoType | ''>('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BrandInfoDto | null>(null);
  const [formType, setFormType] = useState<FormType>('TEXT');
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const picker = useRef<HTMLInputElement | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<number | null>(null);

  const activeCount = items.filter((item) => item.status === 'ACTIVE').length;
  const archivedCount = items.filter((item) => item.status === 'ARCHIVED').length;
  const visibleItems = useMemo(() => items.filter((item) => item.status === statusFilter && (!typeFilter || item.type === typeFilter) && (!search.trim() || `${item.title ?? ''} ${item.textContent ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()))), [items, search, statusFilter, typeFilter]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); if (timer.current) window.clearInterval(timer.current); stream.current?.getTracks().forEach((track) => track.stop()); }, [previewUrl]);

  function resetForm() {
    setOpen(false); setEditing(null); setTitle(''); setTextContent(''); setFile(null); setError(null); setRecordSeconds(0); setRecording(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null);
  }

  function openCreate(type: FormType = 'TEXT') { resetForm(); setFormType(type); setOpen(true); }
  function openEdit(item: BrandInfoDto) { resetForm(); setEditing(item); setFormType(item.type); setTitle(item.title ?? ''); setTextContent(item.textContent ?? ''); setOpen(true); }

  function acceptFor(type: FormType) { return type === 'IMAGE' ? '.jpg,.jpeg,.png,.webp' : type === 'FILE' ? '.pdf,.docx,.txt,.md,.csv,.xlsx' : type === 'VOICE' ? '.webm,.mp3,.wav,.m4a,.ogg' : '.mp4,.webm,.mov'; }
  function chooseFile(next: File | null) { if (previewUrl) URL.revokeObjectURL(previewUrl); setFile(next); setPreviewUrl(next ? URL.createObjectURL(next) : null); }

  async function startRecording() {
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const nextRecorder = new MediaRecorder(nextStream); const chunks: Blob[] = [];
      nextRecorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      nextRecorder.onstop = () => { const blob = new Blob(chunks, { type: nextRecorder.mimeType || 'audio/webm' }); chooseFile(new File([blob], `voice-${Date.now()}.webm`, { type: blob.type })); nextStream.getTracks().forEach((track) => track.stop()); setRecording(false); if (timer.current) window.clearInterval(timer.current); };
      recorder.current = nextRecorder; stream.current = nextStream; nextRecorder.start(); setRecordSeconds(0); setRecording(true); timer.current = window.setInterval(() => setRecordSeconds((value) => value + 1), 1000);
    } catch { setError('دسترسی به میکروفن ممکن نشد. مجوز مرورگر را بررسی کنید.'); }
  }
  function stopRecording() { recorder.current?.stop(); }

  async function refresh() {
    const response = await fetch(`${apiBase(businessId, brandId)}?status=${statusFilter}`); const payload = await response.json(); if (!response.ok) throw new Error(payload.message ?? 'بارگذاری منابع انجام نشد.'); setItems(payload.items); 
  }

  useEffect(() => { void refresh().catch((cause) => setError(cause instanceof Error ? cause.message : 'بارگذاری منابع انجام نشد.')); }, [statusFilter]);

  async function save() {
    setBusy(true); setError(null);
    try {
      let response: Response;
      if (editing) {
        if (editing.type === 'TEXT') response = await fetch(`${apiBase(businessId, brandId)}/${editing.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ expectedRevision: editing.revision, title, textContent }) });
        else { const form = new FormData(); form.set('expectedRevision', editing.revision); form.set('title', title); if (file) form.set('file', file); response = await fetch(`${apiBase(businessId, brandId)}/${editing.id}`, { method: 'PATCH', body: form }); }
      } else if (formType === 'TEXT') response = await fetch(apiBase(businessId, brandId), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title, textContent }) });
      else { if (!file) throw new Error('فایل را انتخاب کنید.'); const form = new FormData(); form.set('type', formType); form.set('title', title); form.set('file', file); response = await fetch(apiBase(businessId, brandId), { method: 'POST', body: form }); }
      const payload = await response.json(); if (!response.ok) throw new Error(payload.message ?? (response.status === 409 ? 'تغییر همزمان شناسایی شد.' : 'ذخیره انجام نشد.')); await refresh(); resetForm();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'ذخیره انجام نشد.'); } finally { setBusy(false); }
  }

  async function changeStatus(item: BrandInfoDto, action: 'archive' | 'reactivate') {
    if (action === 'archive' && !window.confirm('این منبع آرشیو شود؟')) return;
    setBusy(true); setError(null); try { const response = await fetch(`${apiBase(businessId, brandId)}/${item.id}/${action}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ expectedRevision: item.revision }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message ?? 'عملیات انجام نشد.'); await refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'عملیات انجام نشد.'); } finally { setBusy(false); }
  }

  async function move(item: BrandInfoDto, direction: -1 | 1) {
    const ordered = items.filter((candidate) => candidate.status === 'ACTIVE').sort((left, right) => left.displayOrder - right.displayOrder); const index = ordered.findIndex((candidate) => candidate.id === item.id); const target = index + direction; if (index < 0 || target < 0 || target >= ordered.length) return; [ordered[index], ordered[target]] = [ordered[target], ordered[index]]; setBusy(true); try { const response = await fetch(`${apiBase(businessId, brandId)}/reorder`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: ordered.map((candidate) => candidate.id) }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message ?? 'ترتیب ذخیره نشد.'); setItems(payload.items); } catch (cause) { setError(cause instanceof Error ? cause.message : 'ترتیب ذخیره نشد.'); } finally { setBusy(false); }
  }

  return <section dir="rtl" className="grid gap-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.9),rgba(8,16,31,0.92))] p-4 md:p-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="m-0 text-lg font-black text-white">معرفی برند</h2><p className="m-0 mt-1 text-sm text-slate-300">منابع معرفی برند را مدیریت کنید.</p></div>
      <button type="button" onClick={() => openCreate()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-400 px-4 py-2 font-black text-slate-950"><Plus className="h-4 w-4" /> افزودن منبع</button>
    </header>
    <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجو در منابع" aria-label="جست‌وجو در منابع" className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-right text-white outline-none focus:border-teal-300" />
      <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as BrandInfoType | '')} aria-label="فیلتر نوع" className="min-h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-white"><option value="">همه انواع</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <select value={statusFilter} onChange={async (event) => { setStatusFilter(event.target.value as 'ACTIVE' | 'ARCHIVED'); }} aria-label="فیلتر وضعیت" className="min-h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-white"><option value="ACTIVE">فعال ({activeCount})</option><option value="ARCHIVED">آرشیو ({archivedCount})</option></select>
      <button type="button" onClick={() => void refresh()} className="min-h-11 rounded-xl border border-white/10 px-3 text-slate-200" aria-label="بازخوانی"><RotateCcw className="mx-auto h-4 w-4" /></button>
    </div>
    {error ? <div role="alert" className="rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</div> : null}
    <div className="grid gap-3">{visibleItems.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 px-5 py-12 text-center text-slate-300">منبع متناسبی پیدا نشد.</div> : visibleItems.map((item, index) => { const Icon = icons[item.type]; return <article key={item.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[auto_1fr_auto] md:items-center"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-300/10 text-teal-200"><Icon className="h-5 w-5" /></div><div><div className="flex flex-wrap items-center gap-2"><strong className="text-white">{item.title || 'بدون عنوان'}</strong><span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">{labels[item.type]}</span><span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">نسخه {item.revision}</span></div><div className="mt-1 text-xs text-slate-400">{formatDate(item.updatedAt)}{item.media ? ` · ${item.media.extension.toUpperCase()} · ${Math.ceil(item.media.size / 1024)} KB` : ''}</div></div></div><div className="min-w-0 text-sm leading-7 text-slate-200">{item.textContent ? <p className="m-0 line-clamp-3 whitespace-pre-wrap">{item.textContent}</p> : item.media ? item.type === 'IMAGE' ? <img src={item.media.previewUrl} alt={item.title ?? 'پیش‌نمایش تصویر'} className="max-h-36 rounded-xl object-cover" /> : item.type === 'VIDEO' ? <video src={item.media.previewUrl} controls className="max-h-36 max-w-full rounded-xl" /> : item.type === 'VOICE' ? <audio src={item.media.previewUrl} controls className="w-full" /> : <a href={item.media.downloadUrl} className="inline-flex items-center gap-2 text-teal-200 underline"><FileText className="h-4 w-4" /> دانلود فایل</a> : null}</div><div className="flex flex-wrap items-center justify-end gap-2"><button type="button" onClick={() => void move(item, -1)} disabled={index === 0 || busy || statusFilter !== 'ACTIVE'} className="rounded-lg p-2 text-slate-300 disabled:opacity-30" aria-label="انتقال به بالا"><ArrowUp className="h-4 w-4" /></button><button type="button" onClick={() => void move(item, 1)} disabled={index === visibleItems.length - 1 || busy || statusFilter !== 'ACTIVE'} className="rounded-lg p-2 text-slate-300 disabled:opacity-30" aria-label="انتقال به پایین"><ArrowDown className="h-4 w-4" /></button>{statusFilter === 'ACTIVE' ? <><button type="button" onClick={() => openEdit(item)} className="rounded-lg p-2 text-slate-300" aria-label="ویرایش"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void changeStatus(item, 'archive')} className="rounded-lg p-2 text-red-200" aria-label="آرشیو"><Trash2 className="h-4 w-4" /></button></> : <button type="button" onClick={() => void changeStatus(item, 'reactivate')} className="rounded-lg p-2 text-teal-200" aria-label="فعال‌سازی مجدد"><RotateCcw className="h-4 w-4" /></button>}</div></article>; })}</div>
    {open ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-label="افزودن منبع برند"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-5"><div className="flex items-center justify-between gap-3"><h3 className="m-0 text-lg font-black text-white">{editing ? 'ویرایش منبع' : 'افزودن منبع'}</h3><button type="button" onClick={resetForm} className="rounded-lg p-2 text-slate-300" aria-label="بستن"><X className="h-5 w-5" /></button></div>{!editing ? <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">{Object.entries(labels).map(([key, label]) => <button type="button" key={key} onClick={() => { setFormType(key as FormType); setFile(null); }} className={`rounded-xl border px-3 py-3 text-sm ${formType === key ? 'border-teal-300 bg-teal-300/10 text-teal-100' : 'border-white/10 text-slate-300'}`}>{label}</button>)}</div> : null}<div className="mt-5 grid gap-4"><label className="grid gap-2 text-sm text-slate-200">عنوان{formType !== 'TEXT' ? ' *' : ''}<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={300} className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-white" /></label>{formType === 'TEXT' ? <label className="grid gap-2 text-sm text-slate-200">متن<textarea value={textContent} onChange={(event) => setTextContent(event.target.value)} maxLength={100000} rows={8} className="rounded-xl border border-white/10 bg-white/5 p-3 text-white" /><span className="text-xs text-slate-400">{textContent.length.toLocaleString('fa-IR')} / ۱۰۰٬۰۰۰</span></label> : <div className="grid gap-3"><input ref={picker} type="file" accept={acceptFor(formType)} className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} /><div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0] ?? null); }} className="grid min-h-32 place-items-center rounded-2xl border border-dashed border-teal-200/30 bg-teal-200/5 p-4 text-center text-sm text-slate-300"><Upload className="h-6 w-6 text-teal-200" /><span>{file ? file.name : 'فایل را اینجا رها کنید یا انتخاب کنید'}</span><button type="button" onClick={() => picker.current?.click()} className="rounded-lg border border-white/10 px-3 py-2 text-teal-100">انتخاب فایل</button></div>{formType === 'VOICE' ? <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => void (recording ? stopRecording() : startRecording())} className="rounded-xl bg-rose-300 px-3 py-2 font-bold text-slate-950">{recording ? 'توقف ضبط' : 'ضبط صدا'}</button><span className="text-sm text-slate-300">{recording ? `${String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:${String(recordSeconds % 60).padStart(2, '0')}` : 'فایل صوتی را پیش‌نمایش کنید.'}</span></div> : null}{previewUrl && formType === 'IMAGE' ? <img src={previewUrl} alt="پیش‌نمایش موقت" className="max-h-48 rounded-xl object-contain" /> : null}{previewUrl && formType === 'VIDEO' ? <video src={previewUrl} controls className="max-h-48 rounded-xl" /> : null}{previewUrl && formType === 'VOICE' ? <audio src={previewUrl} controls className="w-full" /> : null}</div>}<div className="flex justify-end gap-2"><button type="button" onClick={resetForm} className="rounded-xl border border-white/10 px-4 py-2 text-slate-200">انصراف</button><button type="button" onClick={() => void save()} disabled={busy || recording} className="inline-flex items-center gap-2 rounded-xl bg-teal-300 px-4 py-2 font-black text-slate-950 disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} {busy ? 'در حال بارگذاری...' : 'ذخیره منبع'}</button></div></div></div></div> : null}
  </section>;
}
