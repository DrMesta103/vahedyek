'use client';

export function RuleStatusTag({ label }: { label: string }) {
  return (
    <span className="inline-flex h-[34px] items-center gap-1.5 rounded-full border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-[12px] font-semibold whitespace-nowrap text-[#292929] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]">
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
      {label}
    </span>
  );
}
