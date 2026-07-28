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

export function ResetCategoriesDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
        <TaavDialogHeader>
          <TaavDialogTitle className="text-right text-lg font-black">بازگشت به اصل دسته‌بندی‌ها</TaavDialogTitle>
          <TaavDialogDescription className="mt-2 text-right text-sm leading-7">
            تمام تغییرات دستی ارسال‌نشده حذف می‌شوند و ساختار دقیقاً به نسخه فعال بازمی‌گردد.
            <span className="mt-2 block font-bold text-rose-300">این عملیات قابل بازگشت نیست.</span>
          </TaavDialogDescription>
        </TaavDialogHeader>
        <TaavDialogFooter>
          <TaavButton size="sm" variant="secondary" onClick={() => onOpenChange(false)}>
            انصراف
          </TaavButton>
          <TaavButton size="sm" tone="danger" onClick={onConfirm}>
            بازگشت به اصل
          </TaavButton>
        </TaavDialogFooter>
      </TaavDialogContent>
    </TaavDialog>
  );
}
