import type { TaaviaUseCaseKey } from '@/app/lib/types/domain';

export type TaaviaUseCaseDefinition = {
  key: TaaviaUseCaseKey;
  title: string;
  description: string;
  sections: string[];
};

export const TAAVIA_USE_CASES: TaaviaUseCaseDefinition[] = [
  {
    key: 'brand_identity',
    title: 'معرفی برند و هویت کسب‌وکار',
    description: 'اطلاعات برند، درباره ما، لحن پاسخ‌گویی و شناخت مخاطب هدف',
    sections: ['اطلاعات برند', 'درباره ما', 'لحن پاسخ‌گویی', 'مخاطب هدف'],
  },
  {
    key: 'products_services',
    title: 'محصولات و خدمات',
    description: 'تعریف محصولات، خدمات، ویژگی‌ها، مزایا و فایل‌های مرتبط',
    sections: ['تعریف محصولات', 'تعریف خدمات', 'ویژگی‌ها', 'مزایا', 'فایل‌ها'],
  },
  {
    key: 'customer_support',
    title: 'پشتیبانی مشتریان',
    description: 'موضوعات پشتیبانی، مشکلات رایج، راه‌حل‌ها و قوانین ارجاع',
    sections: ['موضوعات پشتیبانی', 'مشکلات رایج', 'راه‌حل‌ها', 'قوانین ارجاع'],
  },
  {
    key: 'sales_consulting',
    title: 'فروش و مشاوره خرید',
    description: 'سناریوهای فروش، نیازسنجی، پیشنهاد محصول و ثبت لید',
    sections: ['سناریوهای فروش', 'نیازسنجی', 'پیشنهاد محصول', 'ثبت لید'],
  },
  {
    key: 'pricing_plans',
    title: 'قیمت‌گذاری، پلن‌ها و پیشنهادها',
    description: 'پلن‌ها، قیمت‌ها، تخفیف‌ها و شرایط پرداخت',
    sections: ['پلن‌ها', 'قیمت‌ها', 'تخفیف‌ها', 'شرایط پرداخت'],
  },
  {
    key: 'faq',
    title: 'سوالات متداول / FAQ',
    description: 'سوالات پرتکرار، پاسخ استاندارد و دسته‌بندی FAQ',
    sections: ['سوالات پرتکرار', 'پاسخ استاندارد', 'دسته‌بندی FAQ'],
  },
  {
    key: 'training_guides',
    title: 'آموزش و راهنمای استفاده',
    description: 'آموزش مرحله‌ای، راهنما، ویدئو و خطاهای رایج',
    sections: ['آموزش مرحله‌ای', 'راهنما', 'ویدئو', 'خطاهای رایج'],
  },
  {
    key: 'policies',
    title: 'قوانین، شرایط و سیاست‌ها',
    description: 'شرایط استفاده، حریم خصوصی، بازگشت وجه و SLA',
    sections: ['شرایط استفاده', 'حریم خصوصی', 'بازگشت وجه', 'SLA'],
  },
  {
    key: 'complaints_handoff',
    title: 'شکایات، اعتراضات و ارجاع به انسان',
    description: 'دسته‌بندی شکایت، قوانین حساسیت و ارجاع به اپراتور',
    sections: ['دسته‌بندی شکایت', 'قوانین حساسیت', 'ارجاع به اپراتور'],
  },
];

export const TAAVIA_USE_CASE_LABELS: Record<TaaviaUseCaseKey, string> = {
  brand_identity: 'معرفی برند و هویت کسب‌وکار',
  products_services: 'محصولات و خدمات',
  customer_support: 'پشتیبانی مشتریان',
  sales_consulting: 'فروش و مشاوره خرید',
  pricing_plans: 'قیمت‌گذاری، پلن‌ها و پیشنهادها',
  faq: 'سوالات متداول / FAQ',
  training_guides: 'آموزش و راهنمای استفاده',
  policies: 'قوانین، شرایط و سیاست‌ها',
  complaints_handoff: 'شکایات، اعتراضات و ارجاع به انسان',
  support: 'پشتیبانی مشتریان',
  sales: 'فروش و مشاوره خرید',
  marketing: 'معرفی برند و هویت کسب‌وکار',
  operations: 'پشتیبانی مشتریان',
  finance: 'قیمت‌گذاری، پلن‌ها و پیشنهادها',
  hr: 'معرفی برند و هویت کسب‌وکار',
  product: 'محصولات و خدمات',
  management: 'قوانین، شرایط و سیاست‌ها',
  it: 'آموزش و راهنمای استفاده',
  all: 'همه موارد',
};

export const TAAVIA_ALL_USE_CASE_KEYS = TAAVIA_USE_CASES.map((item) => item.key);
export type TaaviaPrimaryUseCaseKey = (typeof TAAVIA_USE_CASES)[number]['key'];

export const TAAVIA_VALID_USE_CASES = new Set<TaaviaUseCaseKey>([
  ...TAAVIA_ALL_USE_CASE_KEYS,
  'all',
]);

export const TAAVIA_USE_CASE_MAP = Object.fromEntries(
  TAAVIA_USE_CASES.map((item) => [item.key, item]),
) as Record<TaaviaPrimaryUseCaseKey, TaaviaUseCaseDefinition>;

export function expandTaaviaUseCases(selectedUseCases: TaaviaUseCaseKey[]) {
  if (!selectedUseCases.length || selectedUseCases.includes('all')) {
    return TAAVIA_ALL_USE_CASE_KEYS;
  }

  return selectedUseCases.filter((item): item is TaaviaPrimaryUseCaseKey => item in TAAVIA_USE_CASE_MAP);
}
