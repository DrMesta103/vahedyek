import { NextResponse } from 'next/server';
import { currentAppConfig } from '../config/current';
import { requireSessionContext } from './auth';
import { getEmployeeUserId } from './employeeIdentity';
import { prisma } from './prisma';
import { PartySide } from './prisma-client';
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
const HIDDEN_MENU_ITEM_IDS = new Set(['complex']);

function isVisibleMenuItem(item: { id: string }) {
  return !HIDDEN_MENU_ITEM_IDS.has(item.id);
}

export const MENU_PERMISSION_ITEMS = currentAppConfig.menuItems.filter(isVisibleMenuItem).map((item) => ({
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
  customers: 'customers.view',
  settings: 'platform.settings.view',
  employees: 'platform.users.view',
  reports: 'platform.reports.view',
};

const DEFAULT_ROLE_PERMISSION_KEYS: Record<string, string[]> = {
  customer: ['customers.view'],
};

const CUSTOMER_CONTRACTS_MENU_ID = 'customer-contracts';
const BUSINESS_PROFILE_TABLE_NAME = '"TenantBusinessProfileSettings"';

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function toAllowedMenuItemIds(access: Pick<AccessSnapshot, 'isOwner' | 'permissionKeys'>) {
  return filterMenuByPermissions(currentAppConfig.menuItems.filter(isVisibleMenuItem), access).map((item) => item.id);
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizePhone(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/[^\d]/g, '') : '';
}

function collectBuyerIdsForUser(profilePayload: unknown, user: { email: string | null; mobile: string | null }) {
  const payload = profilePayload && typeof profilePayload === 'object' ? (profilePayload as Record<string, unknown>) : {};
  const targetEmail = normalizeText(user.email);
  const targetPhone = normalizePhone(user.mobile);
  const matchesUser = (record: Record<string, unknown>) => {
    const email = normalizeText(record.email);
    const phones = [record.mobile, record.secondaryMobile, record.contactNumber].map(normalizePhone);
    return Boolean((targetEmail && email && targetEmail === email) || (targetPhone && phones.includes(targetPhone)));
  };

  const buyerIds: string[] = [];

  for (const item of Array.isArray(payload.naturalBuyers) ? payload.naturalBuyers : []) {
    if (item && typeof item === 'object' && matchesUser(item as Record<string, unknown>)) {
      buyerIds.push(String((item as { id?: unknown }).id ?? ''));
    }
  }

  for (const item of Array.isArray(payload.legalBuyers) ? payload.legalBuyers : []) {
    if (!item || typeof item !== 'object') continue;
    const buyer = item as Record<string, unknown>;
    const representatives = Array.isArray(buyer.representatives) ? buyer.representatives : [];
    if (representatives.some((rep) => rep && typeof rep === 'object' && matchesUser(rep as Record<string, unknown>))) {
      buyerIds.push(String((buyer as { id?: unknown }).id ?? ''));
    }
  }

  return unique(buyerIds);
}

async function getBuyerIdsForUserProfile(tenantId: string, user: { email: string | null; mobile: string | null }) {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ profilePayload: unknown }>>(
      `SELECT "profilePayload" FROM ${BUSINESS_PROFILE_TABLE_NAME} WHERE "tenantId" = $1 LIMIT 1`,
      tenantId,
    );

    return collectBuyerIdsForUser(rows[0]?.profilePayload, user);
  } catch {
    return [];
  }
}

async function hasPartyTwoContract(userId: string, tenantId: string) {
  const user = await prisma.appUser.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true, mobile: true },
  });

  if (!user) return false;

  const profileBuyerIds = await getBuyerIdsForUserProfile(tenantId, user);
  const partyIds = unique([user.id, ...profileBuyerIds]);
  const partyNames = unique([user.fullName.trim()]);
  const partyConditions = [
    ...partyIds.flatMap((id) => [{ personId: id }, { directoryId: id }]),
    ...partyNames.map((name) => ({ name })),
  ];

  if (!partyConditions.length) return false;

  const count = await prisma.contractDraft.count({
    where: {
      tenantId,
      parties: {
        members: {
          some: {
            side: PartySide.party_two,
            OR: partyConditions,
          },
        },
      },
    },
  });

  return count > 0;
}

async function applyContextualMenuAccess(userId: string, tenantId: string, allowedMenuItemIds: string[]) {
  const canSeeCustomerContracts = await hasPartyTwoContract(userId, tenantId);
  if (canSeeCustomerContracts) return unique([...allowedMenuItemIds, CUSTOMER_CONTRACTS_MENU_ID]);

  return allowedMenuItemIds.filter((id) => id !== CUSTOMER_CONTRACTS_MENU_ID);
}

export async function ensureTenantDefaultRoles(tenantId: string) {
  const roles = [] as Awaited<ReturnType<typeof prisma.tenantRole.upsert>>[];
  for (const role of DEFAULT_TENANT_ROLES) {
    roles.push(
      await prisma.tenantRole.upsert({
        where: { tenantId_key: { tenantId, key: role.key } },
        update: { label: role.label, system: true },
        create: { tenantId, key: role.key, label: role.label, system: true },
      }),
    );
  }

  const ownerRole = roles.find((role) => role.key === 'business_owner');
  if (ownerRole) {
    try {
      await prisma.tenantRolePermission.createMany({
        data: getAllPermissionKeys().map((permissionKey) => ({
          roleId: ownerRole.id,
          permissionKey,
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      console.error('Action permission table is not ready. Owner access will use config fallback until migration runs.', error);
    }
  }

  await Promise.all(
    roles.flatMap((role) =>
      (DEFAULT_ROLE_PERMISSION_KEYS[role.key] ?? []).map((permissionKey) =>
        prisma.tenantRolePermission.upsert({
          where: { roleId_permissionKey: { roleId: role.id, permissionKey } },
          update: {},
          create: { roleId: role.id, permissionKey },
        }),
      ),
    ),
  );

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

  const employeeUserIds = employees.map((employee) => getEmployeeUserId(employee.id, tenantId));
  const users = await prisma.appUser.findMany({
    where: { id: { in: employeeUserIds } },
    select: { id: true },
  });

  if (!users.length) return;

  await prisma.userTenantMembership.createMany({
    data: users.map((user) => ({
      userId: user.id,
      tenantId,
      role: 'member',
    })),
    skipDuplicates: true,
  });

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
  const allowedMenuItemIds = await applyContextualMenuAccess(
    userId,
    tenantId,
    toAllowedMenuItemIds({ isOwner: true, permissionKeys: allKeys }),
  );
  return {
    membership,
    isOwner: true,
    roleLabels: ['صاحب کسب‌وکار'],
    permissionKeys: allKeys,
    allowedMenuItemIds,
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
      allowedMenuItemIds: await applyContextualMenuAccess(
        userId,
        tenantId,
        toAllowedMenuItemIds({ isOwner, permissionKeys }),
      ),
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
      allowedMenuItemIds: await applyContextualMenuAccess(
        userId,
        tenantId,
        toAllowedMenuItemIds({ isOwner, permissionKeys }),
      ),
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
