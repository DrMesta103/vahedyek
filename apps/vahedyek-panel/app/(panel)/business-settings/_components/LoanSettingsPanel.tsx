'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Percent, WalletCards } from 'lucide-react';
import { BANKS, type LoanSettingsState } from '../../../lib/businessContractRules';

function SelectionChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        active ? 'border-[#a6e8ef] bg-[#a6e8ef] text-[#123b69]' : 'border-[#6e86a3] bg-white text-[#314a67] hover:bg-slate-50'
      }`}
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
        className={`min-w-[92px] rounded-full px-4 py-2.5 text-sm font-black transition-all ${
          !checked ? 'bg-[#a6e8ef] text-[#123b69] shadow-[0_8px_24px_rgba(148,163,184,0.18)]' : 'text-slate-500'
        }`}
      >
        غیرفعال
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`min-w-[92px] rounded-full px-4 py-2.5 text-sm font-black transition-all ${
          checked ? 'bg-[#a6e8ef] text-[#123b69] shadow-[0_8px_24px_rgba(148,163,184,0.18)]' : 'text-slate-500'
        }`}
      >
        فعال
      </button>
    </div>
  );
}

function ConfigCard({
  title,
  description,
  value,
  onClick,
}: {
  title: string;
  description: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface)] px-4 py-4 text-right shadow-[0_10px_24px_var(--shadow-soft)] transition hover:border-[color:var(--theme-action-border)] hover:bg-[color:var(--theme-accent-softer)]"
    >
      <div className="space-y-2">
        <div className="text-sm font-black text-[color:var(--text-strong)]">{title}</div>
        <div className="text-xs leading-6 text-[color:var(--text-muted)]">{description}</div>
        <div className="text-xs font-bold text-[color:var(--theme-action-text)]">{value}</div>
      </div>
    </button>
  );
}

export function LoanSettingsPanel() {
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
      <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[color:var(--border-color)] bg-[color:var(--surface)] p-8 text-center text-sm text-[color:var(--text-muted)]">
          در حال بارگذاری تنظیمات وام...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-5 rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)] backdrop-blur sm:p-6">
        <div className="space-y-3 border-b border-[color:var(--border-soft)] pb-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/business-settings/contract-rules" className="text-sm font-medium text-[color:var(--theme-action-text)] hover:opacity-80">
              بازگشت به فلو تنظیمات
            </Link>
            <p className="text-sm text-[color:var(--text-muted)]">خانه / تنظیمات کسب و کار / تنظیمات مالی و قواعد قراردادی / تنظیمات وام</p>
          </div>
          <div className="space-y-2 text-right">
            <h1 className="text-2xl font-black text-[color:var(--text-strong)] sm:text-3xl">تنظیمات وام</h1>
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">جزئیات تنظیمات وام</p>
          </div>
        </div>

        <section className="rounded-2xl border border-[color:var(--theme-accent-border)] bg-[color:var(--surface-soft)] p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="space-y-2 text-center">
              <h2 className="text-lg font-black text-[color:var(--text-strong)] sm:text-xl">آیا مایل به فعال‌سازی بخش وام در قرارداد هستید؟</h2>
              <a href="#loan-details" className="text-xs font-medium text-[color:var(--theme-action-text)] underline underline-offset-4 sm:text-sm">
                جزئیات تنظیمات وام
              </a>
              <p className="text-xs leading-6 text-[color:var(--text-muted)] sm:text-sm">
                در صورت فعال بودن، می‌توانید تنظیمات مربوط به مبلغ وام را برای قرارداد تعیین کنید.
              </p>
            </div>

            <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-[color:var(--border-color)] bg-[color:var(--surface)] px-3 py-1.5">
              <span className={!state.enabled ? 'text-xs font-bold text-[color:var(--text-strong)] sm:text-sm' : 'text-xs text-[color:var(--text-muted)] sm:text-sm'}>غیرفعال</span>
              <Toggle checked={state.enabled} onChange={(enabled) => setState((current) => (current ? { ...current, enabled } : current))} />
              <span className={state.enabled ? 'text-xs font-bold text-[color:var(--theme-action-text)] sm:text-sm' : 'text-xs text-[color:var(--text-muted)] sm:text-sm'}>فعال</span>
            </div>
          </div>
        </section>

        <section id="loan-details" className="overflow-hidden rounded-2xl border border-[color:var(--theme-accent-border)] bg-[color:var(--surface-soft)]">
          <div className="flex flex-col md:flex-row">
            <button
              type="button"
              onClick={() => setState((current) => (current ? { ...current, loanAmountMode: 'percent' } : current))}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-4 text-sm font-bold transition ${
                state.loanAmountMode === 'percent'
                  ? 'bg-[color:var(--surface)] text-[color:var(--theme-action-text)]'
                  : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface)]'
              }`}
            >
              <Percent className="h-5 w-5" />
              درصدی از مبلغ کل قرارداد
            </button>
            <button
              type="button"
              onClick={() => setState((current) => (current ? { ...current, loanAmountMode: 'fixed' } : current))}
              className={`flex flex-1 items-center justify-center gap-2 border-t border-[color:var(--border-soft)] px-4 py-4 text-sm font-bold transition md:border-r md:border-t-0 ${
                state.loanAmountMode === 'fixed'
                  ? 'bg-[color:var(--surface)] text-[color:var(--theme-action-text)]'
                  : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface)]'
              }`}
            >
              <WalletCards className="h-5 w-5" />
              مبلغ ثابت
            </button>
          </div>

          <div className="border-t border-[color:var(--border-soft)] px-4 py-3 text-xs leading-6 text-[color:var(--text-muted)] sm:px-5 sm:text-sm">
            {state.loanAmountMode === 'fixed'
              ? 'در این روش مبلغ وام به‌صورت عدد ثابت در نظر گرفته می‌شود.'
              : 'در این روش مبلغ وام به‌صورت درصدی از مبلغ کل قرارداد محاسبه می‌شود.'}
          </div>

          <div className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
            <ConfigCard
              title="انتخاب زمان دریافت وام"
              description="مشخص کنید وام بانکی در چه درجه زمانی نسبت به قرارداد پرداخت می‌شود."
              value={
                state.loanTiming === 'before-sign'
                  ? 'انتخاب شده: قبل از ثبت قرارداد'
                  : state.loanTiming === 'after-sign'
                    ? 'انتخاب شده: بعد از ثبت قرارداد'
                    : 'انتخاب شده: بعد از اولین قسط'
              }
              onClick={() =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        loanTiming:
                          current.loanTiming === 'before-sign'
                            ? 'after-sign'
                            : current.loanTiming === 'after-sign'
                              ? 'after-first-installment'
                              : 'before-sign',
                      }
                    : current,
                )
              }
            />
            <ConfigCard
              title="مبلغ وام"
              description={
                state.loanAmountMode === 'fixed'
                  ? 'تعیین کنید مبلغ وام ثابت است یا با درصدی از مبلغ کل قرارداد.'
                  : 'تعیین کنید مبلغ وام با درصدی از مبلغ کل قرارداد محاسبه شود.'
              }
              value={
                state.loanAmountMode === 'fixed'
                  ? `مبلغ ثابت: ${Number(state.fixedAmount || 0).toLocaleString('fa-IR')} تومان`
                  : `درصد از قرارداد: ${state.percentAmount}%`
              }
              onClick={() =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        fixedAmount:
                          current.loanAmountMode === 'fixed'
                            ? current.fixedAmount === '120000000'
                              ? '180000000'
                              : '120000000'
                            : current.fixedAmount,
                        percentAmount:
                          current.loanAmountMode === 'percent'
                            ? current.percentAmount === '15'
                              ? '20'
                              : '15'
                            : current.percentAmount,
                      }
                    : current,
                )
              }
            />
            <ConfigCard
              title="زمان بازپرداخت"
              description="مشخص کنید بازپرداخت وام از چه زمانی آغاز شود."
              value={
                state.repaymentTiming === 'next-month'
                  ? 'شروع بازپرداخت: از ماه بعد'
                  : state.repaymentTiming === 'after-two-months'
                    ? 'شروع بازپرداخت: دو ماه بعد'
                    : 'شروع بازپرداخت: زمان سفارشی'
              }
              onClick={() =>
                setState((current) =>
                  current
                    ? {
                        ...current,
                        repaymentTiming:
                          current.repaymentTiming === 'next-month'
                            ? 'after-two-months'
                            : current.repaymentTiming === 'after-two-months'
                              ? 'custom'
                              : 'next-month',
                      }
                    : current,
                )
              }
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[color:var(--theme-accent-border)] bg-[color:var(--surface-soft)] p-4 sm:p-5">
          <div className="text-right">
            <h3 className="text-lg font-black text-[color:var(--text-strong)]">
              بانک عامل <span className="text-rose-400">*</span>
            </h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
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

        <section className="rounded-2xl border border-[color:var(--theme-accent-border)] bg-[color:var(--surface-soft)] p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-medium text-[color:var(--text-muted)] sm:text-sm">مبلغ وام</span>
              <input
                type="number"
                value={state.loanAmountMode === 'fixed' ? state.fixedAmount : state.percentAmount}
                onChange={(event) =>
                  setState((current) =>
                    current
                      ? {
                          ...current,
                          fixedAmount: current.loanAmountMode === 'fixed' ? event.target.value : current.fixedAmount,
                          percentAmount: current.loanAmountMode === 'percent' ? event.target.value : current.percentAmount,
                        }
                      : current,
                  )
                }
                className="w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] px-3.5 py-2.5 text-sm text-[color:var(--text-body)] outline-none transition-colors focus:border-[color:var(--theme-accent)]"
                placeholder={state.loanAmountMode === 'fixed' ? 'مبلغ ثابت وام' : 'درصد وام'}
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-[color:var(--text-muted)] sm:text-sm">خلاصه تنظیمات</span>
              <div className="rounded-xl border border-[color:var(--theme-accent-border)] bg-[color:var(--theme-accent-softer)] px-3.5 py-3 text-xs leading-6 text-[color:var(--text-body)] sm:text-sm">
                {state.enabled ? 'بخش وام فعال است.' : 'بخش وام غیرفعال است.'}
                <br />
                روش محاسبه: {state.loanAmountMode === 'fixed' ? 'مبلغ ثابت' : 'درصدی از مبلغ قرارداد'}
                <br />
                بانک عامل: {state.selectedBank}
              </div>
            </label>
          </div>
        </section>

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
