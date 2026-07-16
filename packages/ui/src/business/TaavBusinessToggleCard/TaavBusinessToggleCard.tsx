'use client';

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';

export type TaavBusinessToggleCardVariant = 'simple' | 'action';
export type TaavBusinessToggleCardProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & { title?: ReactNode; description?: ReactNode; checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void; variant?: TaavBusinessToggleCardVariant; icon?: ReactNode; onAction?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']; actionLabel?: string; disabled?: boolean; themeMode?: 'auto' | 'light' | 'dark' };

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <div role="group" aria-label="وضعیت" className={cn('inline-flex h-9 w-[180px] shrink-0 items-center rounded-full bg-[var(--taav-toggle-card-track)] p-1', disabled && 'opacity-50')}><button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(true)} className={cn('h-7 flex-1 rounded-full px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-toggle-card-focus)]', checked ? 'bg-[var(--taav-toggle-card-active)] text-white shadow-sm' : 'text-[var(--taav-toggle-card-muted)]')}>فعال</button><button type="button" aria-pressed={!checked} disabled={disabled} onClick={() => onChange(false)} className={cn('h-7 flex-1 rounded-full px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-toggle-card-focus)]', !checked ? 'bg-[var(--taav-toggle-card-active)] text-white shadow-sm' : 'text-[var(--taav-toggle-card-muted)]')}>غیرفعال</button></div>;
}

export function TaavBusinessToggleCard({ title = 'عنوان وضعیت', description, checked, defaultChecked = false, onCheckedChange, variant = 'simple', icon = <SlidersHorizontal className="h-6 w-6" />, onAction, actionLabel = 'مشاهده جزئیات', disabled = false, themeMode = 'auto', className, ...rest }: TaavBusinessToggleCardProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const current = checked ?? internalChecked;
  const update = (value: boolean) => { if (disabled) return; if (checked === undefined) setInternalChecked(value); onCheckedChange?.(value); };
  const copy = <div className="min-w-0 flex-1"><h2 className="m-0 text-[16px] font-bold leading-7 text-[var(--taav-toggle-card-title)]">{title}</h2>{description ? <p className="m-0 mt-0.5 text-[12px] leading-5 text-[var(--taav-toggle-card-description)]">{description}</p> : null}</div>;
  const toggle = <Toggle checked={current} onChange={update} disabled={disabled} />;
  return <article {...rest} dir="rtl" data-taav-business-toggle-card data-variant={variant} data-theme-mode={themeMode} className={cn('w-full rounded-[14px] border border-[var(--taav-toggle-card-border)] bg-[var(--taav-toggle-card-surface)] text-right text-[var(--taav-toggle-card-text)]', variant === 'action' ? 'px-5 py-3' : 'px-4 py-2.5', disabled && 'opacity-60', className)}><div className={cn('flex items-center gap-5', variant === 'action' ? 'min-h-[62px]' : 'min-h-[46px]')}>{variant === 'action' ? <><button type="button" aria-label={actionLabel} onClick={onAction} disabled={disabled || !onAction} className="order-1 inline-flex h-8 w-8 shrink-0 items-center justify-center text-[var(--taav-toggle-card-action)] transition-colors hover:text-[var(--taav-toggle-card-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-toggle-card-focus)] disabled:opacity-40"><ChevronRight className="h-7 w-7" /></button><span className="order-2 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--taav-toggle-card-icon-bg)] text-[var(--taav-toggle-card-icon)]" aria-hidden="true">{icon}</span><span className="order-3 flex min-w-0 flex-1">{copy}</span><span className="order-4">{toggle}</span></> : <><span className="order-1 flex min-w-0 flex-1">{copy}</span><span className="order-2">{toggle}</span></>}</div></article>;
}
