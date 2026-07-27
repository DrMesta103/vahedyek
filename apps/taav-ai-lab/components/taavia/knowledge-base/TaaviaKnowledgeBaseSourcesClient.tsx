'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Boxes, CheckCircle2, CircleAlert, Eye, FileText, Files, Info, Link2, Search, ShieldAlert, SquareDashed, Undo2 } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavEmptyState, TaavTableActions, TaavTableBody, TaavTableCell, TaavTableHead, TaavTableHeader, TaavTableRow, TaavTableShell } from '@repo/ui/taav/data-display';
import { TaavFilterBar } from '@repo/ui/taav/data-display/interactive';
import { TaavTabs, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import type { KnowledgeBaseSourceComparisonStatus, KnowledgeBaseSourceSnapshot, KnowledgeBaseSourceSnapshotsPageData, KnowledgeBaseSourceSnapshotType } from '@/app/lib/types/taavia-knowledge-base-source-snapshots';

type Props = {
  businessId: string;
  brandId: string;
  brandName: string;
  brandStatus: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  brandIcon: string | null;
  initialData: KnowledgeBaseSourceSnapshotsPageData;
};

type SourceTypeOption = {
  type: KnowledgeBaseSourceSnapshotType;
  label: string;
  listTitle: string;
  helper: string;
  searchPlaceholder: string;
  icon: typeof Files;
};

const sourceTypeOptions: SourceTypeOption[] = [
  { type: 'BRAND_INFO', label: 'معرفی برند', listTitle: 'منابع معرفی برند', helper: 'لیست منابع معرفی برند که در دانشنامه استفاده شده‌اند.', searchPlaceholder: 'جستجو در معرفی برند...', icon: Files },
  { type: 'PRODUCTS_SERVICES', label: 'محصولات و خدمات', listTitle: 'منابع محصولات و خدمات', helper: 'لیست Snapshotهای محصولات و خدمات استفاده‌شده در دانشنامه.', searchPlaceholder: 'جستجو در محصولات و خدمات...', icon: Boxes },
  { type: 'FAQ', label: 'سوالات متداول', listTitle: 'منابع سوالات متداول', helper: 'لیست Snapshotهای سوالات متداول استفاده‌شده در دانشنامه.', searchPlaceholder: 'جستجو در سوالات متداول...', icon: CircleAlert },
  { type: 'FILE', label: 'فایل‌ها', listTitle: 'منابع فایل‌ها', helper: 'لیست Snapshotهای فایل استفاده‌شده در دانشنامه.', searchPlaceholder: 'جستجو در فایل‌ها...', icon: FileText },
  { type: 'LINK', label: 'لینک‌ها', listTitle: 'منابع لینک‌ها', helper: 'لیست Snapshotهای لینک استفاده‌شده در دانشنامه.', searchPlaceholder: 'جستجو در لینک‌ها...', icon: Link2 },
];

const sourceTypeLabels: Record<KnowledgeBaseSourceSnapshotType, string> = {
  BRAND_INFO: 'متن',
  PRODUCTS_SERVICES: 'محصول/خدمت',
  FAQ: 'سوال متداول',
  FILE: 'فایل',
  IMAGE: 'تصویر',
  LINK: 'لینک',
};

const comparisonConfig: Record<KnowledgeBaseSourceComparisonStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral'; icon: typeof CheckCircle2 }> = {
  UNCHANGED: { label: 'بدون تغییر نسبت به منبع فعلی', tone: 'success', icon: CheckCircle2 },
  CHANGED_AFTER_BUILD: { label: 'تغییرکرده پس از Build', tone: 'warning', icon: CircleAlert },
  CURRENT_SOURCE_DELETED: { label: 'منبع فعلی حذف شده', tone: 'danger', icon: ShieldAlert },
  CURRENT_SOURCE_UNAVAILABLE: { label: 'منبع فعلی در دسترس نیست', tone: 'neutral', icon: SquareDashed },
};

function ComparisonBadge({ status }: { status: KnowledgeBaseSourceComparisonStatus }) {
  const config = comparisonConfig[status];
  const Icon = config.icon;
  return <span className="inline-flex max-w-full"><TaavBadge tone={config.tone} variant="soft"><Icon className="h-3.5 w-3.5 shrink-0" />{config.label}</TaavBadge></span>;
}

function IconAction({ label, disabled, children, onClick }: { label: string; disabled?: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick} className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] text-[var(--taav-text-muted)] transition hover:border-[var(--taav-brand)] hover:bg-[var(--taav-brand-soft)] hover:text-[var(--taav-brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-brand)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[var(--taav-border-subtle)] disabled:hover:bg-transparent disabled:hover:text-[var(--taav-text-muted)]">{children}</button>;
}

export function TaaviaKnowledgeBaseSourcesClient({ businessId, brandId, brandName, brandStatus, brandIcon, initialData }: Props) {
  const [selectedType, setSelectedType] = useState<KnowledgeBaseSourceSnapshotType>('BRAND_INFO');
  const [comparisonFilter, setComparisonFilter] = useState<KnowledgeBaseSourceComparisonStatus | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const brandsHref = `/businesses/${businessId}/products/taavia/brands`;
  const overviewHref = `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base`;
  const sourcesHref = `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/sources`;
  const categoriesHref = `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/categories`;
  const selected = sourceTypeOptions.find((item) => item.type === selectedType)!;
  const initials = brandName.trim().slice(0, 2) || 'TA';
  const brandStatusLabel = brandStatus === 'ACTIVE' ? 'برند فعال' : brandStatus === 'INACTIVE' ? 'برند غیرفعال' : 'برند آرشیوشده';
  const countByType = (type: KnowledgeBaseSourceSnapshotType) => initialData.summary.typeCounts.find((item) => item.type === type)?.count ?? 0;
  const visibleSnapshots = useMemo(() => initialData.snapshots.filter((snapshot) => (snapshot.sourceGroup === 'brand_info' ? selectedType === 'BRAND_INFO' : snapshot.sourceType === selectedType) && (comparisonFilter === 'ALL' || snapshot.comparisonStatus === comparisonFilter) && snapshot.title.includes(query.trim())), [comparisonFilter, initialData.snapshots, query, selectedType]);
  const resetFilters = () => { setComparisonFilter('ALL'); setQuery(''); };
  const notify = (message: string) => setFeedback(message);

  return (
    <main dir="rtl" className="mx-auto grid max-w-7xl gap-4 pb-10">
      <header className="grid gap-3 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-3 shadow-[var(--taav-shadow-sm)]">
        <div className="relative min-h-12">
          <div className="absolute right-0 top-0 flex min-w-0 items-center gap-2.5 text-right">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-brand-soft)] text-sm font-black text-[var(--taav-brand-strong)]">{brandIcon ? <img src={brandIcon} alt="" className="h-full w-full object-cover" /> : initials}</div>
            <div><h1 className="m-0 text-[clamp(1rem,1.5vw,1.2rem)] font-black text-[var(--taav-text-strong)]">مدیریت دانش برند {brandName}</h1><p className="mt-1 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">مشاهده منابع استفاده‌شده در دانشنامه این برند</p></div>
          </div>
          <Link href={brandsHref} className="absolute left-0 top-1"><TaavButton variant="secondary" size="sm" iconStart={<ArrowLeft className="h-4 w-4" />}>بازگشت به برندها</TaavButton></Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--taav-border-subtle)] pt-3">
          <TaavTabs value="sources" dir="rtl"><TaavTabsList className="flex flex-wrap justify-end gap-1 bg-transparent p-0"><TaavTabsTrigger value="overview" asChild><Link href={overviewHref}>نمای کلی</Link></TaavTabsTrigger><TaavTabsTrigger value="sources">منابع</TaavTabsTrigger><TaavTabsTrigger value="categories" asChild><Link href={categoriesHref}>دسته‌بندی‌ها</Link></TaavTabsTrigger><TaavTabsTrigger value="builds" disabled>ساخت‌ها</TaavTabsTrigger><TaavTabsTrigger value="versions" disabled>نسخه‌ها</TaavTabsTrigger></TaavTabsList></TaavTabs>
          <TaavBadge tone={brandStatus === 'ACTIVE' ? 'success' : 'neutral'} variant="soft">{brandStatusLabel}</TaavBadge>
        </div>
        <nav aria-label="مسیر مدیریت دانش" className="flex items-center justify-end gap-2 text-[11px] text-[var(--taav-text-muted)]"><Link href={brandsHref} className="transition hover:text-[var(--taav-brand-strong)]">برندها</Link><span aria-hidden>←</span><span className="font-bold text-[var(--taav-text-body)]">{brandName}</span><span aria-hidden>←</span><Link href={overviewHref} className="transition hover:text-[var(--taav-brand-strong)]">مدیریت دانش</Link><span aria-hidden>←</span><span>منابع</span></nav>
      </header>

      <section role="note" className="flex items-start gap-3 rounded-[var(--taav-radius-xl)] border border-[var(--taav-info)]/40 bg-[var(--taav-info)]/10 px-4 py-4 text-right">
        <Info className="mt-0.5 h-6 w-6 shrink-0 text-[var(--taav-info-strong)]" />
        <div><p className="m-0 font-bold text-[var(--taav-text-strong)]">این صفحه منابع ثبت‌شده در دانشنامه این برند را نمایش می‌دهد.</p><p className="mt-1.5 text-[length:var(--taav-text-sm)] leading-6 text-[var(--taav-text-muted)]">این منابع هنگام ساخت دانشنامه Snapshot شده‌اند و فقط قابل مشاهده هستند. برای تغییر محتوا، منبع اصلی برند را ویرایش کنید و سپس Build جدیدی اجرا کنید.</p></div>
      </section>

      {feedback ? <div role="status" className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-info)]/30 bg-[var(--taav-info)]/10 px-4 py-3 text-right text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">{feedback}</div> : null}

      <section className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-3" aria-label="دسته‌بندی منابع Snapshot">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{sourceTypeOptions.map((option) => { const Icon = option.icon; const isActive = selectedType === option.type; return <button key={option.type} type="button" onClick={() => { setSelectedType(option.type); resetFilters(); }} className={`flex min-h-[72px] items-center justify-between gap-3 rounded-[var(--taav-radius-lg)] border px-4 py-3 text-right transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-brand)] ${isActive ? 'border-[var(--taav-brand)] bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]' : 'border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] text-[var(--taav-text-muted)] hover:text-[var(--taav-text-strong)]'}`}><span className="flex items-center gap-2 font-bold"><Icon className="h-5 w-5" />{option.label}</span><span className="rounded-full bg-black/10 px-2 py-0.5 text-sm font-black">{countByType(option.type)}</span></button>; })}</div>
      </section>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3 text-right"><div><h2 className="m-0 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">{selected.listTitle}</h2><p className="mt-1 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">{selected.helper}</p></div><TaavBadge tone="neutral" variant="soft">{visibleSnapshots.length} مورد</TaavBadge></div>
        <TaavFilterBar searchValue={query} onSearchChange={setQuery} searchPlaceholder={selected.searchPlaceholder} density="compact" resultCount={visibleSnapshots.length} filters={<div className="flex flex-wrap gap-2"><label className="sr-only" htmlFor="snapshot-comparison">وضعیت نسبت به منبع فعلی برند</label><select id="snapshot-comparison" value={comparisonFilter} onChange={(event) => setComparisonFilter(event.target.value as KnowledgeBaseSourceComparisonStatus | 'ALL')} className="min-h-10 rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 text-sm text-[var(--taav-text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--taav-brand)]"><option value="ALL">همه وضعیت‌ها</option><option value="UNCHANGED">بدون تغییر</option><option value="CHANGED_AFTER_BUILD">تغییرکرده پس از Build</option><option value="CURRENT_SOURCE_DELETED">منبع فعلی حذف شده</option><option value="CURRENT_SOURCE_UNAVAILABLE">منبع فعلی در دسترس نیست</option></select><TaavButton size="sm" variant="secondary" iconStart={<Undo2 className="h-4 w-4" />} onClick={resetFilters}>پاک‌سازی فیلترها</TaavButton></div>} />
        <TaavCard variant="outlined" padding="none" radius="xl"><div className="max-h-[440px] overflow-y-auto"><TaavTableShell variant="bordered" density="compact" empty={visibleSnapshots.length === 0} emptyState={<TaavEmptyState variant="search" size="md" title="موردی یافت نشد" description="عبارت جستجو یا فیلترها را تغییر دهید." />}><TaavTableHeader className="sticky top-0 z-10 bg-[var(--taav-surface)]"><TaavTableRow><TaavTableHead>عنوان</TaavTableHead><TaavTableHead>نوع</TaavTableHead><TaavTableHead>وضعیت نسبت به منبع فعلی برند</TaavTableHead><TaavTableHead>تاریخ Snapshot</TaavTableHead><TaavTableActions>عملیات</TaavTableActions></TaavTableRow></TaavTableHeader><TaavTableBody>{visibleSnapshots.map((snapshot: KnowledgeBaseSourceSnapshot) => <TaavTableRow key={snapshot.snapshotId}><TaavTableCell className="font-bold text-[var(--taav-text-strong)]">{snapshot.title}</TaavTableCell><TaavTableCell>{sourceTypeLabels[snapshot.sourceType]}</TaavTableCell><TaavTableCell><ComparisonBadge status={snapshot.comparisonStatus} /></TaavTableCell><TaavTableCell className="whitespace-nowrap" dir="ltr">{snapshot.snapshotCreatedAt}</TaavTableCell><TaavTableActions><div className="flex items-center justify-end gap-2"><Link href={`${sourcesHref}/${snapshot.snapshotId}`} title="مشاهده Snapshot" aria-label={`مشاهده Snapshot ${snapshot.title}`} className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] text-[var(--taav-text-muted)] transition hover:border-[var(--taav-brand)] hover:bg-[var(--taav-brand-soft)] hover:text-[var(--taav-brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-brand)]"><Eye className="h-4 w-4" /></Link><IconAction label="مقایسه با منبع فعلی برند" onClick={() => notify(`مقایسه «${snapshot.title}» با منبع فعلی برند در مرحله بعدی پیاده‌سازی می‌شود.`)}><Search className="h-4 w-4" /></IconAction><IconAction label="مشاهده منبع فعلی برند" disabled={!snapshot.currentBrandSourceExists} onClick={() => notify(`مشاهده منبع فعلی «${snapshot.title}» در مرحله بعدی پیاده‌سازی می‌شود.`)}><Files className="h-4 w-4" /></IconAction></div></TaavTableActions></TaavTableRow>)}</TaavTableBody></TaavTableShell></div></TaavCard>
      </section>
    </main>
  );
}
