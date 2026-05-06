export type ApprovalUsageType = 'residential' | 'commercial' | 'office' | 'parking' | 'storage';

export type ApprovalUsageOption = {
  id: ApprovalUsageType;
  title: string;
  shortTitle: string;
  description: string;
  intro: string;
};

export const approvalUsageOptions: ApprovalUsageOption[] = [
  {
    id: 'residential',
    title: 'نوع کاربری مسکونی',
    shortTitle: 'مسکونی',
    description: 'تعریف مسیر تایید قرارداد برای واحدهای مسکونی',
    intro:
      'پیش‌نویس قرارداد قبل از نهایی شدن باید توسط خریدار (در صورت انتخاب) و کارکنان سازمان بررسی شود. مسیر تایید بر اساس نوع کاربری واحد تعیین می‌شود.',
  },
  {
    id: 'commercial',
    title: 'نوع کاربری تجاری',
    shortTitle: 'تجاری',
    description: 'تعریف مسیر تایید قرارداد برای واحدهای تجاری',
    intro:
      'برای واحدهای تجاری می‌توانید مسیر تایید مستقل تعریف کنید تا پیش‌نویس پیش از ارسال یا نهایی‌سازی توسط افراد مشخص‌شده بررسی شود.',
  },
  {
    id: 'office',
    title: 'نوع کاربری اداری',
    shortTitle: 'اداری',
    description: 'تعریف مسیر تایید قرارداد برای واحدهای اداری',
    intro:
      'در این بخش می‌توانید مشخص کنید قراردادهای مرتبط با واحدهای اداری قبل از نهایی شدن از چه مراحل تاییدی عبور کنند.',
  },
  {
    id: 'parking',
    title: 'نوع کاربری پارکینگ',
    shortTitle: 'پارکینگ',
    description: 'تعریف مسیر تایید قرارداد برای پارکینگ‌ها',
    intro:
      'برای پارکینگ‌ها نیز می‌توانید روند تایید اختصاصی داشته باشید و تعیین کنید چه افرادی پیش از نهایی شدن قرارداد آن را بررسی کنند.',
  },
  {
    id: 'storage',
    title: 'نوع کاربری انباری',
    shortTitle: 'انباری',
    description: 'تعریف مسیر تایید قرارداد برای انباری‌ها',
    intro:
      'در قراردادهای مربوط به انباری، مسیر تایید می‌تواند جداگانه تنظیم شود تا کنترل بیشتری بر فرآیند بررسی داشته باشید.',
  },
];

export function getApprovalUsageOption(usageType: string) {
  return approvalUsageOptions.find((item) => item.id === usageType) ?? null;
}
