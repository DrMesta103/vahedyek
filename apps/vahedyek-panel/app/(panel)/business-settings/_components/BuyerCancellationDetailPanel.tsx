'use client';

import { useEffect, useRef, useState } from 'react';
import type { ContractTerminationData } from '../../../types/contract';
import { normalizeTerminationPayload } from '../../contracts/new/_components/termination/terminationDefaults';
import {
  BuyerAreaDiscrepancyPanel,
  BuyerBreachPanel,
  BuyerLateDeliveryPanel,
  BuyerNotificationPanel,
  BuyerPhysicalProgressDelayPanel,
  BuyerSpecificationChangesPanel,
} from '../../contracts/new/_components/termination/BuyerSubsectionPanels';
import { ContractRegistrationSwitch, LoanError, LoanLoadingState, LoanPageShell, LoanSectionCard, LoanSuccess } from './LoanSettingsPrimitives';
import { readApiErrorMessage } from './readApiErrorMessage';

type BuyerCancellationSectionId =
  | 'late-delivery'
  | 'specification-changes'
  | 'breach-of-obligations'
  | 'physical-progress-delay'
  | 'area-discrepancy'
  | 'notification'
  | 'draft-template-usage';

const SECTION_META: Record<BuyerCancellationSectionId, { title: string; description: string }> = {
  'late-delivery': {
    title: 'حق فسخ خریدار به دلیل تأخیر در تحویل واحد',
    description: 'مبنای محاسبه تأخیر، حد آستانه مجاز و شرط ایجاد حق فسخ برای خریدار.',
  },
  'specification-changes': {
    title: 'تغییر مشخصات',
    description: 'انواع تغییر و الزام رضایت پیشین خریدار.',
  },
  'breach-of-obligations': {
    title: 'حق فسخ خریدار به دلیل نقض تعهدات سازنده',
    description: 'انتخاب انواع نقض تعهد سازنده که در صورت وقوع، حق فسخ خریدار را فعال می‌کند.',
  },
  'physical-progress-delay': {
    title: 'حق فسخ خریدار به دلیل تأخیر در تحقق مراحل پیشرفت پروژه',
    description: 'تنظیم زمان هدف، مهلت مجاز تأخیر و مرجع سنجش برای هر مرحله پیشرفت.',
  },
  'area-discrepancy': {
    title: 'حق فسخ ناشی از اختلاف متراژ واحد',
    description: 'شرط فعال‌سازی فسخ بر اساس اختلاف متراژ نهایی واحد نسبت به متراژ قراردادی.',
  },
  notification: {
    title: 'اطلاع‌رسانی',
    description: 'خریدار، مدیر قرارداد و نمایش در جدول.',
  },
  'draft-template-usage': {
    title: 'استفاده در پیش‌نویس',
    description: 'اعمال تنظیمات فسخ خریدار به عنوان پیش‌فرض در پیش‌نویس قرارداد و امکان تغییر آن برای قرارداد خاص.',
  },
};

export function BuyerCancellationDetailPanel({ sectionId }: { sectionId: BuyerCancellationSectionId }) {
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
        if (!response.ok) throw new Error(await readApiErrorMessage(response, 'بارگذاری تنظیمات فسخ انجام نشد.'));
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

      if (!response.ok) throw new Error(await readApiErrorMessage(response, 'ذخیره تنظیمات فسخ انجام نشد.'));
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

  const updateStateAndPersist = (
    updater: (current: ContractTerminationData) => ContractTerminationData,
    successMessage: string,
  ) => {
    const current = stateRef.current;
    if (!current) return;
    const next = updater(current);
    stateRef.current = next;
    setState(next);
    void persistState(next, successMessage);
  };

  if (loading || !state) {
    return <LoanLoadingState label={`در حال بارگذاری ${section.title}...`} />;
  }

  const rootEnabled = state.terminationEnabled && state.buyerTerminationEngaged;

  return (
    <LoanPageShell title={section.title} description={section.description} backHref="/business-settings/contract-rules/buyer-cancellation">
      {!rootEnabled ? (
        <LoanSectionCard className="p-5">
          <p className="text-right text-sm leading-7 text-[color:var(--text-muted)]">
            برای مشاهده و تنظیم فیلدهای این بخش، ابتدا «تنظیمات فسخ خریدار» را در صفحه قبل فعال کنید.
          </p>
        </LoanSectionCard>
      ) : null}

      {rootEnabled && sectionId === 'late-delivery' ? (
        <BuyerLateDeliveryPanel
          value={state.buyerTerms.lateDelivery}
          onChange={(next) => updateState((current) => ({ ...current, buyerTerms: { ...current.buyerTerms, lateDelivery: next } }))}
          onSubmit={() => void persistState(stateRef.current ?? state, 'تنظیمات «تأخیر در تحویل» با موفقیت ذخیره شد.')}
          saving={saving}
        />
      ) : null}

      {rootEnabled && sectionId === 'specification-changes' ? (
        <BuyerSpecificationChangesPanel
          value={state.buyerTerms.specificationChanges}
          onChange={(next) => updateState((current) => ({ ...current, buyerTerms: { ...current.buyerTerms, specificationChanges: next } }))}
          onSubmit={() => void persistState(stateRef.current ?? state, 'تنظیمات «تغییر مشخصات» با موفقیت ذخیره شد.')}
          saving={saving}
        />
      ) : null}

      {rootEnabled && sectionId === 'breach-of-obligations' ? (
        <BuyerBreachPanel
          value={state.buyerTerms.breachOfObligations}
          onChange={(next) => updateState((current) => ({ ...current, buyerTerms: { ...current.buyerTerms, breachOfObligations: next } }))}
          onSubmit={() => void persistState(stateRef.current ?? state, 'تنظیمات «نقض تعهدات» با موفقیت ذخیره شد.')}
          saving={saving}
        />
      ) : null}

      {rootEnabled && sectionId === 'physical-progress-delay' ? (
        <BuyerPhysicalProgressDelayPanel
          value={state.buyerTerms.physicalProgressDelay}
          onChange={(next) => updateState((current) => ({ ...current, buyerTerms: { ...current.buyerTerms, physicalProgressDelay: next } }))}
          onSubmit={() => void persistState(stateRef.current ?? state, 'تنظیمات «حق فسخ خریدار به دلیل تأخیر در تحقق مراحل پیشرفت پروژه» با موفقیت ذخیره شد.')}
          saving={saving}
        />
      ) : null}

      {rootEnabled && sectionId === 'area-discrepancy' ? (
        <BuyerAreaDiscrepancyPanel
          value={state.buyerTerms.areaDiscrepancy}
          onChange={(next) => updateState((current) => ({ ...current, buyerTerms: { ...current.buyerTerms, areaDiscrepancy: next } }))}
          onSubmit={() => void persistState(stateRef.current ?? state, 'تنظیمات «حق فسخ ناشی از اختلاف متراژ واحد» با موفقیت ذخیره شد.')}
          saving={saving}
        />
      ) : null}

      {rootEnabled && sectionId === 'notification' ? (
        <BuyerNotificationPanel
          value={state.buyerTerms.notification}
          onChange={(next) => updateState((current) => ({ ...current, buyerTerms: { ...current.buyerTerms, notification: next } }))}
          onSubmit={() => void persistState(stateRef.current ?? state, 'تنظیمات «اطلاع‌رسانی» با موفقیت ذخیره شد.')}
          saving={saving}
        />
      ) : null}

      {rootEnabled && sectionId === 'draft-template-usage' ? (
        <LoanSectionCard className="p-5">
          <div className="space-y-8">
            <div className="space-y-4 border-b border-[color:var(--border-soft)] pb-6 text-right">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3 text-right">
                  <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">استفاده به عنوان پیش‌فرض در پیش‌نویس قرارداد</h3>
                  <p className="text-sm leading-7 text-[color:var(--text-muted)]">
                    تعیین می‌کند که آیا تنظیمات این صفحه به عنوان پیش‌فرض در تمام پیش‌نویس‌های قرارداد بارگذاری شوند یا خیر. با فعال‌سازی، هر قرارداد جدیدی که ایجاد شود این اطلاعات را خواهد داشت.
                  </p>
                </div>
                <div className="self-start lg:self-auto">
                  <ContractRegistrationSwitch
                    checked={Boolean(state.buyerTerms.draftTemplateUsage.ruleEnabled)}
                    variant="segmented"
                    onChange={(checked) =>
                      updateStateAndPersist((current) => ({
                        ...current,
                        buyerTerms: {
                          ...current.buyerTerms,
                          draftTemplateUsage: {
                            ...current.buyerTerms.draftTemplateUsage,
                            ruleEnabled: checked,
                          },
                        },
                      }), 'تنظیمات «استفاده در پیش‌نویس» با موفقیت ذخیره شد.')
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 text-right">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3 text-right">
                  <h3 className="text-[17px] font-black text-[color:var(--text-strong)]">امکان تغییر این تنظیمات برای قرارداد خاص</h3>
                  <p className="text-sm leading-7 text-[color:var(--text-muted)]">
                    تعیین می‌کند که آیا کاربران بتوانند تنظیمات مربوط به این فرم را برای یک قرارداد خاص، به صورت جداگانه تغییر دهند.
                  </p>
                </div>
                <div className="self-start lg:self-auto">
                  <ContractRegistrationSwitch
                    checked={Boolean(state.buyerTerms.draftTemplateUsage.allowPerContractOverride)}
                    variant="segmented"
                    onChange={(checked) =>
                      updateStateAndPersist((current) => ({
                        ...current,
                        buyerTerms: {
                          ...current.buyerTerms,
                          draftTemplateUsage: {
                            ...current.buyerTerms.draftTemplateUsage,
                            allowPerContractOverride: checked,
                          },
                        },
                      }), 'تنظیمات «استفاده در پیش‌نویس» با موفقیت ذخیره شد.')
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </LoanSectionCard>
      ) : null}

      {message ? <LoanSuccess message={message} /> : null}
      {error ? <LoanError error={error} /> : null}
    </LoanPageShell>
  );
}

