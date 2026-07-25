import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { TaavBusinessModuleLink, type TaavBusinessModuleLinkItem } from './TaavBusinessModuleLink';

export type TaavBusinessModuleLinkGridProps = {
  items: TaavBusinessModuleLinkItem[];
  columns?: 1 | 2;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'onClick'>;

export function TaavBusinessModuleLinkGrid({ items, columns = 2, gap = 'md', className, ...rest }: TaavBusinessModuleLinkGridProps) {
  return (
    <div
      {...rest}
      dir="rtl"
      data-taav-business-module-link-grid
      data-columns={columns}
      className={cn(
        'grid w-full',
        columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
        gap === 'sm' ? 'gap-x-6 gap-y-3' : gap === 'lg' ? 'gap-x-16 gap-y-10' : 'gap-x-12 gap-y-7',
        className,
      )}
    >
      {items.map((item) => <TaavBusinessModuleLink key={item.id} item={item} />)}
    </div>
  );
}
