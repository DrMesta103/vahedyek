'use client';

import type { ReactNode } from 'react';
import type { ContractTerminationData } from '../../../../../types/contract';
import type { DomainFieldHint } from '../../../../../lib/contractSettingsHints/domainFieldHints';
import { FieldGroup, FormDateInput, FormTextInput, MultiTagPills, TagPills } from '../ContractFormPrimitives';
import { SettingsFieldAlignmentTag } from '../SettingsFieldAlignmentTag';
import { SubsectionSubmitRow, ToggleRow } from './TerminationPrimitives';

type B = ContractTerminationData['buyerTerms'];

function alignmentTag(hint: DomainFieldHint | undefined): ReactNode {
  if (!hint || hint.status === 'idle') return null;
  return <SettingsFieldAlignmentTag status={hint.status} settingsLabel={hint.settingsLabel} />;
}

const LATE_GRACE: ReadonlyArray<{ value: B['lateDelivery']['gracePreset']; label: string }> = [
  { value: '1', label: '۱ ماه' },
  { value: '3', label: '۳ ماه' },
  { value: '6', label: '۶ ماه' },
  { value: '9', label: '۹ ماه' },
  { value: '12', label: '۱۲ ماه' },
  { value: '18', label: '۱۸ ماه' },
  { value: '24', label: '۲۴ ماه' },
  { value: 'other', label: 'سفارشی' },
];

const THRESH_OPTS: ReadonlyArray<{ value: B['areaDiscrepancy']['thresholdPreset']; label: string }> = [
  { value: '1', label: '۱٪' },
  { value: '2', label: '۲٪' },
  { value: '3', label: '۳٪' },
  { value: '5', label: '۵٪' },
  { value: '10', label: '۱۰٪' },
  { value: 'other', label: 'سفارشی' },
];

const DISCREPANCY_SCOPE_OPTS: ReadonlyArray<{
  value: B['areaDiscrepancy']['discrepancyScopes'][number];
  label: string;
}> = [
  { value: 'deficit-only', label: 'کاهش متراژ (کمتر از متراژ قراردادی)' },
  { value: 'surplus-only', label: 'افزایش متراژ (بیشتر از متراژ قراردادی)' },
];

const SETTLEMENT_PRICING_OPTS: ReadonlyArray<{
  value: B['areaDiscrepancy']['settlementPricingBasis'];
  label: string;
}> = [
  { value: 'contract-price', label: 'بر اساس مبلغ کل قرارداد' },
  { value: 'market-price', label: 'بر اساس قیمت روز بازار' },
  { value: 'official-expert', label: 'بر اساس نظر کارشناس رسمی' },
];

const SETTLEMENT_PRICING_HINTS: Record<B['areaDiscrepancy']['settlementPricingBasis'], string> = {
  'contract-price': 'مبنای تسویه بر اساس مبلغ کل قرارداد محاسبه می‌شود.',
  'market-price': 'مبنای تسویه بر اساس قیمت روز بازار در زمان محاسبه تعیین می‌شود.',
  'official-expert': 'مبنای تسویه بر اساس نظر کارشناس رسمی محاسبه می‌شود.',
};

const SPEC_OPTS: ReadonlyArray<{
  value: B['specificationChanges']['includedTypes'][number];
  label: string;
}> = [
  { value: 'unit-plan', label: 'نقشه واحد' },
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
    label: 'پیشرفت ساخت / تحقق مراحل پروژه',
    tooltip: 'این مورد به تحقق مراحل اجرایی پروژه و پیشرفت فیزیکی آن مربوط است.',
  },
  {
    value: 'quality-standards',
    label: 'کیفیت ساخت / رعایت استانداردهای کیفی',
    tooltip: 'این مورد به کیفیت ساخت و رعایت استانداردهای کیفی مربوط می‌شود.',
  },
  {
    value: 'infrastructure-delivery',
    label: 'تحویل زیرساخت‌ها و تأسیسات (آب، برق، گاز و فاضلاب)',
    tooltip: 'این مورد به تحویل زیرساخت‌ها و تأسیسات پروژه مربوط می‌شود.',
  },
  {
    value: 'legal-docs',
    label: 'اسناد قانونی و مجوزها',
    tooltip: 'این مورد به اسناد قانونی و مجوزهای پروژه مربوط می‌شود.',
  },
  {
    value: 'service-connections',
    label: 'انشعابات و خدمات شهری',
    tooltip: 'این گزینه شامل انشعابات و خدمات شهری مرتبط با پروژه است.',
  },
  {
    value: 'other',
    label: 'سایر موارد نقض تعهدات سازنده',
    tooltip: 'این گزینه برای سایر تخلفات و نقض‌های تعهدات سازنده است.',
  },
];

const REF_OPTS: ReadonlyArray<{
  value: B['areaDiscrepancy']['referenceSources'][number];
  label: string;
}> = [
  { value: 'official-title-deed', label: 'سند رسمی مالکیت' },
  { value: 'partition-statement', label: 'صورت‌جلسه تفکیکی' },
  { value: 'official-expert-report', label: 'گزارش کارشناسی رسمی' },
  { value: 'parties-agreement', label: 'توافق طرفین' },
  { value: 'court-or-arbitration-award', label: 'رأی دادگاه / داوری' },
];

const PROGRESS_MILESTONE_OPTS: ReadonlyArray<{
  value: B['physicalProgressDelay']['milestoneTypes'][number];
  label: string;
  tooltip: string;
}> = [
  { value: 'progress-20', label: '۲۰٪ پیشرفت', tooltip: 'این مرحله زمانی سنجیده می‌شود که پیشرفت پروژه به ۲۰٪ برسد.' },
  { value: 'progress-30', label: '۳۰٪ پیشرفت', tooltip: 'این مرحله زمانی سنجیده می‌شود که پیشرفت پروژه به ۳۰٪ برسد.' },
  { value: 'progress-50', label: '۵۰٪ پیشرفت', tooltip: 'این مرحله زمانی سنجیده می‌شود که پیشرفت پروژه به ۵۰٪ برسد.' },
  { value: 'progress-70', label: '۷۰٪ پیشرفت', tooltip: 'این مرحله زمانی سنجیده می‌شود که پیشرفت پروژه به ۷۰٪ برسد.' },
  { value: 'progress-90', label: '۹۰٪ پیشرفت', tooltip: 'این مرحله زمانی سنجیده می‌شود که پیشرفت پروژه به ۹۰٪ برسد.' },
  { value: 'skeleton-complete', label: 'اتمام اسکلت', tooltip: 'مرحله تکمیل اسکلت و سازه‌ی اصلی پروژه.' },
  { value: 'shell-complete', label: 'اتمام سفت‌کاری', tooltip: 'مرحله تکمیل سفت‌کاری و دیوارچینی و بخش‌های اولیه داخلی.' },
  { value: 'finishing-complete', label: 'اتمام نازک‌کاری', tooltip: 'مرحله تکمیل نازک‌کاری و آماده‌سازی نهایی داخل واحد.' },
  { value: 'mep-complete', label: 'اتمام تأسیسات', tooltip: 'مرحله تکمیل تأسیسات مکانیکی و برقی پروژه.' },
  { value: 'final-delivery', label: 'تحویل نهایی', tooltip: 'مرحله آماده‌سازی برای تحویل نهایی واحد به خریدار.' },
  { value: 'other', label: 'سایر', tooltip: 'هر مرحله دیگری که برای این پروژه تعریف شده است.' },
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
  { value: 'other', label: 'سفارشی' },
];

const PROGRESS_GRACE_OPTS: ReadonlyArray<{ value: B['physicalProgressDelay']['gracePreset']; label: string }> = [
  { value: '15', label: '۱۵ روز' },
  { value: '30', label: '۳۰ روز' },
  { value: '45', label: '۴۵ روز' },
  { value: '60', label: '۶۰ روز' },
  { value: '90', label: '۹۰ روز' },
  { value: 'other', label: 'سفارشی' },
];

const PROGRESS_TRIGGER_OPTS: ReadonlyArray<{ value: B['physicalProgressDelay']['triggerCondition']; label: string }> = [
  { value: 'any-milestone', label: 'هر یک از مراحل منتخب تحقق یابد' },
  { value: 'all-milestones', label: 'همه مراحل منتخب تحقق یابند' },
];

const PROGRESS_SOURCE_OPTS: ReadonlyArray<{ value: B['physicalProgressDelay']['progressCertificationSource']; label: string }> = [
  { value: 'project-supervisor-report', label: 'گزارش ناظر پروژه' },
  { value: 'official-expert-report', label: 'گزارش کارشناس رسمی' },
  { value: 'constructor-reported-progress', label: 'گزارش پیشرفت اعلامی سازنده' },
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
  fieldHints = {},
}: {
  value: B['lateDelivery'];
  onChange: (next: B['lateDelivery']) => void;
  onSubmit: () => void;
  saving: boolean;
  fieldHints?: Partial<Record<string, DomainFieldHint>>;
}) {
  return (
    <div className="space-y-5">
      <FieldGroup
        label="بازه تأخیر مجاز"
        hint="در این بخش بازه‌ای را مشخص می‌کنید که پس از آن، شرط فسخ فعال می‌شود."
        alignmentTag={alignmentTag(fieldHints.calculationBasis)}
      >
        <MultiTagPills<B['lateDelivery']['calculationBasis'][number]>
          values={value.calculationBasis}
          onChange={(values) => onChange({ ...value, calculationBasis: values })}
          options={[
            { value: 'contract-delivery-date', label: 'تاریخ تحویل قرارداد' },
            { value: 'last-addendum', label: 'تاریخ آخرین الحاقیه' },
            { value: 'mutual-adjusted-date', label: 'تاریخ توافقی اصلاح‌شده' },
          ]}
        />
      </FieldGroup>

      <FieldGroup
        label="بازه ارفاقی مجاز پس از سررسید"
        hint="اگر تأخیر از این بازه بیشتر شود، امکان فسخ بررسی می‌شود."
        alignmentTag={alignmentTag(fieldHints.gracePreset)}
      >
        <TagPills
          value={value.gracePreset}
          onChange={(v) => onChange({ ...value, gracePreset: v, graceMonthsCustom: v === 'other' ? value.graceMonthsCustom : '' })}
          options={LATE_GRACE as { value: B['lateDelivery']['gracePreset']; label: string }[]}
        />
      </FieldGroup>

      {value.gracePreset === 'other' ? (
        <FieldGroup label="مدت سفارشی (ماه)" required alignmentTag={alignmentTag(fieldHints.graceMonthsCustom)}>
          <FormTextInput
            value={value.graceMonthsCustom}
            onChange={(v) => onChange({ ...value, graceMonthsCustom: normalizeDigits(v) })}
            placeholder="مثلا: 4"
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
  fieldHints = {},
}: {
  value: B['specificationChanges'];
  onChange: (next: B['specificationChanges']) => void;
  onSubmit: () => void;
  saving: boolean;
  fieldHints?: Partial<Record<string, DomainFieldHint>>;
}) {
  return (
    <div className="space-y-5">
      <FieldGroup
        label="تغییرات مشمول فسخ"
        hint="تغییرات فنی یا شکلی موضوع قرارداد را انتخاب کنید."
        alignmentTag={alignmentTag(fieldHints.includedTypes)}
      >
        <MultiTagPills<B['specificationChanges']['includedTypes'][number]>
          values={value.includedTypes}
          onChange={(values) => onChange({ ...value, includedTypes: values })}
          options={SPEC_OPTS as { value: B['specificationChanges']['includedTypes'][number]; label: string }[]}
        />
      </FieldGroup>

      <ToggleRow
        checked={value.priorApprovalRequired}
        onChange={(checked) => onChange({ ...value, priorApprovalRequired: checked })}
        label="آیا تأیید پیشین خریدار برای این تغییرات لازم است؟"
        description="در صورت فعال بودن، هر تغییر باید با تأیید قبلی خریدار ثبت شود."
        alignmentTag={alignmentTag(fieldHints.priorApprovalRequired)}
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
  fieldHints = {},
}: {
  value: B['breachOfObligations'];
  onChange: (next: B['breachOfObligations']) => void;
  onSubmit: () => void;
  saving: boolean;
  fieldHints?: Partial<Record<string, DomainFieldHint>>;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-[8px] border border-cyan-100 bg-cyan-50/50 px-4 py-3 text-right text-xs leading-6 text-slate-600">
        هر یک از موارد نقض تعهد سازنده را جداگانه فعال کنید تا مسیرهای فسخ برای خریدار مشخص شود. در هر مورد می‌توانید جزئیات تکمیلی را هم تنظیم کنید.
      </div>

      <FieldGroup
        label="گزینش انواع نقض تعهد سازنده"
        hint="مواردی را انتخاب کنید که در صورت وقوع، حق فسخ خریدار را فعال می‌کنند. برای برخی گزینه‌ها، جزئیات تکمیلی هم قابل تنظیم است."
        alignmentTag={alignmentTag(fieldHints.obligationTypes)}
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
  fieldHints = {},
}: {
  value: B['areaDiscrepancy'];
  onChange: (next: B['areaDiscrepancy']) => void;
  onSubmit: () => void;
  saving: boolean;
  fieldHints?: Partial<Record<string, DomainFieldHint>>;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-[8px] border border-cyan-100 bg-cyan-50/50 px-4 py-3 text-right text-xs leading-6 text-slate-600">
        فسخ ناشی از اختلاف متراژ زمانی فعال می‌شود که اختلاف نهایی از آستانه مجاز بیشتر باشد. در این بخش می‌توانید مبنای محاسبه و سازوکار تسویه را مشخص کنید.
      </div>

      <FieldGroup
        label="آستانه اختلاف متراژ برای فعال شدن فسخ"
        hint="اگر اختلاف نهایی کمتر از این مقدار باشد، فسخ فعال نمی‌شود."
        alignmentTag={alignmentTag(fieldHints.thresholdPreset)}
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
        <FieldGroup
          label="آستانه سفارشی"
          required
          hint="اگر مقدار موردنظر شما در گزینه‌ها نیست، مقدار دلخواه را وارد کنید."
          alignmentTag={alignmentTag(fieldHints.thresholdPercentCustom)}
        >
          <FormTextInput
            value={value.thresholdPercentCustom}
            onChange={(v) => onChange({ ...value, thresholdPercentCustom: normalizeDecimal(v) })}
            placeholder="مثلا: ۴٪"
          />
        </FieldGroup>
      ) : null}

      <FieldGroup
        label="دامنه اختلاف مجاز"
        hint="مشخص می‌کند اختلاف باید کسری باشد، مازاد باشد یا هر دو حالت."
        alignmentTag={alignmentTag(fieldHints.discrepancyScopes)}
      >
        <MultiTagPills<B['areaDiscrepancy']['discrepancyScopes'][number]>
          values={value.discrepancyScopes}
          onChange={(values) => onChange({ ...value, discrepancyScopes: values })}
          options={DISCREPANCY_SCOPE_OPTS as { value: B['areaDiscrepancy']['discrepancyScopes'][number]; label: string }[]}
        />
      </FieldGroup>

      <FieldGroup
        label="مبنای ارزش‌گذاری برای تسویه"
        hint="وقتی فسخ به‌جای تسویه مالی انجام می‌شود، این مبنا برای محاسبه استفاده می‌شود."
        alignmentTag={alignmentTag(fieldHints.referenceSources)}
      >
        <MultiTagPills<B['areaDiscrepancy']['referenceSources'][number]>
          values={value.referenceSources}
          onChange={(values) => onChange({ ...value, referenceSources: values })}
          options={REF_OPTS as { value: B['areaDiscrepancy']['referenceSources'][number]; label: string }[]}
        />
      </FieldGroup>

      <ToggleRow
        checked={value.financialSettlementInsteadOfTermination}
        onChange={(checked) => onChange({ ...value, financialSettlementInsteadOfTermination: checked })}
        label="تسویه مالی به‌جای فسخ اعمال شود"
        description="در صورت فعال بودن، اختلاف به‌صورت مالی تسویه می‌شود و فسخ مستقیم پیشنهاد نمی‌شود."
        alignmentTag={alignmentTag(fieldHints.financialSettlementInsteadOfTermination)}
      />

      {value.financialSettlementInsteadOfTermination ? (
        <FieldGroup label="روش محاسبه تسویه" alignmentTag={alignmentTag(fieldHints.settlementPricingBasis)}>
          <p className="mb-2 text-right text-xs leading-6 text-slate-500">
            مبنای محاسبه را از گزینه‌های زیر انتخاب کنید.
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
  fieldHints = {},
}: {
  value: B['physicalProgressDelay'];
  onChange: (next: B['physicalProgressDelay']) => void;
  onSubmit: () => void;
  saving: boolean;
  showSubmit?: boolean;
  fieldHints?: Partial<Record<string, DomainFieldHint>>;
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
      <div className="rounded-[8px] border border-cyan-100 bg-cyan-50/50 px-4 py-3 text-right text-xs leading-6 text-slate-600">
        این بخش زمانی فعال می‌شود که تأخیر در تحقق مراحل پیشرفت پروژه از حد مجاز بیشتر باشد. برای هر مرحله می‌توانید زمان هدف، مهلت ارفاقی و مرجع سنجش را تعیین کنید.
      </div>

      <FieldGroup
        label="مراحل پیشرفت مشمول فسخ"
        hint="مرحله‌هایی را انتخاب کنید که باید برای هرکدام زمان هدف و مهلت ارفاقی تنظیم شود."
        alignmentTag={alignmentTag(fieldHints.milestoneTypes)}
      >
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
              <div key={milestone} className="rounded-[8px] border border-slate-200 bg-white/80 p-4 text-right">
                <div className="mb-4 flex flex-col gap-1">
                  <p className="text-sm font-black text-slate-800">{PROGRESS_MILESTONE_LABELS[milestone]}</p>
                  <p className="text-xs leading-6 text-slate-500">
                    برای این مرحله، زمان هدف و مهلت ارفاقی را مشخص کنید تا معیار فعال شدن فسخ روشن باشد.
                  </p>
                </div>

                <div className="space-y-4">
                  <FieldGroup label="زمان هدف این مرحله" required>
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
                    <FieldGroup label="تاریخ مشخص" required>
                      <FormDateInput
                        value={setting.timelineSpecificDate}
                        onChange={(v) => updateMilestoneSetting(milestone, { timelineSpecificDate: v })}
                        placeholder="انتخاب تاریخ"
                      />
                    </FieldGroup>
                  ) : null}

                  {setting.timelinePreset === 'other' ? (
                    <FieldGroup label="مدت سفارشی" required>
                      <FormTextInput
                        value={setting.timelineMonthsCustom}
                        onChange={(v) => updateMilestoneSetting(milestone, { timelineMonthsCustom: normalizeDigits(v) })}
                        placeholder="مثلا: 4"
                        inputMode="numeric"
                      />
                    </FieldGroup>
                  ) : null}

                  <FieldGroup label="مهلت ارفاقی پس از سررسید" required>
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
                    <FieldGroup label="مهلت سفارشی" required>
                      <FormTextInput
                        value={setting.graceDaysCustom}
                        onChange={(v) => updateMilestoneSetting(milestone, { graceDaysCustom: normalizeDigits(v) })}
                        placeholder="مثلا: 30"
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
        <div className="rounded-[8px] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-right text-xs leading-6 text-slate-500">
          هنوز هیچ مرحله‌ای برای پیشرفت انتخاب نشده است.
        </div>
      )}

      <FieldGroup
        label="شرط تحقق مرحله برای فعال شدن فسخ"
        hint="اگر یکی از مراحل منتخب از حد مجاز عبور کند، می‌تواند مبنای فسخ قرار گیرد."
      >
        <TagPills
          value={value.triggerCondition}
          onChange={(v) => onChange({ ...value, triggerCondition: v })}
          options={PROGRESS_TRIGGER_OPTS as { value: B['physicalProgressDelay']['triggerCondition']; label: string }[]}
        />
      </FieldGroup>

      <FieldGroup label="مرجع سنجش پیشرفت" hint="گزارشی را انتخاب کنید که پیشرفت بر اساس آن سنجیده می‌شود.">
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
        label="نمایش گزینه مدیریتی در جدول"
        description="در صورت فعال بودن، این گزینه در جدول‌های مدیریتی نیز نمایش داده می‌شود."
      />

      <SubsectionSubmitRow onSave={onSubmit} saving={saving} />
    </div>
  );
}

