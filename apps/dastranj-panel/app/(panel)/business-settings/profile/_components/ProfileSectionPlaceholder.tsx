import Link from 'next/link';
import { BUSINESS_PROFILE_ROOT } from '../../../account/routes';

export default function ProfileSectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="page-stack">
      <article className="profile-summary-card">
        <div className="dashboard-spotlight-head">
          <div>
            <p className="eyebrow">در مرحله بعد</p>
            <h3>{title}</h3>
          </div>
        </div>

        <p>{description}</p>

        <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <span>وضعیت</span>
            <strong>فلو بعدا پیاده‌سازی می‌شود</strong>
          </div>
        </div>

        <div className="flex justify-start">
          <Link href={BUSINESS_PROFILE_ROOT} className="primary-button no-underline">
            بازگشت به پروفایل کسب‌وکار
          </Link>
        </div>
      </article>
    </div>
  );
}
