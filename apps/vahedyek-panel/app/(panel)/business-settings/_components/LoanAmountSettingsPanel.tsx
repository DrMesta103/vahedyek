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
  { value: 'fixed', label: 'مبلغ ثابت و مشخص' },
  { value: 'contract-time', label: 'مبلغ وابسته به زمان قرارداد' },
];

const FIXED_MODE_ITEMS = [
  {
    id: 'loan-interest',
    title: 'سود وام',
    description: 'در این حالت سود وام به‌صورت مستقل تنظیم می‌شود.',
  },
  {
    id: 'bank-fee',
    title: 'کارمزد بانک',
    description: 'در این حالت کارمزد بانک نیز در کنار سایر موارد تنظیم می‌شود.',
  },
  {
    id: 'participation-profit',
    title: 'سود مشارکت',
    description: 'در این حالت سود مشارکت هم در محاسبات قرار می‌گیرد.',
  },
  {
    id: 'expert-cost',
    title: 'کارشناسی',
    description: 'در این حالت کارمزد کارشناسی به‌صورت جداگانه لحاظ می‌شود.',
  },
  {
    id: 'priority-bond-cost',
    title: 'کارمزد سند رهن',
    description: 'در این حالت کارمزد سند رهن جداگانه در نظر گرفته می‌شود.',
  },
] as const;

const CONTRACT_TIME_ITEMS = [
  {
    id: 'bank-fee',
    title: 'کارمزد بانک',
    description: 'در این حالت کارمزد بانک نیز کنار سایر موارد محاسبه می‌شود.',
  },
  {
    id: 'participation-profit',
    title: 'سود مشارکت',
    description: 'در این حالت سود مشارکت هم در محاسبات قرار می‌گیرد.',
  },
  {
    id: 'expert-cost',
    title: 'کارشناسی',
    description: 'در این حالت کارمزد کارشناسی به‌صورت جداگانه لحاظ می‌شود.',
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
          throw new Error(payload.message || 'دریافت تنظیمات مبلغ وام ناموفق بود.');
        }
        const payload = (await response.json()) as LoanSettingsState;
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'دریافت تنظیمات مبلغ وام ناموفق بود.');
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
      setError('نوع مبلغ وام را مشخص کنید.');
      return;
    }

    if (state.loanAmountSelectionMode === 'fixed') {
      if (!state.fixedAmount.trim()) {
        setError('مبلغ ثابت را وارد کنید.');
        return;
      }
      if (!state.loanGracePeriod.trim()) {
        setError('مدت تنفس را وارد کنید.');
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
        throw new Error(payload.message || 'ذخیره تنظیمات مبلغ وام ناموفق بود.');
      }

      setMessage('تنظیمات مبلغ وام با موفقیت ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات مبلغ وام ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return <LoanLoadingState label="در حال دریافت تنظیمات مبلغ وام..." />;
  }

  const listItems = state.loanAmountSelectionMode === 'fixed' ? FIXED_MODE_ITEMS : CONTRACT_TIME_ITEMS;
  const selectedOption =
    state.loanAmountSelectionMode === 'unselected'
      ? null
      : AMOUNT_MODE_OPTIONS.find((option) => option.value === state.loanAmountSelectionMode) ?? null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-[color:var(--border-soft)] pb-4 text-center">
        <h1 className="text-xl font-black text-[color:var(--text-strong)] sm:text-2xl">مبلغ وام</h1>
        <p className="mt-3 text-sm leading-8 text-[color:var(--text-muted)]">
          در این بخش نوع مبلغ وام و وضعیت نمایش آن را تعیین می‌کنید.
        </p>
      </div>

      <div className="mt-4">
        <CollapsibleTagSelector
          title="انتخاب نوع مبلغ وام"
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
                <FieldLabel label="مبلغ ثابت" required />
                <FinancialAmountInput
                  value={state.fixedAmount}
                  onChange={(fixedAmount) => {
                    setState((current) => (current ? { ...current, fixedAmount } : current));
                    setMessage('');
                    setError('');
                  }}
                  suffix=""
                />
                <p className="text-sm text-[color:var(--text-muted)]">مبلغ ثابت را به‌صورت عددی وارد کنید.</p>
              </div>

              <div className="space-y-4">
                <FieldLabel label="مدت تنفس" required />
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
                  مدت تنفس را بر حسب ماه یا روز وارد کنید.
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

      <div className="fixed inset-x-0 bottom-6 z-20 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="mx-auto flex max-w-4xl justify-end">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="pointer-events-auto inline-flex h-10 w-[120px] whitespace-nowrap items-center justify-center rounded-[8px] border border-[#065f46] bg-[#065f46] px-3 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(6,95,70,0.28)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#054e39] hover:shadow-[0_10px_20px_rgba(6,95,70,0.16)] active:translate-y-0 active:shadow-none disabled:cursor-wait disabled:hover:translate-y-0 disabled:opacity-60"
          >
            {saving ? 'در حال ذخیره...' : 'ثبت'}
          </button>
        </div>
      </div>
    </section>
  );
}



