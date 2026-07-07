'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Clock3,
  Cpu,
  Info,
  Loader2,
  Play,
  Smartphone,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import {
  DEFAULT_OCR_MODEL_ID,
  OCR_MODEL_OPTIONS,
  type OcrModelProvider,
} from '@/app/lib/ocr-models';
import {
  getOcrSampleById,
  type OcrSampleLane,
  type OcrTemplateScenario,
} from '@/app/lib/ocr-simulator-data';
import type { OcrSimulationJob } from '@/app/lib/data';
import { isGrpcStreamingMode, type OcrTransportMode } from '@/app/lib/ocr-transport';
import { OcrContractDialog } from '@/components/ocr/OcrContractDialog';
import { OcrUploadZone, type OcrUploadFileState } from '@/components/ocr/OcrUploadZone';
import './ocr/ocr-contract.css';
import './ocr/ocr-create.css';

type OcrRegistrationClientProps = {
  businessId: string;
};

type DocumentTypeKey = 'id-card' | 'receipt';

const DOCUMENT_TYPES: {
  key: DocumentTypeKey;
  sampleId: string;
  label: string;
  lane: OcrSampleLane;
  icon: typeof UserRound;
}[] = [
  { key: 'id-card', sampleId: 'id-card', label: 'کارت ملی', lane: 'quick', icon: UserRound },
  { key: 'receipt', sampleId: 'receipt', label: 'رسید پرداخت', lane: 'quick', icon: Smartphone },
];

function getDocumentType(key: DocumentTypeKey) {
  return DOCUMENT_TYPES.find((item) => item.key === key) ?? DOCUMENT_TYPES[0];
}

const MODEL_PROVIDER_LABELS: Record<OcrModelProvider, string> = {
  openai: 'GPT',
  deepseek: 'DeepSeek',
  google: 'Gemini',
  xai: 'Grok',
};

export function OcrRegistrationClient({ businessId }: OcrRegistrationClientProps) {
  const router = useRouter();
  const [activeLane, setActiveLane] = useState<OcrSampleLane>('quick');
  const [selectedTypeKey, setSelectedTypeKey] = useState<DocumentTypeKey>('id-card');
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_OCR_MODEL_ID);
  const [uploadState, setUploadState] = useState<OcrUploadFileState | null>(null);
  const [submissionLabel, setSubmissionLabel] = useState('کارت ملی');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [contractDialogType, setContractDialogType] = useState<DocumentTypeKey | null>(null);

  const selectedType = getDocumentType(selectedTypeKey);
  const selectedSample = useMemo(() => {
    if (activeLane === 'long') return getOcrSampleById('contract');
    return getOcrSampleById(selectedType.sampleId);
  }, [activeLane, selectedType.sampleId]);

  const sourceTitle = submissionLabel.trim() || uploadState?.fileName || selectedType.label;
  const contractSample = useMemo(() => {
    if (!contractDialogType) return null;
    const docType = getDocumentType(contractDialogType);
    return getOcrSampleById(docType.sampleId);
  }, [contractDialogType]);

  const handleLaneChange = (lane: OcrSampleLane) => {
    setActiveLane(lane);
    setUploadState(null);
    setError('');

    if (lane === 'long') {
      setSubmissionLabel((current) => current.trim() || 'قرارداد');
      return;
    }

    setSubmissionLabel(selectedType.label);
  };

  const handleTypeChange = (key: DocumentTypeKey) => {
    const nextType = getDocumentType(key);
    setSelectedTypeKey(key);
    setActiveLane(nextType.lane);
    setSubmissionLabel(nextType.label);
    setError('');
  };

  const validateForm = () => {
    if (!selectedSample) {
      setError('لطفاً یک نوع سند انتخاب کنید.');
      return false;
    }
    if (!sourceTitle.trim()) {
      setError('عنوان سند را وارد کنید.');
      return false;
    }
    setError('');
    return true;
  };

  const runSimulation = async (
    scenario: OcrTemplateScenario = 'recognize',
    transportMode: OcrTransportMode = 'rest',
  ) => {
    if (!validateForm()) return;

    const sourceType = uploadState ? 'upload' : 'sample';
    const sample = selectedSample;
    const sourceName = sourceTitle.trim() || uploadState?.fileName || sample?.fileName || '';

    if (!sample && !uploadState) {
      setError('یک نوع سند انتخاب کنید یا فایل آپلود نمایید.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/businesses/${businessId}/ai-tools/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          sourceType === 'sample'
            ? {
                sourceType,
                sampleId: sample?.id,
                templateId: sample?.id,
                scenario: 'recognize',
                sourceName,
                fileType: sample?.fileType,
                transportMode,
                modelId: selectedModelId,
              }
            : {
                sourceType,
                templateId: sample?.id,
                scenario,
                sourceName,
                fileType: uploadState?.fileType,
                fileSize: uploadState?.fileSize,
                sampleText: uploadState?.contentSnippet,
                transportMode,
                modelId: selectedModelId,
              },
        ),
      });

      const payload = (await response.json().catch(() => null)) as { job?: OcrSimulationJob; message?: string } | null;
      if (!response.ok || !payload?.job) {
        throw new Error(payload?.message || 'ساخت کار نویسه‌خوانی انجام نشد.');
      }

      sessionStorage.setItem(`ocr-transport:${payload.job.id}`, transportMode);
      if (isGrpcStreamingMode(transportMode)) {
        sessionStorage.removeItem(`ocr-grpc-done:${payload.job.id}`);
      }

      router.push(`/businesses/${businessId}/ai-tools/ocr/${payload.job.id}?transport=${transportMode}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'اجرای شبیه‌سازی نویسه‌خوانی ناموفق بود.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ai-lab-ocr-create-page" dir="rtl" lang="fa">
      <div className="ai-lab-ocr-create-card">
        <div className="ai-lab-ocr-create-mode" role="tablist" aria-label="حالت اجرا">
          <button
            type="button"
            role="tab"
            aria-selected={activeLane === 'quick'}
            className={activeLane === 'quick' ? 'is-active' : ''}
            onClick={() => handleLaneChange('quick')}
          >
            <Zap className="h-3.5 w-3.5" aria-hidden />
            سریع
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeLane === 'long'}
            className={activeLane === 'long' ? 'is-active' : ''}
            onClick={() => handleLaneChange('long')}
          >
            <Clock3 className="h-3.5 w-3.5" aria-hidden />
            زمان بر
          </button>
        </div>

        <section className="ai-lab-ocr-create-section" aria-labelledby="ocr-doc-type-title">
          <div className="ai-lab-ocr-create-section-head">
            <span className="ai-lab-ocr-create-step" aria-hidden>
              1
            </span>
            <div className="ai-lab-ocr-create-section-copy">
              <h2 id="ocr-doc-type-title">نوع سند</h2>
              <p>نوع سند خود را انتخاب کنید تا به AI در تشخیص‌تان کمک کند.</p>
            </div>
          </div>

          <div className="ai-lab-ocr-create-types" role="group" aria-label="نوع سند">
            {DOCUMENT_TYPES.map((item) => {
              const Icon = item.icon;
              const isActive = selectedTypeKey === item.key;
              return (
                <div
                  key={item.key}
                  className={['ai-lab-ocr-create-type-wrap', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
                >
                  <button
                    type="button"
                    className="ai-lab-ocr-create-type-contract"
                    aria-label={`مشاهده قرارداد API برای ${item.label}`}
                    onClick={() => setContractDialogType(item.key)}
                  >
                    <Info className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={isActive ? 'ai-lab-ocr-create-type is-active' : 'ai-lab-ocr-create-type'}
                    onClick={() => handleTypeChange(item.key)}
                  >
                    <Icon aria-hidden />
                    {item.label}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="ai-lab-ocr-create-section" aria-labelledby="ocr-model-title">
          <div className="ai-lab-ocr-create-section-head">
            <span className="ai-lab-ocr-create-step" aria-hidden>
              2
            </span>
            <div className="ai-lab-ocr-create-section-copy">
              <h2 id="ocr-model-title">مدل AI</h2>
              <p>مدل مورد نظر برای استخراج اطلاعات را انتخاب کنید.</p>
            </div>
          </div>

          <div className="ai-lab-ocr-create-models" role="radiogroup" aria-label="مدل AI">
            {OCR_MODEL_OPTIONS.map((model) => {
              const isActive = selectedModelId === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={[
                    'ai-lab-ocr-create-model',
                    `ai-lab-ocr-create-model--${model.provider}`,
                    isActive ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelectedModelId(model.id)}
                >
                  <span className="ai-lab-ocr-create-model-icon" aria-hidden>
                    <Cpu className="h-4 w-4" />
                  </span>
                  <span className="ai-lab-ocr-create-model-copy">
                    <span className="ai-lab-ocr-create-model-provider">
                      {MODEL_PROVIDER_LABELS[model.provider]}
                    </span>
                    <strong>{model.name}</strong>
                    <small>{model.description}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="ai-lab-ocr-create-section" aria-labelledby="ocr-doc-title-label">
          <div className="ai-lab-ocr-create-section-head">
            <span className="ai-lab-ocr-create-step" aria-hidden>
              3
            </span>
            <div className="ai-lab-ocr-create-section-copy">
              <h2 id="ocr-doc-title-label">عنوان سند</h2>
              <p>یک عنوان برای این تست تعیین کنید.</p>
            </div>
          </div>

          <div className="ai-lab-ocr-create-field">
            <input
              id="ocr-source-title"
              className="ai-lab-ocr-create-input"
              value={submissionLabel}
              onChange={(event) => setSubmissionLabel(event.target.value)}
              placeholder="مثلا: تست فاکتور فروش"
            />
          </div>
        </section>

        <section className="ai-lab-ocr-create-section" aria-labelledby="ocr-upload-title">
          <div className="ai-lab-ocr-create-section-head">
            <span className="ai-lab-ocr-create-step" aria-hidden>
              4
            </span>
            <div className="ai-lab-ocr-create-section-copy">
              <h2 id="ocr-upload-title">آپلود فایل (اختیاری)</h2>
              <p>فایل مورد نظر خود را برای استخراج اطلاعات آپلود کنید.</p>
            </div>
          </div>

          <OcrUploadZone
            variant="inline"
            value={uploadState}
            onChange={(file) => {
              setUploadState(file);
              if (file) setSubmissionLabel(file.fileName);
            }}
            onError={setError}
            disabled={submitting}
          />
        </section>

        <div className="ai-lab-ocr-create-actions">
          <Link href={`/businesses/${businessId}/ai-tools/ocr`} className="ai-lab-ocr-create-btn-secondary">
            <X className="h-4 w-4" aria-hidden />
            انصراف
          </Link>
          <div className="ai-lab-ocr-create-start-actions">
            <button
              type="button"
              className="ai-lab-ocr-create-btn-primary"
              onClick={() => runSimulation('recognize', 'rest')}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              شروع با REST API
            </button>
            <button
              type="button"
              className="ai-lab-ocr-create-btn-primary ai-lab-ocr-create-btn-primary--grpc"
              onClick={() => runSimulation('recognize', 'grpc-streaming')}
              disabled={submitting}
            >
              <Play className="h-4 w-4" aria-hidden />
              شروع با gRPC Streaming
            </button>
            <button
              type="button"
              className="ai-lab-ocr-create-btn-primary ai-lab-ocr-create-btn-primary--grpc-unary"
              onClick={() => runSimulation('recognize', 'grpc-unary')}
              disabled={submitting}
            >
              <Play className="h-4 w-4" aria-hidden />
              شروع با gRPC Request/Response
            </button>
          </div>
        </div>

        {error ? <p className="ai-lab-ocr-create-error">{error}</p> : null}
      </div>

      <OcrContractDialog
        sample={contractSample}
        open={contractDialogType !== null}
        onOpenChange={(open) => {
          if (!open) setContractDialogType(null);
        }}
      />
    </div>
  );
}
