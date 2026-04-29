'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { createInitialLoanSettingsState, type LoanSettingsState } from '../../../lib/businessContractRules';
import {
  LoanChoicePills,
  LoanError,
  LoanIntroCard,
  LoanLoadingState,
  LoanPageShell,
  LoanSaveBar,
  LoanSectionCard,
  LoanSuccess,
} from './LoanSettingsPrimitives';

const REPAYMENT_OPTIONS = [
  {
    value: 'next-month',
    label: 'ماه بعد',
    title: 'شروع بازپرداخت از ماه بعد',
    description: 'بازپرداخت از ماه بعد از تاریخ دریافت یا ثبت وام آغاز می‌شود.',
  },
  {
    value: 'after-two-months',
    label: 'دو ماه بعد',
    title: 'شروع بازپرداخت با فاصله دو ماه',
    description: 'برای قراردادهایی که نیاز به تنفس بیشتر دارند، بازپرداخت دو ماه بعد آغاز می‌شود.',
  },
  {
    value: 'custom',
    label: 'قابل تنظیم',
    title: 'زمان بازپرداخت در اختیار تنظیم‌کننده قرارداد',
    description: 'در زمان ثبت قرارداد، کاربر می‌تواند زمان شروع بازپرداخت را با توجه به سیاست فروش تعیین کند.',
  },
] as const;

export function LoanRepaymentSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<LoanSettingsState | null>(null);

  const initialState = useMemo(() => createInitialLoanSettingsState(), []);
  const activeOption = state ? REPAYMENT_OPTIONS.find((option) => option.value === state.repaymentTiming) ?? REPAYMENT_OPTIONS[0] : null;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/business-settings/contract-rules/loan-settings', { cache: 'no-store' });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || 'بارگذاری تنظیمات زمان بازپرداخت انجام نشد.');
        }
        const payload = (await response.json()) as LoanSettingsState;
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'بارگذاری تنظیمات زمان بازپرداخت انجام نشد.');
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
        throw new Error(payload.message || 'ذخیره تنظیمات زمان بازپرداخت انجام نشد.');
      }

      setMessage('تنظیمات زمان بازپرداخت با موفقیت ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات زمان بازپرداخت انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return <LoanLoadingState label="در حال بارگذاری تنظیمات زمان بازپرداخت..." />;
  }

  return (
    <>
      <LoanPageShell
        title="زمان بازپرداخت"
        description="در این بخش زمان شروع بازپرداخت وام را تعیین می‌کنید تا در پیشنهادهای قراردادی از یک چارچوب ثابت پیروی شود."
        backHref="/business-settings/contract-rules/loan-settings"
      >
        <LoanSectionCard className="p-5">
          <div className="space-y-8 text-right">
            <LoanIntroCard
              title="چارچوب شروع بازپرداخت"
              description="یکی از سناریوهای زیر را به عنوان رفتار پیش‌فرض بازپرداخت وام انتخاب کنید."
              icon={CalendarClock}
            />

            <div className="space-y-5">
              <div className="text-right">
                <h4 className="text-[17px] font-black text-[color:var(--text-strong)]">زمان شروع بازپرداخت</h4>
              </div>

              <LoanChoicePills
                options={REPAYMENT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                value={state.repaymentTiming}
                onChange={(repaymentTiming) => {
                  setState((current) => (current ? { ...current, repaymentTiming } : current));
                  setMessage('');
                  setError('');
                }}
              />
            </div>

            {activeOption ? <LoanIntroCard title={activeOption.title} description={activeOption.description} /> : null}
          </div>
        </LoanSectionCard>

        {message ? <LoanSuccess message={message} /> : null}
        {error ? <LoanError error={error} /> : null}
      </LoanPageShell>

      <LoanSaveBar saving={saving} onSave={() => void handleSave()} />
    </>
  );
}
