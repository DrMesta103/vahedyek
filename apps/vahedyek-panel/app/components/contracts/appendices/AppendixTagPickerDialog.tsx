'use client';

import { X } from 'lucide-react';
import { CONTRACT_APPENDIX_TAG_GROUPS } from '../../../lib/contractAppendixConfig';
import type { AppendixTagKey } from '../../../types/contract';
import { Button } from '../../ui/button';

export function AppendixTagPickerDialog({
  open,
  selectedTags,
  onToggleTag,
  onClose,
  onConfirm,
}: {
  open: boolean;
  selectedTags: AppendixTagKey[];
  onToggleTag: (tag: AppendixTagKey) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
      dir="rtl"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-[30px] border border-slate-200/90 bg-[#fbfcfb] shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:rounded-[30px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appendix-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7">
          <div className="text-right">
            <h2 id="appendix-picker-title" className="text-[22px] font-black text-slate-900">
              الحاقیه قرارداد
            </h2>
            <p className="mt-2 max-w-[44rem] text-[12px] font-semibold leading-7 text-slate-600">
              در صورت اعمال الحاقیه، قرارداد قبلی در درجه اعتبار ساقط می‌شود و قرارداد جدید با اطلاعات الحاقیه جدید ساخته خواهد شد.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="space-y-6">
            {CONTRACT_APPENDIX_TAG_GROUPS.map((group, groupIndex) => (
              <section
                key={group.key}
                className={`${groupIndex ? 'border-t border-slate-200 pt-6' : ''}`}
                aria-label={group.title}
              >
                <div className="text-right">
                  <h3 className="text-[18px] font-black text-slate-800">{group.title}</h3>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2.5">
                  {group.tags.map((tag) => {
                    const active = selectedTags.includes(tag.key);
                    return (
                      <button
                        key={tag.key}
                        type="button"
                        onClick={() => onToggleTag(tag.key)}
                        className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-bold transition ${
                          active
                            ? 'border-[color-mix(in_srgb,var(--dark-teal)_50%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_95%,black)]'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                        aria-pressed={active}
                      >
                        {active ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--dark-teal)] text-[11px] text-white">
                            ✓
                          </span>
                        ) : null}
                        {tag.title}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-right text-[11px] font-semibold leading-6 text-slate-500">{group.helper}</p>
              </section>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
          <Button type="button" variant="primary" onClick={onConfirm} disabled={selectedTags.length === 0} className="min-w-[112px] rounded-2xl">
            تایید
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl text-[var(--dark-teal)]">
            انصراف
          </Button>
        </div>
      </div>
    </div>
  );
}
