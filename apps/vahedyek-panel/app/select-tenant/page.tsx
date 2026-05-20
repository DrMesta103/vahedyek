'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
    features: ['۱ کسب‌وکار', 'مدیریت قرارداد پایه', 'پشتیبانی استاندارد'],
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
    <div className="w-full max-w-2xl rounded-[32px] border border-white/70 bg-white/90 p-10 text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
        <i className="fa fa-building" />
      </div>
      <h1 className="text-3xl font-black text-slate-900">کسب‌وکار شما در حال ساختن می‌باشد</h1>
      <p className="mt-3 text-sm leading-7 text-slate-500">
        داریم فضای tenant را آماده می‌کنیم، مالک را روی همان حساب فعلی ثبت می‌کنیم و شما را مستقیم وارد داشبورد می‌کنیم.
      </p>
      <div className="mt-8 overflow-hidden rounded-full bg-slate-100">
        <div className="h-3 w-full animate-pulse rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
      </div>
    </div>
  );
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
  const [createError, setCreateError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('growth');
  const [businessName, setBusinessName] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv2: '',
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
          setLoadError('نشست کاربری بعد از ورود حفظ نشد. اگر از IP شبکه وارد شده‌اید، کوکی یا آدرس دسترسی را بررسی کنید.');
          router.replace('/login');
          return;
        }

        const [tenantsPayload, mePayload] = await Promise.all([tenantsResponse.json(), meResponse.json()]);

        if (!tenantsResponse.ok) {
          throw new Error(tenantsPayload.message || 'بارگذاری لیست کسب‌وکارها انجام نشد.');
        }

        if (!meResponse.ok) {
          throw new Error(mePayload.message || 'اطلاعات کاربر دریافت نشد.');
        }

        if (!mounted) return;

        const loadedTenants = tenantsPayload.tenants ?? [];
        setTenants(loadedTenants);
        setSuggestedBusinessNames(tenantsPayload.suggestedBusinessNames ?? []);
        setUser(mePayload.user ?? null);
        setLoadError('');
        setStep(loadedTenants.length ? 'list' : 'packages');
      } catch (error) {
        if (!mounted) return;
        setTenants([]);
        setLoadError(error instanceof Error ? error.message : 'بارگذاری اطلاعات ورود انجام نشد.');
        setStep('list');
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

  const selectTenant = async (tenantId: string) => {
    setSelecting(tenantId);
    try {
      const res = await fetch('/api/auth/select-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'انتخاب کسب‌وکار انجام نشد.');
      }
      router.push(next);
      router.refresh();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'انتخاب کسب‌وکار انجام نشد.');
      setSelecting(null);
    }
  };

  const createTenant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setCreateError('');

    const digitsOnlyCard = paymentForm.cardNumber.replace(/\D/g, '');
    if (digitsOnlyCard.length < 16 || paymentForm.cvv2.trim().length < 3 || paymentForm.expiry.trim().length < 5 || !paymentForm.cardHolder.trim()) {
      setCreateError('اطلاعات پرداخت ماک کامل نیست. شماره کارت، نام دارنده، تاریخ و CVV2 را کامل کنید.');
      setCreating(false);
      return;
    }

    setStep('provisioning');
    try {
      const res = await fetch('/api/auth/create-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          packageId: selectedPackageId,
          billingCycle,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'خطا در ساخت کسب‌وکار');
      }

      await new Promise((resolve) => setTimeout(resolve, 2200));
      router.push(next);
      router.refresh();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'خطا در ساخت کسب‌وکار');
      setStep('payment');
      setCreating(false);
    }
  };

  const frameClassName =
    step === 'provisioning'
      ? 'w-full max-w-2xl'
      : 'w-full max-w-6xl rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur md:p-8';

  return (
    <div className="relative z-[80] isolate flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#d8fff4,transparent_35%),linear-gradient(135deg,#f7fbfa,#eef6f4)] px-4 py-8">
      <div className={frameClassName}>
        {step === 'loading' ? (
          <div className="py-16 text-center text-sm text-slate-400">در حال بارگذاری...</div>
        ) : null}

        {step === 'provisioning' ? <ProvisioningScreen /> : null}

        {step !== 'loading' && step !== 'provisioning' ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[28px] bg-[linear-gradient(160deg,#0f172a,#134e4a_55%,#0f766e)] p-7 text-white">
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                ساخت کسب‌وکار چند tenant
              </div>
              <h1 className="mt-4 text-3xl font-black leading-tight">
                {step === 'list' ? 'کسب‌وکار فعلی را انتخاب کنید یا یک tenant جدید بسازید.' : 'پکیج را انتخاب کنید و در چند قدم کوتاه tenant جدید را بسازید.'}
              </h1>
              <p className="mt-4 text-sm leading-7 text-emerald-50/85">
                مالک این کسب‌وکار همان حساب فعلی شماست و در لحظه ساخت tenant به عنوان owner ثبت می‌شود.
              </p>

              <div className="mt-8 space-y-3">
                <div className={`rounded-2xl border px-4 py-3 text-sm ${step === 'packages' ? 'border-white/35 bg-white/14' : 'border-white/10 bg-white/5'}`}>
                  ۱. انتخاب پکیج و دوره
                </div>
                <div className={`rounded-2xl border px-4 py-3 text-sm ${step === 'profile' ? 'border-white/35 bg-white/14' : 'border-white/10 bg-white/5'}`}>
                  ۲. تایید مالک و نام کسب‌وکار
                </div>
                <div className={`rounded-2xl border px-4 py-3 text-sm ${step === 'payment' ? 'border-white/35 bg-white/14' : 'border-white/10 bg-white/5'}`}>
                  ۳. پرداخت ماک و ورود به داشبورد
                </div>
              </div>

              {selectedPackage ? (
                <div className="mt-8 rounded-[24px] border border-white/15 bg-black/15 p-5">
                  <div className="text-sm text-emerald-100">پکیج انتخاب‌شده</div>
                  <div className="mt-2 text-2xl font-bold">{selectedPackage.title}</div>
                  <div className="mt-1 text-sm text-emerald-100/80">
                    {billingCycle === 'monthly' ? selectedPackage.monthlyPrice : selectedPackage.yearlyPrice}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 text-right shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              {loadError ? (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{loadError}</div>
              ) : null}

              {step === 'list' ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">انتخاب کسب‌وکار</h2>
                    <p className="mt-1 text-sm text-slate-500">می‌توانید وارد tenant فعلی شوید یا ساخت tenant جدید را شروع کنید.</p>
                  </div>

                  <div className="space-y-3">
                    {tenants.map((tenant) => (
                      <button
                        key={tenant.id}
                        onClick={() => selectTenant(tenant.id)}
                        disabled={selecting === tenant.id}
                        className="app-card-action flex w-full items-center gap-4 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-right transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-60"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-xs font-bold text-white">
                          {tenant.brandCode}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{tenant.name}</div>
                          <div className="text-xs text-slate-400">{tenant.slug}</div>
                        </div>
                        {selecting === tenant.id ? <span className="text-xs text-emerald-600">در حال ورود...</span> : <i className="fa fa-chevron-left text-slate-300" />}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        setCreateError('');
                        setStep('packages');
                      }}
                      className="app-card-action flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-100"
                    >
                      <i className="fa fa-plus" />
                      ساخت کسب‌وکار جدید
                    </button>
                  </div>
                </>
              ) : null}

              {step === 'packages' ? (
                <>
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">انتخاب پکیج</h2>
                      <p className="mt-1 text-sm text-slate-500">قبل از ساخت tenant، دوره ماهیانه یا سالیانه و یکی از ۳ پکیج استاتیک را انتخاب کنید.</p>
                    </div>
                    {tenants.length ? (
                      <button onClick={() => setStep('list')} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
                        بازگشت
                      </button>
                    ) : null}
                  </div>

                  <div className="mb-5 inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
                    {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => setBillingCycle(cycle)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${billingCycle === cycle ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
                      >
                        {cycle === 'monthly' ? 'ماهیانه' : 'سالیانه'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {PACKAGE_OPTIONS.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`w-full rounded-[20px] border p-4 text-right transition ${
                          selectedPackageId === pkg.id ? 'border-emerald-500 bg-emerald-50 shadow-[0_12px_35px_rgba(5,150,105,0.12)]' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-lg font-bold text-slate-900">{pkg.title}</div>
                            <div className="mt-1 text-sm text-slate-500">{pkg.description}</div>
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-emerald-700">{billingCycle === 'monthly' ? pkg.monthlyPrice : pkg.yearlyPrice}</div>
                            <div className="mt-1 text-xs text-slate-400">{billingCycle === 'monthly' ? 'صورتحساب ماهانه' : 'صورتحساب سالانه'}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {pkg.features.map((feature) => (
                            <span key={feature} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button onClick={() => setStep('profile')} className="app-button app-auth-button mt-5 transition hover:bg-emerald-700">
                    ادامه و تکمیل اطلاعات مالک
                  </button>
                </>
              ) : null}

              {step === 'profile' ? (
                <>
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">اطلاعات مالک و کسب‌وکار</h2>
                      <p className="mt-1 text-sm text-slate-500">نام و موبایل از جدول کاربر خوانده می‌شود و در این مرحله قابل ویرایش نیست.</p>
                    </div>
                    <button onClick={() => setStep('packages')} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
                      بازگشت
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">شماره موبایل</span>
                      <div className="flex items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-100 px-3">
                        <span className="shrink-0 text-sm font-semibold text-slate-500" dir="ltr">
                          🇮🇷 +98
                        </span>
                        <input
                          value={user?.mobile ?? ''}
                          disabled
                          dir="ltr"
                          className="h-12 w-full border-0 bg-transparent px-0 text-left text-[13px] text-slate-700 outline-none"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">نام</span>
                      <input value={user?.firstName ?? ''} disabled className="app-control app-auth-control w-full bg-slate-100" />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">نام خانوادگی</span>
                      <input value={user?.lastName ?? ''} disabled className="app-control app-auth-control w-full bg-slate-100" />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">نام کسب‌وکار</span>
                      <input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="مثلا: گروه ساختمانی سپهر"
                        className="app-control app-auth-control w-full transition focus:border-emerald-500"
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {visibleSuggestions.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setBusinessName(item)}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </label>
                  </div>

                  {createError ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div>
                  ) : null}

                  <button
                    onClick={() => {
                      if (!businessName.trim()) {
                        setCreateError('نام کسب‌وکار الزامی است.');
                        return;
                      }
                      setCreateError('');
                      setStep('payment');
                    }}
                    className="app-button app-auth-button mt-5 transition hover:bg-emerald-700"
                  >
                    ادامه به پرداخت
                  </button>
                </>
              ) : null}

              {step === 'payment' ? (
                <>
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">درگاه پرداخت ظاهری</h2>
                      <p className="mt-1 text-sm text-slate-500">این بخش ماک است. بعد از تکمیل، صفحه لودینگ نمایش داده می‌شود و سپس وارد داشبورد tenant می‌شوید.</p>
                    </div>
                    <button onClick={() => setStep('profile')} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
                      بازگشت
                    </button>
                  </div>

                  <form onSubmit={createTenant} className="space-y-4">
                    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm text-slate-500">مبلغ قابل پرداخت</div>
                          <div className="mt-1 text-xl font-black text-slate-900">
                            {billingCycle === 'monthly' ? selectedPackage.monthlyPrice : selectedPackage.yearlyPrice}
                          </div>
                        </div>
                        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          {selectedPackage.title} - {billingCycle === 'monthly' ? 'ماهیانه' : 'سالیانه'}
                        </div>
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">شماره کارت</span>
                      <input
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm((current) => ({ ...current, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                        placeholder="6219861034567890"
                        dir="ltr"
                        inputMode="numeric"
                        className="app-control app-auth-control w-full text-left transition focus:border-emerald-500"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">نام دارنده کارت</span>
                      <input
                        value={paymentForm.cardHolder}
                        onChange={(e) => setPaymentForm((current) => ({ ...current, cardHolder: e.target.value }))}
                        placeholder={user?.fullName ?? 'نام و نام خانوادگی'}
                        className="app-control app-auth-control w-full transition focus:border-emerald-500"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">تاریخ انقضا</span>
                        <input
                          value={paymentForm.expiry}
                          onChange={(e) => setPaymentForm((current) => ({ ...current, expiry: e.target.value.slice(0, 5) }))}
                          placeholder="08/06"
                          dir="ltr"
                          className="app-control app-auth-control w-full text-left transition focus:border-emerald-500"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">CVV2</span>
                        <input
                          value={paymentForm.cvv2}
                          onChange={(e) => setPaymentForm((current) => ({ ...current, cvv2: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                          placeholder="123"
                          dir="ltr"
                          inputMode="numeric"
                          className="app-control app-auth-control w-full text-left transition focus:border-emerald-500"
                        />
                      </label>
                    </div>

                    {createError ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div>
                    ) : null}

                    <button type="submit" disabled={creating} className="app-button app-auth-button transition hover:bg-emerald-700">
                      {creating ? 'در حال ساخت کسب‌وکار...' : 'پرداخت و ساخت tenant'}
                    </button>
                  </form>
                </>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SelectTenantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[radial-gradient(circle_at_top,#d8fff4,transparent_35%),linear-gradient(135deg,#f7fbfa,#eef6f4)]" />}>
      <SelectTenantPageContent />
    </Suspense>
  );
}
