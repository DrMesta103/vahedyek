'use client';

import type { WorkReportDay } from '../lib/employee-work-report';
import { formatFaNumber } from '../lib/format-fa';

const BADGE_COLORS: Record<string, string> = {
  neutral: '#94a3b8',
  blue: '#3b82f6',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  violet: '#a855f7',
};

export function WorkReportCalendarDayCell({
  day,
  isSelected,
  isDimmed,
  onSelect,
}: {
  day: WorkReportDay;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: () => void;
}) {
  const dayNumber = Number(day.date.split('/')[2]);
  const indicators = day.statusBadges.slice(0, 3);
  const hasMission = day.status === 'مأموریت';
  const hasExpectedShift = day.expectedShifts.length > 0;

  return (
    <button
      type="button"
      className={[
        'calendar-details-day',
        day.isHoliday ? 'is-holiday' : '',
        day.isToday ? 'is-today' : '',
        isSelected ? 'is-selected' : '',
        indicators.length > 0 || hasExpectedShift ? 'has-shifts' : '',
        isDimmed ? 'is-dimmed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-current={day.isToday ? 'date' : undefined}
      aria-label={`${day.jalaliDate}، ${hasExpectedShift ? day.expectedShifts.map((shift) => shift.title).join('، ') : day.status}`}
      title={hasExpectedShift ? day.expectedShifts.map((shift) => shift.title).join('، ') : day.status}
    >
      {day.isHoliday ? <span className="calendar-details-day-dot is-holiday" aria-hidden /> : null}
      {!day.isHoliday && hasMission ? <span className="calendar-details-day-dot is-other" aria-hidden /> : null}
      {!day.isHoliday && hasExpectedShift ? <span className="calendar-details-day-dot is-shift" aria-hidden /> : null}
      <span className={['calendar-details-day-num', day.isToday ? 'is-today-mark' : ''].filter(Boolean).join(' ')}>
        {formatFaNumber(dayNumber, { useGrouping: false })}
      </span>
      {indicators.length > 0 ? (
        <span className="calendar-details-day-shift-bars" aria-hidden>
          {indicators.map((badge) => (
            <i key={badge.key} style={{ background: BADGE_COLORS[badge.tone] ?? BADGE_COLORS.neutral }} />
          ))}
        </span>
      ) : null}
    </button>
  );
}
