import type { ReactNode } from 'react';

export function DraftShowcaseField({
  label,
  value,
  prominent = false,
}: {
  label: string;
  value: ReactNode;
  prominent?: boolean;
}) {
  return (
    <div className="draft-showcase-field">
      <span className="draft-showcase-field-label">{label}:</span>
      <span className={`draft-showcase-field-value${prominent ? ' is-prominent' : ''}`}>{value}</span>
    </div>
  );
}

export function DraftShowcaseFieldBadge({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="draft-showcase-field">
      <span className="draft-showcase-field-label">{label}:</span>
      <span className="draft-template-usage-badge draft-showcase-field-badge">{value}</span>
    </div>
  );
}

export function DraftShowcaseFields({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`draft-showcase-fields${className ? ` ${className}` : ''}`}>{children}</div>;
}
