'use client';

import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { MobileNumberInputEmptyDemo, MobileNumberInputFilledDemo, MobileNumberInputFocusedDemo, MobileNumberInputInvalidDemo, MobileNumberInputLoadingDemo } from '@/components/lab/BusinessMobileNumberInputCardShowcase';

const BUSINESS_MOBILE_NUMBER_INPUT_CARD_PROPS = [
  { name: 'title', type: 'ReactNode', defaultValue: 'وارد کردن شماره موبایل', description: 'عنوان کارت' },
  { name: 'description', type: 'ReactNode', description: 'توضیح اصلی زیر عنوان' },
  { name: 'label', type: 'ReactNode', defaultValue: 'موبایل یا ایمیل', description: 'برچسب فیلد' },
  { name: 'placeholder', type: 'string', defaultValue: 'خالی', description: 'در نمونه‌ی مرجع متنی داخل فیلد نمایش داده نمی‌شود' },
  { name: 'value / defaultValue', type: 'string', description: 'مقدار کنترل‌شده یا اولیه' },
  { name: 'onValueChange', type: '(value: string) => void', description: 'بازگشت مقدار پس از تغییر' },
  { name: 'helperText / error', type: 'ReactNode', description: 'پیام راهنما یا خطا' },
  { name: 'required / disabled / readOnly / loading', type: 'boolean', description: 'وضعیت‌های اصلی کارت و فیلد' },
  { name: 'maxLength', type: 'number', defaultValue: '50', description: 'حداکثر تعداد کاراکتر قابل نمایش' },
  { name: 'icon', type: 'ReactNode', description: 'آیکون بالای کارت' },
  { name: 'className / wrapperClassName / inputClassName', type: 'string', description: 'سفارشی‌سازی ظاهری کارت و فیلد' },
];

export default function BusinessMobileNumberInputCardDocPage() {
  return (
    <div dir="rtl" className="text-right">
      <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کسب‌وکار', href: '/business' }, { label: 'وارد کردن شماره موبایل' }]}>
        <DocPageHeader
          eyebrow="کامپوننت‌های کسب‌وکار"
          title="TaavMobileNumberInputCard"
          description="کارت ثبت شماره موبایل با چیدمان راست‌چین، آیکون برند، شمارنده کاراکتر و نمایش حالت خطا."
          importCode={`import { TaavMobileNumberInputCard } from '@repo/ui/taav/business';`}
        />
        <DocSection title="حالت خالی"><DocPreview label="خالی"><MobileNumberInputEmptyDemo /></DocPreview></DocSection>
        <DocSection title="حالت انتخاب‌شده"><DocPreview label="فوکوس‌شده و خالی"><MobileNumberInputFocusedDemo /></DocPreview></DocSection>
        <DocSection title="حالت پرشده"><DocPreview label="پرشده"><MobileNumberInputFilledDemo /></DocPreview></DocSection>
        <DocSection title="حالت خطا"><DocPreview label="فرمت نامعتبر"><MobileNumberInputInvalidDemo /></DocPreview></DocSection>
        <DocSection title="حالت بارگذاری"><DocPreview label="اسکلت بارگذاری"><MobileNumberInputLoadingDemo /></DocPreview></DocSection>
        <DocSection title="ویژگی‌های TaavMobileNumberInputCard"><DocPropsTable rows={BUSINESS_MOBILE_NUMBER_INPUT_CARD_PROPS} /></DocSection>
      </DocPageShell>
    </div>
  );
}
