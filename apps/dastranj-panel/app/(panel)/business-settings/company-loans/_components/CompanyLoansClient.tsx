'use client';

import { TaavChoiceChipGroup } from '@repo/ui/taav/forms';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../../../components/ConfirmDialog';
import { PanelFormModal, PanelFormModalActions } from '../../../../components/PanelFormModal';
import { formatFaNumber } from '../../../../lib/format-fa';
import type { CompanyLoanItem } from '../../../../lib/employee-requests';
import { deleteCompanyLoanAction, saveCompanyLoanAction } from '../../../../lib/employee-request-actions';

type CompanyLoanForm = {
  id?: string;
  title: string;
  guarantorCount: string;
  minAmount: string;
  maxAmount: string;
  minInstallments: string;
  maxInstallments: string;
  feeRate: string;
  interestRate: string;
  isActive: boolean;
};

const emptyForm: CompanyLoanForm = {
  title: '',
  guarantorCount: '',
  minAmount: '',
  maxAmount: '',
  minInstallments: '',
  maxInstallments: '',
  feeRate: '',
  interestRate: '',
  isActive: true,
};

const faDigits = '۰۱۲۳۴۵۶۷۸۹';
const arDigits = '٠١٢٣٤٥٦٧٨٩';

function normalizeNumberInput(value: string) {
  return value
    .replace(/[۰-۹]/g, (char) => String(faDigits.indexOf(char)))
    .replace(/[٠-٩]/g, (char) => String(arDigits.indexOf(char)))
    .replace(/,/g, '')
    .trim();
}

function positiveNumber(value: string) {
  const normalized = normalizeNumberInput(value);
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function requiredPositive(value: string) {
  if (!normalizeNumberInput(value)) return 'این فیلد الزامی است';
  return positiveNumber(value) == null ? 'مقدار باید عددی مثبت باشد' : '';
}

function loanToForm(loan: CompanyLoanItem): CompanyLoanForm {
  return {
    id: loan.id,
    title: loan.title,
    guarantorCount: String(loan.guarantorCount),
    minAmount: String(loan.minAmount),
    maxAmount: String(loan.maxAmount),
    minInstallments: String(loan.minInstallments),
    maxInstallments: String(loan.maxInstallments),
    feeRate: String(loan.feeRate),
    interestRate: String(loan.interestRate),
    isActive: loan.isActive,
  };
}

function amount(value: number) {
  return `${formatFaNumber(value)} ریال`;
}

export function CompanyLoansClient({ loans }: { loans: CompanyLoanItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<CompanyLoanForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CompanyLoanItem | null>(null);
  const activeCount = useMemo(() => loans.filter((loan) => loan.isActive).length, [loans]);

  const openCreate = () => {
    setForm(emptyForm);
    setFieldErrors({});
    setFormError('');
    setEditorOpen(true);
  };

  const openEdit = (loan: CompanyLoanItem) => {
    setForm(loanToForm(loan));
    setFieldErrors({});
    setFormError('');
    setEditorOpen(true);
  };

  const updateForm = (patch: Partial<CompanyLoanForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    setFieldErrors({});
    setFormError('');
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'این فیلد الزامی است';
    errors.guarantorCount = requiredPositive(form.guarantorCount);
    errors.minAmount = requiredPositive(form.minAmount);
    errors.maxAmount = requiredPositive(form.maxAmount);
    errors.minInstallments = requiredPositive(form.minInstallments);
    errors.maxInstallments = requiredPositive(form.maxInstallments);
    errors.feeRate = requiredPositive(form.feeRate);
    errors.interestRate = requiredPositive(form.interestRate);

    const minAmount = positiveNumber(form.minAmount);
    const maxAmount = positiveNumber(form.maxAmount);
    const minInstallments = positiveNumber(form.minInstallments);
    const maxInstallments = positiveNumber(form.maxInstallments);
    if (minAmount != null && maxAmount != null && minAmount > maxAmount) {
      errors.minAmount = 'حداقل مبلغ نمی‌تواند بیشتر از حداکثر مبلغ باشد';
    }
    if (minInstallments != null && maxInstallments != null && minInstallments > maxInstallments) {
      errors.minInstallments = 'حداقل اقساط نمی‌تواند بیشتر از حداکثر اقساط باشد';
    }

    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const payload = {
      id: form.id,
      title: form.title.trim(),
      guarantorCount: positiveNumber(form.guarantorCount) ?? 0,
      minAmount: positiveNumber(form.minAmount) ?? 0,
      maxAmount: positiveNumber(form.maxAmount) ?? 0,
      minInstallments: positiveNumber(form.minInstallments) ?? 0,
      maxInstallments: positiveNumber(form.maxInstallments) ?? 0,
      feeRate: positiveNumber(form.feeRate) ?? 0,
      interestRate: positiveNumber(form.interestRate) ?? 0,
      isActive: form.isActive,
    };

    startTransition(async () => {
      try {
        await saveCompanyLoanAction(payload);
        setEditorOpen(false);
        router.refresh();
      } catch {
        setFormError('ثبت وام سازمانی با خطا مواجه شد.');
      }
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startTransition(async () => {
      try {
        await deleteCompanyLoanAction(id);
        setDeleteTarget(null);
        router.refresh();
      } catch {
        setFormError('حذف وام سازمانی با خطا مواجه شد.');
      }
    });
  };

  return (
    <section className="company-loans-workspace">
      <div className="company-loans-toolbar">
        <div>
          <strong>{formatFaNumber(loans.length, { useGrouping: false })} وام تعریف شده</strong>
          <span>{formatFaNumber(activeCount, { useGrouping: false })} وام فعال برای درخواست کارمندان</span>
        </div>
        <button type="button" className="module-page-add-btn" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          <span>افزودن وام</span>
        </button>
      </div>

      {loans.length ? (
        <div className="company-loans-grid">
          {loans.map((loan) => (
            <article key={loan.id} className="company-loan-card">
              <div className="company-loan-card-head">
                <div>
                  <h2>{loan.title}</h2>
                  <span className={loan.isActive ? 'company-loan-status is-active' : 'company-loan-status'}>
                    {loan.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
                <div className="company-loan-actions">
                  <button type="button" onClick={() => openEdit(loan)} aria-label="ویرایش">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(loan)} aria-label="حذف">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <dl className="company-loan-meta">
                <div><dt>مبلغ</dt><dd>{amount(loan.minAmount)} تا {amount(loan.maxAmount)}</dd></div>
                <div><dt>اقساط</dt><dd>{formatFaNumber(loan.minInstallments)} تا {formatFaNumber(loan.maxInstallments)}</dd></div>
                <div><dt>ضامن</dt><dd>{formatFaNumber(loan.guarantorCount)}</dd></div>
                <div><dt>کارمزد</dt><dd>{formatFaNumber(loan.feeRate)}٪</dd></div>
                <div><dt>سود</dt><dd>{formatFaNumber(loan.interestRate)}٪</dd></div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <div className="company-loans-empty">
          <strong>هنوز وامی در تنظیمات کسب و کار تعریف نشده است</strong>
          <p>بعد از تعریف وام، این موارد در دیالوگ درخواست وام کارمند نمایش داده می‌شوند.</p>
          <button type="button" className="module-page-add-btn" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <span>تعریف اولین وام</span>
          </button>
        </div>
      )}

      <PanelFormModal
        open={editorOpen}
        title={form.id ? 'ویرایش وام سازمانی' : 'افزودن وام سازمانی'}
        lead="مقادیر این فرم مستقیما در درخواست وام کارمندان استفاده می‌شود."
        error={formError}
        onClose={() => setEditorOpen(false)}
        footer={
          <PanelFormModalActions
            submitLabel="ذخیره"
            saving={pending}
            disabled={pending}
            onSubmit={save}
            onCancel={() => setEditorOpen(false)}
          />
        }
      >
        <div className="company-loan-form-grid">
          <label className="business-payroll-field">
            <span className="business-payroll-field-label">عنوان</span>
            <input value={form.title} onChange={(event) => updateForm({ title: event.target.value })} />
            {fieldErrors.title ? <small>{fieldErrors.title}</small> : null}
          </label>
          <label className="business-payroll-field">
            <span className="business-payroll-field-label">تعداد ضامن</span>
            <input value={form.guarantorCount} onChange={(event) => updateForm({ guarantorCount: event.target.value })} inputMode="numeric" />
            {fieldErrors.guarantorCount ? <small>{fieldErrors.guarantorCount}</small> : null}
          </label>
          <label className="business-payroll-field">
            <span className="business-payroll-field-label">حداقل مبلغ</span>
            <input value={form.minAmount} onChange={(event) => updateForm({ minAmount: event.target.value })} inputMode="decimal" />
            {fieldErrors.minAmount ? <small>{fieldErrors.minAmount}</small> : null}
          </label>
          <label className="business-payroll-field">
            <span className="business-payroll-field-label">حداکثر مبلغ</span>
            <input value={form.maxAmount} onChange={(event) => updateForm({ maxAmount: event.target.value })} inputMode="decimal" />
            {fieldErrors.maxAmount ? <small>{fieldErrors.maxAmount}</small> : null}
          </label>
          <label className="business-payroll-field">
            <span className="business-payroll-field-label">حداقل اقساط</span>
            <input value={form.minInstallments} onChange={(event) => updateForm({ minInstallments: event.target.value })} inputMode="numeric" />
            {fieldErrors.minInstallments ? <small>{fieldErrors.minInstallments}</small> : null}
          </label>
          <label className="business-payroll-field">
            <span className="business-payroll-field-label">حداکثر اقساط</span>
            <input value={form.maxInstallments} onChange={(event) => updateForm({ maxInstallments: event.target.value })} inputMode="numeric" />
            {fieldErrors.maxInstallments ? <small>{fieldErrors.maxInstallments}</small> : null}
          </label>
          <label className="business-payroll-field">
            <span className="business-payroll-field-label">نرخ کارمزد</span>
            <input value={form.feeRate} onChange={(event) => updateForm({ feeRate: event.target.value })} inputMode="decimal" />
            {fieldErrors.feeRate ? <small>{fieldErrors.feeRate}</small> : null}
          </label>
          <label className="business-payroll-field">
            <span className="business-payroll-field-label">نرخ سود</span>
            <input value={form.interestRate} onChange={(event) => updateForm({ interestRate: event.target.value })} inputMode="decimal" />
            {fieldErrors.interestRate ? <small>{fieldErrors.interestRate}</small> : null}
          </label>
          <TaavChoiceChipGroup
            label="وضعیت"
            options={[
              { value: 'active', label: 'فعال' },
              { value: 'inactive', label: 'غیرفعال' },
            ]}
            value={form.isActive ? 'active' : 'inactive'}
            onValueChange={(next) => updateForm({ isActive: (Array.isArray(next) ? next[0] : next) === 'active' })}
          />
        </div>
      </PanelFormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف وام سازمانی"
        description={deleteTarget ? `آیا از حذف «${deleteTarget.title}» مطمئن هستید؟` : ''}
        confirmLabel="بله، حذف شود"
        cancelLabel="انصراف"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
