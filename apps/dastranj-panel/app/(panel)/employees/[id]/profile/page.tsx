import { notFound } from 'next/navigation';
import { ModulePageHeader } from '../../../../components/module-page/ModulePageHeader';
import { getSessionContext } from '../../../../lib/auth';
import { listClientStorageStates } from '../../../../lib/client-storage-persistence';
import { getEmployee } from '../../../../lib/data';
import { EmployeeSupplementalProfileClient } from './_components/EmployeeSupplementalProfileClient';

export default async function EmployeeSupplementalProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionContext();
  const employee = await getEmployee(id);
  const storageStates = await listClientStorageStates(session?.tenantId ?? null);

  if (!employee) notFound();

  const breadcrumbs = [
    { label: 'دسترنج', href: '/' },
    { label: 'تنظیمات کسب و کار', href: '/business-settings' },
    { label: 'کارمندان', href: '/employees' },
    { label: 'جزییات کارمند', href: `/employees/${employee.id}` },
    { label: 'مشخصات کارمند' },
  ];

  return (
    <div className="page-stack module-page employee-supplemental-profile-shell" dir="rtl" lang="fa">
      <ModulePageHeader breadcrumbs={breadcrumbs} title="مشخصات کارمند" titleHref={`/employees/${employee.id}`} />
      <EmployeeSupplementalProfileClient
        tenantId={session?.tenantId ?? null}
        storageStates={storageStates}
        employee={{
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          nationalId: employee.nationalId,
          maritalStatus: employee.maritalStatus,
          childrenCount: employee.childrenCount,
        }}
      />
    </div>
  );
}
