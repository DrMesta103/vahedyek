'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  BookOpenCheck,
  Boxes,
  CheckCircle2,
  CircleAlert,
  FileText,
  FolderOpen,
  GitCompareArrows,
  History,
  Link2,
  ListChecks,
  RefreshCw,
  ScanSearch,
  Sparkles,
} from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavProgressSummary, TaavStatsCard } from '@repo/ui/taav/layout';
import { TaavTabs, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import type {
  CurrentBrandSourcesSummary,
  KnowledgeBaseOverview,
  KnowledgeBaseVersionSourcesSummary,
} from '@/app/lib/types/taavia-knowledge-base';

type Props = {
  businessId: string;
  brandId: string;
  brandName: string;
  brandStatus: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  brandIcon: string | null;
  initialOverview: KnowledgeBaseOverview;
};

type SourceKey = keyof Omit<CurrentBrandSourcesSummary, 'updatedAt'>;

const sourceItems: Array<{ key: SourceKey; label: string; icon: typeof BookOpenCheck }> = [
  { key: 'brandInfo', label: 'معرفی برند', icon: BookOpenCheck },
  { key: 'productsAndServices', label: 'محصولات و خدمات', icon: Boxes },
  { key: 'faqs', label: 'سوالات متداول', icon: CircleAlert },
  { key: 'files', label: 'فایل‌ها', icon: FileText },
  { key: 'links', label: 'لینک‌ها', icon: Link2 },
  { key: 'needsReview', label: 'نیازمند بررسی', icon: ScanSearch },
];

function DetailRows({ rows }: { rows: Array<[string, string | number]> }) {
  return (
    <dl className="m-0 grid gap-1.5">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3 rounded-[var(--taav-radius-md)] bg-[var(--taav-surface-soft)] px-3 py-2 text-[length:var(--taav-text-xs)]">
          <dd className="m-0 font-black text-[var(--taav-text-strong)]">{value}</dd>
          <dt className="text-[var(--taav-text-muted)]">{label}</dt>
        </div>
      ))}
    </dl>
  );
}

function SourcesCard({
  title,
  detail,
  sources,
  accent = false,
}: {
  title: string;
  detail: string;
  sources: CurrentBrandSourcesSummary | KnowledgeBaseVersionSourcesSummary;
  accent?: boolean;
}) {
  return (
    <TaavCard variant="outlined" padding="md" radius="xl" wrapperClassName={accent ? 'border-[var(--taav-brand)]/70' : undefined}>
      <div className="grid gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-[var(--taav-radius-lg)] ${accent ? 'bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]' : 'bg-[var(--taav-surface-soft)] text-[var(--taav-text-muted)]'}`}>
            <FolderOpen className="h-4 w-4" />
          </span>
          <div className="text-right">
            <h2 className="m-0 text-[length:var(--taav-text-base)] font-black text-[var(--taav-text-strong)]">{title}</h2>
            <p className="mt-1 text-[11px] text-[var(--taav-text-muted)]">{detail}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {sourceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-2.5 py-2 text-right">
                <div className="flex items-center justify-between gap-1 text-[var(--taav-text-subtle)]">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="truncate text-[10px] font-semibold">{item.label}</span>
                </div>
                <div className="mt-1.5 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">{sources[item.key]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </TaavCard>
  );
}

function CardTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--taav-radius-lg)] bg-[var(--taav-surface-soft)] text-[var(--taav-brand-strong)]">{icon}</span>
      <div className="text-right">
        <h2 className="m-0 text-[length:var(--taav-text-base)] font-black text-[var(--taav-text-strong)]">{title}</h2>
        <p className="mt-1 text-[11px] text-[var(--taav-text-muted)]">{subtitle}</p>
      </div>
    </div>
  );
}

export function TaaviaKnowledgeBaseOverviewClient({
  businessId,
  brandId,
  brandName,
  brandStatus,
  brandIcon,
  initialOverview: overview,
}: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const brandsHref = `/businesses/${businessId}/products/taavia/brands`;
  const initials = brandName.trim().slice(0, 2) || 'TA';
  const statusLabel = brandStatus === 'ACTIVE' ? 'فعال' : brandStatus === 'INACTIVE' ? 'غیرفعال' : 'آرشیوشده';

  return (
    <main dir="rtl" className="mx-auto grid max-w-7xl gap-4 pb-10">
      <header className="grid gap-4 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4 shadow-[var(--taav-shadow-sm)] md:p-5">
        <div className="relative min-h-16">
          <div className="absolute right-0 top-0 flex min-w-0 items-center gap-3 text-right">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-brand-soft)] text-xl font-black text-[var(--taav-brand-strong)]">
              {brandIcon ? <img src={brandIcon} alt="" className="h-full w-full object-cover" /> : initials}
            </div>
            <div>
              <h1 className="m-0 text-[clamp(1.15rem,2vw,1.55rem)] font-black text-[var(--taav-text-strong)]">مدیریت دانش برند {brandName}</h1>
              <p className="mt-1.5 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">مرکز مدیریت Knowledge Base این برند</p>
            </div>
          </div>
          <Link href={brandsHref} className="absolute left-0 top-1">
            <TaavButton variant="secondary" size="sm" iconStart={<ArrowLeft className="h-4 w-4" />}>بازگشت به برندها</TaavButton>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--taav-border-subtle)] pt-3">
          <TaavTabs value="overview" dir="rtl">
            <TaavTabsList className="flex flex-wrap justify-end gap-1 bg-transparent p-0">
              <TaavTabsTrigger value="overview">نمای کلی</TaavTabsTrigger>
              <TaavTabsTrigger value="categories" asChild><Link href={`/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/categories`}>دسته‌بندی‌ها</Link></TaavTabsTrigger>
              <TaavTabsTrigger value="sources" asChild><Link href={`/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/sources`}>منابع</Link></TaavTabsTrigger>
              <TaavTabsTrigger value="builds" disabled>ساخت‌ها</TaavTabsTrigger>
              <TaavTabsTrigger value="versions" asChild><Link href={`/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/versions`}>نسخه‌ها</Link></TaavTabsTrigger>
            </TaavTabsList>
          </TaavTabs>
          <TaavBadge tone={brandStatus === 'ACTIVE' ? 'success' : 'neutral'} variant="soft">{statusLabel}</TaavBadge>
        </div>
        <nav aria-label="مسیر مدیریت دانش" className="flex items-center justify-end gap-2 text-[11px] text-[var(--taav-text-muted)]">
          <Link href={brandsHref} className="transition hover:text-[var(--taav-brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-brand)]">برندها</Link>
          <span aria-hidden>←</span><span className="font-bold text-[var(--taav-text-body)]">{brandName}</span><span aria-hidden>←</span><span>مدیریت دانش</span>
        </nav>
      </header>

      {feedback ? <div role="status" className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-info)]/30 bg-[var(--taav-info)]/10 px-4 py-3 text-right text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">{feedback}</div> : null}

      <section className="grid gap-4 rounded-[var(--taav-radius-xl)] border border-[var(--taav-brand)]/35 bg-[var(--taav-surface)] p-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:p-5">
        <span className="hidden h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-dashed border-[var(--taav-brand)]/60 bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)] lg:inline-flex"><RefreshCw className="h-8 w-8" /></span>
        <div className="text-right">
          <h2 className="m-0 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">دانشنامه شما نیاز به بروزرسانی دارد</h2>
          <p className="mt-2 max-w-2xl text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">{overview.pendingChanges.total} تغییر در منابع فعلی برند ثبت شده که در نسخه فعال {overview.activeVersion.version} وجود ندارد.</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <TaavButton size="sm" iconStart={<RefreshCw className="h-4 w-4" />} onClick={() => setFeedback('بروزرسانی دانشنامه در این مرحله شبیه‌سازی است و ساخت جدید آغاز نمی‌شود.')}>بروزرسانی دانشنامه</TaavButton>
          <TaavButton size="sm" variant="secondary" iconStart={<GitCompareArrows className="h-4 w-4" />} onClick={() => setFeedback('نمایش جزئیات تغییرات در مرحله بعدی پیاده‌سازی می‌شود.')}>مشاهده تغییرات</TaavButton>
        </div>
      </section>

      <section dir="ltr" className="grid gap-4 xl:grid-cols-3">
        <div dir="rtl"><SourcesCard title="منابع فعلی برند" detail={`منابع زنده و قابل ویرایش · ${overview.currentBrandSources.updatedAt}`} sources={overview.currentBrandSources} accent /></div>
        <div dir="rtl"><SourcesCard title={`منابع استفاده‌شده در نسخه فعال (${overview.activeVersionSources.version})`} detail={`snapshot غیرقابل‌تغییر · ${overview.activeVersionSources.capturedAt}`} sources={overview.activeVersionSources} /></div>
        <TaavCard dir="rtl" variant="outlined" padding="md" radius="xl">
          <div className="grid gap-3">
            <CardTitle icon={<GitCompareArrows className="h-4 w-4" />} title="تغییرات منابع نسبت به نسخه فعال" subtitle={`مقایسه منابع فعلی با snapshot نسخه ${overview.activeVersion.version}`} />
            <div className="grid grid-cols-3 gap-2"><TaavStatsCard variant="soft" tone="success" size="sm" title="افزوده" value={overview.pendingChanges.added} /><TaavStatsCard variant="soft" tone="warning" size="sm" title="ویرایش" value={overview.pendingChanges.edited} /><TaavStatsCard variant="soft" tone="danger" size="sm" title="حذف" value={overview.pendingChanges.removed} /></div>
            <div className="flex items-center justify-between rounded-[var(--taav-radius-lg)] bg-[var(--taav-surface-soft)] px-3 py-2.5"><span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">مجموع تغییرات</span><strong className="text-[length:var(--taav-text-lg)] text-[var(--taav-warning-strong)]">{overview.pendingChanges.total} مورد</strong></div>
          </div>
        </TaavCard>
      </section>

      <section dir="ltr" className="grid gap-4 xl:grid-cols-4">
        <TaavCard dir="rtl" variant="outlined" padding="md" radius="xl"><div className="grid gap-3"><CardTitle icon={<History className="h-4 w-4" />} title="نسخه فعال" subtitle="نسخه فعلی دانشنامه" /><span className="justify-self-end"><TaavBadge tone="info" variant="soft">{overview.activeVersion.version}</TaavBadge></span><DetailRows rows={[["نوع ساخت", overview.activeVersion.buildType], ["تاریخ ساخت", overview.activeVersion.createdAt], ["دسته‌بندی‌ها", overview.activeVersion.categoryCount], ["زیردسته‌ها", overview.activeVersion.subcategoryCount], ["ساخته‌شده توسط", overview.activeVersion.createdBy]]} /></div></TaavCard>
        <TaavCard dir="rtl" variant="outlined" padding="md" radius="xl"><div className="grid gap-3"><CardTitle icon={<CheckCircle2 className="h-4 w-4" />} title="آخرین ساخت" subtitle="آخرین اجرای ساخت دانشنامه" /><span className="justify-self-end"><TaavBadge tone="success" variant="soft">موفق</TaavBadge></span><DetailRows rows={[["نوع ساخت", overview.latestBuild.buildType], ["نسخه تولیدشده", overview.latestBuild.generatedVersion], ["تعداد منابع", overview.latestBuild.sourceCount], ["زمان شروع", overview.latestBuild.startedAt], ["زمان پایان", overview.latestBuild.finishedAt]]} /></div></TaavCard>
        <TaavCard dir="rtl" variant="outlined" padding="md" radius="xl"><div className="grid gap-3"><CardTitle icon={<ListChecks className="h-4 w-4" />} title="خروجی دانشنامه" subtitle="ساختار تولیدشده در نسخه فعال" /><div className="grid grid-cols-2 gap-2"><TaavStatsCard variant="soft" tone="warning" size="sm" title="دسته‌بندی‌ها" value={overview.output.categoryCount} /><TaavStatsCard variant="soft" tone="warning" size="sm" title="زیردسته‌ها" value={overview.output.subcategoryCount} /></div></div></TaavCard>
        <TaavCard dir="rtl" variant="outlined" padding="md" radius="xl"><div className="grid gap-3"><CardTitle icon={<Sparkles className="h-4 w-4" />} title="عملکرد کلی" subtitle="شاخص‌های شبیه‌سازی‌شده سلامت دانشنامه" /><div className="grid grid-cols-2 gap-3"><TaavProgressSummary variant="ring" size="sm" tone="info" percent={overview.health.sourceCompleteness} label="کامل‌بودن منابع" showPercent /><TaavProgressSummary variant="ring" size="sm" tone="brand" percent={overview.health.contentQuality} label="کیفیت محتوا" showPercent /></div></div></TaavCard>
      </section>

      <p className="m-0 flex items-center justify-center gap-2 text-center text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]"><CircleAlert className="h-4 w-4" />تغییرات منابع فعلی برند نسخه فعال را تغییر نمی‌دهند؛ برای اعمال آن‌ها باید نسخه جدید ساخته و منتشر شود.</p>
    </main>
  );
}
