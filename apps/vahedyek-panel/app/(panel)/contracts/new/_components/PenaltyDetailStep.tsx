'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgePercent,
  ChevronLeft,
  CircleDollarSign,
  CirclePercent,
  TrendingUp,
} from 'lucide-react';
import { StickySubmitBar } from '@repo/ui';
import { getPenaltyItem } from './penaltiesConfig';
import { useContractFlowBasePath } from './useContractFlowBasePath';

type PenaltyMode = 'fixed' | 'overdue' | 'contract' | 'progressive';
type PenaltyPeriod = 'daily' | 'monthly' | 'yearly';
type ExtraFeeType = 'percent' | 'fixed';
type RoundRule = '00' | '0' | '100' | '1000';

type ProgressiveRow = {
  id: string;
  fromDay: string;
  toDay: string;
  rate: string;
};

const MODE_OPTIONS: Array<{
  id: PenaltyMode;
  title: string;
  description: string;
  icon: typeof CircleDollarSign;
}> = [
  {
    id: 'fixed',
    title: 'مبلغ ثابت برای هر روز/ماه',
    description: 'در این روش، برای هر روز، ماه یا سال تاخیر مبلغ ثابتی به‌عنوان جریمه محاسبه می‌شود.',
    icon: CircleDollarSign,
  },
  {
    id: 'overdue',
    title: 'درصدی از مانده بدهی معوق',
    description: 'جریمه به‌صورت درصدی از مانده بدهی معوق محاسبه می‌شود.',
    icon: BadgePercent,
  },
  {
    id: 'contract',
    title: 'درصدی از کل قرارداد',
    description: 'جریمه بر مبنای درصدی از کل مبلغ قرارداد در بازه انتخاب‌شده محاسبه می‌شود.',
    icon: CirclePercent,
  },
  {
    id: 'progressive',
    title: 'جریمه تصاعدی با روزهای تاخیر',
    description: 'مبلغ جریمه با افزایش مدت تاخیر بر اساس بازه‌های زمانی مختلف افزایش پیدا می‌کند.',
    icon: TrendingUp,
  },
];

const PERIOD_OPTIONS: Array<{ id: PenaltyPeriod; label: string }> = [
  { id: 'daily', label: 'روزانه' },
  { id: 'monthly', label: 'ماهانه' },
  { id: 'yearly', label: 'سالانه' },
];

const ROUNDING_OPTIONS: Array<{ id: RoundRule; label: string }> = [
  { id: '00', label: '00' },
  { id: '0', label: '0' },
  { id: '100', label: 'کسر ۱۰۰' },
  { id: '1000', label: 'کسر ۱۰۰۰' },
];

const DEFAULT_PROGRESSIVE_ROWS: ProgressiveRow[] = [
  { id: 'row-1', fromDay: '1', toDay: '4', rate: '0.5' },
  { id: 'row-2', fromDay: '5', toDay: '6', rate: '0.5' },
  { id: 'row-3', fromDay: '7', toDay: '65', rate: '3.3' },
  { id: 'row-4', fromDay: '', toDay: '', rate: '' },
];

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
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
            {suffix}
          </span>
        )}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-14 w-full rounded-2xl border border-gray-300 bg-white px-4 text-lg text-gray-800 outline-none transition focus:border-cyan-500 ${
            suffix ? 'pr-12' : ''
          }`}
        />
      </div>
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
    </label>
  );
}

function RoundRuleSelector({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: RoundRule;
  onChange: (value: RoundRule) => void;
}) {
  return (
    <section className="border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-gray-600">{description}</p>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        {ROUNDING_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`rounded-full border px-6 py-3 text-base font-semibold transition ${
              value === item.id
                ? 'border-cyan-500 bg-cyan-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-400 hover:text-cyan-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">مثال: گرد کردن به ۱۰۰ یا ۱۰۰۰ تومان.</p>
    </section>
  );
}

function ToggleCard({
  enabled,
  onToggle,
  children,
}: {
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-cyan-100 bg-cyan-50 p-5 text-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">هزینه دیرکرد</h3>
          <p className="text-sm leading-7 text-gray-600">
            مبلغ یا درصد ثابتی که علاوه بر جریمه تاخیر برای هر قسط معوق اعمال می‌شود.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`relative h-8 w-14 rounded-full transition ${
            enabled ? 'bg-cyan-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
              enabled ? 'right-1' : 'right-7'
            }`}
          />
        </button>
      </div>
      {enabled && <div className="mt-6 space-y-5">{children}</div>}
    </div>
  );
}

export function PenaltyDetailStep({
  penaltyId,
  embedded = false,
  onBack,
}: {
  penaltyId: string;
  embedded?: boolean;
  onBack?: () => void;
}) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const penalty = getPenaltyItem(penaltyId);

  const [mode, setMode] = useState<PenaltyMode>('fixed');
  const [period, setPeriod] = useState<PenaltyPeriod>('monthly');
  const [fixedAmount, setFixedAmount] = useState('100,000');
  const [penaltyPercent, setPenaltyPercent] = useState('0.5');
  const [bankInterestPercent, setBankInterestPercent] = useState('');
  const [graceDays, setGraceDays] = useState('2');
  const [roundRule, setRoundRule] = useState<RoundRule>('100');
  const [extraFeeEnabled, setExtraFeeEnabled] = useState(false);
  const [extraFeeType, setExtraFeeType] = useState<ExtraFeeType>('percent');
  const [extraFeeAmount, setExtraFeeAmount] = useState('');
  const [extraFeeRoundRule, setExtraFeeRoundRule] = useState<RoundRule>('100');
  const [progressiveRows, setProgressiveRows] =
    useState<ProgressiveRow[]>(DEFAULT_PROGRESSIVE_ROWS);

  const activeMode = useMemo(() => MODE_OPTIONS.find((item) => item.id === mode)!, [mode]);

  const updateProgressiveRow = (rowId: string, key: keyof ProgressiveRow, value: string) => {
    setProgressiveRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)),
    );
  };

  const handleBack = () => {
    if (embedded) {
      onBack?.();
      return;
    }

    router.push(`${basePath}/penalties`);
  };

  const handleSubmit = () => {
    if (embedded) {
      onBack?.();
      return;
    }

    router.push(`${basePath}/penalties`);
  };

  if (!penalty) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        آیتم جریمه موردنظر پیدا نشد.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            بازگشت به لیست جرایم
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{penalty.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-600">{penalty.description}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-gray-200 bg-white text-right shadow-sm">
        <div className="grid gap-px bg-gray-200 md:grid-cols-4" dir="rtl">
          {MODE_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === mode;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`flex min-h-[132px] flex-col items-center justify-center gap-4 px-4 py-6 text-center transition ${
                  isActive ? 'bg-cyan-50 text-cyan-700' : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full border ${
                    isActive
                      ? 'border-cyan-200 bg-white text-cyan-700'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  <Icon className="h-7 w-7" />
                </span>
                <span className="text-sm font-medium leading-6">{item.title}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-8 p-6 md:p-10">
          <p className="text-center text-base leading-8 text-gray-600">{activeMode.description}</p>

          <section className="space-y-5">
            <h2 className="text-2xl font-bold text-gray-800">
              دوره محاسبه جریمه <span className="text-rose-400">*</span>
            </h2>
            <p className="text-sm leading-7 text-gray-600">
              مشخص می‌کند جریمه بر اساس تاخیر روزانه، ماهانه یا سالانه محاسبه شود.
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              {PERIOD_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPeriod(item.id)}
                  className={`rounded-full border px-6 py-3 text-base font-semibold transition ${
                    period === item.id
                      ? 'border-cyan-500 bg-cyan-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-400 hover:text-cyan-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {mode === 'fixed' && (
            <section className="space-y-6">
              <LabeledField
                label="مبلغ ثابت هر جریمه"
                value={fixedAmount}
                onChange={setFixedAmount}
                placeholder="مثال: 100,000 تومان"
                hint="مبلغی که برای هر دوره تاخیر به‌عنوان جریمه در نظر گرفته می‌شود."
              />
            </section>
          )}

          {(mode === 'overdue' || mode === 'contract') && (
            <section className="space-y-6">
              <LabeledField
                label="درصد جریمه"
                value={penaltyPercent}
                onChange={setPenaltyPercent}
                placeholder="مثال: 0.5"
                suffix="%"
                hint="درصد جریمه‌ای که برای دوره انتخاب‌شده اعمال می‌شود."
              />
              <LabeledField
                label="درصد سود بانکی"
                value={bankInterestPercent}
                onChange={setBankInterestPercent}
                placeholder="در صورت نیاز"
                suffix="%"
                hint="در این بخش مقدار سود بانکی جدا از درصد جریمه نمایش داده می‌شود."
              />
            </section>
          )}

          {mode === 'progressive' && (
            <section className="space-y-6">
              <LabeledField
                label="درصد سود بانکی"
                value={bankInterestPercent}
                onChange={setBankInterestPercent}
                placeholder="در صورت نیاز"
                suffix="%"
                hint="در این بخش مقدار سود بانکی که به درصد جریمه اضافه شود را وارد کنید تا به‌صورت جداگانه محاسبه شود."
              />

              <LabeledField
                label="مهلت تنفس (بدون جریمه)"
                value={graceDays}
                onChange={setGraceDays}
                placeholder="مثال: 2"
                hint="تعداد روزهایی که پس از سررسید بدون محاسبه جریمه به خریدار مهلت داده می‌شود."
              />

              <div className="border-t border-gray-200 pt-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-800">جدول جریمه‌های تصاعدی</h3>
                    <p className="text-sm leading-7 text-gray-600">
                      توجه داشته باشید که میزان نرخ جریمه با هم‌پوشانی نداشته باشد.
                    </p>
                  </div>
                  <button type="button" className="text-sm font-semibold text-cyan-600 hover:text-cyan-700">
                    تنظیمات پیشنهادی
                  </button>
                </div>

                <div className="space-y-5">
                  {progressiveRows.map((row) => (
                    <div key={row.id} className="grid gap-4 md:grid-cols-[1fr_28px_160px_160px] md:items-end">
                      <LabeledField
                        label="نرخ جریمه"
                        value={row.rate}
                        onChange={(value) => updateProgressiveRow(row.id, 'rate', value)}
                        suffix="%"
                        hint="مثال: ۰.۵٪"
                      />
                      <div className="hidden pb-7 text-center text-2xl text-gray-300 md:block">-</div>
                      <LabeledField
                        label="تا"
                        value={row.toDay}
                        onChange={(value) => updateProgressiveRow(row.id, 'toDay', value)}
                        placeholder="تا روز"
                        hint="مثال: تا ۵۰ روز تاخیر"
                      />
                      <LabeledField
                        label="از"
                        value={row.fromDay}
                        onChange={(value) => updateProgressiveRow(row.id, 'fromDay', value)}
                        placeholder="از روز"
                        hint="مثال: از ۱ روز تا ۵۰ روز تاخیر"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {mode !== 'progressive' && (
            <section className="space-y-6">
              <LabeledField
                label="مهلت تنفس (بدون جریمه)"
                value={graceDays}
                onChange={setGraceDays}
                placeholder="مثال: 2"
                hint="تعداد روزهایی که پس از سررسید بدون محاسبه جریمه به خریدار مهلت داده می‌شود."
              />
            </section>
          )}

          {mode !== 'fixed' && (
            <RoundRuleSelector
              title="قاعده گرد کردن مبلغ جریمه"
              description="مشخص می‌کند عدد نهایی جریمه پس از محاسبه به چه واحدی گرد شود."
              value={roundRule}
              onChange={setRoundRule}
            />
          )}

          <ToggleCard enabled={extraFeeEnabled} onToggle={() => setExtraFeeEnabled((current) => !current)}>
            <div className="space-y-4">
              <h4 className="text-xl font-bold">مشخص کنید بر اساس درصد می‌باشد یا مبلغ ثابت</h4>
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setExtraFeeType('percent')}
                  className={`rounded-full px-6 py-3 text-base font-semibold transition ${
                    extraFeeType === 'percent'
                      ? 'bg-cyan-600 text-white'
                      : 'border border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  درصد
                </button>
                <button
                  type="button"
                  onClick={() => setExtraFeeType('fixed')}
                  className={`rounded-full px-6 py-3 text-base font-semibold transition ${
                    extraFeeType === 'fixed'
                      ? 'bg-cyan-600 text-white'
                      : 'border border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  مبلغ ثابت
                </button>
              </div>
            </div>

            <LabeledField
              label="جریمه بالاسری"
              value={extraFeeAmount}
              onChange={setExtraFeeAmount}
              placeholder={extraFeeType === 'percent' ? 'مثال: 0.6' : 'مثال: 100,000'}
              suffix={extraFeeType === 'percent' ? '%' : undefined}
              hint="این مبلغ هنگام اولین تاخیر، علاوه بر جریمه اصلی، بر سررسید اعمال می‌شود."
            />

            <RoundRuleSelector
              title="قاعده گرد کردن هزینه دیرکرد"
              description="مشخص می‌کند عدد نهایی هزینه دیرکرد پس از محاسبه به چه واحدی گرد شود."
              value={extraFeeRoundRule}
              onChange={setExtraFeeRoundRule}
            />
          </ToggleCard>
        </div>
      </div>

      <StickySubmitBar label="ثبت" onClick={handleSubmit} embedded={embedded} />
    </div>
  );
}
