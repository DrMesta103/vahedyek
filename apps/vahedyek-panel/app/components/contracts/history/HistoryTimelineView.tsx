'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown, ExternalLink, FileClock, Filter, History, Search, Sparkles } from 'lucide-react';
import type { AppendixHistoryEntry, AppendixHistorySection } from '../../../lib/appendixLifecycle';
import { appendixStatusLabel } from '../../../lib/appendixLifecycle';
import { getAppendixTagGroupKey, getAppendixTagGroupTitle, sectionHasChanges, type ContractHistoryVersion } from '../../../lib/contractHistory';
import { formatDateFa } from '../../../lib/dateFormat';
import type { AppendixTagKey } from '../../../types/contract';
import { HistoryPayloadContent, isSameHistoryPayload } from './HistoryPayloadContent';

export type HistoryViewMeta = {
  title: string;
  description: string;
  currentLabel?: string;
  stats?: Array<{ label: string; value: string; accent?: boolean }>;
};
function getEntryTone(entry: AppendixHistoryEntry, unchanged: boolean) {
  if (unchanged) return 'border-slate-200 bg-slate-50/90';
  if (entry.isCurrent) return 'border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,0.98),rgba(248,250,252,0.98))]';
  if (entry.sourceType === 'contract') return 'border-slate-200 bg-slate-50/80';
  return 'border-slate-200 bg-white';
}

function EntryStatusBadge({ entry }: { entry: AppendixHistoryEntry }) {
  if (!entry.isCurrent && entry.sourceType === 'contract') return null;
  const label = entry.sourceType === 'contract' ? 'اصل قرارداد' : entry.isCurrent ? 'نسخه فعلی' : appendixStatusLabel(entry.status);
  const cls =
    entry.sourceType === 'contract'
      ? 'border-slate-200 bg-slate-100 text-slate-700'
      : entry.isCurrent
        ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
        : 'border-slate-200 bg-slate-100 text-slate-700';
  return <span className={`inline-flex min-h-[30px] items-center rounded-full border px-3 py-1 text-[11px] font-black ${cls}`}>{label}</span>;
}

function UnchangedBanner() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-white/85 px-4 py-3">
      <div className="text-[12px] font-semibold text-slate-600">این بخش نسبت به نسخه قبلی تغییری نداشته است.</div>
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">
        <Sparkles className="h-3.5 w-3.5" />
        بدون تغییر
      </div>
    </div>
  );
}

function ChangedBadge() {
  return (
    <span className="inline-flex min-h-[30px] items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
      تغییر کرده
    </span>
  );
}

function HistoryEntryCard({
  entry,
  previousEntry,
  tagKey,
}: {
  entry: AppendixHistoryEntry;
  previousEntry: AppendixHistoryEntry | null;
  tagKey: AppendixTagKey;
}) {
  const unchanged = previousEntry ? isSameHistoryPayload(previousEntry.payload, entry.payload) : false;
  const changed = Boolean(previousEntry) && !unchanged;
  const [open, setOpen] = useState(entry.isCurrent || !unchanged);

  return (
    <div className="relative pr-8">
      <span className="absolute right-[7px] top-8 z-10 h-4 w-4 rounded-full border-4 border-white bg-[color-mix(in_srgb,var(--dark-teal)_88%,black)] shadow-sm" />
      <div className={`rounded-[8px] border p-4 text-right shadow-sm transition ${getEntryTone(entry, unchanged)}`}>
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full flex-wrap items-start justify-between gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-white text-slate-500 shadow-sm">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2 border-b border-slate-100 pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="text-[15px] font-black text-slate-900">{entry.sourceLabel}</div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                  {entry.effectiveDate ? <span>تاریخ موثر: {entry.effectiveDate}</span> : null}
                  {entry.createdAt ? <span>???: {formatDateFa(entry.createdAt, { withTime: true })}</span> : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {changed ? <ChangedBadge /> : null}
                {unchanged ? (
                  <span className="inline-flex min-h-[30px] items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">
                    بدون تغییر
                  </span>
                ) : null}
                <EntryStatusBadge entry={entry} />
              </div>
            </div>
          </div>
        </button>

        {open ? (
          <div className="mt-4 space-y-3">
            {unchanged ? <UnchangedBanner /> : null}
            {!unchanged ? <HistoryPayloadContent payload={entry.payload} tagKey={tagKey} /> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HistorySectionCard({
  section,
  forceOpen,
}: {
  section: AppendixHistorySection;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(forceOpen ?? true);

  return (
    <section className="rounded-[8px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.74),rgba(255,255,255,0.92))] p-4 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.22)]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 text-right">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] bg-white text-slate-500 shadow-sm">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <div className="text-[17px] font-black text-slate-900">{section.title}</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-500">
            {section.entries.length.toLocaleString('fa-IR')} گره در تاریخچه این بخش
          </div>
        </div>
      </button>

      {open ? (
        <div className="relative mt-5 pr-2">
          <div className="absolute bottom-0 right-[14px] top-2 w-px bg-[linear-gradient(180deg,rgba(14,152,157,0.24),rgba(148,163,184,0.28))]" />
          <div className="space-y-4">
            {section.entries.map((entry, index) => (
              <HistoryEntryCard
                key={`${section.tagKey}-${entry.sourceType}-${entry.appendixNumber ?? 'contract'}-${index}`}
                entry={entry}
                previousEntry={index > 0 ? section.entries[index - 1] : null}
                tagKey={section.tagKey}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function StatRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-slate-100/90 bg-white/95 px-4 py-3">
      <div className={`min-w-0 text-right text-[13px] font-black ${accent ? 'text-slate-900' : 'text-slate-700'}`}>{value}</div>
      <div className="shrink-0 text-[11px] font-bold text-slate-400">{label}</div>
    </div>
  );
}

function VersionRail({
  versions,
  selectedId,
  onSelect,
}: {
  versions: ContractHistoryVersion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (!versions.length) return null;

  return (
    <div className="overflow-x-auto pb-1 scrollbar-hide">
      <div className="flex min-w-max items-stretch gap-3 px-1" dir="rtl">
        {versions.map((version, index) => {
          const selected = version.id === selectedId;
          const connector = index < versions.length - 1;

          return (
            <div key={version.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelect(version.id)}
                className={`group flex w-[min(280px,78vw)] flex-col rounded-[8px] border px-4 py-3 text-right transition ${
                  selected
                    ? 'border-emerald-300 bg-[linear-gradient(180deg,rgba(236,253,245,0.92),rgba(255,255,255,0.98))] shadow-[0_12px_28px_-22px_rgba(13,148,136,0.35)]'
                    : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex h-9 min-w-[36px] items-center justify-center rounded-full border px-2 text-[13px] font-black ${
                      selected ? 'border-emerald-500 bg-white text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {version.order.toLocaleString('fa-IR')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-black text-slate-900">{version.title}</div>
                    <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-5 text-slate-500">{version.subtitle}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap justify-end gap-1">
                  {version.tags.slice(0, 2).map((tag) => (
                    <span key={`${version.id}-${tag}`} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                  {version.href ? (
                    <Link
                      href={version.href}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-[8px] border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                    >
                      مشاهده
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : null}
                  {version.compareHref ? (
                    <Link
                      href={version.compareHref}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-[8px] border border-cyan-200 bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-800 hover:bg-cyan-100"
                    >
                      تاریخچه بخش‌ها
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
              </button>
              {connector ? <span className={`hidden h-px w-8 shrink-0 sm:block ${selected ? 'bg-emerald-500' : 'bg-slate-200'}`} aria-hidden /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HistoryTimelineView({
  meta,
  sections,
  versions = [],
  selectedVersionId,
  onSelectVersion,
  embedded = false,
}: {
  meta: HistoryViewMeta;
  sections: AppendixHistorySection[];
  versions?: ContractHistoryVersion[];
  selectedVersionId?: string | null;
  onSelectVersion?: (id: string) => void;
  embedded?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [expandAll, setExpandAll] = useState<boolean | null>(null);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sections.filter((section) => {
      if (onlyChanged && !sectionHasChanges(section)) return false;
      if (!q) return true;
      const haystack = [section.title, section.tagKey, ...section.entries.map((e) => e.sourceLabel)].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [onlyChanged, query, sections]);

  const grouped = useMemo(() => {
    const map = new Map<string, AppendixHistorySection[]>();
    for (const section of filteredSections) {
      const groupKey = getAppendixTagGroupKey(section.tagKey);
      const list = map.get(groupKey) ?? [];
      list.push(section);
      map.set(groupKey, list);
    }
    return Array.from(map.entries()).map(([groupKey, items]) => ({
      groupKey,
      title: getAppendixTagGroupTitle(groupKey),
      items,
    }));
  }, [filteredSections]);

  const changedCount = useMemo(() => sections.filter(sectionHasChanges).length, [sections]);

  return (
    <section
      className={`contract-history-panel overflow-hidden rounded-[8px] border border-slate-200/80 bg-white shadow-[0_18px_42px_-34px_rgba(15,23,42,0.2)] ${
        embedded ? '' : 'p-5 sm:p-6'
      }`}
      dir="rtl"
      lang="fa"
    >
      <div className="rounded-[8px] border border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.84))] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[8px] bg-[color-mix(in_srgb,var(--dark-teal)_10%,white)] text-[color-mix(in_srgb,var(--dark-teal)_88%,black)]">
            <FileClock className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1 text-right">
            <h2 className="text-[22px] font-black text-slate-900">{meta.title}</h2>
            <p className="mt-2 text-[13px] font-semibold leading-7 text-slate-500">{meta.description}</p>
          </div>
        </div>

        {meta.stats?.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {meta.stats.map((item) => (
              <StatRow key={item.label} label={item.label} value={item.value} accent={item.accent} />
            ))}
          </div>
        ) : null}
      </div>

      {versions.length > 1 && onSelectVersion ? (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[12px] font-bold text-slate-500">مسیر نسخه‌ها</span>
            {meta.currentLabel ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                {meta.currentLabel}
              </span>
            ) : null}
          </div>
          <VersionRail versions={versions} selectedId={selectedVersionId ?? versions[versions.length - 1]?.id ?? null} onSelect={onSelectVersion} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 rounded-[8px] border border-slate-200/80 bg-white/90 p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block min-w-0 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در بخش‌ها (عنوان، نوع، نسخه)..."
            className="h-11 w-full rounded-[8px] border border-slate-200 bg-slate-50/80 pr-10 pl-3 text-right text-[13px] font-semibold text-slate-700 outline-none transition focus:border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] focus:bg-white"
          />
        </label>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setOnlyChanged((v) => !v)}
            className={`inline-flex h-11 items-center gap-2 rounded-[8px] border px-3 text-[12px] font-bold transition ${
              onlyChanged ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            فقط بخش‌های دارای تغییر ({changedCount.toLocaleString('fa-IR')})
          </button>
          <button
            type="button"
            onClick={() => setExpandAll(true)}
            className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700 hover:bg-slate-50"
          >
            <ChevronsDownUp className="h-4 w-4" />
            باز کردن همه
          </button>
          <button
            type="button"
            onClick={() => setExpandAll(false)}
            className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700 hover:bg-slate-50"
          >
            <ChevronsUpDown className="h-4 w-4" />
            بستن همه
          </button>
        </div>
      </div>

      <div className={`mt-4 space-y-5 ${embedded ? 'max-h-[min(68vh,720px)] overflow-y-auto pr-1' : ''}`}>
        {grouped.length ? (
          grouped.map((group) => (
            <div key={group.groupKey} className="space-y-3">
              <div className="sticky top-0 z-[1] rounded-[8px] border border-slate-200/70 bg-white/95 px-4 py-2.5 text-right backdrop-blur-sm">
                <div className="text-[13px] font-black text-slate-800">{group.title}</div>
                <div className="text-[11px] font-semibold text-slate-500">{group.items.length.toLocaleString('fa-IR')} ???</div>
              </div>
              <div className="space-y-3">
                {group.items.map((section) => (
                  <HistorySectionCard
                    key={`${section.tagKey}-${expandAll === null ? 'auto' : expandAll ? 'open' : 'closed'}`}
                    section={section}
                    forceOpen={expandAll ?? undefined}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[8px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
            <p className="text-[13px] font-bold text-slate-600">بخشی با این فیلتر پیدا نشد.</p>
            <p className="mt-1 text-[12px] font-medium text-slate-500">فیلتر جستجو یا «فقط بخش‌های دارای تغییر» را بردارید.</p>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-[8px] border border-slate-200 bg-slate-50/70 px-4 py-3 text-right">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-semibold leading-6 text-slate-600">
            هر بخش را می‌توانید جداگانه باز کنید. نسخه‌های بدون تغییر نسبت به نسخه قبل با برچسب «بدون تغییر» مشخص شده‌اند.
          </p>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-white text-slate-500 shadow-sm">
            <History className="h-5 w-5" />
          </span>
        </div>
      </div>
    </section>
  );
}


