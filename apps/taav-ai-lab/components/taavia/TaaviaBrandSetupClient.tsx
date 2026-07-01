'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles } from 'lucide-react';
import { TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavBadge } from '@repo/ui/taav/primitives';
import type { TaaviaUseCaseKey } from '@/app/lib/types/domain';

type TaaviaBrandSetupClientProps = {
  tenantId: string;
  brandId: string;
  brandName: string;
  initialSelectedUseCases?: TaaviaUseCaseKey[];
};

const USE_CASES: Array<{ key: TaaviaUseCaseKey; title: string; description: string }> = [
  { key: 'support', title: 'پشتیبانی', description: 'پاسخ به سوالات، راهنمایی کاربران و رسیدگی به تیکت‌ها' },
  { key: 'sales', title: 'بازرگانی و فروش', description: 'پیگیری مشتری، پیشنهاد محصول و مدیریت فرصت‌های فروش' },
  { key: 'marketing', title: 'بازاریابی', description: 'کمپین‌ها، محتوا، لیدسازی و تحلیل عملکرد جذب' },
  { key: 'operations', title: 'عملیات', description: 'فرآیندها، هماهنگی داخلی و اتوماسیون کارهای تکراری' },
  { key: 'finance', title: 'مالی', description: 'صورتحساب، پیگیری پرداخت و پرسش‌های مالی' },
  { key: 'hr', title: 'منابع انسانی', description: 'جذب نیرو، پاسخگویی به کارمندان و فرایندهای منابع انسانی' },
  { key: 'product', title: 'محصول', description: 'بازخورد محصول، ایده‌پردازی و بهبود تجربه کاربر' },
  { key: 'management', title: 'مدیریت', description: 'گزارش‌ها، تصمیم‌سازی و پایش وضعیت کسب‌وکار' },
  { key: 'it', title: 'فناوری اطلاعات', description: 'پشتیبانی فنی، راهنمای ابزارها و پاسخ‌های سیستمی' },
];

export function TaaviaBrandSetupClient({
  tenantId,
  brandId,
  brandName,
  initialSelectedUseCases = [],
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

      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ثبت تنظیمات انجام نشد.');
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <TaavCard variant="outlined" padding="lg" radius="xl">
        <div className="grid gap-5 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-2">
            <div className="inline-flex items-center gap-2">
              <TaavBadge tone="brand" variant="soft">
                مرحله بعد
              </TaavBadge>
              <span className="text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-muted)]">
                برای برند {brandName}
              </span>
            </div>
            <h2 className="m-0 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
              تاویا را برای کدام بخش‌ها می‌خواهی استفاده کنی؟
            </h2>
            <p className="m-0 max-w-2xl text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
              می‌توانی یک یا چند بخش را انتخاب کنی. اگر بخواهی تاویا برای کل کسب‌وکار فعال شود، گزینه همه موارد را انتخاب کن.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--taav-radius-lg)] bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => toggle('all')}
            className={`rounded-[20px] border px-4 py-4 text-right transition ${
              allSelected
                ? 'border-[color:var(--taav-brand)] bg-[var(--taav-brand-soft)]'
                : 'border-[var(--taav-border-subtle)] bg-[var(--taav-surface)]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[length:var(--taav-text-md)] font-black text-[var(--taav-text-strong)]">همه موارد</div>
                <div className="mt-1 text-[length:var(--taav-text-xs)] leading-6 text-[var(--taav-text-muted)]">
                  تاویا برای همه بخش‌های کسب‌وکار فعال شود
                </div>
              </div>
              {allSelected ? <Check className="h-5 w-5 text-[var(--taav-brand-strong)]" /> : null}
            </div>
          </button>

          {USE_CASES.map((item) => {
            const active = selected.includes(item.key);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggle(item.key)}
                className={`rounded-[20px] border px-4 py-4 text-right transition ${
                  active
                    ? 'border-[color:var(--taav-brand)] bg-[var(--taav-brand-soft)]'
                    : 'border-[var(--taav-border-subtle)] bg-[var(--taav-surface)]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[length:var(--taav-text-md)] font-black text-[var(--taav-text-strong)]">{item.title}</div>
                    <div className="mt-1 text-[length:var(--taav-text-xs)] leading-6 text-[var(--taav-text-muted)]">
                      {item.description}
                    </div>
                  </div>
                  {active ? <Check className="h-5 w-5 text-[var(--taav-brand-strong)]" /> : null}
                </div>
              </button>
            );
          })}
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
