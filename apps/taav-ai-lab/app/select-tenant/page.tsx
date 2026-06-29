'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CircleDollarSign, Sparkles } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavFieldBlock, TaavInput } from '@repo/ui/taav/forms';
import { TaavStepper } from '@repo/ui/taav/navigation';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  brandCode: string;
  role: string;
};

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  mobile?: string | null;
};

type OnboardingStep = 'loading' | 'list' | 'packages' | 'profile' | 'payment' | 'provisioning';
type BillingCycle = 'monthly' | 'yearly';

const PACKAGE_OPTIONS = [
  {
    id: 'starter',
    title: 'استارتر',
    monthlyPrice: '۴۹۰ هزار تومان',
    yearlyPrice: '۴.۹ میلیون تومان',
    description: 'برای شروع سریع و تیم‌های کوچک',
    features: ['۱ کسب‌وکار', 'مدیریت پایه منابع انسانی', 'پشتیبانی استاندارد'],
  },
  {
    id: 'growth',
    title: 'رشد',
    monthlyPrice: '۹۹۰ هزار تومان',
    yearlyPrice: '۹.۹ میلیون تومان',
    description: 'برای کسب‌وکارهای در حال توسعه',
    features: ['چند کاربر همزمان', 'گزارش‌های بیشتر', 'فرم‌های پیشرفته‌تر'],
  },
  {
    id: 'enterprise',
    title: 'سازمانی',
    monthlyPrice: '۱.۹ میلیون تومان',
    yearlyPrice: '۱۹ میلیون تومان',
    description: 'برای ساختارهای بزرگ و چند تیمی',
    features: ['سفارشی‌سازی بیشتر', 'اولویت پشتیبانی', 'مناسب عملیات سنگین'],
  },
] as const;

function ProvisioningScreen() {
  return (
    <div className="grid gap-6 py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
        <CircleDollarSign className="h-8 w-8" />
      </div>
      <div className="grid gap-3">
        <h2 className="m-0 text-2xl font-black text-[var(--taav-text-strong)]">کسب‌وکار شما در حال ساخته شدن است</h2>
        <p className="m-0 text-sm leading-7 text-[var(--taav-text-muted)]">
          داریم tenant را آماده می‌کنیم و شما را مستقیم وارد داشبورد می‌کنیم.
        </p>
      </div>
      <div className="mx-auto h-2 w-full max-w-md overflow-hidden rounded-full bg-[var(--taav-surface-muted)]">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-[var(--taav-brand)]" />
      </div>
    </div>
  );
}

async function readJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  const raw = await response.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw) as { message?: string; user?: UserProfile; tenants?: Tenant[]; suggestedBusinessNames?: string[] };
    } catch {
      return { message: 'پاسخ JSON نامعتبر است.' };
    }
  }

  return { message: raw || 'پاسخ نامعتبر از سرور دریافت شد.' };
}

function SelectTenantPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [suggestedBusinessNames, setSuggestedBusinessNames] = useState<string[]>([]);
  const [step, setStep] = useState<OnboardingStep>('loading');
  const [selecting, setSelecting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('growth');
  const [businessName, setBusinessName] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '6219861034567890',
    cardHolder: 'علی',
    expiry: '08/06',
    cvv2: '123',
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [tenantsResponse, meResponse] = await Promise.all([
          fetch('/api/auth/tenants', { cache: 'no-store' }),
          fetch('/api/auth/me', { cache: 'no-store' }),
        ]);

        if (tenantsResponse.status === 401 || meResponse.status === 401) {
          router.replace('/login');
          return;
        }

        if (!tenantsResponse.ok || !meResponse.ok) {
          throw new Error('load-failed');
        }

        const [tenantsPayload, mePayload] = await Promise.all([readJsonResponse(tenantsResponse), readJsonResponse(meResponse)]);
        if (!mounted) return;

        setTenants(tenantsPayload.tenants ?? []);
        setSuggestedBusinessNames(tenantsPayload.suggestedBusinessNames ?? []);
        setUser(mePayload.user ?? null);
        setStep((tenantsPayload.tenants ?? []).length ? 'list' : 'packages');
      } catch {
        if (!mounted) return;
        setTenants([]);
        setStep('packages');
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [router]);

  const selectedPackage = PACKAGE_OPTIONS.find((item) => item.id === selectedPackageId) ?? PACKAGE_OPTIONS[0];

  const visibleSuggestions = useMemo(() => {
    const normalized = businessName.trim();
    const pool = normalized
      ? suggestedBusinessNames.filter((item) => item.includes(normalized) || normalized.includes(item))
      : suggestedBusinessNames;

    return pool.filter((item) => item !== businessName.trim()).slice(0, 8);
  }, [businessName, suggestedBusinessNames]);

  const recentBusinessNames = useMemo(() => suggestedBusinessNames.slice(0, 6), [suggestedBusinessNames]);

  const selectTenant = async (tenantId: string) => {
    setSelecting(tenantId);
    try {
      const response = await fetch('/api/auth/select-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      const payload = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(payload.message || 'انتخاب کسب‌وکار انجام نشد.');
      }

      router.push(next);
      router.refresh();
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : 'انتخاب کسب‌وکار انجام نشد.');
      setSelecting(null);
    }
  };

  const createTenant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError('');

    const digitsOnlyCard = paymentForm.cardNumber.replace(/\D/g, '');
    if (
      digitsOnlyCard.length < 16 ||
      paymentForm.cvv2.trim().length < 3 ||
      paymentForm.expiry.trim().length < 5 ||
      !paymentForm.cardHolder.trim()
    ) {
      setError('اطلاعات پرداخت کامل نیست. شماره کارت، نام دارنده، تاریخ و CVV2 را کامل کنید.');
      setCreating(false);
      return;
    }

    setStep('provisioning');
    try {
      const response = await fetch('/api/auth/create-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          packageId: selectedPackageId,
          billingCycle,
        }),
      });
      const payload = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(payload.message || 'خطا در ساخت کسب‌وکار');
      }

      await new Promise((resolve) => setTimeout(resolve, 1800));
      router.push(next);
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'خطا در ساخت کسب‌وکار');
      setStep('payment');
      setCreating(false);
    }
  };

  const stepperCurrent =
    step === 'packages'
      ? 'packages'
      : step === 'profile'
        ? 'profile'
        : step === 'payment' || step === 'provisioning'
          ? 'payment'
          : 'list';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253a,transparent_36%),linear-gradient(135deg,#07121f,#0d1726_60%,#07101a)] px-4 py-6 text-right text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <TaavCard
          variant="outlined"
          padding="lg"
          radius="xl"
          wrapperClassName="w-full border-white/10 bg-[rgba(8,14,25,0.78)] shadow-[0_24px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 rounded-3xl border border-white/6 bg-white/4 p-6">
              <TaavBadge tone="brand" variant="soft">
                فاز ۱ · محیط شبیه‌ساز
              </TaavBadge>
              <div className="grid gap-3">
                <h1 className="m-0 text-3xl font-black text-white">انتخاب tenant یا ساخت کسب‌وکار جدید</h1>
                <p className="m-0 max-w-2xl text-sm leading-8 text-slate-300">
                  این مسیر دقیقا مثل DastRanj طراحی شده است: ابتدا tenant موجود را انتخاب کنید، یا یک کسب‌وکار جدید بسازید و وارد محیط اصلی شوید.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-cyan-400/12 bg-cyan-400/8 p-4">
                  <div className="text-xs text-slate-300">کاربر</div>
                  <div className="mt-1 truncate font-bold text-white">{user?.fullName ?? 'در حال بارگذاری'}</div>
                </div>
                <div className="rounded-2xl border border-cyan-400/12 bg-cyan-400/8 p-4">
                  <div className="text-xs text-slate-300">شناسه</div>
                  <div className="mt-1 truncate font-bold text-white">{user?.email ?? user?.mobile ?? '---'}</div>
                </div>
                <div className="rounded-2xl border border-cyan-400/12 bg-cyan-400/8 p-4">
                  <div className="text-xs text-slate-300">tenant ها</div>
                  <div className="mt-1 font-bold text-white">{tenants.length}</div>
                </div>
              </div>

              <div className="grid gap-3">
                <TaavStepper
                  steps={[
                    { id: 'list', title: 'انتخاب', description: 'tenant موجود' },
                    { id: 'packages', title: 'پکیج', description: 'انتخاب پلن' },
                    { id: 'profile', title: 'پروفایل', description: 'نام کسب‌وکار' },
                    { id: 'payment', title: 'پرداخت', description: 'ثبت و ایجاد' },
                  ]}
                  currentStep={stepperCurrent}
                  orientation="horizontal"
                  showProgress
                  wrapperClassName="rounded-2xl border border-white/6 bg-black/20 p-4"
                />
              </div>
            </div>

            <TaavCard variant="soft" padding="lg" radius="xl" wrapperClassName="ai-lab-auth-panel">
              {step === 'loading' ? (
                <div className="grid min-h-[420px] place-items-center text-sm text-[var(--taav-text-muted)]">در حال بارگذاری...</div>
              ) : null}

              {step === 'provisioning' ? <ProvisioningScreen /> : null}

              {step !== 'loading' && step !== 'provisioning' ? (
                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <TaavBadge tone="brand" variant="soft" unsafeClassName="w-fit">
                      {step === 'list' ? 'انتخاب tenant' : step === 'packages' ? 'انتخاب پکیج' : step === 'profile' ? 'اطلاعات کسب‌وکار' : 'پرداخت و ساخت'}
                    </TaavBadge>
                    <h2 className="m-0 text-2xl font-black text-[var(--taav-text-strong)]">
                      {step === 'list' ? 'tenant فعلی را انتخاب کنید' : 'tenant جدید بسازید'}
                    </h2>
                    <p className="m-0 text-sm leading-7 text-[var(--taav-text-muted)]">
                      {step === 'list'
                        ? 'یکی از tenantهای موجود را انتخاب کنید یا ساخت کسب‌وکار جدید را آغاز کنید.'
                        : 'فرآیند ساخت tenant در همین کارت ادامه پیدا می‌کند.'}
                    </p>
                  </div>

                  {step === 'list' ? (
                    <div className="grid gap-3">
                      {tenants.map((tenant) => (
                        <button
                          key={tenant.id}
                          type="button"
                          onClick={() => selectTenant(tenant.id)}
                          disabled={selecting === tenant.id}
                          className="ai-lab-auth-option"
                        >
                          <div className="ai-lab-auth-option-icon">
                            {tenant.brandCode}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate ai-lab-auth-option-title">{tenant.name}</div>
                            <div className="truncate ai-lab-auth-option-subtitle">{tenant.slug}</div>
                          </div>
                          <div className="text-xs text-[var(--taav-text-subtle)]">
                            {selecting === tenant.id ? 'در حال ورود...' : <ArrowLeft className="h-4 w-4" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {step === 'list' ? (
                    <TaavButton
                      type="button"
                      variant="secondary"
                      tone="neutral"
                      iconStart={<Sparkles className="h-4 w-4" />}
                      onClick={() => {
                        setError('');
                        setStep('packages');
                      }}
                    >
                      ساخت کسب‌وکار جدید
                    </TaavButton>
                  ) : null}

                  {step === 'packages' ? (
                    <div className="grid gap-4">
                      <div className="flex flex-wrap gap-2">
                        {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
                          <TaavButton
                            key={cycle}
                            type="button"
                            variant={billingCycle === cycle ? 'primary' : 'secondary'}
                            tone={billingCycle === cycle ? 'brand' : 'neutral'}
                            onClick={() => setBillingCycle(cycle)}
                          >
                            {cycle === 'monthly' ? 'ماهانه' : 'سالانه'}
                          </TaavButton>
                        ))}
                      </div>

                      <div className="grid gap-3">
                        {PACKAGE_OPTIONS.map((pkg) => {
                          const selected = pkg.id === selectedPackageId;
                          return (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() => setSelectedPackageId(pkg.id)}
                              className={['ai-lab-auth-package', selected ? 'is-selected' : ''].filter(Boolean).join(' ')}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="ai-lab-auth-package-title">{pkg.title}</div>
                                  <div className="ai-lab-auth-package-copy">{pkg.description}</div>
                                </div>
                                <div className="ai-lab-auth-package-price">
                                  {billingCycle === 'monthly' ? pkg.monthlyPrice : pkg.yearlyPrice}
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {pkg.features.map((feature) => (
                                  <span key={feature} className="ai-lab-auth-package-feature">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <TaavButton type="button" onClick={() => setStep('profile')}>
                        ادامه
                      </TaavButton>
                    </div>
                  ) : null}

                  {step === 'profile' ? (
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TaavFieldBlock label="نام" htmlFor="tenant-profile-first-name">
                          <TaavInput id="tenant-profile-first-name" value={user?.firstName ?? ''} disabled />
                        </TaavFieldBlock>
                        <TaavFieldBlock label="نام خانوادگی" htmlFor="tenant-profile-last-name">
                          <TaavInput id="tenant-profile-last-name" value={user?.lastName ?? ''} disabled />
                        </TaavFieldBlock>
                      </div>

                      <TaavFieldBlock label="شماره موبایل" htmlFor="tenant-profile-mobile">
                        <TaavInput
                          id="tenant-profile-mobile"
                          value={user?.mobile ?? ''}
                          disabled
                          dir="ltr"
                          prefix="IR +98"
                        />
                      </TaavFieldBlock>

                      <TaavFieldBlock label="نام کسب‌وکار" htmlFor="tenant-business-name">
                        <TaavInput
                          id="tenant-business-name"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="نام کسب‌وکار را وارد کنید"
                        />
                      </TaavFieldBlock>

                      <div className="ai-lab-auth-summary">
                        <div className="ai-lab-auth-summary-label">
                          <span>نام‌های پیشنهادی</span>
                          <span>{recentBusinessNames.length ? `${recentBusinessNames.length} مورد` : 'بدون داده'}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(visibleSuggestions.length ? visibleSuggestions : recentBusinessNames).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setBusinessName(item)}
                              className="ai-lab-auth-chip"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      {error ? <div className="ai-lab-error-box">{error}</div> : null}

                      <div className="flex items-center gap-3">
                        <TaavButton type="button" variant="secondary" tone="neutral" onClick={() => setStep('packages')}>
                          بازگشت
                        </TaavButton>
                        <TaavButton
                          type="button"
                          onClick={() => {
                            if (!businessName.trim()) {
                              setError('نام کسب‌وکار الزامی است.');
                              return;
                            }
                            setError('');
                            setStep('payment');
                          }}
                        >
                          ادامه
                        </TaavButton>
                      </div>
                    </div>
                  ) : null}

                  {step === 'payment' ? (
                    <form className="grid gap-4" onSubmit={createTenant}>
                      <div className="ai-lab-auth-payment-box">
                        <div className="ai-lab-auth-payment-label">مبلغ قابل پرداخت</div>
                        <div className="ai-lab-auth-payment-amount">
                          {billingCycle === 'monthly' ? selectedPackage.monthlyPrice : selectedPackage.yearlyPrice}
                        </div>
                        <div className="ai-lab-auth-payment-copy">
                          {selectedPackage.title} - {billingCycle === 'monthly' ? 'ماهانه' : 'سالانه'}
                        </div>
                      </div>

                      <TaavFieldBlock label="شماره کارت" htmlFor="tenant-card-number">
                        <TaavInput
                          id="tenant-card-number"
                          value={paymentForm.cardNumber}
                          onChange={(e) =>
                            setPaymentForm((current) => ({
                              ...current,
                              cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16),
                            }))
                          }
                          dir="ltr"
                          inputMode="numeric"
                          placeholder="6219861034567890"
                        />
                      </TaavFieldBlock>

                      <TaavFieldBlock label="نام دارنده کارت" htmlFor="tenant-card-holder">
                        <TaavInput
                          id="tenant-card-holder"
                          value={paymentForm.cardHolder}
                          onChange={(e) => setPaymentForm((current) => ({ ...current, cardHolder: e.target.value }))}
                          placeholder={user?.fullName ?? 'نام و نام خانوادگی'}
                        />
                      </TaavFieldBlock>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <TaavFieldBlock label="تاریخ انقضا" htmlFor="tenant-card-expiry">
                          <TaavInput
                            id="tenant-card-expiry"
                            value={paymentForm.expiry}
                            onChange={(e) => setPaymentForm((current) => ({ ...current, expiry: e.target.value.slice(0, 5) }))}
                            dir="ltr"
                            placeholder="08/06"
                          />
                        </TaavFieldBlock>
                        <TaavFieldBlock label="CVV2" htmlFor="tenant-card-cvv2">
                          <TaavInput
                            id="tenant-card-cvv2"
                            value={paymentForm.cvv2}
                            onChange={(e) => setPaymentForm((current) => ({ ...current, cvv2: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                            dir="ltr"
                            inputMode="numeric"
                            placeholder="123"
                          />
                        </TaavFieldBlock>
                      </div>

                      {error ? <div className="ai-lab-error-box">{error}</div> : null}

                      <div className="flex items-center gap-3">
                        <TaavButton type="button" variant="secondary" tone="neutral" onClick={() => setStep('profile')}>
                          بازگشت
                        </TaavButton>
                        <TaavButton type="submit" loading={creating}>
                          پرداخت و ساخت tenant
                        </TaavButton>
                      </div>
                    </form>
                  ) : null}
                </div>
              ) : null}
            </TaavCard>
          </div>
        </TaavCard>
      </div>
    </div>
  );
}

export default function SelectTenantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253a,transparent_36%),linear-gradient(135deg,#07121f,#0d1726_60%,#07101a)]" />}>
      <SelectTenantPageContent />
    </Suspense>
  );
}
