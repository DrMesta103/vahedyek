import { prisma } from './prisma';

/** Boundary for the existing IAM. No parallel IAM is created here. */
export async function revokeEmployeeAccess(input: { tenantId: string; employeeId: string; reason: string; actorUserId?: string | null }) {
  const employee = await prisma.employee.findFirst({ where: { id: input.employeeId, tenantId: input.tenantId }, select: { id: true, userTenantMembershipId: true } });
  if (!employee) throw new Error('کارمند پیدا نشد.');
  await prisma.employee.update({ where: { id: employee.id }, data: { isActive: false } });
  return { userAccount: employee.userTenantMembershipId ? 'MEMBERSHIP_PRESENT_IAM_ADAPTER_REQUIRED' : 'NO_USER_ACCOUNT', sessions: 'NOT_AVAILABLE', actorUserId: input.actorUserId ?? null };
}
