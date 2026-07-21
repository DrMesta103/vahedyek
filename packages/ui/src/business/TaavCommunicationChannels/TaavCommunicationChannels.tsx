'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { CircleDot, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

export type TaavCommunicationChannel = {
  id: string;
  label: ReactNode;
  content?: ReactNode;
  emptyText?: ReactNode;
  disabled?: boolean;
};

export type TaavCommunicationChannelsProps = {
  channels?: TaavCommunicationChannel[];
  expandedId?: string;
  defaultExpandedId?: string;
  onExpandedChange?: (channelId: string) => void;
  onBack?: () => void;
  backLabel?: string;
  emptyText?: ReactNode;
  themeMode?: 'auto' | 'light' | 'dark';
  disabled?: boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'onChange'>;

const DEFAULT_CHANNELS: TaavCommunicationChannel[] = [
  { id: 'mobile', label: 'شماره تلفن همراه' },
  { id: 'landline', label: 'تلفن ثابت' },
  { id: 'fax', label: 'شماره فکس' },
  { id: 'email', label: 'ایمیل' },
  { id: 'website', label: 'وبسایت' },
  { id: 'social', label: 'شبکه‌های اجتماعی' },
];

export function TaavCommunicationChannels({
  channels = DEFAULT_CHANNELS,
  expandedId,
  defaultExpandedId = 'social',
  onExpandedChange,
  onBack,
  backLabel = 'بازگشت',
  emptyText = 'موردی برای نمایش وجود ندارد',
  themeMode = 'auto',
  disabled = false,
  className,
  ...rest
}: TaavCommunicationChannelsProps) {
  const resolvedExpandedId = expandedId ?? defaultExpandedId;

  return (
    <section {...rest} dir="rtl" aria-label="اطلاعات تماس" data-taav-communication-channels data-theme-mode={themeMode} className={cn('w-full max-w-[690px] text-right', disabled ? 'opacity-60' : '', className)}>
      <div className="grid gap-[8px]">
        {channels.map((channel) => {
          const isExpanded = resolvedExpandedId === channel.id;
          const channelDisabled = disabled || channel.disabled;
          return (
            <div key={channel.id} className={cn('overflow-hidden rounded-[12px] border border-[var(--taav-communication-border)] bg-[var(--taav-communication-surface)]', isExpanded ? 'min-h-[106px]' : 'min-h-[54px]')}>
              <button type="button" aria-expanded={isExpanded} disabled={channelDisabled} onClick={() => onExpandedChange?.(channel.id)} className="flex min-h-[54px] w-full items-center justify-between gap-3 px-[14px] text-[16px] font-semibold text-[var(--taav-communication-label)] transition-colors hover:bg-[var(--taav-communication-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed">
                <span className="flex min-w-0 items-center gap-2"><CircleDot className="h-[24px] w-[24px] shrink-0 text-[var(--taav-communication-accent)]" strokeWidth={1.15} /><span className="truncate">{channel.label}</span></span>
                <Plus className="h-[22px] w-[22px] shrink-0 text-[var(--taav-communication-accent)]" strokeWidth={1.6} aria-hidden="true" />
              </button>
              {isExpanded ? <div className="border-t border-[var(--taav-communication-divider)] px-[18px] py-[14px] text-center text-[14px] text-[var(--taav-communication-muted)]">{channel.content ?? channel.emptyText ?? emptyText}</div> : null}
            </div>
          );
        })}
      </div>
      {onBack ? <div className="flex justify-center pt-[16px]"><button type="button" onClick={onBack} disabled={disabled} className="rounded-[8px] bg-[var(--taav-communication-button)] px-[10px] py-[6px] text-[14px] font-semibold text-white transition-colors hover:bg-[var(--taav-communication-button-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed disabled:opacity-50">{backLabel}</button></div> : null}
    </section>
  );
}
