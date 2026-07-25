'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { Phone, SquarePen, UserRound } from 'lucide-react';
import { cn } from '../../utils/cn';

export type TaavBusinessOwnerCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  ownerName: ReactNode;
  phone?: ReactNode;
  secondaryText?: ReactNode;
  avatar?: ReactNode;
  editLabel?: string;
  callLabel?: string;
  phoneBadge?: ReactNode;
  onEdit?: () => void;
  onCall?: () => void;
  disabled?: boolean;
  loading?: boolean;
  themeMode?: 'auto' | 'light' | 'dark';
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;

export function TaavBusinessOwnerCard({
  title = 'مالک کسب و کار',
  description = 'توصیه می‌شود در صورتی که کد ملی شما در سامانه ثبت نشده است، از طریق ویرایش اقدام به ثبت کد ملی خود کنید.',
  ownerName,
  phone,
  secondaryText = '-',
  avatar,
  editLabel = 'ویرایش اطلاعات مالک کسب‌وکار',
  callLabel = 'تماس با مالک کسب‌وکار',
  phoneBadge,
  onEdit,
  onCall,
  disabled = false,
  loading = false,
  themeMode = 'auto',
  className,
  ...rest
}: TaavBusinessOwnerCardProps) {
  return (
    <article {...rest} dir="rtl" data-taav-business-owner-card data-theme-mode={themeMode} data-disabled={disabled || undefined} data-loading={loading || undefined} className={cn('w-full max-w-[690px] overflow-hidden rounded-[8px] border border-[var(--taav-business-owner-border)] bg-[var(--taav-business-owner-surface)] text-right shadow-[var(--taav-business-owner-shadow)]', disabled ? 'opacity-60' : '', className)}>
      <header className="border-b border-[var(--taav-business-owner-header-border)] bg-[var(--taav-business-owner-header)] px-[18px] py-[10px] text-[var(--taav-business-owner-header-text)]">
        <h2 className="m-0 text-[17px] font-bold leading-7">{title}</h2>
        {description ? <p className="m-0 text-[12px] font-normal leading-5">{description}</p> : null}
      </header>

      {loading ? (
        <div className="flex h-[88px] items-center gap-4 px-[10px]"><span className="h-[70px] w-[70px] animate-pulse rounded-[8px] bg-[var(--taav-business-owner-avatar)]" /><span className="h-4 w-48 animate-pulse rounded bg-[var(--taav-business-owner-muted)]" /></div>
      ) : (
        <div className="flex min-h-[88px] items-center justify-between gap-4 px-[10px] py-[8px]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[8px] bg-[var(--taav-business-owner-avatar)] text-[var(--taav-business-owner-avatar-icon)]" aria-hidden={avatar ? undefined : true}>
              {avatar ?? <UserRound className="h-12 w-12" strokeWidth={1.6} />}
            </div>
            <div className="min-w-0 text-right text-[var(--taav-business-owner-text)]">
              <h3 className="m-0 truncate text-[16px] font-bold leading-7">{ownerName}</h3>
              {phone ? <p className="m-0 text-[12px] leading-5">{phone}</p> : null}
              {secondaryText ? <p className="m-0 text-[12px] leading-5">{secondaryText}</p> : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-5 text-[var(--taav-business-owner-action)]">
            <button type="button" aria-label={callLabel} onClick={onCall} disabled={disabled || !onCall} className="relative inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-[var(--taav-business-owner-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed disabled:opacity-50">
              <Phone className="h-7 w-7" strokeWidth={1.6} />
              {phoneBadge ? <span className="absolute bottom-0 right-0 inline-flex min-h-4 min-w-4 translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full bg-[#a8a8a8] px-1 text-[10px] font-bold text-white">{phoneBadge}</span> : null}
            </button>
            <button type="button" aria-label={editLabel} onClick={onEdit} disabled={disabled || !onEdit} className="inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-[var(--taav-business-owner-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed disabled:opacity-50">
              <SquarePen className="h-7 w-7" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
