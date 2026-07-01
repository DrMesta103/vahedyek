'use client';

import { useEffect, useState } from 'react';
import { createInitialLoanSettingsState, type LoanSettingsState } from '../../../lib/businessContractRules';
import {
  ContractRegistrationSwitch,
  FieldLabel,
  FinancialAmountInput,
  LoanError,
  LoanLoadingState,
  LoanSaveBar,
  LoanSuccess,
} from './LoanSettingsPrimitives';

export function LoanInterestSettingsPanel() {
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
          throw new Error(payload.message || '???????? ??????? ??? ??? ??? ????? ???.');
        }
        const payload = (await response.json()) as LoanSettingsState;
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : '???????? ??????? ??? ??? ??? ????? ???.');
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

    if (state.loanBankInterestEnabled && !state.loanBankInterestRate.trim()) {
      setError('??? ??? ??? ?? ???? ????.');
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
        throw new Error(payload.message || '????? ??????? ??? ??? ??? ????? ???.');
      }

      setMessage('??????? ??? ??? ??? ?? ?????? ????? ??.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '????? ??????? ??? ??? ??? ????? ???.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return <LoanLoadingState label="?? ??? ???????? ??????? ??? ??? ???..." />;
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-[color:var(--border-soft)] pb-4 text-center">
        <h1 className="text-xl font-black text-[color:var(--text-strong)] sm:text-2xl">??? ??? ???</h1>
        <p className="mt-3 text-sm leading-8 text-[color:var(--text-muted)]">
          ?? ??? ??? ???? ??????? ???? ??? ?? ????? ??? ????? ???? ?? ?? ???? ??? ??????? ???? ?????
        </p>
      </div>

      <section className="mt-4 rounded-[8px] bg-[color:var(--surface)] px-4 py-6">
        <div dir="ltr" className="flex items-start justify-between gap-4">
          <ContractRegistrationSwitch
            checked={state.loanBankInterestEnabled}
            onChange={(loanBankInterestEnabled) => {
              setState((current) =>
                current
                  ? {
                      ...current,
                      loanBankInterestEnabled,
                      loanBankInterestRate: loanBankInterestEnabled ? current.loanBankInterestRate : '',
                    }
                  : current,
              );
              setMessage('');
              setError('');
            }}
          />
          <div dir="rtl" className="space-y-3 text-right">
            <h2 className="text-[20px] font-black leading-8 text-[color:var(--text-strong)]">
              ??? ??? ??? ????? ?? ????? ????? ??? ????? ?? ???? ?????? ??? ???? ????? ??
            </h2>
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">
              ?????? ?? ??? ??? ?? ????? ?????? ?? ????? ??? ????? ?????? ???????? ??? ??? ?? ??? ???? ???? ? ????? ??? ????? ??? ?? ???? ????.
            </p>
          </div>
        </div>
      </section>

      {!state.loanBankInterestEnabled ? (
        <section className="mt-4 rounded-[8px] bg-[color:var(--surface)] px-4 py-6">
          <div className="space-y-4 text-right">
            <FieldLabel label="??? ??? ???" />
            <FinancialAmountInput
              value={state.loanBankInterestRate}
              onChange={(loanBankInterestRate) => {
                setState((current) => (current ? { ...current, loanBankInterestRate } : current));
                setMessage('');
                setError('');
              }}
              suffix="%"
            />
            <p className="text-sm text-[color:var(--text-muted)]">????? ??? ??? ????? ?? ?? ??? ??? ???? ????. ???? (??%)</p>
          </div>
        </section>
      ) : null}

      {message ? <div className="mt-4"><LoanSuccess message={message} /></div> : null}
      {error ? <div className="mt-4"><LoanError error={error} /></div> : null}

      <LoanSaveBar saving={saving} onSave={() => void handleSave()} />
    </section>
  );
}

