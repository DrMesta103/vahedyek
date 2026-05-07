import { notFound } from 'next/navigation';
import { getEmployee } from '../../../lib/data';
import { FormCard, PageIntro } from '@repo/ui/server';

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await getEmployee(id);

  if (!employee) notFound();

  return (
    <div className="page-stack">
      <PageIntro title={`${employee.firstName} ${employee.lastName}`} description="نمای جزئیات کارمند در نسخه نخست دسترنج." />
      <section className="metric-inline-row metric-inline-row-compact">
        <article className="metric-inline-card">
          <span>وضعیت</span>
          <strong>{employee.isActive ? 'فعال' : 'غیرفعال'}</strong>
        </article>
        <article className="metric-inline-card">
          <span>واحد سازمانی</span>
          <strong>{employee.organizationUnits.length}</strong>
        </article>
        <article className="metric-inline-card">
          <span>گروه کاری</span>
          <strong>{employee.workGroupMemberships.length}</strong>
        </article>
      </section>
      <div className="dual-grid">
        <FormCard title="اطلاعات پایه">
          <div className="detail-list">
            <div>
              <span>کد ملی</span>
              <strong>{employee.nationalId ?? '-'}</strong>
            </div>
            <div>
              <span>موبایل</span>
              <strong>{employee.mobile1 ?? '-'}</strong>
            </div>
            <div>
              <span>ایمیل</span>
              <strong>{employee.email ?? '-'}</strong>
            </div>
            <div>
              <span>کد پرسنلی</span>
              <strong>{employee.personnelCode ?? '-'}</strong>
            </div>
          </div>
        </FormCard>
        <FormCard title="اتصالات سازمانی">
          <div className="detail-list">
            <div>
              <span>واحدها</span>
              <strong>{employee.organizationUnits.map((item) => item.organizationUnit.title).join('، ') || '-'}</strong>
            </div>
            <div>
              <span>گروه‌های کاری</span>
              <strong>{employee.workGroupMemberships.map((item) => item.workGroup.title).join('، ') || '-'}</strong>
            </div>
            <div>
              <span>وضعیت</span>
              <strong>{employee.isActive ? 'فعال' : 'غیرفعال'}</strong>
            </div>
          </div>
        </FormCard>
      </div>
    </div>
  );
}
