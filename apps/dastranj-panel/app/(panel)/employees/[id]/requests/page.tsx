import { notFound } from 'next/navigation';
import { ModulePageHeader } from '../../../../components/module-page/ModulePageHeader';
import { getEmployeeRequestsPageData } from '../../../../lib/employee-requests';
import { EmployeeRequestsClient } from './_components/EmployeeRequestsClient';

export default async function EmployeeRequestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getEmployeeRequestsPageData(id);
  if (!data) notFound();

  const employeeName = `${data.employee.firstName} ${data.employee.lastName}`.trim();

  return (
    <div className="page-stack module-page employee-requests-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={[
          { label: 'دسترنج', href: '/' },
          { label: 'کارمندان', href: '/employees' },
          { label: employeeName || 'جزئیات کارمند', href: `/employees/${id}` },
          { label: 'درخواست‌ها' },
        ]}
        title="درخواست‌های کارمند"
        subtitle="ثبت، بررسی و مدیریت درخواست‌ها برای همین کارمند"
        titleHref={`/employees/${id}`}
      />
      <EmployeeRequestsClient {...data} />
    </div>
  );
}
