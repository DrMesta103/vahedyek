'use client';

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
} from './LoanSettingsPrimitives';

type BuyerKey = 'loanParticipationBuyer' | 'loanExpertBuyer' | 'loanPriorityBondBuyer';
type SellerKey = 'loanParticipationSeller' | 'loanExpertSeller' | 'loanPriorityBondSeller';
type PolicyKey =
  | 'loanParticipationBankPolicyEnabled'
  | 'loanExpertBankPolicyEnabled'
  | 'loanPriorityBondBankPolicyEnabled';
type RateKey = 'loanParticipationRate' | 'loanExpertRate' | 'loanPriorityBondRate';

type Props = {
  title: string;
  loadingLabel: string;
  saveMessage: string;
  loadErrorMessage: string;
  saveErrorMessage: string;
  introText: string;
  responsibilityTitle: string;
  policyTitle: string;
  policyDescription: string;
  inputLabel: string;
  inputHelper: string;
  buyerKey: BuyerKey;
  sellerKey: SellerKey;
  policyKey: PolicyKey;
  rateKey: RateKey;
};

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

export function LoanSharedResponsibilitySettingsPanel({
  title,
  loadingLabel,
  saveMessage,
  loadErrorMessage,
  saveErrorMessage,
  introText,
  responsibilityTitle,
  policyTitle,
  policyDescription,
  inputLabel,
  inputHelper,
  buyerKey,
  sellerKey,
  policyKey,
  rateKey,
}: Props) {
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
          throw new Error(payload.message || loadErrorMessage);
        }
        const payload = (await response.json()) as LoanSettingsState;
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : loadErrorMessage);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [loadErrorMessage]);

  const handleSave = async () => {
    if (!state) return;

    if (!state[policyKey] && !String(state[rateKey]).trim()) {
      setError(`${inputLabel} را وارد کنید.`);
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
        throw new Error(payload.message || saveErrorMessage);
      }

      setMessage(saveMessage);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : saveErrorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return <LoanLoadingState label={loadingLabel} />;
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-[color:var(--border-soft)] pb-4 text-center">
        <h1 className="text-xl font-black text-[color:var(--text-strong)] sm:text-2xl">{title}</h1>
        <p className="mt-3 text-sm leading-8 text-[color:var(--text-muted)]">
          در این بخش می‌توانید تعیین کنید که هر طرف چه نقشی در تنظیمات این بخش دارد و مقدار نهایی چگونه محاسبه شود.
        </p>
      </div>

      <section className="mt-4 rounded-[8px] bg-[color:var(--surface)] px-4 py-6 text-right">
        <p className="text-sm leading-8 text-[color:var(--text-muted)]">{introText}</p>
        <h2 className="mt-2 text-[20px] font-black text-[color:var(--text-strong)]">{responsibilityTitle}</h2>
      </section>

      <section className="mt-4 space-y-6 rounded-[8px] bg-[color:var(--surface)] px-4 py-6">
        <ResponsibilityRow
          title="سهم خریدار"
          description={`میزان سهم خریدار در ${title} را مشخص کنید.`}
          checked={Boolean(state[buyerKey])}
          onChange={(value) => {
            setState((current) => (current ? { ...current, [buyerKey]: value } : current));
            setMessage('');
            setError('');
          }}
        />

        <ResponsibilityRow
          title="سهم فروشنده"
          description={`میزان سهم فروشنده در ${title} را مشخص کنید.`}
          checked={Boolean(state[sellerKey])}
          onChange={(value) => {
            setState((current) => (current ? { ...current, [sellerKey]: value } : current));
            setMessage('');
            setError('');
          }}
        />
      </section>

      <section className="mt-4 rounded-[8px] bg-[color:var(--surface)] px-4 py-6">
        <div dir="ltr" className="flex items-start justify-between gap-4">
          <ContractRegistrationSwitch
            checked={Boolean(state[policyKey])}
            onChange={(value) => {
              setState((current) =>
                current
                  ? {
                      ...current,
                      [policyKey]: value,
                      [rateKey]: value ? '' : current[rateKey],
                    }
                  : current,
              );
              setMessage('');
              setError('');
            }}
          />
          <div dir="rtl" className="space-y-3 text-right">
            <h2 className="text-[20px] font-black leading-8 text-[color:var(--text-strong)]">{policyTitle}</h2>
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">{policyDescription}</p>
          </div>
        </div>
      </section>

      {!state[policyKey] ? (
        <section className="mt-4 rounded-[8px] bg-[color:var(--surface)] px-4 py-6">
          <div className="space-y-4 text-right">
            <FieldLabel label={inputLabel} required />
            <FinancialAmountInput
              value={String(state[rateKey])}
              onChange={(value) => {
                setState((current) => (current ? { ...current, [rateKey]: value } : current));
                setMessage('');
                setError('');
              }}
              suffix="%"
            />
            <p className="text-sm text-[color:var(--text-muted)]">{inputHelper}</p>
          </div>
        </section>
      ) : null}

      {message ? <div className="mt-4"><LoanSuccess message={message} /></div> : null}
      {error ? <div className="mt-4"><LoanError error={error} /></div> : null}

      <LoanSaveBar saving={saving} onSave={() => void handleSave()} />
    </section>
  );
}

