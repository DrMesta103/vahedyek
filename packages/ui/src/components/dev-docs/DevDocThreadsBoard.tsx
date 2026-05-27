'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Circle, GripVertical, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Input } from '../Input';
import {
  DEV_DOC_PRIORITY_LABELS,
  type DevDocThreadRecord,
  type DevDocThreadStatus,
} from './dev-doc.types';

type ThreadsResponse = {
  pagePath: string;
  pageKey: string;
  threads: DevDocThreadRecord[];
};

const STATUS_COLUMNS: Array<{ id: DevDocThreadStatus; title: string; description: string }> = [
  { id: 'todo', title: 'انجام‌نشده', description: 'گفتگوهایی که هنوز شروع نشده‌اند' },
  { id: 'in_progress', title: 'در حال انجام', description: 'مواردی که تیم روی آن‌ها در حال کار است' },
  { id: 'done', title: 'انجام‌شده', description: 'موارد نهایی شده و بسته شده' },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function chipClass() {
  return 'inline-flex items-center rounded-full border border-[color:var(--border-color)] bg-transparent px-2 py-1 text-[11px] font-medium text-[color:var(--text-muted)]';
}

export type DevDocThreadsBoardProps = {
  appName: string;
  listEndpoint: string;
  updateEndpoint: (threadId: string) => string;
  deleteEndpoint?: (threadId: string) => string;
  title?: string;
  description?: string;
};

export function DevDocThreadsBoard({
  appName,
  listEndpoint,
  updateEndpoint,
  deleteEndpoint,
  title = 'برد گفت‌وگوهای مستندات',
  description = 'در این بخش می‌توانید گفتگوها و نظرات مربوط به مستندات را مدیریت و دنبال کنید. از جستجو، مرتب‌سازی و کشیدن کارت‌ها برای تغییر وضعیت استفاده کنید.',
}: DevDocThreadsBoardProps) {
  const [threads, setThreads] = useState<DevDocThreadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingThreadId, setSavingThreadId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [draggingThreadId, setDraggingThreadId] = useState<string | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<DevDocThreadStatus | null>(null);
  const resolvedDeleteEndpoint = deleteEndpoint ?? updateEndpoint;

  const loadThreads = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(listEndpoint, { cache: 'no-store' });
      const payload = (await response.json().catch(() => null)) as ThreadsResponse | { message?: string } | null;
      if (!response.ok) throw new Error((payload as { message?: string } | null)?.message || 'بارگذاری گفتگوها با خطا مواجه شد.');
      setThreads((payload as ThreadsResponse).threads);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'بارگذاری گفتگوها با خطا مواجه شد.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadThreads();
  }, []);

  useEffect(() => {
    const refresh = () => {
      void loadThreads();
    };

    const intervalId = window.setInterval(refresh, 15_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return threads;

    return threads.filter((thread) =>
      [
        thread.title,
        thread.docType,
        thread.pagePathSample,
        thread.pageKey,
        thread.tenantName,
        thread.tenantSlug,
        thread.createdBy?.fullName,
        ...thread.labels,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [search, threads]);

  const columns = useMemo(
    () =>
      STATUS_COLUMNS.map((column) => ({
        ...column,
        threads: filteredThreads.filter((thread) => thread.status === column.id),
      })),
    [filteredThreads],
  );

  const moveThread = async (threadId: string, nextStatus: DevDocThreadStatus) => {
    const currentThread = threads.find((thread) => thread.id === threadId);
    if (!currentThread || currentThread.status === nextStatus) return;

    const previousThreads = threads;
    setThreads((current) => current.map((thread) => (thread.id === threadId ? { ...thread, status: nextStatus } : thread)));
    setSavingThreadId(threadId);
    setError('');

    try {
      const response = await fetch(updateEndpoint(threadId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(payload?.message || 'به‌روزرسانی وضعیت با خطا مواجه شد.');
    } catch (updateError) {
      setThreads(previousThreads);
      setError(updateError instanceof Error ? updateError.message : 'به‌روزرسانی وضعیت با خطا مواجه شد.');
    } finally {
      setSavingThreadId(null);
      setDraggingThreadId(null);
      setActiveDropZone(null);
    }
  };

  const removeThread = async (threadId: string) => {
    const currentThread = threads.find((thread) => thread.id === threadId);
    if (!currentThread) return;

    const confirmed = window.confirm(`حذف گفت‌وگوی «${currentThread.title}»؟ این عملیات قابل بازگشت نیست.`);
    if (!confirmed) return;

    const previousThreads = threads;
    setThreads((current) => current.filter((thread) => thread.id !== threadId));
    setSavingThreadId(threadId);
    setError('');

    try {
      const response = await fetch(resolvedDeleteEndpoint(threadId), { method: 'DELETE' });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(payload?.message || 'حذف گفت‌وگو با خطا مواجه شد.');
    } catch (removeError) {
      setThreads(previousThreads);
      setError(removeError instanceof Error ? removeError.message : 'حذف گفت‌وگو با خطا مواجه شد.');
    } finally {
      setSavingThreadId(null);
      setDraggingThreadId(null);
      setActiveDropZone(null);
    }
  };

  return (
    <section className="mx-auto max-w-[1880px] p-4 sm:p-6 lg:px-8">
      <div className="rounded-[32px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-6 shadow-[0_10px_30px_var(--shadow-soft)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">{appName}</div>
            <h1 className="mt-2 text-[28px] font-black leading-tight text-[color:var(--text-strong)]">{title}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] bg-transparent px-4 py-2 text-sm font-medium text-[color:var(--text-body)]"
            onClick={() => void loadThreads()}
          >
            <RefreshCw className="h-4 w-4" />
            بروزرسانی
          </button>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[color:var(--text-muted)]">جستجو بین عناوین، مستندات، مسیرها و برچسب‌ها</span>
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="مثلا قرارداد، financial، /business-settings/..." className="pr-10" />
            </div>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {STATUS_COLUMNS.map((column) => (
              <div key={column.id} className="rounded-[22px] border border-[color:var(--border-color)] bg-transparent px-3 py-3 text-center text-sm text-[color:var(--text-body)]">
                <div className="text-lg font-black text-[color:var(--text-strong)]">{columns.find((item) => item.id === column.id)?.threads.length ?? 0}</div>
                <div className="mt-1 text-xs text-[color:var(--text-muted)]">{column.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-10 text-center text-sm text-[color:var(--text-muted)]">
          <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
          در حال بارگذاری گفتگوها...
        </div>
      ) : (
        <>
          {error ? <div className="mt-6 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            {columns.map((column) => (
              <div
                key={column.id}
                className={`min-h-[520px] rounded-[30px] border p-5 transition ${
                  activeDropZone === column.id
                    ? 'border-[color:var(--theme-accent)] bg-[color:var(--surface)] shadow-[0_14px_36px_var(--shadow-soft)]'
                    : 'border-[color:var(--border-color)] bg-[color:var(--surface)]'
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (draggingThreadId) setActiveDropZone(column.id);
                }}
                onDragLeave={(event) => {
                  if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                  setActiveDropZone((current) => (current === column.id ? null : current));
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const threadId = event.dataTransfer.getData('text/plain') || draggingThreadId;
                  if (threadId) void moveThread(threadId, column.id);
                }}
              >
                <div className="mb-5 flex items-start justify-between gap-3 border-b border-[color:var(--border-color)] pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[color:var(--text-strong)]">{column.title}</h2>
                    <p className="mt-1 text-xs leading-6 text-[color:var(--text-muted)]">{column.description}</p>
                  </div>
                  <div className="rounded-full border border-[color:var(--border-color)] px-3 py-1.5 text-xs font-bold text-[color:var(--text-body)]">{column.threads.length}</div>
                </div>

                {column.threads.length ? (
                  <div className="space-y-3">
                    {column.threads.map((thread) => (
                      <article
                        key={thread.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('text/plain', thread.id);
                          setDraggingThreadId(thread.id);
                        }}
                        onDragEnd={() => {
                          setDraggingThreadId(null);
                          setActiveDropZone(null);
                        }}
                        className={`rounded-[24px] border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] p-4 transition ${
                          draggingThreadId === thread.id ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 gap-3">
                            <span
                              className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                                thread.isOpened
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                  : 'border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)]'
                              }`}
                              title={thread.isOpened ? 'باز شده' : 'بسته شده'}
                              aria-label={thread.isOpened ? 'باز شده' : 'بسته شده'}
                            >
                              {thread.isOpened ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                            </span>
                            <div className="min-w-0">
                              <div className="mb-3 flex flex-wrap gap-2">
                                <span className={chipClass()}>{thread.docType}</span>
                                <span className={chipClass()}>{DEV_DOC_PRIORITY_LABELS[thread.priority]}</span>
                                <span className={chipClass()}>{thread.tenantName || thread.tenantSlug || 'tenant نامشخص'}</span>
                                {thread.status === 'in_progress' ? (
                                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                    در حال انجام
                                  </span>
                                ) : null}
                                {thread.status === 'done' ? (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                    انجام‌شده
                                  </span>
                                ) : null}
                                {thread.labels.slice(0, 3).map((label) => (
                                  <span key={`${thread.id}-${label}`} className={chipClass()}>
                                    {label}
                                  </span>
                                ))}
                              </div>
                              <h3 className="text-[15px] font-black leading-7 text-[color:var(--text-strong)]">{thread.title}</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {savingThreadId === thread.id ? <Loader2 className="h-4 w-4 animate-spin text-[color:var(--theme-accent)]" /> : null}
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-color)] text-[color:var(--text-muted)] transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() => void removeThread(thread.id)}
                              aria-label="حذف گفت‌وگو"
                              title="حذف گفت‌وگو"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <GripVertical className="h-4 w-4 text-[color:var(--text-muted)]" />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-[color:var(--text-muted)]">
                          <div className="truncate font-mono">{thread.pagePathSample}</div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            <span>ایجادکننده: {thread.createdBy?.fullName || 'نامشخص'}</span>
                            <span>آخرین بروزرسانی: {formatDateTime(thread.updatedAt)}</span>
                            <span>tenant: {thread.tenantName || thread.tenantSlug || 'نامشخص'}</span>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border-color)] pt-4">
                          <Link
                            href={thread.pagePathSample}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] px-3 py-2 text-xs font-medium text-[color:var(--text-body)]"
                          >
                            باز کردن صفحه
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                          <span className="text-[11px] text-[color:var(--text-muted)]">کارت را بکش و در ستون جدید رها کن.</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[360px] items-center justify-center rounded-[24px] border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface)] px-6 text-center text-sm leading-7 text-[color:var(--text-muted)]">
                    در این ستون موردی وجود ندارد.
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
