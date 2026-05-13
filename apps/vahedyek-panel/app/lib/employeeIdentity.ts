export function buildTenantEmployeeId(tenantId: string, userId: string) {
  return `${tenantId}:${userId}`;
}

export function getEmployeeUserId(employeeId: string, tenantId: string) {
  const prefix = `${tenantId}:`;
  return employeeId.startsWith(prefix) ? employeeId.slice(prefix.length) : employeeId;
}

export function getEmployeeIdsForUser(tenantId: string, userId: string) {
  return [userId, buildTenantEmployeeId(tenantId, userId)];
}
