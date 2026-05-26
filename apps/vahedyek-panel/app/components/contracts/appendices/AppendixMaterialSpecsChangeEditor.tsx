'use client';

import {
  BusinessSwitch,
  FieldGroup,
  MultiTagPills,
  SectionCard,
  SectionHeader,
  TagPills,
} from '../../../(panel)/contracts/new/_components/ContractFormPrimitives';
import {
  MATERIAL_SPECS_CHANGE_COMPARISON_REFERENCES,
  MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS,
  MATERIAL_SPECS_CHANGE_OUTCOMES,
  MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENTS,
  MATERIAL_SPECS_CHANGE_TYPES,
} from '../../../lib/materialSpecsChangeRule';
import type { AppendixMaterialSpecsChangePayload } from '../../../types/contract';

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint?: string;
}) {
  return (
    <FieldGroup label={label} hint={hint}>
      <textarea
        dir="rtl"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-[image:var(--control-bg-gradient)] px-4 py-3 text-right text-[13px] leading-7 text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
      />
    </FieldGroup>
  );
}

export function AppendixMaterialSpecsChangeEditor({
  value,
  onChange,
}: {
  value: AppendixMaterialSpecsChangePayload;
  onChange: (value: AppendixMaterialSpecsChangePayload) => void;
}) {
  const importanceOptions = MATERIAL_SPECS_CHANGE_IMPORTANCE_LEVELS.map((item) => ({ value: item.value, label: item.label }));

  const patch = (next: Partial<AppendixMaterialSpecsChangePayload>) => onChange({ ...value, ...next });

  return (
    <div className="mt-6 space-y-5">
      <SectionCard>
        <SectionHeader
          label="پرونده تغییر"
          description="این بخش پرونده اجرایی تغییر مصالح و مشخصات را ثبت می‌کند تا نتیجه قراردادی، جبران یا حق فسخ از روی آن فعال شود."
        />
        <div className="grid gap-5 px-5 py-5">
          <FieldGroup label="نوع تغییرات مشمول" hint="مشخص می‌کند این پرونده دقیقاً کدام نوع تغییر را پوشش می‌دهد.">
            <MultiTagPills
              options={MATERIAL_SPECS_CHANGE_TYPES.map((item) => ({ value: item, label: item }))}
              values={value.changeTypes}
              onChange={(changeTypes) => patch({ changeTypes })}
            />
          </FieldGroup>

          <FieldGroup label="سطح اهمیت تغییر" hint="سطح اهمیت روی نوع رسیدگی و دامنه اقدام قراردادی اثر می‌گذارد.">
            <TagPills
              options={importanceOptions}
              value={value.importanceLevel}
              onChange={(importanceLevel) => patch({ importanceLevel })}
            />
          </FieldGroup>

          <FieldGroup label="مرجع مقایسه" hint="پرونده بر اساس این مراجع با قرارداد یا مستندات فنی تطبیق داده می‌شود.">
            <MultiTagPills
              options={MATERIAL_SPECS_CHANGE_COMPARISON_REFERENCES.map((item) => ({ value: item, label: item }))}
              values={value.comparisonReferences}
              onChange={(comparisonReferences) => patch({ comparisonReferences })}
            />
          </FieldGroup>

          <TextAreaField
            label="شرح تغییر یا اختلاف"
            value={value.caseSummary}
            onChange={(caseSummary) => patch({ caseSummary })}
            placeholder="شرح کنید چه تغییری اتفاق افتاده، از چه تاریخی مشاهده شده و اختلاف نسبت به چه چیزی است."
            hint="این متن مبنای مرور پرونده و تصمیم‌گیری بعدی در اپ خواهد بود."
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          label="بررسی تخلف"
          description="اینجا مشخص می‌شود آیا تغییر انجام‌شده مجاز بوده، تأیید خریدار داشته و آیا باید اقدام قراردادی فعال شود یا نه."
        />
        <div className="grid gap-5 px-5 py-5">
          <FieldGroup
            label="جایگزینی هم‌ارزش یا بهتر مجاز باشد"
            hint="اگر در قواعد کسب‌وکار این حالت مجاز است، اینجا هم وضعیت واقعی پرونده را ثبت کنید."
          >
            <BusinessSwitch
              checked={value.equivalentReplacementAllowed}
              onChange={(equivalentReplacementAllowed) => patch({ equivalentReplacementAllowed })}
            />
          </FieldGroup>

          <FieldGroup
            label="در این پرونده جایگزینی هم‌ارزش یا بهتر اعمال شده است"
            hint="برای تشخیص این‌که آیا پرونده به سمت تخلف می‌رود یا در حد ثبت تغییر باقی می‌ماند."
          >
            <BusinessSwitch
              checked={value.equivalentReplacementApplied}
              onChange={(equivalentReplacementApplied) => patch({ equivalentReplacementApplied })}
            />
          </FieldGroup>

          <FieldGroup
            label="تأیید خریدار برای تغییرات مهم الزامی است"
            hint="اگر این قاعده فعال باشد، نبود تأیید خریدار می‌تواند مبنای اقدام قراردادی شود."
          >
            <BusinessSwitch
              checked={value.buyerApprovalRequired}
              onChange={(buyerApprovalRequired) => patch({ buyerApprovalRequired })}
            />
          </FieldGroup>

          <FieldGroup
            label="برای این پرونده تأیید خریدار اخذ شده است"
            hint="این وضعیت در جمع‌بندی نهایی و امکان فعال‌سازی جبران اثر مستقیم دارد."
          >
            <BusinessSwitch checked={value.buyerApproved} onChange={(buyerApproved) => patch({ buyerApproved })} />
          </FieldGroup>

          <FieldGroup label="نتیجه قابل اعمال در صورت تخلف" hint="این‌ها همان خروجی‌هایی هستند که سیستم برای این پرونده مجاز می‌بیند.">
            <MultiTagPills
              options={MATERIAL_SPECS_CHANGE_OUTCOMES.map((item) => ({ value: item, label: item }))}
              values={value.selectedOutcomes}
              onChange={(selectedOutcomes) => patch({ selectedOutcomes })}
            />
          </FieldGroup>

          <FieldGroup
            label="اقدام قراردادی برای این پرونده فعال شود"
            hint="با فعال‌کردن این گزینه، این پرونده از حالت صرفاً ثبت اختلاف خارج می‌شود و مبنای جبران، اصلاح یا ارجاع قرار می‌گیرد."
          >
            <BusinessSwitch checked={value.enforcementEnabled} onChange={(enforcementEnabled) => patch({ enforcementEnabled })} />
          </FieldGroup>

          {value.enforcementEnabled ? (
            <TextAreaField
              label="مبنای فعال‌سازی اقدام قراردادی"
              value={value.enforcementReason}
              onChange={(enforcementReason) => patch({ enforcementReason })}
              placeholder="توضیح دهید بر چه اساسی این پرونده باید به جبران، اصلاح، ارجاع به کارشناس یا حق فسخ منتهی شود."
            />
          ) : null}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          label="مستندات و یادداشت"
          description="در این بخش مدارک لازم برای رسیدگی و یادداشت داخلی پرونده ثبت می‌شود. بارگذاری فایل همچنان از مسیر پیوست و اسناد قرارداد انجام می‌شود."
        />
        <div className="grid gap-5 px-5 py-5">
          <FieldGroup
            label="مستندات لازم برای بررسی تغییر"
            hint="این انتخاب مشخص می‌کند برای کامل‌شدن پرونده چه مدارکی باید در بخش پیوست و اسناد قرارداد بارگذاری شود."
          >
            <MultiTagPills
              options={MATERIAL_SPECS_CHANGE_REQUIRED_DOCUMENTS.map((item) => ({ value: item, label: item }))}
              values={value.requiredDocuments}
              onChange={(requiredDocuments) => patch({ requiredDocuments })}
            />
          </FieldGroup>

          <TextAreaField
            label="یادداشت داخلی رسیدگی"
            value={value.internalNotes}
            onChange={(internalNotes) => patch({ internalNotes })}
            placeholder="نکات داخلی تیم قرارداد، وضعیت مدارک، یا توضیحاتی که لازم نیست در متن نهایی پرونده بیاید را اینجا ثبت کنید."
          />
        </div>
      </SectionCard>
    </div>
  );
}
