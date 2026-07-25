'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { useId, useState } from 'react';
import { ChevronRight, Info, UserRound, UsersRound } from 'lucide-react';
import { TaavSkeleton } from '../../data-display/TaavSkeleton';
import { cn } from '../../utils/cn';

export type TaavBusinessOwnershipValue = 'individual' | 'legal';

export type TaavBusinessOwnershipCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  value?: TaavBusinessOwnershipValue;
  defaultValue?: TaavBusinessOwnershipValue;
  onValueChange?: (value: TaavBusinessOwnershipValue) => void;
  individualLabel?: ReactNode;
  legalLabel?: ReactNode;
  individualIcon?: ReactNode;
  legalIcon?: ReactNode;
  infoLabel?: string;
  onInfoClick?: () => void;
  continueLabel?: string;
  continueHref?: string;
  onContinue?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'title' | 'onChange'>;

export function TaavBusinessOwnershipCard({
  title = 'نوع مالکیت و اطلاعات پایه',
  description = 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
  value,
  defaultValue = 'individual',
  onValueChange,
  individualLabel = 'حقیقی',
  legalLabel = 'حقوقی',
  individualIcon,
  legalIcon,
  infoLabel = 'اطلاعات درباره نوع مالکیت',
  onInfoClick,
  continueLabel = 'ادامه',
  continueHref,
  onContinue,
  disabled = false,
  loading = false,
  className,
  ...rest
}: TaavBusinessOwnershipCardProps) {
  const groupId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = value ?? internalValue;

  const selectValue = (nextValue: TaavBusinessOwnershipValue) => {
    if (disabled || loading) return;
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  const continueContent = <ChevronRight className="h-7 w-7" strokeWidth={1.7} aria-hidden="true" />;
  const continueNode = continueHref ? (
    <a href={continueHref} aria-label={continueLabel} onClick={onContinue} className="text-[#009ca6] transition-colors hover:text-[#007f86] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]">
      {continueContent}
    </a>
  ) : (
    <button type="button" aria-label={continueLabel} onClick={onContinue} disabled={!onContinue || disabled || loading} className="text-[#009ca6] transition-colors hover:text-[#007f86] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed disabled:opacity-50">
      {continueContent}
    </button>
  );

  return (
    <article
      {...rest}
      dir="rtl"
      data-taav-business-ownership-card
      data-value={selectedValue}
      data-disabled={disabled || undefined}
      data-loading={loading || undefined}
      className={cn('w-full max-w-[690px] overflow-hidden rounded-[2px] border border-[#eef1f2] bg-white px-[18px] pb-[12px] pt-[14px] text-right shadow-[0_4px_14px_rgba(15,23,42,0.03)]', disabled ? 'opacity-60' : '', className)}
    >
      {loading ? (
        <div className="grid gap-5">
          <div className="flex items-start justify-between gap-4"><TaavSkeleton variant="custom" width={52} height={52} radius="lg" /><div className="grid flex-1 justify-items-end gap-2"><TaavSkeleton variant="title" width="38%" /><TaavSkeleton variant="text" width="55%" /></div></div>
          <div className="grid grid-cols-2 gap-8"><TaavSkeleton variant="custom" width="100%" height={58} /><TaavSkeleton variant="custom" width="100%" height={58} /></div>
        </div>
      ) : (
        <>
          <header className="flex items-start justify-start gap-2">
            <div className="flex shrink-0 items-center gap-2">
              {continueNode}
              <span className="inline-flex h-[56px] w-[56px] items-center justify-center rounded-[20px] bg-[rgba(0,156,166,0.10)] text-[#009ca6]" title={infoLabel}>
                {onInfoClick ? <button type="button" aria-label={infoLabel} onClick={onInfoClick} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]"><Info className="h-6 w-6" strokeWidth={1.7} /></button> : <Info className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />}
              </span>
            </div>
            <div className="min-w-0 pt-[2px] text-right">
              <h2 className="m-0 text-[18px] font-bold leading-7 text-[#4b4b4b]">{title}</h2>
              {description ? <p className="m-0 mt-[2px] text-[13px] leading-6 text-[#777777]">{description}</p> : null}
            </div>
          </header>

          <div role="radiogroup" aria-label={typeof title === 'string' ? title : 'نوع مالکیت'} className="mt-[12px] grid grid-cols-2 gap-[10px]">
            <OwnershipOption id={`${groupId}-legal`} value="legal" selectedValue={selectedValue} label={legalLabel} icon={legalIcon ?? <UsersRound className="h-6 w-6" strokeWidth={1.25} />} disabled={disabled} onSelect={selectValue} />
            <OwnershipOption id={`${groupId}-individual`} value="individual" selectedValue={selectedValue} label={individualLabel} icon={individualIcon ?? <UserRound className="h-6 w-6" strokeWidth={1.25} />} disabled={disabled} onSelect={selectValue} />
          </div>
        </>
      )}
    </article>
  );
}

function OwnershipOption({ id, value, selectedValue, label, icon, disabled, onSelect }: { id: string; value: TaavBusinessOwnershipValue; selectedValue: TaavBusinessOwnershipValue; label: ReactNode; icon: ReactNode; disabled: boolean; onSelect: (value: TaavBusinessOwnershipValue) => void }) {
  const selected = value === selectedValue;
  return (
    <button id={id} type="button" role="radio" aria-checked={selected} disabled={disabled} onClick={() => onSelect(value)} className={cn('flex min-h-[64px] flex-col items-center justify-center gap-1 border-b-2 border-transparent px-3 py-1 text-[13px] text-[#666666] transition-[border-color,color,background-color] hover:bg-[#fafcfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]', selected ? 'border-[#4f4f4f] text-[#4f4f4f]' : '')}>
      <span className="text-[#777777]" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
