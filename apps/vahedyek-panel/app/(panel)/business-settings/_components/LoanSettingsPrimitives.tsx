'use client';

import Link from 'next/link';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { ChoicePills as UiChoicePills, PersianDatePicker, RULE_PANEL_TEXT_INPUT_CLASSNAME } from '@repo/ui';
import { BusinessSettingsSubmitButton } from './BusinessSettingsSubmitButton';
import { ProfileAwareUnitInput } from '../../../components/ProfileAwareUnitInput';

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function LoanPageShell({
  title,
  description,
  backHref,
  children,
}: {
  title: string;
  description: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <div className="space-y-5 rounded-[8px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[color:var(--border-soft)] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="text-right">
            <h1 className="text-xl font-black text-[color:var(--text-strong)] sm:text-2xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-[color:var(--text-muted)]">{description}</p>
          </div>
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 self-start rounded-full border border-[color:var(--theme-accent-border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-bold text-[color:var(--theme-action-text)] transition hover:bg-[color:var(--theme-accent-softer)]"
            >
              بازگشت
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function LoanLoadingState({ label }: { label: string }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[8px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-8 text-center text-sm text-[color:var(--text-muted)]">
        {label}
      </div>
    </section>
  );
}

export function LoanSectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] ${className}`}>{children}</section>;
}

export function LoanIntroCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-[8px] border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] px-4 py-4 text-right">
      <div className="mb-2 inline-flex items-center gap-2 text-base font-black text-[color:var(--text-strong)]">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        {title}
      </div>
      <p className="text-sm leading-7 text-[color:var(--text-muted)]">{description}</p>
    </div>
  );
}

export function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
  return (
    <label className="mb-3 block text-right text-[15px] font-black text-[color:var(--text-strong)]">
      {label}
      {required ? <span className="mr-1 text-[#ff6b7a]">*</span> : null}
    </label>
  );
}

export function ContractRegistrationSwitch({
  checked,
  onChange,
  variant = 'toggle',
  activeLabel = 'فعال',
  inactiveLabel = 'غیرفعال',
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  variant?: 'toggle' | 'segmented';
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  if (variant === 'segmented') {
    return (
      <button type="button" className="business-switch" aria-pressed={checked} onClick={() => onChange(!checked)}>
        <span className="business-switch-option is-on">{activeLabel}</span>
        <span className="business-switch-option is-off">{inactiveLabel}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'loan-toggle-switch relative inline-flex h-8 w-14 shrink-0 rounded-full border transition-colors',
        checked ? 'border-[#0f8b8d] bg-[#0f8b8d]' : 'border-[#8ea8c5] bg-white',
      )}
    >
      <span
        className={cn(
          'absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(15,59,105,0.18)] transition-all',
          checked ? 'left-[1.7rem]' : 'left-0.5',
        )}
      />
    </button>
  );
}

export function LoanTabButton({
  title,
  description,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex min-w-[220px] flex-1 flex-col items-center justify-center gap-3 px-4 py-5 text-center transition',
        active ? 'text-[color:var(--text-strong)]' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]',
      )}
    >
      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full border transition',
          active
            ? 'border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] text-[color:var(--theme-action-text)]'
            : 'border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)]',
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <div className="text-sm font-black">{title}</div>
        <div className="text-xs leading-6 text-[color:var(--text-muted)]">{description}</div>
      </div>
      <span
        className={cn(
          'absolute inset-x-4 bottom-0 h-[2px] transition',
          active ? 'bg-[color:var(--theme-action-border)]' : 'bg-transparent group-hover:bg-[color:var(--border-soft)]',
        )}
      />
    </button>
  );
}

export function FinancialAmountInput({
  value,
  onChange,
  placeholder,
  suffix,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix: string;
}) {
  return <ProfileAwareUnitInput value={value} onChange={onChange} placeholder={placeholder} suffix={suffix} numericMode={suffix === '%' ? 'decimal' : 'integer'} />;
}

export function LoanDateInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <PersianDatePicker
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? 'انتخاب تاریخ'}
      containerClassName="w-full"
      className={`${RULE_PANEL_TEXT_INPUT_CLASSNAME} !pr-11`}
    />
  );
}

export function LoanChoicePills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}) {
  return (
    <UiChoicePills
      ariaLabel={ariaLabel}
      options={options}
      value={value}
      onChange={onChange}
      wrap
      className="justify-end flex-row-reverse"
    />
  );
}

export function CollapsibleTagSelector<T extends string>({
  title,
  options,
  value,
  onChange,
  selectedLabel,
  defaultExpanded = true,
}: {
  title: string;
  options: { value: T; label: string }[];
  value?: T | null;
  onChange: (value: T) => void;
  selectedLabel?: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const resolvedSelectedLabel = selectedLabel ?? options.find((option) => option.value === value)?.label ?? '';

  return (
    <section className="border-y border-[color:var(--border-soft)] bg-[color:var(--surface)]">
      <div className="flex items-center justify-between px-3 py-4">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-soft)]"
        >
          <ChevronDown className={cn('h-5 w-5 transition-transform', expanded ? '' : '-rotate-90')} />
        </button>
        {resolvedSelectedLabel && !expanded ? (
          <span className="rounded-full border border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] px-5 py-2 text-sm font-black text-[color:var(--theme-action-text)]">
            {resolvedSelectedLabel}
          </span>
        ) : (
          <h2 className="text-[18px] font-black text-[color:var(--text-strong)]">{title}</h2>
        )}
      </div>

      {expanded ? (
        <div className="border-t border-[color:var(--border-soft)] px-3 py-4">
          <LoanChoicePills
            ariaLabel={title}
            options={options}
            value={(value ?? options[0]?.value) as T}
            onChange={(nextValue) => {
              onChange(nextValue);
              setExpanded(false);
            }}
          />
        </div>
      ) : null}
    </section>
  );
}

export function LoanSuccess({ message }: { message: string }) {
  return <section className="rounded-[8px] border border-[#11b5c9]/50 bg-[#11b5c9]/10 p-4 text-sm text-[#0f5f70]">{message}</section>;
}

export function LoanError({ error }: { error: string }) {
  return <div className="rounded-[8px] border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">{error}</div>;
}

export function LoanSaveBar({
  saving,
  onSave,
  label,
  savingLabel,
}: {
  saving: boolean;
  onSave: () => void;
  label?: string;
  savingLabel?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-20 px-4 pointer-events-none sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl justify-end">
        <BusinessSettingsSubmitButton saving={saving} onClick={onSave} label={label} savingLabel={savingLabel} />
      </div>
    </div>
  );
}





