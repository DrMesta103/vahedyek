export const WORKPLACE_LOCATION_FIELD_TOOLTIPS = {
  title: 'نامی کوتاه و قابل فهم برای این محل کار؛ در لیست محل‌ها و گزارش‌ها نمایش داده می‌شود.',
  address: 'آدرس متنی محل کار. با کلیک روی نقشه، یک آدرس نمونه به‌صورت خودکار پر می‌شود.',
  description: 'توضیح اختیاری برای مدیران؛ مثلاً طبقه، واحد یا نکته دسترسی.',
  radius: 'فاصله مجاز از نقطه نقشه برای ثبت ورود و خروج موبایلی کارکنان.',
  coordinates: 'عرض و طول جغرافیایی نقطه انتخاب‌شده روی نقشه.',
} as const;

export function mockAddressFromMapPick(latitude: number, longitude: number) {
  return `تهران، خیابان انتخاب‌شده — ${latitude.toFixed(5)}° شمالی، ${longitude.toFixed(5)}° شرقی`;
}
