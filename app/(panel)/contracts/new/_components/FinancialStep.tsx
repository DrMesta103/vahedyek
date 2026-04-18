'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Info, MoreVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import { FormBox } from './FormBox';
import { ChoiceCard } from './ChoiceCard';
import { FieldLabel } from './FieldLabel';
import { StickySubmitBar } from './StickySubmitBar';
import { Input } from '../../../../components/ui/input';
import { PersianDatePicker } from '../../../../components/ui/PersianDatePicker';
import jalaali from 'jalaali-js';
import { useContractFlowBasePath } from './useContractFlowBasePath';

// ─── Types ───────────────────────────────────────────────────────────────────

type PricingType = 'fixed' | 'metered';

type FinancialCategory = {
  id: string;
  name: string;
  capAmount: number;
  dueAmount: number;
  noDueAmount: number;
  system: boolean;
  requiresDue: boolean;
};

type DueItem = {
  id: string;
  categoryId: string;
  amount: number;
  dueDate: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const SYSTEM_CATEGORY_OPTIONS = ['پیش پرداخت', 'تحویل سند', 'تحویل واحد', 'اقساط ثابت', 'انشعابات آب'];

// این ۴ ردیف سیستمی هستند و قابل حذف نیستند
const LOCKED_CATEGORY_IDS = ['advance', 'document', 'handover', 'installment'];

const INITIAL_CATEGORIES: FinancialCategory[] = [
  { id: 'advance',     name: 'پیش پرداخت',  capAmount: 0, dueAmount: 0, noDueAmount: 0, system: true, requiresDue: true  },
  { id: 'document',    name: 'تحویل سند',   capAmount: 0, dueAmount: 0, noDueAmount: 0, system: true, requiresDue: true  },
  { id: 'handover',    name: 'تحویل واحد',  capAmount: 0, dueAmount: 0, noDueAmount: 0, system: true, requiresDue: false },
  { id: 'installment', name: 'اقساط ثابت',  capAmount: 0, dueAmount: 0, noDueAmount: 0, system: true, requiresDue: true  },
];

const INITIAL_DUE_ITEMS: DueItem[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Jalali Date Helpers ──────────────────────────────────────────────────────

function parseJalali(str: string): { jy: number; jm: number; jd: number } | null {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const [jy, jm, jd] = parts.map(Number);
  if (!jy || !jm || !jd) return null;
  return { jy, jm, jd };
}

function addMonthsJalali(jy: number, jm: number, jd: number, months: number) {
  let totalMonths = jm - 1 + months;
  const newJy = jy + Math.floor(totalMonths / 12);
  const newJm = (totalMonths % 12) + 1;
  const daysInMonth = jalaali.jalaaliMonthLength(newJy, newJm);
  const newJd = Math.min(jd, daysInMonth);
  return { jy: newJy, jm: newJm, jd: newJd };
}

function addDaysJalali(jy: number, jm: number, jd: number, days: number) {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  const date = new Date(gy, gm - 1, gd + days);
  return jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function formatJalali(jy: number, jm: number, jd: number) {
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

// ─── Category Menu (three dots) ──────────────────────────────────────────────

function CategoryMenu({ onEdit, onDelete, deleteLocked }: { onEdit: () => void; onDelete: () => void; deleteLocked?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-0 top-8 z-30 w-36 rounded-xl border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl"
          >
            <Pencil className="h-3.5 w-3.5 text-gray-400" />
            ویرایش
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            disabled={deleteLocked}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-b-xl disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Category Info Popover ────────────────────────────────────────────────────

function CategoryInfo({ cat, dueItems }: { cat: FinancialCategory; dueItems: DueItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const catDues = dueItems.filter((d) => d.categoryId === cat.id);
  const totalDue = catDues.reduce((s, d) => s + d.amount, 0);
  const remaining = cat.capAmount - totalDue;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-teal-600"
      >
        <Info className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-0 top-8 z-30 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg space-y-2">
          <p className="text-xs font-bold text-gray-700 border-b border-gray-100 pb-2">{cat.name}</p>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">سقف مبلغ</span>
            <span className="font-semibold text-gray-800">{cat.capAmount > 0 ? formatMoney(cat.capAmount) : '—'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">مجموع سررسیدها</span>
            <span className="font-semibold text-teal-700">{totalDue > 0 ? formatMoney(totalDue) : '—'}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-gray-100 pt-2">
            <span className="text-gray-500">مانده</span>
            <span className={`font-bold ${remaining < 0 ? 'text-rose-600' : 'text-gray-800'}`}>
              {cat.capAmount > 0 ? formatMoney(remaining) : '—'}
            </span>
          </div>
          {catDues.length > 0 && (
            <div className="border-t border-gray-100 pt-2 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase">سررسیدها</p>
              {catDues.map((d) => (
                <div key={d.id} className="flex justify-between text-xs">
                  <span className="text-gray-500">{d.dueDate}</span>
                  <span className="font-medium text-gray-700">{formatMoney(d.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="mt-2 text-lg font-bold text-gray-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, description, children, footer }: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h3 className="text-base font-bold text-gray-800">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function FinancialStep({ stepId, title }: { stepId: string; title: string }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();

  // Pricing
  const [pricingType, setPricingType] = useState<PricingType>('fixed');
  const [totalArea, setTotalArea] = useState('');
  const [pricePerMeter, setPricePerMeter] = useState('');
  const [fixedTotalAmount, setFixedTotalAmount] = useState('');

  // Categories
  const [categories, setCategories] = useState<FinancialCategory[]>(INITIAL_CATEGORIES);
  const [activeTab, setActiveTab] = useState('advance');

  // Due items
  const [dueItems, setDueItems] = useState<DueItem[]>(INITIAL_DUE_ITEMS);

  // Category dialog
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catMode, setCatMode] = useState<'system' | 'custom'>('system');
  const [systemName, setSystemName] = useState(SYSTEM_CATEGORY_OPTIONS[0]);
  const [customName, setCustomName] = useState('');
  const [capAmount, setCapAmount] = useState('');
  const [requiresDue, setRequiresDue] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Over-budget alert
  const [overBudgetDialogOpen, setOverBudgetDialogOpen] = useState(false);
  const [overBudgetAmount, setOverBudgetAmount] = useState(0);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<FinancialCategory | null>(null);

  // Due dialog
  const [dueDialogOpen, setDueDialogOpen] = useState(false);
  const [dueMode, setDueMode] = useState<'irregular' | 'regular'>('irregular');
  const [dueAmount, setDueAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueNote, setDueNote] = useState('');
  const [dueNoteCustom, setDueNoteCustom] = useState(false);
  // regular mode
  const [regTotalAmount, setRegTotalAmount] = useState('');
  const [regInterval, setRegInterval] = useState<'monthly' | 'daily'>('monthly');
  const [regPeriod, setRegPeriod] = useState('');
  const [regCount, setRegCount] = useState('');
  const [regStartDate, setRegStartDate] = useState('');
  const [regEndDate, setRegEndDate] = useState('');

  // ─── Computed ──────────────────────────────────────────────────────────────

  const meteredTotal = parseNum(totalArea) * parseNum(pricePerMeter);
  const baseAmount = pricingType === 'metered' ? meteredTotal : parseNum(fixedTotalAmount);
  const totalContractAmount = baseAmount;

  // محاسبه خودکار تاریخ پایان و سررسیدها در حالت منظم
  const computedRegDates = useMemo(() => {
    const start = parseJalali(regStartDate);
    const count = parseInt(regCount) || 0;
    const period = parseInt(regPeriod) || 0;
    if (!start || count <= 0 || period <= 0) return [];
    return Array.from({ length: count }, (_, i) => {
      const n = i + 1;
      const d = regInterval === 'monthly'
        ? addMonthsJalali(start.jy, start.jm, start.jd, n * period)
        : addDaysJalali(start.jy, start.jm, start.jd, n * period);
      return formatJalali(d.jy, d.jm, d.jd);
    });
  }, [regStartDate, regCount, regPeriod, regInterval]);

  const computedEndDate = computedRegDates.length > 0
    ? computedRegDates[computedRegDates.length - 1]
    : '';

  // سقف ردیف فعال
  const activeCatCap = categories.find(c => c.id === activeTab)?.capAmount ?? 0;
  // مجموع سررسیدهای ثبت‌شده برای ردیف فعال
  const existingDueTotal = dueItems.filter(d => d.categoryId === activeTab).reduce((s, d) => s + d.amount, 0);
  const remainingCap = activeCatCap > 0 ? activeCatCap - existingDueTotal : Infinity;

  // validation مبلغ منظم
  const regTotalNum = parseNum(regTotalAmount);
  const regAmountExceeds = activeCatCap > 0 && regTotalNum > remainingCap;

  // validation مبلغ نامنظم
  const dueAmountNum = parseNum(dueAmount);
  const dueAmountExceeds = activeCatCap > 0 && dueAmountNum > remainingCap;

  const overall = useMemo(() => {
    return {
      cap: categories.reduce((s, c) => s + c.capAmount, 0),
      due: categories.reduce((s, c) => s + c.dueAmount, 0),
      noDue: categories.reduce((s, c) => s + c.noDueAmount, 0),
    };
  }, [categories]);

  const visibleDueItems = useMemo(() => {
    return dueItems.filter((d) => d.categoryId === activeTab);
  }, [activeTab, dueItems]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setCatMode('system');
    setSystemName(SYSTEM_CATEGORY_OPTIONS[0]);
    setCustomName('');
    setCapAmount('');
    setRequiresDue(true);
    setCatDialogOpen(true);
  };

  const openEdit = (cat: FinancialCategory) => {
    setEditingId(cat.id);
    setCatMode(cat.system ? 'system' : 'custom');
    setSystemName(cat.system ? cat.name : SYSTEM_CATEGORY_OPTIONS[0]);
    setCustomName(cat.system ? '' : cat.name);
    setCapAmount(cat.capAmount.toLocaleString('en-US'));
    setRequiresDue(cat.requiresDue);
    setCatDialogOpen(true);
  };

  const submitCategory = () => {
    const name = catMode === 'system' ? systemName : customName.trim();
    const amount = parseNum(capAmount);
    const next: FinancialCategory = {
      id: editingId ?? `custom-${Date.now()}`,
      name,
      capAmount: amount,
      dueAmount: requiresDue ? Math.floor(amount / 2) : 0,
      noDueAmount: requiresDue ? 0 : amount,
      system: catMode === 'system',
      requiresDue,
    };
    setCategories((prev) => editingId ? prev.map((c) => c.id === editingId ? next : c) : [...prev, next]);
    setActiveTab(next.id);
    // الرت اگه مبلغ کل ردیف‌ها از مبلغ قرارداد بیشتر شد
    const newTotal = [...categories.filter(c => c.id !== next.id), next].reduce((s, c) => s + c.capAmount, 0);
    if (totalContractAmount > 0 && newTotal > totalContractAmount) {
      setOverBudgetAmount(newTotal);
      setOverBudgetDialogOpen(true);
    }
    setCatDialogOpen(false);
  };

  const [submitBlockedOpen, setSubmitBlockedOpen] = useState(false);

  const handleSubmit = () => {
    const totalCap = categories.reduce((s, c) => s + c.capAmount, 0);
    if (totalContractAmount > 0 && totalCap > totalContractAmount) {
      setSubmitBlockedOpen(true);
      return;
    }
    router.push(basePath);
  };

  const openDueDialog = () => {
    setDueMode('irregular');
    setDueAmount('');
    setDueDate('');
    setDueNote('');
    setDueNoteCustom(false);
    setRegTotalAmount('');
    setRegInterval('monthly');
    setRegPeriod('');
    setRegCount('');
    setRegStartDate('');
    setRegEndDate('');
    setDueDialogOpen(true);
  };

  const confirmDelete = () => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    setDueItems((prev) => prev.filter((d) => d.categoryId !== categoryToDelete.id));
    if (activeTab === categoryToDelete.id) setActiveTab('summary');
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const submitDue = () => {
    if (dueMode === 'irregular') {
      setDueItems((prev) => [...prev, {
        id: `due-${Date.now()}`,
        categoryId: activeTab,
        amount: dueAmountNum,
        dueDate,
      }]);
    } else {
      const count = parseInt(regCount) || 1;
      const total = regTotalNum;
      const perItem = Math.floor(total / count);
      const newItems: DueItem[] = computedRegDates.map((date, i) => ({
        id: `due-${Date.now()}-${i}`,
        categoryId: activeTab,
        amount: i === count - 1 ? total - perItem * (count - 1) : perItem,
        dueDate: date,
      }));
      setDueItems((prev) => [...prev, ...newItems]);
    }
    setDueDialogOpen(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">مدل قیمت‌گذاری، جمع مالی و دسته‌بندی‌های مالی قرارداد را در این بخش مدیریت کنید.</p>
        </div>
        <button type="button" onClick={() => router.push(basePath)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          بازگشت به مراحل
        </button>
      </div>

      {/* Pricing */}
      <FormBox title="قیمت‌گذاری قرارداد" description="نوع قیمت‌گذاری قرارداد را مشخص کنید.">
        <div className="grid gap-3 md:grid-cols-2">
          <ChoiceCard title="مقطوع" active={pricingType === 'fixed'} onClick={() => setPricingType('fixed')} />
          <ChoiceCard title="متری" active={pricingType === 'metered'} onClick={() => setPricingType('metered')} />
        </div>
        {pricingType === 'metered' ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div>
              <FieldLabel label="متراژ کل" />
              <Input value={totalArea} onChange={(e) => setTotalArea(formatInput(e.target.value))} placeholder="مثال: ۱۲۰" className="mt-2" />
            </div>
            <div>
              <FieldLabel label="قیمت به ازای هر متر مربع" />
              <Input value={pricePerMeter} onChange={(e) => setPricePerMeter(formatInput(e.target.value))} placeholder="مثال: ۴۵۰,۰۰۰" className="mt-2" />
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
            <Input value={fixedTotalAmount} onChange={(e) => setFixedTotalAmount(formatInput(e.target.value))} placeholder="مبلغ کل را وارد کنید" className="mt-2" />
          </div>
        )}
      </FormBox>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="مجموع مبالغ ردیف‌های مالی" value={formatMoney(overall.cap || totalContractAmount)} />
        <SummaryCard title="مبلغ کل سررسید شده" value={formatMoney(overall.due)} />
        <SummaryCard title="ردیف‌های بدون سررسید" value={formatMoney(overall.noDue)} />
        <SummaryCard title="مبلغ کل قرارداد" value={formatMoney(totalContractAmount)} hint={pricingType === 'metered' ? 'محاسبه شده از متراژ و نرخ' : 'ثبت شده به صورت مقطوع'} />
      </div>

      {/* Financial Categories */}
      <FormBox title="دسته‌بندی‌های مالی" description="برای هر دسته‌بندی می‌توانید فهرست سررسیدها و سقف مبلغ را مدیریت کنید.">
        <div className="mb-4 space-y-3">
          {/* Category tabs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveTab(cat.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveTab(cat.id)}
                  className={`cursor-pointer rounded-xl border p-3.5 text-right transition-all ${activeTab === cat.id ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                        {LOCKED_CATEGORY_IDS.includes(cat.id) && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400">سیستمی</span>
                        )}
                      </div>
                    </div>
                    {cat.id !== 'summary' && (
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <CategoryInfo cat={cat} dueItems={dueItems} />
                        <CategoryMenu
                          onEdit={() => openEdit(cat)}
                          onDelete={() => { setCategoryToDelete(cat); setDeleteDialogOpen(true); }}
                          deleteLocked={LOCKED_CATEGORY_IDS.includes(cat.id)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={openAdd} className="inline-flex h-10 items-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-4 text-sm font-medium text-teal-700 hover:bg-teal-100">
              <Plus className="h-4 w-4" />
              افزودن ردیف مالی
            </button>
          </div>
        </div>

        {/* Due items list */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-4 flex flex-col gap-3 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-gray-800">
                {`سررسیدهای ${categories.find((c) => c.id === activeTab)?.name ?? ''}`}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">با انتخاب هر تب، فقط سررسیدهای همان دسته‌بندی نمایش داده می‌شود.</p>
            </div>
            <button
              type="button"
              onClick={() => openDueDialog()}
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
                  <p className="text-sm font-semibold text-gray-800">سررسید ثبت شده</p>
                  <p className="mt-0.5 text-xs text-gray-500">تاریخ: {item.dueDate}</p>
                </div>
                <span className="text-sm font-bold text-teal-700">{formatMoney(item.amount)}</span>
              </div>
            ))}
            {!visibleDueItems.length && (
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                برای این بخش سررسیدی ثبت نشده است.
              </div>
            )}
          </div>
        </div>
      </FormBox>

      <StickySubmitBar label="ثبت اطلاعات مالی" onClick={handleSubmit} />

      {/* ─── Category Dialog ─── */}
      <Modal
        open={catDialogOpen}
        onClose={() => setCatDialogOpen(false)}
        title={editingId ? 'ویرایش ردیف مالی' : 'افزودن ردیف مالی'}
        description="می‌توانید از دسته‌بندی‌های موجود انتخاب کنید یا یک نام جدید بسازید."
        footer={
          <>
            <button type="button" onClick={() => setCatDialogOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">انصراف</button>
            <button type="button" onClick={submitCategory} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">{editingId ? 'ذخیره تغییرات' : 'افزودن'}</button>
          </>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <ChoiceCard title="انتخاب از دسته‌بندی موجود" active={catMode === 'system'} onClick={() => setCatMode('system')} />
          <ChoiceCard title="ثبت نام جدید" active={catMode === 'custom'} onClick={() => setCatMode('custom')} />
        </div>
        {catMode === 'system' ? (
          <div>
            <FieldLabel label="دسته‌بندی موجود" />
            <select value={systemName} onChange={(e) => setSystemName(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-500">
              {SYSTEM_CATEGORY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <FieldLabel label="نام دسته‌بندی" />
            <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="مثال: انشعابات آب" className="mt-2" />
          </div>
        )}
        <div>
            <FieldLabel label="سقف مبلغ" />
            <Input value={capAmount} onChange={(e) => setCapAmount(formatInput(e.target.value))} placeholder="مثال: ۱۰,۰۰۰,۰۰۰" className="mt-2" />
          </div>
      </Modal>

      {/* ─── Due Dialog ─── */}
      <Modal
        open={dueDialogOpen}
        onClose={() => setDueDialogOpen(false)}
        title="ثبت سررسید"
        footer={
          <>
            <button type="button" onClick={() => setDueDialogOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">انصراف</button>
            <button
              type="button"
              onClick={submitDue}
              disabled={dueMode === 'irregular' ? dueAmountExceeds : (regAmountExceeds || computedRegDates.length === 0)}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >ثبت</button>
          </>
        }
      >
        {/* نوع قسط */}
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm text-gray-600">نوع قسط</span>
          <button
            type="button"
            onClick={() => setDueMode('regular')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${dueMode === 'regular' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            {dueMode === 'regular' && <span>✓</span>}
            قسط منظم
          </button>
          <button
            type="button"
            onClick={() => setDueMode('irregular')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${dueMode === 'irregular' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            {dueMode === 'irregular' && <span>✓</span>}
            قسط نامنظم
          </button>
        </div>

        {/* فیلد عنوان - فقط برای غیرسیستمی */}
        {!LOCKED_CATEGORY_IDS.includes(activeTab) && (
          <div>
            <FieldLabel label="عنوان *" />
            <div className="mt-2 flex flex-wrap gap-2">
              {['پیش پرداخت اول', 'تحویل کلید', 'پس از سند', 'اتمام اسکلت', 'نصب پنجره'].map((tag) => (
                <button key={tag} type="button"
                  onClick={() => { setDueNote(tag); setDueNoteCustom(false); }}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${dueNote === tag && !dueNoteCustom ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-teal-300'}`}
                >{tag}</button>
              ))}
              <button type="button"
                onClick={() => { setDueNote(''); setDueNoteCustom(true); }}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${dueNoteCustom ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-teal-300'}`}
              >سایر</button>
            </div>
            {dueNoteCustom && (
              <Input value={dueNote} onChange={(e) => setDueNote(e.target.value)} placeholder="عنوان سفارشی..." className="mt-2" autoFocus />
            )}
          </div>
        )}

        {dueMode === 'irregular' ? (
          <>
            <div>
              <FieldLabel label="تاریخ *" />
              <div className="mt-2"><PersianDatePicker value={dueDate} onChange={setDueDate} placeholder="تاریخ را وارد کنید" /></div>
            </div>
            <div>
              <FieldLabel label="مبلغ *" />
              <Input value={dueAmount} onChange={(e) => setDueAmount(formatInput(e.target.value))} placeholder="مبلغ" className={`mt-2 ${dueAmountExceeds ? 'border-rose-400 focus:ring-rose-400' : ''}`} />
              {dueAmountExceeds && (
                <p className="mt-1 text-xs text-rose-600">مبلغ از مانده ردیف ({formatMoney(remainingCap)}) بیشتر است.</p>
              )}
              {activeCatCap > 0 && !dueAmountExceeds && (
                <p className="mt-1 text-xs text-gray-400">مانده قابل ثبت: {formatMoney(remainingCap)}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <FieldLabel label="مبلغ کل اقساط منظم *" />
              <Input value={regTotalAmount} onChange={(e) => setRegTotalAmount(formatInput(e.target.value))} placeholder="مبلغ کل اقساط منظم" className={`mt-2 ${regAmountExceeds ? 'border-rose-400 focus:ring-rose-400' : ''}`} />
              {regAmountExceeds && (
                <p className="mt-1 text-xs text-rose-600">مبلغ از مانده ردیف ({formatMoney(remainingCap)}) بیشتر است.</p>
              )}
              {activeCatCap > 0 && !regAmountExceeds && (
                <p className="mt-1 text-xs text-gray-400">مانده قابل ثبت: {formatMoney(remainingCap)}</p>
              )}
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">تقسیم‌بندی اقساط</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">بازه زمانی اقساط</span>
                  <button type="button" onClick={() => setRegInterval('daily')}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${regInterval === 'daily' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >روزانه</button>
                  <button type="button" onClick={() => setRegInterval('monthly')}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${regInterval === 'monthly' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >{regInterval === 'monthly' && <span>✓</span>}ماهانه</button>
                </div>
              </div>
              <div>
                <FieldLabel label={regInterval === 'monthly' ? 'دوره اقساط ماهانه *' : 'دوره اقساط روزانه *'} />
                <Input value={regPeriod} onChange={(e) => setRegPeriod(e.target.value.replace(/\D/g, ''))} placeholder={regInterval === 'monthly' ? 'مثال: ۳ (هر ۳ ماه)' : 'مثال: ۳۰ (هر ۳۰ روز)'} className="mt-2" />
              </div>
              <div>
                <FieldLabel label="تعداد اقساط منظم *" />
                <Input value={regCount} onChange={(e) => setRegCount(e.target.value.replace(/\D/g, ''))} placeholder="تعداد اقساط منظم" className="mt-2" />
              </div>
              <div>
                <FieldLabel label="شروع اقساط منظم *" />
                <div className="mt-2"><PersianDatePicker value={regStartDate} onChange={setRegStartDate} placeholder="شروع اقساط منظم" /></div>
              </div>
              <div>
                <FieldLabel label="پایان اقساط منظم (محاسبه خودکار)" />
                <div className={`mt-2 flex h-10 items-center rounded-md border px-3.5 text-sm ${computedEndDate ? 'border-teal-300 bg-teal-50 text-teal-700 font-medium' : 'border-gray-200 bg-gray-100 text-gray-400'}`}>
                  {computedEndDate || 'پس از تکمیل فیلدها محاسبه می‌شود'}
                </div>
                {computedRegDates.length > 0 && (
                  <p className="mt-1 text-xs text-gray-400">{computedRegDates.length} سررسید تولید می‌شود</p>
                )}
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* ─── Delete Dialog ─── */}
      <Modal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="حذف دسته‌بندی مالی"
        description={categoryToDelete ? `مطمئنی که می‌خواهی دسته‌بندی "${categoryToDelete.name}" حذف شود؟` : ''}
        footer={
          <>
            <button type="button" onClick={() => { setDeleteDialogOpen(false); setCategoryToDelete(null); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">انصراف</button>
            <button type="button" onClick={confirmDelete} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">حذف</button>
          </>
        }
      >
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
          تمام سررسیدهای مرتبط با این دسته‌بندی نیز حذف خواهند شد.
        </div>
      </Modal>

      {/* ─── Submit Blocked Alert ─── */}
      <Modal
        open={submitBlockedOpen}
        onClose={() => setSubmitBlockedOpen(false)}
        title="امکان ثبت وجود ندارد"
        description="مجموع ردیف‌های مالی از مبلغ کل قرارداد بیشتر است."
        footer={
          <button type="button" onClick={() => setSubmitBlockedOpen(false)} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">متوجه شدم</button>
        }
      >
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700 space-y-2">
          <p>برای ثبت اطلاعات مالی باید یکی از موارد زیر انجام شود:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>مبالغ ردیف‌های مالی را کاهش دهید تا با مبلغ کل قرارداد تراز شوند.</li>
            <li>مبلغ کل قرارداد را افزایش دهید.</li>
          </ul>
        </div>
      </Modal>

      {/* ─── Over Budget Alert ─── */}
      <Modal
        open={overBudgetDialogOpen}
        onClose={() => setOverBudgetDialogOpen(false)}
        title="مبلغ از قرارداد بیشتر شد"
        description={`مجموع ردیف‌های مالی (${formatMoney(overBudgetAmount)}) از مبلغ کل قرارداد (${formatMoney(totalContractAmount)}) بیشتر شده است. آیا می‌خواهید مبلغ کل قرارداد به مقدار جدید تغییر کند؟`}
        footer={
          <>
            <button type="button" onClick={() => setOverBudgetDialogOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">خیر</button>
            <button
              type="button"
              onClick={() => {
                setFixedTotalAmount(overBudgetAmount.toLocaleString('en-US'));
                setPricingType('fixed');
                setOverBudgetDialogOpen(false);
              }}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              بله، تغییر بده
            </button>
          </>
        }
      >
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-700">
          مبلغ کل قرارداد از {formatMoney(totalContractAmount)} به {formatMoney(overBudgetAmount)} تغییر خواهد کرد.
        </div>
      </Modal>
    </div>
  );
}
