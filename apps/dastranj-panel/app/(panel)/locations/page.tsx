import { listLocations } from '../../lib/data';
import { ModuleAddTile } from '../../components/module-page/ModuleAddTile';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { LocationWorkplaceCard } from './_components/LocationWorkplaceCard';

export default async function LocationsPage() {
  const items = await listLocations();

  return (
    <div className="page-stack module-page" dir="rtl" lang="fa">
      <ModulePageHeader
        title="محل‌های کار"
        subtitle="مدیریت محل‌های جغرافیایی مجاز برای ثبت تردد، شیفت‌ها و گروه‌های کاری"
        addHref="/locations/new"
        addLabel="افزودن محل کار"
      />

      <div className="module-page-grid locations-workplace-grid">
        {items.length ? (
          items.map((item) => (
            <LocationWorkplaceCard
              key={item.id}
              id={item.id}
              title={item.title}
              address={item.address}
              description={item.description}
              radius={item.radius}
              latitude={item.latitude}
              longitude={item.longitude}
              isActive={Boolean(item.isActive)}
              isPrimaryOnboarding={item.isPrimaryOnboarding}
              usageCount={item.usageCount ?? 0}
            />
          ))
        ) : (
          <div className="empty-state">
            <strong>افزودن محل کار جدید</strong>
            <p>هنوز هیچ محل کاری ثبت نشده است. برای شروع، یک محل کار جدید اضافه کنید.</p>
          </div>
        )}
        <ModuleAddTile href="/locations/new" label="افزودن محل کار جدید" />
      </div>
    </div>
  );
}
