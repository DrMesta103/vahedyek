'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../utils/cn';

export type TaavBusinessIconOption = { value: string; label: ReactNode; icon: ReactNode; disabled?: boolean };
export type TaavBusinessIconChoiceGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & { items: TaavBusinessIconOption[]; selected?: string; defaultSelected?: string; onSelectedChange?: (value: string) => void; ariaLabel?: string; themeMode?: 'auto' | 'light' | 'dark' };

export function TaavBusinessIconChoiceGroup({ items, selected, defaultSelected, onSelectedChange, ariaLabel = 'انتخاب گزینه', themeMode = 'auto', className, ...rest }: TaavBusinessIconChoiceGroupProps) {
  const [internalSelected, setInternalSelected] = useState(defaultSelected ?? items.find((item) => !item.disabled)?.value ?? '');
  const current = selected ?? internalSelected;
  const columns = Math.min(Math.max(items.length, 1), 4);
  const isScrollable = items.length > 4;
  const select = (value: string, disabled?: boolean) => { if (disabled) return; if (selected === undefined) setInternalSelected(value); onSelectedChange?.(value); };
  return <div {...rest} dir="rtl" data-taav-business-icon-option-selector data-theme-mode={themeMode} data-count={items.length} className={cn('w-full overflow-hidden rounded-[10px] border border-[var(--taav-icon-option-card-border)] bg-[var(--taav-icon-option-card-surface)] px-3 pt-2', className)}><div role="radiogroup" aria-label={ariaLabel} className={cn('grid min-w-0 border-b border-[var(--taav-icon-option-divider)]', isScrollable ? 'grid-flow-col auto-cols-[minmax(120px,1fr)] overflow-x-auto' : '')} style={isScrollable ? undefined : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{items.map((item) => { const isSelected = current === item.value; return <button key={item.value} type="button" role="radio" aria-checked={isSelected} aria-label={typeof item.label === 'string' ? item.label : undefined} disabled={item.disabled} onClick={() => select(item.value, item.disabled)} className={cn('group relative flex min-h-[112px] min-w-0 flex-col items-center justify-start gap-2 px-2 pt-2 text-center outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--taav-icon-option-focus)]', item.disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer', isScrollable ? 'w-[120px]' : 'w-full')}><span className={cn('flex h-12 w-12 items-center justify-center rounded-full border text-[var(--taav-icon-option-icon)] transition-colors', isSelected ? 'border-[var(--taav-icon-option-selected)] bg-[var(--taav-icon-option-selected)] text-[var(--taav-icon-option-selected-icon)]' : 'border-[var(--taav-icon-option-border)] bg-transparent group-hover:border-[var(--taav-icon-option-hover)] group-hover:text-[var(--taav-icon-option-hover)]')}>{item.icon}</span><span className={cn('max-w-full truncate text-[13px] leading-6', isSelected ? 'font-bold text-[var(--taav-icon-option-selected-text)]' : 'font-normal text-[var(--taav-icon-option-text)]')}>{item.label}</span><span aria-hidden="true" className={cn('absolute inset-x-2 bottom-[-1px] h-[2px] rounded-full transition-colors', isSelected ? 'bg-[var(--taav-icon-option-selected)]' : 'bg-transparent')} /></button>; })}</div></div>;
}
