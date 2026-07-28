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

export function CreateCategoryDialog({
  open,
  mode,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: 'root' | 'child';
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string) => void;
}) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle('');
  }, [open]);

  const canSubmit = title.trim().length > 0;

  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
        <TaavDialogHeader>
          <TaavDialogTitle className="text-right text-lg font-black">
            {mode === 'root' ? 'ایجاد دسته‌بندی جدید' : 'افزودن زیر‌دسته'}
          </TaavDialogTitle>
          <TaavDialogDescription className="mt-1.5 text-right text-xs leading-6">
            فقط عنوان را وارد کنید. محتوا را بعداً در پنل ویرایش می‌نویسید.
          </TaavDialogDescription>
        </TaavDialogHeader>

        <div className="mt-3">
          <TaavFieldBlock label="عنوان" required>
            <TaavInput
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={mode === 'root' ? 'مثلاً معرفی برند' : 'مثلاً جزئیات ارسال'}
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
          <TaavButton
            size="sm"
            disabled={!canSubmit}
            onClick={() => onSubmit(title.trim())}
          >
            ایجاد
          </TaavButton>
        </TaavDialogFooter>
      </TaavDialogContent>
    </TaavDialog>
  );
}
