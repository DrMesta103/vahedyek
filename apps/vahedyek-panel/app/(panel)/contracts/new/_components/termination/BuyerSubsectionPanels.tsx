'use client';

import type { ContractTerminationData } from '../../../../../types/contract';
import { FieldGroup, FormTextInput, MultiTagPills, TagPills } from '../ContractFormPrimitives';
import { SubsectionSubmitRow, ToggleRow } from './TerminationPrimitives';

type B = ContractTerminationData['buyerTerms'];

const LATE_GRACE: ReadonlyArray<{ value: B['lateDelivery']['gracePreset']; label: string }> = [
  { value: '3', label: '۳ روز' },
  { value: '7', label: '۷ روز' },
  { value: '10', label: '۱۰ روز' },
  { value: '15', label: '۱۵ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: 'other', label: 'سایر' },
];

const RECT_OPTS: ReadonlyArray<{ value: B['breachOfObligations']['rectificationPreset']; label: string }> = [
  { value: '3', label: '۳ روز' },
  { value: '7', label: '۷ روز' },
  { value: '10', label: '۱۰ روز' },
  { value: '15', label: '۱۵ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: 'other', label: 'سایر' },
];

const THRESH_OPTS: ReadonlyArray<{ value: B['areaDiscrepancy']['thresholdPreset']; label: string }> = [
  { value: '1', label: '۱٪' },
  { value: '2', label: '۲٪' },
  { value: '3', label: '۳٪' },
  { value: 'other', label: 'سایر' },
];

const SPEC_OPTS: ReadonlyArray<{
  value: B['specificationChanges']['includedTypes'][number];
  label: string;
}> = [
  { value: 'unit-plan', label: 'پلان واحد' },
  { value: 'floor-change', label: 'تغییر طبقه' },
  { value: 'facility-reduction', label: 'کاهش امکانات' },
  { value: 'block-change', label: 'تغییر بلوک' },
  { value: 'material-quality', label: 'کیفیت مصالح' },
];

const BREACH_OPTS: ReadonlyArray<{
  value: B['breachOfObligations']['obligationTypes'][number];
  label: string;
}> = [
  { value: 'construction-progress', label: 'پیشرفت ساخت' },
  { value: 'quality-standards', label: 'استانداردهای کیفی' },
  { value: 'infrastructure-delivery', label: 'تحویل زیرساخت' },
  { value: 'legal-docs', label: 'مدارک حقوقی' },
  { value: 'service-connections', label: 'انشعابات خدماتی' },
];

const REF_OPTS: ReadonlyArray<{
  value: B['areaDiscrepancy']['referenceSources'][number];
  label: string;
}> = [
  { value: 'title-deed', label: 'سند مالکیت' },
  { value: 'final-survey', label: 'تصویب نقشه نهایی' },
  { value: 'property-registration', label: 'ثبت ملک' },
];

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '');
}

function normalizeDecimal(value: string) {
  return value.replace(/[^\d.]/g, '');
}

function toggleArray<T extends string>(items: T[], value: T, on: boolean) {
  return on ? Array.from(new Set([...items, value])) : items.filter((i) => i !== value);
}

export function BuyerLateDeliveryPanel({
  value,
  onChange,
  onSubmit,
  saving,
}: {
  value: B['lateDelivery'];
  onChange: (next: B['lateDelivery']) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <ToggleRow
        checked={value.ruleEnabled}
        onChange={(checked) => onChange({ ...value, ruleEnabled: checked })}
        label="فعال‌سازی فسخ به دلیل تأخیر در تحویل"
        description="در صورت فعال‌سازی، مبنا و مهلت ارفاقی برای تأخیر تحویل اعمال می‌شود."
      />

      <div className={`transition-all duration-200 ${value.ruleEnabled ? 'opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
      <FieldGroup label="مبنای محاسبه تأخیر" hint="سررسید تحویل نسبت به کدام تاریخ سنجیده می‌شود.">
        <TagPills<B['lateDelivery']['calculationBasis']>
          value={value.calculationBasis}
          onChange={(v) => onChange({ ...value, calculationBasis: v })}
          options={[
            { value: 'last-addendum', label: 'تاریخ آخرین الحاقیه' },
            { value: 'project-end', label: 'تاریخ پایان پروژه' },
            { value: 'contract-date', label: 'تاریخ قرارداد' },
          ]}
        />
      </FieldGroup>

      <FieldGroup label="مهلت ارفاقی پس از سررسید" hint="پیش از ورود به جریان فسخ، چند روز مهلت داده می‌شود.">
        <TagPills
          value={value.gracePreset}
          onChange={(v) => onChange({ ...value, gracePreset: v, graceDaysCustom: v === 'other' ? value.graceDaysCustom : '' })}
          options={LATE_GRACE as { value: B['lateDelivery']['gracePreset']; label: string }[]}
        />
      </FieldGroup>

      {value.gracePreset === 'other' ? (
        <FieldGroup label="تعداد روز (سفارشی)" required>
          <FormTextInput
            value={value.graceDaysCustom}
            onChange={(v) => onChange({ ...value, graceDaysCustom: normalizeDigits(v) })}
            placeholder="مثال: ۴۵"
          />
        </FieldGroup>
      ) : null}

      <ToggleRow
        checked={value.expertApprovalRequired}
        onChange={(checked) => onChange({ ...value, expertApprovalRequired: checked })}
        label="نیاز به تأیید ناظر / کارشناس پروژه"
        description="فسخ در این مسیر پس از تأیید ناظر یا کارشناس مسئول امکان‌پذیر است."
      />

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
      </div>
    </div>
  );
}

export function BuyerSpecificationChangesPanel({
  value,
  onChange,
  onSubmit,
  saving,
}: {
  value: B['specificationChanges'];
  onChange: (next: B['specificationChanges']) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <ToggleRow
        checked={value.ruleEnabled}
        onChange={(checked) => onChange({ ...value, ruleEnabled: checked })}
        label="فعال‌سازی فسخ به دلیل تغییر مشخصات"
        description="در صورت فعال‌سازی، تغییرات انتخاب‌شده می‌توانند منجر به حق فسخ خریدار شوند."
      />

      <div className={`transition-all duration-200 ${value.ruleEnabled ? 'opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
      <FieldGroup label="انواع تغییر مشمول" hint="مواردی که می‌توانند به حق فسخ خریدار بینجامند.">
        <MultiTagPills<B['specificationChanges']['includedTypes'][number]>
          values={value.includedTypes}
          onChange={(values) => onChange({ ...value, includedTypes: values })}
          options={SPEC_OPTS as { value: B['specificationChanges']['includedTypes'][number]; label: string }[]}
        />
      </FieldGroup>

      <ToggleRow
        checked={value.priorApprovalRequired}
        onChange={(checked) => onChange({ ...value, priorApprovalRequired: checked })}
        label="الزام تأیید الکترونیکی یا کتبی خریدار پیش از اعمال تغییر"
        description="بدون رضایت پیشین خریدار، تغییر مشخصات نباید اجرایی شود."
      />

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
      </div>
    </div>
  );
}

export function BuyerBreachPanel({
  value,
  onChange,
  onSubmit,
  saving,
}: {
  value: B['breachOfObligations'];
  onChange: (next: B['breachOfObligations']) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <ToggleRow
        checked={value.ruleEnabled}
        onChange={(checked) => onChange({ ...value, ruleEnabled: checked })}
        label="فعال‌سازی فسخ به دلیل نقض تعهدات"
        description="در صورت فعال‌سازی، تعهدات انتخاب‌شده با مهلت اصلاح برای ورود به جریان فسخ لحاظ می‌شوند."
      />

      <div className={`transition-all duration-200 ${value.ruleEnabled ? 'opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
      <FieldGroup label="تعهدات سازنده مشمول" hint="حداقل یک مورد را انتخاب کنید.">
        <MultiTagPills<B['breachOfObligations']['obligationTypes'][number]>
          values={value.obligationTypes}
          onChange={(values) => onChange({ ...value, obligationTypes: values })}
          options={BREACH_OPTS as { value: B['breachOfObligations']['obligationTypes'][number]; label: string }[]}
        />
      </FieldGroup>

      <FieldGroup label="مهلت اصلاح نقض تعهد">
        <TagPills
          value={value.rectificationPreset}
          onChange={(v) =>
            onChange({
              ...value,
              rectificationPreset: v,
              rectificationDaysCustom: v === 'other' ? value.rectificationDaysCustom : '',
            })
          }
          options={RECT_OPTS as { value: B['breachOfObligations']['rectificationPreset']; label: string }[]}
        />
      </FieldGroup>

      {value.rectificationPreset === 'other' ? (
        <FieldGroup label="تعداد روز (سفارشی)" required>
          <FormTextInput
            value={value.rectificationDaysCustom}
            onChange={(v) => onChange({ ...value, rectificationDaysCustom: normalizeDigits(v) })}
            placeholder="۷ تا ۶۰"
          />
        </FieldGroup>
      ) : null}

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
      </div>
    </div>
  );
}

export function BuyerAreaDiscrepancyPanel({
  value,
  onChange,
  onSubmit,
  saving,
}: {
  value: B['areaDiscrepancy'];
  onChange: (next: B['areaDiscrepancy']) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <ToggleRow
        checked={value.ruleEnabled}
        onChange={(checked) => onChange({ ...value, ruleEnabled: checked })}
        label="فعال‌سازی فسخ به دلیل اختلاف متراژ"
        description="در صورت فعال‌سازی، آستانه اختلاف متراژ و مراجع انتخاب‌شده برای حق فسخ خریدار لحاظ می‌شود."
      />

      <div className={`transition-all duration-200 ${value.ruleEnabled ? 'opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
      <FieldGroup label="حد مجاز اختلاف متراژ نسبت به مرجع">
        <TagPills
          value={value.thresholdPreset}
          onChange={(v) =>
            onChange({
              ...value,
              thresholdPreset: v,
              thresholdPercentCustom: v === 'other' ? value.thresholdPercentCustom : '',
            })
          }
          options={THRESH_OPTS as { value: B['areaDiscrepancy']['thresholdPreset']; label: string }[]}
        />
      </FieldGroup>

      {value.thresholdPreset === 'other' ? (
        <FieldGroup label="درصد سفارشی" required hint="مثال: ۴٫۵">
          <FormTextInput
            value={value.thresholdPercentCustom}
            onChange={(v) => onChange({ ...value, thresholdPercentCustom: normalizeDecimal(v) })}
            placeholder="۰–۱۰۰"
          />
        </FieldGroup>
      ) : null}

      <FieldGroup label="منابع مرجع" hint="برای سنجش متراژ کدام مدارک معتبرند.">
        <MultiTagPills<B['areaDiscrepancy']['referenceSources'][number]>
          values={value.referenceSources}
          onChange={(values) => onChange({ ...value, referenceSources: values })}
          options={REF_OPTS as { value: B['areaDiscrepancy']['referenceSources'][number]; label: string }[]}
        />
      </FieldGroup>

      <ToggleRow
        checked={value.financialSettlementInsteadOfTermination}
        onChange={(checked) => onChange({ ...value, financialSettlementInsteadOfTermination: checked })}
        label="امکان توافق مالی به‌جای فسخ"
        description="در اختلاف متراژ، ابتدا گزینهٔ تسویه مالی در نظر گرفته می‌شود."
      />

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
      </div>
    </div>
  );
}

export function BuyerNotificationPanel({
  value,
  onChange,
  onSubmit,
  saving,
}: {
  value: B['notification'];
  onChange: (next: B['notification']) => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <ToggleRow
        checked={value.ruleEnabled}
        onChange={(checked) => onChange({ ...value, ruleEnabled: checked })}
        label="فعال‌سازی اطلاع‌رسانی فسخ"
        description="در صورت فعال‌سازی، تنظیمات ارسال اعلان‌ها برای مسیر فسخ خریدار اعمال می‌شود."
      />

      <div className={`transition-all duration-200 ${value.ruleEnabled ? 'opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
      <ToggleRow
        checked={value.notifyBuyer}
        onChange={(checked) => onChange({ ...value, notifyBuyer: checked })}
        label="اطلاع‌رسانی به خریدار"
      />
      <ToggleRow
        checked={value.notifyContractManager}
        onChange={(checked) => onChange({ ...value, notifyContractManager: checked })}
        label="اطلاع‌رسانی به مدیر قرارداد"
      />
      <ToggleRow
        checked={value.showManagementOptionInGrid}
        onChange={(checked) => onChange({ ...value, showManagementOptionInGrid: checked })}
        label="نمایش گزینه مدیریت در جدول قراردادها"
        description="مسیر رسیدگی سریع در نمای شبکه‌ای قراردادها نمایش داده می‌شود."
      />

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
      </div>
    </div>
  );
}
