'use client';

import { CalendarDays, ChevronLeft, Eye, Plus, Search, Trash2, X, Pencil } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { PanelFormModal, PanelFormModalActions } from '../../../components/PanelFormModal';
import { CardMenu } from '../../../components/CardMenu';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { getPersianPartsFromDate } from '../../../lib/calendar-dates';
import { formatFaNumber } from '../../../lib/format-fa';
import {
  ACTIVE_TENANT_STORAGE_KEY,
  getActiveTenantStorageId,
  PAYROLL_SETTINGS_STORAGE_KEY,
  getPayrollSettingsStorageKey,
  getPayrollSettingsDraftStorageKey,
  getPayrollSettingsYearsStorageKey,
  getPayrollStepperProgressStorageKey,
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

function getSelectableYears(existingYears: BusinessSettingYear[], currentYear: number) {
  const existingYearNumbers = new Set(existingYears.map((item) => item.year));
  return [currentYear + 1, currentYear, currentYear - 1]
    .filter((year) => year >= 1200 && year <= 1600)
    .map((year) => ({
      year,
      label: formatFaNumber(year, { useGrouping: false }),
      relativeLabel: year === currentYear ? 'سال جاری' : '',
      disabled: existingYearNumbers.has(year),
    }));
}

function getEditableYears(existingYears: BusinessSettingYear[], currentYear: number, excludedId: string) {
  const existingYearNumbers = new Set(existingYears.filter((item) => item.id !== excludedId).map((item) => item.year));
  return [currentYear + 1, currentYear, currentYear - 1]
    .filter((year) => year >= 1200 && year <= 1600)
    .map((year) => ({
      year,
      label: formatFaNumber(year, { useGrouping: false }),
      relativeLabel: year === currentYear ? 'سال جاری' : '',
      disabled: existingYearNumbers.has(year),
    }));
}

function readYears(currentYear: number, tenantId?: string | null) {
  const yearsStorageKey = getPayrollSettingsYearsStorageKey(tenantId);
  const raw = window.localStorage.getItem(yearsStorageKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as BusinessSettingYear[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      window.localStorage.removeItem(yearsStorageKey);
    }
  }

  const legacySettings = tenantId ? null : window.localStorage.getItem(PAYROLL_SETTINGS_STORAGE_KEY);
  if (legacySettings) {
    const initialYears = [createYear(currentYear, currentYear)];
    window.localStorage.setItem(yearsStorageKey, JSON.stringify(initialYears));
    window.localStorage.setItem(getPayrollSettingsStorageKey(currentYear), legacySettings);
    return initialYears;
  }
  window.localStorage.setItem(yearsStorageKey, '[]');
  return [];
}

function removeYearStorage(year: number, tenantId?: string | null) {
  window.localStorage.removeItem(getPayrollSettingsStorageKey(year, tenantId));
  window.localStorage.removeItem(getPayrollStepperProgressStorageKey('admin', year, tenantId));
  window.localStorage.removeItem(getPayrollSettingsDraftStorageKey('admin', year, tenantId));
}

function moveYearStorage(fromYear: number, toYear: number, tenantId?: string | null) {
  if (fromYear === toYear) return;
  const storagePairs = [
    [getPayrollSettingsStorageKey(fromYear, tenantId), getPayrollSettingsStorageKey(toYear, tenantId)],
    [getPayrollStepperProgressStorageKey('admin', fromYear, tenantId), getPayrollStepperProgressStorageKey('admin', toYear, tenantId)],
    [getPayrollSettingsDraftStorageKey('admin', fromYear, tenantId), getPayrollSettingsDraftStorageKey('admin', toYear, tenantId)],
  ] as const;

  storagePairs.forEach(([fromKey, toKey]) => {
    const value = window.localStorage.getItem(fromKey);
    if (value === null) return;
    window.localStorage.setItem(toKey, value);
    window.localStorage.removeItem(fromKey);
  });
}

function YearDialog({
  open,
  years,
  currentYear,
  initialYear,
  initialTitle,
  submitLabel,
  dialogTitle,
  lead,
  onClose,
  onSubmit,
  mode = 'create',
}: {
  open: boolean;
  years: BusinessSettingYear[];
  currentYear: number;
  initialYear?: number;
  initialTitle?: string;
  submitLabel: string;
  dialogTitle: string;
  lead: string;
  onClose: () => void;
  onSubmit: (year: BusinessSettingYear) => void;
  mode?: 'create' | 'edit';
}) {
  const [yearValue, setYearValue] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const selectableYears = useMemo(
    () => (mode === 'edit' && initialYear != null ? getEditableYears(years, currentYear, `year-${initialYear}`) : getSelectableYears(years, currentYear)),
    [currentYear, initialYear, mode, years],
  );

  useEffect(() => {
    if (!open) return;
    setYearValue(String(initialYear ?? selectableYears.find((item) => !item.disabled)?.year ?? selectableYears[0]?.year ?? ''));
    setDraftTitle(initialTitle ?? '');
    setError(null);
  }, [initialYear, initialTitle, open, selectableYears]);

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
    if (years.some((item) => item.year === year && item.id !== `year-${initialYear ?? year}`)) {
      setError('این سال قبلا تعریف شده است');
      return;
    }
    onSubmit(createYear(year, currentYear, draftTitle));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <PanelFormModal
      open={open}
      title={dialogTitle}
      lead={lead}
      error={error}
      onClose={onClose}
      footer={<PanelFormModalActions submitLabel={submitLabel} onSubmit={submit} onCancel={onClose} />}
    >
      <form className="payroll-year-dialog-form" onSubmit={handleSubmit}>
        <div className="calendar-create-field payroll-year-field">
          <span>
            سال <em>*</em>
          </span>
          {selectableYears.every((item) => item.disabled) ? (
            <p className="payroll-year-empty-hint">همه سال‌های مجاز قبلاً ثبت شده‌اند.</p>
          ) : (
            <div className="payroll-year-chips" role="radiogroup" aria-label="انتخاب سال">
              {selectableYears.map((yearOption) => {
                const isSelected = yearOption.year === Number(yearValue);
                return (
                  <label
                    key={yearOption.year}
                    className={`payroll-year-chip ${isSelected ? 'is-selected' : ''} ${yearOption.disabled ? 'is-disabled' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payroll-year"
                      value={yearOption.year}
                      checked={isSelected}
                      disabled={yearOption.disabled}
                      onChange={() => {
                        setYearValue(String(yearOption.year));
                        setError(null);
                      }}
                    />
                    <span className="payroll-year-chip-year">{yearOption.label}</span>
                    {yearOption.relativeLabel ? <small>{yearOption.relativeLabel}</small> : null}
                    {yearOption.disabled ? <small className="payroll-year-chip-badge">ثبت شده</small> : null}
                  </label>
                );
              })}
            </div>
          )}
        </div>
        <label className="calendar-create-field">
          <span>عنوان نمایشی</span>
          <input
            type="text"
            value={draftTitle}
            placeholder="مثلا سال ۱۴۰۳"
            onChange={(event) => {
              setDraftTitle(event.target.value);
              setError(null);
            }}
          />
        </label>
      </form>
    </PanelFormModal>
  );
}

export function PayrollSettingsEntry({ mode = 'admin', tenantId = null }: { mode?: PayrollSettingsMode; tenantId?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = getPersianPartsFromDate().year;
  const [years, setYears] = useState<BusinessSettingYear[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; year: BusinessSettingYear | null }>({ open: false, year: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; year: BusinessSettingYear | null }>({ open: false, year: null });
  const isTenant = mode === 'tenant';
  const tenantStorageId = isTenant ? tenantId ?? getActiveTenantStorageId() : null;
  const yearsStorageKey = getPayrollSettingsYearsStorageKey(null);
  const listPath = isTenant ? '/business-settings/payroll-attendance/tenant' : '/business-settings/payroll-attendance';

  useEffect(() => {
    if (!isTenant || !tenantId) return;
    window.sessionStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, tenantId);
  }, [isTenant, tenantId]);

  useEffect(() => {
    setYears(readYears(currentYear, null));
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
    window.localStorage.setItem(yearsStorageKey, JSON.stringify(nextYears));
    setDialogOpen(false);
    openYear(year);
  };

  const updateYear = (year: BusinessSettingYear) => {
    const previous = editDialog.year;
    if (!previous) return;
    const nextYears = years.map((item) => (item.id === previous.id ? year : item));
    setYears(nextYears);
    window.localStorage.setItem(yearsStorageKey, JSON.stringify(nextYears));
    moveYearStorage(previous.year, year.year, tenantStorageId);
    setEditDialog({ open: false, year: null });
    openYear(year);
  };

  const deleteYear = () => {
    const target = deleteDialog.year;
    if (!target) return;
    const nextYears = years.filter((item) => item.id !== target.id);
    setYears(nextYears);
    window.localStorage.setItem(yearsStorageKey, JSON.stringify(nextYears));
    removeYearStorage(target.year, tenantStorageId);
    setDeleteDialog({ open: false, year: null });
  };

  if (!loaded) return null;

  if (selectedYear) {
    return (
      <PayrollBusinessSettingsFlow
        key={selectedYear.id}
        mode={mode}
        selectedYear={selectedYear}
        tenantId={tenantStorageId}
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
              <div
                key={year.id}
                className={`business-payroll-year-row ${year.isCurrent ? 'is-current' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => openYear(year)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openYear(year);
                  }
                }}
              >
                {!isTenant ? (
                  <div
                    className="business-payroll-year-menu"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <CardMenu
                      items={[
                        {
                          kind: 'action',
                          label: 'جزئیات',
                          icon: <Eye className="h-4 w-4" />,
                          onClick: () => openYear(year),
                        },
                        {
                          kind: 'action',
                          label: 'ویرایش',
                          icon: <Pencil className="h-4 w-4" />,
                          onClick: () => setEditDialog({ open: true, year }),
                        },
                        {
                          kind: 'action',
                          label: 'حذف',
                          tone: 'danger',
                          icon: <Trash2 className="h-4 w-4" />,
                          onClick: () => setDeleteDialog({ open: true, year }),
                        },
                      ]}
                    />
                  </div>
                ) : null}
                <span className="business-payroll-year-arrow">
                  <ChevronLeft className="h-4 w-4" />
                </span>
                <span className="business-payroll-year-copy">
                  <strong>{year.title}</strong>
                  {year.isCurrent ? <small>سال جاری</small> : null}
                </span>
                <CalendarDays className="business-payroll-year-icon h-5 w-5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="business-payroll-years-no-results">سالی با این جستجو یافت نشد.</div>
        )}
      </main>
      {!isTenant ? (
        <>
          <YearDialog
            open={dialogOpen}
            years={years}
            currentYear={currentYear}
            submitLabel="ثبت سال"
            dialogTitle="افزودن سال جدید"
            lead="سال مالی مورد نظر برای ثبت ضرایب حقوق، دستمزد و تردد را تعریف کنید."
            onClose={() => setDialogOpen(false)}
            onSubmit={addYear}
          />
          <YearDialog
            open={editDialog.open}
            years={years}
            currentYear={currentYear}
            initialYear={editDialog.year?.year}
            initialTitle={editDialog.year?.title}
            submitLabel="ثبت تغییرات"
            dialogTitle="ویرایش سال"
            lead="سال و عنوان نمایشی را تغییر دهید. اگر سال عوض شود، داده‌های همان سال هم جابه‌جا می‌شوند."
            mode="edit"
            onClose={() => setEditDialog({ open: false, year: null })}
            onSubmit={updateYear}
          />
          <ConfirmDialog
            open={deleteDialog.open}
            title="حذف سال"
            description={deleteDialog.year ? `آیا از حذف «${deleteDialog.year.title}» مطمئن هستید؟ داده‌های ذخیره‌شده برای این سال هم حذف می‌شوند.` : ''}
            confirmLabel="بله، حذف شود"
            cancelLabel="انصراف"
            tone="danger"
            onCancel={() => setDeleteDialog({ open: false, year: null })}
            onConfirm={deleteYear}
          />
        </>
      ) : null}
    </div>
  );
}
