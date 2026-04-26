import { getDashboardData } from '../../lib/data';
import { PageIntro, StatGrid } from '../../components/ui';

export default async function PayrollContractPage() {
  const data = await getDashboardData();

  return (
    <div className="page-stack">
      <PageIntro title="قرارداد حقوق و دستمزد" description="جایگاه بک‌اند محور برای مرحله بعدی توسعه قراردادهای حقوقی دسترنج." />
      <StatGrid items={data.stats.slice(2)} />
      <section className="highlight-card">
        <div>
          <h3>پایه آماده توسعه</h3>
          <p>مدل‌های کارمند، پیش‌نویس، سیاست و گروه کاری آماده‌اند تا جریان قرارداد ماهانه روی آن‌ها سوار شود.</p>
        </div>
      </section>
    </div>
  );
}
