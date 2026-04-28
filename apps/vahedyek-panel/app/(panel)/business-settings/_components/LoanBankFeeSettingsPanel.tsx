'use client';

import { CircleDollarSign, Combine, Percent } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type LoanSettingsState } from '../../../lib/businessContractRules';
import {
  ContractRegistrationSwitch,
  FieldLabel,
  FinancialAmountInput,
  LoanError,
  LoanLoadingState,
  LoanSaveBar,
  LoanSuccess,
  LoanTabButton,
} from './LoanSettingsPrimitives';

const FEE_MODE_OPTIONS: Array<{
  value: LoanSettingsState['loanBankFeeMode'];
  title: string;
  description: string;
  icon: typeof CircleDollarSign;
}> = [
  {
    value: 'fixed',
    title: 'مبلغ ثابت',
    description: 'مبلغ ثابت',
    icon: CircleDollarSign,
  },
  {
    value: 'percent',
    title: 'درصدی از مبلغ وام',
    description: 'درصدی از مبلغ وام',
    icon: Percent,
  },
  {
    value: 'combined',
    title: 'ترکیبی از مبلغ ثابت و درصد',
    description: 'ترکیبی از مبلغ ثابت و درصد',
    icon: Combine,
  },
];

function ResponsibilityRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div dir="ltr" className="flex items-start justify-between gap-4">
      <ContractRegistrationSwitch checked={checked} onChange={onChange} />
      <div dir="rtl" className="space-y-2 text-right">
        <h3 className="text-[18px] font-black text-[color:var(--text-strong)] sm:text-[20px]">{title}</h3>
        <p className="text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
      </div>
    </div>
  );
}

export function LoanBankFeeSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<LoanSettingsState | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/business-settings/contract-rules/loan-settings', { cache: 'no-store' });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || 'بارگذاری تنظیمات کارمزد وام بانکی انجام نشد.');
        }
        const payload = (await response.json()) as LoanSettingsState;
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'بارگذاری تنظیمات کارمزد وام بانکی انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!state) return;

    if (!state.loanBankFeeBankPolicyEnabled && !state.loanBankFeeValue.trim()) {
      setError('میزان کارمزد وام بانکی را وارد کنید.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await fetch('/api/business-settings/contract-rules/loan-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || 'ذخیره تنظیمات کارمزد وام بانکی انجام نشد.');
      }

      setMessage('تنظیمات کارمزد وام بانکی با موفقیت ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات کارمزد وام بانکی انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return <LoanLoadingState label="در حال بارگذاری تنظیمات کارمزد وام بانکی..." />;
  }

  const feeSuffix = state.loanBankFeeMode === 'fixed' ? '' : '%';

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-[color:var(--border-soft)] pb-4 text-center">
        <h1 className="text-xl font-black text-[color:var(--text-strong)] sm:text-2xl">کارمزد وام بانکی</h1>
        <p className="mt-3 text-sm leading-8 text-[color:var(--text-muted)]">
          در این بخش مشخص می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص می‌شود
        </p>
      </div>

      <section className="mt-4 rounded-[24px] bg-[color:var(--surface)] px-4 py-6 text-right">
        <p className="text-sm leading-8 text-[color:var(--text-muted)]">
          در صورتی که سود مشارکت در این وام در نظر گرفته شده است، مشخص کنید که پرداخت کارمزد به عهده کدام طرف قرارداد میباشد
        </p>
        <h2 className="mt-2 text-[20px] font-black text-[color:var(--text-strong)]">کارمزد وام بانکی به عهده کیست؟</h2>
      </section>

      <section className="mt-4 space-y-6 rounded-[24px] bg-[color:var(--surface)] px-4 py-6">
        <ResponsibilityRow
          title="با خریدار است"
          description="خریدار میبایست کارمزد وام بانکی را پرداخت کند"
          checked={state.loanBankFeeBuyer}
          onChange={(value) => {
            setState((current) => (current ? { ...current, loanBankFeeBuyer: value } : current));
            setMessage('');
            setError('');
          }}
        />

        <ResponsibilityRow
          title="با سازنده است"
          description="سازنده میبایست کارمزد وام بانکی را پرداخت کند"
          checked={state.loanBankFeeSeller}
          onChange={(value) => {
            setState((current) => (current ? { ...current, loanBankFeeSeller: value } : current));
            setMessage('');
            setError('');
          }}
        />
      </section>

      <section className="mt-4 rounded-[24px] bg-[color:var(--surface)] px-4 py-6">
        <div dir="ltr" className="flex items-start justify-between gap-4">
          <ContractRegistrationSwitch
            checked={state.loanBankFeeBankPolicyEnabled}
            onChange={(value) => {
              setState((current) =>
                current
                  ? {
                      ...current,
                      loanBankFeeBankPolicyEnabled: value,
                      loanBankFeeValue: value ? '' : current.loanBankFeeValue,
                    }
                  : current,
              );
              setMessage('');
              setError('');
            }}
          />
          <div dir="rtl" className="space-y-3 text-right">
            <h2 className="text-[20px] font-black leading-8 text-[color:var(--text-strong)]">
              میزان کارمزد وام بانکی برابر سیاست های بانکی در زمان دریافت وام مشخص خواهد شد
            </h2>
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">
              درصورتی که کارمزد متفاوت از سیاست های بانکی میباشد میتوانید این بخش را غیر فعال کرده و میزان سود مدنظر خود را وارد کنید.
            </p>
          </div>
        </div>
      </section>

      {!state.loanBankFeeBankPolicyEnabled ? (
        <>
          <section className="mt-4 rounded-[24px] bg-[color:var(--surface)] px-2 py-4">
            <div className="grid gap-2 md:grid-cols-3">
              {FEE_MODE_OPTIONS.map((option) => (
                <LoanTabButton
                  key={option.value}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  active={state.loanBankFeeMode === option.value}
                  onClick={() => {
                    setState((current) => (current ? { ...current, loanBankFeeMode: option.value } : current));
                    setMessage('');
                    setError('');
                  }}
                />
              ))}
            </div>
          </section>

          <section className="mt-4 rounded-[24px] bg-[color:var(--surface)] px-4 py-6">
            <div className="space-y-4 text-right">
              <FieldLabel label="میزان کارمزد وام بانکی" required />
              <FinancialAmountInput
                value={state.loanBankFeeValue}
                onChange={(loanBankFeeValue) => {
                  setState((current) => (current ? { ...current, loanBankFeeValue } : current));
                  setMessage('');
                  setError('');
                }}
                suffix={feeSuffix}
              />
              <p className="text-sm text-[color:var(--text-muted)]">
                کارمزد وام دریافتی که برای انجام هزینه های اداری و تقسیط اقساط و همچنین اعتبارسنجی و ... بانک دریافت میکند.
              </p>
            </div>
          </section>
        </>
      ) : null}

      {message ? <div className="mt-4"><LoanSuccess message={message} /></div> : null}
      {error ? <div className="mt-4"><LoanError error={error} /></div> : null}

      <LoanSaveBar saving={saving} onSave={() => void handleSave()} />
    </section>
  );
}
