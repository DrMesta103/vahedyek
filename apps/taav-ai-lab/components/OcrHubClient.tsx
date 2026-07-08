'use client';

import './ocr/ocr-dashboard.css';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Database,
  FileText,
  Filter,
  Loader2,
  MoreVertical,
  Plus,
  ScanText,
  Search,
  Settings,
  Target,
  Wallet,
} from 'lucide-react';
import type { OcrSimulationJob, Tenant } from '@/app/lib/data';
import { formatCostUsd } from '@/app/lib/ai-usage-cost';
import { formatActivityLabel, formatRelativeActivityLabel, formatTokenCount } from '@/app/lib/business-utils';
import { formatToman } from '@/app/lib/global-settings-mock';
import type { AiProviderAccountPublic } from '@/app/lib/types/ai-accounts';
import {
  buildOcrStats,
  formatConfidence,
  getOcrAiUsageCost,
  getOcrTransportMode,
  getStatusMeta,
  type OcrAiUsageCost,
} from '@/components/ocr/utils';

type OcrHubClientProps = {
  business: Tenant;
  businessId: string;
  initialJobs: OcrSimulationJob[];
  jobCosts: Record<string, OcrAiUsageCost>;
  usdToToman: number;
  aiAccounts: AiProviderAccountPublic[];
};

type StatusFilter = 'all' | 'completed' | 'processing' | 'failed';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'همه' },
  { key: 'completed', label: 'تکمیل شده' },
  { key: 'processing', label: 'در حال پردازش' },
  { key: 'failed', label: 'ناموفق' },
];

const KPI_ITEMS = [
  { key: 'total', label: 'کل اجراها', icon: FileText, tone: 'cyan' },
  { key: 'completed', label: 'تکمیل شده', icon: CheckCircle2, tone: 'green' },
  { key: 'processing', label: 'در حال پردازش', icon: Loader2, tone: 'blue' },
  { key: 'tokensUsed', label: 'توکن مصرفی', icon: Database, tone: 'cyan' },
  { key: 'totalCost', label: 'هزینه مصرفی کل', icon: Wallet, tone: 'amber' },
  { key: 'avgConfidence', label: 'میانگین دقت', icon: Target, tone: 'teal' },
] as const;

function matchesStatusFilter(job: OcrSimulationJob, filter: StatusFilter) {
  if (filter === 'all') return true;
  if (filter === 'completed') return job.status === 'completed';
  if (filter === 'processing') return job.status === 'processing' || job.status === 'queued';
  if (filter === 'failed') return job.status === 'failed';
  return true;
}

function getJobDurationMs(job: OcrSimulationJob) {
  const started = new Date(job.startedAt).getTime();
  if (!Number.isFinite(started)) return null;
  const endedRaw = job.completedAt ?? job.readyAt ?? job.updatedAt;
  const ended = new Date(endedRaw).getTime();
  if (!Number.isFinite(ended)) return null;
  return Math.max(0, ended - started);
}

function formatJobDuration(durationMs: number) {
  if (!Number.isFinite(durationMs) || durationMs < 0) return '—';
  if (durationMs < 1000) {
    return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(durationMs)} ms`;
  }

  const seconds = durationMs / 1000;
  if (seconds < 60) {
    return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(seconds)} ثانیه`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  const minutesLabel = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(minutes);
  const secondsLabel = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(Math.round(remainder));
  return `${minutesLabel}:${secondsLabel.padStart(2, '0')}`;
}

function ConfidenceRing({ value }: { value: number }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="ai-lab-ocr-dashboard-confidence" aria-hidden="true">
      <svg viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={radius} className="ai-lab-ocr-dashboard-confidence-track" />
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="ai-lab-ocr-dashboard-confidence-fill"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 18 18)"
        />
      </svg>
      <span>{formatConfidence(value)}</span>
    </div>
  );
}

export function OcrHubClient({
  business,
  businessId,
  initialJobs,
  jobCosts,
  usdToToman,
  aiAccounts,
}: OcrHubClientProps) {
  const [jobs, setJobs] = useState<OcrSimulationJob[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const processingCount = useMemo(() => jobs.filter((job) => job.status === 'processing').length, [jobs]);
  const stats = useMemo(() => buildOcrStats(jobs), [jobs]);
  const totalUsageCost = useMemo(
    () =>
      jobs.reduce(
        (acc, job) => {
          const cost = jobCosts[job.id] ?? getOcrAiUsageCost(job, usdToToman, aiAccounts);
          acc.usd += cost.totalCostUsd;
          acc.toman += cost.totalCostToman;
          return acc;
        },
        { usd: 0, toman: 0 },
      ),
    [jobs, jobCosts, usdToToman, aiAccounts],
  );

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

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return [...jobs]
      .filter((job) => {
        if (!matchesStatusFilter(job, statusFilter)) return false;
        if (!normalizedSearch) return true;

        const haystack = [job.sourceLabel, job.templateLabel, job.sourceType, job.summary]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }, [jobs, searchQuery, statusFilter]);

  const kpiValues: Record<Exclude<(typeof KPI_ITEMS)[number]['key'], 'totalCost'>, string | number> = {
    total: stats.total,
    completed: stats.completed,
    processing: stats.processing,
    tokensUsed: formatTokenCount(stats.tokensUsed),
    avgConfidence: stats.total > 0 ? formatConfidence(stats.avgConfidence) : '—',
  };

  return (
    <div className="ai-lab-ocr-dashboard-page" dir="rtl" lang="fa">
      <section className="ai-lab-ocr-dashboard-hero">
        <div className="ai-lab-ocr-dashboard-hero-visual" aria-hidden="true">
          <div className="ai-lab-ocr-dashboard-hero-glow" />
          <div className="ai-lab-ocr-dashboard-doc-illustration">
            <span className="ai-lab-ocr-dashboard-doc-bracket ai-lab-ocr-dashboard-doc-bracket--tl" />
            <span className="ai-lab-ocr-dashboard-doc-bracket ai-lab-ocr-dashboard-doc-bracket--tr" />
            <span className="ai-lab-ocr-dashboard-doc-bracket ai-lab-ocr-dashboard-doc-bracket--bl" />
            <span className="ai-lab-ocr-dashboard-doc-bracket ai-lab-ocr-dashboard-doc-bracket--br" />
            <div className="ai-lab-ocr-dashboard-doc-card">
              <ScanText className="h-8 w-8" strokeWidth={1.5} />
              <span>OCR</span>
            </div>
          </div>
        </div>

        <div className="ai-lab-ocr-dashboard-hero-copy">
          <div className="ai-lab-ocr-dashboard-hero-top">
            <div>
              <span className="ai-lab-ocr-dashboard-active-badge">
                <span className="ai-lab-ocr-dashboard-active-dot" aria-hidden="true" />
                ابزار فعال
              </span>
              <h1>شبیه‌سازی استخراج سند</h1>
              <p>
                گزارش، تاریخچه اجراها و مدیریت پردازش اسناد در فضای کاری {business.name}
              </p>
            </div>

            <div className="ai-lab-ocr-dashboard-hero-actions">
              <Link href={`/businesses/${businessId}/ai-tools/ocr/new`} className="ai-lab-ocr-dashboard-btn-primary">
                <Plus className="h-4 w-4" />
                تست جدید
              </Link>
              <button type="button" className="ai-lab-ocr-dashboard-btn-ghost" disabled title="به‌زودی">
                <Settings className="h-4 w-4" />
                ورود به تنظیمات OCR
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-lab-ocr-dashboard-kpis" aria-label="شاخص‌های OCR">
        {KPI_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.key} className={`ai-lab-ocr-dashboard-kpi ai-lab-ocr-dashboard-kpi--${item.tone}`}>
              <div className="ai-lab-ocr-dashboard-kpi-head">
                <span>{item.label}</span>
                <span className="ai-lab-ocr-dashboard-kpi-icon">
                  <Icon className={`h-4 w-4 ${item.key === 'processing' && stats.processing > 0 ? 'animate-spin' : ''}`} />
                </span>
              </div>
              <strong>
                {item.key === 'totalCost' ? (
                  <span className="ai-lab-ocr-dashboard-kpi-cost">
                    <span>{formatToman(totalUsageCost.toman)} تومان</span>
                    <small dir="ltr">{formatCostUsd(totalUsageCost.usd)}</small>
                  </span>
                ) : item.key in kpiValues ? (
                  typeof kpiValues[item.key as keyof typeof kpiValues] === 'number' ? (
                    new Intl.NumberFormat('fa-IR').format(kpiValues[item.key as keyof typeof kpiValues] as number)
                  ) : (
                    kpiValues[item.key as keyof typeof kpiValues]
                  )
                ) : (
                  '—'
                )}
              </strong>
              <span className="ai-lab-ocr-dashboard-kpi-wave" aria-hidden="true" />
            </article>
          );
        })}
      </section>

      <section className="ai-lab-ocr-dashboard-toolbar">
        <label className="ai-lab-ocr-dashboard-search">
          <Search className="h-4 w-4" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="جستجو در اسناد و اجراها"
            aria-label="جستجو در اسناد و اجراها"
          />
        </label>

        <div className="ai-lab-ocr-dashboard-status-filters" role="tablist" aria-label="فیلتر وضعیت">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={statusFilter === filter.key}
              className={statusFilter === filter.key ? 'is-active' : ''}
              onClick={() => setStatusFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="ai-lab-ocr-dashboard-toolbar-meta">
          <span className="ai-lab-ocr-dashboard-chip">
            <CalendarDays className="h-3.5 w-3.5" />
            بازه زمانی: همه
          </span>
          <span className="ai-lab-ocr-dashboard-chip">جدیدترین</span>
          <button type="button" className="ai-lab-ocr-dashboard-filter-btn" aria-label="فیلترهای بیشتر" disabled>
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </section>

      <div className="ai-lab-ocr-dashboard-main">
        <section className="ai-lab-ocr-dashboard-history">
          <header className="ai-lab-ocr-dashboard-history-head">
            <div>
              <h2>تاریخچه اجراها</h2>
              <p>برای مشاهده جزئیات هر پردازش روی ردیف کلیک کنید.</p>
            </div>
          </header>

          {jobs.length === 0 ? (
            <div className="ai-lab-ocr-dashboard-empty">
              <FileText className="h-8 w-8" aria-hidden="true" />
              <h3>هنوز تستی برای OCR ثبت نشده است.</h3>
              <p>برای شروع، یک تست جدید ایجاد کنید.</p>
              <Link href={`/businesses/${businessId}/ai-tools/ocr/new`} className="ai-lab-ocr-dashboard-btn-primary">
                <Plus className="h-4 w-4" />
                تست جدید
              </Link>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="ai-lab-ocr-dashboard-empty ai-lab-ocr-dashboard-empty--filtered">
              <Search className="h-8 w-8" aria-hidden="true" />
              <h3>موردی با فیلترهای فعلی یافت نشد.</h3>
              <p>عبارت جستجو یا وضعیت انتخاب‌شده را تغییر دهید.</p>
            </div>
          ) : (
            <>
              <div className="ai-lab-ocr-dashboard-history-list">
                {filteredJobs.map((job) => {
                  const meta = getStatusMeta(job.status);
                  const StatusIcon = meta.icon;
                  const durationMs = getJobDurationMs(job);

                  return (
                    <Link
                      key={job.id}
                      href={`/businesses/${businessId}/ai-tools/ocr/${job.id}?transport=${getOcrTransportMode(job)}`}
                      className="ai-lab-ocr-dashboard-history-row"
                    >
                      <button
                        type="button"
                        className="ai-lab-ocr-dashboard-row-menu"
                        aria-label="گزینه‌های بیشتر"
                        onClick={(event) => event.preventDefault()}
                        tabIndex={-1}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      <span
                        className={`ai-lab-ocr-dashboard-row-badge ai-lab-ocr-dashboard-row-badge--${meta.tone}`}
                      >
                        <StatusIcon className={`h-3.5 w-3.5 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                        {meta.label}
                      </span>

                      <div className="ai-lab-ocr-dashboard-row-thumb">
                        <FileText className="h-5 w-5" strokeWidth={1.6} />
                      </div>

                      <div className="ai-lab-ocr-dashboard-row-copy">
                        <strong>{job.sourceLabel}</strong>
                        <span>
                          {job.templateLabel ?? (job.sourceType === 'sample' ? 'نمونه' : 'آپلود')}
                          {' · '}
                          {formatActivityLabel(job.createdAt)}
                        </span>
                      </div>

                      <div className="ai-lab-ocr-dashboard-row-metric ai-lab-ocr-dashboard-row-metric--updated">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatRelativeActivityLabel(job.updatedAt)}
                      </div>

                      <div
                        className="ai-lab-ocr-dashboard-row-metric ai-lab-ocr-dashboard-row-metric--duration"
                        aria-label="مدت زمان پردازش"
                      >
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {durationMs !== null ? formatJobDuration(durationMs) : '—'}
                      </div>

                      <div className="ai-lab-ocr-dashboard-row-metric ai-lab-ocr-dashboard-row-metric--tokens">
                        <Database className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="ai-lab-ocr-dashboard-row-tokens">
                          <span>{formatTokenCount(job.tokensUsed)}</span>
                          {jobCosts[job.id]?.totalCostToman ? (
                            <small>{formatToman(jobCosts[job.id].totalCostToman)} ت</small>
                          ) : null}
                        </span>
                      </div>

                      <ConfidenceRing value={job.confidence} />

                      <ChevronLeft className="ai-lab-ocr-dashboard-row-chevron" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>

              <footer className="ai-lab-ocr-dashboard-history-foot">
                نمایش {new Intl.NumberFormat('fa-IR').format(filteredJobs.length)} مورد از{' '}
                {new Intl.NumberFormat('fa-IR').format(jobs.length)} مورد
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
