import { getBusinessSettingsData } from '../../lib/data';
import { PageIntro, PrimaryLink } from '@repo/ui';

export default async function BusinessSettingsPage() {
  const items = await getBusinessSettingsData();

  return (
    <div className="page-stack">
      <PageIntro title="تنظیمات کسب و کار" description="درگاه مرکزی برای تمام ماژول‌های مدیریتی دسترنج." />

      <div className="settings-grid">
        {items.map((item) => (
          <article key={item.href} className="settings-card">
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <div className="settings-card-footer">
              <span>{item.count} مورد</span>
              <PrimaryLink href={item.href}>ورود</PrimaryLink>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
