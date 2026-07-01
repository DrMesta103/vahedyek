'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, FileText, Plus } from 'lucide-react';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import type { OcrSimulationJob, Tenant } from '@/app/lib/data';
import { formatActivityLabel, formatRelativeActivityLabel, formatTokenCount } from '@/app/lib/business-utils';
import { OcrPageShell } from '@/components/ocr/OcrPageShell';
import { OcrSectionCard } from '@/components/ocr/OcrSectionCard';
import { buildOcrStats, formatConfidence, getStatusMeta } from '@/components/ocr/utils';

type OcrHubClientProps = {
  business: Tenant;
  businessId: string;
  initialJobs: OcrSimulationJob[];
};

const STAT_ITEMS = [
  { key: 'total', label: 'کل اجراها' },
  { key: 'completed', label: 'تکمیل شده' },
  { key: 'processing', label: 'در حال پردازش' },
  { key: 'avgConfidence', label: 'میانگین دقت' },
  { key: 'tokensUsed', label: 'توکن مصرفی' },
  { key: 'failed', label: 'ناموفق' },
] as const;

export function OcrHubClient({ business, businessId, initialJobs }: OcrHubClientProps) {
  const [jobs, setJobs] = useState<OcrSimulationJob[]>(initialJobs);
  const processingCount = useMemo(() => jobs.filter((job) => job.status === 'processing').length, [jobs]);
  const stats = useMemo(() => buildOcrStats(jobs), [jobs]);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    if (processingCount === 0) return undefined;

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/businesses/${businessId}/ai-tools/ocr`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json().catch(() => null)) as { jobs?: OcrSimulationJob[] } | null;
      if (payload?.jobs) setJobs(payload.jobs);
    }, 900);

    return () => window.clearInterval(timer);
  }, [businessId, processingCount]);

  const statValues: Record<(typeof STAT_ITEMS)[number]['key'], string | number> = {
    total: stats.total,
    completed: stats.completed,
    processing: stats.processing,
    avgConfidence: formatConfidence(stats.avgConfidence),
    tokensUsed: formatTokenCount(stats.tokensUsed),
    failed: stats.failed,
  };

  return (
    <OcrPageShell
      eyebrow="ابزار نویسه‌خوانی"
      title="شبیه‌سازی استخراج سند"
      description={`${business.name} · گزارش و تاریخچه کارهای این فضای کاری`}
      actions={
        <Link href={`/businesses/${businessId}/ai-tools/ocr/new`}>
          <TaavButton tone="brand" iconStart={<Plus className="h-4 w-4" />}>
            تست جدید
          </TaavButton>
        </Link>
      }
    >
      <OcrSectionCard title="گزارش کلی">
        <div className="ocr-flow-stat-grid">
          {STAT_ITEMS.map((item) => (
            <article key={item.key} className="ocr-flow-stat-card">
              <span className="ocr-flow-stat-label">{item.label}</span>
              <strong className="ocr-flow-stat-value">
                {typeof statValues[item.key] === 'number'
                  ? new Intl.NumberFormat('fa-IR').format(statValues[item.key] as number)
                  : statValues[item.key]}
              </strong>
            </article>
          ))}
        </div>
      </OcrSectionCard>

      <OcrSectionCard title="تاریخچه اجراها" description="برای جزئیات روی هر ردیف کلیک کنید">
        {jobs.length ? (
          <div className="ocr-flow-history-table">
            <div className="ocr-flow-history-table-head" aria-hidden>
              <span>عنوان</span>
              <span>شاخص‌ها</span>
              <span>وضعیت</span>
            </div>
            <div className="ocr-flow-history-list">
              {jobs.map((job) => {
                const meta = getStatusMeta(job.status);
                const JobIcon = meta.icon;

                return (
                  <Link
                    key={job.id}
                    href={`/businesses/${businessId}/ai-tools/ocr/${job.id}`}
                    className="ocr-flow-history-row"
                  >
                    <div className="ocr-flow-history-row-main">
                      <strong>{job.sourceLabel}</strong>
                      <span>
                        {job.sourceType === 'sample' ? 'نمونه' : 'آپلود'}
                        {job.templateLabel ? ` · ${job.templateLabel}` : ''}
                        {' · '}
                        {formatActivityLabel(job.updatedAt)}
                      </span>
                    </div>
                    <div className="ocr-flow-history-row-stats">
                      <span>{formatConfidence(job.confidence)}</span>
                      <span>{formatTokenCount(job.tokensUsed)} توکن</span>
                      <span>{formatRelativeActivityLabel(job.createdAt)}</span>
                    </div>
                    <div className="ocr-flow-history-row-badge">
                      <TaavBadge
                        tone={meta.tone}
                        variant="soft"
                        iconStart={
                          <JobIcon className={meta.tone === 'brand' ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
                        }
                      >
                        {meta.label}
                      </TaavBadge>
                    </div>
                    <ChevronLeft className="ocr-flow-history-row-chevron" aria-hidden />
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <TaavEmptyState
            icon={<FileText className="h-6 w-6" />}
            title="هنوز کاری ثبت نشده"
            description="اولین تست را ثبت کنید تا تاریخچه و خروجی ساختارمند اینجا نمایش داده شود."
            primaryAction={
              <Link href={`/businesses/${businessId}/ai-tools/ocr/new`}>
                <TaavButton iconStart={<Plus className="h-4 w-4" />}>شروع اولین تست</TaavButton>
              </Link>
            }
          />
        )}
      </OcrSectionCard>
    </OcrPageShell>
  );
}
