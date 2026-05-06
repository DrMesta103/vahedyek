import Link from 'next/link';
import { CardMenu } from '../../components/CardMenu';
import { deleteLocationAction } from '../../lib/actions';
import { listLocations } from '../../lib/data';
import { EmptyState, PageIntro, PrimaryLink } from '@repo/ui/server';

export default async function LocationsPage() {
  const items = await listLocations();

  return (
    <div className="page-stack">
      <PageIntro
        title="محل‌های کار"
        description="موقعیت‌های مجاز حضور را به‌صورت کارت‌های گریدی مدیریت کنید."
        action={<PrimaryLink href="/locations/new">افزودن محل کار</PrimaryLink>}
      />
      {items.length === 0 ? (
        <EmptyState
          title="هنوز محلی ثبت نشده"
          description="از فرم افزودن محل کار برای شروع استفاده کنید."
          action={<PrimaryLink href="/locations/new">شروع</PrimaryLink>}
        />
      ) : (
        <div className="locations-grid">
          {items.map((item) => (
            <article key={item.id} className="location-card">
              <div className="location-card-head">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.address}</p>
                </div>
                <div className="location-card-controls">
                  <span className="location-card-radius">{item.radius} متر</span>
                  <CardMenu
                    items={[
                      { kind: 'link', href: `/locations/${item.id}/edit`, label: 'ویرایش' },
                      { kind: 'submit', label: 'حذف', tone: 'danger', action: deleteLocationAction, hiddenFields: { id: item.id } },
                    ]}
                  />
                </div>
              </div>

              <div className="location-card-map">
                <div className="location-card-pin">●</div>
              </div>

              <p className="location-card-description">{item.description ?? 'توضیحی برای این محل ثبت نشده است.'}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
