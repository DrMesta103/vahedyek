'use client';

import { PersianDatePicker } from '@repo/ui';

export function AppendixDeliveryDateEditor({
  nextDate,
  reason,
  onNextDateChange,
  onReasonChange,
}: {
  nextDate: string;
  reason: string;
  onNextDateChange: (value: string) => void;
  onReasonChange: (value: string) => void;
}) {
  return (
    <div className="mt-6 grid gap-5">
      <label className="grid gap-2 text-right">
        <span className="text-[12px] font-black text-slate-700">تاریخ تحویل جدید*</span>
        <PersianDatePicker
          value={nextDate}
          onChange={onNextDateChange}
          placeholder="انتخاب تاریخ"
          containerClassName="w-full"
        />
      </label>
      <label className="grid gap-2 text-right">
        <span className="text-[12px] font-black text-slate-700">شرح تغییر</span>
        <textarea value={reason} onChange={(event) => onReasonChange(event.target.value)} className="app-textarea min-h-[148px]" />
      </label>
    </div>
  );
}
