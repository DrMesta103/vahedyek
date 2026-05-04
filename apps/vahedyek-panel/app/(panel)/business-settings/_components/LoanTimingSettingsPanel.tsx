'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import {
  LOAN_TIMING_OPTIONS,
  createInitialLoanSettingsState,
  type LoanSettingsState,
} from '../../../lib/businessContractRules';
import {
  FieldLabel,
  LoanChoicePills,
  LoanDateInput,
  LoanError,
  LoanIntroCard,
  LoanLoadingState,
  LoanPageShell,
  LoanSaveBar,
  LoanSectionCard,
  LoanSuccess,
} from './LoanSettingsPrimitives';

export function LoanTimingSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<LoanSettingsState | null>(null);

  const initialState = useMemo(() => createInitialLoanSettingsState(), []);
  const selectedOption = state ? LOAN_TIMING_OPTIONS.find((option) => option.id === state.loanTiming) ?? LOAN_TIMING_OPTIONS[0] : null;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/business-settings/contract-rules/loan-settings', { cache: 'no-store' });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || 'بارگذاری تنظیمات زمان دریافت وام انجام نشد.');
        }
        const payload = (await response.json()) as LoanSettingsState;
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'بارگذاری تنظیمات زمان دریافت وام انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleTimingChange = (nextTiming: LoanSettingsState['loanTiming']) => {
    setState((current) => {
      if (!current) return current;
      const requiresDate = LOAN_TIMING_OPTIONS.find((option) => option.id === nextTiming)?.requiresDate;
      return {
        ...current,
        loanTiming: nextTiming,
        loanReceivedDate: requiresDate ? current.loanReceivedDate : '',
      };
    });
    setMessage('');
    setError('');
  };

  const handleSave = async () => {
    if (!state) return;

    if (selectedOption?.requiresDate && !state.loanReceivedDate.trim()) {
      setError('برای این حالت باید تاریخ دریافت وام را مشخص کنید.');
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
        throw new Error(payload.message || 'ذخیره تنظیمات زمان دریافت وام انجام نشد.');
      }

      setMessage('تنظیمات زمان دریافت وام با موفقیت ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات زمان دریافت وام انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return <LoanLoadingState label="در حال بارگذاری تنظیمات زمان دریافت وام..." />;
  }

  return (
    <>
      <LoanPageShell
        title="انتخاب زمان دریافت وام"
        description="در این مرحله مشخص می‌کنید وام بانکی نسبت به زمان انعقاد قرارداد چه وضعیتی دارد و در صورت نیاز، تاریخ دریافت آن را هم ثبت می‌کنید."
        backHref="/business-settings/contract-rules/loan-settings"
      >
        <LoanSectionCard className="p-5">
          <div className="space-y-6 text-right">
            <LoanIntroCard
              title="وضعیت دریافت وام"
              description="یکی از سناریوهای زیر را انتخاب کنید تا رفتار وام در قراردادها به صورت یکدست نمایش داده شود."
              icon={CalendarDays}
            />
            <LoanChoicePills
              ariaLabel="وضعیت دریافت وام"
              options={LOAN_TIMING_OPTIONS.map((option) => ({ value: option.id, label: option.label }))}
              value={state.loanTiming}
              onChange={handleTimingChange}
            />
            {selectedOption ? <LoanIntroCard title={selectedOption.label} description={selectedOption.description} /> : null}
          </div>
        </LoanSectionCard>

        {selectedOption?.requiresDate ? (
          <LoanSectionCard className="p-5">
            <div className="space-y-4 text-right">
              <FieldLabel label="تاریخ دریافت وام" required />
              <p className="text-sm leading-7 text-[color:var(--text-muted)]">{selectedOption.helperText}</p>
              <LoanDateInput
                value={state.loanReceivedDate}
                onChange={(loanReceivedDate) => {
                  setState((current) => (current ? { ...current, loanReceivedDate } : current));
                  setMessage('');
                  setError('');
                }}
                placeholder="تاریخ دریافت وام را انتخاب کنید"
              />
            </div>
          </LoanSectionCard>
        ) : null}

        {message ? <LoanSuccess message={message} /> : null}
        {error ? <LoanError error={error} /> : null}
      </LoanPageShell>

      <LoanSaveBar saving={saving} onSave={() => void handleSave()} />
    </>
  );
}
