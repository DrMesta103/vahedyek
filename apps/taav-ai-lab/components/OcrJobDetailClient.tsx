'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, TriangleAlert } from 'lucide-react';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';
import { TaavTextarea } from '@repo/ui/taav/forms';
import { TaavProgressSummary } from '@repo/ui/taav/layout';
import type { OcrSimulationJob } from '@/app/lib/data';
import { formatTokenCount } from '@/app/lib/business-utils';
import { OcrPageBadge, OcrPageShell } from '@/components/ocr/OcrPageShell';
import { OcrSectionCard } from '@/components/ocr/OcrSectionCard';
import {
  formatConfidence,
  formatOverallStatus,
  formatReviewStatus,
  formatValidationStatus,
  getJobProgress,
  getStatusMeta,
} from '@/components/ocr/utils';

type OcrJobDetailClientProps = {
  businessId: string;
  initialJob: OcrSimulationJob;
};

export function OcrJobDetailClient({ businessId, initialJob }: OcrJobDetailClientProps) {
  const [job, setJob] = useState(initialJob);
  const [clockTick, setClockTick] = useState(0);

  useEffect(() => {
    setJob(initialJob);
  }, [initialJob]);

  useEffect(() => {
    if (job.status !== 'processing' && job.status !== 'queued') return undefined;

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/businesses/${businessId}/ai-tools/ocr`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json().catch(() => null)) as { jobs?: OcrSimulationJob[] } | null;
      const nextJob = payload?.jobs?.find((item) => item.id === job.id);
      if (nextJob) setJob(nextJob);
    }, 900);

    return () => window.clearInterval(timer);
  }, [businessId, job.id, job.status]);

  useEffect(() => {
    if (job.status !== 'processing') return undefined;
    const timer = window.setInterval(() => setClockTick((value) => value + 1), 240);
    return () => window.clearInterval(timer);
  }, [job.status]);

  const progress = getJobProgress(job, clockTick);
  const statusMeta = getStatusMeta(job.status);
  const StatusIcon = statusMeta.icon;
  const jsonPreview = JSON.stringify(job.resultJson ?? job.extractedJson, null, 2);
  const outputFields = job.resultJson?.fields ?? job.extractedFields;
  const overallStatus = job.resultJson?.overall_status ?? (job.status === 'failed' ? 'failed' : 'processing');
  const isProcessing = job.status === 'queued' || job.status === 'processing';

  const metaBadges: Array<{ key: string; label: string; tone: 'neutral' | 'brand' | 'danger' | 'success' | 'warning' }> = [
    { key: 'source', label: job.sourceType === 'sample' ? 'نمونه' : 'آپلود', tone: 'neutral' },
    ...(job.templateLabel ? [{ key: 'template', label: job.templateLabel, tone: 'brand' as const }] : []),
    ...(job.scenario
      ? [
          {
            key: 'scenario',
            label: job.scenario === 'miss' ? 'تشخیص ندهد' : 'تشخیص بدهد',
            tone: job.scenario === 'miss' ? ('danger' as const) : ('success' as const),
          },
        ]
      : []),
    ...(job.resultJson?.overall_status
      ? [
          {
            key: 'overall',
            label: formatOverallStatus(overallStatus),
            tone:
              overallStatus === 'failed'
                ? ('danger' as const)
                : overallStatus === 'completed_with_review_required'
                  ? ('warning' as const)
                  : ('success' as const),
          },
        ]
      : []),
  ];

  return (
    <OcrPageShell
      eyebrow="جزئیات کار"
      title={job.sourceLabel}
      description={job.summary}
      badge={
        <OcrPageBadge
          label={statusMeta.label}
          icon={<StatusIcon className={statusMeta.tone === 'brand' ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />}
        />
      }
      actions={
        <Link href={`/businesses/${businessId}/ai-tools/ocr`}>
          <TaavButton variant="secondary" tone="neutral" iconStart={<ArrowLeft className="h-4 w-4" />}>
            بازگشت
          </TaavButton>
        </Link>
      }
    >
      <div className="ocr-flow-tag-row">
        {metaBadges.map((item) => (
          <TaavBadge key={item.key} tone={item.tone} variant="soft">
            {item.label}
          </TaavBadge>
        ))}
      </div>

      <OcrSectionCard title="وضعیت پردازش">
        <TaavProgressSummary
          variant="bar"
          percent={progress}
          description={isProcessing ? 'در حال شبیه‌سازی پردازش سند…' : 'پردازش تکمیل شد'}
          tone={isProcessing ? 'brand' : statusMeta.tone === 'danger' ? 'danger' : 'success'}
          showPercent
        />

        <div className="ocr-flow-metric-grid">
          <div className="ocr-flow-metric-card">
            <span className="ocr-flow-stat-label">سطح اطمینان</span>
            <strong>{formatConfidence(job.confidence)}</strong>
          </div>
          <div className="ocr-flow-metric-card">
            <span className="ocr-flow-stat-label">صفحات</span>
            <strong>{new Intl.NumberFormat('fa-IR').format(job.pageCount)}</strong>
          </div>
          <div className="ocr-flow-metric-card">
            <span className="ocr-flow-stat-label">توکن مصرفی</span>
            <strong>{formatTokenCount(job.tokensUsed)}</strong>
          </div>
        </div>
      </OcrSectionCard>

      {!isProcessing ? (
        <>
          <OcrSectionCard title="پیش‌نمایش متن">
            <TaavTextarea readOnly value={job.previewText} rows={6} inputClassName="text-sm leading-7" />
          </OcrSectionCard>

          <OcrSectionCard title="فیلدهای استخراج‌شده">
            <div className="ocr-flow-field-list">
              {outputFields.map((field) => {
                const fieldLabel = 'label' in field ? field.label : field.key;
                const fieldConfidence = 'confidence' in field ? field.confidence : null;
                const normalizedValue = 'normalized_value' in field ? field.normalized_value : null;
                const validationStatus = 'validation_status' in field ? field.validation_status : null;
                const reviewStatus = 'review_status' in field ? field.review_status : null;

                return (
                  <div key={field.key} className="ocr-flow-field-row">
                    <div className="ocr-flow-field-label">
                      <span>{fieldLabel}</span>
                      {normalizedValue !== null ? (
                        <span className="ocr-flow-field-normalized">نرمال: {normalizedValue || '—'}</span>
                      ) : null}
                      {validationStatus ? (
                        <span className="ocr-flow-field-status">{formatValidationStatus(validationStatus)}</span>
                      ) : null}
                      {reviewStatus ? (
                        <span className="ocr-flow-field-status">{formatReviewStatus(reviewStatus)}</span>
                      ) : null}
                    </div>
                    <div className="ocr-flow-field-value">
                      {fieldConfidence !== null ? (
                        <span className="ocr-flow-field-confidence">
                          {new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(fieldConfidence * 100)}٪
                        </span>
                      ) : null}
                      <strong>{field.value}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </OcrSectionCard>

          <OcrSectionCard title="خروجی ساختاریافته">
            <TaavTextarea readOnly value={jsonPreview} rows={8} inputClassName="font-mono text-[11px] leading-6" dir="ltr" />
          </OcrSectionCard>
        </>
      ) : (
        <div className="ocr-flow-processing-placeholder">
          <FileText className="h-8 w-8" aria-hidden />
          <strong>در حال پردازش سند</strong>
          <p>خروجی کامل پس از اتمام کار نمایش داده می‌شود.</p>
        </div>
      )}

      {job.warnings.length ? (
        <div className="ocr-flow-warning-panel">
          <div className="ocr-flow-warning-title">
            <TriangleAlert className="h-4 w-4" />
            نکات شبیه‌سازی
          </div>
          <ul>
            {job.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </OcrPageShell>
  );
}
