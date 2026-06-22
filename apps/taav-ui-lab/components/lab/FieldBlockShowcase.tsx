'use client';

import { useState } from 'react';
import { TaavCard } from '@repo/ui/taav/primitives';
import { TaavChoiceChipGroup, TaavFieldBlock, TaavFieldGrid, TaavInput, TaavTextarea } from '@repo/ui/taav/forms';

const COMPANY_TYPE_OPTIONS = [
  { label: 'شرکت سهامی خاص', value: 'private-joint-stock' },
  { label: 'شرکت سهامی عام', value: 'public-joint-stock' },
  { label: 'شرکت با مسئولیت محدود', value: 'limited-liability' },
  { label: 'شرکت تضامنی', value: 'partnership' },
  { label: 'شرکت تعاونی', value: 'cooperative' },
];

export function ScreenshotLikeBusinessForm() {
  return (
    <div dir="rtl" className="w-full max-w-5xl">
      <TaavFieldGrid columns={2} gap="lg" density="spacious">
        <TaavFieldBlock
          label="نام قانونی شرکت / کسب و کار"
          required
          tooltip="نام رسمی ثبت شده در اداره ثبت شرکت ها"
          htmlFor="legal-name"
        >
          <TaavInput id="legal-name" size="lg" radius="xl" />
        </TaavFieldBlock>
        <TaavFieldBlock
          label="نام تجاری / برند"
          tooltip="نام تجاری جهت نمایش در سامانه"
          htmlFor="brand-name"
        >
          <TaavInput id="brand-name" size="lg" radius="xl" />
        </TaavFieldBlock>
        <TaavFieldBlock
          label="شناسه ملی"
          required
          tooltip="شناسه ملی اشخاص حقوقی برای تمامی شرکت ها اجباری است"
          htmlFor="national-id"
        >
          <TaavInput id="national-id" size="lg" radius="xl" />
        </TaavFieldBlock>
        <TaavFieldBlock
          label="شماره ثبت شرکت"
          required
          tooltip="شماره اختصاصی ثبت در اداره ثبت شرکت ها"
          htmlFor="register-id"
        >
          <TaavInput id="register-id" size="lg" radius="xl" />
        </TaavFieldBlock>
      </TaavFieldGrid>
    </div>
  );
}

export function FieldBlockThemePreview() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div data-taav-theme="light">
        <TaavCard variant="outlined" padding="md" radius="xl">
          <ScreenshotLikeBusinessForm />
        </TaavCard>
      </div>
      <div data-taav-theme="dark">
        <TaavCard variant="outlined" padding="md" radius="xl">
          <ScreenshotLikeBusinessForm />
        </TaavCard>
      </div>
    </div>
  );
}

export function FieldBlockUsageGallery() {
  const [companyType, setCompanyType] = useState('private-joint-stock');

  return (
    <div dir="rtl" className="grid gap-6">
      <TaavFieldGrid columns={2} gap="lg" density="comfortable">
        <TaavFieldBlock
          label="نام نمایشی کسب و کار"
          required
          tooltip="این متن همیشه زیر فیلد دیده می‌شود و tooltip شناور نیست."
          htmlFor="display-name"
        >
          <TaavInput id="display-name" radius="xl" />
        </TaavFieldBlock>

        <TaavFieldBlock
          label="نام کوتاه"
          optional
          tooltip="در URL عمومی یا گزارش‌های فشرده استفاده می‌شود."
          htmlFor="short-name"
        >
          <TaavInput id="short-name" radius="xl" />
        </TaavFieldBlock>

        <TaavFieldBlock
          label="نوع شخصیت"
          required
          tooltip="نوع ساختار حقوقی کسب‌وکار را انتخاب کنید."
          warning="بهتر است نوع شخصیت را با اسناد ثبتی تطبیق دهید."
        >
          <TaavChoiceChipGroup
            ariaLabel="نوع شخصیت"
            options={COMPANY_TYPE_OPTIONS}
            value={companyType}
            onValueChange={(next) => setCompanyType(Array.isArray(next) ? next[0] ?? '' : next)}
            size="md"
            tone="brand"
            gap="md"
          />
        </TaavFieldBlock>

        <TaavFieldBlock
          label="شرح فعالیت"
          tooltip="این متن در پروفایل کسب‌وکار نمایش داده می‌شود."
          success="متن شرح فعالیت آماده انتشار است."
          htmlFor="activity-summary"
        >
          <TaavTextarea
            id="activity-summary"
            radius="xl"
            minRows={4}
          />
        </TaavFieldBlock>
      </TaavFieldGrid>
    </div>
  );
}
