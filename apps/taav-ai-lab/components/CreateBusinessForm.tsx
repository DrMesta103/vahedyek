'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ImageIcon, Upload, X } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';
import { TaavFieldBlock, TaavInput } from '@repo/ui/taav/forms';

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('خواندن فایل تصویر انجام نشد.'));
    reader.readAsDataURL(file);
  });
}

export function CreateBusinessForm({
  mode = 'page',
  onCancel,
  onCreated,
}: {
  mode?: 'page' | 'dialog';
  onCancel?: () => void;
  onCreated?: (businessId: string) => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [tokenLimit, setTokenLimit] = useState('250000');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const resetLogo = () => {
    if (logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoPreview('');
    setLogoFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('فقط فایل تصویری برای لوگو قابل قبول است.');
      event.target.value = '';
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError('حجم تصویر لوگو نباید بیشتر از 5 مگابایت باشد.');
      event.target.value = '';
      return;
    }

    setError('');
    setLogoLoading(true);

    try {
      const preview = await fileToDataUrl(file);
      setLogoPreview(preview);
      setLogoFileName(file.name);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'خواندن تصویر انجام نشد.');
    } finally {
      setLogoLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          logoUrl: logoPreview,
          tokenLimit: Number(tokenLimit),
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; business?: { id: string } } | null;
      if (!response.ok || !payload?.business?.id) {
        throw new Error(payload?.message || 'ایجاد کسب‌وکار انجام نشد.');
      }

      onCreated?.(payload.business.id);
      if (onCreated) {
        return;
      }

      router.push(`/businesses/${payload.business.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ایجاد کسب‌وکار انجام نشد.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ai-lab-form-grid" onSubmit={handleSubmit}>
      <TaavFieldBlock label="نام کسب‌وکار" required htmlFor="business-name">
        <TaavInput
          id="business-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="مثال: بازرگانی فراتک"
          required
          disabled={submitting}
        />
      </TaavFieldBlock>

      <TaavFieldBlock
        label="لوگوی کسب‌وکار"
        description="یک فایل تصویری واقعی انتخاب کنید تا همان‌جا پیش‌نمایش آن را ببینید و در فرم ذخیره شود."
      >
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              id="business-logo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleLogoPick}
              disabled={submitting || logoLoading}
            />
            <TaavButton
              type="button"
              variant="secondary"
              tone="neutral"
              iconStart={<Upload className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting || logoLoading}
            >
              انتخاب عکس لوگو
            </TaavButton>
            {logoPreview ? (
              <TaavButton
                type="button"
                variant="ghost"
                tone="neutral"
                iconStart={<X className="h-4 w-4" />}
                onClick={resetLogo}
                disabled={submitting || logoLoading}
              >
                حذف تصویر
              </TaavButton>
            ) : null}
          </div>

          <div className="ai-lab-logo-upload-preview">
            {logoPreview ? (
              <img src={logoPreview} alt="پیش‌نمایش لوگوی انتخاب‌شده" className="ai-lab-logo-upload-image" />
            ) : (
              <div className="ai-lab-logo-upload-empty">
                <ImageIcon className="h-6 w-6" />
                <div className="grid gap-1">
                  <strong>هنوز لوگویی انتخاب نشده</strong>
                  <span>PNG، JPG، WEBP یا SVG را انتخاب کنید.</span>
                </div>
              </div>
            )}
          </div>

          {logoFileName ? <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">فایل انتخاب‌شده: {logoFileName}</p> : null}
        </div>
      </TaavFieldBlock>

      <TaavFieldBlock label="سقف کل توکن" required htmlFor="business-token-limit">
        <TaavInput
          id="business-token-limit"
          type="number"
          min={1}
          step={1}
          value={tokenLimit}
          onChange={(event) => setTokenLimit(event.target.value)}
          dir="ltr"
          required
          disabled={submitting}
        />
      </TaavFieldBlock>

      {error ? <div className="ai-lab-error-box">{error}</div> : null}

      <div className="ai-lab-form-actions">
        {mode === 'page' ? (
          <Link href="/businesses">
            <TaavButton type="button" variant="secondary" tone="neutral">
              بازگشت به کسب‌وکارها
            </TaavButton>
          </Link>
        ) : (
          <TaavButton type="button" variant="secondary" tone="neutral" onClick={onCancel} disabled={submitting}>
            انصراف
          </TaavButton>
        )}
        <div className="mr-auto" />
        <TaavButton type="submit" loading={submitting}>
          {mode === 'dialog' ? 'ثبت کسب‌وکار' : 'ایجاد کسب‌وکار'}
        </TaavButton>
      </div>
    </form>
  );
}
