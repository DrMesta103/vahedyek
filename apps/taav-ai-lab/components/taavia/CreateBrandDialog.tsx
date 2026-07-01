'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Bot, Camera, X } from 'lucide-react';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import { TaavFieldBlock, TaavInput, TaavTextarea } from '@repo/ui/taav/forms';
import { TaavButton } from '@repo/ui/taav/primitives';
import type { TaaviaBrand } from '@/app/lib/data';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabLabelWithTooltip } from '@/components/AiLabTooltip';

type BrandDialogMode = 'create' | 'edit';

type BrandDialogSeed = Pick<TaaviaBrand, 'id' | 'name' | 'intake'>;

type CreateBrandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  onSaved: (brandId: string) => void;
  mode?: BrandDialogMode;
  initialBrand?: BrandDialogSeed | null;
};

export function CreateBrandDialog({
  open,
  onOpenChange,
  tenantId,
  onSaved,
  mode = 'create',
  initialBrand = null,
}: CreateBrandDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditMode = mode === 'edit';
  const [name, setName] = useState(initialBrand?.name ?? '');
  const [description, setDescription] = useState(initialBrand?.intake?.description ?? '');
  const [iconName, setIconName] = useState(initialBrand?.intake?.iconName ?? '');
  const [iconDataUrl, setIconDataUrl] = useState(initialBrand?.intake?.iconDataUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialBrand?.name ?? '');
      setDescription(initialBrand?.intake?.description ?? '');
      setIconName(initialBrand?.intake?.iconName ?? '');
      setIconDataUrl(initialBrand?.intake?.iconDataUrl ?? '');
      setError(null);
      setLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }

    return () => {
      if (iconDataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(iconDataUrl);
      }
    };
  }, [iconDataUrl, initialBrand, open]);

  const reset = () => {
    setName(initialBrand?.name ?? '');
    setDescription(initialBrand?.intake?.description ?? '');
    setIconName(initialBrand?.intake?.iconName ?? '');
    setIconDataUrl(initialBrand?.intake?.iconDataUrl ?? '');
    setError(null);
    setLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const resetIcon = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIconName('');
    setIconDataUrl('');
  };

  const handleIconPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('فقط فایل تصویری برای آیکون قابل قبول است.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      setIconName(file.name);
      setIconDataUrl(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => {
      setError('خواندن تصویر آیکون انجام نشد.');
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('نام برند الزامی است.');
      return;
    }

    if (isEditMode && !initialBrand?.id) {
      setError('شناسه برند برای ویرایش یافت نشد.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        isEditMode ? `/api/businesses/${tenantId}/taavia/brands/${initialBrand.id}` : `/api/businesses/${tenantId}/taavia/brands`,
        {
          method: isEditMode ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmed,
            intake: {
              description,
              iconName,
              iconDataUrl,
            },
          }),
        },
      );
      const payload = (await response.json().catch(() => null)) as { brand?: { id: string }; message?: string } | null;

      if (!response.ok || !payload?.brand?.id) {
        setError(payload?.message ?? (isEditMode ? 'ویرایش برند انجام نشد.' : 'ایجاد برند انجام نشد.'));
        setLoading(false);
        return;
      }

      reset();
      onOpenChange(false);
      onSaved(payload.brand.id);
    } catch {
      setError('خطا در ارتباط با سرور.');
      setLoading(false);
    }
  };

  return (
    <TaavDialog open={open} onOpenChange={handleOpenChange}>
      <TaavDialogContent size="sm" contentClassName="ai-lab-dialog">
        <TaavDialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--taav-radius-lg)] bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]">
              <Bot className="h-6 w-6" />
            </div>
            <div className="grid gap-1">
              <TaavDialogTitle className="text-right text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
                {isEditMode ? 'ویرایش برند' : 'ایجاد برند جدید'}
              </TaavDialogTitle>
              <TaavDialogDescription className="text-right text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
                {isEditMode ? 'اطلاعات برند را ویرایش کنید.' : 'اطلاعات پایه‌ای برند را وارد کنید.'}
              </TaavDialogDescription>
            </div>
          </div>
        </TaavDialogHeader>

        <div className="grid gap-4">
          <div className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-subtle)] p-4">
            <div className="grid gap-4">
              <TaavFieldBlock label="آپلود آیکون" htmlFor="taavia-brand-icon">
                <div className="grid justify-items-center gap-3">
                  <input
                    ref={fileInputRef}
                    id="taavia-brand-icon"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={loading}
                    onChange={handleIconPick}
                  />

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="flex h-[190px] w-[190px] items-center justify-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.08)] bg-[#d6dae7] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition hover:scale-[1.01] disabled:cursor-not-allowed"
                      aria-label={isEditMode ? 'تغییر آیکون برند' : 'انتخاب آیکون برند'}
                    >
                      {iconDataUrl ? (
                        <img src={iconDataUrl} alt="پیش‌نمایش آیکون انتخاب‌شده" className="h-full w-full object-cover" />
                      ) : (
                        <Bot className="h-14 w-14 text-white/85" strokeWidth={1.8} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="absolute bottom-2 left-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--taav-brand)] text-white shadow-[0_12px_24px_rgba(13,148,136,0.28)] transition hover:scale-105 disabled:cursor-not-allowed"
                      aria-label={isEditMode ? 'تغییر آیکون برند' : 'آپلود آیکون برند'}
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>

                  {iconDataUrl ? (
                    <div className="flex justify-center">
                      <TaavButton
                        type="button"
                        variant="ghost"
                        tone="neutral"
                        iconStart={<X className="h-4 w-4" />}
                        onClick={resetIcon}
                        disabled={loading}
                      >
                        حذف آیکون
                      </TaavButton>
                    </div>
                  ) : null}
                </div>
              </TaavFieldBlock>

              <TaavFieldBlock
                label={<AiLabLabelWithTooltip label="نام برند" tooltip={AI_LAB_TOOLTIPS.forms.brandName} required />}
                required
                htmlFor="taavia-brand-name"
              >
                <TaavInput
                  id="taavia-brand-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={loading}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void handleSubmit();
                  }}
                />
              </TaavFieldBlock>

              <TaavFieldBlock label="توضیحات" htmlFor="taavia-brand-description">
                <TaavTextarea
                  id="taavia-brand-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={loading}
                  rows={4}
                  placeholder="توضیح کوتاهی درباره برند بنویسید"
                />
              </TaavFieldBlock>

              {error ? <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{error}</p> : null}
            </div>
          </div>
        </div>

        <TaavDialogFooter>
          <TaavButton variant="secondary" onClick={() => handleOpenChange(false)} disabled={loading}>
            انصراف
          </TaavButton>
          <TaavButton onClick={() => void handleSubmit()} disabled={loading || !name.trim()}>
            {loading ? (isEditMode ? 'در حال ثبت...' : 'در حال ایجاد...') : isEditMode ? 'ثبت تغییرات' : 'ایجاد برند'}
          </TaavButton>
        </TaavDialogFooter>
      </TaavDialogContent>
    </TaavDialog>
  );
}
