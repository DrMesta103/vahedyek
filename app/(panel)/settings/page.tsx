import PanelLayout from '../../components/PanelLayout';
import { AccessManagementPanel } from '../business-settings/_components/AccessManagementPanel';

export default function SettingsPage() {
  return (
    <PanelLayout>
      <section className="general-settings-page">
        <div className="general-settings-heading">
          <h1>تنظیمات کلی</h1>
          <p>تنظیمات عمومی پنل، نقش‌ها و دسترسی اعضای کسب‌وکار از این بخش مدیریت می‌شود.</p>
        </div>
        <AccessManagementPanel />
      </section>
    </PanelLayout>
  );
}
