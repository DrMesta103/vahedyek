import { listLocations } from '../../lib/data';
import { ModuleAddTile } from '../../components/module-page/ModuleAddTile';
import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { businessSettingsBreadcrumbs } from '../../components/module-page/module-breadcrumbs';
import { LocationWorkplaceCard } from './_components/LocationWorkplaceCard';

export default async function LocationsPage() {
  const items = await listLocations();

  return (
    <div className="page-stack module-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={businessSettingsBreadcrumbs('محل کار')}
        title="محل‌های کار"
        subtitle="مدیریت محل‌های جغرافیایی مجاز برای ثبت حضور و غیاب"
        addHref="/locations/new"
        addLabel="افزودن محل کار"
      />

      <div className="module-page-grid locations-workplace-grid">
        {items.map((item) => (
          <LocationWorkplaceCard
            key={item.id}
            id={item.id}
            title={item.title}
            radius={item.radius}
            latitude={item.latitude}
            longitude={item.longitude}
          />
        ))}
        <ModuleAddTile href="/locations/new" label="برای افزودن محل کار کلیک کنید." />
      </div>
    </div>
  );
}
