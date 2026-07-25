'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, CircleAlert, Download, Eye, FileText, Info, ShieldAlert, SquareDashed } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import { TaavTabs, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import type { KnowledgeBaseSourceSimpleComparison, KnowledgeBaseSourceSimpleComparisonStatus } from '@/app/lib/types/taavia-knowledge-base-source-snapshots';

type Props = {
  businessId: string;
  brandId: string;
  brandName: string;
  brandStatus: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  brandIcon: string | null;
  comparison: KnowledgeBaseSourceSimpleComparison;
};

const statusConfig: Record<KnowledgeBaseSourceSimpleComparisonStatus, { label: string; description: string; tone: 'success' | 'warning' | 'danger' | 'neutral'; icon: typeof CheckCircle2 }> = {
  UNCHANGED: { label: 'بدون تغییر', description: 'محتوای منبع فعلی برند با نسخه ثبت‌شده در دانشنامه یکسان است.', tone: 'success', icon: CheckCircle2 },
  CHANGED: { label: 'تغییر کرده', description: 'محتوای منبع فعلی برند با نسخه ثبت‌شده در دانشنامه متفاوت است.', tone: 'warning', icon: CircleAlert },
  CURRENT_SOURCE_DELETED: { label: 'منبع فعلی حذف شده', description: 'منبع اصلی برند دیگر وجود ندارد؛ نسخه ثبت‌شده همچنان قابل مشاهده است.', tone: 'danger', icon: ShieldAlert },
  CURRENT_SOURCE_UNAVAILABLE: { label: 'منبع فعلی در دسترس نیست', description: 'منبع فعلی در دسترس نیست؛ نسخه ثبت‌شده همچنان قابل مشاهده است.', tone: 'neutral', icon: SquareDashed },
};

function ReadOnlyContent({ content }: { content: string[] }) {
  return <article className="max-h-[460px] overflow-y-auto rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-5 py-4 text-right text-[length:var(--taav-text-sm)] leading-9 text-[var(--taav-text-body)]">{content.map((paragraph, index) => <p key={index} className={index === 0 ? 'm-0' : 'mt-5'}>{paragraph}</p>)}</article>;
}

export function TaaviaKnowledgeBaseSourceComparisonClient({ businessId, brandId, brandName, brandStatus, brandIcon, comparison }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const brandsHref = `/businesses/${businessId}/products/taavia/brands`;
  const overviewHref = `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base`;
  const sourcesHref = `${overviewHref}/sources`;
  const detailHref = `${sourcesHref}/${comparison.snapshotId}`;
  const initials = brandName.trim().slice(0, 2) || 'TA';
  const brandStatusLabel = brandStatus === 'ACTIVE' ? 'برند فعال' : brandStatus === 'INACTIVE' ? 'برند غیرفعال' : 'برند آرشیوشده';
  const status = statusConfig[comparison.comparisonStatus];
  const StatusIcon = status.icon;

  const downloadReport = () => {
    const currentContent = comparison.currentSourceContent?.join('\n\n') ?? 'منبع فعلی برند در دسترس نیست.';
    const report = [`گزارش مقایسه منبع`, `عنوان: ${comparison.title}`, `شناسه Snapshot: ${comparison.snapshotId}`, `Build: ${comparison.buildLabel}`, `تاریخ Snapshot: ${comparison.snapshotCreatedAt}`, `شناسه منبع فعلی: ${comparison.originalBrandSourceId ?? 'ثبت نشده'}`, `آخرین ویرایش منبع فعلی: ${comparison.currentSourceUpdatedAt ?? 'در دسترس نیست'}`, `وضعیت مقایسه: ${status.label}`, '', 'نسخه ثبت‌شده در دانشنامه (Snapshot):', comparison.snapshotContent.join('\n\n'), '', 'منبع فعلی برند:', currentContent].join('\n');
    const url = URL.createObjectURL(new Blob([report], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${comparison.snapshotId}-comparison.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setFeedback('گزارش مقایسه برای دانلود آماده شد.');
  };

  return <main dir="rtl" className="mx-auto grid max-w-7xl gap-4 pb-10">
    <header className="grid gap-4 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4 shadow-[var(--taav-shadow-sm)] md:p-5"><div className="relative min-h-16"><div className="absolute right-0 top-0 flex min-w-0 items-center gap-3 text-right"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-brand-soft)] text-xl font-black text-[var(--taav-brand-strong)]">{brandIcon ? <img src={brandIcon} alt="" className="h-full w-full object-cover" /> : initials}</div><div><h1 className="m-0 text-[clamp(1.15rem,2vw,1.55rem)] font-black text-[var(--taav-text-strong)]">مقایسه با منبع فعلی برند</h1><p className="mt-1.5 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">مقایسه نسخه ثبت‌شده در دانشنامه با آخرین محتوای منبع فعلی برند</p></div></div><Link href={detailHref} className="absolute left-0 top-1"><TaavButton variant="secondary" size="sm" iconStart={<ArrowLeft className="h-4 w-4" />}>بازگشت به جزئیات منبع</TaavButton></Link></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--taav-border-subtle)] pt-3"><TaavTabs value="sources" dir="rtl"><TaavTabsList className="flex flex-wrap justify-end gap-1 bg-transparent p-0"><TaavTabsTrigger value="overview" asChild><Link href={overviewHref}>نمای کلی</Link></TaavTabsTrigger><TaavTabsTrigger value="sources" asChild><Link href={sourcesHref}>منابع</Link></TaavTabsTrigger><TaavTabsTrigger value="builds" disabled>ساخت‌ها</TaavTabsTrigger><TaavTabsTrigger value="versions" disabled>نسخه‌ها</TaavTabsTrigger><TaavTabsTrigger value="knowledge" disabled>دانشنامه</TaavTabsTrigger></TaavTabsList></TaavTabs><TaavBadge tone={brandStatus === 'ACTIVE' ? 'success' : 'neutral'} variant="soft">{brandStatusLabel}</TaavBadge></div><nav aria-label="مسیر مقایسه منبع" className="flex flex-wrap items-center justify-end gap-2 text-[11px] text-[var(--taav-text-muted)]"><Link href={brandsHref}>مدیریت برندها</Link><span>←</span><span className="font-bold text-[var(--taav-text-body)]">{brandName}</span><span>←</span><Link href={overviewHref}>مدیریت دانش</Link><span>←</span><Link href={sourcesHref}>منابع</Link><span>←</span><Link href={detailHref}>جزئیات منبع</Link><span>←</span><span>مقایسه با منبع فعلی</span></nav></header>
    {feedback ? <div role="status" className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-info)]/30 bg-[var(--taav-info)]/10 px-4 py-3 text-right text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">{feedback}</div> : null}
    <TaavCard variant="outlined" padding="md" radius="xl"><div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.25fr]"><div className="text-right"><p className="m-0 text-xs text-[var(--taav-text-muted)]">نسخه ثبت‌شده در دانشنامه</p><p className="mt-2 font-bold text-[var(--taav-text-strong)]">Snapshot: <span dir="ltr">{comparison.snapshotId}</span></p><p className="mt-1 text-sm text-[var(--taav-text-muted)]" dir="ltr">{comparison.snapshotCreatedAt} · {comparison.buildLabel}</p></div><div className="border-y border-[var(--taav-border-subtle)] py-4 text-right lg:border-x lg:border-y-0 lg:px-5 lg:py-0"><p className="m-0 text-xs text-[var(--taav-text-muted)]">منبع فعلی برند</p><p className="mt-2 font-bold text-[var(--taav-text-strong)]">شناسه: <span dir="ltr">{comparison.originalBrandSourceId ?? 'ثبت نشده'}</span></p><p className="mt-1 text-sm text-[var(--taav-text-muted)]">{comparison.currentSourceUpdatedAt ? <span dir="ltr">آخرین ویرایش: {comparison.currentSourceUpdatedAt}</span> : 'وضعیت: در دسترس نیست'}</p></div><div className="flex items-start gap-3 text-right"><span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--taav-radius-lg)] bg-[var(--taav-warning)]/10 text-[var(--taav-warning-strong)]"><StatusIcon className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center gap-2"><p className="m-0 font-bold text-[var(--taav-text-strong)]">نتیجه مقایسه</p><TaavBadge tone={status.tone} variant="soft">{status.label}</TaavBadge></div><p className="mt-2 text-sm leading-6 text-[var(--taav-text-muted)]">{status.description}</p></div></div></div></TaavCard>
    <section className="grid gap-4 lg:grid-cols-2"><TaavCard variant="outlined" padding="md" radius="xl"><div className="mb-4 flex items-center justify-between gap-3 text-right"><div><h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">نسخه ثبت‌شده در دانشنامه (Snapshot)</h2><p className="mt-1 text-xs text-[var(--taav-text-muted)]" dir="ltr">{comparison.snapshotCreatedAt}</p></div><FileText className="h-5 w-5 text-[var(--taav-brand-strong)]" /></div><ReadOnlyContent content={comparison.snapshotContent} /></TaavCard><TaavCard variant="outlined" padding="md" radius="xl"><div className="mb-4 flex items-center justify-between gap-3 text-right"><div><h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">منبع فعلی برند</h2><p className="mt-1 text-xs text-[var(--taav-text-muted)]">{comparison.currentSourceUpdatedAt ? <span dir="ltr">{comparison.currentSourceUpdatedAt}</span> : 'بدون تاریخ به‌روزرسانی'}</p></div><Info className="h-5 w-5 text-[var(--taav-text-muted)]" /></div>{comparison.currentSourceContent ? <ReadOnlyContent content={comparison.currentSourceContent} /> : <TaavEmptyState variant="default" size="md" title={comparison.comparisonStatus === 'CURRENT_SOURCE_DELETED' ? 'منبع فعلی حذف شده است' : 'منبع فعلی در دسترس نیست'} description={comparison.comparisonStatus === 'CURRENT_SOURCE_DELETED' ? 'منبع اصلی برند دیگر وجود ندارد، اما نسخه ثبت‌شده در دانشنامه همچنان قابل مشاهده است.' : 'منبع فعلی برند در دسترس نیست؛ Snapshot همچنان برای مشاهده نگهداری می‌شود.'} />}</TaavCard></section>
    <footer className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-3"><Link href={detailHref}><TaavButton variant="secondary" size="sm" iconStart={<ArrowLeft className="h-4 w-4" />}>بازگشت به جزئیات منبع</TaavButton></Link><div className="flex flex-wrap gap-2"><TaavButton size="sm" variant="secondary" disabled={!comparison.currentSourceExists} iconStart={<Eye className="h-4 w-4" />} onClick={() => setFeedback('نمایش منبع فعلی برند در مرحله بعدی پیاده‌سازی می‌شود.')}>مشاهده منبع فعلی برند</TaavButton><TaavButton size="sm" iconStart={<Download className="h-4 w-4" />} onClick={downloadReport}>دانلود گزارش مقایسه</TaavButton></div></footer>
  </main>;
}
