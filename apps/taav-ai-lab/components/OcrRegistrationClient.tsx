'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Clock3, FileUp, ScanSearch, Copy, Check, Sparkles } from 'lucide-react';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';
import { TaavChoiceChipGroup, TaavFieldBlock, TaavInput } from '@repo/ui/taav/forms';
import { TaavTabs, TaavTabsContent, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav/overlays';
import {
  getOcrSampleById,
  getOcrSamplesByLane,
  type OcrSampleDocument,
  type OcrSampleLane,
  type OcrTemplateScenario,
} from '@/app/lib/ocr-simulator-data';
import type { OcrSimulationJob, Tenant } from '@/app/lib/data';
import { formatConfidence, toReadableFileSize } from '@/components/ocr/utils';

type UploadState = {
  fileName: string;
  fileType: string;
  fileSize: number;
  contentSnippet: string;
};

type OcrRegistrationClientProps = {
  business: Tenant;
  businessId: string;
};

const QUICK_SAMPLES = getOcrSamplesByLane('quick');
const LONG_SAMPLES = getOcrSamplesByLane('long');

const LANE_HINTS: Record<OcrSampleLane, string> = {
  quick: 'فاکتور، کارت ملی و رسید پرداخت برای اجرای سریع طراحی شده‌اند.',
  long: 'قرارداد واحد برای سناریوهای چندصفحه‌ای و پردازش طولانی‌تر است.',
};

function toChipOptions(samples: ReturnType<typeof getOcrSamplesByLane>) {
  return samples.map((sample) => ({
    value: sample.id,
    label: sample.title,
  }));
}

function getDefaultSampleId(lane: OcrSampleLane) {
  return lane === 'quick' ? (QUICK_SAMPLES[0]?.id ?? '') : (LONG_SAMPLES[0]?.id ?? '');
}

function formatPageCount(pageCount: number) {
  return new Intl.NumberFormat('fa-IR').format(pageCount);
}

function TemplateJsonPanel({
  description,
  jsonPreview,
  copied,
  onCopy,
}: {
  description: string;
  jsonPreview: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-xs leading-6 text-slate-400">{description}</p>
        <TaavButton
          size="sm"
          variant="secondary"
          tone="neutral"
          iconStart={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          onClick={onCopy}
        >
          {copied ? 'کپی شد' : 'کپی JSON'}
        </TaavButton>
      </div>
      <pre
        className="m-0 max-h-[min(52vh,480px)] overflow-auto rounded-[16px] border border-white/8 bg-[#06111f] p-4 text-left text-[12px] leading-6 text-slate-100"
        dir="ltr"
      >
        {jsonPreview}
      </pre>
    </div>
  );
}

function TemplatePreviewDialog({
  sample,
  open,
  onOpenChange,
}: {
  sample: OcrSampleDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
  const [copiedSection, setCopiedSection] = useState<'input' | 'output' | null>(null);

  const inputJsonPreview = sample ? JSON.stringify(sample.inputSchema, null, 2) : '';
  const outputJsonPreview = sample ? JSON.stringify(sample.expectedResult, null, 2) : '';

  const handleCopy = async (section: 'input' | 'output', jsonPreview: string) => {
    try {
      await navigator.clipboard.writeText(jsonPreview);
      setCopiedSection(section);
      window.setTimeout(() => setCopiedSection((current) => (current === section ? null : current)), 1400);
    } catch {
      setCopiedSection(null);
    }
  };

  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent
        size="lg"
        contentClassName="max-h-[min(88vh,720px)] overflow-hidden rounded-[20px] border border-white/10 bg-[rgba(9,16,31,0.98)] shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
      >
        <div className="grid gap-4">
          <TaavDialogHeader className="grid gap-2 border-b border-white/10 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <TaavBadge tone="brand" variant="soft" iconStart={<Sparkles className="h-3.5 w-3.5" />}>
                قالب OCR
              </TaavBadge>
              {sample ? (
                <TaavBadge tone="neutral" variant="soft">
                  {sample.lane === 'quick' ? 'سریع' : 'زمان‌بر'}
                </TaavBadge>
              ) : null}
            </div>
            <TaavDialogTitle className="text-right text-xl font-black text-white">
              {sample?.title ?? 'قالب انتخاب نشده'}
            </TaavDialogTitle>
            <TaavDialogDescription className="text-right text-sm leading-7 text-slate-300">
              {sample?.description ?? 'ابتدا یک نوع سند انتخاب کنید.'}
            </TaavDialogDescription>
          </TaavDialogHeader>

          {sample ? (
            <>
              <p className="m-0 rounded-[14px] border border-white/8 bg-white/[0.03] px-3 py-2.5 text-xs leading-7 text-slate-300">
                {sample.prompt}
              </p>

              <TaavTabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'input' | 'output')}>
                <TaavTabsList variant="pill" size="sm" className="w-full justify-start">
                  <TaavTabsTrigger value="input" variant="pill" size="sm">
                    JSON ورودی
                  </TaavTabsTrigger>
                  <TaavTabsTrigger value="output" variant="pill" size="sm">
                    JSON خروجی
                  </TaavTabsTrigger>
                </TaavTabsList>

                <TaavTabsContent value="input" className="mt-3">
                  <TemplateJsonPanel
                    description="اسکیما ورودی که بک‌اند دامنه‌ای به Document AI می‌فرستد."
                    jsonPreview={inputJsonPreview}
                    copied={copiedSection === 'input'}
                    onCopy={() => handleCopy('input', inputJsonPreview)}
                  />
                </TaavTabsContent>

                <TaavTabsContent value="output" className="mt-3">
                  <TemplateJsonPanel
                    description="خروجی شبیه‌سازی‌شده Document AI با confidence، validation و review status."
                    jsonPreview={outputJsonPreview}
                    copied={copiedSection === 'output'}
                    onCopy={() => handleCopy('output', outputJsonPreview)}
                  />
                </TaavTabsContent>
              </TaavTabs>
            </>
          ) : null}

          <TaavDialogFooter className="border-t border-white/10 pt-3">
            <TaavButton variant="secondary" tone="neutral" onClick={() => onOpenChange(false)}>
              بستن
            </TaavButton>
          </TaavDialogFooter>
        </div>
      </TaavDialogContent>
    </TaavDialog>
  );
}

export function OcrRegistrationClient({ business, businessId }: OcrRegistrationClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeLane, setActiveLane] = useState<OcrSampleLane>('quick');
  const [selectedSampleId, setSelectedSampleId] = useState<string>(getDefaultSampleId('quick'));
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [submissionLabel, setSubmissionLabel] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const laneSamples = activeLane === 'quick' ? QUICK_SAMPLES : LONG_SAMPLES;

  const selectedSample = useMemo(
    () => laneSamples.find((sample) => sample.id === selectedSampleId) ?? laneSamples[0] ?? null,
    [laneSamples, selectedSampleId],
  );

  const showCardIdScenarios = Boolean(uploadState && selectedSample?.id === 'id-card');
  const sourceTitle = uploadState?.fileName ?? selectedSample?.title ?? 'بدون انتخاب';

  const handleLaneChange = (lane: OcrSampleLane) => {
    setActiveLane(lane);
    setUploadState(null);
    setError('');
    const nextSample = lane === 'quick' ? QUICK_SAMPLES[0] : LONG_SAMPLES[0];
    if (nextSample) {
      setSelectedSampleId(nextSample.id);
      setSubmissionLabel(nextSample.title);
    }
  };

  const handleSampleChange = (value: string | string[]) => {
    const sampleId = Array.isArray(value) ? value[0] : value;
    if (!sampleId) return;

    const sample = getOcrSampleById(sampleId);
    setSelectedSampleId(sampleId);
    setSubmissionLabel(sample?.title ?? '');
    setError('');
  };

  const onUploadFile = async (file: File | null) => {
    if (!file) return;

    if (file.size <= 0) {
      setUploadState(null);
      setError('فایل انتخابی معتبر نیست.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadState(null);
      setError('فایل بیش از حد بزرگ است. یک فایل کوچک‌تر انتخاب کنید.');
      return;
    }

    const textLike = file.type.startsWith('text/') || /\.(txt|md|csv|json|xml|html|htm)$/i.test(file.name);
    const contentSnippet = textLike ? (await file.text()).slice(0, 1800) : '';

    setError('');
    setUploadState({
      fileName: file.name,
      fileType: file.type || file.name.split('.').pop() || 'application/octet-stream',
      fileSize: file.size,
      contentSnippet,
    });
    setSubmissionLabel(file.name);
  };

  const runSimulation = async (scenario: OcrTemplateScenario = 'recognize') => {
    const sourceType = uploadState ? 'upload' : 'sample';
    const sample = selectedSample;
    const sourceName = submissionLabel.trim() || uploadState?.fileName || sample?.fileName || '';

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
              }
            : {
                sourceType,
                templateId: sample?.id,
                scenario,
                sourceName,
                fileType: uploadState?.fileType,
                fileSize: uploadState?.fileSize,
                sampleText: uploadState?.contentSnippet,
              },
        ),
      });

      const payload = (await response.json().catch(() => null)) as { job?: OcrSimulationJob; message?: string } | null;
      if (!response.ok || !payload?.job) {
        throw new Error(payload?.message || 'ساخت job OCR انجام نشد.');
      }

      router.push(`/businesses/${businessId}/ai-tools/ocr/${payload.job.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'اجرای OCR شبیه‌سازی شده ناموفق بود.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="ocr-registration-page">
      <TemplatePreviewDialog sample={selectedSample} open={templateDialogOpen} onOpenChange={setTemplateDialogOpen} />

      <header className="ocr-registration-header">
        <div className="ocr-registration-heading">
          <TaavBadge tone="brand" variant="soft" iconStart={<ScanSearch className="h-3.5 w-3.5" />}>
            ثبت OCR جدید
          </TaavBadge>
          <h1 className="ocr-registration-title">ثبت تست OCR</h1>
          <p className="ocr-registration-subtitle">
            {business.name} · نوع سند را انتخاب کنید و اجرای شبیه‌سازی را شروع کنید.
          </p>
        </div>
        <Link href={`/businesses/${businessId}/ai-tools/ocr`}>
          <TaavButton variant="secondary" tone="neutral" iconStart={<ArrowLeft className="h-4 w-4" />}>
            بازگشت به تاریخچه
          </TaavButton>
        </Link>
      </header>

      <div className="ocr-registration-card">
        <div className="ocr-registration-lane-section">
          <TaavTabs value={activeLane} onValueChange={(value) => handleLaneChange(value as OcrSampleLane)}>
            <div className="ocr-registration-tabs-bar">
              <TaavTabsList variant="pill" size="sm" className="ocr-registration-tabs-list">
                <TaavTabsTrigger value="quick" variant="pill" size="sm">
                  <ScanSearch className="h-3.5 w-3.5" aria-hidden />
                  سریع
                </TaavTabsTrigger>
                <TaavTabsTrigger value="long" variant="pill" size="sm">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                  زمان‌بر
                </TaavTabsTrigger>
              </TaavTabsList>
            </div>
          </TaavTabs>

          <div className="ocr-registration-lane-body" role="tabpanel" aria-label="انتخاب نوع سند">
            <p className="ocr-registration-tab-hint">{LANE_HINTS[activeLane]}</p>
            <TaavChoiceChipGroup
              key={activeLane}
              ariaLabel={activeLane === 'quick' ? 'نوع سند سریع' : 'نوع سند زمان‌بر'}
              options={toChipOptions(laneSamples)}
              value={selectedSampleId}
              onValueChange={handleSampleChange}
              size="sm"
              tone="brand"
              gap="sm"
              wrap
            />
          </div>
        </div>

        <div className="ocr-registration-template-head">
          <div className="ocr-registration-template-copy">
            <div className="flex flex-wrap items-center gap-2">
              <TaavBadge tone="neutral" variant="soft">
                قالب انتخاب شده
              </TaavBadge>
              {selectedSample ? (
                <TaavBadge tone="brand" variant="soft">
                  {selectedSample.lane === 'quick' ? 'سریع' : 'زمان‌بر'}
                </TaavBadge>
              ) : null}
            </div>
            <h2 className="ocr-registration-template-title">{selectedSample?.title ?? 'بدون انتخاب'}</h2>
            <p className="ocr-registration-template-description">{selectedSample?.description ?? 'یک قالب را انتخاب کنید.'}</p>
          </div>
          <div className="ocr-registration-template-actions">
            <TaavButton
              variant="secondary"
              tone="neutral"
              iconStart={<Sparkles className="h-4 w-4" />}
              onClick={() => setTemplateDialogOpen(true)}
              disabled={!selectedSample}
            >
              مشاهده قالب
            </TaavButton>
          </div>
        </div>

        <div className="ocr-registration-meta">
          <TaavBadge tone="neutral" variant="soft">
            {sourceTitle}
          </TaavBadge>
          {selectedSample && !uploadState ? (
            <span className="ocr-registration-meta-copy">
              {formatConfidence(selectedSample.confidence)} دقت · {formatPageCount(selectedSample.pageCount)} صفحه
            </span>
          ) : null}
        </div>

        <div className="ocr-registration-compact-grid">
          <TaavFieldBlock label="عنوان سند" htmlFor="ocr-source-title">
            <TaavInput
              id="ocr-source-title"
              value={submissionLabel || uploadState?.fileName || selectedSample?.title || ''}
              onChange={(event) => setSubmissionLabel(event.target.value)}
              placeholder="مثلا: فاکتور فروش تیرماه"
            />
          </TaavFieldBlock>

          <div className="ocr-registration-upload">
            <div className="ocr-registration-upload-head">
              <span className="ocr-registration-upload-label">آپلود فایل (اختیاری)</span>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="ocr-registration-upload-btn">
                <FileUp className="h-3.5 w-3.5" />
                انتخاب فایل
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0] ?? null;
                await onUploadFile(file);
                event.target.value = '';
              }}
            />
            {uploadState ? (
              <div className="ocr-registration-upload-file">
                <strong>{uploadState.fileName}</strong>
                <span>
                  {uploadState.fileType} · {toReadableFileSize(uploadState.fileSize)}
                </span>
              </div>
            ) : (
              <p className="ocr-registration-upload-empty">در صورت نیاز می‌توانید فایل خودتان را جایگزین نمونه کنید.</p>
            )}
          </div>

          {showCardIdScenarios ? (
            <div className="ocr-registration-scenario-panel">
              <div className="ocr-registration-scenario-copy">
                <TaavBadge tone="brand" variant="soft">
                  سناریوی کارت ملی
                </TaavBadge>
                <p>
                  بعد از آپلود کارت ملی می‌توانید دو رفتار شبیه‌سازی را انتخاب کنید: تشخیص موفق یا تشخیص ناموفق.
                </p>
              </div>
              <div className="ocr-registration-scenario-buttons">
                <TaavButton
                  variant="secondary"
                  tone="neutral"
                  loading={submitting}
                  onClick={() => runSimulation('miss')}
                >
                  AI تشخیص ندهد
                </TaavButton>
                <TaavButton loading={submitting} onClick={() => runSimulation('recognize')}>
                  AI تشخیص بدهد
                </TaavButton>
              </div>
            </div>
          ) : null}
        </div>

        {error ? <div className="ocr-registration-error">{error}</div> : null}

        <div className="ocr-registration-actions">
          {!showCardIdScenarios ? (
            <TaavButton loading={submitting} onClick={() => runSimulation()} iconStart={<ScanSearch className="h-4 w-4" />}>
              شروع شبیه‌سازی OCR
            </TaavButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
