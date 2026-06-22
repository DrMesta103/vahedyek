import Link from 'next/link';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Check, ChevronLeft, Info } from 'lucide-react';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { POLICY_FAMILIES, POLICY_VARIANTS, type PolicyFamilyKey } from '../../../lib/policy-workspaces';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function PolicyPageShell({
  title,
  subtitle,
  banner,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  banner?: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="page-stack module-page policy-page" dir="rtl" lang="fa">
      <ModulePageHeader
        title={title}
        subtitle={subtitle}
        addHref={actionHref}
        addLabel={actionLabel}
      />

      {banner ? <PolicyInfoStrip text={banner} /> : null}

      <div className="policy-page-body">{children}</div>
    </div>
  );
}

export function PolicyFamilyNav({
  activeFamily,
  hiddenFamilies = [],
}: {
  activeFamily?: PolicyFamilyKey;
  hiddenFamilies?: PolicyFamilyKey[];
}) {
  const families = POLICY_FAMILIES.filter((family) => !hiddenFamilies.includes(family.key));

  return (
    <nav className="policy-family-nav" aria-label="خانواده‌های سیاست">
      {families.map((family) => {
        const active = activeFamily === family.key;
        return (
          <Link
            key={family.key}
            href={family.route}
            className={cn('policy-family-nav-item', active && 'is-active')}
          >
            <span className="policy-family-nav-title">{family.title}</span>
            <span className="policy-family-nav-subtitle">{family.subtitle}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function PolicySectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="policy-section-card">
      <header className="policy-section-card-header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function PolicyFieldLabel({
  label,
  required,
  hint,
}: {
  label: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="policy-field-label">
      <span className="policy-field-label-text">
        {label}
        {required ? <span className="policy-field-required">*</span> : null}
      </span>
      {hint ? <span className="policy-field-hint">{hint}</span> : null}
    </div>
  );
}

export function PolicyFieldInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('policy-field-input', props.className)} />;
}

export function PolicyFieldTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('policy-field-textarea', props.className)} />;
}

export function PolicyFieldSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('policy-field-select', props.className)} />;
}

export function PolicyToggleField({
  name,
  label,
  hint,
  defaultChecked,
  checked,
  onCheckedChange,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const controlled = checked !== undefined;

  return (
    <label className="policy-toggle-field">
      <span className="policy-toggle-copy">
        <span className="policy-toggle-label">{label}</span>
        {hint ? <span className="policy-toggle-hint">{hint}</span> : null}
      </span>
      <span className="policy-toggle">
        <input
          name={name}
          type="checkbox"
          className="peer sr-only"
          {...(controlled
            ? { checked, onChange: (event) => onCheckedChange?.(event.target.checked) }
            : { defaultChecked })}
        />
        <span className="policy-toggle-track" aria-hidden />
        <span className="policy-toggle-thumb" aria-hidden />
      </span>
    </label>
  );
}

export function PolicyInfoStrip({ text }: { text: string }) {
  return (
    <div className="policy-info-strip" role="note">
      <Info className="policy-info-strip-icon" aria-hidden />
      <p>{text}</p>
    </div>
  );
}

export function PolicyFormActions({
  cancelHref,
  submitLabel = 'ذخیره',
  disabled,
}: {
  cancelHref: string;
  submitLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="policy-form-actions">
      <Link href={cancelHref} className="policy-btn policy-btn-secondary">
        لغو / بازگشت
      </Link>
      <button type="submit" className="policy-btn policy-btn-primary" disabled={disabled}>
        <Check className="h-4 w-4" aria-hidden />
        {submitLabel}
      </button>
    </div>
  );
}

export function PolicyNavLink({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} className="policy-nav-link">
      <span>{title}</span>
      <ChevronLeft className="policy-nav-link-chevron" aria-hidden />
    </Link>
  );
}

export function PolicyFamilyList({
  title,
  description,
  addHref,
  addLabel = 'ثبت جدید',
  children,
}: {
  title: string;
  description?: string;
  addHref: string;
  addLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="policy-section-card policy-family-list">
      <div className="policy-family-list-header">
        <div className="policy-section-card-header">
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <Link href={addHref} className="module-page-add-btn">
          <span aria-hidden>+</span>
          {addLabel}
        </Link>
      </div>
      <div className="module-page-list">{children}</div>
    </section>
  );
}

export function PolicyFamilyListItem({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description?: string;
}) {
  return (
    <Link href={href} className="policy-family-list-item">
      <div className="policy-family-list-item-copy">
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
      </div>
      <span className="module-status-pill is-active">ویرایش</span>
    </Link>
  );
}

export function PolicyVariantTabs({
  familyKey,
  variant,
}: {
  familyKey: PolicyFamilyKey;
  variant: string;
}) {
  const variants = POLICY_VARIANTS[familyKey];

  return (
    <div className="policy-variant-tabs">
      {variants.map((item) => {
        const active = item.key === variant;
        const href = item.key === 'default' ? `/policies/${familyKey}` : `/policies/${familyKey}?variant=${item.key}`;
        return (
          <Link key={item.key} href={href} className={cn('policy-variant-tab', active && 'is-active')}>
            <span className="policy-variant-tab-title">{item.title}</span>
            <span className="policy-variant-tab-subtitle">{item.subtitle}</span>
          </Link>
        );
      })}
    </div>
  );
}
