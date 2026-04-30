'use client';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type ShareMode = 'percent' | 'dang';

export function ShareModePills({
  label = 'نوع سهم',
  value,
  onChange,
  className = '',
}: {
  label?: string;
  value: ShareMode;
  onChange: (value: ShareMode) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="text-[12px] font-bold text-slate-700">{label}</div>
      <div className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => onChange('percent')}
          className={cn(
            'min-w-[78px] px-4 py-2 text-[12px] font-bold transition',
            value === 'percent' ? 'bg-[color:var(--theme-accent-soft)] text-[color:var(--theme-accent-strong)]' : 'text-slate-600 hover:bg-slate-50',
          )}
        >
          درصد
        </button>
        <button
          type="button"
          onClick={() => onChange('dang')}
          className={cn(
            'min-w-[78px] px-4 py-2 text-[12px] font-bold transition',
            value === 'dang' ? 'bg-[color:var(--theme-accent-soft)] text-[color:var(--theme-accent-strong)]' : 'text-slate-600 hover:bg-slate-50',
          )}
        >
          دانگ
        </button>
      </div>
    </div>
  );
}

