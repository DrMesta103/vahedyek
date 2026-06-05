'use client';

import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

export type AdaptiveChipItem = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  tooltip?: string;
};

type AdaptiveChipGroupProps = {
  items: AdaptiveChipItem[];
  selected: string | string[];
  multi?: boolean;
  className?: string;
  onChange: (value: string | string[]) => void;
};

function isSelectedValue(selected: string | string[], value: string) {
  return Array.isArray(selected) ? selected.includes(value) : selected === value;
}

export function AdaptiveChipGroup({
  items,
  selected,
  multi = false,
  className = '',
  onChange,
}: AdaptiveChipGroupProps) {
  return (
    <div className={`adaptive-chip-group ${className}`.trim()}>
      {items.map((item) => {
        const isSelected = isSelectedValue(selected, item.value);
        return (
          <button
            key={item.value}
            type="button"
            className={`adaptive-chip${isSelected ? ' is-selected' : ''}${item.disabled ? ' is-disabled' : ''}`}
            disabled={item.disabled}
            title={item.tooltip}
            onClick={() => onChange(multi && Array.isArray(selected) ? (selected.includes(item.value) ? selected.filter((entry) => entry !== item.value) : [...selected, item.value]) : item.value)}
          >
            {isSelected ? (
              <span className="adaptive-chip-check" aria-hidden>
                <Check className="h-3.5 w-3.5" strokeWidth={2.8} />
              </span>
            ) : item.icon ? (
              <span className="adaptive-chip-icon" aria-hidden>
                {item.icon}
              </span>
            ) : null}
            <span className="adaptive-chip-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
