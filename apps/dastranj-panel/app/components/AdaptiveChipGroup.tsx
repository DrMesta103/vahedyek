'use client';

import { TaavChoiceChipGroup } from '@repo/ui/taav/forms';
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

function toOptionLabel(label: ReactNode) {
  return typeof label === 'string' || typeof label === 'number' ? String(label) : String(label);
}

export function AdaptiveChipGroup({
  items,
  selected,
  multi = false,
  className = '',
  onChange,
}: AdaptiveChipGroupProps) {
  return (
    <TaavChoiceChipGroup
      className={className}
      options={items.map((item) => ({
        value: item.value,
        label: toOptionLabel(item.label),
        disabled: item.disabled,
        icon: item.icon,
      }))}
      value={selected}
      selectionMode={multi ? 'multiple' : 'single'}
      onValueChange={onChange}
    />
  );
}
