export type PenaltyItem = {
  id: string;
  title: string;
  description: string;
};

export const PENALTY_ITEMS: PenaltyItem[] = [
  {
    id: 'unit-handover-delay',
    title: 'جریمه تاخیر در تحویل واحد',
    description: 'تنظیمات محاسبه جریمه در صورت تاخیر در تحویل واحد برای فروشنده یا سازنده را مشخص می‌کند.',
  },
  {
    id: 'installment-delay',
    title: 'جریمه تاخیر در پرداخت اقساط',
    description: 'تنظیمات محاسبه جریمه برای دیرکرد در پرداخت اقساط برای خریدار را مشخص می‌کند.',
  },
  {
    id: 'document-delay',
    title: 'جریمه تاخیر در تحویل سند',
    description: 'تنظیمات محاسبه جریمه در صورت تاخیر در تحویل سند را مشخص می‌کند.',
  },
  {
    id: 'advance-payment-delay',
    title: 'جریمه تاخیر در پیش‌پرداخت',
    description: 'تنظیمات جریمه برای تاخیر در پرداخت پیش‌پرداخت را مشخص می‌کند.',
  },
  {
    id: 'misc-cost-delay',
    title: 'جریمه تاخیر در هزینه‌های متفرقه',
    description: 'تنظیمات محاسبه جریمه برای تاخیر در پرداخت هزینه‌های جانبی قرارداد را مشخص می‌کند.',
  },
  {
    id: 'adjustment-delay',
    title: 'جریمه تاخیر در پرداخت تعدیل',
    description: 'تنظیمات محاسبه جریمه برای تاخیر در پرداخت مبلغ تعدیل را مشخص می‌کند.',
  },
  {
    id: 'penalty-payment-delay',
    title: 'جریمه تاخیر در پرداخت جرایم',
    description: 'تنظیمات جریمه برای تاخیر در پرداخت جرایم را مشخص می‌کند.',
  },
  {
    id: 'bank-loan-case-delay',
    title: 'تاخیر در تشکیل پرونده تسهیلات بانکی',
    description: 'تنظیمات جریمه برای تاخیر در تشکیل پرونده تسهیلات بانکی را مشخص می‌کند.',
  },
  {
    id: 'lawsuit-cost',
    title: 'هزینه تشکیل پرونده دادرسی بابت بدهی',
    description: 'تنظیمات محاسبه هزینه در صورت تشکیل پرونده قضایی بابت بدهی را مشخص می‌کند.',
  },
  {
    id: 'document-transfer-followup',
    title: 'عدم پیگیری مراحل اداری انتقال سند',
    description: 'تنظیمات محاسبه جریمه در صورت عدم پیگیری مراحل اداری انتقال سند را مشخص می‌کند.',
  },
  {
    id: 'discount-cancelled',
    title: 'جریمه تخفیف لغو شده',
    description: 'تنظیمات محاسبه جریمه در صورت لغو تخفیف به دلیل عدم رعایت شرایط قرارداد را مشخص می‌کند.',
  },
];

export function getPenaltyItem(penaltyId: string) {
  return PENALTY_ITEMS.find((item) => item.id === penaltyId);
}
