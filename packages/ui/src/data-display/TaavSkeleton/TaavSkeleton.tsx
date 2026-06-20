import type { CSSProperties } from 'react';
import { cn } from '../../utils/cn';

export type TaavSkeletonVariant = 'text' | 'title' | 'avatar' | 'button' | 'card' | 'row' | 'table' | 'custom';
export type TaavSkeletonSize = 'sm' | 'md' | 'lg';
export type TaavSkeletonRadius = 'sm' | 'md' | 'lg' | 'pill' | 'full';

const sizeHeight: Record<TaavSkeletonSize, string> = {
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-5',
};

const variantDefaults: Record<Exclude<TaavSkeletonVariant, 'custom'>, { height: string; width: string; radius: TaavSkeletonRadius }> = {
  text: { height: 'h-4', width: 'w-full', radius: 'md' },
  title: { height: 'h-6', width: 'w-2/3', radius: 'md' },
  avatar: { height: 'h-10 w-10', width: 'w-10', radius: 'full' },
  button: { height: 'h-9', width: 'w-24', radius: 'md' },
  card: { height: 'h-32', width: 'w-full', radius: 'lg' },
  row: { height: 'h-12', width: 'w-full', radius: 'md' },
  table: { height: 'h-10', width: 'w-full', radius: 'sm' },
};

const radiusClass: Record<TaavSkeletonRadius, string> = {
  sm: 'rounded-[var(--taav-radius-sm)]',
  md: 'rounded-[var(--taav-radius-md)]',
  lg: 'rounded-[var(--taav-radius-lg)]',
  pill: 'rounded-[var(--taav-radius-pill)]',
  full: 'rounded-full',
};

export type TaavSkeletonProps = {
  variant?: TaavSkeletonVariant;
  size?: TaavSkeletonSize;
  lines?: number;
  width?: string | number;
  height?: string | number;
  radius?: TaavSkeletonRadius;
  animated?: boolean;
  count?: number;
  contentClassName?: string;
  wrapperClassName?: string;
};

function SkeletonBlock({
  className,
  animated,
  style,
}: {
  className: string;
  animated?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'bg-[var(--taav-skeleton-bg)]',
        animated && 'animate-pulse',
        className,
      )}
      style={style}
    />
  );
}

export function TaavSkeleton({
  variant = 'text',
  size = 'md',
  lines = 1,
  width,
  height,
  radius,
  animated = true,
  count = 1,
  contentClassName,
  wrapperClassName,
}: TaavSkeletonProps) {
  if (variant === 'custom') {
    return (
      <SkeletonBlock
        animated={animated}
        className={cn(radiusClass[radius ?? 'md'], contentClassName, wrapperClassName)}
        style={{ width, height }}
      />
    );
  }

  const defaults = variantDefaults[variant];
  const resolvedRadius = radius ?? defaults.radius;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('grid gap-2', wrapperClassName)}>
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonBlock
            key={index}
            animated={animated}
            className={cn(defaults.height, index === lines - 1 ? 'w-4/5' : 'w-full', radiusClass[resolvedRadius], contentClassName)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-2', wrapperClassName)}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlock
          key={index}
          animated={animated}
          className={cn(
            variant === 'avatar' ? defaults.height : variant === 'title' ? defaults.height : sizeHeight[size],
            variant !== 'avatar' && (width ? '' : defaults.width),
            radiusClass[resolvedRadius],
            contentClassName,
          )}
          style={width || height ? { width, height } : undefined}
        />
      ))}
    </div>
  );
}
