'use client';

import type { ReactNode } from 'react';
import { BusinessSwitch, Input } from '@repo/ui';
import { MultiTagPills, SettingsAlignedFieldBlock, TagPills } from './ContractFormPrimitives';
import { SettingsFieldAlignmentTag } from './SettingsFieldAlignmentTag';
import { getDomainFieldHint, type DomainFieldHint } from '../../../../lib/contractSettingsHints/domainFieldHints';

export const DISCOUNT_CONDITION_DUE_BASIS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all-payment-types', label: 'تمام انواع پرداخت' },
  { value: 'advance-payment', label: 'پیش پرداخت' },
  { value: 'adjustment-payment', label: 'تعدیل' },
  { value: 'installments', label: 'اقساط' },
  { value: 'unit-handover', label: 'تحویل واحد' },
  { value: 'document-handover', label: 'تحویل سند' },
  { value: 'misc-costs', label: 'هزینه های جانبی' },
];

export const DISCOUNT_CONDITION_SETTLEMENT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'installment-due-date', label: 'تحویل سند' },
  { value: 'immediate-after-cancel', label: 'تسویه فوری پس از لغو تخفیف' },
  { value: 'unit-handover', label: 'تحویل واحد' },
];

export type DiscountConditionValues = {
  maxDelayCount: string;
  graceDays: string;
  dueBasis: string[];
  keepOnDelay: boolean;
  penaltyOnDiscount: boolean;
  settlementTiming: string;
};

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '');
}

function normalizeDueBasisSelection(current: string[], next: string[]) {
  const hasAllCurrently = current.includes('all-payment-types');
  const hasAllNext = next.includes('all-payment-types');

  if (!next.length) return ['all-payment-types'];
  if (hasAllCurrently && next.length > 1) return next.filter((item) => item !== 'all-payment-types');
  if (hasAllNext) return ['all-payment-types'];
  return next;
}

function InfoToggle({
  title,
  description,
  checked,
  onChange,
  alignmentTag,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  alignmentTag?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[8px] border border-slate-200 bg-white px-4 py-4">
      <div className="min-w-0 flex-1 space-y-1 text-right">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-extrabold text-slate-800">{title}</h4>
          {alignmentTag}
        </div>
        <p className="mt-1 text-xs leading-6 text-slate-500">{description}</p>
      </div>
      <BusinessSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

export function DiscountConditionPanel({
  values,
  onChange,
  compact = false,
  fieldHints = {},
}: {
  values: DiscountConditionValues;
  onChange: (patch: Partial<DiscountConditionValues>) => void;
  compact?: boolean;
  fieldHints?: Record<string, DomainFieldHint>;
}) {
  const dueBasisValue = values.dueBasis.length ? values.dueBasis : ['all-payment-types'];
  const settlementValue = values.settlementTiming || 'unit-handover';
  const tag = (key: string) => {
    const hint = getDomainFieldHint(fieldHints, key);
    return <SettingsFieldAlignmentTag status={hint.status} settingsLabel={hint.settingsLabel} />;
  };

  return (
    <section className={`space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 ${compact ? 'p-4' : 'p-5'}`} dir="rtl">
      <div className="text-right">
        <h3 className="text-base font-black text-slate-900">شرط تخفیف و خوش حسابی تخفیف</h3>
        <p className="mt-2 text-xs leading-6 text-slate-500">
          در صورت فعال بودن منع قرارداد، بر اساس شاخص های زیر مشخص می شود کدام پرداخت ها خوش حساب محسوب می شوند.
        </p>
      </div>

      <SettingsAlignedFieldBlock label="حداکثر تعداد دفعات تاخیر در یک قرارداد" alignmentTag={tag('maxDelayCount')}>
        <Input
          value={values.maxDelayCount}
          onChange={(event) => onChange({ maxDelayCount: normalizeDigits(event.target.value) })}
          className="h-12 rounded-[8px] border-slate-300 bg-white text-right"
          inputMode="numeric"
        />
        <p className="text-right text-xs leading-6 text-slate-500">
          حداکثر دفعاتی که در یک قرارداد و در طول پرداخت انواع سررسیدها مجاز به تاخیر قبل از محرومیت است را وارد کنید.
        </p>
      </SettingsAlignedFieldBlock>

      <SettingsAlignedFieldBlock label="مهلت تنفس (بدون لغو تخفیف)*" alignmentTag={tag('graceDays')}>
        <Input
          value={values.graceDays}
          onChange={(event) => onChange({ graceDays: normalizeDigits(event.target.value) })}
          className="h-12 rounded-[8px] border-slate-300 bg-white text-right"
          inputMode="numeric"
        />
        <p className="text-right text-xs leading-6 text-slate-500">
          تعداد روزهایی که خریدار می تواند پس از سررسید، مبلغ مربوط را بدون از دست دادن تخفیف پرداخت کند.
        </p>
      </SettingsAlignedFieldBlock>

      <SettingsAlignedFieldBlock label="سررسید ها متاثر از شرط تخفیف" alignmentTag={tag('dueBasis')}>
        <MultiTagPills
          options={DISCOUNT_CONDITION_DUE_BASIS_OPTIONS}
          values={dueBasisValue}
          onChange={(next) => onChange({ dueBasis: normalizeDueBasisSelection(dueBasisValue, next) })}
          className="justify-end"
        />
        <p className="text-right text-xs leading-6 text-slate-500">
          در این بخش تعیین می کنید که برای حفظ تخفیف، کدام پرداخت ها باید به موقع انجام شوند.
        </p>
      </SettingsAlignedFieldBlock>

      <InfoToggle
        title="امکان تخفیف علیرغم تاخیر لغو نشده"
        description="اگر تخفیف به دلیل تاخیر لغو نشود، با فعال بودن این گزینه مبلغ تخفیف می تواند همچنان در جریان قرارداد باقی بماند."
        checked={values.keepOnDelay}
        onChange={(checked) => onChange({ keepOnDelay: checked })}
        alignmentTag={tag('keepOnDelay')}
      />

      <InfoToggle
        title="اعمال جریمه بر مبلغ لغو تخفیف"
        description="در صورت فعال بودن، اگر تخفیف به دلیل تأخیر لغو شود، می توان برای مبلغ تخفیف لغوشده نیز جریمه محاسبه کرد."
        checked={values.penaltyOnDiscount}
        onChange={(checked) => onChange({ penaltyOnDiscount: checked })}
        alignmentTag={tag('penaltyOnDiscount')}
      />

      <SettingsAlignedFieldBlock label="زمان تسویه تخفیف" alignmentTag={tag('settlementTiming')}>
        <TagPills
          options={DISCOUNT_CONDITION_SETTLEMENT_OPTIONS}
          value={settlementValue}
          onChange={(value) => onChange({ settlementTiming: Array.isArray(value) ? value[0] ?? '' : value })}
          className="justify-end"
        />
        <p className="text-right text-xs leading-6 text-slate-500">
          مشخص می کند مبلغ لغو تخفیف در چه مرحله ای از قرارداد باید تسویه شود.
        </p>
      </SettingsAlignedFieldBlock>
    </section>
  );
}
