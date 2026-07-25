export type ModuleCardDemoItem = {
  id: string;
  title: string;
  description: string;
  span?: 1 | 2;
  status?: 'incomplete';
};

export const SETUP_MODULE_CARDS: ModuleCardDemoItem[] = [
  {
    id: 'business-profile',
    title: 'پروفایل کسب‌وکار',
    description: 'در این بخش می‌توانید تمامی اطلاعات پروفایل کسب‌وکار را وارد کنید؛ مانند اطلاعات نماینده قانونی، شماره‌حساب‌ها و زبان‌های فعال و غیره.',
  },
  {
    id: 'project-definition',
    title: 'تعریف پروژه / مجتمع',
    description: 'تمام اطلاعات بخش پروژه را می‌توانید در این بخش وارد کنید.',
  },
  {
    id: 'block-tower',
    title: 'بلوک / برج - طبقه - واحد',
    description: 'در این بخش اطلاعات بلوک یا برج به‌همراه طبقات، واحدها و انواع کاربری‌های مختلف هر واحد ثبت می‌شود.',
  },
  {
    id: 'financial-settings',
    title: 'تنظیمات مالی و قواعد قراردادی',
    description: 'در این بخش می‌توانید چارچوب‌های مالی و مفاد قراردادی پروژه را تعریف کنید تا هنگام تنظیم قرارداد، به‌صورت پیشنهادی مورد استفاده قرار گیرند.',
  },
  {
    id: 'approval-process',
    title: 'فرآیند تایید',
    description: 'ابتدا خود فرآیند را ثبت کنید. بعد از آن امکان ثبت مرحله فعال می‌شود.',
  },
];

export const OWNERSHIP_MODULE_CARDS: ModuleCardDemoItem[] = [
  {
    id: 'ownership-type',
    title: 'نوع مالکیت و اطلاعات پایه',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    span: 2,
  },
  {
    id: 'legal-representative',
    title: 'نماینده قانونی',
    description: 'مدیریت و تنظیم قراردادها، فرم‌های رسمی و الحاقیه‌ها',
    status: 'incomplete',
  },
  {
    id: 'main-partners',
    title: 'شرکای اصلی',
    description: 'مدیریت شرکای اصلی و اطلاعات مرتبط با کسب‌وکارهای حقیقی',
    status: 'incomplete',
  },
  {
    id: 'account-number',
    title: 'شماره حساب',
    description: 'ورود این اطلاعات در تنظیمات قرارداد ضروری است',
    span: 2,
  },
];
