'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { type ContractRuleState } from '../../../lib/businessContractRules';
import {
  ContractRegistrationSwitch,
  LoanError,
  LoanLoadingState,
  LoanPageShell,
  LoanSaveBar,
  LoanSectionCard,
  LoanSuccess,
} from './LoanSettingsPrimitives';
import { RuleStatusTag } from './RuleStatusTag';

type BuilderPenaltySection = {
  id: 'unit-delivery-delay' | 'material-specs-change';
  title: string;
  description: string;
  stateKey: 'unitDeliveryDelayEnabled' | 'materialSpecsChangeEnabled';
};

const BUILDER_PENALTY_SECTIONS: BuilderPenaltySection[] = [
  {
    id: 'unit-delivery-delay',
    title: 'تاخیر در تحویل واحد',
    description: 'مشخص خواهد کرد که در صورتی که تاخیر در تحویل واحد وجود داشته باشد، جریمه سازنده چگونه محاسبه می‌شود',
    stateKey: 'unitDeliveryDelayEnabled',
  },
  {
    id: 'material-specs-change',
    title: 'تغییرات مهم مصالح و مشخصات واحد',
    description: 'تعیین می‌کند تغییرات مهم در مصالح یا مشخصات واحد چگونه بررسی شود و چه اقدام قراردادی برای آن قابل اعمال باشد.',
    stateKey: 'materialSpecsChangeEnabled',
  },
];

function NextPageCard({
  href,
  title,
  description,
  active,
  disabled,
}: {
  href: string;
  title: string;
  description: string;
  active: boolean;
  disabled: boolean;
}) {
  const content = (
    <div
      className={`flex flex-col gap-4 rounded-[8px] border px-5 py-5 transition ${
        disabled
          ? 'cursor-not-allowed border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] opacity-55'
          : 'group border-[color:var(--border-soft)] bg-[color:var(--surface)] hover:border-[color:var(--theme-action-border)]'
      }`}
    >
      <div className="flex w-full flex-row-reverse items-start gap-3">
        <ChevronLeft
          className={`mt-1 h-5 w-5 shrink-0 ${
            disabled ? 'text-[color:var(--text-faint)]' : 'text-[color:var(--text-muted)] transition group-hover:-translate-x-0.5 group-hover:text-[color:var(--theme-action-text)]'
          }`}
        />
        <div className="flex-1 text-right">
          <h3 className="text-base font-black text-[color:var(--text-strong)] sm:text-lg">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
        </div>
      </div>
      {active ? (
        <div className="flex justify-start [direction:ltr]">
          <RuleStatusTag label="تنظیم شده" />
        </div>
      ) : null}
    </div>
  );

  if (disabled) return content;
  return <Link href={href}>{content}</Link>;
}

export function BuilderPenaltySettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<ContractRuleState | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/business-settings/contract-rules/builder-penalty', { cache: 'no-store' });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || 'بارگذاری تنظیمات جریمه سازنده انجام نشد.');
        }
        const payload = (await response.json()) as ContractRuleState;
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'بارگذاری تنظیمات جریمه سازنده انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const persistState = async (nextState: ContractRuleState, options?: { silent?: boolean }) => {
    try {
      setSaving(true);
      setError('');
      if (!options?.silent) setMessage('');

      const response = await fetch('/api/business-settings/contract-rules/builder-penalty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || 'ذخیره تنظیمات جریمه سازنده انجام نشد.');
      }

      if (!options?.silent) {
        setMessage('تنظیمات جریمه سازنده با موفقیت ذخیره شد.');
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات جریمه سازنده انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!state) return;
    await persistState(state);
  };

  if (loading || !state) {
    return <LoanLoadingState label="در حال بارگذاری تنظیمات جریمه سازنده..." />;
  }

  return (
    <>
      <LoanPageShell title="جریمه سازنده" description="در این بخش می‌توانید فعال‌سازی و زیرآیتم‌های جریمه مرتبط با تعهدات سازنده را مدیریت کنید.">
        <LoanSectionCard className="p-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 text-right">
              <h2 className="text-xl font-black text-[color:var(--text-strong)]">فعال‌سازی جرائم سازنده</h2>
              <p className="text-sm leading-7 text-[color:var(--text-muted)]">
                با فعال‌سازی این گزینه، جرائم بر اساس پیکربندی به تمام قراردادهای جدید اعمال خواهند شد.
              </p>
              {!state.active ? <p className="text-sm text-[color:var(--text-muted)]">برای استفاده از این بخش، آن را فعال کنید.</p> : null}
            </div>
            <div className="self-start lg:self-auto">
              <ContractRegistrationSwitch
                checked={state.active}
                variant="segmented"
                onChange={(active) => {
                  const nextState = { ...state, active };
                  setState(nextState);
                  void persistState(nextState, { silent: true });
                }}
              />
            </div>
          </div>
        </LoanSectionCard>

        <LoanSectionCard className="p-4">
          <div className="space-y-4 text-right">
            <p className="text-sm leading-6 text-[color:var(--text-muted)]">
              هر آیتم شما را به صفحه تنظیمات همان جریمه هدایت می‌کند تا وضعیت فعال‌سازی و جزئیات آن را مستقل ذخیره کنید.
            </p>
            <p className="text-sm leading-6 text-[color:var(--text-muted)]">
              همین زیرصفحه‌ها در بخش جرایم سازنده داخل پیش‌نویس قرارداد هم مبنا هستند؛ بنابراین تغییر هر گزینه، روی ساختار پیش‌فرض قراردادهای جدید و نحوه تفسیر اختلافات در همان فلو اثر می‌گذارد.
            </p>
            <p className="rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-3 text-sm leading-6 text-[color:var(--text-muted)]">
              اختلاف متراژ در این ماژول تعریف نمی‌شود، چون ماهیت آن حل‌وفصل مالی یا حق فسخ است، نه جریمه زمان‌محور. این موضوع از مسیر فسخ و تسویه مالی مدیریت می‌شود.
            </p>
            <div className="space-y-3">
              {BUILDER_PENALTY_SECTIONS.map((section) => (
                <NextPageCard
                  key={section.id}
                  href={`/business-settings/contract-rules/builder-penalty/${section.id}`}
                  title={section.title}
                  description={section.description}
                  active={state.active && Boolean(state.values[section.stateKey])}
                  disabled={!state.active}
                />
              ))}
            </div>
          </div>
        </LoanSectionCard>

        {message ? <LoanSuccess message={message} /> : null}
        {error ? <LoanError error={error} /> : null}
      </LoanPageShell>

      <LoanSaveBar saving={saving} onSave={() => void handleSave()} />
    </>
  );
}


