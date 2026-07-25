'use client';

import { TaavBusinessAccountInfoCard } from '@repo/ui/taav/business';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';

const PROPS = [
  { name: 'bankName / contractLabel / logo', type: 'ReactNode', description: 'نام بانک، نوع استفاده از حساب و نشان بانک' },
  { name: 'formattedAccountNumber / accountNumber / iban', type: 'ReactNode', description: 'شماره نمایشی، شماره حساب و شماره شبا' },
  { name: 'showInContract / onShowInContractChange', type: 'boolean / function', description: 'وضعیت و رویداد نمایش حساب در قرارداد' },
  { name: 'ownerLabel / ownerName / ownerNames', type: 'ReactNode', description: 'عنوان و نام یک یا چند صاحب حساب' },
  { name: 'onRefresh / onMenuClick / onEdit / onDelete', type: 'function', description: 'اکشن‌های بازنشانی و منوی ویرایش یا حذف' },
  { name: 'disabled / themeMode', type: 'boolean / string', description: 'وضعیت غیرفعال و تم کارت' },
];

export default function AccountInfoCardPage() {
  return (
    <div dir="rtl" className="text-right">
      <DocPageShell
        breadcrumbs={[
          { label: 'خانه', href: '/' },
          { label: 'کسب‌وکار', href: '/business' },
          { label: 'کارت اطلاعات حساب' },
        ]}
      >
        <DocPageHeader
          eyebrow="کامپوننت‌های کسب‌وکار"
          title="کارت اطلاعات حساب"
          description="نمایش اطلاعات حساب بانکی، شماره شبا و امکان استفاده از حساب در متن قرارداد."
          importCode={`import { TaavBusinessAccountInfoCard } from '@repo/ui/taav/business';`}
        />

        <DocSection title="نمونه‌های روشن">
          <div className="grid gap-6 justify-items-center">
            <DocPreview label="خسارت‌های قراردادی">
              <TaavBusinessAccountInfoCard
                className="w-[740px]"
                themeMode="light"
                contractLabel="خسارت‌های قراردادی"
                ownerNames={['۱ - نرگس سپهری', '۲ - لیلا سپهری']}
              />
            </DocPreview>

            <DocPreview label="دریافت">
              <TaavBusinessAccountInfoCard
                className="w-[740px]"
                themeMode="light"
                bankName="-"
                contractLabel="دریافت"
                formattedAccountNumber="۶۱۰۴ ۲۵۴۵ ۴۴۵۴ ۴۵۴۵"
                accountNumber="۵۴۶۵۶۵۴۵۶۵۴۵۶۵"
                iban="IR۸۶ ۵۴۶۵ ۶۶۵۴ ۶۵۶۵ ۴۶۵۶ ۶۵۶۵ ۴۶"
                onRefresh={() => undefined}
                ownerNames={['۱ - gfgdg']}
              />
            </DocPreview>
          </div>
        </DocSection>

        <DocSection title="ویژگی‌های کامپوننت">
          <DocPropsTable rows={PROPS} />
        </DocSection>
      </DocPageShell>
    </div>
  );
}
