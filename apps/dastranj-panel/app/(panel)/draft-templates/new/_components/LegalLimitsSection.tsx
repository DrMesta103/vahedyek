'use client';

import { Plus, Save, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { PanelFormModal, PanelFormModalActions } from '../../../../components/PanelFormModal';

export type TaxBracket = {
  id: string;
  startAmount: string;
  endAmount: string;
  percent: string;
};

export type LegalLimits = {
  employeeInsuranceShare?: string;
  employerInsuranceShare?: string;
  unemploymentInsuranceShare?: string;
  insuranceCeilingCoefficient?: string;
  monthlyTaxExemption?: string;
  taxBrackets?: TaxBracket[];
};

type LegalLimitsSectionProps = {
  values?: LegalLimits | null;
  onFocus: () => void;
  onDirty: () => void;
  stepDirty: boolean;
  stepSavedAt: number | null;
  stepSaving: boolean;
  onSave: () => void;
};

const legalLimitFields = [
  {
    id: 'employeeInsuranceShare',
    title: 'نرخ سهم کارگر (%)',
    description: 'نرخ بیمه سهم کارگر که از حقوق کارگر کسر می‌شود.',
  },
  {
    id: 'employerInsuranceShare',
    title: 'نرخ بیمه سهم کارفرما (%)',
    description: 'نرخ بیمه سهم کارفرما که توسط کارفرما پرداخت می‌شود.',
  },
  {
    id: 'unemploymentInsuranceShare',
    title: 'نرخ بیمه بیکاری (%) (به عهده کارفرما)',
    description: 'نرخ بیمه بیکاری که به عهده کارفرما و در محاسبات بیمه است.',
  },
  {
    id: 'insuranceCeilingCoefficient',
    title: 'ضریب سقف مشمول بیمه',
    description: 'ضریب سقف دستمزد مشمول بیمه نسبت به حداقل مزد مصوب.',
  },
  {
    id: 'monthlyTaxExemption',
    title: 'معافیت مالیاتی ماهانه',
    description: 'مبلغ معافیت مالیاتی ماهانه قبل از اعمال پله‌های مالیات.',
  },
] as const;

function normalizeDecimal(value: string) {
  const latin = value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[^\d.]/g, '');
  const [whole, ...rest] = latin.split('.');
  return rest.length ? `${whole}.${rest.join('')}` : whole;
}

function normalizeDecimalInput(event: FormEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  input.value = normalizeDecimal(input.value);
}

function createEmptyTaxBracket(): TaxBracket {
  return {
    id: crypto.randomUUID(),
    startAmount: '',
    endAmount: '',
    percent: '',
  };
}

function TaxBracketDialog({
  open,
  initialBracket,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initialBracket?: TaxBracket | null;
  onClose: () => void;
  onConfirm: (bracket: TaxBracket) => void;
}) {
  const [startAmount, setStartAmount] = useState('');
  const [endAmount, setEndAmount] = useState('');
  const [percent, setPercent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStartAmount(initialBracket?.startAmount ?? '');
    setEndAmount(initialBracket?.endAmount ?? '');
    setPercent(initialBracket?.percent ?? '');
    setError(null);
  }, [initialBracket, open]);

  const handleConfirm = () => {
    const normalizedStart = normalizeDecimal(startAmount);
    const normalizedEnd = normalizeDecimal(endAmount);
    const normalizedPercent = normalizeDecimal(percent);

    if (!normalizedStart || !normalizedEnd || !normalizedPercent) {
      setError('همه فیلدهای پله مالیاتی الزامی هستند.');
      return;
    }

    onConfirm({
      id: initialBracket?.id ?? crypto.randomUUID(),
      startAmount: normalizedStart,
      endAmount: normalizedEnd,
      percent: normalizedPercent,
    });
    onClose();
  };

  return (
    <PanelFormModal
      open={open}
      title="افزودن پله"
      onClose={onClose}
      error={error}
      footer={
        <PanelFormModalActions
          submitLabel="تایید"
          cancelLabel="لغو"
          onSubmit={handleConfirm}
          onCancel={onClose}
        />
      }
    >
      <div className="draft-template-tax-bracket-form">
        <label className="calendar-create-field">
          <span>
            مبلغ شروع <em>*</em>
          </span>
          <div className="draft-template-tax-bracket-input">
            <input
              value={startAmount}
              inputMode="decimal"
              placeholder="۰"
              onChange={(event) => setStartAmount(normalizeDecimal(event.target.value))}
            />
            {startAmount ? (
              <button type="button" aria-label="پاک کردن مبلغ شروع" onClick={() => setStartAmount('')}>
                <X className="h-4 w-4" strokeWidth={2.1} />
              </button>
            ) : null}
          </div>
        </label>

        <label className="calendar-create-field">
          <span>
            مبلغ پایان <em>*</em>
          </span>
          <div className="draft-template-tax-bracket-input">
            <input
              value={endAmount}
              inputMode="decimal"
              onChange={(event) => setEndAmount(normalizeDecimal(event.target.value))}
            />
            {endAmount ? (
              <button type="button" aria-label="پاک کردن مبلغ پایان" onClick={() => setEndAmount('')}>
                <X className="h-4 w-4" strokeWidth={2.1} />
              </button>
            ) : null}
          </div>
        </label>

        <label className="calendar-create-field">
          <span>
            درصد (%) <em>*</em>
          </span>
          <div className="draft-template-tax-bracket-input">
            <input
              value={percent}
              inputMode="decimal"
              onChange={(event) => setPercent(normalizeDecimal(event.target.value))}
            />
            {percent ? (
              <button type="button" aria-label="پاک کردن درصد" onClick={() => setPercent('')}>
                <X className="h-4 w-4" strokeWidth={2.1} />
              </button>
            ) : null}
          </div>
        </label>
      </div>
    </PanelFormModal>
  );
}

export function LegalLimitsSection({
  values,
  onFocus,
  onDirty,
  stepDirty,
  stepSavedAt,
  stepSaving,
  onSave,
}: LegalLimitsSectionProps) {
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>(values?.taxBrackets ?? []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBracket, setEditingBracket] = useState<TaxBracket | null>(null);

  useEffect(() => {
    setTaxBrackets(values?.taxBrackets ?? []);
  }, [values?.taxBrackets]);

  const openDialog = (bracket: TaxBracket | null = null) => {
    setEditingBracket(bracket);
    setDialogOpen(true);
  };

  const handleConfirmBracket = (bracket: TaxBracket) => {
    setTaxBrackets((current) => {
      const exists = current.some((item) => item.id === bracket.id);
      return exists ? current.map((item) => (item.id === bracket.id ? bracket : item)) : [...current, bracket];
    });
    onDirty();
  };

  const handleRemoveBracket = (id: string) => {
    setTaxBrackets((current) => current.filter((item) => item.id !== id));
    onDirty();
  };

  return (
    <>
      <section
        id="legalLimits"
        className="draft-template-flow-section draft-template-flow-legal-limits-section"
        onFocus={onFocus}
      >
        <header className="draft-template-flow-section-head">
          <div>
            <h2>کسورات قانونی و حدود بیمه / مالیات</h2>
            <p>نرخ‌های بیمه و مالیات</p>
          </div>
        </header>

        <div className="draft-template-flow-legal-limits-grid">
          {legalLimitFields.map((field) => (
            <label key={field.id} className="draft-template-flow-legal-limit-field">
              <span>{field.title}</span>
              <div>
                <input
                  name={field.id}
                  defaultValue={values?.[field.id] ?? ''}
                  inputMode="decimal"
                  placeholder="۰"
                  onInput={(event) => {
                    normalizeDecimalInput(event);
                    onDirty();
                  }}
                />
                <button
                  type="button"
                  aria-label="پاک کردن مقدار"
                  onClick={(event) => {
                    const input = event.currentTarget.previousElementSibling;
                    if (input instanceof HTMLInputElement) {
                      input.value = '';
                      onDirty();
                    }
                  }}
                >
                  <X className="h-4 w-4" strokeWidth={2.1} />
                </button>
              </div>
              <small>{field.description}</small>
            </label>
          ))}
        </div>

        <input type="hidden" name="taxBracketsJson" value={JSON.stringify(taxBrackets)} />

        <div className="draft-template-flow-tax-brackets-panel">
          <div className="draft-template-flow-tax-brackets-head">
            <h3>پله های مالیات حقوق</h3>
            {taxBrackets.length === 0 ? <p>هنوز پله مالیاتی ثبت نشده است.</p> : null}
          </div>
          <button type="button" onClick={() => openDialog(createEmptyTaxBracket())}>
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            افزودن پله
          </button>
          {taxBrackets.length > 0 ? (
            <ul className="draft-template-flow-tax-brackets-list">
              {taxBrackets.map((bracket) => (
                <li key={bracket.id}>
                  <button type="button" className="is-edit" onClick={() => openDialog(bracket)}>
                    <strong>{bracket.percent}%</strong>
                    <span>
                      از {bracket.startAmount} تا {bracket.endAmount}
                    </span>
                  </button>
                  <button type="button" className="is-remove" aria-label="حذف پله" onClick={() => handleRemoveBracket(bracket.id)}>
                    <X className="h-4 w-4" strokeWidth={2.1} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="draft-template-flow-section-footer">
          <button
            type="button"
            className={`draft-template-flow-section-save ${stepDirty ? 'is-dirty' : 'is-saved'}`}
            disabled={Boolean(!stepDirty && stepSavedAt) || stepSaving}
            onClick={onSave}
          >
            <Save className="h-4 w-4" strokeWidth={2.1} />
            {stepSaving ? 'در حال ذخیره...' : stepDirty ? 'ذخیره تغییرات' : stepSavedAt ? 'ذخیره شده' : 'ذخیره'}
          </button>
        </div>
      </section>

      <TaxBracketDialog
        open={dialogOpen}
        initialBracket={editingBracket}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmBracket}
      />
    </>
  );
}
