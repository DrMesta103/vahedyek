'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Bell,
  Building2,
  ChevronLeft,
  FileCheck2,
  HandCoins,
  Layers,
  Ruler,
  Scale,
  ShieldAlert,
  TimerReset,
  Truck,
} from 'lucide-react';
import { StickySubmitBar } from '@repo/ui';
import { ContractStepLoader } from './ContractStepLoader';
import { BusinessSwitch } from './ContractFormPrimitives';
import { upsertTerminationBuyerRulesFromStepPayload } from '../../../../actions/terminationRules';
import {
  ensureActiveDraftId,
  fetchTerminationBuyerRules,
  getFrontendStepDraft,
  getStepData,
  saveTerminationStepData,
  setFrontendStepDraft,
} from '../../../../lib/contractDraftClient';
import { validateTerminationStep, validateTerminationSubsection, validateBuyerTerminationSubsection } from '../../../../lib/contractValidation';
import { buildValidationSummary } from './validationPresentation';
import { normalizePersistedBuyerRules } from '../../../../lib/terminationBuyerRules';
import type {
  BuyerTerminationSubsectionId,
  ConstructorTerminationSubsectionId,
  ContractSubjectData,
  ContractTerminationData,
  TerminationConstructorPanel,
  TerminationPartyTab,
} from '../../../../types/contract';
import { dispatchContractFlowDirty, dispatchContractFlowSavedForDraft } from './contractFlowSignals';
import type { ContractFlowSectionId } from './contractFlowSignals';
import {
  BuyerAreaDiscrepancyPanel,
  BuyerBreachPanel,
  BuyerLateDeliveryPanel,
  BuyerNotificationPanel,
  BuyerPhysicalProgressDelayPanel,
  BuyerSpecificationChangesPanel,
} from './termination/BuyerSubsectionPanels';
import { BUYER_SUBSECTION_IDS, isBuyerTerminationSubsectionPanel, type DraftBuyerTerminationSubsectionId } from './termination/buyerSubsections';
import {
  DocumentDeficienciesPanel,
  FinancialObligationsPanel,
  LateInstallmentPanel,
  NotificationsPanel,
  OtherBreachPanel,
} from './termination/ConstructorSubsectionPanels';
import { CONSTRUCTOR_SUBSECTION_IDS } from './termination/migrateLegacyTermination';
import { normalizeTerminationPayload } from './termination/terminationDefaults';
import { firstErrorMessage } from './termination/TerminationPrimitives';
import { useContractFlowBasePath } from './useContractFlowBasePath';

function serializePayload(payload: ContractTerminationData) {
  return JSON.stringify(payload);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(fallback), timeoutMs);
    promise
      .then((value) => resolve(value))
      .catch(() => resolve(fallback))
      .finally(() => window.clearTimeout(timer));
  });
}

function hasEnabledSellerTermination(data: ContractTerminationData) {
  return CONSTRUCTOR_SUBSECTION_IDS.some((id) => data.constructorTerms[id].ruleEnabled);
}

function hasEnabledBuyerTermination(data: ContractTerminationData) {
  return BUYER_SUBSECTION_IDS.some((id) => data.buyerTerms[id].ruleEnabled);
}

function syncTerminationActivation(data: ContractTerminationData): ContractTerminationData {
  const sellerEnabled = hasEnabledSellerTermination(data);
  const buyerEnabled = hasEnabledBuyerTermination(data);
  return {
    ...data,
    terminationEnabled: sellerEnabled || buyerEnabled,
    sellerTerminationEngaged: sellerEnabled,
    buyerTerminationEngaged: buyerEnabled,
  };
}

const SUBSECTION_META: Record<ConstructorTerminationSubsectionId, { title: string; description: string; icon: ReactNode }> = {
  lateInstallment: {
    title: 'تأخیر در پرداخت اقساط',
    description: 'مهلت ارفاقی و مبنای تشخیص تأخیر در پرداخت اقساط.',
    icon: <TimerReset className="h-5 w-5" />,
  },
  financialObligations: {
    title: 'عدم انجام تعهدات مالی',
    description: 'هزینه‌ها، جرایم سفارشی و الزام رسمی پیش از فسخ.',
    icon: <HandCoins className="h-5 w-5" />,
  },
  documentDeficiencies: {
    title: 'نقص مدارک / تعهدات',
    description: 'الزامات تکمیل، مهلت و یادآوری خودکار.',
    icon: <FileCheck2 className="h-5 w-5" />,
  },
  otherBreach: {
    title: 'نقض سایر تعهدات',
    description: 'انواع تخلف، مهلت اصلاح و کارویژه تأیید مدیر.',
    icon: <ShieldAlert className="h-5 w-5" />,
  },
  notifications: {
    title: 'اطلاع‌رسانی',
    description: 'سازنده، مدیر قرارداد و اکشن‌ها در جزئیات قرارداد.',
    icon: <Bell className="h-5 w-5" />,
  },
};

const BUYER_SUBSECTION_META: Record<DraftBuyerTerminationSubsectionId, { title: string; description: string; icon: ReactNode }> = {
  lateDelivery: {
    title: 'حق فسخ خریدار به دلیل تأخیر در تحویل واحد',
    description: 'مبنای محاسبه تأخیر، حد آستانه مجاز و شرط ایجاد حق فسخ برای خریدار.',
    icon: <Truck className="h-5 w-5" />,
  },
  specificationChanges: {
    title: 'تغییر مشخصات',
    description: 'انواع تغییر و الزام رضایت پیشین خریدار.',
    icon: <Layers className="h-5 w-5" />,
  },
  breachOfObligations: {
    title: 'حق فسخ خریدار به دلیل نقض تعهدات سازنده',
    description: 'انتخاب انواع نقض تعهد سازنده که در صورت وقوع، حق فسخ خریدار را فعال می‌کند.',
    icon: <ShieldAlert className="h-5 w-5" />,
  },
  physicalProgressDelay: {
    title: 'حق فسخ خریدار به دلیل تأخیر در تحقق مراحل پیشرفت پروژه',
    description: 'تنظیم زمان هدف، مهلت مجاز تأخیر و مرجع سنجش برای هر مرحله پیشرفت.',
    icon: <TimerReset className="h-5 w-5" />,
  },
  areaDiscrepancy: {
    title: 'حق فسخ ناشی از اختلاف متراژ واحد',
    description: 'شرط فعال‌سازی فسخ بر اساس اختلاف متراژ نهایی واحد نسبت به متراژ قراردادی.',
    icon: <Ruler className="h-5 w-5" />,
  },
  notification: {
    title: 'اطلاع‌رسانی',
    description: 'خریدار، مدیر قرارداد و نمایش در جدول.',
    icon: <Bell className="h-5 w-5" />,
  },
};

function completionProp(id: ConstructorTerminationSubsectionId): keyof ContractTerminationData['constructorCompletion'] {
  return id as keyof ContractTerminationData['constructorCompletion'];
}

function buyerCompletionProp(id: BuyerTerminationSubsectionId): keyof ContractTerminationData['buyerCompletion'] {
  return id;
}

function isConstructorSubsectionPanel(panel: TerminationConstructorPanel): panel is ConstructorTerminationSubsectionId {
  return panel !== 'list';
}

function ConstructorMenuCard({
  title,
  description,
  enabled,
  icon,
  onToggle,
  expanded,
  onExpand,
}: {
  title: string;
  description: string;
  enabled: boolean;
  icon: ReactNode;
  onToggle: (next: boolean) => void;
  expanded: boolean;
  onExpand: () => void;
}) {
  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border transition ${
        enabled ? 'border-cyan-200 bg-cyan-50/40' : 'border-slate-200 bg-white'
      }`}
    >
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
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">{title}</h4>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    enabled ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden />
                  {enabled ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
              <p className="text-xs leading-6 text-slate-600">{description}</p>
            </div>
            <ChevronLeft className={`h-5 w-5 shrink-0 text-slate-400 transition ${expanded ? '-rotate-90' : ''}`} aria-hidden />
          </button>

          <div className="flex shrink-0 items-center justify-end gap-3 sm:justify-start">
            <BusinessSwitch
              checked={enabled}
              onChange={(next) => {
                onToggle(next);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminationPartyTabBar({
  activeTab,
  sellerLabel,
  buyerLabel,
  constructorProgressLabel,
  buyerProgressLabel,
  onSelect,
}: {
  activeTab: TerminationPartyTab;
  sellerLabel: string;
  buyerLabel: string;
  constructorProgressLabel: string;
  buyerProgressLabel: string;
  onSelect: (tab: TerminationPartyTab) => void;
}) {
  const tabBase =
    'relative flex min-h-[88px] w-full flex-row items-start gap-3 rounded-2xl border-2 p-4 text-right transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2';

  return (
    <div
      className="border-b border-slate-200 bg-gradient-to-b from-slate-50/90 to-white px-4 py-5 sm:px-6 sm:py-6"
      role="tablist"
      aria-label="فسخ سازنده یا خریدار"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'seller'}
          onClick={() => onSelect('seller')}
          className={`${tabBase} ${
            activeTab === 'seller'
              ? 'border-cyan-500 bg-white shadow-[0_4px_20px_rgba(6,182,212,0.12)] ring-1 ring-cyan-500/20'
              : 'border-slate-200 bg-white/90 hover:border-slate-300 hover:bg-white hover:shadow-sm'
          }`}
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              activeTab === 'seller' ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <Scale className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 space-y-1.5">
            <span className={`block text-sm font-bold leading-tight ${activeTab === 'seller' ? 'text-cyan-900' : 'text-slate-800'}`}>
              فسخ {sellerLabel}
            </span>
            <span
              className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                activeTab === 'seller' ? 'border-cyan-200 bg-cyan-50/80 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {constructorProgressLabel}
            </span>
          </span>
          {activeTab === 'seller' ? (
            <span className="absolute start-3 top-3 h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_0_3px_rgba(6,182,212,0.25)] sm:start-4 sm:top-4" aria-hidden />
          ) : null}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'buyer'}
          onClick={() => onSelect('buyer')}
          className={`${tabBase} ${
            activeTab === 'buyer'
              ? 'border-cyan-500 bg-white shadow-[0_4px_20px_rgba(6,182,212,0.12)] ring-1 ring-cyan-500/20'
              : 'border-slate-200 bg-white/90 hover:border-slate-300 hover:bg-white hover:shadow-sm'
          }`}
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              activeTab === 'buyer' ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <Building2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 space-y-1.5">
            <span className={`block text-sm font-bold leading-tight ${activeTab === 'buyer' ? 'text-cyan-900' : 'text-slate-800'}`}>
              فسخ {buyerLabel}
            </span>
            <span
              className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                activeTab === 'buyer' ? 'border-cyan-200 bg-cyan-50/80 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {buyerProgressLabel}
            </span>
          </span>
          {activeTab === 'buyer' ? (
            <span className="absolute start-3 top-3 h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_0_3px_rgba(6,182,212,0.25)] sm:start-4 sm:top-4" aria-hidden />
          ) : null}
        </button>
      </div>
    </div>
  );
}

export function TerminationStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [subjectData, setSubjectData] = useState<ContractSubjectData | null>(null);
  const [payload, setPayload] = useState<ContractTerminationData>(() => normalizeTerminationPayload(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subsectionBusy, setSubsectionBusy] = useState<ConstructorTerminationSubsectionId | null>(null);
  const [subsectionBuyerBusy, setSubsectionBuyerBusy] = useState<BuyerTerminationSubsectionId | null>(null);
  const [formError, setFormError] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const [expandedSellerId, setExpandedSellerId] = useState<ConstructorTerminationSubsectionId | null>('lateInstallment');
  const [expandedBuyerId, setExpandedBuyerId] = useState<BuyerTerminationSubsectionId | null>('lateDelivery');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const nextDraftId = await ensureActiveDraftId();
      if (!mounted) return;
      setDraftId(nextDraftId);

      try {
        const [frontendDraft, subject, remoteTermination] = await Promise.all([
          Promise.resolve(getFrontendStepDraft<ContractTerminationData | Record<string, unknown>>(nextDraftId, 'termination')),
          withTimeout(getStepData<ContractSubjectData>(nextDraftId, 'subject'), 2000, null),
          withTimeout(fetchTerminationBuyerRules(nextDraftId), 2000, null),
        ]);

        if (!mounted) return;
        const fromServer =
          remoteTermination?.buyerRules != null ? normalizePersistedBuyerRules(remoteTermination.buyerRules) : null;
        const serverRecord =
          remoteTermination?.payload && typeof remoteTermination.payload === 'object'
            ? (remoteTermination.payload as Record<string, unknown>)
            : {};
        const localRecord =
          frontendDraft && typeof frontendDraft === 'object' ? (frontendDraft as Record<string, unknown>) : {};

        const nextPayload = syncTerminationActivation(normalizeTerminationPayload({
          ...serverRecord,
          ...(fromServer
            ? {
                buyerTerms: fromServer.buyerTerms,
                buyerCompletion: fromServer.buyerCompletion,
                ...(fromServer.terminationBuyerPanel !== undefined ? { terminationBuyerPanel: fromServer.terminationBuyerPanel } : {}),
              }
            : {}),
          ...localRecord,
        }));
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

  useEffect(() => {
    if (loading) return;
    dispatchContractFlowDirty(stepId as ContractFlowSectionId, serializePayload(payload) !== initialSnapshotRef.current);
  }, [loading, payload, stepId]);


  const partyLabels = useMemo(() => {
    if (subjectData?.contractType === 'pre-sale') {
      return { sellerLabel: 'سازنده', buyerLabel: 'خریدار' };
    }
    return { sellerLabel: 'فروشنده', buyerLabel: 'خریدار' };
  }, [subjectData?.contractType]);

  const updatePayload = (updater: (current: ContractTerminationData) => ContractTerminationData) => {
    setFormError('');
    setSaveNotice('');
    setPayload((current) => updater(current));
  };


  const persistDraft = (next: ContractTerminationData, syncSnapshot?: boolean) => {
    if (draftId) setFrontendStepDraft(draftId, 'termination', next);
    if (syncSnapshot) {
      initialSnapshotRef.current = serializePayload(next);
      dispatchContractFlowDirty(stepId as ContractFlowSectionId, false);
      if (draftId) dispatchContractFlowSavedForDraft(draftId, stepId as ContractFlowSectionId, Date.now(), next);
    }
  };

  const handleBackToHub = () => router.push(basePath);

  const handleSaveAll = async () => {
    if (!draftId) return;
    const result = validateTerminationStep(payload);
    if (!result.valid) {
      setFormError(firstErrorMessage(result.errors) || 'اطلاعات بخش فسخ ناقص است.');
      return;
    }
    setSaving(true);
    setFormError('');
    setSaveNotice('');
    try {
      const next = syncTerminationActivation(payload);
      await saveTerminationStepData(draftId, next);
      setPayload(next);
      persistDraft(next, true);
      setSaveNotice('شرایط فسخ برای این پیش‌نویس ذخیره شد.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Ø«Ø¨Øª Ø´Ø±Ø§ÛŒØ· ÙØ³Ø® Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSubsection = (subsection: ConstructorTerminationSubsectionId) => {
    if (!draftId) return;
    setSubsectionBusy(subsection);
    const check = validateTerminationSubsection(subsection, payload);
    if (!check.valid) {
      setFormError(firstErrorMessage(check.errors));
      setSubsectionBusy(null);
      return;
    }

    const key = completionProp(subsection);
    setPayload((current) => {
      const next: ContractTerminationData = {
        ...current,
        constructorCompletion: {
          ...current.constructorCompletion,
          [key]: true,
        },
      };
      setFrontendStepDraft(draftId, 'termination', next);
      return next;
    });
    setFormError('');
    setSubsectionBusy(null);
  };

  const tryConfirmAndBackSeller = (subsection: ConstructorTerminationSubsectionId) => {
    if (!draftId) return;
    setSubsectionBusy(subsection);
    const check = validateTerminationSubsection(subsection, payload);
    if (!check.valid) {
      setFormError(firstErrorMessage(check.errors));
      setSubsectionBusy(null);
      return;
    }

    const key = completionProp(subsection);
    setPayload((current) => {
      const next: ContractTerminationData = {
        ...current,
        terminationConstructorPanel: 'list',
        constructorCompletion: {
          ...current.constructorCompletion,
          [key]: true,
        },
      };
      setFrontendStepDraft(draftId, 'termination', next);
      return next;
    });
    setFormError('');
    setSubsectionBusy(null);
  };

  const constructorProgress = useMemo(() => {
    const c = payload.constructorCompletion;
    const done = [c.lateInstallment, c.financialObligations, c.documentDeficiencies, c.otherBreach, c.notifications].filter(Boolean).length;
    return { done, total: 5 };
  }, [payload.constructorCompletion]);

  const buyerProgress = useMemo(() => {
    const bc = payload.buyerCompletion;
    const done = [
      bc.lateDelivery,
      bc.specificationChanges,
      bc.breachOfObligations,
      bc.physicalProgressDelay,
      bc.areaDiscrepancy,
      bc.notification,
    ].filter(Boolean).length;
    return { done, total: 6 };
  }, [payload.buyerCompletion]);

  const handleConfirmBuyerSubsection = async (subsection: BuyerTerminationSubsectionId) => {
    if (!draftId) return;
    setSubsectionBuyerBusy(subsection);
    const check = validateBuyerTerminationSubsection(subsection, payload);
    if (!check.valid) {
      setFormError(firstErrorMessage(check.errors));
      setSubsectionBuyerBusy(null);
      return;
    }

    const key = buyerCompletionProp(subsection);
    const next: ContractTerminationData = {
      ...payload,
      buyerCompletion: {
        ...payload.buyerCompletion,
        [key]: true,
      },
    };

    const remote = await upsertTerminationBuyerRulesFromStepPayload(draftId, {
      buyerTerms: next.buyerTerms,
      buyerCompletion: next.buyerCompletion,
      terminationBuyerPanel: next.terminationBuyerPanel,
    });
    if (remote.ok === false) {
      setFormError(remote.message);
      setSubsectionBuyerBusy(null);
      return;
    }

    setPayload(next);
    setFrontendStepDraft(draftId, 'termination', next);
    setFormError('');
    setSubsectionBuyerBusy(null);
  };

  const tryConfirmAndBackBuyer = async (subsection: BuyerTerminationSubsectionId) => {
    if (!draftId) return;
    setSubsectionBuyerBusy(subsection);
    const check = validateBuyerTerminationSubsection(subsection, payload);
    if (!check.valid) {
      setFormError(firstErrorMessage(check.errors));
      setSubsectionBuyerBusy(null);
      return;
    }

    const key = buyerCompletionProp(subsection);
    const next: ContractTerminationData = {
      ...payload,
      terminationBuyerPanel: 'list',
      buyerCompletion: {
        ...payload.buyerCompletion,
        [key]: true,
      },
    };

    const remote = await upsertTerminationBuyerRulesFromStepPayload(draftId, {
      buyerTerms: next.buyerTerms,
      buyerCompletion: next.buyerCompletion,
      terminationBuyerPanel: next.terminationBuyerPanel,
    });
    if (remote.ok === false) {
      setFormError(remote.message);
      setSubsectionBuyerBusy(null);
      return;
    }

    setPayload(next);
    setFrontendStepDraft(draftId, 'termination', next);
    setFormError('');
    setSubsectionBuyerBusy(null);
  };

  const renderBuyerSubsectionPanel = (id: DraftBuyerTerminationSubsectionId) => {
    const b = payload.buyerTerms;

    return (
      <div className="space-y-5">
        {id === 'lateDelivery' ? (
          <BuyerLateDeliveryPanel
            value={b.lateDelivery}
            onChange={(next) => updatePayload((p) => ({ ...p, buyerTerms: { ...p.buyerTerms, lateDelivery: next } }))}
            onSubmit={() => void tryConfirmAndBackBuyer('lateDelivery')}
            saving={subsectionBuyerBusy === 'lateDelivery'}
          />
        ) : null}
        {id === 'specificationChanges' ? (
          <BuyerSpecificationChangesPanel
            value={b.specificationChanges}
            onChange={(next) => updatePayload((p) => ({ ...p, buyerTerms: { ...p.buyerTerms, specificationChanges: next } }))}
            onSubmit={() => void tryConfirmAndBackBuyer('specificationChanges')}
            saving={subsectionBuyerBusy === 'specificationChanges'}
          />
        ) : null}
        {id === 'breachOfObligations' ? (
          <BuyerBreachPanel
            value={b.breachOfObligations}
            onChange={(next) => updatePayload((p) => ({ ...p, buyerTerms: { ...p.buyerTerms, breachOfObligations: next } }))}
            onSubmit={() => void tryConfirmAndBackBuyer('breachOfObligations')}
            saving={subsectionBuyerBusy === 'breachOfObligations'}
          />
        ) : null}
        {id === 'physicalProgressDelay' ? (
          <BuyerPhysicalProgressDelayPanel
            value={b.physicalProgressDelay}
            onChange={(next) => updatePayload((p) => ({ ...p, buyerTerms: { ...p.buyerTerms, physicalProgressDelay: next } }))}
            onSubmit={() => void tryConfirmAndBackBuyer('physicalProgressDelay')}
            saving={subsectionBuyerBusy === 'physicalProgressDelay'}
          />
        ) : null}
        {id === 'areaDiscrepancy' ? (
          <BuyerAreaDiscrepancyPanel
            value={b.areaDiscrepancy}
            onChange={(next) => updatePayload((p) => ({ ...p, buyerTerms: { ...p.buyerTerms, areaDiscrepancy: next } }))}
            onSubmit={() => void tryConfirmAndBackBuyer('areaDiscrepancy')}
            saving={subsectionBuyerBusy === 'areaDiscrepancy'}
          />
        ) : null}
        {id === 'notification' ? (
          <BuyerNotificationPanel
            value={b.notification}
            onChange={(next) => updatePayload((p) => ({ ...p, buyerTerms: { ...p.buyerTerms, notification: next } }))}
            onSubmit={() => void tryConfirmAndBackBuyer('notification')}
            saving={subsectionBuyerBusy === 'notification'}
          />
        ) : null}
      </div>
    );
  };

  const selectPartyTab = (tab: TerminationPartyTab) => {
    updatePayload((p) => ({
      ...p,
      terminationPartyTab: tab,
      sellerTerminationEngaged: tab === 'seller' ? true : p.sellerTerminationEngaged,
      buyerTerminationEngaged: tab === 'buyer' ? true : p.buyerTerminationEngaged,
    }));
  };

  const renderSubsectionPanel = (id: ConstructorTerminationSubsectionId) => {
    const c = payload.constructorTerms;

    return (
      <div className="space-y-5">
        {id === 'lateInstallment' ? (
          <LateInstallmentPanel
            value={c.lateInstallment}
            onChange={(next) => updatePayload((p) => ({ ...p, constructorTerms: { ...p.constructorTerms, lateInstallment: next } }))}
            onSubmit={() => tryConfirmAndBackSeller('lateInstallment')}
            saving={subsectionBusy === 'lateInstallment'}
          />
        ) : null}
        {id === 'financialObligations' ? (
          <FinancialObligationsPanel
            value={c.financialObligations}
            onChange={(next) => updatePayload((p) => ({ ...p, constructorTerms: { ...p.constructorTerms, financialObligations: next } }))}
            onSubmit={() => tryConfirmAndBackSeller('financialObligations')}
            saving={subsectionBusy === 'financialObligations'}
          />
        ) : null}
        {id === 'documentDeficiencies' ? (
          <DocumentDeficienciesPanel
            value={c.documentDeficiencies}
            onChange={(next) => updatePayload((p) => ({ ...p, constructorTerms: { ...p.constructorTerms, documentDeficiencies: next } }))}
            onSubmit={() => tryConfirmAndBackSeller('documentDeficiencies')}
            saving={subsectionBusy === 'documentDeficiencies'}
          />
        ) : null}
        {id === 'otherBreach' ? (
          <OtherBreachPanel
            value={c.otherBreach}
            onChange={(next) => updatePayload((p) => ({ ...p, constructorTerms: { ...p.constructorTerms, otherBreach: next } }))}
            onSubmit={() => tryConfirmAndBackSeller('otherBreach')}
            saving={subsectionBusy === 'otherBreach'}
          />
        ) : null}
        {id === 'notifications' ? (
          <NotificationsPanel
            value={c.notifications}
            officialDemandRequired={c.financialObligations.officialDemandRequired}
            autoReminderEnabled={c.documentDeficiencies.autoReminderEnabled}
            onChange={(next) => updatePayload((p) => ({ ...p, constructorTerms: { ...p.constructorTerms, notifications: next } }))}
            onOfficialDemandRequiredChange={(checked) =>
              updatePayload((p) => ({
                ...p,
                constructorTerms: {
                  ...p.constructorTerms,
                  financialObligations: {
                    ...p.constructorTerms.financialObligations,
                    officialDemandRequired: checked,
                  },
                },
              }))
            }
            onAutoReminderEnabledChange={(checked) =>
              updatePayload((p) => ({
                ...p,
                constructorTerms: {
                  ...p.constructorTerms,
                  documentDeficiencies: {
                    ...p.constructorTerms.documentDeficiencies,
                    autoReminderEnabled: checked,
                  },
                },
              }))
            }
            onSubmit={() => tryConfirmAndBackSeller('notifications')}
            saving={subsectionBusy === 'notifications'}
          />
        ) : null}
      </div>
    );
  };

  if (loading) {
    return <ContractStepLoader title={title} description="در حال آماده‌سازی تنظیمات فسخ قرارداد..." />;
  }

  const progressLabel = `${constructorProgress.done}/${constructorProgress.total} ثبت‌شده`;
  const buyerProgressLabel = `${buyerProgress.done}/${buyerProgress.total} ثبت‌شده`;

  return (
    <div className="space-y-5" dir="rtl">
      {!embedded ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-gray-500">
              قواعد فسخ سمت {partyLabels.sellerLabel} و {partyLabels.buyerLabel}؛ پنج دستهٔ فسخ برای خریدار و شش دسته برای {partyLabels.sellerLabel}.
            </p>
          </div>
          <button type="button" onClick={handleBackToHub} className="rounded-md border px-3.5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
            بازگشت به مراحل
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[30px] border border-gray-200 bg-white text-right shadow-sm">
        <div className="space-y-0">
            <TerminationPartyTabBar
              activeTab={payload.terminationPartyTab}
              sellerLabel={partyLabels.sellerLabel}
              buyerLabel={partyLabels.buyerLabel}
              constructorProgressLabel={progressLabel}
              buyerProgressLabel={buyerProgressLabel}
              onSelect={selectPartyTab}
            />

            {payload.terminationPartyTab === 'seller' ? (
              <div className="space-y-5 p-5 sm:p-8">
                <div className="text-right">
                  <h3 className="text-xl font-bold text-slate-900">زیربخش‌های فسخ {partyLabels.sellerLabel}</h3>
                  <p className="mt-1 text-sm text-slate-600">۵ دستهٔ قانون؛ هر مورد پس از فعال‌سازی در همین صفحه باز می‌شود.</p>
                </div>
                <div className="grid gap-4">
                  {CONSTRUCTOR_SUBSECTION_IDS.map((sid) => {
                    const meta = SUBSECTION_META[sid];
                    const enabled = payload.constructorTerms[sid].ruleEnabled;
                    const expanded = enabled && expandedSellerId === sid;
                    return (
                      <div key={sid} className="space-y-0">
                        <ConstructorMenuCard
                          title={meta.title}
                          description={meta.description}
                          enabled={enabled}
                          icon={meta.icon}
                          expanded={expanded}
                          onExpand={() => setExpandedSellerId((current) => (current === sid ? null : sid))}
                          onToggle={(next) => {
                            updatePayload((p) =>
                              syncTerminationActivation({
                                ...p,
                                terminationPartyTab: 'seller',
                                constructorTerms: {
                                  ...p.constructorTerms,
                                  [sid]: {
                                    ...p.constructorTerms[sid],
                                    ruleEnabled: next,
                                  },
                                },
                              }),
                            );
                            if (next) {
                              setExpandedSellerId(sid);
                            } else {
                              setExpandedSellerId((current) => (current === sid ? null : current));
                            }
                          }}
                        />

                        {expanded ? (
                          <div className="border-t border-cyan-100 bg-white/80 p-4">
                            {renderSubsectionPanel(sid)}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-5 p-5 sm:p-8">
                <div className="text-right">
                  <h3 className="text-xl font-bold text-slate-900">زیربخش‌های فسخ {partyLabels.buyerLabel}</h3>
                  <p className="mt-1 text-sm text-slate-600">۵ دستهٔ قانون؛ هر مورد پس از فعال‌سازی در همین صفحه باز می‌شود.</p>
                </div>
                <div className="grid gap-4">
                  {BUYER_SUBSECTION_IDS.map((sid) => {
                    const meta = BUYER_SUBSECTION_META[sid];
                    const enabled = payload.buyerTerms[sid].ruleEnabled;
                    const expanded = enabled && expandedBuyerId === sid;
                    return (
                      <div key={sid} className="space-y-0">
                        <ConstructorMenuCard
                          title={meta.title}
                          description={meta.description}
                          enabled={enabled}
                          icon={meta.icon}
                          expanded={expanded}
                          onExpand={() => setExpandedBuyerId((current) => (current === sid ? null : sid))}
                          onToggle={(next) => {
                            updatePayload((p) =>
                              syncTerminationActivation({
                                ...p,
                                terminationPartyTab: 'buyer',
                                buyerTerms: {
                                  ...p.buyerTerms,
                                  [sid]: {
                                    ...p.buyerTerms[sid],
                                    ruleEnabled: next,
                                  },
                                },
                              }),
                            );
                            if (next) {
                              setExpandedBuyerId(sid);
                            } else {
                              setExpandedBuyerId((current) => (current === sid ? null : current));
                            }
                          }}
                        />

                        {expanded ? (
                          <div className="border-t border-cyan-100 bg-white/80 p-4">
                            {renderBuyerSubsectionPanel(sid as DraftBuyerTerminationSubsectionId)}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
      </div>

      {formError ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm text-rose-700 ${formError ? 'border-rose-300 bg-rose-50' : 'border-rose-200 bg-rose-50'}`}>
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            پیام اعتبارسنجی
          </div>
          <p className="mt-1">{formError}</p>
        </div>
      ) : null}

      {saveNotice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {saveNotice}
        </div>
      ) : null}

      <StickySubmitBar
        label="ثبت شرایط فسخ"
        loadingLabel="در حال ثبت..."
        onClick={handleSaveAll}
        disabled={loading || saving}
        embedded={embedded}
        submitId={stepId}
      />
    </div>
  );
}

