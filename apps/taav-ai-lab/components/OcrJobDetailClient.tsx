'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Loader2, Radio } from 'lucide-react';
import type { OcrSimulationJob } from '@/app/lib/data';
import {
  formatConfidence,
  getOcrAiUsage,
  getOcrFormFields,
  getOcrTransportMode,
} from '@/components/ocr/utils';
import { OcrAiUsagePanel } from '@/components/ocr/OcrAiUsagePanel';
import './ocr/ocr-result.css';

type OcrJobDetailClientProps = {
  businessId: string;
  initialJob: OcrSimulationJob;
};

const GRPC_DONE_KEY = (jobId: string) => `ocr-grpc-done:${jobId}`;
const TRANSPORT_KEY = (jobId: string) => `ocr-transport:${jobId}`;

function buildInitialValues(job: OcrSimulationJob) {
  return Object.fromEntries(getOcrFormFields(job).map((field) => [field.key, field.targetValue]));
}

function resolveTransport(job: OcrSimulationJob, searchParams: URLSearchParams | null) {
  const fromQuery = searchParams?.get('transport');
  if (fromQuery === 'grpc' || fromQuery === 'rest') return fromQuery;
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(TRANSPORT_KEY(job.id));
    if (stored === 'grpc' || stored === 'rest') return stored;
  }
  return getOcrTransportMode(job);
}

export function OcrJobDetailClient({ businessId, initialJob }: OcrJobDetailClientProps) {
  const searchParams = useSearchParams();
  const [job, setJob] = useState(initialJob);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const [activeStreamKey, setActiveStreamKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [restReady, setRestReady] = useState(false);
  const streamStartedRef = useRef(false);
  const jobRef = useRef(initialJob);
  const grpcModeDecidedRef = useRef(false);
  const shouldStreamRef = useRef(false);

  const transportMode = useMemo(() => resolveTransport(job, searchParams), [job, searchParams]);
  const formFields = useMemo(() => getOcrFormFields(job), [job]);
  const aiUsage = useMemo(() => getOcrAiUsage(job, transportMode), [job, transportMode]);
  const isProcessing = job.status === 'queued' || job.status === 'processing';
  const isGrpc = transportMode === 'grpc';
  const isRest = transportMode === 'rest';

  // Decide once (on first render for this job) whether we should play the live
  // stream, so that flipping GRPC_DONE_KEY mid-stream never re-triggers effects.
  if (!grpcModeDecidedRef.current) {
    const alreadyPlayed =
      typeof window !== 'undefined' && sessionStorage.getItem(GRPC_DONE_KEY(job.id)) === '1';
    shouldStreamRef.current = isGrpc && !alreadyPlayed;
    grpcModeDecidedRef.current = true;
  }
  const shouldGrpcStream = isGrpc && shouldStreamRef.current && formFields.length > 0;

  useEffect(() => {
    setJob(initialJob);
    jobRef.current = initialJob;
    const fromQuery = searchParams?.get('transport');
    if (fromQuery === 'grpc' || fromQuery === 'rest') {
      sessionStorage.setItem(TRANSPORT_KEY(initialJob.id), fromQuery);
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
    setRestReady(false);
  }, [job.id]);

  useEffect(() => {
    if (!isRest || formFields.length === 0) return;

    if (isProcessing) {
      setRestReady(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setFieldValues(buildInitialValues(jobRef.current));
      setStreamingComplete(true);
      setFieldsLocked(false);
      setRestReady(true);
    }, 480);

    return () => window.clearTimeout(timer);
  }, [formFields, isProcessing, isRest]);

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
    if (!isGrpc || shouldGrpcStream || formFields.length === 0) return;
    setFieldValues(buildInitialValues(jobRef.current));
    setRevealedKeys(new Set(formFields.map((field) => field.key)));
    setStreamingComplete(true);
    setFieldsLocked(false);
  }, [formFields, isGrpc, shouldGrpcStream]);

  const showRestLoading = isRest && (isProcessing || !restReady);
  const showGrpcShell = isGrpc && formFields.length > 0;
  const showRestForm = isRest && restReady && formFields.length > 0;
  const grpcStreaming = isGrpc && shouldGrpcStream && !streamingComplete;

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
          {isGrpc ? 'gRPC Stream' : 'REST API'}
        </span>
      </header>

      {showRestLoading ? (
        <section className="ai-lab-ocr-result-rest" aria-label="در حال پردازش REST">
          <Loader2 className="ai-lab-ocr-result-rest-icon animate-spin" aria-hidden />
          <h1>{job.sourceLabel}</h1>
          <p>در حال استخراج اطلاعات…</p>
          <span className="ai-lab-ocr-result-rest-hint">فرم پس از اتمام، یک‌جا نمایش داده می‌شود</span>
          <OcrAiUsagePanel usage={aiUsage} transportMode="rest" compact />
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

          <OcrAiUsagePanel
            usage={aiUsage}
            transportMode="grpc"
            confidence={streamingComplete ? job.confidence : undefined}
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

      {showRestForm ? (
        <section className="ai-lab-ocr-result-rest-done" aria-label="نتیجه REST">
          <h1>{job.sourceLabel}</h1>
          <p className="ai-lab-ocr-result-rest-done-note">همه فیلدها یک‌جا استخراج شدند</p>

          <OcrAiUsagePanel usage={aiUsage} transportMode="rest" confidence={job.confidence} />

          <div className="ai-lab-ocr-result-form ai-lab-ocr-result-form--rest">
            {formFields.map((field) => (
              <div key={field.key} className="ai-lab-ocr-result-field is-filled">
                <label htmlFor={`ocr-rest-field-${field.key}`}>{field.label}</label>
                <input
                  id={`ocr-rest-field-${field.key}`}
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
