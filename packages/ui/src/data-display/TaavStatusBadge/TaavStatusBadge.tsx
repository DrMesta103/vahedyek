import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { getTaavBadgeToneClasses, taavBadgeVariants, type TaavBadgeTone, type TaavBadgeVariant } from '../../primitives/TaavBadge/taav-badge.variants';

export type TaavStatus =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'failed'
  | 'warning'
  | 'archived'
  | 'locked'
  | 'unknown';

export type TaavStatusBadgeSize = 'sm' | 'md' | 'lg';
export type TaavStatusBadgeVariant = TaavBadgeVariant;

const STATUS_MAP: Record<TaavStatus, { label: string; tone: TaavBadgeTone }> = {
  active: { label: 'فعال', tone: 'success' },
  inactive: { label: 'غیرفعال', tone: 'neutral' },
  draft: { label: 'پیش‌نویس', tone: 'neutral' },
  pending: { label: 'در انتظار', tone: 'warning' },
  approved: { label: 'تأیید شده', tone: 'success' },
  rejected: { label: 'رد شده', tone: 'danger' },
  completed: { label: 'تکمیل شده', tone: 'success' },
  failed: { label: 'ناموفق', tone: 'danger' },
  warning: { label: 'هشدار', tone: 'warning' },
  archived: { label: 'بایگانی', tone: 'neutral' },
  locked: { label: 'قفل شده', tone: 'info' },
  unknown: { label: 'نامشخص', tone: 'neutral' },
};

const dotSizeClass: Record<TaavStatusBadgeSize, string> = {
  sm: 'h-[var(--taav-status-dot-size-sm)] w-[var(--taav-status-dot-size-sm)]',
  md: 'h-[var(--taav-status-dot-size-md)] w-[var(--taav-status-dot-size-md)]',
  lg: 'h-[var(--taav-status-dot-size-lg)] w-[var(--taav-status-dot-size-lg)]',
};

export type TaavStatusBadgeProps = {
  status: TaavStatus;
  size?: TaavStatusBadgeSize;
  variant?: TaavStatusBadgeVariant;
  withDot?: boolean;
  icon?: ReactNode;
  label?: string;
  children?: ReactNode;
  wrapperClassName?: string;
};

export function TaavStatusBadge({
  status,
  size = 'md',
  variant = 'soft',
  withDot = true,
  icon,
  label,
  children,
  wrapperClassName,
}: TaavStatusBadgeProps) {
  const config = STATUS_MAP[status];
  const text = children ?? label ?? config.label;
  const badgeSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md';

  return (
    <span
      className={cn(
        taavBadgeVariants({ size: badgeSize, shape: 'pill', width: 'auto' }),
        getTaavBadgeToneClasses(config.tone, variant),
        wrapperClassName,
      )}
    >
      {withDot ? (
        <span
          className={cn('inline-block shrink-0 rounded-full bg-current opacity-80', dotSizeClass[size])}
          aria-hidden
        />
      ) : null}
      {icon ? <span className="inline-flex shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5">{icon}</span> : null}
      <span className="truncate">{text}</span>
    </span>
  );
}
