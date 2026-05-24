'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { ChoicePillsField, Input, PersianDatePicker } from '@repo/ui';
import { FieldGroup, SectionCard, TagPill } from '../../../contracts/new/_components/ContractFormPrimitives';
import { BusinessSettingsSubmitButton } from '../../_components/BusinessSettingsSubmitButton';

export function ProfilePageShell({ children }: { children: ReactNode }) {
  return <section className="profile-workspace-page">{children}</section>;
}

export function ProfileCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <SectionCard className={`profile-surface-card ${className}`}>{children}</SectionCard>;
}

export function ProfileHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="profile-section-head">
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
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
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <FieldGroup label={label} required={required} hint={hint} invalid={invalid}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </FieldGroup>
  );
}

export function ProfileDateField({
  label,
  value,
  onChange,
  required,
  hint,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
  invalid?: boolean;
}) {
  return (
    <FieldGroup label={label} required={required} hint={hint} invalid={invalid}>
      <PersianDatePicker value={value} onChange={onChange} placeholder="YYYY/MM/DD" containerClassName="w-full" className={invalid ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : undefined} />
    </FieldGroup>
  );
}

export function ProfileTextareaField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <FieldGroup label={label} hint={hint}>
      <textarea className="app-textarea profile-textarea" value={value} onChange={(event) => onChange(event.target.value)} />
    </FieldGroup>
  );
}

export function ProfileChipGroup<T extends string>({
  label,
  hint,
  items,
  value,
  onChange,
  multiple,
  invalid,
}: {
  label: string;
  hint?: string;
  items: Array<{ value: T; label: string }>;
  value: T | T[] | null;
  onChange: (value: T) => void;
  multiple?: boolean;
  invalid?: boolean;
}) {
  if (!multiple && !Array.isArray(value) && value !== null) {
    return (
      <div className="space-y-1.5">
        <ChoicePillsField label={label} options={items} value={value} onChange={onChange} wrap />
        {hint ? <p className="text-[11px] text-[color:var(--text-muted)]">{hint}</p> : null}
      </div>
    );
  }

  return (
    <FieldGroup label={label} hint={hint} invalid={invalid}>
      <div className="profile-chip-row">
        {items.map((item) => {
          const active = Array.isArray(value) ? value.includes(item.value) : value === item.value;
          return <TagPill key={item.value} label={item.label} active={active} onClick={() => onChange(item.value)} />;
        })}
      </div>
    </FieldGroup>
  );
}

export function ProfileSubmitBar({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="profile-submit-bar">
      <BusinessSettingsSubmitButton saving={false} disabled={disabled} label={label} onClick={onClick} minimal />
    </div>
  );
}

export function ProfileUploadCard({
  title,
  description,
  value,
  icon,
  onChange,
}: {
  title: string;
  description: string;
  value?: string;
  icon: ReactNode;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="brand-upload-card">
      <h3>{title}</h3>
      <div className="brand-upload-preview">
        {value ? <img src={value} alt={title} className="brand-upload-image" /> : icon}
        <button type="button" className="brand-upload-action" onClick={() => inputRef.current?.click()}>
          <Camera />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </div>
      <p>{description}</p>
    </div>
  );
}
