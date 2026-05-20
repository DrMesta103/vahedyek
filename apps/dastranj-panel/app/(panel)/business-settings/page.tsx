import { BUSINESS_SETTINGS_CATALOG } from '../../lib/business-settings';
import { BusinessSettingsCard } from './_components/BusinessSettingsCard';

export default function BusinessSettingsPage() {
  return (
    <div className="flex w-full flex-col gap-3" dir="rtl" lang="fa">
      {BUSINESS_SETTINGS_CATALOG.map((item) => (
        <BusinessSettingsCard key={item.icon} {...item} />
      ))}
    </div>
  );
}
