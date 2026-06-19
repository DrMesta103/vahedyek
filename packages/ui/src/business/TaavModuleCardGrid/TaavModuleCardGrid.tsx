import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { moduleCardGridItem, moduleCardGridRoot } from './taav-module-card-grid.variants';

export type TaavModuleCardGridColumns = 1 | 2 | 3 | 4;
export type TaavModuleCardGridGap = 'sm' | 'md' | 'lg' | 'xl';
export type TaavModuleCardGridDensity = 'compact' | 'comfortable' | 'spacious';
export type TaavModuleCardGridSpan = 1 | 2 | 3 | 4;

export type TaavModuleCardGridProps = {
  columns?: TaavModuleCardGridColumns;
  gap?: TaavModuleCardGridGap;
  density?: TaavModuleCardGridDensity;
  responsive?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

export type TaavModuleCardGridItemProps = {
  span?: TaavModuleCardGridSpan;
  responsive?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;

export function TaavModuleCardGrid({
  columns = 2,
  gap = 'md',
  density = 'comfortable',
  responsive = true,
  children,
  className,
  ...rest
}: TaavModuleCardGridProps) {
  return (
    <div
      data-taav-module-card-grid
      data-columns={columns}
      className={cn(moduleCardGridRoot({ columns, gap, density, responsive }), className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function TaavModuleCardGridItem({
  span = 1,
  responsive = true,
  children,
  className,
  ...rest
}: TaavModuleCardGridItemProps) {
  return (
    <div
      data-taav-module-card-grid-item
      data-span={span}
      className={cn(moduleCardGridItem({ span, spanResponsive: responsive }), className)}
      {...rest}
    >
      {children}
    </div>
  );
}
