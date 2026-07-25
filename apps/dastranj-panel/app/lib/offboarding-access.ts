import { getSessionContext } from './auth';
import { prisma } from './prisma';

export const OFFBOARDING_PERMISSIONS = {
  createOwn: 'employee.offboarding.create-own', viewOwn: 'employee.offboarding.view-own',
  managerApprove: 'employee.offboarding.manager-approve', manage: 'employee.offboarding.manage',
  finance: 'employee.offboarding.finance', access: 'employee.offboarding.access',
  finalize: 'employee.offboarding.finalize', archive: 'employee.offboarding.archive',
} as const;

export async function getOffboardingAccess(employeeId: string) {
  const session = await getSessionContext();
  if (!session?.tenantId || !session.userId) return null;
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: session.tenantId } },
    include: { employee: { select: { id: true } }, roles: { include: { role: { include: { permissions: { select: { permissionKey: true } } } } } } },
  });
  if (!membership) return null;
  const target = await prisma.employee.findFirst({ where: { id: employeeId, tenantId: session.tenantId }, select: { organizationUnits: { select: { organizationUnit: { select: { managerId: true } } } } } });
  if (!target) return null;
  const roles = new Set([membership.role, ...membership.roles.map(({ role }) => role.key)].map((v) => v.toLowerCase()));
  const keys = new Set(membership.roles.flatMap(({ role }) => role.permissions.map(({ permissionKey }) => permissionKey)));
  const isAdmin = roles.has('owner') || roles.has('admin');
  const isHr = isAdmin || roles.has('hr') || roles.has('hr_manager') || roles.has('human_resources');
  const isFinance = isAdmin || roles.has('finance') || roles.has('finance_manager') || roles.has('financial') || roles.has('accountant');
  const isIt = isAdmin || roles.has('it') || roles.has('it_manager');
  const isSelf = membership.employee?.id === employeeId;
  const isManager = target.organizationUnits.some(({ organizationUnit }) => organizationUnit.managerId === membership.employee?.id);
  const has = (key: string) => isAdmin || keys.has(key);
  return {
    tenantId: session.tenantId, userId: session.userId, actorRole: [...roles][0] ?? 'member', isSelf, isManager,
    canView: isSelf || isManager || isHr || isFinance || isIt || has(OFFBOARDING_PERMISSIONS.viewOwn),
    canCreate: isSelf || isHr || has(OFFBOARDING_PERMISSIONS.createOwn) || has(OFFBOARDING_PERMISSIONS.manage),
    canSubmit: isSelf || isHr || has(OFFBOARDING_PERMISSIONS.manage),
    canManagerApprove: isManager || has(OFFBOARDING_PERMISSIONS.managerApprove),
    canHrApprove: isHr || has(OFFBOARDING_PERMISSIONS.manage),
    canFinance: isFinance || has(OFFBOARDING_PERMISSIONS.finance),
    canAccess: isIt || has(OFFBOARDING_PERMISSIONS.access),
    canFinalize: isHr || has(OFFBOARDING_PERMISSIONS.finalize),
    canArchive: isHr || has(OFFBOARDING_PERMISSIONS.archive),
    canRestore: isHr,
  };
}

export async function requireOffboardingAccess(employeeId: string, capability: Exclude<keyof NonNullable<Awaited<ReturnType<typeof getOffboardingAccess>>>, 'tenantId'|'userId'|'actorRole'|'isSelf'|'isManager'>) {
  const access = await getOffboardingAccess(employeeId);
  if (!access || !access[capability]) throw new Error('برای انجام این عملیات خاتمه همکاری دسترسی کافی ندارید.');
  return access;
}
