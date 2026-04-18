'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CircleDollarSign, CirclePercent } from 'lucide-react';
import { StickySubmitBar } from './StickySubmitBar';
import {
  getDiscountEntry,
  getDiscountGroup,
  type DiscountScope,
} from './discountsConfig';
import { useContractFlowBasePath } from './useContractFlowBasePath';

type ValueMode = 'amount' | 'percent';

function LabeledField({
  label,
  hint,
  suffix,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  suffix?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-3">
      <span className="block text-base font-bold text-gray-800">
        {label} <span className="text-rose-400">*</span>
      </span>
      <div className="relative">
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">{suffix}</span>}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-14 w-full rounded-2xl border border-gray-300 bg-white px-4 text-lg text-gray-800 outline-none transition focus:border-cyan-500 ${suffix ? 'pr-12' : ''}`}
        />
      </div>
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
    </label>
  );
}

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-8 w-14 rounded-full transition ${enabled ? 'bg-cyan-500' : 'bg-gray-300'}`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
          enabled ? 'right-1' : 'right-7'
        }`}
      />
    </button>
  );
}

function SimpleCardLink({ title, description }: { title: string; description: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 text-right shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50/30"
    >
      <div className="space-y-2">
        <div className="text-lg font-bold text-gray-900">{title}</div>
        <div className="text-sm leading-6 text-gray-600">{description}</div>
      </div>
      <ChevronLeft className="h-5 w-5 text-gray-400" />
    </button>
  );
}

export function DiscountEntryDetailStep({
  discountId,
  scope,
  entryId,
}: {
  discountId: string;
  scope: DiscountScope;
  entryId: string;
}) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const group = getDiscountGroup(discountId);
  const entry = getDiscountEntry(scope, entryId);
  const [activeState, setActiveState] = useState(true);
  const [valueMode, setValueMode] = useState<ValueMode>('amount');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [managerApproval, setManagerApproval] = useState(false);
  const [approvalThreshold, setApprovalThreshold] = useState('');

  const pageTitle = useMemo(() => entry?.title ?? '', [entry]);

  if (!group || !entry) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        تنظیمات تخفیف موردنظر پیدا نشد.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push(`${basePath}/discounts/${discountId}`)}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            بازگشت به {group.title}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        </div>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-gray-200 bg-white text-right shadow-sm">
        <div className="space-y-6 p-6 md:p-8">
          {scope === 'itemized' && (
            <div className="flex justify-start">
              <div className="inline-flex rounded-full bg-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => setActiveState(false)}
                  className={`rounded-full px-8 py-2 text-sm font-semibold transition ${
                    !activeState ? 'bg-gray-500 text-white' : 'text-gray-700'
                  }`}
                >
                  غیرفعال
                </button>
                <button
                  type="button"
                  onClick={() => setActiveState(true)}
                  className={`rounded-full px-8 py-2 text-sm font-semibold transition ${
                    activeState ? 'bg-cyan-600 text-white' : 'text-gray-700'
                  }`}
                >
                  فعال
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-px bg-gray-200 md:grid-cols-2" dir="rtl">
            <button
              type="button"
              onClick={() => setValueMode('amount')}
              className={`flex min-h-[110px] flex-col items-center justify-center gap-3 px-4 py-5 transition ${
                valueMode === 'amount' ? 'bg-cyan-50 text-cyan-700' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className={`flex h-16 w-16 items-center justify-center rounded-full border ${valueMode === 'amount' ? 'border-cyan-200 bg-white text-cyan-700' : 'border-gray-300 text-gray-500'}`}>
                <CircleDollarSign className="h-7 w-7" />
              </span>
              <span className="font-semibold">مبلغ</span>
            </button>
            <button
              type="button"
              onClick={() => setValueMode('percent')}
              className={`flex min-h-[110px] flex-col items-center justify-center gap-3 px-4 py-5 transition ${
                valueMode === 'percent' ? 'bg-cyan-50 text-cyan-700' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className={`flex h-16 w-16 items-center justify-center rounded-full border ${valueMode === 'percent' ? 'border-cyan-200 bg-white text-cyan-700' : 'border-gray-300 text-gray-500'}`}>
                <CirclePercent className="h-7 w-7" />
              </span>
              <span className="font-semibold">درصد</span>
            </button>
          </div>

          {valueMode === 'amount' ? (
            <div className="space-y-6">
              <LabeledField
                label="حداقل مبلغ تخفیف"
                value={minValue}
                onChange={setMinValue}
                placeholder="تومان"
                hint="حداقل مبلغی که در صورت اعمال تخفیف می‌تواند کاهش داده شود."
              />
              <LabeledField
                label="حداکثر مبلغ تخفیف"
                value={maxValue}
                onChange={setMaxValue}
                placeholder="تومان"
                hint="حداکثر مبلغی که مجاز به تخفیف است."
              />
            </div>
          ) : (
            <div className="space-y-6">
              <LabeledField
                label="حداقل درصد تخفیف"
                value={minValue}
                onChange={setMinValue}
                placeholder="٪"
                suffix="%"
                hint="حداقل درصدی که در صورت اعمال تخفیف می‌تواند کاهش داده شود."
              />
              <LabeledField
                label="حداکثر درصد تخفیف"
                value={maxValue}
                onChange={setMaxValue}
                placeholder="٪"
                suffix="%"
                hint="حداکثر درصدی که مجاز به تخفیف است."
              />
            </div>
          )}

          <div className="border-t border-gray-200 pt-8">
            <SimpleCardLink
              title="شرط تخفیف و خوش‌حسابی تخفیف"
              description="در این بخش می‌توانید مشخص کنید که تحت چه شرایطی می‌خواهید تخفیف برای کاربر در نظر بگیرید."
            />
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">تایید مدیر برای تخفیف‌های بزرگ</h2>
                <p className="text-sm leading-7 text-gray-600">در صورت فعال بودن، تخفیف‌های بالاتر از یک حد مشخص فقط با تایید نقش‌های مدیریتی انجام می‌شود.</p>
              </div>
              <Toggle enabled={managerApproval} onToggle={() => setManagerApproval((current) => !current)} />
            </div>

            {managerApproval && (
              <div className="mt-6">
                <LabeledField
                  label="آستانه تایید مدیر"
                  value={approvalThreshold}
                  onChange={setApprovalThreshold}
                  placeholder={valueMode === 'percent' ? '٪' : 'تومان'}
                  suffix={valueMode === 'percent' ? '%' : undefined}
                  hint="اگر مقدار تخفیف از این حد عبور کند، درخواست باید توسط مدیر یا واحد مالی تایید شود."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <StickySubmitBar label="ثبت" onClick={() => router.push(`${basePath}/discounts/${discountId}`)} />
    </div>
  );
}
