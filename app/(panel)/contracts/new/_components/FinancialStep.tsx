'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CalendarDays, EllipsisVertical, Info, Pencil, Plus, Trash2, X } from 'lucide-react';
import { FormBox } from './FormBox';
import { ChoiceCard } from './ChoiceCard';
import { FieldLabel } from './FieldLabel';
import { StickySubmitBar } from './StickySubmitBar';
import { Input } from '../../../../components/ui/input';
import { PersianDatePicker } from '../../../../components/ui/PersianDatePicker';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import { ensureActiveDraftId, getStepData, saveStepData } from '../../../../lib/contractDraftClient';
import { validateFinancialStep } from '../../../../lib/contractValidation';
import { addIntervalToDate, buildRegularDueItems, distributeAmount, type DueFrequency } from '../../../../lib/financialUtils';
import type { ContractFinancialData, FinancialCategoryData, FinancialDueItemData, PricingType } from '../../../../types/contract';
import { dispatchContractFlowDirty, dispatchContractFlowFinancialSnapshot, dispatchContractFlowSaved } from './contractFlowSignals';

type FinancialCategory = FinancialCategoryData;
type DueItem = FinancialDueItemData;
type DueMode = 'irregular' | 'regular';

const SYSTEM_CATEGORY_OPTIONS = ['پیش پرداخت', 'تحویل سند', 'تحویل واحد', 'اقساط ثابت', 'انشعابات آب'];
const LOCKED_CATEGORY_IDS = ['advance', 'document', 'handover', 'installment'];
const PIE_CHART_COLORS = ['#0f766e', '#14b8a6', '#0ea5e9', '#6366f1', '#f59e0b', '#ef4444', '#84cc16', '#8b5cf6'];

const INITIAL_CATEGORIES: FinancialCategory[] = [
  { id: 'advance', name: 'پیش پرداخت', capAmount: 0, dueAmount: 0, noDueAmount: 0, system: true, requiresDue: true },
  { id: 'document', name: 'تحویل سند', capAmount: 0, dueAmount: 0, noDueAmount: 0, system: true, requiresDue: true },
  { id: 'handover', name: 'تحویل واحد', capAmount: 0, dueAmount: 0, noDueAmount: 0, system: true, requiresDue: true },
  { id: 'installment', name: 'اقساط ثابت', capAmount: 0, dueAmount: 0, noDueAmount: 0, system: true, requiresDue: true },
];

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

function DueModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? 'bg-[#ffa173] text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {children}
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

function SummaryCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="mt-2 text-lg font-bold text-gray-800">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
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
      <div
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl"
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
        <div className="flex justify-end gap-3 border-t border-gray-100 p-4">{footer}</div>
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
  const [pricePerMeter, setPricePerMeter] = useState('');
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
  const [catMode, setCatMode] = useState<'system' | 'custom'>('system');
  const [systemName, setSystemName] = useState(SYSTEM_CATEGORY_OPTIONS[0]);
  const [customName, setCustomName] = useState('');
  const [capAmount, setCapAmount] = useState('');

  const [dueDialogOpen, setDueDialogOpen] = useState(false);
  const [dueMode, setDueMode] = useState<DueMode>('irregular');
  const [dueTitle, setDueTitle] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [regularFrequency, setRegularFrequency] = useState<DueFrequency>('monthly');
  const [regularPeriod, setRegularPeriod] = useState('1');
  const [regularCount, setRegularCount] = useState('');
  const [regularStartDate, setRegularStartDate] = useState('');
  const [dueFormError, setDueFormError] = useState('');

  const editingCategory = editingId ? categories.find((item) => item.id === editingId) ?? null : null;
  const editingLockedCategory = editingCategory ? LOCKED_CATEGORY_IDS.includes(editingCategory.id) : false;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const financialData = await getStepData<ContractFinancialData>(id, 'financial');

        if (!mounted) return;

        setDraftId(id);

        if (financialData) {
          setPricingType(financialData.pricingType);
          setTotalArea(financialData.totalArea ? Number(financialData.totalArea).toLocaleString('en-US') : '');
          setPricePerMeter(financialData.pricePerMeter ? Number(financialData.pricePerMeter).toLocaleString('en-US') : '');
          setFixedTotalAmount(financialData.fixedTotalAmount ? Number(financialData.fixedTotalAmount).toLocaleString('en-US') : '');
          setCategories(
            financialData.categories.length
              ? financialData.categories.map((item) => ({ ...item, requiresDue: true, noDueAmount: 0, dueAmount: item.capAmount }))
              : INITIAL_CATEGORIES,
          );
          setActiveTab(financialData.activeTab || financialData.categories[0]?.id || 'advance');
          setDueItems(financialData.dueItems);
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

  const meteredTotal = parseNum(totalArea) * parseNum(pricePerMeter);
  const totalContractAmount = pricingType === 'metered' ? meteredTotal : parseNum(fixedTotalAmount);

  const overall = useMemo(
    () => ({
      cap: categories.reduce((sum, item) => sum + item.capAmount, 0),
      due: dueItems.reduce((sum, item) => sum + item.amount, 0),
    }),
    [categories, dueItems],
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
    totalArea: String(parseNum(totalArea)),
    pricePerMeter: String(parseNum(pricePerMeter)),
    fixedTotalAmount: String(parseNum(fixedTotalAmount)),
    activeTab,
    categories: categories.map((item) => ({
      ...item,
      requiresDue: true,
      dueAmount: item.capAmount,
      noDueAmount: 0,
    })),
    dueItems,
  });

  const persistCurrentStep = async () => {
    if (!draftId) return false;

    const payload = buildPayload();
    const validation = validateFinancialStep(payload);

    if (!validation.valid) {
      setFormError(validation.errors.categoriesTotal ?? validation.errors.fixedTotalAmount ?? validation.errors.totalArea ?? validation.errors.pricePerMeter ?? 'اطلاعات مالی معتبر نیست.');
      return false;
    }

    setSaving(true);
    setFormError('');
    try {
      await saveStepData(draftId, 'financial', payload);
      initialSnapshotRef.current = JSON.stringify(payload);
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
    setCatMode('system');
    setSystemName(SYSTEM_CATEGORY_OPTIONS[0]);
    setCustomName('');
    setCapAmount('');
    setCatDialogOpen(true);
  };

  const openEdit = (category: FinancialCategory) => {
    setEditingId(category.id);
    setCatMode(category.system ? 'system' : 'custom');
    setSystemName(category.system ? category.name : SYSTEM_CATEGORY_OPTIONS[0]);
    setCustomName(category.system ? '' : category.name);
    setCapAmount(category.capAmount.toLocaleString('en-US'));
    setCatDialogOpen(true);
    setOpenMenuId(null);
  };

  const submitCategory = () => {
    const name = catMode === 'system' ? systemName : customName.trim();
    const amount = parseNum(capAmount);
    const nextCategory: FinancialCategory = {
      id: editingId ?? `custom-${Date.now()}`,
      name,
      capAmount: amount,
      dueAmount: amount,
      noDueAmount: 0,
      system: catMode === 'system',
      requiresDue: true,
    };

    const nextCategories = editingId
      ? categories.map((item) => (item.id === editingId ? nextCategory : item))
      : [...categories, nextCategory];

    if (!maybeWarnOnExcess(nextCategories, nextCategory.id)) return;

    setCategories(nextCategories);
    setActiveTab(nextCategory.id);
    setCatDialogOpen(false);
  };

  const deleteCategory = (categoryId: string) => {
    if (LOCKED_CATEGORY_IDS.includes(categoryId)) return;

    const nextCategories = categories.filter((item) => item.id !== categoryId);
    setCategories(nextCategories);
    setDueItems((current) => current.filter((item) => item.categoryId !== categoryId));
    if (activeTab === categoryId) {
      setActiveTab(nextCategories[0]?.id ?? 'advance');
    }
    setOpenMenuId(null);
    setOpenInfoId(null);
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

    if (dueMode === 'irregular') {
      if (!dueDate.trim()) {
        setDueFormError('تاریخ سررسید را وارد کنید.');
        return;
      }

      setDueItems((current) => [
        ...current,
        {
          id: `due-${Date.now()}`,
          categoryId: activeTab,
          title: dueTitle.trim(),
          amount: parseNum(dueAmount),
          dueDate,
        },
      ]);
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
        title: dueTitle.trim(),
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
    setDirty(hasChanges);
    dispatchContractFlowDirty(stepId as 'financial', hasChanges);
  }, [activeTab, categories, dueItems, fixedTotalAmount, loading, pricePerMeter, pricingType, stepId, totalArea]);

  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    const handlePopState = () => {
      if (!dirty || isLeaving) return;
      window.history.pushState(null, '', window.location.href);
      setPendingNavigation({ mode: 'back' });
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dirty, isLeaving]);

  useEffect(() => {
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
  }, [dirty, isLeaving]);

  useEffect(() => {
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
  }, [dirty, isLeaving]);

  const handleSubmit = async () => {
    const saved = await persistCurrentStep();
    if (saved) {
      setIsLeaving(true);
      router.push(basePath);
    }
  };

  return (
    <div className="space-y-5 rounded-[28px] border border-white/70 bg-[radial-gradient(circle_at_top,#f8fffe,white_45%)] p-1">
      {!embedded ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">مدل قیمت‌گذاری، جمع مالی و دسته‌بندی‌های مالی قرارداد را در این بخش مدیریت کنید.</p>
        </div>
        <button type="button" onClick={() => requestNavigation(basePath)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          بازگشت به مراحل
        </button>
      </div> : null}

      <FormBox title="قیمت‌گذاری قرارداد" description="نوع قیمت‌گذاری قرارداد را مشخص کنید.">
        <div className="grid gap-3 md:grid-cols-2">
          <ChoiceCard title="مقطوع" active={pricingType === 'fixed'} onClick={() => setPricingType('fixed')} />
          <ChoiceCard title="متری" active={pricingType === 'metered'} onClick={() => setPricingType('metered')} />
        </div>

        {pricingType === 'metered' ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div>
              <FieldLabel label="متراژ کل" />
              <Input value={totalArea} onChange={(event) => setTotalArea(formatInput(event.target.value))} placeholder="مثال: 120" className="mt-2" />
            </div>
            <div>
              <FieldLabel label="قیمت هر متر مربع" />
              <Input value={pricePerMeter} onChange={(event) => setPricePerMeter(formatInput(event.target.value))} placeholder="مثال: 450,000" className="mt-2" />
            </div>
            <div>
              <FieldLabel label="قیمت کل محاسبه شده" />
              <div className="mt-2 flex h-10 items-center rounded-md border border-green-300 bg-green-50 px-3.5 text-sm font-semibold text-green-700">
                {formatMoney(meteredTotal)}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 max-w-md">
            <FieldLabel label="مبلغ کل قرارداد" />
            <Input value={fixedTotalAmount} onChange={(event) => setFixedTotalAmount(formatInput(event.target.value))} placeholder="مبلغ کل را وارد کنید" className="mt-2" />
          </div>
        )}
      </FormBox>

      {overContractAmount ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>جمع ردیف‌های مالی از مبلغ قرارداد بیشتر شده است. مبلغ قرارداد را اصلاح کنید؛ در غیر این صورت ثبت اطلاعات مالی انجام نمی‌شود.</div>
        </div>
      ) : null}

      {formError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard title="جمع ردیف‌های مالی" value={formatMoney(overall.cap || totalContractAmount)} />
        <SummaryCard title="جمع سررسیدها" value={formatMoney(overall.due)} />
        <SummaryCard
          title="مبلغ کل قرارداد"
          value={formatMoney(totalContractAmount)}
          hint={pricingType === 'metered' ? 'محاسبه شده از متراژ و نرخ' : 'ثبت شده به صورت مقطوع'}
        />
      </div>

      <FormBox title="دسته‌بندی‌های مالی" description="برای هر دسته‌بندی می‌توانید سقف مبلغ و سررسیدها را مدیریت کنید.">
        <div className="mb-4 space-y-3">
          <FinancialCategoriesPieChart categories={categories} totalContractAmount={totalContractAmount} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => {
              const isLocked = LOCKED_CATEGORY_IDS.includes(category.id);
              const categoryDueItems = categoryDueItemsMap[category.id] ?? [];

              return (
                <div
                  key={category.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveTab(category.id);
                    setOpenMenuId(null);
                  }}
                  onKeyDown={(event) => event.key === 'Enter' && setActiveTab(category.id)}
                  className={`relative cursor-pointer rounded-xl border p-3.5 text-right transition-all ${
                    activeTab === category.id ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">{category.name}</span>
                        {isLocked ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400">سیستمی</span> : null}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{formatMoney(category.capAmount)}</p>
                    </div>

                    <div className="relative flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId(null);
                          setOpenInfoId((current) => (current === category.id ? null : category.id));
                        }}
                        className="rounded-lg p-1 text-sky-500 hover:bg-sky-50"
                        title="جزئیات ردیف مالی"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenInfoId(null);
                          setOpenMenuId((current) => (current === category.id ? null : category.id));
                        }}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                      >
                        <EllipsisVertical className="h-4 w-4" />
                      </button>

                      {openInfoId === category.id ? (
                        <div
                          className="absolute left-0 top-8 z-20 w-72 rounded-xl border border-sky-100 bg-white p-3 shadow-lg"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="border-b border-gray-100 pb-2">
                            <div className="text-sm font-bold text-gray-800">جزئیات ردیف مالی</div>
                            <div className="mt-1 text-xs text-gray-500">{category.name}</div>
                          </div>
                          <div className="space-y-2 pt-3 text-xs text-gray-600">
                            <div className="flex items-center justify-between">
                              <span>سقف مبلغ</span>
                              <span className="font-semibold text-gray-800">{formatMoney(category.capAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>وضعیت ردیف</span>
                              <span className="font-semibold text-gray-800">{isLocked ? 'سیستمی' : 'قابل ویرایش'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>تعداد سررسیدهای داخلی</span>
                              <span className="font-semibold text-gray-800">{categoryDueItems.length}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-2">
                              <div className="mb-2 text-[11px] font-semibold text-gray-500">سررسیدهای داخلی</div>
                              {categoryDueItems.length ? (
                                <div className="space-y-1.5">
                                  {categoryDueItems.map((item) => (
                                    <div key={item.id} className="rounded-lg bg-gray-50 px-2.5 py-2">
                                      <div className="mb-1 text-[11px] font-semibold text-gray-700">{item.title}</div>
                                      <div className="flex items-center justify-between gap-3">
                                        <span>{item.dueDate}</span>
                                        <span className="font-semibold text-teal-700">{formatMoney(item.amount)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-lg border border-dashed border-gray-200 px-2.5 py-3 text-center text-[11px] text-gray-400">
                                  برای این ردیف هنوز سررسیدی ثبت نشده است.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {openMenuId === category.id ? (
                        <div
                          className="absolute left-0 top-8 z-20 min-w-[132px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => openEdit(category)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil className="h-4 w-4" />
                            ویرایش
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCategory(category.id)}
                            disabled={isLocked}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-sm text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={openAdd} className="inline-flex h-10 items-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-4 text-sm font-medium text-teal-700 hover:bg-teal-100">
              <Plus className="h-4 w-4" />
              افزودن ردیف مالی
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-4 flex flex-col gap-3 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-gray-800">{`سررسیدهای ${categories.find((item) => item.id === activeTab)?.name ?? ''}`}</p>
              <p className="mt-0.5 text-xs text-gray-500">فهرست سررسیدها برای دسته‌بندی فعال در این بخش نمایش داده می‌شود.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDueMode('irregular');
                setDueTitle('');
                setDueAmount('');
                setDueDate('');
                setRegularFrequency('monthly');
                setRegularPeriod('1');
                setRegularCount('');
                setRegularStartDate('');
                setDueFormError('');
                setDueDialogOpen(true);
              }}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-4 text-sm font-medium text-teal-700 hover:bg-teal-100"
            >
              <Plus className="h-4 w-4" />
              ثبت سررسید
            </button>
          </div>

          <div className="space-y-3">
            {visibleDueItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-teal-100 bg-white p-3.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">تاریخ: {item.dueDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-teal-700">{formatMoney(item.amount)}</span>
                  <button
                    type="button"
                    onClick={() => setDueItems((current) => current.filter((dueItem) => dueItem.id !== item.id))}
                    className="rounded-lg p-1 text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {!visibleDueItems.length ? (
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                برای این بخش سررسیدی ثبت نشده است.
              </div>
            ) : null}
          </div>
        </div>
      </FormBox>

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
        description="می‌توانید از دسته‌بندی‌های موجود انتخاب کنید یا یک نام جدید بسازید."
        footer={
          <>
            <button type="button" onClick={() => setCatDialogOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              انصراف
            </button>
            <button type="button" onClick={submitCategory} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
              {editingId ? 'ذخیره تغییرات' : 'افزودن'}
            </button>
          </>
        }
      >
        {!editingLockedCategory ? (
          <div className="grid gap-3 md:grid-cols-2">
            <ChoiceCard title="انتخاب از دسته‌بندی موجود" active={catMode === 'system'} onClick={() => setCatMode('system')} />
            <ChoiceCard title="ثبت نام جدید" active={catMode === 'custom'} onClick={() => setCatMode('custom')} />
          </div>
        ) : null}

        {editingLockedCategory ? (
          <div>
            <FieldLabel label="دسته‌بندی ردیف" />
            <div className="mt-2 flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700">
              {editingCategory?.name}
            </div>
          </div>
        ) : catMode === 'system' ? (
          <div>
            <FieldLabel label="دسته‌بندی موجود" />
            <select value={systemName} onChange={(event) => setSystemName(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500">
              {SYSTEM_CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
          setDueFormError('');
        }}
        title="ثبت سررسید"
        description={`سررسید برای ${categories.find((item) => item.id === activeTab)?.name ?? 'دسته‌بندی فعال'} ثبت می‌شود.`}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDueDialogOpen(false);
                setDueFormError('');
              }}
              className="rounded-full border border-teal-500 px-5 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
            >
              بازگشت
            </button>
            <button type="button" onClick={submitDue} className="rounded-full bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700">
              ثبت
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="rounded-[22px] border border-gray-100 bg-[#fcfdfd] p-4 shadow-[0_12px_40px_rgba(15,118,110,0.06)]">
            <div className="flex flex-wrap items-center justify-end gap-3 text-sm font-semibold text-gray-800">
              <span>نوع قسط</span>
              <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
                <DueModeButton active={dueMode === 'irregular'} onClick={() => setDueMode('irregular')}>
                  قسط نامنظم
                </DueModeButton>
                <DueModeButton active={dueMode === 'regular'} onClick={() => setDueMode('regular')}>
                  قسط منظم
                </DueModeButton>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-gray-100 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
            <div className="space-y-3.5">
              <div>
                <FieldLabel label="عنوان" />
                <Input
                  value={dueTitle}
                  onChange={(event) => setDueTitle(event.target.value)}
                  placeholder={dueMode === 'regular' ? 'مثال: اقساط ماهانه' : 'مثال: قسط نامنظم'}
                  className="mt-2 h-11 rounded-full border-gray-200 bg-[#fcfdfd] px-4 text-[13px]"
                />
              </div>

              <div>
                <FieldLabel label={dueMode === 'regular' ? 'مبلغ کل اقساط منظم' : 'مبلغ'} />
                <div className="relative mt-2">
                  <Input
                    value={dueAmount}
                    onChange={(event) => setDueAmount(formatInput(event.target.value))}
                    placeholder={dueMode === 'regular' ? 'مبلغ کل را وارد کنید' : 'مبلغ سررسید'}
                    className="h-11 rounded-full border-gray-200 bg-[#fcfdfd] px-4 text-[13px]"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-sm text-gray-400">تومان</span>
                </div>
              </div>

              {dueMode === 'irregular' ? (
                <DateField label="تاریخ را وارد کنید" value={dueDate} onChange={setDueDate} placeholder="تاریخ سررسید را انتخاب کنید" />
              ) : (
                <div className="space-y-3 rounded-[18px] border border-[#eef4f3] bg-[#fbfdfd] p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-bold text-gray-800">تقسیم‌بندی اقساط</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">بازه زمانی اقساط</span>
                      <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
                        <DueModeButton active={regularFrequency === 'monthly'} onClick={() => setRegularFrequency('monthly')}>
                          ماهانه
                        </DueModeButton>
                        <DueModeButton active={regularFrequency === 'daily'} onClick={() => setRegularFrequency('daily')}>
                          روزانه
                        </DueModeButton>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <FieldLabel label={`دوره اقساط ${regularFrequency === 'monthly' ? 'ماهانه' : 'روزانه'}`} />
                      <Input
                        value={regularPeriod}
                        onChange={(event) => setRegularPeriod(event.target.value.replace(/\D/g, ''))}
                        placeholder={regularFrequency === 'monthly' ? 'مثال: 1 ماه' : 'مثال: 7 روز'}
                        className="mt-2 h-11 rounded-full border-gray-200 bg-white px-4 text-[13px]"
                      />
                    </div>
                    <div>
                      <FieldLabel label={regularFrequency === 'monthly' ? 'تعداد اقساط ماهانه' : 'تعداد اقساط روزانه'} />
                      <Input
                        value={regularCount}
                        onChange={(event) => setRegularCount(event.target.value.replace(/\D/g, ''))}
                        placeholder="مثال: 6"
                        className="mt-2 h-11 rounded-full border-gray-200 bg-white px-4 text-[13px]"
                      />
                    </div>
                    <DateField
                      label={`شروع اقساط ${regularFrequency === 'monthly' ? 'منظم' : 'روزانه'}`}
                      value={regularStartDate}
                      onChange={setRegularStartDate}
                      placeholder="تاریخ شروع را انتخاب کنید"
                    />
                    <div>
                      <FieldLabel label={`پایان اقساط ${regularFrequency === 'monthly' ? 'منظم' : 'روزانه'}`} />
                      <div className="mt-2 flex h-11 items-center rounded-full border border-gray-200 bg-gray-50 px-4 text-[13px] text-gray-600">
                        {regularEndDate || 'با تعیین تعداد و شروع، این تاریخ محاسبه می‌شود'}
                      </div>
                    </div>
                    <div>
                      <FieldLabel label="مبلغ هر قسط" />
                      <div className="mt-2 flex h-11 items-center rounded-full border border-gray-200 bg-gray-50 px-4 text-[13px] font-medium text-teal-700">
                        {regularPreviewAmounts.length ? formatMoney(regularPreviewAmounts[0]) : 'بعد از تعیین مبلغ و تعداد محاسبه می‌شود'}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-teal-100 bg-white px-4 py-3 text-xs text-gray-500">
                    <div className="flex items-center justify-between gap-3">
                      <span>{`فاصله ثبت اقساط: هر ${regularIntervalPeriod} ${regularFrequency === 'monthly' ? 'ماه' : 'روز'}`}</span>
                      <span>{regularInstallmentCount > 0 ? `${regularInstallmentCount} سررسید` : 'تعداد سررسید نامشخص'}</span>
                    </div>
                  </div>
                </div>
              )}

              {dueFormError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{dueFormError}</div> : null}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
