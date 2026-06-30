'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, TriangleAlert } from 'lucide-react';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';
import { TaavTextarea } from '@repo/ui/taav/forms';
import type { OcrSimulationJob } from '@/app/lib/data';
import { formatTokenCount } from '@/app/lib/business-utils';
import { formatConfidence, getJobProgress, getStatusMeta } from '@/components/ocr/utils';

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

  return (
    <section className="ocr-job-detail-page">
      <header className="ocr-job-detail-header">
        <div className="ocr-job-detail-heading">
          <h1 className="ocr-job-detail-title">{job.sourceLabel}</h1>
          <p className="ocr-job-detail-subtitle">{job.summary}</p>
        </div>
        <Link href={`/businesses/${businessId}/ai-tools/ocr`}>
          <TaavButton variant="secondary" tone="neutral" iconStart={<ArrowLeft className="h-4 w-4" />}>
            بازگشت به تاریخچه
          </TaavButton>
        </Link>
      </header>

      <div className="ocr-job-detail-card">
        <div className="flex flex-wrap items-center gap-2">
          <TaavBadge tone="neutral" variant="soft">
            {job.sourceType === 'sample' ? 'نمونه' : 'آپلود'}
          </TaavBadge>
          {job.templateLabel ? (
            <TaavBadge tone="brand" variant="soft">
              {job.templateLabel}
            </TaavBadge>
          ) : null}
          {job.scenario ? (
            <TaavBadge tone={job.scenario === 'miss' ? 'danger' : 'success'} variant="soft">
              {job.scenario === 'miss' ? 'تشخیص ندهد' : 'تشخیص بدهد'}
            </TaavBadge>
          ) : null}
          {job.resultJson?.overall_status ? (
            <TaavBadge tone={overallStatus === 'failed' ? 'danger' : overallStatus === 'completed_with_review_required' ? 'warning' : 'success'} variant="soft">
              {overallStatus}
            </TaavBadge>
          ) : null}
          <TaavBadge tone={statusMeta.tone} variant="soft" iconStart={<StatusIcon className={statusMeta.tone === 'brand' ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />}>
            {statusMeta.label}
          </TaavBadge>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/8 bg-black/12 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-[var(--taav-text-subtle)]">پیشرفت</span>
            <span className="text-xs font-semibold text-white">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/8">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-black/12 p-3">
            <div className="text-[10px] text-[var(--taav-text-subtle)]">اعتماد</div>
            <div className="mt-1 text-sm font-black text-white">{formatConfidence(job.confidence)}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/12 p-3">
            <div className="text-[10px] text-[var(--taav-text-subtle)]">صفحه</div>
            <div className="mt-1 text-sm font-black text-white">{new Intl.NumberFormat('fa-IR').format(job.pageCount)}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/12 p-3">
            <div className="text-[10px] text-[var(--taav-text-subtle)]">توکن</div>
            <div className="mt-1 text-sm font-black text-white">{formatTokenCount(job.tokensUsed)}</div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--taav-text-subtle)]">پیش‌نمایش متن استخراج‌شده</span>
            <TaavTextarea readOnly value={job.previewText} rows={6} inputClassName="text-sm leading-7" />
          </div>
          <div className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--taav-text-subtle)]">JSON خروجی</span>
            <TaavTextarea readOnly value={jsonPreview} rows={6} inputClassName="font-mono text-[11px] leading-6" />
          </div>
        </div>

        <div className="grid gap-3">
          <span className="text-xs font-semibold text-[var(--taav-text-subtle)]">فیلدهای استخراج‌شده</span>
          <div className="grid gap-2">
            {outputFields.map((field) => (
              <div key={field.key} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/12 px-3 py-2">
                {(() => {
                  const fieldLabel = 'label' in field ? field.label : field.key;
                  const fieldConfidence = 'confidence' in field ? field.confidence : null;
                  const normalizedValue = 'normalized_value' in field ? field.normalized_value : null;

                  return (
                    <>
                      <div className="grid gap-0.5">
                        <span className="text-xs text-[var(--taav-text-subtle)]">{fieldLabel}</span>
                        {normalizedValue !== null ? <span className="text-[10px] text-slate-500">normalized: {normalizedValue || '—'}</span> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {fieldConfidence !== null ? <span className="text-[10px] text-slate-500">{Math.round(fieldConfidence * 100)}%</span> : null}
                        <strong className="text-sm text-white">{field.value}</strong>
                      </div>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>

        {job.warnings.length ? (
          <div className="grid gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-50">
            <div className="flex items-center gap-2 font-bold">
              <TriangleAlert className="h-4 w-4" />
              نکات شبیه‌سازی
            </div>
            <ul className="m-0 grid gap-1 pr-5">
              {job.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {job.status === 'queued' || job.status === 'processing' ? (
          <div className="ocr-history-empty">
            <FileText className="h-8 w-8" aria-hidden />
            <strong>در حال پردازش سند</strong>
            <p>خروجی کامل پس از اتمام job نمایش داده می‌شود.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
