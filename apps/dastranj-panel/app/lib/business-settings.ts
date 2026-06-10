export type BusinessSettingsIcon =
  | 'profile'
  | 'subscription'
  | 'location'
  | 'calendar'
  | 'shift'
  | 'draft'
  | 'naming'
  | 'payroll'
  | 'policy'
  | 'request'
  | 'work-group'
  | 'employee'
  | 'org-unit';

export type BusinessSettingsBadgeTone = 'critical' | 'important' | 'info' | 'success' | 'warning' | 'muted';

export type BusinessSettingsBadge = {
  label: string;
  tone?: BusinessSettingsBadgeTone;
  tooltip?: string;
};

export type BusinessSettingsItem = {
  title: string;
  description: string;
  href: string;
  icon: BusinessSettingsIcon;
  comingSoon?: boolean;
  badges?: BusinessSettingsBadge[];
};

export type BusinessSettingsCategory = {
  id:
    | 'business-profile'
    | 'attendance'
    | 'hr'
    | 'requests'
    | 'payroll'
    | 'contracts'
    | 'subscription';
  title: string;
  description: string;
  items: BusinessSettingsItem[];
};

export const BUSINESS_SETTINGS_CATEGORIES: BusinessSettingsCategory[] = [
  {
    id: 'business-profile',
    title: 'اطلاعات کسب‌وکار',
    description: 'اطلاعات پایه، هویتی و رسمی کسب‌وکار را در این بخش مدیریت کنید.',
    items: [
      {
        title: 'پروفایل کسب‌وکار',
        description: 'نام، لوگو، اطلاعات ثبتی، آدرس و اطلاعات پایه کسب‌وکار را مدیریت کنید.',
        href: '/business-settings/profile',
        icon: 'profile',
      },
    ],
  },
  {
    id: 'attendance',
    title: 'تنظیمات حضور و تردد',
    description: 'تنظیمات اصلی تردد، حضور، تقویم، شیفت و قواعد کاری کارکنان را مدیریت کنید.',
    items: [
      {
        title: 'محل‌های کار',
        description: 'آدرس، موقعیت مکانی و محدوده مجاز تردد محل‌های کاری سازمان را مدیریت کنید.',
        href: '/locations',
        icon: 'location',
        badges: [{ label: 'حیاتی', tone: 'critical' }],
      },
      {
        title: 'تقویم‌های کاری',
        description: 'روزهای کاری، تعطیلات رسمی، تعطیلات سازمانی و سال کاری را تعریف کنید.',
        href: '/calendars',
        icon: 'calendar',
        badges: [{ label: 'حیاتی', tone: 'critical' }],
      },
      {
        title: 'قالب‌های شیفت',
        description: 'الگوهای ساعت کاری، شیفت ثابت، شناور، دو تکه، شبانه و استراحت‌ها را مدیریت کنید.',
        href: '/shift-templates',
        icon: 'shift',
        badges: [{ label: 'حیاتی', tone: 'critical' }],
      },
      {
        title: 'سیاست‌های کاری',
        description: 'قواعد تردد، فرجه ورود و خروج، مرخصی، اضافه‌کاری عملیاتی و درخواست‌ها را مدیریت کنید.',
        href: '/policies',
        icon: 'policy',
        badges: [{ label: 'حیاتی', tone: 'critical' }],
      },
    ],
  },
  {
    id: 'hr',
    title: 'منابع انسانی و ساختار سازمانی',
    description: 'کارکنان، ساختار مدیریتی و گروه‌های عملیاتی سازمان را مدیریت کنید.',
    items: [
      {
        title: 'کارمندان',
        description: 'مشاهده، افزودن، ویرایش و تکمیل اطلاعات کارمندان کسب‌وکار.',
        href: '/employees',
        icon: 'employee',
        badges: [{ label: 'حیاتی', tone: 'critical' }],
      },
      {
        title: 'واحدهای سازمانی',
        description: 'ساختار مدیریتی، واحدها و مسیرهای سازمانی را برای فرآیندهای تأیید و گزارش‌گیری تعریف کنید.',
        href: '/organization-units',
        icon: 'org-unit',
        badges: [{ label: 'نیمه‌حیاتی', tone: 'important' }],
      },
      {
        title: 'گروه‌های کاری',
        description: 'کارکنان را به محل کار، سیاست کاری و قواعد عملیاتی مرتبط کنید.',
        href: '/work-groups',
        icon: 'work-group',
        badges: [{ label: 'حیاتی', tone: 'critical' }],
      },
    ],
  },
  {
    id: 'requests',
    title: 'درخواست‌ها و فرآیندها',
    description: 'دلایل درخواست‌ها، انواع فرآیندهای داخلی و تنظیمات مرتبط با درخواست‌های کارکنان را مدیریت کنید.',
    items: [
      {
        title: 'دلایل درخواست‌ها',
        description: 'دلایل و دسته‌بندی درخواست‌هایی مثل مرخصی، اضافه‌کاری، اصلاح تردد، مأموریت و سایر درخواست‌ها را مدیریت کنید.',
        href: '/request-reasons',
        icon: 'request',
        badges: [{ label: 'نیمه‌حیاتی', tone: 'important' }],
      },
      {
        title: 'وام‌های سازمانی',
        description: 'وام‌ها، شرایط دریافت، سقف‌ها و قواعد اولیه وام‌های سازمانی را تعریف کنید.',
        href: '/business-settings/company-loans',
        icon: 'request',
      },
    ],
  },
  {
    id: 'payroll',
    title: 'حقوق و دستمزد',
    description: 'مقادیر پایه، مزایا، کسورات، بیمه، مالیات و قواعد مالی حقوق و دستمزد را مدیریت کنید.',
    items: [
      {
        title: 'قوانین و ضرایب استاندارد حقوق و دستمزد',
        description: 'مقادیر پایه، ضرایب قانونی، مزایا، کسورات، بیمه، مالیات و قواعد استاندارد محاسباتی را مدیریت کنید.',
        href: '/business-settings/payroll-attendance',
        icon: 'payroll',
        badges: [
          { label: 'نیمه‌حیاتی', tone: 'important' },
          { label: 'تاو ادمین', tone: 'info', tooltip: 'این بخش در پنل تاو ادمین مدیریت می‌شود.' },
        ],
      },
      {
        title: 'تنظیمات اختصاصی حقوق و دستمزد کسب‌وکار',
        description: 'قواعد، مقادیر و ضرایب اختصاصی این کسب‌وکار را بر اساس سیاست‌های داخلی سازمان مدیریت کنید.',
        href: '/business-settings/payroll-attendance/tenant',
        icon: 'payroll',
        badges: [
          { label: 'نیمه‌حیاتی', tone: 'important' },
          { label: 'صاحب کسب‌وکار', tone: 'success', tooltip: 'این مقادیر مخصوص همین کسب‌وکار است.' },
        ],
      },
    ],
  },
  {
    id: 'contracts',
    title: 'قراردادها و اسناد',
    description: 'قالب‌های قراردادی، شماره‌گذاری‌ها و الگوهای نام‌گذاری اسناد سازمانی را مدیریت کنید.',
    items: [
      {
        title: 'قالب‌های پیش‌نویس قرارداد',
        description: 'قالب‌های آماده قرارداد را برای فرآیندهای منابع انسانی و قراردادهای کارکنان مدیریت کنید.',
        href: '/draft-templates',
        icon: 'draft',
        badges: [{ label: 'نیمه‌حیاتی', tone: 'important' }],
      },
      {
        title: 'الگوهای نام‌گذاری و شماره‌گذاری',
        description: 'الگوی شماره قرارداد، شماره پرسنلی و نام‌گذاری اسناد سازمانی را تعریف کنید.',
        href: '/business-settings/naming-patterns',
        icon: 'naming',
      },
    ],
  },
  {
    id: 'subscription',
    title: 'اشتراک و صورت‌حساب',
    description: 'پلن، ظرفیت استفاده، وضعیت اشتراک، تمدید و ارتقای سرویس را مدیریت کنید.',
    items: [
      {
        title: 'مدیریت اشتراک',
        description: 'پلن، ظرفیت استفاده، وضعیت اشتراک، تمدید و ارتقای سرویس را پیگیری کنید.',
        href: '/business-settings/profile',
        icon: 'subscription',
        comingSoon: true,
        badges: [{ label: 'در حال توسعه', tone: 'warning' }],
      },
    ],
  },
];

export const BUSINESS_SETTINGS_CATALOG = BUSINESS_SETTINGS_CATEGORIES.flatMap((category) => category.items);

function normalizeBusinessSettingsSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[يی]/g, 'ی')
    .replace(/[كک]/g, 'ک')
    .trim();
}

export function filterBusinessSettingsCatalog(items: BusinessSettingsItem[], query: string) {
  const normalizedQuery = normalizeBusinessSettingsSearch(query);
  if (!normalizedQuery) return items;

  return items.filter((item) => normalizeBusinessSettingsSearch(`${item.title} ${item.description}`).includes(normalizedQuery));
}

export function filterBusinessSettingsCategories(categories: BusinessSettingsCategory[], query: string) {
  const normalizedQuery = normalizeBusinessSettingsSearch(query);
  if (!normalizedQuery) return categories;

  return categories
    .map((category) => {
      const categoryMatches = normalizeBusinessSettingsSearch(`${category.title} ${category.description}`).includes(normalizedQuery);
      return {
        ...category,
        items: categoryMatches ? category.items : filterBusinessSettingsCatalog(category.items, query),
      };
    })
    .filter((category) => category.items.length > 0);
}
