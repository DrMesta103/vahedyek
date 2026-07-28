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
import Link from 'next/link';

export function UnlockCategoryEditDialog({
  open,
  sourcesHref,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  sourcesHref: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
        <TaavDialogHeader>
          <TaavDialogTitle className="text-right text-lg font-black">ویرایش دستی دسته‌بندی</TaavDialogTitle>
          <TaavDialogDescription className="mt-2 text-right text-sm leading-7">
            بهتر است به‌جای تغییر دستی در نالج‌بیس، از{' '}
            <Link href={sourcesHref} className="font-bold text-sky-300 underline-offset-2 hover:underline">
              فلو منابع
            </Link>{' '}
            یک تسک یا فایل اضافه کنید و دوباره بیلد یا ریبلد کنید تا این تغییر در نسخه‌های آینده هم باقی بماند.
            <span className="mt-2 block text-[var(--taav-text-muted)]">
              ویرایش دستی فقط روی همین نسخه اعمال می‌شود و تا ارسال به AI در بیلدهای بعدی در نظر گرفته نمی‌شود.
            </span>
          </TaavDialogDescription>
        </TaavDialogHeader>
        <TaavDialogFooter>
          <TaavButton size="sm" variant="secondary" onClick={() => onOpenChange(false)}>
            انصراف
          </TaavButton>
          <TaavButton size="sm" onClick={onConfirm}>
            ادامه و باز کردن قفل
          </TaavButton>
        </TaavDialogFooter>
      </TaavDialogContent>
    </TaavDialog>
  );
}
