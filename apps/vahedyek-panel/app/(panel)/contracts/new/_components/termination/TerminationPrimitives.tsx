'use client';

import type { ReactNode } from 'react';
import { BusinessSwitch } from '../ContractFormPrimitives';

export function ToggleRow({
  checked,
  onChange,
  label,
  description,
  alignmentTag,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  alignmentTag?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[8px] border border-slate-200 bg-slate-50/60 px-4 py-3">
      <div className="min-w-0 flex-1 text-right">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <p className="text-sm font-bold text-slate-900">{label}</p>
          {alignmentTag}
        </div>
        {description ? <p className="mt-1 text-xs leading-6 text-slate-500">{description}</p> : null}
      </div>
      <BusinessSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

export function RadioRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-[8px] border px-3 py-3 text-right text-sm transition-all ${
        checked ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-white'
      }`}
    >
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 shrink-0 border-slate-300 text-cyan-600 focus:ring-cyan-500" />
      <span className={checked ? 'font-semibold text-cyan-900' : 'text-slate-700'}>{label}</span>
    </label>
  );
}

export function SubsectionSubmitRow({ onSave, saving, disabled }: { onSave: () => void; saving: boolean; disabled?: boolean }) {
  return (
    <div className="flex justify-end border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onSave}
        disabled={saving || disabled}
        className="inline-flex min-h-[44px] min-w-[120px] items-center justify-center rounded-[8px] bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {saving ? 'در حال ثبت...' : 'ثبت'}
      </button>
    </div>
  );
}

export function firstErrorMessage(errors: Record<string, string>) {
  const key = Object.keys(errors)[0];
  return key ? errors[key] : '';
}


