import { listRequestReasons } from '../../lib/data';
import { requestReasonLabels } from '../../lib/constants';
import { DataTable, EmptyState, PageIntro, PrimaryLink } from '../../components/ui';

export default async function RequestReasonsPage() {
  const items = await listRequestReasons();

  return (
    <div className="page-stack">
      <PageIntro title="دلایل درخواست" description="مدیریت دسته‌بندی و دلایل قابل‌استفاده در فرایندهای سازمانی." action={<PrimaryLink href="/request-reasons/new">افزودن دلیل</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="لیست خالی است" description="هنوز دلیلی ثبت نشده است." action={<PrimaryLink href="/request-reasons/new">افزودن</PrimaryLink>} />
      ) : (
        <DataTable columns={['عنوان', 'دسته', 'وضعیت', 'ترتیب']} rows={items.map((item) => [item.title, requestReasonLabels[item.category], item.isActive ? 'فعال' : 'غیرفعال', item.displayOrder])} />
      )}
    </div>
  );
}
