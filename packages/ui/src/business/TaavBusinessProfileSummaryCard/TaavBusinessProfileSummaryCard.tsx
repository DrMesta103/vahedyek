'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { ChevronRight, Building2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export type TaavBusinessProfileSummaryCardProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'title' | 'onClick' | 'children'>;

function SummaryIcon() {
  return (
    <span
      className="inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[17px] bg-[rgba(0,143,143,0.10)] text-[#008f8f]"
      aria-hidden="true"
    >
      <Building2 className="h-[24px] w-[24px]" strokeWidth={2.2} />
    </span>
  );
}

function SummaryArrow() {
  return (
    <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center text-[#008f8f]" aria-hidden="true">
      <ChevronRight className="h-[30px] w-[30px]" strokeWidth={2.8} />
    </span>
  );
}

export function TaavBusinessProfileSummaryCard({
  title,
  description,
  icon,
  href,
  onClick,
  disabled = false,
  className,
  children,
  ...rest
}: TaavBusinessProfileSummaryCardProps) {
  const rootClassName = cn(
    'group relative flex min-h-[101px] w-full max-w-[696px] items-center overflow-hidden rounded-[15px] border border-[rgba(145,170,190,0.5)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,247,249,0.98)_100%)] px-[28px] py-[17px] text-right shadow-[0_4px_10px_rgba(15,23,42,0.03)]',
    className,
  );

  const content = (
    <>
      <div className="ml-[16px] shrink-0">
        <SummaryArrow />
      </div>

      <div className="ml-[22px] shrink-0">{icon ?? <SummaryIcon />}</div>

      <div className="grid min-w-0 max-w-[520px] gap-[6px] text-right">
        <h3 className="m-0 text-[18px] font-semibold leading-[26px] text-[#3f3f46]">{title}</h3>
        {description ? (
          <p className="m-0 max-w-[520px] text-[12.5px] font-normal leading-[22px] text-[#52657a]">{description}</p>
        ) : null}
        {children}
      </div>
    </>
  );

  if (href && !disabled) {
    return (
      <a
        {...rest}
        href={href}
        className={rootClassName}
        onClick={(event) => {
          if (onClick) {
            event.preventDefault();
            onClick();
          }
        }}
      >
        {content}
      </a>
    );
  }

  if (!disabled && onClick) {
    return (
      <button {...rest} type="button" className={rootClassName} onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <article {...rest} className={rootClassName} aria-disabled={disabled || undefined}>
      {content}
    </article>
  );
}
