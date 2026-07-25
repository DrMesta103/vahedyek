'use client';

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Landmark, MoreVertical, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export type TaavBusinessAccountInfoCardProps = {
  bankName?: ReactNode;
  contractLabel?: ReactNode;
  logo?: ReactNode;
  formattedAccountNumber?: ReactNode;
  accountNumber?: ReactNode;
  iban?: ReactNode;
  accountLabel?: ReactNode;
  ibanLabel?: ReactNode;
  displayLabel?: ReactNode;
  displayDescription?: ReactNode;
  showInContract?: boolean;
  onShowInContractChange?: (value: boolean) => void;
  ownerLabel?: ReactNode;
  ownerName?: ReactNode;
  ownerNames?: ReactNode[];
  onMenuClick?: () => void;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  themeMode?: 'auto' | 'light' | 'dark';
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onChange'>;

export function TaavBusinessAccountInfoCard({
  bankName = 'رفاه',
  contractLabel = 'خسارت‌های قراردادی',
  logo,
  formattedAccountNumber = '۰۵۹۴ ۶۳۱۱ ۴۵۰۵ ۰۵۱۹',
  accountNumber = '۳۳۵۲۶۵۴۵۱۱۲',
  iban = 'IR۳۰ ۰۵۵۵ ۴۵۴۱ ۱۲۵۵ ۵۵۵۵ ۵۵۵۵ ۴۳',
  accountLabel = 'شماره حساب',
  ibanLabel = 'شماره شبا',
  displayLabel = 'امکان نمایش در قرارداد',
  displayDescription = 'در صورت تأیید می‌توانید از اطلاعات این حساب بانکی در متن قرارداد استفاده کنید.',
  showInContract = false,
  onShowInContractChange,
  ownerLabel = 'نام صاحب / صاحبان حساب',
  ownerName = '۱ - نرگس سپهری',
  ownerNames,
  onMenuClick,
  onRefresh,
  onEdit,
  onDelete,
  disabled = false,
  themeMode = 'auto',
  className,
  ...rest
}: TaavBusinessAccountInfoCardProps) {
  const [internalChecked, setInternalChecked] = useState(showInContract);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const checked = onShowInContractChange ? showInContract : internalChecked;
  const renderedOwnerNames = ownerNames ?? (Array.isArray(ownerName) ? ownerName : [ownerName]);

  useEffect(() => {
    if (!menuOpen) return;

    const closeMenu = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuButtonRef.current?.contains(target) || menuPanelRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeMenu);
    return () => document.removeEventListener('pointerdown', closeMenu);
  }, [menuOpen]);

  const handleSwitchChange = (value: boolean) => {
    if (!onShowInContractChange) setInternalChecked(value);
    onShowInContractChange?.(value);
  };

  return (
    <article
      {...rest}
      dir="rtl"
      data-taav-business-account-info-card
      data-theme-mode={themeMode}
      className={cn(
        'relative w-full max-w-[740px] overflow-hidden rounded-[10px] border border-[var(--taav-business-account-border)] bg-[var(--taav-business-account-surface)] px-[16px] pb-[18px] pt-[12px] text-right shadow-[var(--taav-business-account-shadow)]',
        disabled ? 'opacity-60' : '',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center text-[var(--taav-business-account-brand)]">
            {logo ?? <Landmark className="h-9 w-9" strokeWidth={1.6} />}
          </div>
          <div>
            <h2 className="m-0 text-[17px] font-bold leading-7 text-[var(--taav-business-account-title)]">{bankName}</h2>
            <p className="m-0 text-[13px] leading-6 text-[var(--taav-business-account-contract)]">{contractLabel}</p>
          </div>
        </div>

        <div className="relative flex items-center gap-4 text-[var(--taav-business-account-action)]">
          {onRefresh ? (
            <button type="button" aria-label="بازنشانی اطلاعات حساب" onClick={onRefresh} disabled={disabled} className="inline-flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-40">
              <RefreshCw className="h-6 w-6" />
            </button>
          ) : null}
          <button
            type="button"
            aria-label="گزینه‌های بیشتر"
            aria-expanded={menuOpen}
            ref={menuButtonRef}
            onClick={() => { setMenuOpen((value) => !value); onMenuClick?.(); }}
            disabled={disabled}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-40"
          >
            <MoreVertical className="h-6 w-6" />
          </button>
          {menuOpen ? (
            <div ref={menuPanelRef} role="menu" className="absolute left-0 top-[30px] z-20 w-[104px] overflow-hidden rounded-[14px] border border-[var(--taav-business-account-border)] bg-[var(--taav-business-account-surface)] py-1 text-right shadow-[0_8px_22px_rgba(15,23,42,0.16)]">
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onEdit?.(); }} className="flex w-full items-center gap-2 px-3 py-3 text-[13px] text-[var(--taav-business-account-title)] hover:bg-[var(--taav-business-account-hover)]"><Pencil className="h-4 w-4" />ویرایش</button>
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onDelete?.(); }} className="flex w-full items-center gap-2 px-3 py-3 text-[13px] text-[var(--taav-business-account-title)] hover:bg-[var(--taav-business-account-hover)]"><Trash2 className="h-4 w-4" />حذف</button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mt-[10px] text-center text-[18px] font-semibold tracking-[0.12em] text-[var(--taav-business-account-number)]">{formattedAccountNumber}</div>
      <div className="mt-[10px] flex flex-col gap-0 text-[14px] leading-7 text-[var(--taav-business-account-text)]">
        <div dir="ltr" className="flex items-center justify-between gap-6"><span className="min-w-0 flex-1 text-left" dir="ltr">{accountNumber}</span><span className="shrink-0 text-right text-[var(--taav-business-account-link)]" dir="rtl">{accountLabel}</span></div>
        <div dir="ltr" className="flex items-center justify-between gap-6"><span className="min-w-0 flex-1 text-left" dir="ltr">{iban}</span><span className="shrink-0 text-right text-[var(--taav-business-account-link)]" dir="rtl">{ibanLabel}</span></div>
      </div>
      <div className="mt-[6px] border-t border-[var(--taav-business-account-divider)] pt-[10px]">
        <div dir="ltr" className="flex items-start justify-between gap-5"><AccountSwitch checked={checked} onChange={handleSwitchChange} disabled={disabled} /><div dir="rtl" className="min-w-0 text-right"><h3 className="m-0 text-[15px] font-semibold leading-6 text-[var(--taav-business-account-title)]">{displayLabel}</h3><p className="m-0 text-[12px] leading-5 text-[var(--taav-business-account-muted)]">{displayDescription}</p></div></div>
      </div>
      <div className="mt-[12px] text-right text-[14px] font-semibold leading-6 text-[var(--taav-business-account-title)]"><div>{ownerLabel}</div><div>{renderedOwnerNames.map((name, index) => <div key={index}>{name}</div>)}</div></div>
    </article>
  );
}

function AccountSwitch({ checked, onChange, disabled }: { checked: boolean; onChange?: (value: boolean) => void; disabled: boolean }) {
  return <button type="button" role="switch" aria-checked={checked} onClick={() => onChange?.(!checked)} disabled={disabled} className={cn('relative inline-flex h-[16px] w-[34px] shrink-0 items-center rounded-full transition-colors', checked ? 'bg-[#9adbd9]' : 'bg-[#c8ced7]')}><span className={cn('absolute left-0 h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.16)] transition-transform', checked ? 'translate-x-0' : 'translate-x-[16px]')} /></button>;
}
