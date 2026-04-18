export type DiscountGroup = {
  id: string;
  title: string;
  description: string;
  configured?: boolean;
};

export type DiscountScope = 'whole' | 'itemized';

export type DiscountEntry = {
  id: string;
  title: string;
  description: string;
  configured?: boolean;
};

export const DISCOUNT_GROUPS: DiscountGroup[] = [
  {
    id: 'contract-base',
    title: 'تخفیف روی اصل قرارداد',
    description: 'تنظیم میزان تخفیف اولیه‌ای که در صورت دیرکرد پرداخت اقساط برای خریدار محاسبه و اعمال می‌شود.',
    configured: true,
  },
  {
    id: 'early-payment',
    title: 'تخفیف مشوق پرداخت زودتر از موعد',
    description: 'میزان جریمه‌ای که سازنده در صورت تحویل واحد نسبت به تاریخ مقرر باید به خریدار پرداخت کند.',
    configured: true,
  },
];

export const ITEMIZED_DISCOUNT_ENTRIES: DiscountEntry[] = [
  {
    id: 'installments',
    title: 'تخفیف اقساط',
    description: 'مدیریت تخفیف‌های مربوط به اقساط دوره‌ای و پرداخت‌های زمان‌بندی‌شده قرارداد.',
  },
  {
    id: 'unit-handover',
    title: 'تخفیف تحویل واحد',
    description: 'تنظیم تخفیف مرتبط با تاخیر یا شرایط خاص در فرایند تحویل واحد به خریدار.',
  },
  {
    id: 'advance-payment',
    title: 'تخفیف پیش‌پرداخت',
    description: 'تعریف تخفیف برای پرداخت‌های غیر اقساطی مانند پیش‌پرداخت یا مبلغ پرداختی در زمان تحویل.',
  },
  {
    id: 'document-handover',
    title: 'تخفیف تحویل سند',
    description: 'تنظیم تخفیف در صورت تاخیر یا شرایط خاص مربوط به تحویل سند رسمی.',
  },
  {
    id: 'adjustment-payment',
    title: 'تخفیف در پرداخت تعدیل',
    description: 'مدیریت تخفیف‌های مرتبط با مبلغ تعدیل‌شده ناشی از تغییرات قرارداد یا شاخص‌ها.',
  },
  {
    id: 'misc-costs',
    title: 'تخفیف در هزینه‌های متفرقه',
    description: 'تعریف تخفیف برای هزینه‌های جانبی و متفرقه پیش‌بینی‌شده در قرارداد.',
  },
  {
    id: 'interest',
    title: 'تخفیف برای سود',
    description: 'اعمال تخفیف بر سود یا بهره محاسبه‌شده برای سررسیدهای قرارداد.',
  },
];

export const WHOLE_DISCOUNT_ENTRY: DiscountEntry = {
  id: 'all-dues',
  title: 'تخفیف روی کل سررسیدها',
  description: 'اعمال تنظیمات تخفیف برای تمامی سررسیدهای مالی ثبت‌شده در قرارداد.',
  configured: true,
};

export const getDiscountGroup = (discountId: string) =>
  DISCOUNT_GROUPS.find((item) => item.id === discountId);

export const getDiscountEntry = (scope: DiscountScope, entryId: string) => {
  if (scope === 'whole') {
    return entryId === WHOLE_DISCOUNT_ENTRY.id ? WHOLE_DISCOUNT_ENTRY : undefined;
  }

  return ITEMIZED_DISCOUNT_ENTRIES.find((item) => item.id === entryId);
};
