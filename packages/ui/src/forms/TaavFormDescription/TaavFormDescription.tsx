import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type TaavFormDescriptionSize = 'sm' | 'md';
export type TaavFormDescriptionTone = 'muted' | 'neutral' | 'info';

const sizeClass: Record<TaavFormDescriptionSize, string> = {
  sm: 'text-[length:var(--taav-form-description-sm)]',
  md: 'text-[length:var(--taav-form-description-md)]',
};

const toneClass: Record<TaavFormDescriptionTone, string> = {
  muted: 'text-[var(--taav-text-subtle)]',
  neutral: 'text-[var(--taav-text-muted)]',
  info: 'text-[var(--taav-info-strong)]',
};

export type TaavFormDescriptionProps = {
  size?: TaavFormDescriptionSize;
  tone?: TaavFormDescriptionTone;
  children?: ReactNode;
  unsafeClassName?: string;
};

export function TaavFormDescription({
  size = 'sm',
  tone = 'muted',
  children,
  unsafeClassName,
}: TaavFormDescriptionProps) {
  if (!children) return null;

  return (
    <p
      className={cn(
        'm-0 leading-[var(--taav-leading-relaxed)]',
        sizeClass[size],
        toneClass[tone],
        unsafeClassName,
      )}
    >
      {children}
    </p>
  );
}
