'use client';

import { useMemo, useState } from 'react';
import { Database, Loader2 } from 'lucide-react';
import type {
  BrandSectionTab,
  FaqItem,
  KnowledgeBaseCategorySummary,
  ProductCatalogSnapshot,
  WorkspaceContentMessage,
  WorkspaceSectionStatus,
} from '@/app/lib/types/taavia-workspace';
import {
  buildKnowledgeBaseCategorySummaries,
  buildTransferPreviewLines,
} from '@/app/lib/taavia-workspace-knowledge';
import {
  deriveCategoriesFromAllSources,
  mergeKnowledgeBaseSections,
} from '@/app/lib/taavia-workspace-categorization';
import {
  TaavButton,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';

type WorkspaceTransferPanelProps = {
  canTransfer: boolean;
  sectionStatuses: WorkspaceSectionStatus[];
  brandMessages: WorkspaceContentMessage[];
  productMessages: WorkspaceContentMessage[];
  faqMessages: WorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: FaqItem[];
  existingKnowledgeBaseSections: BrandSectionTab[];
  onTransferComplete: (sections: BrandSectionTab[], syncedAt: string) => void;
  onPersist?: (sections: BrandSectionTab[], syncedAt: string) => Promise<void>;
  onError?: (message: string) => void;
};

export function WorkspaceTransferPanel({
  canTransfer,
  sectionStatuses,
  brandMessages,
  productMessages,
  faqMessages,
  productCatalog,
  faqItems,
  existingKnowledgeBaseSections,
  onTransferComplete,
  onPersist,
  onError,
}: WorkspaceTransferPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const previewSections = useMemo(
    () =>
      deriveCategoriesFromAllSources(
        brandMessages,
        productCatalog,
        faqItems,
        productMessages,
        faqMessages,
      ),
    [brandMessages, productCatalog, faqItems, productMessages, faqMessages],
  );

  const categorySummaries: KnowledgeBaseCategorySummary[] = useMemo(
    () => buildKnowledgeBaseCategorySummaries(previewSections),
    [previewSections],
  );

  const previewLines = useMemo(
    () => buildTransferPreviewLines({ sectionStatuses, categorySummaries }),
    [sectionStatuses, categorySummaries],
  );

  const hasExistingKnowledgeBase = existingKnowledgeBaseSections.length > 0;

  const openDialog = () => {
    if (!canTransfer) {
      onError?.('برای انتقال به نالج‌بیس، حداقل یک مورد اطلاعات وارد کن.');
      return;
    }
    setSuccessMessage(null);
    setDialogOpen(true);
  };

  const handleTransfer = async () => {
    if (!canTransfer || previewSections.length === 0) {
      onError?.('برای انتقال به نالج‌بیس، حداقل یک مورد اطلاعات وارد کن.');
      setDialogOpen(false);
      return;
    }

    setIsTransferring(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mergedSections = mergeKnowledgeBaseSections(existingKnowledgeBaseSections, previewSections);
      const syncedAt = new Date().toISOString();

      if (onPersist) {
        await onPersist(mergedSections, syncedAt);
      }

      onTransferComplete(mergedSections, syncedAt);
      setSuccessMessage(
        hasExistingKnowledgeBase
          ? `اطلاعات جدید به نالج‌بیس اضافه شد (${new Intl.NumberFormat('fa-IR').format(previewSections.length)} دسته جدید).`
          : `نالج‌بیس با ${new Intl.NumberFormat('fa-IR').format(mergedSections.length)} دسته ساخته شد.`,
      );
      setDialogOpen(false);
    } catch {
      onError?.('انتقال به نالج‌بیس انجام نشد. دوباره تلاش کن.');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <>
      <div className="sticky bottom-3 z-[2] mt-5 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,19,38,0.96)_0%,rgba(8,15,30,0.94)_100%)] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl md:bottom-5 md:p-5">
        {successMessage ? (
          <div className="mb-3 rounded-[16px] border border-[rgba(66,237,211,0.22)] bg-[rgba(66,237,211,0.10)] px-4 py-3 text-[12px] font-semibold text-[rgb(165,248,235)]">
            {successMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={openDialog}
            disabled={isTransferring}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(130,158,255,0.34)] bg-[rgba(130,158,255,0.16)] px-5 py-3 text-[length:var(--taav-text-sm)] font-black text-[rgb(199,210,254)] transition hover:bg-[rgba(130,158,255,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isTransferring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            انتقال به نالج‌بیس
          </button>

          <div className="text-right">
            <div className="text-[13px] font-black text-white">آماده انتقال اطلاعات</div>
            <p className="mt-1 mb-0 max-w-xl text-[12px] leading-6 text-[rgba(217,229,255,0.68)]">
              قبل از انتقال، خلاصه بخش‌های دارای داده را می‌بینی. دسته‌های خالی ساخته نمی‌شوند.
            </p>
          </div>
        </div>
      </div>

      <TaavDialog open={dialogOpen} onOpenChange={(open) => (!isTransferring ? setDialogOpen(open) : undefined)}>
        <TaavDialogContent size="md" contentClassName="ai-lab-dialog">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
              پیش‌نمایش انتقال به نالج‌بیس
            </TaavDialogTitle>
            <TaavDialogDescription className="text-right text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
              {hasExistingKnowledgeBase
                ? 'نالج‌بیس قبلی وجود دارد. دسته‌های جدید بدون تکرار عنوان، به ساختار فعلی اضافه می‌شوند.'
                : 'بر اساس داده‌های واردشده، دسته‌بندی زیر ساخته و به نالج‌بیس منتقل می‌شود.'}
            </TaavDialogDescription>
          </TaavDialogHeader>

          <div className="grid gap-3 rounded-[18px] border border-white/10 bg-white/5 p-4 text-right">
            <div className="text-[13px] font-black text-white">خلاصه داده‌های واردشده</div>
            <ul className="m-0 grid list-none gap-2 p-0 text-[12px] leading-7 text-[rgba(217,229,255,0.82)]">
              {previewLines.map((line) => (
                <li key={line} className="rounded-[12px] border border-white/8 bg-[rgba(8,16,31,0.55)] px-3 py-2">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {previewSections.length > 0 ? (
            <div className="grid max-h-56 gap-2 overflow-y-auto rounded-[18px] border border-[rgba(66,237,211,0.18)] bg-[rgba(66,237,211,0.06)] p-4 text-right">
              <div className="text-[12px] font-black text-[rgb(165,248,235)]">
                {new Intl.NumberFormat('fa-IR').format(previewSections.filter((s) => s.parentId === null).length)} دسته
                اصلی ساخته می‌شود
              </div>
              {previewSections
                .filter((section) => section.parentId === null)
                .map((section) => (
                  <div key={section.id} className="text-[12px] font-semibold text-white">
                    • {section.title}
                  </div>
                ))}
            </div>
          ) : null}

          <TaavDialogFooter>
            <TaavButton variant="secondary" tone="neutral" onClick={() => setDialogOpen(false)} disabled={isTransferring}>
              انصراف
            </TaavButton>
            <TaavButton onClick={() => void handleTransfer()} disabled={isTransferring || previewSections.length === 0}>
              {isTransferring ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال انتقال...
                </span>
              ) : (
                'تایید و انتقال'
              )}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </>
  );
}
