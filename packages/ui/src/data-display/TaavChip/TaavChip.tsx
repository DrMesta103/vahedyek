import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';
import {
  getTaavChipToneClasses,
  taavChipSelectedClass,
  taavChipVariants,
  type TaavChipShape,
  type TaavChipSize,
  type TaavChipTone,
  type TaavChipVariant,
  type TaavChipWidth,
} from '../shared/data-display.variants';

export type TaavChipBehavior = 'static' | 'clickable' | 'selectable' | 'removable';

export type TaavChipProps = {
  variant?: TaavChipVariant;
  tone?: TaavChipTone;
  size?: TaavChipSize;
  shape?: TaavChipShape;
  width?: TaavChipWidth;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  behavior?: TaavChipBehavior;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  removeLabel?: string;
  onRemove?: () => void;
  children?: ReactNode;
  itemClassName?: string;
  unsafeClassName?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

function ChipSpinner() {
  return (
    <span
      className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
      aria-hidden
    />
  );
}

function ChipRemoveButton({ label, onRemove, disabled }: { label: string; onRemove?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-[var(--taav-chip-remove-size)] w-[var(--taav-chip-remove-size)] shrink-0 items-center justify-center rounded-full',
        'text-current opacity-70 hover:bg-[var(--taav-surface-muted)] hover:opacity-100',
        'focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]',
      )}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onRemove?.();
      }}
    >
      <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3">
        <path d="M3 3l6 6M9 3 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function TaavChip({
  variant = 'soft',
  tone = 'neutral',
  size = 'md',
  shape = 'pill',
  width = 'auto',
  selected = false,
  disabled = false,
  loading = false,
  behavior = 'static',
  iconStart,
  iconEnd,
  removeLabel = 'حذف',
  onRemove,
  onClick,
  children,
  itemClassName,
  unsafeClassName,
  ...props
}: TaavChipProps) {
  const isInteractive = behavior !== 'static';
  const isDisabled = disabled || loading;
  const showRemove = behavior === 'removable' && onRemove;

  const className = cn(
    taavChipVariants({ size, shape, width }),
    getTaavChipToneClasses(tone, variant),
    selected && taavChipSelectedClass,
    isInteractive && !isDisabled && 'cursor-pointer',
    itemClassName,
    unsafeClassName,
  );

  const content = (
    <>
      {loading ? <ChipSpinner /> : null}
      {!loading && iconStart ? <span className={TAAV_INTERACTION.iconSlot}>{iconStart}</span> : null}
      {children ? <span className="truncate">{children}</span> : null}
      {!loading && iconEnd ? <span className={TAAV_INTERACTION.iconSlot}>{iconEnd}</span> : null}
      {showRemove ? <ChipRemoveButton label={removeLabel} onRemove={onRemove} disabled={isDisabled} /> : null}
    </>
  );

  if (!isInteractive) {
    return <span className={className}>{content}</span>;
  }

  return (
    <button type="button" className={className} disabled={isDisabled} onClick={onClick} aria-pressed={behavior === 'selectable' ? selected : undefined} {...props}>
      {content}
    </button>
  );
}
