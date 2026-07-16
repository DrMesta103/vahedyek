import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type TaavBusinessModuleLinkItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export type TaavBusinessModuleLinkGridProps = {
  items: TaavBusinessModuleLinkItem[];
  columns?: 1 | 2;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'onClick'>;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="h-[18px] w-[18px]">
      <path d="m10.5 4.5-4 4.5 4 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ModuleLinkItem({ item }: { item: TaavBusinessModuleLinkItem }) {
  const disabled = Boolean(item.disabled);
  const interactive = Boolean((item.href || item.onClick) && !disabled);
  const className = cn(
    'group/module-link flex min-w-0 flex-row items-start gap-4 px-0 py-2 text-right',
    'text-[var(--taav-business-module-link-text)] transition-colors duration-150',
    interactive && 'cursor-pointer hover:bg-[var(--taav-business-module-link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-focus-ring)]',
    disabled && 'cursor-not-allowed opacity-50',
  );

  const content = (
    <>
      <span className="mt-1 shrink-0 text-[var(--taav-business-module-link-arrow)] transition-transform duration-150 group-hover/module-link:-translate-x-0.5" aria-hidden="true">
        <ArrowIcon />
      </span>
      <span className="min-w-0 flex-1" dir="rtl">
        <span className="flex items-center justify-start gap-2 text-[length:var(--taav-business-module-link-title-size)] font-semibold leading-6">
          {item.icon ? <span className="inline-flex shrink-0 text-[var(--taav-business-module-link-icon)]" aria-hidden="true">{item.icon}</span> : null}
          <span className="truncate">{item.title}</span>
        </span>
        {item.description ? <span className="mt-1 block text-[length:var(--taav-business-module-link-description-size)] leading-6 text-[var(--taav-business-module-link-description)]">{item.description}</span> : null}
      </span>
    </>
  );

  if (item.href && !disabled) {
    return <a href={item.href} dir="ltr" className={className} aria-label={item.ariaLabel}>{content}</a>;
  }
  if (interactive) {
    return <button type="button" dir="ltr" className={className} onClick={item.onClick} aria-label={item.ariaLabel}>{content}</button>;
  }
  return <div dir="ltr" className={className} aria-disabled={disabled || undefined}>{content}</div>;
}

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
      {items.map((item) => <ModuleLinkItem key={item.id} item={item} />)}
    </div>
  );
}
