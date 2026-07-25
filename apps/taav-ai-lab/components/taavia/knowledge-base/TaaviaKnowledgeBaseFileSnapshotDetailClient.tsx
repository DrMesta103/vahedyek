'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Download, Eye, FileText, Image as ImageIcon, Info, ScanText } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import { TaavTabs, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import type { KnowledgeBaseFileSnapshotDetail } from '@/app/lib/types/taavia-knowledge-base-source-snapshots';

type Props = {
  businessId: string;
  brandId: string;
  brandName: string;
  brandStatus: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  brandIcon: string | null;
  snapshot: KnowledgeBaseFileSnapshotDetail;
};

export function TaaviaKnowledgeBaseFileSnapshotDetailClient({ businessId, brandId, brandName, brandStatus, brandIcon, snapshot }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const brandsHref = `/businesses/${businessId}/products/taavia/brands`;
  const overviewHref = `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base`;
  const sourcesHref = `${overviewHref}/sources`;
  const initials = brandName.trim().slice(0, 2) || 'TA';
  const brandStatusLabel = brandStatus === 'ACTIVE' ? 'برند فعال' : brandStatus === 'INACTIVE' ? 'برند غیرفعال' : 'برند آرشیوشده';
  const isImage = snapshot.file.fileType.startsWith('image/');

  const downloadSnapshot = () => {
    const text = `${snapshot.title}\n\n${snapshot.file.extractedText.join('\n\n')}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${snapshot.snapshotId}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setFeedback('فایل Snapshot برای دانلود آماده شد.');
  };

  return <main dir="rtl" className="mx-auto grid max-w-7xl gap-4 pb-10">
    <header className="grid gap-4 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4 shadow-[var(--taav-shadow-sm)] md:p-5"><div className="relative min-h-16"><div className="absolute right-0 top-0 flex min-w-0 items-center gap-3 text-right"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-brand-soft)] text-xl font-black text-[var(--taav-brand-strong)]">{brandIcon ? <img src={brandIcon} alt="" className="h-full w-full object-cover" /> : initials}</div><div><h1 className="m-0 text-[clamp(1.15rem,2vw,1.55rem)] font-black text-[var(--taav-text-strong)]">جزئیات منبع (فایل)</h1><p className="mt-1.5 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">مشاهده جزئیات Snapshot (فقط خواندنی)</p></div></div><Link href={sourcesHref} className="absolute left-0 top-1"><TaavButton variant="secondary" size="sm" iconStart={<ArrowLeft className="h-4 w-4" />}>بازگشت به فهرست منابع</TaavButton></Link></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--taav-border-subtle)] pt-3"><TaavTabs value="sources" dir="rtl"><TaavTabsList className="flex flex-wrap justify-end gap-1 bg-transparent p-0"><TaavTabsTrigger value="overview" asChild><Link href={overviewHref}>نمای کلی</Link></TaavTabsTrigger><TaavTabsTrigger value="sources" asChild><Link href={sourcesHref}>منابع</Link></TaavTabsTrigger><TaavTabsTrigger value="builds" disabled>ساخت‌ها</TaavTabsTrigger><TaavTabsTrigger value="versions" disabled>نسخه‌ها</TaavTabsTrigger><TaavTabsTrigger value="knowledge" disabled>دانشنامه</TaavTabsTrigger></TaavTabsList></TaavTabs><TaavBadge tone={brandStatus === 'ACTIVE' ? 'success' : 'neutral'} variant="soft">{brandStatusLabel}</TaavBadge></div><nav aria-label="مسیر جزئیات فایل" className="flex flex-wrap items-center justify-end gap-2 text-[11px] text-[var(--taav-text-muted)]"><Link href={brandsHref}>مدیریت برندها</Link><span>←</span><span className="font-bold text-[var(--taav-text-body)]">{brandName}</span><span>←</span><Link href={overviewHref}>مدیریت دانش</Link><span>←</span><Link href={sourcesHref}>منابع</Link><span>←</span><span>جزئیات منبع</span></nav></header>
    {feedback ? <div role="status" className="rounded-[var(--taav-radius-lg)] border border-[var(--taav-info)]/30 bg-[var(--taav-info)]/10 px-4 py-3 text-right text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">{feedback}</div> : null}
    <TaavCard variant="outlined" padding="md" radius="xl"><dl className="grid gap-4 text-right sm:grid-cols-2 xl:grid-cols-5"><div><dt className="text-xs text-[var(--taav-text-muted)]">عنوان منبع (منبع اصلی)</dt><dd className="mt-2 font-black text-[var(--taav-text-strong)]">{snapshot.title}</dd></div><div><dt className="text-xs text-[var(--taav-text-muted)]">نوع منبع</dt><dd className="mt-2 flex items-center gap-2 font-bold text-[var(--taav-text-strong)]"><ImageIcon className="h-5 w-5 text-[var(--taav-brand-strong)]" />تصویر</dd></div><div><dt className="text-xs text-[var(--taav-text-muted)]">تاریخ Snapshot</dt><dd className="mt-2 font-bold text-[var(--taav-text-strong)]" dir="ltr">{snapshot.snapshotCreatedAt}</dd></div><div><dt className="text-xs text-[var(--taav-text-muted)]">برچسب Build</dt><dd className="mt-2 font-bold text-[var(--taav-brand-strong)]">{snapshot.buildLabel}</dd></div><div><dt className="text-xs text-[var(--taav-text-muted)]">شناسه منبع اصلی (برند)</dt><dd className="mt-2 font-bold text-[var(--taav-text-strong)]" dir="ltr">{snapshot.metadata.originalBrandSourceIdentifier ?? 'ثبت نشده'}</dd></div></dl></TaavCard>
    <TaavCard variant="outlined" padding="md" radius="xl"><dl className="grid gap-4 text-right sm:grid-cols-2 xl:grid-cols-5"><div><dt className="text-xs text-[var(--taav-text-muted)]">وضعیت منبع اصلی</dt><dd className="mt-2"><TaavBadge tone={snapshot.currentBrandSourceExists ? 'success' : 'neutral'} variant="soft"><CheckCircle2 className="h-3.5 w-3.5" />{snapshot.currentBrandSourceExists ? 'در دسترس' : 'در دسترس نیست'}</TaavBadge></dd></div><div><dt className="text-xs text-[var(--taav-text-muted)]">وضعیت استخراج متن</dt><dd className="mt-2"><TaavBadge tone={snapshot.file.extractionStatus === 'EXTRACTED' ? 'success' : 'neutral'} variant="soft">{snapshot.file.extractionStatus === 'EXTRACTED' ? 'استخراج شده' : 'در دسترس نیست'}</TaavBadge></dd></div><div><dt className="text-xs text-[var(--taav-text-muted)]">تعداد کلمات استخراج‌شده</dt><dd className="mt-2 font-bold text-[var(--taav-text-strong)]">{snapshot.file.extractedWordCount.toLocaleString('fa-IR')}</dd></div><div><dt className="text-xs text-[var(--taav-text-muted)]">حجم فایل</dt><dd className="mt-2 font-bold text-[var(--taav-text-strong)]" dir="ltr">{snapshot.file.fileSize}</dd></div><div><dt className="text-xs text-[var(--taav-text-muted)]">نوع فایل</dt><dd className="mt-2 font-bold text-[var(--taav-text-strong)]" dir="ltr">{snapshot.file.fileType}</dd></div></dl></TaavCard>
    <section className="grid gap-4 lg:grid-cols-2"><TaavCard variant="outlined" padding="md" radius="xl"><div className="mb-4 flex items-center justify-between gap-3 text-right"><h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">پیش‌نمایش Snapshot</h2><ImageIcon className="h-5 w-5 text-[var(--taav-brand-strong)]" /></div>{isImage && snapshot.file.previewUrl ? <div className="overflow-hidden rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-black/20"><img src={snapshot.file.previewUrl} alt={`پیش‌نمایش Snapshot ${snapshot.title}`} className="aspect-video w-full object-contain" /></div> : <TaavEmptyState variant="default" size="md" title="پیش‌نمایش در دسترس نیست" description="نمایش درون‌خطی برای این نوع فایل پشتیبانی نمی‌شود." />}<p className="mt-3 flex items-start gap-2 text-sm leading-6 text-[var(--taav-text-muted)]"><Info className="mt-1 h-4 w-4 shrink-0" />این Snapshot به عنوان منبع در دانشنامه ثبت و قابل استفاده است.</p></TaavCard><TaavCard variant="outlined" padding="md" radius="xl"><div className="mb-4 flex items-center justify-between gap-3 text-right"><h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">متن استخراج‌شده</h2><ScanText className="h-5 w-5 text-[var(--taav-brand-strong)]" /></div><article className="max-h-[460px] overflow-y-auto rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-5 py-4 text-right text-[length:var(--taav-text-sm)] leading-9 text-[var(--taav-text-body)]">{snapshot.file.extractedText.map((paragraph, index) => <p key={index} className={index === 0 ? 'm-0' : 'mt-4'}>{paragraph}</p>)}</article></TaavCard></section>
    <footer className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-3"><Link href={sourcesHref}><TaavButton variant="secondary" size="sm" iconStart={<ArrowLeft className="h-4 w-4" />}>بازگشت به فهرست منابع</TaavButton></Link><div className="flex flex-wrap gap-2"><TaavButton size="sm" variant="secondary" disabled={!snapshot.currentBrandSourceExists} iconStart={<Eye className="h-4 w-4" />} onClick={() => setFeedback('مشاهده منبع اصلی در مرحله بعدی پیاده‌سازی می‌شود.')}>مشاهده منبع اصلی</TaavButton><TaavButton size="sm" iconStart={<Download className="h-4 w-4" />} onClick={downloadSnapshot}>دانلود Snapshot</TaavButton></div></footer>
  </main>;
}
