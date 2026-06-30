'use client';

import { useState } from 'react';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import { TaavFieldBlock } from '@repo/ui/taav/forms';
import { TaavButton } from '@repo/ui/taav/primitives';
import { TaavInput } from '@repo/ui/taav/forms';

type CreateBrandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  onCreated: (brandId: string) => void;
};

export function CreateBrandDialog({ open, onOpenChange, tenantId, onCreated }: CreateBrandDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName('');
    setError(null);
    setLoading(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('نام برند الزامی است.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/businesses/${tenantId}/taavia/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const payload = (await response.json().catch(() => null)) as { brand?: { id: string }; message?: string } | null;

      if (!response.ok || !payload?.brand?.id) {
        setError(payload?.message ?? 'ایجاد برند انجام نشد.');
        setLoading(false);
        return;
      }

      reset();
      onOpenChange(false);
      onCreated(payload.brand.id);
    } catch {
      setError('خطا در ارتباط با سرور.');
      setLoading(false);
    }
  };

  return (
    <TaavDialog open={open} onOpenChange={handleOpenChange}>
      <TaavDialogContent size="sm" contentClassName="ai-lab-dialog">
        <TaavDialogHeader>
          <TaavDialogTitle>ایجاد برند جدید</TaavDialogTitle>
          <TaavDialogDescription>نام برند را وارد کنید. پس از ایجاد، مستقیماً وارد ایجنت مدیریت برند می‌شوید.</TaavDialogDescription>
        </TaavDialogHeader>

        <div className="grid gap-4 py-2">
          <TaavFieldBlock label="نام برند" required htmlFor="taavia-brand-name">
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
          {error ? (
            <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{error}</p>
          ) : null}
        </div>

        <TaavDialogFooter>
          <TaavButton variant="secondary" onClick={() => handleOpenChange(false)} disabled={loading}>
            انصراف
          </TaavButton>
          <TaavButton onClick={() => void handleSubmit()} disabled={loading || !name.trim()}>
            {loading ? 'در حال ایجاد...' : 'ایجاد برند'}
          </TaavButton>
        </TaavDialogFooter>
      </TaavDialogContent>
    </TaavDialog>
  );
}
