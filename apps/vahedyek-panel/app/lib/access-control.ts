import { NextResponse } from 'next/server';
import { currentAppConfig } from '../config/current';
import { requireSessionContext } from './auth';
import { prisma } from './prisma';
import {
  filterMenuByPermissions,
  getAllPermissionKeys,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  type AccessSnapshot,
} from './permissions';

export { filterMenuByPermissions, hasAllPermissions, hasAnyPermission, hasPermission };

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

export const APP_PERMISSION_ITEMS = currentAppConfig.permissions;
export const MENU_PERMISSION_ITEMS = currentAppConfig.menuItems.map((item) => ({
  id: item.id,
  label: item.label,
  icon: item.icon,
  href: item.href,
  disabled: Boolean(item.disabled),
  toolbarOnly: Boolean(item.toolbarOnly),
  requiredPermission: item.requiredPermission,
}));

const LEGACY_MENU_PERMISSION_MAP: Record<string, string> = {
  business: 'business.profile.view',
  complex: 'complex.view',
  contracts: 'contracts.view',
  settings: 'platform.settings.view',
  employees: 'platform.users.view',
  reports: 'platform.reports.view',
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function toAllowedMenuItemIds(access: Pick<AccessSnapshot, 'isOwner' | 'permissionKeys'>) {
  return filterMenuByPermissions(currentAppConfig.menuItems, access).map((item) => item.id);
}

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
    try {
      await Promise.all(
        getAllPermissionKeys().map((permissionKey) =>
          prisma.tenantRolePermission.upsert({
            where: { roleId_permissionKey: { roleId: ownerRole.id, permissionKey } },
            update: {},
            create: { roleId: ownerRole.id, permissionKey },
          }),
        ),
      );
    } catch (error) {
      console.error('Action permission table is not ready. Owner access will use config fallback until migration runs.', error);
    }
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

export async function ensureMembershipRoleByKey(membershipId: string, tenantId: string, roleKey: string) {
  await ensureTenantDefaultRoles(tenantId);

  const role = await prisma.tenantRole.findUnique({
    where: { tenantId_key: { tenantId, key: roleKey } },
  });

  if (!role) return;

  await prisma.userTenantMembershipRole.upsert({
    where: { membershipId_roleId: { membershipId, roleId: role.id } },
    update: {},
    create: { membershipId, roleId: role.id },
  });
}

export async function ensureEmployeeMembershipRoles(tenantId: string) {
  await ensureTenantDefaultRoles(tenantId);

  const employeeRole = await prisma.tenantRole.findUnique({
    where: { tenantId_key: { tenantId, key: 'employee' } },
  });

  if (!employeeRole) return;

  const employees = await prisma.employee.findMany({
    where: { tenantId, isActive: true },
    select: { id: true },
  });

  if (!employees.length) return;

  const employeeUserIds = employees.map((employee) => employee.id);
  const users = await prisma.appUser.findMany({
    where: { id: { in: employeeUserIds } },
    select: { id: true },
  });

  if (!users.length) return;

  await Promise.all(
    users.map((user) =>
      prisma.userTenantMembership.upsert({
        where: {
          userId_tenantId: {
            userId: user.id,
            tenantId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          tenantId,
          role: 'member',
        },
      }),
    ),
  );

  const memberships = await prisma.userTenantMembership.findMany({
    where: {
      tenantId,
      userId: { in: users.map((user) => user.id) },
    },
    select: { id: true },
  });

  if (!memberships.length) return;

  await prisma.userTenantMembershipRole.createMany({
    data: memberships.map((membership) => ({ membershipId: membership.id, roleId: employeeRole.id })),
    skipDuplicates: true,
  });
}

async function getMembershipWithPermissions(userId: string, tenantId: string) {
  return prisma.userTenantMembership.findUnique({
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
}

async function getMembershipWithLegacyPermissions(userId: string, tenantId: string) {
  return prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
    include: {
      roles: {
        include: {
          role: {
            include: { legacyMenuPermissions: true },
          },
        },
      },
    },
  });
}

async function buildOwnerRowFallbackAccess(userId: string, tenantId: string) {
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!membership || membership.role !== 'owner') return null;

  try {
    await ensureOwnerMembershipRole(membership.id, tenantId);
  } catch (error) {
    console.error('ensureOwnerMembershipRole failed; still treating user as tenant owner.', error);
  }

  const allKeys = getAllPermissionKeys();
  return {
    membership,
    isOwner: true,
    roleLabels: ['صاحب کسب‌وکار'],
    permissionKeys: allKeys,
    allowedMenuItemIds: toAllowedMenuItemIds({ isOwner: true, permissionKeys: allKeys }),
  };
}

export async function getMembershipAccess(userId: string, tenantId: string) {
  await ensureTenantDefaultRoles(tenantId);

  try {
    const membership = await getMembershipWithPermissions(userId, tenantId);
    if (!membership) {
      return buildOwnerRowFallbackAccess(userId, tenantId);
    }

    if (membership.role === 'owner') {
      try {
        await ensureOwnerMembershipRole(membership.id, tenantId);
      } catch (error) {
        console.error('ensureOwnerMembershipRole failed on primary RBAC path.', error);
      }
    }

    const isOwner =
      membership.role === 'owner' ||
      membership.roles.some((item) => item.role && item.role.key === 'business_owner');
    const roleLabels = membership.roles.map((item) => item.role?.label).filter(Boolean) as string[];
    const permissionKeys = isOwner
      ? getAllPermissionKeys()
      : unique(
          membership.roles.flatMap((item) =>
            (item.role?.permissions ?? []).map((permission) => permission.permissionKey),
          ),
        );
    const access = {
      isOwner,
      roleLabels,
      permissionKeys,
      allowedMenuItemIds: toAllowedMenuItemIds({ isOwner, permissionKeys }),
    };

    return {
      membership,
      ...access,
    };
  } catch (error) {
    console.error('Action permission lookup failed. Falling back to owner/legacy menu access.', error);
  }

  try {
    const membership = await getMembershipWithLegacyPermissions(userId, tenantId);
    if (!membership) {
      return buildOwnerRowFallbackAccess(userId, tenantId);
    }

    if (membership.role === 'owner') {
      try {
        await ensureOwnerMembershipRole(membership.id, tenantId);
      } catch (error) {
        console.error('ensureOwnerMembershipRole failed on legacy RBAC path.', error);
      }
    }

    const isOwner =
      membership.role === 'owner' ||
      membership.roles.some((item) => item.role && item.role.key === 'business_owner');
    const roleLabels = membership.roles.map((item) => item.role?.label).filter(Boolean) as string[];
    const permissionKeys = isOwner
      ? getAllPermissionKeys()
      : unique(
          membership.roles.flatMap((item) =>
            (item.role?.legacyMenuPermissions ?? [])
              .map((permission) => LEGACY_MENU_PERMISSION_MAP[permission.menuItemId])
              .filter((key): key is string => Boolean(key)),
          ),
        );

    return {
      membership,
      isOwner,
      roleLabels,
      permissionKeys,
      allowedMenuItemIds: toAllowedMenuItemIds({ isOwner, permissionKeys }),
    };
  } catch (error) {
    console.error('Legacy access lookup failed. Trying owner-row fallback.', error);
    const ownerFallback = await buildOwnerRowFallbackAccess(userId, tenantId);
    if (ownerFallback) return ownerFallback;
    return null;
  }
}

export async function requireBusinessOwner(userId: string, tenantId: string) {
  const access = await getMembershipAccess(userId, tenantId);
  return Boolean(access?.isOwner);
}

export async function requirePermission(permissionKey: string) {
  const session = await requireSessionContext();
  if (session instanceof NextResponse) return session;

  const access = await getMembershipAccess(session.userId, session.tenantId);
  if (!hasPermission(access, permissionKey)) {
    return NextResponse.json({ message: 'شما به این عملیات دسترسی ندارید.' }, { status: 403 });
  }

  return { session, access };
}

export async function requireAnyPermission(permissionKeys: string[]) {
  const session = await requireSessionContext();
  if (session instanceof NextResponse) return session;

  const access = await getMembershipAccess(session.userId, session.tenantId);
  if (!hasAnyPermission(access, permissionKeys)) {
    return NextResponse.json({ message: 'شما به این عملیات دسترسی ندارید.' }, { status: 403 });
  }

  return { session, access };
}
