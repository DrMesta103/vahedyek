'use client';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type ChoicePillsOption<T extends string> = { value: T; label: string };

export function ChoicePills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  wrap = true,
  className = '',
  pillClassName = '',
  showActiveIndicator = true,
}: {
  options: ReadonlyArray<ChoicePillsOption<T>>;
  value: T;
  onChange: (value: NoInfer<T>) => void;
  ariaLabel?: string;
  wrap?: boolean;
  className?: string;
  pillClassName?: string;
  showActiveIndicator?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('flex gap-2 max-sm:max-w-full max-sm:overflow-x-auto max-sm:pb-1', wrap ? 'flex-wrap' : 'flex-nowrap overflow-x-auto pb-1', className)}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            data-tag-pill="true"
            data-active={active ? 'true' : 'false'}
            className={cn(
              'inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-[12px] whitespace-nowrap transition-all max-sm:min-h-11 max-sm:px-4',
              active
                ? 'border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] font-semibold text-[color:var(--text-strong)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]'
                : 'border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-body)] hover:bg-[color:var(--surface-soft)]',
              pillClassName,
            )}
          >
            {active && showActiveIndicator ? (
              <span aria-hidden="true" className="choice-pill__check inline-flex h-3 w-3 shrink-0 items-center justify-center">
                <style>
                  {`
                    .choice-pill__check {
                      transform-origin: center;
                      animation: choice-pill-check-appear 120ms ease-out both;
                    }
                    @keyframes choice-pill-check-appear {
                      from { opacity: 0; transform: scale(0.95); }
                      to { opacity: 1; transform: scale(1); }
                    }
                    .choice-pill__check-path {
                      stroke-dasharray: 30;
                      stroke-dashoffset: 30;
                      animation: choice-pill-check-draw 360ms cubic-bezier(0.22, 1, 0.36, 1) 60ms both;
                    }
                    @keyframes choice-pill-check-draw {
                      to { stroke-dashoffset: 0; }
                    }
                  `}
                </style>
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path className="choice-pill__check-path" d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
