'use client';

import { BriefcaseBusiness, FileText, Layers3, Plus, Search, ShieldCheck, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { PanelFormModal, PanelFormModalActions } from '../../components/PanelFormModal';
import {
  ACTIVE_CONTRACT_DRAFT_TEMPLATE_STORAGE_KEY,
  CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY,
  createContractDraftTemplate,
  normalizeContractDraftTemplate,
  type ContractDraftTemplate,
  type ContractDraftTemplateUsageType,
} from '../../lib/contract-draft-templates';
import { formatFaNumber } from '../../lib/format-fa';
import {
  PAYROLL_SETTINGS_YEARS_STORAGE_KEY,
  getPayrollSettingsStorageKey,
  normalizePayrollSettings,
  type BusinessSettingYear,
} from '../../lib/payroll-business-settings';

function readTemplates() {
  const raw = window.localStorage.getItem(CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.map(normalizeContractDraftTemplate).filter(Boolean) as ContractDraftTemplate[] : [];
  } catch {
    window.localStorage.removeItem(CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY);
    return [];
  }
}

function readYears() {
  const raw = window.localStorage.getItem(PAYROLL_SETTINGS_YEARS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BusinessSettingYear[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(PAYROLL_SETTINGS_YEARS_STORAGE_KEY);
    return [];
  }
}

function usageLabel(value: ContractDraftTemplateUsageType) {
  return value === 'attendance_only' ? 'فقط تردد' : 'تردد و حقوق و دستمزد';
}

function CreateTemplateDialog({
  open,
  years,
  onClose,
  onCreated,
}: {
  open: boolean;
  years: BusinessSettingYear[];
  onClose: () => void;
  onCreated: (template: ContractDraftTemplate) => void;
}) {
  const [name, setName] = useState('');
  const [usageType, setUsageType] = useState<ContractDraftTemplateUsageType | ''>('');
  const [baseYear, setBaseYear] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setUsageType('');
    setBaseYear('');
    setError('');
  }, [open]);

  const submit = () => {
    if (!name.trim()) {
      setError('نام قالب الزامی است');
      return;
    }
    if (!usageType) {
      setError('نوع قالب را انتخاب کنید');
      return;
    }
    if (!baseYear) {
      setError('مبنای تنظیمات را انتخاب کنید');
      return;
    }
    const year = Number(baseYear);
    const rawSettings = window.localStorage.getItem(getPayrollSettingsStorageKey(year));
    const baseSettings = rawSettings ? normalizePayrollSettings(JSON.parse(rawSettings)) : normalizePayrollSettings({});
    onCreated(createContractDraftTemplate({ name: name.trim(), usageType, baseSettingsYear: year, baseSettings }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <PanelFormModal
      open={open}
      title="افزودن قالب پیش‌نویس قرارداد"
      lead="قالب بر اساس مبنای حقوق و تردد؛ بعد از ثبت، مراحل ساخت باز می‌شود."
      error={error}
      onClose={onClose}
      footer={<PanelFormModalActions submitLabel="ثبت قالب" onSubmit={submit} onCancel={onClose} />}
    >
      <form className="business-draft-dialog business-draft-template-dialog" onSubmit={handleSubmit}>
        <div className="business-draft-dialog-card">
          <div className="business-draft-dialog-card-head">
            <div>
              <span className="business-draft-dialog-kicker">
                <FileText className="h-4 w-4" />
                مشخصات قالب
              </span>
              <h3>نام قالب پیش‌نویس</h3>
              <p>یک نام واضح انتخاب کنید تا بعداً قالب را سریع تشخیص دهید.</p>
            </div>
          </div>
          <label className="business-draft-field">
            <span>نام قالب <em>*</em></span>
            <input value={name} placeholder="مثلا قالب قرارداد نیروهای شیفتی" onChange={(event) => setName(event.target.value)} />
          </label>
        </div>

        <div className="business-draft-dialog-card">
          <div className="business-draft-dialog-card-head">
            <div>
              <span className="business-draft-dialog-kicker">
                <BriefcaseBusiness className="h-4 w-4" />
                نوع قالب
              </span>
              <h3>این قالب برای چه کاری است؟</h3>
              <p>با انتخاب نوع قالب، فیلدهای بعدی و ساختار پیش‌فرض تنظیم می‌شوند.</p>
            </div>
          </div>

          <div className="business-draft-dialog-options business-draft-dialog-options-grid">
            <button type="button" className={usageType === 'attendance_only' ? 'is-selected' : ''} onClick={() => setUsageType('attendance_only')}>
              <span className="business-draft-option-pill">
                <ShieldCheck className="h-4 w-4" />
                فقط تردد
              </span>
              <strong>مناسب برای سیستم تردد</strong>
              <small>برای حضور و غیاب، مرخصی، اضافه‌کاری و قوانین تردد.</small>
            </button>
            <button type="button" className={usageType === 'payroll_attendance' ? 'is-selected' : ''} onClick={() => setUsageType('payroll_attendance')}>
              <span className="business-draft-option-pill">
                <Layers3 className="h-4 w-4" />
                تردد و حقوق
              </span>
              <strong>مناسب برای سیستم تردد و حقوق و دستمزد</strong>
              <small>برای حقوق پایه، مزایا، کسورات، بیمه، مالیات و دستمزد.</small>
            </button>
          </div>
        </div>

        <div className="business-draft-dialog-card">
          <div className="business-draft-dialog-card-head">
            <div>
              <span className="business-draft-dialog-kicker">
                <Layers3 className="h-4 w-4" />
                مبنای تنظیمات
              </span>
              <h3>مبنای تنظیمات ضرایب و قوانین</h3>
              <p>مقادیر اولیه قالب و هینت‌های مغایرت از این سال دریافت می‌شوند.</p>
            </div>
          </div>

          <label className="business-draft-field">
            <span>انتخاب مبنا <em>*</em></span>
            <select value={baseYear} onChange={(event) => setBaseYear(event.target.value)}>
              <option value="">مبنای تنظیمات را انتخاب کنید</option>
              {years.map((year) => (
                <option key={year.id} value={year.year}>
                  تنظیمات {year.title}
                </option>
              ))}
            </select>
          </label>
          <p className="business-draft-field-note">بعد از ثبت، قالب از همین مبنا پیش‌فرض‌گیری می‌شود و تفاوت‌ها با آن مقایسه می‌شوند.</p>
        </div>
      </form>
    </PanelFormModal>
  );
}

export function DraftTemplatesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState<ContractDraftTemplate[]>([]);
  const [years, setYears] = useState<BusinessSettingYear[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setTemplates(readTemplates());
    setYears(readYears());
    if (searchParams.get('create') === '1') setDialogOpen(true);
  }, [searchParams]);

  const visibleTemplates = useMemo(
    () => templates.filter((template) => !query.trim() || template.name.includes(query.trim())),
    [query, templates],
  );

  const persistTemplates = (next: ContractDraftTemplate[]) => {
    setTemplates(next);
    window.localStorage.setItem(CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY, JSON.stringify(next));
  };

  const openTemplate = (template: ContractDraftTemplate) => {
    window.localStorage.setItem(ACTIVE_CONTRACT_DRAFT_TEMPLATE_STORAGE_KEY, template.id);
    router.push('/business-settings/payroll-attendance');
  };

  const createTemplate = (template: ContractDraftTemplate) => {
    const next = [template, ...templates];
    persistTemplates(next);
    setDialogOpen(false);
    openTemplate(template);
  };

  return (
    <div className="page-stack module-page draft-templates-page business-draft-list-page" dir="rtl" lang="fa">
      <header className="business-draft-list-header">
        <div>
          <p>تنظیمات کسب و کار</p>
          <h1>قالب‌های پیش‌نویس قرارداد</h1>
          <span>قالب‌های قرارداد را بر اساس تنظیمات مبنای حقوق و تردد بسازید.</span>
        </div>
        <button type="button" className="module-page-add-btn draft-template-top-add" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> افزودن قالب جدید
        </button>
      </header>

      <div className="draft-template-toolbar" aria-label="ابزارهای فهرست قالب‌ها">
        <label className="business-payroll-years-search">
          <Search className="h-4 w-4" aria-hidden />
          <input value={query} placeholder="جستجو" onChange={(event) => setQuery(event.target.value)} />
          {query ? (
            <button type="button" aria-label="پاک کردن جستجو" onClick={() => setQuery('')}>
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
      </div>

      {visibleTemplates.length ? (
        <div className="draft-template-list">
          {visibleTemplates.map((template) => (
            <button key={template.id} type="button" className="draft-template-card business-draft-template-row" onClick={() => openTemplate(template)}>
              <span className="draft-template-file-icon" aria-hidden>
                <FileText className="h-4 w-4" />
              </span>
              <span className="draft-template-title-block">
                <h3>{template.name}</h3>
                <span className="draft-template-pills">
                  <span>نوع قالب: {usageLabel(template.usageType)}</span>
                  <span>مبنای تنظیمات: سال {formatFaNumber(template.baseSettingsYear, { useGrouping: false })}</span>
                  <span>پیش‌نویس</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="draft-template-empty">
          <FileText className="h-8 w-8" />
          <p>هنوز قالب پیش‌نویسی ثبت نشده است.</p>
          <button type="button" className="module-page-add-btn" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> افزودن قالب جدید
          </button>
        </div>
      )}

      <CreateTemplateDialog open={dialogOpen} years={years} onClose={() => setDialogOpen(false)} onCreated={createTemplate} />
    </div>
  );
}
