'use client';

import { LoaderCircle, Save } from 'lucide-react';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function BusinessSettingsSubmitButton({
  saving,
  onClick,
  minimal = false,
  disabled = false,
  label = 'ثبت',
  savingLabel = 'در حال ثبت',
  widthClass = 'w-[120px]',
}: {
  saving: boolean;
  onClick: () => void;
  minimal?: boolean;
  disabled?: boolean;
  label?: string;
  savingLabel?: string;
  widthClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving || disabled}
      aria-busy={saving}
      className={cn(
        'pointer-events-auto inline-flex h-10 whitespace-nowrap items-center justify-center gap-1.5 rounded-md border border-[#065f46] bg-[#065f46] px-3 py-1.5 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#054e39] hover:shadow-[0_10px_20px_rgba(6,95,70,0.16)] active:translate-y-0 active:shadow-none disabled:hover:translate-y-0',
        saving ? 'disabled:cursor-wait' : 'disabled:cursor-not-allowed',
        widthClass,
        minimal ? 'shadow-none' : 'shadow-[0_10px_24px_rgba(6,95,70,0.28)]',
      )}
    >
      {saving ? (
        <>
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          <span className="translate-y-[0.5px]">{savingLabel}</span>
        </>
      ) : (
        <>
          <Save className="h-3.5 w-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
