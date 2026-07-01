'use client';

import { useMemo, useState } from 'react';
import { Building2, ChevronLeft, Scale, ShieldAlert, TimerReset, Truck, Bell, FileCheck2, HandCoins } from 'lucide-react';
import { BusinessSwitch } from '../../../(panel)/contracts/new/_components/ContractFormPrimitives';
import {
  DocumentDeficienciesPanel,
  FinancialObligationsPanel,
  LateInstallmentPanel,
  NotificationsPanel,
  OtherBreachPanel,
} from '../../../(panel)/contracts/new/_components/termination/ConstructorSubsectionPanels';
import {
  BuyerAreaDiscrepancyPanel,
  BuyerBreachPanel,
  BuyerLateDeliveryPanel,
  BuyerNotificationPanel,
  BuyerPhysicalProgressDelayPanel,
  BuyerSpecificationChangesPanel,
} from '../../../(panel)/contracts/new/_components/termination/BuyerSubsectionPanels';
import type {
  BuyerTerminationSubsectionId,
  ContractTerminationData,
  ConstructorTerminationSubsectionId,
  TerminationPartyTab,
} from '../../../types/contract';
import { normalizeTerminationPayload } from '../../../(panel)/contracts/new/_components/termination/terminationDefaults';
import { useAppendixEditor } from './AppendixEditorContext';

type TerminationSide = 'builder' | 'buyer';

type ConstructorSectionMeta = {
  id: ConstructorTerminationSubsectionId;
  title: string;
  description: string;
  icon: typeof Scale;
};

type BuyerSectionMeta = {
  id: Exclude<BuyerTerminationSubsectionId, 'draftTemplateUsage'>;
  title: string;
  description: string;
  icon: typeof Building2;
};

const BUILDER_SECTION_META: ConstructorSectionMeta[] = [
  {
    id: 'lateInstallment',
    title: 'تاخیر در پرداخت اقساط',
    description: 'مهلت ارفاقی و مبنای تشخیص تاخیر در پرداخت اقساط.',
    icon: TimerReset,
  },
  {
    id: 'financialObligations',
    title: 'عدم انجام تعهدات مالی',
    description: 'هزینه‌ها، جرایم سفارشی و الزام رسمی پیش از فسخ.',
    icon: HandCoins,
  },
  {
    id: 'documentDeficiencies',
    title: 'نقص مدارک / تعهدات',
    description: 'الزامات تکمیل، مهلت و یادآوری خودکار.',
    icon: FileCheck2,
  },
  {
    id: 'otherBreach',
    title: 'نقض سایر تعهدات قراردادی',
    description: 'انواع تخلف، مهلت اصلاح و کارویژه تایید مدیر.',
    icon: ShieldAlert,
  },
  {
    id: 'notifications',
    title: 'اطلاع رسانی',
    description: 'سازنده، مدیر قرارداد و نمایش در جزئیات قرارداد.',
    icon: Bell,
  },
];

const BUYER_SECTION_META: BuyerSectionMeta[] = [
  {
    id: 'lateDelivery',
    title: 'حق فسخ خریدار به دلیل تاخیر در تحویل واحد',
    description: 'مبنای محاسبه تاخیر، حد آستانه مجاز و شرط ایجاد حق فسخ برای خریدار.',
    icon: Building2,
  },
  {
    id: 'specificationChanges',
    title: 'تغییر مشخصات',
    description: 'انواع تغییر و الزام رضایت پیشین خریدار.',
    icon: Building2,
  },
  {
    id: 'breachOfObligations',
    title: 'حق فسخ خریدار به دلیل نقض تعهدات سازنده',
    description: 'انتخاب انواع نقض تعهد سازنده که در صورت وقوع، حق فسخ خریدار را فعال می‌کند.',
    icon: ShieldAlert,
  },
  {
    id: 'physicalProgressDelay',
    title: 'حق فسخ خریدار به دلیل تاخیر در تحقق مراحل پیشرفت پروژه',
    description: 'تنظیم زمان هدف، مهلت مجاز تاخیر و مرجع سنجش برای هر مرحله پیشرفت.',
    icon: TimerReset,
  },
  {
    id: 'areaDiscrepancy',
    title: 'حق فسخ ناشی از اختلاف متراژ واحد',
    description: 'شرط فعال‌سازی فسخ بر اساس اختلاف متراژ نهایی واحد نسبت به متراژ قراردادی.',
    icon: Building2,
  },
  {
    id: 'notification',
    title: 'اطلاع رسانی',
    description: 'خریدار، مدیر قرارداد و نمایش در جدول.',
    icon: Bell,
  },
];

function createInitialTerminationPayload(side: TerminationSide): ContractTerminationData {
  const payload = normalizeTerminationPayload(null);
  return {
    ...payload,
    terminationEnabled: true,
    terminationPartyTab: side === 'builder' ? 'seller' : 'buyer',
    sellerTerminationEngaged: side === 'builder',
    buyerTerminationEngaged: side === 'buyer',
  };
}

function normalizeTerminationAppendixPayload(side: TerminationSide, payload: unknown): ContractTerminationData {
  const normalized = normalizeTerminationPayload(payload as ContractTerminationData | Record<string, unknown> | null);
  if (normalized.terminationEnabled || normalized.sellerTerminationEngaged || normalized.buyerTerminationEngaged) {
    return normalized;
  }

  return createInitialTerminationPayload(side);
}

function sideEnabledSections(payload: ContractTerminationData, side: TerminationSide) {
  return side === 'builder'
    ? BUILDER_SECTION_META.filter((section) => payload.constructorTerms[section.id].ruleEnabled).map((section) => section.id)
    : BUYER_SECTION_META.filter((section) => payload.buyerTerms[section.id].ruleEnabled).map((section) => section.id);
}

function SectionCard({
  title,
  description,
  icon: Icon,
  enabled,
  active,
  onToggle,
  onExpand,
}: {
  title: string;
  description: string;
  icon: typeof Scale | typeof Building2;
  enabled: boolean;
  active: boolean;
  onToggle: (next: boolean) => void;
  onExpand: () => void;
}) {
  return (
    <div className={`w-full overflow-hidden rounded-[8px] border transition ${enabled ? 'border-cyan-200 bg-cyan-50/35' : 'border-slate-200 bg-white'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (!enabled) return;
              onExpand();
            }}
            className="flex min-w-0 flex-1 flex-col gap-3 text-right sm:flex-row-reverse sm:items-center sm:gap-4"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border ${enabled ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 space-y-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{title}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${enabled ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden />
                  {enabled ? 'فعال' : 'غیرفعال'}
                </span>
              </span>
              <p className="text-xs leading-6 text-slate-600">{description}</p>
            </span>
            <ChevronLeft className={`h-5 w-5 shrink-0 text-slate-400 transition ${active ? '-rotate-90' : ''}`} aria-hidden />
          </button>

          <div className="flex shrink-0 items-center justify-end gap-3">
            <BusinessSwitch checked={enabled} onChange={onToggle} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppendixBuilderCancellationEditor() {
  const { payloads, updateTagPayload } = useAppendixEditor();
  const payload = normalizeTerminationAppendixPayload('builder', payloads['builder-cancellation']);
  const [expandedId, setExpandedId] = useState<ConstructorTerminationSubsectionId | null>('lateInstallment');

  const enabledSections = useMemo(() => sideEnabledSections(payload, 'builder'), [payload]);
  const rootEnabled = payload.terminationEnabled && payload.sellerTerminationEngaged;

  function sync(next: ContractTerminationData) {
    updateTagPayload('builder-cancellation', next);
  }

  function updateConstructorSection(sectionId: ConstructorTerminationSubsectionId, next: ContractTerminationData['constructorTerms'][ConstructorTerminationSubsectionId]) {
    sync({
      ...payload,
      terminationEnabled: true,
      terminationPartyTab: 'seller',
      sellerTerminationEngaged: true,
      constructorTerms: {
        ...payload.constructorTerms,
        [sectionId]: next,
      },
    });
  }

  function toggleSection(sectionId: ConstructorTerminationSubsectionId, nextEnabled: boolean) {
    const nextPayload: ContractTerminationData = {
      ...payload,
      terminationEnabled: nextEnabled || payload.buyerTerminationEngaged,
      terminationPartyTab: 'seller',
      sellerTerminationEngaged: nextEnabled,
      constructorTerms: {
        ...payload.constructorTerms,
        [sectionId]: {
          ...payload.constructorTerms[sectionId],
          ruleEnabled: nextEnabled,
        },
      },
    };
    sync(nextPayload);
    setExpandedId(nextEnabled ? sectionId : (current) => (current === sectionId ? null : current));
  }

  const renderPanel = (id: ConstructorTerminationSubsectionId) => {
    return (
      <div className="space-y-5">
        {id === 'lateInstallment' ? (
          <LateInstallmentPanel
            value={payload.constructorTerms.lateInstallment}
            onChange={(next) => updateConstructorSection('lateInstallment', next)}
            onSubmit={() => undefined}
            saving={false}
          />
        ) : null}
        {id === 'financialObligations' ? (
          <FinancialObligationsPanel
            value={payload.constructorTerms.financialObligations}
            onChange={(next) => updateConstructorSection('financialObligations', next)}
            onSubmit={() => undefined}
            saving={false}
          />
        ) : null}
        {id === 'documentDeficiencies' ? (
          <DocumentDeficienciesPanel
            value={payload.constructorTerms.documentDeficiencies}
            onChange={(next) => updateConstructorSection('documentDeficiencies', next)}
            onSubmit={() => undefined}
            saving={false}
          />
        ) : null}
        {id === 'otherBreach' ? (
          <OtherBreachPanel
            value={payload.constructorTerms.otherBreach}
            onChange={(next) => updateConstructorSection('otherBreach', next)}
            onSubmit={() => undefined}
            saving={false}
          />
        ) : null}
        {id === 'notifications' ? (
          <NotificationsPanel
            value={payload.constructorTerms.notifications}
            officialDemandRequired={payload.constructorTerms.financialObligations.officialDemandRequired}
            autoReminderEnabled={payload.constructorTerms.documentDeficiencies.autoReminderEnabled}
            onChange={(next) => updateConstructorSection('notifications', next)}
            onOfficialDemandRequiredChange={(checked) =>
              sync({
                ...payload,
                terminationEnabled: true,
                terminationPartyTab: 'seller',
                sellerTerminationEngaged: true,
                constructorTerms: {
                  ...payload.constructorTerms,
                  financialObligations: {
                    ...payload.constructorTerms.financialObligations,
                    officialDemandRequired: checked,
                  },
                },
              })
            }
            onAutoReminderEnabledChange={(checked) =>
              sync({
                ...payload,
                terminationEnabled: true,
                terminationPartyTab: 'seller',
                sellerTerminationEngaged: true,
                constructorTerms: {
                  ...payload.constructorTerms,
                  documentDeficiencies: {
                    ...payload.constructorTerms.documentDeficiencies,
                    autoReminderEnabled: checked,
                  },
                },
              })
            }
            onSubmit={() => undefined}
            saving={false}
          />
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6 rounded-[8px] border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6" dir="rtl">
      <div className="rounded-[8px] border border-[color-mix(in_srgb,var(--dark-teal)_16%,#cbd5e1)] bg-[color-mix(in_srgb,var(--dark-teal)_06%,white)] px-4 py-3 text-right">
        <div className="text-[13px] font-black text-[color-mix(in_srgb,var(--dark-teal)_88%,black)]">این بخش با منطق فسخ سازنده در پیش‌نویس هم‌ساخت است.</div>
        <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-600">
          هر زیر‌بخش دقیقا همان قواعد و فیلدهای پیش‌نویس را دارد و تغییرات آن در همان متمم ذخیره می‌شود.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-right">
            <h3 className="text-[18px] font-black text-slate-900">فعال‌سازی فسخ سازنده</h3>
            <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">با فعال کردن هر زیر‌بخش، همان فرم پیش‌نویس برای این متمم در دسترس قرار می‌گیرد.</p>
          </div>
          <BusinessSwitch
            checked={rootEnabled}
            onChange={(active) =>
              sync({
                ...payload,
                terminationEnabled: active,
                sellerTerminationEngaged: active,
                terminationPartyTab: 'seller',
              })
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        {BUILDER_SECTION_META.map((section) => {
          const enabled = Boolean(payload.constructorTerms[section.id].ruleEnabled);
          const active = enabled && expandedId === section.id;
          return (
            <div key={section.id} className="space-y-0">
              <SectionCard
                title={section.title}
                description={section.description}
                icon={section.icon}
                enabled={enabled}
                active={active}
                onExpand={() => setExpandedId((current) => (current === section.id ? null : section.id))}
                onToggle={(next) => toggleSection(section.id, next)}
              />
              {active ? <div className="border-t border-cyan-100 bg-white/80 p-4">{renderPanel(section.id)}</div> : null}
            </div>
          );
        })}
      </section>

      {!enabledSections.length ? (
        <div className="rounded-[8px] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-right text-xs leading-6 text-slate-500">
          هنوز هیچ زیر‌بخشی فعال نشده است. برای ثبت متمم، حداقل یکی از بخش‌های فسخ سازنده را فعال کنید.
        </div>
      ) : null}
    </div>
  );
}

export function AppendixBuyerCancellationEditor() {
  const { payloads, updateTagPayload } = useAppendixEditor();
  const payload = normalizeTerminationAppendixPayload('buyer', payloads['buyer-cancellation']);
  const [expandedId, setExpandedId] = useState<Exclude<BuyerTerminationSubsectionId, 'draftTemplateUsage'> | null>('lateDelivery');

  const enabledSections = useMemo(() => sideEnabledSections(payload, 'buyer'), [payload]);
  const rootEnabled = payload.terminationEnabled && payload.buyerTerminationEngaged;

  function sync(next: ContractTerminationData) {
    updateTagPayload('buyer-cancellation', next);
  }

  function updateBuyerSection(
    sectionId: Exclude<BuyerTerminationSubsectionId, 'draftTemplateUsage'>,
    next: ContractTerminationData['buyerTerms'][Exclude<BuyerTerminationSubsectionId, 'draftTemplateUsage'>],
  ) {
    sync({
      ...payload,
      terminationEnabled: true,
      terminationPartyTab: 'buyer',
      buyerTerminationEngaged: true,
      buyerTerms: {
        ...payload.buyerTerms,
        [sectionId]: next,
      },
    });
  }

  function toggleSection(sectionId: Exclude<BuyerTerminationSubsectionId, 'draftTemplateUsage'>, nextEnabled: boolean) {
    const nextPayload: ContractTerminationData = {
      ...payload,
      terminationEnabled: nextEnabled || payload.sellerTerminationEngaged,
      terminationPartyTab: 'buyer',
      buyerTerminationEngaged: nextEnabled,
      buyerTerms: {
        ...payload.buyerTerms,
        [sectionId]: {
          ...payload.buyerTerms[sectionId],
          ruleEnabled: nextEnabled,
        },
      },
    };
    sync(nextPayload);
    setExpandedId(nextEnabled ? sectionId : (current) => (current === sectionId ? null : current));
  }

  const renderPanel = (id: Exclude<BuyerTerminationSubsectionId, 'draftTemplateUsage'>) => {
    return (
      <div className="space-y-5">
        {id === 'lateDelivery' ? (
          <BuyerLateDeliveryPanel
            value={payload.buyerTerms.lateDelivery}
            onChange={(next) => updateBuyerSection('lateDelivery', next)}
            onSubmit={() => undefined}
            saving={false}
          />
        ) : null}
        {id === 'specificationChanges' ? (
          <BuyerSpecificationChangesPanel
            value={payload.buyerTerms.specificationChanges}
            onChange={(next) => updateBuyerSection('specificationChanges', next)}
            onSubmit={() => undefined}
            saving={false}
          />
        ) : null}
        {id === 'breachOfObligations' ? (
          <BuyerBreachPanel
            value={payload.buyerTerms.breachOfObligations}
            onChange={(next) => updateBuyerSection('breachOfObligations', next)}
            onSubmit={() => undefined}
            saving={false}
          />
        ) : null}
        {id === 'physicalProgressDelay' ? (
          <BuyerPhysicalProgressDelayPanel
            value={payload.buyerTerms.physicalProgressDelay}
            onChange={(next) => updateBuyerSection('physicalProgressDelay', next)}
            onSubmit={() => undefined}
            saving={false}
            showSubmit={false}
          />
        ) : null}
        {id === 'areaDiscrepancy' ? (
          <BuyerAreaDiscrepancyPanel
            value={payload.buyerTerms.areaDiscrepancy}
            onChange={(next) => updateBuyerSection('areaDiscrepancy', next)}
            onSubmit={() => undefined}
            saving={false}
          />
        ) : null}
        {id === 'notification' ? (
          <BuyerNotificationPanel
            value={payload.buyerTerms.notification}
            onChange={(next) => updateBuyerSection('notification', next)}
            onSubmit={() => undefined}
            saving={false}
          />
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6 rounded-[8px] border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6" dir="rtl">
      <div className="rounded-[8px] border border-[color-mix(in_srgb,var(--dark-teal)_16%,#cbd5e1)] bg-[color-mix(in_srgb,var(--dark-teal)_06%,white)] px-4 py-3 text-right">
        <div className="text-[13px] font-black text-[color-mix(in_srgb,var(--dark-teal)_88%,black)]">این بخش با منطق فسخ خریدار در پیش‌نویس هم‌ساخت است.</div>
        <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-600">
          هر بخش دقیقا همان فرم و منطق پیش‌نویس را دارد و تغییرات آن برای این متمم ذخیره می‌شود.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-right">
            <h3 className="text-[18px] font-black text-slate-900">فعال‌سازی فسخ خریدار</h3>
            <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">با فعال کردن هر زیر‌بخش، همان فرم پیش‌نویس برای این متمم در دسترس قرار می‌گیرد.</p>
          </div>
          <BusinessSwitch
            checked={rootEnabled}
            onChange={(active) =>
              sync({
                ...payload,
                terminationEnabled: active,
                buyerTerminationEngaged: active,
                terminationPartyTab: 'buyer',
              })
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        {BUYER_SECTION_META.map((section) => {
          const enabled = Boolean(payload.buyerTerms[section.id].ruleEnabled);
          const active = enabled && expandedId === section.id;
          return (
            <div key={section.id} className="space-y-0">
              <SectionCard
                title={section.title}
                description={section.description}
                icon={section.icon}
                enabled={enabled}
                active={active}
                onExpand={() => setExpandedId((current) => (current === section.id ? null : section.id))}
                onToggle={(next) => toggleSection(section.id, next)}
              />
              {active ? <div className="border-t border-cyan-100 bg-white/80 p-4">{renderPanel(section.id)}</div> : null}
            </div>
          );
        })}
      </section>

      {!enabledSections.length ? (
        <div className="rounded-[8px] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-right text-xs leading-6 text-slate-500">
          هنوز هیچ زیر‌بخشی فعال نشده است. برای ثبت متمم، حداقل یکی از بخش‌های فسخ خریدار را فعال کنید.
        </div>
      ) : null}
    </div>
  );
}


