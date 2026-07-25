'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { useId, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';

export type TaavMobileNumberInputCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  label?: ReactNode;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  helperText?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  loading?: boolean;
  maxLength?: number;
  icon?: ReactNode;
  className?: string;
  wrapperClassName?: string;
  inputClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onChange'>;

function normalizeMobileNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 50);
}

function isPotentiallyValidIranMobile(value: string) {
  if (!value) return true;
  return /^09\d{0,9}$/.test(value) || /^9\d{0,9}$/.test(value);
}

function MobileCardIcon({ icon }: { icon?: ReactNode }) {
  return (
    <span className="inline-flex h-[86px] w-[86px] shrink-0 items-center justify-center text-[#174154]" aria-hidden="true">
      {icon ?? (
        <svg viewBox="0 0 86 86" className="h-[86px] w-[86px]" role="img" aria-label="نشان واحدیک">
          <path d="M31 14 47 18v51l-16 4Z" fill="#174154" />
          <path d="M47 18c13 1 20 7 20 16 0 7-5 12-13 15 8-4 13-9 13-15 0-8-7-14-20-16Z" fill="#18b86b" />
          <path d="M30 74c10 2 19 1 27-3-8 6-18 8-29 5Z" fill="#18b86b" />
          <text x="43" y="82" textAnchor="middle" fill="#18b86b" fontSize="6" fontFamily="Tahoma">واحدیک</text>
        </svg>
      )}
    </span>
  );
}

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="پاک کردن شماره موبایل"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#777777] transition-colors hover:bg-[#f1f1f1] hover:text-[#555555] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,143,143,0.24)]"
    >
      <X className="h-[17px] w-[17px]" strokeWidth={2.3} />
    </button>
  );
}

export function TaavMobileNumberInputCard({
  title = 'وارد کردن شماره موبایل',
  description = 'شماره موبایل کاربر برای ثبت و ارتباط در فرم‌های کسب‌وکاری استفاده می‌شود.',
  label = 'موبایل یا ایمیل',
  placeholder = '',
  value,
  defaultValue = '',
  onValueChange,
  helperText = 'وارد کردن شماره موبایل یا ایمیل برای ثبت کاربر ضروری می‌باشد.',
  error,
  required = true,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  loading = false,
  maxLength = 50,
  icon,
  className,
  wrapperClassName,
  inputClassName,
  ...rest
}: TaavMobileNumberInputCardProps) {
  const inputId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const currentValue = value !== undefined ? value : internalValue;
  const resolvedValue = useMemo(() => normalizeMobileNumber(currentValue ?? ''), [currentValue]);
  const touched = resolvedValue.length > 0;
  const invalidFormat = touched && !isPotentiallyValidIranMobile(resolvedValue);
  const isRequiredError = required && touched && !resolvedValue;
  const showError = Boolean(error) || invalidFormat || isRequiredError;
  const shownError = error ?? (isRequiredError ? 'وارد کردن شماره موبایل الزامی است.' : invalidFormat ? 'شماره موبایل وارد شده معتبر نیست.' : null);
  const showClear = Boolean(resolvedValue) && !disabled && !readOnly && !loading;
  const counter = `${resolvedValue.length}/${maxLength}`;

  const handleChange = (nextValue: string) => {
    const sanitized = normalizeMobileNumber(nextValue).slice(0, maxLength);
    if (value === undefined) setInternalValue(sanitized);
    onValueChange?.(sanitized);
  };

  const clearValue = () => {
    if (disabled || readOnly || loading) return;
    if (value === undefined) setInternalValue('');
    onValueChange?.('');
  };

  return (
    <article
      {...rest}
      dir="rtl"
      data-taav-mobile-number-input-card
      className={cn('w-full max-w-[690px] overflow-hidden rounded-[18px] border border-[#d5dde2] bg-white px-[16px] pb-[18px] pt-[20px] text-right shadow-[0_3px_10px_rgba(15,23,42,0.04)]', className)}
    >
      <div className={cn('grid gap-[10px]', wrapperClassName)}>
        <div className="flex justify-center">
          <MobileCardIcon icon={loading ? <span className="h-[24px] w-[24px] rounded-full bg-[rgba(0,143,143,0.18)]" /> : icon} />
        </div>

        <div className="sr-only">
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>

        <label htmlFor={inputId} dir="rtl" className={cn('flex w-full items-center justify-start gap-[3px] text-right text-[16px] font-semibold leading-6 transition-colors', isFocused ? 'text-[#008f8f]' : 'text-[#454545]')}>
          {label}
          {required ? <span className="text-[18px] leading-none text-[#ef4444]" aria-hidden="true">*</span> : null}
        </label>

        {loading ? (
          <TaavSkeleton variant="custom" width="100%" height={40} radius="lg" />
        ) : (
          <div className={cn('relative', disabled ? 'opacity-75' : '')}>
            <div className={cn('relative flex min-h-[40px] items-center overflow-hidden rounded-[13px] border border-[#666666] bg-white transition-[border-color,box-shadow,background-color] duration-150', 'focus-within:border-[color:#008f8f] focus-within:shadow-[0_0_0_3px_rgba(0,143,143,0.10)]', disabled ? 'bg-[rgba(248,250,252,0.95)]' : '')}>
              <div className="absolute left-1 top-1/2 z-10 inline-flex -translate-y-1/2 items-center gap-0 text-[#777777]">
                <span className="inline-flex h-8 w-8 items-center justify-center"><Search className="h-[19px] w-[19px]" strokeWidth={1.6} /></span>
                {showClear ? <ClearButton onClick={clearValue} /> : null}
              </div>
              <input
                id={inputId}
                value={resolvedValue}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                autoFocus={autoFocus}
                required={required}
                maxLength={maxLength}
                inputMode="numeric"
                autoComplete="tel"
                aria-label={typeof label === 'string' ? label : 'شماره موبایل'}
                aria-invalid={showError || undefined}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(event) => handleChange(event.target.value)}
                className={cn('h-[40px] w-full border-0 bg-transparent px-[12px] py-0 text-right text-[16px] font-normal leading-5 text-[#555555] placeholder:text-[#9a9a9a] focus:outline-none', showClear ? 'pl-[76px]' : 'pl-[44px]', inputClassName)}
                dir="rtl"
              />
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-4 text-[12px] leading-5" dir="rtl">
          <div className="min-w-0 text-right">
            {showError ? <p className="m-0 text-[#dc2626]">{shownError}</p> : helperText ? <p className="m-0 text-[#777777]">{helperText}</p> : null}
          </div>
          <span className="shrink-0 text-left font-normal text-[#777777]" aria-label={`مورد استفاده ${counter}`}>{counter}</span>
        </div>
      </div>
    </article>
  );
}
