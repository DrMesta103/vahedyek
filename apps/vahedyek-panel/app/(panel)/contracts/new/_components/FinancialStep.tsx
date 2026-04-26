'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Plus, X } from 'lucide-react';
import { TagPills } from './ContractFormPrimitives';
import { FieldLabel } from './FieldLabel';
import { FinancialPaymentFlow } from './FinancialPaymentFlow';
import { FinancialPricingBox } from './FinancialPricingBox';
import { StickySubmitBar } from './StickySubmitBar';
import { ContractStepLoader } from './ContractStepLoader';
import { Input } from '../../../../components/ui/input';
import { PersianDatePicker } from '../../../../components/ui/PersianDatePicker';
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
import { addIntervalToDate, buildRegularDueItems, distributeAmount, type DueFrequency } from '../../../../lib/financialUtils';
import type { ContractFinancialData, ContractSubjectData, FinancialCategoryData, FinancialDueItemData, PricingType } from '../../../../types/contract';
import { dispatchContractFlowDirty, dispatchContractFlowFinancialSnapshot, dispatchContractFlowSaved } from './contractFlowSignals';

type FinancialCategory = FinancialCategoryData;
type DueItem = FinancialDueItemData;
type DueMode = 'irregular' | 'regular';

const SYSTEM_FINANCIAL_CATEGORIES = [
  { id: 'advance', name: 'پیش پرداخت', requiresDue: true },
  { id: 'installment', name: 'اقساط ثابت', requiresDue: true },
  { id: 'loan', name: 'وام بانکی', requiresDue: false },
  { id: 'handover', name: 'تحویل واحد', requiresDue: false },
  { id: 'document', name: 'تحویل سند', requiresDue: false },
] as const;
const LOCKED_CATEGORY_IDS = SYSTEM_FINANCIAL_CATEGORIES.map((item) => item.id);
const DUE_TAG_OPTIONS = SYSTEM_FINANCIAL_CATEGORIES.map((item) => item.name);
const REGULAR_DUE_CATEGORY_ID = 'installment';
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

function getCategoryRequiresDue(categoryId: string) {
  return SYSTEM_FINANCIAL_CATEGORIES.find((item) => item.id === (categoryId as (typeof SYSTEM_FINANCIAL_CATEGORIES)[number]['id']))?.requiresDue ?? true;
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

function mergeWithSystemCategories(categories: FinancialCategory[]) {
  const normalizedCategories = categories.map(normalizeCategory);
  const existingById = new Map(normalizedCategories.map((item) => [item.id, item]));
  const merged = SYSTEM_FINANCIAL_CATEGORIES.map((item) => existingById.get(item.id) ?? normalizeCategory({
    id: item.id,
    name: item.name,
    capAmount: 0,
    dueAmount: 0,
    noDueAmount: 0,
    system: true,
    requiresDue: item.requiresDue,
  }));

  const customCategories = normalizedCategories.filter((item) => !LOCKED_CATEGORY_IDS.includes(item.id as any));
  return [...merged, ...customCategories];
}

function orderCategories(categories: FinancialCategory[]) {
  const systemOrder = new Map<string, number>(SYSTEM_FINANCIAL_CATEGORIES.map((item, index) => [item.id, index]));
  return categories
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aIndex = systemOrder.get(a.item.id);
      const bIndex = systemOrder.get(b.item.id);
      if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;
      return a.index - b.index;
    })
    .map(({ item }) => item);
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

function normalizeFinancialPayload(data: ContractFinancialData | null): ContractFinancialData {
  const categories = orderCategories(mergeWithSystemCategories(data?.categories?.length ? data.categories : INITIAL_CATEGORIES));

  return {
    pricingType: data?.pricingType ?? 'fixed',
    unitArea: String(Number(data?.unitArea || data?.totalArea || 0)),
    parkingArea: String(Number(data?.parkingArea || 0)),
    totalArea: String(Number(data?.totalArea || 0)),
    pricePerMeter: String(Number(data?.pricePerMeter || 0)),
    parkingPricePerMeter: String(Number(data?.parkingPricePerMeter || 0)),
    fixedTotalAmount: String(Number(data?.fixedTotalAmount || 0)),
    activeTab: data?.activeTab || categories[0]?.id || 'advance',
    categories,
    dueItems: data?.dueItems ?? [],
  };
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
  return `${Math.round(value).toLocaleString('en-US')} تومان`;
}

function formatArea(value: number) {
  if (!value) return '';
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function getMeteredTotal(unitArea: number, parkingArea: number, unitPrice: number, parkingPrice: number) {
  return unitArea * unitPrice + parkingArea * parkingPrice;
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
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-6 text-center text-sm text-gray-400">
        هنوز برای ردیف‌های مالی مبلغی ثبت نشده تا چارت نمایش داده شود.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-white to-teal-50/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-800">چارت دسته‌بندی ردیف‌های مالی</p>
          <p className="mt-1 text-xs text-gray-500">سهم هر ردیف از جمع مالی قرارداد در این نمودار نمایش داده می‌شود.</p>
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
              {chartData.length} ردیف
            </text>
            <text x={center} y={center + 16} textAnchor="middle" className="fill-gray-500 text-[9px]">
              از مبلغ قرارداد
            </text>
          </svg>
        </div>

        <div className="max-h-52 space-y-2 overflow-y-auto pl-1 [direction:rtl]">
          {chartData.map((item) => {
            const percentage = total ? Math.round((item.capAmount / total) * 100) : 0;
            const contractShare = totalContractAmount ? Math.round((item.capAmount / totalContractAmount) * 100) : 0;

            return (
              <div key={item.id} className="rounded-lg border border-white/70 bg-white/90 px-2.5 py-2 shadow-sm">
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
        className={`w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h3 className="text-base font-bold text-gray-800">{title}</h3>
            {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState('');
  const [isLeaving, setIsLeaving] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ mode: 'route' | 'back'; href?: string } | null>(null);

  const [pricingType, setPricingType] = useState<PricingType>('fixed');
  const [totalArea, setTotalArea] = useState('');
  const [unitArea, setUnitArea] = useState('');
  const [parkingArea, setParkingArea] = useState('');
  const [pricePerMeter, setPricePerMeter] = useState('');
  const [parkingPricePerMeter, setParkingPricePerMeter] = useState('');
  const [fixedTotalAmount, setFixedTotalAmount] = useState('');
  const [categories, setCategories] = useState<FinancialCategory[]>(INITIAL_CATEGORIES);
  const [activeTab, setActiveTab] = useState('advance');
  const [dueItems, setDueItems] = useState<DueItem[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);
  const [pendingCategoryApply, setPendingCategoryApply] = useState<{
    categories: FinancialCategory[];
    activeTab: string;
  } | null>(null);

  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [capAmount, setCapAmount] = useState('');

  const [dueDialogOpen, setDueDialogOpen] = useState(false);
  const [editingDueId, setEditingDueId] = useState<string | null>(null);
  const [dueMode, setDueMode] = useState<DueMode>('irregular');
  const [dueTag, setDueTag] = useState('');
  const [dueTitle, setDueTitle] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [regularFrequency, setRegularFrequency] = useState<DueFrequency>('monthly');
  const [regularPeriod, setRegularPeriod] = useState('1');
  const [regularCount, setRegularCount] = useState('');
  const [regularStartDate, setRegularStartDate] = useState('');
  const [dueFormError, setDueFormError] = useState('');

  const editingCategory = editingId ? categories.find((item) => item.id === editingId) ?? null : null;
  const editingLockedCategory = editingCategory ? (LOCKED_CATEGORY_IDS as readonly string[]).includes(editingCategory.id) : false;
  const activeCategory = useMemo(() => categories.find((item) => item.id === activeTab) ?? null, [activeTab, categories]);
  const activeCategorySupportsRegular = activeCategory?.id === REGULAR_DUE_CATEGORY_ID;
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
        const derivedUnitArea = selectedUnit?.area ?? 0;
        const derivedParkingArea = assignedParking.reduce((sum, unit) => sum + (unit.area ?? 0), 0);
        const derivedTotalArea = derivedUnitArea + derivedParkingArea;

        if (!mounted) return;

        setDraftId(id);
        initialSnapshotRef.current = JSON.stringify({
          ...normalizeFinancialPayload(financialData),
          unitArea: String(derivedUnitArea),
          parkingArea: String(derivedParkingArea),
          totalArea: String(derivedTotalArea),
        });

        setUnitArea(formatArea(derivedUnitArea));
        setParkingArea(formatArea(derivedParkingArea));
        setTotalArea(formatArea(derivedTotalArea));

        if (sourceData) {
          const normalizedSourceData = normalizeFinancialPayload(sourceData);
          setPricingType(sourceData.pricingType);
          setUnitArea(formatArea(derivedUnitArea));
          setParkingArea(formatArea(derivedParkingArea));
          setTotalArea(formatArea(derivedTotalArea));
          setPricePerMeter(sourceData.pricePerMeter ? Number(sourceData.pricePerMeter).toLocaleString('en-US') : '');
          setParkingPricePerMeter(sourceData.parkingPricePerMeter ? Number(sourceData.parkingPricePerMeter).toLocaleString('en-US') : '');
          setFixedTotalAmount(sourceData.fixedTotalAmount ? Number(sourceData.fixedTotalAmount).toLocaleString('en-US') : '');
          setCategories(normalizedSourceData.categories);
          setActiveTab(normalizedSourceData.activeTab || normalizedSourceData.categories[0]?.id || 'advance');
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

  const meteredTotal = getMeteredTotal(parseNum(unitArea), parseNum(parkingArea), parseNum(pricePerMeter), parseNum(parkingPricePerMeter));
  const totalContractAmount = pricingType === 'metered' ? meteredTotal : parseNum(fixedTotalAmount);

  const overall = useMemo(
    () => ({
      cap: categories.reduce((sum, item) => sum + item.capAmount, 0),
    }),
    [categories],
  );

  const overContractAmount = totalContractAmount > 0 && overall.cap > totalContractAmount;
  const visibleDueItems = useMemo(() => dueItems.filter((item) => item.categoryId === activeTab), [activeTab, dueItems]);
  const regularInstallmentCount = Number(regularCount);
  const regularIntervalPeriod = Math.max(Number(regularPeriod) || 1, 1);
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
    unitArea: String(parseNum(unitArea)),
    parkingArea: String(parseNum(parkingArea)),
    totalArea: String(parseNum(totalArea)),
    pricePerMeter: String(parseNum(pricePerMeter)),
    parkingPricePerMeter: String(parseNum(parkingPricePerMeter)),
    fixedTotalAmount: String(parseNum(fixedTotalAmount)),
    activeTab,
    categories: categories.map((item) => normalizeCategory(item)),
    dueItems,
  });

  const persistCurrentStep = async () => {
    if (!draftId) return false;

    const payload = buildPayload();
    const validation = validateFinancialStep(payload);

    if (!validation.valid) {
      setFormError(validation.errors.categoriesTotal ?? validation.errors.fixedTotalAmount ?? validation.errors.totalArea ?? validation.errors.pricePerMeter ?? validation.errors.parkingPricePerMeter ?? 'اطلاعات مالی معتبر نیست.');
      return false;
    }

    setSaving(true);
    setFormError('');
    try {
      await saveStepData(draftId, 'financial', payload);
      initialSnapshotRef.current = JSON.stringify(payload);
      clearFrontendStepDraft(draftId, 'financial');
      setDirty(false);
      dispatchContractFlowDirty(stepId as 'financial', false);
      dispatchContractFlowSaved(stepId as 'financial');
      return true;
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'ثبت اطلاعات مالی انجام نشد.');
      return false;
    } finally {
      setSaving(false);
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

  const maybeWarnOnExcess = (nextCategories: FinancialCategory[], nextActiveTab: string) => {
    const nextTotal = nextCategories.reduce((sum, item) => sum + item.capAmount, 0);
    if (totalContractAmount > 0 && nextTotal > totalContractAmount) {
      setPendingCategoryApply({
        categories: nextCategories,
        activeTab: nextActiveTab,
      });
      return false;
    }

    return true;
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
    const nextCategory: FinancialCategory = {
      id: editingId ?? `custom-${Date.now()}`,
      name,
      capAmount: amount,
      dueAmount: editingLockedCategory ? (editingCategory?.requiresDue === false ? 0 : amount) : amount,
      noDueAmount: editingLockedCategory && editingCategory?.requiresDue === false ? amount : 0,
      system: Boolean(editingLockedCategory),
      requiresDue: editingLockedCategory ? editingCategory?.requiresDue !== false : true,
    };

    const nextCategories = orderCategories(editingId
      ? categories.map((item) => (item.id === editingId ? nextCategory : item))
      : [...categories, nextCategory]);

    if (!maybeWarnOnExcess(nextCategories, nextCategory.id)) return;

    setCategories(nextCategories);
    setActiveTab(nextCategory.id);
    setCatDialogOpen(false);
  };

  const deleteCategory = (categoryId: string) => {
    if ((LOCKED_CATEGORY_IDS as readonly string[]).includes(categoryId)) return;

    const nextCategories = orderCategories(categories.filter((item) => item.id !== categoryId));
    setCategories(nextCategories);
    setDueItems((current) => current.filter((item) => item.categoryId !== categoryId));
    if (activeTab === categoryId) {
      setActiveTab(nextCategories[0]?.id ?? 'advance');
    }
    setOpenMenuId(null);
    setOpenInfoId(null);
  };

  const updateCategoryAmount = (categoryId: string, value: string) => {
    const amount = parseNum(value);
    const nextCategories = orderCategories(categories.map((item) =>
      item.id === categoryId
        ? normalizeCategory({
            ...item,
            capAmount: amount,
          })
        : item,
    ));

    setCategories(nextCategories);
  };

  const openDueForCategory = (categoryId: string) => {
    setActiveTab(categoryId);
    setEditingDueId(null);
    setDueMode('irregular');
    setDueTag('');
    setDueTitle('');
    setDueAmount('');
    setDueDate('');
    setRegularFrequency('monthly');
    setRegularPeriod('1');
    setRegularCount('');
    setRegularStartDate('');
    setDueFormError('');
    setDueDialogOpen(true);
  };

  const openEditDueItem = (item: DueItem) => {
    setActiveTab(item.categoryId);
    setEditingDueId(item.id);
    setDueMode('irregular');
    const category = categories.find((entry) => entry.id === item.categoryId) ?? null;
    const parsedTaggedTitle = category && !category.system ? splitTaggedTitle(item.title) : { dueTag: '', dueTitle: item.title };
    setDueTag(parsedTaggedTitle.dueTag);
    setDueTitle(parsedTaggedTitle.dueTitle);
    setDueAmount(item.amount ? item.amount.toLocaleString('en-US') : '');
    setDueDate(item.dueDate);
    setRegularFrequency('monthly');
    setRegularPeriod('1');
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
      setDueFormError('مبلغ سررسید باید بیشتر از صفر باشد.');
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
        setDueFormError('تعداد اقساط منظم را وارد کنید.');
        return;
      }

      if (!regularStartDate.trim()) {
        setDueFormError('تاریخ شروع اقساط منظم را وارد کنید.');
        return;
      }

      const generatedItems = buildRegularDueItems({
        activeTab,
        title: finalDueTitle,
        totalAmount: parseNum(dueAmount),
        count,
        startDate: regularStartDate,
        frequency: regularFrequency,
        period: regularIntervalPeriod,
      });

      if (generatedItems.some((item) => !item.dueDate)) {
        setDueFormError('تاریخ شروع اقساط معتبر نیست.');
        return;
      }

      setDueItems((current) => [...current, ...generatedItems]);
    }

    setDueMode('irregular');
    setEditingDueId(null);
    setDueTag('');
    setDueTitle('');
    setDueAmount('');
    setDueDate('');
    setRegularFrequency('monthly');
    setRegularPeriod('1');
    setRegularCount('');
    setRegularStartDate('');
    setDueFormError('');
    setDueDialogOpen(false);
  };

  useEffect(() => {
    if (loading) return;

    const payload = buildPayload();
    const snapshot = JSON.stringify(payload);
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
  }, [activeTab, categories, draftId, dueItems, fixedTotalAmount, loading, parkingArea, parkingPricePerMeter, pricePerMeter, pricingType, stepId, totalArea, unitArea]);

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
    const saved = await persistCurrentStep();
    if (saved) {
      setIsLeaving(true);
      router.push(basePath);
    }
  };

  if (loading) {
    return <ContractStepLoader title={title} description="در حال بارگذاری اطلاعات مالی قرارداد..." />;
  }

  return (
    <div className="space-y-5">
      {!embedded ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">مدل قیمت‌گذاری، جمع مالی و دسته‌بندی‌های مالی قرارداد را در این بخش مدیریت کنید.</p>
        </div>
        <button type="button" onClick={() => requestNavigation(basePath)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          بازگشت به مراحل
        </button>
      </div> : null}

      <FinancialPricingBox
        pricingType={pricingType}
        onPricingTypeChange={setPricingType}
        totalArea={totalArea}
        unitArea={unitArea}
        parkingArea={parkingArea}
        pricePerMeter={pricePerMeter}
        onPricePerMeterChange={setPricePerMeter}
        parkingPricePerMeter={parkingPricePerMeter}
        onParkingPricePerMeterChange={setParkingPricePerMeter}
        fixedTotalAmount={fixedTotalAmount}
        onFixedTotalAmountChange={setFixedTotalAmount}
        meteredTotal={meteredTotal}
        formatInput={formatInput}
        formatMoney={formatMoney}
      />

      {formError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <FinancialPaymentFlow
        categories={categories}
        lockedCategoryIds={LOCKED_CATEGORY_IDS}
        categoryDueItemsMap={categoryDueItemsMap}
        onCategoryAmountChange={updateCategoryAmount}
        onOpenAddCategory={openAdd}
        onOpenEditCategory={openEdit}
        onDeleteCategory={deleteCategory}
        onOpenDueDialog={openDueForCategory}
        onEditDueItem={openEditDueItem}
        onDeleteDueItem={(id) => setDueItems((current) => current.filter((dueItem) => dueItem.id !== id))}
        formatInput={formatInput}
        formatMoney={formatMoney}
      />

      <StickySubmitBar
        label="ثبت اطلاعات مالی"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
      />

      <Modal
        open={Boolean(pendingNavigation)}
        onClose={() => setPendingNavigation(null)}
        title="خروج از صفحه مالی"
        description="اطلاعات این مرحله تغییر کرده است. قبل از خروج تصمیم بگیرید با این تغییرات چه شود."
        footer={
          <>
            <button type="button" onClick={() => setPendingNavigation(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              ماندن در صفحه
            </button>
            <button
              type="button"
              onClick={() => pendingNavigation && continueNavigation(pendingNavigation)}
              className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              خروج بدون ذخیره
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!pendingNavigation) return;
                const saved = await persistCurrentStep();
                if (saved) {
                  continueNavigation(pendingNavigation);
                }
              }}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              ذخیره و خروج
            </button>
          </>
        }
      >
        <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          اگر از این صفحه خارج شوید و ذخیره نکنید، تغییرات اطلاعات مالی از بین می‌رود.
        </div>
      </Modal>

      <Modal
        open={catDialogOpen}
        onClose={() => setCatDialogOpen(false)}
        title={editingId ? 'ویرایش ردیف مالی' : 'افزودن ردیف مالی'}
        panelClassName="!max-w-[320px]"
        footerClassName="justify-start border-gray-100 px-5 py-3"
        footer={
          <>
            <button type="button" onClick={() => setCatDialogOpen(false)} className="px-1 py-1 text-sm font-bold text-[#0e989d] transition hover:text-[#0b7f84]">
              لغو
            </button>
            <button type="button" onClick={submitCategory} className="px-1 py-1 text-sm font-bold text-[#0e989d] transition hover:text-[#0b7f84]">
              ثبت
            </button>
          </>
        }
      >
        {editingLockedCategory ? (
          <div>
            <FieldLabel label="دسته‌بندی ردیف" />
            <div className="mt-2 flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700">
              {editingCategory?.name}
            </div>
          </div>
        ) : (
          <div>
            <FieldLabel label="نام دسته‌بندی" />
            <Input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="مثال: انشعابات آب" className="mt-2" />
          </div>
        )}

        <div>
          <FieldLabel label="سقف مبلغ" />
          <Input value={capAmount} onChange={(event) => setCapAmount(formatInput(event.target.value))} placeholder="مثال: 10,000,000" className="mt-2" />
        </div>
      </Modal>

      <Modal
        open={Boolean(pendingCategoryApply)}
        onClose={() => setPendingCategoryApply(null)}
        title="مغایرت مبلغ"
        description="جمع ردیف‌های مالی از مبلغ قرارداد بیشتر شده است."
        footer={
          <>
            <button
              type="button"
              onClick={() => setPendingCategoryApply(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={() => {
                if (!pendingCategoryApply) return;
                setCategories(pendingCategoryApply.categories);
                setActiveTab(pendingCategoryApply.activeTab);
                setPendingCategoryApply(null);
                setCatDialogOpen(false);
              }}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              ادامه
            </button>
          </>
        }
      >
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          یا مبلغ قرارداد را اصلاح کنید، یا با آگاهی ادامه دهید. در زمان ثبت نهایی اگر این مغایرت باقی بماند، ذخیره انجام نمی‌شود.
        </div>
      </Modal>

      <Modal
        open={dueDialogOpen}
        onClose={() => {
          setDueDialogOpen(false);
          setEditingDueId(null);
          setDueTag('');
          setDueFormError('');
        }}
        title={editingDueId ? 'ویرایش سررسید' : 'ثبت سررسید'}
        description={`سررسید برای ${categories.find((item) => item.id === activeTab)?.name ?? 'دسته‌بندی فعال'} ثبت می‌شود.`}
        panelClassName="!max-w-[27vw]"
        footerClassName="justify-start border-gray-100 px-5 py-3"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDueDialogOpen(false);
                setEditingDueId(null);
                setDueTag('');
                setDueFormError('');
              }}
              className="px-1 py-1 text-sm font-bold text-[#0e989d] transition hover:text-[#0b7f84]"
            >
              لغو
            </button>
            <button type="button" onClick={submitDue} className="px-1 py-1 text-sm font-bold text-[#0e989d] transition hover:text-[#0b7f84]">
              {editingDueId ? 'ذخیره تغییرات' : 'ثبت'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {activeCategorySupportsRegular ? (
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel label="نوع سررسید" />
                <TwoOptionSwitch<DueMode>
                  value={dueMode}
                  onChange={setDueMode}
                  onValue="regular"
                  offValue="irregular"
                  onText="منظم"
                  offText="نامنظم"
                  disabled={Boolean(editingDueId)}
                />
              </div>
            </section>
          ) : null}

          <section className="space-y-3 border-t border-gray-100 pt-4">
            <div className="text-[13px] font-bold text-gray-800">اطلاعات اصلی</div>
            <div className="grid gap-3">
              {activeCategoryIsCustom ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                  <FieldLabel label="تگ" />
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
                  placeholder={activeCategorySupportsRegular && dueMode === 'regular' ? 'مثال: اقساط ماهانه' : 'مثال: انشعابات آب'}
                  className="mt-2 h-10 rounded-lg border-gray-200 bg-[#fcfdfd] px-3 text-[13px]"
                />
              </div>

              <div>
                <FieldLabel label={activeCategorySupportsRegular && dueMode === 'regular' ? 'مبلغ کل اقساط' : 'مبلغ'} />
                <div className="relative mt-2">
                  <Input
                    value={dueAmount}
                    onChange={(event) => setDueAmount(formatInput(event.target.value))}
                    placeholder={activeCategorySupportsRegular && dueMode === 'regular' ? 'مبلغ کل را وارد کنید' : 'مبلغ سررسید'}
                    className="h-10 rounded-lg border-gray-200 bg-[#fcfdfd] pr-3 pl-12 text-[13px]"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-gray-400">تومان</span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[13px] font-bold text-gray-800">{activeCategorySupportsRegular && dueMode === 'regular' ? 'زمان‌بندی اقساط' : 'زمان سررسید'}</div>
              {activeCategorySupportsRegular && dueMode === 'regular' ? (
                <TagPills<DueFrequency>
                  value={regularFrequency}
                  onChange={setRegularFrequency}
                  options={[
                    { value: 'monthly', label: 'ماهانه' },
                    { value: 'daily', label: 'روزانه' },
                  ]}
                />
              ) : null}
            </div>

            {!activeCategorySupportsRegular || dueMode === 'irregular' ? (
              <DateField label="تاریخ سررسید" value={dueDate} onChange={setDueDate} placeholder="تاریخ سررسید را انتخاب کنید" />
            ) : (
              <>
                <div className="grid gap-3">
                  <div>
                    <FieldLabel label={`دوره اقساط ${regularFrequency === 'monthly' ? 'ماهانه' : 'روزانه'}`} />
                    <Input
                      value={regularPeriod}
                      onChange={(event) => setRegularPeriod(event.target.value.replace(/\D/g, ''))}
                      placeholder={regularFrequency === 'monthly' ? 'مثال: 1 ماه' : 'مثال: 7 روز'}
                      className="mt-2 h-10 rounded-lg border-gray-200 bg-white px-3 text-[13px]"
                    />
                  </div>
                  <div>
                    <FieldLabel label={regularFrequency === 'monthly' ? 'تعداد اقساط ماهانه' : 'تعداد اقساط روزانه'} />
                    <Input
                      value={regularCount}
                      onChange={(event) => setRegularCount(event.target.value.replace(/\D/g, ''))}
                      placeholder="مثال: 6"
                      className="mt-2 h-10 rounded-lg border-gray-200 bg-white px-3 text-[13px]"
                    />
                  </div>
                  <DateField
                    label={`شروع اقساط ${regularFrequency === 'monthly' ? 'ماهانه' : 'روزانه'}`}
                    value={regularStartDate}
                    onChange={setRegularStartDate}
                    placeholder="تاریخ شروع را انتخاب کنید"
                  />
                  <div>
                    <FieldLabel label="پایان اقساط" />
                    <div className="mt-2 flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-[13px] text-gray-600">
                      {regularEndDate}
                    </div>
                  </div>
                  <div>
                    <FieldLabel label="مبلغ هر قسط" />
                    <div className="mt-2 flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-[13px] font-medium text-teal-700">
                      {regularPreviewAmounts.length ? formatMoney(regularPreviewAmounts[0]) : 'بعد از تعیین مبلغ و تعداد'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f6f7f4] px-3 py-2 text-xs text-gray-500">
                  <span>{`فاصله ثبت اقساط: هر ${regularIntervalPeriod} ${regularFrequency === 'monthly' ? 'ماه' : 'روز'}`}</span>
                  <span>{regularInstallmentCount > 0 ? `${regularInstallmentCount} سررسید` : 'تعداد سررسید نامشخص'}</span>
                </div>
              </>
            )}
          </section>

          {dueFormError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{dueFormError}</div> : null}
        </div>
      </Modal>
    </div>
  );
}
