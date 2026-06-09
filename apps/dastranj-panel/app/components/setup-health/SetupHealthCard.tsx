import Link from 'next/link';
import type { TenantSetupHealth } from '../../lib/setup-health';
import { SetupCriticalItemStatusList } from './SetupCriticalItemStatusList';

export function SetupHealthCard({ setupHealth }: { setupHealth: TenantSetupHealth }) {
  const { score, completedCount, totalCriticalCount, nextReminder, criticalItems } = setupHealth;
  const isComplete = completedCount === totalCriticalCount;

  return (
    <section className="setup-health-card" dir="rtl" lang="fa">
      <div className="setup-health-card-head">
        <div>
          <p className="setup-health-eyebrow">وضعیت تکمیل تنظیمات</p>
          <h2>وضعیت تکمیل تنظیمات</h2>
          <p className="setup-health-copy">
            برای استفاده دقیق از تردد، درخواست‌ها و مدیریت کارکنان، تنظیمات ضروری کسب‌وکار را کامل کنید.
          </p>
        </div>
        <div className="setup-health-score">
          <strong>{score}%</strong>
          <span>تکمیل شده</span>
        </div>
      </div>

      <p className="setup-health-progress-text">
        {completedCount} مورد از {totalCriticalCount} تنظیم ضروری تکمیل شده است.
      </p>

      {nextReminder ? (
        <div className="setup-health-next-card">
          <div>
            <span className="setup-health-next-label">اقدام پیشنهادی بعدی</span>
            <h3>{nextReminder.title}</h3>
            <p>{nextReminder.description}</p>
          </div>
          <Link href={nextReminder.route} className="setup-health-next-link">
            {nextReminder.ctaLabel}
          </Link>
        </div>
      ) : (
        <div className="setup-health-complete-card">
          <h3>تنظیمات اصلی کسب‌وکار کامل است.</h3>
          <p>می‌توانید جزئیات پیشرفته را در هر بخش مدیریت کنید.</p>
        </div>
      )}

      <SetupCriticalItemStatusList items={criticalItems} />
    </section>
  );
}
