export type AssetClearanceResult = { status: 'AVAILABLE' | 'NOT_AVAILABLE' | 'CLEARED' | 'BLOCKED'; reason: string; openCount: number };

/** Integration boundary: the repository currently has no employee asset source of truth. */
export async function getEmployeeAssetClearance(_input: { tenantId: string; employeeId: string }): Promise<AssetClearanceResult> {
  return { status: 'NOT_AVAILABLE', reason: 'ماژول مدیریت دارایی در سامانه فعلی در دسترس نیست.', openCount: 0 };
}
