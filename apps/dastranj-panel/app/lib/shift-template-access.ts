import { getSessionContext } from './auth';
import { prisma } from './prisma';

export const SHIFT_TEMPLATE_MANAGE_ROLES = ['owner', 'admin', 'hr_manager'] as const;

export async function getShiftTemplateAccess() {
  const session = await getSessionContext();
  if (!session?.tenantId || !session.userId) return { canView: false, canManage: false, tenantId: null as string | null };
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: session.tenantId } },
    include: { roles: { include: { role: { select: { key: true } } } } },
  });
  const roleKeys = new Set<string>(membership?.role ? [membership.role.toLowerCase()] : []);
  membership?.roles.forEach((item) => item.role?.key && roleKeys.add(item.role.key.toLowerCase()));
  const canManage = [...roleKeys].some((key) => SHIFT_TEMPLATE_MANAGE_ROLES.includes(key as (typeof SHIFT_TEMPLATE_MANAGE_ROLES)[number]));
  return { canView: canManage, canManage, tenantId: session.tenantId };
}
