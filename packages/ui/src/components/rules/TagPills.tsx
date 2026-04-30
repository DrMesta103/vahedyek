'use client';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function TagPills<T extends string>({
  options,
  value,
  onChange,
  wrap = true,
  className = '',
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  wrap?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-2', wrap ? 'flex-wrap' : 'flex-nowrap overflow-x-auto pb-1', className)}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            data-tag-pill="true"
            data-active={active ? 'true' : 'false'}
            className={cn(
              'inline-flex h-[36px] items-center rounded-full border px-4 text-[12px] font-bold whitespace-nowrap transition-all',
              active
                ? 'border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] text-[color:var(--theme-action-text)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]'
                : 'border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

