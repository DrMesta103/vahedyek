'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  taavChoiceChipCheckClass,
  taavChoiceChipIconSlotClass,
  taavChoiceChipVariants,
  type TaavChoiceChipShape,
  type TaavChoiceChipSize,
  type TaavChoiceChipTone,
} from '../shared/choice-chip.variants';

export type TaavChoiceChipProps = {
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  size?: TaavChoiceChipSize;
  tone?: TaavChoiceChipTone;
  shape?: TaavChoiceChipShape;
  /** When true, renders the check icon. Defaults to false — use TaavChoiceChipGroup to apply multi-select rules automatically. */
  showCheck?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  value?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  checked?: boolean;
  role?: 'radio' | 'checkbox';
  wrapperClassName?: string;
  unsafeClassName?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'type' | 'value' | 'onClick'>;

function ChoiceCheckIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none">
      <path d="M4 8.25 6.6 10.8 12 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const TaavChoiceChip = forwardRef<HTMLButtonElement, TaavChoiceChipProps>(function TaavChoiceChip({
  children,
  selected = false,
  disabled = false,
  invalid = false,
  size = 'md',
  tone = 'brand',
  shape = 'pill',
  showCheck,
  iconStart,
  iconEnd,
  value,
  type = 'button',
  onClick,
  checked,
  role,
  wrapperClassName,
  unsafeClassName,
  ...props
}, ref) {
  const isSelected = selected || checked || false;
  const shouldShowCheck = showCheck === true;

  return (
    <button
      ref={ref}
      type={type}
      value={value}
      disabled={disabled}
      onClick={onClick}
      role={role}
      aria-checked={role ? isSelected : undefined}
      aria-pressed={!role ? isSelected : undefined}
      aria-invalid={invalid || undefined}
      data-state={isSelected ? 'selected' : 'unselected'}
      className={cn(
        taavChoiceChipVariants({ size, shape, selected: isSelected, invalid, tone }),
        'whitespace-nowrap',
        wrapperClassName,
        unsafeClassName,
      )}
      {...props}
    >
      {shouldShowCheck ? (
        <span className={taavChoiceChipCheckClass} aria-hidden>
          <ChoiceCheckIcon />
        </span>
      ) : iconStart ? (
        <span className={taavChoiceChipIconSlotClass}>{iconStart}</span>
      ) : null}
      <span className="min-w-0 truncate">{children}</span>
      {iconEnd ? <span className={taavChoiceChipIconSlotClass}>{iconEnd}</span> : null}
    </button>
  );
});
