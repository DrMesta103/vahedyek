'use client';

import {
  TaavBadge,
  TaavButton,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import type { CategoryEditNode } from '@/app/lib/types/taavia-knowledge-base-manual-draft';

export function CategoryResourcesDialog({
  open,
  node,
  onOpenChange,
}: {
  open: boolean;
  node: CategoryEditNode | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent size="md" contentClassName="ai-lab-dialog" dir="rtl">
        <TaavDialogHeader>
          <TaavDialogTitle className="text-right text-lg font-black">منابع دسته‌بندی</TaavDialogTitle>
          <TaavDialogDescription className="mt-1.5 text-right text-xs">
            تب: {node?.title ?? '—'} · {node?.sourceCount.toLocaleString('fa-IR') ?? '۰'} منبع
          </TaavDialogDescription>
        </TaavDialogHeader>

        {node?.resources.length ? (
          <div className="mt-3 grid max-h-[min(50vh,420px)] gap-2 overflow-y-auto">
            {node.resources.map((resource) => (
              <article
                key={resource.snapshotId}
                className="rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-3 text-right"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="m-0 text-sm font-bold text-[var(--taav-text-strong)]">{resource.title}</h3>
                  <TaavBadge tone="neutral" variant="soft">
                    {resource.sourceTypeLabel}
                  </TaavBadge>
                </div>
                <dl className="mt-2 grid gap-1 text-[11px] text-[var(--taav-text-muted)]">
                  <div className="flex justify-between gap-2">
                    <dt>اسنپ‌شات</dt>
                    <dd dir="ltr">{resource.snapshotDate}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>نسخه</dt>
                    <dd>
                      <bdi>{resource.versionLabel}</bdi>
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 py-8 text-center text-sm text-[var(--taav-text-muted)]">منبعی برای این تب ثبت نشده است.</p>
        )}

        <TaavDialogFooter>
          <TaavButton size="sm" variant="secondary" onClick={() => onOpenChange(false)}>
            بستن
          </TaavButton>
        </TaavDialogFooter>
      </TaavDialogContent>
    </TaavDialog>
  );
}
