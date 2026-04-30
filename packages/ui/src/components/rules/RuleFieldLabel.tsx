import type { ReactNode } from 'react';

export function RuleFieldLabel({ label, required = false, rightSlot }: { label: ReactNode; required?: boolean; rightSlot?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <label className="block text-right text-[15px] font-black text-[color:var(--text-strong)]">
        {label}
        {required ? <span className="mr-1 text-[#ff6b7a]">*</span> : null}
      </label>
      {rightSlot}
    </div>
  );
}

