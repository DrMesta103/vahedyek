import { listDraftTemplates } from '../../lib/data';
import { draftTemplateLabels } from '../../lib/constants';
import { DataTable, EmptyState, PageIntro, PrimaryLink } from '@repo/ui';

export default async function DraftTemplatesPage() {
  const items = await listDraftTemplates();

  return (
    <div className="page-stack">
      <PageIntro title="قالب‌های پیش‌نویس" description="مدیریت قالب‌های قرارداد و فرایندهای منابع انسانی." action={<PrimaryLink href="/draft-templates/new">افزودن قالب</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="قالبی ثبت نشده" description="برای قراردادها و فرایندهای تکراری از این بخش استفاده کنید." action={<PrimaryLink href="/draft-templates/new">ایجاد قالب</PrimaryLink>} />
      ) : (
        <DataTable columns={['عنوان', 'دسته', 'نسخه', 'وضعیت']} rows={items.map((item) => [item.title, draftTemplateLabels[item.category], item.version, item.isActive ? 'فعال' : 'غیرفعال'])} />
      )}
    </div>
  );
}
