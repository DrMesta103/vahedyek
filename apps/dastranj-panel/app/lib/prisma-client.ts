export { PrismaClient, Prisma } from '../../node_modules/.prisma/client/index.js';

export type ShiftTemplateType = 'fixed' | 'floating_day_start' | 'floating_absolute' | 'split' | 'rotate';

export type RequestReasonCategory =
  | 'daily_leave'
  | 'hourly_leave'
  | 'reward_leave'
  | 'unpaid_leave'
  | 'sick_leave'
  | 'overtime'
  | 'attendance'
  | 'remote_work'
  | 'mission'
  | 'salary_advance'
  | 'loan';

export type WorkGroupAccessLevel = 'employee' | 'lead' | 'manager';

export type Calendar = {
  id: string;
  title: string;
  description: string | null;
  yearLabel: string;
  startDate: string;
  endDate: string;
  weekends: unknown;
  singleHolidays: unknown;
  shiftTitle: string;
  shiftTypeLabel: string;
  shiftConfig: unknown;
  holidayCount: number;
  totalShiftDays: number;
  totalEventDays: number;
};

export type WorkPolicy = {
  id: string;
  title: string;
  description: string | null;
  calendarId: string | null;
  calendar?: { yearLabel: string } | null;
  sectionValues: unknown;
};
