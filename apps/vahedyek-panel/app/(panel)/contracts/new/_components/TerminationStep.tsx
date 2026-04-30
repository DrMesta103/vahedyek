'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Bell,
  Building2,
  CircleOff,
  FileCheck2,
  FileText,
  HandCoins,
  LayoutPanelTop,
  Ruler,
  Scale,
  ShieldAlert,
  TimerReset,
  UserRound,
} from 'lucide-react';
import { StickySubmitBar } from '@repo/ui';
import { ContractStepLoader } from './ContractStepLoader';
import { FieldGroup, FormTextInput, SectionCard, SectionHeader } from './ContractFormPrimitives';
import {
  ensureActiveDraftId,
  getFrontendStepDraft,
  getStepData,
  setFrontendStepDraft,
} from '../../../../lib/contractDraftClient';
import { validateTerminationStep } from '../../../../lib/contractValidation';
import type { ContractSubjectData, ContractTerminationData } from '../../../../types/contract';
import { dispatchContractFlowDirty, dispatchContractFlowSaved } from './contractFlowSignals';
import type { ContractFlowSectionId } from './contractFlowSignals';
import { useContractFlowBasePath } from './useContractFlowBasePath';

type BuilderFormId = ContractTerminationData['builder']['activeForm'];
type BuyerFormId = ContractTerminationData['buyer']['activeForm'];
type MainTabId = ContractTerminationData['activeMainTab'];

const BUILDER_PRESET_OPTIONS = [
  { value: '3', label: '۳ روز' },
  { value: '7', label: '۷ روز' },
  { value: '10', label: '۱۰ روز' },
  { value: '15', label: '۱۵ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: 'other', label: 'سایر' },
] as const;

const BUILDER_SHORT_PRESET_OPTIONS = [
  { value: '3', label: '۳ روز' },
  { value: '7', label: '۷ روز' },
  { value: '15', label: '۱۵ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: 'other', label: 'سایر' },
] as const;

const BUYER_PRESET_OPTIONS = [
  { value: '10', label: '۱۰ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: '60', label: '۶۰ روز' },
  { value: '90', label: '۹۰ روز' },
  { value: '180', label: '۱۸۰ روز' },
  { value: 'other', label: 'سایر' },
] as const;

const DEFAULT_TERMINATION_DATA: ContractTerminationData = {
  terminationEnabled: false,
  activeMainTab: 'builder',
  builder: {
    enabled: false,
    activeForm: 'installment-delay',
    installmentDelay: {
      enabled: false,
      allowedDelayPreset: '7',
      allowedDelayDays: '',
      delayBasis: 'unpaid-installment',
      minDebtAmount: '',
      partialPaymentMode: 'activate-on-incomplete',
    },
    financialDefault: {
      enabled: false,
      obligationTypes: [],
      gracePeriodPreset: '7',
      gracePeriodDays: '',
      officialNoticeRequired: false,
    },
    documentDefect: {
      enabled: false,
      requiredItems: [],
      gracePeriodPreset: '7',
      gracePeriodDays: '',
      reminderBeforeTermination: false,
    },
    otherBreach: {
      enabled: false,
      breachTypes: [],
      gracePeriodPreset: '7',
      gracePeriodDays: '',
      managerApprovalRequired: false,
    },
    notifications: {
      notifyBuilderOnActivation: false,
      notifyContractManager: false,
      showTerminationSectionInDetails: false,
    },
  },
  buyer: {
    enabled: false,
    activeForm: 'delivery-delay',
    deliveryDelay: {
      enabled: false,
      deliveryBasis: 'contract-delivery-date',
      allowedDelayPreset: '30',
      allowedDelayDays: '',
      expertApprovalRequired: false,
    },
    specChange: {
      enabled: false,
      changeTypes: [],
      tolerancePercent: '',
      allowCompensationBeforeTermination: false,
      managerReviewRequired: false,
    },
    areaDiscrepancy: {
      enabled: false,
      discrepancyBasis: 'contract-area',
      toleranceMode: 'percent',
      toleranceValue: '',
      allowPriceAdjustmentFirst: false,
      expertApprovalRequired: false,
    },
    notifications: {
      notifyBuyerOnActivation: false,
      notifyContractManager: false,
      showTerminationSectionInDetails: false,
    },
  },
  draftUsage: {
    useAsDefault: false,
    allowPerContractOverride: false,
  },
};

function normalizeTerminationPayload(data: ContractTerminationData | null): ContractTerminationData {
  return {
    terminationEnabled: Boolean(data?.terminationEnabled),
    activeMainTab: data?.activeMainTab ?? DEFAULT_TERMINATION_DATA.activeMainTab,
    builder: {
      enabled: Boolean(data?.builder?.enabled),
      activeForm: data?.builder?.activeForm ?? DEFAULT_TERMINATION_DATA.builder.activeForm,
      installmentDelay: {
        enabled: Boolean(data?.builder?.installmentDelay?.enabled),
        allowedDelayPreset: data?.builder?.installmentDelay?.allowedDelayPreset ?? DEFAULT_TERMINATION_DATA.builder.installmentDelay.allowedDelayPreset,
        allowedDelayDays: String(data?.builder?.installmentDelay?.allowedDelayDays ?? ''),
        delayBasis: data?.builder?.installmentDelay?.delayBasis ?? DEFAULT_TERMINATION_DATA.builder.installmentDelay.delayBasis,
        minDebtAmount: String(data?.builder?.installmentDelay?.minDebtAmount ?? ''),
        partialPaymentMode: data?.builder?.installmentDelay?.partialPaymentMode ?? DEFAULT_TERMINATION_DATA.builder.installmentDelay.partialPaymentMode,
      },
      financialDefault: {
        enabled: Boolean(data?.builder?.financialDefault?.enabled),
        obligationTypes: data?.builder?.financialDefault?.obligationTypes ?? [],
        gracePeriodPreset: data?.builder?.financialDefault?.gracePeriodPreset ?? DEFAULT_TERMINATION_DATA.builder.financialDefault.gracePeriodPreset,
        gracePeriodDays: String(data?.builder?.financialDefault?.gracePeriodDays ?? ''),
        officialNoticeRequired: Boolean(data?.builder?.financialDefault?.officialNoticeRequired),
      },
      documentDefect: {
        enabled: Boolean(data?.builder?.documentDefect?.enabled),
        requiredItems: data?.builder?.documentDefect?.requiredItems ?? [],
        gracePeriodPreset: data?.builder?.documentDefect?.gracePeriodPreset ?? DEFAULT_TERMINATION_DATA.builder.documentDefect.gracePeriodPreset,
        gracePeriodDays: String(data?.builder?.documentDefect?.gracePeriodDays ?? ''),
        reminderBeforeTermination: Boolean(data?.builder?.documentDefect?.reminderBeforeTermination),
      },
      otherBreach: {
        enabled: Boolean(data?.builder?.otherBreach?.enabled),
        breachTypes: data?.builder?.otherBreach?.breachTypes ?? [],
        gracePeriodPreset: data?.builder?.otherBreach?.gracePeriodPreset ?? DEFAULT_TERMINATION_DATA.builder.otherBreach.gracePeriodPreset,
        gracePeriodDays: String(data?.builder?.otherBreach?.gracePeriodDays ?? ''),
        managerApprovalRequired: Boolean(data?.builder?.otherBreach?.managerApprovalRequired),
      },
      notifications: {
        notifyBuilderOnActivation: Boolean(data?.builder?.notifications?.notifyBuilderOnActivation),
        notifyContractManager: Boolean(data?.builder?.notifications?.notifyContractManager),
        showTerminationSectionInDetails: Boolean(data?.builder?.notifications?.showTerminationSectionInDetails),
      },
    },
    buyer: {
      enabled: Boolean(data?.buyer?.enabled),
      activeForm: data?.buyer?.activeForm ?? DEFAULT_TERMINATION_DATA.buyer.activeForm,
      deliveryDelay: {
        enabled: Boolean(data?.buyer?.deliveryDelay?.enabled),
        deliveryBasis: data?.buyer?.deliveryDelay?.deliveryBasis ?? DEFAULT_TERMINATION_DATA.buyer.deliveryDelay.deliveryBasis,
        allowedDelayPreset: data?.buyer?.deliveryDelay?.allowedDelayPreset ?? DEFAULT_TERMINATION_DATA.buyer.deliveryDelay.allowedDelayPreset,
        allowedDelayDays: String(data?.buyer?.deliveryDelay?.allowedDelayDays ?? ''),
        expertApprovalRequired: Boolean(data?.buyer?.deliveryDelay?.expertApprovalRequired),
      },
      specChange: {
        enabled: Boolean(data?.buyer?.specChange?.enabled),
        changeTypes: data?.buyer?.specChange?.changeTypes ?? [],
        tolerancePercent: String(data?.buyer?.specChange?.tolerancePercent ?? ''),
        allowCompensationBeforeTermination: Boolean(data?.buyer?.specChange?.allowCompensationBeforeTermination),
        managerReviewRequired: Boolean(data?.buyer?.specChange?.managerReviewRequired),
      },
      areaDiscrepancy: {
        enabled: Boolean(data?.buyer?.areaDiscrepancy?.enabled),
        discrepancyBasis: data?.buyer?.areaDiscrepancy?.discrepancyBasis ?? DEFAULT_TERMINATION_DATA.buyer.areaDiscrepancy.discrepancyBasis,
        toleranceMode: data?.buyer?.areaDiscrepancy?.toleranceMode ?? DEFAULT_TERMINATION_DATA.buyer.areaDiscrepancy.toleranceMode,
        toleranceValue: String(data?.buyer?.areaDiscrepancy?.toleranceValue ?? ''),
        allowPriceAdjustmentFirst: Boolean(data?.buyer?.areaDiscrepancy?.allowPriceAdjustmentFirst),
        expertApprovalRequired: Boolean(data?.buyer?.areaDiscrepancy?.expertApprovalRequired),
      },
      notifications: {
        notifyBuyerOnActivation: Boolean(data?.buyer?.notifications?.notifyBuyerOnActivation),
        notifyContractManager: Boolean(data?.buyer?.notifications?.notifyContractManager),
        showTerminationSectionInDetails: Boolean(data?.buyer?.notifications?.showTerminationSectionInDetails),
      },
    },
    draftUsage: {
      useAsDefault: Boolean(data?.draftUsage?.useAsDefault),
      allowPerContractOverride: Boolean(data?.draftUsage?.allowPerContractOverride),
    },
  };
}

function serializePayload(payload: ContractTerminationData) {
  return JSON.stringify(payload);
}

function normalizeNumericInput(value: string) {
  return value.replace(/\D/g, '');
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        {description ? <p className="mt-1 text-xs leading-6 text-slate-500">{description}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-16 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-700 shadow transition-transform ${
            checked ? 'translate-x-1' : '-translate-x-7'
          }`}
        />
        <span className="absolute right-3 text-[11px] font-bold text-white">{checked ? 'فعال' : ''}</span>
        <span className={`absolute left-3 text-[11px] font-bold ${checked ? 'text-emerald-100' : 'text-slate-700'}`}>{checked ? '' : 'غیرفعال'}</span>
      </button>
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2.5 text-sm transition-all ${
        active ? 'border-cyan-500 bg-cyan-50 font-bold text-cyan-700 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  );
}

function ChoiceGrid<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <ChoiceButton key={option.value} active={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </ChoiceButton>
      ))}
    </div>
  );
}

function CheckboxCard({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-all ${checked ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-white'}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
      <span className={checked ? 'font-semibold text-cyan-800' : 'text-slate-700'}>{label}</span>
    </label>
  );
}

function RadioCard({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-all ${checked ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-white'}`}>
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 border-slate-300 text-cyan-600 focus:ring-cyan-500" />
      <span className={checked ? 'font-semibold text-cyan-800' : 'text-slate-700'}>{label}</span>
    </label>
  );
}

function FormActionBar({
  onSave,
  saving,
}: {
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex justify-end pt-2">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {saving ? 'در حال ثبت...' : 'ثبت'}
      </button>
    </div>
  );
}

function FlowTabCard({
  title,
  description,
  icon,
  active,
  inactive,
  onClick,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  active: boolean;
  inactive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[132px] flex-col items-center justify-center gap-4 px-4 py-6 text-center transition ${
        active ? 'bg-cyan-50 text-cyan-700' : 'bg-white text-gray-500 hover:bg-gray-50'
      }`}
    >
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-full border ${
          active ? 'border-cyan-200 bg-white text-cyan-700' : 'border-gray-300 text-gray-500'
        }`}
      >
        {icon}
      </span>
      <div className="space-y-1">
        <div className="text-sm font-bold">{title}</div>
        <div className="text-xs leading-6 text-gray-500">{description}</div>
        <div className={`text-xs font-semibold ${active ? 'text-cyan-700' : inactive ? 'text-gray-400' : 'text-gray-500'}`}>
          {active ? 'فعال' : inactive ? 'غیرفعال' : 'آماده تنظیم'}
        </div>
      </div>
    </button>
  );
}

function ScenarioMenuCard({
  title,
  description,
  countLabel,
  active,
  enabled,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  countLabel?: string;
  active: boolean;
  enabled: boolean;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-right transition-all ${
        active ? 'border-cyan-300 bg-cyan-50/70 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            active ? 'border-cyan-200 bg-white text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-500'
          }`}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                enabled ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              {enabled ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
          <p className="text-xs leading-6 text-slate-500">{description}</p>
          {countLabel ? <p className="text-[11px] font-medium text-cyan-700">{countLabel}</p> : null}
        </div>
      </div>
    </button>
  );
}

export function TerminationStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [subjectData, setSubjectData] = useState<ContractSubjectData | null>(null);
  const [payload, setPayload] = useState<ContractTerminationData>(DEFAULT_TERMINATION_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const nextDraftId = await ensureActiveDraftId();
      if (!mounted) return;
      setDraftId(nextDraftId);

      try {
        const [frontendDraft, subject] = await Promise.all([
          Promise.resolve(getFrontendStepDraft<ContractTerminationData>(nextDraftId, 'termination')),
          getStepData<ContractSubjectData>(nextDraftId, 'subject'),
        ]);

        if (!mounted) return;
        const nextPayload = normalizeTerminationPayload(frontendDraft);
        setPayload(nextPayload);
        setSubjectData(subject);
        initialSnapshotRef.current = serializePayload(nextPayload);
        dispatchContractFlowDirty(stepId as ContractFlowSectionId, false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [stepId]);

  const validation = useMemo(() => validateTerminationStep(payload), [payload]);

  useEffect(() => {
    if (loading) return;
    dispatchContractFlowDirty(stepId as ContractFlowSectionId, serializePayload(payload) !== initialSnapshotRef.current);
  }, [loading, payload, stepId]);

  const partyLabels = useMemo(() => {
    if (subjectData?.contractType === 'pre-sale') {
      return {
        builder: 'سازنده',
        buyer: 'خریدار',
      };
    }

    return {
      builder: 'فروشنده',
      buyer: 'خریدار',
    };
  }, [subjectData?.contractType]);

  const builderForms: Array<{ id: BuilderFormId; label: string; description: string }> = [
    { id: 'installment-delay', label: 'تأخیر در پرداخت اقساط', description: 'شرایط فسخ در صورت دیرکرد یا عدم تکمیل پرداخت اقساط.' },
    { id: 'financial-default', label: 'عدم انجام تعهدات مالی', description: 'پوشش بدهی‌ها، جرایم و هزینه‌های مالی خارج از اقساط.' },
    { id: 'document-defect', label: 'نقص مدارک / تعهدات', description: 'کنترل مدارک، امضاها و الزامات تکمیلی خریدار.' },
    { id: 'other-breach', label: 'نقض سایر تعهدات قراردادی', description: 'سناریوهای عمومی نقض تعهد که باید قابل فعال‌سازی باشند.' },
    { id: 'notifications', label: 'اطلاع‌رسانی', description: 'رفتارهای اطلاع‌رسانی و نمایش بخش فسخ در جزئیات قرارداد.' },
  ];

  const buyerForms: Array<{ id: BuyerFormId; label: string; description: string }> = [
    { id: 'delivery-delay', label: 'فسخ به دلیل تأخیر در تحویل', description: 'شرط تأخیر سازنده در تحویل بر مبنای تاریخ منتخب.' },
    { id: 'spec-change', label: 'تغییر مشخصات', description: 'تغییر در متریال، جانمایی یا مشخصات واحد.' },
    { id: 'area-discrepancy', label: 'اختلاف متراژ', description: 'شروط قانونی برای اختلاف متراژ و نحوه تصمیم‌گیری.' },
    { id: 'notifications', label: 'اطلاع‌رسانی', description: 'اطلاع به خریدار و مسئول قرارداد و نمایش در جزئیات.' },
  ];

  const builderFormMeta: Record<BuilderFormId, { icon: ReactNode; enabled: boolean; countLabel?: string }> = {
    'installment-delay': {
      icon: <TimerReset className="h-5 w-5" />,
      enabled: payload.builder.installmentDelay.enabled,
      countLabel:
        payload.builder.installmentDelay.allowedDelayPreset === 'other'
          ? `مهلت سفارشی: ${payload.builder.installmentDelay.allowedDelayDays || '0'} روز`
          : `مهلت انتخابی: ${payload.builder.installmentDelay.allowedDelayPreset} روز`,
    },
    'financial-default': {
      icon: <HandCoins className="h-5 w-5" />,
      enabled: payload.builder.financialDefault.enabled,
      countLabel: `${payload.builder.financialDefault.obligationTypes.length} تعهد مالی`,
    },
    'document-defect': {
      icon: <FileCheck2 className="h-5 w-5" />,
      enabled: payload.builder.documentDefect.enabled,
      countLabel: `${payload.builder.documentDefect.requiredItems.length} مورد الزامی`,
    },
    'other-breach': {
      icon: <ShieldAlert className="h-5 w-5" />,
      enabled: payload.builder.otherBreach.enabled,
      countLabel: `${payload.builder.otherBreach.breachTypes.length} تخلف`,
    },
    notifications: {
      icon: <Bell className="h-5 w-5" />,
      enabled:
        payload.builder.notifications.notifyBuilderOnActivation ||
        payload.builder.notifications.notifyContractManager ||
        payload.builder.notifications.showTerminationSectionInDetails,
    },
  };

  const buyerFormMeta: Record<BuyerFormId, { icon: ReactNode; enabled: boolean; countLabel?: string }> = {
    'delivery-delay': {
      icon: <Building2 className="h-5 w-5" />,
      enabled: payload.buyer.deliveryDelay.enabled,
      countLabel:
        payload.buyer.deliveryDelay.allowedDelayPreset === 'other'
          ? `مهلت سفارشی: ${payload.buyer.deliveryDelay.allowedDelayDays || '0'} روز`
          : `مهلت انتخابی: ${payload.buyer.deliveryDelay.allowedDelayPreset} روز`,
    },
    'spec-change': {
      icon: <FileText className="h-5 w-5" />,
      enabled: payload.buyer.specChange.enabled,
      countLabel: `${payload.buyer.specChange.changeTypes.length} مورد تغییر`,
    },
    'area-discrepancy': {
      icon: <Ruler className="h-5 w-5" />,
      enabled: payload.buyer.areaDiscrepancy.enabled,
      countLabel:
        payload.buyer.areaDiscrepancy.toleranceValue.trim() !== ''
          ? `آستانه: ${payload.buyer.areaDiscrepancy.toleranceValue} ${payload.buyer.areaDiscrepancy.toleranceMode === 'percent' ? 'درصد' : 'متر'}`
          : undefined,
    },
    notifications: {
      icon: <Bell className="h-5 w-5" />,
      enabled:
        payload.buyer.notifications.notifyBuyerOnActivation ||
        payload.buyer.notifications.notifyContractManager ||
        payload.buyer.notifications.showTerminationSectionInDetails,
    },
  };

  const updatePayload = (updater: (current: ContractTerminationData) => ContractTerminationData) => {
    setFormError('');
    setPayload((current) => updater(current));
  };

  const toggleArrayValue = <T extends string,>(items: T[], value: T, checked: boolean) => (checked ? Array.from(new Set([...items, value])) : items.filter((item) => item !== value));

  const handleBack = () => router.push(basePath);

  const resolveErrorMessage = () => {
    if (!payload.terminationEnabled) return '';
    if (payload.activeMainTab === 'builder' && payload.builder.enabled) {
      if (payload.builder.activeForm === 'installment-delay') {
        return validation.errors['builder.installmentDelay.allowedDelayDays'] ?? validation.errors['builder.installmentDelay.minDebtAmount'] ?? '';
      }
      if (payload.builder.activeForm === 'financial-default') {
        return validation.errors['builder.financialDefault.obligationTypes'] ?? validation.errors['builder.financialDefault.gracePeriodDays'] ?? '';
      }
      if (payload.builder.activeForm === 'document-defect') {
        return validation.errors['builder.documentDefect.requiredItems'] ?? validation.errors['builder.documentDefect.gracePeriodDays'] ?? '';
      }
      if (payload.builder.activeForm === 'other-breach') {
        return validation.errors['builder.otherBreach.breachTypes'] ?? validation.errors['builder.otherBreach.gracePeriodDays'] ?? '';
      }
    }

    if (payload.activeMainTab === 'buyer' && payload.buyer.enabled) {
      if (payload.buyer.activeForm === 'delivery-delay') {
        return validation.errors['buyer.deliveryDelay.allowedDelayDays'] ?? '';
      }
      if (payload.buyer.activeForm === 'spec-change') {
        return validation.errors['buyer.specChange.changeTypes'] ?? validation.errors['buyer.specChange.tolerancePercent'] ?? '';
      }
      if (payload.buyer.activeForm === 'area-discrepancy') {
        return validation.errors['buyer.areaDiscrepancy.toleranceValue'] ?? '';
      }
    }

    return 'اطلاعات بخش فسخ کامل نیست.';
  };

  const handleSave = () => {
    if (!draftId) return;

    const nextValidation = validateTerminationStep(payload);
    if (!nextValidation.valid) {
      setFormError(resolveErrorMessage());
      return;
    }

    setSaving(true);
    setFrontendStepDraft(draftId, 'termination', payload);
    initialSnapshotRef.current = serializePayload(payload);
    dispatchContractFlowDirty(stepId as ContractFlowSectionId, false);
    dispatchContractFlowSaved(stepId as ContractFlowSectionId);
    setSaving(false);
  };

  if (loading) {
    return <ContractStepLoader title={title} description="در حال آماده‌سازی تنظیمات فسخ قرارداد..." />;
  }

  return (
    <div className="space-y-5">
      {!embedded ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-gray-500">تنظیم شروط فسخ برای {partyLabels.builder} و {partyLabels.buyer} با کنترل مجزا برای پیش‌نویس قرارداد.</p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="rounded-md border px-3.5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            بازگشت به مراحل
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[30px] border border-gray-200 bg-white text-right shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">تنظیمات جریان فسخ</h2>
              <p className="mt-1 text-sm leading-7 text-gray-500">ظاهر و جریان این بخش بر اساس ساختار سناریومحور تخفیف و جریمه تنظیم شده است.</p>
            </div>
            <div className="lg:min-w-[360px]">
              <Toggle
                checked={payload.terminationEnabled}
                onChange={(checked) =>
                  updatePayload((current) => ({
                    ...current,
                    terminationEnabled: checked,
                    activeMainTab: checked ? current.activeMainTab : 'builder',
                  }))
                }
                label="فعال‌سازی فسخ"
                description="با فعال شدن این سوئیچ، سناریوهای سازنده، خریدار و پیش‌نویس در دسترس قرار می‌گیرند."
              />
            </div>
          </div>
        </div>

      {payload.terminationEnabled ? (
        <>
          <div className="grid gap-px bg-gray-200 md:grid-cols-3" dir="rtl">
            <FlowTabCard
              title="تنظیمات فسخ سازنده"
              description="سناریوهای مالی، مدارک، تخلفات و اطلاع‌رسانی مربوط به سازنده."
              icon={<Scale className="h-7 w-7" />}
              active={payload.activeMainTab === 'builder'}
              inactive={!payload.builder.enabled}
              onClick={() => updatePayload((current) => ({ ...current, activeMainTab: 'builder' }))}
            />
            <FlowTabCard
              title="تنظیمات فسخ خریدار"
              description="تحویل، تغییر مشخصات، اختلاف متراژ و اعلان‌های سمت خریدار."
              icon={<UserRound className="h-7 w-7" />}
              active={payload.activeMainTab === 'buyer'}
              inactive={!payload.buyer.enabled}
              onClick={() => updatePayload((current) => ({ ...current, activeMainTab: 'buyer' }))}
            />
            <FlowTabCard
              title="استفاده در پیش‌نویس"
              description="کنترل پیش‌فرض بودن این تنظیمات و امکان تغییر برای قرارداد خاص."
              icon={<LayoutPanelTop className="h-7 w-7" />}
              active={payload.activeMainTab === 'draft'}
              inactive={!payload.draftUsage.useAsDefault && !payload.draftUsage.allowPerContractOverride}
              onClick={() => updatePayload((current) => ({ ...current, activeMainTab: 'draft' }))}
            />
          </div>

          {payload.activeMainTab === 'builder' ? (
            <div className="space-y-5 p-6 md:p-8">
              <section className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">تنظیمات فسخ سازنده</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-600">ابتدا اختیار فسخ سازنده را فعال کنید، سپس برای هر سناریوی فعال تنظیمات مستقل ثبت کنید.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <Toggle
                    checked={payload.builder.enabled}
                    onChange={(checked) => updatePayload((current) => ({ ...current, builder: { ...current.builder, enabled: checked } }))}
                    label="فعال‌سازی اختیارات فسخ سازنده"
                  />

                  {payload.builder.enabled ? (
                    <div className="mt-5 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
                      <div className="space-y-3">
                        {builderForms.map((form) => (
                          <ScenarioMenuCard
                            key={form.id}
                            title={form.label}
                            description={form.description}
                            active={payload.builder.activeForm === form.id}
                            enabled={builderFormMeta[form.id].enabled}
                            countLabel={builderFormMeta[form.id].countLabel}
                            icon={builderFormMeta[form.id].icon}
                            onClick={() => updatePayload((current) => ({ ...current, builder: { ...current.builder, activeForm: form.id } }))}
                          />
                        ))}
                      </div>

                      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700">
                              {builderFormMeta[payload.builder.activeForm].icon}
                            </span>
                            <div>
                              <h4 className="text-base font-bold text-slate-900">{builderForms.find((item) => item.id === payload.builder.activeForm)?.label}</h4>
                              <p className="mt-1 text-sm text-slate-500">{builderForms.find((item) => item.id === payload.builder.activeForm)?.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          {payload.builder.activeForm === 'installment-delay' ? (
                            <div className="space-y-5">
                              <Toggle
                                checked={payload.builder.installmentDelay.enabled}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    builder: {
                                      ...current.builder,
                                      installmentDelay: { ...current.builder.installmentDelay, enabled: checked },
                                    },
                                  }))
                                }
                                label="فسخ به دلیل تأخیر در پرداخت"
                              />

                              <FieldGroup label="مهلت مجاز تأخیر">
                                <ChoiceGrid
                                  value={payload.builder.installmentDelay.allowedDelayPreset}
                                  onChange={(value) =>
                                    updatePayload((current) => ({
                                      ...current,
                                      builder: {
                                        ...current.builder,
                                        installmentDelay: {
                                          ...current.builder.installmentDelay,
                                          allowedDelayPreset: value,
                                          allowedDelayDays: value === 'other' ? current.builder.installmentDelay.allowedDelayDays : '',
                                        },
                                      },
                                    }))
                                  }
                                  options={BUILDER_PRESET_OPTIONS}
                                />
                              </FieldGroup>

                              {payload.builder.installmentDelay.allowedDelayPreset === 'other' ? (
                                <FieldGroup label="تعداد روز مجاز" required>
                                  <FormTextInput
                                    value={payload.builder.installmentDelay.allowedDelayDays}
                                    onChange={(value) =>
                                      updatePayload((current) => ({
                                        ...current,
                                        builder: {
                                          ...current.builder,
                                          installmentDelay: { ...current.builder.installmentDelay, allowedDelayDays: normalizeNumericInput(value) },
                                        },
                                      }))
                                    }
                                    placeholder="مثال: ۱۲"
                                  />
                                </FieldGroup>
                              ) : null}

                              <FieldGroup label="مبنای تشخیص تأخیر">
                                <div className="grid gap-2 md:grid-cols-3">
                                  <RadioCard
                                    checked={payload.builder.installmentDelay.delayBasis === 'unpaid-installment'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        builder: {
                                          ...current.builder,
                                          installmentDelay: { ...current.builder.installmentDelay, delayBasis: 'unpaid-installment' },
                                        },
                                      }))
                                    }
                                    label="هر قسط پرداخت نشده"
                                  />
                                  <RadioCard
                                    checked={payload.builder.installmentDelay.delayBasis === 'debt-amount'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        builder: {
                                          ...current.builder,
                                          installmentDelay: { ...current.builder.installmentDelay, delayBasis: 'debt-amount' },
                                        },
                                      }))
                                    }
                                    label="مجموع مبلغ بدهی"
                                  />
                                  <RadioCard
                                    checked={payload.builder.installmentDelay.delayBasis === 'consecutive-unpaid-installments'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        builder: {
                                          ...current.builder,
                                          installmentDelay: { ...current.builder.installmentDelay, delayBasis: 'consecutive-unpaid-installments' },
                                        },
                                      }))
                                    }
                                    label="اقساط متوالی پرداخت نشده"
                                  />
                                </div>
                              </FieldGroup>

                              <FieldGroup label="حداقل مبلغ بدهی" required={payload.builder.installmentDelay.delayBasis === 'debt-amount'}>
                                <FormTextInput
                                  value={payload.builder.installmentDelay.minDebtAmount}
                                  onChange={(value) =>
                                    updatePayload((current) => ({
                                      ...current,
                                      builder: {
                                        ...current.builder,
                                        installmentDelay: { ...current.builder.installmentDelay, minDebtAmount: normalizeNumericInput(value) },
                                      },
                                    }))
                                  }
                                  placeholder="مثال: 5000000"
                                />
                              </FieldGroup>

                              <FieldGroup label="نحوه برخورد با پرداخت ناقص">
                                <div className="grid gap-2">
                                  <RadioCard
                                    checked={payload.builder.installmentDelay.partialPaymentMode === 'activate-on-incomplete'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        builder: {
                                          ...current.builder,
                                          installmentDelay: { ...current.builder.installmentDelay, partialPaymentMode: 'activate-on-incomplete' },
                                        },
                                      }))
                                    }
                                    label="اگر قسط کامل نشده فسخ فعال شود"
                                  />
                                  <RadioCard
                                    checked={payload.builder.installmentDelay.partialPaymentMode === 'ignore-partial'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        builder: {
                                          ...current.builder,
                                          installmentDelay: { ...current.builder.installmentDelay, partialPaymentMode: 'ignore-partial' },
                                        },
                                      }))
                                    }
                                    label="اگر پرداخت ناقص باشد فسخ فعال نشود"
                                  />
                                  <RadioCard
                                    checked={payload.builder.installmentDelay.partialPaymentMode === 'decide-by-balance'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        builder: {
                                          ...current.builder,
                                          installmentDelay: { ...current.builder.installmentDelay, partialPaymentMode: 'decide-by-balance' },
                                        },
                                      }))
                                    }
                                    label="بر اساس مانده بدهی تصمیم گرفته شود"
                                  />
                                </div>
                              </FieldGroup>

                              <FormActionBar onSave={handleSave} saving={saving} />
                            </div>
                          ) : null}

                          {payload.builder.activeForm === 'financial-default' ? (
                            <div className="space-y-5">
                              <Toggle
                                checked={payload.builder.financialDefault.enabled}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    builder: {
                                      ...current.builder,
                                      financialDefault: { ...current.builder.financialDefault, enabled: checked },
                                    },
                                  }))
                                }
                                label="فسخ به دلیل عدم انجام تعهدات مالی"
                              />

                              <FieldGroup label="انواع تعهدات مشمول">
                                <div className="grid gap-2 md:grid-cols-2">
                                  {[
                                    ['contract-costs', 'هزینه‌های قراردادی'],
                                    ['contract-penalties', 'جریمه‌های قراردادی'],
                                    ['custom-financial', 'تعهد مالی سفارشی'],
                                    ['extra-costs', 'هزینه‌های اضافی'],
                                    ['side-costs', 'هزینه‌های جانبی'],
                                    ['installments', 'اقساط'],
                                  ].map(([value, label]) => (
                                    <CheckboxCard
                                      key={value}
                                      checked={payload.builder.financialDefault.obligationTypes.includes(value as ContractTerminationData['builder']['financialDefault']['obligationTypes'][number])}
                                      onChange={(checked) =>
                                        updatePayload((current) => ({
                                          ...current,
                                          builder: {
                                            ...current.builder,
                                            financialDefault: {
                                              ...current.builder.financialDefault,
                                              obligationTypes: toggleArrayValue(current.builder.financialDefault.obligationTypes, value as ContractTerminationData['builder']['financialDefault']['obligationTypes'][number], checked),
                                            },
                                          },
                                        }))
                                      }
                                      label={label}
                                    />
                                  ))}
                                </div>
                              </FieldGroup>

                              <FieldGroup label="مهلت مجاز ایفای تعهدات">
                                <ChoiceGrid
                                  value={payload.builder.financialDefault.gracePeriodPreset}
                                  onChange={(value) =>
                                    updatePayload((current) => ({
                                      ...current,
                                      builder: {
                                        ...current.builder,
                                        financialDefault: {
                                          ...current.builder.financialDefault,
                                          gracePeriodPreset: value,
                                          gracePeriodDays: value === 'other' ? current.builder.financialDefault.gracePeriodDays : '',
                                        },
                                      },
                                    }))
                                  }
                                  options={BUILDER_SHORT_PRESET_OPTIONS}
                                />
                              </FieldGroup>

                              {payload.builder.financialDefault.gracePeriodPreset === 'other' ? (
                                <FieldGroup label="تعداد روز مهلت" required>
                                  <FormTextInput
                                    value={payload.builder.financialDefault.gracePeriodDays}
                                    onChange={(value) =>
                                      updatePayload((current) => ({
                                        ...current,
                                        builder: {
                                          ...current.builder,
                                          financialDefault: { ...current.builder.financialDefault, gracePeriodDays: normalizeNumericInput(value) },
                                        },
                                      }))
                                    }
                                    placeholder="مثال: ۱۲"
                                  />
                                </FieldGroup>
                              ) : null}

                              <Toggle
                                checked={payload.builder.financialDefault.officialNoticeRequired}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    builder: {
                                      ...current.builder,
                                      financialDefault: { ...current.builder.financialDefault, officialNoticeRequired: checked },
                                    },
                                  }))
                                }
                                label="مطالبه رسمی قبل از فسخ"
                              />

                              <FormActionBar onSave={handleSave} saving={saving} />
                            </div>
                          ) : null}

                          {payload.builder.activeForm === 'document-defect' ? (
                            <div className="space-y-5">
                              <Toggle
                                checked={payload.builder.documentDefect.enabled}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    builder: {
                                      ...current.builder,
                                      documentDefect: { ...current.builder.documentDefect, enabled: checked },
                                    },
                                  }))
                                }
                                label="فسخ به دلیل نقص مدارک"
                              />

                              <FieldGroup label="موارد الزامی از طرف خریدار">
                                <div className="grid gap-2 md:grid-cols-2">
                                  {[
                                    ['identity-documents', 'مدارک هویتی'],
                                    ['signature-completion', 'تکمیل امضاء'],
                                    ['legal-permits', 'مجوزهای حقوقی'],
                                    ['payment-documents', 'مدارک پرداخت'],
                                    ['physical-attendance', 'الزام حضور فیزیکی'],
                                  ].map(([value, label]) => (
                                    <CheckboxCard
                                      key={value}
                                      checked={payload.builder.documentDefect.requiredItems.includes(value as ContractTerminationData['builder']['documentDefect']['requiredItems'][number])}
                                      onChange={(checked) =>
                                        updatePayload((current) => ({
                                          ...current,
                                          builder: {
                                            ...current.builder,
                                            documentDefect: {
                                              ...current.builder.documentDefect,
                                              requiredItems: toggleArrayValue(current.builder.documentDefect.requiredItems, value as ContractTerminationData['builder']['documentDefect']['requiredItems'][number], checked),
                                            },
                                          },
                                        }))
                                      }
                                      label={label}
                                    />
                                  ))}
                                </div>
                              </FieldGroup>

                              <FieldGroup label="مهلت تکمیل مدارک">
                                <ChoiceGrid
                                  value={payload.builder.documentDefect.gracePeriodPreset}
                                  onChange={(value) =>
                                    updatePayload((current) => ({
                                      ...current,
                                      builder: {
                                        ...current.builder,
                                        documentDefect: {
                                          ...current.builder.documentDefect,
                                          gracePeriodPreset: value,
                                          gracePeriodDays: value === 'other' ? current.builder.documentDefect.gracePeriodDays : '',
                                        },
                                      },
                                    }))
                                  }
                                  options={BUILDER_PRESET_OPTIONS}
                                />
                              </FieldGroup>

                              {payload.builder.documentDefect.gracePeriodPreset === 'other' ? (
                                <FieldGroup label="تعداد روز مهلت" required>
                                  <FormTextInput
                                    value={payload.builder.documentDefect.gracePeriodDays}
                                    onChange={(value) =>
                                      updatePayload((current) => ({
                                        ...current,
                                        builder: {
                                          ...current.builder,
                                          documentDefect: { ...current.builder.documentDefect, gracePeriodDays: normalizeNumericInput(value) },
                                        },
                                      }))
                                    }
                                    placeholder="مثال: ۲۰"
                                  />
                                </FieldGroup>
                              ) : null}

                              <Toggle
                                checked={payload.builder.documentDefect.reminderBeforeTermination}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    builder: {
                                      ...current.builder,
                                      documentDefect: { ...current.builder.documentDefect, reminderBeforeTermination: checked },
                                    },
                                  }))
                                }
                                label="ارسال یادآوری قبل از فسخ"
                              />

                              <FormActionBar onSave={handleSave} saving={saving} />
                            </div>
                          ) : null}

                          {payload.builder.activeForm === 'other-breach' ? (
                            <div className="space-y-5">
                              <Toggle
                                checked={payload.builder.otherBreach.enabled}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    builder: {
                                      ...current.builder,
                                      otherBreach: { ...current.builder.otherBreach, enabled: checked },
                                    },
                                  }))
                                }
                                label="فسخ به دلیل نقض سایر تعهدات"
                              />

                              <FieldGroup label="تخلفات مشمول">
                                <div className="grid gap-2 md:grid-cols-2">
                                  {[
                                    ['transfer-restriction', 'نقض محدودیت‌های انتقال'],
                                    ['refusal-to-sign', 'امتناع از امضای مدارک'],
                                    ['false-information', 'ارائه اطلاعات نادرست'],
                                    ['non-cooperation', 'عدم همکاری در اجرای قرارداد'],
                                  ].map(([value, label]) => (
                                    <CheckboxCard
                                      key={value}
                                      checked={payload.builder.otherBreach.breachTypes.includes(value as ContractTerminationData['builder']['otherBreach']['breachTypes'][number])}
                                      onChange={(checked) =>
                                        updatePayload((current) => ({
                                          ...current,
                                          builder: {
                                            ...current.builder,
                                            otherBreach: {
                                              ...current.builder.otherBreach,
                                              breachTypes: toggleArrayValue(current.builder.otherBreach.breachTypes, value as ContractTerminationData['builder']['otherBreach']['breachTypes'][number], checked),
                                            },
                                          },
                                        }))
                                      }
                                      label={label}
                                    />
                                  ))}
                                </div>
                              </FieldGroup>

                              <FieldGroup label="مهلت رفع تخلف">
                                <ChoiceGrid
                                  value={payload.builder.otherBreach.gracePeriodPreset}
                                  onChange={(value) =>
                                    updatePayload((current) => ({
                                      ...current,
                                      builder: {
                                        ...current.builder,
                                        otherBreach: {
                                          ...current.builder.otherBreach,
                                          gracePeriodPreset: value,
                                          gracePeriodDays: value === 'other' ? current.builder.otherBreach.gracePeriodDays : '',
                                        },
                                      },
                                    }))
                                  }
                                  options={BUILDER_SHORT_PRESET_OPTIONS}
                                />
                              </FieldGroup>

                              {payload.builder.otherBreach.gracePeriodPreset === 'other' ? (
                                <FieldGroup label="تعداد روز مهلت" required>
                                  <FormTextInput
                                    value={payload.builder.otherBreach.gracePeriodDays}
                                    onChange={(value) =>
                                      updatePayload((current) => ({
                                        ...current,
                                        builder: {
                                          ...current.builder,
                                          otherBreach: { ...current.builder.otherBreach, gracePeriodDays: normalizeNumericInput(value) },
                                        },
                                      }))
                                    }
                                    placeholder="مثال: ۱۴"
                                  />
                                </FieldGroup>
                              ) : null}

                              <Toggle
                                checked={payload.builder.otherBreach.managerApprovalRequired}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    builder: {
                                      ...current.builder,
                                      otherBreach: { ...current.builder.otherBreach, managerApprovalRequired: checked },
                                    },
                                  }))
                                }
                                label="نیاز به تأیید مسئول قرارداد"
                              />

                              <FormActionBar onSave={handleSave} saving={saving} />
                            </div>
                          ) : null}

                          {payload.builder.activeForm === 'notifications' ? (
                            <div className="space-y-5">
                              <Toggle
                                checked={payload.builder.notifications.notifyBuilderOnActivation}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    builder: {
                                      ...current.builder,
                                      notifications: { ...current.builder.notifications, notifyBuilderOnActivation: checked },
                                    },
                                  }))
                                }
                                label="اطلاع به سازنده هنگام فعال شدن اختیار فسخ"
                              />

                              <Toggle
                                checked={payload.builder.notifications.notifyContractManager}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    builder: {
                                      ...current.builder,
                                      notifications: { ...current.builder.notifications, notifyContractManager: checked },
                                    },
                                  }))
                                }
                                label="اطلاع به مسئول قرارداد"
                              />

                              <Toggle
                                checked={payload.builder.notifications.showTerminationSectionInDetails}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    builder: {
                                      ...current.builder,
                                      notifications: { ...current.builder.notifications, showTerminationSectionInDetails: checked },
                                    },
                                  }))
                                }
                                label="نمایش بخش فسخ در جزئیات قرارداد"
                                description="در صورت فعال شدن، دکمه عملیاتی فسخ به کارتابل قرارداد اضافه می‌شود."
                              />

                              <FormActionBar onSave={handleSave} saving={saving} />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          ) : null}

          {payload.activeMainTab === 'buyer' ? (
            <div className="space-y-5 p-6 md:p-8">
              <section className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">تنظیمات فسخ خریدار</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-600">سناریوهای سمت خریدار را با همان الگوی کارت‌های سناریویی انتخاب و برای هر مورد تنظیم کنید.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <Toggle
                    checked={payload.buyer.enabled}
                    onChange={(checked) => updatePayload((current) => ({ ...current, buyer: { ...current.buyer, enabled: checked } }))}
                    label="فعال‌سازی اختیارات فسخ خریدار"
                  />

                  {payload.buyer.enabled ? (
                    <div className="mt-5 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
                      <div className="space-y-3">
                        {buyerForms.map((form) => (
                          <ScenarioMenuCard
                            key={form.id}
                            title={form.label}
                            description={form.description}
                            active={payload.buyer.activeForm === form.id}
                            enabled={buyerFormMeta[form.id].enabled}
                            countLabel={buyerFormMeta[form.id].countLabel}
                            icon={buyerFormMeta[form.id].icon}
                            onClick={() => updatePayload((current) => ({ ...current, buyer: { ...current.buyer, activeForm: form.id } }))}
                          />
                        ))}
                      </div>

                      <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700">
                              {buyerFormMeta[payload.buyer.activeForm].icon}
                            </span>
                            <div>
                              <h4 className="text-base font-bold text-slate-900">{buyerForms.find((item) => item.id === payload.buyer.activeForm)?.label}</h4>
                              <p className="mt-1 text-sm text-slate-500">{buyerForms.find((item) => item.id === payload.buyer.activeForm)?.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          {payload.buyer.activeForm === 'delivery-delay' ? (
                            <div className="space-y-5">
                              <Toggle
                                checked={payload.buyer.deliveryDelay.enabled}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    buyer: {
                                      ...current.buyer,
                                      deliveryDelay: { ...current.buyer.deliveryDelay, enabled: checked },
                                    },
                                  }))
                                }
                                label="فعال‌سازی فسخ به دلیل تأخیر"
                              />

                              <FieldGroup label="مبنای تاریخ تحویل">
                                <div className="grid gap-2 md:grid-cols-3">
                                  <RadioCard
                                    checked={payload.buyer.deliveryDelay.deliveryBasis === 'latest-addendum-date'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        buyer: {
                                          ...current.buyer,
                                          deliveryDelay: { ...current.buyer.deliveryDelay, deliveryBasis: 'latest-addendum-date' },
                                        },
                                      }))
                                    }
                                    label="تاریخ تحویل آخرین الحاقیه"
                                  />
                                  <RadioCard
                                    checked={payload.buyer.deliveryDelay.deliveryBasis === 'official-project-end-date'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        buyer: {
                                          ...current.buyer,
                                          deliveryDelay: { ...current.buyer.deliveryDelay, deliveryBasis: 'official-project-end-date' },
                                        },
                                      }))
                                    }
                                    label="تاریخ رسمی اتمام پروژه"
                                  />
                                  <RadioCard
                                    checked={payload.buyer.deliveryDelay.deliveryBasis === 'contract-delivery-date'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        buyer: {
                                          ...current.buyer,
                                          deliveryDelay: { ...current.buyer.deliveryDelay, deliveryBasis: 'contract-delivery-date' },
                                        },
                                      }))
                                    }
                                    label="تاریخ تحویل مندرج در قرارداد"
                                  />
                                </div>
                              </FieldGroup>

                              <FieldGroup label="مهلت مجاز تأخیر">
                                <ChoiceGrid
                                  value={payload.buyer.deliveryDelay.allowedDelayPreset}
                                  onChange={(value) =>
                                    updatePayload((current) => ({
                                      ...current,
                                      buyer: {
                                        ...current.buyer,
                                        deliveryDelay: {
                                          ...current.buyer.deliveryDelay,
                                          allowedDelayPreset: value,
                                          allowedDelayDays: value === 'other' ? current.buyer.deliveryDelay.allowedDelayDays : '',
                                        },
                                      },
                                    }))
                                  }
                                  options={BUYER_PRESET_OPTIONS}
                                />
                              </FieldGroup>

                              {payload.buyer.deliveryDelay.allowedDelayPreset === 'other' ? (
                                <FieldGroup label="تعداد روز مجاز" required>
                                  <FormTextInput
                                    value={payload.buyer.deliveryDelay.allowedDelayDays}
                                    onChange={(value) =>
                                      updatePayload((current) => ({
                                        ...current,
                                        buyer: {
                                          ...current.buyer,
                                          deliveryDelay: { ...current.buyer.deliveryDelay, allowedDelayDays: normalizeNumericInput(value) },
                                        },
                                      }))
                                    }
                                    placeholder="مثال: 120"
                                  />
                                </FieldGroup>
                              ) : null}

                              <Toggle
                                checked={payload.buyer.deliveryDelay.expertApprovalRequired}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    buyer: {
                                      ...current.buyer,
                                      deliveryDelay: { ...current.buyer.deliveryDelay, expertApprovalRequired: checked },
                                    },
                                  }))
                                }
                                label="نیاز به تأیید کارشناس"
                              />

                              <FormActionBar onSave={handleSave} saving={saving} />
                            </div>
                          ) : null}

                          {payload.buyer.activeForm === 'spec-change' ? (
                            <div className="space-y-5">
                              <Toggle
                                checked={payload.buyer.specChange.enabled}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    buyer: {
                                      ...current.buyer,
                                      specChange: { ...current.buyer.specChange, enabled: checked },
                                    },
                                  }))
                                }
                                label="فعال‌سازی فسخ به دلیل تغییر مشخصات"
                              />

                              <FieldGroup label="موارد تغییر">
                                <div className="grid gap-2 md:grid-cols-2">
                                  {[
                                    ['unit-area', 'مساحت یا ابعاد واحد'],
                                    ['materials', 'مصالح و متریال'],
                                    ['layout', 'چیدمان و نقشه'],
                                    ['shared-spaces', 'مشاعات و فضاهای مشترک'],
                                    ['parking-storage', 'پارکینگ یا انباری'],
                                  ].map(([value, label]) => (
                                    <CheckboxCard
                                      key={value}
                                      checked={payload.buyer.specChange.changeTypes.includes(value as ContractTerminationData['buyer']['specChange']['changeTypes'][number])}
                                      onChange={(checked) =>
                                        updatePayload((current) => ({
                                          ...current,
                                          buyer: {
                                            ...current.buyer,
                                            specChange: {
                                              ...current.buyer.specChange,
                                              changeTypes: toggleArrayValue(current.buyer.specChange.changeTypes, value as ContractTerminationData['buyer']['specChange']['changeTypes'][number], checked),
                                            },
                                          },
                                        }))
                                      }
                                      label={label}
                                    />
                                  ))}
                                </div>
                              </FieldGroup>

                              <FieldGroup label="حد آستانه تغییر (درصد)" required>
                                <FormTextInput
                                  value={payload.buyer.specChange.tolerancePercent}
                                  onChange={(value) =>
                                    updatePayload((current) => ({
                                      ...current,
                                      buyer: {
                                        ...current.buyer,
                                        specChange: { ...current.buyer.specChange, tolerancePercent: normalizeNumericInput(value) },
                                      },
                                    }))
                                  }
                                  placeholder="مثال: 5"
                                />
                              </FieldGroup>

                              <Toggle
                                checked={payload.buyer.specChange.allowCompensationBeforeTermination}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    buyer: {
                                      ...current.buyer,
                                      specChange: { ...current.buyer.specChange, allowCompensationBeforeTermination: checked },
                                    },
                                  }))
                                }
                                label="ابتدا امکان جبران یا تعدیل بررسی شود"
                              />

                              <Toggle
                                checked={payload.buyer.specChange.managerReviewRequired}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    buyer: {
                                      ...current.buyer,
                                      specChange: { ...current.buyer.specChange, managerReviewRequired: checked },
                                    },
                                  }))
                                }
                                label="نیاز به بررسی مسئول قرارداد"
                              />

                              <FormActionBar onSave={handleSave} saving={saving} />
                            </div>
                          ) : null}

                          {payload.buyer.activeForm === 'area-discrepancy' ? (
                            <div className="space-y-5">
                              <Toggle
                                checked={payload.buyer.areaDiscrepancy.enabled}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    buyer: {
                                      ...current.buyer,
                                      areaDiscrepancy: { ...current.buyer.areaDiscrepancy, enabled: checked },
                                    },
                                  }))
                                }
                                label="فعال‌سازی فسخ به دلیل اختلاف متراژ"
                              />

                              <FieldGroup label="مبنای تشخیص اختلاف">
                                <div className="grid gap-2 md:grid-cols-3">
                                  <RadioCard
                                    checked={payload.buyer.areaDiscrepancy.discrepancyBasis === 'contract-area'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        buyer: {
                                          ...current.buyer,
                                          areaDiscrepancy: { ...current.buyer.areaDiscrepancy, discrepancyBasis: 'contract-area' },
                                        },
                                      }))
                                    }
                                    label="متراژ مندرج در قرارداد"
                                  />
                                  <RadioCard
                                    checked={payload.buyer.areaDiscrepancy.discrepancyBasis === 'official-survey'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        buyer: {
                                          ...current.buyer,
                                          areaDiscrepancy: { ...current.buyer.areaDiscrepancy, discrepancyBasis: 'official-survey' },
                                        },
                                      }))
                                    }
                                    label="صورت‌مجلس یا نقشه رسمی"
                                  />
                                  <RadioCard
                                    checked={payload.buyer.areaDiscrepancy.discrepancyBasis === 'delivery-session'}
                                    onChange={() =>
                                      updatePayload((current) => ({
                                        ...current,
                                        buyer: {
                                          ...current.buyer,
                                          areaDiscrepancy: { ...current.buyer.areaDiscrepancy, discrepancyBasis: 'delivery-session' },
                                        },
                                      }))
                                    }
                                    label="جلسه تحویل"
                                  />
                                </div>
                              </FieldGroup>

                              <FieldGroup label="نحوه سنجش آستانه">
                                <ChoiceGrid
                                  value={payload.buyer.areaDiscrepancy.toleranceMode}
                                  onChange={(value) =>
                                    updatePayload((current) => ({
                                      ...current,
                                      buyer: {
                                        ...current.buyer,
                                        areaDiscrepancy: { ...current.buyer.areaDiscrepancy, toleranceMode: value },
                                      },
                                    }))
                                  }
                                  options={[
                                    { value: 'percent', label: 'درصد' },
                                    { value: 'meter', label: 'متر' },
                                  ]}
                                />
                              </FieldGroup>

                              <FieldGroup label={`مقدار آستانه ${payload.buyer.areaDiscrepancy.toleranceMode === 'percent' ? '(درصد)' : '(متر)'}`} required>
                                <FormTextInput
                                  value={payload.buyer.areaDiscrepancy.toleranceValue}
                                  onChange={(value) =>
                                    updatePayload((current) => ({
                                      ...current,
                                      buyer: {
                                        ...current.buyer,
                                        areaDiscrepancy: { ...current.buyer.areaDiscrepancy, toleranceValue: normalizeNumericInput(value) },
                                      },
                                    }))
                                  }
                                  placeholder={payload.buyer.areaDiscrepancy.toleranceMode === 'percent' ? 'مثال: 3' : 'مثال: 2'}
                                />
                              </FieldGroup>

                              <Toggle
                                checked={payload.buyer.areaDiscrepancy.allowPriceAdjustmentFirst}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    buyer: {
                                      ...current.buyer,
                                      areaDiscrepancy: { ...current.buyer.areaDiscrepancy, allowPriceAdjustmentFirst: checked },
                                    },
                                  }))
                                }
                                label="ابتدا امکان تعدیل قیمت بررسی شود"
                              />

                              <Toggle
                                checked={payload.buyer.areaDiscrepancy.expertApprovalRequired}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    buyer: {
                                      ...current.buyer,
                                      areaDiscrepancy: { ...current.buyer.areaDiscrepancy, expertApprovalRequired: checked },
                                    },
                                  }))
                                }
                                label="نیاز به تأیید کارشناس"
                              />

                              <FormActionBar onSave={handleSave} saving={saving} />
                            </div>
                          ) : null}

                          {payload.buyer.activeForm === 'notifications' ? (
                            <div className="space-y-5">
                              <Toggle
                                checked={payload.buyer.notifications.notifyBuyerOnActivation}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    buyer: {
                                      ...current.buyer,
                                      notifications: { ...current.buyer.notifications, notifyBuyerOnActivation: checked },
                                    },
                                  }))
                                }
                                label="اطلاع به خریدار هنگام فعال شدن اختیار فسخ"
                              />

                              <Toggle
                                checked={payload.buyer.notifications.notifyContractManager}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    buyer: {
                                      ...current.buyer,
                                      notifications: { ...current.buyer.notifications, notifyContractManager: checked },
                                    },
                                  }))
                                }
                                label="اطلاع به مسئول قرارداد"
                              />

                              <Toggle
                                checked={payload.buyer.notifications.showTerminationSectionInDetails}
                                onChange={(checked) =>
                                  updatePayload((current) => ({
                                    ...current,
                                    buyer: {
                                      ...current.buyer,
                                      notifications: { ...current.buyer.notifications, showTerminationSectionInDetails: checked },
                                    },
                                  }))
                                }
                                label="نمایش بخش فسخ در جزئیات قرارداد"
                              />

                              <FormActionBar onSave={handleSave} saving={saving} />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          ) : null}

          {payload.activeMainTab === 'draft' ? (
            <div className="space-y-5 p-6 md:p-8">
              <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700">
                      <LayoutPanelTop className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">استفاده در پیش‌نویس</h3>
                      <p className="mt-1 text-sm text-slate-500">تنظیم کنید این قواعد به عنوان پیش‌فرض اعمال شوند یا برای هر قرارداد امکان override داشته باشند.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-5 p-5">
                <Toggle
                  checked={payload.draftUsage.useAsDefault}
                  onChange={(checked) => updatePayload((current) => ({ ...current, draftUsage: { ...current.draftUsage, useAsDefault: checked } }))}
                  label="استفاده از این تنظیمات به عنوان پیش‌فرض در پیش‌نویس قرارداد"
                />

                <Toggle
                  checked={payload.draftUsage.allowPerContractOverride}
                  onChange={(checked) => updatePayload((current) => ({ ...current, draftUsage: { ...current.draftUsage, allowPerContractOverride: checked } }))}
                  label="امکان تغییر این تنظیمات برای قرارداد خاص"
                  description="در صورت فعال شدن، کارشناس ثبت قرارداد می‌تواند شرایط فسخ را برای یک قرارداد مشخص تغییر دهد."
                />

                <FormActionBar onSave={handleSave} saving={saving} />
              </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      </div>

      {formError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-4 w-4" />
            خطا در ثبت شرایط فسخ
          </div>
          <p className="mt-1">{formError}</p>
        </div>
      ) : null}

      <StickySubmitBar
        label="ثبت شرایط فسخ"
        loadingLabel="در حال ثبت..."
        onClick={handleSave}
        disabled={saving}
        embedded={embedded}
        submitId={stepId}
      />
    </div>
  );
}
