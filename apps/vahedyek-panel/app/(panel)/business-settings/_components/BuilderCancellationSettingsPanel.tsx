'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { ContractTerminationData, ConstructorTerminationSubsectionId } from '../../../types/contract';
import { normalizeTerminationPayload } from '../../contracts/new/_components/termination/terminationDefaults';
import {
  ContractRegistrationSwitch,
  LoanError,
  LoanLoadingState,
  LoanPageShell,
  LoanSectionCard,
  LoanSuccess,
} from './LoanSettingsPrimitives';
import { RuleStatusTag } from './RuleStatusTag';

type BuilderCancellationSection = {
  id: 'late-installment' | 'financial-obligations' | 'document-deficiencies' | 'other-breach' | 'notifications';
  title: string;
  description: string;
  stateKey: ConstructorTerminationSubsectionId;
};

const BUILDER_CANCELLATION_SECTIONS: BuilderCancellationSection[] = [
  {
    id: 'late-installment',
    title: 'تاخیر در پرداخت اقساط',
    description: 'مهلت ارفاقی و مبنای تشخیص تاخیر در پرداخت اقساط.',
    stateKey: 'lateInstallment',
  },
  {
    id: 'financial-obligations',
    title: 'عدم انجام تعهدات مالی',
    description: 'هزینه‌ها، جرایم سفارشی و الزام رسمی پیش از فسخ.',
    stateKey: 'financialObligations',
  },
  {
    id: 'document-deficiencies',
    title: 'نقص مدارک / تعهدات',
    description: 'الزامات تکمیل، مهلت و یادآوری خودکار.',
    stateKey: 'documentDeficiencies',
  },
  {
    id: 'other-breach',
    title: 'نقض سایر تعهدات قراردادی',
    description: 'انواع تخلف، مهلت اصلاح و کارویژه تایید مدیر.',
    stateKey: 'otherBreach',
  },
  {
    id: 'notifications',
    title: 'اطلاع رسانی',
    description: 'سازنده، مدیر قرارداد و اکشن‌ها در جزئیات قرارداد.',
    stateKey: 'notifications',
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
      className={`flex flex-col gap-4 rounded-[20px] border px-5 py-5 transition ${
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

export function BuilderCancellationSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<ContractTerminationData | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/business-settings/contract-rules/termination-settings', { cache: 'no-store' });
        if (!response.ok) throw new Error('بارگذاری تنظیمات فسخ انجام نشد.');
        const payload = normalizeTerminationPayload((await response.json()) as Record<string, unknown>);
        if (mounted) setState(payload);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'بارگذاری تنظیمات فسخ انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const persistState = async (nextState: ContractTerminationData, options?: { silent?: boolean }) => {
    try {
      setSaving(true);
      setError('');
      if (!options?.silent) setMessage('');

      const response = await fetch('/api/business-settings/contract-rules/termination-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState),
      });

      if (!response.ok) throw new Error('ذخیره تنظیمات فسخ انجام نشد.');

      if (!options?.silent) {
        setMessage('تنظیمات فسخ سازنده با موفقیت ذخیره شد.');
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات فسخ انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !state) {
    return <LoanLoadingState label="در حال بارگذاری تنظیمات فسخ سازنده..." />;
  }

  const rootEnabled = state.terminationEnabled && state.sellerTerminationEngaged;

  return (
    <LoanPageShell title="تنظیمات فسخ سازنده" description="در این بخش می‌توانید فعال‌سازی و زیرآیتم‌های فسخ قرارداد از سمت سازنده را مدیریت کنید.">
      <LoanSectionCard className="p-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 text-right">
            <h2 className="text-xl font-black text-[color:var(--text-strong)]">فعال سازی اختیارات فسخ سازنده</h2>
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">
              این گزینه تعیین می‌کند که آیا سازنده در شرایط نقض قرارداد توسط خریدار، حق فسخ یک‌طرفه را دارا باشد یا خیر.
            </p>
          </div>
          <div className="self-start lg:self-auto">
            <ContractRegistrationSwitch
              checked={rootEnabled}
              variant="segmented"
              onChange={(active) => {
                const nextState: ContractTerminationData = {
                  ...state,
                  terminationEnabled: active || state.buyerTerminationEngaged,
                  sellerTerminationEngaged: active,
                  terminationPartyTab: 'seller',
                  terminationConstructorPanel: 'list',
                };
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
            هر آیتم شما را به همان زیرصفحه‌ای می‌برد که در پیش‌نویس قرارداد استفاده می‌شود؛ همه فیلدها و رفتارها با همان ساختار منتقل شده‌اند.
          </p>
          <div className="space-y-3">
            {BUILDER_CANCELLATION_SECTIONS.map((section) => (
              <NextPageCard
                key={section.id}
                href={`/business-settings/contract-rules/builder-cancellation/${section.id}`}
                title={section.title}
                description={section.description}
                active={rootEnabled && state.constructorTerms[section.stateKey].ruleEnabled}
                disabled={!rootEnabled}
              />
            ))}
          </div>
        </div>
      </LoanSectionCard>

      {message ? <LoanSuccess message={message} /> : null}
      {error ? <LoanError error={error} /> : null}
    </LoanPageShell>
  );
}
