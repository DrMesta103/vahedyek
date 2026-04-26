import Link from 'next/link';
import { getQuickSetupChecklist } from '../../lib/data';
import { PageIntro } from '../../components/ui';

export default async function QuickSetupPage() {
  const data = await getQuickSetupChecklist();
  const completedCount = data.steps.filter((step) => step.done).length;
  const progress = Math.round((completedCount / data.steps.length) * 100);

  return (
    <div className="page-stack">
      <PageIntro title="راه‌اندازی سریع" description="همان منطق ۵ مرحله‌ای پروتوتایپ اینجا به داده واقعی دیتابیس وصل شده است." />

      <section className="highlight-card">
        <div>
          <p className="eyebrow">پیشرفت</p>
          <h3>{progress}%</h3>
          <p>
            {completedCount} مرحله از {data.steps.length} مرحله تکمیل شده است.
          </p>
        </div>
        <div className="progress-bar">
          <span style={{ width: `${progress}%` }} />
        </div>
      </section>

      <div className="checklist-grid">
        {data.steps.map((step, index) => (
          <article key={step.key} className="check-card">
            <div className={`check-badge${step.done ? ' done' : ''}`}>{step.done ? '✓' : index + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.done ? 'این بخش در دیتابیس ثبت شده است.' : 'هنوز داده‌ای برای این مرحله ثبت نشده است.'}</p>
            <Link href={step.href} className="secondary-link">
              {step.done ? 'مدیریت' : 'شروع'}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
