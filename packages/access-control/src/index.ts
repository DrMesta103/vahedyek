export type PermissionAccess = {
  isOwner: boolean;
  permissionKeys: string[];
};

export function hasPermission(access: PermissionAccess | null | undefined, permissionKey: string) {
  if (!access) return false;
  return access.isOwner || access.permissionKeys.includes(permissionKey);
}
