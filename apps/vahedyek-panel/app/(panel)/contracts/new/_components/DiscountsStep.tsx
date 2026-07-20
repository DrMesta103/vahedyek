'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ChevronLeft } from 'lucide-react';
import { BusinessSwitch, Input, StickySubmitBar } from '@repo/ui';
import { ContractStepLoader } from './ContractStepLoader';
import { DiscountConditionPanel, type DiscountConditionValues } from './DiscountConditionPanel';
import { FieldLabel } from './FieldLabel';
import { TagPills } from './ContractFormPrimitives';
import { DISCOUNT_GROUPS, ITEMIZED_DISCOUNT_ENTRIES, WHOLE_DISCOUNT_ENTRY, getDiscountEntry } from './discountsConfig';
import {
  ensureActiveDraftId,
  fetchContractFlowBootstrapSettings,
  getDraftRuleSettings,
  getBusinessSettingsReference,
  getContractFlowBootstrapSettings,
  getFrontendStepDraft,
  setFrontendStepDraft,
  setBusinessSettingsReference,
  saveDraftRuleSettings,
} from '../../../../lib/contractDraftClient';
import { RULE_CONFIGS, type ContractRuleState } from '../../../../lib/businessContractRules';
import { validateDiscountsStep } from '../../../../lib/contractValidation';
import { buildValidationSummary } from './validationPresentation';
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
import { ContractSettingsImportDialog } from './ContractSettingsImportDialog';
import { BusinessSettingsHint } from './BusinessSettingsHint';
import { useBusinessSettingsReference } from './useBusinessSettingsReference';
import { buildRuleStateComparison } from '../../../../lib/contractSettingsReference';
import { useContractDraftAutosave } from './useContractDraftAutosave';

const SCOPE_OPTIONS: Array<{ value: DiscountScope; label: string }> = [
  { value: 'whole', label: 'روی کل قرارداد' },
  { value: 'itemized', label: 'تخفیف موردی' },
];

const VALUE_MODE_OPTIONS: Array<{ value: DiscountValueMode; label: string }> = [
  { value: 'amount', label: 'مبلغ' },
  { value: 'percent', label: 'درصد' },
];

const INITIAL_TYPES: DiscountTypeStateData[] = DISCOUNT_GROUPS.map((item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  active: false,
}));

function makeEmptyRule(discountTypeId: string, scope: DiscountScope = 'whole', entryId = WHOLE_DISCOUNT_ENTRY.id): DiscountRuleData {
  return {
    id: `discount-rule-${Math.random().toString(36).slice(2, 10)}`,
    discountTypeId,
    scope,
    entryId,
    valueMode: 'amount',
    enabled: true,
    minValue: '',
    maxValue: '',
    conditionNote: '',
    conditionConfigured: true,
    conditionMaxDelayCount: '',
    conditionGraceDays: '',
    conditionDueBasis: ['all-payment-types'],
    conditionKeepOnDelay: false,
    conditionPenaltyOnDiscount: false,
    conditionSettlementTiming: 'unit-handover',
    managerApproval: false,
    approvalThreshold: '',
  };
}

function normalizeRule(rule: DiscountRuleData): DiscountRuleData {
  const scope = rule.scope === 'itemized' ? 'itemized' : 'whole';

  return {
    ...rule,
    scope,
    entryId: scope === 'itemized' ? rule.entryId || ITEMIZED_DISCOUNT_ENTRIES[0]?.id || '' : WHOLE_DISCOUNT_ENTRY.id,
    valueMode: rule.valueMode === 'percent' ? 'percent' : 'amount',
    enabled: rule.enabled === true,
    minValue: String(rule.minValue ?? ''),
    maxValue: String(rule.maxValue ?? ''),
    conditionNote: String(rule.conditionNote ?? ''),
    conditionConfigured: Boolean(rule.conditionConfigured),
    conditionMaxDelayCount: String(rule.conditionMaxDelayCount ?? ''),
    conditionGraceDays: String(rule.conditionGraceDays ?? ''),
    conditionDueBasis: Array.isArray(rule.conditionDueBasis) && rule.conditionDueBasis.length ? rule.conditionDueBasis : ['all-payment-types'],
    conditionKeepOnDelay: Boolean(rule.conditionKeepOnDelay),
    conditionPenaltyOnDiscount: Boolean(rule.conditionPenaltyOnDiscount),
    conditionSettlementTiming: String(rule.conditionSettlementTiming ?? 'unit-handover'),
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
  const rules = (data?.rules ?? [])
    .map((rule) => normalizeRule(rule))
    .filter((rule) => validTypeIds.has(rule.discountTypeId));
  const activeTab = types.find((item) => item.active)?.id ?? types[0]?.id ?? '';

  return { activeTab, types, rules };
}

function buildBootstrapDiscountsPayload(ruleState: ContractRuleState | null): ContractDiscountsData | null {
  if (!ruleState) return null;

  const activeGroupId = ruleState.active && ruleState.activeChip ? (ruleState.activeChip as 'contract-base' | 'early-payment') : null;
  const baseTypes = DISCOUNT_GROUPS.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    active: activeGroupId === item.id,
  }));

  if (!activeGroupId) {
    return {
      activeTab: baseTypes[0]?.id ?? '',
      types: baseTypes,
      rules: [],
    };
  }

  const isContractBase = activeGroupId === 'contract-base';
  const amountValue = isContractBase ? String(ruleState.values.discountContractValue ?? '') : String(ruleState.values.discountEarlyValue ?? '');
  const scope = String(ruleState.values.discountScope || 'whole') as DiscountScope;
  const entryId =
    scope === 'whole'
      ? WHOLE_DISCOUNT_ENTRY.id
      : String(ruleState.values.discountEntryId || ITEMIZED_DISCOUNT_ENTRIES[0]?.id || WHOLE_DISCOUNT_ENTRY.id);

  return {
    activeTab: activeGroupId,
    types: baseTypes,
    rules: [
      normalizeRule({
        id: `discount-bootstrap-${activeGroupId}`,
        discountTypeId: activeGroupId,
        scope,
        entryId,
        valueMode: String(ruleState.values.discountValueMode || 'amount') as DiscountValueMode,
        enabled: true,
        minValue: amountValue,
        maxValue: amountValue,
        conditionNote: isContractBase ? String(ruleState.values.discountContractSettlement ?? '') : String(ruleState.values.discountEarlyDeadline ?? ''),
        conditionConfigured: Boolean(ruleState.values.discountConditionConfigured),
        conditionMaxDelayCount: String(ruleState.values.discountApprovalThreshold ?? ''),
        conditionGraceDays: isContractBase ? '' : String(ruleState.values.discountEarlyDeadline ?? ''),
        conditionDueBasis: ['all-payment-types'],
        conditionKeepOnDelay: Boolean(ruleState.values.discountEarlyKeepOnDelay),
        conditionPenaltyOnDiscount: Boolean(ruleState.values.discountContractNeedApproval),
        conditionSettlementTiming: String(ruleState.values.discountContractSettlement ?? 'unit-handover'),
        managerApproval: Boolean(ruleState.values.discountManagerApproval),
        approvalThreshold: String(ruleState.values.discountApprovalThreshold ?? ''),
      }),
    ],
  };
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
  const minValue = rule.minValue || '0';
  const maxValue = rule.maxValue || '0';
  return `${target} - ${minValue} تا ${maxValue} ${unit}`;
}

function getConditionValues(rule: DiscountRuleData): DiscountConditionValues {
  return {
    maxDelayCount: String(rule.conditionMaxDelayCount ?? ''),
    graceDays: String(rule.conditionGraceDays ?? ''),
    dueBasis: Array.isArray(rule.conditionDueBasis) && rule.conditionDueBasis.length ? rule.conditionDueBasis : ['all-payment-types'],
    keepOnDelay: Boolean(rule.conditionKeepOnDelay),
    penaltyOnDiscount: Boolean(rule.conditionPenaltyOnDiscount),
    settlementTiming: String(rule.conditionSettlementTiming ?? 'unit-handover'),
  };
}

function describeCondition(values: DiscountConditionValues) {
  const pieces: string[] = [];
  if (values.maxDelayCount) pieces.push(`حداکثر ${values.maxDelayCount} تاخیر`);
  if (values.graceDays) pieces.push(`${values.graceDays} روز مهلت تنفس`);
  if (values.dueBasis.length) pieces.push(`${values.dueBasis.length} مبنای سررسید`);
  return pieces.join('، ');
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
    <div className="space-y-2 text-right">
      <FieldLabel label={label} />
      {children}
      {hint ? <p className="text-xs leading-6 text-slate-500">{hint}</p> : null}
    </div>
  );
}

function Toggle({
  checked,
  disabled = false,
  onInactiveClick,
  onDisabledClick,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onInactiveClick?: () => void;
  onDisabledClick?: () => void;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        if (checked) {
          onChange(false);
          return;
        }
        if (disabled) {
          onDisabledClick?.();
          return;
        }
        if (onInactiveClick) {
          onInactiveClick();
          return;
        }
        if (onDisabledClick) {
          onDisabledClick();
          return;
        }
        onChange(true);
      }}
      className={`inline-flex rounded-full transition ${disabled ? 'opacity-55 grayscale' : ''}`}
      aria-pressed={checked}
      aria-disabled={disabled}
    >
      <span aria-hidden className="pointer-events-none">
        <BusinessSwitch checked={checked} onChange={() => {}} />
      </span>
    </button>
  );
}

type ToggleDialogKind = 'contract-base' | 'early-payment' | 'itemized';

function ActivationDialog({
  open,
  title,
  description,
  confirmLabel = 'فعال‌سازی',
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4" dir="rtl" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-[8px] border border-amber-200 bg-white p-6 text-right shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-base font-black text-slate-900">{title}</h3>
            <p className="text-sm font-medium leading-7 text-slate-600">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-[8px] border border-slate-200 px-5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
            انصراف
          </button>
          <button type="button" onClick={onConfirm} className="rounded-[8px] bg-teal-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-teal-800">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function RuleEditor({
  typeId,
  rule,
  onChange,
  title,
  entryLabel,
}: {
  typeId: string;
  rule: DiscountRuleData;
  onChange: (patch: Partial<DiscountRuleData>) => void;
  title: string;
  entryLabel?: string;
}) {
  const valueMode = rule.valueMode === 'percent' ? 'percent' : 'amount';
  const conditionValues = getConditionValues(rule);

  return (
    <div className="space-y-4 rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            {entryLabel ? `موضوع: ${entryLabel}` : 'تنظیمات این بخش را مستقل ثبت کنید.'}
          </p>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${rule.enabled !== false ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
          {rule.enabled !== false ? 'فعال' : 'غیرفعال'}
        </span>
      </div>

      <FieldBlock label="نوع مقدار تخفیف">
        <TagPills
          options={VALUE_MODE_OPTIONS}
          value={valueMode}
          onChange={(value) => onChange({ discountTypeId: typeId, valueMode: value })}
        />
      </FieldBlock>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldBlock
          label={valueMode === 'percent' ? 'حداقل درصد تخفیف' : 'حداقل مبلغ تخفیف'}
          hint="در صورت نیاز می‌توانید مقدار حداقل را خالی بگذارید یا صفر ثبت کنید."
        >
          <Input
            value={rule.minValue}
            onChange={(event) =>
              onChange({
                discountTypeId: typeId,
                minValue: valueMode === 'amount' ? formatInput(event.target.value) : event.target.value,
              })
            }
            placeholder={valueMode === 'amount' ? 'مثال: 100,000' : 'مثال: 5'}
          />
        </FieldBlock>

        <FieldBlock
          label={valueMode === 'percent' ? 'حداکثر درصد تخفیف' : 'حداکثر مبلغ تخفیف'}
          hint="این مقدار برای ثبت نهایی تخفیف الزامی است."
        >
          <Input
            value={rule.maxValue}
            onChange={(event) =>
              onChange({
                discountTypeId: typeId,
                maxValue: valueMode === 'amount' ? formatInput(event.target.value) : event.target.value,
              })
            }
            placeholder={valueMode === 'amount' ? 'مثال: 250,000' : 'مثال: 12'}
          />
        </FieldBlock>
      </div>

      <DiscountConditionPanel
        compact
        values={conditionValues}
        onChange={(patch) => {
          const nextCondition = { ...conditionValues, ...patch };
          onChange({
            discountTypeId: typeId,
            conditionConfigured: true,
            conditionMaxDelayCount: nextCondition.maxDelayCount,
            conditionGraceDays: nextCondition.graceDays,
            conditionDueBasis: nextCondition.dueBasis,
            conditionKeepOnDelay: nextCondition.keepOnDelay,
            conditionPenaltyOnDiscount: nextCondition.penaltyOnDiscount,
            conditionSettlementTiming: nextCondition.settlementTiming,
            conditionNote: describeCondition(nextCondition),
          });
        }}
      />

      <div className="space-y-4 rounded-[8px] border border-cyan-100 bg-cyan-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800">تایید مدیر برای تخفیف‌های بزرگ</h4>
            <p className="mt-1 text-xs text-slate-500">در صورت نیاز، برای این rule آستانه تایید مدیریتی تعریف کنید.</p>
          </div>
          <Toggle
            checked={Boolean(rule.managerApproval)}
            onChange={(checked) => onChange({ discountTypeId: typeId, managerApproval: checked })}
          />
        </div>

        {rule.managerApproval ? (
          <FieldBlock label={valueMode === 'percent' ? 'آستانه تایید مدیر (درصد)' : 'آستانه تایید مدیر (مبلغ)'}>
            <Input
              value={rule.approvalThreshold}
              onChange={(event) =>
                onChange({
                  discountTypeId: typeId,
                  approvalThreshold: valueMode === 'amount' ? formatInput(event.target.value) : event.target.value,
                })
              }
              placeholder={valueMode === 'amount' ? 'مثال: 500,000' : 'مثال: 15'}
            />
          </FieldBlock>
        ) : null}
      </div>
    </div>
  );
}

function SectionShell({
  title,
  description,
  active,
  summary,
  onToggle,
  toggleDisabled = false,
  onInactiveToggle,
  onDisabledToggle,
  children,
}: {
  title: string;
  description: string;
  active: boolean;
  summary?: string;
  onToggle?: (checked: boolean) => void;
  toggleDisabled?: boolean;
  onInactiveToggle?: () => void;
  onDisabledToggle?: () => void;
  children: ReactNode;
}) {
  return (
    <section className={`overflow-hidden rounded-[8px] border ${active ? 'border-cyan-200 bg-cyan-50/35' : 'border-slate-200 bg-white'}`}>
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1 text-right">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${active ? 'border-cyan-200 bg-white text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                {active ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
            <p className="text-sm text-slate-500">{description}</p>
            {summary ? <p className="text-xs font-medium text-slate-500">{summary}</p> : null}
          </div>

            {onToggle ? (
              <Toggle
                checked={active}
                disabled={toggleDisabled}
                onInactiveClick={onInactiveToggle}
                onDisabledClick={onDisabledToggle}
                onChange={onToggle}
              />
            ) : null}
          </div>

        {children}
      </div>
    </section>
  );
}

export function DiscountsStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');
  const { snapshot } = useBusinessSettingsReference();

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [importError, setImportError] = useState('');

  const [types, setTypes] = useState<DiscountTypeStateData[]>(INITIAL_TYPES);
  const [rules, setRules] = useState<DiscountRuleData[]>([]);
  const [activationDialog, setActivationDialog] = useState<{
    kind: ToggleDialogKind;
    typeId: string;
    entryId?: string;
    title: string;
    description: string;
    confirmable: boolean;
  } | null>(null);

  const payload = useMemo<ContractDiscountsData>(
    () => ({
      activeTab: types.find((item) => item.active)?.id ?? types[0]?.id ?? '',
      types,
      rules,
    }),
    [rules, types],
  );

  const activeTypes = useMemo(() => types.filter((item) => item.active), [types]);
  const discountHintState = useMemo<ContractRuleState>(() => {
    const firstRule = rules.find((item) => item.enabled);
    return {
      active: activeTypes.length > 0,
      activeTab: firstRule?.discountTypeId ?? payload.activeTab,
      activeChip: payload.activeTab,
      values: {
        discountScope: firstRule?.scope ?? '',
        discountEntryId: firstRule?.entryId ?? '',
        discountValueMode: firstRule?.valueMode ?? '',
        discountMinValue: firstRule?.minValue ?? '',
        discountMaxValue: firstRule?.maxValue ?? '',
        discountConditionConfigured: Boolean(firstRule?.conditionConfigured),
        discountManagerApproval: Boolean(firstRule?.managerApproval),
        discountApprovalThreshold: firstRule?.approvalThreshold ?? '',
      },
    };
  }, [activeTypes.length, payload.activeTab, rules]);

  const typeRule = (typeId: string, scope: DiscountScope = 'whole', entryId = WHOLE_DISCOUNT_ENTRY.id) =>
    rules.find((item) => item.discountTypeId === typeId && item.scope === scope && (scope === 'whole' || item.entryId === entryId));

  const ruleForType = (typeId: string, scope: DiscountScope = 'whole', entryId = WHOLE_DISCOUNT_ENTRY.id) =>
    typeRule(typeId, scope, entryId) ?? makeEmptyRule(typeId, scope, entryId);

  const setRule = (nextRule: DiscountRuleData) => {
    setRules((current) => {
      const next = normalizeRule(nextRule);
      const index = current.findIndex((item) => item.id === next.id);
      if (index >= 0) {
        const copy = current.slice();
        copy[index] = next;
        return copy;
      }
      return [...current, next];
    });
  };

  const patchRule = (typeId: string, scope: DiscountScope, entryId: string, patch: Partial<DiscountRuleData>) => {
    const existing = typeRule(typeId, scope, entryId);
    setRule({
      ...(existing ?? makeEmptyRule(typeId, scope, entryId)),
      ...patch,
      discountTypeId: typeId,
      scope,
      entryId: scope === 'itemized' ? entryId : WHOLE_DISCOUNT_ENTRY.id,
    });
  };

  const toggleRulesForType = (typeId: string, checked: boolean) => {
    if (typeId === 'contract-base' && checked) {
      const hasItemizedEnabled = ITEMIZED_DISCOUNT_ENTRIES.some((entry) => {
        const rule = typeRule('contract-base', 'itemized', entry.id);
        return rule?.enabled === true;
      });
      if (hasItemizedEnabled) return;
    }

    setTypes((current) => current.map((item) => (item.id === typeId ? { ...item, active: checked } : item)));

    setRules((current) => {
      if (checked) {
        const next = current.slice();
        const existingWholeRule = next.find((item) => item.discountTypeId === typeId && item.scope === 'whole');
        if (existingWholeRule) {
          return next.map((item) => (item.id === existingWholeRule.id ? { ...item, enabled: true } : item));
        }
        next.push(makeEmptyRule(typeId));
        return next;
      }

      return current.map((item) => (item.discountTypeId === typeId ? { ...item, enabled: false } : item));
    });
  };

  const toggleItemizedRule = (entryId: string, checked: boolean) => {
    if (checked && contractBaseActive) {
      return;
    }

    setRules((current) => {
      const existing = current.find((item) => item.discountTypeId === 'contract-base' && item.scope === 'itemized' && item.entryId === entryId);
      let next = current;

      if (checked) {
        if (existing) {
          next = current.map((item) => (item.id === existing.id ? { ...item, enabled: true } : item));
        } else {
          next = [...current, makeEmptyRule('contract-base', 'itemized', entryId)];
        }
      } else if (existing) {
        next = current.map((item) => (item.id === existing.id ? { ...item, enabled: false } : item));
      }

      const anyEnabled = next.some((item) => item.discountTypeId === 'contract-base' && item.enabled === true);
      setTypes((typesCurrent) => typesCurrent.map((item) => (item.id === 'contract-base' ? { ...item, active: anyEnabled } : item)));
      return next;
    });
  };

  const openActivationDialog = (
    kind: ToggleDialogKind,
    typeId: string,
    title: string,
    description: string,
    entryId?: string,
    confirmable = true,
  ) => {
    setActivationDialog({ kind, typeId, entryId, title, description, confirmable });
  };

  const confirmActivationDialog = () => {
    if (!activationDialog) return;
    if (!activationDialog.confirmable) {
      setActivationDialog(null);
      return;
    }

    if (activationDialog.kind === 'contract-base' || activationDialog.kind === 'early-payment') {
      toggleRulesForType(activationDialog.typeId, true);
    } else if (activationDialog.entryId) {
      toggleItemizedRule(activationDialog.entryId, true);
    }

    setActivationDialog(null);
  };

  const closeActivationDialog = () => setActivationDialog(null);

  const applySettingsFromBusiness = async () => {
    if (importBusy || !draftId) return;
    setImportBusy(true);
    setImportError('');
    try {
      const bootstrap = await fetchContractFlowBootstrapSettings();
      setBusinessSettingsReference(bootstrap);
      const nextPayload = normalizeDiscountsPayload(buildBootstrapDiscountsPayload(bootstrap.rules.discount ?? null));
      setTypes(nextPayload.types);
      setRules(nextPayload.rules);
      await saveDraftRuleSettings(draftId, 'discounts', nextPayload);
      setFrontendStepDraft(draftId, 'discounts', nextPayload);
      initialSnapshotRef.current = serializePayload(nextPayload);
      setDirty(false);
      dispatchContractFlowDirty(stepId as ContractFlowSectionId, false);
      dispatchContractFlowSavedForDraft(draftId, stepId as ContractFlowSectionId, Date.now(), nextPayload);
      setImportDialogOpen(false);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'دریافت تنظیمات تخفیف انجام نشد.');
    } finally {
      setImportBusy(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const nextDraftId = await ensureActiveDraftId();
      if (!mounted) return;
      setDraftId(nextDraftId);

      try {
        const bootstrap = getContractFlowBootstrapSettings();
        const frontendDraft = getFrontendStepDraft<ContractDiscountsData>(nextDraftId, 'discounts');
        if (!mounted) return;
        const serverDraft = await getDraftRuleSettings<ContractDiscountsData>(nextDraftId, 'discounts').catch(() => null);
        const nextPayload = normalizeDiscountsPayload(serverDraft ?? frontendDraft ?? buildBootstrapDiscountsPayload(bootstrap?.rules.discount ?? null));
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

  useContractDraftAutosave({
    draftId,
    step: 'discounts',
    payload,
    enabled: !loading && Boolean(draftId),
    save: (next) => saveDraftRuleSettings(draftId as string, 'discounts', next),
    onError: (error) => setFormError(error instanceof Error ? `ذخیره خودکار تخفیف‌ها انجام نشد: ${error.message}` : 'ذخیره خودکار تخفیف‌ها انجام نشد.'),
  });

  const handleSubmit = async () => {
    if (!draftId) return;

    const result = validateDiscountsStep(payload);
    if (!result.valid) {
      setFormError(buildValidationSummary(result.errors, {}, 'اطلاعات تخفیف‌ها کامل نیست.'));
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      setFrontendStepDraft(draftId, 'discounts', payload);
      await saveDraftRuleSettings(draftId, 'discounts', payload);
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

  const contractBaseWholeRule = typeRule('contract-base', 'whole');
  const earlyPaymentRule = typeRule('early-payment', 'whole');
  const contractBaseActive = Boolean(contractBaseWholeRule && contractBaseWholeRule.enabled === true);
  const earlyPaymentActive = Boolean(types.find((item) => item.id === 'early-payment')?.active);
  const itemizedEnabledCount = ITEMIZED_DISCOUNT_ENTRIES.filter((entry) => {
    const rule = typeRule('contract-base', 'itemized', entry.id);
    return rule?.enabled === true;
  }).length;
  const hasAnyActiveDiscount = contractBaseActive || earlyPaymentActive || itemizedEnabledCount > 0;
  const activationDialogContent =
    activationDialog && !activationDialog.confirmable
      ? {
          title: activationDialog.title,
          description: activationDialog.description,
          confirmLabel: 'متوجه شدم',
        }
      : activationDialog?.kind === 'contract-base'
      ? {
          title: activationDialog.title,
          description: activationDialog.description,
          confirmLabel: 'فعال‌سازی اصل قرارداد',
        }
      : activationDialog?.kind === 'early-payment'
        ? {
            title: activationDialog.title,
            description: activationDialog.description,
            confirmLabel: 'فعال‌سازی مشوق پرداخت',
          }
        : activationDialog?.kind === 'itemized'
          ? {
              title: activationDialog.title,
              description: activationDialog.description,
              confirmLabel: 'فعال‌سازی موردی',
            }
          : null;
  return (
    <div className="space-y-5">
      {!embedded ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-right">
            <h1 className="text-2xl font-bold text-[color:var(--text-strong)]">{title}</h1>
            <p className="mt-1 text-sm leading-7 text-[color:var(--text-muted)]">
              تنظیمات تخفیف روی اصل قرارداد، مشوق پرداخت و تخفیف‌های موردی را جداگانه فعال کنید.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setImportDialogOpen(true)}
              className="rounded-[8px] border border-cyan-200 bg-cyan-50 px-3.5 py-2 text-sm font-bold text-cyan-700 transition-colors hover:bg-cyan-100"
            >
              دریافت از تنظیمات
            </button>
            <button
              type="button"
              onClick={() => router.push(basePath)}
              className="rounded-[8px] border border-gray-300 px-3.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              بازگشت به مراحل
            </button>
          </div>
        </div>
      ) : null}

      {embedded ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setImportDialogOpen(true)}
            className="rounded-[8px] border border-cyan-200 bg-cyan-50 px-3.5 py-2 text-sm font-bold text-cyan-700 transition-colors hover:bg-cyan-100"
          >
            دریافت از تنظیمات
          </button>
        </div>
      ) : null}

      <BusinessSettingsHint
        comparison={buildRuleStateComparison(RULE_CONFIGS.discount, snapshot?.rules?.discount, discountHintState)}
      />

      <div className="space-y-4">
        <SectionShell
          title="تخفیف روی اصل قرارداد"
          description="این بخش برای تنظیم تخفیف اصلی قرارداد استفاده می‌شود."
          active={contractBaseActive}
          summary={contractBaseWholeRule && contractBaseWholeRule.enabled === true ? formatRuleSummary(contractBaseWholeRule) : undefined}
          toggleDisabled={itemizedEnabledCount > 0 && !contractBaseActive}
          onToggle={(checked) => {
            if (checked) {
              toggleRulesForType('contract-base', true);
              return;
            }

            toggleRulesForType('contract-base', false);
          }}
          onInactiveToggle={() =>
            hasAnyActiveDiscount
              ? openActivationDialog(
                  'contract-base',
                  'contract-base',
                  'فعال‌سازی تخفیف روی اصل قرارداد',
                  'با فعال کردن این بخش، تخفیف‌های موردی دیگر قابل فعال‌سازی نخواهند بود. ادامه می‌دهید؟',
                  undefined,
                  true,
                )
              : toggleRulesForType('contract-base', true)
          }
          onDisabledToggle={() =>
            openActivationDialog(
              'contract-base',
              'contract-base',
              'فعال‌سازی تخفیف روی اصل قرارداد',
              'برای فعال‌سازی تخفیف روی اصل قرارداد، ابتدا همه تخفیف‌های موردی فعال را غیرفعال کنید.',
              undefined,
              false,
            )
          }
        >
          {contractBaseActive ? (
            <div className="space-y-5">
              <RuleEditor
                typeId="contract-base"
                rule={contractBaseWholeRule ?? makeEmptyRule('contract-base')}
                title="تنظیمات تخفیف اصل قرارداد"
                entryLabel={WHOLE_DISCOUNT_ENTRY.title}
                onChange={(patch) => patchRule('contract-base', 'whole', WHOLE_DISCOUNT_ENTRY.id, patch)}
              />
              {itemizedEnabledCount > 0 ? (
                <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-right text-sm text-amber-800">
                  چون تخفیف‌های موردی فعال هستند، نمی‌توانید تخفیف روی اصل قرارداد را هم‌زمان فعال کنید.
                </div>
              ) : null}
              <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-right text-sm text-amber-800">
                تا زمانی که تخفیف روی اصل قرارداد فعال است، تخفیف‌های موردی قابل فعال‌سازی نیستند.
              </div>
            </div>
          ) : null}
        </SectionShell>
        {itemizedEnabledCount > 0 && !contractBaseActive ? (
          <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-right text-sm text-amber-800">
            چون تخفیف‌های موردی فعال هستند، تخفیف روی اصل قرارداد را نمی‌توانید فعال کنید.
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="space-y-4">
            {ITEMIZED_DISCOUNT_ENTRIES.map((entry) => {
              const entryRule = typeRule('contract-base', 'itemized', entry.id);
              const isEnabled = Boolean(entryRule && entryRule.enabled === true);
              return (
                <section
                  key={entry.id}
                  className={`overflow-hidden rounded-[8px] border ${isEnabled ? 'border-cyan-200 bg-cyan-50/35' : 'border-slate-200 bg-white'}`}
                >
                  <div className="space-y-4 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1 text-right">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-800">{entry.title}</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${isEnabled ? 'border-cyan-200 bg-white text-cyan-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                            {isEnabled ? 'فعال' : 'غیرفعال'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{entry.description}</p>
                      </div>

                      <Toggle
                        checked={isEnabled}
                        disabled={contractBaseActive && !isEnabled}
                        onInactiveClick={
                          !isEnabled
                            ? () => {
                                if (!hasAnyActiveDiscount) {
                                  toggleItemizedRule(entry.id, true);
                                  return;
                                }

                                openActivationDialog(
                                  'itemized',
                                  'contract-base',
                                  `فعال‌سازی ${entry.title}`,
                                  'با فعال کردن این تخفیف موردی، تخفیف روی اصل قرارداد غیرفعال می‌شود. ادامه می‌دهید؟',
                                  entry.id,
                                  true,
                                );
                              }
                            : undefined
                        }
                        onDisabledClick={
                          contractBaseActive && !isEnabled
                            ? () =>
                                openActivationDialog(
                                  'itemized',
                                  'contract-base',
                                  `فعال‌سازی ${entry.title}`,
                                  'برای فعال کردن این تخفیف موردی، ابتدا تخفیف روی اصل قرارداد را غیرفعال کنید.',
                                  entry.id,
                                  false,
                                )
                            : () =>
                                openActivationDialog(
                                  'itemized',
                                  'contract-base',
                                  `فعال‌سازی ${entry.title}`,
                                  'با فعال کردن این تخفیف موردی، تخفیف روی اصل قرارداد غیرفعال می‌شود. ادامه می‌دهید؟',
                                  entry.id,
                                )
                        }
                        onChange={(checked) => toggleItemizedRule(entry.id, checked)}
                      />
                    </div>

                    {isEnabled ? (
                      <RuleEditor
                        typeId="contract-base"
                        rule={entryRule ?? makeEmptyRule('contract-base', 'itemized', entry.id)}
                        title="تنظیمات این تخفیف موردی"
                        entryLabel={entry.title}
                        onChange={(patch) => patchRule('contract-base', 'itemized', entry.id, patch)}
                      />
                    ) : contractBaseActive ? (
                      <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-right text-sm text-amber-800">
                        برای فعال‌سازی این مورد، ابتدا تخفیف روی اصل قرارداد را غیرفعال کنید.
                      </div>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <SectionShell
          title="تخفیف مشوق پرداخت"
          description="این بخش برای تخفیف‌های پرداخت زودتر از موعد به‌صورت جداگانه مدیریت می‌شود."
          active={earlyPaymentActive}
          summary={earlyPaymentRule && earlyPaymentRule.enabled === true ? formatRuleSummary(earlyPaymentRule) : undefined}
          onToggle={(checked) => {
            if (checked) {
              toggleRulesForType('early-payment', true);
              return;
            }

            toggleRulesForType('early-payment', false);
          }}
          onInactiveToggle={() =>
            hasAnyActiveDiscount
              ? openActivationDialog(
                  'early-payment',
                  'early-payment',
                  'فعال‌سازی تخفیف مشوق پرداخت',
                  'با فعال کردن این بخش، تنظیمات تخفیف مشوق پرداخت برای این قرارداد قابل ثبت خواهد شد. ادامه می‌دهید؟',
                  undefined,
                  true,
                )
              : toggleRulesForType('early-payment', true)
          }
        >
          {earlyPaymentActive ? (
            <RuleEditor
              typeId="early-payment"
              rule={earlyPaymentRule ?? makeEmptyRule('early-payment')}
              title="تنظیمات تخفیف مشوق پرداخت"
              entryLabel={WHOLE_DISCOUNT_ENTRY.title}
              onChange={(patch) => patchRule('early-payment', 'whole', WHOLE_DISCOUNT_ENTRY.id, patch)}
            />
          ) : null}
        </SectionShell>
      </div>

      {formError ? (
        <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
      ) : null}

      <ActivationDialog
        open={Boolean(activationDialogContent)}
        title={activationDialogContent?.title ?? ''}
        description={activationDialogContent?.description ?? ''}
        confirmLabel={activationDialogContent?.confirmLabel}
        onClose={closeActivationDialog}
        onConfirm={confirmActivationDialog}
      />

      <StickySubmitBar
        label="ثبت تخفیف‌ها"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
      />

      <ContractSettingsImportDialog
        open={importDialogOpen}
        loading={importBusy}
        error={importError}
        title="دریافت تنظیمات تخفیف"
        description="اگر تایید کنید، تنظیمات ثبت‌شده در بخش تخفیف به‌عنوان مقدار اولیه این پیش‌نویس اعمال می‌شود."
        onConfirm={() => void applySettingsFromBusiness()}
        onClose={() => setImportDialogOpen(false)}
      />
    </div>
  );
}


