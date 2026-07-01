'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FileText, PieChart, Plus, ScanSearch } from 'lucide-react';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';
import type { OcrSimulationJob, Tenant } from '@/app/lib/data';
import { formatActivityLabel, formatRelativeActivityLabel, formatTokenCount } from '@/app/lib/business-utils';
import { buildOcrStats, formatConfidence, getStatusMeta } from '@/components/ocr/utils';

type OcrHubClientProps = {
  business: Tenant;
  businessId: string;
  initialJobs: OcrSimulationJob[];
};

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

  return (
    <section className="ocr-hub-page">
      <header className="ocr-hub-page-header">
        <div className="ocr-hub-page-heading">
          <TaavBadge tone="brand" variant="soft" iconStart={<ScanSearch className="h-3.5 w-3.5" />}>
            OCR / Document AI
          </TaavBadge>
          <h1 className="ocr-hub-page-title">شبیه‌سازی OCR سند</h1>
          <p className="ocr-hub-page-subtitle">
            {business.name} · گزارش اجراها و تاریخچه jobهای همین tenant
          </p>
        </div>
      </header>

      <div className="ocr-hub-section-bar">
        <PieChart className="h-4 w-4" aria-hidden />
        <span>گزارشات</span>
      </div>

      <div className="ocr-reports-grid">
        <article className="ocr-report-card">
          <span className="ocr-report-label">کل اجراها</span>
          <strong className="ocr-report-value">{new Intl.NumberFormat('fa-IR').format(stats.total)}</strong>
        </article>
        <article className="ocr-report-card">
          <span className="ocr-report-label">تکمیل شده</span>
          <strong className="ocr-report-value">{new Intl.NumberFormat('fa-IR').format(stats.completed)}</strong>
        </article>
        <article className="ocr-report-card">
          <span className="ocr-report-label">در حال پردازش</span>
          <strong className="ocr-report-value">{new Intl.NumberFormat('fa-IR').format(stats.processing)}</strong>
        </article>
        <article className="ocr-report-card">
          <span className="ocr-report-label">میانگین دقت</span>
          <strong className="ocr-report-value">{formatConfidence(stats.avgConfidence)}</strong>
        </article>
        <article className="ocr-report-card">
          <span className="ocr-report-label">توکن مصرفی</span>
          <strong className="ocr-report-value">{formatTokenCount(stats.tokensUsed)}</strong>
        </article>
        <article className="ocr-report-card">
          <span className="ocr-report-label">ناموفق</span>
          <strong className="ocr-report-value">{new Intl.NumberFormat('fa-IR').format(stats.failed)}</strong>
        </article>
      </div>

      <div className="ocr-hub-section-bar ocr-hub-section-bar--history">
        <div className="ocr-hub-section-bar-title">
          <FileText className="h-4 w-4" aria-hidden />
          <span>تاریخچه</span>
        </div>
        <Link href={`/businesses/${businessId}/ai-tools/ocr/new`} className="ocr-hub-add-link">
          <TaavButton size="sm" tone="brand" iconStart={<Plus className="h-4 w-4" />}>
            تست جدید
          </TaavButton>
        </Link>
      </div>

      {jobs.length ? (
        <div className="ocr-history-list">
          {jobs.map((job) => {
            const meta = getStatusMeta(job.status);
            const JobIcon = meta.icon;

            return (
              <Link
                key={job.id}
                href={`/businesses/${businessId}/ai-tools/ocr/${job.id}`}
                className="ocr-history-item"
              >
                <div className="ocr-history-item-main">
                  <strong className="ocr-history-item-title">{job.sourceLabel}</strong>
                  <span className="ocr-history-item-meta">
                    {job.sourceType === 'sample' ? 'نمونه' : 'آپلود'} · {formatActivityLabel(job.updatedAt)}
                  </span>
                </div>
                <div className="ocr-history-item-side">
                  <TaavBadge tone={meta.tone} variant="soft" iconStart={<JobIcon className={meta.tone === 'brand' ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />}>
                    {meta.label}
                  </TaavBadge>
                  <span className="ocr-history-item-stats">
                    {formatConfidence(job.confidence)} · {formatTokenCount(job.tokensUsed)} توکن · {formatRelativeActivityLabel(job.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="ocr-history-empty">
          <FileText className="h-8 w-8" aria-hidden />
          <strong>هنوز jobی ثبت نشده است</strong>
          <p>با دکمه + یک سند جدید برای OCR ثبت کنید.</p>
        </div>
      )}
    </section>
  );
}
