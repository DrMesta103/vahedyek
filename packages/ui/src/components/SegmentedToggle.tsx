'use client';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function SegmentedToggle({
  checked,
  onChange,
  activeLabel = 'فعال',
  inactiveLabel = 'غیرفعال',
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'min-w-[92px] rounded-full px-4 py-2.5 text-sm font-black transition-all',
          !checked ? 'bg-[#a6e8ef] text-[#123b69] shadow-[0_8px_24px_rgba(148,163,184,0.18)]' : 'text-slate-500',
        )}
      >
        {inactiveLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'min-w-[92px] rounded-full px-4 py-2.5 text-sm font-black transition-all',
          checked ? 'bg-[#a6e8ef] text-[#123b69] shadow-[0_8px_24px_rgba(148,163,184,0.18)]' : 'text-slate-500',
        )}
      >
        {activeLabel}
      </button>
    </div>
  );
}

