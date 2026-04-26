import { listLocations } from '../../lib/data';
import { DataTable, EmptyState, PageIntro, PrimaryLink } from '../../components/ui';

export default async function LocationsPage() {
  const items = await listLocations();

  return (
    <div className="page-stack">
      <PageIntro title="محل‌های کار" description="مدیریت موقعیت‌های جغرافیایی مجاز برای ثبت حضور و غیاب." action={<PrimaryLink href="/locations/new">افزودن محل کار</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="هنوز محلی ثبت نشده" description="از فرم افزودن محل کار برای شروع استفاده کنید." action={<PrimaryLink href="/locations/new">شروع</PrimaryLink>} />
      ) : (
        <DataTable columns={['عنوان', 'آدرس', 'شعاع', 'توضیح']} rows={items.map((item) => [item.title, item.address, `${item.radius} متر`, item.description ?? '-'])} />
      )}
    </div>
  );
}
