import { getPersianWeekdayName, parsePersianYmd } from './calendar-dates';
import { normalizePersianDateInput } from './calendar-events';

export type CalendarHolidayType = 'official' | 'organizational' | 'friday';

export type CalendarHolidayCoefficients = {
  year: number;
  weeklyRestDay: number;
  officialHoliday: number;
  organizationalHoliday: number;
  isConfigured: boolean;
};

export const CALENDAR_HOLIDAY_TYPE_OPTIONS: Array<{
  id: Exclude<CalendarHolidayType, 'friday'>;
  label: string;
  tooltip: string;
}> = [
  {
    id: 'official',
    label: 'تعطیلات رسمی',
    tooltip:
      'برای تعطیلات قانونی و مصوب (رسمی) استفاده کنید. در محاسبه حقوق و دستمزد، کارکرد این روزها با ضریب تعطیلات رسمی لحاظ می‌شود؛ انتخاب درست این نوع برای گزارش‌های حقوقی اهمیت دارد.',
  },
  {
    id: 'organizational',
    label: 'تعطیلات سازمانی',
    tooltip:
      'برای تعطیلات داخلی و تصمیم سازمان استفاده کنید. این نوع جدا از تعطیلات رسمی در محاسبه حقوق و دستمزد اعمال می‌شود و نباید به‌جای تعطیلات قانونی ثبت شود.',
  },
];

export const CALENDAR_ALL_HOLIDAY_TYPE_OPTIONS: Array<{
  id: CalendarHolidayType;
  label: string;
  tooltip: string;
  summary: string;
}> = [
  {
    id: 'official',
    label: 'تعطیلات رسمی',
    summary: 'تعطیلات مصوب تقویم رسمی کشور',
    tooltip:
      'برای تعطیلات قانونی و مصوب (رسمی) استفاده کنید. در محاسبه حقوق و دستمزد، کارکرد این روزها با ضریب تعطیلات رسمی لحاظ می‌شود؛ انتخاب درست این نوع برای گزارش‌های حقوقی اهمیت دارد.',
  },
  {
    id: 'organizational',
    label: 'تعطیلات سازمانی',
    summary: 'تعطیلات داخلی شرکت یا سازمان',
    tooltip:
      'برای تعطیلات داخلی و تصمیم سازمان استفاده کنید. این نوع جدا از تعطیلات رسمی در محاسبه حقوق و دستمزد اعمال می‌شود و نباید به‌جای تعطیلات قانونی ثبت شود.',
  },
  {
    id: 'friday',
    label: 'تعطیلات هفتگی',
    summary: 'روزهای تعطیل هفتگی مانند جمعه',
    tooltip:
      'برای ثبت روز به‌عنوان تعطیل هفتگی استفاده کنید. اگر کارمند در این روز کارکرد داشته باشد، ضریب تعطیلات هفتگی در حقوق و دستمزد اعمال می‌شود.',
  },
];

export const CALENDAR_FRIDAY_HOLIDAY_TYPE = {
  id: 'friday' as const,
  label: 'تعطیلات هفتگی',
  tooltip:
    'برای ثبت روز به‌عنوان تعطیل هفتگی استفاده کنید. اگر کارمند در این روز کارکرد داشته باشد، ضریب تعطیلات هفتگی در حقوق و دستمزد اعمال می‌شود.',
};

export function getHolidayTypeCoefficient(
  type: CalendarHolidayType,
  coefficients: Pick<CalendarHolidayCoefficients, 'weeklyRestDay' | 'officialHoliday' | 'organizationalHoliday'>,
) {
  if (type === 'official') return coefficients.officialHoliday;
  if (type === 'organizational') return coefficients.organizationalHoliday;
  return coefficients.weeklyRestDay;
}

export function getPayrollSettingsHrefForYear(year: number) {
  return `/business-settings/payroll-attendance/tenant?year=${year}`;
}

export function resolveCalendarEventTitle(input: {
  title: string;
  isHoliday: boolean;
  holidayType?: CalendarHolidayType;
}) {
  const trimmed = input.title.trim();
  if (trimmed) return trimmed;
  if (input.isHoliday && input.holidayType) {
    return getCalendarHolidayTypeLabel(input.holidayType);
  }
  return 'رویداد';
}

export function getCalendarHolidayTypeLabel(type: CalendarHolidayType | undefined) {
  if (type === 'official') return CALENDAR_HOLIDAY_TYPE_OPTIONS[0].label;
  if (type === 'organizational') return CALENDAR_HOLIDAY_TYPE_OPTIONS[1].label;
  if (type === 'friday') return CALENDAR_FRIDAY_HOLIDAY_TYPE.label;
  return '';
}

export function isPersianFridayDate(date: string) {
  const parts = parsePersianYmd(normalizePersianDateInput(date));
  if (!parts) return false;
  return getPersianWeekdayName(parts) === 'جمعه';
}

export function resolveHolidayTypeForDate(
  date: string,
  selectedType: Exclude<CalendarHolidayType, 'friday'>,
): CalendarHolidayType {
  return isPersianFridayDate(date) ? 'friday' : selectedType;
}

export function inferHolidayTypeFromLegacyEvent(input: {
  category?: string;
  title?: string;
  holidayType?: string;
}): CalendarHolidayType | undefined {
  if (input.holidayType === 'official' || input.holidayType === 'organizational' || input.holidayType === 'friday') {
    return input.holidayType;
  }

  const category = input.category?.trim();
  if (category === 'تعطیلات رسمی') return 'official';
  if (category === 'تعطیلات سازمانی') return 'organizational';

  const title = input.title?.trim();
  if (title === CALENDAR_FRIDAY_HOLIDAY_TYPE.label || title === 'تعطیلی جمعه' || title === 'تعطیل هفتگی') return 'friday';

  return undefined;
}
