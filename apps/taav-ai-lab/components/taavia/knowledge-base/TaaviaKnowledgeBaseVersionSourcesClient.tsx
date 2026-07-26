'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Database,
  FileText,
  Info,
  Link2,
  Package,
  PencilLine,
  RotateCcw,
  Scale,
  Search,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import {
  TaavBadge,
  TaavButton,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
  TaavTabs,
  TaavTabsList,
  TaavTabsTrigger,
} from '@repo/ui/taav';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import type {
  KnowledgeBaseVersionSourceItem,
  KnowledgeBaseVersionSourceStatus,
  KnowledgeBaseVersionSourceTab,
  KnowledgeBaseVersionSourcesPageData,
} from '@/app/lib/types/taavia-knowledge-base-version-sources';

function SourceTypeIcon({ tab }: { tab: KnowledgeBaseVersionSourceTab }) {
  if (tab === 'products') return <Package className="h-4 w-4" />;
  if (tab === 'faqs') return <HelpCircle className="h-4 w-4" />;
  if (tab === 'links') return <Link2 className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

type Props = { data: KnowledgeBaseVersionSourcesPageData };

const tabs: Array<{ id: KnowledgeBaseVersionSourceTab; label: string; searchPlaceholder: string }> = [
  { id: 'knowledge', label: 'دانش‌ها', searchPlaceholder: 'جستجو در عنوان دانش...' },
  { id: 'products', label: 'محصولات', searchPlaceholder: 'جستجو در عنوان محصول...' },
  { id: 'faqs', label: 'سوالات پرتکرار', searchPlaceholder: 'جستجو در سوالات پرتکرار...' },
  { id: 'links', label: 'لینک‌ها', searchPlaceholder: 'جستجو در لینک‌ها...' },
];

const statusConfig: Record<KnowledgeBaseVersionSourceStatus, { label: string; tone: 'success' | 'warning' | 'danger'; icon: typeof CheckCircle2 }> = {
  UNCHANGED: { label: 'سازگار / بدون تغییر', tone: 'success', icon: CheckCircle2 },
  CHANGED_AFTER_BUILD: { label: 'تغییر کرده بعد از Build', tone: 'warning', icon: PencilLine },
  DELETED: { label: 'حذف شده', tone: 'danger', icon: Trash2 },
};

function StatusBadge({ status }: { status: KnowledgeBaseVersionSourceStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className="inline-flex w-fit max-w-full">
      <TaavBadge tone={config.tone} variant="soft" size="sm" width="auto" iconStart={<Icon className="h-3.5 w-3.5" />}>
        {config.label}
      </TaavBadge>
    </span>
  );
}

function SummaryMetric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: 'brand' | 'success' | 'warning' | 'danger';
}) {
  const toneClass = {
    brand: 'bg-sky-500/15 text-sky-300',
    success: 'bg-emerald-500/15 text-emerald-300',
    warning: 'bg-amber-500/15 text-amber-300',
    danger: 'bg-rose-500/15 text-rose-300',
  }[tone];
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-4 py-3 text-right">
      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--taav-radius-md)] ${toneClass}`}>{icon}</span>
      <div className="min-w-0">
        <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{label}</p>
        <strong className="mt-1 block truncate text-[length:var(--taav-text-lg)] tabular-nums text-[var(--taav-text-strong)]">{value}</strong>
      </div>
    </div>
  );
}

function selectClassName() {
  return 'min-h-10 rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 text-sm text-[var(--taav-text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--taav-brand)]';
}

export function TaaviaKnowledgeBaseVersionSourcesClient({ data }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<KnowledgeBaseVersionSourceTab>('knowledge');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<KnowledgeBaseVersionSourceStatus | 'ALL'>('ALL');
  const [compareSource, setCompareSource] = useState<KnowledgeBaseVersionSourceItem | null>(null);

  const selectedTab = tabs.find((item) => item.id === tab)!;
  const knowledgeBaseHref = `/businesses/${data.businessId}/products/taavia/brands/${data.brandId}/knowledge-base/${data.knowledgeBaseId}`;
  const versionsHref = `/businesses/${data.businessId}/products/taavia/brands/${data.brandId}/knowledge-base/versions`;

  const typeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const source of data.sources) {
      if (source.tab !== tab) continue;
      map.set(source.sourceTypeKey, source.sourceTypeLabel);
    }
    return [...map.entries()].map(([value, label]) => ({ value, label }));
  }, [data.sources, tab]);

  const visibleSources = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('fa');
    return data.sources.filter((source) => {
      if (source.tab !== tab) return false;
      if (typeFilter !== 'ALL' && source.sourceTypeKey !== typeFilter) return false;
      if (statusFilter !== 'ALL' && source.status !== statusFilter) return false;
      if (!normalized) return true;
      const haystack = `${source.title} ${source.snapshot.content} ${source.snapshot.extractedText ?? ''} ${source.snapshot.url ?? ''} ${source.snapshot.faqQuestion ?? ''} ${source.snapshot.faqAnswer ?? ''} ${source.snapshot.productShortDescription ?? ''} ${source.snapshot.productFullDescription ?? ''}`.toLocaleLowerCase('fa');
      return haystack.includes(normalized);
    });
  }, [data.sources, query, statusFilter, tab, typeFilter]);

  const resetFilters = () => {
    setQuery('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
  };

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(knowledgeBaseHref);
  };

  return (
    <main dir="rtl" className="mx-auto grid max-w-7xl gap-3 pb-6 text-right">
      <header className="grid gap-3 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-3 shadow-[var(--taav-shadow-sm)]">
        <nav aria-label="مسیر منابع نسخه" className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--taav-text-muted)]">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span>مدیریت دانش برند</span>
            <span aria-hidden>›</span>
            <span>پایگاه‌های دانش</span>
            <span aria-hidden>›</span>
            <span className="font-bold text-[var(--taav-text-body)]">{data.title}</span>
            <span aria-hidden>›</span>
            <Link href={versionsHref} className="transition hover:text-[var(--taav-brand-strong)]">نسخه‌ها</Link>
            <span aria-hidden>›</span>
            <span>منابع نسخه</span>
          </div>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-8 items-center gap-2 rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 text-xs font-semibold text-[var(--taav-text-body)] transition hover:bg-[var(--taav-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-brand)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            بازگشت
          </button>
        </nav>

        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] text-[var(--taav-brand-strong)]">
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="m-0 text-[clamp(1rem,1.5vw,1.2rem)] font-black text-[var(--taav-text-strong)]">{data.title}</h1>
              <TaavBadge tone={data.isActive ? 'success' : 'neutral'} variant="soft">
                {data.isActive ? 'فعال' : 'غیرفعال'}
              </TaavBadge>
              <bdi className="rounded bg-sky-500/15 px-2 py-1 text-sm font-bold text-sky-300">{data.versionLabel}</bdi>
            </div>
            <p className="mt-1 text-sm text-[var(--taav-text-muted)]">نسخه دانش برند</p>
            <p className="mt-2 text-sm leading-7 text-[var(--taav-text-body)]">منابع Snapshot استفاده شده در این نسخه از پایگاه دانش.</p>
          </div>
        </div>
      </header>

      <section role="note" className="flex items-start gap-3 rounded-[var(--taav-radius-xl)] border border-sky-400/35 bg-sky-500/10 px-4 py-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
        <p className="m-0 text-sm leading-7 text-[var(--taav-text-body)]">
          این منابع Snapshot گرفته‌شده در زمان ساخت این نسخه هستند و فقط‌خواندنی‌اند. برای اعمال تغییرات، منابع فعلی برند را ویرایش کنید و Build جدیدی بسازید.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="خلاصه وضعیت منابع Snapshot">
        <SummaryMetric label="کل منابع Snapshot" value={`${data.summary.total.toLocaleString('fa-IR')} منبع`} icon={<Database className="h-5 w-5" />} tone="brand" />
        <SummaryMetric label="بدون تغییر (سازگار)" value={`${data.summary.unchanged.toLocaleString('fa-IR')} منبع`} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <SummaryMetric label="تغییر کرده" value={`${data.summary.changed.toLocaleString('fa-IR')} منبع`} icon={<PencilLine className="h-5 w-5" />} tone="warning" />
        <SummaryMetric label="حذف شده" value={`${data.summary.deleted.toLocaleString('fa-IR')} منبع`} icon={<Trash2 className="h-5 w-5" />} tone="danger" />
      </section>

      <section className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4">
        <TaavTabs
          value={tab}
          dir="rtl"
          onValueChange={(value) => {
            setTab(value as KnowledgeBaseVersionSourceTab);
            resetFilters();
          }}
        >
          <TaavTabsList variant="underline" className="mb-4 flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
            {tabs.map((item) => (
              <TaavTabsTrigger key={item.id} value={item.id} className="min-w-[7.5rem]">
                {item.label}
                <span className="mr-2 rounded-full bg-black/20 px-2 py-0.5 text-[11px] tabular-nums">{data.tabCounts[item.id].toLocaleString('fa-IR')}</span>
              </TaavTabsTrigger>
            ))}
          </TaavTabsList>
        </TaavTabs>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--taav-text-muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={selectedTab.searchPlaceholder}
              className="h-10 w-full rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] py-2 pr-9 pl-3 text-sm text-[var(--taav-text-strong)] outline-none focus:border-[var(--taav-brand)] focus:ring-2 focus:ring-[var(--taav-brand)]"
            />
          </label>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={selectClassName()} aria-label="فیلتر نوع منبع">
            <option value="ALL">همه انواع منبع</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as KnowledgeBaseVersionSourceStatus | 'ALL')}
            className={selectClassName()}
            aria-label="فیلتر وضعیت"
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="UNCHANGED">سازگار / بدون تغییر</option>
            <option value="CHANGED_AFTER_BUILD">تغییر کرده بعد از Build</option>
            <option value="DELETED">حذف شده</option>
          </select>
          <TaavButton size="sm" variant="secondary" iconStart={<RotateCcw className="h-4 w-4" />} onClick={resetFilters}>
            پاک کردن فیلترها
          </TaavButton>
        </div>

        {visibleSources.length ? (
          <div className="grid max-h-[560px] grid-cols-1 gap-3 overflow-y-auto p-0.5">
            {visibleSources.map((source) => (
              <article
                key={source.snapshotId}
                className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-3 text-right transition hover:border-sky-400/35 hover:bg-sky-500/[0.04]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-500/15 text-sky-300">
                      <SourceTypeIcon tab={source.tab} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="m-0 truncate text-sm font-black text-[var(--taav-text-strong)]">{source.title}</h3>
                        <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold text-[var(--taav-text-muted)]">
                          {source.sourceTypeLabel}
                        </span>
                        <bdi className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold text-[var(--taav-text-muted)]">
                          {source.versionLabel}
                        </bdi>
                      </div>
                      <div className="mt-2">
                        <StatusBadge status={source.status} />
                      </div>
                    </div>
                  </div>
                  <TaavButton
                    size="sm"
                    variant="secondary"
                    iconStart={<Scale className="h-4 w-4" />}
                    onClick={() => setCompareSource(source)}
                    aria-label={`مشاهده ${source.title}`}
                  >
                    مشاهده
                  </TaavButton>
                </div>

                <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  <div className="rounded-lg bg-black/20 px-2.5 py-2">
                    <dt className="text-[11px] text-[var(--taav-text-muted)]">تاریخ Snapshot</dt>
                    <dd className="mt-1 text-xs font-semibold tabular-nums text-[var(--taav-text-body)]" dir="ltr">
                      {source.snapshotCreatedAt ?? '—'}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-black/20 px-2.5 py-2">
                    <dt className="text-[11px] text-[var(--taav-text-muted)]">استفاده در نسخه</dt>
                    <dd className="mt-1 text-xs font-semibold text-[var(--taav-text-body)]">
                      <bdi>{source.versionLabel}</bdi>
                    </dd>
                  </div>
                  <div className="rounded-lg bg-black/20 px-2.5 py-2">
                    <dt className="text-[11px] text-[var(--taav-text-muted)]">ساخته‌شده توسط</dt>
                    <dd className="mt-1 truncate text-xs font-semibold text-[var(--taav-text-body)]">
                      {source.createdByDisplayName ?? '—'}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-black/20 px-2.5 py-2">
                    <dt className="text-[11px] text-[var(--taav-text-muted)]">آخرین به‌روزرسانی</dt>
                    <dd className="mt-1 truncate text-xs font-semibold text-[var(--taav-text-body)]">
                      {source.updatedByDisplayName ?? '—'}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-black/20 px-2.5 py-2 sm:col-span-2 xl:col-span-1">
                    <dt className="text-[11px] text-[var(--taav-text-muted)]">تاریخ آخرین به‌روزرسانی</dt>
                    <dd className="mt-1 text-xs font-semibold tabular-nums text-[var(--taav-text-body)]" dir="ltr">
                      {source.updatedAt ?? '—'}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-4 py-10">
            <TaavEmptyState variant="search" size="md" title="موردی یافت نشد" description="عبارت جستجو یا فیلترها را تغییر دهید." />
          </div>
        )}
      </section>

      <TaavDialog open={compareSource !== null} onOpenChange={(open) => { if (!open) setCompareSource(null); }}>
        <TaavDialogContent size="lg" contentClassName="ai-lab-dialog" dir="rtl">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-lg font-black">مقایسه با منبع فعلی برند</TaavDialogTitle>
            <TaavDialogDescription className="mt-2 text-right text-sm">
              {compareSource?.title} · وضعیت: {compareSource ? statusConfig[compareSource.status].label : ''}
            </TaavDialogDescription>
          </TaavDialogHeader>
          {compareSource ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <section className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-4">
                <h3 className="m-0 text-sm font-black text-[var(--taav-text-strong)]">محتوای Snapshot این نسخه</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-[var(--taav-text-body)]">{compareSource.snapshot.content || '—'}</p>
              </section>
              <section className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-4">
                <h3 className="m-0 text-sm font-black text-[var(--taav-text-strong)]">منبع فعلی برند</h3>
                {compareSource.current ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-[var(--taav-text-body)]">{compareSource.current.content || '—'}</p>
                ) : (
                  <p className="mt-3 text-sm leading-8 text-rose-300">منبع فعلی برند حذف شده یا در دسترس نیست.</p>
                )}
              </section>
            </div>
          ) : null}
          <TaavDialogFooter>
            <TaavButton variant="secondary" onClick={() => setCompareSource(null)}>
              بستن
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </main>
  );
}
