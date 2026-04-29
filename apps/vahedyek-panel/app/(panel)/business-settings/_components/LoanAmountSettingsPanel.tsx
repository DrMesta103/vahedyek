'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { createInitialLoanSettingsState, type LoanSettingsState } from '../../../lib/businessContractRules';
import {
  CollapsibleTagSelector,
  FieldLabel,
  FinancialAmountInput,
  LoanError,
  LoanLoadingState,
  LoanSuccess,
  cn,
} from './LoanSettingsPrimitives';

type LoanAmountSelection = LoanSettingsState['loanAmountSelectionMode'];

const AMOUNT_MODE_OPTIONS: Array<{ value: Exclude<LoanAmountSelection, 'unselected'>; label: string }> = [
  { value: 'fixed', label: 'وام دارای مبلغ ثابت و مشخص است' },
  { value: 'contract-time', label: 'مبلغ وام در زمان عقد قرارداد مشخص میشود' },
];

const FIXED_MODE_ITEMS = [
  {
    id: 'loan-interest',
    title: 'نرخ سود وام',
    description: 'در این بخش مشخص می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
  },
  {
    id: 'bank-fee',
    title: 'کارمزد وام بانکی',
    description: 'در این بخش مشخص می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
  },
  {
    id: 'participation-profit',
    title: 'سود دوران مشارکت',
    description: 'در این بخش مشخص می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
  },
  {
    id: 'expert-cost',
    title: 'هزینه کارشناسی',
    description: 'در این بخش مشخص می‌کنید هزینه کارشناسی چگونه بر چه اساس تقسیم و محاسبه شود',
  },
  {
    id: 'priority-bond-cost',
    title: 'هزینه اوراق حق تقدم',
    description: 'در این بخش مشخص می‌کنید هزینه کارشناسی چگونه بر چه اساس تقسیم و محاسبه شود',
  },
] as const;

const CONTRACT_TIME_ITEMS = [
  {
    id: 'bank-fee',
    title: 'کارمزد وام بانکی',
    description: 'در این بخش مشخص می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
  },
  {
    id: 'participation-profit',
    title: 'سود دوران مشارکت',
    description: 'در این بخش مشخص می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود',
  },
  {
    id: 'expert-cost',
    title: 'هزینه کارشناسی',
    description: 'در این بخش مشخص می‌کنید هزینه کارشناسی چگونه بر چه اساس تقسیم و محاسبه شود',
  },
] as const;

function LoanSubFlowRow({
  title,
  description,
  first = false,
  href,
}: {
  title: string;
  description: string;
  first?: boolean;
  href?: string;
}) {
  const className = cn(
    'flex w-full items-center justify-between gap-4 px-4 py-5 text-right transition hover:bg-[color:var(--surface-soft)]',
    first ? '' : 'border-t border-[color:var(--border-soft)]',
  );

  const content = (
    <>
      <div className="space-y-2 text-right">
        <h3 className="text-[18px] font-black text-[color:var(--text-strong)] sm:text-[20px]">{title}</h3>
        <p className="text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
      </div>
      <ChevronLeft className="h-5 w-5 shrink-0 text-[color:var(--text-muted)]" />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {content}
    </button>
  );
}

export function LoanAmountSettingsPanel() {
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
          throw new Error(payload.message || 'بارگذاری تنظیمات مبلغ وام انجام نشد.');
        }
        const payload = (await response.json()) as LoanSettingsState;
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'بارگذاری تنظیمات مبلغ وام انجام نشد.');
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

    if (state.loanAmountSelectionMode === 'unselected') {
      setError('ابتدا نوع مبلغ وام را مشخص کنید.');
      return;
    }

    if (state.loanAmountSelectionMode === 'fixed') {
      if (!state.fixedAmount.trim()) {
        setError('مبلغ وام را وارد کنید.');
        return;
      }
      if (!state.loanGracePeriod.trim()) {
        setError('مهلت تنفس را وارد کنید.');
        return;
      }
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
        throw new Error(payload.message || 'ذخیره تنظیمات مبلغ وام انجام نشد.');
      }

      setMessage('تنظیمات مبلغ وام با موفقیت ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات مبلغ وام انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return <LoanLoadingState label="در حال بارگذاری تنظیمات مبلغ وام..." />;
  }

  const listItems = state.loanAmountSelectionMode === 'fixed' ? FIXED_MODE_ITEMS : CONTRACT_TIME_ITEMS;
  const selectedOption =
    state.loanAmountSelectionMode === 'unselected'
      ? null
      : AMOUNT_MODE_OPTIONS.find((option) => option.value === state.loanAmountSelectionMode) ?? null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-[color:var(--border-soft)] pb-4 text-center">
        <h1 className="text-xl font-black text-[color:var(--text-strong)] sm:text-2xl">مبلغ و نرخ سود وام</h1>
        <p className="mt-3 text-sm leading-8 text-[color:var(--text-muted)]">
          در این بخش مشخص می‌کنید مبلغ وام از ابتدا عدد مشخصی دارد یا در زمان عقد قرارداد مشخص میشود
        </p>
      </div>

      <div className="mt-4">
        <CollapsibleTagSelector
          title="انواع مبلغ و نرخ سود وام"
          options={AMOUNT_MODE_OPTIONS}
          value={state.loanAmountSelectionMode === 'unselected' ? null : state.loanAmountSelectionMode}
          selectedLabel={selectedOption?.label}
          onChange={(value) => {
            setState((current) =>
              current
                ? {
                    ...current,
                    loanAmountSelectionMode: value,
                    loanAmountMode: value === 'fixed' ? 'fixed' : current.loanAmountMode,
                  }
                : current,
            );
            setMessage('');
            setError('');
          }}
        />
      </div>

      {state.loanAmountSelectionMode === 'fixed' ? (
        <>
          <section className="border-b border-[color:var(--border-soft)] px-1 py-6">
            <div className="space-y-8 text-right">
              <div className="space-y-4">
                <FieldLabel label="مبلغ وام" required />
                <FinancialAmountInput
                  value={state.fixedAmount}
                  onChange={(fixedAmount) => {
                    setState((current) => (current ? { ...current, fixedAmount } : current));
                    setMessage('');
                    setError('');
                  }}
                  suffix=""
                />
                <p className="text-sm text-[color:var(--text-muted)]">مبلغ وام منتظر در زمان ثبت قرارداد</p>
              </div>

              <div className="space-y-4">
                <FieldLabel label="مهلت تنفس" required />
                <FinancialAmountInput
                  value={state.loanGracePeriod}
                  onChange={(loanGracePeriod) => {
                    setState((current) => (current ? { ...current, loanGracePeriod } : current));
                    setMessage('');
                    setError('');
                  }}
                  suffix=""
                />
                <p className="text-sm text-[color:var(--text-muted)]">
                  مهلت تنفس به گونه ایست که زمان شروع بازپرداخت وام را مشخص میکند. مثال: ۱۲ ماه
                </p>
              </div>
            </div>
          </section>

          <section className="border-b border-[color:var(--border-soft)] bg-[color:var(--surface)]">
            {listItems.map((item, index) => (
              <LoanSubFlowRow
                key={item.id}
                title={item.title}
                description={item.description}
                first={index === 0}
                href={`/business-settings/contract-rules/loan-settings/${item.id}`}
              />
            ))}
          </section>
        </>
      ) : null}

      {state.loanAmountSelectionMode === 'contract-time' ? (
        <section className="border-b border-[color:var(--border-soft)] bg-[color:var(--surface)]">
          {listItems.map((item, index) => (
            <LoanSubFlowRow
              key={item.id}
              title={item.title}
              description={item.description}
              first={index === 0}
              href={`/business-settings/contract-rules/loan-settings/${item.id}`}
            />
          ))}
        </section>
      ) : null}

      {message ? <div className="mt-4"><LoanSuccess message={message} /></div> : null}
      {error ? <div className="mt-4"><LoanError error={error} /></div> : null}

      <div className="fixed inset-x-0 bottom-3 z-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="w-full rounded-xl bg-[#0f8b8d] px-4 py-3 text-base font-black text-white shadow-[0_10px_24px_rgba(15,139,141,0.22)] transition hover:bg-[#0c7b7d] disabled:opacity-60"
          >
            {saving ? 'در حال ذخیره...' : 'ثبت'}
          </button>
        </div>
      </div>
    </section>
  );
}
