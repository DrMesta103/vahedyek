'use client';

import Link from 'next/link';
import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Camera, X } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav';
import { TaavFieldBlock, TaavInput, TaavTextarea } from '@repo/ui/taav/forms';
import type { TaaviaBrand } from '@/app/lib/data';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabLabelWithTooltip } from '@/components/AiLabTooltip';

type CreateBrandPageClientProps = {
  tenantId: string;
  businessId: string;
  mode?: 'create' | 'edit';
  initialBrand?: Pick<TaaviaBrand, 'id' | 'name' | 'intake'> | null;
};

export function CreateBrandPageClient({
  tenantId,
  businessId,
  mode = 'create',
  initialBrand = null,
}: CreateBrandPageClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditMode = mode === 'edit';
  const [name, setName] = useState(initialBrand?.name ?? '');
  const [description, setDescription] = useState(initialBrand?.intake?.description ?? '');
  const [iconName, setIconName] = useState(initialBrand?.intake?.iconName ?? '');
  const [iconDataUrl, setIconDataUrl] = useState(initialBrand?.intake?.iconDataUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const validateBrand = () => {
    if (!name.trim()) {
      setError('نام برند الزامی است.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateBrand()) return;

    setLoading(true);
    setError(null);

    try {
      const response = isEditMode
        ? await fetch(`/api/businesses/${tenantId}/taavia/brands/${initialBrand?.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              intake: {
                description,
                iconName,
                iconDataUrl,
              },
            }),
          })
        : await fetch(`/api/businesses/${tenantId}/taavia/brands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name.trim(),
              intake: {
                description,
                iconName,
                iconDataUrl,
              },
            }),
          });

      const payload = (await response.json().catch(() => null)) as { brand?: { id: string }; message?: string } | null;
      if (!response.ok || !payload?.brand?.id) {
        setError(payload?.message ?? (isEditMode ? 'ویرایش برند انجام نشد.' : 'ایجاد برند انجام نشد.'));
        setLoading(false);
        return;
      }

      router.push(
        isEditMode
          ? `/businesses/${businessId}/products/taavia/brands/${payload.brand.id}`
          : `/businesses/${businessId}/products/taavia/brands/${payload.brand.id}/entry`,
      );
      router.refresh();
    } catch {
      setError('خطا در ارتباط با سرور.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <TaavBadge tone="brand" variant="soft">
            {isEditMode ? 'ویرایش برند' : 'ثبت برند جدید'}
          </TaavBadge>
          <h2 className="m-0 text-[length:var(--taav-text-2xl)] font-black text-[var(--taav-text-strong)]">
            {isEditMode ? 'ویرایش اطلاعات برند تاویا' : 'ایجاد برند برای تاویا'}
          </h2>
          <p className="m-0 max-w-2xl text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
            در این مرحله فقط اطلاعات پایه برند ثبت می‌شود تا مسیر راه‌اندازی تاویا ساده‌تر و مستقیم‌تر باشد.
          </p>
        </div>
        <Link href={`/businesses/${businessId}/products/taavia/brands`}>
          <TaavButton variant="secondary" tone="neutral">
            بازگشت به برندها
          </TaavButton>
        </Link>
      </div>

      <TaavCard variant="outlined" padding="lg" radius="xl">
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
                      aria-label="آپلود آیکون برند"
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
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    void handleSubmit();
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
            </div>
          </div>

          {error ? <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{error}</p> : null}

          <div className="ai-lab-form-actions">
            <Link href={`/businesses/${businessId}/products/taavia/brands`}>
              <TaavButton type="button" variant="secondary" tone="neutral" disabled={loading}>
                انصراف
              </TaavButton>
            </Link>
            <div className="mr-auto" />
            <TaavButton type="button" onClick={() => void handleSubmit()} disabled={loading || !name.trim()}>
              {loading ? 'در حال ثبت...' : isEditMode ? 'ثبت تغییرات' : 'ثبت برند و ادامه'}
            </TaavButton>
          </div>
        </div>
      </TaavCard>
    </div>
  );
}
