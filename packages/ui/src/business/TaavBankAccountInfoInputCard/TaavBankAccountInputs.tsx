'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId, useRef, useState } from 'react';
import { Landmark } from 'lucide-react';
import { cn } from '../../utils/cn';

type SharedProps = { label?: ReactNode; helperText?: ReactNode; error?: ReactNode; required?: boolean; disabled?: boolean; readOnly?: boolean; onValueChange?: (value: string) => void; className?: string };

function digits(value: string) { return value.replace(/[۰-۹]/g, (char) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(char))).replace(/\D/g, ''); }
function FieldFrame({ id, label, error, required, helperText, children, className }: { id: string; label: ReactNode; error?: ReactNode; required: boolean; helperText?: ReactNode; children: ReactNode; className?: string }) {
  return <div data-taav-bank-input className={cn('min-w-0', className)}><label htmlFor={id} dir="rtl" className={cn('mb-1 block w-full text-right text-[14px] font-semibold leading-6', error ? 'text-[var(--taav-bank-input-error)]' : 'text-[var(--taav-bank-input-label)]')}><span className="inline-flex items-center gap-1"><span>{label}</span>{required ? <span className="text-[#dc2626]">*</span> : null}</span></label>{children}{error ? <p className="m-0 mt-1 text-right text-[12px] leading-5 text-[var(--taav-bank-input-error)]">{error}</p> : helperText ? <p className="m-0 mt-1 text-right text-[12px] leading-5 text-[var(--taav-bank-input-helper)]">{helperText}</p> : null}</div>;
}
function BankIcon() { return <span className="inline-flex shrink-0 items-center justify-center text-[var(--taav-bank-input-icon)]" aria-hidden="true"><Landmark className="h-7 w-7" strokeWidth={1.5} /></span>; }
function baseInputClass(invalid: boolean) { return cn('h-[38px] w-full rounded-[9px] border bg-[var(--taav-bank-input-surface)] px-3 text-left text-[15px] font-normal tracking-[0.04em] text-[var(--taav-bank-input-text)] outline-none transition-colors placeholder:text-[var(--taav-bank-input-helper)] focus:border-[var(--taav-bank-input-focus)] focus:ring-2 focus:ring-[var(--taav-bank-input-focus-ring)]', invalid ? 'border-[var(--taav-bank-input-error)]' : 'border-[var(--taav-bank-input-border)]'); }

export type TaavBankCardNumberInputProps = SharedProps & { value?: string; defaultValue?: string; autoFocus?: boolean };
export function TaavBankCardNumberInput({ value, defaultValue = '', onValueChange, label = 'شماره کارت', helperText, error, required = true, disabled, readOnly, autoFocus, className }: TaavBankCardNumberInputProps) {
  const [internal, setInternal] = useState(defaultValue); const current = value ?? internal; const parts = Array.from({ length: 4 }, (_, index) => digits(current).slice(index * 4, index * 4 + 4)); const refs = useRef<Array<HTMLInputElement | null>>([]); const id = useId(); const invalid = Boolean(error) || (current.length > 0 && digits(current).length !== 16);
  const update = (index: number, next: string) => { const clean = digits(next).slice(0, 4); const nextParts = [...parts]; nextParts[index] = clean; const joined = nextParts.join(''); if (value === undefined) setInternal(joined); onValueChange?.(joined); if (clean.length === 4 && index < 3) refs.current[index + 1]?.focus(); };
  const paste = (event: React.ClipboardEvent<HTMLInputElement>) => { const clean = digits(event.clipboardData.getData('text')).slice(0, 16); if (!clean) return; event.preventDefault(); if (value === undefined) setInternal(clean); onValueChange?.(clean); refs.current[Math.min(3, Math.floor((clean.length - 1) / 4))]?.focus(); };
  return <FieldFrame id={`${id}-0`} label={label} error={invalid ? error ?? 'شماره کارت باید ۱۶ رقم باشد.' : undefined} helperText={helperText} required={required} className={className}><div dir="ltr" className="flex items-end gap-2"><BankIcon /><div className="grid min-w-0 flex-1 grid-cols-4 gap-2">{parts.map((part, index) => <input key={index} ref={(node) => { refs.current[index] = node; }} id={`${id}-${index}`} value={part} onChange={(event) => update(index, event.target.value)} onPaste={paste} autoFocus={autoFocus && index === 0} disabled={disabled} readOnly={readOnly} inputMode="numeric" maxLength={4} aria-label={`${label} بخش ${index + 1}`} className={baseInputClass(invalid)} />)}</div></div></FieldFrame>;
}

export type TaavShebaNumberInputProps = SharedProps & { value?: string; defaultValue?: string; autoFocus?: boolean; placeholder?: string };
export function TaavShebaNumberInput({ value, defaultValue = '', onValueChange, label = 'شماره شبا', helperText, error, required = true, disabled, readOnly, autoFocus, placeholder = '', className }: TaavShebaNumberInputProps) {
  const [internal, setInternal] = useState(defaultValue); const current = value ?? internal; const clean = current.toUpperCase().replace(/\s/g, ''); const numeric = digits(clean.replace(/^IR/, '')); const invalid = Boolean(error) || (clean.length > 0 && numeric.length !== 24); const id = useId(); const update = (next: string) => { const normalized = next.toUpperCase().replace(/\s/g, '').replace(/[^IR\d]/g, '').replace(/(?!^)I|(?<!^)R/g, '').slice(0, 26); if (value === undefined) setInternal(normalized); onValueChange?.(normalized); };
  return <FieldFrame id={id} label={label} error={invalid ? error ?? 'شماره شبا واردشده معتبر نیست.' : undefined} helperText={helperText} required={required} className={className}><div dir="ltr" className="flex items-end gap-2"><BankIcon /><input id={id} value={clean} onChange={(event) => update(event.target.value)} autoFocus={autoFocus} disabled={disabled} readOnly={readOnly} inputMode="text" placeholder={placeholder} aria-invalid={invalid || undefined} className={cn(baseInputClass(invalid), 'flex-1')} /></div></FieldFrame>;
}

export type TaavBankAccountNumberInputProps = SharedProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'className'> & { value?: string; defaultValue?: string };
export function TaavBankAccountNumberInput({ value, defaultValue = '', onValueChange, label = 'شماره حساب', helperText = '۰ / ۲۰', error, required = true, disabled, readOnly, className, ...props }: TaavBankAccountNumberInputProps) {
  const [internal, setInternal] = useState(defaultValue); const current = value ?? internal; const id = useId(); const update = (next: string) => { const normalized = digits(next).slice(0, 20); if (value === undefined) setInternal(normalized); onValueChange?.(normalized); };
  return <FieldFrame id={id} label={label} error={error} helperText={helperText} required={required} className={cn('md:col-span-2', className)}><input {...props} id={id} value={current} onChange={(event) => update(event.target.value)} disabled={disabled} readOnly={readOnly} inputMode="numeric" aria-invalid={Boolean(error) || undefined} className={baseInputClass(Boolean(error))} /></FieldFrame>;
}
