export type DocPropRow = {
  name: string;
  type: string;
  defaultValue?: string;
  required?: boolean;
  description: string;
};

export const TAAV_DEV_RULES = [
  'از کامپوننت‌های TaavUI به‌جای UI تکراری محلی در اپ‌ها استفاده کنید.',
  'دکمه، badge، کارت، wrapper فرم، جدول یا status chip جدید داخل اپ نسازید اگر معادل TaavUI وجود دارد.',
  'برای تغییر ظاهر رسمی، از className دلخواه Tailwind استفاده نکنید — فقط props رسمی.',
  'از variant، size، tone، width، density و stateهای رسمی استفاده کنید.',
  'variant جدید فقط وقتی اضافه شود که reusable و تاییدشده باشد.',
  'کامپوننت‌های business باید روی primitives ساخته شوند، نه Tailwind خام.',
  'مهاجرت DastRanj و VahedYek باید صفحه‌به‌صفحه و تدریجی انجام شود.',
] as const;
