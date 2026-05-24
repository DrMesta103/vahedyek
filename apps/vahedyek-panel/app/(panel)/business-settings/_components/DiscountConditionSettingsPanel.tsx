'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import type { ContractRuleState } from '../../../lib/businessContractRules';
import { DiscountConditionPanel, type DiscountConditionValues } from '../../contracts/new/_components/DiscountConditionPanel';
import { BusinessSettingsSubmitButton } from './BusinessSettingsSubmitButton';

function parseListValue(value: string | boolean | undefined) {
  if (typeof value !== 'string') return ['all-payment-types'];
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : ['all-payment-types'];
}

function getConditionValues(values: ContractRuleState['values']): DiscountConditionValues {
  return {
    maxDelayCount: String(values.discountConditionMaxDelayCount ?? ''),
    graceDays: String(values.discountConditionGraceDays ?? ''),
    dueBasis: parseListValue(values.discountConditionDueBasis),
    keepOnDelay: Boolean(values.discountConditionKeepOnDelay),
    penaltyOnDiscount: Boolean(values.discountConditionPenaltyOnDiscount),
    settlementTiming: String(values.discountConditionSettlementTiming || 'unit-handover'),
  };
}

function applyConditionPatch(state: ContractRuleState, patch: Partial<DiscountConditionValues>): ContractRuleState {
  return {
    ...state,
    values: {
      ...state.values,
      discountConditionConfigured: true,
      ...(patch.maxDelayCount !== undefined ? { discountConditionMaxDelayCount: patch.maxDelayCount } : {}),
      ...(patch.graceDays !== undefined ? { discountConditionGraceDays: patch.graceDays } : {}),
      ...(patch.dueBasis !== undefined ? { discountConditionDueBasis: patch.dueBasis.join(',') } : {}),
      ...(patch.keepOnDelay !== undefined ? { discountConditionKeepOnDelay: patch.keepOnDelay } : {}),
      ...(patch.penaltyOnDiscount !== undefined ? { discountConditionPenaltyOnDiscount: patch.penaltyOnDiscount } : {}),
      ...(patch.settlementTiming !== undefined ? { discountConditionSettlementTiming: patch.settlementTiming } : {}),
    },
  };
}

export function DiscountConditionSettingsPanel() {
  const [state, setState] = useState<ContractRuleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/business-settings/contract-rules/discount', { cache: 'no-store' });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || 'بارگذاری تنظیمات شرط تخفیف انجام نشد.');
        }
        const payload = (await response.json()) as ContractRuleState;
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'بارگذاری تنظیمات شرط تخفیف انجام نشد.');
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
      const normalizedState = {
        ...state,
        values: {
          ...state.values,
          discountConditionConfigured: true,
        },
      };
      setState(normalizedState);

      const response = await fetch('/api/business-settings/contract-rules/discount', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedState),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || 'ذخیره تنظیمات شرط تخفیف انجام نشد.');
      }

      setMessage('تنظیمات شرط تخفیف با موفقیت ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات شرط تخفیف انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[color:var(--border-color)] bg-[color:var(--surface)] p-8 text-center text-sm text-[color:var(--text-muted)]">
          در حال بارگذاری تنظیمات شرط تخفیف...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <div className="space-y-5 rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)] backdrop-blur sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/business-settings/contract-rules/discount"
            className="inline-flex items-center gap-2 text-sm font-bold text-[color:var(--theme-action-text)]"
          >
            <ChevronRight className="h-4 w-4" />
            بازگشت
          </Link>
          <div className="text-right">
            <h1 className="text-xl font-black text-[color:var(--text-strong)] sm:text-2xl">شرط تخفیف و خوش‌حسابی تخفیف</h1>
          </div>
        </div>

        <DiscountConditionPanel
          values={getConditionValues(state.values)}
          onChange={(patch) => {
            setState((current) => (current ? applyConditionPatch(current, patch) : current));
            setMessage('');
            setError('');
          }}
        />

        {message ? (
          <section className="rounded-2xl border border-[#11b5c9]/50 bg-[#11b5c9]/10 p-4 text-sm text-[#0f766e]">
            <div className="inline-flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          </section>
        ) : null}

        {error ? <div className="rounded-2xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">{error}</div> : null}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl justify-end">
          <BusinessSettingsSubmitButton saving={saving} onClick={() => void handleSave()} />
        </div>
      </div>
    </section>
  );
}


