import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TAAV_INTERACTION } from '../../primitives/shared/interaction';

export type TaavFormMessageTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type TaavFormMessageSize = 'sm' | 'md';

const toneClass: Record<TaavFormMessageTone, string> = {
  neutral: 'text-[var(--taav-text-muted)]',
  info: 'text-[var(--taav-info-strong)]',
  success: 'text-[var(--taav-success-strong)]',
  warning: 'text-[var(--taav-warning-strong)]',
  danger: 'text-[var(--taav-danger-strong)]',
};

const sizeClass: Record<TaavFormMessageSize, string> = {
  sm: 'text-[length:var(--taav-form-message-sm)] leading-[var(--taav-leading-relaxed)]',
  md: 'text-[length:var(--taav-form-message-md)] leading-[var(--taav-leading-relaxed)]',
};

export type TaavFormMessageProps = {
  tone?: TaavFormMessageTone;
  size?: TaavFormMessageSize;
  icon?: ReactNode;
  children?: ReactNode;
  unsafeClassName?: string;
};

export function TaavFormMessage({
  tone = 'neutral',
  size = 'sm',
  icon,
  children,
  unsafeClassName,
}: TaavFormMessageProps) {
  if (!children) return null;

  return (
    <p
      role={tone === 'danger' ? 'alert' : undefined}
      className={cn('m-0 flex items-start gap-[var(--taav-space-1)]', sizeClass[size], toneClass[tone], unsafeClassName)}
    >
      {icon ? <span className={cn(TAAV_INTERACTION.iconSlot, 'mt-0.5')}>{icon}</span> : null}
      <span>{children}</span>
    </p>
  );
}
