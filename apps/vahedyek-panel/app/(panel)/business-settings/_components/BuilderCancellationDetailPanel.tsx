'use client';

import { useEffect, useRef, useState } from 'react';
import type { ContractTerminationData } from '../../../types/contract';
import { normalizeTerminationPayload } from '../../contracts/new/_components/termination/terminationDefaults';
import {
  DocumentDeficienciesPanel,
  FinancialObligationsPanel,
  LateInstallmentPanel,
  NotificationsPanel,
  OtherBreachPanel,
} from '../../contracts/new/_components/termination/ConstructorSubsectionPanels';
import { LoanError, LoanLoadingState, LoanPageShell, LoanSectionCard, LoanSuccess } from './LoanSettingsPrimitives';

type BuilderCancellationSectionId = 'late-installment' | 'financial-obligations' | 'document-deficiencies' | 'other-breach' | 'notifications';

const SECTION_META: Record<BuilderCancellationSectionId, { title: string; description: string }> = {
  'late-installment': {
    title: 'تاخیر در پرداخت اقساط',
    description: 'مهلت تشخیص تاخیر، مبنا و برخورد با پرداخت جزئی.',
  },
  'financial-obligations': {
    title: 'عدم انجام تعهدات مالی',
    description: 'هزینه‌ها، جرایم سفارشی و الزام رسمی پیش از فسخ.',
  },
  'document-deficiencies': {
    title: 'نقص مدارک / تعهدات',
    description: 'الزامات تکمیل، مهلت و یادآوری خودکار.',
  },
  'other-breach': {
    title: 'نقض سایر تعهدات قراردادی',
    description: 'انواع تخلف، مهلت اصلاح و کارویژه تایید مدیر.',
  },
  notifications: {
    title: 'اطلاع رسانی',
    description: 'سازنده، مدیر قرارداد و اکشن‌ها در جزئیات قرارداد.',
  },
};

export function BuilderCancellationDetailPanel({ sectionId }: { sectionId: BuilderCancellationSectionId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<ContractTerminationData | null>(null);
  const stateRef = useRef<ContractTerminationData | null>(null);

  const section = SECTION_META[sectionId];

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/business-settings/contract-rules/termination-settings', { cache: 'no-store' });
        if (!response.ok) throw new Error('بارگذاری تنظیمات فسخ انجام نشد.');
        const payload = normalizeTerminationPayload((await response.json()) as Record<string, unknown>);
        if (mounted) {
          stateRef.current = payload;
          setState(payload);
        }
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
  }, [sectionId]);

  const persistState = async (nextState: ContractTerminationData, successMessage: string) => {
    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await fetch('/api/business-settings/contract-rules/termination-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState),
      });

      if (!response.ok) throw new Error('ذخیره تنظیمات فسخ انجام نشد.');
      setMessage(successMessage);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات فسخ انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  const updateState = (updater: (current: ContractTerminationData) => ContractTerminationData) => {
    setState((current) => {
      if (!current) return current;
      const next = updater(current);
      stateRef.current = next;
      return next;
    });
  };

  if (loading || !state) {
    return <LoanLoadingState label={`در حال بارگذاری ${section.title}...`} />;
  }

  const rootEnabled = state.terminationEnabled && state.sellerTerminationEngaged;

  return (
    <LoanPageShell title={section.title} description={section.description} backHref="/business-settings/contract-rules/builder-cancellation">
      {!rootEnabled ? (
        <LoanSectionCard className="p-5">
          <p className="text-right text-sm leading-7 text-[color:var(--text-muted)]">
            برای مشاهده و تنظیم فیلدهای این بخش، ابتدا «تنظیمات فسخ سازنده» را در صفحه قبل فعال کنید.
          </p>
        </LoanSectionCard>
      ) : null}

      {rootEnabled && sectionId === 'late-installment' ? (
        <LateInstallmentPanel
          value={state.constructorTerms.lateInstallment}
          onChange={(next) => updateState((current) => ({ ...current, constructorTerms: { ...current.constructorTerms, lateInstallment: next } }))}
          onSubmit={() => void persistState(stateRef.current ?? state, 'تنظیمات «تاخیر در پرداخت اقساط» با موفقیت ذخیره شد.')}
          saving={saving}
        />
      ) : null}

      {rootEnabled && sectionId === 'financial-obligations' ? (
        <FinancialObligationsPanel
          value={state.constructorTerms.financialObligations}
          onChange={(next) => updateState((current) => ({ ...current, constructorTerms: { ...current.constructorTerms, financialObligations: next } }))}
          onSubmit={() => void persistState(stateRef.current ?? state, 'تنظیمات «عدم انجام تعهدات مالی» با موفقیت ذخیره شد.')}
          saving={saving}
        />
      ) : null}

      {rootEnabled && sectionId === 'document-deficiencies' ? (
        <DocumentDeficienciesPanel
          value={state.constructorTerms.documentDeficiencies}
          onChange={(next) => updateState((current) => ({ ...current, constructorTerms: { ...current.constructorTerms, documentDeficiencies: next } }))}
          onSubmit={() => void persistState(stateRef.current ?? state, 'تنظیمات «نقص مدارک / تعهدات» با موفقیت ذخیره شد.')}
          saving={saving}
        />
      ) : null}

      {rootEnabled && sectionId === 'other-breach' ? (
        <OtherBreachPanel
          value={state.constructorTerms.otherBreach}
          onChange={(next) => updateState((current) => ({ ...current, constructorTerms: { ...current.constructorTerms, otherBreach: next } }))}
          onSubmit={() => void persistState(stateRef.current ?? state, 'تنظیمات «نقض سایر تعهدات قراردادی» با موفقیت ذخیره شد.')}
          saving={saving}
        />
      ) : null}

      {rootEnabled && sectionId === 'notifications' ? (
        <NotificationsPanel
          value={state.constructorTerms.notifications}
          onChange={(next) => updateState((current) => ({ ...current, constructorTerms: { ...current.constructorTerms, notifications: next } }))}
          onSubmit={() => void persistState(stateRef.current ?? state, 'تنظیمات «اطلاع رسانی» با موفقیت ذخیره شد.')}
          saving={saving}
        />
      ) : null}

      {message ? <LoanSuccess message={message} /> : null}
      {error ? <LoanError error={error} /> : null}
    </LoanPageShell>
  );
}
