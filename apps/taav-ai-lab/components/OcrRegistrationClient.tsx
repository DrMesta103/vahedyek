'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Clock3,
  Cpu,
  Info,
  ListTree,
  Loader2,
  Play,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import {
  createDefaultExtractionFields,
  validateExtractionFields,
  type OcrExtractionFieldDraft,
} from '@/app/lib/ocr-extraction-fields';
import {
  DEFAULT_OCR_MODEL_ID,
  type OcrModelProvider,
} from '@/app/lib/ocr-models';
import {
  getOcrSampleById,
  type OcrSampleDocument,
  type OcrSampleLane,
  type OcrTemplateScenario,
} from '@/app/lib/ocr-simulator-data';
import type { OcrSimulationJob } from '@/app/lib/data';
import { OCR_CONTRACT_TRANSPORT_ORDER } from '@/app/lib/ocr-contracts';
import { getOcrTransportLabel, isGrpcStreamingMode, type OcrTransportMode } from '@/app/lib/ocr-transport';
import { usdToTomanCost } from '@/app/lib/ai-usage-cost';
import { formatCostToman } from '@/app/lib/ocr-ai-pricing';
import { formatUsd } from '@/app/lib/global-settings-mock';
import { OcrContractDialog } from '@/components/ocr/OcrContractDialog';
import { OcrDynamicFieldEditor } from '@/components/ocr/OcrDynamicFieldEditor';
import { OcrExtractionPreviewPanel } from '@/components/ocr/OcrExtractionPreviewPanel';
import { OcrUploadZone, type OcrUploadFileState } from '@/components/ocr/OcrUploadZone';
import './ocr/ocr-contract.css';
import './ocr/ocr-create.css';

type OcrRegistrationClientProps = {
  businessId: string;
  initialOcrModels: {
    provider: OcrModelProvider;
    providerLabel: string;
    displayName: string;
    providerModelName: string;
    inputTokenPriceUsd: number;
    outputTokenPriceUsd: number;
    accountId: string;
  }[];
  usdToToman: number;
};

type DocumentTypeKey = 'id-card' | 'dynamic';

type OcrFileTypeKey = 'auto' | 'jpg' | 'png' | 'pdf';

const DOCUMENT_TYPES: {
  key: DocumentTypeKey;
  sampleId: string | null;
  label: string;
  lane: OcrSampleLane;
  icon: typeof UserRound;
}[] = [
  { key: 'id-card', sampleId: 'id-card', label: 'کارت ملی', lane: 'quick', icon: UserRound },
  { key: 'dynamic', sampleId: null, label: 'داینامیک', lane: 'quick', icon: ListTree },
];

const DYNAMIC_CONTRACT_SAMPLE: OcrSampleDocument = {
  id: 'dynamic',
  title: 'سند داینامیک',
  description: 'قرارداد استخراج داینامیک بر اساس فیلدهایی که در همین صفحه تعریف می‌شوند.',
  lane: 'quick',
  fileName: 'dynamic-document.pdf',
  fileType: 'application/pdf',
  previewLines: [],
  tokensUsed: 1570,
  confidence: 88,
  pageCount: 1,
  summary: 'استخراج داینامیک از فایل آپلودشده.',
  prompt: 'فیلدهای داینامیک تعریف‌شده توسط کاربر را از سند استخراج کن.',
  inputSchema: { fields: [] },
  expectedResult: { overall_status: 'completed', fields: [] },
  sampleText: '',
  scenarios: {
    recognize: {
      label: 'استخراج داینامیک',
      confidence: 88,
      tokensUsed: 1570,
      summary: 'فیلدهای داینامیک از فایل آپلودشده استخراج شدند.',
      previewLines: [],
      result: { overall_status: 'completed', fields: [] },
      warnings: [],
    },
  },
};

function getDocumentType(key: DocumentTypeKey) {
  return DOCUMENT_TYPES.find((item) => item.key === key) ?? DOCUMENT_TYPES[0];
}

const MODEL_PROVIDER_LABELS: Record<OcrModelProvider, string> = {
  openai: 'GPT',
  deepseek: 'DeepSeek',
  google: 'Gemini',
  xai: 'Grok',
};

const OCR_FILE_TYPE_OPTIONS: { key: OcrFileTypeKey; label: string; accept?: string }[] = [
  { key: 'jpg', label: 'JPG', accept: 'image/jpeg' },
  { key: 'png', label: 'PNG', accept: 'image/png' },
  { key: 'pdf', label: 'PDF', accept: 'application/pdf' },
  { key: 'auto', label: 'سایر (تشخیص خودکار)' },
];

export function OcrRegistrationClient({ businessId, initialOcrModels, usdToToman }: OcrRegistrationClientProps) {
  const router = useRouter();
  const [activeLane, setActiveLane] = useState<OcrSampleLane>('quick');
  const [selectedTypeKey, setSelectedTypeKey] = useState<DocumentTypeKey>('id-card');
  const [selectedModelKey, setSelectedModelKey] = useState(() => {
    const first = initialOcrModels[0];
    const firstKey = first ? `${first.accountId}:${first.providerModelName}` : `seed:${DEFAULT_OCR_MODEL_ID}`;
    const defaultRow = initialOcrModels.find((item) => item.providerModelName === DEFAULT_OCR_MODEL_ID);
    return defaultRow ? `${defaultRow.accountId}:${DEFAULT_OCR_MODEL_ID}` : firstKey;
  });
  const [selectedTransportMode, setSelectedTransportMode] = useState<OcrTransportMode>('rest');
  const [uploadState, setUploadState] = useState<OcrUploadFileState | null>(null);
  const [submissionLabel, setSubmissionLabel] = useState('کارت ملی');
  const [dynamicFields, setDynamicFields] = useState<OcrExtractionFieldDraft[]>(() => createDefaultExtractionFields());
  const [selectedFileType, setSelectedFileType] = useState<OcrFileTypeKey>('jpg');
  const [lastUnlockedFileType, setLastUnlockedFileType] = useState<OcrFileTypeKey>('auto');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [contractDialogType, setContractDialogType] = useState<DocumentTypeKey | null>(null);

  const selectedType = getDocumentType(selectedTypeKey);
  const isDynamicDocument = activeLane === 'quick' && selectedTypeKey === 'dynamic';
  const isIdCardDocument = activeLane === 'quick' && selectedTypeKey === 'id-card';
  const wasIdCardDocument = useRef(isIdCardDocument);
  const ocrModels = initialOcrModels;
  const dynamicFieldValidation = useMemo(() => validateExtractionFields(dynamicFields), [dynamicFields]);
  const selectedSample = useMemo(() => {
    if (activeLane === 'long') return getOcrSampleById('contract');
    if (!selectedType.sampleId) return null;
    return getOcrSampleById(selectedType.sampleId);
  }, [activeLane, selectedType.sampleId]);

  useEffect(() => {
    if (isIdCardDocument) {
      wasIdCardDocument.current = true;
      setSelectedFileType('jpg');
      return;
    }

    if (wasIdCardDocument.current) {
      wasIdCardDocument.current = false;
      setSelectedFileType(lastUnlockedFileType);
    }
  }, [isIdCardDocument, lastUnlockedFileType]);

  const acceptForFileType = useMemo(() => {
    if (isIdCardDocument) return 'image/jpeg,image/png';

    const selected = OCR_FILE_TYPE_OPTIONS.find((item) => item.key === selectedFileType);
    return selected?.accept;
  }, [isIdCardDocument, selectedFileType]);

  useEffect(() => {
    if (ocrModels.length === 0) return;
    const stillExists = ocrModels.some((item) => `${item.accountId}:${item.providerModelName}` === selectedModelKey);
    if (stillExists) return;
    const defaultRow = ocrModels.find((item) => item.providerModelName === DEFAULT_OCR_MODEL_ID);
    setSelectedModelKey(
      defaultRow ? `${defaultRow.accountId}:${DEFAULT_OCR_MODEL_ID}` : `${ocrModels[0]!.accountId}:${ocrModels[0]!.providerModelName}`,
    );
  }, [ocrModels, selectedModelKey]);

  const selectedModel = useMemo(() => {
    const [accountId, providerModelName] = selectedModelKey.split(':');
    return (
      ocrModels.find((item) => item.accountId === accountId && item.providerModelName === providerModelName) ??
      ocrModels[0] ??
      null
    );
  }, [ocrModels, selectedModelKey]);

  const sourceTitle = submissionLabel.trim() || uploadState?.fileName || selectedType.label;
  const contractSample = useMemo(() => {
    if (!contractDialogType) return null;
    if (contractDialogType === 'dynamic') return DYNAMIC_CONTRACT_SAMPLE;
    const docType = getDocumentType(contractDialogType);
    if (!docType.sampleId) return null;
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
    if (isDynamicDocument) {
      if (!uploadState) {
        setError('برای نوع سند داینامیک، ابتدا فایل مورد نظر را آپلود کنید.');
        return false;
      }
      if (dynamicFieldValidation.errors.length > 0) {
        setError(dynamicFieldValidation.errors[0] ?? 'فیلدهای داینامیک معتبر نیستند.');
        return false;
      }
      setError('');
      return true;
    }

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

    if (!isDynamicDocument && !sample && !uploadState) {
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
          isDynamicDocument
            ? {
                sourceType: 'upload',
                templateId: 'dynamic',
                scenario,
                sourceName,
                fileType: uploadState?.fileType,
                fileSize: uploadState?.fileSize,
                sampleText: uploadState?.contentSnippet,
                transportMode,
                modelId: selectedModelKey,
                extractionFields: dynamicFieldValidation.fields,
              }
            : sourceType === 'sample'
            ? {
                sourceType,
                sampleId: sample?.id,
                templateId: sample?.id,
                scenario: 'recognize',
                sourceName,
                fileType: sample?.fileType,
                transportMode,
                modelId: selectedModelKey,
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
                modelId: selectedModelKey,
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

        <section className="ai-lab-ocr-create-section ai-lab-ocr-create-section--transport" aria-labelledby="ocr-transport-title">
          <div className="ai-lab-ocr-create-section-head">
            <div className="ai-lab-ocr-create-section-copy">
              <h2 id="ocr-transport-title">نوع درخواست</h2>
              <p>نحوه ارتباط با سرویس Document AI را انتخاب کنید.</p>
            </div>
          </div>

          <div className="ai-lab-ocr-create-transports" role="radiogroup" aria-label="نوع درخواست">
            {OCR_CONTRACT_TRANSPORT_ORDER.map((transport) => {
              const isActive = selectedTransportMode === transport;
              return (
                <button
                  key={transport}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={[
                    'ai-lab-ocr-create-transport',
                    `ai-lab-ocr-create-transport--${transport}`,
                    isActive ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelectedTransportMode(transport)}
                >
                  {getOcrTransportLabel(transport)}
                </button>
              );
            })}
          </div>
        </section>

        <section className="ai-lab-ocr-create-section" aria-labelledby="ocr-model-title">
          <div className="ai-lab-ocr-create-section-head">
            <span className="ai-lab-ocr-create-step" aria-hidden>
              1
            </span>
            <div className="ai-lab-ocr-create-section-copy">
              <h2 id="ocr-model-title">مدل AI</h2>
              <p>مدل مورد نظر برای استخراج اطلاعات را انتخاب کنید.</p>
            </div>
          </div>

          <div className="ai-lab-ocr-create-models" role="radiogroup" aria-label="مدل AI">
            {ocrModels.map((model) => {
              const modelKey = `${model.accountId}:${model.providerModelName}`;
              const isActive = selectedModelKey === modelKey;
              return (
                <button
                  key={modelKey}
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
                  onClick={() => setSelectedModelKey(modelKey)}
                >
                  <span className="ai-lab-ocr-create-model-icon" aria-hidden>
                    <Cpu className="h-4 w-4" />
                  </span>
                  <span className="ai-lab-ocr-create-model-copy">
                    <span className="ai-lab-ocr-create-model-provider">
                      {MODEL_PROVIDER_LABELS[model.provider]}
                    </span>
                    <strong>{model.displayName}</strong>
                    <small>
                      ورودی:{' '}
                      <span dir="ltr">{formatUsd(model.inputTokenPriceUsd)}</span>
                      {' · '}
                      خروجی:{' '}
                      <span dir="ltr">{formatUsd(model.outputTokenPriceUsd)}</span>
                      {' · '}
                      <span className="ai-lab-settings-price-toman">
                        {formatCostToman(
                          usdToTomanCost(model.inputTokenPriceUsd, usdToToman) +
                            usdToTomanCost(model.outputTokenPriceUsd, usdToToman),
                        )}
                      </span>
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="ai-lab-ocr-create-section" aria-labelledby="ocr-doc-type-title">
          <div className="ai-lab-ocr-create-section-head">
            <span className="ai-lab-ocr-create-step" aria-hidden>
              2
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
                  className={['ai-lab-ocr-create-type-chip', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
                >
                  <button
                    type="button"
                    className="ai-lab-ocr-create-type-info"
                    aria-label={`مشاهده قرارداد API برای ${item.label}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setContractDialogType(item.key);
                    }}
                  >
                    <Info className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <span className="ai-lab-ocr-create-type-sep" aria-hidden />
                  <button
                    type="button"
                    className="ai-lab-ocr-create-type-main"
                    aria-pressed={isActive}
                    onClick={() => handleTypeChange(item.key)}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {isDynamicDocument ? (
          <section className="ai-lab-ocr-create-section" aria-labelledby="ocr-dynamic-fields-title">
            <div className="ai-lab-ocr-create-section-head">
              <span className="ai-lab-ocr-create-step" aria-hidden>
                3
              </span>
              <div className="ai-lab-ocr-create-section-copy">
                <h2 id="ocr-dynamic-fields-title">فیلدهای استخراج</h2>
                <p>فیلدهایی که AI باید از فایل استخراج کند را تعریف کنید.</p>
              </div>
            </div>

            <OcrDynamicFieldEditor
              fields={dynamicFields}
              errors={dynamicFieldValidation.errors}
              onChange={setDynamicFields}
              disabled={submitting}
            />
          </section>
        ) : null}

        {isDynamicDocument ? (
          <OcrExtractionPreviewPanel
            fields={dynamicFieldValidation.fields}
            transportMode={selectedTransportMode}
            tenantId={businessId}
            provider={selectedModel?.provider ?? 'openai'}
            modelId={selectedModel?.providerModelName ?? DEFAULT_OCR_MODEL_ID}
            fileName={uploadState?.fileName}
            mimeType={uploadState?.fileType}
          />
        ) : null}

        <section className="ai-lab-ocr-create-section" aria-labelledby="ocr-doc-title-label">
          <div className="ai-lab-ocr-create-section-head">
            <span className="ai-lab-ocr-create-step" aria-hidden>
              {isDynamicDocument ? 4 : 3}
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
              {isDynamicDocument ? 5 : 4}
            </span>
            <div className="ai-lab-ocr-create-section-copy">
              <h2 id="ocr-upload-title">{isDynamicDocument ? 'آپلود فایل' : 'آپلود فایل (اختیاری)'}</h2>
              <p>
                {isDynamicDocument
                  ? 'برای سند داینامیک، فایل ورودی الزامی است تا استخراج بر اساس فیلدهای شما انجام شود.'
                  : 'فایل مورد نظر خود را برای استخراج اطلاعات آپلود کنید.'}
              </p>
            </div>
          </div>

          <div className="ai-lab-ocr-filetype-row" role="group" aria-label="نوع فایل">
            <div className="ai-lab-ocr-filetype-copy">
              <span className="ai-lab-ocr-filetype-label">نوع فایل</span>
              <span className="ai-lab-ocr-filetype-hint">
                {isIdCardDocument ? 'برای کارت ملی فقط تصویر مجاز است.' : 'نوع فایل را انتخاب کنید یا روی تشخیص خودکار بگذارید.'}
              </span>
            </div>
            <div className="ai-lab-ocr-filetype-chips">
              {OCR_FILE_TYPE_OPTIONS.map((option) => {
                const isLocked = isIdCardDocument;
                const isActive =
                  isLocked ? option.key === 'jpg' : option.key === selectedFileType;

                return (
                  <button
                    key={option.key}
                    type="button"
                    className={[
                      'ai-lab-ocr-filetype-chip',
                      isActive ? 'is-active' : '',
                      isLocked ? 'is-disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={isActive}
                    disabled={isLocked || submitting}
                    onClick={() => {
                      if (isLocked) return;
                      setSelectedFileType(option.key);
                      setLastUnlockedFileType(option.key);
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <OcrUploadZone
            variant="inline"
            value={uploadState}
            accept={acceptForFileType}
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
          <button
            type="button"
            className="ai-lab-ocr-create-btn-primary"
            onClick={() => runSimulation('recognize', selectedTransportMode)}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
            شروع
          </button>
        </div>

        {error ? <p className="ai-lab-ocr-create-error">{error}</p> : null}
      </div>

      <OcrContractDialog
        sample={contractSample}
        open={contractDialogType !== null}
        lockedTransport={selectedTransportMode}
        modelId={selectedModel?.providerModelName ?? DEFAULT_OCR_MODEL_ID}
        modelProvider={selectedModel?.provider ?? 'openai'}
        modelDisplayName={selectedModel?.displayName ?? null}
        modelProviderLabel={selectedModel?.providerLabel ?? null}
        tenantId={businessId}
        extractionFields={contractDialogType === 'dynamic' ? dynamicFieldValidation.fields : undefined}
        onOpenChange={(open) => {
          if (!open) setContractDialogType(null);
        }}
      />
    </div>
  );
}
