'use client';

import { Bot, ChevronLeft, FolderOpen, Sparkles, X } from 'lucide-react';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';

type BuildKnowledgeBaseMethodDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandName: string;
  onSelectManual: () => void;
};

export function BuildKnowledgeBaseMethodDialog({
  open,
  onOpenChange,
  brandName,
  onSelectManual,
}: BuildKnowledgeBaseMethodDialogProps) {
  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent size="md" contentClassName="ai-lab-dialog" dir="rtl">
        <TaavDialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-right">
              <TaavDialogTitle className="text-right text-lg font-black">
                ساخت نالج‌بیس برای «{brandName}»
              </TaavDialogTitle>
              <TaavDialogDescription className="mt-2 text-right text-sm leading-7">
                دو روش برای ساخت نالج‌بیس وجود دارد. فعلاً فقط مسیر ورود منابع فعال است.
              </TaavDialogDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="بستن"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--taav-text-muted)] transition hover:bg-white/5 hover:text-[var(--taav-text-strong)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </TaavDialogHeader>

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <article
            aria-disabled="true"
            className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 opacity-55"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(61,233,208,0.12)_0%,transparent_55%)]" aria-hidden />
            <div className="relative flex items-start justify-between gap-2">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 bg-white/8 text-cyan-200">
                <Bot className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-[var(--taav-text-muted)]">
                به‌زودی
                <Sparkles className="h-3 w-3" />
              </span>
            </div>
            <div className="relative grid gap-2 text-right">
              <h3 className="m-0 text-base font-black text-[var(--taav-text-strong)]">چت با دستیار هوش مصنوعی</h3>
              <p className="m-0 text-xs leading-6 text-[var(--taav-text-muted)]">
                با گفتگو با دستیار هوشمند، محتوای برند را آماده کنید و نالج‌بیس بسازید.
              </p>
            </div>
            <div className="relative mt-auto inline-flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2.5 text-xs font-bold text-[var(--taav-text-muted)]">
              <span>غیرفعال</span>
              <ChevronLeft className="h-4 w-4" />
            </div>
          </article>

          <button
            type="button"
            onClick={onSelectManual}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-cyan-400/40 bg-cyan-500/[0.08] p-4 text-right transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-cyan-500/[0.14] hover:shadow-[0_12px_40px_rgba(34,211,238,0.12)]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.18)_0%,transparent_55%)]" aria-hidden />
            <div className="relative flex items-start justify-between gap-2">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/15 text-cyan-200">
                <FolderOpen className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-bold text-cyan-200">
                فعال
              </span>
            </div>
            <div className="relative grid gap-2">
              <h3 className="m-0 text-base font-black text-[var(--taav-text-strong)]">ورود منابع به‌صورت دستی</h3>
              <p className="m-0 text-xs leading-6 text-[var(--taav-text-muted)]">
                معرفی برند، محصولات، FAQ و فایل‌ها را وارد کنید و سپس نالج‌بیس را بسازید.
              </p>
            </div>
            <div className="relative mt-auto inline-flex items-center justify-between rounded-xl border border-cyan-400/25 bg-cyan-950/30 px-3 py-2.5 text-xs font-bold text-cyan-100">
              <span>ادامه با منابع</span>
              <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            </div>
          </button>
        </div>
      </TaavDialogContent>
    </TaavDialog>
  );
}
