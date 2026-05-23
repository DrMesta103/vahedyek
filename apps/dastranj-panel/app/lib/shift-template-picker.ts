import type { ShiftTemplateType } from '../../node_modules/.prisma/client';
import type { CalendarShiftType } from './calendar-shifts';
import { templateTypeToCalendarShiftType } from './shift-template-map';

export type ShiftTemplatePickerItem = {
  id: string;
  title: string;
  description: string;
  shiftType: CalendarShiftType;
  config: Record<string, unknown>;
  weekDays: string[];
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function mapShiftTemplateRecord(input: {
  id: string;
  title: string;
  description: string | null;
  type: ShiftTemplateType;
  weekDays: unknown;
  config: unknown;
}): ShiftTemplatePickerItem {
  const config = asObject(input.config);
  const weekDays = Array.isArray(input.weekDays)
    ? input.weekDays.filter((item): item is string => typeof item === 'string')
    : stringArray(config.workingDays);

  return {
    id: input.id,
    title: input.title,
    description: input.description?.trim() || 'قالب ذخیره‌شده',
    shiftType: templateTypeToCalendarShiftType(input.type),
    config,
    weekDays,
  };
}
