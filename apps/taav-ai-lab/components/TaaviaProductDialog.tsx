'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Bot, Camera, Upload, X } from 'lucide-react';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import { TaavFieldBlock, TaavInput, TaavTextarea } from '@repo/ui/taav/forms';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';

type TaaviaProductDialogProps = {
  businessId: string;
};

type BrandIntakeState = {
  name: string;
  description: string;
  iconName: string;
  iconDataUrl: string;
};

const DEFAULT_INTAKE: BrandIntakeState = {
  name: '',
  description: '',
  iconName: '',
  iconDataUrl: '',
};

export function TaaviaProductDialog({ businessId }: TaaviaProductDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<BrandIntakeState>(DEFAULT_INTAKE);

  useEffect(() => {
    return () => {
      if (form.iconDataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(form.iconDataUrl);
      }
    };
  }, [form.iconDataUrl]);

  const reset = () => {
    setForm(DEFAULT_INTAKE);
    setError(null);
    setLoading(false);
  };

  const closeDialog = () => {
    reset();
    setOpen(false);
  };

  const resetIcon = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setForm((current) => ({ ...current, iconName: '', iconDataUrl: '' }));
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
      setForm((current) => ({
        ...current,
        iconName: file.name,
        iconDataUrl: typeof reader.result === 'string' ? reader.result : '',
      }));
    };
    reader.onerror = () => {
      setError('خواندن تصویر آیکون انجام نشد.');
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const name = form.name.trim();

    if (!name) {
      setError('نام برند الزامی است.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/businesses/${businessId}/taavia/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          intake: {
            description: form.description,
            iconName: form.iconName,
            iconDataUrl: form.iconDataUrl,
          },
        }),
      });

      const payload = (await response.json().catch(() => null)) as { brand?: { id: string }; message?: string } | null;

      if (!response.ok || !payload?.brand?.id) {
        setError(payload?.message ?? 'ایجاد برند انجام نشد.');
        setLoading(false);
        return;
      }

      const brandId = payload.brand.id;
      reset();
      setOpen(false);
      router.push(`/businesses/${businessId}/products/taavia/brands/${brandId}`);
      router.refresh();
    } catch {
      setError('خطا در ارتباط با سرور.');
      setLoading(false);
    }
  };

  return (
    <>
      <TaavCard
        variant="outlined"
        padding="md"
        radius="xl"
        interactive
        role="button"
        tabIndex={0}
        aria-label="باز کردن جزئیات تاویا"
        wrapperClassName="cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[var(--taav-radius-lg)] bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]">
              <Bot className="h-5 w-5" />
            </div>
            <TaavBadge tone="brand" variant="soft">
              فعال
            </TaavBadge>
          </div>

          <div className="grid gap-2">
            <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">تاویا</h2>
            <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
              دستیار هوشمند برای جمع‌آوری داده‌های موردنیاز برند و ساخت خودکار برند در ادامه.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-subtle)] px-4 py-3 text-[length:var(--taav-text-sm)] font-semibold text-[var(--taav-text-strong)]">
            <span>مشاهده جزئیات</span>
            <span aria-hidden="true">‹</span>
          </div>
        </div>
      </TaavCard>

      <TaavDialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : closeDialog())}>
        <TaavDialogContent size="lg" contentClassName="ai-lab-dialog">
          <TaavDialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--taav-radius-lg)] bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]">
                <Bot className="h-6 w-6" />
              </div>
              <div className="grid gap-1">
                <TaavDialogTitle className="text-right text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
                  تاویا
                </TaavDialogTitle>
                <TaavDialogDescription className="text-right text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
                  این بخش برای جمع‌آوری دیتاهای موردنیاز برند است.
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
                        aria-label="انتخاب آیکون برند"
                      >
                        {form.iconDataUrl ? (
                          <img src={form.iconDataUrl} alt="پیش‌نمایش آیکون انتخاب‌شده" className="h-full w-full object-cover" />
                        ) : (
                          <Bot className="h-14 w-14 text-white/85" strokeWidth={1.8} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="absolute bottom-2 left-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--taav-brand)] text-white shadow-[0_12px_24px_rgba(13,148,136,0.28)] transition hover:scale-105 disabled:cursor-not-allowed"
                        aria-label="آپلود یا تغییر آیکون"
                      >
                        <Camera className="h-5 w-5" />
                      </button>
                    </div>

                    {form.iconDataUrl ? (
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

                <TaavFieldBlock label="نام برند" required htmlFor="taavia-brand-name">
                  <TaavInput
                    id="taavia-brand-name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    disabled={loading}
                    placeholder="مثلا: برند نمونه"
                  />
                </TaavFieldBlock>

                <TaavFieldBlock label="توضیحات" htmlFor="taavia-brand-description">
                  <TaavTextarea
                    id="taavia-brand-description"
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
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
            <TaavButton variant="secondary" tone="neutral" onClick={closeDialog} disabled={loading}>
              بستن
            </TaavButton>
            <TaavButton onClick={() => void handleSubmit()} disabled={loading || !form.name.trim()}>
              {loading ? 'در حال ساخت برند...' : 'ثبت و ساخت برند'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </>
  );
}
