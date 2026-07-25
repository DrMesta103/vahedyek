'use client';

import { TaavBankAccountInfoInputCard, TaavBusinessAccountInfoCard } from '@repo/ui/taav/business';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const PROPS = [
  { name: 'title / description', type: 'ReactNode', description: 'عنوان و توضیح کوتاه کارت اطلاعات حساب بانکی' },
  { name: 'cardNumber', type: 'TaavBankCardNumberInputProps', description: 'تنظیمات ورودی شماره کارت ۱۶ رقمی' },
  { name: 'shebaNumber', type: 'TaavShebaNumberInputProps', description: 'تنظیمات ورودی شماره شبا' },
  { name: 'accountNumber', type: 'TaavBankAccountNumberInputProps', description: 'تنظیمات ورودی شماره حساب تمام‌عرض' },
  { name: 'value / onValueChange / error / required', type: 'Input props', description: 'کنترل مقدار و اعتبارسنجی هر ورودی' },
];

export default function BankAccountInfoInputPage() {
  return (
    <div dir="rtl" className="text-right">
      <DocPageShell
        breadcrumbs={[
          { label: 'خانه', href: '/' },
          { label: 'کسب‌وکار', href: '/business' },
          { label: 'اطلاعات حساب بانکی' },
        ]}
      >
        <DocPageHeader
          eyebrow="کامپوننت‌های کسب‌وکار"
          title="اطلاعات حساب بانکی"
          description="کارت ورود شماره کارت، شماره شبا و شماره حساب با اعتبارسنجی و چیدمان RTL."
          importCode={`import { TaavBankAccountInfoInputCard } from '@repo/ui/taav/business';`}
        />

        <DocSection title="نمونه‌های روشن">
          <div className="grid gap-6 justify-items-center">
            <DocPreview label="حالت خالی و اجباری">
              <TaavBankAccountInfoInputCard themeMode="light" className="w-full max-w-[700px]" />
            </DocPreview>

            <DocPreview label="حالت پرشده">
              <TaavBankAccountInfoInputCard
                themeMode="light"
                className="w-full max-w-[700px]"
                cardNumber={{ defaultValue: '6037997512345678' }}
                shebaNumber={{ defaultValue: 'IR120170000000123456789012' }}
                accountNumber={{ defaultValue: '33526545111' }}
              />
            </DocPreview>

            <DocPreview label="حالت خطا">
              <TaavBankAccountInfoInputCard
                themeMode="light"
                className="w-full max-w-[700px]"
                cardNumber={{ defaultValue: '4121', error: 'لطفاً شماره کارت معتبر وارد کنید.' }}
                shebaNumber={{ defaultValue: 'IR120', error: 'لطفاً شماره شبا معتبر وارد کنید.' }}
                accountNumber={{ defaultValue: '۰۰', error: 'شماره حساب اشتباه است.' }}
              />
            </DocPreview>
          </div>
        </DocSection>

        <DocSection title="کارت اطلاعات حساب به‌عنوان زیرمجموعه">
          <DocPreview label="نمایش حساب ثبت‌شده">
            <TaavBusinessAccountInfoCard
              className="w-full max-w-[740px]"
              themeMode="light"
              contractLabel="خسارت‌های قراردادی"
              ownerNames={['۱ - نرگس سپهری', '۲ - لیلا سپهری']}
            />
          </DocPreview>
        </DocSection>

        <DocSection title="ویژگی‌های کامپوننت">
          <DocPropsTable rows={PROPS} />
        </DocSection>
      </DocPageShell>
    </div>
  );
}
