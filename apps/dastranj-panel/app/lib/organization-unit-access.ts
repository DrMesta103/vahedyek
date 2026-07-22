import { getSessionContext } from './auth';
import { prisma } from './prisma';

export const ORGANIZATION_UNIT_PERMISSIONS = {
  view: 'organization_units.view',
  create: 'organization_units.create',
  update: 'organization_units.update',
  delete: 'organization_units.delete',
} as const;

export const POSITION_PERMISSIONS = {
  view: 'positions.view',
  create: 'positions.create',
  update: 'positions.update',
  archive: 'positions.archive',
  viewAssignments: 'positions.view_assignments',
} as const;

export const EMPLOYEE_PERMISSIONS = {
  view: 'employees.view',
  update: 'employees.update',
  disable: 'employees.disable',
  sensitiveView: 'employees.sensitive.view',
  sensitiveUpdate: 'employees.sensitive.update',
  identityPhotoView: 'employees.identity-photo.view',
  identityPhotoUpdate: 'employees.identity-photo.update',
  bankView: 'employees.bank.view',
  bankUpdate: 'employees.bank.update',
  healthView: 'employees.health.view',
  healthUpdate: 'employees.health.update',
  historyView: 'employees.history.view',
} as const;

const MANAGE_ROLES = new Set(['owner', 'admin', 'hr_manager']);
const SENSITIVE_MANAGE_ROLES = new Set(['owner', 'admin']);

export async function getOrganizationUnitAccess() {
  const session = await getSessionContext();
  if (!session?.tenantId || !session.userId) {
    return { tenantId: null, canView: false, canCreate: false, canUpdate: false, canDelete: false };
  }
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: session.tenantId } },
    include: { roles: { include: { role: { include: { permissions: { select: { permissionKey: true } } } } } } },
  });
  const roles = new Set(
    [membership?.role?.toLowerCase(), ...(membership?.roles.map((item) => item.role.key.toLowerCase()) ?? [])].filter(Boolean),
  );
  const permissions = new Set(
    membership?.roles.flatMap((item) => item.role.permissions.map((permission) => permission.permissionKey)) ?? [],
  );
  const managesByRole = [...roles].some((role) => MANAGE_ROLES.has(role as string));
  const has = (key: string) => managesByRole || permissions.has(key);
  const canCreate = has(ORGANIZATION_UNIT_PERMISSIONS.create);
  const canUpdate = has(ORGANIZATION_UNIT_PERMISSIONS.update);
  const canDelete = has(ORGANIZATION_UNIT_PERMISSIONS.delete);
  return {
    tenantId: session.tenantId,
    canView: has(ORGANIZATION_UNIT_PERMISSIONS.view) || canCreate || canUpdate || canDelete,
    canCreate,
    canUpdate,
    canDelete,
  };
}

export async function requireOrganizationUnitAccess(permission: 'view' | 'create' | 'update' | 'delete') {
  const access = await getOrganizationUnitAccess();
  const allowed = permission === 'view'
    ? access.canView
    : permission === 'create'
      ? access.canCreate
      : permission === 'update'
        ? access.canUpdate
        : access.canDelete;
  if (!access.tenantId || !allowed) {
    throw new Error('برای انجام این عملیات روی ساختار سازمانی دسترسی کافی ندارید.');
  }
  return { tenantId: access.tenantId, access };
}

export async function getPositionAccess() {
  const session = await getSessionContext();
  if (!session?.tenantId || !session.userId) return { tenantId: null, canView: false, canCreate: false, canUpdate: false, canArchive: false, canViewAssignments: false };
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: session.tenantId } },
    include: { roles: { include: { role: { include: { permissions: { select: { permissionKey: true } } } } } } },
  });
  const roles = new Set([membership?.role?.toLowerCase(), ...(membership?.roles.map((item) => item.role.key.toLowerCase()) ?? [])].filter(Boolean));
  const permissions = new Set(membership?.roles.flatMap((item) => item.role.permissions.map((permission) => permission.permissionKey)) ?? []);
  const managesByRole = [...roles].some((role) => MANAGE_ROLES.has(role as string));
  const has = (key: string) => managesByRole || permissions.has(key);
  return {
    tenantId: session.tenantId,
    canView: has(POSITION_PERMISSIONS.view),
    canCreate: has(POSITION_PERMISSIONS.create),
    canUpdate: has(POSITION_PERMISSIONS.update),
    canArchive: has(POSITION_PERMISSIONS.archive),
    canViewAssignments: has(POSITION_PERMISSIONS.viewAssignments),
  };
}

export async function requirePositionAccess(permission: 'view' | 'create' | 'update' | 'archive' | 'viewAssignments') {
  const access = await getPositionAccess();
  const allowed = permission === 'view' ? access.canView : permission === 'create' ? access.canCreate : permission === 'update' ? access.canUpdate : permission === 'archive' ? access.canArchive : access.canViewAssignments;
  if (!access.tenantId || !allowed) throw new Error('برای انجام این عملیات روی سمت‌های سازمانی دسترسی کافی ندارید.');
  return { tenantId: access.tenantId, access };
}

export async function getEmployeeAccess() {
  const session = await getSessionContext();
  if (!session?.tenantId || !session.userId) {
    return {
      tenantId: null,
      canView: false,
      canUpdate: false,
      canDisable: false,
      canSensitiveView: false,
      canSensitiveUpdate: false,
      canIdentityPhotoView: false,
      canIdentityPhotoUpdate: false,
      canBankView: false,
      canBankUpdate: false,
      canHealthView: false,
      canHealthUpdate: false,
      canHistoryView: false,
    };
  }
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: session.tenantId } },
    include: { roles: { include: { role: { include: { permissions: { select: { permissionKey: true } } } } } } },
  });
  const roles = new Set(
    [membership?.role?.toLowerCase(), ...(membership?.roles.map((item) => item.role.key.toLowerCase()) ?? [])].filter(Boolean),
  );
  const permissions = new Set(
    membership?.roles.flatMap((item) => item.role.permissions.map((permission) => permission.permissionKey)) ?? [],
  );
  const managesByRole = [...roles].some((role) => MANAGE_ROLES.has(role as string));
  const managesSensitiveByRole = [...roles].some((role) => SENSITIVE_MANAGE_ROLES.has(role as string));
  const has = (key: string) => managesByRole || permissions.has(key);
  const hasSensitive = (key: string) => managesSensitiveByRole || permissions.has(key);
  return {
    tenantId: session.tenantId,
    canView: has(EMPLOYEE_PERMISSIONS.view) || has(EMPLOYEE_PERMISSIONS.update) || has(EMPLOYEE_PERMISSIONS.disable),
    canUpdate: has(EMPLOYEE_PERMISSIONS.update),
    canDisable: has(EMPLOYEE_PERMISSIONS.disable),
    canSensitiveView: hasSensitive(EMPLOYEE_PERMISSIONS.sensitiveView),
    canSensitiveUpdate: hasSensitive(EMPLOYEE_PERMISSIONS.sensitiveUpdate),
    canIdentityPhotoView: hasSensitive(EMPLOYEE_PERMISSIONS.identityPhotoView) || hasSensitive(EMPLOYEE_PERMISSIONS.sensitiveView),
    canIdentityPhotoUpdate: hasSensitive(EMPLOYEE_PERMISSIONS.identityPhotoUpdate) || hasSensitive(EMPLOYEE_PERMISSIONS.sensitiveUpdate),
    canBankView: hasSensitive(EMPLOYEE_PERMISSIONS.bankView) || hasSensitive(EMPLOYEE_PERMISSIONS.sensitiveView),
    canBankUpdate: hasSensitive(EMPLOYEE_PERMISSIONS.bankUpdate) || hasSensitive(EMPLOYEE_PERMISSIONS.sensitiveUpdate),
    canHealthView: hasSensitive(EMPLOYEE_PERMISSIONS.healthView),
    canHealthUpdate: hasSensitive(EMPLOYEE_PERMISSIONS.healthUpdate),
    canHistoryView: hasSensitive(EMPLOYEE_PERMISSIONS.historyView),
  };
}

export async function requireEmployeeAccess(permission: 'view' | 'update' | 'disable' | 'sensitiveView' | 'sensitiveUpdate' | 'identityPhotoView' | 'identityPhotoUpdate' | 'bankView' | 'bankUpdate' | 'healthView' | 'healthUpdate' | 'historyView') {
  const access = await getEmployeeAccess();
  const allowed = permission === 'view' ? access.canView
    : permission === 'update' ? access.canUpdate
      : permission === 'disable' ? access.canDisable
        : permission === 'sensitiveView' ? access.canSensitiveView
          : permission === 'sensitiveUpdate' ? access.canSensitiveUpdate
            : permission === 'identityPhotoView' ? access.canIdentityPhotoView
              : permission === 'identityPhotoUpdate' ? access.canIdentityPhotoUpdate
                : permission === 'bankView' ? access.canBankView
                  : permission === 'bankUpdate' ? access.canBankUpdate
                    : permission === 'healthView' ? access.canHealthView
                      : permission === 'healthUpdate' ? access.canHealthUpdate
                        : access.canHistoryView;
  if (!access.tenantId || !allowed) throw new Error('برای انجام این عملیات روی کارمند دسترسی کافی ندارید.');
  return access;
}
