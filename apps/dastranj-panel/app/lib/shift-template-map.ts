import type { ShiftTemplateType } from './prisma-client';
import { resolveCalendarShiftTitle, type CalendarShiftType } from './calendar-shifts';

export type ShiftTemplateCategory = CalendarShiftType;

export const SHIFT_TEMPLATE_CATEGORIES: Array<{
  id: ShiftTemplateCategory;
  label: string;
  description: string;
  tone: 'green' | 'blue' | 'cyan' | 'amber' | 'purple';
}> = [
  {
    id: 'fixed',
    label: 'شیفت ثابت',
    description: 'شیفت ثابت برای تیم‌هایی مناسب است که ساعت ورود و خروج مشخص و تکرارشونده دارند.',
    tone: 'green',
  },
  {
    id: 'float-day',
    label: 'شیفت شناور شروع روز',
    description: 'کارمند در یک بازه مشخص وارد می‌شود و باید مدت کار موظف را کامل کند.',
    tone: 'blue',
  },
  {
    id: 'float-abs',
    label: 'شیفت شناور مطلق',
    description: 'برای تیم‌هایی که فقط مجموع زمان کار روزانه اهمیت دارد.',
    tone: 'cyan',
  },
  {
    id: 'split',
    label: 'شیفت دو تکه',
    description: 'وقتی ساعت کاری در دو بازه جدا از هم انجام می‌شود.',
    tone: 'amber',
  },
  {
    id: 'rotate',
    label: 'شیفت چرخشی',
    description: 'برای مجموعه‌هایی که الگوی شیفت بین افراد یا روزها جابه‌جا می‌شود.',
    tone: 'purple',
  },
];

const TEMPLATE_TO_CALENDAR: Record<ShiftTemplateType, CalendarShiftType> = {
  fixed: 'fixed',
  floating_day_start: 'float-day',
  floating_absolute: 'float-abs',
  split: 'split',
  rotate: 'rotate',
};

const CALENDAR_TO_TEMPLATE: Record<CalendarShiftType, ShiftTemplateType> = {
  fixed: 'fixed',
  'float-day': 'floating_day_start',
  'float-abs': 'floating_absolute',
  split: 'split',
  rotate: 'rotate',
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function templateTypeToCalendarShiftType(type: ShiftTemplateType): CalendarShiftType {
  return TEMPLATE_TO_CALENDAR[type] ?? 'fixed';
}

export function calendarShiftTypeToTemplateType(type: CalendarShiftType): ShiftTemplateType {
  return CALENDAR_TO_TEMPLATE[type];
}

export function extractTemplateWeekDays(shiftType: CalendarShiftType, shiftConfig: Record<string, unknown>) {
  switch (shiftType) {
    case 'float-day':
      return stringArray(shiftConfig.floatDayWorkingDays ?? shiftConfig.workingDays);
    case 'float-abs':
      return stringArray(shiftConfig.floatAbsWorkingDays ?? shiftConfig.workingDays);
    case 'split':
      return stringArray(shiftConfig.splitWorkingDays ?? shiftConfig.workingDays);
    case 'rotate':
      return stringArray(shiftConfig.workingDays);
    default:
      return stringArray(shiftConfig.workingDays);
  }
}

export function extractTemplateBreaks(shiftType: CalendarShiftType, shiftConfig: Record<string, unknown>) {
  switch (shiftType) {
    case 'float-day': {
      const floatDay = asObject(shiftConfig.floatingShiftStartOfDay);
      return Array.isArray(floatDay.rests) ? floatDay.rests : [];
    }
    case 'float-abs': {
      const floatAbs = asObject(shiftConfig.absoluteFloatingShift);
      return Array.isArray(floatAbs.rests) ? floatAbs.rests : [];
    }
    case 'split': {
      const split = asObject(shiftConfig.splitShift);
      return [...(Array.isArray(split.segment1Breaks) ? split.segment1Breaks : []), ...(Array.isArray(split.segment2Breaks) ? split.segment2Breaks : [])];
    }
    case 'rotate':
      return [];
    default:
      return Array.isArray(shiftConfig.rests) ? shiftConfig.rests : [];
  }
}

export function serializeShiftTemplateFromWizard(input: {
  shiftType: CalendarShiftType;
  shiftTitle: string;
  shiftConfig: Record<string, unknown>;
  description?: string;
  isActive?: boolean;
}) {
  const weekDays = extractTemplateWeekDays(input.shiftType, input.shiftConfig);
  const breaks = extractTemplateBreaks(input.shiftType, input.shiftConfig);
  const resolvedTitle = resolveCalendarShiftTitle(input.shiftTitle, input.shiftType);

  return {
    title: resolvedTitle,
    description: input.description?.trim() || null,
    type: calendarShiftTypeToTemplateType(input.shiftType),
    weekDays,
    config: {
      ...input.shiftConfig,
      shiftType: input.shiftType,
      title: resolvedTitle,
    },
    breaks,
    isActive: input.isActive ?? true,
  };
}
