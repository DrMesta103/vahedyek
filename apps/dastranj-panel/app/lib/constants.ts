/** ترتیب تب‌های دلایل درخواست (ثابت) */
export const REQUEST_REASON_CATEGORY_ORDER = [
  'daily_leave',
  'hourly_leave',
  'reward_leave',
  'unpaid_leave',
  'sick_leave',
  'overtime',
  'attendance',
  'remote_work',
  'mission',
  'salary_advance',
  'loan',
] as const;

export type RequestReasonCategoryKey = (typeof REQUEST_REASON_CATEGORY_ORDER)[number];

export const requestReasonTabLabels: Record<RequestReasonCategoryKey, string> = {
  daily_leave: 'مرخصی روزانه',
  hourly_leave: 'مرخصی ساعتی',
  reward_leave: 'مرخصی تشویقی',
  unpaid_leave: 'مرخصی بدون حقوق',
  sick_leave: 'مرخصی استعلاجی',
  overtime: 'اضافه کاری',
  attendance: 'حضور و غیاب (تردد)',
  remote_work: 'دورکاری',
  mission: 'ماموریت',
  salary_advance: 'مساعده',
  loan: 'وام',
};

export const requestReasonLabels = requestReasonTabLabels;

export const requestReasonCategories = [...REQUEST_REASON_CATEGORY_ORDER];

export const shiftTypeLabels = {
  fixed: 'ثابت',
  floating_day_start: 'شناور ابتدای روز',
  floating_absolute: 'شناور مطلق',
  split: 'دو تکه',
  rotate: 'چرخشی',
} as const;

export const draftTemplateLabels = {
  payroll: 'حقوق و دستمزد',
  attendance: 'حضور و غیاب',
  hr: 'منابع انسانی',
} as const;

export const workGroupAccessLabels = {
  employee: 'کارمند',
  lead: 'سرگروه',
  manager: 'مدیر',
} as const;

export const maritalStatusLabels = {
  single: 'مجرد',
  married: 'متاهل',
  divorced: 'جداشده',
} as const;
