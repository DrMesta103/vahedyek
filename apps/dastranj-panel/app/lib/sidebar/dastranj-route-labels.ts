/** Static labels for URL path segments (non-dynamic). */
export const DASHRANJ_ROUTE_SEGMENT_LABELS: Record<string, string> = {
  new: 'افزودن',
  edit: 'ویرایش',
  builder: 'سازنده',
  profile: 'مشخصات',
  requests: 'درخواست‌ها',
  'work-report': 'گزارش کار',
  'bank-accounts': 'حساب‌های بانکی',
  guarantee: 'ضمانت',
  'contract-drafts': 'پیش‌نویس قرارداد',
  'employee-imports': 'واردات کارمندان',
  'dev-doc-threads': 'گفتگوی مستندات توسعه',
  'dev-doc-events': 'لاگ مستندات توسعه',
  'quick-setup': 'راه‌اندازی سریع',
  'business-settings': 'تنظیمات کسب و کار',
  'payroll-attendance': 'حضور و غیاب حقوق',
  'naming-patterns': 'الگوهای نام‌گذاری',
  'company-loans': 'وام‌های سازمانی',
  ownership: 'مالکیت',
  branding: 'برندینگ',
  representatives: 'نمایندگان',
  shareholders: 'سهامداران',
  'board-members': 'اعضای هیئت‌مدیره',
  locations: 'محل کار',
  calendars: 'تقویم‌ها',
  policies: 'سیاست‌ها',
  work: 'سیاست کاری',
  base: 'اطلاعات پایه',
  employees: 'کارمندان',
  'work-groups': 'گروه‌های کاری',
  'organization-units': 'واحدهای سازمانی',
  'shift-templates': 'قالب‌های شیفت',
  'draft-templates': 'قالب پیش‌نویس',
  'request-reasons': 'دلایل درخواست',
  account: 'حساب کاربری',
};

/** Full-path overrides when segment walking is not enough. */
export const DASHRANJ_ROUTE_PATH_OVERRIDES: Record<string, string[]> = {
  '/dev-doc-threads': ['گفتگوی مستندات توسعه'],
  '/dev-doc-events': ['لاگ مستندات توسعه'],
  '/payroll-contract': ['قرارداد حقوق'],
  '/account': ['پروفایل کسب و کار'],
  '/policies/work': ['سیاست‌ها', 'ویرایش سیاست کاری'],
  '/policies/work/base': ['سیاست‌ها', 'ویرایش سیاست کاری', 'اطلاعات پایه'],
  '/policies/new': ['سیاست‌ها', 'افزودن سیاست'],
  '/draft-templates/builder': ['قالب پیش‌نویس', 'سازنده'],
  '/draft-templates/new': ['قالب پیش‌نویس', 'افزودن قالب'],
  '/business-settings/profile': ['تنظیمات کسب و کار', 'پروفایل کسب و کار'],
};

export function isDynamicRouteSegment(segment: string): boolean {
  if (!segment) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true;
  if (/^\d+$/.test(segment)) return true;
  if (segment.length >= 24) return true;
  return false;
}
