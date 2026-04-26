'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { BadgePercent, ChevronLeft, CircleDollarSign, CirclePercent, LoaderCircle, Plus, Save, TrendingUp, X } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import { ContractStepLoader } from './ContractStepLoader';
import { FieldLabel } from './FieldLabel';
import { StickySubmitBar } from './StickySubmitBar';
import { PENALTY_ITEMS, getPenaltyItem } from './penaltiesConfig';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import { TagPills } from './ContractFormPrimitives';
import {
  clearFrontendStepDraft,
  ensureActiveDraftId,
  getFrontendStepDraft,
  getStepData,
  saveStepData,
  setFrontendStepDraft,
} from '../../../../lib/contractDraftClient';
import { validatePenaltiesStep } from '../../../../lib/contractValidation';
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
import { dispatchContractFlowDirty, dispatchContractFlowSaved } from './contractFlowSignals';
import type { ContractFlowSectionId } from './contractFlowSignals';

const MODE_OPTIONS: Array<{
  id: PenaltyMode;
  title: string;
  description: string;
  icon: typeof CircleDollarSign;
}> = [
  {
    id: 'fixed',
    title: 'مبلغ ثابت برای هر روز/ماه',
    description: 'در این روش، برای هر دوره تاخیر مبلغ ثابتی به‌عنوان جریمه محاسبه می‌شود.',
    icon: CircleDollarSign,
  },
  {
    id: 'overdue',
    title: 'درصدی از مانده بدهی معوق',
    description: 'جریمه به‌صورت درصدی از مانده بدهی معوق محاسبه می‌شود.',
    icon: BadgePercent,
  },
  {
    id: 'contract',
    title: 'درصدی از کل قرارداد',
    description: 'جریمه بر مبنای درصدی از کل مبلغ قرارداد در بازه انتخاب‌شده محاسبه می‌شود.',
    icon: CirclePercent,
  },
  {
    id: 'progressive',
    title: 'جریمه تصاعدی با روزهای تاخیر',
    description: 'مبلغ جریمه با افزایش مدت تاخیر بر اساس بازه‌های زمانی مختلف افزایش پیدا می‌کند.',
    icon: TrendingUp,
  },
];

const PERIOD_OPTIONS: Array<{ value: PenaltyPeriod; label: string }> = [
  { value: 'daily', label: 'روزانه' },
  { value: 'monthly', label: 'ماهانه' },
  { value: 'yearly', label: 'سالانه' },
];

const ROUND_RULE_OPTIONS: Array<{ value: PenaltyRoundRule; label: string }> = [
  { value: '0.5', label: '۰.۵' },
  { value: '5', label: '۵' },
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
  { id: 'row-4', fromDay: '', toDay: '', rate: '' },
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
  return {
    ...rule,
    fixedAmount: String(rule.fixedAmount ?? ''),
    penaltyPercent: String(rule.penaltyPercent ?? ''),
    bankInterestPercent: String(rule.bankInterestPercent ?? ''),
    graceDays: String(rule.graceDays ?? ''),
    extraFeeAmount: String(rule.extraFeeAmount ?? ''),
    progressiveRows: (rule.progressiveRows?.length ? rule.progressiveRows : DEFAULT_PROGRESSIVE_ROWS).map((row, index) => ({
      id: row.id || `row-${index + 1}`,
      fromDay: String(row.fromDay ?? ''),
      toDay: String(row.toDay ?? ''),
      rate: String(row.rate ?? ''),
    })),
  };
}

function normalizePenaltiesPayload(data: ContractPenaltiesData | null): ContractPenaltiesData {
  const typeMap = new Map((data?.types ?? []).map((item) => [item.id, item]));
  const types = PENALTY_ITEMS.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    active: typeMap.get(item.id)?.active ?? false,
  }));
  const validTypeIds = new Set(types.map((item) => item.id));
  const rules = (data?.rules ?? []).filter((item) => validTypeIds.has(item.penaltyTypeId)).map(normalizeRule);
  const activeTab = types.find((item) => item.active)?.id ?? types[0]?.id ?? '';

  return { activeTab, types, rules };
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
      <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h3 className="text-base font-bold text-gray-800">{title}</h3>
            {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
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
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} />
      {children}
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export function PenaltiesStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState('');

  const [types, setTypes] = useState<PenaltyTypeStateData[]>(INITIAL_TYPES);
  const [rules, setRules] = useState<PenaltyRuleData[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
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
  const activeTypes = useMemo(() => types.filter((item) => item.active), [types]);

  useEffect(() => {
    if (!expandedPenaltyTypeId) {
      const firstActiveTypeId = types.find((item) => item.active)?.id ?? '';
      if (firstActiveTypeId) setExpandedPenaltyTypeId(firstActiveTypeId);
      return;
    }

    const expandedTypeStillActive = types.some((item) => item.id === expandedPenaltyTypeId && item.active);
    if (!expandedTypeStillActive) {
      setExpandedPenaltyTypeId(types.find((item) => item.active)?.id ?? '');
    }
  }, [expandedPenaltyTypeId, types]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const nextDraftId = await ensureActiveDraftId();
      if (!mounted) return;
      setDraftId(nextDraftId);

      try {
        const [serverData, frontendDraft] = await Promise.all([
          getStepData<ContractPenaltiesData>(nextDraftId, 'penalties'),
          Promise.resolve(getFrontendStepDraft<ContractPenaltiesData>(nextDraftId, 'penalties')),
        ]);

        if (!mounted) return;
        const nextPayload = normalizePenaltiesPayload(frontendDraft ?? serverData);
        setTypes(nextPayload.types);
        setRules(nextPayload.rules);
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

  const openRuleDialog = (penaltyTypeId: string, rule?: PenaltyRuleData) => {
    setActivePenaltyTypeId(penaltyTypeId);
    setEditingRuleId(rule?.id ?? null);
    setRuleForm(rule ? normalizeRule(rule) : makeEmptyRule(penaltyTypeId));
    setDialogError('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRuleId(null);
    setDialogError('');
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
      const hasConfiguredRow = rule.progressiveRows.some((item) => item.rate && item.fromDay && item.toDay);
      if (!hasConfiguredRow) {
        return 'حداقل یک بازه تصاعدی کامل ثبت کنید.';
      }
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
      if (editingRuleId) {
        return current.map((item) => (item.id === editingRuleId ? normalizeRule(ruleForm) : item));
      }

      return [...current, normalizeRule(ruleForm)];
    });

    closeDialog();
  };

  const handleSubmit = async () => {
    if (!draftId) return;

    const result = validatePenaltiesStep(payload);
    if (!result.valid) {
      setFormError(Object.values(result.errors)[0] ?? 'اطلاعات جرایم کامل نیست.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      await saveStepData(draftId, 'penalties', payload);
      clearFrontendStepDraft(draftId, 'penalties');
      initialSnapshotRef.current = serializePayload(payload);
      setDirty(false);
      dispatchContractFlowDirty(stepId as ContractFlowSectionId, false);
      dispatchContractFlowSaved(stepId as ContractFlowSectionId);
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
            className="rounded-md border border-gray-300 px-3.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            بازگشت به مراحل
          </button>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">تعریف جرایم قرارداد</p>
          <p className="mt-0.5 text-[13px] text-slate-500">نوع جریمه را فعال کنید، سپس برای همان نوع یک یا چند rule ثبت کنید.</p>
        </div>

        <div className="space-y-6 p-5">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">فهرست انواع جریمه</h2>
              <span className="text-xs text-slate-400">{activeTypes.length} مورد فعال</span>
            </div>

            <div className="space-y-3">
              {types.map((type) => {
                const typeRules = rules.filter((rule) => rule.penaltyTypeId === type.id);
                const isExpanded = type.active && expandedPenaltyTypeId === type.id;

                return (
                  <div
                    key={type.id}
                    className={`overflow-hidden rounded-2xl border transition ${
                      type.active ? 'border-cyan-200 bg-cyan-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (!type.active) return;
                            setExpandedPenaltyTypeId((current) => (current === type.id ? '' : type.id));
                          }}
                          className="flex-1 text-right"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-800">{type.title}</h3>
                              {type.active ? (
                                <span className="rounded-full border border-cyan-200 bg-white px-2 py-0.5 text-[11px] font-medium text-cyan-700">
                                  {typeRules.length} جریمه
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs leading-6 text-slate-500">{type.description}</p>
                          </div>
                        </button>
                        <PenaltySwitch
                          checked={type.active}
                          onChange={(checked) => {
                            setTypes((current) => current.map((item) => (item.id === type.id ? { ...item, active: checked } : item)));
                            if (checked) {
                              setExpandedPenaltyTypeId(type.id);
                            } else if (expandedPenaltyTypeId === type.id) {
                              setExpandedPenaltyTypeId('');
                            }
                          }}
                        />
                      </div>
                      {validation.errors[`type:${type.id}`] ? (
                        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                          {validation.errors[`type:${type.id}`]}
                        </p>
                      ) : null}
                    </div>

                    {isExpanded ? (
                      <div className="border-t border-cyan-100 bg-white/80 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-700">جرایم این ردیف</h4>
                            <p className="mt-1 text-xs text-slate-500">برای این نوع، یک یا چند rule ثبت کنید.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openRuleDialog(type.id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-800"
                          >
                            <Plus className="h-4 w-4" />
                            افزودن جریمه
                          </button>
                        </div>

                        {typeRules.length === 0 ? (
                          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                            هنوز جریمه‌ای برای این نوع ثبت نشده است.
                          </div>
                        ) : (
                          <div className="mt-4 grid gap-3">
                            {typeRules.map((rule, index) => (
                              <div key={rule.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                                    >
                                      ویرایش
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRules((current) => current.filter((item) => item.id !== rule.id))}
                                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
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
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                هنوز هیچ نوع جریمه‌ای فعال نشده است.
              </div>
            ) : (
              <div className="space-y-5">
                {activeTypes.map((type) => {
                  const typeRules = rules.filter((rule) => rule.penaltyTypeId === type.id);

                  return (
                    <div key={type.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-800">{type.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">{type.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openRuleDialog(type.id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-800"
                        >
                          <Plus className="h-4 w-4" />
                          افزودن جریمه
                        </button>
                      </div>

                      {typeRules.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                          هنوز جریمه‌ای برای این نوع ثبت نشده است.
                        </div>
                      ) : (
                        <div className="mt-4 grid gap-3">
                          {typeRules.map((rule, index) => (
                            <div key={rule.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                                  >
                                    ویرایش
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRules((current) => current.filter((item) => item.id !== rule.id))}
                                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
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
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
          ) : null}
        </div>
      </div>

      <StickySubmitBar
        label="ثبت جرایم"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
      />

      <Modal
        open={dialogOpen}
        onClose={closeDialog}
        title={editingRuleId ? 'ویرایش جریمه' : 'افزودن جریمه'}
        description={`فرم ثبت جریمه برای ${getPenaltyItem(activePenaltyTypeId)?.title ?? 'نوع انتخاب‌شده'}`}
        footer={
          <>
            <button type="button" onClick={closeDialog} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              لغو
            </button>
            <button type="button" onClick={submitRule} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
              <Save className="h-4 w-4" />
              {editingRuleId ? 'ذخیره تغییرات' : 'ثبت جریمه'}
            </button>
          </>
        }
      >
        <section className="space-y-3">
          <FieldLabel label="روش محاسبه جریمه" />
          <div className="grid gap-3 md:grid-cols-2">
            {MODE_OPTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = ruleForm.mode === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRuleForm((current) => ({ ...current, mode: item.id }))}
                  className={`rounded-2xl border p-4 text-right transition ${
                    isActive ? 'border-cyan-300 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full border ${isActive ? 'border-cyan-200 bg-white' : 'border-slate-200 bg-slate-50'}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="space-y-1">
                      <span className="block text-sm font-bold">{item.title}</span>
                      <span className="block text-xs leading-5 text-slate-500">{item.description}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <FieldBlock label="دوره محاسبه جریمه">
          <TagPills options={PERIOD_OPTIONS} value={ruleForm.period} onChange={(value) => setRuleForm((current) => ({ ...current, period: value }))} />
        </FieldBlock>

        {ruleForm.mode === 'fixed' ? (
          <FieldBlock label="مبلغ ثابت جریمه" hint="مبلغی که برای هر دوره تاخیر اعمال می‌شود.">
            <Input value={ruleForm.fixedAmount} onChange={(event) => setRuleForm((current) => ({ ...current, fixedAmount: formatInput(event.target.value) }))} placeholder="مثال: 100,000" />
          </FieldBlock>
        ) : null}

        {ruleForm.mode === 'overdue' || ruleForm.mode === 'contract' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <FieldBlock label="درصد جریمه">
              <Input value={ruleForm.penaltyPercent} onChange={(event) => setRuleForm((current) => ({ ...current, penaltyPercent: event.target.value }))} placeholder="مثال: 0.5" />
            </FieldBlock>
            <FieldBlock label="درصد سود بانکی">
              <Input value={ruleForm.bankInterestPercent} onChange={(event) => setRuleForm((current) => ({ ...current, bankInterestPercent: event.target.value }))} placeholder="در صورت نیاز" />
            </FieldBlock>
          </div>
        ) : null}

        {ruleForm.mode === 'progressive' ? (
          <div className="space-y-4">
            <FieldBlock label="درصد سود بانکی">
              <Input value={ruleForm.bankInterestPercent} onChange={(event) => setRuleForm((current) => ({ ...current, bankInterestPercent: event.target.value }))} placeholder="در صورت نیاز" />
            </FieldBlock>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-700">بازه‌های جریمه تصاعدی</h4>
                <button
                  type="button"
                  onClick={() =>
                    setRuleForm((current) => ({
                      ...current,
                      progressiveRows: [...current.progressiveRows, { id: `row-${Date.now()}`, fromDay: '', toDay: '', rate: '' }],
                    }))
                  }
                  className="inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800"
                >
                  <Plus className="h-4 w-4" />
                  افزودن بازه
                </button>
              </div>
              <div className="space-y-3">
                {ruleForm.progressiveRows.map((row) => (
                  <div key={row.id} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                    <Input
                      value={row.fromDay}
                      onChange={(event) =>
                        setRuleForm((current) => ({
                          ...current,
                          progressiveRows: current.progressiveRows.map((item) => (item.id === row.id ? { ...item, fromDay: event.target.value } : item)),
                        }))
                      }
                      placeholder="از روز"
                    />
                    <Input
                      value={row.toDay}
                      onChange={(event) =>
                        setRuleForm((current) => ({
                          ...current,
                          progressiveRows: current.progressiveRows.map((item) => (item.id === row.id ? { ...item, toDay: event.target.value } : item)),
                        }))
                      }
                      placeholder="تا روز"
                    />
                    <Input
                      value={row.rate}
                      onChange={(event) =>
                        setRuleForm((current) => ({
                          ...current,
                          progressiveRows: current.progressiveRows.map((item) => (item.id === row.id ? { ...item, rate: event.target.value } : item)),
                        }))
                      }
                      placeholder="نرخ جریمه"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setRuleForm((current) => ({
                          ...current,
                          progressiveRows: current.progressiveRows.filter((item) => item.id !== row.id),
                        }))
                      }
                      className="rounded-lg border border-rose-200 px-3 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <FieldBlock label="مهلت تنفس (روز)">
            <Input value={ruleForm.graceDays} onChange={(event) => setRuleForm((current) => ({ ...current, graceDays: event.target.value }))} placeholder="مثال: 2" />
          </FieldBlock>
          <FieldBlock label="قاعده گرد کردن">
            <TagPills options={ROUND_RULE_OPTIONS} value={ruleForm.roundRule} onChange={(value) => setRuleForm((current) => ({ ...current, roundRule: value }))} />
          </FieldBlock>
        </div>

        <div className="space-y-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">هزینه دیرکرد</h4>
              <p className="mt-1 text-xs text-slate-500">در صورت نیاز، علاوه بر جریمه اصلی یک هزینه دیرکرد هم ثبت کنید.</p>
            </div>
            <PenaltySwitch
              checked={ruleForm.extraFeeEnabled}
              onChange={(checked) => setRuleForm((current) => ({ ...current, extraFeeEnabled: checked }))}
            />
          </div>

          {ruleForm.extraFeeEnabled ? (
            <>
              <FieldBlock label="نوع هزینه دیرکرد">
                <TagPills options={EXTRA_FEE_OPTIONS} value={ruleForm.extraFeeType} onChange={(value) => setRuleForm((current) => ({ ...current, extraFeeType: value }))} />
              </FieldBlock>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldBlock label="مقدار هزینه دیرکرد">
                  <Input
                    value={ruleForm.extraFeeAmount}
                    onChange={(event) =>
                      setRuleForm((current) => ({
                        ...current,
                        extraFeeAmount: current.extraFeeType === 'fixed' ? formatInput(event.target.value) : event.target.value,
                      }))
                    }
                    placeholder={ruleForm.extraFeeType === 'fixed' ? 'مثال: 100,000' : 'مثال: 0.6'}
                  />
                </FieldBlock>
                <FieldBlock label="قاعده گرد کردن هزینه دیرکرد">
                  <TagPills
                    options={ROUND_RULE_OPTIONS}
                    value={ruleForm.extraFeeRoundRule}
                    onChange={(value) => setRuleForm((current) => ({ ...current, extraFeeRoundRule: value }))}
                  />
                </FieldBlock>
              </div>
            </>
          ) : null}
        </div>

        {dialogError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{dialogError}</div>
        ) : null}
      </Modal>
    </div>
  );
}
