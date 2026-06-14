export const WORKPLACE_LOCATION_FIELD_TOOLTIPS = {
  title: 'نامی کوتاه و قابل فهم برای این محل کار وارد کنید؛ این عنوان در فهرست محل‌ها و گزارش‌ها نمایش داده می‌شود.',
  address: 'آدرس متنی محل کار را وارد کنید. با انتخاب نقطه روی نقشه، می‌توانید آدرس را سریع‌تر تکمیل یا تأیید کنید.',
  description: 'اگر این محل کار کاربرد خاصی دارد یا نکته‌ای درباره ثبت تردد آن وجود دارد، اینجا بنویسید.',
  radius: 'فاصله مجاز از نقطه نقشه برای ثبت ورود و خروج کارکنان.',
  coordinates: 'عرض و طول جغرافیایی نقطه انتخاب‌شده روی نقشه.',
} as const;

export function mockAddressFromMapPick(latitude: number, longitude: number) {
  return `تهران، نقطه انتخاب‌شده — ${latitude.toFixed(5)}° شمالی، ${longitude.toFixed(5)}° شرقی`;
}
