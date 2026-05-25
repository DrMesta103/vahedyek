import { BUSINESS_SETTINGS_CATALOG } from '../../lib/business-settings';
import { BusinessSettingsCard } from './_components/BusinessSettingsCard';

export default function BusinessSettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-2.5 px-2" dir="rtl" lang="fa">
      {BUSINESS_SETTINGS_CATALOG.map((item) => (
        <BusinessSettingsCard key={item.icon} {...item} />
      ))}
    </div>
  );
}
