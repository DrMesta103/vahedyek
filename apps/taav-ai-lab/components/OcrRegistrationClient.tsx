'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, ScanSearch, Sparkles } from 'lucide-react';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';
import { TaavChoiceChipGroup, TaavFieldBlock, TaavInput } from '@repo/ui/taav/forms';
import { TaavTabs, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import {
  getOcrSampleById,
  getOcrSamplesByLane,
  type OcrSampleLane,
  type OcrTemplateScenario,
} from '@/app/lib/ocr-simulator-data';
import type { OcrSimulationJob, Tenant } from '@/app/lib/data';
import { OcrPageShell } from '@/components/ocr/OcrPageShell';
import { OcrSectionCard } from '@/components/ocr/OcrSectionCard';
import { OcrUploadZone, type OcrUploadFileState } from '@/components/ocr/OcrUploadZone';
import { TemplatePreviewDialog } from '@/components/ocr/TemplatePreviewDialog';
import { formatConfidence } from '@/components/ocr/utils';

type OcrRegistrationClientProps = {
  business: Tenant;
  businessId: string;
};

const QUICK_SAMPLES = getOcrSamplesByLane('quick');
const LONG_SAMPLES = getOcrSamplesByLane('long');

function toChipOptions(samples: ReturnType<typeof getOcrSamplesByLane>) {
  return samples.map((sample) => ({ value: sample.id, label: sample.title }));
}

function getDefaultSampleId(lane: OcrSampleLane) {
  return lane === 'quick' ? (QUICK_SAMPLES[0]?.id ?? '') : (LONG_SAMPLES[0]?.id ?? '');
}

function formatPageCount(pageCount: number) {
  return new Intl.NumberFormat('fa-IR').format(pageCount);
}

export function OcrRegistrationClient({ business, businessId }: OcrRegistrationClientProps) {
  const router = useRouter();
  const [activeLane, setActiveLane] = useState<OcrSampleLane>('quick');
  const [selectedSampleId, setSelectedSampleId] = useState<string>(getDefaultSampleId('quick'));
  const [uploadState, setUploadState] = useState<OcrUploadFileState | null>(null);
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
  const sourceTitle = submissionLabel.trim() || uploadState?.fileName || selectedSample?.title || 'بدون عنوان';

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

  const validateForm = () => {
    if (!selectedSample) {
      setError('لطفاً یک نوع سند انتخاب کنید.');
      return false;
    }
    if (!sourceTitle.trim() || sourceTitle === 'بدون عنوان') {
      setError('عنوان سند را وارد کنید.');
      return false;
    }
    setError('');
    return true;
  };

  const runSimulation = async (scenario: OcrTemplateScenario = 'recognize') => {
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
        throw new Error(payload?.message || 'ساخت کار نویسه‌خوانی انجام نشد.');
      }

      router.push(`/businesses/${businessId}/ai-tools/ocr/${payload.job.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'اجرای شبیه‌سازی نویسه‌خوانی ناموفق بود.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OcrPageShell
      eyebrow="ثبت کار جدید"
      title="ثبت تست نویسه‌خوانی"
      description={`${business.name} · نوع سند را انتخاب کنید، عنوان را تنظیم کنید و در صورت نیاز فایل آپلود کنید`}
      actions={
        <Link href={`/businesses/${businessId}/ai-tools/ocr`}>
          <TaavButton variant="secondary" tone="neutral" iconStart={<ArrowLeft className="h-4 w-4" />}>
            بازگشت به تاریخچه
          </TaavButton>
        </Link>
      }
    >
      <TemplatePreviewDialog sample={selectedSample} open={templateDialogOpen} onOpenChange={setTemplateDialogOpen} />

      <OcrSectionCard title="فرم ثبت کار">
        <div className="ocr-flow-form-layout">
          <div className="ocr-flow-field-group">
            <span className="ocr-flow-field-label">مسیر اجرا</span>
            <TaavTabs value={activeLane} onValueChange={(value) => handleLaneChange(value as OcrSampleLane)}>
              <TaavTabsList variant="pill" size="sm">
                <TaavTabsTrigger value="quick" variant="pill" size="sm">
                  <ScanSearch className="h-3.5 w-3.5" aria-hidden />
                  سریع
                </TaavTabsTrigger>
                <TaavTabsTrigger value="long" variant="pill" size="sm">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                  زمان‌بر
                </TaavTabsTrigger>
              </TaavTabsList>
            </TaavTabs>
            <p className="ocr-flow-field-hint">
              {activeLane === 'quick'
                ? 'نمونه‌های تک‌صفحه‌ای: فاکتور، کارت ملی، رسید'
                : 'سند چندصفحه‌ای: قرارداد واحد'}
            </p>
          </div>

          <div className="ocr-flow-field-group">
            <span className="ocr-flow-field-label">نوع سند</span>
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

          {selectedSample ? (
            <div className="ocr-flow-template-card">
              <div className="ocr-flow-template-card-main">
                <div className="ocr-flow-template-card-title">
                  <strong>{selectedSample.title}</strong>
                  <TaavBadge tone="brand" variant="soft" size="sm">
                    {selectedSample.lane === 'quick' ? 'سریع' : 'زمان‌بر'}
                  </TaavBadge>
                </div>
                <p>{selectedSample.description}</p>
                <span className="ocr-flow-template-meta">
                  {formatConfidence(selectedSample.confidence)} دقت · {formatPageCount(selectedSample.pageCount)} صفحه
                </span>
              </div>
              <TaavButton
                size="sm"
                variant="secondary"
                tone="neutral"
                iconStart={<Sparkles className="h-4 w-4" />}
                onClick={() => setTemplateDialogOpen(true)}
              >
                مشاهده قالب
              </TaavButton>
            </div>
          ) : null}

          <div className="ocr-flow-form-divider" aria-hidden />

          <TaavFieldBlock label="عنوان سند" required htmlFor="ocr-source-title">
            <TaavInput
              id="ocr-source-title"
              value={submissionLabel || uploadState?.fileName || selectedSample?.title || ''}
              onChange={(event) => setSubmissionLabel(event.target.value)}
              placeholder="مثلا: فاکتور فروش تیرماه"
            />
          </TaavFieldBlock>

          <OcrUploadZone
            compact
            value={uploadState}
            onChange={(file) => {
              setUploadState(file);
              if (file) setSubmissionLabel(file.fileName);
            }}
            onError={setError}
            disabled={submitting}
          />

          {showCardIdScenarios ? (
            <div className="ocr-flow-scenario-panel ocr-flow-scenario-panel--compact">
              <p className="ocr-flow-scenario-lead">سناریوی کارت ملی · رفتار تشخیص را انتخاب کنید</p>
              <div className="ocr-flow-scenario-actions">
                <TaavButton variant="secondary" tone="neutral" loading={submitting} onClick={() => runSimulation('miss')}>
                  تشخیص ندهد
                </TaavButton>
                <TaavButton loading={submitting} onClick={() => runSimulation('recognize')}>
                  تشخیص بدهد
                </TaavButton>
              </div>
            </div>
          ) : (
            <div className="ocr-flow-form-footer">
              <TaavButton loading={submitting} onClick={() => runSimulation()} iconStart={<CheckCircle2 className="h-4 w-4" />}>
                شروع شبیه‌سازی
              </TaavButton>
            </div>
          )}

          {error ? <div className="ocr-flow-error">{error}</div> : null}
        </div>
      </OcrSectionCard>
    </OcrPageShell>
  );
}
