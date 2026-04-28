'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Percent, WalletCards } from 'lucide-react';
import { BANKS, createInitialLoanSettingsState, type LoanSettingsState } from '../../../lib/businessContractRules';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function SelectionChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-5 py-2 text-sm font-bold transition',
        active ? 'border-[#a6e8ef] bg-[#a6e8ef] text-[#123b69]' : 'border-[#6e86a3] bg-white text-[#314a67] hover:bg-slate-50',
      )}
    >
      {label}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'min-w-[92px] rounded-full px-4 py-2.5 text-sm font-black transition-all',
          !checked ? 'bg-[#a6e8ef] text-[#123b69] shadow-[0_8px_24px_rgba(148,163,184,0.18)]' : 'text-slate-500',
        )}
      >
        غیرفعال
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'min-w-[92px] rounded-full px-4 py-2.5 text-sm font-black transition-all',
          checked ? 'bg-[#a6e8ef] text-[#123b69] shadow-[0_8px_24px_rgba(148,163,184,0.18)]' : 'text-slate-500',
        )}
      >
        فعال
      </button>
    </div>
  );
}

function StatusBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-[color:var(--theme-action-border)] px-3 py-1 text-xs font-bold text-[color:var(--theme-action-text)]">
      تنظیمات انجام‌شده
    </span>
  );
}

function NextPageCard({
  href,
  title,
  description,
  configured,
}: {
  href: string;
  title: string;
  description: string;
  configured: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-[18px] bg-[#f8fbfc] px-6 py-6 transition hover:bg-[#f1f8fa]"
    >
      <ChevronLeft className="h-6 w-6 shrink-0 text-[#58738f] transition group-hover:-translate-x-0.5" />
      <div className="flex-1 text-right">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge visible={configured} />
          <h3 className="text-[28px] font-black leading-none text-[color:var(--text-strong)] sm:text-[32px]">{title}</h3>
        </div>
        <p className="mt-3 text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
      </div>
    </Link>
  );
}

const SECTION_LINKS = {
  timing: '/business-settings/contract-rules/loan-settings/timing',
  amount: '/business-settings/contract-rules/loan-settings/amount',
  repayment: '/business-settings/contract-rules/loan-settings/repayment',
} as const;

export function LoanSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<LoanSettingsState | null>(null);

  const initialState = useMemo(() => createInitialLoanSettingsState(), []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/business-settings/contract-rules/loan-settings', { cache: 'no-store' });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || 'بارگذاری تنظیمات وام انجام نشد.');
        }
        const payload = (await response.json()) as LoanSettingsState;
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'بارگذاری تنظیمات وام انجام نشد.');
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
        throw new Error(payload.message || 'ذخیره تنظیمات وام انجام نشد.');
      }
      setMessage('تنظیمات وام با موفقیت ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات وام انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[color:var(--border-color)] bg-[color:var(--surface)] p-8 text-center text-sm text-[color:var(--text-muted)]">
          در حال بارگذاری تنظیمات وام...
        </div>
      </section>
    );
  }

  const timingConfigured = state.enabled && state.loanTiming !== initialState.loanTiming;
  const amountConfigured =
    state.enabled &&
    (state.loanAmountMode === 'fixed'
      ? state.fixedAmount !== initialState.fixedAmount
      : state.percentAmount !== initialState.percentAmount);
  const repaymentConfigured = state.enabled && state.repaymentTiming !== initialState.repaymentTiming;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-5 rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)] backdrop-blur sm:p-6">
        <section className="rounded-[24px] border border-[color:var(--theme-accent-border)] bg-[color:var(--surface)] p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 text-right">
              <h2 className="text-xl font-black text-[color:var(--text-strong)] sm:text-2xl">آیا مایل به فعال‌سازی بخش وام در قرارداد هستید؟</h2>
              <p className="text-sm leading-7 text-[color:var(--text-muted)]">
                در صورت فعال بودن، می‌توانید تنظیمات مربوط به مبلغ وام را برای قرارداد تعیین کنید.
              </p>
            </div>
            <div className="self-start lg:self-auto">
              <Toggle checked={state.enabled} onChange={(enabled) => setState((current) => (current ? { ...current, enabled } : current))} />
            </div>
          </div>
        </section>

        {state.enabled ? (
          <>
            <section id="loan-details" className="overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)]">
              <div className="flex flex-wrap border-b border-[color:var(--border-soft)]">
                <button
                  type="button"
                  onClick={() => setState((current) => (current ? { ...current, loanAmountMode: 'percent' } : current))}
                  className={cn(
                    'group relative flex min-w-[220px] flex-1 flex-col items-center justify-center gap-3 px-3 py-5 text-center transition',
                    state.loanAmountMode === 'percent' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-800',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full border transition',
                      state.loanAmountMode === 'percent' ? 'border-[#a6e8ef] bg-[#a6e8ef] text-[#123b69]' : 'border-slate-200 bg-white text-slate-500',
                    )}
                  >
                    <Percent className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-bold">درصدی از مبلغ کل قرارداد</span>
                  <span className={cn('absolute inset-x-4 bottom-0 h-[2px] transition', state.loanAmountMode === 'percent' ? 'bg-[#a6e8ef]' : 'bg-transparent group-hover:bg-slate-200')} />
                </button>
                <button
                  type="button"
                  onClick={() => setState((current) => (current ? { ...current, loanAmountMode: 'fixed' } : current))}
                  className={cn(
                    'group relative flex min-w-[220px] flex-1 flex-col items-center justify-center gap-3 border-r border-[color:var(--border-soft)] px-3 py-5 text-center transition',
                    state.loanAmountMode === 'fixed' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-800',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full border transition',
                      state.loanAmountMode === 'fixed' ? 'border-[#a6e8ef] bg-[#a6e8ef] text-[#123b69]' : 'border-slate-200 bg-white text-slate-500',
                    )}
                  >
                    <WalletCards className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-bold">مبلغ ثابت</span>
                  <span className={cn('absolute inset-x-4 bottom-0 h-[2px] transition', state.loanAmountMode === 'fixed' ? 'bg-[#a6e8ef]' : 'bg-transparent group-hover:bg-slate-200')} />
                </button>
              </div>

              <div className="border-t border-[color:var(--border-soft)] px-5 py-4 text-center text-sm leading-7 text-[color:var(--text-muted)]">
                {state.loanAmountMode === 'fixed'
                  ? 'در این روش، مبلغ وام به‌صورت عدد ثابت در نظر گرفته می‌شود.'
                  : 'در این روش، مبلغ وام به‌صورت درصدی از مبلغ کل قرارداد محاسبه می‌شود.'}
              </div>
            </section>

            <div className="space-y-3">
              <NextPageCard
                href={SECTION_LINKS.timing}
                title="انتخاب زمان دریافت وام"
                description="مشخص کنید وام بانکی در چه درجه زمانی نسبت به قرارداد پرداخت می‌شود."
                configured={timingConfigured}
              />
              <NextPageCard
                href={SECTION_LINKS.amount}
                title="مبلغ وام"
                description="تعیین کنید مبلغ وام ثابت است یا درصدی از مبلغ کل قرارداد."
                configured={amountConfigured}
              />
              <NextPageCard
                href={SECTION_LINKS.repayment}
                title="زمان بازپرداخت"
                description="مشخص کنید بازپرداخت وام از چه زمانی آغاز شود."
                configured={repaymentConfigured}
              />
            </div>

            <section className="rounded-[24px] border border-[color:var(--theme-accent-border)] bg-[color:var(--surface)] p-5">
              <div className="text-right">
                <h3 className="text-lg font-black text-[color:var(--text-strong)]">
                  بانک عامل <span className="text-rose-400">*</span>
                </h3>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2.5">
                {BANKS.map((bank) => (
                  <SelectionChip
                    key={bank}
                    label={bank}
                    active={state.selectedBank === bank}
                    onClick={() => setState((current) => (current ? { ...current, selectedBank: bank } : current))}
                  />
                ))}
              </div>
            </section>
          </>
        ) : null}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-xl bg-[color:var(--theme-accent)] px-8 py-2.5 text-sm font-bold text-[color:var(--theme-on-accent)] transition-colors hover:bg-[color:var(--theme-accent-strong)] disabled:opacity-60"
          >
            {saving ? 'در حال ذخیره...' : 'ثبت'}
          </button>
        </div>

        {message ? (
          <div className="rounded-2xl border border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] px-4 py-3 text-sm text-[color:var(--theme-action-text)]">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c] dark:border-[color:var(--theme-warning-border)] dark:bg-[color:var(--theme-warning-bg)] dark:text-[color:var(--theme-warning-text)]">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
