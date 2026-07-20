import type { CalendarShiftType } from './calendar-shifts';

const VALID_DAYS = new Set(['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']);
const VALID_TYPES = new Set<CalendarShiftType>(['fixed', 'float-day', 'float-abs', 'split']);

type Range = { start: number; end: number };

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function timeValue(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function minutes(value: string) {
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
}

function resolveRange(start: unknown, end: unknown, nextDay = false): Range | null {
  if (!timeValue(start) || !timeValue(end)) return null;
  const startMinutes = minutes(start);
  const endMinutes = minutes(end) + (nextDay ? 1440 : 0);
  return { start: startMinutes, end: endMinutes };
}

function normalizeSplitTimeline(first: Range, second: Range) {
  const normalizedSecond = { ...second };
  if (normalizedSecond.start < first.start) {
    normalizedSecond.start += 1440;
    normalizedSecond.end += 1440;
  }
  return { first, second: normalizedSecond };
}

function validateRange(start: unknown, end: unknown, nextDay = false, label = 'بازه زمانی') {
  const range = resolveRange(start, end, nextDay);
  if (!range) return [`${label} را با قالب ساعت معتبر وارد کنید.`];
  if (range.end <= range.start || range.end - range.start >= 1440) return [`${label} معتبر نیست.`];
  return [];
}

function validateOptionalRange(start: unknown, end: unknown, nextDay = false, label = 'بازه زمانی') {
  if (start == null || start === '') {
    if (end == null || end === '') return [];
    return [`${label} ناقص است.`];
  }
  if (end == null || end === '') return [`${label} ناقص است.`];
  return validateRange(start, end, nextDay, label);
}

function restRange(item: Record<string, unknown>) {
  return resolveRange(item.start, item.end, Boolean(item.endsNextDay));
}

function validateBreaks(value: unknown, workRange: Range | null, label = 'استراحت') {
  if (!Array.isArray(value)) return [`ساختار ${label}ها معتبر نیست.`];
  const errors: string[] = [];
  const ranges: Range[] = [];
  for (const item of value) {
    const rest = asObject(item);
    if (rest.type === 'floating') continue;
    const range = restRange(rest);
    if (!range || range.end <= range.start) {
      errors.push(`${label} باید مدت مثبت داشته باشد.`);
      continue;
    }
    if (workRange && (range.start < workRange.start || range.end > workRange.end)) errors.push(`${label} باید داخل بازه مربوط باشد.`);
    ranges.push(range);
  }
  ranges.sort((a, b) => a.start - b.start);
  for (let index = 1; index < ranges.length; index += 1) {
    if (ranges[index].start < ranges[index - 1].end) errors.push(`${label}ها نباید هم‌پوشانی داشته باشند.`);
  }
  return errors;
}

function validateFloatingBreaks(value: unknown, workRange: Range | null, label: string) {
  return validateBreaks(value, workRange, label);
}

export function validateShiftTemplateInput(input: { title: string; type: string; weekDays: unknown; config: unknown; breaks: unknown }) {
  const errors: string[] = [];
  const title = input.title.trim();
  if (!title) errors.push('عنوان قالب الزامی است.');
  if (title.length > 120) errors.push('عنوان قالب نباید بیشتر از ۱۲۰ کاراکتر باشد.');
  if (!VALID_TYPES.has(input.type as CalendarShiftType)) errors.push('نوع شیفت انتخاب‌شده قابل ثبت نیست.');

  const days = Array.isArray(input.weekDays) ? input.weekDays : [];
  if (days.length === 0) errors.push('حداقل یک روز کاری انتخاب کنید.');
  if (days.some((day) => typeof day !== 'string' || !VALID_DAYS.has(day))) errors.push('روزهای کاری معتبر نیستند.');

  const config = asObject(input.config);
  if (input.type === 'fixed') {
    const fixed = asObject(config.fixedShift);
    const start = fixed.startTime ?? config.startTime;
    const end = fixed.endTime ?? config.endTime;
    const nextDay = Boolean(fixed.endsNextDay ?? config.nextDay);
    errors.push(...validateRange(start, end, nextDay, 'بازه شیفت'));
    errors.push(...validateBreaks(input.breaks, resolveRange(start, end, nextDay)));
  } else if (input.type === 'float-day') {
    const floating = asObject(config.floatingShiftStartOfDay);
    const entryStart = floating.bandwidthStart;
    const entryEnd = floating.bandwidthEnd;
    errors.push(...validateRange(entryStart, entryEnd, Boolean(floating.bandwidthEndsNextDay), 'بازه مجاز ورود'));
    const required = Number(floating.requiredMinutes);
    if (!Number.isFinite(required) || required <= 0) errors.push('مدت کار موظف باید بیشتر از صفر باشد.');
    if ((floating.coreTimeStart && !floating.coreTimeEnd) || (!floating.coreTimeStart && floating.coreTimeEnd)) errors.push('هسته حضور ناقص است.');
    errors.push(...validateOptionalRange(floating.coreTimeStart, floating.coreTimeEnd, false, 'هسته حضور'));
    const entryRange = resolveRange(entryStart, entryEnd, Boolean(floating.bandwidthEndsNextDay));
    const workRange = timeValue(entryStart) && Number.isFinite(required) && required > 0
      ? { start: minutes(entryStart), end: minutes(entryStart) + required }
      : entryRange;
    errors.push(...validateFloatingBreaks(Array.isArray(floating.rests) ? floating.rests : input.breaks, workRange, 'استراحت شناور شروع روز'));
  } else if (input.type === 'float-abs') {
    const floating = asObject(config.absoluteFloatingShift);
    const required = Number(floating.requiredMinutes);
    if (!Number.isFinite(required) || required <= 0) errors.push('حداقل کارکرد روزانه باید بیشتر از صفر باشد.');
    const hasStart = floating.startTime != null && floating.startTime !== '';
    const hasEnd = floating.endTime != null && floating.endTime !== '';
    if (hasStart || hasEnd) errors.push(...validateOptionalRange(floating.startTime, floating.endTime, Boolean(floating.endsNextDay), 'بازه اختیاری ثبت ورود'));
    const workRange = hasStart && hasEnd ? resolveRange(floating.startTime, floating.endTime, Boolean(floating.endsNextDay)) : null;
    errors.push(...validateBreaks(Array.isArray(floating.rests) ? floating.rests : input.breaks, workRange, 'استراحت شناور مطلق'));
  } else if (input.type === 'split') {
    const split = asObject(config.splitShift);
    const first = resolveRange(split.segment1Start, split.segment1End, Boolean(split.segment1EndsNextDay));
    const second = resolveRange(split.segment2Start, split.segment2End, Boolean(split.segment2EndsNextDay));
    errors.push(...validateRange(split.segment1Start, split.segment1End, Boolean(split.segment1EndsNextDay), 'بازه اول'));
    errors.push(...validateRange(split.segment2Start, split.segment2End, Boolean(split.segment2EndsNextDay), 'بازه دوم'));
    if (first && second) {
      const timeline = normalizeSplitTimeline(first, second);
      if (timeline.second.start < timeline.first.end) errors.push('بازه‌های دو‌تکه نباید هم‌پوشانی داشته باشند.');
    }
    errors.push(...validateBreaks(split.segment1Breaks, first, 'استراحت بازه اول'));
    errors.push(...validateBreaks(split.segment2Breaks, second, 'استراحت بازه دوم'));
  }
  return { valid: errors.length === 0, errors };
}
