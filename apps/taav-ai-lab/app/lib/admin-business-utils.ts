export type AdminBusinessUsageStatus = 'inactive' | 'active' | 'near_limit' | 'exceeded';

export function getAdminBusinessUsageStatus(
  isActive: boolean,
  usedTokens: number,
  tokenLimit: number,
): AdminBusinessUsageStatus {
  if (!isActive) return 'inactive';
  if (tokenLimit <= 0) return 'active';
  const ratio = usedTokens / tokenLimit;
  if (ratio >= 1) return 'exceeded';
  if (ratio >= 0.8) return 'near_limit';
  return 'active';
}

export function getUsagePercentage(usedTokens: number, tokenLimit: number) {
  if (tokenLimit <= 0) return 0;
  return Math.round(Math.max(0, Math.min(100, (usedTokens / tokenLimit) * 100)));
}

export function getRemainingTokens(usedTokens: number, tokenLimit: number) {
  if (tokenLimit <= 0) return 0;
  return Math.max(0, tokenLimit - usedTokens);
}

export const ADMIN_BUSINESS_STATUS_LABELS: Record<AdminBusinessUsageStatus, string> = {
  active: 'فعال',
  near_limit: 'نزدیک به سقف',
  exceeded: 'سقف مصرف شده',
  inactive: 'غیرفعال',
};

export function formatOwnerDisplayName(input: {
  ownerFirstName?: string | null;
  ownerLastName?: string | null;
  ownerFullName?: string | null;
}) {
  const fromParts = [input.ownerFirstName, input.ownerLastName].filter(Boolean).join(' ').trim();
  if (fromParts) return fromParts;
  if (input.ownerFullName?.trim()) return input.ownerFullName.trim();
  return 'نامشخص';
}

export function formatOwnerContact(input: { ownerEmail?: string | null; ownerMobile?: string | null }) {
  return input.ownerEmail?.trim() || input.ownerMobile?.trim() || null;
}
