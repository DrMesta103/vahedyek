'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { useId, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export type TaavBusinessFormDialogField = {
  id: string;
  label: ReactNode;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  helperText?: ReactNode;
  required?: boolean;
  multiline?: boolean;
  onChange?: (value: string) => void;
};

export type TaavBusinessFormDialogCardProps = {
  title: ReactNode;
  description?: ReactNode;
  fields: TaavBusinessFormDialogField[];
  secondaryToggle?: {
    selected?: boolean;
    defaultSelected?: boolean;
    label?: ReactNode;
    onChange?: (selected: boolean) => void;
  };
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  loading?: boolean;
  themeMode?: 'auto' | 'light' | 'dark';
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onChange'>;

export function TaavBusinessFormDialogCard({
  title,
  description,
  fields,
  secondaryToggle,
  confirmLabel = 'ثبت',
  cancelLabel = 'لغو',
  onConfirm,
  onCancel,
  disabled = false,
  loading = false,
  themeMode = 'auto',
  className,
  ...rest
}: TaavBusinessFormDialogCardProps) {
  const titleId = useId();
  const [toggleState, setToggleState] = useState(Boolean(secondaryToggle?.defaultSelected));
  const toggleSelected = secondaryToggle?.selected ?? toggleState;

  const updateToggle = () => {
    if (disabled || loading || !secondaryToggle) return;
    const next = !toggleSelected;
    if (secondaryToggle.selected === undefined) setToggleState(next);
    secondaryToggle.onChange?.(next);
  };

  return (
    <article {...rest} dir="rtl" aria-labelledby={titleId} data-taav-business-form-dialog-card data-theme-mode={themeMode} className={cn('flex min-h-[440px] w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] border border-[var(--taav-business-form-dialog-border)] bg-[var(--taav-business-form-dialog-surface)] text-right text-[var(--taav-business-form-dialog-body)] shadow-[var(--taav-business-form-dialog-shadow)]', disabled ? 'opacity-60' : '', className)}>
      <div className="flex flex-1 flex-col px-[24px] pb-[22px] pt-[22px]">
        <h2 id={titleId} className="m-0 text-[22px] font-bold leading-8 text-[var(--taav-business-form-dialog-title)]">{title}</h2>
        {description ? <p className="m-0 mt-[18px] text-[13px] leading-6 text-[var(--taav-business-form-dialog-body)]">{description}</p> : null}

        <div className="mt-[16px] grid gap-[16px]">
          {fields.map((field) => <DialogField key={field.id} field={field} disabled={disabled || loading} />)}
          {secondaryToggle ? (
            <div className="border-t border-[var(--taav-business-form-dialog-divider)] pt-[16px]">
              <div dir="ltr" className="flex items-end gap-3">
                <button type="button" role="checkbox" aria-checked={toggleSelected} onClick={updateToggle} disabled={disabled || loading} className={cn('inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-[var(--taav-business-form-dialog-field-border)] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]', toggleSelected ? 'border-[var(--taav-business-form-dialog-accent)] bg-[var(--taav-business-form-dialog-accent)]' : 'bg-transparent')}>
                  {toggleSelected ? <Check className="h-6 w-6" strokeWidth={2} aria-hidden="true" /> : null}
                </button>
                <div dir="rtl" className="min-w-0 flex-1"><DialogField field={{ id: `${titleId}-secondary`, label: secondaryToggle.label ?? 'پلاک فرعی', required: true, helperText: 'لطفاً عدد وارد کنید.' }} disabled={disabled || loading} compact active={toggleSelected} /></div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <footer className="flex items-center justify-start gap-[42px] border-t border-[var(--taav-business-form-dialog-footer-border)] bg-[var(--taav-business-form-dialog-footer)] px-[30px] py-[21px] text-[16px] font-semibold text-[var(--taav-business-form-dialog-accent)]">
        <button type="button" onClick={onConfirm} disabled={disabled || loading} className="transition-colors hover:text-[#007f86] focus-visible:outline-none focus-visible:underline disabled:opacity-50">{confirmLabel}</button>
        <button type="button" onClick={onCancel} disabled={disabled || loading} className="transition-colors hover:text-[#007f86] focus-visible:outline-none focus-visible:underline disabled:opacity-50">{cancelLabel}</button>
      </footer>
    </article>
  );
}

function DialogField({ field, disabled, compact = false, active = false }: { field: TaavBusinessFormDialogField; disabled: boolean; compact?: boolean; active?: boolean }) {
  const inputId = useId();
  const [internalValue, setInternalValue] = useState(field.defaultValue ?? '');
  const currentValue = field.value ?? internalValue;
  const change = (next: string) => { if (field.value === undefined) setInternalValue(next); field.onChange?.(next); };
  return (
    <div className={cn('grid gap-[5px]', compact ? 'gap-[3px]' : '')}>
      <label htmlFor={inputId} className={cn('text-[15px] font-semibold leading-6', active ? 'text-[var(--taav-business-form-dialog-accent)]' : 'text-[var(--taav-business-form-dialog-label)]')}>{field.label}{field.required ? <span className="mr-1 text-[#ef4444]" aria-hidden="true">*</span> : null}</label>
      {field.multiline ? <textarea id={inputId} value={currentValue} placeholder={field.placeholder} disabled={disabled} required={field.required} onChange={(event) => change(event.target.value)} className={cn('min-h-[80px] w-full resize-y rounded-[9px] border bg-[var(--taav-business-form-dialog-field-bg)] px-3 py-2 text-[14px] text-[var(--taav-business-form-dialog-field-text)] outline-none focus:border-[var(--taav-business-form-dialog-accent)] focus:ring-2 focus:ring-[rgba(0,156,166,0.12)]', active ? 'border-[var(--taav-business-form-dialog-accent)]' : 'border-[var(--taav-business-form-dialog-field-border)]')} /> : <input id={inputId} value={currentValue} placeholder={field.placeholder} disabled={disabled} required={field.required} onChange={(event) => change(event.target.value)} className={cn('h-[38px] w-full rounded-[9px] border bg-[var(--taav-business-form-dialog-field-bg)] px-3 text-[14px] text-[var(--taav-business-form-dialog-field-text)] outline-none focus:border-[var(--taav-business-form-dialog-accent)] focus:ring-2 focus:ring-[rgba(0,156,166,0.12)]', active ? 'border-[var(--taav-business-form-dialog-accent)]' : 'border-[var(--taav-business-form-dialog-field-border)]')} />}
      {field.helperText ? <div className="flex justify-between text-[11px] leading-5 text-[var(--taav-business-form-dialog-muted)]"><span>{field.helperText}</span><span>{currentValue.length}/255</span></div> : null}
    </div>
  );
}
