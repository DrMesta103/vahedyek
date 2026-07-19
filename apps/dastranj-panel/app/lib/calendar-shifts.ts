export type CalendarShiftType = 'fixed' | 'float-day' | 'float-abs' | 'split' | 'rotate';

export const CALENDAR_SHIFT_TYPE_COLORS: Record<CalendarShiftType, string> = {
  fixed: '#22c55e',
  'float-day': '#3b82f6',
  'float-abs': '#06b6d4',
  split: '#eab308',
  rotate: '#a855f7',
};

export const CALENDAR_SHIFT_LEGEND = (
  Object.entries(CALENDAR_SHIFT_TYPE_COLORS) as Array<[CalendarShiftType, string]>
).map(([key, color]) => ({
  key,
  color,
  label:
    key === 'fixed'
      ? 'شیفت ثابت'
      : key === 'float-day'
        ? 'شیفت شناور (شروع روز)'
        : key === 'float-abs'
          ? 'شیفت شناور مطلق'
          : key === 'split'
            ? 'شیفت دو تکه'
            : 'شیفت چرخشی',
}));

export type StoredCalendarShift = {
  id: string;
  shiftType: CalendarShiftType;
  title: string;
  config: Record<string, unknown>;
  createdAt: string;
  sourceShiftTemplateId?: string;
};

export function getCalendarShiftTypeLabel(shiftType: string) {
  const item = CALENDAR_SHIFT_LEGEND.find((entry) => entry.key === shiftType);
  return item?.label ?? 'شیفت';
}

export function resolveCalendarShiftTitle(title: string, shiftType: string) {
  const trimmed = title.trim();
  return trimmed || getCalendarShiftTypeLabel(shiftType);
}

export type CalendarShiftConfigRoot = Record<string, unknown> & {
  shifts?: StoredCalendarShift[];
  excludedDates?: string[];
  weekendOverrides?: string[];
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function jsonObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function parseCalendarShiftConfig(value: unknown): CalendarShiftConfigRoot {
  return jsonObject(value) as CalendarShiftConfigRoot;
}

export function listCalendarShifts(shiftConfig: unknown): StoredCalendarShift[] {
  const root = parseCalendarShiftConfig(shiftConfig);
  if (Array.isArray(root.shifts)) {
    return root.shifts.filter(
      (item): item is StoredCalendarShift =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as StoredCalendarShift).id === 'string' &&
        typeof (item as StoredCalendarShift).title === 'string',
    );
  }

  if (typeof root.shiftType === 'string' && root.shiftType) {
    return [
      {
        id: 'legacy-shift',
        shiftType: root.shiftType as CalendarShiftType,
        title: String(root.title ?? ''),
        config: root,
        createdAt: '',
      },
    ];
  }

  return [];
}

export function countShiftsByType(shifts: StoredCalendarShift[]) {
  const counts: Record<CalendarShiftType, number> = {
    fixed: 0,
    'float-day': 0,
    'float-abs': 0,
    split: 0,
    rotate: 0,
  };

  for (const shift of shifts) {
    if (shift.shiftType in counts) {
      counts[shift.shiftType as CalendarShiftType] += 1;
    }
  }

  return counts;
}

export function listExcludedShiftDates(shiftConfig: unknown): string[] {
  const root = parseCalendarShiftConfig(shiftConfig);
  return stringArray(root.excludedDates);
}

export function listWeekendOverrideDates(shiftConfig: unknown): string[] {
  const root = parseCalendarShiftConfig(shiftConfig);
  return stringArray(root.weekendOverrides);
}
