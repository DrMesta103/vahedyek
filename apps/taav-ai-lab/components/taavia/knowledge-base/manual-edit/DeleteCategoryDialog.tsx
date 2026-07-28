'use client';

import {
  TaavButton,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';

export function DeleteCategoryDialog({
  open,
  title,
  childCount,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  title: string;
  childCount: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
        <TaavDialogHeader>
          <TaavDialogTitle className="text-right text-lg font-black">حذف دسته‌بندی</TaavDialogTitle>
          <TaavDialogDescription className="mt-2 text-right text-sm leading-7">
            {childCount > 0
              ? `این دسته‌بندی دارای ${childCount.toLocaleString('fa-IR')} زیرمجموعه است. با ارسال به AI همه زیرمجموعه‌ها هم حذف می‌شوند.`
              : 'این دسته‌بندی به‌عنوان حذف‌شده علامت می‌خورد و تا ارسال به AI نسخه فعال تغییر نمی‌کند.'}
            <span className="mt-2 block text-[var(--taav-text-muted)]">مورد: {title}</span>
          </TaavDialogDescription>
        </TaavDialogHeader>
        <TaavDialogFooter>
          <TaavButton size="sm" variant="secondary" onClick={() => onOpenChange(false)}>
            انصراف
          </TaavButton>
          <TaavButton size="sm" tone="danger" onClick={onConfirm}>
            حذف
          </TaavButton>
        </TaavDialogFooter>
      </TaavDialogContent>
    </TaavDialog>
  );
}
