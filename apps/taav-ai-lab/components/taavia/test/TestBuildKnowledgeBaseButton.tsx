'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
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
  canBuild: boolean;
  previewLines: string[];
  categoryHints: string[];
  isBuilding: boolean;
  hidden?: boolean;
  onBuild: () => Promise<void>;
  onError?: (message: string) => void;
};

export function TestBuildKnowledgeBaseButton({
  canBuild,
  previewLines,
  categoryHints,
  isBuilding,
  hidden = false,
  onBuild,
  onError,
}: TestBuildKnowledgeBaseButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = () => {
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

  if (hidden) return null;

  const disabled = isBuilding || !canBuild;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 md:p-6">
        <div className="pointer-events-auto w-full max-w-4xl">
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="group relative w-full overflow-hidden rounded-[24px] p-[2px] text-right transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[24px] bg-[conic-gradient(from_0deg,rgba(66,237,211,0.9),rgba(130,158,255,0.95),rgba(250,204,21,0.9),rgba(66,237,211,0.9))] [animation:taavia-kb-border-spin_3s_linear_infinite]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[24px] bg-[conic-gradient(from_180deg,rgba(66,237,211,0.55),rgba(130,158,255,0.65),rgba(250,204,21,0.55),rgba(66,237,211,0.55))] opacity-70 blur-[8px] [animation:taavia-kb-border-spin_3s_linear_infinite_reverse]"
            />

            <span className="relative flex items-center justify-center overflow-hidden rounded-[22px] bg-[linear-gradient(145deg,rgba(8,18,38,0.98)_0%,rgba(14,28,54,0.96)_55%,rgba(8,18,38,0.98)_100%)] px-5 py-4">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(66,237,211,0.18)_0%,rgba(130,158,255,0.32)_35%,rgba(250,204,21,0.22)_65%,rgba(66,237,211,0.18)_100%)] bg-[length:220%_100%] opacity-90 [animation:taavia-agent-shimmer_2.2s_ease-in-out_infinite]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 skew-x-[-18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)] [animation:taavia-kb-sweep_2.8s_ease-in-out_infinite]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[22px] [animation:taavia-kb-glow-pulse_2.4s_ease-in-out_infinite]"
              />

              <span className="relative z-10 inline-flex items-center gap-2 text-[length:var(--taav-text-sm)] font-black text-white">
                {isBuilding ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[rgb(150,246,231)]" />
                ) : (
                  <Sparkles className="h-5 w-5 text-[rgb(253,224,71)] [animation:taavia-kb-icon-float_2.2s_ease-in-out_infinite]" />
                )}
                ساخت Knowledge Base
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
