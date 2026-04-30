import Link from 'next/link';
import { listEmployees } from '../../lib/data';
import { EmptyState, PageIntro, PrimaryLink } from '@repo/ui';

export default async function EmployeesPage() {
  const items = await listEmployees();

  return (
    <div className="page-stack">
      <PageIntro title="کارمندان" description="فهرست پرسنل، واحدهای سازمانی و عضویت در گروه‌های کاری." action={<PrimaryLink href="/employees/new">افزودن کارمند</PrimaryLink>} />
      {items.length === 0 ? (
        <EmptyState title="کارمندی ثبت نشده" description="برای مرحله چهارم راه‌اندازی از اینجا شروع کنید." action={<PrimaryLink href="/employees/new">ثبت کارمند</PrimaryLink>} />
      ) : (
        <div className="list-grid">
          {items.map((item) => (
            <article key={item.id} className="entity-card">
              <div>
                <h3><Link href={`/employees/${item.id}`}>{`${item.firstName} ${item.lastName}`.trim()}</Link></h3>
                <p>{item.email ?? item.mobile1 ?? 'اطلاعات تماس ثبت نشده'}</p>
              </div>
              <div className="card-meta">
                <span>کد پرسنلی: {item.personnelCode ?? '-'}</span>
                <span>واحدها: {item.organizationUnits.map((record) => record.organizationUnit.title).join('، ') || '-'}</span>
                <span>گروه‌ها: {item.workGroupMemberships.map((record) => record.workGroup.title).join('، ') || '-'}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
