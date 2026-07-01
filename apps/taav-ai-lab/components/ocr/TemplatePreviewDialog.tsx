'use client';

import { useState } from 'react';
import { Check, Copy, Sparkles } from 'lucide-react';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';
import { TaavTabs, TaavTabsContent, TaavTabsList, TaavTabsTrigger } from '@repo/ui/taav/navigation';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav/overlays';
import type { OcrSampleDocument } from '@/app/lib/ocr-simulator-data';
import type { AiLabTooltipDef } from '@/app/lib/tooltips';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { OcrVisibleHelp } from '@/components/ocr/OcrVisibleHelp';

function TemplateJsonPanel({
  description,
  descriptionHelp,
  jsonPreview,
  copied,
  onCopy,
}: {
  description: string;
  descriptionHelp: AiLabTooltipDef | string;
  jsonPreview: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <p className="m-0 text-xs leading-6 text-[var(--taav-text-muted)]">{description}</p>
          <OcrVisibleHelp content={descriptionHelp} variant="compact" />
        </div>
        <div className="ocr-visible-action">
          <TaavButton
            size="sm"
            variant="secondary"
            tone="neutral"
            iconStart={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            onClick={onCopy}
          >
            {copied ? 'کپی شد' : 'کپی ساختار'}
          </TaavButton>
          <OcrVisibleHelp content={AI_LAB_TOOLTIPS.ocr.copyJson} variant="compact" />
        </div>
      </div>
      <pre className="ocr-flow-json-preview" dir="ltr">
        {jsonPreview}
      </pre>
    </div>
  );
}

export function TemplatePreviewDialog({
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
      <TaavDialogContent size="lg" contentClassName="ocr-flow-dialog">
        <div className="grid gap-4">
          <TaavDialogHeader className="ocr-flow-dialog-header">
            <div className="flex flex-wrap items-center gap-2">
              <TaavBadge tone="brand" variant="soft" iconStart={<Sparkles className="h-3.5 w-3.5" />}>
                قالب نویسه‌خوانی
              </TaavBadge>
              {sample ? (
                <TaavBadge tone="neutral" variant="soft">
                  {sample.lane === 'quick' ? 'سریع' : 'زمان‌بر'}
                </TaavBadge>
              ) : null}
            </div>
            <OcrVisibleHelp content={AI_LAB_TOOLTIPS.ocr.templatePreview} variant="compact" />
            <TaavDialogTitle>{sample?.title ?? 'قالب انتخاب نشده'}</TaavDialogTitle>
            <TaavDialogDescription>{sample?.description ?? 'ابتدا یک نوع سند انتخاب کنید.'}</TaavDialogDescription>
          </TaavDialogHeader>

          {sample ? (
            <>
              <div className="grid gap-1">
                <p className="ocr-flow-template-prompt">{sample.prompt}</p>
                <OcrVisibleHelp content={AI_LAB_TOOLTIPS.ocr.templatePrompt} variant="compact" />
              </div>
              <TaavTabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'input' | 'output')}>
                <div className="grid gap-1">
                  <TaavTabsList variant="pill" size="sm" className="w-full justify-start">
                    <TaavTabsTrigger value="input" variant="pill" size="sm">
                      ساختار ورودی
                    </TaavTabsTrigger>
                    <TaavTabsTrigger value="output" variant="pill" size="sm">
                      ساختار خروجی
                    </TaavTabsTrigger>
                  </TaavTabsList>
                  <OcrVisibleHelp
                    content={activeTab === 'input' ? AI_LAB_TOOLTIPS.ocr.jsonInputTab : AI_LAB_TOOLTIPS.ocr.jsonOutputTab}
                    variant="compact"
                  />
                </div>
                <TaavTabsContent value="input" className="mt-3">
                  <TemplateJsonPanel
                    description="ساختار ورودی که سامانه به هوش مصنوعی اسناد می‌فرستد."
                    descriptionHelp={AI_LAB_TOOLTIPS.ocr.jsonInputTab}
                    jsonPreview={inputJsonPreview}
                    copied={copiedSection === 'input'}
                    onCopy={() => handleCopy('input', inputJsonPreview)}
                  />
                </TaavTabsContent>
                <TaavTabsContent value="output" className="mt-3">
                  <TemplateJsonPanel
                    description="خروجی شبیه‌سازی‌شده با سطح اطمینان و اعتبارسنجی."
                    descriptionHelp={AI_LAB_TOOLTIPS.ocr.jsonOutputTab}
                    jsonPreview={outputJsonPreview}
                    copied={copiedSection === 'output'}
                    onCopy={() => handleCopy('output', outputJsonPreview)}
                  />
                </TaavTabsContent>
              </TaavTabs>
            </>
          ) : null}

          <TaavDialogFooter className="ocr-flow-dialog-footer">
            <TaavButton variant="secondary" tone="neutral" onClick={() => onOpenChange(false)}>
              بستن
            </TaavButton>
          </TaavDialogFooter>
        </div>
      </TaavDialogContent>
    </TaavDialog>
  );
}
