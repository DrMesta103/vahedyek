'use client';

import type { ReactNode } from 'react';
import { Info, ShieldCheck } from 'lucide-react';

export function fieldBadge(text: string, tone: 'success' | 'warning' | 'muted' = 'muted') {
  const styles =
    tone === 'success'
      ? { border: '1px solid rgba(34,197,94,0.32)', background: 'rgba(34,197,94,0.12)', color: '#dcfce7' }
      : tone === 'warning'
        ? { border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.12)', color: '#fecdd3' }
        : { border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(148,163,184,0.12)', color: '#dbeafe' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: 10,
        fontWeight: 900,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...styles,
      }}
    >
      {text}
    </span>
  );
}

export function differenceBadge(text: string, tooltip: string, tone: 'diff' | 'warning' | 'success' = 'diff') {
  if (tone === 'diff') {
    return (
      <span className="business-payroll-difference-badge" title={tooltip}>
        <ShieldCheck className="h-3.5 w-3.5" />
        {text}
      </span>
    );
  }
  return fieldBadge(text, tone === 'warning' ? 'warning' : 'success');
}

export function EmployeeContractStepShell({
  title,
  tag,
  description,
  icon,
  children,
}: {
  title: string;
  tag?: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="business-payroll-subcard">
      <div className="business-draft-section-title contract-timing-step-title-row">
        <h3 className="contract-timing-step-main-title">{title}</h3>
        {tag ? (
          <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">
            {icon}
            {tag}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="contract-timing-step-lead">
          <span>{description}</span>
        </p>
      ) : null}
      <div className="employee-contract-step-body">{children}</div>
    </section>
  );
}

export function TemplateDiffBanner({ message }: { message: string }) {
  return (
    <div className="business-payroll-highlight subtle employee-contract-template-diff-banner">
      {differenceBadge('متفاوت با قالب', message)}
    </div>
  );
}

export function SectionPlaceholder() {
  return (
    <p className="contract-timing-step-lead">
      <Info className="h-3.5 w-3.5 contract-timing-step-lead-icon" aria-hidden />
      <span>ابتدا قالب قرارداد را انتخاب کنید.</span>
    </p>
  );
}
