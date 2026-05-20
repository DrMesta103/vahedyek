'use client';

import type { ContractTerminationData } from '../../../../../types/contract';
import { FieldGroup, FormDateInput, FormTextInput, MultiTagPills, TagPills } from '../ContractFormPrimitives';
import { SubsectionSubmitRow, ToggleRow } from './TerminationPrimitives';

type B = ContractTerminationData['buyerTerms'];

const LATE_GRACE: ReadonlyArray<{ value: B['lateDelivery']['gracePreset']; label: string }> = [
  { value: '1', label: '۱ ماه' },
  { value: '3', label: '۳ ماه' },
  { value: '6', label: '۶ ماه' },
  { value: '9', label: '۹ ماه' },
  { value: '12', label: '۱۲ ماه' },
  { value: '18', label: '۱۸ ماه' },
  { value: '24', label: '۲۴ ماه' },
  { value: 'other', label: 'سایر' },
];

const THRESH_OPTS: ReadonlyArray<{ value: B['areaDiscrepancy']['thresholdPreset']; label: string }> = [
  { value: '1', label: '۱٪' },
  { value: '2', label: '۲٪' },
  { value: '3', label: '۳٪' },
  { value: '5', label: '۵٪' },
  { value: '10', label: '۱۰٪' },
  { value: 'other', label: 'سایر' },
];

const DISCREPANCY_SCOPE_OPTS: ReadonlyArray<{
  value: B['areaDiscrepancy']['discrepancyScopes'][number];
  label: string;
}> = [
  { value: 'deficit-only', label: 'کسری متراژ (کمتر از مقدار قراردادی)' },
  { value: 'surplus-only', label: 'اضافه متراژ (بیشتر از مقدار قراردادی)' },
];

const SETTLEMENT_PRICING_OPTS: ReadonlyArray<{
  value: B['areaDiscrepancy']['settlementPricingBasis'];
  label: string;
}> = [
  { value: 'contract-price', label: 'بر مبنای قیمت هر متر در قرارداد' },
  { value: 'market-price', label: 'بر مبنای ارزش روز هر متر' },
  { value: 'official-expert', label: 'بر مبنای نظر کارشناس رسمی' },
];

const SETTLEMENT_PRICING_HINTS: Record<B['areaDiscrepancy']['settlementPricingBasis'], string> = {
  'contract-price': 'تسویه اختلاف متراژ بر اساس قیمت هر مترِ مندرج در قرارداد اولیه محاسبه می‌شود.',
  'market-price': 'تسویه اختلاف متراژ بر اساس ارزش روز هر متر در زمان حل‌وفصل محاسبه می‌شود.',
  'official-expert': 'تسویه اختلاف متراژ بر اساس نظر کارشناسی رسمی یا مرجع رسیدگی تعیین می‌شود.',
};

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
  tooltip: string;
}> = [
  {
    value: 'construction-progress',
    label: 'پیشرفت ساخت / عدم پیشرفت متناسب پروژه',
    tooltip: 'نقض تعهد مرتبط با پیشرفت ساخت، توقف غیرمتناسب یا عقب‌ماندگی محسوس پروژه.',
  },
  {
    value: 'quality-standards',
    label: 'کیفیت اجرا / عدم رعایت مشخصات فنی',
    tooltip: 'نقض تعهد مرتبط با کیفیت اجرا، مصالح یا عدم رعایت مشخصات فنی مصوب.',
  },
  {
    value: 'infrastructure-delivery',
    label: 'تحویل زیرساخت‌ها و خدمات (زیرساخت و خدمات زیربنایی)',
    tooltip: 'نقض تعهد مرتبط با تحویل زیرساخت‌ها، انشعابات و خدمات زیربنایی مورد نیاز بهره‌برداری.',
  },
  {
    value: 'legal-docs',
    label: 'تعهدات حقوقی و اسنادی',
    tooltip: 'نقض تعهد مرتبط با اسناد، مجوزها، مدارک حقوقی یا هر سند لازم در قرارداد.',
  },
  {
    value: 'service-connections',
    label: 'تغییرات غیرمجاز در مشخصات پروژه',
    tooltip: 'هرگونه تغییر بدون مجوز در مشخصات، نقشه، کاربری یا اجزای اصلی پروژه.',
  },
  {
    value: 'other',
    label: 'عدم انجام سایر تعهدات قراردادی',
    tooltip: 'سایر تعهدات قراردادی سازنده که به‌طور صریح در متن قرارداد تعریف شده‌اند.',
  },
];

const REF_OPTS: ReadonlyArray<{
  value: B['areaDiscrepancy']['referenceSources'][number];
  label: string;
}> = [
  { value: 'official-title-deed', label: 'سند مالکیت رسمی' },
  { value: 'partition-statement', label: 'صورت‌مجلس تفکیکی' },
  { value: 'official-expert-report', label: 'گزارش کارشناس رسمی' },
  { value: 'parties-agreement', label: 'توافق طرفین' },
  { value: 'court-or-arbitration-award', label: 'رأی مرجع قضایی / داوری' },
];

const PROGRESS_MILESTONE_OPTS: ReadonlyArray<{
  value: B['physicalProgressDelay']['milestoneTypes'][number];
  label: string;
  tooltip: string;
}> = [
  {
    value: 'progress-20',
    label: '۲۰٪ پیشرفت پروژه',
    tooltip: 'رسیدن پروژه به حدود یک‌پنجم پیشرفت فیزیکی برای سنجش تأخیر سازنده.',
  },
  {
    value: 'progress-30',
    label: '۳۰٪ پیشرفت پروژه',
    tooltip: 'رسیدن پروژه به حدود یک‌سوم پیشرفت فیزیکی برای کنترل زمان‌بندی قرارداد.',
  },
  {
    value: 'progress-50',
    label: '۵۰٪ پیشرفت پروژه',
    tooltip: 'رسیدن پروژه به نیمه مسیر اجرا و ارزیابی تحقق به‌موقع مرحله میانی.',
  },
  {
    value: 'progress-70',
    label: '۷۰٪ پیشرفت پروژه',
    tooltip: 'رسیدن پروژه به مرحله پایانی عملیات اصلی و کنترل تأخیر در پیشرفت.',
  },
  {
    value: 'progress-90',
    label: '۹۰٪ پیشرفت پروژه',
    tooltip: 'رسیدن پروژه به آستانه تکمیل نهایی پیش از تحویل و بهره‌برداری.',
  },
  {
    value: 'skeleton-complete',
    label: 'اتمام اسکلت',
    tooltip: 'پایان اجرای اسکلت اصلی ساختمان و رسیدن به مرحله سازه‌ای کامل.',
  },
  {
    value: 'shell-complete',
    label: 'اتمام سفت‌کاری',
    tooltip: 'پایان سفت‌کاری و آماده شدن اجزای اصلی برای ورود به مراحل نهایی.',
  },
  {
    value: 'finishing-complete',
    label: 'اتمام نازک‌کاری',
    tooltip: 'پایان نازک‌کاری و تکمیل عملیات ظاهری و داخلی واحدها.',
  },
  {
    value: 'mep-complete',
    label: 'اتمام تأسیسات',
    tooltip: 'تکمیل تأسیسات مکانیکی، برقی و زیرساخت‌های بهره‌برداری.',
  },
  {
    value: 'final-delivery',
    label: 'تحویل نهایی',
    tooltip: 'مرحله تحویل نهایی واحد پس از تکمیل همه اجزای پروژه.',
  },
  {
    value: 'other',
    label: 'سایر',
    tooltip: 'تعریف هر مرحله پیشرفت دیگری که در این فهرست نیامده است.',
  },
];

const PROGRESS_TIMELINE_OPTS: ReadonlyArray<{ value: B['physicalProgressDelay']['timelinePreset']; label: string }> = [
  { value: '1', label: '۱ ماه' },
  { value: '3', label: '۳ ماه' },
  { value: '6', label: '۶ ماه' },
  { value: '9', label: '۹ ماه' },
  { value: '12', label: '۱۲ ماه' },
  { value: '18', label: '۱۸ ماه' },
  { value: '24', label: '۲۴ ماه' },
  { value: 'specific-date', label: 'تاریخ مشخص' },
  { value: 'other', label: 'سایر' },
];

const PROGRESS_GRACE_OPTS: ReadonlyArray<{ value: B['physicalProgressDelay']['gracePreset']; label: string }> = [
  { value: '15', label: '۱۵ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: '45', label: '۴۵ روز' },
  { value: '60', label: '۶۰ روز' },
  { value: '90', label: '۹۰ روز' },
  { value: 'other', label: 'سایر' },
];

const PROGRESS_TRIGGER_OPTS: ReadonlyArray<{ value: B['physicalProgressDelay']['triggerCondition']; label: string }> = [
  { value: 'any-milestone', label: 'اگر هر مرحله انتخاب‌شده محقق نشود' },
  { value: 'all-milestones', label: 'اگر همه مراحل انتخاب‌شده محقق نشوند' },
];

const PROGRESS_SOURCE_OPTS: ReadonlyArray<{ value: B['physicalProgressDelay']['progressCertificationSource']; label: string }> = [
  { value: 'project-supervisor-report', label: 'گزارش ناظر پروژه' },
  { value: 'official-expert-report', label: 'گزارش کارشناس رسمی' },
  { value: 'constructor-reported-progress', label: 'گزارش ثبت‌شده توسط سازنده' },
  { value: 'contract-manager-approval', label: 'تأیید مدیر قرارداد' },
  { value: 'parties-agreement', label: 'توافق طرفین' },
];

type PhysicalProgressMilestone = B['physicalProgressDelay']['milestoneTypes'][number];
type PhysicalProgressMilestoneSetting = NonNullable<B['physicalProgressDelay']['milestoneSettings'][PhysicalProgressMilestone]>;

const PROGRESS_MILESTONE_LABELS = Object.fromEntries(PROGRESS_MILESTONE_OPTS.map((option) => [option.value, option.label])) as Record<
  PhysicalProgressMilestone,
  string
>;

function defaultMilestoneSetting(value: B['physicalProgressDelay']): PhysicalProgressMilestoneSetting {
  return {
    timelinePreset: value.timelinePreset,
    timelineMonthsCustom: value.timelineMonthsCustom,
    timelineSpecificDate: value.timelineSpecificDate,
    gracePreset: value.gracePreset,
    graceDaysCustom: value.graceDaysCustom,
  };
}

function ensureMilestoneSettings(
  current: B['physicalProgressDelay'],
  milestoneTypes: PhysicalProgressMilestone[],
): B['physicalProgressDelay']['milestoneSettings'] {
  const defaults = defaultMilestoneSetting(current);
  return Object.fromEntries(
    milestoneTypes.map((milestone) => [milestone, { ...defaults, ...current.milestoneSettings[milestone] }]),
  ) as B['physicalProgressDelay']['milestoneSettings'];
}

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
      <FieldGroup
        label="مبنای محاسبه تأخیر"
        hint="می‌توانید هر سه مبنا را هم‌زمان فعال کنید؛ مبنای فعالِ هر قرارداد از میان این سه گزینه تعیین می‌شود."
      >
        <MultiTagPills<B['lateDelivery']['calculationBasis'][number]>
          values={value.calculationBasis}
          onChange={(values) => onChange({ ...value, calculationBasis: values })}
          options={[
            { value: 'contract-delivery-date', label: 'تاریخ تحویل مندرج در قرارداد' },
            { value: 'last-addendum', label: 'تاریخ تحویل آخرین الحاقیه' },
            { value: 'mutual-adjusted-date', label: 'تاریخ اصلاح‌شده توافقی' },
          ]}
        />
      </FieldGroup>

      <FieldGroup label="حد آستانه تأخیر مجاز قبل از ایجاد حق فسخ" hint="اگر تأخیر سازنده از این بازه عبور کند، حق فسخ خریدار فعال می‌شود.">
        <TagPills
          value={value.gracePreset}
          onChange={(v) => onChange({ ...value, gracePreset: v, graceMonthsCustom: v === 'other' ? value.graceMonthsCustom : '' })}
          options={LATE_GRACE as { value: B['lateDelivery']['gracePreset']; label: string }[]}
        />
      </FieldGroup>

      {value.gracePreset === 'other' ? (
        <FieldGroup label="تعداد ماه (سفارشی)" required>
          <FormTextInput
            value={value.graceMonthsCustom}
            onChange={(v) => onChange({ ...value, graceMonthsCustom: normalizeDigits(v) })}
            placeholder="مثال: ۴"
          />
        </FieldGroup>
      ) : null}

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
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
      <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 px-4 py-3 text-right text-xs leading-6 text-slate-600">
        این بخش فقط مشخص می‌کند کدام نوع نقض تعهد سازنده، حق فسخ خریدار را فعال می‌کند. در این صفحه هیچ مهلت اصلاح، اخطار یا فرآیند اجرایی تعریف نمی‌شود.
      </div>

        <FieldGroup
          label="نوع نقض تعهد مشمول فسخ"
          hint="انتخاب هر مورد مشخص می‌کند در صورت وقوع همان نقض، حق فسخ خریدار فعال می‌شود. این بخش فقط تعیین‌کننده نوع نقض است و مهلت اصلاح یا فرآیند اخطار در آن تعریف نمی‌شود."
        >
        <MultiTagPills<B['breachOfObligations']['obligationTypes'][number]>
          values={value.obligationTypes}
          onChange={(values) => onChange({ ...value, obligationTypes: values })}
          options={BREACH_OPTS as { value: B['breachOfObligations']['obligationTypes'][number]; label: string; tooltip?: string }[]}
        />
      </FieldGroup>

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
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
      <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 px-4 py-3 text-right text-xs leading-6 text-slate-600">
        اگر متراژ نهایی واحد بر اساس مرجع معتبر از متراژ قراردادی بیشتر یا کمتر از حد توافق‌شده باشد، شرط فعال‌سازی حق فسخ خریدار برقرار می‌شود.
      </div>

      <FieldGroup
        label="حد مجاز اختلاف متراژ نهایی نسبت به متراژ قراردادی"
        hint="اگر اختلاف متراژ نهایی از این درصد بیشتر شود، حق فسخ خریدار فعال می‌شود."
      >
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
        <FieldGroup label="درصد سفارشی" required hint="حد مجاز توافق‌شده را به درصد وارد کنید؛ مثال: ۴٫۵">
          <FormTextInput
            value={value.thresholdPercentCustom}
            onChange={(v) => onChange({ ...value, thresholdPercentCustom: normalizeDecimal(v) })}
            placeholder="۰ تا ۱۰۰"
          />
        </FieldGroup>
      ) : null}

      <FieldGroup
        label="جهت اختلاف متراژِ فعال‌کننده حق فسخ"
        hint="مشخص کنید پس از عبور اختلاف متراژ نهایی از حد مجاز توافق‌شده، حق فسخ خریدار در کدام جهت اختلاف فعال شود. انتخاب هم‌زمان هر دو جهت مجاز است."
      >
        <MultiTagPills<B['areaDiscrepancy']['discrepancyScopes'][number]>
          values={value.discrepancyScopes}
          onChange={(values) => onChange({ ...value, discrepancyScopes: values })}
          options={DISCREPANCY_SCOPE_OPTS as { value: B['areaDiscrepancy']['discrepancyScopes'][number]; label: string }[]}
        />
      </FieldGroup>

      <FieldGroup label="مرجع تعیین متراژ نهایی" hint="برای سنجش متراژ نهایی کدام سند یا مرجع معتبر است.">
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
        description="اگر اختلاف از حد مجاز عبور کند، سیستم به‌جای اجرای مستقیم فسخ می‌تواند مسیر تسویه مالی را پیشنهاد دهد."
      />

      {value.financialSettlementInsteadOfTermination ? (
        <FieldGroup label="مبنای قیمت‌گذاری اختلاف متراژ">
          <p className="mb-2 text-right text-xs leading-6 text-slate-500">
            مبنای کلی تسویه مالی اختلاف متراژ را انتخاب کنید.
          </p>
          <TagPills
            value={value.settlementPricingBasis}
            onChange={(v) => onChange({ ...value, settlementPricingBasis: v })}
            options={SETTLEMENT_PRICING_OPTS as { value: B['areaDiscrepancy']['settlementPricingBasis']; label: string }[]}
          />
          <p className="mt-2 text-right text-xs leading-6 text-slate-500">
            {SETTLEMENT_PRICING_HINTS[value.settlementPricingBasis]}
          </p>
        </FieldGroup>
      ) : null}

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
    </div>
  );
}

export function BuyerPhysicalProgressDelayPanel({
  value,
  onChange,
  onSubmit,
  saving,
  showSubmit = true,
}: {
  value: B['physicalProgressDelay'];
  onChange: (next: B['physicalProgressDelay']) => void;
  onSubmit: () => void;
  saving: boolean;
  showSubmit?: boolean;
}) {
  const updateMilestoneSetting = (milestone: PhysicalProgressMilestone, patch: Partial<PhysicalProgressMilestoneSetting>) => {
    const currentSetting = value.milestoneSettings[milestone] ?? defaultMilestoneSetting(value);
    onChange({
      ...value,
      milestoneSettings: {
        ...value.milestoneSettings,
        [milestone]: { ...currentSetting, ...patch },
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 px-4 py-3 text-right text-xs leading-6 text-slate-600">
        این اختیار فقط برای قراردادهایی اعمال می‌شود که پرداخت اقساط آن‌ها بر مبنای پیشرفت فیزیکی پروژه تعریف شده باشد. هر مرحله، دو بعد دارد: زمان هدف برای سنجش تأخیر و مهلت مجاز پس از آن. اگر مرحله منتخب تا پایان بازه تعیین‌شده محقق نشود، حق فسخ برای خریدار فعال می‌شود.
      </div>

      <FieldGroup label="مراحل پیشرفت مشمول کنترل تأخیر" hint="مراحلی را انتخاب کنید که عدم تحقق به‌موقع آن‌ها می‌تواند حق فسخ خریدار را فعال کند.">
        <MultiTagPills<B['physicalProgressDelay']['milestoneTypes'][number]>
          values={value.milestoneTypes}
          onChange={(values) =>
            onChange({
              ...value,
              milestoneTypes: values,
              milestoneSettings: ensureMilestoneSettings(value, values),
            })
          }
          options={PROGRESS_MILESTONE_OPTS as {
            value: B['physicalProgressDelay']['milestoneTypes'][number];
            label: string;
            tooltip: string;
          }[]}
        />
      </FieldGroup>

      {value.milestoneTypes.length ? (
        <div className="space-y-4">
          {value.milestoneTypes.map((milestone) => {
            const setting = value.milestoneSettings[milestone] ?? defaultMilestoneSetting(value);
            return (
              <div key={milestone} className="rounded-xl border border-slate-200 bg-white/80 p-4 text-right">
                <div className="mb-4 flex flex-col gap-1">
                  <p className="text-sm font-black text-slate-800">{PROGRESS_MILESTONE_LABELS[milestone]}</p>
                  <p className="text-xs leading-6 text-slate-500">
                    برای این مرحله، هم بازه زمانی مورد انتظار تحقق و هم مهلت مجاز تأخیر را مشخص کنید؛ بدون این دو مقدار، شرط فسخ معتبر نیست.
                  </p>
                </div>

                <div className="space-y-4">
                  <FieldGroup label="بازه زمانی مورد انتظار تحقق این مرحله" required>
                    <TagPills
                      value={setting.timelinePreset}
                      onChange={(v) =>
                        updateMilestoneSetting(milestone, {
                          timelinePreset: v,
                          timelineMonthsCustom: v === 'other' ? setting.timelineMonthsCustom : '',
                          timelineSpecificDate: v === 'specific-date' ? setting.timelineSpecificDate : '',
                        })
                      }
                      options={PROGRESS_TIMELINE_OPTS as { value: B['physicalProgressDelay']['timelinePreset']; label: string }[]}
                    />
                  </FieldGroup>

                  {setting.timelinePreset === 'specific-date' ? (
                    <FieldGroup label="تاریخ هدف تحقق" required>
                      <FormDateInput
                        value={setting.timelineSpecificDate}
                        onChange={(v) => updateMilestoneSetting(milestone, { timelineSpecificDate: v })}
                        placeholder="انتخاب تاریخ هدف"
                      />
                    </FieldGroup>
                  ) : null}

                  {setting.timelinePreset === 'other' ? (
                    <FieldGroup label="مدت سفارشی بر حسب ماه" required>
                      <FormTextInput
                        value={setting.timelineMonthsCustom}
                        onChange={(v) => updateMilestoneSetting(milestone, { timelineMonthsCustom: normalizeDigits(v) })}
                        placeholder="مثال: ۸"
                        inputMode="numeric"
                      />
                    </FieldGroup>
                  ) : null}

                  <FieldGroup label="مهلت مجاز تأخیر پس از زمان هدف" required>
                    <TagPills
                      value={setting.gracePreset}
                      onChange={(v) =>
                        updateMilestoneSetting(milestone, {
                          gracePreset: v,
                          graceDaysCustom: v === 'other' ? setting.graceDaysCustom : '',
                        })
                      }
                      options={PROGRESS_GRACE_OPTS as { value: B['physicalProgressDelay']['gracePreset']; label: string }[]}
                    />
                  </FieldGroup>

                  {setting.gracePreset === 'other' ? (
                    <FieldGroup label="تعداد روز سفارشی" required>
                      <FormTextInput
                        value={setting.graceDaysCustom}
                        onChange={(v) => updateMilestoneSetting(milestone, { graceDaysCustom: normalizeDigits(v) })}
                        placeholder="مثال: ۷۵"
                        inputMode="numeric"
                      />
                    </FieldGroup>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-right text-xs leading-6 text-slate-500">
          برای فعال شدن این اختیار، حداقل یک مرحله پیشرفت را انتخاب کنید.
        </div>
      )}

      <FieldGroup label="شرط فعال شدن حق فسخ خریدار" hint="مشخص می‌کند اگر یک مرحله به‌تنهایی تأخیر داشته باشد کافی است یا فقط تأخیر هم‌زمان همه مراحل منتخب حق فسخ ایجاد می‌کند.">
        <TagPills
          value={value.triggerCondition}
          onChange={(v) => onChange({ ...value, triggerCondition: v })}
          options={PROGRESS_TRIGGER_OPTS as { value: B['physicalProgressDelay']['triggerCondition']; label: string }[]}
        />
      </FieldGroup>

      <FieldGroup label="مرجع تأیید پیشرفت پروژه" hint="سیستم تحقق یا عدم تحقق مراحل پیشرفت را بر اساس این مرجع معتبر تشخیص می‌دهد.">
        <TagPills
          value={value.progressCertificationSource}
          onChange={(v) => onChange({ ...value, progressCertificationSource: v })}
          options={PROGRESS_SOURCE_OPTS as { value: B['physicalProgressDelay']['progressCertificationSource']; label: string }[]}
        />
      </FieldGroup>

      {showSubmit ? <SubsectionSubmitRow onSave={onSubmit} saving={saving} /> : null}
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
  );
}

