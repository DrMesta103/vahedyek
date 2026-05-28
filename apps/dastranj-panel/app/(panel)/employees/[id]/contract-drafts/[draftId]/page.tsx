import { notFound } from 'next/navigation';
import { getBusinessProfile, getEmployee } from '../../../../../lib/data';
import { EmployeeContractDraftBuilderClient } from '../_components/EmployeeContractDraftFlowClient';

export default async function EmployeeContractDraftBuilderPage({
  params,
}: {
  params: Promise<{ id: string; draftId: string }>;
}) {
  const { id, draftId } = await params;
  const [employee, businessProfile] = await Promise.all([getEmployee(id), getBusinessProfile()]);

  if (!employee) notFound();

  return (
    <EmployeeContractDraftBuilderClient
      draftId={draftId}
      employee={{
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
      }}
      businessProfile={businessProfile
        ? {
            brandName: businessProfile.brandName,
            legalName: businessProfile.legalName,
            contactEmail: businessProfile.contactEmail,
            phone: businessProfile.phone,
            address: businessProfile.address,
          }
        : null}
    />
  );
}
