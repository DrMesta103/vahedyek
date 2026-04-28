'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Landmark } from 'lucide-react';
import { BANKS, createInitialLoanSettingsState, type LoanSettingsState } from '../../../lib/businessContractRules';
import {
  CollapsibleTagSelector,
  ContractRegistrationSwitch,
  LoanError,
  LoanIntroCard,
  LoanLoadingState,
  LoanPageShell,
  LoanSaveBar,
  LoanSectionCard,
  LoanSuccess,
} from './LoanSettingsPrimitives';

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
      className="group flex items-center justify-between gap-4 rounded-[20px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-5 py-5 transition hover:border-[color:var(--theme-action-border)] hover:bg-[color:var(--surface-soft)]"
    >
      <ChevronLeft className="h-5 w-5 shrink-0 text-[color:var(--text-muted)] transition group-hover:-translate-x-0.5 group-hover:text-[color:var(--theme-action-text)]" />
      <div className="flex-1 text-right">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {configured ? (
            <span className="rounded-full border border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] px-3 py-1 text-xs font-bold text-[color:var(--theme-action-text)]">
              تنظیمات انجام‌شده
            </span>
          ) : null}
          <h3 className="text-lg font-black text-[color:var(--text-strong)] sm:text-xl">{title}</h3>
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
    return <LoanLoadingState label="در حال بارگذاری تنظیمات وام..." />;
  }

  const timingConfigured =
    state.enabled &&
    (state.loanTiming !== initialState.loanTiming || state.loanReceivedDate !== initialState.loanReceivedDate);
  const amountConfigured =
    state.enabled &&
    (state.loanAmountSelectionMode !== initialState.loanAmountSelectionMode ||
      state.fixedAmount !== initialState.fixedAmount ||
      state.loanGracePeriod !== initialState.loanGracePeriod);
  const repaymentConfigured = state.enabled && state.repaymentTiming !== initialState.repaymentTiming;

  return (
    <>
      <LoanPageShell
        title="تنظیمات وام"
        description="در این بخش چارچوب نمایش وام در قراردادها را مشخص می‌کنید؛ از فعال‌سازی این بخش تا زمان دریافت، مبلغ و زمان بازپرداخت."
      >
        <LoanSectionCard className="p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 text-right">
              <h2 className="text-xl font-black text-[color:var(--text-strong)]">فعال‌سازی بخش وام در قرارداد</h2>
              <p className="text-sm leading-7 text-[color:var(--text-muted)]">
                با فعال بودن این بخش، در زمان ثبت قرارداد امکان تعریف وام بانکی بر اساس تنظیمات این صفحه نمایش داده می‌شود.
              </p>
              {!state.enabled ? <p className="text-sm text-[color:var(--text-muted)]">برای مشاهده جزئیات، این بخش را فعال کنید.</p> : null}
            </div>
            <div className="self-start lg:self-auto">
              <ContractRegistrationSwitch
                checked={state.enabled}
                variant="segmented"
                onChange={(enabled) => setState((current) => (current ? { ...current, enabled } : current))}
              />
            </div>
          </div>
        </LoanSectionCard>

        {state.enabled ? (
          <>
            <LoanSectionCard className="p-5">
              <div className="space-y-5 text-right">
                <LoanIntroCard
                  title="فلو تنظیمات وام"
                  description="برای حفظ یکپارچگی UI و بیزینس، تنظیمات وام در سه بخش مستقل انجام می‌شود. هر کارت شما را به جزئیات همان بخش می‌برد."
                  icon={Landmark}
                />
                <div className="space-y-3">
                  <NextPageCard
                    href={SECTION_LINKS.timing}
                    title="انتخاب زمان دریافت وام"
                    description="مشخص کنید وام بانکی در چه زمان‌بندی‌ای نسبت به قرارداد دریافت شده یا دریافت خواهد شد."
                    configured={timingConfigured}
                  />
                  <NextPageCard
                    href={SECTION_LINKS.amount}
                    title="مبلغ وام"
                    description="مشخص کنید مبلغ وام ثابت است یا درصدی از مبلغ کل قرارداد."
                    configured={amountConfigured}
                  />
                  <NextPageCard
                    href={SECTION_LINKS.repayment}
                    title="زمان بازپرداخت"
                    description="زمان شروع بازپرداخت وام را برای نمایش در قراردادها تعیین کنید."
                    configured={repaymentConfigured}
                  />
                </div>
              </div>
            </LoanSectionCard>

            <LoanSectionCard className="p-5">
              <div className="space-y-5 text-right">
                <LoanIntroCard
                  title="بانک عامل"
                  description="بانک پیش‌فرض وام را مشخص کنید تا در زمان ثبت قرارداد، همین گزینه به صورت پیش‌فرض انتخاب شود."
                />
                <CollapsibleTagSelector
                  title="انتخاب بانک عامل"
                  options={BANKS.map((bank) => ({ value: bank, label: bank }))}
                  value={state.selectedBank}
                  onChange={(selectedBank) => setState((current) => (current ? { ...current, selectedBank } : current))}
                />
                <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-4 text-sm leading-7 text-[color:var(--text-muted)]">
                  بانک انتخاب‌شده: <span className="font-black text-[color:var(--text-strong)]">{state.selectedBank}</span>
                </div>
              </div>
            </LoanSectionCard>
          </>
        ) : null}

        {message ? <LoanSuccess message={message} /> : null}
        {error ? <LoanError error={error} /> : null}
      </LoanPageShell>

      <LoanSaveBar saving={saving} onSave={() => void handleSave()} />
    </>
  );
}
