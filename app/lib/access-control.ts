import { prisma } from './prisma';
import { APP_MENU_ITEMS } from './navigation';

export const DEFAULT_TENANT_ROLES = [
  { key: 'business_owner', label: 'صاحب کسب و کار' },
  { key: 'representative', label: 'نماینده' },
  { key: 'investor', label: 'سرمایه گذار' },
  { key: 'customer', label: 'مشتری' },
  { key: 'employee', label: 'کارمند' },
  { key: 'shareholder', label: 'سهام دار' },
  { key: 'buyer', label: 'خریدار' },
  { key: 'partner_representative', label: 'نماینده شریک' },
  { key: 'legal_shareholder_representative', label: 'نماینده سهام دار حقوقی' },
] as const;

export const MENU_PERMISSION_ITEMS = APP_MENU_ITEMS.map((item) => ({
  id: item.id,
  label: item.label,
  icon: item.icon,
  href: item.href,
  disabled: Boolean(item.disabled),
}));

export async function ensureTenantDefaultRoles(tenantId: string) {
  const roles = await Promise.all(
    DEFAULT_TENANT_ROLES.map((role) =>
      prisma.tenantRole.upsert({
        where: { tenantId_key: { tenantId, key: role.key } },
        update: { label: role.label, system: true },
        create: { tenantId, key: role.key, label: role.label, system: true },
      }),
    ),
  );

  const ownerRole = roles.find((role) => role.key === 'business_owner');
  if (ownerRole) {
    await Promise.all(
      MENU_PERMISSION_ITEMS.map((item) =>
        prisma.tenantRoleMenuPermission.upsert({
          where: { roleId_menuItemId: { roleId: ownerRole.id, menuItemId: item.id } },
          update: {},
          create: { roleId: ownerRole.id, menuItemId: item.id },
        }),
      ),
    );
  }

  return roles;
}

export async function ensureOwnerMembershipRole(membershipId: string, tenantId: string) {
  const ownerRole = await prisma.tenantRole.findUnique({
    where: { tenantId_key: { tenantId, key: 'business_owner' } },
  });

  if (!ownerRole) return;

  await prisma.userTenantMembershipRole.upsert({
    where: { membershipId_roleId: { membershipId, roleId: ownerRole.id } },
    update: {},
    create: { membershipId, roleId: ownerRole.id },
  });
}

export async function getMembershipAccess(userId: string, tenantId: string) {
  await ensureTenantDefaultRoles(tenantId);

  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
    include: {
      roles: {
        include: {
          role: {
            include: { permissions: true },
          },
        },
      },
    },
  });

  if (!membership) return null;

  const isOwner = membership.role === 'owner' || membership.roles.some((item) => item.role.key === 'business_owner');

  if (membership.role === 'owner') {
    await ensureOwnerMembershipRole(membership.id, tenantId);
  }

  const roleLabels = membership.roles.map((item) => item.role.label);
  const allowedMenuItemIds = isOwner
    ? MENU_PERMISSION_ITEMS.map((item) => item.id)
    : Array.from(new Set(membership.roles.flatMap((item) => item.role.permissions.map((permission) => permission.menuItemId))));

  return {
    membership,
    isOwner,
    roleLabels,
    allowedMenuItemIds,
  };
}

export async function requireBusinessOwner(userId: string, tenantId: string) {
  const access = await getMembershipAccess(userId, tenantId);
  return Boolean(access?.isOwner);
}
