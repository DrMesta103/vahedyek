'use client';

import { useState } from 'react';
import { TaavChoiceChipGroup } from '@repo/ui/taav/forms';

const COMPANY_TYPE_OPTIONS = [
  { label: 'شرکت سهامی خاص', value: 'private-joint-stock' },
  { label: 'شرکت سهامی عام', value: 'public-joint-stock' },
  { label: 'شرکت با مسئولیت محدود', value: 'limited-liability' },
  { label: 'شرکت تضامنی', value: 'partnership' },
  { label: 'شرکت تعاونی', value: 'cooperative' },
];

const POLICY_OPTIONS = [
  { label: 'دورکاری', value: 'remote' },
  { label: 'تمام وقت', value: 'full-time' },
  { label: 'قرارداد پروژه‌ای', value: 'project' },
  { label: 'شیفت شب', value: 'night', disabled: true },
  { label: 'پاره وقت', value: 'part-time' },
];

const SAMPLE_OPTIONS = [{ label: 'نمونه', value: 'sample' }];

export function ChoiceChipScreenshotDemo() {
  const [value, setValue] = useState('private-joint-stock');

  return (
    <div dir="rtl" className="w-full max-w-4xl">
      <TaavChoiceChipGroup
        label="نوع شخصیت حقوقی"
        description="این چیپ برای انتخاب گزینه‌ها در فرم است و در حالت انتخاب‌شده، border حذف می‌شود و background فیروزه‌ای می‌گیرد."
        options={COMPANY_TYPE_OPTIONS}
        value={value}
        onValueChange={(next) => setValue(Array.isArray(next) ? next[0] ?? '' : next)}
        size="lg"
        tone="brand"
        gap="md"
      />
    </div>
  );
}

export function ChoiceChipSingleSelectionGallery() {
  const [value, setValue] = useState('private-joint-stock');

  return (
    <div dir="rtl" className="grid gap-4">
      <TaavChoiceChipGroup
        label="نوع شرکت"
        description="در تک‌انتخابی فقط پس‌زمینه فیروزه‌ای دیده می‌شود؛ بدون تیک."
        options={COMPANY_TYPE_OPTIONS}
        value={value}
        onValueChange={(next) => setValue(Array.isArray(next) ? next[0] ?? '' : next)}
        size="md"
        tone="brand"
      />
      <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]">
        مقدار انتخاب‌شده: <code className="lab-code">{value}</code>
      </p>
    </div>
  );
}

export function ChoiceChipMultipleSelectionGallery() {
  const [values, setValues] = useState<string[]>(['remote', 'full-time']);

  return (
    <div dir="rtl" className="grid gap-4">
      <TaavChoiceChipGroup
        label="سیاست‌های کاری"
        description="در چندانتخابی، هر گزینه انتخاب‌شده تیک خودش را سمت راست متن نشان می‌دهد."
        options={POLICY_OPTIONS}
        value={values}
        onValueChange={(next) => setValues(Array.isArray(next) ? next : [next])}
        selectionMode="multiple"
        tone="neutral"
        size="md"
      />
      <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]">
        انتخاب‌های فعال: <code className="lab-code">{values.join(', ')}</code>
      </p>
    </div>
  );
}

export function ChoiceChipStateGallery() {
  return (
    <div dir="rtl" className="grid gap-6">
      <TaavChoiceChipGroup
        label="تک‌انتخابی"
        description="بدون تیک — فقط پس‌زمینه انتخاب‌شده"
        options={COMPANY_TYPE_OPTIONS.slice(0, 3)}
        defaultValue="private-joint-stock"
        size="md"
        tone="brand"
      />
      <TaavChoiceChipGroup
        label="چندانتخابی"
        description="با تیک داخل هر چیپ انتخاب‌شده"
        options={POLICY_OPTIONS.slice(0, 4)}
        defaultValue={['remote', 'full-time']}
        selectionMode="multiple"
        size="md"
        tone="brand"
      />
      <TaavChoiceChipGroup
        label="حالت نامعتبر"
        options={POLICY_OPTIONS.slice(0, 3)}
        defaultValue={['project']}
        selectionMode="multiple"
        invalid
      />
    </div>
  );
}

export function ChoiceChipSizeGallery() {
  return (
    <div dir="rtl" className="grid gap-5">
      {(['sm', 'md', 'lg'] as const).map((chipSize) => (
        <TaavChoiceChipGroup
          key={chipSize}
          label={`سایز ${chipSize}`}
          options={SAMPLE_OPTIONS}
          defaultValue="sample"
          size={chipSize}
          tone="brand"
        />
      ))}
    </div>
  );
}

export function ChoiceChipToneGallery() {
  const tones = ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const;

  return (
    <div dir="rtl" className="grid gap-5">
      {tones.map((tone) => (
        <TaavChoiceChipGroup
          key={tone}
          label={`Tone: ${tone}`}
          options={SAMPLE_OPTIONS}
          defaultValue="sample"
          size="md"
          tone={tone}
        />
      ))}
    </div>
  );
}

export function ChoiceChipThemePreview() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div data-taav-theme="light" className="rounded-[var(--taav-radius-xl)] p-4">
        <ChoiceChipScreenshotDemo />
      </div>
      <div data-taav-theme="dark" className="rounded-[var(--taav-radius-xl)] p-4">
        <ChoiceChipScreenshotDemo />
      </div>
    </div>
  );
}
