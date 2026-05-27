'use client';

import { CalendarDays, ChevronLeft, Plus, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { PanelFormModal, PanelFormModalActions } from '../../../components/PanelFormModal';
import { getPersianPartsFromDate } from '../../../lib/calendar-dates';
import { formatFaNumber } from '../../../lib/format-fa';
import {
  PAYROLL_SETTINGS_STORAGE_KEY,
  PAYROLL_SETTINGS_YEARS_STORAGE_KEY,
  getPayrollSettingsStorageKey,
  type BusinessSettingYear,
  type PayrollSettingsMode,
} from '../../../lib/payroll-business-settings';
import { PayrollBusinessSettingsFlow } from './PayrollBusinessSettingsFlow';

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
}

function createYear(year: number, currentYear: number, title?: string): BusinessSettingYear {
  const now = new Date().toISOString();
  return {
    id: `year-${year}`,
    year,
    title: title?.trim() || `سال ${formatFaNumber(year, { useGrouping: false })}`,
    isCurrent: year === currentYear,
    createdAt: now,
    updatedAt: now,
  };
}

function readYears(currentYear: number) {
  const raw = window.localStorage.getItem(PAYROLL_SETTINGS_YEARS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as BusinessSettingYear[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      window.localStorage.removeItem(PAYROLL_SETTINGS_YEARS_STORAGE_KEY);
    }
  }

  const legacySettings = window.localStorage.getItem(PAYROLL_SETTINGS_STORAGE_KEY);
  if (legacySettings) {
    const initialYears = [createYear(currentYear, currentYear)];
    window.localStorage.setItem(PAYROLL_SETTINGS_YEARS_STORAGE_KEY, JSON.stringify(initialYears));
    window.localStorage.setItem(getPayrollSettingsStorageKey(currentYear), legacySettings);
    return initialYears;
  }
  window.localStorage.setItem(PAYROLL_SETTINGS_YEARS_STORAGE_KEY, '[]');
  return [];
}

function AddYearDialog({
  open,
  years,
  currentYear,
  onClose,
  onSubmit,
}: {
  open: boolean;
  years: BusinessSettingYear[];
  currentYear: number;
  onClose: () => void;
  onSubmit: (year: BusinessSettingYear) => void;
}) {
  const [yearValue, setYearValue] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setYearValue('');
    setTitle('');
    setError(null);
  }, [open]);

  const submit = () => {
    const normalized = normalizeDigits(yearValue).trim();
    if (!normalized) {
      setError('وارد کردن سال الزامی است');
      return;
    }
    const year = Number(normalized);
    if (!/^\d{4}$/.test(normalized) || !Number.isInteger(year) || year < 1200 || year > 1600) {
      setError('سال وارد شده معتبر نیست');
      return;
    }
    if (years.some((item) => item.year === year)) {
      setError('این سال قبلا تعریف شده است');
      return;
    }
    onSubmit(createYear(year, currentYear, title));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <PanelFormModal
      open={open}
      title="افزودن سال جدید"
      lead="سال مالی مورد نظر برای ثبت ضرایب حقوق، دستمزد و تردد را تعریف کنید."
      error={error}
      onClose={onClose}
      footer={<PanelFormModalActions submitLabel="ثبت سال" onSubmit={submit} onCancel={onClose} />}
    >
      <form className="payroll-year-dialog-form" onSubmit={handleSubmit}>
        <label className="calendar-create-field">
          <span>
            سال <em>*</em>
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={yearValue}
            placeholder="مثلا ۱۴۰۳"
            autoFocus
            onChange={(event) => {
              setYearValue(event.target.value);
              setError(null);
            }}
          />
        </label>
        <label className="calendar-create-field">
          <span>عنوان نمایشی</span>
          <input
            type="text"
            value={title}
            placeholder="مثلا سال ۱۴۰۳"
            onChange={(event) => {
              setTitle(event.target.value);
              setError(null);
            }}
          />
        </label>
      </form>
    </PanelFormModal>
  );
}

export function PayrollSettingsEntry({ mode = 'admin' }: { mode?: PayrollSettingsMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = getPersianPartsFromDate().year;
  const [years, setYears] = useState<BusinessSettingYear[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const isTenant = mode === 'tenant';
  const listPath = isTenant ? '/business-settings/payroll-attendance/tenant' : '/business-settings/payroll-attendance';

  useEffect(() => {
    setYears(readYears(currentYear));
    setLoaded(true);
  }, [currentYear]);

  const selectedYearNumber = Number(searchParams.get('year'));
  const selectedYear = years.find((item) => item.year === selectedYearNumber);
  const normalizedQuery = normalizeDigits(query).trim();
  const visibleYears = useMemo(
    () =>
      [...years]
        .sort((first, second) => second.year - first.year)
        .filter((item) => !normalizedQuery || `${item.year} ${normalizeDigits(item.title)}`.includes(normalizedQuery)),
    [normalizedQuery, years],
  );

  const openYear = (year: BusinessSettingYear) => {
    router.push(`${listPath}?year=${year.year}`);
  };

  const addYear = (year: BusinessSettingYear) => {
    const nextYears = year.isCurrent
      ? years.map((item) => ({ ...item, isCurrent: false })).concat(year)
      : years.concat(year);
    setYears(nextYears);
    window.localStorage.setItem(PAYROLL_SETTINGS_YEARS_STORAGE_KEY, JSON.stringify(nextYears));
    setDialogOpen(false);
    openYear(year);
  };

  if (!loaded) return null;

  if (selectedYear) {
    return (
      <PayrollBusinessSettingsFlow
        key={selectedYear.id}
        mode={mode}
        selectedYear={selectedYear}
        onBackToYears={() => router.push(listPath)}
      />
    );
  }

  return (
    <div className="business-payroll-years-page business-payroll-flow" dir="rtl" lang="fa">
      <main className="business-payroll-years-content">
        <header className="business-payroll-years-header">
          <div>
            <p>تنظیمات کسب و کار</p>
            <h1>{isTenant ? 'تنظیمات اختصاصی حقوق و دستمزد کسب و کار' : 'تنظیمات ضرایب و مقادیر حقوق و دستمزد و تردد'}</h1>
            <span>
              {isTenant
                ? 'سال پایه تعریف شده توسط تاو ادمین را برای تنظیم مقادیر اختصاصی انتخاب کنید.'
                : 'برای مشاهده یا ویرایش قوانین حقوق و حضور، سال مورد نظر را انتخاب کنید.'}
            </span>
          </div>
          {isTenant ? <span className="business-payroll-mode-badge">صاحب کسب و کار</span> : (
            <button type="button" className="draft-template-flow-action is-primary" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" /> افزودن سال جدید
            </button>
          )}
        </header>

        <label className="business-payroll-years-search">
          <Search className="h-4 w-4" aria-hidden />
          <input type="search" value={query} placeholder="جستجو" aria-label="جستجوی سال" onChange={(event) => setQuery(event.target.value)} />
          {query ? (
            <button type="button" aria-label="پاک کردن جستجو" onClick={() => setQuery('')}>
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>

        {years.length === 0 ? (
          <section className="business-payroll-years-empty">
            <CalendarDays className="h-10 w-10" />
            <h2>{isTenant ? 'هنوز سالی توسط تاو ادمین تعریف نشده است' : 'هنوز سالی تعریف نشده است'}</h2>
            <p>
              {isTenant
                ? 'برای تنظیم مقادیر اختصاصی کسب و کار، ابتدا باید سال های پایه توسط تاو ادمین ایجاد شوند.'
                : 'برای شروع تنظیمات حقوق و دستمزد، ابتدا یک سال جدید اضافه کنید.'}
            </p>
            {!isTenant ? (
              <button type="button" className="draft-template-flow-action is-primary" onClick={() => setDialogOpen(true)}>
                افزودن سال جدید
              </button>
            ) : null}
          </section>
        ) : visibleYears.length ? (
          <div className="business-payroll-years-list">
            {visibleYears.map((year) => (
              <button
                key={year.id}
                type="button"
                className={`business-payroll-year-row ${year.isCurrent ? 'is-current' : ''}`}
                onClick={() => openYear(year)}
              >
                <span className="business-payroll-year-arrow">
                  <ChevronLeft className="h-4 w-4" />
                </span>
                <span className="business-payroll-year-copy">
                  <strong>{year.title}</strong>
                  {year.isCurrent ? <small>سال جاری</small> : null}
                </span>
                <CalendarDays className="business-payroll-year-icon h-5 w-5" />
              </button>
            ))}
          </div>
        ) : (
          <div className="business-payroll-years-no-results">سالی با این جستجو یافت نشد.</div>
        )}
      </main>
      {!isTenant ? (
        <AddYearDialog open={dialogOpen} years={years} currentYear={currentYear} onClose={() => setDialogOpen(false)} onSubmit={addYear} />
      ) : null}
    </div>
  );
}
