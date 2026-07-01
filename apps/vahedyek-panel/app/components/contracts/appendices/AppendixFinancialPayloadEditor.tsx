'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, X } from 'lucide-react';
import { Input, PersianDatePicker } from '@repo/ui';
import { FinancialPaymentFlow } from '../../../(panel)/contracts/new/_components/FinancialPaymentFlow';
import { FieldLabel } from '../../../(panel)/contracts/new/_components/FieldLabel';
import { TagPills } from '../../../(panel)/contracts/new/_components/ContractFormPrimitives';
import { addIntervalToDate, buildRegularDueItems, type DueFrequency } from '../../../lib/financialUtils';
import {
  APPENDIX_ADJUSTMENT_TITLE,
  APPENDIX_CONTRACT_BASE_TITLE,
  type SupportedAppendixPayload,
} from '../../../lib/appendixPayloads';
import {
  buildDueTitle,
  buildFinancialLineCategories,
  createFinancialLineId,
  FINANCIAL_SUB_CATEGORY_IDS,
  formatMoneyInput,
  formatMoneyLabel,
  parseMoneyInput,
  REGULAR_DUE_CATEGORY_ID,
  splitTaggedTitle,
} from '../../../lib/financialLineShared';
import type {
  AppendixAdjustmentPayload,
  AppendixContractBaseCostsPayload,
  AppendixSideCostsPayload,
  FinancialCategoryData,
  FinancialDueItemData,
} from '../../../types/contract';

type DueMode = 'irregular' | 'regular';
type EditorMode = 'adjustment' | 'contract-base-costs' | 'side-costs';
type FinancialPayload = AppendixAdjustmentPayload | AppendixContractBaseCostsPayload | AppendixSideCostsPayload;

function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-[8px] border border-slate-200 bg-white shadow-2xl"
        dir="rtl"
        lang="fa"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-slate-50 text-slate-600"
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-right text-[18px] font-black text-slate-900">{title}</div>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

function TwoOptionSwitch<T extends string>({
  value,
  onChange,
  onValue,
  offValue,
  onText,
  offText,
}: {
  value: T;
  onChange: (value: T) => void;
  onValue: T;
  offValue: T;
  onText: string;
  offText: string;
}) {
  const checked = value === onValue;

  return (
    <button type="button" className="business-switch financial-due-switch" aria-pressed={checked} onClick={() => onChange(checked ? offValue : onValue)}>
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
        <PersianDatePicker value={value} onChange={onChange} placeholder={placeholder} containerClassName="w-full" />
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function buildCategoryDueItemsMap(dueItems: FinancialDueItemData[]) {
  return dueItems.reduce<Record<string, FinancialDueItemData[]>>((acc, item) => {
    acc[item.categoryId] = [...(acc[item.categoryId] ?? []), item];
    return acc;
  }, {});
}

function getLockedCategoryIds(mode: EditorMode, categories: FinancialCategoryData[]) {
  if (mode === 'contract-base-costs') {
    return FINANCIAL_SUB_CATEGORY_IDS.map((subId) => subId);
  }

  return categories
    .filter((item) => item.id.includes(':'))
    .map((item) => item.id);
}

function getEditorCopy(mode: EditorMode) {
  if (mode === 'adjustment') {
    return {
      title: 'تعدیل',
      description: 'ردیف مالی ثابت «تعدیل» را مدیریت کنید. نام این ردیف ثابت است و فقط مبلغ و سررسیدهای زیرردیف‌های آن قابل ثبت هستند.',
      fixedLineLabel: APPENDIX_ADJUSTMENT_TITLE,
      dueModalTitleCreate: 'ثبت سررسید تعدیل',
      dueModalTitleEdit: 'ویرایش سررسید تعدیل',
      duePlaceholder: 'مثال: تعدیل مرحله اول',
    };
  }

  if (mode === 'contract-base-costs') {
    return {
      title: 'هزینه های اصل قرارداد',
      description: 'ردیف مالی اصل قرارداد و سررسیدهای بخش‌های پرداخت اصلی را در این تب مدیریت کنید.',
      fixedLineLabel: APPENDIX_CONTRACT_BASE_TITLE,
      dueModalTitleCreate: 'ثبت سررسید اصل قرارداد',
      dueModalTitleEdit: 'ویرایش سررسید اصل قرارداد',
      duePlaceholder: 'مثال: قسط اول اصل قرارداد',
    };
  }

  return {
    title: 'هزینه های جانبی',
    description: 'همه ردیف‌های مالی جانبی قرارداد و سررسیدهای مرتبط را در این تب مدیریت کنید.',
    fixedLineLabel: '',
    dueModalTitleCreate: 'ثبت سررسید هزینه جانبی',
    dueModalTitleEdit: 'ویرایش سررسید هزینه جانبی',
    duePlaceholder: 'مثال: انشعاب آب',
  };
}

export function AppendixFinancialPayloadEditor({
  mode,
  value,
  onChange,
}: {
  mode: EditorMode;
  value: FinancialPayload;
  onChange: (value: SupportedAppendixPayload) => void;
}) {
  const copy = getEditorCopy(mode);
  const [categories, setCategories] = useState<FinancialCategoryData[]>(value.categories);
  const [dueItems, setDueItems] = useState<FinancialDueItemData[]>(value.dueItems);
  const [activeTab, setActiveTab] = useState(value.activeTab);
  const [expandedRootId, setExpandedRootId] = useState<string | null>(mode === 'contract-base-costs' ? null : value.categories[0]?.id ?? null);
  const [dueDialogOpen, setDueDialogOpen] = useState(false);
  const [editingDueId, setEditingDueId] = useState<string | null>(null);
  const [dueMode, setDueMode] = useState<DueMode>('irregular');
  const [dueTitle, setDueTitle] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [regularFrequency, setRegularFrequency] = useState<DueFrequency>('monthly');
  const [regularPeriod, setRegularPeriod] = useState('1');
  const [regularCount, setRegularCount] = useState('');
  const [regularStartDate, setRegularStartDate] = useState('');
  const [dueFormError, setDueFormError] = useState('');
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [lineTitle, setLineTitle] = useState('');
  const [lineFormError, setLineFormError] = useState('');

  useEffect(() => {
    setCategories(value.categories);
    setDueItems(value.dueItems);
    setActiveTab(value.activeTab);
  }, [value]);

  useEffect(() => {
    onChange({
      activeTab,
      categories,
      dueItems,
    });
  }, [activeTab, categories, dueItems, onChange]);

  const categoryDueItemsMap = useMemo(() => buildCategoryDueItemsMap(dueItems), [dueItems]);
  const activeCategory = useMemo(() => categories.find((item) => item.id === activeTab) ?? null, [activeTab, categories]);
  const activeCategorySupportsRegular =
    activeCategory?.id === REGULAR_DUE_CATEGORY_ID || Boolean(activeCategory?.id.endsWith(`:${REGULAR_DUE_CATEGORY_ID}`));
  const principal = useMemo(() => categories.find((item) => item.id === 'principal') ?? null, [categories]);
  const principalAmount = Number(principal?.capAmount ?? 0);
  const lockedCategoryIds = useMemo(() => getLockedCategoryIds(mode, categories), [categories, mode]);
  const hasFixedLineLabel = Boolean(copy.fixedLineLabel && mode === 'adjustment');

  const openDueForCategory = (categoryId: string) => {
    setActiveTab(categoryId);
    setEditingDueId(null);
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
  };

  const openEditDueItem = (item: FinancialDueItemData) => {
    setActiveTab(item.categoryId);
    setEditingDueId(item.id);
    setDueMode('irregular');
    const parsed = splitTaggedTitle(item.title);
    setDueTitle(parsed.dueTitle);
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
    if (!activeCategory) return;
    if (parseMoneyInput(dueAmount) <= 0) {
      setDueFormError('مبلغ سررسید باید بیشتر از صفر باشد.');
      return;
    }

    const finalDueTitle = buildDueTitle(activeCategory, dueTitle, '');
    if (!finalDueTitle.trim()) {
      setDueFormError('عنوان سررسید را وارد کنید.');
      return;
    }

    if (dueMode === 'irregular' || !activeCategorySupportsRegular) {
      if (!dueDate.trim()) {
        setDueFormError('تاریخ سررسید را وارد کنید.');
        return;
      }

      const nextItem: FinancialDueItemData = {
        id: editingDueId ?? `due-${Date.now()}`,
        categoryId: activeTab,
        title: finalDueTitle,
        amount: parseMoneyInput(dueAmount),
        dueDate,
      };
      setDueItems((current) => (editingDueId ? current.map((item) => (item.id === editingDueId ? nextItem : item)) : [...current, nextItem]));
      setDueDialogOpen(false);
      return;
    }

    const count = Math.max(Number(regularCount) || 0, 0);
    if (count <= 0) {
      setDueFormError('تعداد اقساط را وارد کنید.');
      return;
    }
    if (!regularStartDate.trim()) {
      setDueFormError('تاریخ شروع را مشخص کنید.');
      return;
    }

    const nextItems = buildRegularDueItems({
      activeTab,
      title: finalDueTitle,
      totalAmount: parseMoneyInput(dueAmount),
      count,
      startDate: regularStartDate,
      frequency: regularFrequency,
      period: Math.max(Number(regularPeriod) || 1, 1),
      idPrefix: editingDueId ?? `due-${Date.now()}`,
    });

    setDueItems((current) => [...current.filter((item) => !item.id.startsWith(editingDueId ?? '___none___')), ...nextItems]);
    setDueDialogOpen(false);
  };

  const openAddLine = () => {
    setEditingLineId(null);
    setLineTitle('');
    setLineFormError('');
    setLineModalOpen(true);
  };

  const openEditLine = (category: FinancialCategoryData) => {
    setEditingLineId(category.id);
    setLineTitle(category.name);
    setLineFormError('');
    setLineModalOpen(true);
  };

  const submitLine = () => {
    const title = lineTitle.trim();
    if (!title) {
      setLineFormError('عنوان ردیف مالی را وارد کنید.');
      return;
    }

    if (editingLineId) {
      setCategories((current) => current.map((item) => (item.id === editingLineId ? { ...item, name: title } : item)));
      setLineModalOpen(false);
      return;
    }

    const lineId = createFinancialLineId(`appendix-side-cost-${Date.now()}`);
    const nextCategories = buildFinancialLineCategories({ lineId, title });
    setCategories((current) => [...current, ...nextCategories]);
    setExpandedRootId(lineId);
    setActiveTab(`${lineId}:advance`);
    setLineModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <FinancialPaymentFlow
        categories={categories}
        lockedCategoryIds={lockedCategoryIds}
        categoryDueItemsMap={categoryDueItemsMap}
        principalAmount={principalAmount}
        principalEditable={mode === 'contract-base-costs'}
        principalExpanded={true}
        onTogglePrincipal={() => {}}
        onPrincipalAmountChange={(rawValue) => {
          const amount = parseMoneyInput(rawValue);
          setCategories((current) =>
            current.map((item) =>
              item.id === 'principal'
                ? {
                    ...item,
                    capAmount: amount,
                    dueAmount: 0,
                    noDueAmount: amount,
                  }
                : item,
            ),
          );
        }}
        expandedCustomCategoryId={expandedRootId}
        onToggleCustomCategory={(categoryId) => setExpandedRootId((current) => (current === categoryId ? null : categoryId))}
        onCategoryAmountChange={(categoryId, rawValue) => {
          const amount = parseMoneyInput(rawValue);
          setCategories((current) =>
            current.map((item) =>
              item.id === categoryId
                ? {
                    ...item,
                    capAmount: amount,
                    dueAmount: item.requiresDue ? amount : 0,
                    noDueAmount: item.requiresDue ? 0 : amount,
                  }
                : item,
            ),
          );
        }}
        onOpenAddCategory={openAddLine}
        onOpenEditCategory={openEditLine}
        onDeleteCategory={(categoryId) => {
          setCategories((current) => current.filter((item) => item.id !== categoryId && !item.id.startsWith(`${categoryId}:`)));
          setDueItems((current) => current.filter((item) => item.categoryId !== categoryId && !item.categoryId.startsWith(`${categoryId}:`)));
          if (expandedRootId === categoryId) setExpandedRootId(null);
        }}
        onOpenDueDialog={openDueForCategory}
        onEditDueItem={openEditDueItem}
        onDeleteDueItem={(dueItemId) => setDueItems((current) => current.filter((item) => item.id !== dueItemId))}
        formatInput={formatMoneyInput}
        formatMoney={formatMoneyLabel}
        showPrincipalSection={mode === 'contract-base-costs'}
        showAdditionalCostsSection={mode !== 'contract-base-costs'}
        showRootCategoryActions={mode === 'side-costs'}
        showAddCategoryButton={mode === 'side-costs'}
        additionalSectionTitle={copy.title}
        additionalSectionDescription={copy.description}
      />

      {hasFixedLineLabel ? (
        <div className="rounded-[8px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-[12px] font-semibold text-slate-600">
          نام این ردیف مالی ثابت است: <span className="font-black text-slate-900">{copy.fixedLineLabel}</span>
        </div>
      ) : null}

      {mode === 'side-costs' ? (
        <div className="rounded-[8px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-[12px] font-semibold text-slate-600">
          برای افزودن ردیف جدید از دکمه <span className="font-black text-slate-900">افزودن ردیف مالی</span> استفاده کنید.
        </div>
      ) : null}

      <Modal
        open={dueDialogOpen}
        onClose={() => setDueDialogOpen(false)}
        title={editingDueId ? copy.dueModalTitleEdit : copy.dueModalTitleCreate}
        footer={
          <>
            <button type="button" onClick={() => setDueDialogOpen(false)} className="rounded-[8px] border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              انصراف
            </button>
            <button type="button" onClick={submitDue} className="rounded-[8px] bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] px-4 py-2 text-sm font-bold text-white">
              ثبت
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {activeCategorySupportsRegular ? (
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel label="نوع سررسید" />
                <TwoOptionSwitch<DueMode> value={dueMode} onChange={setDueMode} onValue="regular" offValue="irregular" onText="منظم" offText="تکی" />
              </div>
            </section>
          ) : null}

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <div className="text-[13px] font-bold text-slate-800">اطلاعات اصلی</div>
            <div className="grid gap-3">
              <div>
                <FieldLabel label="عنوان سررسید" />
                <Input
                  value={dueTitle}
                  onChange={(event) => setDueTitle(event.target.value)}
                  placeholder={activeCategorySupportsRegular && dueMode === 'regular' ? 'مثال: اقساط منظم' : copy.duePlaceholder}
                  className="mt-2 h-10 rounded-[8px] border-gray-200 bg-[#fcfdfd] px-3 text-[13px]"
                />
              </div>

              <div>
                <FieldLabel label={activeCategorySupportsRegular && dueMode === 'regular' ? 'مبلغ کل اقساط' : 'مبلغ'} />
                <div className="relative mt-2">
                  <Input
                    value={dueAmount}
                    onChange={(event) => setDueAmount(formatMoneyInput(event.target.value))}
                    placeholder="مبلغ را وارد کنید"
                    className="h-10 rounded-[8px] border-gray-200 bg-[#fcfdfd] pr-3 pl-12 text-[13px]"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-gray-400">تومان</span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[13px] font-bold text-slate-800">{activeCategorySupportsRegular && dueMode === 'regular' ? 'زمان‌بندی اقساط' : 'زمان سررسید'}</div>
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
              <div className="grid gap-3">
                <div>
                  <FieldLabel label={`دوره اقساط ${regularFrequency === 'monthly' ? 'ماهانه' : 'روزانه'}`} />
                  <Input value={regularPeriod} onChange={(event) => setRegularPeriod(event.target.value.replace(/\D/g, ''))} className="mt-2 h-10 rounded-[8px] border-gray-200 bg-[#fcfdfd] px-3 text-[13px]" />
                </div>
                <div>
                  <FieldLabel label="تعداد اقساط" />
                  <Input value={regularCount} onChange={(event) => setRegularCount(event.target.value.replace(/\D/g, ''))} className="mt-2 h-10 rounded-[8px] border-gray-200 bg-[#fcfdfd] px-3 text-[13px]" />
                </div>
                <DateField label="تاریخ شروع" value={regularStartDate} onChange={setRegularStartDate} placeholder="تاریخ شروع را انتخاب کنید" />
                {regularStartDate && regularCount ? (
                  <div className="rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-semibold text-slate-600">
                    تاریخ آخرین قسط: {addIntervalToDate(regularStartDate, Math.max(Number(regularCount) - 1, 0), regularFrequency, Math.max(Number(regularPeriod) || 1, 1))}
                  </div>
                ) : null}
              </div>
            )}
          </section>

          {dueFormError ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{dueFormError}</div> : null}
        </div>
      </Modal>

      <Modal
        open={lineModalOpen}
        onClose={() => setLineModalOpen(false)}
        title={editingLineId ? 'ویرایش ردیف مالی جانبی' : 'افزودن ردیف مالی جانبی'}
        footer={
          <>
            <button type="button" onClick={() => setLineModalOpen(false)} className="rounded-[8px] border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              انصراف
            </button>
            <button type="button" onClick={submitLine} className="rounded-[8px] bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] px-4 py-2 text-sm font-bold text-white">
              ثبت
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-[8px] border border-slate-200 bg-slate-50/70 px-4 py-3 text-[12px] font-semibold text-slate-600">
            عنوان ردیف مالی را وارد کنید. زیرردیف‌های ساختاری این خط به‌صورت خودکار ساخته می‌شوند.
          </div>
          <div>
            <FieldLabel label="عنوان ردیف مالی" />
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-slate-50 text-slate-600">
                <Plus className="h-4 w-4" />
              </span>
              <Input value={lineTitle} onChange={(event) => setLineTitle(event.target.value)} placeholder="مثال: انشعاب آب" className="h-10 rounded-[8px] border-gray-200 bg-[#fcfdfd] px-3 text-[13px]" />
            </div>
          </div>
          {lineFormError ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{lineFormError}</div> : null}
        </div>
      </Modal>
    </div>
  );
}


