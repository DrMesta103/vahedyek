import { getBusinessSettingsData } from '../../lib/data';
import { PageIntro, PrimaryLink } from '@repo/ui/server';

export default async function BusinessSettingsPage() {
  const items = await getBusinessSettingsData();

  return (
    <div className="page-stack">
      <PageIntro title="تنظیمات کسب و کار" description="درگاه مرکزی برای تمام ماژول‌های مدیریتی دسترنج." />

      <div className="catalog-grid">
        {items.map((item) => (
          <article key={item.href} className="catalog-card settings-catalog-card">
            <div className="catalog-card-head">
              <span className="catalog-pill">{item.count} مورد</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <div className="catalog-card-footer">
              <PrimaryLink href={item.href}>ورود</PrimaryLink>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
