import { getSessionContext } from './auth';
import { prisma } from './prisma';

export const WORK_GROUP_PERMISSIONS = {
  view: 'work_groups.view',
  create: 'work_groups.create',
  edit: 'work_groups.edit',
  memberManage: 'work_groups.members.manage',
  policyChange: 'work_groups.policy.change',
  locationChange: 'work_groups.location.change',
  disable: 'work_groups.disable',
} as const;

export type WorkGroupOperation = keyof typeof WORK_GROUP_PERMISSIONS;

export async function getWorkGroupAccess() {
  const session = await getSessionContext();
  const denied = { tenantId: null as string | null, userId: null as string | null, actorRole: 'unknown', canView: false, canCreate: false, canEdit: false, canMemberManage: false, canPolicyChange: false, canLocationChange: false, canDisable: false };
  if (!session?.tenantId || !session.userId) return denied;
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: session.tenantId } },
    include: { roles: { include: { role: { include: { permissions: { select: { permissionKey: true } } } } } } },
  });
  if (!membership) return denied;
  const permissions = new Set(membership.roles.flatMap((item) => item.role.permissions.map((permission) => permission.permissionKey)));
  const roleKeys = membership.roles.map((item) => item.role.key);
  const has = (key: string) => permissions.has(key);
  const canCreate = has(WORK_GROUP_PERMISSIONS.create);
  const canEdit = has(WORK_GROUP_PERMISSIONS.edit);
  const canMemberManage = has(WORK_GROUP_PERMISSIONS.memberManage);
  const canPolicyChange = has(WORK_GROUP_PERMISSIONS.policyChange);
  const canLocationChange = has(WORK_GROUP_PERMISSIONS.locationChange);
  const canDisable = has(WORK_GROUP_PERMISSIONS.disable);
  return {
    tenantId: session.tenantId,
    userId: session.userId,
    actorRole: roleKeys[0] ?? membership.role ?? 'unknown',
    canView: has(WORK_GROUP_PERMISSIONS.view) || canCreate || canEdit || canMemberManage || canPolicyChange || canLocationChange || canDisable,
    canCreate,
    canEdit,
    canMemberManage,
    canPolicyChange,
    canLocationChange,
    canDisable,
  };
}

export async function requireWorkGroupAccess(operation: WorkGroupOperation) {
  const access = await getWorkGroupAccess();
  const allowed = operation === 'view' ? access.canView
    : operation === 'create' ? access.canCreate
      : operation === 'edit' ? access.canEdit
        : operation === 'memberManage' ? access.canMemberManage
          : operation === 'policyChange' ? access.canPolicyChange
            : operation === 'locationChange' ? access.canLocationChange
              : access.canDisable;
  if (!access.tenantId || !access.userId || !allowed) throw new Error('برای انجام این عملیات روی گروه کاری دسترسی کافی ندارید.');
  return { ...access, tenantId: access.tenantId, userId: access.userId };
}
