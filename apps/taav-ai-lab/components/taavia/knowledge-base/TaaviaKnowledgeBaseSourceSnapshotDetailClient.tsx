'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, CircleAlert, Download, Eye, FileText, Files, GitCompareArrows, Globe2, Hash, Info, Layers3, Ruler, ShieldAlert, SquareDashed, Type } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavTabs, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import type { KnowledgeBaseSourceComparisonStatus, KnowledgeBaseSourceSnapshotDetailView } from '@/app/lib/types/taavia-knowledge-base-source-snapshots';
import { TaaviaKnowledgeBaseFileSnapshotDetailClient } from '@/components/taavia/knowledge-base/TaaviaKnowledgeBaseFileSnapshotDetailClient';

type Props = {
  businessId: string;
  brandId: string;
  brandName: string;
  brandStatus: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  brandIcon: string | null;
  snapshot: KnowledgeBaseSourceSnapshotDetailView;
};

const comparisonConfig: Record<KnowledgeBaseSourceComparisonStatus, { label: string; description: string; tone: 'success' | 'warning' | 'danger' | 'neutral'; icon: typeof CheckCircle2 }> = {
  UNCHANGED: { label: 'بدون تغییر نسبت به منبع فعلی', description: 'این منبع پس از ساخت دانشنامه تغییری نکرده است.', tone: 'success', icon: CheckCircle2 },
  CHANGED_AFTER_BUILD: { label: 'تغییرکرده پس از Build', description: 'منبع فعلی برند پس از ثبت این Snapshot تغییر کرده است.', tone: 'warning', icon: CircleAlert },
  CURRENT_SOURCE_DELETED: { label: 'منبع فعلی حذف شده', description: 'منبع فعلی دیگر وجود ندارد؛ Snapshot همچنان قابل مشاهده است.', tone: 'danger', icon: ShieldAlert },
  CURRENT_SOURCE_UNAVAILABLE: { label: 'منبع فعلی در دسترس نیست', description: 'وضعیت منبع فعلی در دسترس نیست؛ Snapshot بدون تغییر نگهداری می‌شود.', tone: 'neutral', icon: SquareDashed },
};

export function TaaviaKnowledgeBaseSourceSnapshotDetailClient({ businessId, brandId, brandName, brandStatus, brandIcon, snapshot }: Props) {
  if (snapshot.detailMode === 'FILE') return <TaaviaKnowledgeBaseFileSnapshotDetailClient businessId={businessId} brandId={brandId} brandName={brandName} brandStatus={brandStatus} brandIcon={brandIcon} snapshot={snapshot} />;
  const [feedback, setFeedback] = useState<string | null>(null);
  const brandsHref = `/businesses/${businessId}/products/taavia/brands`;
  const overviewHref = `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base`;
  const sourcesHref = `${overviewHref}/sources`;
  const compareHref = `${sourcesHref}/${snapshot.snapshotId}/compare`;
  const initials = brandName.trim().slice(0, 2) || 'TA';
  const brandStatusLabel = brandStatus === 'ACTIVE' ? 'برند فعال' : brandStatus === 'INACTIVE' ? 'برند غیرفعال' : 'برند آرشیوشده';
  const comparison = comparisonConfig[snapshot.comparisonStatus];
  const ComparisonIcon = comparison.icon;
  const metadata = [
    { label: 'نوع محتوا', value: snapshot.metadata.contentType, icon: Type },
    { label: 'گروه منبع', value: snapshot.metadata.sourceGroup, icon: Layers3 },
    { label: 'طول محتوا', value: `${snapshot.metadata.characterCount.toLocaleString('fa-IR')} کاراکتر`, icon: Ruler },
    { label: 'تعداد کلمات', value: `${snapshot.metadata.wordCount.toLocaleString('fa-IR')} کلمه`, icon: Hash },
    { label: 'زبان محتوا', value: snapshot.metadata.contentLanguage, icon: Globe2 },
    { label: 'شناسه منبع اصلی برند', value: snapshot.metadata.originalBrandSourceIdentifier ?? 'ثبت نشده', icon: Files, ltr: true },
  ];

  const downloadSnapshot = () => {
    const text = `${snapshot.title}\n\n${snapshot.content.join('\n\n')}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${snapshot.snapshotId}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setFeedback('فایل Snapshot برای دانلود آماده شد.');
  };

  return (
    <main dir="rtl" className="mx-auto grid max-w-7xl gap-4 pb-10">
      <header className="grid gap-4 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4 shadow-[var(--taav-shadow-sm)] md:p-5">
        <div className="relative min-h-16"><div className="absolute right-0 top-0 flex min-w-0 items-center gap-3 text-right"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-brand-soft)] text-xl font-black text-[var(--taav-brand-strong)]">{brandIcon ? <img src={brandIcon} alt="" className="h-full w-full object-cover" /> : initials}</div><div><h1 className="m-0 text-[clamp(1.15rem,2vw,1.55rem)] font-black text-[var(--taav-text-strong)]">جزئیات منبع</h1><p className="mt-1.5 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">مشاهده جزئیات منبع Snapshot‌شده در دانشنامه</p></div></div><Link href={sourcesHref} className="absolute left-0 top-1"><TaavButton variant="secondary" size="sm" iconStart={<ArrowLeft className="h-4 w-4" />}>بازگشت به فهرست منابع</TaavButton></Link></div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--taav-border-subtle)] pt-3"><TaavTabs value="sources" dir="rtl"><TaavTabsList className="flex flex-wrap justify-end gap-1 bg-transparent p-0"><TaavTabsTrigger value="overview" asChild><Link href={overviewHref}>نمای کلی</Link></TaavTabsTrigger><TaavTabsTrigger value="sources" asChild><Link href={sourcesHref}>منابع</Link></TaavTabsTrigger><TaavTabsTrigger value="builds" disabled>ساخت‌ها</TaavTabsTrigger><TaavTabsTrigger value="versions" disabled>نسخه‌ها</TaavTabsTrigger><TaavTabsTrigger value="knowledge" disabled>دانشنامه</TaavTabsTrigger></TaavTabsList></TaavTabs><TaavBadge tone={brandStatus === 'ACTIVE' ? 'success' : 'neutral'} variant="soft">{brandStatusLabel}</TaavBadge></div>
        <nav aria-label="مسیر جزئیات منبع" className="flex flex-wrap items-center justify-end gap-2 text-[11px] text-[var(--taav-text-muted)]"><Link href={brandsHref} className="transition hover:text-[var(--taav-brand-strong)]">مدیریت برندها</Link><span aria-hidden>←</span><span className="font-bold text-[var(--taav-text-body)]">{brandName}</span><span aria-hidden>←</span><Link href={overviewHref} className="transition hover:text-[var(--taav-brand-strong)]">مدیریت دانش</Link><span aria-hidden>←</span><Link href={sourcesHref} className="transition hover:text-[var(--taav-brand-strong)]">منابع</Link><span aria-hidden>←</span><span>جزئیات منبع</span></nav>
      </header>

      {feedback ? <div role="status" className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-info)]/30 bg-[var(--taav-info)]/10 px-4 py-3 text-right text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">{feedback}</div> : null}

      <TaavCard variant="outlined" padding="md" radius="xl"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-start gap-3 text-right"><span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--taav-radius-lg)] bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]"><FileText className="h-5 w-5" /></span><div><h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">{snapshot.title}</h2><p className="mt-1 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">{snapshot.metadata.contentType} · ثبت‌شده در {snapshot.buildLabel}</p></div></div><dl className="grid grid-cols-2 gap-x-7 gap-y-3 text-right text-sm sm:grid-cols-4"><div><dt className="text-[var(--taav-text-muted)]">نوع منبع</dt><dd className="mt-1 font-bold text-[var(--taav-text-strong)]">{snapshot.metadata.contentType}</dd></div><div><dt className="text-[var(--taav-text-muted)]">تاریخ Snapshot</dt><dd className="mt-1 whitespace-nowrap font-bold text-[var(--taav-text-strong)]" dir="ltr">{snapshot.snapshotCreatedAt}</dd></div><div><dt className="text-[var(--taav-text-muted)]">ثبت‌شده در</dt><dd className="mt-1 font-bold text-[var(--taav-brand-strong)]">{snapshot.buildLabel}</dd></div><div><dt className="text-[var(--taav-text-muted)]">شناسه Snapshot</dt><dd className="mt-1 font-bold text-[var(--taav-text-strong)]" dir="ltr">{snapshot.snapshotId}</dd></div></dl></div></TaavCard>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-4"><TaavCard variant="outlined" padding="md" radius="xl"><div className="flex items-start gap-3 text-right"><span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--taav-radius-lg)] bg-[var(--taav-success)]/10 text-[var(--taav-success-strong)]"><ComparisonIcon className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="m-0 text-[length:var(--taav-text-base)] font-black text-[var(--taav-text-strong)]">وضعیت نسبت به منبع فعلی برند</h2><TaavBadge tone={comparison.tone} variant="soft">{comparison.label}</TaavBadge></div><p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">{comparison.description}</p>{snapshot.lastComparedAt ? <p className="mt-2 text-xs text-[var(--taav-text-muted)]">آخرین بررسی: <span dir="ltr">{snapshot.lastComparedAt}</span></p> : null}</div></div></TaavCard>
          <TaavCard variant="outlined" padding="md" radius="xl"><div className="mb-4 flex items-center gap-2 text-right"><FileText className="h-5 w-5 text-[var(--taav-brand-strong)]" /><h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">محتوای Snapshot</h2></div><article className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-5 py-4 text-right text-[length:var(--taav-text-sm)] leading-9 text-[var(--taav-text-body)]">{snapshot.content.map((paragraph, index) => <p key={index} className={index === 0 ? 'm-0' : 'mt-5'}>{paragraph}</p>)}</article></TaavCard></div>
        <div className="h-fit"><TaavCard variant="outlined" padding="md" radius="xl"><div className="mb-3 flex items-center gap-2 text-right"><Info className="h-4 w-4 text-[var(--taav-text-muted)]" /><h2 className="m-0 font-black text-[var(--taav-text-strong)]">اطلاعات Snapshot</h2></div><dl className="divide-y divide-[var(--taav-border-subtle)]">{metadata.map((item) => { const Icon = item.icon; return <div key={item.label} className="flex items-start justify-between gap-3 py-3 text-right"><dt className="flex items-center gap-2 text-xs text-[var(--taav-text-muted)]"><Icon className="h-4 w-4" />{item.label}</dt><dd className="max-w-[55%] break-words text-left text-sm font-bold text-[var(--taav-text-strong)]" dir={item.ltr ? 'ltr' : 'rtl'}>{item.value}</dd></div>; })}<div className="flex items-start justify-between gap-3 py-3 text-right"><dt className="text-xs text-[var(--taav-text-muted)]">وضعیت منبع فعلی</dt><dd><TaavBadge tone={snapshot.currentBrandSourceExists ? 'success' : 'neutral'} variant="soft">{snapshot.currentBrandSourceExists ? 'در دسترس' : 'در دسترس نیست'}</TaavBadge></dd></div></dl></TaavCard></div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-3"><Link href={sourcesHref}><TaavButton variant="secondary" size="sm" iconStart={<ArrowLeft className="h-4 w-4" />}>بازگشت به فهرست منابع</TaavButton></Link><div className="flex flex-wrap gap-2"><TaavButton size="sm" variant="secondary" disabled={!snapshot.currentBrandSourceExists} iconStart={<Eye className="h-4 w-4" />} onClick={() => setFeedback('نمایش منبع فعلی برند در مرحله بعدی پیاده‌سازی می‌شود.')}>مشاهده منبع فعلی برند</TaavButton><Link href={compareHref}><TaavButton size="sm" variant="secondary" iconStart={<GitCompareArrows className="h-4 w-4" />}>مقایسه با منبع فعلی</TaavButton></Link><TaavButton size="sm" iconStart={<Download className="h-4 w-4" />} onClick={downloadSnapshot}>دانلود Snapshot</TaavButton></div></footer>
    </main>
  );
}
