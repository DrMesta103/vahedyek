'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Eye, EyeOff, Loader2, Search, Tag, User2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { currentAppConfig } from '../../config/current';
import { getDocTypeLabel, getEventTypeLabel, PAGE_DOC_EVENT_TYPES, PAGE_DOC_TYPES, type PageDocEventRecord, type PageDocEventType, type PageDocType } from '../../lib/page-docs';

type ReadFilter = 'all' | 'read' | 'unread' | 'without-doc';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function iconButtonClass(active = false) {
  return `inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
    active
      ? 'border-[color:var(--theme-accent)] bg-[color:var(--surface-soft)] text-[color:var(--theme-accent-strong)]'
      : 'border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-body)] hover:border-[color:var(--theme-accent)] hover:text-[color:var(--theme-accent-strong)]'
  }`;
}

export default function DevDocEventsPageClient() {
  const [events, setEvents] = useState<PageDocEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | PageDocEventType>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | PageDocType>('all');
  const [actorFilter, setActorFilter] = useState('');
  const [pageFilter, setPageFilter] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      setLoading(false);
      return;
    }

    let mounted = true;
    void fetch('/api/page-docs/events', { cache: 'no-store' })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { events?: PageDocEventRecord[]; message?: string } | null;
        if (!response.ok) throw new Error(payload?.message || 'دریافت لاگ‌ها انجام نشد.');
        if (!mounted) return;
        setEvents(payload?.events ?? []);
      })
      .catch((fetchError) => {
        if (!mounted) return;
        setError(fetchError instanceof Error ? fetchError.message : 'دریافت لاگ‌ها انجام نشد.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const text = [event.docTitle, event.details, event.pagePath, event.pageKey, event.actor?.fullName, event.actor?.email]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (search.trim() && !text.includes(search.trim().toLowerCase())) return false;
      if (eventTypeFilter !== 'all' && event.eventType !== eventTypeFilter) return false;
      if (docTypeFilter !== 'all' && event.docType !== docTypeFilter) return false;
      if (actorFilter.trim() && !(event.actor?.fullName || '').toLowerCase().includes(actorFilter.trim().toLowerCase())) return false;
      if (pageFilter.trim() && !event.pagePath.toLowerCase().includes(pageFilter.trim().toLowerCase())) return false;
      if (labelFilter.trim() && !event.labels.some((label) => label.toLowerCase().includes(labelFilter.trim().toLowerCase()))) return false;
      if (readFilter === 'read' && event.isRead !== true) return false;
      if (readFilter === 'unread' && event.isRead !== false) return false;
      if (readFilter === 'without-doc' && event.docId) return false;
      return true;
    });
  }, [actorFilter, docTypeFilter, eventTypeFilter, events, labelFilter, pageFilter, readFilter, search]);

  const groupedCount = useMemo(
    () => ({
      create: filteredEvents.filter((event) => event.eventType === 'create').length,
      update: filteredEvents.filter((event) => event.eventType === 'update').length,
      delete: filteredEvents.filter((event) => event.eventType === 'delete').length,
    }),
    [filteredEvents],
  );

  const toggleRead = async (event: PageDocEventRecord) => {
    if (!event.docId) return;

    try {
      const nextRead = !(event.isRead === true);
      const response = await fetch(`/api/page-docs/${event.docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: nextRead }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(payload?.message || 'بروزرسانی وضعیت مطالعه انجام نشد.');

      setEvents((current) =>
        current.map((item) => (item.docId === event.docId ? { ...item, isRead: nextRead } : item)),
      );
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'بروزرسانی وضعیت مطالعه انجام نشد.');
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return (
      <section className="mx-auto max-w-5xl p-6">
        <div className="rounded-[24px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-6 text-center text-sm text-[color:var(--text-muted)]">
          این صفحه فقط در حالت development فعال است.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-5 rounded-[24px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-5">
        <h1 className="text-xl font-black text-[color:var(--text-strong)]">لاگ مستندات توسعه</h1>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">
          رویدادهای ثبت، ویرایش و حذف مستندات اپ <strong>{currentAppConfig.appName}</strong> در همین tenant
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="rounded-2xl bg-[color:var(--surface-soft)] px-4 py-3 text-sm text-[color:var(--text-body)]">ایجاد: {groupedCount.create}</div>
          <div className="rounded-2xl bg-[color:var(--surface-soft)] px-4 py-3 text-sm text-[color:var(--text-body)]">ویرایش: {groupedCount.update}</div>
          <div className="rounded-2xl bg-[color:var(--surface-soft)] px-4 py-3 text-sm text-[color:var(--text-body)]">حذف: {groupedCount.delete}</div>
          <div className="rounded-2xl bg-[color:var(--surface-soft)] px-4 py-3 text-sm text-[color:var(--text-body)]">نتیجه فیلتر: {filteredEvents.length}</div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 rounded-[24px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-[color:var(--text-muted)]">جستجو</span>
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="عنوان، توضیح، صفحه..." className="pr-10" />
          </div>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-[color:var(--text-muted)]">نوع رویداد</span>
          <select
            value={eventTypeFilter}
            onChange={(event) => setEventTypeFilter(event.target.value as 'all' | PageDocEventType)}
            className="h-10 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface)] px-3 text-[13px] text-[color:var(--text-body)] outline-none"
          >
            <option value="all">همه</option>
            {PAGE_DOC_EVENT_TYPES.map((eventType) => (
              <option key={eventType} value={eventType}>
                {getEventTypeLabel(eventType)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-[color:var(--text-muted)]">نوع مستند</span>
          <select
            value={docTypeFilter}
            onChange={(event) => setDocTypeFilter(event.target.value as 'all' | PageDocType)}
            className="h-10 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface)] px-3 text-[13px] text-[color:var(--text-body)] outline-none"
          >
            <option value="all">همه</option>
            {PAGE_DOC_TYPES.map((docType) => (
              <option key={docType} value={docType}>
                {getDocTypeLabel(docType)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-[color:var(--text-muted)]">وضعیت مطالعه</span>
          <select
            value={readFilter}
            onChange={(event) => setReadFilter(event.target.value as ReadFilter)}
            className="h-10 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface)] px-3 text-[13px] text-[color:var(--text-body)] outline-none"
          >
            <option value="all">همه</option>
            <option value="read">خوانده‌شده</option>
            <option value="unread">نخوانده</option>
            <option value="without-doc">فقط لاگ حذف‌شده‌ها</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-[color:var(--text-muted)]">نویسنده لاگ</span>
          <Input value={actorFilter} onChange={(event) => setActorFilter(event.target.value)} placeholder="نام کاربر" />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-[color:var(--text-muted)]">مسیر صفحه</span>
          <Input value={pageFilter} onChange={(event) => setPageFilter(event.target.value)} placeholder="/business-settings/..." />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-[color:var(--text-muted)]">لیبل</span>
          <Input value={labelFilter} onChange={(event) => setLabelFilter(event.target.value)} placeholder="dto, business, ..." />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            className="app-button rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] px-4 py-2 text-sm font-medium text-[color:var(--text-body)]"
            onClick={() => {
              setSearch('');
              setEventTypeFilter('all');
              setDocTypeFilter('all');
              setActorFilter('');
              setPageFilter('');
              setLabelFilter('');
              setReadFilter('all');
            }}
          >
            پاک‌کردن فیلترها
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[24px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-8 text-center text-sm text-[color:var(--text-muted)]">
          <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
          در حال بارگذاری لاگ‌ها...
        </div>
      ) : error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-[24px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-8 text-center text-sm text-[color:var(--text-muted)]">
          نتیجه‌ای برای فیلتر فعلی پیدا نشد.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <article key={event.id} className="rounded-[24px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-full bg-[color:var(--surface-soft)] px-3 py-1 text-xs font-bold text-[color:var(--text-body)]">
                      {getEventTypeLabel(event.eventType)}
                    </div>
                    {event.docType ? (
                      <div className="inline-flex rounded-full bg-[color:var(--surface-soft)] px-3 py-1 text-xs font-medium text-[color:var(--text-body)]">
                        {getDocTypeLabel(event.docType)}
                      </div>
                    ) : null}
                  </div>
                  <h2 className="text-base font-black text-[color:var(--text-strong)]">{event.docTitle || 'مستند بدون عنوان'}</h2>
                  <p className="text-sm text-[color:var(--text-muted)]">{event.pagePath}</p>
                  {event.labels.length ? (
                    <div className="flex flex-wrap gap-2">
                      {event.labels.map((label) => (
                        <span key={`${event.id}-${label}`} className="inline-flex items-center rounded-full bg-[color:var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[color:var(--text-body)]">
                          <Tag className="ml-1 h-3.5 w-3.5" />
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2 text-sm text-[color:var(--text-body)]">
                  {event.docId ? (
                    <button
                      type="button"
                      className={iconButtonClass(event.isRead === true)}
                      onClick={() => void toggleRead(event)}
                      title={event.isRead === true ? 'مارک به عنوان نخوانده' : 'مارک به عنوان خوانده‌شده'}
                      aria-label={event.isRead === true ? 'مارک به عنوان نخوانده' : 'مارک به عنوان خوانده‌شده'}
                    >
                      {event.isRead === true ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  ) : null}
                  <div className="inline-flex items-center gap-2">
                    <User2 className="h-4 w-4" />
                    {event.actor?.fullName || 'نامشخص'}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(event.createdAt)}
                  </div>
                </div>
              </div>
              {event.details ? <p className="mt-3 text-sm leading-7 text-[color:var(--text-body)]">{event.details}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
