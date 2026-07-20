export type PolicyBlueprintKey = 'office' | 'retail' | 'restaurant' | 'project' | 'remote-support' | 'security-shift' | 'custom';

export type PolicyLocationRule = 'workplace_only' | 'unrestricted';
export type PolicyIncompleteAttendanceRule = 'correction_required' | 'warning_only';
export type PolicyOvertimeRule = 'manager_approval' | 'automatic' | 'disabled';
export type PolicyRequestRule = 'leave_and_correction' | 'leave_only' | 'correction_only' | 'none';

export type PolicyBlueprintDefaults = {
  entryRequired: boolean;
  exitRequired: boolean;
  locationRule: PolicyLocationRule;
  entryGraceMinutes: number;
  incompleteAttendanceRule: PolicyIncompleteAttendanceRule;
  overtimeRule: PolicyOvertimeRule;
  requestRule: PolicyRequestRule;
};

export type PolicyBlueprint = {
  key: PolicyBlueprintKey;
  title: string;
  description: string;
  application: string;
  available: boolean;
  defaults?: PolicyBlueprintDefaults;
};

/** Metadata only: saved rules remain independent in WorkPolicy.sectionValues. */
export const POLICY_BLUEPRINTS: readonly PolicyBlueprint[] = [
  { key: 'office', title: 'اداری', description: 'ورود و خروج الزامی، ثبت در محل کار و فرجهٔ ورود ده دقیقه‌ای', application: 'اداری', available: true, defaults: { entryRequired: true, exitRequired: true, locationRule: 'workplace_only', entryGraceMinutes: 10, incompleteAttendanceRule: 'correction_required', overtimeRule: 'manager_approval', requestRule: 'leave_and_correction' } },
  { key: 'custom', title: 'سفارشی', description: 'شروع از قواعد پایه و انتخاب مستقیم مدیر', application: 'سفارشی', available: true, defaults: { entryRequired: true, exitRequired: true, locationRule: 'workplace_only', entryGraceMinutes: 0, incompleteAttendanceRule: 'correction_required', overtimeRule: 'disabled', requestRule: 'leave_and_correction' } },
  { key: 'retail', title: 'فروشگاهی', description: 'قواعد تخصصی فروشگاهی هنوز به موتور حضور متصل نشده است.', application: 'فروشگاهی', available: false },
  { key: 'restaurant', title: 'رستورانی', description: 'قواعد تخصصی رستورانی هنوز به موتور حضور متصل نشده است.', application: 'رستورانی', available: false },
  { key: 'project', title: 'پروژه‌ای', description: 'قواعد پروژه‌ای و مأموریت هنوز کامل نیست.', application: 'پروژه‌ای', available: false },
  { key: 'remote-support', title: 'پشتیبانی / دورکاری', description: 'گردش کامل دورکاری هنوز برای Blueprint آماده نیست.', application: 'دورکاری', available: false },
  { key: 'security-shift', title: 'نگهبانی / شیفتی', description: 'قواعد چرخش شیفت باید ابتدا در موتور نهایی شود.', application: 'شیفتی', available: false },
];

export function isPolicyBlueprintKey(value: unknown): value is PolicyBlueprintKey {
  return POLICY_BLUEPRINTS.some((item) => item.key === value);
}

export function getPolicyBlueprint(key: unknown) {
  return POLICY_BLUEPRINTS.find((item) => item.key === key) ?? null;
}

export function isAvailablePolicyBlueprintKey(value: unknown): value is PolicyBlueprintKey {
  return POLICY_BLUEPRINTS.some((item) => item.key === value && item.available && item.defaults);
}

export function normalizePolicyRuntimeRules(sectionValues: Record<string, unknown>) {
  const overtimeRule: PolicyOvertimeRule =
    sectionValues.overtimeRule === 'manager_approval' || sectionValues.overtimeRule === 'automatic' || sectionValues.overtimeRule === 'disabled'
      ? sectionValues.overtimeRule
      : sectionValues.overtimeFromAttendance === false ? 'manager_approval' : 'automatic';
  const requestRule: PolicyRequestRule =
    sectionValues.requestRule === 'leave_only' || sectionValues.requestRule === 'correction_only' || sectionValues.requestRule === 'none'
      ? sectionValues.requestRule
      : 'leave_and_correction';
  const incompleteAttendanceRule: PolicyIncompleteAttendanceRule =
    sectionValues.incompleteAttendanceRule === 'warning_only' ? 'warning_only' : 'correction_required';
  return {
    entryRequired: sectionValues.entryRequired !== false,
    exitRequired: sectionValues.exitRequired !== false,
    incompleteAttendanceRule,
    overtimeRule,
    requestRule,
  };
}

export function getPolicyHumanSummary(sectionValues: Record<string, unknown>) {
  const runtime = normalizePolicyRuntimeRules(sectionValues);
  const grace = typeof sectionValues.entryGraceMinutes === 'number' ? `${sectionValues.entryGraceMinutes.toLocaleString('fa-IR')} دقیقه` : 'ثبت نشده';
  const location = sectionValues.locationRule === 'workplace_only' || sectionValues.requireGeofence === true
    ? 'فقط محل کار'
    : sectionValues.locationRule === 'unrestricted' || sectionValues.requireGeofence === false ? 'بدون محدودیت' : 'ثبت نشده';
  const incomplete = runtime.incompleteAttendanceRule === 'warning_only' ? 'فقط هشدار' : 'نیازمند اصلاح';
  const overtime = runtime.overtimeRule === 'automatic' ? 'خودکار' : runtime.overtimeRule === 'manager_approval' ? 'با تأیید مدیر' : 'غیرفعال';
  const requests = runtime.requestRule === 'leave_and_correction' ? 'مرخصی و اصلاح تردد' : runtime.requestRule === 'leave_only' ? 'فقط مرخصی' : runtime.requestRule === 'correction_only' ? 'فقط اصلاح تردد' : 'غیرفعال';
  return [`فرجه ورود: ${grace}`, `ثبت تردد: ${location}`, `تردد ناقص: ${incomplete}`, `اضافه‌کاری: ${overtime}`, `درخواست‌ها: ${requests}`];
}
