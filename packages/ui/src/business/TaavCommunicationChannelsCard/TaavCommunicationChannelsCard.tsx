'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { Globe2, Mail, MapPinned, MoreVertical, PhoneCall, Printer, Smartphone } from 'lucide-react';
import { cn } from '../../utils/cn';

export type TaavCommunicationChannelsCardItem = { id: string; label: ReactNode; icon?: ReactNode; value?: ReactNode };
export type TaavCommunicationChannelsCardProps = {
  title?: ReactNode; primaryLabel?: ReactNode; primaryDescription?: ReactNode; primaryEnabled?: boolean;
  onPrimaryChange?: (enabled: boolean) => void; postalCode?: ReactNode; mapLabel?: ReactNode;
  onMapClick?: () => void; location?: ReactNode; phoneBadge?: ReactNode; items?: TaavCommunicationChannelsCardItem[];
  onMenuClick?: () => void; disabled?: boolean; loading?: boolean; themeMode?: 'auto' | 'light' | 'dark'; className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onChange'>;

const DEFAULT_ITEMS: TaavCommunicationChannelsCardItem[] = [
  { id: 'mobile', label: 'شماره تلفن‌های همراه', icon: <Smartphone /> },
  { id: 'landline', label: 'تلفن ثابت', icon: <PhoneCall /> },
  { id: 'fax', label: 'شماره فکس', icon: <Printer /> },
  { id: 'email', label: 'ایمیل', icon: <Mail /> },
  { id: 'website', label: 'وب‌سایت', icon: <Globe2 /> },
];

export function TaavCommunicationChannelsCard({
  title = 'دفتر فنی', primaryLabel = 'انتخاب به عنوان راه ارتباط اصلی',
  primaryDescription = 'می‌توانید با انتخاب راه ارتباط اصلی، تماس‌ها، پیام‌ها و به‌روزرسانی‌های این بخش را از طریق آن دریافت کنید.',
  primaryEnabled = false, onPrimaryChange, postalCode = '-', mapLabel = 'مشاهده روی نقشه', onMapClick,
  location = '-', phoneBadge, items = DEFAULT_ITEMS, onMenuClick, disabled = false, loading = false, themeMode = 'auto', className, ...rest
}: TaavCommunicationChannelsCardProps) {
  return (
    <article {...rest} dir="rtl" data-taav-communication-channels-card data-theme-mode={themeMode} className={cn('w-full max-w-[690px] overflow-hidden rounded-[12px] border border-[var(--taav-communication-card-border)] bg-[var(--taav-communication-card-surface)] px-[8px] pb-[18px] pt-[12px] text-right shadow-[var(--taav-communication-card-shadow)]', disabled ? 'opacity-60' : '', className)}>
      <header className="flex items-start justify-between gap-4 px-[8px]">
        <h2 className="m-0 text-[20px] font-bold leading-8 text-[var(--taav-communication-card-title)]">{title}</h2>
        <button type="button" onClick={onMenuClick} disabled={disabled || loading || !onMenuClick} aria-label="گزینه‌های بیشتر" className="text-[var(--taav-communication-card-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:opacity-50"><MoreVertical className="h-6 w-6" /></button>
      </header>
      <div className="px-[8px] pt-[8px]">
        <div dir="ltr" className="flex items-start justify-between gap-5">
          <Switch checked={primaryEnabled} onChange={onPrimaryChange} disabled={disabled || loading} />
          <div dir="rtl" className="min-w-0 text-right"><h3 className="m-0 text-[15px] font-semibold leading-6 text-[var(--taav-communication-card-title)]">{primaryLabel}</h3><p className="m-0 mt-[2px] text-[12px] leading-5 text-[var(--taav-communication-card-muted)]">{primaryDescription}</p></div>
        </div>
        <div className="mt-[14px] min-h-[128px] border-t border-[var(--taav-communication-card-divider)] pt-[10px]"><div className="flex items-start justify-between text-[13px] text-[var(--taav-communication-card-muted)]"><span className="flex w-[145px] shrink-0 flex-col items-end gap-0.5 text-right"><span className="w-full text-right">{location}</span><span className="w-full text-right">کدپستی</span></span><span className="w-[145px] shrink-0 text-left">{postalCode}</span></div><button type="button" onClick={onMapClick} disabled={disabled || loading || !onMapClick} className="mx-auto mt-[10px] flex items-center gap-1 text-[14px] font-semibold text-[var(--taav-communication-card-map)] opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed"><MapPinned className="h-6 w-6" />{mapLabel}</button></div>
      </div>
      <div className="mt-[12px] border-t border-[var(--taav-communication-card-divider)] px-[8px] pt-[10px]"><ul className="m-0 grid list-none gap-[5px] p-0">{items.map((item) => <li key={item.id} className="flex items-center justify-between gap-4 text-[15px] leading-7 text-[var(--taav-communication-card-text)]"><span>{item.label}</span><span className="relative inline-flex h-7 w-7 items-center justify-center text-[var(--taav-communication-card-icon)]">{item.icon}{item.id === 'mobile' && phoneBadge ? <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--taav-communication-card-accent)] px-1 text-[10px] leading-none text-white">{phoneBadge}</span> : null}</span></li>)}</ul></div>
    </article>
  );
}

function Switch({ checked, onChange, disabled }: { checked: boolean; onChange?: (checked: boolean) => void; disabled: boolean }) {
  return <button type="button" role="switch" aria-checked={checked} onClick={() => onChange?.(!checked)} disabled={disabled} className={cn('relative inline-flex h-[18px] w-[38px] shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]', checked ? 'bg-[#9adbd9]' : 'bg-[#c8ced7]')}><span className={cn('absolute left-0 h-[20px] w-[20px] rounded-full shadow-[0_1px_3px_rgba(15,23,42,0.16)] transition-transform', checked ? 'bg-[var(--taav-communication-card-accent)] translate-x-0' : 'bg-white translate-x-[18px]')} /></button>;
}
