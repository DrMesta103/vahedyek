import { TaavStatusBadge, TaavTableActions, TaavTableBody, TaavTableCell, TaavTableHead, TaavTableHeader, TaavTableRow, TaavTableShell } from '@repo/ui/taav/data-display';
import { TaavButton } from '@repo/ui/taav/primitives';
import { DocDoDont, DocPageHeader, DocPreview, DocPropsTable, DocSection } from '@/components/lab/DocBlocks';
import { DocPageShell } from '@/components/lab/DocPageShell';
import { TABLE_SHELL_PROPS } from '@/lib/docs/component-props';

export default function TableShellDocPage() {
  return (
    <DocPageShell breadcrumbs={[{ label: 'خانه', href: '/' }, { label: 'Data Display', href: '/data-display' }, { label: 'جدول' }]}>
      <DocPageHeader eyebrow="Table Shell" title="TaavTableShell" description="Shell جدول semantic — بدون data-grid engine." importCode={`import { TaavTableShell, TaavTableRow, TaavTableCell } from "@repo/ui/taav/data-display";`} />
      <DocSection title="Basic table">
        <DocPreview label="RTL Preview">
          <TaavTableShell variant="bordered" density="comfortable">
            <TaavTableHeader>
              <tr>
                <TaavTableHead>نام</TaavTableHead>
                <TaavTableHead>وضعیت</TaavTableHead>
                <TaavTableHead>عملیات</TaavTableHead>
              </tr>
            </TaavTableHeader>
            <TaavTableBody>
              <TaavTableRow>
                <TaavTableCell>علی رضایی</TaavTableCell>
                <TaavTableCell><TaavStatusBadge status="active" size="sm" /></TaavTableCell>
                <TaavTableActions><TaavButton size="sm" variant="ghost" tone="neutral">جزئیات</TaavButton></TaavTableActions>
              </TaavTableRow>
              <TaavTableRow striped>
                <TaavTableCell>مریم احمدی</TaavTableCell>
                <TaavTableCell><TaavStatusBadge status="pending" size="sm" /></TaavTableCell>
                <TaavTableActions><TaavButton size="sm" variant="ghost" tone="neutral">جزئیات</TaavButton></TaavTableActions>
              </TaavTableRow>
            </TaavTableBody>
          </TaavTableShell>
        </DocPreview>
      </DocSection>
      <DocSection title="Loading / empty">
        <DocPreview>
          <div className="grid gap-4 md:grid-cols-2">
            <TaavTableShell loading />
            <TaavTableShell empty />
          </div>
        </DocPreview>
      </DocSection>
      <DocSection title="Props"><DocPropsTable rows={TABLE_SHELL_PROPS} /></DocSection>
      <DocSection title="Do / Don't"><DocDoDont doItems={['برای جدول ساده از TaavTableShell + HTML table استفاده کنید']} dontItems={['TanStack Table را بدون نیاز واقعی اضافه نکنید']} /></DocSection>
    </DocPageShell>
  );
}
