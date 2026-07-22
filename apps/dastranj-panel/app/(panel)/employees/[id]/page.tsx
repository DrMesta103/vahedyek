import { notFound } from 'next/navigation';
import { EmployeeNavPath } from '../../../components/business-sidebar/EmployeeNavPath';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { getSessionContext } from '../../../lib/auth';
import { getEmployee } from '../../../lib/data';
import { getEmployeeDetailContract, getEndedEmployeeIds } from '../../../lib/employee-contracts.server';
import { listClientStorageStates } from '../../../lib/client-storage-persistence';
import { getEmployeeSupplementalStorageKey, normalizeEmployeeSupplementalProfile, getDefaultEmployeeSupplementalProfile } from '../../../lib/employee-contract-drafts';
import { requireEmployeeAccess } from '../../../lib/organization-unit-access';
import { EmployeeDetailView } from './_components/EmployeeDetailView';

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employeeAccess = await requireEmployeeAccess('view');
  const session = await getSessionContext();
  const tenantId = session?.tenantId ?? null;
  const [employee, currentContract, storageStates, endedEmployeeIds] = await Promise.all([
    getEmployee(id),
    getEmployeeDetailContract(id, tenantId),
    listClientStorageStates(tenantId),
    getEndedEmployeeIds([id], tenantId),
  ]);

  if (!employee) notFound();

  const employeeName = `${employee.firstName} ${employee.lastName}`.trim();
  const supplementalRaw = storageStates.find((item) => item.storageKey === getEmployeeSupplementalStorageKey(tenantId))?.value;
  let supplemental = getDefaultEmployeeSupplementalProfile();
  if (supplementalRaw) {
    try {
      const profiles = JSON.parse(supplementalRaw) as Record<string, unknown>;
      supplemental = normalizeEmployeeSupplementalProfile(profiles[employee.id]);
    } catch {
      supplemental = getDefaultEmployeeSupplementalProfile();
    }
  }

  const serialized = {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    nationalId: employeeAccess.canSensitiveView ? employee.nationalId : null,
    mobile1: employee.mobile1,
    mobile2: employee.mobile2,
    email: employee.email,
    personnelCode: employee.personnelCode,
    avatarUrl: employee.avatarUrl,
    identityPhotoUrl: employeeAccess.canIdentityPhotoView ? employee.identityPhotoUrl : null,
    maritalStatus: employee.maritalStatus,
    childrenCount: employee.childrenCount,
    canEditIdentityPhoto: employee.canEditIdentityPhoto,
    isActive: employee.isActive,
    quickSetupStatus: employee.quickSetupStatus,
    quickSetupInvitationStatus: employee.quickSetupInvitationStatus,
    hasEndedContract: endedEmployeeIds.has(employee.id),
    permissions: {
      canUpdate: employeeAccess.canUpdate,
      canDisable: employeeAccess.canDisable,
      canSensitiveView: employeeAccess.canSensitiveView,
      canSensitiveUpdate: employeeAccess.canSensitiveUpdate,
      canIdentityPhotoView: employeeAccess.canIdentityPhotoView,
      canIdentityPhotoUpdate: employeeAccess.canIdentityPhotoUpdate,
      canHistoryView: employeeAccess.canHistoryView,
    },
    userTenantMembership: employee.userTenantMembership
      ? {
          id: employee.userTenantMembership.id,
          role: employee.userTenantMembership.role,
          user: employee.userTenantMembership.user,
          roles: employee.userTenantMembership.roles.map((item) => ({ key: item.role.key, label: item.role.label })),
        }
      : null,
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
    organizationUnits: employee.organizationUnits.map((item) => ({
      id: item.organizationUnit.id,
      title: item.organizationUnit.title,
      position: item.position,
      startDate: item.startDate,
      manager: item.organizationUnit.manager,
    })),
    workGroups: employee.workGroupMemberships.map((item) => ({
      id: item.workGroup.id,
      title: item.workGroup.title,
      location: item.workGroup.location ? { id: item.workGroup.location.id, title: item.workGroup.location.title } : null,
    })),
    workLocation: employee.workGroupMemberships.find((item) => item.workGroup.location)?.workGroup.location?.title ?? null,
    employmentStartDate: employee.organizationUnits.find((item) => item.startDate)?.startDate ?? currentContract?.startDate ?? null,
    accountState: employee.quickSetupInvitationStatus === 'sent'
      ? 'دعوت در انتظار'
      : employee.userTenantMembership
        ? 'عضویت متصل'
        : 'بدون حساب',
    bankAccountsCount: Array.isArray(employee.bankAccounts) ? employee.bankAccounts.length : 0,
    guaranteeCount: Array.isArray(employee.guarantees) ? employee.guarantees.length : 0,
    supplemental,
    currentContract,
  };

  return (
    <div className="page-stack module-page employee-detail-page" dir="rtl" lang="fa">
      <EmployeeNavPath employeeId={employee.id} employeeName={employeeName} currentLabel="جزییات کارمند" />
      <ModulePageHeader title="جزییات کارمند" titleHref="/employees" />
      <EmployeeDetailView employee={serialized} />
    </div>
  );
}
