'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft } from 'lucide-react';
import {
  getPersianWeekdayName,
  parsePersianYmd,
  PERSIAN_WEEKDAY_NAMES,
  type PersianYmd,
} from '../../../../lib/calendar-dates';
import type { CalendarDayCell } from '../../../../lib/calendar-grid';
import { getDayDetails } from '../../../../lib/calendar-grid';
import { CALENDAR_SHIFT_TYPE_COLORS, type CalendarShiftType, type StoredCalendarShift } from '../../../../lib/calendar-shifts';
import { PersianMonthCalendarEmptyDay, PersianMonthCalendarGrid } from '../../../../components/PersianMonthCalendarGrid';
import { CalendarNavPath } from '../../../../components/business-sidebar/CalendarNavPath';
import { getPersianDateParts } from './persian-date';
import type { CalendarHolidayCoefficients } from '../../../../lib/calendar-event-types';
import { AddCalendarEventDialog } from './event/AddCalendarEventDialog';
import { GroupCalendarOperationsDialog } from './bulk/GroupCalendarOperationsDialog';
import { CreateWorkShiftDialog } from './shift/CreateWorkShiftDialog';
import {
  addCalendarWeekendOverrideAction,
  deleteCalendarStoredEventAction,
  deleteCalendarShiftsInRangeAction,
} from '../../../../lib/actions';
import type { CalendarShiftDayContext, CalendarShiftWizardCalendar } from './shift/types';
import type { CalendarStoredEvent } from '../../../../lib/calendar-events';
import type { ShiftTemplatePickerItem } from '../../../../lib/shift-template-picker';

export type CalendarDetailsData = {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'inactive';
  isIncomplete: boolean;
  yearLabel: string;
  yearNumber: number;
  viewYear: number;
  viewMonth: number;
  monthName: string;
  monthNumber: number;
  startDate: string;
  endDate: string;
  weekends: string[];
  weekendOverrideDates: string[];
  singleHolidays: CalendarStoredEvent[];
  shifts: StoredCalendarShift[];
  excludedShiftDates: string[];
  shiftCount: number;
  shiftTypes: CalendarShiftType[];
  shiftLegend: Array<{ key: string; label: string; color: string; count: number }>;
  eventCount: number;
  holidayCount: number;
  otherEventCount: number;
  policyCount: number;
  workGroupCount: number;
  gridLegend: Array<{ label: string; color: string }>;
  cells: CalendarDayCell[];
  defaultSelectedDay: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  prevMonth: { year: number; month: number };
  nextMonth: { year: number; month: number };
  shiftTemplates: ShiftTemplatePickerItem[];
  holidayCoefficients: CalendarHolidayCoefficients;
};

type CalendarDetailsViewProps = {
  calendar: CalendarDetailsData;
};

function formatSelectedDate(year: number, month: number, day: number) {
  const monthPart = String(month).padStart(2, '0');
  const dayPart = String(day).padStart(2, '0');
  return `${year}/${monthPart}/${dayPart}`;
}

function resolveCalendarStatus(status: 'active' | 'inactive', isIncomplete: boolean) {
  if (status === 'inactive') {
    return { label: 'غیرفعال', className: 'is-inactive' };
  }

  if (isIncomplete) {
    return { label: 'ناقص', className: 'is-incomplete' };
  }

  return { label: 'فعال', className: 'is-active' };
}

function incrementMonth(value: PersianYmd) {
  if (value.month === 12) {
    return { year: value.year + 1, month: 1, day: 1 };
  }
  return { year: value.year, month: value.month + 1, day: 1 };
}

function compareYearMonth(a: PersianYmd, b: PersianYmd) {
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
}

function buildMonthOptions(startDate: string, endDate: string) {
  const start = parsePersianYmd(startDate);
  const end = parsePersianYmd(endDate);
  if (!start || !end) return [];

  const options: Array<{ year: number; month: number; value: string; label: string }> = [];
  let cursor: PersianYmd = { year: start.year, month: start.month, day: 1 };

  while (compareYearMonth(cursor, end) <= 0) {
    options.push({
      year: cursor.year,
      month: cursor.month,
      value: `${cursor.year}-${cursor.month}`,
      label: `${cursor.month.toLocaleString('fa-IR')} / ${cursor.year.toLocaleString('fa-IR')}`,
    });
    cursor = incrementMonth(cursor);
  }

  return options;
}

function deriveDayStatus(input: {
  isHoliday: boolean;
  shiftCount: number;
  eventCount: number;
}) {
  if (input.isHoliday) return 'تعطیل';
  if (input.shiftCount > 0 || input.eventCount > 0) return 'کاری';
  return 'بدون تنظیم';
}

export function CalendarDetailsView({ calendar }: CalendarDetailsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [shiftDialogFromDay, setShiftDialogFromDay] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventDialogFromDay, setEventDialogFromDay] = useState(false);
  const [groupOpsDialogOpen, setGroupOpsDialogOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(searchParams.get('created') === '1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDay(null);
  }, [calendar.viewMonth, calendar.viewYear]);

  useEffect(() => {
    if (!toastVisible && !toastMessage) return;
    const timer = window.setTimeout(() => {
      setToastVisible(false);
      setToastMessage(null);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage, toastVisible]);

  const wizardCalendar: CalendarShiftWizardCalendar = useMemo(
    () => ({
      id: calendar.id,
      title: calendar.title,
      description: calendar.description,
      yearLabel: calendar.yearLabel,
      startDate: calendar.startDate,
      endDate: calendar.endDate,
      weekends: calendar.weekends,
      singleHolidays: calendar.singleHolidays,
    }),
    [calendar],
  );

  const todayDay = useMemo(() => {
    const persianToday = getPersianDateParts();

    if (persianToday.year !== calendar.viewYear || persianToday.month !== calendar.viewMonth) {
      return null;
    }

    return persianToday.day;
  }, [calendar.viewMonth, calendar.viewYear]);

  const monthOptions = useMemo(() => buildMonthOptions(calendar.startDate, calendar.endDate), [calendar.endDate, calendar.startDate]);
  const yearOptions = useMemo(
    () => Array.from(new Set(monthOptions.map((item) => item.year))).sort((a, b) => a - b),
    [monthOptions],
  );

  const filteredMonthOptions = useMemo(
    () => monthOptions.filter((item) => item.year === calendar.viewYear),
    [calendar.viewYear, monthOptions],
  );

  const cells = useMemo(
    () =>
      calendar.cells.map((cell) => ({
        ...cell,
        isSelected: cell.day === selectedDay,
        isToday: cell.day !== null && cell.day === todayDay,
      })),
    [calendar.cells, selectedDay, todayDay],
  );

  const selectedCell = selectedDay === null ? null : cells.find((cell) => cell.day === selectedDay) ?? null;
  const selectedDate =
    selectedCell?.date ?? (selectedDay ? formatSelectedDate(calendar.viewYear, calendar.viewMonth, selectedDay) : null);

  const dayDetails = useMemo(
    () =>
      selectedDate
        ? getDayDetails({
            date: selectedDate,
            weekends: calendar.weekends,
            singleHolidays: calendar.singleHolidays,
            shifts: calendar.shifts,
            excludedShiftDates: calendar.excludedShiftDates,
            weekendOverrideDates: calendar.weekendOverrideDates,
          })
        : { isHoliday: false, shifts: [], events: [] },
    [
      calendar.excludedShiftDates,
      calendar.shifts,
      calendar.singleHolidays,
      calendar.weekends,
      calendar.weekendOverrideDates,
      selectedDate,
    ],
  );

  const selectedDayStatus = deriveDayStatus({
    isHoliday: dayDetails.isHoliday,
    shiftCount: dayDetails.shifts.length,
    eventCount: dayDetails.events.length,
  });

  const supportedGridLegend = useMemo(() => {
    const shiftLegend = calendar.shiftLegend.filter((item) => item.count > 0).map((item) => ({ label: item.label, color: item.color }));
    const eventLegend = [
      ...(calendar.holidayCount > 0 ? [{ label: 'تعطیل', color: '#ef4444' }] : []),
      ...(calendar.eventCount > calendar.holidayCount ? [{ label: 'رویداد', color: '#94a3b8' }] : []),
    ];
    return [...shiftLegend, ...eventLegend];
  }, [calendar.eventCount, calendar.holidayCount, calendar.shiftLegend]);

  const shiftDayContext = useMemo((): CalendarShiftDayContext | undefined => {
    if (!shiftDialogFromDay || !selectedDate) return undefined;
    const ymd = parsePersianYmd(selectedDate);
    if (!ymd) return undefined;
    return {
      date: selectedDate,
      weekdayName: getPersianWeekdayName(ymd),
      isHoliday: dayDetails.isHoliday,
      shiftCount: dayDetails.shifts.length,
      eventCount: dayDetails.events.length,
    };
  }, [dayDetails.events.length, dayDetails.isHoliday, dayDetails.shifts.length, selectedDate, shiftDialogFromDay]);

  const eventDayContext = useMemo(() => {
    if (!eventDialogFromDay || !selectedDate) return undefined;
    const ymd = parsePersianYmd(selectedDate);
    return {
      date: selectedDate,
      weekdayName: ymd ? getPersianWeekdayName(ymd) : '',
      isHoliday: dayDetails.isHoliday,
      shiftCount: dayDetails.shifts.length,
      eventCount: dayDetails.events.length,
    };
  }, [dayDetails.events.length, dayDetails.isHoliday, dayDetails.shifts.length, eventDialogFromDay, selectedDate]);

  const refreshDayDetails = () => router.refresh();

  const handleDeleteShiftsOnDay = async () => {
    if (!selectedDate) return;
    if (!window.confirm('آیا از حذف شیفت این روز مطمئن هستید؟')) return;

    await deleteCalendarShiftsInRangeAction({
      calendarId: calendar.id,
      startDate: selectedDate,
      endDate: selectedDate,
      weekdays: [...PERSIAN_WEEKDAY_NAMES],
    });
    refreshDayDetails();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!selectedDate) return;
    if (!window.confirm('آیا از حذف این رویداد مطمئن هستید؟')) return;

    if (eventId.startsWith('weekend-')) {
      await addCalendarWeekendOverrideAction({ calendarId: calendar.id, date: selectedDate });
    } else {
      await deleteCalendarStoredEventAction({ calendarId: calendar.id, eventId });
    }
    refreshDayDetails();
  };

  const goToMonth = (year: number, month: number) => {
    router.push(`/calendars/${calendar.id}?jy=${year}&jm=${month}`, { scroll: false });
  };

  const handleYearChange = (nextYear: number) => {
    const nextMonth = monthOptions.some((item) => item.year === nextYear && item.month === calendar.viewMonth)
      ? calendar.viewMonth
      : monthOptions.find((item) => item.year === nextYear)?.month;
    if (!nextMonth) return;
    goToMonth(nextYear, nextMonth);
  };

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    if (!Number.isFinite(year) || !Number.isFinite(month)) return;
    goToMonth(year, month);
  };

  const openShiftDialog = (fromDay: boolean) => {
    setShiftDialogFromDay(fromDay);
    setShiftDialogOpen(true);
  };

  const closeShiftDialog = () => {
    setShiftDialogOpen(false);
    setShiftDialogFromDay(false);
  };

  const openEventDialog = (fromDay: boolean) => {
    setEventDialogFromDay(fromDay);
    setEventDialogOpen(true);
  };

  const closeEventDialog = () => {
    setEventDialogOpen(false);
    setEventDialogFromDay(false);
  };

  const headerStatus = resolveCalendarStatus(calendar.status, calendar.isIncomplete);

  return (
    <div className="page-stack module-page calendar-details-page" dir="rtl" lang="fa">
      {toastVisible ? <div className="calendar-page-toast">تقویم کاری با موفقیت ایجاد شد.</div> : null}
      {toastMessage ? <div className="calendar-page-toast">{toastMessage}</div> : null}

      <CalendarNavPath calendarTitle={calendar.title} />

      <header className="calendar-details-header">
        <div className="calendar-details-title-row">
          <Link href="/calendars" className="calendar-details-back" aria-label="بازگشت به فهرست تقویم‌ها">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div className="calendar-details-title-copy">
            <div className="calendar-details-title-line">
              <h1>{calendar.title}</h1>
              <span className={`module-status-pill ${headerStatus.className}`}>{headerStatus.label}</span>
            </div>
            <p className="calendar-details-subtitle">روزهای کاری، شیفت‌ها و رویدادهای این تقویم را مدیریت کنید.</p>
            <p>توضیحات: {calendar.description?.trim() ? calendar.description : 'ثبت نشده'}</p>
          </div>
        </div>
      </header>

      <div className="calendar-details-summary-row">
        <article className="calendar-details-summary-card is-shifts">
          <div className="calendar-details-summary-icon is-purple" aria-hidden>
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="calendar-details-summary-content">
            <h2>شیفت‌ها</h2>
            <strong>{calendar.shiftCount.toLocaleString('fa-IR')}</strong>
            {calendar.shiftCount > 0 ? (
              <div className="calendar-details-shift-legend">
                {calendar.shiftLegend
                  .filter((item) => item.count > 0)
                  .map((item) => (
                    <span key={item.key}>
                      <i style={{ background: item.color }} />
                      {item.label}
                      <em>{item.count.toLocaleString('fa-IR')}</em>
                    </span>
                  ))}
              </div>
            ) : (
              <p className="calendar-details-summary-empty">هنوز شیفتی برای این تقویم ثبت نشده است.</p>
            )}
          </div>
        </article>

        <article className="calendar-details-summary-card is-events">
          <div className="calendar-details-summary-icon is-orange" aria-hidden>
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="calendar-details-summary-content">
            <h2>رویدادها و تعطیلات</h2>
            <strong>{calendar.eventCount.toLocaleString('fa-IR')}</strong>
            {calendar.eventCount > 0 ? (
              <div className="calendar-details-event-metrics">
                <span>
                  <i className="is-holiday" />
                  تعطیلات <em>{calendar.holidayCount.toLocaleString('fa-IR')}</em>
                </span>
                <span>
                  <i className="is-muted" />
                  مناسبت‌ها <em>{calendar.otherEventCount.toLocaleString('fa-IR')}</em>
                </span>
              </div>
            ) : (
              <p className="calendar-details-summary-empty">هنوز رویدادی برای این تقویم ثبت نشده است.</p>
            )}
          </div>
        </article>

        <article className="calendar-details-summary-card">
          <div className="calendar-details-summary-icon is-slate" aria-hidden>
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="calendar-details-summary-content">
            <h2>سیاست‌های مرتبط</h2>
            <strong>{calendar.policyCount.toLocaleString('fa-IR')}</strong>
            <p className="calendar-details-summary-empty">
              {calendar.policyCount > 0 ? 'این تقویم در سیاست‌های کاری استفاده شده است.' : 'سیاست مرتبطی برای این تقویم ثبت نشده است.'}
            </p>
          </div>
        </article>

        <article className="calendar-details-summary-card">
          <div className="calendar-details-summary-icon is-slate" aria-hidden>
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="calendar-details-summary-content">
            <h2>گروه‌های کاری مرتبط</h2>
            <strong>{calendar.workGroupCount.toLocaleString('fa-IR')}</strong>
            <p className="calendar-details-summary-empty">
              {calendar.workGroupCount > 0 ? 'این تقویم از طریق سیاست‌ها به گروه‌های کاری متصل است.' : 'گروه کاری مرتبطی ثبت نشده است.'}
            </p>
          </div>
        </article>
      </div>

      <div className="calendar-details-body">
        <section className="calendar-details-main">
          {supportedGridLegend.length > 0 ? (
            <div className="calendar-details-grid-legend">
              {supportedGridLegend.map((item) => (
                <span key={item.label}>
                  <i style={{ background: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          ) : null}

          <PersianMonthCalendarGrid
            monthTitle={`${calendar.monthName} ${calendar.viewYear.toLocaleString('fa-IR')}`}
            onPrev={() => goToMonth(calendar.prevMonth.year, calendar.prevMonth.month)}
            onNext={() => goToMonth(calendar.nextMonth.year, calendar.nextMonth.month)}
            canGoPrev={calendar.canGoPrev}
            canGoNext={calendar.canGoNext}
            toolbarExtra={
              <div className="calendar-details-toolbar-selects">
                <select
                  className="calendar-details-toolbar-select"
                  value={String(calendar.viewYear)}
                  onChange={(event) => handleYearChange(Number(event.target.value))}
                  aria-label="انتخاب سال"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year.toLocaleString('fa-IR')}
                    </option>
                  ))}
                </select>
                <select
                  className="calendar-details-toolbar-select"
                  value={`${calendar.viewYear}-${calendar.viewMonth}`}
                  onChange={(event) => handleMonthChange(event.target.value)}
                  aria-label="انتخاب ماه"
                >
                  {filteredMonthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            }
          >
            {cells.map((cell, index) =>
              cell.day ? (
                <DayCellButton
                  key={`${cell.date ?? 'day'}-${index}`}
                  cell={cell}
                  onSelect={() => setSelectedDay(cell.day ?? null)}
                />
              ) : (
                <PersianMonthCalendarEmptyDay key={`empty-${index}`} />
              ),
            )}
          </PersianMonthCalendarGrid>
        </section>

        <aside className="calendar-details-sidebar">
          <section className="calendar-details-side-card">
            <header className="calendar-details-side-head">
              <CalendarDays className="h-5 w-5" aria-hidden />
              <div>
                <h2>عملیات گروهی تقویم</h2>
                <p>
                  از این بخش برای اعمال تغییرات روی چند روز یا یک بازه زمانی استفاده کنید؛ مثل افزودن شیفت یا حذف
                  رویداد در یک بازه.
                </p>
              </div>
            </header>
            <button type="button" className="calendar-details-bulk-entry" onClick={() => setGroupOpsDialogOpen(true)}>
              عملیات گروهی تقویم
            </button>
          </section>

          <section className="calendar-details-side-card">
            <header className="calendar-details-day-panel-head">
              <div>
                <h2>جزئیات روز انتخاب‌شده</h2>
                {selectedDate ? <p>{selectedDate}</p> : null}
              </div>
              {selectedDate ? <span className="calendar-details-holiday-pill">{selectedDayStatus}</span> : null}
            </header>

            {!selectedDate ? (
              <p className="calendar-details-muted">برای مشاهده جزئیات، یک روز را از تقویم انتخاب کنید.</p>
            ) : (
              <>
                <div className="calendar-details-day-actions">
                  <button type="button" className="calendar-details-side-action" onClick={() => openShiftDialog(true)}>
                    افزودن شیفت به این روز
                  </button>
                  <button type="button" className="calendar-details-side-action" onClick={() => openEventDialog(true)}>
                    افزودن رویداد به این روز
                  </button>
                  {dayDetails.shifts.length > 0 ? (
                    <button
                      type="button"
                      className="calendar-details-side-action is-danger"
                      onClick={() => void handleDeleteShiftsOnDay()}
                    >
                      حذف شیفت این روز
                    </button>
                  ) : null}
                </div>

                <div className="calendar-details-day-block">
                  <div className="calendar-details-day-block-head">
                    <h3>
                      شیفت‌های این روز <span>({dayDetails.shifts.length.toLocaleString('fa-IR')})</span>
                    </h3>
                  </div>

                  {dayDetails.shifts.length > 0 ? (
                    <div className="calendar-details-shift-list">
                      {dayDetails.shifts.map((shift) => {
                        const shiftColor = CALENDAR_SHIFT_TYPE_COLORS[shift.shiftType];

                        return (
                          <article key={shift.id} className="calendar-details-shift-item" style={{ borderColor: `${shiftColor}66` }}>
                            <span className="calendar-details-shift-item-dot" style={{ background: shiftColor }} aria-hidden />
                            <div className="calendar-details-shift-item-body">
                              <h4>{shift.title}</h4>
                              <p>{shift.shiftTypeLabel}</p>
                              <p>{shift.timeRange}</p>
                              <p>تعداد استراحت‌ها: {shift.breakCount.toLocaleString('fa-IR')}</p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="calendar-details-muted">
                      {dayDetails.isHoliday
                        ? 'این روز تعطیل است؛ در صورت نیاز می‌توانید برای همان روز شیفت تعریف کنید.'
                        : 'هنوز شیفتی برای این روز ثبت نشده است.'}
                    </p>
                  )}
                </div>

                <div className="calendar-details-day-block">
                  <div className="calendar-details-day-block-head">
                    <h3>
                      رویدادها و تعطیلات <span>({dayDetails.events.length.toLocaleString('fa-IR')})</span>
                    </h3>
                  </div>

                  {dayDetails.events.length > 0 ? (
                    <div className="calendar-details-event-list">
                      {dayDetails.events.map((event) => {
                        const isHolidayTone = event.tone === 'holiday' || event.tone === 'weekend';

                        return (
                          <article key={event.id} className={`calendar-details-event-item${isHolidayTone ? ' is-holiday' : ' is-other'}`}>
                            <span className="calendar-details-event-item-dot" aria-hidden />
                            <div className="calendar-details-event-item-body">
                              <h4>{event.title}</h4>
                              {event.holidayTypeLabel ? <p>نوع تعطیلی: {event.holidayTypeLabel}</p> : null}
                              <p>{event.description}</p>
                            </div>
                            <button
                              type="button"
                              className="calendar-details-inline-danger"
                              onClick={() => void handleDeleteEvent(event.id)}
                            >
                              حذف
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="calendar-details-muted">رویدادی برای این روز ثبت نشده است.</p>
                  )}
                </div>
              </>
            )}
          </section>
        </aside>
      </div>

      <CreateWorkShiftDialog
        open={shiftDialogOpen}
        calendar={wizardCalendar}
        shiftTemplates={calendar.shiftTemplates}
        dayContext={shiftDayContext}
        onClose={closeShiftDialog}
        onSaved={() => {
          closeShiftDialog();
          setToastMessage('شیفت برای روز انتخاب‌شده ثبت شد.');
          router.refresh();
        }}
      />

      <AddCalendarEventDialog
        open={eventDialogOpen}
        calendarId={calendar.id}
        startDate={calendar.startDate}
        endDate={calendar.endDate}
        defaultDate={selectedDate ?? calendar.startDate}
        dayContext={eventDayContext}
        holidayCoefficients={calendar.holidayCoefficients}
        onClose={closeEventDialog}
        onSaved={() => {
          closeEventDialog();
          setToastMessage('رویداد برای روز انتخاب‌شده ثبت شد.');
          router.refresh();
        }}
      />

      <GroupCalendarOperationsDialog
        open={groupOpsDialogOpen}
        calendar={{
          id: calendar.id,
          startDate: calendar.startDate,
          endDate: calendar.endDate,
          weekends: calendar.weekends,
          weekendOverrideDates: calendar.weekendOverrideDates,
          singleHolidays: calendar.singleHolidays,
          shifts: calendar.shifts,
          excludedShiftDates: calendar.excludedShiftDates,
          shiftTemplates: calendar.shiftTemplates,
          holidayCoefficients: calendar.holidayCoefficients,
        }}
        onClose={() => setGroupOpsDialogOpen(false)}
        onCompleted={(message) => {
          setGroupOpsDialogOpen(false);
          setToastMessage(message);
          router.refresh();
        }}
      />
    </div>
  );
}

const SHIFT_TYPE_ORDER: CalendarShiftType[] = ['fixed', 'float-day', 'float-abs', 'split', 'rotate'];

function orderedShiftTypes(types: CalendarShiftType[]) {
  return SHIFT_TYPE_ORDER.filter((type) => types.includes(type));
}

function DayCellButton({
  cell,
  onSelect,
}: {
  cell: CalendarDayCell & { isSelected?: boolean; isToday?: boolean };
  onSelect: () => void;
}) {
  const shiftBars = orderedShiftTypes(cell.shiftTypes);

  return (
    <button
      type="button"
      className={[
        'calendar-details-day',
        cell.isHoliday ? 'is-holiday' : '',
        cell.isToday ? 'is-today' : '',
        cell.isSelected ? 'is-selected' : '',
        shiftBars.length > 0 ? 'has-shifts' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
      aria-pressed={cell.isSelected}
      aria-current={cell.isToday ? 'date' : undefined}
    >
      {cell.isHoliday ? <span className="calendar-details-day-dot is-holiday" aria-hidden /> : null}
      {!cell.isHoliday && cell.hasOtherEvent ? <span className="calendar-details-day-dot is-other" aria-hidden /> : null}
      <span className={['calendar-details-day-num', cell.isToday ? 'is-today-mark' : ''].filter(Boolean).join(' ')}>
        {cell.day}
      </span>
      {shiftBars.length > 0 ? (
        <span className="calendar-details-day-shift-bars" aria-hidden>
          {shiftBars.map((type) => (
            <i key={type} style={{ background: CALENDAR_SHIFT_TYPE_COLORS[type] }} />
          ))}
        </span>
      ) : null}
    </button>
  );
}
