'use client';

import { Camera, Info, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { TaavChoiceChipGroup } from '@repo/ui/taav/forms';
import { Input, PersianDatePicker } from '@repo/ui';

export function ProfilePageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto flex w-full max-w-[920px] flex-col gap-4 px-3 py-1 sm:px-5 lg:px-6 ${className}`}>{children}</section>;
}

export function ProfileCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`profile-card-shell rounded-[24px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-5 shadow-[0_8px_24px_var(--shadow-soft)] ${className}`}
    >
      {children}
    </section>
  );
}

export function ProfileHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="profile-heading-block grid gap-2 text-right">
      <h1 className="profile-heading-title m-0 text-[21px] font-black leading-tight text-[color:var(--text-strong)]">{title}</h1>
      {description ? <p className="profile-heading-description m-0 text-[12px] leading-6 text-[color:var(--text-muted)]">{description}</p> : null}
    </div>
  );
}

export function ProfileTextField({
  label,
  value,
  onChange,
  required,
  hint,
  placeholder,
  readOnly,
  tooltip,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  readOnly?: boolean;
  tooltip?: string;
}) {
  return (
    <label className="profile-field grid gap-2">
      <span className="profile-field-label inline-flex items-center gap-2 text-[13px] font-bold text-[color:var(--text-strong)]">
        <span>{label}</span>
        {tooltip ? <ProfileInlineTooltip text={tooltip} /> : null}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={readOnly ? 'cursor-not-allowed opacity-90' : ''}
      />
      {hint ? <small className="profile-field-hint text-[11px] leading-6 text-[color:var(--text-muted)]">{hint}</small> : null}
    </label>
  );
}

export function ProfileReadonlyField({
  label,
  value,
  hint,
  tooltip,
}: {
  label: string;
  value: string;
  hint?: string;
  tooltip?: string;
}) {
  return (
    <div className="profile-field grid gap-2">
      <span className="profile-field-label inline-flex items-center gap-2 text-[13px] font-bold text-[color:var(--text-strong)]">
        <span>{label}</span>
        <span className="profile-readonly-badge">
          <LockKeyhole className="h-3 w-3" />
          <span>غیرقابل ویرایش</span>
        </span>
      </span>
      <div className="profile-readonly-field" role="note" aria-readonly="true">
        <span className="profile-readonly-value">{value || '---'}</span>
      </div>
      {hint ? <small className="profile-field-hint text-[11px] leading-6 text-[color:var(--text-muted)]">{hint}</small> : null}
    </div>
  );
}

function ProfileInlineTooltip({ text }: { text: string }) {
  return (
    <span className="profile-inline-tooltip-wrap">
      <button type="button" className="profile-inline-tooltip-trigger" aria-label={text}>
        <Info className="h-3.5 w-3.5" />
      </button>
      <span className="profile-inline-tooltip" role="tooltip">
        <strong className="profile-inline-tooltip-title">راهنما</strong>
        {text}
      </span>
    </span>
  );
}

export function ProfileChipGroup<T extends string>({
  label,
  hint,
  items,
  value,
  onChange,
  className = '',
  pillsClassName = '',
  pillClassName = '',
}: {
  label: string;
  hint?: string;
  items: Array<{ value: T; label: string }>;
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
  pillsClassName?: string;
  pillClassName?: string;
}) {
  return (
    <div className={`profile-chip-group-shell grid gap-2 ${className}`}>
      <TaavChoiceChipGroup
        className={pillsClassName || pillClassName ? `${pillsClassName} ${pillClassName}`.trim() : undefined}
        label={label}
        options={items.map((item) => ({ value: item.value, label: item.label }))}
        value={value ?? ''}
        onValueChange={(next) => onChange((Array.isArray(next) ? next[0] : next) as T)}
        wrap
      />
      {hint ? <small className="profile-field-hint text-[11px] leading-6 text-[color:var(--text-muted)]">{hint}</small> : null}
    </div>
  );
}

export function ProfileDateField({
  label,
  value,
  onChange,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="profile-field grid gap-2">
      <span className="profile-field-label text-[13px] font-bold text-[color:var(--text-strong)]">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      <PersianDatePicker value={value} onChange={onChange} placeholder="YYYY/MM/DD" containerClassName="w-full" />
      {hint ? <small className="profile-field-hint text-[11px] leading-6 text-[color:var(--text-muted)]">{hint}</small> : null}
    </label>
  );
}

export function ProfileUploadCard({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: string;
  onChange: (file: File | null) => void;
}) {
  const inputId = `upload-${title}`;

  return (
    <div className="grid gap-3 rounded-[18px] border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] p-4">
      <div className="grid gap-1">
        <h3 className="m-0 text-[16px] font-black text-[color:var(--text-strong)]">{title}</h3>
        <p className="m-0 text-[12px] leading-6 text-[color:var(--text-muted)]">{description}</p>
      </div>

      <label
        htmlFor={inputId}
        className="grid min-h-[152px] cursor-pointer place-items-center rounded-[18px] border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface)]"
      >
        {value ? (
          <img src={value} alt={title} className="max-h-[136px] w-full object-contain p-2" />
        ) : (
          <div className="grid justify-items-center gap-2 text-[color:var(--text-muted)]">
            <Camera className="h-7 w-7" />
            <span className="text-[12px]">برای انتخاب فایل کلیک کنید</span>
          </div>
        )}
      </label>

      <input id={inputId} type="file" accept="image/*" hidden onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </div>
  );
}

export function ProfileSubmitBar({
  label,
  onClick,
  disabled,
  align = 'end',
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
}) {
  const alignmentClass = align === 'center' ? 'justify-center' : align === 'start' ? 'justify-start' : 'justify-end';

  return (
    <div className={`flex ${alignmentClass}`}>
      <button type="button" className="primary-button min-w-[144px]" onClick={onClick} disabled={disabled}>
        {label}
      </button>
    </div>
  );
}

export function ProfileBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-[13px] font-semibold text-[color:var(--accent)] no-underline">
      {children}
    </Link>
  );
}
