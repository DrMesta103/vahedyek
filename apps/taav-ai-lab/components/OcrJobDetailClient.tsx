'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Loader2, Radio } from 'lucide-react';
import type { OcrSimulationJob } from '@/app/lib/data';
import type { OcrTransportMode } from '@/app/lib/ocr-transport';
import { getOcrBatchRevealDelayMs, isBatchOcrTransportMode, isGrpcStreamingMode } from '@/app/lib/ocr-transport';
import {
  formatConfidence,
  getOcrFormFields,
  getOcrTransportLabel,
  getOcrTransportMode,
  normalizeOcrTransportMode,
  type OcrAiUsageCost,
} from '@/components/ocr/utils';
import { OcrPipelineUsageSection } from '@/components/ocr/OcrPipelineUsageSection';
import './ocr/ocr-result.css';

type OcrJobDetailClientProps = {
  businessId: string;
  initialJob: OcrSimulationJob;
  usageCost: OcrAiUsageCost;
  usdToToman: number;
};

const GRPC_DONE_KEY = (jobId: string) => `ocr-grpc-done:${jobId}`;
const TRANSPORT_KEY = (jobId: string) => `ocr-transport:${jobId}`;

function buildInitialValues(job: OcrSimulationJob) {
  return Object.fromEntries(getOcrFormFields(job).map((field) => [field.key, field.targetValue]));
}

function resolveTransport(job: OcrSimulationJob, searchParams: URLSearchParams | null): OcrTransportMode {
  const fromQuery = searchParams?.get('transport');
  if (fromQuery) return normalizeOcrTransportMode(fromQuery);
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(TRANSPORT_KEY(job.id));
    if (stored) return normalizeOcrTransportMode(stored);
  }
  return getOcrTransportMode(job);
}

function getFullResponseDurationMs(job: OcrSimulationJob) {
  const startedAt = new Date(job.startedAt).getTime();
  if (!Number.isFinite(startedAt)) return undefined;
  const endedAtRaw = job.completedAt ?? job.readyAt;
  const endedAt = new Date(endedAtRaw).getTime();
  if (!Number.isFinite(endedAt)) return undefined;
  return Math.max(0, endedAt - startedAt);
}

export function OcrJobDetailClient({ businessId, initialJob, usageCost, usdToToman }: OcrJobDetailClientProps) {
  const searchParams = useSearchParams();
  const [job, setJob] = useState(initialJob);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const [activeStreamKey, setActiveStreamKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [batchReady, setBatchReady] = useState(false);
  const streamStartedRef = useRef(false);
  const jobRef = useRef(initialJob);
  const grpcModeDecidedRef = useRef(false);
  const shouldStreamRef = useRef(false);

  const transportMode = useMemo(() => resolveTransport(job, searchParams), [job, searchParams]);
  const formFields = useMemo(() => getOcrFormFields(job), [job]);
  const durationMs = useMemo(() => getFullResponseDurationMs(job), [job]);
  const isProcessing = job.status === 'queued' || job.status === 'processing';
  const isGrpcStreaming = isGrpcStreamingMode(transportMode);
  const isBatchMode = isBatchOcrTransportMode(transportMode);
  const isGrpcUnary = transportMode === 'grpc-unary';

  // Decide once (on first render for this job) whether we should play the live
  // stream, so that flipping GRPC_DONE_KEY mid-stream never re-triggers effects.
  if (!grpcModeDecidedRef.current) {
    const alreadyPlayed =
      typeof window !== 'undefined' && sessionStorage.getItem(GRPC_DONE_KEY(job.id)) === '1';
    shouldStreamRef.current = isGrpcStreaming && !alreadyPlayed;
    grpcModeDecidedRef.current = true;
  }
  const shouldGrpcStream = isGrpcStreaming && shouldStreamRef.current && formFields.length > 0;

  useEffect(() => {
    setJob(initialJob);
    jobRef.current = initialJob;
    const fromQuery = searchParams?.get('transport');
    if (fromQuery) {
      sessionStorage.setItem(TRANSPORT_KEY(initialJob.id), normalizeOcrTransportMode(fromQuery));
    }
  }, [initialJob, searchParams]);

  useEffect(() => {
    if (job.status !== 'processing' && job.status !== 'queued') return undefined;

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/businesses/${businessId}/ai-tools/ocr`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json().catch(() => null)) as { jobs?: OcrSimulationJob[] } | null;
      const nextJob = payload?.jobs?.find((item) => item.id === job.id);
      if (nextJob) {
        jobRef.current = nextJob;
        setJob(nextJob);
      }
    }, 900);

    return () => window.clearInterval(timer);
  }, [businessId, job.id, job.status]);

  useEffect(() => {
    streamStartedRef.current = false;
    grpcModeDecidedRef.current = false;
    setRevealedKeys(new Set());
    setActiveStreamKey(null);
    setStreamingComplete(false);
    setFieldsLocked(false);
    setFieldValues({});
    setBatchReady(false);
  }, [job.id]);

  useEffect(() => {
    if (!isBatchMode || formFields.length === 0) return;

    if (isProcessing) {
      setBatchReady(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setFieldValues(buildInitialValues(jobRef.current));
      setStreamingComplete(true);
      setFieldsLocked(false);
      setBatchReady(true);
    }, getOcrBatchRevealDelayMs(transportMode));

    return () => window.clearTimeout(timer);
  }, [formFields, isBatchMode, isProcessing, transportMode]);

  const hasFields = formFields.length > 0;

  useEffect(() => {
    if (!shouldGrpcStream || !hasFields) return undefined;
    if (streamStartedRef.current) return undefined;
    streamStartedRef.current = true;

    const jobId = jobRef.current.id;
    const streamFields = getOcrFormFields(jobRef.current);
    setFieldsLocked(true);
    setFieldValues(Object.fromEntries(streamFields.map((field) => [field.key, ''])));

    let cancelled = false;

    const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const streamField = (fieldKey: string, fullValue: string) =>
      new Promise<void>((resolve) => {
        setActiveStreamKey(fieldKey);
        let charIndex = 0;

        const tick = () => {
          if (cancelled) return;
          charIndex += 1;
          setFieldValues((current) => ({
            ...current,
            [fieldKey]: fullValue.slice(0, charIndex),
          }));

          if (charIndex < fullValue.length) {
            window.setTimeout(tick, Math.max(14, 32 - Math.floor(fullValue.length / 16)));
            return;
          }

          setRevealedKeys((current) => new Set([...current, fieldKey]));
          setActiveStreamKey(null);
          window.setTimeout(resolve, 160);
        };

        tick();
      });

    const run = async () => {
      await wait(500);
      for (const field of streamFields) {
        if (cancelled) return;
        await streamField(field.key, field.targetValue || '—');
      }

      if (cancelled) return;

      // small settle delay, then unlock so the user can edit
      await wait(400);
      if (cancelled) return;

      sessionStorage.setItem(GRPC_DONE_KEY(jobId), '1');
      setActiveStreamKey(null);
      setStreamingComplete(true);
      setFieldsLocked(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldGrpcStream, hasFields]);

  useEffect(() => {
    if (!isGrpcStreaming || shouldGrpcStream || formFields.length === 0) return;
    setFieldValues(buildInitialValues(jobRef.current));
    setRevealedKeys(new Set(formFields.map((field) => field.key)));
    setStreamingComplete(true);
    setFieldsLocked(false);
  }, [formFields, isGrpcStreaming, shouldGrpcStream]);

  const showBatchLoading = isBatchMode && (isProcessing || !batchReady);
  const showGrpcShell = isGrpcStreaming && formFields.length > 0;
  const showBatchForm = isBatchMode && batchReady && formFields.length > 0;
  const grpcStreaming = isGrpcStreaming && shouldGrpcStream && !streamingComplete;
  const batchSectionClass = isGrpcUnary ? 'ai-lab-ocr-result-grpc-unary' : 'ai-lab-ocr-result-rest';
  const batchDoneSectionClass = isGrpcUnary ? 'ai-lab-ocr-result-grpc-unary-done' : 'ai-lab-ocr-result-rest-done';

  return (
    <div
      className={`ai-lab-ocr-result-page ai-lab-ocr-result-page--${transportMode}`}
      dir="rtl"
      lang="fa"
    >
      <header className="ai-lab-ocr-result-top">
        <Link href={`/businesses/${businessId}/ai-tools/ocr`} className="ai-lab-ocr-result-back">
          <ArrowRight className="h-4 w-4" aria-hidden />
          بازگشت
        </Link>
        <span className={`ai-lab-ocr-result-mode ai-lab-ocr-result-mode--${transportMode}`}>
          {getOcrTransportLabel(transportMode)}
        </span>
      </header>

      {showBatchLoading ? (
        <section className={batchSectionClass} aria-label={`در حال پردازش ${getOcrTransportLabel(transportMode)}`}>
          <Loader2 className="ai-lab-ocr-result-rest-icon animate-spin" aria-hidden />
          <h1>{job.sourceLabel}</h1>
          <p>{isGrpcUnary ? 'در حال دریافت پاسخ gRPC…' : 'در حال استخراج اطلاعات…'}</p>
          <span className="ai-lab-ocr-result-rest-hint">
            {isGrpcUnary ? 'پاسخ کامل پس از اتمام، یک‌جا نمایش داده می‌شود' : 'فرم پس از اتمام، یک‌جا نمایش داده می‌شود'}
          </span>
          <OcrPipelineUsageSection
            job={job}
            usdToToman={usdToToman}
            transportMode={transportMode}
            legacyCost={usageCost}
            durationMs={durationMs}
            compact
          />
        </section>
      ) : null}

      {showGrpcShell ? (
        <section className="ai-lab-ocr-result-grpc" aria-label="استریم gRPC">
          <div className="ai-lab-ocr-result-grpc-head">
            <div>
              <h1>{job.sourceLabel}</h1>
              <p>{job.templateLabel ?? 'استخراج زنده فیلدها'}</p>
            </div>
            {grpcStreaming ? (
              <span className="ai-lab-ocr-result-live">
                <span className="ai-lab-ocr-result-live-dot" aria-hidden />
                <Radio className="h-3 w-3" aria-hidden />
                LIVE
              </span>
            ) : streamingComplete ? (
              <span className="ai-lab-ocr-result-done">
                <Check className="h-3.5 w-3.5" aria-hidden />
                تکمیل
              </span>
            ) : null}
          </div>

          <OcrPipelineUsageSection
            job={job}
            usdToToman={usdToToman}
            transportMode={transportMode}
            legacyCost={usageCost}
            confidence={streamingComplete ? job.confidence : undefined}
            durationMs={durationMs}
            compact={grpcStreaming}
          />

          <ol className="ai-lab-ocr-result-steps" aria-label="پیشرفت فیلدها">
            {formFields.map((field) => {
              const done = revealedKeys.has(field.key);
              const active = activeStreamKey === field.key;
              return (
                <li
                  key={field.key}
                  className={[
                    done ? 'is-done' : '',
                    active ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {done ? <Check className="h-3 w-3" aria-hidden /> : active ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : null}
                  {field.label}
                </li>
              );
            })}
          </ol>

          <div className="ai-lab-ocr-result-form">
            {formFields.map((field) => {
              const isRevealed = revealedKeys.has(field.key);
              const isStreaming = activeStreamKey === field.key;

              return (
                <div
                  key={field.key}
                  className={[
                    'ai-lab-ocr-result-field',
                    isStreaming ? 'is-streaming' : '',
                    isRevealed ? 'is-filled' : 'is-pending',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <label htmlFor={`ocr-field-${field.key}`}>{field.label}</label>
                  <input
                    id={`ocr-field-${field.key}`}
                    value={fieldValues[field.key] ?? ''}
                    disabled={fieldsLocked}
                    onChange={(event) =>
                      setFieldValues((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    placeholder={fieldsLocked ? 'در انتظار استریم…' : ''}
                  />
                  {isRevealed && field.confidence !== null ? (
                    <span className="ai-lab-ocr-result-field-score">
                      اطمینان {formatConfidence(Math.round(field.confidence * 100))}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {showBatchForm ? (
        <section className={batchDoneSectionClass} aria-label={`نتیجه ${getOcrTransportLabel(transportMode)}`}>
          <h1>{job.sourceLabel}</h1>
          <p className="ai-lab-ocr-result-rest-done-note">
            {isGrpcUnary ? 'پاسخ gRPC یک‌جا دریافت شد' : 'همه فیلدها یک‌جا استخراج شدند'}
          </p>

          <OcrPipelineUsageSection
            job={job}
            usdToToman={usdToToman}
            transportMode={transportMode}
            legacyCost={usageCost}
            confidence={job.confidence}
            durationMs={durationMs}
          />

          <div className={`ai-lab-ocr-result-form ${isGrpcUnary ? 'ai-lab-ocr-result-form--grpc-unary' : 'ai-lab-ocr-result-form--rest'}`}>
            {formFields.map((field) => (
              <div key={field.key} className="ai-lab-ocr-result-field is-filled">
                <label htmlFor={`ocr-batch-field-${field.key}`}>{field.label}</label>
                <input
                  id={`ocr-batch-field-${field.key}`}
                  value={fieldValues[field.key] ?? ''}
                  onChange={(event) =>
                    setFieldValues((current) => ({ ...current, [field.key]: event.target.value }))
                  }
                />
                {field.confidence !== null ? (
                  <span className="ai-lab-ocr-result-field-score">
                    اطمینان {formatConfidence(Math.round(field.confidence * 100))}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
