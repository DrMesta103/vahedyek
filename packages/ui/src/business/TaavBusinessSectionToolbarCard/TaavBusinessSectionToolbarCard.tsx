'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { ModuleCardArrowIcon } from '../TaavModuleCard/ModuleCardArrowIcon';
import {
  sectionToolbarCardAction,
  sectionToolbarCardActionButton,
  sectionToolbarCardActionButtonIcon,
  sectionToolbarCardActionButtonLabel,
  sectionToolbarCardArrow,
  sectionToolbarCardBody,
  sectionToolbarCardDescription,
  sectionToolbarCardCopy,
  sectionToolbarCardHeader,
  sectionToolbarCardIconBox,
  sectionToolbarCardLead,
  sectionToolbarCardRoot,
  sectionToolbarCardSearchInput,
  sectionToolbarCardSearchShell,
  sectionToolbarCardSearch,
  sectionToolbarCardTitle,
} from './taav-business-section-toolbar-card.variants';

export type TaavBusinessSectionToolbarCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  showArrow?: boolean;
  onArrowClick?: () => void;
  href?: string;
  search?: {
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
  };
  action?: {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  };
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;

function ToolbarSearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-[1em] w-[1em]">
      <path d="M11.5 11.5 14 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ToolbarPlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-[1em] w-[1em]">
      <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function TaavBusinessSectionToolbarCard({
  title,
  description,
  icon,
  showArrow = true,
  onArrowClick,
  href,
  search,
  action,
  className,
  ...rest
}: TaavBusinessSectionToolbarCardProps) {
  const arrowDisabled = !href && !onArrowClick;
  const showSearch = Boolean(search);
  const showAction = Boolean(action);

  const arrowContent = (
    <span className={sectionToolbarCardArrow({ disabled: arrowDisabled })} aria-hidden={arrowDisabled || undefined}>
      <ModuleCardArrowIcon direction="back" className="h-[18px] w-[18px]" />
    </span>
  );

  const arrowNode = showArrow ? (
    href ? (
      <a
        href={href}
        className={sectionToolbarCardArrow({ disabled: false })}
        aria-label={title}
        onClick={(event) => {
          if (onArrowClick) {
            event.preventDefault();
            onArrowClick();
          }
        }}
      >
        <ModuleCardArrowIcon direction="back" className="h-[18px] w-[18px]" />
      </a>
    ) : onArrowClick ? (
      <button
        type="button"
        className={sectionToolbarCardArrow({ disabled: false })}
        aria-label={title}
        onClick={onArrowClick}
      >
        <ModuleCardArrowIcon direction="back" className="h-[18px] w-[18px]" />
      </button>
    ) : (
      arrowContent
    )
  ) : null;

  const actionButtonNode = showAction ? (
    <button
      type="button"
      className={sectionToolbarCardActionButton()}
      onClick={action?.onClick}
      disabled={action?.disabled || !action?.onClick}
    >
      <span className={sectionToolbarCardActionButtonIcon()} aria-hidden>
        {action?.icon ?? <ToolbarPlusIcon />}
      </span>
      <span className={sectionToolbarCardActionButtonLabel()}>{action?.label}</span>
    </button>
  ) : null;

  return (
    <article
      {...rest}
      dir="rtl"
      data-taav-business-section-toolbar-card
      className={cn(sectionToolbarCardRoot({ interactive: Boolean(href || onArrowClick) }), className)}
    >
      <div className={sectionToolbarCardBody()}>
        <div className={sectionToolbarCardHeader()} dir="rtl">
          <div className="flex items-start gap-[16px]" dir="rtl">
            {arrowNode ?? <span aria-hidden className="mt-[18px] h-[26px] w-[26px]" />}

            <div className={sectionToolbarCardLead()} dir="rtl">
              <div className="flex items-start gap-[16px]" dir="rtl">
                {icon ? <span className={sectionToolbarCardIconBox()}>{icon}</span> : null}
                <div className={sectionToolbarCardCopy()}>
                  <h3 className={sectionToolbarCardTitle()}>{title}</h3>
                  {description ? <p className={sectionToolbarCardDescription()}>{description}</p> : null}
                </div>
              </div>
            </div>

            {showAction ? <div className={sectionToolbarCardAction()}>{actionButtonNode}</div> : <span aria-hidden className="w-[148px]" />}
          </div>

          {showSearch ? (
            <div className={sectionToolbarCardSearch()} dir="rtl">
              <div className="flex justify-start">
                <div className="w-full max-w-[228px]">
                  <div className={sectionToolbarCardSearchShell()} dir="rtl">
                    <span aria-hidden className="inline-flex h-[19px] w-[19px] shrink-0 items-center justify-center text-[#64748b]">
                      <ToolbarSearchIcon />
                    </span>
                    <input
                      value={search?.value}
                      placeholder={search?.placeholder}
                      readOnly={search?.value !== undefined && !search?.onChange}
                      onChange={(event) => search?.onChange?.(event.currentTarget.value)}
                      aria-label={search?.placeholder ?? title}
                      className={sectionToolbarCardSearchInput()}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
