'use client';

import Link from 'next/link';
import { Eye, FileCode2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CardMenu } from '../../../../components/CardMenu';
import { ConfirmDialog } from '../../../../components/ConfirmDialog';
import { upsertClientStorageStateAction } from '../../../../lib/client-storage-actions';
import type { HydratedClientStorageState } from '../../../../lib/client-storage-persistence';
import {
  NAMING_PATTERN_USAGE_OPTIONS,
  generateNamingPattern,
  getNamingPatternsFromStorage,
  getNamingPatternsStorageKey,
  getNamingPatternSequenceLabel,
  getNamingPatternUsageLabel,
  type NamingPattern,
  type NamingPatternUsageType,
} from '../../../../lib/naming-patterns';

function inputClass() {
  return 'h-10 rounded-2xl border border-white/10 bg-slate-950/50 px-3 text-sm font-semibold text-white outline-none transition focus:border-orange-400/70 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:text-slate-900';
}

function chipClass(active = false) {
  return active
    ? 'inline-flex items-center gap-1 rounded-full border border-orange-400/40 bg-orange-500/15 px-3 py-1 text-[11px] font-extrabold text-orange-200 [html[data-theme=light]_&]:text-orange-700'
    : 'inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-slate-300 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-slate-50 [html[data-theme=light]_&]:text-slate-600';
}

function PatternCard({
  pattern,
  onDelete,
}: {
  pattern: NamingPattern;
  onDelete: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const sample = generateNamingPattern({ pattern, context: { date: new Date().toISOString().slice(0, 10) } }).output;

  return (
    <article className="rounded-[24px] border border-white/10 bg-slate-900/55 p-4 shadow-[0_16px_38px_rgba(2,6,23,0.22)] [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-white">
      <header className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 [html[data-theme=light]_&]:text-cyan-700">
          <FileCode2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-base font-extrabold text-white [html[data-theme=light]_&]:text-slate-900">{pattern.name}</h2>
            <span className={chipClass(pattern.isActive)}>{pattern.isActive ? 'فعال' : 'غیرفعال'}</span>
          </div>
          <p className="m-0 mt-1 text-xs font-semibold text-slate-400 [html[data-theme=light]_&]:text-slate-500">{getNamingPatternUsageLabel(pattern.usageType)}</p>
        </div>
        <CardMenu
          items={[
            { kind: 'link', href: `/business-settings/naming-patterns/${pattern.id}/edit`, label: 'پیش‌نمایش', icon: <Eye className="h-4 w-4" /> },
            { kind: 'link', href: `/business-settings/naming-patterns/${pattern.id}/edit`, label: 'ویرایش', icon: <Pencil className="h-4 w-4" /> },
            { kind: 'action', label: 'حذف', icon: <Trash2 className="h-4 w-4" />, tone: 'danger', onClick: () => setDeleteOpen(true) },
          ]}
        />
      </header>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-slate-50">
          <span className="block text-[11px] font-bold text-slate-400">خروجی نمونه</span>
          <strong className="mt-1 block break-words text-sm text-white [html[data-theme=light]_&]:text-slate-900">{sample || 'بدون خروجی'}</strong>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-slate-50">
          <span className="block text-[11px] font-bold text-slate-400">آخرین مقدار شمارنده</span>
          <strong className="mt-1 block text-sm text-white [html[data-theme=light]_&]:text-slate-900">{getNamingPatternSequenceLabel(pattern)}</strong>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-slate-50">
          <span className="block text-[11px] font-bold text-slate-400">بخش‌ها</span>
          <strong className="mt-1 block text-sm text-white [html[data-theme=light]_&]:text-slate-900">{pattern.parts.length} بخش</strong>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="حذف الگو"
        description={`آیا از حذف «${pattern.name}» مطمئن هستید؟`}
        confirmLabel="حذف"
        cancelLabel="انصراف"
        tone="danger"
        onConfirm={() => {
          onDelete();
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </article>
  );
}

function parseNamingPatterns(storageStates: HydratedClientStorageState[], tenantId?: string | null) {
  const raw = storageStates.find((item) => item.storageKey === getNamingPatternsStorageKey(tenantId))?.value ?? null;
  return getNamingPatternsFromStorage(raw);
}

export function NamingPatternsClient({
  tenantId = null,
  storageStates,
}: {
  tenantId?: string | null;
  storageStates: HydratedClientStorageState[];
}) {
  const [patterns, setPatterns] = useState<NamingPattern[]>(() => parseNamingPatterns(storageStates, tenantId));
  const [query, setQuery] = useState('');
  const [usageFilter, setUsageFilter] = useState<NamingPatternUsageType | 'all'>('all');

  const onePatternPerUsage = useMemo(() => {
    const map = new Map<NamingPatternUsageType, NamingPattern>();
    patterns.forEach((pattern) => {
      if (!map.has(pattern.usageType)) map.set(pattern.usageType, pattern);
    });
    return Array.from(map.values());
  }, [patterns]);

  const missingUsageOptions = useMemo(
    () => NAMING_PATTERN_USAGE_OPTIONS.filter((option) => !patterns.some((pattern) => pattern.usageType === option.value)),
    [patterns],
  );

  const visiblePatterns = useMemo(() => {
    const normalizedQuery = query.trim();
    return onePatternPerUsage.filter((pattern) => {
      const matchesQuery = !normalizedQuery || pattern.name.includes(normalizedQuery) || getNamingPatternUsageLabel(pattern.usageType).includes(normalizedQuery);
      const matchesUsage = usageFilter === 'all' || pattern.usageType === usageFilter;
      return matchesQuery && matchesUsage;
    });
  }, [onePatternPerUsage, query, usageFilter]);

  const persist = (next: NamingPattern[]) => {
    setPatterns(next);
    void upsertClientStorageStateAction(getNamingPatternsStorageKey(tenantId), JSON.stringify(next));
  };

  return (
    <div className="page-stack module-page draft-templates-page business-draft-list-page draft-templates-showcase-page" dir="rtl" lang="fa">
      <header className="business-draft-list-header draft-templates-showcase-header">
        <div>
          <p>تنظیمات کسب‌وکار</p>
          <h1>الگوهای نام‌گذاری و شماره‌گذاری</h1>
          <span>الگوهایی بسازید که سیستم بر اساس آن‌ها نام یا شماره قرارداد، قالب و اسناد را تولید کند.</span>
        </div>
      </header>

      <section className="rounded-[24px] border border-white/10 bg-slate-900/45 p-4 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-white">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-slate-300 [html[data-theme=light]_&]:text-slate-700">نمونه‌های آماده</span>
          <Link href="/business-settings/naming-patterns/new?preset=date_contract" className={chipClass()}>1405-01-12-CONTRACT-001</Link>
          <Link href="/business-settings/naming-patterns/new?preset=persian_contract" className={chipClass()}>قالب 1405 001</Link>
          <Link href="/business-settings/naming-patterns/new?preset=letter" className={chipClass()}>A-001</Link>
        </div>
        {missingUsageOptions.length ? (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-slate-300 [html[data-theme=light]_&]:text-slate-700">ایجاد برای کاربردهای تعریف‌نشده</span>
            {missingUsageOptions.map((item) => (
              <Link key={item.value} href={`/business-settings/naming-patterns/new?usage=${item.value}`} className={chipClass(true)}>
                <Plus className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-xs font-semibold text-slate-400">برای هر سه کاربرد، الگو تعریف شده است.</p>
        )}
        <div className="draft-templates-showcase-toolbar m-0" aria-label="ابزارهای فهرست الگوها">
          <label className="draft-templates-showcase-search">
            <Search className="h-4 w-4" aria-hidden />
            <input type="search" value={query} placeholder="جستجو در نام الگو" aria-label="جستجو در الگوها" onChange={(event) => setQuery(event.target.value)} />
            {query ? (
              <button type="button" aria-label="پاک کردن جستجو" onClick={() => setQuery('')}>
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>
          <select className={`${inputClass()} min-w-[220px]`} value={usageFilter} onChange={(event) => setUsageFilter(event.target.value as NamingPatternUsageType | 'all')}>
            <option value="all">همه کاربردها</option>
            {NAMING_PATTERN_USAGE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <Link href="/business-settings/naming-patterns/new" className="draft-templates-showcase-add" aria-disabled={!missingUsageOptions.length}>
            <Plus className="h-4 w-4" aria-hidden />
            افزودن الگو
          </Link>
        </div>
      </section>

      {visiblePatterns.length ? (
        <div className="draft-template-list draft-templates-showcase-list">
          {visiblePatterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} onDelete={() => persist(patterns.filter((item) => item.id !== pattern.id))} />
          ))}
        </div>
      ) : (
        <div className="draft-template-empty draft-templates-showcase-empty">
          <FileCode2 className="h-8 w-8" />
          <p>هنوز الگویی تعریف نشده است</p>
          <span className="text-sm font-semibold text-slate-400">برای شروع، یک الگوی نام‌گذاری یا شماره‌گذاری جدید بسازید.</span>
          <Link href="/business-settings/naming-patterns/new" className="draft-templates-showcase-add">
            <Plus className="h-4 w-4" aria-hidden />
            افزودن الگو
          </Link>
        </div>
      )}
    </div>
  );
}
