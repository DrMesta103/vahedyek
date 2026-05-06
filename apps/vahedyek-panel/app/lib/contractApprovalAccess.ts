import { hasPermission, type AccessSnapshot } from './permissions';

/** هم‌تراز با مسیرهای کاربری در تنظیمات فرایند تأیید */
export const APPROVAL_USAGE_KEYS = ['residential', 'commercial', 'office', 'parking', 'storage'] as const;
export type ApprovalUsageKey = (typeof APPROVAL_USAGE_KEYS)[number];

export type TenantApprovalStage = {
  id: string;
  title: string;
  role: 'controller' | 'intermediate' | 'final';
  employeeId: string;
};

export type TenantApprovalUsageBlock = {
  buyerShouldApprove: boolean;
  stages: TenantApprovalStage[];
};

export type TenantApprovalProcessConfig = Partial<Record<ApprovalUsageKey, TenantApprovalUsageBlock>>;

export function normalizeApprovalUsageKey(unitUsage: string | null | undefined): ApprovalUsageKey | null {
  const u = (unitUsage ?? '').trim();
  if (!u) return null;
  return (APPROVAL_USAGE_KEYS as readonly string[]).includes(u) ? (u as ApprovalUsageKey) : null;
}

/**
 * تأیید/عدم تأیید در بنر جزئیات: مالک tenant همیشه؛ همچنین کاربرانی که به‌عنوان کارمند (همان شناسهٔ کاربر در Employee.id) در مراحل فرایند ثبت شده‌اند.
 * کاربری غیرمجاز برای نوع واحد یا بدون مسیر تأیید → فقط مالک.
 */
export function userCanDecideApprovalOnContract(params: {
  userId: string;
  access: Pick<AccessSnapshot, 'isOwner'> | null | undefined;
  unitUsage: string | null | undefined;
  approvalProcessConfig: unknown;
}): boolean {
  if (params.access?.isOwner) return true;

  const usageKey = normalizeApprovalUsageKey(params.unitUsage);
  if (!usageKey) return false;

  const cfg = params.approvalProcessConfig as TenantApprovalProcessConfig | null | undefined;
  const stages = cfg?.[usageKey]?.stages ?? [];
  if (!Array.isArray(stages) || stages.length === 0) return false;

  return stages.some((s) => s && typeof s.employeeId === 'string' && s.employeeId === params.userId);
}

/** پاک‌کردن پرچم «بازگشت از تأیید» پیش از رسیدن دوباره به این گام؛ مالک، ویراستار قرارداد، یا همان تأییدکنندگان مسیر. */
export function userCanClearApprovalReturnPending(
  access: Pick<AccessSnapshot, 'isOwner' | 'permissionKeys'> | null | undefined,
  params: { userId: string; unitUsage: string | null | undefined; approvalProcessConfig: unknown },
): boolean {
  if (!access) return false;
  if (access.isOwner) return true;
  if (hasPermission(access, 'contracts.update')) return true;
  return userCanDecideApprovalOnContract({
    userId: params.userId,
    access,
    unitUsage: params.unitUsage,
    approvalProcessConfig: params.approvalProcessConfig,
  });
}
