import PanelLayout from '../../components/PanelLayout';
import { AccessManagementPanel } from '../business-settings/_components/AccessManagementPanel';
import { ReminderSettingsPanel } from './_components/ReminderSettingsPanel';

export default function SettingsPage() {
  return (
    <PanelLayout>
      <section className="general-settings-page">
        <div className="general-settings-heading">
          <h1>تنظیمات کلی</h1>
          <p>تنظیمات عمومی پنل، نقش‌ها و دسترسی اعضای کسب و کار از این بخش مدیریت می‌شود.</p>
        </div>
        <ReminderSettingsPanel />
        <AccessManagementPanel />
      </section>
    </PanelLayout>
  );
}
