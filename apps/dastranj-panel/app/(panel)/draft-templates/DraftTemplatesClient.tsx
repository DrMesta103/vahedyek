'use client';

import { ChevronDown, ChevronUp, Eye, FileText, Info, Layers3, Pencil, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { CardMenu } from '../../components/CardMenu';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DraftShowcaseField, DraftShowcaseFieldBadge, DraftShowcaseFields } from '../../components/DraftShowcaseField';
import { PanelFormModal, PanelFormModalActions } from '../../components/PanelFormModal';
import {
  getActiveContractDraftTemplateStorageKey,
  getContractDraftTemplatesStorageKey,
  createContractDraftTemplate,
  normalizeContractDraftTemplate,
  type ContractDraftTemplate,
  type ContractDraftTemplateUsageType,
} from '../../lib/contract-draft-templates';
import { readEmployeeDrafts, type EmployeeContractDraft } from '../../lib/employee-contract-drafts';
import { formatFaNumber, formatPersianJalaliDate } from '../../lib/format-fa';
import {
  ACTIVE_TENANT_STORAGE_KEY,
  getPayrollSettingsStorageKey,
  getTenantPayrollSettingsStorageKey,
  getPayrollSettingsYearsStorageKey,
  applyPayrollOverrides,
  normalizePayrollSettings,
  normalizePayrollOverrides,
  type BusinessSettingYear,
} from '../../lib/payroll-business-settings';

function readTemplates(tenantId?: string | null) {
  const raw = window.localStorage.getItem(getContractDraftTemplatesStorageKey(tenantId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.map(normalizeContractDraftTemplate).filter(Boolean) as ContractDraftTemplate[] : [];
  } catch {
    window.localStorage.removeItem(getContractDraftTemplatesStorageKey(tenantId));
    return [];
  }
}

function readYears() {
  const raw = window.localStorage.getItem(getPayrollSettingsYearsStorageKey(null));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BusinessSettingYear[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(getPayrollSettingsYearsStorageKey(null));
    return [];
  }
}

function readTenantPayrollBaseSettings(year: number, tenantId?: string | null) {
  const rawAdminBase = window.localStorage.getItem(getPayrollSettingsStorageKey(year));
  const adminBase = rawAdminBase ? normalizePayrollSettings(JSON.parse(rawAdminBase)) : normalizePayrollSettings({});
  if (!tenantId) return adminBase;

  const rawTenantOverrides = window.localStorage.getItem(getTenantPayrollSettingsStorageKey(year, tenantId));
  if (rawTenantOverrides) {
    return normalizePayrollSettings(
      applyPayrollOverrides(adminBase, normalizePayrollOverrides(JSON.parse(rawTenantOverrides))),
    );
  }

  const rawLegacyTenantSettings = window.localStorage.getItem(getPayrollSettingsStorageKey(year, tenantId));
  return rawLegacyTenantSettings ? normalizePayrollSettings(JSON.parse(rawLegacyTenantSettings)) : adminBase;
}

function usageLabel(value: ContractDraftTemplateUsageType) {
  return value === 'attendance_only' ? 'فقط تردد' : 'تردد و حقوق و دستمزد';
}

function displayValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : 'ثبت نشده';
}

function TemplateDetailSection({
  label,
  category,
  subHint,
  value,
}: {
  label: string;
  category: string;
  subHint?: string;
  value?: string;
}) {
  return (
    <section className="draft-template-detail-section">
      <span className="draft-template-detail-label">{label}</span>
      <span className="draft-template-detail-chip">{category}</span>
      {subHint ? (
        <p className="draft-template-detail-hint">
          <Info className="h-3.5 w-3.5" aria-hidden />
          <span>{subHint}</span>
        </p>
      ) : null}
      {value ? <span className="draft-template-detail-chip is-sub">{value}</span> : null}
    </section>
  );
}

function TemplateListCard({
  template,
  usageCount,
  usageLabels,
  onOpen,
  onDelete,
}: {
  template: ContractDraftTemplate;
  usageCount: number;
  usageLabels: string[];
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const { classification } = template.data;
  const paymentSchedule = template.data.paymentSchedule ?? (template.data as { paymentType?: { type?: string; period?: string } }).paymentType;
  const contractCategory = displayValue(classification.contractType);
  const contractSubType = classification.contractSubType.trim();
  const locationCategory = classification.workLocationCategories[0] ?? classification.workLocationSubCategory;
  const locationSubType = classification.workLocationSubCategory.trim();
  const paymentCategory = paymentSchedule
    ? paymentSchedule.type === 'job_activity'
      ? 'پرداخت بر اساس نوع شغل و فعالیت'
      : paymentSchedule.type === 'hybrid_special'
        ? 'پرداخت ترکیبی و روش‌های خاص'
        : 'پرداخت بر اساس دوره‌های زمانی'
    : 'ثبت نشده';
  const jobCategory = template.data.specialCommitments.selected[0] ?? usageLabel(template.usageType);

  const showDetails = () => {
    setExpanded(true);
    requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };

  return (
    <article className="draft-template-card draft-template-showcase-card">
      <header className="draft-template-showcase-head">
        <div className="draft-template-showcase-info">
          <DraftShowcaseFields>
            <DraftShowcaseField label="نام قالب" value={template.name} prominent />
            <DraftShowcaseField label="مبنای سال" value={formatFaNumber(template.baseSettingsYear, { useGrouping: false })} />
            <DraftShowcaseField label="حوزه پوشش" value={usageLabel(template.usageType)} />
          </DraftShowcaseFields>
          <DraftShowcaseFields className="is-compact">
            <DraftShowcaseField label="تاریخ ثبت" value={<time dateTime={template.createdAt}>{formatPersianJalaliDate(template.createdAt)}</time>} />
            <DraftShowcaseField label="آخرین به‌روزرسانی" value={<time dateTime={template.updatedAt}>{formatPersianJalaliDate(template.updatedAt)}</time>} />
            <DraftShowcaseFieldBadge label="تعداد استفاده" value={`${formatFaNumber(usageCount, { useGrouping: false })} مورد`} />
          </DraftShowcaseFields>
        </div>
        <div className="draft-template-showcase-actions">
          <button type="button" className="draft-template-use-btn" onClick={onOpen}>
            استفاده از این قالب برای تنظیم پیش‌نویس
          </button>
        </div>
        <div className="draft-template-showcase-menu-wrap">
          <CardMenu
            items={[
              {
                kind: 'action',
                label: 'جزئیات',
                icon: <Eye className="h-4 w-4" aria-hidden />,
                onClick: showDetails,
              },
              {
                kind: 'action',
                label: 'ویرایش',
                icon: <Pencil className="h-4 w-4" aria-hidden />,
                onClick: onOpen,
              },
              {
                kind: 'action',
                label: 'حذف',
                icon: <Trash2 className="h-4 w-4" aria-hidden />,
                tone: 'danger',
                onClick: () => setDeleteOpen(true),
              },
            ]}
          />
        </div>
      </header>

      <section className="draft-template-workgroups">
        <span className="draft-template-workgroups-label">گروه کاری هایی که از این نمونه استفاده کردند</span>
        {usageLabels.length ? (
          <div className="draft-template-workgroup-chips">
            {usageLabels.map((item) => (
              <span key={item} className="draft-template-workgroup-chip">
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="draft-template-workgroups-empty">هنوز گروه کاری از این قالب استفاده نکرده است.</p>
        )}
      </section>

      {expanded ? (
        <div className="draft-template-detail-stack" ref={detailsRef}>
          <TemplateDetailSection
            label="نوع قرارداد"
            category={contractCategory}
            subHint={classification.contractType.trim() ? `زیر مجموعه قراردادهای «${classification.contractType.trim()}»` : undefined}
            value={contractSubType || undefined}
          />
          <TemplateDetailSection
            label="نوع شغل و مسئولیت"
            category={jobCategory}
            subHint={template.data.specialCommitments.selected[0] ? 'تعهد انتخاب‌شده در قالب' : 'بر اساس نوع قالب'}
          />
          <TemplateDetailSection label="نوع پرداخت حقوق و مزایا" category={paymentCategory} />
          <TemplateDetailSection
            label="نوع محل انجام کار"
            category={displayValue(locationCategory)}
            subHint={
              classification.workLocationCategories[0]
                ? `زیر مجموعه «${classification.workLocationCategories[0]}»`
                : undefined
            }
            value={locationSubType || undefined}
          />
        </div>
      ) : null}

      <button
        type="button"
        className="draft-template-expand-toggle"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
      >
        {expanded ? (
          <>
            جزئیات کمتر
            <ChevronUp className="h-4 w-4" aria-hidden />
          </>
        ) : (
          <>
            جزئیات بیشتر
            <ChevronDown className="h-4 w-4" aria-hidden />
          </>
        )}
      </button>

      <ConfirmDialog
        open={deleteOpen}
        title="حذف قالب پیش‌نویس"
        description={`آیا از حذف «${template.name}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        confirmLabel="حذف"
        cancelLabel="انصراف"
        tone="danger"
        onConfirm={() => {
          onDelete();
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </article>
  );
}

function CreateTemplateDialog({
  open,
  years,
  tenantId,
  existingTemplateNames,
  onClose,
  onCreated,
}: {
  open: boolean;
  years: BusinessSettingYear[];
  tenantId?: string | null;
  existingTemplateNames: string[];
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
    const resolvedName = name.trim();
    if (!resolvedName) {
      setError('نام قالب الزامی است');
      return;
    }
    if (existingTemplateNames.some((item) => item.trim() === resolvedName)) {
      setError('نام قالب تکراری است');
      return;
    }
    if (!usageType) {
      setError('حوزه پوشش قالب را انتخاب کنید');
      return;
    }
    if (!baseYear) {
      setError('سال مبنای تنظیمات را انتخاب کنید');
      return;
    }

    const year = Number(baseYear);
    const baseSettings = readTenantPayrollBaseSettings(year, tenantId);
    const template = createContractDraftTemplate({ name: resolvedName, usageType, baseSettingsYear: year, baseSettings });
    onCreated(template);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <PanelFormModal
      open={open}
      title="افزودن قالب پیش‌نویس قرارداد"
      lead="فقط عنوان قالب را وارد کنید؛ ساختارهای پیشرفته بعدا اضافه می‌شوند."
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
              <p>فقط یک عنوان ساده برای قالب وارد کنید تا بعداً سریع تشخیص داده شود.</p>
            </div>
          </div>
          <label className="business-draft-field">
            <span>
              نام قالب <em>*</em>
            </span>
            <input value={name} placeholder="مثلا قالب قرارداد نیروهای شیفتی" onChange={(event) => setName(event.target.value)} />
          </label>
        </div>

        <div className="business-draft-dialog-card business-draft-dialog-card--compact">
          <div className="business-draft-compact-head">
            <span className="business-draft-compact-title">
              حوزه پوشش قالب <em>*</em>
            </span>
            <span className="business-draft-compact-hint">مراحل و فیلدهای ساخت قالب بر اساس این انتخاب تنظیم می‌شوند.</span>
          </div>
          <div className="business-draft-scope-options" role="radiogroup" aria-label="حوزه پوشش قالب">
            <button
              type="button"
              className={"business-draft-scope-option" + (usageType === 'attendance_only' ? ' is-selected' : '')}
              onClick={() => setUsageType('attendance_only')}
            >
              <span className="business-draft-scope-option-title">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                فقط تردد
              </span>
              <small>حضور و غیاب، مرخصی، اضافه‌کاری و قوانین تردد.</small>
            </button>
            <button
              type="button"
              className={"business-draft-scope-option" + (usageType === 'payroll_attendance' ? ' is-selected' : '')}
              onClick={() => setUsageType('payroll_attendance')}
            >
              <span className="business-draft-scope-option-title">
                <Layers3 className="h-3.5 w-3.5" aria-hidden />
                تردد و حقوق
              </span>
              <small>حقوق پایه، مزایا، بیمه، مالیات و محاسبات دستمزد.</small>
            </button>
          </div>
        </div>

        <div className="business-draft-dialog-card business-draft-dialog-card--compact">
          <label className="business-draft-field">
            <span>
              سال مبنای تنظیمات <em>*</em>
            </span>
            <select value={baseYear} onChange={(event) => setBaseYear(event.target.value)}>
              <option value="">انتخاب سال مبنا</option>
              {years.map((year) => (
                <option key={year.id} value={year.year}>
                  تنظیمات {year.title}
                </option>
              ))}
            </select>
          </label>
          <p className="business-draft-field-note">مقادیر اولیه و مقایسه مغایرت‌ها از تنظیمات همین سال خوانده می‌شود.</p>
        </div>
      </form>
    </PanelFormModal>
  );
}

function buildTemplateUsageMap(drafts: EmployeeContractDraft[]) {
  const map = new Map<string, { count: number; labels: string[] }>();
  drafts.forEach((draft) => {
    if (!draft.templateId) return;
    const current = map.get(draft.templateId) ?? { count: 0, labels: [] };
    current.count += 1;
    const label = `گروه کاری ${draft.employeeName}`.trim();
    if (label && !current.labels.includes(label)) current.labels.push(label);
    map.set(draft.templateId, current);
  });
  return map;
}

export function DraftTemplatesClient({ tenantId = null }: { tenantId?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState<ContractDraftTemplate[]>([]);
  const [years, setYears] = useState<BusinessSettingYear[]>([]);
  const [drafts, setDrafts] = useState<EmployeeContractDraft[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (tenantId) {
      window.sessionStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, tenantId);
    }
    setTemplates(readTemplates(tenantId));
    setYears(readYears());
    setDrafts(readEmployeeDrafts(tenantId));
    if (searchParams.get('create') === '1') setDialogOpen(true);
  }, [searchParams, tenantId]);

  const usageMap = useMemo(() => buildTemplateUsageMap(drafts), [drafts]);

  const visibleTemplates = useMemo(
    () => templates.filter((template) => !query.trim() || template.name.includes(query.trim())),
    [query, templates],
  );

  const persistTemplates = (next: ContractDraftTemplate[]) => {
    setTemplates(next);
    window.localStorage.setItem(getContractDraftTemplatesStorageKey(tenantId), JSON.stringify(next));
  };

  const openTemplate = (template: ContractDraftTemplate) => {
    window.localStorage.setItem(getActiveContractDraftTemplateStorageKey(tenantId), template.id);
    router.push('/draft-templates/builder');
  };

  const createTemplate = (template: ContractDraftTemplate) => {
    const next = [template, ...templates];
    persistTemplates(next);
    setDialogOpen(false);
    openTemplate(template);
  };

  const deleteTemplate = (templateId: string) => {
    persistTemplates(templates.filter((item) => item.id !== templateId));
    if (window.localStorage.getItem(getActiveContractDraftTemplateStorageKey(tenantId)) === templateId) {
      window.localStorage.removeItem(getActiveContractDraftTemplateStorageKey(tenantId));
    }
  };

  return (
    <div className="page-stack module-page draft-templates-page business-draft-list-page draft-templates-showcase-page" dir="rtl" lang="fa">
      <header className="business-draft-list-header draft-templates-showcase-header">
        <div>
          <p>تنظیمات کسب و کار</p>
          <h1>قالب‌های پیش‌نویس قرارداد</h1>
          <span>قالب‌های قرارداد را بر اساس تنظیمات مبنای حقوق و تردد بسازید.</span>
        </div>
      </header>

      <div className="draft-templates-showcase-toolbar" aria-label="ابزارهای فهرست قالب‌ها">
        <label className="draft-templates-showcase-search">
          <Search className="h-4 w-4" aria-hidden />
          <input type="search" value={query} placeholder="جستجو" aria-label="جستجوی قالب" onChange={(event) => setQuery(event.target.value)} />
          {query ? (
            <button type="button" aria-label="پاک کردن جستجو" onClick={() => setQuery('')}>
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
        <button type="button" className="draft-templates-showcase-add" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          افزودن قالب پیش‌نویس
        </button>
      </div>

      {visibleTemplates.length ? (
        <div className="draft-template-list draft-templates-showcase-list">
          {visibleTemplates.map((template) => {
            const usage = usageMap.get(template.id);
            return (
              <TemplateListCard
                key={template.id}
                template={template}
                usageCount={usage?.count ?? 0}
                usageLabels={usage?.labels ?? []}
                onOpen={() => openTemplate(template)}
                onDelete={() => deleteTemplate(template.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="draft-template-empty draft-templates-showcase-empty">
          <FileText className="h-8 w-8" />
          <p>هنوز قالب پیش‌نویسی ثبت نشده است.</p>
          <button type="button" className="draft-templates-showcase-add" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            افزودن قالب پیش‌نویس
          </button>
        </div>
      )}

      <CreateTemplateDialog
        open={dialogOpen}
        years={years}
        tenantId={tenantId}
        existingTemplateNames={templates.map((template) => template.name)}
        onClose={() => setDialogOpen(false)}
        onCreated={createTemplate}
      />
    </div>
  );
}
