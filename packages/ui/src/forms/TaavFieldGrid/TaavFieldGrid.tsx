import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  getTaavFieldGridColumnsClass,
  taavFieldGridVariants,
  type TaavFieldGridColumns,
  type TaavFieldGridDensity,
  type TaavFieldGridGap,
} from '../shared/field-layout.variants';

export type TaavFieldGridProps = {
  columns?: TaavFieldGridColumns;
  gap?: TaavFieldGridGap;
  density?: TaavFieldGridDensity;
  responsive?: boolean;
  children: ReactNode;
};

export function TaavFieldGrid({
  columns = 2,
  gap = 'md',
  density = 'comfortable',
  responsive = true,
  children,
}: TaavFieldGridProps) {
  return (
    <div className={cn(taavFieldGridVariants({ gap, density, responsive }), getTaavFieldGridColumnsClass(columns, responsive))}>
      {children}
    </div>
  );
}
