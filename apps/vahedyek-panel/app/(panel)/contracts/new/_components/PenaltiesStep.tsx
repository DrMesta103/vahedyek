'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ChevronLeft, LoaderCircle, Plus, Save, Scale, X } from 'lucide-react';
import { Input, StickySubmitBar } from '@repo/ui';
import { ContractStepLoader } from './ContractStepLoader';
import { FieldLabel } from './FieldLabel';
import { PENALTY_ITEMS, getPenaltyItem } from './penaltiesConfig';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import { TagPills } from './ContractFormPrimitives';
import {
  clearFrontendStepDraft,
  ensureActiveDraftId,
  getContractFlowBootstrapSettings,
  getFrontendStepDraft,
  getStepData,
  saveStepData,
  setFrontendStepDraft,
} from '../../../../lib/contractDraftClient';
import { validatePenaltiesStep } from '../../../../lib/contractValidation';
import {
  canAddProgressiveRow,
  getNextProgressiveFromDay,
  normalizeProgressiveRows,
  sanitizeDecimalInput,
  sanitizePositiveIntegerInput,
  validateProgressiveRows,
} from '../../../../lib/progressivePenalty';
import { buildValidationSummary } from './validationPresentation';
import type {
  ContractPenaltiesData,
  PenaltyExtraFeeType,
  PenaltyMode,
  PenaltyPeriod,
  PenaltyProgressiveRowData,
  PenaltyRoundRule,
  PenaltyRuleData,
  PenaltyTypeStateData,
} from '../../../../types/contract';
import { dispatchContractFlowDirty, dispatchContractFlowSavedForDraft } from './contractFlowSignals';
import type { ContractFlowSectionId } from './contractFlowSignals';
import { BuilderPenaltyInFlow, type BuilderPenaltyInFlowHandle, type BuilderPenaltyInFlowStatus } from './penalties/BuilderPenaltyInFlow';
import { SettingsFieldAlignmentTag } from './SettingsFieldAlignmentTag';
import { useContractDraftAutosave } from './useContractDraftAutosave';
import { useBusinessSettingsReference } from './useBusinessSettingsReference';
import { buildBootstrapPenaltiesPayload, normalizePenaltiesPayload } from '../../../../lib/contractSettingsBootstrap';
import { RULE_CONFIGS } from '../../../../lib/businessContractRules';
import {
  buyerPenaltyAlignmentTag,
  getBuyerPenaltyFieldHint,
  resolveBuyerPenaltiesPartyHint,
  resolveBuyerPenaltyFieldHints,
  resolveBuyerPenaltySettingsTargetTypeId,
  resolveBuyerPenaltyTypeHint,
  resolveDomainRuleHint,
} from '../../../../lib/contractSettingsHints';

type PenaltyPartyTab = 'buyer' | 'seller';

const MODE_OPTIONS: Array<{
  id: PenaltyMode;
  title: string;
  description: string;
}> = [
  {
    id: 'fixed',
    title: 'مبلغ ثابت برای هر روز/ماه',
    description: 'در این روش، برای هر دوره تاخیر مبلغ ثابتی به‌عنوان جریمه محاسبه می‌شود.',
  },
  {
    id: 'overdue',
    title: 'درصدی از مانده بدهی معوق',
    description: 'جریمه به‌صورت درصدی از مانده بدهی معوق محاسبه می‌شود.',
  },
  {
    id: 'contract',
    title: 'درصدی از کل قرارداد',
    description: 'جریمه بر مبنای درصدی از کل مبلغ قرارداد در بازه انتخاب‌شده محاسبه می‌شود.',
  },
  {
    id: 'progressive',
    title: 'جریمه تصاعدی با روزهای تاخیر',
    description: 'مبلغ جریمه با افزایش مدت تاخیر بر اساس بازه‌های زمانی مختلف افزایش پیدا می‌کند.',
  },
];

const PERIOD_OPTIONS: Array<{ value: PenaltyPeriod; label: string }> = [
  { value: 'daily', label: 'روزانه' },
  { value: 'monthly', label: 'ماهانه' },
  { value: 'yearly', label: 'سالانه' },
];

const ROUND_RULE_OPTIONS: Array<{ value: PenaltyRoundRule; label: string }> = [
  { value: '00', label: '00' },
  { value: '0', label: '0' },
  { value: '100', label: 'کسر ۱۰۰' },
  { value: '1000', label: 'کسر ۱۰۰۰' },
];

const EXTRA_FEE_OPTIONS: Array<{ value: PenaltyExtraFeeType; label: string }> = [
  { value: 'percent', label: 'درصد' },
  { value: 'fixed', label: 'مبلغ ثابت' },
];

const DEFAULT_PROGRESSIVE_ROWS: PenaltyProgressiveRowData[] = [
  { id: 'row-1', fromDay: '1', toDay: '4', rate: '0.5' },
  { id: 'row-2', fromDay: '5', toDay: '6', rate: '0.5' },
  { id: 'row-3', fromDay: '7', toDay: '65', rate: '3.3' },
  { id: 'row-4', fromDay: '66', toDay: '', rate: '', openEnded: false },
];

const INITIAL_TYPES: PenaltyTypeStateData[] = PENALTY_ITEMS.map((item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  active: false,
}));

function makeEmptyRule(penaltyTypeId: string): PenaltyRuleData {
  return {
    id: `rule-${Math.random().toString(36).slice(2, 10)}`,
    penaltyTypeId,
    mode: 'fixed',
    period: 'monthly',
    fixedAmount: '',
    penaltyPercent: '',
    bankInterestPercent: '',
    graceDays: '2',
    roundRule: '100',
    extraFeeEnabled: false,
    extraFeeType: 'percent',
    extraFeeAmount: '',
    extraFeeRoundRule: '100',
    progressiveRows: DEFAULT_PROGRESSIVE_ROWS,
  };
}

function normalizeRule(rule: PenaltyRuleData): PenaltyRuleData {
  const normalizeRoundRuleValue = (value: string | undefined): PenaltyRoundRule => {
    if (value === '00' || value === '0' || value === '100' || value === '1000') return value;
    if (value === '0.5') return '00';
    if (value === '5') return '0';
    return '100';
  };

  return {
    ...rule,
    fixedAmount: String(rule.fixedAmount ?? ''),
    penaltyPercent: String(rule.penaltyPercent ?? ''),
    bankInterestPercent: String(rule.bankInterestPercent ?? ''),
    graceDays: String(rule.graceDays ?? ''),
    roundRule: normalizeRoundRuleValue(rule.roundRule),
    extraFeeAmount: String(rule.extraFeeAmount ?? ''),
    extraFeeRoundRule: normalizeRoundRuleValue(rule.extraFeeRoundRule),
    progressiveRows: normalizeProgressiveRows((rule.progressiveRows?.length ? rule.progressiveRows : DEFAULT_PROGRESSIVE_ROWS).map((row, index) => ({
      id: row.id || `row-${index + 1}`,
      fromDay: String(row.fromDay ?? ''),
      toDay: String(row.toDay ?? ''),
      rate: String(row.rate ?? ''),
      openEnded: Boolean(row.openEnded),
    }))),
  };
}

function formatInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function formatMoney(value: string) {
  const amount = Number(value.replace(/,/g, '')) || 0;
  return `${amount.toLocaleString('en-US')} تومان`;
}

function serializePayload(payload: ContractPenaltiesData) {
  return JSON.stringify(payload);
}

function formatRuleSummary(rule: PenaltyRuleData) {
  switch (rule.mode) {
    case 'fixed':
      return `${formatMoney(rule.fixedAmount || '0')} - ${PERIOD_OPTIONS.find((item) => item.value === rule.period)?.label ?? ''}`;
    case 'overdue':
      return `${rule.penaltyPercent || '0'}٪ از مانده بدهی`;
    case 'contract':
      return `${rule.penaltyPercent || '0'}٪ از کل قرارداد`;
    case 'progressive':
      return `${rule.progressiveRows.filter((item) => item.rate || item.fromDay || item.toDay).length} بازه تصاعدی`;
    default:
      return '';
  }
}

function PenaltySwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button type="button" className="business-switch" aria-pressed={checked} onClick={() => onChange(!checked)}>
      <span className="business-switch-option is-on">فعال</span>
      <span className="business-switch-option is-off">غیرفعال</span>
    </button>
  );
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-[8px] border border-gray-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h3 className="text-base font-bold text-gray-800">{title}</h3>
            {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-[8px] p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5 p-5">{children}</div>
        <div className="flex justify-end gap-3 border-t border-gray-100 p-4">{footer}</div>
      </div>
    </div>
  );
}

function FieldBlock({
  label,
  children,
  hint,
  alignmentTag,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  alignmentTag?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <FieldLabel label={label} />
        {alignmentTag}
      </div>
      {children}
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

function PenaltiesPartyTabBar({
  activeTab,
  buyerProgressLabel,
  sellerProgressLabel,
  buyerAlignmentTag,
  sellerAlignmentTag,
  onSelect,
}: {
  activeTab: PenaltyPartyTab;
  buyerProgressLabel: string;
  sellerProgressLabel: string;
  buyerAlignmentTag: { label: string; className: string } | null;
  sellerAlignmentTag: { label: string; className: string } | null;
  onSelect: (tab: PenaltyPartyTab) => void;
}) {
  const tabBase =
    'relative flex min-h-[88px] w-full flex-row items-start gap-3 rounded-[8px] border-2 p-4 text-right transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2';

  return (
    <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50/90 to-white px-4 py-5 sm:px-6 sm:py-6" role="tablist" aria-label="جرایم خریدار یا سازنده">
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
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border ${
              activeTab === 'seller' ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <Scale className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 space-y-1.5">
            <span className={`block text-sm font-bold leading-tight ${activeTab === 'seller' ? 'text-cyan-900' : 'text-slate-800'}`}>جرایم سازنده</span>
            <span className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex rounded-[8px] border px-2 py-0.5 text-[11px] font-semibold ${
                  activeTab === 'seller' ? 'border-cyan-200 bg-cyan-50/80 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                {sellerProgressLabel}
              </span>
              {sellerAlignmentTag ? (
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${sellerAlignmentTag.className}`}>
                  {sellerAlignmentTag.label}
                </span>
              ) : null}
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
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border ${
              activeTab === 'buyer' ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <Building2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 space-y-1.5">
            <span className={`block text-sm font-bold leading-tight ${activeTab === 'buyer' ? 'text-cyan-900' : 'text-slate-800'}`}>جرایم خریدار</span>
            <span className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex rounded-[8px] border px-2 py-0.5 text-[11px] font-semibold ${
                  activeTab === 'buyer' ? 'border-cyan-200 bg-cyan-50/80 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                {buyerProgressLabel}
              </span>
              {buyerAlignmentTag ? (
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${buyerAlignmentTag.className}`}>
                  {buyerAlignmentTag.label}
                </span>
              ) : null}
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

export function PenaltiesStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');
  const { snapshot } = useBusinessSettingsReference();

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [partyTab, setPartyTab] = useState<PenaltyPartyTab>('buyer');
  const sellerPenaltyRef = useRef<BuilderPenaltyInFlowHandle | null>(null);
  const [sellerStatus, setSellerStatus] = useState<BuilderPenaltyInFlowStatus>({
    loading: true,
    saving: false,
    dirty: false,
    state: null,
  });

  const [types, setTypes] = useState<PenaltyTypeStateData[]>(INITIAL_TYPES);
  const [rules, setRules] = useState<PenaltyRuleData[]>([]);

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [activePenaltyTypeId, setActivePenaltyTypeId] = useState<string>('');
  const [expandedPenaltyTypeId, setExpandedPenaltyTypeId] = useState<string>('');
  const [ruleForm, setRuleForm] = useState<PenaltyRuleData>(makeEmptyRule(PENALTY_ITEMS[0]?.id ?? ''));
  const [dialogError, setDialogError] = useState('');

  const payload = useMemo<ContractPenaltiesData>(
    () => ({
      activeTab: types.find((item) => item.active)?.id ?? types[0]?.id ?? '',
      types,
      rules,
    }),
    [rules, types],
  );

  const validation = useMemo(() => validatePenaltiesStep(payload), [payload]);
  const visibleErrors = showValidation ? validation.errors : {};
  const activeTypes = useMemo(() => types.filter((item) => item.active), [types]);
  const configuredActiveTypesCount = useMemo(
    () => activeTypes.filter((t) => rules.some((r) => r.penaltyTypeId === t.id)).length,
    [activeTypes, rules],
  );
  const buyerPenaltySettingsTargetTypeId = useMemo(
    () => resolveBuyerPenaltySettingsTargetTypeId(snapshot?.rules?.penalty),
    [snapshot?.rules?.penalty],
  );

  const buyerPartyAlignmentTag = useMemo(
    () => buyerPenaltyAlignmentTag(resolveBuyerPenaltiesPartyHint(snapshot?.rules?.penalty, types, rules).status),
    [rules, snapshot?.rules?.penalty, types],
  );

  const sellerPartyAlignmentTag = useMemo(() => {
    const reference = snapshot?.rules?.['builder-penalty'];
    const current = sellerStatus.state ?? reference ?? null;
    return buyerPenaltyAlignmentTag(resolveDomainRuleHint(RULE_CONFIGS['builder-penalty'], reference, current).status);
  }, [sellerStatus.state, snapshot?.rules]);

  useEffect(() => {
    if (!expandedPenaltyTypeId) {
      const preferredTypeId =
        types.find((item) => item.active && item.id === buyerPenaltySettingsTargetTypeId)?.id ??
        types.find((item) => item.active)?.id ??
        buyerPenaltySettingsTargetTypeId ??
        '';
      if (preferredTypeId && types.some((item) => item.id === preferredTypeId)) {
        setExpandedPenaltyTypeId(preferredTypeId);
      }
      return;
    }

    const expandedTypeExists = types.some((item) => item.id === expandedPenaltyTypeId);
    if (!expandedTypeExists) {
      setExpandedPenaltyTypeId(types.find((item) => item.active)?.id ?? '');
    }
  }, [buyerPenaltySettingsTargetTypeId, expandedPenaltyTypeId, types]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const nextDraftId = await ensureActiveDraftId();
      if (!mounted) return;
      setDraftId(nextDraftId);

      try {
        const bootstrap = getContractFlowBootstrapSettings();
        const [serverData, frontendDraft] = await Promise.all([
          getStepData<ContractPenaltiesData>(nextDraftId, 'penalties'),
          Promise.resolve(getFrontendStepDraft<ContractPenaltiesData>(nextDraftId, 'penalties')),
        ]);

        if (!mounted) return;
        const nextPayload = normalizePenaltiesPayload(serverData ?? frontendDraft ?? buildBootstrapPenaltiesPayload(bootstrap?.rules.penalty ?? null));
        setTypes(nextPayload.types);
        setRules(nextPayload.rules);
        if (!serverData && !frontendDraft && bootstrap?.rules.penalty) {
          void saveStepData(nextDraftId, 'penalties', nextPayload).catch(() => undefined);
        }
        initialSnapshotRef.current = serializePayload(nextPayload);
        setDirty(false);
        dispatchContractFlowDirty(stepId as ContractFlowSectionId, false);
      } catch (error) {
        if (!mounted) return;
        setFormError(error instanceof Error ? error.message : 'بارگذاری اطلاعات جرایم انجام نشد.');
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
    if (!draftId || loading) return;

    setFrontendStepDraft(draftId, 'penalties', payload);
    const nextDirty = serializePayload(payload) !== initialSnapshotRef.current;
    if (nextDirty !== dirty) {
      setDirty(nextDirty);
      dispatchContractFlowDirty(stepId as ContractFlowSectionId, nextDirty);
    }
  }, [dirty, draftId, loading, payload, stepId]);

  useContractDraftAutosave({
    draftId,
    step: 'penalties',
    payload,
    enabled: !loading && Boolean(draftId),
    onError: (error) => setFormError(error instanceof Error ? `ذخیره خودکار جرایم انجام نشد: ${error.message}` : 'ذخیره خودکار جرایم انجام نشد.'),
  });

  const loadRuleFormForType = (penaltyTypeId: string) => {
    const existingRule = rules.find((item) => item.penaltyTypeId === penaltyTypeId);
    setActivePenaltyTypeId(penaltyTypeId);
    setEditingRuleId(existingRule?.id ?? null);
    setRuleForm(existingRule ? normalizeRule(existingRule) : makeEmptyRule(penaltyTypeId));
    setDialogError('');
  };

  const openRuleDialog = (penaltyTypeId: string, rule?: PenaltyRuleData) => {
    setExpandedPenaltyTypeId(penaltyTypeId);
    setActivePenaltyTypeId(penaltyTypeId);
    setDialogError('');

    if (rule) {
      setEditingRuleId(rule.id);
      setRuleForm(normalizeRule(rule));
      return;
    }

    loadRuleFormForType(penaltyTypeId);
  };

  const validateRuleForm = (rule: PenaltyRuleData) => {
    if (rule.mode === 'fixed' && !(Number(rule.fixedAmount.replace(/,/g, '')) > 0)) {
      return 'مبلغ ثابت جریمه را وارد کنید.';
    }

    if ((rule.mode === 'overdue' || rule.mode === 'contract') && !(Number(rule.penaltyPercent) > 0)) {
      return 'درصد جریمه را وارد کنید.';
    }

    if (!(Number(rule.graceDays) >= 0)) {
      return 'مهلت تنفس معتبر نیست.';
    }

    if (rule.mode === 'progressive') {
      const validation = validateProgressiveRows(rule.progressiveRows);
      if (!validation.ok) return validation.message;
    }

    if (rule.extraFeeEnabled && !(Number(rule.extraFeeAmount.replace(/,/g, '')) > 0)) {
      return 'مقدار هزینه دیرکرد را وارد کنید.';
    }

    return '';
  };

  const submitRule = () => {
    const error = validateRuleForm(ruleForm);
    if (error) {
      setDialogError(error);
      return;
    }

    setRules((current) => {
      const normalized = normalizeRule(ruleForm);
      const progressiveValidation = normalized.mode === 'progressive' ? validateProgressiveRows(normalized.progressiveRows) : null;
      const readyRule =
        progressiveValidation?.ok ? { ...normalized, progressiveRows: progressiveValidation.rows } : normalized;
      // Only one rule per penalty type is allowed.
      const withoutType = current.filter((item) => item.penaltyTypeId !== readyRule.penaltyTypeId);
      return editingRuleId
        ? withoutType.concat(readyRule)
        : withoutType.concat({ ...readyRule, id: readyRule.id || `rule-${Math.random().toString(36).slice(2, 10)}` });
    });
    setDialogError('');
  };

  const handleSubmit = async () => {
    if (!draftId) return;

    const result = validatePenaltiesStep(payload);
    if (!result.valid) {
      setShowValidation(true);
      setFormError(buildValidationSummary(result.errors, {}, 'اطلاعات جرایم کامل نیست.'));
      return;
    }

    setSaving(true);
    setFormError('');
    setShowValidation(false);

    try {
      if (partyTab === 'seller') {
        await sellerPenaltyRef.current?.saveIfDirty();
      }

      await saveStepData(draftId, 'penalties', payload);
      clearFrontendStepDraft(draftId, 'penalties');
      initialSnapshotRef.current = serializePayload(payload);
      setDirty(false);
      dispatchContractFlowDirty(stepId as ContractFlowSectionId, false);
      dispatchContractFlowSavedForDraft(draftId, stepId as ContractFlowSectionId, Date.now(), payload);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ذخیره جرایم انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ContractStepLoader title={title} description="در حال بارگذاری اطلاعات جرایم قرارداد..." />;
  }

  return (
    <div className="space-y-5">
      {!embedded ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-gray-500">ابتدا نوع‌های جریمه را فعال کنید و برای هر نوع فعال، حداقل یک آیتم جریمه ثبت کنید.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push(basePath)}
            className="rounded-[8px] border border-gray-300 px-3.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            بازگشت به مراحل
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[8px] border border-gray-200 bg-white text-right shadow-sm" dir="rtl">
        <PenaltiesPartyTabBar
          activeTab={partyTab}
          buyerProgressLabel={`${configuredActiveTypesCount}/${Math.max(activeTypes.length, 1)} ثبت‌شده`}
          sellerProgressLabel="تنظیمات"
          buyerAlignmentTag={buyerPartyAlignmentTag}
          sellerAlignmentTag={sellerPartyAlignmentTag}
          onSelect={setPartyTab}
        />

        {/* Keep both tabs mounted to prevent layout "jump" on switch */}
        <div className={partyTab === 'seller' ? 'block' : 'hidden'} aria-hidden={partyTab !== 'seller'}>
          <div className="p-6 sm:p-8">
            <BuilderPenaltyInFlow ref={sellerPenaltyRef} onStatusChange={setSellerStatus} settingsReference={snapshot?.rules?.['builder-penalty']} />
          </div>
        </div>

        <div className={partyTab === 'seller' ? 'hidden' : 'block'} aria-hidden={partyTab === 'seller'}>
          <div className="space-y-6 p-5 sm:p-8">
            <div className="border-b border-slate-100 pb-5">
              <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">تعریف جرایم خریدار</p>
              <p className="mt-0.5 text-[13px] text-slate-500">نوع جریمه را فعال کنید، سپس برای همان نوع یک یا چند rule ثبت کنید.</p>
            </div>

            <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">فهرست انواع جریمه</h2>
              <span className="text-xs text-slate-400">{activeTypes.length} مورد فعال</span>
            </div>

            <div className="space-y-3">
              {types.map((type) => {
                const typeRules = rules.filter((rule) => rule.penaltyTypeId === type.id);
                const typeRule = typeRules[0] ?? null;
                const isExpanded = expandedPenaltyTypeId === type.id;
                const liveRule =
                  isExpanded && type.active && ruleForm.penaltyTypeId === type.id
                    ? normalizeRule({ ...ruleForm, id: typeRule?.id || ruleForm.id || `rule-${type.id}` })
                    : typeRule;
                const typeHint = resolveBuyerPenaltyTypeHint(snapshot?.rules?.penalty, type.id, type.active, liveRule);
                const fieldHints = resolveBuyerPenaltyFieldHints(snapshot?.rules?.penalty, type.id, type.active, liveRule);
                const fieldTag = (key: Parameters<typeof getBuyerPenaltyFieldHint>[1]) => {
                  const hint = getBuyerPenaltyFieldHint(fieldHints, key);
                  return <SettingsFieldAlignmentTag status={hint.status} settingsLabel={hint.settingsLabel} />;
                };
                const shouldShowAlignmentTag = Boolean(snapshot?.rules?.penalty);
                const alignmentTag = shouldShowAlignmentTag ? buyerPenaltyAlignmentTag(typeHint.status) : null;

                return (
                  <div
                    key={type.id}
                    className={`overflow-hidden rounded-[8px] border transition ${
                      type.active ? 'border-cyan-200 bg-cyan-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedPenaltyTypeId((current) => {
                              const next = current === type.id ? '' : type.id;
                              if (next && type.active) loadRuleFormForType(next);
                              return next;
                            });
                          }}
                          className="flex min-w-0 flex-1 flex-col gap-3 text-right sm:flex-row-reverse sm:items-center sm:gap-4"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-800">{type.title}</h3>
                              {type.active ? (
                                <span className="rounded-full border border-cyan-200 bg-white px-2 py-0.5 text-[11px] font-medium text-cyan-700">
                                  {typeRule ? 'تنظیم شده' : 'تنظیم نشده'}
                                </span>
                              ) : (
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                  غیرفعال
                                </span>
                              )}
                              {alignmentTag ? (
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${alignmentTag.className}`}
                                >
                                  {alignmentTag.label}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs leading-6 text-slate-500">{type.description}</p>
                          </div>
                          <ChevronLeft
                            className={`h-5 w-5 shrink-0 text-slate-400 transition ${isExpanded ? '-rotate-90' : ''}`}
                            aria-hidden
                          />
                        </button>
                        <PenaltySwitch
                          checked={type.active}
                          onChange={(checked) => {
                            setTypes((current) => current.map((item) => (item.id === type.id ? { ...item, active: checked } : item)));
                            if (checked) {
                              setExpandedPenaltyTypeId(type.id);
                              loadRuleFormForType(type.id);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className={`border-t p-4 ${type.active ? 'border-cyan-100 bg-white/80' : 'border-slate-100 bg-slate-50/60'}`}>
                        <div className="space-y-4">
                          {!type.active ? (
                            <p className="text-xs leading-6 text-slate-500">
                              برای ثبت مقادیر جریمه و دیدن تگ هم‌راستایی کنار هر فیلد، این نوع را فعال کنید.
                            </p>
                          ) : (
                            <>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs font-semibold text-slate-500">
                              {typeRule ? `خلاصه: ${formatRuleSummary(typeRule)}` : 'هنوز جریمه‌ای ثبت نشده است.'}
                            </div>
                          </div>

                          <section className="space-y-3">
                            <FieldBlock label="روش محاسبه جریمه" alignmentTag={fieldTag('mode')}>
                              <TagPills
                                options={MODE_OPTIONS.map((item) => ({ value: item.id, label: item.title }))}
                                value={ruleForm.mode}
                                onChange={(value) => setRuleForm((current) => ({ ...current, mode: value, penaltyTypeId: type.id }))}
                              />
                              <p className="text-xs text-slate-500">
                                {MODE_OPTIONS.find((item) => item.id === ruleForm.mode)?.description}
                              </p>
                            </FieldBlock>
                          </section>

                          <FieldBlock label="دوره محاسبه جریمه" alignmentTag={fieldTag('period')}>
                            <TagPills
                              options={PERIOD_OPTIONS}
                              value={ruleForm.period}
                              onChange={(value) => setRuleForm((current) => ({ ...current, period: value, penaltyTypeId: type.id }))}
                            />
                          </FieldBlock>

                          {ruleForm.mode === 'fixed' ? (
                            <FieldBlock label="مبلغ ثابت جریمه" hint="مبلغی که برای هر دوره تاخیر اعمال می‌شود." alignmentTag={fieldTag('fixedAmount')}>
                              <Input
                                value={ruleForm.fixedAmount}
                                onChange={(event) =>
                                  setRuleForm((current) => ({ ...current, fixedAmount: formatInput(event.target.value), penaltyTypeId: type.id }))
                                }
                                placeholder="مثال: 100,000"
                              />
                            </FieldBlock>
                          ) : null}

                          {ruleForm.mode === 'overdue' || ruleForm.mode === 'contract' ? (
                            <div className="grid gap-4 md:grid-cols-2">
                              <FieldBlock label="درصد جریمه" alignmentTag={fieldTag('penaltyPercent')}>
                                <Input
                                  value={ruleForm.penaltyPercent}
                                  onChange={(event) => setRuleForm((current) => ({ ...current, penaltyPercent: event.target.value, penaltyTypeId: type.id }))}
                                  placeholder="مثال: 0.5"
                                />
                              </FieldBlock>
                              <FieldBlock label="درصد سود بانکی" alignmentTag={fieldTag('bankInterestPercent')}>
                                <Input
                                  value={ruleForm.bankInterestPercent}
                                  onChange={(event) =>
                                    setRuleForm((current) => ({ ...current, bankInterestPercent: event.target.value, penaltyTypeId: type.id }))
                                  }
                                  placeholder="در صورت نیاز"
                                />
                              </FieldBlock>
                            </div>
                          ) : null}

                          {ruleForm.mode === 'progressive' ? (
                            <div className="space-y-4">
                              <FieldBlock label="درصد سود بانکی" alignmentTag={fieldTag('bankInterestPercent')}>
                                <Input
                                  value={ruleForm.bankInterestPercent}
                                  onChange={(event) =>
                                    setRuleForm((current) => ({ ...current, bankInterestPercent: event.target.value, penaltyTypeId: type.id }))
                                  }
                                  placeholder="در صورت نیاز"
                                />
                              </FieldBlock>
                              <div className="space-y-3 rounded-[8px] border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-700">بازه‌های جریمه تصاعدی</h4>
                                    <p className="mt-1 text-xs leading-6 text-slate-500">شروع هر ردیف خودکار است؛ فقط پایان بازه و نرخ را وارد کنید.</p>
                                  </div>
                                  <button
                                    type="button"
                                    disabled={!canAddProgressiveRow(ruleForm.progressiveRows)}
                                    onClick={() =>
                                      setRuleForm((current) => ({
                                        ...current,
                                        penaltyTypeId: type.id,
                                        progressiveRows: normalizeProgressiveRows([
                                          ...current.progressiveRows,
                                          {
                                            id: `row-${Date.now()}`,
                                            fromDay: getNextProgressiveFromDay(current.progressiveRows),
                                            toDay: '',
                                            rate: '',
                                            openEnded: false,
                                          },
                                        ]),
                                      }))
                                    }
                                    className="inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800 disabled:cursor-not-allowed disabled:text-slate-400"
                                  >
                                    <Plus className="h-4 w-4" />
                                    افزودن بازه
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {normalizeProgressiveRows(ruleForm.progressiveRows).map((row, index) => {
                                    const rowNumber = Math.min(index + 1, 4) as 1 | 2 | 3 | 4;
                                    return (
                                    <div key={row.id} className="grid gap-3 rounded-[8px] border border-slate-200 bg-white p-3 md:grid-cols-[110px_1fr_150px_140px_auto] md:items-end">
                                      <FieldBlock label="از روز" alignmentTag={fieldTag(`progressiveRow${rowNumber}From`)}>
                                        <Input value={row.fromDay} disabled className="bg-slate-50 text-slate-500" />
                                      </FieldBlock>
                                      <FieldBlock label="پایان بازه" alignmentTag={fieldTag(`progressiveRow${rowNumber}To`)}>
                                        <div className="flex items-center gap-2">
                                          <Input
                                            value={row.toDay}
                                            disabled={row.openEnded}
                                            onChange={(event) =>
                                              setRuleForm((current) => ({
                                                ...current,
                                                penaltyTypeId: type.id,
                                                progressiveRows: normalizeProgressiveRows(current.progressiveRows.map((item) =>
                                                  item.id === row.id ? { ...item, toDay: sanitizePositiveIntegerInput(event.target.value), openEnded: false } : item,
                                                )),
                                              }))
                                            }
                                            placeholder="تا روز"
                                          />
                                          <label className="inline-flex shrink-0 items-center gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                            <input
                                              type="checkbox"
                                              checked={Boolean(row.openEnded)}
                                              onChange={(event) =>
                                                setRuleForm((current) => {
                                                  const checked = event.target.checked;
                                                  const currentRows = normalizeProgressiveRows(current.progressiveRows);
                                                  const idx = currentRows.findIndex((item) => item.id === row.id);
                                                  const nextRows = currentRows
                                                    .slice(0, checked ? idx + 1 : currentRows.length)
                                                    .map((item) => (item.id === row.id ? { ...item, openEnded: checked, toDay: checked ? '' : item.toDay } : item));
                                                  return { ...current, penaltyTypeId: type.id, progressiveRows: normalizeProgressiveRows(nextRows) };
                                                })
                                              }
                                            />
                                            به بعد
                                          </label>
                                        </div>
                                      </FieldBlock>
                                      <FieldBlock label="نرخ جریمه" alignmentTag={fieldTag(`progressiveRow${rowNumber}Rate`)}>
                                        <Input
                                          value={row.rate}
                                          onChange={(event) =>
                                            setRuleForm((current) => ({
                                              ...current,
                                              penaltyTypeId: type.id,
                                              progressiveRows: normalizeProgressiveRows(current.progressiveRows.map((item) =>
                                                item.id === row.id ? { ...item, rate: sanitizeDecimalInput(event.target.value) } : item,
                                              )),
                                            }))
                                          }
                                          placeholder="مثلا 1.25"
                                        />
                                      </FieldBlock>
                                      <div className="rounded-[8px] bg-slate-50 px-3 py-2 text-xs leading-6 text-slate-500">
                                        {row.openEnded ? `از روز ${row.fromDay} به بعد` : row.toDay ? `${row.fromDay} تا ${row.toDay} روز` : 'پایان بازه را وارد کنید'}
                                      </div>
                                      <button
                                        type="button"
                                        disabled={index === 0}
                                        onClick={() =>
                                          setRuleForm((current) => ({
                                            ...current,
                                            penaltyTypeId: type.id,
                                            progressiveRows: normalizeProgressiveRows(current.progressiveRows.filter((item) => item.id !== row.id)),
                                          }))
                                        }
                                        className="h-10 rounded-[8px] border border-rose-200 px-3 text-sm text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        حذف
                                      </button>
                                    </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          <div className="grid gap-4 md:grid-cols-2">
                            <FieldBlock label="مهلت تنفس (روز)" alignmentTag={fieldTag('graceDays')}>
                              <Input
                                value={ruleForm.graceDays}
                                onChange={(event) => setRuleForm((current) => ({ ...current, graceDays: event.target.value, penaltyTypeId: type.id }))}
                                placeholder="مثال: 2"
                              />
                            </FieldBlock>
                            <FieldBlock label="قاعده گرد کردن" alignmentTag={fieldTag('roundRule')}>
                              <TagPills
                                options={ROUND_RULE_OPTIONS}
                                value={ruleForm.roundRule}
                                onChange={(value) => setRuleForm((current) => ({ ...current, roundRule: value, penaltyTypeId: type.id }))}
                              />
                            </FieldBlock>
                          </div>

                          <div className="space-y-4 rounded-[8px] border border-cyan-100 bg-cyan-50 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-sm font-bold text-slate-800">هزینه دیرکرد</h4>
                                  {fieldTag('extraFeeEnabled')}
                                </div>
                                <p className="text-xs text-slate-500">در صورت نیاز، علاوه بر جریمه اصلی یک هزینه دیرکرد هم ثبت کنید.</p>
                              </div>
                              <PenaltySwitch
                                checked={ruleForm.extraFeeEnabled}
                                onChange={(checked) => setRuleForm((current) => ({ ...current, extraFeeEnabled: checked, penaltyTypeId: type.id }))}
                              />
                            </div>

                            {ruleForm.extraFeeEnabled ? (
                              <>
                                <FieldBlock label="نوع هزینه دیرکرد" alignmentTag={fieldTag('extraFeeType')}>
                                  <TagPills
                                    options={EXTRA_FEE_OPTIONS}
                                    value={ruleForm.extraFeeType}
                                    onChange={(value) => setRuleForm((current) => ({ ...current, extraFeeType: value, penaltyTypeId: type.id }))}
                                  />
                                </FieldBlock>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <FieldBlock label="مقدار هزینه دیرکرد" alignmentTag={fieldTag('extraFeeAmount')}>
                                    <Input
                                      value={ruleForm.extraFeeAmount}
                                      onChange={(event) =>
                                        setRuleForm((current) => ({
                                          ...current,
                                          penaltyTypeId: type.id,
                                          extraFeeAmount: current.extraFeeType === 'fixed' ? formatInput(event.target.value) : event.target.value,
                                        }))
                                      }
                                      placeholder={ruleForm.extraFeeType === 'fixed' ? 'مثال: 100,000' : 'مثال: 0.6'}
                                    />
                                  </FieldBlock>
                                  <FieldBlock label="قاعده گرد کردن هزینه دیرکرد" alignmentTag={fieldTag('extraFeeRound')}>
                                    <TagPills
                                      options={ROUND_RULE_OPTIONS}
                                      value={ruleForm.extraFeeRoundRule}
                                      onChange={(value) => setRuleForm((current) => ({ ...current, extraFeeRoundRule: value, penaltyTypeId: type.id }))}
                                    />
                                  </FieldBlock>
                                </div>
                              </>
                            ) : null}
                          </div>

                          {dialogError ? (
                            <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{dialogError}</div>
                          ) : null}

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => submitRule()}
                              className="inline-flex items-center gap-2 rounded-[8px] bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
                            >
                              <Save className="h-4 w-4" />
                              ذخیره جریمه
                            </button>
                          </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">جرایم فعال‌شده</h2>
              <span className="text-xs text-slate-400">برای هر نوع فعال حداقل یک مورد ثبت کنید</span>
            </div>

            {activeTypes.length === 0 ? (
              <div className="rounded-[8px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                هنوز هیچ نوع جریمه‌ای فعال نشده است.
              </div>
            ) : (
              <div className="space-y-5">
                {activeTypes.map((type) => {
                  const typeRules = rules.filter((rule) => rule.penaltyTypeId === type.id);

                  return (
                    <div key={type.id} className="rounded-[8px] border border-slate-200 bg-slate-50/50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-800">{type.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">{type.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openRuleDialog(type.id)}
                          className="mt-2 inline-flex h-8 items-center gap-2 rounded-[8px] border border-[#14a7ad] bg-white/65 px-3 text-xs font-bold text-[#0e989d] transition hover:bg-[#dff4f3]"
                        >
                          <Plus className="h-4 w-4" />
                          افزودن جریمه
                        </button>
                      </div>

                      {typeRules.length === 0 ? (
                        <div className="mt-4 rounded-[8px] border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                          هنوز جریمه‌ای برای این نوع ثبت نشده است.
                        </div>
                      ) : (
                        <div className="mt-4 grid gap-3">
                          {typeRules.map((rule, index) => (
                            <div key={rule.id} className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                                      جریمه {index + 1}
                                    </span>
                                    <span className="text-xs text-slate-400">{MODE_OPTIONS.find((item) => item.id === rule.mode)?.title}</span>
                                  </div>
                                  <p className="text-sm font-medium text-slate-700">{formatRuleSummary(rule)}</p>
                                  <p className="text-xs text-slate-500">
                                    مهلت تنفس: {rule.graceDays || '0'} روز
                                    {rule.extraFeeEnabled ? ' · هزینه دیرکرد فعال' : ''}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openRuleDialog(type.id, rule)}
                                    className="rounded-[8px] border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                                  >
                                    ویرایش
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRules((current) => current.filter((item) => item.id !== rule.id))}
                                    className="rounded-[8px] border border-rose-200 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
                                  >
                                    حذف
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {formError ? (
            <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
          ) : null}
          </div>
        </div>
      </div>

      <StickySubmitBar
        label="ثبت جرایم"
        loadingLabel={
          partyTab === 'seller'
            ? sellerStatus.loading
              ? 'در حال بارگذاری...'
              : sellerStatus.saving || saving
                ? 'در حال ذخیره...'
                : undefined
            : loading
              ? 'در حال بارگذاری...'
              : saving
                ? 'در حال ذخیره...'
                : undefined
        }
        disabled={partyTab === 'seller' ? sellerStatus.loading || sellerStatus.saving || saving : loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
      />
    </div>
  );
}


