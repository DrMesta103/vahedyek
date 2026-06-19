import { notFound } from 'next/navigation';
import { EmployeeNavPath } from '../../../components/business-sidebar/EmployeeNavPath';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { getSessionContext } from '../../../lib/auth';
import { getEmployee } from '../../../lib/data';
import { getCurrentEmployeeContract } from '../../../lib/employee-contracts.server';
import { EmployeeDetailView } from './_components/EmployeeDetailView';

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionContext();
  const tenantId = session?.tenantId ?? null;
  const [employee, currentContract] = await Promise.all([
    getEmployee(id),
    getCurrentEmployeeContract(id, tenantId),
  ]);

  if (!employee) notFound();

  const breadcrumbs = [
    { label: 'دسترنج', href: '/' },
    { label: 'تنظیمات کسب و کار', href: '/business-settings' },
    { label: 'کارمندان', href: '/employees' },
    { label: 'جزییات کارمند' },
  ];

  const employeeName = `${employee.firstName} ${employee.lastName}`.trim();

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
    createdAt: employee.createdAt.toISOString(),
    organizationUnits: employee.organizationUnits.map((item) => ({
      id: item.organizationUnit.id,
      title: item.organizationUnit.title,
    })),
    workGroups: employee.workGroupMemberships.map((item) => ({
      id: item.workGroup.id,
      title: item.workGroup.title,
    })),
    bankAccountsCount: Array.isArray(employee.bankAccounts) ? employee.bankAccounts.length : 0,
    guaranteeCount: Array.isArray(employee.guarantees) ? employee.guarantees.length : 0,
    currentContract,
  };

  return (
    <div className="page-stack module-page employee-detail-page" dir="rtl" lang="fa">
      <EmployeeNavPath employeeId={employee.id} employeeName={employeeName} currentLabel="جزییات کارمند" />
      <ModulePageHeader breadcrumbs={breadcrumbs} title="جزییات کارمند" titleHref="/employees" />
      <EmployeeDetailView employee={serialized} />
    </div>
  );
}
