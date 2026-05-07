'use client';

import type { ContractTerminationData } from '../../../../../types/contract';
import { formatThousandsGroupedInput } from '../../../../../lib/moneyInputFormat';
import { FieldGroup, FormTextInput, MultiTagPills, TagPills } from '../ContractFormPrimitives';
import { RadioRow, SubsectionSubmitRow, ToggleRow } from './TerminationPrimitives';

type C = ContractTerminationData['constructorTerms'];

const GRACE_A: ReadonlyArray<{ value: C['lateInstallment']['gracePreset']; label: string }> = [
  { value: '3', label: '۳ روز' },
  { value: '7', label: '۷ روز' },
  { value: '10', label: '۱۰ روز' },
  { value: '15', label: '۱۵ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: 'other', label: 'سایر' },
];

const GRACE_B: ReadonlyArray<{ value: C['financialObligations']['gracePreset']; label: string }> = [
  { value: '3', label: '۳ روز' },
  { value: '7', label: '۷ روز' },
  { value: '10', label: '۱۰ روز' },
  { value: '15', label: '۱۵ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: 'other', label: 'سایر' },
];

const DAYS_3_30: ReadonlyArray<{
  value: C['documentDeficiencies']['completionDeadlineDays'];
  label: string;
}> = [
  { value: '3', label: '۳ روز' },
  { value: '7', label: '۷ روز' },
  { value: '10', label: '۱۰ روز' },
  { value: '15', label: '۱۵ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: 'other', label: 'سایر' },
];

const DAYS_3_30_WITH_OTHER: ReadonlyArray<{
  value: C['otherBreach']['rectificationDays'];
  label: string;
}> = [
  { value: '3', label: '۳ روز' },
  { value: '7', label: '۷ روز' },
  { value: '10', label: '۱۰ روز' },
  { value: '15', label: '۱۵ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: 'other', label: 'سایر' },
];

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '');
}

const FIN_OPTS: ReadonlyArray<{
  value: C['financialObligations']['obligationTypes'][number];
  label: string;
}> = [
  { value: 'contract-costs', label: 'هزینه‌های قراردادی' },
  { value: 'penalties', label: 'جرایم' },
  { value: 'custom-commitments', label: 'تعهدات سفارشی' },
  { value: 'extra-costs', label: 'هزینه‌های اضافی' },
  { value: 'side-costs', label: 'هزینه‌های جانبی' },
];

const DOC_OPTS: ReadonlyArray<{
  value: C['documentDeficiencies']['mandatoryItems'][number];
  label: string;
}> = [
  { value: 'identity', label: 'مدارک هویتی' },
  { value: 'legal-permits', label: 'مجوزهای قانونی' },
  { value: 'signing-docs', label: 'مدارک امضاء' },
  { value: 'payment-docs', label: 'مدارک پرداخت' },
  { value: 'physical-presence', label: 'حضور فیزیکی' },
];

const VIOLATION_OPTS: ReadonlyArray<{
  value: C['otherBreach']['violationTypes'][number];
  label: string;
}> = [
  { value: 'transfer-restrictions', label: 'محدودیت انتقال' },
  { value: 'refusal-to-sign', label: 'امتناع از امضاء' },
  { value: 'lack-cooperation', label: 'عدم همکاری' },
  { value: 'false-information', label: 'اطلاعات نادرست' },
];

function toggleArray<T extends string>(items: T[], value: T, on: boolean) {
  return on ? Array.from(new Set([...items, value])) : items.filter((i) => i !== value);
}

export function LateInstallmentPanel({
  value,
  onChange,
  onSubmit,
  saving,
}: {
  value: C['lateInstallment'];
  onChange: (next: C['lateInstallment']) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <FieldGroup
        label="مهلت ارفاقی (Grace period)"
        hint="پس از سررسید، چند روز پیش از ارجاع به فرایند فسخ صبر می‌شود."
      >
        <TagPills
          value={value.gracePreset}
          onChange={(v) => onChange({ ...value, gracePreset: v, graceDaysCustom: v === 'other' ? value.graceDaysCustom : '' })}
          options={GRACE_A as { value: C['lateInstallment']['gracePreset']; label: string }[]}
        />
      </FieldGroup>

      {value.gracePreset === 'other' ? (
        <FieldGroup label="تعداد روز (سفارشی)" required>
          <FormTextInput
            value={value.graceDaysCustom}
            onChange={(v) => onChange({ ...value, graceDaysCustom: normalizeDigits(v) })}
            placeholder="مثال: ۱۲"
          />
        </FieldGroup>
      ) : null}

      <FieldGroup label="مبنای تشخیص تأخیر" hint="نوع سوابق پرداخت که برای ارزیابی تأخیر اقساط لحاظ می‌شود.">
        <div className="grid gap-2 md:grid-cols-3">
          <RadioRow checked={value.detectionBasis === 'per-installment'} onChange={() => onChange({ ...value, detectionBasis: 'per-installment' })} label="هر قسط پرداخت نشده" />
          <RadioRow checked={value.detectionBasis === 'total-debt'} onChange={() => onChange({ ...value, detectionBasis: 'total-debt' })} label="مجموع مبلغ بدهی" />
          <RadioRow
            checked={value.detectionBasis === 'consecutive-installments'}
            onChange={() => onChange({ ...value, detectionBasis: 'consecutive-installments' })}
            label="اقساط متوالی پرداخت نشده"
          />
        </div>
      </FieldGroup>

      <FieldGroup
        label="حداقل مبلغ بدهی"
        required={value.detectionBasis === 'total-debt'}
        hint="زمانی که مبنا «مجموع مبلغ بدهی» است، این آستانه برای ورود به جریان فسخ الزامی می‌شود."
      >
        <FormTextInput
          value={value.minDebtAmount}
          onChange={(v) => onChange({ ...value, minDebtAmount: formatThousandsGroupedInput(v) })}
          placeholder="مثال: ۱۰٬۰۰۰٬۰۰۰"
          inputMode="numeric"
          dir="ltr"
          className="text-left"
        />
      </FieldGroup>

      <FieldGroup label="برخورد با پرداخت جزئی">
        <div className="grid gap-2">
          <RadioRow checked={value.partialHandling === 'if-not-full'} onChange={() => onChange({ ...value, partialHandling: 'if-not-full' })} label="اگر قسط کامل نشده، فسخ فعال می‌شود" />
          <RadioRow checked={value.partialHandling === 'if-partial'} onChange={() => onChange({ ...value, partialHandling: 'if-partial' })} label="اگر پرداخت ناقص باشد، فسخ فعال نشود" />
          <RadioRow checked={value.partialHandling === 'by-remaining-debt'} onChange={() => onChange({ ...value, partialHandling: 'by-remaining-debt' })} label="بر اساس مانده بدهی تصمیم گرفته شود" />
        </div>
      </FieldGroup>

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
    </div>
  );
}

export function FinancialObligationsPanel({
  value,
  onChange,
  onSubmit,
  saving,
}: {
  value: C['financialObligations'];
  onChange: (next: C['financialObligations']) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <FieldGroup label="انواع تعهدات مالی مشمول" hint="با فعال‌سازی این گزینه، جرایم براساس پیکربندی به تمام قراردادهای جدید اعمال خواهند شد">
        <MultiTagPills<C['financialObligations']['obligationTypes'][number]>
          values={value.obligationTypes}
          onChange={(values) => onChange({ ...value, obligationTypes: values })}
          options={FIN_OPTS as { value: C['financialObligations']['obligationTypes'][number]; label: string }[]}
        />
      </FieldGroup>

      <FieldGroup label="مهلت ارفاقی" hint="پس از اعلام بدهی، چند روز برای ایفا در نظر گرفته می‌شود.">
        <TagPills
          value={value.gracePreset}
          onChange={(v) => onChange({ ...value, gracePreset: v, graceDaysCustom: v === 'other' ? value.graceDaysCustom : '' })}
          options={GRACE_B as { value: C['financialObligations']['gracePreset']; label: string }[]}
        />
      </FieldGroup>

      {value.gracePreset === 'other' ? (
        <FieldGroup label="تعداد روز (سفارشی)" required>
          <FormTextInput
            value={value.graceDaysCustom}
            onChange={(v) => onChange({ ...value, graceDaysCustom: normalizeDigits(v) })}
            placeholder="مثال: ۱۲"
          />
        </FieldGroup>
      ) : null}

      <ToggleRow
        checked={value.officialDemandRequired}
        onChange={(checked) => onChange({ ...value, officialDemandRequired: checked })}
        label="مطالبه رسمی قبل از فسخ"
        description="تعیین می‌کند که آیا پیش از اعمال فسخ، ارسال اخطار یا مطالبه رسمی الزامی باشد."
      />

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
    </div>
  );
}

export function DocumentDeficienciesPanel({
  value,
  onChange,
  onSubmit,
  saving,
}: {
  value: C['documentDeficiencies'];
  onChange: (next: C['documentDeficiencies']) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <FieldGroup label="موارد الزامی" hint="کدام مدارک یا تعهدات باید کامل باشند تا جریان ادامه یابد.">
        <MultiTagPills<C['documentDeficiencies']['mandatoryItems'][number]>
          values={value.mandatoryItems}
          onChange={(values) => onChange({ ...value, mandatoryItems: values })}
          options={DOC_OPTS as { value: C['documentDeficiencies']['mandatoryItems'][number]; label: string }[]}
        />
      </FieldGroup>

      <FieldGroup label="مهلت تکمیل">
        <p className="text-[11px] text-slate-400">پس از اعلام نقص، چند روز برای تکمیل مدارک/تعهدات فرصت داده می‌شود.</p>
        <TagPills
          value={value.completionDeadlineDays}
          onChange={(v) =>
            onChange({
              ...value,
              completionDeadlineDays: v,
              completionDeadlineDaysCustom: v === 'other' ? value.completionDeadlineDaysCustom : '',
            })
          }
          options={DAYS_3_30 as { value: C['documentDeficiencies']['completionDeadlineDays']; label: string }[]}
        />
      </FieldGroup>

      {value.completionDeadlineDays === 'other' ? (
        <FieldGroup label="تعداد روز مجاز (سفارشی)" required>
          <FormTextInput
            value={value.completionDeadlineDaysCustom}
            onChange={(v) => onChange({ ...value, completionDeadlineDaysCustom: normalizeDigits(v) })}
            placeholder="مثال: ۱۲"
            inputMode="numeric"
            dir="ltr"
            className="text-left"
          />
        </FieldGroup>
      ) : null}


      <ToggleRow
        checked={value.autoReminderEnabled}
        onChange={(checked) => onChange({ ...value, autoReminderEnabled: checked })}
        label="ارسال یادآوری قبل از فسخ"
        description="تعیین می‌کند که آیا سیستم پیش از اعمال فسخ، یک پیام یادآوری به خریدار ارسال کند. با فعال‌سازی، خریدار قبل از انقضای مهلت از وضعیت نقص مدارک یا تعهدات خود مطلع می‌شود و فرصت رفع آن را خواهد داشت."
      />

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
    </div>
  );
}

export function OtherBreachPanel({
  value,
  onChange,
  onSubmit,
  saving,
}: {
  value: C['otherBreach'];
  onChange: (next: C['otherBreach']) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <FieldGroup label="نوع نقض‌ها">
        <MultiTagPills<C['otherBreach']['violationTypes'][number]>
          values={value.violationTypes}
          onChange={(values) => onChange({ ...value, violationTypes: values })}
          options={VIOLATION_OPTS as { value: C['otherBreach']['violationTypes'][number]; label: string }[]}
        />
      </FieldGroup>

      <FieldGroup label="مهلت اصلاح رفتار" hint="پس از اعلام تخلف، فرصت جبران تعیین کنید.">
        <TagPills
          value={value.rectificationDays}
          onChange={(v) => onChange({ ...value, rectificationDays: v, rectificationDaysCustom: v === 'other' ? value.rectificationDaysCustom : '' })}
          options={DAYS_3_30_WITH_OTHER as { value: C['otherBreach']['rectificationDays']; label: string }[]}
        />
      </FieldGroup>

      {value.rectificationDays === 'other' ? (
        <FieldGroup label="تعداد روز مجاز (سفارشی)" required>
          <FormTextInput
            value={value.rectificationDaysCustom}
            onChange={(v) => onChange({ ...value, rectificationDaysCustom: normalizeDigits(v) })}
            placeholder="مثال: ۱۲"
            inputMode="numeric"
            dir="ltr"
            className="text-left"
          />
        </FieldGroup>
      ) : null}

      <ToggleRow
        checked={value.requiresContractManagerApproval}
        onChange={(checked) => onChange({ ...value, requiresContractManagerApproval: checked })}
        label="نیاز به تأیید مسئول قرارداد"
        description="اجرای فسخ در این مسیر تنها با تأیید مدیر قرارداد امکان‌پذیر است."
      />

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
    </div>
  );
}

export function NotificationsPanel({
  value,
  onChange,
  onSubmit,
  saving,
}: {
  value: C['notifications'];
  onChange: (next: C['notifications']) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <ToggleRow
        checked={value.notifyConstructor}
        onChange={(checked) => {
          onChange({ ...value, notifyConstructor: checked });
          onSubmit();
        }}
        label="اطلاع به سازنده هنگام فعال شدن اختیار فسخ"
        description="در صورت فعال‌سازی، هنگام فعال شدن اختیار فسخ، پیام اطلاع‌رسانی برای سازنده ارسال می‌شود."
      />
      <ToggleRow
        checked={value.notifyManager}
        onChange={(checked) => {
          onChange({ ...value, notifyManager: checked });
          onSubmit();
        }}
        label="اطلاع به مدیر قرارداد"
        description="در صورت فعال‌سازی، مدیر قرارداد از فعال شدن اختیار فسخ مطلع می‌شود."
      />
      <ToggleRow
        checked={value.showTerminationActionInContractDetails}
        onChange={(checked) => {
          onChange({ ...value, showTerminationActionInContractDetails: checked });
          onSubmit();
        }}
        label="نمایش بخش فسخ در جزئیات قرارداد"
        description="با فعال‌سازی، بخش فسخ در جزئیات قرارداد نمایش داده می‌شود تا دسترسی سریع برای بررسی/اقدام فراهم باشد."
      />
      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
    </div>
  );
}

