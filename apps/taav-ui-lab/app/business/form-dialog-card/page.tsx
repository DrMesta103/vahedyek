'use client';

import { TaavBusinessFormDialogCard } from '@repo/ui/taav/business';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const PROPS = [
  { name: 'title / description', type: 'ReactNode', description: 'عنوان و توضیح فرم' },
  { name: 'fields', type: 'TaavBusinessFormDialogField[]', description: 'فیلدهای متنی و چندخطی فرم' },
  { name: 'secondaryToggle', type: 'object', description: 'کنترل انتخاب پلاک فرعی با وضعیت انتخاب‌شده' },
  { name: 'confirmLabel / cancelLabel', type: 'string', defaultValue: 'ثبت / لغو', description: 'عملیات پایین فرم' },
  { name: 'onConfirm / onCancel', type: '() => void', description: 'رویداد دکمه‌های فرم' },
  { name: 'disabled / loading', type: 'boolean', description: 'وضعیت‌های غیرفعال و بارگذاری' },
];

const accountDescription = 'پلاک های اصلی و فرعی را اینجا ثبت کنید.';

export default function BusinessFormDialogCardPage() {
  return (
    <div dir="rtl" className="text-right">
      <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'کسب‌وکار', href: '/business' }, { label: 'کارت فرم اطلاعات کسب‌وکار' }]}>
        <DocPageHeader eyebrow="کامپوننت‌های کسب‌وکار" title="کارت فرم اطلاعات کسب‌وکار" description="فرم مودال راست‌چین برای ثبت پلاک‌های اصلی و فرعی و مشخصات فنی پروژه." importCode={`import { TaavBusinessFormDialogCard } from '@repo/ui/taav/business';`} />
        <DocSection title="نمونه‌های مرجع">
          <div className="grid justify-items-center gap-6">
            <DocPreview label="پلاک‌های اصلی و فرعی"><TaavBusinessFormDialogCard themeMode="light" className="h-[440px] w-[365px]" title="پلاک های اصلی و فرعی" description={accountDescription} fields={[{ id: 'main-plot', label: 'پلاک اصلی', required: true, helperText: 'لطفاً عدد وارد کنید.' }]} secondaryToggle={{ label: 'پلاک فرعی', defaultSelected: false }} /></DocPreview>
            <DocPreview label="پلاک فرعی انتخاب‌شده"><TaavBusinessFormDialogCard themeMode="light" className="h-[440px] w-[365px]" title="پلاک های اصلی و فرعی" description={accountDescription} fields={[{ id: 'main-plot-selected', label: 'پلاک اصلی', required: true, helperText: 'لطفاً عدد وارد کنید.' }]} secondaryToggle={{ label: 'پلاک فرعی', defaultSelected: true }} /></DocPreview>
            <DocPreview label="مشخصات فنی پروژه"><TaavBusinessFormDialogCard themeMode="light" className="h-[440px] w-[365px]" title="مشخصات فنی پروژه" description="عنوان را انتخاب کرده و توضیح فنی مربوط به آن را وارد کنید. از گزینه‌های پیشنهادی برای راحتی و هماهنگی بیشتر استفاده کنید." fields={[{ id: 'project-title', label: 'عنوان', required: true }, { id: 'project-description', label: 'توضیحات', required: true, multiline: true }]} confirmLabel="تایید" /></DocPreview>
            <DocPreview label="حالت تیره"><TaavBusinessFormDialogCard themeMode="dark" className="h-[440px] w-[365px]" title="پلاک های اصلی و فرعی" description={accountDescription} fields={[{ id: 'dark-main-plot', label: 'پلاک اصلی', required: true, helperText: 'لطفاً عدد وارد کنید.' }]} secondaryToggle={{ label: 'پلاک فرعی', defaultSelected: true }} /></DocPreview>
          </div>
        </DocSection>
        <DocSection title="ویژگی‌های کامپوننت"><DocPropsTable rows={PROPS} /></DocSection>
      </DocPageShell>
    </div>
  );
}
