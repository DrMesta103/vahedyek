import { Prisma, type Calendar } from '../../node_modules/.prisma/client';
import { getOfficialHolidaysForYear } from './calendar-official-holidays';
import { prisma } from './prisma';

export type DefaultHolidayItem = { id: string; title: string; date: string };

export type DefaultCalendarTemplate = {
  id: string;
  title: string;
  description: string | null;
  yearLabel: string;
  startDate: string;
  endDate: string;
  weekends: string[];
  singleHolidays: DefaultHolidayItem[];
  shiftTitle: string;
  shiftTypeLabel: string;
  shiftConfig: Record<string, unknown>;
  holidayCount: number;
  totalShiftDays: number;
  totalEventDays: number;
};

function jsonArray<T>(value: Prisma.JsonValue | null | undefined): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function jsonObject(value: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function currentJalaliYearLabel() {
  const year = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric' }).format(new Date());
  return year.replace(/[^\d]/g, '');
}

function buildFallbackTemplate(yearLabel: string): Omit<DefaultCalendarTemplate, 'id'> {
  const weekends = ['جمعه'];
  const singleHolidays = getOfficialHolidaysForYear(yearLabel);
  const shiftConfig = {
    shiftType: 'fixed',
    mode: 'template',
    templateId: 'system-morning',
    title: 'شیفت صبح اداری',
    fixedShift: { startTime: '08:00', endTime: '16:30', endsNextDay: false },
    startTime: '08:00',
    endTime: '16:30',
    workingDays: ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه'],
    rests: [{ id: 'default-rest', type: 'fixed', start: '12:00', end: '12:30', duration: 30, unit: 'minutes', deductFromWork: true }],
  };

  return {
    title: `تقویم کاری ${yearLabel}`,
    description: `تقویم پایه شرکت برای سال ${yearLabel}`,
    yearLabel,
    startDate: `${yearLabel}/01/01`,
    endDate: `${yearLabel}/12/29`,
    weekends,
    singleHolidays,
    shiftTitle: 'شیفت صبح اداری',
    shiftTypeLabel: 'شیفت ثابت',
    shiftConfig,
    holidayCount: weekends.length + singleHolidays.length,
    totalShiftDays: 0,
    totalEventDays: singleHolidays.length,
  };
}

function mapCalendarToTemplate(calendar: Calendar): DefaultCalendarTemplate {
  return {
    id: calendar.id,
    title: calendar.title,
    description: calendar.description,
    yearLabel: calendar.yearLabel,
    startDate: calendar.startDate,
    endDate: calendar.endDate,
    weekends: jsonArray<string>(calendar.weekends),
    singleHolidays: jsonArray<DefaultHolidayItem>(calendar.singleHolidays),
    shiftTitle: calendar.shiftTitle,
    shiftTypeLabel: calendar.shiftTypeLabel,
    shiftConfig: jsonObject(calendar.shiftConfig),
    holidayCount: calendar.holidayCount,
    totalShiftDays: calendar.totalShiftDays,
    totalEventDays: calendar.totalEventDays,
  };
}

export async function ensureGlobalDefaultCalendar(yearLabel = currentJalaliYearLabel()) {
  const existing = await prisma.calendar.findFirst({
    where: { tenantId: null, yearLabel },
    orderBy: { createdAt: 'asc' },
  });

  if (existing) return existing;

  const fallback = buildFallbackTemplate(yearLabel);
  return prisma.calendar.create({
    data: {
      tenantId: null,
      title: fallback.title,
      description: fallback.description,
      yearLabel: fallback.yearLabel,
      startDate: fallback.startDate,
      endDate: fallback.endDate,
      weekends: fallback.weekends,
      singleHolidays: fallback.singleHolidays,
      shiftTitle: fallback.shiftTitle,
      shiftTypeLabel: fallback.shiftTypeLabel,
      shiftConfig: fallback.shiftConfig as Prisma.InputJsonObject,
      holidayCount: fallback.holidayCount,
      totalShiftDays: fallback.totalShiftDays,
      totalEventDays: fallback.totalEventDays,
      status: 'active',
    },
  });
}

export async function getGlobalDefaultCalendarTemplate() {
  const calendar = await ensureGlobalDefaultCalendar();
  return mapCalendarToTemplate(calendar);
}
