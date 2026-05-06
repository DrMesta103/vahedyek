const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** ارقام فارسی را به لاتین تبدیل می‌کند (برای ورودی کاربر). */
export function toLatinDigits(input: string): string {
  let s = input;
  for (let i = 0; i < 10; i++) {
    s = s.split(PERSIAN_DIGITS[i]!).join(String(i));
  }
  return s;
}

/**
 * فقط ارقام؛ خروجی با جداکننده هر ۳ رقم (مثل `en-US`) همان الگوی {@link FinancialStep}.
 */
export function formatThousandsGroupedInput(raw: string): string {
  const digits = toLatinDigits(raw).replace(/\D/g, '');
  if (!digits) return '';
  const n = Number(digits);
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('en-US');
}

/** نرمال‌سازی مقدار ذخیره‌شده (با/بدون ویرگول) برای نمایش با جداکننده. */
export function normalizeStoredMoneyGrouped(stored: string | undefined): string {
  if (stored == null || stored === '') return '';
  return formatThousandsGroupedInput(stored.replace(/,/g, ''));
}
