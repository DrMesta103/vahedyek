import { notFound } from 'next/navigation';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { getEmployee } from '../../../lib/data';
import { formatPersianDate } from '../../../lib/format-date';
import { EmployeeDetailView } from './_components/EmployeeDetailView';

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await getEmployee(id);

  if (!employee) notFound();

  const breadcrumbs = [
    { label: 'دسترنج', href: '/' },
    { label: 'تنظیمات کسب و کار', href: '/business-settings' },
    { label: 'کارمندان', href: '/employees' },
    { label: 'جزییات کارمند' },
  ];

  const serialized = {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    nationalId: employee.nationalId,
    mobile1: employee.mobile1,
    mobile2: employee.mobile2,
    email: employee.email,
    personnelCode: employee.personnelCode,
    avatarUrl: employee.avatarUrl,
    identityPhotoUrl: employee.identityPhotoUrl,
    maritalStatus: employee.maritalStatus,
    childrenCount: employee.childrenCount,
    canEditIdentityPhoto: employee.canEditIdentityPhoto,
    createdAt: formatPersianDate(employee.createdAt),
  };

  return (
    <div className="page-stack module-page employee-detail-page" dir="rtl" lang="fa">
      <ModulePageHeader breadcrumbs={breadcrumbs} title="جزییات کارمند" titleHref="/employees" />
      <EmployeeDetailView employee={serialized} />
    </div>
  );
}
