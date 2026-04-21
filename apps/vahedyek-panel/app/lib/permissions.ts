import { currentAppConfig, type AppMenuItem } from '../config/current';

export type AccessSnapshot = {
  isOwner: boolean;
  roleLabels: string[];
  permissionKeys: string[];
  allowedMenuItemIds: string[];
};

const ALL_PERMISSION_KEYS = currentAppConfig.permissions.map((permission) => permission.key);

export function getAllPermissionKeys() {
  return ALL_PERMISSION_KEYS;
}

export function hasPermission(access: Pick<AccessSnapshot, 'isOwner' | 'permissionKeys'> | null | undefined, permissionKey: string) {
  if (!access) return false;
  return access.isOwner || access.permissionKeys.includes(permissionKey);
}

export function hasAnyPermission(
  access: Pick<AccessSnapshot, 'isOwner' | 'permissionKeys'> | null | undefined,
  permissionKeys: string[],
) {
  if (!access) return false;
  if (access.isOwner) return true;
  return permissionKeys.some((permissionKey) => access.permissionKeys.includes(permissionKey));
}

export function hasAllPermissions(
  access: Pick<AccessSnapshot, 'isOwner' | 'permissionKeys'> | null | undefined,
  permissionKeys: string[],
) {
  if (!access) return false;
  if (access.isOwner) return true;
  return permissionKeys.every((permissionKey) => access.permissionKeys.includes(permissionKey));
}

export function filterMenuByPermissions<T extends AppMenuItem>(
  menuItems: T[],
  access: Pick<AccessSnapshot, 'isOwner' | 'permissionKeys'> | null | undefined,
) {
  return menuItems.filter((item) => !item.requiredPermission || hasPermission(access, item.requiredPermission));
}
