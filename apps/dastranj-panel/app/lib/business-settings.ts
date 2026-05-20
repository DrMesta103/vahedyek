export type BusinessSettingsIcon =
  | 'profile'
  | 'subscription'
  | 'location'
  | 'calendar'
  | 'shift'
  | 'draft'
  | 'policy'
  | 'request'
  | 'work-group'
  | 'employee'
  | 'org-unit';

export type BusinessSettingsItem = {
  title: string;
  description: string;
  href: string;
  icon: BusinessSettingsIcon;
};

export const BUSINESS_SETTINGS_CATALOG: BusinessSettingsItem[] = [
  {
    title: 'پروفایل کسب و کار',
    description: 'نام، لوگو، اطلاعات ثبتی، آدرس و سایر تنظیمات پایه کسب‌وکار را در این بخش وارد کنید.',
    href: '/account',
    icon: 'profile',
  },
  {
    title: 'مدیریت اشتراک',
    description: 'وضعیت پلن، روزهای باقی‌مانده، تمدید یا ارتقای اشتراک را از اینجا پیگیری کنید.',
    href: '/account',
    icon: 'subscription',
  },
  {
    title: 'محل کار',
    description: 'مدیریت آدرس دفتر مرکزی و اطلاعات محل‌های کاری سازمان.',
    href: '/locations',
    icon: 'location',
  },
  {
    title: 'تقویم کاری',
    description: 'تعریف و مدیریت تقویم‌های کاری و شیفت‌های سازمان.',
    href: '/calendars',
    icon: 'calendar',
  },
  {
    title: 'قالب‌های شیفت',
    description: 'ساخت قالب‌های شیفت برای استفاده در تقویم‌ها.',
    href: '/shift-templates',
    icon: 'shift',
  },
  {
    title: 'قالب‌های پیش‌نویس قرارداد',
    description: 'مدیریت قالب‌های قرارداد تیم و فرایندهای منابع انسانی.',
    href: '/draft-templates',
    icon: 'draft',
  },
  {
    title: 'سیاست‌های کاری',
    description: 'مدیریت سیاست‌های کاری تیم و قوانین حضور و غیاب.',
    href: '/policies',
    icon: 'policy',
  },
  {
    title: 'دلایل درخواست',
    description: 'مدیریت دلایل درخواست‌های سازمانی.',
    href: '/request-reasons',
    icon: 'request',
  },
  {
    title: 'گروه‌های کاری',
    description: 'ایجاد گروه‌های کاری برای مدیریت آسان‌تر کارمندان.',
    href: '/work-groups',
    icon: 'work-group',
  },
  {
    title: 'کارمندان',
    description: 'مدیریت اطلاعات کارمندان، دسترسی‌ها و عملیات تیم.',
    href: '/employees',
    icon: 'employee',
  },
  {
    title: 'واحدهای سازمانی',
    description: 'تعریف دسته‌بندی‌های ساختار سازمانی.',
    href: '/organization-units',
    icon: 'org-unit',
  },
];
