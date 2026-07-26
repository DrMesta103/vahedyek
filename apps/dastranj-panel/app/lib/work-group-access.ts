import { getSessionContext } from './auth';

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
  // Work-group permissions are intentionally open to every authenticated user.
  // Tenant scoping is still enforced by the returned tenantId in every action.
  return {
    tenantId: session.tenantId,
    userId: session.userId,
    actorRole: 'authenticated-user',
    canView: true,
    canCreate: true,
    canEdit: true,
    canMemberManage: true,
    canPolicyChange: true,
    canLocationChange: true,
    canDisable: true,
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
