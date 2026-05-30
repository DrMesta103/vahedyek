'use client';

import type { ReactNode } from 'react';

type PanelToggleRowProps = {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export function PanelToggleRow({ label, checked, onChange, disabled, className = '', id }: PanelToggleRowProps) {
  return (
    <label className={`panel-toggle-row ${className}`.trim()}>
      <span className="panel-toggle-row-label">{label}</span>
      <span className="request-reason-toggle panel-toggle-row-switch">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="request-reason-toggle-track" aria-hidden />
      </span>
    </label>
  );
}
