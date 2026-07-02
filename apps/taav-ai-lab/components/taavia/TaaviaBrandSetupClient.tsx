'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavBadge } from '@repo/ui/taav/primitives';
import type { TaaviaUseCaseKey } from '@/app/lib/types/domain';

type TaaviaBrandSetupClientProps = {
  tenantId: string;
  brandId: string;
  brandName: string;
  initialSelectedUseCases?: TaaviaUseCaseKey[];
  onSaved?: () => void;
};

const USE_CASES: Array<{ key: TaaviaUseCaseKey; title: string; description: string }> = [
  { key: 'support', title: 'پشتیبانی', description: 'پاسخ به سوالات، راهنمایی کاربران و رسیدگی به تیکت‌ها' },
  { key: 'sales', title: 'بازرگانی و فروش', description: 'پیگیری مشتری، پیشنهاد محصول و مدیریت فرصت‌های فروش' },
  { key: 'marketing', title: 'بازاریابی', description: 'کمپین‌ها، محتوا، لیدسازی و تحلیل عملکرد جذب' },
  { key: 'operations', title: 'عملیات', description: 'فرآیندها، هماهنگی داخلی و اتوماسیون کارهای تکراری' },
  { key: 'finance', title: 'مالی', description: 'صورتحساب، پیگیری پرداخت و پرسش‌های مالی' },
  { key: 'hr', title: 'منابع انسانی', description: 'جذب نیرو، پاسخ‌گویی به کارمندان و فرآیندهای منابع انسانی' },
  { key: 'product', title: 'محصول', description: 'بازخورد محصول، ایده‌پردازی و بهبود تجربه کاربر' },
  { key: 'management', title: 'مدیریت', description: 'گزارش‌ها، تصمیم‌سازی و پایش وضعیت کسب‌وکار' },
  { key: 'it', title: 'فناوری اطلاعات', description: 'پشتیبانی فنی، راهنمای ابزارها و پاسخ‌های سیستمی' },
];

export function TaaviaBrandSetupClient({
  tenantId,
  brandId,
  brandName,
  initialSelectedUseCases = [],
  onSaved,
}: TaaviaBrandSetupClientProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<TaaviaUseCaseKey[]>(initialSelectedUseCases);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSelected = useMemo(
    () => selected.includes('all') || selected.length === USE_CASES.length,
    [selected],
  );

  const toggle = (key: TaaviaUseCaseKey) => {
    setSelected((current) => {
      if (key === 'all') {
        return current.includes('all') ? [] : ['all'];
      }

      const withoutAll = current.filter((item) => item !== 'all');
      return withoutAll.includes(key)
        ? withoutAll.filter((item) => item !== key)
        : [...withoutAll, key];
    });
  };

  const handleSave = async () => {
    if (!selected.length) {
      setError('حداقل یک بخش را انتخاب کنید یا گزینه همه موارد را بزنید.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/businesses/${tenantId}/taavia/brands/${brandId}/setup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedUseCases: selected }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? 'ثبت تنظیمات انجام نشد.');
      }

      onSaved?.();
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ثبت تنظیمات انجام نشد.');
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] rounded-[28px] bg-[var(--taav-surface-muted)] p-4 md:p-5">
      <TaavCard variant="outlined" padding="lg" radius="xl">
        <div className="grid gap-6 rounded-[24px] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-5 md:p-7">
          <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
            <div className="md:order-1">
              <div className="inline-flex w-full max-w-[228px] overflow-hidden rounded-full border border-[color:rgba(98,109,128,0.3)] bg-[color:#aab1bf] p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]">
                <button
                  type="button"
                  onClick={() => toggle('all')}
                  className={`flex-1 rounded-full px-4 py-2 text-[length:var(--taav-text-sm)] font-black transition ${
                    allSelected
                      ? 'bg-[var(--taav-brand)] text-white shadow-[0_4px_18px_rgba(0,166,153,0.24)]'
                      : 'text-white/80'
                  }`}
                >
                  فعال
                </button>
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className={`flex-1 rounded-full px-4 py-2 text-[length:var(--taav-text-sm)] font-black transition ${
                    !allSelected && selected.length === 0
                      ? 'bg-[rgba(255,255,255,0.18)] text-white'
                      : 'text-white/80'
                  }`}
                >
                  غیر فعال
                </button>
              </div>
            </div>

            <div className="grid gap-4 text-right md:order-2">
              <div className="inline-flex items-center justify-end gap-2">
                <TaavBadge tone="brand" variant="soft">
                  مرحله بعد
                </TaavBadge>
                <span className="text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-muted)]">
                  برای برند {brandName}
                </span>
              </div>
              <h2 className="m-0 text-[clamp(1.5rem,2vw,2.1rem)] font-black leading-tight text-[var(--taav-text-strong)]">
                تاویا را برای کدام بخش‌ها می‌خواهی استفاده کنی؟
              </h2>
              <p className="m-0 max-w-3xl text-[length:var(--taav-text-sm)] leading-8 text-[var(--taav-text-muted)]">
                می‌توانی یک یا چند بخش را انتخاب کنی. اگر بخواهی تاویا برای کل کسب‌وکار فعال شود، گزینه همه موارد را انتخاب کن.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <p className="m-0 text-right text-[length:var(--taav-text-sm)] font-bold text-[var(--taav-text-strong)]">
              بخش‌های انتخاب‌شده
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              {USE_CASES.map((item) => {
                const active = selected.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggle(item.key)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[length:var(--taav-text-sm)] font-bold transition ${
                      active
                        ? 'border-[color:var(--taav-brand)] bg-[var(--taav-brand-soft)] text-[var(--taav-text-strong)]'
                        : 'border-[var(--taav-border-subtle)] bg-[var(--taav-surface-subtle)] text-[var(--taav-text-muted)]'
                    }`}
                  >
                    {active ? <Check className="h-4 w-4 text-[var(--taav-brand-strong)]" /> : null}
                    {item.title}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--taav-border-subtle)] pt-4">
            <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
              بعد از ثبت این مرحله، وارد چت مدیریت برند می‌شوی.
            </p>
            <TaavButton onClick={() => void handleSave()} disabled={saving || selected.length === 0}>
              {saving ? 'در حال ثبت...' : 'ثبت و ادامه'}
            </TaavButton>
          </div>
        </div>
      </TaavCard>
    </div>
  );
}
