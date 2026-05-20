export const requestReasonLabels = {
  attendance: 'حضور و غیاب',
  remote_work: 'دورکاری',
  loan: 'وام',
  salary_advance: 'علی‌الحساب حقوق',
  mission: 'ماموریت',
  annual_leave: 'مرخصی استحقاقی',
  unpaid_leave: 'مرخصی بدون حقوق',
  reward_leave: 'مرخصی تشویقی',
  sick_leave: 'مرخصی استعلاجی',
} as const;

/** برچسب تب‌های صفحه دلایل درخواست (مطابق UI طراحی) */
export const requestReasonTabLabels = {
  attendance: 'حضور و غیاب (تردد)',
  remote_work: 'دورکاری',
  loan: 'وام',
  salary_advance: 'علی الحساب حقوق',
  mission: 'ماموریت',
  annual_leave: 'مرخصی استحقاقی',
  unpaid_leave: 'مرخصی بدون حقوق',
  reward_leave: 'مرخصی تشویقی',
  sick_leave: 'مرخصی استعلاجی',
} as const satisfies Record<keyof typeof requestReasonLabels, string>;

export const requestReasonCategories = Object.keys(requestReasonTabLabels) as (keyof typeof requestReasonTabLabels)[];

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
