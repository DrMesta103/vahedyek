'use client';

import type { ReactNode } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { PERSIAN_WEEKDAY_LABELS } from '../lib/calendar-dates';

export type PersianMonthCalendarGridProps = {
  monthTitle: string;
  onPrev?: () => void;
  onNext?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  legend?: ReactNode;
  toolbarExtra?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PersianMonthCalendarGrid({
  monthTitle,
  onPrev,
  onNext,
  canGoPrev = true,
  canGoNext = true,
  prevLabel = 'ماه قبل',
  nextLabel = 'ماه بعد',
  legend,
  toolbarExtra,
  children,
  className = '',
}: PersianMonthCalendarGridProps) {
  return (
    <div className={['persian-month-calendar-scope', className].filter(Boolean).join(' ')}>
      {legend ? <div className="calendar-details-grid-legend">{legend}</div> : null}

      <div className="calendar-details-month-shell">
        <header className="calendar-details-month-toolbar">
          <button
            type="button"
            className="calendar-details-month-nav"
            aria-label={prevLabel}
            disabled={!canGoPrev || !onPrev}
            onClick={onPrev}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="calendar-details-month-title">
            <CalendarDays className="h-4 w-4" aria-hidden />
            <strong>{monthTitle}</strong>
            {toolbarExtra ?? <ChevronLeft className="h-3.5 w-3.5 opacity-70" aria-hidden />}
          </div>

          <button
            type="button"
            className="calendar-details-month-nav"
            aria-label={nextLabel}
            disabled={!canGoNext || !onNext}
            onClick={onNext}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </header>

        <div className="calendar-details-month-grid">
          <div className="calendar-details-weekdays">
            {PERSIAN_WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="calendar-details-days">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function PersianMonthCalendarEmptyDay() {
  return <span className="calendar-details-day is-empty" aria-hidden />;
}
