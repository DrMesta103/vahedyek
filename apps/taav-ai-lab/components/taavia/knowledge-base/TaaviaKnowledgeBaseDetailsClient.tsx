'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ArrowLeft, Archive, CheckCircle2, Database, FileText, FolderTree, Info, Layers3, PencilLine, Plus, RefreshCw } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import type { KnowledgeBaseDetailsReadModel } from '@/app/lib/types/taavia-knowledge-base-details';
import { startKnowledgeBaseUpdateAction } from '@/app/businesses/[businessId]/products/taavia/brands/[brandId]/knowledge-base/actions';

type Props = { businessId: string; brandId: string; brandName: string; brandIcon: string | null; details: KnowledgeBaseDetailsReadModel };

function SummaryMetric({ label, value, icon, tone = 'brand' }: { label: string; value: string | number; icon: React.ReactNode; tone?: 'brand' | 'success' | 'warning' | 'info' }) {
  const toneClass = { brand: 'bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]', success: 'bg-emerald-500/10 text-emerald-400', warning: 'bg-amber-500/10 text-amber-400', info: 'bg-sky-500/10 text-sky-400' }[tone];
  return <div className="flex min-w-0 items-center justify-between gap-3 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-4 py-3 text-right"><span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--taav-radius-md)] ${toneClass}`}>{icon}</span><div><p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{label}</p><strong className="mt-1 block text-[length:var(--taav-text-xl)] tabular-nums text-[var(--taav-text-strong)]">{value}</strong></div></div>;
}

function SourceGroupIcon({ group }: { group: string }) {
  if (group === 'faqs') return <Info className="h-4 w-4" />;
  if (group === 'files') return <FileText className="h-4 w-4" />;
  if (group === 'products') return <Database className="h-4 w-4" />;
  return <Layers3 className="h-4 w-4" />;
}

export function TaaviaKnowledgeBaseDetailsClient({ businessId, brandId, brandName, brandIcon, details }: Props) {
  const router = useRouter();
  const [pending, startUpdate] = useTransition();
  const [updateError, setUpdateError] = useState<string | null>(null);
  const detailsHref = `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/${details.knowledgeBaseId}`;
  const versionsHref = `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/versions`;
  const statusLabel = details.isActive ? 'فعال' : 'غیرفعال';
  const initials = brandName.trim().slice(0, 2) || 'TA';
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(versionsHref);
  };

  const header = <header className="grid gap-3 rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-3 shadow-[var(--taav-shadow-sm)]">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5 text-right"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--taav-radius-lg)] bg-violet-500/15 text-sm font-black text-violet-300">{brandIcon ? <img src={brandIcon} alt="" className="h-full w-full object-cover" /> : initials}</div><div><div className="flex flex-wrap items-center gap-2"><h1 className="m-0 text-[clamp(1rem,1.5vw,1.2rem)] font-black text-[var(--taav-text-strong)]">دانشنامه برند {brandName}</h1><bdi className="rounded bg-[var(--taav-surface-soft)] px-2 py-0.5 text-xs font-bold text-[var(--taav-text-body)]">{details.versionLabel}</bdi><TaavBadge tone={details.isActive ? 'success' : 'neutral'} variant="soft" size="sm">{statusLabel}</TaavBadge></div><div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--taav-text-muted)]"><span>نوع ساخت: {details.build.type}</span><span>تاریخ ساخت: {details.build.createdAt}</span><span>توسط: {details.build.createdBy ?? '—'}</span></div></div></div>
      <div className="flex gap-2"><button type="button" onClick={goBack} className="inline-flex min-h-8 items-center gap-2 rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 text-xs font-semibold text-[var(--taav-text-body)] transition hover:bg-[var(--taav-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-brand)]"><ArrowLeft className="h-3.5 w-3.5" />بازگشت</button></div>
    </div>
  </header>;

  const changeTotal = details.synchronization.added + details.synchronization.edited + details.synchronization.archived;
  const startUpdateBuild = () => startUpdate(async () => {
    setUpdateError(null);
    try {
      const buildId = await startKnowledgeBaseUpdateAction({ businessId, brandId, knowledgeBaseId: details.knowledgeBaseId });
      router.push(`/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/builds/${buildId}`);
      router.refresh();
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'شروع بروزرسانی ناموفق بود.');
      router.refresh();
    }
  });
  return <main dir="rtl" className="mx-auto grid max-w-7xl gap-4 pb-10">{header}
    <section className={`rounded-[var(--taav-radius-xl)] border p-4 ${details.isActive && !details.synchronization.isSynchronized ? 'border-teal-400/40 bg-teal-500/5' : 'border-[var(--taav-border-subtle)] bg-[var(--taav-surface)]'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3 text-right"><span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${details.isActive && !details.synchronization.isSynchronized ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{details.isActive && !details.synchronization.isSynchronized ? <Info className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}</span><div><h2 className="m-0 text-lg font-black text-[var(--taav-text-strong)]">{details.isActive ? details.update.activeBuildId ? 'بروزرسانی دانشنامه در حال ساخت است' : details.synchronization.isSynchronized ? 'دانشنامه با منابع فعلی همگام است' : 'دانشنامه شما نیاز به بروزرسانی دارد' : 'این نسخه تاریخی است و در حال حاضر توسط چت‌بات استفاده نمی‌شود.'}</h2><p className="mt-1 text-sm text-[var(--taav-text-muted)]">{details.isActive && !details.synchronization.isSynchronized ? `${changeTotal} تغییر در منابع برند پس از ساخت این نسخه ثبت شده است. ${details.update.reason}` : details.isActive ? details.update.reason : null}</p></div></div>{details.isActive ? <div className="flex flex-col items-start gap-2"><TaavButton size="sm" disabled={!details.update.canStart || pending} onClick={startUpdateBuild} iconStart={<RefreshCw className="h-4 w-4" />}>{pending ? 'در حال شروع…' : 'بروزرسانی Knowledge Base'}</TaavButton>{details.update.activeBuildId ? <Link href={`/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/builds/${details.update.activeBuildId}`} className="text-xs font-semibold text-[var(--taav-brand-strong)]">مشاهده روند ساخت</Link> : null}</div> : null}</div>
      {updateError ? <p role="alert" className="mt-3 text-sm text-rose-300">{updateError}</p> : null}
      {details.isActive && !details.synchronization.isSynchronized ? <div className="mt-4 grid gap-3 sm:grid-cols-3"><SummaryMetric label="منابع جدید" value={details.synchronization.added} icon={<Plus className="h-5 w-5" />} tone="info" /><SummaryMetric label="منابع ویرایش‌شده" value={details.synchronization.edited} icon={<PencilLine className="h-5 w-5" />} tone="warning" /><SummaryMetric label="منابع آرشیوشده" value={details.synchronization.archived} icon={<Archive className="h-5 w-5" />} tone="success" /></div> : null}
    </section>
    <section className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4"><h2 className="m-0 text-right text-base font-black">خلاصه این نسخه</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SummaryMetric label="دسته‌بندی‌های اصلی" value={details.summary.rootCategoryCount} icon={<FolderTree className="h-5 w-5" />} /><SummaryMetric label="زیردسته‌ها" value={details.summary.subcategoryCount} icon={<Layers3 className="h-5 w-5" />} tone="info" /><SummaryMetric label="منابع Snapshot شده" value={details.summary.snapshotCount} icon={<Database className="h-5 w-5" />} tone="success" /><SummaryMetric label="حجم کل محتوا" value={`${(details.summary.storedContentSizeBytes ?? 0) / 1024 / 1024 < 0.01 ? '—' : `${((details.summary.storedContentSizeBytes ?? 0) / 1024 / 1024).toFixed(2)} MB`}`} icon={<FileText className="h-5 w-5" />} tone="warning" /></div></section>
    <section className="grid gap-4 lg:grid-cols-2"><TaavCard variant="outlined" padding="md" radius="xl"><h2 className="m-0 text-right font-black">منابع استفاده‌شده در این نسخه</h2><div className="mt-4 grid gap-2">{details.sourceGroups.map((group) => <div key={group.key} className="flex items-center justify-between rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 py-2.5 text-sm"><span className="flex items-center gap-2"><span className="text-[var(--taav-brand-strong)]"><SourceGroupIcon group={group.key} /></span>{group.label}</span><b>{group.count} منبع</b></div>)}</div><Link href={`${detailsHref}/sources`} className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] text-sm font-semibold transition hover:bg-[var(--taav-surface-soft)]"><ArrowLeft className="h-4 w-4" />مشاهده همه منابع</Link></TaavCard><TaavCard variant="outlined" padding="md" radius="xl"><h2 className="m-0 text-right font-black">دسته‌بندی‌های اصلی</h2><div className="mt-4 grid gap-2">{details.categories.map((category) => <div key={category.id} className="flex items-center justify-between rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 py-2.5 text-sm"><span className="flex items-center gap-2"><span className="text-violet-300"><FolderTree className="h-4 w-4" /></span>{category.title}</span><span className="text-[var(--taav-text-muted)]">{category.childCount} زیردسته · {category.sourceCount} منبع</span></div>)}</div><Link href={`${detailsHref}/categories`} className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] text-sm font-semibold transition hover:bg-[var(--taav-surface-soft)]"><ArrowLeft className="h-4 w-4" />مشاهده همه دسته‌بندی‌ها</Link></TaavCard></section>
    <TaavCard variant="outlined" padding="md" radius="xl"><h2 className="m-0 text-right font-black">اطلاعات ساخت این نسخه</h2><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4"><div><dt className="text-[var(--taav-text-muted)]">شناسه ساخت</dt><dd className="mt-1 font-semibold"><bdi dir="ltr">{details.build.id ?? '—'}</bdi></dd></div><div><dt className="text-[var(--taav-text-muted)]">مدت زمان ساخت</dt><dd className="mt-1 font-semibold">{details.build.duration ?? '—'}</dd></div><div><dt className="text-[var(--taav-text-muted)]">منابع ورودی</dt><dd className="mt-1 font-semibold">{details.build.inputSourceCount} منبع</dd></div><div><dt className="text-[var(--taav-text-muted)]">وضعیت ساخت</dt><dd className="mt-1"><TaavBadge tone={details.build.status === 'موفق' ? 'success' : 'neutral'} variant="soft">{details.build.status}</TaavBadge></dd></div></dl></TaavCard>
  </main>;
}
