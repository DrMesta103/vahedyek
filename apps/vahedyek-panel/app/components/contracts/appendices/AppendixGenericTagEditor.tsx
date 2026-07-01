'use client';

import { Input, PersianDatePicker } from '@repo/ui';
import { CONTRACT_APPENDIX_TAG_MAP } from '../../../lib/contractAppendixConfig';
import {
  GENERIC_CONDITION_APPENDIX_TAGS,
  GENERIC_DATE_APPENDIX_TAGS,
  GENERIC_FINANCIAL_APPENDIX_TAGS,
  type AppendixGenericPayload,
} from '../../../lib/appendixPayloads';
import type { SupportedAppendixTagKey } from '../../../types/contract';

const FINANCIAL_TAGS = new Set<SupportedAppendixTagKey>(GENERIC_FINANCIAL_APPENDIX_TAGS as readonly SupportedAppendixTagKey[]);
const CONDITION_TAGS = new Set<SupportedAppendixTagKey>(GENERIC_CONDITION_APPENDIX_TAGS as readonly SupportedAppendixTagKey[]);
const DATE_TAGS = new Set<SupportedAppendixTagKey>(GENERIC_DATE_APPENDIX_TAGS as readonly SupportedAppendixTagKey[]);

function patchPayload(
  current: AppendixGenericPayload,
  onChange: (value: AppendixGenericPayload) => void,
  patch: Partial<AppendixGenericPayload>,
) {
  onChange({ ...current, ...patch });
}

export function AppendixGenericTagEditor({
  tag,
  value,
  onChange,
}: {
  tag: SupportedAppendixTagKey;
  value: AppendixGenericPayload;
  onChange: (value: AppendixGenericPayload) => void;
}) {
  const definition = CONTRACT_APPENDIX_TAG_MAP.get(tag);
  const showAmount = FINANCIAL_TAGS.has(tag);
  const showDates = DATE_TAGS.has(tag);
  const showDetail = CONDITION_TAGS.has(tag) || showAmount || showDates;

  return (
    <div className="mt-6 space-y-5 rounded-[8px] border border-slate-200 bg-white/90 p-5">
      <div className="rounded-[8px] border border-[color-mix(in_srgb,var(--dark-teal)_14%,#cbd5e1)] bg-[color-mix(in_srgb,var(--dark-teal)_06%,white)] px-4 py-3 text-right">
        <div className="text-[12px] font-black text-[color-mix(in_srgb,var(--dark-teal)_92%,black)]">این بخش فعال شده است</div>
        <p className="mt-1 text-[11px] font-semibold leading-6 text-slate-600">
          {definition?.description ?? 'این متمم با فرم عمومی فعال شده و از همین‌جا قابل ثبت است.'}
        </p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-right">
          <span className="text-[12px] font-black text-slate-700">عنوان متمم</span>
          <Input
            value={value.title}
            onChange={(event) => patchPayload(value, onChange, { title: event.target.value })}
            placeholder={definition?.title ?? 'عنوان متمم'}
            className="h-11 rounded-[8px] border-slate-200 bg-white px-4 text-[13px]"
          />
        </label>

        {showDetail ? (
          <label className="grid gap-2 text-right">
            <span className="text-[12px] font-black text-slate-700">شرح تغییر</span>
            <textarea
              value={value.detailText}
              onChange={(event) => patchPayload(value, onChange, { detailText: event.target.value })}
              placeholder="جزئیات این متمم را بنویسید"
              className="min-h-[120px] rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-[13px] leading-7 text-slate-800 outline-none transition focus:border-[color-mix(in_srgb,var(--dark-teal)_30%,#94a3b8)]"
            />
          </label>
        ) : null}

        {showAmount ? (
          <label className="grid gap-2 text-right">
            <span className="text-[12px] font-black text-slate-700">مبلغ مرتبط</span>
            <div className="relative">
              <Input
                value={value.amount}
                onChange={(event) => patchPayload(value, onChange, { amount: event.target.value.replace(/\D/g, '') })}
                placeholder="مبلغ را وارد کنید"
                className="h-11 rounded-[8px] border-slate-200 bg-white pr-4 pl-14 text-[13px]"
              />
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[11px] font-bold text-slate-400">تومان</span>
            </div>
          </label>
        ) : null}

        {showDates ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-right">
              <span className="text-[12px] font-black text-slate-700">تاریخ قبلی</span>
              <PersianDatePicker
                value={value.previousDate}
                onChange={(nextDate) => patchPayload(value, onChange, { previousDate: nextDate })}
                placeholder="انتخاب تاریخ"
                containerClassName="w-full"
              />
            </label>
            <label className="grid gap-2 text-right">
              <span className="text-[12px] font-black text-slate-700">تاریخ جدید</span>
              <PersianDatePicker
                value={value.nextDate}
                onChange={(nextDate) => patchPayload(value, onChange, { nextDate })}
                placeholder="انتخاب تاریخ"
                containerClassName="w-full"
              />
            </label>
          </div>
        ) : null}

        <label className="grid gap-2 text-right">
          <span className="text-[12px] font-black text-slate-700">یادداشت داخلی</span>
          <textarea
            value={value.notes}
            onChange={(event) => patchPayload(value, onChange, { notes: event.target.value })}
            placeholder="اگر لازم است نکته‌ای برای بایگانی ثبت کنید"
            className="min-h-[96px] rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-[13px] leading-7 text-slate-800 outline-none transition focus:border-[color-mix(in_srgb,var(--dark-teal)_30%,#94a3b8)]"
          />
        </label>
      </div>
    </div>
  );
}


