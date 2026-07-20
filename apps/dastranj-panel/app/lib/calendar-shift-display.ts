import type { CalendarShiftType, StoredCalendarShift } from './calendar-shifts';

export type CalendarDayShiftDetails = {
  id: string;
  title: string;
  shiftType: CalendarShiftType;
  shiftTypeLabel: string;
  description: string;
  timeRange: string;
  breakCount: number;
  breakSummaries: string[];
};

const SHIFT_TYPE_LABELS: Record<CalendarShiftType, string> = {
  fixed: 'شیفت ثابت',
  'float-day': 'شیفت شناور (شروع روز)',
  'float-abs': 'شیفت شناور مطلق',
  split: 'شیفت دو تکه',
  rotate: 'شیفت چرخشی',
};

const REST_TYPE_LABELS = {
  fixed: 'بازه ثابت',
  floating: 'شناور',
} as const;

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function toFaDigits(value: string) {
  const digits = '۰۱۲۳۴۵۶۷۸۹';
  return value.replace(/\d/g, (char) => digits[Number(char)] ?? char);
}

function formatTimeRange(start: string, end: string, nextDay = false) {
  const suffix = nextDay ? ' (روز بعد)' : '';
  return toFaDigits(`${start} تا ${end}${suffix}`);
}

type RestRecord = {
  type?: string;
  start?: string;
  end?: string;
  endsNextDay?: boolean;
  deductFromWork?: boolean;
};

function listRests(config: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = config[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is RestRecord => Boolean(item) && typeof item === 'object');
    }
  }
  return [];
}

function summarizeRest(item: RestRecord) {
  const typeLabel = REST_TYPE_LABELS[item.type === 'floating' ? 'floating' : 'fixed'];
  const range =
    item.type === 'floating'
      ? '—'
      : toFaDigits(`${item.start ?? '00:00'} - ${item.end ?? '00:00'}`);
  const deduct = item.deductFromWork ? 'بله' : 'خیر';
  return `نوع استراحت: ${typeLabel} | بازه استراحت: ${range} | کسر از کار: ${deduct}`;
}

function summarizeFixedShift(config: Record<string, unknown>) {
  const fixed = asObject(config.fixedShift);
  const start = String(fixed.startTime ?? config.startTime ?? '08:00');
  const end = String(fixed.endTime ?? config.endTime ?? '16:30');
  const nextDay = Boolean(fixed.endsNextDay ?? config.nextDay);
  const rests = listRests(config, ['rests']);
  return {
    timeRange: formatTimeRange(start, end, nextDay),
    breakCount: rests.length,
    breakSummaries: rests.map(summarizeRest),
  };
}

function summarizeFloatDayShift(config: Record<string, unknown>) {
  const float = asObject(config.floatingShiftStartOfDay);
  const required = Number(float.requiredMinutes ?? 480) || 480;
  const hours = Math.floor(required / 60);
  const minutes = required % 60;
  const rests = listRests(config, ['floatDayRests']).length
    ? listRests(config, ['floatDayRests'])
    : listRests(float, ['rests']);
  return {
    timeRange: toFaDigits(`ورود ${float.bandwidthStart ?? '08:00'} تا ${float.bandwidthEnd ?? '16:00'} | موظفی ${hours}:${String(minutes).padStart(2, '0')}`),
    breakCount: rests.length,
    breakSummaries: rests.map(summarizeRest),
  };
}

function summarizeFloatAbsShift(config: Record<string, unknown>) {
  const float = asObject(config.absoluteFloatingShift);
  const start = String(float.startTime ?? '08:00');
  const end = String(float.endTime ?? '16:00');
  const nextDay = Boolean(float.endsNextDay);
  const required = Number(float.requiredMinutes ?? 480) || 480;
  const rests = listRests(config, ['floatAbsRests']).length
    ? listRests(config, ['floatAbsRests'])
    : listRests(float, ['rests']);
  return {
    timeRange: toFaDigits(`${start} تا ${end}${nextDay ? ' (روز بعد)' : ''} | موظفی ${Math.floor(required / 60)}:${String(required % 60).padStart(2, '0')}`),
    breakCount: rests.length,
    breakSummaries: rests.map(summarizeRest),
  };
}

function summarizeSplitShift(config: Record<string, unknown>) {
  const split = asObject(config.splitShift);
  const rests = [...listRests(split, ['segment1Breaks']), ...listRests(split, ['segment2Breaks'])];
  return {
    timeRange: toFaDigits(
      `تکه ۱: ${split.segment1Start ?? '08:00'} تا ${split.segment1End ?? '12:00'} | تکه ۲: ${split.segment2Start ?? '16:00'} تا ${split.segment2End ?? '20:00'}`,
    ),
    breakCount: rests.length,
    breakSummaries: rests.map(summarizeRest),
  };
}

function summarizeRotateShift(config: Record<string, unknown>) {
  const items = Array.isArray(config.rotatingItems) ? config.rotatingItems : [];
  const segments = items.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
  const rests = segments.flatMap((segment) => listRests(segment, ['rests']));
  const pattern = segments
    .map((segment) => {
      const kind = String(segment.kind ?? 'morning');
      const repeat = Number(segment.repeat ?? 1) || 1;
      return `${kind}×${toFaDigits(String(repeat))}`;
    })
    .join('، ');
  return {
    timeRange: pattern ? toFaDigits(`الگوی چرخشی: ${pattern}`) : 'الگوی چرخشی ثبت نشده',
    breakCount: rests.length,
    breakSummaries: rests.map(summarizeRest),
  };
}

function restDurationMinutes(item: RestRecord) {
  if (item.type === 'floating' || !timeValue(item.start) || !timeValue(item.end)) return 0;
  const [startHour, startMinute] = item.start.split(':').map(Number);
  const [endHour, endMinute] = item.end.split(':').map(Number);
  const duration = endHour * 60 + endMinute - (startHour * 60 + startMinute) + (item.endsNextDay ? 1440 : 0);
  return duration > 0 ? duration : 0;
}

function timeValue(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function summarizeBreaksForShift(shift: StoredCalendarShift) {
  const config = shift.config;
  const fixed = asObject(config.fixedShift);
  const floatingDay = asObject(config.floatingShiftStartOfDay);
  const floatingAbsolute = asObject(config.absoluteFloatingShift);
  const split = asObject(config.splitShift);
  const rests = shift.shiftType === 'split'
    ? [...listRests(split, ['segment1Breaks']), ...listRests(split, ['segment2Breaks'])]
    : shift.shiftType === 'float-day'
      ? listRests(floatingDay, ['rests'])
      : shift.shiftType === 'float-abs'
        ? listRests(floatingAbsolute, ['rests'])
        : listRests(config, ['rests']);
  if (!rests.length) return 'استراحت ثبت نشده';
  const total = rests.reduce((sum, item) => sum + restDurationMinutes(item), 0);
  return total > 0 ? `${rests.length} استراحت، مجموع ${total} دقیقه` : `${rests.length} استراحت ثبت‌شده`;
}

export function summarizeShiftForDayPanel(shift: StoredCalendarShift): CalendarDayShiftDetails {
  const config = shift.config;
  const description =
    typeof config.description === 'string' && config.description.trim() ? config.description.trim() : 'ثبت نشده است';

  let summary = summarizeFixedShift(config);
  switch (shift.shiftType) {
    case 'float-day':
      summary = summarizeFloatDayShift(config);
      break;
    case 'float-abs':
      summary = summarizeFloatAbsShift(config);
      break;
    case 'split':
      summary = summarizeSplitShift(config);
      break;
    case 'rotate':
      summary = summarizeRotateShift(config);
      break;
    default:
      break;
  }

  return {
    id: shift.id,
    title: shift.title,
    shiftType: shift.shiftType,
    shiftTypeLabel: SHIFT_TYPE_LABELS[shift.shiftType] ?? shift.shiftType,
    description,
    timeRange: summary.timeRange,
    breakCount: summary.breakCount,
    breakSummaries: summary.breakSummaries,
  };
}
