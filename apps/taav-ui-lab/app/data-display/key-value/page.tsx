import { TaavKeyValue } from '@repo/ui/taav/data-display';
import { DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { KEY_VALUE_PROPS } from '@/lib/docs/component-props';

export default function KeyValueDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Data Display', href: '/data-display' }, { label: 'کلید/مقدار' }]}>
      <DocPageHeader eyebrow="Detail Display" title="TaavKeyValue" description="خلاصه detail page / sidebar / review panel." importCode={`import { TaavKeyValue } from "@repo/ui/taav/data-display";`} />
      <DocSection title="Vertical">
        <DocPreview label="RTL Preview">
          <TaavKeyValue
            items={[
              { label: 'نام کسب‌وکار', value: 'شرکت تاو' },
              { label: 'شناسه ملی', value: '۱۰۳۲۰۵۶۷۸۹۰', tone: 'info' },
              { label: 'وضعیت', value: 'فعال', tone: 'success', description: 'آخرین بررسی: ۱۴۰۴/۰۱/۱۰' },
            ]}
            separator
          />
        </DocPreview>
      </DocSection>
      <DocSection title="Grid layout">
        <DocPreview>
          <TaavKeyValue
            layout="grid"
            items={[
              { label: 'حقوق پایه', value: '۴۵,۰۰۰,۰۰۰ تومان' },
              { label: 'بیمه', value: 'فعال', tone: 'success' },
              { label: 'محل کار', value: 'تهران — HQ' },
              { label: 'نوع قرارداد', value: 'رسمی' },
            ]}
          />
        </DocPreview>
      </DocSection>
      <DocSection title="Props"><DocPropsTable rows={KEY_VALUE_PROPS} /></DocSection>
    </DocPageShell>
  );
}
