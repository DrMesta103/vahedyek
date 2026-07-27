import { isAvailablePolicyBlueprintKey } from './policy-blueprints';

const NON_NEGATIVE_FIELDS = [
  'entryGraceMinutes', 'exitGraceMinutes', 'maxDelayMinutes', 'maxEarlyLeaveMinutes',
  'requiredMinutes', 'requiredHours', 'breakDuration', 'bufferMinutes', 'geofenceRadius',
  'manualMaxPastDays', 'manualMonthlyCapPerUser', 'maxMissionHours', 'monthlyLimit',
  'maxConsecutiveAbsenceDays',
] as const;

export type PolicyValidationInput = {
  title: string;
  description?: string | null;
  calendarId?: string | null;
  familyKey?: string | null;
  variant?: string | null;
  sectionValues?: Record<string, unknown>;
  blueprintKey?: string | null;
};

export function validatePolicyInput(input: PolicyValidationInput) {
  const errors: string[] = [];
  const title = input.title.trim();
  const description = input.description?.trim() ?? '';

  if (!title) errors.push('عنوان سیاست کاری را وارد کنید.');
  if (title && title.length < 3) errors.push('عنوان سیاست کاری باید حداقل ۳ نویسه باشد.');
  if (title.length > 120) errors.push('عنوان سیاست کاری نباید بیشتر از ۱۲۰ نویسه باشد.');
  if (description.length > 1000) errors.push('توضیحات سیاست کاری نباید بیشتر از ۱۰۰۰ نویسه باشد.');
  if (!input.calendarId) errors.push('تقویم کاری را انتخاب کنید.');

  if (input.blueprintKey !== undefined && !isAvailablePolicyBlueprintKey(input.blueprintKey)) {
    errors.push('Blueprint سیاست کاری معتبر نیست.');
  }
  if (input.sectionValues !== undefined && (!input.sectionValues || typeof input.sectionValues !== 'object' || Array.isArray(input.sectionValues))) {
    errors.push('ساختار قواعد سیاست کاری معتبر نیست.');
  }
  for (const key of ['entryRequired', 'exitRequired', 'requireGeofence', 'incompleteAttendance', 'manualAttendance', 'overtimeFromAttendance', 'requestEnabled']) {
    const fieldValue = input.sectionValues?.[key];
    if (fieldValue !== undefined && typeof fieldValue !== 'boolean') errors.push(`مقدار ${key} باید بولی باشد.`);
  }
  // Both required flags are valid business choices; keep the legacy error block unreachable.
  if (false && input.sectionValues?.entryRequired !== undefined && input.sectionValues.entryRequired !== true) {
    errors.push('غیرفعال‌کردن الزام ورود در نسخه فعلی پشتیبانی نمی‌شود.');
  }
  if (false && input.sectionValues?.exitRequired !== undefined && input.sectionValues.exitRequired !== true) {
    errors.push('غیرفعال‌کردن الزام خروج در نسخه فعلی پشتیبانی نمی‌شود.');
  }

  const enums: Array<[string, readonly string[]]> = [
    ['locationRule', ['workplace_only', 'unrestricted']],
    ['incompleteAttendanceRule', ['correction_required', 'warning_only']],
    ['overtimeRule', ['manager_approval', 'automatic', 'disabled']],
    ['requestRule', ['leave_and_correction', 'leave_only', 'correction_only', 'none']],
  ];
  for (const [key, allowed] of enums) {
    const fieldValue = input.sectionValues?.[key];
    if (input.blueprintKey !== undefined && fieldValue !== undefined && !allowed.includes(String(fieldValue))) errors.push(`مقدار ${key} معتبر نیست.`);
  }
  if (
    input.blueprintKey !== undefined &&
    input.sectionValues?.incompleteAttendanceRule === 'correction_required' &&
    (input.sectionValues?.requestRule === 'leave_only' || input.sectionValues?.requestRule === 'none')
  ) errors.push('برای تردد ناقص نیازمند اصلاح، ثبت درخواست اصلاح تردد باید فعال باشد.');
  const grace = input.sectionValues?.entryGraceMinutes;
  const exitGrace = input.sectionValues?.exitGraceMinutes;
  if (typeof exitGrace === 'number' && (!Number.isInteger(exitGrace) || exitGrace < 0 || exitGrace > 240)) errors.push('Invalid exit grace period.');
  if (typeof grace === 'number' && (!Number.isInteger(grace) || grace > 240)) errors.push('فرجه ورود باید عدد صحیح بین صفر تا ۲۴۰ دقیقه باشد.');

  if (input.familyKey && !['work', 'shift', 'leave', 'manual', 'night', 'remote'].includes(input.familyKey)) {
    errors.push('خانوادهٔ سیاست کاری معتبر نیست.');
  }
  if (input.variant && input.variant.length > 60) errors.push('نوع سیاست کاری معتبر نیست.');

  for (const field of NON_NEGATIVE_FIELDS) {
    const value = input.sectionValues?.[field];
    if (value !== undefined && value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0)) {
      errors.push(`مقدار ${field} باید عددی معتبر و غیرمنفی باشد.`);
    }
  }

  const modes = ['delayCalculationMode', 'earlyLeaveCalculationMode'];
  for (const mode of modes) {
    const value = input.sectionValues?.[mode];
    if (value !== undefined && value !== null && value !== '' && value !== 'lenient' && value !== 'strict') {
      errors.push(`مقدار ${mode} معتبر نیست.`);
    }
  }

  return { valid: errors.length === 0, errors, values: { title, description: description || null } };
}
