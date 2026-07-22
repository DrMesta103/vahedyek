import { getSessionContext } from './auth';
import { prisma } from './prisma';

export const COMPENSATION_PERMISSIONS = {
  view: 'employee.compensation.view',
  manageFinancial: 'employee.compensation.financial.manage',
  approveFinancial: 'employee.compensation.financial.approve',
  manageDamage: 'employee.compensation.damage.manage',
  reviewObjection: 'employee.compensation.objection.review',
  finance: 'employee.compensation.finance',
  export: 'employee.compensation.export',
} as const;

export async function getEmployeeCompensationAccess(employeeId: string) {
  const session = await getSessionContext();
  const denied = { tenantId: null, userId: null, canView: false, canViewAmounts: false, canManageFinancial: false, canApproveFinancial: false, canManageDamage: false, canCreateObjection: false, canReviewObjection: false, canFinance: false, canExport: false, isSelf: false, isManager: false };
  if (!session?.tenantId || !session.userId) return denied;
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: session.tenantId } },
    include: { roles: { include: { role: { include: { permissions: { select: { permissionKey: true } } } } } }, employee: { select: { id: true } } },
  });
  const employee = await prisma.employee.findFirst({ where: { id: employeeId, tenantId: session.tenantId }, select: { organizationUnits: { select: { organizationUnit: { select: { managerId: true } } } } } });
  if (!membership || !employee) return denied;
  const roles = new Set([membership.role, ...membership.roles.map(({ role }) => role.key)].map((key) => key.toLowerCase()));
  const keys = new Set(membership.roles.flatMap(({ role }) => role.permissions.map(({ permissionKey }) => permissionKey)));
  const isSelf = membership.employee?.id === employeeId;
  const isManager = employee.organizationUnits.some(({ organizationUnit }) => organizationUnit.managerId === membership.employee?.id);
  const isAdmin = ['owner', 'admin'].some((role) => roles.has(role));
  const isHr = isAdmin || ['hr', 'hr_manager', 'human_resources'].some((role) => roles.has(role));
  const isFinance = isAdmin || ['finance', 'finance_manager', 'accountant'].some((role) => roles.has(role));
  const has = (key: string) => isAdmin || keys.has(key);
  const canManageFinancial = isHr || has(COMPENSATION_PERMISSIONS.manageFinancial);
  const canApproveFinancial = isHr || has(COMPENSATION_PERMISSIONS.approveFinancial);
  const canManageDamage = isHr || has(COMPENSATION_PERMISSIONS.manageDamage);
  const canReviewObjection = isHr || has(COMPENSATION_PERMISSIONS.reviewObjection);
  const canFinance = isFinance || has(COMPENSATION_PERMISSIONS.finance);
  const canExport = isFinance || has(COMPENSATION_PERMISSIONS.export);
  const canViewAmounts = isSelf || isHr || isFinance || has(COMPENSATION_PERMISSIONS.view);
  return { tenantId: session.tenantId, userId: session.userId, canView: canViewAmounts || isManager, canViewAmounts, canManageFinancial, canApproveFinancial, canManageDamage, canCreateObjection: isSelf, canReviewObjection, canFinance, canExport, isSelf, isManager };
}

