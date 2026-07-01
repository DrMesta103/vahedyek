'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { CalendarDays, Plus, X } from 'lucide-react';
import { TagPills } from './ContractFormPrimitives';
import { FieldLabel } from './FieldLabel';
import { FinancialPaymentFlow } from './FinancialPaymentFlow';
import { FinancialPricingBox } from './FinancialPricingBox';
import { ContractStepLoader } from './ContractStepLoader';
import { Input, PersianDatePicker, StickySubmitBar } from '@repo/ui';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import {
  clearFrontendStepDraft,
  ensureActiveDraftId,
  getFrontendStepDraft,
  getReferenceData,
  getStepData,
  saveStepData,
  setFrontendStepDraft,
  type ReferenceUnit,
} from '../../../../lib/contractDraftClient';
import { validateFinancialStep } from '../../../../lib/contractValidation';
import {
  computeFixedContractTotal,
  computeMeteredContractTotal,
  normalizeAreaPricingMode,
} from '../../../../lib/contractFinancialPricing';
import {
  FINANCIAL_LINE_PREFIX,
  addIntervalToDate,
  buildRegularDueItems,
  distributeAmount,
  isFinancialLineHeaderCategoryId,
  isFinancialLineSubtreeCategoryId,
  sumFinancialCapsCountedAgainstContractTotal,
  type DueFrequency,
} from '../../../../lib/financialUtils';
import type { AreaPricingMode, ContractFinancialData, ContractSubjectData, FinancialCategoryData, FinancialDueItemData, PricingType } from '../../../../types/contract';
import { dispatchContractFlowDirty, dispatchContractFlowFinancialSnapshot, dispatchContractFlowSavedForDraft } from './contractFlowSignals';
import { buildValidationSummary } from './validationPresentation';

type FinancialCategory = FinancialCategoryData;
type DueItem = FinancialDueItemData;
type DueMode = 'irregular' | 'regular';
type RegularDuePreset = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual';

const SYSTEM_FINANCIAL_CATEGORIES = [
  { id: 'principal', name: 'اصل قرارداد', requiresDue: false },
  { id: 'advance', name: 'پیش‌پرداخت', requiresDue: true },
  { id: 'installment', name: 'اقساط', requiresDue: true },
  { id: 'loan', name: 'وام', requiresDue: false },
  { id: 'handover', name: 'تحویل', requiresDue: false },
  { id: 'document', name: 'مدارک', requiresDue: false },
] as const;
const LOCKED_CATEGORY_IDS = SYSTEM_FINANCIAL_CATEGORIES.map((item) => item.id);
const FINANCIAL_SUB_CATEGORY_IDS = ['advance', 'installment', 'loan', 'handover', 'document'] as const;
const DUE_TAG_OPTIONS = SYSTEM_FINANCIAL_CATEGORIES.map((item) => item.name);
const REGULAR_DUE_CATEGORY_ID = 'installment';
const PRIMARY_FINANCIAL_CATEGORY_IDS = ['principal', ...FINANCIAL_SUB_CATEGORY_IDS] as const;
const REGULAR_DUE_PRESETS: Array<{
  value: RegularDuePreset;
  label: string;
  frequency: DueFrequency;
  period: number;
  unitLabel: string;
}> = [
  { value: 'daily', label: 'روزانه', frequency: 'daily', period: 1, unitLabel: 'روز' },
  { value: 'weekly', label: 'هفتگی', frequency: 'daily', period: 7, unitLabel: 'روز' },
  { value: 'biweekly', label: 'دو هفته یک‌بار', frequency: 'daily', period: 14, unitLabel: 'روز' },
  { value: 'monthly', label: 'ماهانه', frequency: 'monthly', period: 1, unitLabel: 'ماه' },
  { value: 'bimonthly', label: 'دو ماه یک‌بار', frequency: 'monthly', period: 2, unitLabel: 'ماه' },
  { value: 'quarterly', label: 'سه‌ماهه', frequency: 'monthly', period: 3, unitLabel: 'ماه' },
  { value: 'semiannual', label: 'شش‌ماهه', frequency: 'monthly', period: 6, unitLabel: 'ماه' },
  { value: 'annual', label: 'سالانه', frequency: 'monthly', period: 12, unitLabel: 'ماه' },
];

function isPrimaryFinancialCategoryId(categoryId: string) {
  return (PRIMARY_FINANCIAL_CATEGORY_IDS as readonly string[]).includes(categoryId);
}

function getRegularDuePresetConfig(preset: RegularDuePreset) {
  return REGULAR_DUE_PRESETS.find((item) => item.value === preset) ?? REGULAR_DUE_PRESETS[3];
}

function resolveRegularDuePreset(frequency: DueFrequency, period: number): RegularDuePreset {
  return (
    REGULAR_DUE_PRESETS.find((item) => item.frequency === frequency && item.period === Math.max(period, 1))?.value ?? 'monthly'
  );
}

function splitFinancialPayloadSections(payload: ContractFinancialData) {
  const primaryCategories = payload.categories.filter((item) => isPrimaryFinancialCategoryId(item.id));
  const additionalCategories = payload.categories.filter((item) => !isPrimaryFinancialCategoryId(item.id));
  const primaryDueItems = payload.dueItems.filter((item) => isPrimaryFinancialCategoryId(item.categoryId));
  const additionalDueItems = payload.dueItems.filter((item) => !isPrimaryFinancialCategoryId(item.categoryId));

  return {
    primaryCategories,
    additionalCategories,
    primaryDueItems,
    additionalDueItems,
  };
}

function resolveActiveFinancialTab(activeTab: string, categories: FinancialCategoryData[]) {
  if (categories.some((item) => item.id === activeTab)) return activeTab;
  return categories.find((item) => item.id !== 'principal')?.id ?? categories[0]?.id ?? 'advance';
}

function structuralFinancialSubSuffix(categoryId: string): string | undefined {
  if ((FINANCIAL_SUB_CATEGORY_IDS as readonly string[]).includes(categoryId)) return categoryId;
  const sep = categoryId.lastIndexOf(':');
  if (sep < 0) return undefined;
  const suf = categoryId.slice(sep + 1);
  return (FINANCIAL_SUB_CATEGORY_IDS as readonly string[]).includes(suf) ? suf : undefined;
}

function isStructuralLockedCategoryId(categoryId: string): boolean {
  if ((LOCKED_CATEGORY_IDS as readonly string[]).includes(categoryId)) return true;
  return isFinancialLineSubtreeCategoryId(categoryId);
}
const PIE_CHART_COLORS = ['#0f766e', '#14b8a6', '#0ea5e9', '#6366f1', '#f59e0b', '#ef4444', '#84cc16', '#8b5cf6'];

const INITIAL_CATEGORIES: FinancialCategory[] = SYSTEM_FINANCIAL_CATEGORIES.map((item) => ({
  id: item.id,
  name: item.name,
  capAmount: 0,
  dueAmount: 0,
  noDueAmount: 0,
  system: true,
  requiresDue: item.requiresDue,
}));

function getCategoryRequiresDue(categoryId: string): boolean {
  if (categoryId === 'principal') return false;
  const suffix = structuralFinancialSubSuffix(categoryId);
  if (suffix) return SYSTEM_FINANCIAL_CATEGORIES.find((item) => item.id === suffix)?.requiresDue ?? true;
  return SYSTEM_FINANCIAL_CATEGORIES.find((item) => item.id === categoryId)?.requiresDue ?? true;
}

function normalizeCategory(item: FinancialCategory) {
  const requiresDue = item.system ? getCategoryRequiresDue(item.id) : (item.requiresDue ?? true);
  return {
    ...item,
    requiresDue,
    dueAmount: requiresDue ? item.capAmount : 0,
    noDueAmount: requiresDue ? 0 : item.capAmount,
  };
}

function orderFinancialCategories(items: FinancialCategory[]): FinancialCategory[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const out: FinancialCategory[] = [];

  for (const tpl of SYSTEM_FINANCIAL_CATEGORIES) {
    const row = byId.get(tpl.id);
    out.push(
      row ??
        normalizeCategory({
          id: tpl.id,
          name: tpl.name,
          capAmount: 0,
          dueAmount: 0,
          noDueAmount: 0,
          system: true,
          requiresDue: tpl.requiresDue,
        }),
    );
  }

  const emitted = new Set(out.map((row) => row.id));
  const headerIds: string[] = [];
  for (const c of items) {
    if (isFinancialLineHeaderCategoryId(c.id) && !headerIds.includes(c.id)) headerIds.push(c.id);
  }

  for (const hid of headerIds) {
    const header = byId.get(hid);
    if (!header) continue;
    if (!emitted.has(hid)) {
      out.push(normalizeCategory(header));
      emitted.add(hid);
    }
    for (const subKey of FINANCIAL_SUB_CATEGORY_IDS) {
      const sid = `${hid}:${subKey}`;
      if (emitted.has(sid)) continue;
      const tpl = SYSTEM_FINANCIAL_CATEGORIES.find((entry) => entry.id === subKey)!;
      const existing = byId.get(sid);
      const row =
        existing ??
        normalizeCategory({
          id: sid,
          name: tpl.name,
          capAmount: 0,
          dueAmount: 0,
          noDueAmount: 0,
          system: true,
          requiresDue: tpl.requiresDue,
        });
      out.push(row);
      emitted.add(sid);
    }
  }

  for (const item of items) {
    if (emitted.has(item.id)) continue;
    if (isFinancialLineSubtreeCategoryId(item.id)) continue;
    out.push(normalizeCategory(item));
    emitted.add(item.id);
  }

  return out;
}

function mergeWithSystemCategories(categories: FinancialCategory[]): FinancialCategory[] {
  const normalizedCategories = categories.map(normalizeCategory);
  const coreIds = new Set<string>(SYSTEM_FINANCIAL_CATEGORIES.map((entry) => entry.id));
  const extras = normalizedCategories.filter((entry) => !coreIds.has(entry.id));
  const coreRows = SYSTEM_FINANCIAL_CATEGORIES.map((tpl) => {
    const existing = normalizedCategories.find((entry) => entry.id === tpl.id);
    return (
      existing ??
      normalizeCategory({
        id: tpl.id,
        name: tpl.name,
        capAmount: 0,
        dueAmount: 0,
        noDueAmount: 0,
        system: true,
        requiresDue: tpl.requiresDue,
      })
    );
  });
  return orderFinancialCategories([...coreRows, ...extras]);
}

function splitTaggedTitle(title: string) {
  const normalizedTitle = title.trim();
  const matchedTag = DUE_TAG_OPTIONS.find((tag) => normalizedTitle.startsWith(`${tag} `));
  if (!matchedTag) return { dueTag: '', dueTitle: normalizedTitle };
  return {
    dueTag: matchedTag,
    dueTitle: normalizedTitle.slice(matchedTag.length).trim(),
  };
}

function buildDueTitle(category: FinancialCategory | null, title: string, dueTag: string) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return '';
  const isCustomCategory = category ? !category.system : false;
  if (!isCustomCategory || !dueTag.trim()) return trimmedTitle;
  return `${dueTag.trim()} ${trimmedTitle}`;
}

function usesAdvanceDueDefaultTitle(categoryId: string) {
  return categoryId === 'advance' || categoryId.endsWith(':advance');
}

function buildDefaultDueTitle(categoryId: string, dueItems: DueItem[]) {
  if (!usesAdvanceDueDefaultTitle(categoryId)) return '';
  const sequence = dueItems.filter((item) => item.categoryId === categoryId).length + 1;
  return sequence <= 1 ? 'آیتم جدید' : `آیتم جدید ${sequence}`;
}

const TAG_NAME_TO_SUB_ID = Object.fromEntries(
  SYSTEM_FINANCIAL_CATEGORIES.filter((x) => x.id !== 'principal').map((x) => [x.name, x.id]),
) as Record<string, string>;

/** مهاجرت ردیف‌های custom-* به ساختار fin-line-migr-* برای سازگاری با مدل جدید. */
function migrateLegacyCustomFinancialRows(
  categories: FinancialCategory[],
  dueItems: DueItem[],
): { categories: FinancialCategory[]; dueItems: DueItem[] } {
  const legacyRoots = categories.filter((c) => c.id.startsWith('custom-') && !c.id.includes(':'));
  if (!legacyRoots.length) return { categories, dueItems };

  let nextCategories = [...categories];
  let nextDue = dueItems.map((d) => ({ ...d }));

  for (const legacy of legacyRoots) {
    const tail = legacy.id.startsWith('custom-') ? legacy.id.slice('custom-'.length) : legacy.id;
    const safeTail = tail.replace(/[^a-zA-Z0-9_-]/g, '-') || 'row';
    const lineId = `${FINANCIAL_LINE_PREFIX}migr-${safeTail}`;

    const duesOnLegacy = nextDue.filter((d) => d.categoryId === legacy.id);
    const sumBySub = new Map<string, number>();
    for (const d of duesOnLegacy) {
      const { dueTag } = splitTaggedTitle(d.title);
      const subKey = dueTag && TAG_NAME_TO_SUB_ID[dueTag] ? TAG_NAME_TO_SUB_ID[dueTag] : 'advance';
      sumBySub.set(subKey, (sumBySub.get(subKey) ?? 0) + d.amount);
    }

    const treeExists = categories.some(
      (c) =>
        c.id === lineId ||
        (c.id.startsWith(`${lineId}:`) && isFinancialLineSubtreeCategoryId(c.id)),
    );

    nextCategories = nextCategories.filter((c) => c.id !== legacy.id);
    nextDue = nextDue.map((item) => {
      if (item.categoryId !== legacy.id) return item;
      const { dueTag } = splitTaggedTitle(item.title);
      const subKey = dueTag && TAG_NAME_TO_SUB_ID[dueTag] ? TAG_NAME_TO_SUB_ID[dueTag] : 'advance';
      return { ...item, categoryId: `${lineId}:${subKey}` };
    });

    if (treeExists) continue;

    const legacyCap = Number(legacy.capAmount) || 0;
    const header = normalizeCategory({
      id: lineId,
      name: legacy.name,
      capAmount: legacyCap,
      dueAmount: 0,
      noDueAmount: legacyCap,
      system: false,
      requiresDue: false,
    });

    const subs: FinancialCategory[] = FINANCIAL_SUB_CATEGORY_IDS.map((subKey) => {
      const tpl = SYSTEM_FINANCIAL_CATEGORIES.find((e) => e.id === subKey)!;
      const fromDues = sumBySub.get(subKey) ?? 0;
      return normalizeCategory({
        id: `${lineId}:${subKey}`,
        name: tpl.name,
        capAmount: fromDues,
        dueAmount: 0,
        noDueAmount: 0,
        system: true,
        requiresDue: tpl.requiresDue,
      });
    });

    nextCategories.push(header, ...subs);
  }

  return { categories: nextCategories, dueItems: nextDue };
}

function normalizeFinancialPayload(data: ContractFinancialData | null): ContractFinancialData {
  const baseCategories = (data?.categories?.length ? data.categories : INITIAL_CATEGORIES) as FinancialCategory[];
  const baseDue = (data?.dueItems ?? []) as DueItem[];
  const migrated = migrateLegacyCustomFinancialRows(baseCategories, baseDue);
  const categories = mergeWithSystemCategories(migrated.categories);
  const safeActiveTab =
    (data?.activeTab && categories.some((item) => item.id === data.activeTab) ? data.activeTab : '') ||
    categories.find((item) => item.id !== 'principal')?.id ||
    categories[0]?.id ||
    'advance';

  return {
    pricingType: data?.pricingType ?? 'fixed',
    areaPricingMode: normalizeAreaPricingMode(data?.areaPricingMode),
    unitArea: String(Number(data?.unitArea || data?.totalArea || 0)),
    parkingArea: String(Number(data?.parkingArea || 0)),
    storageArea: String(Number(data?.storageArea || 0)),
    totalArea: String(Number(data?.totalArea || 0)),
    pricePerMeter: String(Number(data?.pricePerMeter || 0)),
    parkingPricePerMeter: String(Number(data?.parkingPricePerMeter || 0)),
    storagePricePerMeter: String(Number(data?.storagePricePerMeter || 0)),
    fixedTotalAmount: String(Number(data?.fixedTotalAmount || 0)),
    parkingFixedAmount: String(Number(data?.parkingFixedAmount || 0)),
    storageFixedAmount: String(Number(data?.storageFixedAmount || 0)),
    activeTab: safeActiveTab,
    categories,
    dueItems: migrated.dueItems,
  };
}

function serializeFinancialPayloadForDirty(payload: ContractFinancialData) {
  const { activeTab: _activeTab, categories, ...rest } = payload;
  const comparableCategories = categories.map((item) =>
    item.id === 'principal'
      ? {
          ...item,
          capAmount: 0,
          dueAmount: 0,
          noDueAmount: 0,
        }
      : item,
  );

  return JSON.stringify({
    ...rest,
    categories: comparableCategories,
  });
}

function parseNum(value: string) {
  return Number(value.replace(/,/g, '')) || 0;
}

function formatInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString('en-US')} ریال`;
}

function formatArea(value: number) {
  if (!value) return '';
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function TwoOptionSwitch<T extends string>({
  value,
  onChange,
  onValue,
  offValue,
  onText,
  offText,
  disabled = false,
}: {
  value: T;
  onChange: (value: T) => void;
  onValue: T;
  offValue: T;
  onText: string;
  offText: string;
  disabled?: boolean;
}) {
  const checked = value === onValue;

  return (
    <button
      type="button"
      className="business-switch financial-due-switch"
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onChange(checked ? offValue : onValue);
      }}
    >
      <span className="business-switch-option is-on">{onText}</span>
      <span className="business-switch-option is-off">{offText}</span>
    </button>
  );
}

function DateField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <FieldLabel label={label} />
      <div className="relative mt-2">
        <CalendarDays className="pointer-events-none absolute right-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <PersianDatePicker
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-11 rounded-full border-gray-200 bg-[#fcfdfd] pr-12 pl-4 text-right text-[13px] shadow-none"
          containerClassName="w-full"
        />
      </div>
    </div>
  );
}

function describePieSlice(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = {
    x: cx + radius * Math.cos(startAngle),
    y: cy + radius * Math.sin(startAngle),
  };
  const end = {
    x: cx + radius * Math.cos(endAngle),
    y: cy + radius * Math.sin(endAngle),
  };
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

function FinancialCategoriesPieChart({
  categories,
  totalContractAmount,
}: {
  categories: FinancialCategory[];
  totalContractAmount: number;
}) {
  const chartData = categories
    .filter((item) => item.capAmount > 0)
    .map((item, index) => ({
      ...item,
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
    }));

  const total = chartData.reduce((sum, item) => sum + item.capAmount, 0);
  const radius = 76;
  const center = 96;
  let startAngle = -Math.PI / 2;

  if (!total) {
    return (
      <div className="rounded-[8px] border border-dashed border-gray-200 bg-white/70 p-6 text-center text-sm text-gray-400">
        هیچ دسته‌ای هنوز مبلغی ندارد تا برای نمودار نمایش داده شود.
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border border-teal-100 bg-gradient-to-br from-white to-teal-50/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-800">نمودار توزیع مبالغ</p>
          <p className="mt-1 text-xs text-gray-500">این نمودار سهم هر دسته از مبلغ کل قرارداد را نشان می‌دهد.</p>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-teal-700 shadow-sm">
          جمع: {formatMoney(total)}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px,minmax(0,260px)] lg:items-center [direction:ltr]">
        <div className="mx-auto [direction:rtl]">
          <svg viewBox="0 0 192 192" className="h-52 w-52">
            <circle cx={center} cy={center} r={radius} fill="#ecfeff" />
            {chartData.map((item) => {
              const angle = (item.capAmount / total) * Math.PI * 2;
              const endAngle = startAngle + angle;
              const path = describePieSlice(center, center, radius, startAngle, endAngle);
              startAngle = endAngle;

              return <path key={item.id} d={path} fill={item.color} stroke="#ffffff" strokeWidth="3" />;
            })}
            <circle cx={center} cy={center} r="42" fill="white" />
            <text x={center} y={center - 4} textAnchor="middle" className="fill-gray-800 text-[12px] font-bold">
              {chartData.length} دسته
            </text>
            <text x={center} y={center + 16} textAnchor="middle" className="fill-gray-500 text-[9px]">
              از مبلغ کل
            </text>
          </svg>
        </div>

        <div className="max-h-52 space-y-2 overflow-y-auto pl-1 [direction:rtl]">
          {chartData.map((item) => {
            const percentage = total ? Math.round((item.capAmount / total) * 100) : 0;
            const contractShare = totalContractAmount ? Math.round((item.capAmount / totalContractAmount) * 100) : 0;

            return (
              <div key={item.id} className="rounded-[8px] border border-white/70 bg-white/90 px-2.5 py-2 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-semibold text-gray-800">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-medium text-teal-700">{percentage}%</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-3 text-[11px] text-gray-500">
                  <span>{formatMoney(item.capAmount)}</span>
                  <span>{contractShare}% از مبلغ قرارداد</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  panelClassName = '',
  footerClassName = '',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
  panelClassName?: string;
  footerClassName?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`w-full max-w-lg rounded-[8px] border border-gray-200 bg-white shadow-2xl ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h3 className="text-base font-bold text-gray-800">{title}</h3>
            {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-[8px] p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-5">{children}</div>
        <div className={`flex justify-end gap-3 border-t border-gray-100 p-4 ${footerClassName}`}>{footer}</div>
      </div>
    </div>
  );
}

export function FinancialStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [savedPayloadState, setSavedPayloadState] = useState<ContractFinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState('');
  const [additionalFormError, setAdditionalFormError] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [activeSaveTarget, setActiveSaveTarget] = useState<'main' | 'additional' | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ mode: 'route' | 'back'; href?: string } | null>(null);

  const [pricingType, setPricingType] = useState<PricingType>('fixed');
  const [areaPricingMode, setAreaPricingMode] = useState<AreaPricingMode>('unit-only');
  const [totalArea, setTotalArea] = useState('');
  const [unitArea, setUnitArea] = useState('');
  const [parkingArea, setParkingArea] = useState('');
  const [storageArea, setStorageArea] = useState('');
  const [pricePerMeter, setPricePerMeter] = useState('');
  const [parkingPricePerMeter, setParkingPricePerMeter] = useState('');
  const [storagePricePerMeter, setStoragePricePerMeter] = useState('');
  const [fixedTotalAmount, setFixedTotalAmount] = useState('');
  const [parkingFixedAmount, setParkingFixedAmount] = useState('');
  const [storageFixedAmount, setStorageFixedAmount] = useState('');
  const [categories, setCategories] = useState<FinancialCategory[]>(INITIAL_CATEGORIES);
  const [activeTab, setActiveTab] = useState('advance');
  const [dueItems, setDueItems] = useState<DueItem[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);

  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [capAmount, setCapAmount] = useState('');

  const [dueDialogOpen, setDueDialogOpen] = useState(false);
  const [editingDueId, setEditingDueId] = useState<string | null>(null);
  const [editingRegularGroupId, setEditingRegularGroupId] = useState<string | null>(null);
  const [dueMode, setDueMode] = useState<DueMode>('irregular');
  const [dueTag, setDueTag] = useState('');
  const [dueTitle, setDueTitle] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [regularPreset, setRegularPreset] = useState<RegularDuePreset>('monthly');
  const [regularCount, setRegularCount] = useState('');
  const [regularStartDate, setRegularStartDate] = useState('');
  const [externalSectionsRoot, setExternalSectionsRoot] = useState<HTMLElement | null>(null);
  const [dueFormError, setDueFormError] = useState('');
  const [principalExpanded, setPrincipalExpanded] = useState(true);
  const [expandedCustomCategoryId, setExpandedCustomCategoryId] = useState<string | null>(null);
  const [pendingDeleteCategoryId, setPendingDeleteCategoryId] = useState<string | null>(null);

  const editingCategory = editingId ? categories.find((item) => item.id === editingId) ?? null : null;
  const editingLockedCategory = editingCategory ? isStructuralLockedCategoryId(editingCategory.id) : false;
  const activeCategory = useMemo(() => categories.find((item) => item.id === activeTab) ?? null, [activeTab, categories]);
  const activeCategorySupportsRegular =
    activeCategory?.id === REGULAR_DUE_CATEGORY_ID || Boolean(activeCategory?.id.endsWith(':installment'));
  const structuralLockedCategoryIds = useMemo(() => {
    const merged = new Set<string>(LOCKED_CATEGORY_IDS as unknown as string[]);
    categories.forEach((c) => {
      if (isFinancialLineSubtreeCategoryId(c.id)) merged.add(c.id);
    });
    return Array.from(merged);
  }, [categories]);
  const activeCategoryIsCustom = activeCategory ? !activeCategory.system : false;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const [referenceData, subjectData, financialData] = await Promise.all([
          getReferenceData(),
          getStepData<ContractSubjectData>(id, 'subject'),
          getStepData<ContractFinancialData>(id, 'financial'),
        ]);
        const frontendDraft = getFrontendStepDraft<ContractFinancialData>(id, 'financial');
        const sourceData = frontendDraft ?? financialData;
        const allUnits: ReferenceUnit[] = referenceData.blocks.flatMap((block) => block.units);
        const selectedUnit =
          allUnits.find((unit) => unit.id === subjectData?.unitId && unit.category === 'unit') ??
          allUnits.find((unit) => unit.id === subjectData?.unitId);
        const assignedParking = allUnits.filter((unit) => unit.category === 'parking' && unit.assignedToUnitId === subjectData?.unitId);
        const assignedStorage = allUnits.filter((unit) => unit.category === 'storage' && unit.assignedToUnitId === subjectData?.unitId);
        const derivedAreaPricingMode = normalizeAreaPricingMode(selectedUnit?.areaPricingMode);
        const derivedUnitArea = selectedUnit?.area ?? 0;
        const derivedParkingArea = assignedParking.reduce((sum, unit) => sum + (unit.area ?? 0), 0);
        const derivedStorageArea = assignedStorage.reduce((sum, unit) => sum + (unit.area ?? 0), 0);
        const derivedTotalArea = derivedUnitArea + derivedParkingArea + derivedStorageArea;

        if (!mounted) return;

        setDraftId(id);
        const savedPayload = {
          ...normalizeFinancialPayload(financialData),
          areaPricingMode: derivedAreaPricingMode,
          unitArea: String(derivedUnitArea),
          parkingArea: String(derivedParkingArea),
          storageArea: String(derivedStorageArea),
          totalArea: String(derivedTotalArea),
        };
        initialSnapshotRef.current = serializeFinancialPayloadForDirty(savedPayload);
        setSavedPayloadState(savedPayload);

        setAreaPricingMode(derivedAreaPricingMode);
        setUnitArea(formatArea(derivedUnitArea));
        setParkingArea(formatArea(derivedParkingArea));
        setStorageArea(formatArea(derivedStorageArea));
        setTotalArea(formatArea(derivedTotalArea));

        if (sourceData) {
          const normalizedSourceData = normalizeFinancialPayload(sourceData);
          setPricingType(sourceData.pricingType);
          setAreaPricingMode(derivedAreaPricingMode);
          setUnitArea(formatArea(derivedUnitArea));
          setParkingArea(formatArea(derivedParkingArea));
          setStorageArea(formatArea(derivedStorageArea));
          setTotalArea(formatArea(derivedTotalArea));
          setPricePerMeter(sourceData.pricePerMeter ? Number(sourceData.pricePerMeter).toLocaleString('en-US') : '');
          setParkingPricePerMeter(sourceData.parkingPricePerMeter ? Number(sourceData.parkingPricePerMeter).toLocaleString('en-US') : '');
          setStoragePricePerMeter(sourceData.storagePricePerMeter ? Number(sourceData.storagePricePerMeter).toLocaleString('en-US') : '');
          setFixedTotalAmount(sourceData.fixedTotalAmount ? Number(sourceData.fixedTotalAmount).toLocaleString('en-US') : '');
          setParkingFixedAmount(sourceData.parkingFixedAmount ? Number(sourceData.parkingFixedAmount).toLocaleString('en-US') : '');
          setStorageFixedAmount(sourceData.storageFixedAmount ? Number(sourceData.storageFixedAmount).toLocaleString('en-US') : '');
          setCategories(normalizedSourceData.categories);
        setActiveTab(normalizedSourceData.activeTab || normalizedSourceData.categories[0]?.id || 'advance');
        setPrincipalExpanded(true);
          setDueItems(normalizedSourceData.dueItems);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const meteredTotal = computeMeteredContractTotal({
    areaPricingMode,
    unitArea: parseNum(unitArea),
    parkingArea: parseNum(parkingArea),
    storageArea: parseNum(storageArea),
    pricePerMeter: parseNum(pricePerMeter),
    parkingPricePerMeter: parseNum(parkingPricePerMeter),
    storagePricePerMeter: parseNum(storagePricePerMeter),
  });
  const fixedTotal = computeFixedContractTotal({
    areaPricingMode,
    fixedTotalAmount: parseNum(fixedTotalAmount),
    parkingFixedAmount: parseNum(parkingFixedAmount),
    storageFixedAmount: parseNum(storageFixedAmount),
  });
  const totalContractAmount = pricingType === 'metered' ? meteredTotal : fixedTotal;

  const overall = useMemo(
    () => ({
      cap: sumFinancialCapsCountedAgainstContractTotal(categories),
    }),
    [categories],
  );

  const overContractAmount = totalContractAmount > 0 && overall.cap > totalContractAmount;
  const visibleDueItems = useMemo(() => dueItems.filter((item) => item.categoryId === activeTab), [activeTab, dueItems]);
  const regularPresetConfig = useMemo(() => getRegularDuePresetConfig(regularPreset), [regularPreset]);
  const regularFrequency = regularPresetConfig.frequency;
  const regularInstallmentCount = Number(regularCount);
  const regularIntervalPeriod = regularPresetConfig.period;
  const regularPreviewAmounts = useMemo(
    () =>
      Number.isFinite(regularInstallmentCount) && regularInstallmentCount > 0 && parseNum(dueAmount) > 0
        ? distributeAmount(parseNum(dueAmount), regularInstallmentCount)
        : [],
    [dueAmount, regularInstallmentCount],
  );
  const regularEndDate =
    regularStartDate && Number.isFinite(regularInstallmentCount) && regularInstallmentCount > 0
      ? addIntervalToDate(regularStartDate, regularInstallmentCount - 1, regularFrequency, regularIntervalPeriod)
      : '';
  const categoryDueItemsMap = useMemo(
    () =>
      dueItems.reduce<Record<string, DueItem[]>>((acc, item) => {
        acc[item.categoryId] = [...(acc[item.categoryId] ?? []), item];
        return acc;
      }, {}),
    [dueItems],
  );

  const buildPayload = (): ContractFinancialData => ({
    pricingType,
    areaPricingMode,
    unitArea: String(parseNum(unitArea)),
    parkingArea: String(parseNum(parkingArea)),
    storageArea: String(parseNum(storageArea)),
    totalArea: String(parseNum(totalArea)),
    pricePerMeter: String(parseNum(pricePerMeter)),
    parkingPricePerMeter: String(parseNum(parkingPricePerMeter)),
    storagePricePerMeter: String(parseNum(storagePricePerMeter)),
    fixedTotalAmount: String(parseNum(fixedTotalAmount)),
    parkingFixedAmount: String(parseNum(parkingFixedAmount)),
    storageFixedAmount: String(parseNum(storageFixedAmount)),
    activeTab,
    categories: categories.map((item) => normalizeCategory(item)),
    dueItems,
  });

  const payload = useMemo<ContractFinancialData>(() => buildPayload(), [
    activeTab,
    categories,
    dueItems,
    fixedTotalAmount,
    parkingFixedAmount,
    storageFixedAmount,
    areaPricingMode,
    parkingArea,
    parkingPricePerMeter,
    pricePerMeter,
    pricingType,
    storageArea,
    storagePricePerMeter,
    totalArea,
    unitArea,
  ]);
  const buildMainSavePayload = (currentPayload: ContractFinancialData) => {
    const savedPayload = savedPayloadState ?? currentPayload;
    const currentSections = splitFinancialPayloadSections(currentPayload);
    const savedSections = splitFinancialPayloadSections(savedPayload);
    const categories = [...currentSections.primaryCategories, ...savedSections.additionalCategories].map((item) =>
      normalizeCategory(item as FinancialCategory),
    );
    const dueItems = [...currentSections.primaryDueItems, ...savedSections.additionalDueItems];

    return {
      ...currentPayload,
      categories,
      dueItems,
      activeTab: resolveActiveFinancialTab(currentPayload.activeTab, categories),
    } satisfies ContractFinancialData;
  };

  const buildAdditionalSavePayload = (currentPayload: ContractFinancialData) => {
    const savedPayload = savedPayloadState ?? currentPayload;
    const currentSections = splitFinancialPayloadSections(currentPayload);
    const savedSections = splitFinancialPayloadSections(savedPayload);
    const categories = [...savedSections.primaryCategories, ...currentSections.additionalCategories].map((item) =>
      normalizeCategory(item as FinancialCategory),
    );
    const dueItems = [...savedSections.primaryDueItems, ...currentSections.additionalDueItems];

    return {
      ...savedPayload,
      categories,
      dueItems,
      activeTab: resolveActiveFinancialTab(currentPayload.activeTab, categories),
    } satisfies ContractFinancialData;
  };

  const mainSavePayload = useMemo(() => buildMainSavePayload(payload), [payload, savedPayloadState]);
  const mainValidation = useMemo(() => validateFinancialStep(mainSavePayload), [mainSavePayload]);
  const fullValidation = useMemo(() => validateFinancialStep(payload), [payload]);
  const visibleErrors = showValidation ? mainValidation.errors : {};

  const finalizePersistedPayload = (savedPayload: ContractFinancialData) => {
    if (!draftId) return;
    const currentPayload = buildPayload();
    const savedSnapshot = serializeFinancialPayloadForDirty(savedPayload);
    const currentSnapshot = serializeFinancialPayloadForDirty(currentPayload);
    const hasChanges = currentSnapshot !== savedSnapshot;

    initialSnapshotRef.current = savedSnapshot;
    setSavedPayloadState(savedPayload);

    if (hasChanges) {
      setFrontendStepDraft(draftId, 'financial', currentPayload);
    } else {
      clearFrontendStepDraft(draftId, 'financial');
    }

    setDirty(hasChanges);
    dispatchContractFlowDirty(stepId as 'financial', hasChanges);
    dispatchContractFlowSavedForDraft(draftId, stepId as 'financial', Date.now(), savedPayload);
  };

  const persistMainSection = async () => {
    if (!draftId) return false;

    if (!mainValidation.valid) {
      setShowValidation(true);
      setFormError(
        buildValidationSummary(
          mainValidation.errors,
          {
            totalArea: 'متراژ کل',
            pricePerMeter: 'قیمت هر متر',
            parkingPricePerMeter: 'قیمت هر متر پارکینگ',
            storagePricePerMeter: 'قیمت هر متر انباری',
            fixedTotalAmount: 'مبلغ کل ثابت',
            parkingFixedAmount: 'مبلغ ثابت پارکینگ',
            storageFixedAmount: 'مبلغ ثابت انباری',
            categories: 'دسته‌های مالی',
            dueItems: 'آیتم‌های سررسید',
          },
          'لطفا اطلاعات اصلی مالی را کامل کنید.',
        ),
      );
      return false;
    }

    setSaving(true);
    setActiveSaveTarget('main');
    setFormError('');
    setAdditionalFormError('');
    setShowValidation(false);
    try {
      await saveStepData(draftId, 'financial', mainSavePayload);
      finalizePersistedPayload(mainSavePayload);
      return true;
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ذخیره تنظیمات مالی با خطا مواجه شد.');
      return false;
    } finally {
      setSaving(false);
      setActiveSaveTarget(null);
    }
  };

  const persistAdditionalCosts = async () => {
    if (!draftId) return false;

    const additionalPayload = buildAdditionalSavePayload(payload);
    const additionalValidation = validateFinancialStep(additionalPayload);
    if (!additionalValidation.valid) {
      setAdditionalFormError(
        buildValidationSummary(
          additionalValidation.errors,
          {
            categories: 'دسته‌های مالی',
            dueItems: 'آیتم‌های سررسید اضافی',
          },
          'لطفا اطلاعات هزینه‌های اضافی را کامل کنید.',
        ),
      );
      return false;
    }

    setSaving(true);
    setActiveSaveTarget('additional');
    setAdditionalFormError('');
    try {
      await saveStepData(draftId, 'financial', additionalPayload);
      finalizePersistedPayload(additionalPayload);
      return true;
    } catch (error) {
      setAdditionalFormError(error instanceof Error ? error.message : 'ذخیره هزینه‌های اضافی با خطا مواجه شد.');
      return false;
    } finally {
      setSaving(false);
      setActiveSaveTarget(null);
    }
  };

  const persistEntireStep = async () => {
    if (!draftId) return false;

    if (!fullValidation.valid) {
      setShowValidation(true);
      setFormError(
        buildValidationSummary(
          fullValidation.errors,
          {
            totalArea: 'متراژ کل',
            pricePerMeter: 'قیمت هر متر',
            parkingPricePerMeter: 'قیمت هر متر پارکینگ',
            storagePricePerMeter: 'قیمت هر متر انباری',
            fixedTotalAmount: 'مبلغ کل ثابت',
            parkingFixedAmount: 'مبلغ ثابت پارکینگ',
            storageFixedAmount: 'مبلغ ثابت انباری',
            categories: 'دسته‌های مالی',
            dueItems: 'آیتم‌های سررسید',
          },
          'لطفا اطلاعات اصلی مالی را کامل کنید.',
        ),
      );
      return false;
    }

    setSaving(true);
    setActiveSaveTarget('main');
    setFormError('');
    setAdditionalFormError('');
    setShowValidation(false);
    try {
      await saveStepData(draftId, 'financial', payload);
      initialSnapshotRef.current = serializeFinancialPayloadForDirty(payload);
      setSavedPayloadState(payload);
      clearFrontendStepDraft(draftId, 'financial');
      setDirty(false);
      dispatchContractFlowDirty(stepId as 'financial', false);
      dispatchContractFlowSavedForDraft(draftId, stepId as 'financial', Date.now(), payload);
      return true;
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ذخیره تنظیمات مالی با خطا مواجه شد.');
      return false;
    } finally {
      setSaving(false);
      setActiveSaveTarget(null);
    }
  };

  const requestNavigation = (href: string) => {
    if (saving) return;
    if (dirty) {
      setPendingNavigation({ mode: 'route', href });
      return;
    }
    setIsLeaving(true);
    router.push(href);
  };

  const continueNavigation = (target: { mode: 'route' | 'back'; href?: string }) => {
    setIsLeaving(true);
    setDirty(false);
    setPendingNavigation(null);
    if (target.mode === 'back') {
      router.back();
      return;
    }
    if (target.href) {
      router.push(target.href);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setCustomName('');
    setCapAmount('');
    setCatDialogOpen(true);
  };

  const openEdit = (category: FinancialCategory) => {
    setEditingId(category.id);
    setCustomName(category.system ? '' : category.name);
    setCapAmount(category.capAmount.toLocaleString('en-US'));
    setCatDialogOpen(true);
    setOpenMenuId(null);
  };

  const submitCategory = () => {
    const name = editingLockedCategory ? editingCategory?.name ?? '' : customName.trim();
    if (!name) return;

    const amount = parseNum(capAmount);

    if (!editingId) {
      const uuid =
        typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto
          ? globalThis.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const lineId = `${FINANCIAL_LINE_PREFIX}${uuid}`;
      const header: FinancialCategory = {
        id: lineId,
        name: customName.trim(),
        capAmount: amount,
        dueAmount: 0,
        noDueAmount: amount,
        system: false,
        requiresDue: false,
      };
      const subs: FinancialCategory[] = FINANCIAL_SUB_CATEGORY_IDS.map((subKey) => {
        const tpl = SYSTEM_FINANCIAL_CATEGORIES.find((entry) => entry.id === subKey)!;
        return normalizeCategory({
          id: `${lineId}:${subKey}`,
          name: tpl.name,
          capAmount: 0,
          dueAmount: 0,
          noDueAmount: 0,
          system: true,
          requiresDue: tpl.requiresDue,
        });
      });
      const nextCategories = orderFinancialCategories([...categories, normalizeCategory(header), ...subs]);
      const firstSubId = `${lineId}:${FINANCIAL_SUB_CATEGORY_IDS[0]}`;
      setCategories(nextCategories);
      setActiveTab(firstSubId);
      setExpandedCustomCategoryId(lineId);
      setPrincipalExpanded(false);
      setCatDialogOpen(false);
      return;
    }

    const nextCategories = orderFinancialCategories(
      categories.map((item) => {
        if (item.id !== editingId) return item;
        if (editingLockedCategory) {
          return normalizeCategory({
            ...item,
            capAmount: amount,
          });
        }
        return normalizeCategory({
          ...item,
          name,
          capAmount: amount,
        });
      }),
    );

    setCategories(nextCategories);
    setActiveTab(editingId);
    if (isFinancialLineHeaderCategoryId(editingId)) {
      setExpandedCustomCategoryId(editingId);
      setPrincipalExpanded(false);
    }
    setCatDialogOpen(false);
  };

  const performDeleteCategory = (categoryId: string) => {
    if ((LOCKED_CATEGORY_IDS as readonly string[]).includes(categoryId)) return;
    if (isFinancialLineSubtreeCategoryId(categoryId)) return;

    const nextCategories = orderFinancialCategories(
      isFinancialLineHeaderCategoryId(categoryId)
        ? categories.filter((item) => item.id !== categoryId && !item.id.startsWith(`${categoryId}:`))
        : categories.filter((item) => item.id !== categoryId),
    );
    setCategories(nextCategories);
    if (isFinancialLineHeaderCategoryId(categoryId)) {
      const prefix = `${categoryId}:`;
      setDueItems((current) =>
        current.filter((item) => item.categoryId !== categoryId && !item.categoryId.startsWith(prefix)),
      );
    } else {
      setDueItems((current) => current.filter((item) => item.categoryId !== categoryId));
    }

    const nextTabIfRemoved =
      activeTab === categoryId ||
      (isFinancialLineHeaderCategoryId(categoryId) && activeTab.startsWith(`${categoryId}:`));
    if (nextTabIfRemoved) {
      setActiveTab(nextCategories.find((row) => row.id !== 'principal')?.id ?? nextCategories[0]?.id ?? 'advance');
    }
    if (expandedCustomCategoryId === categoryId) {
      setExpandedCustomCategoryId(null);
    }
    setOpenMenuId(null);
    setOpenInfoId(null);
  };

  const requestDeleteCategory = (categoryId: string) => {
    if ((LOCKED_CATEGORY_IDS as readonly string[]).includes(categoryId)) return;
    if (isFinancialLineSubtreeCategoryId(categoryId)) return;
    setPendingDeleteCategoryId(categoryId);
  };

  const updateCategoryAmount = (categoryId: string, value: string) => {
    const amount = parseNum(value);
    const nextCategories = orderFinancialCategories(
      categories.map((item) =>
        item.id === categoryId
          ? normalizeCategory({
              ...item,
              capAmount: amount,
            })
          : item,
      ),
    );

    setCategories(nextCategories);
  };

  const openDueForCategory = (categoryId: string) => {
    const supportsRegular =
      categoryId === REGULAR_DUE_CATEGORY_ID || Boolean(categoryId.endsWith(':installment'));
    setActiveTab(categoryId);
    setEditingDueId(null);
    setEditingRegularGroupId(null);
    setDueMode(supportsRegular ? 'regular' : 'irregular');
    setDueTag('');
    setDueTitle(buildDefaultDueTitle(categoryId, dueItems));
    setDueAmount('');
    setDueDate('');
    setRegularPreset('monthly');
    setRegularCount('');
    setRegularStartDate('');
    setDueFormError('');
    setDueDialogOpen(true);
  };

  // (no-op) previously used for grouped UI

  const openEditDueItem = (item: DueItem) => {
    setActiveTab(item.categoryId);
    if (item.regularScheduleGroupId && item.regularScheduleConfig) {
      const groupedItems = dueItems.filter((entry) => entry.regularScheduleGroupId === item.regularScheduleGroupId);
      setEditingDueId(null);
      setEditingRegularGroupId(item.regularScheduleGroupId);
      setDueMode('regular');
      setDueTag('');
      setDueTitle(item.regularScheduleConfig.baseTitle);
      setDueAmount(item.regularScheduleConfig.totalAmount ? item.regularScheduleConfig.totalAmount.toLocaleString('en-US') : '');
      setDueDate('');
      setRegularPreset(resolveRegularDuePreset(item.regularScheduleConfig.frequency, item.regularScheduleConfig.period));
      setRegularCount(String(item.regularScheduleConfig.count || groupedItems.length));
      setRegularStartDate(item.regularScheduleConfig.startDate || groupedItems[0]?.dueDate || '');
      setDueFormError('');
      setDueDialogOpen(true);
      return;
    }

    setEditingDueId(item.id);
    setEditingRegularGroupId(null);
    setDueMode('irregular');
    const category = categories.find((entry) => entry.id === item.categoryId) ?? null;
    const parsedTaggedTitle = category && !category.system ? splitTaggedTitle(item.title) : { dueTag: '', dueTitle: item.title };
    setDueTag(parsedTaggedTitle.dueTag);
    setDueTitle(parsedTaggedTitle.dueTitle);
    setDueAmount(item.amount ? item.amount.toLocaleString('en-US') : '');
    setDueDate(item.dueDate);
    setRegularPreset('monthly');
    setRegularCount('');
    setRegularStartDate('');
    setDueFormError('');
    setDueDialogOpen(true);
  };

  const submitDue = () => {
    if (!dueTitle.trim()) {
      setDueFormError('عنوان سررسید را وارد کنید.');
      return;
    }

    if (parseNum(dueAmount) <= 0) {
      setDueFormError('مبلغ باید بزرگ‌تر از صفر باشد.');
      return;
    }

    const finalDueTitle = buildDueTitle(activeCategory, dueTitle, dueTag);

    if (dueMode === 'irregular' || !activeCategorySupportsRegular) {
      if (!dueDate.trim()) {
        setDueFormError('تاریخ سررسید را وارد کنید.');
        return;
      }

      const nextItem: DueItem = {
        id: editingDueId ?? `due-${Date.now()}`,
        categoryId: activeTab,
        title: finalDueTitle,
        amount: parseNum(dueAmount),
        dueDate,
      };

      setDueItems((current) =>
        editingDueId ? current.map((item) => (item.id === editingDueId ? nextItem : item)) : [...current, nextItem],
      );
    } else {
      const count = Number(regularCount);
      if (!Number.isFinite(count) || count <= 0) {
        setDueFormError('تعداد اقساط را وارد کنید.');
        return;
      }

      if (!regularStartDate.trim()) {
        setDueFormError('تاریخ شروع را وارد کنید.');
        return;
      }

      const regularGroupId = editingRegularGroupId ?? `due-group-${Date.now()}`;
      const generatedItems = buildRegularDueItems({
        activeTab,
        title: finalDueTitle,
        totalAmount: parseNum(dueAmount),
        count,
        startDate: regularStartDate,
        frequency: regularFrequency,
        period: regularIntervalPeriod,
        groupId: regularGroupId,
        idPrefix: regularGroupId,
        preset: regularPreset,
      });

      if (generatedItems.some((item) => !item.dueDate)) {
        setDueFormError('برخی تاریخ‌های اقساط معتبر نیستند.');
        return;
      }

      setDueItems((current) =>
        editingRegularGroupId
          ? [...current.filter((item) => item.regularScheduleGroupId !== editingRegularGroupId), ...generatedItems]
          : [...current, ...generatedItems],
      );
    }

    setDueMode('irregular');
    setEditingDueId(null);
    setEditingRegularGroupId(null);
    setDueTag('');
    setDueTitle('');
    setDueAmount('');
    setDueDate('');
    setRegularPreset('monthly');
    setRegularCount('');
    setRegularStartDate('');
    setDueFormError('');
    setDueDialogOpen(false);
  };

  useEffect(() => {
    if (loading) return;

    const payload = buildPayload();
    const snapshot = serializeFinancialPayloadForDirty(payload);
    dispatchContractFlowFinancialSnapshot(payload);
    if (!initialSnapshotRef.current) {
      initialSnapshotRef.current = snapshot;
      setDirty(false);
      dispatchContractFlowDirty(stepId as 'financial', false);
      return;
    }

    const hasChanges = snapshot !== initialSnapshotRef.current;
    if (draftId) {
      if (hasChanges) {
        setFrontendStepDraft(draftId, 'financial', payload);
      } else {
        clearFrontendStepDraft(draftId, 'financial');
      }
    }
    setDirty(hasChanges);
    dispatchContractFlowDirty(stepId as 'financial', hasChanges);
  }, [activeTab, areaPricingMode, categories, draftId, dueItems, fixedTotalAmount, loading, parkingArea, parkingFixedAmount, parkingPricePerMeter, pricePerMeter, pricingType, stepId, storageArea, storageFixedAmount, storagePricePerMeter, totalArea, unitArea]);

  // Sync principal row amount from pricing box (read-only in UI)
  useEffect(() => {
    if (loading) return;
    setCategories((current) =>
      orderFinancialCategories(
        current.map((item) =>
          item.id === 'principal'
            ? normalizeCategory({
                ...item,
                capAmount: totalContractAmount,
              })
            : item,
        ),
      ),
    );
  }, [loading, totalContractAmount]);

  useEffect(() => {
    setExternalSectionsRoot(document.getElementById('contract-financial-line-sections-root'));
  }, []);

  useEffect(() => {
    const handleFocusFinancialLine = (event: Event) => {
      const lineId = (event as CustomEvent<{ lineId?: string }>).detail?.lineId;
      if (!lineId) return;
      setExpandedCustomCategoryId(lineId);
      setPrincipalExpanded(false);
      window.setTimeout(() => {
        document.getElementById(`financial-line-${lineId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    };

    window.addEventListener('contract-flow:focus-financial-line', handleFocusFinancialLine as EventListener);
    return () => window.removeEventListener('contract-flow:focus-financial-line', handleFocusFinancialLine as EventListener);
  }, []);

  useEffect(() => {
    if (embedded) return;
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty, embedded]);

  useEffect(() => {
    if (embedded) return;
    const handlePopState = () => {
      if (!dirty || isLeaving) return;
      window.history.pushState(null, '', window.location.href);
      setPendingNavigation({ mode: 'back' });
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dirty, embedded, isLeaving]);

  useEffect(() => {
    if (embedded) return;
    const handleDocumentClick = (event: MouseEvent) => {
      if (!dirty || isLeaving) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) return;
      if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search && nextUrl.hash === currentUrl.hash) return;

      event.preventDefault();
      setPendingNavigation({ mode: 'route', href: `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}` });
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [dirty, embedded, isLeaving]);

  useEffect(() => {
    if (embedded) return;
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const interceptHistoryChange = (url?: string | URL | null) => {
      if (!dirty || isLeaving || !url) return false;

      const nextUrl = new URL(String(url), window.location.href);
      const currentUrl = new URL(window.location.href);
      const nextHref = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      const currentHref = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

      if (nextHref === currentHref) return false;

      setPendingNavigation({ mode: 'route', href: nextHref });
      return true;
    };

    window.history.pushState = function pushState(data, unused, url) {
      if (interceptHistoryChange(url)) return;
      originalPushState.call(window.history, data, unused, url);
    };

    window.history.replaceState = function replaceState(data, unused, url) {
      if (interceptHistoryChange(url)) return;
      originalReplaceState.call(window.history, data, unused, url);
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [dirty, embedded, isLeaving]);

  const handleSubmit = async () => {
    const saved = await persistMainSection();
    if (saved) {
      setIsLeaving(true);
      router.push(basePath);
    }
  };

  const handleAdditionalCostsSubmit = async () => {
    await persistAdditionalCosts();
  };

  if (loading) {
      return <ContractStepLoader title={title} description="در حال بارگذاری اطلاعات مالی، لطفاً کمی صبر کنید..." />;
  }

  return (
    <div className="space-y-5">
      {!embedded ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">در این مرحله مبلغ‌گذاری، پرداخت‌ها و آیتم‌های سررسید را تنظیم می‌کنید.</p>
        </div>
        <button type="button" onClick={() => requestNavigation(basePath)} className="rounded-[8px] border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          بازگشت به مراحل
        </button>
      </div> : null}

      <div className={visibleErrors.totalArea || visibleErrors.pricePerMeter || visibleErrors.parkingPricePerMeter || visibleErrors.storagePricePerMeter || visibleErrors.fixedTotalAmount || visibleErrors.parkingFixedAmount || visibleErrors.storageFixedAmount ? 'rounded-[8px] border border-rose-300 bg-rose-50/20 p-1' : ''}>
        <FinancialPricingBox
          pricingType={pricingType}
          onPricingTypeChange={setPricingType}
          areaPricingMode={areaPricingMode}
          totalArea={totalArea}
          unitArea={unitArea}
          parkingArea={parkingArea}
          storageArea={storageArea}
          pricePerMeter={pricePerMeter}
          onPricePerMeterChange={setPricePerMeter}
          parkingPricePerMeter={parkingPricePerMeter}
          onParkingPricePerMeterChange={setParkingPricePerMeter}
          storagePricePerMeter={storagePricePerMeter}
          onStoragePricePerMeterChange={setStoragePricePerMeter}
          fixedTotalAmount={fixedTotalAmount}
          onFixedTotalAmountChange={setFixedTotalAmount}
          parkingFixedAmount={parkingFixedAmount}
          onParkingFixedAmountChange={setParkingFixedAmount}
          storageFixedAmount={storageFixedAmount}
          onStorageFixedAmountChange={setStorageFixedAmount}
          meteredTotal={meteredTotal}
          fixedTotal={fixedTotal}
          formatInput={formatInput}
          formatMoney={formatMoney}
          pricingTypeInvalid={Boolean(visibleErrors.totalArea || visibleErrors.pricePerMeter || visibleErrors.parkingPricePerMeter || visibleErrors.storagePricePerMeter || visibleErrors.fixedTotalAmount || visibleErrors.parkingFixedAmount || visibleErrors.storageFixedAmount)}
          totalAreaInvalid={Boolean(visibleErrors.totalArea)}
          pricePerMeterInvalid={Boolean(visibleErrors.pricePerMeter)}
          parkingPricePerMeterInvalid={Boolean(visibleErrors.parkingPricePerMeter)}
          storagePricePerMeterInvalid={Boolean(visibleErrors.storagePricePerMeter)}
          fixedTotalAmountInvalid={Boolean(visibleErrors.fixedTotalAmount)}
          parkingFixedAmountInvalid={Boolean(visibleErrors.parkingFixedAmount)}
          storageFixedAmountInvalid={Boolean(visibleErrors.storageFixedAmount)}
        />
      </div>

      {formError ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <div>
        <FinancialPaymentFlow
          categories={categories}
          lockedCategoryIds={structuralLockedCategoryIds}
          categoryDueItemsMap={categoryDueItemsMap}
          principalAmount={totalContractAmount}
          principalExpanded={principalExpanded}
          onTogglePrincipal={() => setPrincipalExpanded((current) => !current)}
          expandedCustomCategoryId={expandedCustomCategoryId}
          onToggleCustomCategory={(categoryId) => {
            setExpandedCustomCategoryId((current) => (current === categoryId ? null : categoryId));
            setPrincipalExpanded(false);
          }}
          onCategoryAmountChange={updateCategoryAmount}
          onOpenAddCategory={openAdd}
          onOpenEditCategory={openEdit}
          onDeleteCategory={requestDeleteCategory}
          onOpenDueDialog={openDueForCategory}
          onEditDueItem={openEditDueItem}
          onDeleteDueItem={(id) => setDueItems((current) => current.filter((dueItem) => dueItem.id !== id))}
          formatInput={formatInput}
          formatMoney={formatMoney}
          invalidCategoryIds={categories.filter((item) => visibleErrors.categories || (visibleErrors.dueItems && (categoryDueItemsMap[item.id]?.length ?? 0) > 0)).map((item) => item.id)}
          showAdditionalCostsSection={false}
        />
      </div>

      <StickySubmitBar
        label="ذخیره اطلاعات مالی"
        loadingLabel={loading ? 'در حال آماده‌سازی...' : activeSaveTarget === 'main' ? 'در حال ذخیره...' : undefined}
        disabled={loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
      />

      {externalSectionsRoot
        ? createPortal(
            <div className="space-y-4">
              <FinancialPaymentFlow
                categories={categories}
                lockedCategoryIds={structuralLockedCategoryIds}
                categoryDueItemsMap={categoryDueItemsMap}
                principalAmount={totalContractAmount}
                principalExpanded={principalExpanded}
                onTogglePrincipal={() => setPrincipalExpanded((current) => !current)}
                expandedCustomCategoryId={expandedCustomCategoryId}
                onToggleCustomCategory={(categoryId) => {
                  setExpandedCustomCategoryId((current) => (current === categoryId ? null : categoryId));
                  setPrincipalExpanded(false);
                }}
                onCategoryAmountChange={updateCategoryAmount}
                onOpenAddCategory={openAdd}
                onOpenEditCategory={openEdit}
                onDeleteCategory={requestDeleteCategory}
                onOpenDueDialog={openDueForCategory}
                onEditDueItem={openEditDueItem}
                onDeleteDueItem={(id) => setDueItems((current) => current.filter((dueItem) => dueItem.id !== id))}
                formatInput={formatInput}
                formatMoney={formatMoney}
                invalidCategoryIds={categories.filter((item) => visibleErrors.categories || (visibleErrors.dueItems && (categoryDueItemsMap[item.id]?.length ?? 0) > 0)).map((item) => item.id)}
                showPrincipalSection={false}
                additionalCostsFooter={
                  <>
                    {additionalFormError ? <div className="mb-4 rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{additionalFormError}</div> : null}

                    <StickySubmitBar
                      label="ذخیره بخش‌های تکمیلی"
                      loadingLabel={activeSaveTarget === 'additional' ? 'در حال ذخیره...' : undefined}
                      disabled={loading || saving}
                      onClick={handleAdditionalCostsSubmit}
                      embedded
                    />
                  </>
                }
              />
            </div>,
            externalSectionsRoot,
          )
        : null}

      <Modal
        open={Boolean(pendingDeleteCategoryId)}
        onClose={() => setPendingDeleteCategoryId(null)}
        title="حذف دسته مالی"
        description={(() => {
          if (!pendingDeleteCategoryId) return undefined;
          const label =
            categories.find((row) => row.id === pendingDeleteCategoryId)?.name?.trim() || 'دسته مالی';
          return isFinancialLineHeaderCategoryId(pendingDeleteCategoryId)
            ? `اگر «${label}» حذف شود، تمام زیرمجموعه‌های آن و آیتم‌های مرتبط هم حذف می‌شوند.`
            : `اگر «${label}» حذف شود، آیتم‌های سررسید مربوطه هم حذف خواهند شد.`;
        })()}
        footer={
          <>
            <button
              type="button"
              onClick={() => setPendingDeleteCategoryId(null)}
              className="rounded-[8px] border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={() => {
                if (!pendingDeleteCategoryId) return;
                performDeleteCategory(pendingDeleteCategoryId);
                setPendingDeleteCategoryId(null);
              }}
              className="rounded-[8px] border border-rose-200 bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              حذف
            </button>
          </>
        }
        footerClassName="justify-end gap-2"
      >
        {null}
      </Modal>

      <Modal
        open={Boolean(pendingNavigation)}
        onClose={() => setPendingNavigation(null)}
        title="خروج از مرحله مالی"
        description="تغییرات ذخیره‌نشده وجود دارد. اگر ادامه دهید، ممکن است داده‌ها از دست بروند."
        footer={
          <>
            <button type="button" onClick={() => setPendingNavigation(null)} className="rounded-[8px] border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              ماندن در صفحه
            </button>
            <button
              type="button"
              onClick={() => pendingNavigation && continueNavigation(pendingNavigation)}
              className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              ادامه بدون ذخیره
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!pendingNavigation) return;
                const saved = await persistEntireStep();
                if (saved) {
                  continueNavigation(pendingNavigation);
                }
              }}
              className="rounded-[8px] bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              ذخیره و ادامه
            </button>
          </>
        }
      >
        <div className="rounded-[8px] border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          تغییرات را قبل از خروج ذخیره کنید تا چیزی از دست نرود.
        </div>
      </Modal>

      <Modal
        open={catDialogOpen}
        onClose={() => setCatDialogOpen(false)}
        title={editingId ? 'ویرایش دسته مالی' : 'افزودن دسته مالی'}
        panelClassName="!max-w-[320px]"
        footerClassName="justify-start border-gray-100 px-5 py-3"
        footer={
          <>
            <button type="button" onClick={() => setCatDialogOpen(false)} className="px-1 py-1 text-sm font-bold text-[#0e989d] transition hover:text-[#0b7f84]">
              انصراف
            </button>
            <button type="button" onClick={submitCategory} className="px-1 py-1 text-sm font-bold text-[#0e989d] transition hover:text-[#0b7f84]">
              ذخیره
            </button>
          </>
        }
      >
        {editingLockedCategory ? (
          <div>
            <FieldLabel label="نام دسته" />
            <div className="mt-2 flex h-10 items-center rounded-[8px] border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700">
              {editingCategory?.name}
            </div>
          </div>
        ) : (
          <div>
            <FieldLabel label="سقف مبلغ" />
            <Input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="مثال: هزینه مشترک" className="mt-2" />
          </div>
        )}

        <div>
          <FieldLabel label="سقف مبلغ" />
          <Input value={capAmount} onChange={(event) => setCapAmount(formatInput(event.target.value))} placeholder="مثال: 10,000,000" className="mt-2" />
        </div>
      </Modal>

      <Modal
        open={dueDialogOpen}
        onClose={() => {
          setDueDialogOpen(false);
          setEditingDueId(null);
          setEditingRegularGroupId(null);
          setDueTag('');
          setDueFormError('');
        }}
        title={editingRegularGroupId ? 'ویرایش برنامه پرداخت منظم' : editingDueId ? 'ویرایش سررسید' : 'افزودن سررسید'}
        description={`اطلاعات مربوط به ${categories.find((item) => item.id === activeTab)?.name ?? 'دسته فعلی'} را وارد کنید.`}
        panelClassName="!max-w-[27vw]"
        footerClassName="justify-start border-gray-100 px-5 py-3"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDueDialogOpen(false);
                setEditingDueId(null);
                setEditingRegularGroupId(null);
                setDueTag('');
                setDueFormError('');
              }}
              className="px-1 py-1 text-sm font-bold text-[#0e989d] transition hover:text-[#0b7f84]"
            >
              بستن
            </button>
            <button type="button" onClick={submitDue} className="px-1 py-1 text-sm font-bold text-[#0e989d] transition hover:text-[#0b7f84]">
              {editingDueId ? 'ویرایش' : 'ثبت'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {activeCategorySupportsRegular ? (
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel label="نوع پرداخت" />
                <TwoOptionSwitch<DueMode>
                  value={dueMode}
                  onChange={setDueMode}
                  onValue="regular"
                  offValue="irregular"
                  onText="منظم"
                  offText="غیرمنظم"
                  disabled={Boolean(editingDueId || editingRegularGroupId)}
                />
              </div>
            </section>
          ) : null}

          <section className="space-y-3 border-t border-gray-100 pt-4">
            <div className="text-[13px] font-bold text-gray-800">اطلاعات سررسید</div>
            <div className="grid gap-3">
              {activeCategoryIsCustom ? (
                <div className="rounded-[8px] border border-slate-200 bg-slate-50/80 px-3 py-3">
                  <FieldLabel label="برچسب" />
                  <TagPills<string>
                    value={dueTag}
                    onChange={setDueTag}
                    options={DUE_TAG_OPTIONS.map((option) => ({ value: option, label: option }))}
                    className="mt-2 w-full gap-2"
                  />
                </div>
              ) : null}
              <div>
                <FieldLabel label="عنوان" />
                <Input
                  value={dueTitle}
                  onChange={(event) => setDueTitle(event.target.value)}
                  placeholder={activeCategorySupportsRegular && dueMode === 'regular' ? 'مثال: 500,000' : 'مثال: 1,500,000'}
                  className="mt-2 h-10 rounded-[8px] border-gray-200 bg-[#fcfdfd] px-3 text-[13px]"
                />
              </div>

              <div>
                <FieldLabel label={activeCategorySupportsRegular && dueMode === 'regular' ? 'مبلغ منظم' : 'مبلغ'} />
                <div className="relative mt-2">
                  <Input
                    value={dueAmount}
                    onChange={(event) => setDueAmount(formatInput(event.target.value))}
                    placeholder={activeCategorySupportsRegular && dueMode === 'regular' ? 'مثال: هر 1 ماه' : 'مثال: 1,000,000'}
                    className="h-10 rounded-[8px] border-gray-200 bg-[#fcfdfd] pr-3 pl-12 text-[13px]"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-gray-400">تومان</span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[13px] font-bold text-gray-800">{activeCategorySupportsRegular && dueMode === 'regular' ? 'تنظیمات پرداخت منظم' : 'تنظیمات پرداخت'}</div>
                {activeCategorySupportsRegular && dueMode === 'regular' ? (
                <TagPills<RegularDuePreset>
                  value={regularPreset}
                  onChange={setRegularPreset}
                  options={REGULAR_DUE_PRESETS.map((option) => ({ value: option.value, label: option.label }))}
                />
              ) : null}
            </div>

            {!activeCategorySupportsRegular || dueMode === 'irregular' ? (
              <DateField label="تاریخ سررسید" value={dueDate} onChange={setDueDate} placeholder="تاریخ سررسید را از تقویم انتخاب کنید" />
            ) : (
              <>
                <div className="grid gap-3">
                  <div>
                    <FieldLabel label="نوع دوره" />
                    <div className="mt-2 flex h-10 items-center rounded-[8px] border border-gray-200 bg-gray-50 px-3 text-[13px] text-gray-700">
                      {regularPresetConfig.label}
                    </div>
                  </div>
                  <div>
                    <FieldLabel label={`تعداد ${regularPresetConfig.label}`} />
                    <Input
                      value={regularCount}
                      onChange={(event) => setRegularCount(event.target.value.replace(/\D/g, ''))}
                      placeholder="مثال: 6"
                      className="mt-2 h-10 rounded-[8px] border-gray-200 bg-white px-3 text-[13px]"
                    />
                  </div>
                  <DateField
                    label={`تاریخ شروع ${regularPresetConfig.label}`}
                    value={regularStartDate}
                    onChange={setRegularStartDate}
                    placeholder="مثال: هر 1 ماه"
                  />
                  <div>
                    <FieldLabel label="تاریخ پایان" />
                    <div className="mt-2 flex h-10 items-center rounded-[8px] border border-gray-200 bg-gray-50 px-3 text-[13px] text-gray-600">
                      {regularEndDate}
                    </div>
                  </div>
                  <div>
                    <FieldLabel label="پیش‌نمایش مبلغ" />
                    <div className="mt-2 flex h-10 items-center rounded-[8px] border border-gray-200 bg-gray-50 px-3 text-[13px] font-medium text-teal-700">
                      {regularPreviewAmounts.length ? formatMoney(regularPreviewAmounts[0]) : 'هنوز پیش‌نمایش مبلغ برای این مورد محاسبه نشده است'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-[8px] bg-[#f6f7f4] px-3 py-2 text-xs text-gray-500">
                  <span>{`بازه پرداخت: هر ${regularIntervalPeriod} ${regularPresetConfig.unitLabel}`}</span>
                  <span>{regularInstallmentCount > 0 ? `${regularInstallmentCount} قسط` : 'هنوز تعداد اقساط تعیین نشده است'}</span>
                </div>
              </>
            )}
          </section>

          {dueFormError ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{dueFormError}</div> : null}
        </div>
      </Modal>
    </div>
  );
}


