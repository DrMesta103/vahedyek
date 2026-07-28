'use client';

import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { MinutesEquivalentHint, parseMinutesInput } from '../../../components/MinutesEquivalentHint';
import { PolicyFieldInput, PolicyFieldLabel } from './PolicyWorkspaceShell';

export function PolicyMinutesField({
  name,
  label,
  defaultValue,
  hint,
  required,
  min = 0,
  className,
  controlClassName,
  labelSlot,
  onValueChange,
  inputProps,
}: {
  name: string;
  label?: string;
  defaultValue?: number | string | null;
  hint?: string;
  required?: boolean;
  min?: number;
  className?: string;
  controlClassName?: string;
  labelSlot?: ReactNode;
  onValueChange?: (minutes: number | null) => void;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'type' | 'defaultValue' | 'min' | 'onChange'>;
}) {
  const initial =
    defaultValue === '' || defaultValue == null
      ? null
      : Number.isFinite(Number(defaultValue))
        ? Number(defaultValue)
        : null;
  const [minutes, setMinutes] = useState<number | null>(initial);

  return (
    <label className={className ?? 'policy-field-stack shift-policy-field'}>
      {labelSlot ?? (label ? <PolicyFieldLabel label={label} required={required} /> : null)}
      <div className={controlClassName ?? 'shift-policy-control-wrap'}>
        <PolicyFieldInput
          name={name}
          type="number"
          defaultValue={defaultValue ?? ''}
          min={min}
          required={required}
          {...inputProps}
          onChange={(event) => {
            const next = parseMinutesInput(event.target.value);
            setMinutes(next);
            onValueChange?.(next);
          }}
        />
        <span className="shift-policy-unit">دقیقه</span>
      </div>
      <MinutesEquivalentHint minutes={minutes} />
      {hint ? <p className="shift-policy-hint">{hint}</p> : null}
    </label>
  );
}
