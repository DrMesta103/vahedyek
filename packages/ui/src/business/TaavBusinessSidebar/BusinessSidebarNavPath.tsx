'use client';

import { Fragment, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import {
  businessSidebarNavPathCurrent,
  businessSidebarNavPathLink,
  businessSidebarNavPathList,
  businessSidebarNavPathRoot,
  businessSidebarNavPathSeparator,
} from './taav-business-sidebar.variants';

export type TaavBusinessSidebarNavPathItem = {
  label: string;
  id?: string;
  href?: string;
  onClick?: () => void;
};

export const DEFAULT_BUSINESS_SIDEBAR_NAV_PATH: TaavBusinessSidebarNavPathItem[] = [
  { label: 'خانه', id: 'home' },
];

/** @deprecated Use `TaavBusinessSidebarNavPathItem` */
export type TaavBusinessNavPathItem = TaavBusinessSidebarNavPathItem;

/** @deprecated Use `DEFAULT_BUSINESS_SIDEBAR_NAV_PATH` */
export const DEFAULT_BUSINESS_NAV_PATH = DEFAULT_BUSINESS_SIDEBAR_NAV_PATH;

type BusinessSidebarNavPathProps = {
  items: TaavBusinessSidebarNavPathItem[];
  className?: string;
  listClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className'>;

function PathSeparator() {
  return (
    <span className={businessSidebarNavPathSeparator()}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M10 4 6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function BusinessSidebarNavPath({
  items,
  className,
  listClassName,
  ...props
}: BusinessSidebarNavPathProps) {
  const pathItems = items.length > 0 ? items : DEFAULT_BUSINESS_SIDEBAR_NAV_PATH;

  return (
    <nav
      dir="rtl"
      aria-label="مسیر صفحه"
      className={cn(businessSidebarNavPathRoot(), className)}
      {...props}
    >
      <ol className={cn(businessSidebarNavPathList(), listClassName)}>
        {pathItems.map((item, index) => {
          const isCurrent = index === pathItems.length - 1;
          const key = item.id ?? `${item.label}-${index}`;

          return (
            <Fragment key={key}>
              {index > 0 ? (
                <li className="inline-flex shrink-0 items-center" aria-hidden>
                  <PathSeparator />
                </li>
              ) : null}
              <li className="inline-flex min-w-0 max-w-full items-center">
                {isCurrent ? (
                  <span className={businessSidebarNavPathCurrent()} aria-current="page">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a href={item.href} className={businessSidebarNavPathLink()} onClick={item.onClick}>
                    <span className="truncate">{item.label}</span>
                  </a>
                ) : (
                  <button type="button" className={businessSidebarNavPathLink()} onClick={item.onClick}>
                    <span className="truncate">{item.label}</span>
                  </button>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
