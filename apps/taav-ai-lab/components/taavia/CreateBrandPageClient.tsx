'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Camera, Check, X } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard, TaavStepper } from '@repo/ui/taav';
import { TaavFieldBlock, TaavInput, TaavTextarea } from '@repo/ui/taav/forms';
import type { TaaviaBrand } from '@/app/lib/data';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import type { TaaviaUseCaseKey } from '@/app/lib/types/domain';
import { AiLabLabelWithTooltip } from '@/components/AiLabTooltip';

type CreateBrandPageClientProps = {
  tenantId: string;
  businessId: string;
  mode?: 'create' | 'edit';
  initialBrand?: Pick<TaaviaBrand, 'id' | 'name' | 'intake'> | null;
  initialSelectedUseCases?: TaaviaUseCaseKey[];
};

type CreateStep = 'brand' | 'use-cases';

const USE_CASES: Array<{ key: TaaviaUseCaseKey; title: string; description: string }> = [
  { key: 'support', title: 'پشتیبانی', description: 'پاسخ به سوالات، راهنمایی کاربران و رسیدگی به تیکت‌ها' },
  { key: 'sales', title: 'بازرگانی و فروش', description: 'پیگیری مشتری، پیشنهاد محصول و مدیریت فرصت‌های فروش' },
  { key: 'marketing', title: 'بازاریابی', description: 'کمپین‌ها، محتوا، لیدسازی و تحلیل عملکرد جذب' },
  { key: 'operations', title: 'عملیات', description: 'فرآیندها، هماهنگی داخلی و اتوماسیون کارهای تکراری' },
  { key: 'finance', title: 'مالی', description: 'صورت‌حساب، پیگیری پرداخت و پرسش‌های مالی' },
  { key: 'hr', title: 'منابع انسانی', description: 'جذب نیرو، پاسخگویی به کارمندان و فرآیندهای منابع انسانی' },
  { key: 'product', title: 'محصول', description: 'بازخورد محصول، ایده‌پردازی و بهبود تجربه کاربر' },
  { key: 'management', title: 'مدیریت', description: 'گزارش‌ها، تصمیم‌سازی و پایش وضعیت کسب‌وکار' },
  { key: 'it', title: 'فناوری اطلاعات', description: 'پشتیبانی فنی، راهنمای ابزارها و پاسخ‌های سیستمی' },
];

export function CreateBrandPageClient({
  tenantId,
  businessId,
  mode = 'create',
  initialBrand = null,
  initialSelectedUseCases = [],
}: CreateBrandPageClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditMode = mode === 'edit';
  const [name, setName] = useState(initialBrand?.name ?? '');
  const [description, setDescription] = useState(initialBrand?.intake?.description ?? '');
  const [iconName, setIconName] = useState(initialBrand?.intake?.iconName ?? '');
  const [iconDataUrl, setIconDataUrl] = useState(initialBrand?.intake?.iconDataUrl ?? '');
  const [selectedUseCases, setSelectedUseCases] = useState<TaaviaUseCaseKey[]>(initialSelectedUseCases);
  const [currentStep, setCurrentStep] = useState<CreateStep>('brand');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const allSelected = useMemo(
    () =>
      selectedUseCases.includes('all') ||
      selectedUseCases.filter((item) => item !== 'all').length === USE_CASES.length,
    [selectedUseCases],
  );

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

  const toggleUseCase = (key: TaaviaUseCaseKey) => {
    setSelectedUseCases((current) => {
      if (key === 'all') {
        return current.includes('all') ? [] : ['all'];
      }

      const withoutAll = current.filter((item) => item !== 'all');
      return withoutAll.includes(key)
        ? withoutAll.filter((item) => item !== key)
        : [...withoutAll, key];
    });
  };

  const validateBrandStep = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('نام برند الزامی است.');
      return false;
    }

    return true;
  };

  const validateUseCasesStep = () => {
    if (!selectedUseCases.length) {
      setError('حداقل یک بخش را انتخاب کنید یا گزینه همه موارد را بزنید.');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateBrandStep()) return;
    setError(null);
    setCurrentStep('use-cases');
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!validateBrandStep()) return;
    if (!validateUseCasesStep()) {
      setError('حداقل یک بخش را انتخاب کنید یا گزینه همه موارد را بزنید.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = isEditMode
        ? await fetch(`/api/businesses/${tenantId}/taavia/brands/${initialBrand?.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: trimmed,
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
              name: trimmed,
              intake: {
                description,
                iconName,
                iconDataUrl,
              },
            }),
          });

      const brandPayload = (await response.json().catch(() => null)) as { brand?: { id: string }; message?: string } | null;
      if (!response.ok || !brandPayload?.brand?.id) {
        setError(brandPayload?.message ?? (isEditMode ? 'ویرایش برند انجام نشد.' : 'ایجاد برند انجام نشد.'));
        setLoading(false);
        return;
      }

      const setupResponse = await fetch(`/api/businesses/${tenantId}/taavia/brands/${brandPayload.brand.id}/setup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedUseCases }),
      });

      const setupPayload = (await setupResponse.json().catch(() => null)) as { message?: string } | null;
      if (!setupResponse.ok) {
        setError(setupPayload?.message ?? 'ثبت تنظیمات برند انجام نشد.');
        setLoading(false);
        return;
      }

      router.push(
        isEditMode
          ? `/businesses/${businessId}/products/taavia/brands/${brandPayload.brand.id}`
          : `/businesses/${businessId}/products/taavia/brands/${brandPayload.brand.id}/entry`,
      );
      router.refresh();
    } catch {
      setError('خطا در ارتباط با سرور.');
      setLoading(false);
    }
  };

  const steps = [
    {
      id: 'brand',
      title: 'ثبت برند',
      description: 'نام برند و بخش‌های استفاده',
    },
    {
      id: 'use-cases',
      title: 'بخش‌های استفاده',
      description: 'انتخاب حوزه‌های تاویا',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <TaavBadge tone="brand" variant="soft">
            ثبت برند جدید
          </TaavBadge>
          <h2 className="m-0 text-[length:var(--taav-text-2xl)] font-black text-[var(--taav-text-strong)]">
            ایجاد برند برای تاویا
          </h2>
        </div>
        <Link href={`/businesses/${businessId}/products/taavia/brands`}>
          <TaavButton variant="secondary" tone="neutral">
            بازگشت به برندها
          </TaavButton>
        </Link>
      </div>

      <TaavCard variant="outlined" padding="lg" radius="xl">
        <div className="grid gap-4">
          <TaavStepper
            steps={steps}
            currentStep={currentStep}
            showProgress
            variant="numbered"
            size="md"
            wrapperClassName="gap-[var(--taav-space-3)]"
          />

          {currentStep === 'brand' ? (
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
                      handleNextStep();
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
          ) : null}

          {currentStep === 'use-cases' ? (
            <div className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-subtle)] p-4">
              <div className="grid gap-5 overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="grid gap-2">
                    <div className="inline-flex items-center gap-2">
                      <TaavBadge tone="brand" variant="soft">
                        مرحله دوم
                      </TaavBadge>
                      <span className="text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-muted)]">
                        برای برند {name.trim() || 'جدید'}
                      </span>
                    </div>
                    <h2 className="m-0 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
                      تاویا را برای کدام بخش‌ها می‌خواهی استفاده کنی؟
                    </h2>
                    <p className="m-0 max-w-2xl text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
                      می‌توانی یک یا چند بخش را انتخاب کنی. اگر بخواهی تاویا برای کل کسب‌وکار فعال شود، گزینه همه موارد را انتخاب کن.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => toggleUseCase('all')}
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
                    const active = selectedUseCases.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleUseCase(item.key)}
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

                <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                  بعد از ثبت این مرحله، مستقیم وارد صفحه مدیریت برند می‌شوی.
                </p>
              </div>
            </div>
          ) : null}

          {error ? <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{error}</p> : null}

          <div className="ai-lab-form-actions">
            <Link href={`/businesses/${businessId}/products/taavia/brands`}>
              <TaavButton type="button" variant="secondary" tone="neutral" disabled={loading}>
                انصراف
              </TaavButton>
            </Link>
            <div className="mr-auto" />
            {currentStep === 'brand' ? (
              <TaavButton type="button" onClick={handleNextStep} disabled={loading || !name.trim()}>
                ادامه به انتخاب بخش‌ها
              </TaavButton>
            ) : (
              <TaavButton type="button" onClick={() => void handleSubmit()} disabled={loading || selectedUseCases.length === 0}>
                {loading ? 'در حال ثبت...' : 'ثبت برند و ادامه'}
              </TaavButton>
            )}
          </div>
        </div>
      </TaavCard>
    </div>
  );
}
