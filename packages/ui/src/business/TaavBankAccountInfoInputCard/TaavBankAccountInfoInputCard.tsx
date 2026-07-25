'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { TaavBankAccountNumberInput, TaavBankCardNumberInput, TaavShebaNumberInput, type TaavBankAccountNumberInputProps, type TaavBankCardNumberInputProps, type TaavShebaNumberInputProps } from './TaavBankAccountInputs';

export type TaavBankAccountInfoInputCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  cardNumber?: TaavBankCardNumberInputProps;
  shebaNumber?: TaavShebaNumberInputProps;
  accountNumber?: TaavBankAccountNumberInputProps;
  variant?: 'compact' | 'showcase';
  themeMode?: 'auto' | 'light' | 'dark';
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title'>;

export function TaavBankAccountInfoInputCard({
  title = 'ورودی اطلاعات حساب بانکی',
  description = 'شماره کارت، شماره شبا و شماره حساب بانکی را وارد کنید.',
  cardNumber,
  shebaNumber,
  accountNumber,
  variant = 'compact',
  themeMode = 'auto',
  className,
  ...rest
}: TaavBankAccountInfoInputCardProps) {
  const [card, setCard] = useState(cardNumber?.value ?? cardNumber?.defaultValue ?? '');
  const [sheba, setSheba] = useState(shebaNumber?.value ?? shebaNumber?.defaultValue ?? '');
  const [account, setAccount] = useState(accountNumber?.value ?? accountNumber?.defaultValue ?? '');

  return (
    <article {...rest} dir="rtl" data-taav-bank-account-info-input-card data-variant={variant} data-theme-mode={themeMode} className={cn('w-full max-w-[700px] rounded-[18px] border border-[var(--taav-bank-input-card-border)] bg-[var(--taav-bank-input-card-surface)] px-5 py-5 text-right shadow-[var(--taav-bank-input-card-shadow)]', className)}>
      {variant === 'showcase' ? <header className="mb-5"><h2 className="m-0 text-[20px] font-bold leading-8 text-[var(--taav-bank-input-card-title)]">{title}</h2>{description ? <p className="m-0 mt-1 text-[13px] leading-6 text-[var(--taav-bank-input-card-description)]">{description}</p> : null}</header> : null}
      <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
        <TaavBankCardNumberInput {...cardNumber} value={cardNumber?.value !== undefined ? cardNumber.value : card} onValueChange={(next) => { setCard(next); cardNumber?.onValueChange?.(next); }} />
        <TaavShebaNumberInput {...shebaNumber} value={shebaNumber?.value !== undefined ? shebaNumber.value : sheba} onValueChange={(next) => { setSheba(next); shebaNumber?.onValueChange?.(next); }} />
        <TaavBankAccountNumberInput {...accountNumber} value={accountNumber?.value !== undefined ? accountNumber.value : account} onValueChange={(next) => { setAccount(next); accountNumber?.onValueChange?.(next); }} className="md:col-span-2" />
      </div>
    </article>
  );
}
