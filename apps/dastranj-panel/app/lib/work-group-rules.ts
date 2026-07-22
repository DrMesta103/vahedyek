export const WORK_GROUP_TITLE_MAX_LENGTH = 120;

export function normalizeWorkGroupTitle(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fa-IR');
}

export function validateWorkGroupTitle(value: string) {
  const title = value.trim().replace(/\s+/g, ' ');
  if (!title) throw new Error('عنوان گروه کاری الزامی است.');
  if (title.length > WORK_GROUP_TITLE_MAX_LENGTH) throw new Error(`عنوان گروه کاری نباید بیشتر از ${WORK_GROUP_TITLE_MAX_LENGTH} کاراکتر باشد.`);
  return { title, normalizedTitle: normalizeWorkGroupTitle(title) };
}

export function validateMembershipDates(joinedAt: Date, leftAt?: Date | null) {
  if (Number.isNaN(joinedAt.getTime())) throw new Error('تاریخ اثرگذاری عضویت معتبر نیست.');
  if (leftAt && (Number.isNaN(leftAt.getTime()) || leftAt < joinedAt)) throw new Error('تاریخ پایان عضویت نمی‌تواند قبل از تاریخ شروع باشد.');
}

export function planMembershipTransfer(input: { currentMembershipId?: string | null; employeeId: string; nextWorkGroupId: string; effectiveDate: Date; reason: string }) {
  validateMembershipDates(input.effectiveDate);
  if (!input.reason.trim()) throw new Error('دلیل انتقال الزامی است.');
  return {
    endCurrent: input.currentMembershipId ? { id: input.currentMembershipId, leftAt: input.effectiveDate, status: 'ENDED' as const } : null,
    createNext: { employeeId: input.employeeId, workGroupId: input.nextWorkGroupId, joinedAt: input.effectiveDate, effectiveDate: input.effectiveDate, status: input.effectiveDate > new Date() ? 'FUTURE' as const : 'ACTIVE' as const },
  };
}

export function shouldApplyContextChangeNow(effectiveDate: Date, now = new Date()) {
  if (Number.isNaN(effectiveDate.getTime())) throw new Error('تاریخ اثرگذاری معتبر نیست.');
  return effectiveDate <= now;
}

export function completionForWorkGroup(input: { title: string; locationId: string | null; policyId: string | null; activeMembers: number }) {
  const requirements = [
    { key: 'title', label: 'عنوان', complete: Boolean(input.title.trim()) },
    { key: 'location', label: 'محل کار', complete: Boolean(input.locationId) },
    { key: 'members', label: 'اعضا', complete: input.activeMembers > 0 },
    { key: 'policy', label: 'سیاست کاری', complete: Boolean(input.policyId) },
  ];
  return { percent: Math.round((requirements.filter((item) => item.complete).length / requirements.length) * 100), requirements };
}
