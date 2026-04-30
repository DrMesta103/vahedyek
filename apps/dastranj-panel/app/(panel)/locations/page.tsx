import Link from 'next/link';
import { deleteLocationAction } from '../../lib/actions';
import { listLocations } from '../../lib/data';
import { DataTable, EmptyState, PageIntro, PrimaryLink } from '@repo/ui';

export default async function LocationsPage() {
  const items = await listLocations();

  return (
    <div className="page-stack">
      <PageIntro
        title="محل‌های کار"
        description="مدیریت موقعیت‌های جغرافیایی مجاز برای ثبت حضور و غیاب."
        action={<PrimaryLink href="/locations/new">افزودن محل کار</PrimaryLink>}
      />
      {items.length === 0 ? (
        <EmptyState
          title="هنوز محلی ثبت نشده"
          description="از فرم افزودن محل کار برای شروع استفاده کنید."
          action={<PrimaryLink href="/locations/new">شروع</PrimaryLink>}
        />
      ) : (
        <DataTable
          columns={['عنوان', 'آدرس', 'شعاع', 'توضیح', 'عملیات']}
          rows={items.map((item) => [
            item.title,
            item.address,
            `${item.radius} متر`,
            item.description ?? '-',
            <div className="table-actions" key={item.id}>
              <Link href={`/locations/${item.id}/edit`} className="table-action-link">
                ویرایش
              </Link>
              <form action={deleteLocationAction}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="table-action-delete">
                  حذف
                </button>
              </form>
            </div>,
          ])}
        />
      )}
    </div>
  );
}
