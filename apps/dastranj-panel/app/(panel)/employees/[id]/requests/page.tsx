import { notFound } from 'next/navigation';
import { ModulePageHeader } from '../../../../components/module-page/ModulePageHeader';
import { getEmployeeRequestsPageData } from '../../../../lib/employee-requests';
import { EmployeeRequestsClient } from './_components/EmployeeRequestsClient';

export default async function EmployeeRequestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getEmployeeRequestsPageData(id);
  if (!data) notFound();

  return (
    <div className="page-stack module-page employee-requests-page" dir="rtl" lang="fa">
      <ModulePageHeader
        title="درخواست‌های کارمند"
        subtitle="ثبت، بررسی و مدیریت درخواست‌ها برای همین کارمند"
        titleHref={`/employees/${id}`}
      />
      <EmployeeRequestsClient {...data} />
    </div>
  );
}
