import type { LucideIcon } from 'lucide-react';
import { CalendarDays, MapPin, ShieldCheck, Users, Workflow } from 'lucide-react';

export type QuickSetupStepKey = 'location' | 'calendar' | 'policy' | 'employee' | 'work-group';

export type QuickSetupStep = {
  key: QuickSetupStepKey;
  title: string;
  subtitle: string;
  done: boolean;
  href: string;
  manageHref: string;
  count: number;
};

export type LocationSummaryItem = {
  id: string;
  title: string;
  description: string | null;
  radius: number;
};

export type CalendarSummary = {
  id: string;
  title: string;
  description: string;
  yearLabel: string;
  year: string;
  shiftTitle: string;
  shiftTypeLabel: string;
  holidayCount: number;
};

export type CompletedCalendarItem = {
  id: string;
  title: string;
  yearLabel: string;
  description?: string | null;
  shiftTitle?: string;
  shiftTypeLabel?: string;
  holidayCount?: number;
};

export type DefaultCalendarTemplate = CompletedCalendarItem & {
  startDate: string;
  endDate: string;
  weekends: string[];
  singleHolidays: Array<{ id: string; title: string; date: string }>;
  shiftConfig: Record<string, unknown>;
  totalShiftDays: number;
  totalEventDays: number;
};

export type QuickPolicySummary = {
  id: string;
  title: string;
  description: string;
  calendarId: string;
  calendarTitle: string;
  templateId: string;
  templateTitle: string;
  year: string;
};

export type QuickEmployeeSummary = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  contact: {
    type: 'phone' | 'email';
    value: string;
  };
  avatarUrl?: string;
};

export type QuickWorkGroupSummary = {
  id: string;
  title: string;
};

export const STEP_META: Record<
  QuickSetupStepKey,
  { icon: LucideIcon; details: string[] }
> = {
  location: {
    icon: MapPin,
    details: ['عنوان محل کار را ثبت کنید', 'شعاع مجاز حضور را مشخص کنید', 'بعد از ثبت، موقعیت در کل سیستم قابل استفاده می‌شود'],
  },
  calendar: {
    icon: CalendarDays,
    details: ['تقویم پایه سال کاری را تعیین کنید', 'تعطیلات سازمانی را وارد کنید', 'شیفت پیش‌فرض این تقویم را نهایی کنید'],
  },
  policy: {
    icon: ShieldCheck,
    details: ['سیاست حضور و غیاب را تعریف کنید', 'تقویم مرتبط را به سیاست وصل کنید', 'پارامترهای تاخیر، اضافه‌کاری و مرخصی را کامل کنید'],
  },
  employee: {
    icon: Users,
    details: ['اولین کارکنان را وارد کنید', 'اطلاعات پرسنلی و واحدها را ثبت کنید', 'آماده تخصیص به گروه‌های کاری شوید'],
  },
  'work-group': {
    icon: Workflow,
    details: ['گروه اجرایی را بسازید', 'افراد، محل کار و سیاست را متصل کنید', 'فاز راه‌اندازی سریع را نهایی کنید'],
  },
};
