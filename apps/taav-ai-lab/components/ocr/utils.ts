import { CheckCircle2, Clock3, Loader2, TriangleAlert } from 'lucide-react';
import type { OcrSimulationJob } from '@/app/lib/data';
import type { OcrFieldReviewStatus, OcrFieldValidationStatus, OcrOverallStatus } from '@/app/lib/ocr-simulator-data';

const OVERALL_STATUS_LABELS: Record<OcrOverallStatus, string> = {
  completed: 'تکمیل شده',
  completed_with_review_required: 'تکمیل · نیاز به بازبینی',
  failed: 'ناموفق',
  needs_review: 'نیاز به بازبینی',
};

const VALIDATION_STATUS_LABELS: Record<OcrFieldValidationStatus, string> = {
  valid: 'معتبر',
  invalid: 'نامعتبر',
  missing: 'خالی',
  not_applicable: 'غیرمرتبط',
};

const REVIEW_STATUS_LABELS: Record<OcrFieldReviewStatus, string> = {
  accepted: 'پذیرفته',
  needs_review: 'نیاز به بازبینی',
  rejected: 'رد شده',
};

export function formatOverallStatus(status: string) {
  return OVERALL_STATUS_LABELS[status as OcrOverallStatus] ?? status.replaceAll('_', ' · ');
}

export function formatValidationStatus(status: OcrFieldValidationStatus) {
  return VALIDATION_STATUS_LABELS[status];
}

export function formatReviewStatus(status: OcrFieldReviewStatus) {
  return REVIEW_STATUS_LABELS[status];
}

export function getStatusMeta(status: OcrSimulationJob['status']) {
  switch (status) {
    case 'completed':
      return { tone: 'success' as const, label: 'تکمیل شده', icon: CheckCircle2 };
    case 'failed':
      return { tone: 'danger' as const, label: 'ناموفق', icon: TriangleAlert };
    case 'processing':
      return { tone: 'brand' as const, label: 'در حال پردازش', icon: Loader2 };
    default:
      return { tone: 'neutral' as const, label: 'در صف', icon: Clock3 };
  }
}

export function toReadableFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return 'نامشخص';
  if (size < 1024) return `${new Intl.NumberFormat('fa-IR').format(size)} بایت`;
  if (size < 1024 * 1024) {
    return `${new Intl.NumberFormat('fa-IR').format(Math.round(size / 1024))} کیلوبایت`;
  }
  return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(size / (1024 * 1024))} مگابایت`;
}

export function getJobProgress(job: OcrSimulationJob, clockTick: number) {
  if (job.status !== 'processing') return job.progress;

  const startedAt = new Date(job.startedAt).getTime();
  const readyAt = new Date(job.readyAt).getTime();
  const span = Math.max(1, readyAt - startedAt);
  const elapsed = Date.now() - startedAt + clockTick * 16;
  const ratio = Math.max(0, Math.min(1, elapsed / span));
  return Math.max(job.progress, Math.min(97, Math.round(14 + ratio * 80)));
}

export function formatConfidence(confidence: number) {
  return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(confidence)}%`;
}

export function buildOcrStats(jobs: OcrSimulationJob[]) {
  const total = jobs.length;
  const completed = jobs.filter((job) => job.status === 'completed').length;
  const processing = jobs.filter((job) => job.status === 'processing').length;
  const failed = jobs.filter((job) => job.status === 'failed').length;
  const avgConfidence =
    total === 0 ? 0 : Math.round(jobs.reduce((sum, job) => sum + job.confidence, 0) / total);
  const tokensUsed = jobs.reduce((sum, job) => sum + job.tokensUsed, 0);

  return { total, completed, processing, failed, avgConfidence, tokensUsed };
}
