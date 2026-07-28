'use client';

import { Loader2, RotateCcw, Send } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav';

export function CategoryAiSyncActionBar({
  editedCount,
  sending,
  onSendToAi,
  onReset,
}: {
  editedCount: number;
  sending: boolean;
  onSendToAi: () => void;
  onReset: () => void;
}) {
  return (
    <div className="sticky bottom-3 z-20 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-400/35 bg-[color-mix(in_srgb,var(--taav-surface)_92%,#0b1220)] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <p className="m-0 text-sm font-bold text-sky-100">
          <span className="tabular-nums">{editedCount.toLocaleString('fa-IR')}</span> دسته‌بندی ویرایش‌شده در انتظار ارسال به AI
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <TaavButton
            size="sm"
            tone="danger"
            variant="ghost"
            disabled={sending}
            onClick={onReset}
            iconStart={<RotateCcw className="h-4 w-4" />}
          >
            بازگشت به اصل دسته‌بندی‌ها
          </TaavButton>
          <TaavButton
            size="sm"
            disabled={sending}
            onClick={onSendToAi}
            iconStart={sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          >
            {sending ? 'در حال ارسال…' : 'ارسال دسته‌بندی‌ها به AI'}
          </TaavButton>
        </div>
      </div>
    </div>
  );
}
