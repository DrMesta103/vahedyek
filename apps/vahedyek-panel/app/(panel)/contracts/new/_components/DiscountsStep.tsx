'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, X } from 'lucide-react';
import { Input, StickySubmitBar } from '@repo/ui';
import { ContractStepLoader } from './ContractStepLoader';
import { FieldLabel } from './FieldLabel';
import { TagPills } from './ContractFormPrimitives';
import { DISCOUNT_GROUPS, ITEMIZED_DISCOUNT_ENTRIES, WHOLE_DISCOUNT_ENTRY, getDiscountEntry } from './discountsConfig';
import { ensureActiveDraftId, getFrontendStepDraft, setFrontendStepDraft } from '../../../../lib/contractDraftClient';
import { validateDiscountsStep } from '../../../../lib/contractValidation';
import type {
  ContractDiscountsData,
  DiscountRuleData,
  DiscountScope,
  DiscountTypeStateData,
  DiscountValueMode,
} from '../../../../types/contract';
import { dispatchContractFlowDirty, dispatchContractFlowSavedForDraft } from './contractFlowSignals';
import type { ContractFlowSectionId } from './contractFlowSignals';
import { useContractFlowBasePath } from './useContractFlowBasePath';

const SCOPE_OPTIONS: Array<{ value: DiscountScope; label: string }> = [
  { value: 'whole', label: 'روی کل قرارداد' },
  { value: 'itemized', label: 'تخفیف موردی' },
];

const VALUE_MODE_OPTIONS: Array<{ value: DiscountValueMode; label: string }> = [
  { value: 'amount', label: 'مبلغ' },
  { value: 'percent', label: 'درصد' },
];

const ITEMIZED_ENTRY_OPTIONS = ITEMIZED_DISCOUNT_ENTRIES.map((item) => ({
  value: item.id,
  label: item.title,
}));

const INITIAL_TYPES: DiscountTypeStateData[] = DISCOUNT_GROUPS.map((item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  active: false,
}));

function makeEmptyRule(discountTypeId: string): DiscountRuleData {
  return {
    id: `discount-rule-${Math.random().toString(36).slice(2, 10)}`,
    discountTypeId,
    scope: 'whole',
    entryId: WHOLE_DISCOUNT_ENTRY.id,
    valueMode: 'amount',
    minValue: '',
    maxValue: '',
    conditionNote: '',
    managerApproval: false,
    approvalThreshold: '',
  };
}

function normalizeRule(rule: DiscountRuleData): DiscountRuleData {
  return {
    ...rule,
    scope: rule.scope === 'itemized' ? 'itemized' : 'whole',
    entryId: rule.scope === 'itemized' ? rule.entryId || ITEMIZED_DISCOUNT_ENTRIES[0]?.id || '' : WHOLE_DISCOUNT_ENTRY.id,
    valueMode: rule.valueMode === 'percent' ? 'percent' : 'amount',
    minValue: String(rule.minValue ?? ''),
    maxValue: String(rule.maxValue ?? ''),
    conditionNote: String(rule.conditionNote ?? ''),
    approvalThreshold: String(rule.approvalThreshold ?? ''),
  };
}

function normalizeDiscountsPayload(data: ContractDiscountsData | null): ContractDiscountsData {
  const typeMap = new Map((data?.types ?? []).map((item) => [item.id, item]));
  const types = DISCOUNT_GROUPS.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    active: typeMap.get(item.id)?.active ?? false,
  }));
  const validTypeIds = new Set(types.map((item) => item.id));
  const rules = (data?.rules ?? []).filter((item) => validTypeIds.has(item.discountTypeId)).map(normalizeRule);
  const activeTab = types.find((item) => item.active)?.id ?? types[0]?.id ?? '';

  return { activeTab, types, rules };
}

function serializePayload(payload: ContractDiscountsData) {
  return JSON.stringify(payload);
}

function formatInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function formatRuleSummary(rule: DiscountRuleData) {
  const unit = rule.valueMode === 'percent' ? '%' : 'تومان';
  const target =
    rule.scope === 'whole'
      ? WHOLE_DISCOUNT_ENTRY.title
      : getDiscountEntry('itemized', rule.entryId)?.title ?? 'تخفیف موردی';
  const range = `${rule.minValue || '0'} تا ${rule.maxValue || '0'} ${unit}`;
  return `${target} - ${range}`;
}

function ToggleSwitch({
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

export function DiscountsStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState('');

  const [types, setTypes] = useState<DiscountTypeStateData[]>(INITIAL_TYPES);
  const [rules, setRules] = useState<DiscountRuleData[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [activeDiscountTypeId, setActiveDiscountTypeId] = useState<string>('');
  const [expandedDiscountTypeId, setExpandedDiscountTypeId] = useState<string>('');
  const [ruleForm, setRuleForm] = useState<DiscountRuleData>(makeEmptyRule(DISCOUNT_GROUPS[0]?.id ?? ''));
  const [dialogError, setDialogError] = useState('');

  const payload = useMemo<ContractDiscountsData>(
    () => ({
      activeTab: types.find((item) => item.active)?.id ?? types[0]?.id ?? '',
      types,
      rules,
    }),
    [rules, types],
  );

  const validation = useMemo(() => validateDiscountsStep(payload), [payload]);
  const activeTypes = useMemo(() => types.filter((item) => item.active), [types]);

  useEffect(() => {
    if (!expandedDiscountTypeId) {
      const firstActiveTypeId = types.find((item) => item.active)?.id ?? '';
      if (firstActiveTypeId) setExpandedDiscountTypeId(firstActiveTypeId);
      return;
    }

    const expandedTypeStillActive = types.some((item) => item.id === expandedDiscountTypeId && item.active);
    if (!expandedTypeStillActive) {
      setExpandedDiscountTypeId(types.find((item) => item.active)?.id ?? '');
    }
  }, [expandedDiscountTypeId, types]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const nextDraftId = await ensureActiveDraftId();
      if (!mounted) return;
      setDraftId(nextDraftId);

      try {
        const frontendDraft = getFrontendStepDraft<ContractDiscountsData>(nextDraftId, 'discounts');
        if (!mounted) return;
        const nextPayload = normalizeDiscountsPayload(frontendDraft);
        setTypes(nextPayload.types);
        setRules(nextPayload.rules);
        initialSnapshotRef.current = serializePayload(nextPayload);
        setDirty(false);
        dispatchContractFlowDirty(stepId as ContractFlowSectionId, false);
      } catch (error) {
        if (!mounted) return;
        setFormError(error instanceof Error ? error.message : 'بارگذاری اطلاعات تخفیف‌ها انجام نشد.');
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

    setFrontendStepDraft(draftId, 'discounts', payload);
    const nextDirty = serializePayload(payload) !== initialSnapshotRef.current;
    if (nextDirty !== dirty) {
      setDirty(nextDirty);
      dispatchContractFlowDirty(stepId as ContractFlowSectionId, nextDirty);
    }
  }, [dirty, draftId, loading, payload, stepId]);

  const openRuleDialog = (discountTypeId: string, rule?: DiscountRuleData) => {
    setActiveDiscountTypeId(discountTypeId);
    setEditingRuleId(rule?.id ?? null);
    setRuleForm(rule ? normalizeRule(rule) : makeEmptyRule(discountTypeId));
    setDialogError('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRuleId(null);
    setDialogError('');
  };

  const validateRuleForm = (rule: DiscountRuleData) => {
    const minValue = Number(rule.minValue.replace(/,/g, '')) || 0;
    const maxValue = Number(rule.maxValue.replace(/,/g, '')) || 0;
    const threshold = Number(rule.approvalThreshold.replace(/,/g, '')) || 0;

    if (!(maxValue > 0)) {
      return 'حداکثر مقدار تخفیف را وارد کنید.';
    }

    if (minValue > maxValue) {
      return 'حداقل تخفیف نمی‌تواند بیشتر از حداکثر تخفیف باشد.';
    }

    if (rule.managerApproval && !(threshold > 0)) {
      return 'آستانه تایید مدیر را وارد کنید.';
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

    const result = validateDiscountsStep(payload);
    if (!result.valid) {
      setFormError(Object.values(result.errors)[0] ?? 'اطلاعات تخفیف‌ها کامل نیست.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      setFrontendStepDraft(draftId, 'discounts', payload);
      initialSnapshotRef.current = serializePayload(payload);
      setDirty(false);
      dispatchContractFlowDirty(stepId as ContractFlowSectionId, false);
      dispatchContractFlowSavedForDraft(draftId, stepId as ContractFlowSectionId, Date.now(), payload);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ذخیره تخفیف‌ها انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ContractStepLoader title={title} description="در حال بارگذاری اطلاعات تخفیف‌های قرارداد..." />;
  }

  return (
    <div className="space-y-5">
      {!embedded ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-gray-500">ابتدا نوع‌های تخفیف را فعال کنید و برای هر نوع فعال، حداقل یک سناریوی تخفیف ثبت کنید.</p>
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
          <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">تعریف سناریوهای تخفیف</p>
          <p className="mt-0.5 text-[13px] text-slate-500">نوع تخفیف را فعال کنید، سپس برای همان نوع یک یا چند rule ثبت کنید.</p>
        </div>

        <div className="space-y-6 p-5">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">فهرست انواع تخفیف</h2>
              <span className="text-xs text-slate-400">{activeTypes.length} مورد فعال</span>
            </div>

            <div className="space-y-3">
              {types.map((type) => {
                const typeRules = rules.filter((rule) => rule.discountTypeId === type.id);
                const isExpanded = type.active && expandedDiscountTypeId === type.id;

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
                            setExpandedDiscountTypeId((current) => (current === type.id ? '' : type.id));
                          }}
                          className="flex-1 text-right"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-800">{type.title}</h3>
                              {type.active ? (
                                <span className="rounded-full border border-cyan-200 bg-white px-2 py-0.5 text-[11px] font-medium text-cyan-700">
                                  {typeRules.length} تخفیف
                                </span>
                              ) : null}
                            </div>
                            <p className="text-sm text-slate-500">{type.description}</p>
                          </div>
                        </button>

                        <div className="flex items-center gap-3">
                          <ToggleSwitch
                            checked={type.active}
                            onChange={(checked) =>
                              setTypes((current) =>
                                current.map((item) => (item.id === type.id ? { ...item, active: checked } : item)),
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="border-t border-cyan-100 bg-white/80 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-700">سناریوهای این ردیف</h4>
                            <p className="mt-1 text-xs text-slate-500">برای این نوع، یک یا چند rule ثبت کنید.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openRuleDialog(type.id)}
                            className="mt-2 inline-flex h-8 items-center gap-2 rounded-lg border border-[#14a7ad] bg-white/65 px-3 text-xs font-bold text-[#0e989d] transition hover:bg-[#dff4f3]"
                          >
                            <Plus className="h-4 w-4" />
                            افزودن تخفیف
                          </button>
                        </div>

                        {typeRules.length === 0 ? (
                          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                            هنوز تخفیفی برای این نوع ثبت نشده است.
                          </div>
                        ) : (
                          <div className="mt-4 grid gap-3">
                            {typeRules.map((rule, index) => (
                              <div key={rule.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                                        تخفیف {index + 1}
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        {rule.scope === 'whole' ? 'روی کل قرارداد' : 'تخفیف موردی'}
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">{formatRuleSummary(rule)}</p>
                                    <p className="text-xs text-slate-500">
                                      {rule.conditionNote ? rule.conditionNote : 'بدون شرط اضافی'}
                                      {rule.managerApproval ? ' · نیازمند تایید مدیر' : ''}
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

          {formError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
          ) : null}
        </div>
      </div>

      <StickySubmitBar
        label="ثبت تخفیف‌ها"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
      />

      <Modal
        open={dialogOpen}
        onClose={closeDialog}
        title={editingRuleId ? 'ویرایش تخفیف' : 'افزودن تخفیف'}
        description={`فرم ثبت تخفیف برای ${types.find((item) => item.id === activeDiscountTypeId)?.title ?? 'نوع انتخاب‌شده'}`}
        footer={
          <>
            <button type="button" onClick={closeDialog} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              لغو
            </button>
            <button type="button" onClick={submitRule} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
              <Save className="h-4 w-4" />
              {editingRuleId ? 'ذخیره تغییرات' : 'ثبت تخفیف'}
            </button>
          </>
        }
      >
        <section className="space-y-3">
          <FieldBlock label="دامنه اعمال تخفیف">
            <TagPills
              options={SCOPE_OPTIONS}
              value={ruleForm.scope}
              onChange={(value) =>
                setRuleForm((current) => ({
                  ...current,
                  scope: value,
                  entryId: value === 'whole' ? WHOLE_DISCOUNT_ENTRY.id : ITEMIZED_DISCOUNT_ENTRIES[0]?.id ?? '',
                }))
              }
            />
          </FieldBlock>
        </section>

        {ruleForm.scope === 'itemized' ? (
          <FieldBlock label="موضوع تخفیف موردی">
            <TagPills options={ITEMIZED_ENTRY_OPTIONS} value={ruleForm.entryId} onChange={(value) => setRuleForm((current) => ({ ...current, entryId: value }))} />
          </FieldBlock>
        ) : null}

        <FieldBlock label="نوع مقدار تخفیف">
          <TagPills options={VALUE_MODE_OPTIONS} value={ruleForm.valueMode} onChange={(value) => setRuleForm((current) => ({ ...current, valueMode: value }))} />
        </FieldBlock>

        <div className="grid gap-4 md:grid-cols-2">
          <FieldBlock
            label={ruleForm.valueMode === 'percent' ? 'حداقل درصد تخفیف' : 'حداقل مبلغ تخفیف'}
            hint="در صورت نیاز می‌توانید حداقل را خالی بگذارید یا صفر ثبت کنید."
          >
            <Input
              value={ruleForm.minValue}
              onChange={(event) =>
                setRuleForm((current) => ({
                  ...current,
                  minValue: current.valueMode === 'amount' ? formatInput(event.target.value) : event.target.value,
                }))
              }
              placeholder={ruleForm.valueMode === 'amount' ? 'مثال: 100,000' : 'مثال: 5'}
            />
          </FieldBlock>
          <FieldBlock
            label={ruleForm.valueMode === 'percent' ? 'حداکثر درصد تخفیف' : 'حداکثر مبلغ تخفیف'}
            hint="این مقدار برای اعتبار rule الزامی است."
          >
            <Input
              value={ruleForm.maxValue}
              onChange={(event) =>
                setRuleForm((current) => ({
                  ...current,
                  maxValue: current.valueMode === 'amount' ? formatInput(event.target.value) : event.target.value,
                }))
              }
              placeholder={ruleForm.valueMode === 'amount' ? 'مثال: 250,000' : 'مثال: 12'}
            />
          </FieldBlock>
        </div>

        <FieldBlock label="شرط تخفیف" hint="مثلا پرداخت زودتر از موعد، خوش‌حسابی، یا تایید واحد مالی.">
          <textarea
            value={ruleForm.conditionNote}
            onChange={(event) => setRuleForm((current) => ({ ...current, conditionNote: event.target.value }))}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 px-3.5 py-3 text-sm text-slate-800 outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
            placeholder="شرط اعمال این تخفیف را بنویسید."
          />
        </FieldBlock>

        <div className="space-y-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">تایید مدیر برای تخفیف‌های بزرگ</h4>
              <p className="mt-1 text-xs text-slate-500">در صورت نیاز، برای این rule آستانه تایید مدیریتی تعریف کنید.</p>
            </div>
            <ToggleSwitch
              checked={ruleForm.managerApproval}
              onChange={(checked) => setRuleForm((current) => ({ ...current, managerApproval: checked }))}
            />
          </div>

          {ruleForm.managerApproval ? (
            <FieldBlock label="آستانه تایید مدیر">
              <Input
                value={ruleForm.approvalThreshold}
                onChange={(event) =>
                  setRuleForm((current) => ({
                    ...current,
                    approvalThreshold: current.valueMode === 'amount' ? formatInput(event.target.value) : event.target.value,
                  }))
                }
                placeholder={ruleForm.valueMode === 'amount' ? 'مثال: 500,000' : 'مثال: 15'}
              />
            </FieldBlock>
          ) : null}
        </div>

        {dialogError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{dialogError}</div>
        ) : null}
      </Modal>
    </div>
  );
}
