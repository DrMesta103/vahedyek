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
    <div className="tenant-select-minimal-panel">
      <div className="tenant-select-status-icon">
        <i className="fa fa-building" />
      </div>
      <h1 className="tenant-select-title">کسب‌وکار شما در حال ساخته شدن است</h1>
      <p className="tenant-select-muted">داریم tenant را آماده می‌کنیم و شما را مستقیم وارد داشبورد می‌کنیم.</p>
      <div className="tenant-select-progress">
        <div className="tenant-select-progress-bar" />
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
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('growth');
  const [businessName, setBusinessName] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '6219861034567890',
    cardHolder: 'علی علینقی پور',
    expiry: '08/06',
    cvv2: '123',
  });

  useEffect(() => {
    document.documentElement.classList.add('tenant-select-route');
    document.body.classList.add('tenant-select-route');

    return () => {
      document.documentElement.classList.remove('tenant-select-route');
      document.body.classList.remove('tenant-select-route');
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [tenantsResponse, meResponse] = await Promise.all([
          fetch('/api/auth/tenants', { cache: 'no-store' }),
          fetch('/api/auth/me', { cache: 'no-store' }),
        ]);

        if (tenantsResponse.status === 401 || !meResponse.ok) {
          router.replace('/login');
          return;
        }

        const [tenantsPayload, mePayload] = await Promise.all([tenantsResponse.json(), meResponse.json()]);
        if (!mounted) return;

        const loadedTenants = tenantsPayload.tenants ?? [];
        setTenants(loadedTenants);
        setSuggestedBusinessNames(tenantsPayload.suggestedBusinessNames ?? []);
        setUser(mePayload.user ?? null);
        setStep(loadedTenants.length ? 'list' : 'packages');
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
      const res = await fetch('/api/auth/select-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      if (!res.ok) throw new Error();
      router.push(next);
      router.refresh();
    } catch {
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

  return (
    <div className="tenant-select-page auth-page-refresh">
      <div className="tenant-select-card auth-card-refresh">
        {step === 'loading' ? <div className="tenant-select-loading">در حال بارگذاری...</div> : null}

        {step === 'provisioning' ? <ProvisioningScreen /> : null}

        {step !== 'loading' && step !== 'provisioning' ? (
          <>
            <div className="tenant-select-head">
              <div>
                <div className="tenant-select-kicker">انتخاب کسب‌وکار</div>
                <h1 className="tenant-select-title">
                  {step === 'list' ? 'tenant فعلی را انتخاب کنید' : 'tenant جدید بسازید'}
                </h1>
                <p className="tenant-select-muted">
                  {step === 'list'
                    ? 'از بین tenantهای موجود یکی را انتخاب کنید یا ساخت tenant جدید را شروع کنید.'
                    : 'فرآیند ساخت tenant در همین کارت و بدون باکس توضیحی ادامه پیدا می‌کند.'}
                </p>
              </div>

              {step === 'packages' || step === 'profile' || step === 'payment' ? (
                <div className="tenant-select-step-chip">
                  {step === 'packages' ? '۱. پکیج' : step === 'profile' ? '۲. مالک' : '۳. پرداخت'}
                </div>
              ) : null}
            </div>

            {step === 'list' ? (
              <div className="tenant-select-step">
                <div className="tenant-select-step-body">
                  <div className="tenant-select-list">
                    {tenants.map((tenant) => (
                      <button
                        key={tenant.id}
                        type="button"
                        onClick={() => selectTenant(tenant.id)}
                        disabled={selecting === tenant.id}
                        className="tenant-card tenant-select-item"
                      >
                        <div className="tenant-avatar tenant-select-avatar">{tenant.brandCode}</div>
                        <div className="tenant-select-copy">
                          <div className="tenant-select-item-title">{tenant.name}</div>
                          <div className="tenant-select-item-subtitle">{tenant.slug}</div>
                        </div>
                        <div className="tenant-select-item-meta">
                          {selecting === tenant.id ? 'در حال ورود...' : <i className="fa fa-chevron-left" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tenant-select-step-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateError('');
                      setStep('packages');
                    }}
                    className="tenant-create-btn tenant-select-create"
                  >
                    <i className="fa fa-plus" />
                    ساخت کسب‌وکار جدید
                  </button>
                </div>
              </div>
            ) : null}

            {step === 'packages' ? (
              <div className="tenant-select-step">
                <div className="tenant-select-step-body">
                  <div className="tenant-select-switch">
                    {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => setBillingCycle(cycle)}
                        className={`tenant-select-switch-btn${billingCycle === cycle ? ' is-active' : ''}`}
                      >
                        {cycle === 'monthly' ? 'ماهانه' : 'سالانه'}
                      </button>
                    ))}
                  </div>

                  <div className="tenant-select-packages">
                    {PACKAGE_OPTIONS.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`tenant-select-package${selectedPackageId === pkg.id ? ' is-selected' : ''}`}
                      >
                        <div className="tenant-select-package-head">
                          <div>
                            <div className="tenant-select-item-title">{pkg.title}</div>
                            <div className="tenant-select-muted tenant-select-package-desc">{pkg.description}</div>
                          </div>
                          <div className="tenant-select-package-price">
                            {billingCycle === 'monthly' ? pkg.monthlyPrice : pkg.yearlyPrice}
                          </div>
                        </div>
                        <div className="tenant-select-tags">
                          {pkg.features.map((feature) => (
                            <span key={feature} className="tenant-select-tag">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tenant-select-step-footer">
                  <button type="button" onClick={() => setStep('profile')} className="auth-btn tenant-select-next-btn">
                    ادامه
                  </button>
                </div>
              </div>
            ) : null}

            {step === 'profile' ? (
              <div className="tenant-select-step">
                <div className="tenant-select-step-body">
                  <div className="tenant-select-profile">
                    <label className="auth-field">
                      <span>شماره موبایل</span>
                      <input value={user?.mobile ?? ''} disabled dir="ltr" />
                    </label>

                    <label className="auth-field">
                      <span>نام</span>
                      <input value={user?.firstName ?? ''} disabled />
                    </label>

                    <label className="auth-field">
                      <span>نام خانوادگی</span>
                      <input value={user?.lastName ?? ''} disabled />
                    </label>

                    <label className="auth-field tenant-select-business">
                      <span>نام کسب‌وکار</span>
                      <input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="نام کسب‌وکار را وارد کنید"
                      />
                    </label>

                    <div className="tenant-select-history">
                      <div className="tenant-select-history-head">
                        <span>نام‌های قبلی</span>
                        <span>{recentBusinessNames.length ? `${recentBusinessNames.length} مورد` : 'بدون داده'}</span>
                      </div>
                      <div className="tenant-select-suggestions">
                        {(visibleSuggestions.length ? visibleSuggestions : recentBusinessNames).map((item) => (
                          <button key={item} type="button" onClick={() => setBusinessName(item)} className="tenant-select-suggestion">
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {createError ? <div className="auth-alert auth-alert-error">{createError}</div> : null}
                </div>

                <div className="tenant-select-step-footer">
                  <div className="tenant-select-actions">
                    <button type="button" onClick={() => setStep('packages')} className="tenant-select-back">
                      بازگشت
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!businessName.trim()) {
                          setCreateError('نام کسب‌وکار الزامی است.');
                          return;
                        }
                        setCreateError('');
                        setStep('payment');
                      }}
                      className="auth-btn tenant-select-next-btn"
                    >
                      ادامه
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 'payment' ? (
              <form onSubmit={createTenant} className="tenant-select-step">
                <div className="tenant-select-step-body">
                  <div className="tenant-select-summary">
                    <div className="tenant-select-muted">مبلغ قابل پرداخت</div>
                    <div className="tenant-select-summary-price">
                      {billingCycle === 'monthly' ? selectedPackage.monthlyPrice : selectedPackage.yearlyPrice}
                    </div>
                    <div className="tenant-select-muted">
                      {selectedPackage.title} - {billingCycle === 'monthly' ? 'ماهانه' : 'سالانه'}
                    </div>
                  </div>

                  <label className="auth-field">
                    <span>شماره کارت</span>
                    <input
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm((current) => ({ ...current, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                      placeholder="6219861034567890"
                      dir="ltr"
                      inputMode="numeric"
                    />
                  </label>

                  <label className="auth-field">
                    <span>نام دارنده کارت</span>
                    <input
                      value={paymentForm.cardHolder}
                      onChange={(e) => setPaymentForm((current) => ({ ...current, cardHolder: e.target.value }))}
                      placeholder={user?.fullName ?? 'نام و نام خانوادگی'}
                    />
                  </label>

                  <div className="tenant-select-grid-two">
                    <label className="auth-field">
                      <span>تاریخ انقضا</span>
                      <input
                        value={paymentForm.expiry}
                        onChange={(e) => setPaymentForm((current) => ({ ...current, expiry: e.target.value.slice(0, 5) }))}
                        placeholder="08/06"
                        dir="ltr"
                      />
                    </label>

                    <label className="auth-field">
                      <span>CVV2</span>
                      <input
                        value={paymentForm.cvv2}
                        onChange={(e) => setPaymentForm((current) => ({ ...current, cvv2: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        placeholder="123"
                        dir="ltr"
                        inputMode="numeric"
                      />
                    </label>
                  </div>

                  {createError ? <div className="auth-alert auth-alert-error">{createError}</div> : null}
                </div>

                <div className="tenant-select-step-footer">
                  <div className="tenant-select-actions">
                    <button type="button" onClick={() => setStep('profile')} className="tenant-select-back">
                      بازگشت
                    </button>
                    <button type="submit" disabled={creating} className="auth-btn tenant-select-next-btn">
                      {creating ? 'در حال ساخت...' : 'پرداخت و ساخت tenant'}
                    </button>
                  </div>
                </div>
              </form>
            ) : null}
          </>
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
