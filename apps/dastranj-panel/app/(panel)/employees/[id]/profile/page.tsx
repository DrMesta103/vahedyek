import { notFound } from 'next/navigation';
import { ModulePageHeader } from '../../../../components/module-page/ModulePageHeader';
import { getSessionContext } from '../../../../lib/auth';
import { listClientStorageStates } from '../../../../lib/client-storage-persistence';
import { getEmployee } from '../../../../lib/data';
import { prisma } from '../../../../lib/prisma';
import { getEmployeeAccess } from '../../../../lib/organization-unit-access';
import { EmployeeSupplementalProfileClient } from './_components/EmployeeSupplementalProfileClient';

export default async function EmployeeSupplementalProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionContext();
  const employee = await getEmployee(id);
  const storageStates = await listClientStorageStates(session?.tenantId ?? null);
  const access = await getEmployeeAccess();

  if (!employee) notFound();

  return (
    <div className="page-stack module-page employee-supplemental-profile-shell" dir="rtl" lang="fa">
      <ModulePageHeader title="مشخصات کارمند" titleHref={`/employees/${employee.id}`} />
      <EmployeeSupplementalProfileClient
        tenantId={session?.tenantId ?? null}
        storageStates={storageStates}
        employee={{
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          nationalId: employee.nationalId,
          mobile1: employee.mobile1,
          hasBank: Array.isArray(employee.bankAccounts) && employee.bankAccounts.length > 0,
          hasOrganization: employee.organizationUnits.length > 0 || employee.workGroupMemberships.length > 0,
          hasAccess: Boolean(employee.userTenantMembership),
          employmentStartDate: employee.organizationUnits.find((assignment) => assignment.status === 'ACTIVE')?.startDate ?? null,
          maritalStatus: employee.maritalStatus,
          childrenCount: employee.childrenCount,
        }}
        categoryData={session?.tenantId ? {
          skills: await prisma.employeeSkill.findMany({ where: { employeeId: employee.id, tenantId: session.tenantId, isActive: true }, orderBy: { updatedAt: 'desc' } }),
          interests: await prisma.employeeInterest.findMany({ where: { employeeId: employee.id, tenantId: session.tenantId, isActive: true }, orderBy: { updatedAt: 'desc' } }),
          preferences: await prisma.employeeWorkPreference.findFirst({ where: { employeeId: employee.id, tenantId: session.tenantId } }),
          health: access.canHealthView ? await prisma.employeeHealthProfile.findFirst({ where: { employeeId: employee.id, tenantId: session.tenantId } }) : null,
          healthApproval: access.canHealthView ? await prisma.employeeProfileApproval.findUnique({ where: { tenantId_employeeId_categoryKey: { tenantId: session.tenantId, employeeId: employee.id, categoryKey: 'HEALTH' } } }) : null,
          emergencyContacts: access.canSensitiveView ? await prisma.employeeEmergencyContact.findMany({ where: { employeeId: employee.id, tenantId: session.tenantId }, orderBy: { updatedAt: 'desc' } }) : [],
          canUpdate: access.canUpdate,
          canSensitiveView: access.canSensitiveView,
          canSensitiveUpdate: access.canSensitiveUpdate,
          canHealthView: access.canHealthView,
          canHealthUpdate: access.canHealthUpdate,
          historyCount: await prisma.employeeAuditLog.count({ where: { employeeId: employee.id, tenantId: session.tenantId } }),
        } : null}
      />
    </div>
  );
}
