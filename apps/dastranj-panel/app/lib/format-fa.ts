const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** تبدیل ارقام لاتین/عربی به فارسی — مستقل از پشتیبانی locale مرورگر */
export function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

type FormatFaNumberOptions = {
  useGrouping?: boolean;
  fractionDigits?: number;
};

export function formatFaNumber(value: number, options: FormatFaNumberOptions = {}) {
  const { useGrouping = true, fractionDigits } = options;
  const safe = Number.isFinite(value) ? value : 0;

  if (!useGrouping && fractionDigits == null) {
    return toPersianDigits(safe);
  }

  const formatted = new Intl.NumberFormat('en-US', {
    useGrouping,
    minimumFractionDigits: fractionDigits ?? 0,
    maximumFractionDigits: fractionDigits ?? 0,
  }).format(safe);

  return toPersianDigits(formatted);
}

const persianJalaliFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** تاریخ شمسی با ارقام فارسی */
export function formatPersianJalaliDate(value: Date | string) {
  return toPersianDigits(persianJalaliFormatter.format(new Date(value)));
}

export function formatFaMinutes(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized) return 'ثبت نشده';
  const minutes = Number(normalized);
  if (!Number.isFinite(minutes)) return 'ثبت نشده';
  return `${formatFaNumber(minutes, { useGrouping: false })} دقیقه`;
}

export function formatFaCurrencyAmount(value: number) {
  if (!value) return 'ثبت نشده';
  return `${formatFaNumber(value)} ریال`;
}
