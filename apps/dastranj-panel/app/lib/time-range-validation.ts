export const MAX_TIME_RANGE_MINUTES = 24 * 60;

function parseTime(value: string) {
  const [hours = 0, minutes = 0] = value.split(':').map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

export function calculateTimeRangeDurationMinutes(start: string, end: string, nextDay = false) {
  const startMinutes = parseTime(start);
  const endMinutes = parseTime(end);
  return Math.max(endMinutes - startMinutes + (nextDay || endMinutes <= startMinutes ? MAX_TIME_RANGE_MINUTES : 0), 0);
}

export function validateTimeRangeUnder24Hours(start: string, end: string, nextDay = false, message = 'بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.') {
  if (!start || !end) return '';
  return calculateTimeRangeDurationMinutes(start, end, nextDay) >= MAX_TIME_RANGE_MINUTES ? message : '';
}

export function validateDurationUnder24Hours(minutes: number, message = 'بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.') {
  return minutes >= MAX_TIME_RANGE_MINUTES ? message : '';
}
