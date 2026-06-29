'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaavButton } from '@repo/ui/taav/primitives';
import { TaavFieldBlock, TaavInput } from '@repo/ui/taav/forms';

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
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [tokenLimit, setTokenLimit] = useState('250000');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          logoUrl,
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
        />
      </TaavFieldBlock>

      <TaavFieldBlock
        label="لوگوی کسب‌وکار"
        htmlFor="business-logo"
        description="در این مرحله می‌توانید آدرس لوگو را وارد کنید. بعدا امکان آپلود مستقیم اضافه می‌شود."
      >
        <TaavInput
          id="business-logo"
          type="url"
          value={logoUrl}
          onChange={(event) => setLogoUrl(event.target.value)}
          placeholder="https://example.com/logo.png"
          dir="ltr"
        />
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
          <TaavButton type="button" variant="secondary" tone="neutral" onClick={onCancel}>
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
