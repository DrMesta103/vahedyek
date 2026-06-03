'use client';

export function StickySubmitBar({
  label,
  onClick,
  disabled = false,
  loadingLabel,
  embedded = false,
  submitId,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loadingLabel?: string;
  embedded?: boolean;
  submitId?: string;
}) {
  const isLoading = disabled && Boolean(loadingLabel);
  const displayLabel = isLoading ? loadingLabel! : label;

  return (
    <div
      className={
        embedded
          ? 'mt-6'
          : 'sticky bottom-0 z-10 -mx-8 -mb-8 mt-6 border-t border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] backdrop-blur-sm max-sm:-mx-4 max-sm:-mb-4'
      }
    >
      <div className="flex items-center justify-end gap-3 px-5 py-3 max-sm:px-4">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          data-contract-save-trigger={submitId}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-teal-700 px-5 text-[13px] font-semibold text-white transition-all hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:cursor-not-allowed disabled:opacity-50 max-sm:min-h-11 max-sm:w-full max-sm:justify-center"
        >
          {isLoading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
          {displayLabel}
        </button>
      </div>
    </div>
  );
}

