'use client';

import { useEffect, useState } from 'react';
import {
  TaavButton,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import { TaavFieldBlock, TaavInput } from '@repo/ui/taav/forms';

export function RenameCategoryDialog({
  open,
  initialTitle,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  initialTitle: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string) => void;
}) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle);
  }, [open, initialTitle]);

  const canSubmit = title.trim().length > 0 && title.trim() !== initialTitle;

  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
        <TaavDialogHeader>
          <TaavDialogTitle className="text-right text-lg font-black">تغییر عنوان</TaavDialogTitle>
          <TaavDialogDescription className="mt-1.5 text-right text-xs leading-6">
            عنوان این تب/دسته‌بندی را ویرایش کنید.
          </TaavDialogDescription>
        </TaavDialogHeader>
        <div className="mt-3">
          <TaavFieldBlock label="عنوان" required>
            <TaavInput
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter' && canSubmit) {
                  event.preventDefault();
                  onSubmit(title.trim());
                }
              }}
            />
          </TaavFieldBlock>
        </div>
        <TaavDialogFooter>
          <TaavButton size="sm" variant="secondary" onClick={() => onOpenChange(false)}>
            انصراف
          </TaavButton>
          <TaavButton size="sm" disabled={!canSubmit} onClick={() => onSubmit(title.trim())}>
            ذخیره عنوان
          </TaavButton>
        </TaavDialogFooter>
      </TaavDialogContent>
    </TaavDialog>
  );
}
