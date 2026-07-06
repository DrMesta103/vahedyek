'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import type { TestWorkspaceCounts } from '@/app/lib/types/taavia-test-workspace';
import {
  TaavButton,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';

type TestBuildKnowledgeBaseButtonProps = {
  counts: TestWorkspaceCounts;
  canBuild: boolean;
  previewLines: string[];
  categoryHints: string[];
  isBuilding: boolean;
  onBuild: () => Promise<void>;
  onError?: (message: string) => void;
};

export function TestBuildKnowledgeBaseButton({
  counts,
  canBuild,
  previewLines,
  categoryHints,
  isBuilding,
  onBuild,
  onError,
}: TestBuildKnowledgeBaseButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = () => {
    if (!canBuild) {
      onError?.('برای ساخت Knowledge Base، حداقل یک مورد اطلاعات وارد کن.');
      return;
    }
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    try {
      await onBuild();
      setDialogOpen(false);
    } catch {
      onError?.('ساخت Knowledge Base انجام نشد. دوباره تلاش کن.');
    }
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 md:p-6">
        <div className="pointer-events-auto w-full max-w-4xl">
          <button
            type="button"
            onClick={openDialog}
            disabled={isBuilding}
            className="group relative w-full overflow-hidden rounded-[24px] border border-[rgba(66,237,211,0.34)] px-5 py-4 shadow-[0_20px_60px_rgba(14,197,173,0.22)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(66,237,211,0.22)_0%,rgba(130,158,255,0.28)_45%,rgba(66,237,211,0.22)_100%)] bg-[length:200%_100%] [animation:taavia-agent-shimmer_4s_ease-in-out_infinite]" />
            <span className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-[rgba(255,255,255,0.18)]" />
            <span className="relative flex flex-wrap items-center justify-between gap-4 text-white">
              <span className="inline-flex items-center gap-2 text-[length:var(--taav-text-sm)] font-black">
                {isBuilding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                ساخت Knowledge Base
              </span>
              <span className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[rgba(255,255,255,0.88)]">
                <span className="rounded-full bg-black/20 px-2.5 py-1">{counts.brandItems} برند</span>
                <span className="rounded-full bg-black/20 px-2.5 py-1">{counts.productRows} محصول</span>
                <span className="rounded-full bg-black/20 px-2.5 py-1">{counts.faqItems} FAQ</span>
              </span>
            </span>
          </button>
        </div>
      </div>

      <TaavDialog open={dialogOpen} onOpenChange={(open) => (!isBuilding ? setDialogOpen(open) : undefined)}>
        <TaavDialogContent size="md" contentClassName="ai-lab-dialog">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
              پیش‌نمایش ساخت Knowledge Base
            </TaavDialogTitle>
            <TaavDialogDescription className="text-right text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
              قبل از ساخت نهایی، خلاصه داده‌ها و دسته‌های قابل ساخت را بررسی کن.
            </TaavDialogDescription>
          </TaavDialogHeader>

          <div className="grid gap-3 rounded-[18px] border border-white/10 bg-white/5 p-4 text-right">
            <div className="text-[13px] font-black text-white">خلاصه ورودی‌ها</div>
            <ul className="m-0 grid list-none gap-2 p-0 text-[12px] leading-7 text-[rgba(217,229,255,0.82)]">
              {previewLines.map((line) => (
                <li key={line} className="rounded-[12px] border border-white/8 bg-[rgba(8,16,31,0.55)] px-3 py-2">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {categoryHints.length > 0 ? (
            <div className="rounded-[18px] border border-[rgba(66,237,211,0.18)] bg-[rgba(66,237,211,0.06)] p-4 text-right">
              <div className="text-[12px] font-black text-[rgb(165,248,235)]">دسته‌های قابل ساخت</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {categoryHints.map((hint) => (
                  <span
                    key={hint}
                    className="rounded-full border border-[rgba(66,237,211,0.22)] bg-[rgba(66,237,211,0.10)] px-3 py-1 text-[11px] font-bold text-[rgb(150,246,231)]"
                  >
                    {hint}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <TaavDialogFooter>
            <TaavButton variant="secondary" tone="neutral" onClick={() => setDialogOpen(false)} disabled={isBuilding}>
              انصراف
            </TaavButton>
            <TaavButton onClick={() => void handleConfirm()} disabled={isBuilding}>
              {isBuilding ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال ساخت...
                </span>
              ) : (
                'تأیید و ساخت'
              )}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </>
  );
}
