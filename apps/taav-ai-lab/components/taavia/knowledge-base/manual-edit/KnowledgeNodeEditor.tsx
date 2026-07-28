'use client';

import { FileText, Lock, LockOpen } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav';
import { TaavFieldBlock, TaavTextarea } from '@repo/ui/taav/forms';
import type { CategoryEditNode } from '@/app/lib/types/taavia-knowledge-base-manual-draft';

export function KnowledgeNodeEditor({
  node,
  onContentChange,
  onRequestUnlock,
}: {
  node: CategoryEditNode;
  onContentChange: (content: string) => void;
  onRequestUnlock: () => void;
}) {
  const locked = !node.unlocked;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--taav-border-subtle)] pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--taav-surface-soft)] text-[var(--taav-brand-strong)]">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className={`m-0 truncate text-base font-black text-[var(--taav-text-strong)] ${node.isPendingDeletion ? 'line-through opacity-60' : ''}`}>
              {node.title}
            </h2>
            <p className="m-0 mt-0.5 text-[11px] text-[var(--taav-text-muted)]">
              {node.level === 1 ? 'دسته‌بندی سطح یک' : 'زیر‌دسته / محتوا'}
              {locked ? ' · قفل‌شده' : ' · قابل ویرایش'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {node.isEdited ? (
            <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-100">
              در انتظار ارسال
            </span>
          ) : null}
          {!node.isEdited && node.isManualVsAi ? (
            <span
              className="rounded-full border border-violet-400/40 bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-bold text-violet-100"
              title="این دسته نسبت به خروجی ساخت AI به‌صورت دستی ویرایش شده است"
            >
              ویرایش دستی نسبت به AI
            </span>
          ) : null}
          <TaavButton
            size="sm"
            variant="secondary"
            onClick={onRequestUnlock}
            iconStart={locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
          >
            {locked ? 'باز کردن قفل' : 'قفل باز است'}
          </TaavButton>
        </div>
      </div>

      {locked ? (
        <div className="grid flex-1 gap-4 pt-4">
          <article className="whitespace-pre-wrap rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-4 text-sm leading-8 text-[var(--taav-text-body)]">
            {node.content || 'برای این دسته‌بندی محتوای متنی ثبت نشده است.'}
          </article>
          <p className="m-0 text-center text-xs text-[var(--taav-text-muted)]">
            برای ویرایش محتوا، ابتدا قفل این دسته را باز کنید.
          </p>
        </div>
      ) : (
        <div className="grid flex-1 gap-4 pt-4">
          <TaavFieldBlock label="محتوا">
            <TaavTextarea
              value={node.content}
              onChange={(event) => onContentChange(event.target.value)}
              rows={14}
              disabled={node.isPendingDeletion}
              placeholder="متن این دسته‌بندی…"
            />
          </TaavFieldBlock>
        </div>
      )}
    </div>
  );
}
