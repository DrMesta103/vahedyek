'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  getPersianWeekdayName,
  parsePersianYmd,
  PERSIAN_WEEKDAY_NAMES,
} from '../../../../lib/calendar-dates';
import type { CalendarDayCell } from '../../../../lib/calendar-grid';
import { getDayDetails } from '../../../../lib/calendar-grid';
import {
  CALENDAR_SHIFT_TYPE_COLORS,
  type CalendarShiftType,
  type StoredCalendarShift,
} from '../../../../lib/calendar-shifts';
import { CardMenu } from '../../../../components/CardMenu';
import { PersianMonthCalendarEmptyDay, PersianMonthCalendarGrid } from '../../../../components/PersianMonthCalendarGrid';
import { CalendarNavPath } from '../../../../components/business-sidebar/CalendarNavPath';
import { getPersianDateParts } from './persian-date';
import { DeleteCalendarRangeDialog } from './bulk/DeleteCalendarRangeDialog';
import { AddCalendarEventDialog } from './event/AddCalendarEventDialog';
import { CreateWorkShiftDialog } from './shift/CreateWorkShiftDialog';
import {
  deleteCalendarEventsInRangeAction,
  deleteCalendarShiftsInRangeAction,
  deleteCalendarStoredEventAction,
  addCalendarWeekendOverrideAction,
} from '../../../../lib/actions';
import type { CalendarShiftDayContext, CalendarShiftWizardCalendar } from './shift/types';
import type { CalendarStoredEvent } from '../../../../lib/calendar-events';
import type { ShiftTemplatePickerItem } from '../../../../lib/shift-template-picker';

export type CalendarDetailsData = {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'inactive';
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
  shiftLegend: Array<{ key: string; label: string; color: string; count: number }>;
  eventCount: number;
  holidayCount: number;
  otherEventCount: number;
  gridLegend: Array<{ label: string; color: string }>;
  cells: CalendarDayCell[];
  defaultSelectedDay: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  prevMonth: { year: number; month: number };
  nextMonth: { year: number; month: number };
  shiftTemplates: ShiftTemplatePickerItem[];
};

type CalendarDetailsViewProps = {
  calendar: CalendarDetailsData;
};

function formatSelectedDate(year: number, month: number, day: number) {
  const monthPart = String(month).padStart(2, '0');
  const dayPart = String(day).padStart(2, '0');
  return `${year}/${monthPart}/${dayPart}`;
}

export function CalendarDetailsView({ calendar }: CalendarDetailsViewProps) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(calendar.defaultSelectedDay);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [shiftDialogFromDay, setShiftDialogFromDay] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventDialogFromDay, setEventDialogFromDay] = useState(false);
  const [deleteShiftsDialogOpen, setDeleteShiftsDialogOpen] = useState(false);
  const [deleteEventsDialogOpen, setDeleteEventsDialogOpen] = useState(false);

  useEffect(() => {
    setSelectedDay(calendar.defaultSelectedDay);
  }, [calendar.defaultSelectedDay, calendar.viewMonth, calendar.viewYear]);

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

  const cells = useMemo(
    () =>
      calendar.cells.map((cell) => ({
        ...cell,
        isSelected: cell.day === selectedDay,
        isToday: cell.day !== null && cell.day === todayDay,
      })),
    [calendar.cells, selectedDay, todayDay],
  );

  const selectedCell = cells.find((cell) => cell.day === selectedDay) ?? null;
  const selectedDate = selectedCell?.date ?? formatSelectedDate(calendar.viewYear, calendar.viewMonth, selectedDay);

  const dayDetails = useMemo(
    () =>
      getDayDetails({
        date: selectedDate,
        weekends: calendar.weekends,
        singleHolidays: calendar.singleHolidays,
        shifts: calendar.shifts,
        excludedShiftDates: calendar.excludedShiftDates,
        weekendOverrideDates: calendar.weekendOverrideDates,
      }),
    [calendar.excludedShiftDates, calendar.shifts, calendar.singleHolidays, calendar.weekends, calendar.weekendOverrideDates, selectedDate],
  );

  const shiftDayContext = useMemo((): CalendarShiftDayContext | undefined => {
    if (!shiftDialogFromDay) return undefined;
    const ymd = parsePersianYmd(selectedDate);
    if (!ymd) return undefined;
    return {
      date: selectedDate,
      weekdayName: getPersianWeekdayName(ymd),
      isHoliday: dayDetails.isHoliday,
    };
  }, [dayDetails.isHoliday, selectedDate, shiftDialogFromDay]);

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

  const eventDayContext = useMemo(() => {
    if (!eventDialogFromDay) return undefined;
    const ymd = parsePersianYmd(selectedDate);
    return {
      date: selectedDate,
      weekdayName: ymd ? getPersianWeekdayName(ymd) : '',
    };
  }, [eventDialogFromDay, selectedDate]);

  const refreshDayDetails = () => router.refresh();

  const handleDeleteShiftsOnDay = async () => {
    if (!window.confirm('آیا از حذف شیفت‌های این روز مطمئن هستید؟')) return;

    await deleteCalendarShiftsInRangeAction({
      calendarId: calendar.id,
      startDate: selectedDate,
      endDate: selectedDate,
      weekdays: [...PERSIAN_WEEKDAY_NAMES],
    });
    refreshDayDetails();
  };

  const handleDeleteEvent = async (eventId: string) => {
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

  return (
    <div className="page-stack module-page calendar-details-page" dir="rtl" lang="fa">
      <CalendarNavPath calendarTitle={calendar.title} />
      <header className="calendar-details-header">
        <div className="calendar-details-title-row">
          <Link href="/calendars" className="calendar-details-back" aria-label="بازگشت به فهرست تقویم‌ها">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div className="calendar-details-title-copy">
            <div className="calendar-details-title-line">
              <h1>{calendar.title}</h1>
              <span className={`calendar-details-status-pill${calendar.status === 'active' ? '' : ' is-inactive'}`}>
                {calendar.status === 'active' ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
            <p>توضیحات : {calendar.description?.trim() ? calendar.description : 'ثبت نشده'}</p>
          </div>
        </div>
      </header>

      <div className="calendar-details-summary-row">
        <article className="calendar-details-summary-card is-shifts">
          <div className="calendar-details-summary-icon is-purple" aria-hidden>
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="calendar-details-summary-content">
            <h2>شیفت ها : {calendar.shiftCount}</h2>
            <div className="calendar-details-shift-legend">
              {calendar.shiftLegend.map((item) => (
                <span key={item.key}>
                  <i style={{ background: item.color }} />
                  {item.label}
                  <em>{item.count}</em>
                </span>
              ))}
            </div>
          </div>
        </article>

        <article className="calendar-details-summary-card is-events">
          <div className="calendar-details-summary-icon is-orange" aria-hidden>
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="calendar-details-summary-content">
            <h2>رویداد ها : {calendar.eventCount}</h2>
            <div className="calendar-details-event-metrics">
              <span>
                <i className="is-holiday" />
                تعطیلات: <em>{calendar.holidayCount}</em>
              </span>
              <span>
                <i className="is-muted" />
                سایر رویداد ها: <em>{calendar.otherEventCount}</em>
              </span>
            </div>
          </div>
        </article>
      </div>

      <div className="calendar-details-body">
        <section className="calendar-details-main">
          <div className="calendar-details-grid-legend">
            {calendar.gridLegend.map((item) => (
              <span key={item.label}>
                <i style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>

          <PersianMonthCalendarGrid
            monthTitle={`${calendar.monthName} ${calendar.viewYear}`}
            onPrev={() => goToMonth(calendar.prevMonth.year, calendar.prevMonth.month)}
            onNext={() => goToMonth(calendar.nextMonth.year, calendar.nextMonth.month)}
            canGoPrev={calendar.canGoPrev}
            canGoNext={calendar.canGoNext}
          >
            {cells.map((cell, index) =>
              cell.day ? (
                <DayCellButton
                  key={`${cell.date ?? 'day'}-${index}`}
                  cell={cell}
                  onSelect={() => {
                    if (cell.day) setSelectedDay(cell.day);
                  }}
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
                <h2>عملیات گروهی</h2>
                <p>برای بازه زمانی انتخابی روی شیفت‌ها و رویدادها عملیات انجام دهید.</p>
              </div>
            </header>
            <div className="calendar-details-bulk-grid">
              <button
                type="button"
                className="calendar-details-bulk-tile is-blue"
                onClick={() => openShiftDialog(false)}
              >
                <Plus className="h-5 w-5" />
                <span>افزودن شیفت</span>
              </button>
              <button
                type="button"
                className="calendar-details-bulk-tile is-indigo"
                onClick={() => openEventDialog(false)}
              >
                <Plus className="h-5 w-5" />
                <span>افزودن رویداد</span>
              </button>
              <button
                type="button"
                className="calendar-details-bulk-tile is-danger"
                onClick={() => setDeleteShiftsDialogOpen(true)}
              >
                <X className="h-5 w-5" />
                <span>حذف شیفت‌ها</span>
              </button>
              <button
                type="button"
                className="calendar-details-bulk-tile is-danger"
                onClick={() => setDeleteEventsDialogOpen(true)}
              >
                <Trash2 className="h-5 w-5" />
                <span>حذف رویدادها</span>
              </button>
            </div>
          </section>

          <section className="calendar-details-side-card">
            <header className="calendar-details-day-panel-head">
              <div>
                <h2>جزئیات روز</h2>
                <p>{selectedDate}</p>
              </div>
              {dayDetails.isHoliday ? <span className="calendar-details-holiday-pill">تعطیل</span> : null}
            </header>

            <div className="calendar-details-day-block">
              <div className="calendar-details-day-block-head">
                <h3>
                  شیفت‌های امروز <span>({dayDetails.shifts.length})</span>
                </h3>
                <button
                  type="button"
                  className="calendar-details-round-btn"
                  aria-label="افزودن شیفت"
                  onClick={() => openShiftDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {dayDetails.shifts.length > 0 ? (
                <div className="calendar-details-shift-list">
                  {dayDetails.shifts.map((shift) => {
                    const shiftColor = CALENDAR_SHIFT_TYPE_COLORS[shift.shiftType];

                    return (
                    <article
                      key={shift.id}
                      className="calendar-details-shift-item"
                      style={{ borderColor: `${shiftColor}66` }}
                    >
                      <span
                        className="calendar-details-shift-item-dot"
                        style={{ background: shiftColor }}
                        aria-hidden
                      />
                      <div className="calendar-details-shift-item-body">
                        <h4>
                          <span>عنوان:</span> {shift.title} ({shift.shiftTypeLabel})
                        </h4>
                        <p>
                          <span>توضیحات:</span> {shift.description}
                        </p>
                        <p>
                          <span>بازه زمانی شیفت:</span> {shift.timeRange}
                        </p>
                        <p>
                          <span>تعداد استراحت‌ها:</span>{' '}
                          {new Intl.NumberFormat('fa-IR').format(shift.breakCount)}
                        </p>
                        {shift.breakSummaries.map((line, index) => (
                          <p key={`${shift.id}-break-${index}`}>{line}</p>
                        ))}
                      </div>
                      <CardMenu
                        items={[
                          {
                            kind: 'action',
                            label: 'ویرایش',
                            icon: <Pencil className="h-4 w-4" strokeWidth={2.2} />,
                            onClick: () => openShiftDialog(true),
                          },
                          {
                            kind: 'action',
                            label: 'حذف',
                            tone: 'danger',
                            icon: <Trash2 className="h-4 w-4" strokeWidth={2.2} />,
                            onClick: () => void handleDeleteShiftsOnDay(),
                          },
                        ]}
                      />
                    </article>
                    );
                  })}
                </div>
              ) : (
                <p className="calendar-details-muted">
                  {dayDetails.isHoliday
                    ? 'این روز تعطیل است؛ می‌توانید شیفت ثبت کنید، اما در صورت کارکرد احتمال اعمال ضریب بیشتر (تعطیل/جمعه) وجود دارد.'
                    : 'هنوز شیفتی برای این روز ثبت نشده است.'}
                </p>
              )}
            </div>

            <div className="calendar-details-day-block">
              <div className="calendar-details-day-block-head">
                <h3>
                  رویدادها و تعطیلات <span>({dayDetails.events.length})</span>
                </h3>
                <button
                  type="button"
                  className="calendar-details-round-btn"
                  aria-label="افزودن رویداد"
                  onClick={() => openEventDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {dayDetails.events.length > 0 ? (
                <div className="calendar-details-event-list">
                  {dayDetails.events.map((event) => {
                    const isHolidayTone = event.tone === 'holiday' || event.tone === 'weekend';

                    return (
                      <article
                        key={event.id}
                        className={`calendar-details-event-item${isHolidayTone ? ' is-holiday' : ' is-other'}`}
                      >
                        <span className="calendar-details-event-item-dot" aria-hidden />
                        <div className="calendar-details-event-item-body">
                          <h4>
                            <span>عنوان:</span> {event.title}
                          </h4>
                          {event.holidayTypeLabel ? (
                            <p>
                              <span>نوع تعطیلی:</span> {event.holidayTypeLabel}
                            </p>
                          ) : null}
                          <p>
                            <span>توضیحات:</span> {event.description}
                          </p>
                        </div>
                        <CardMenu
                          items={[
                            {
                              kind: 'action',
                              label: 'ویرایش',
                              icon: <Pencil className="h-4 w-4" strokeWidth={2.2} />,
                              onClick: () => openEventDialog(true),
                            },
                            {
                              kind: 'action',
                              label: 'حذف',
                              tone: 'danger',
                              icon: <Trash2 className="h-4 w-4" strokeWidth={2.2} />,
                              onClick: () => void handleDeleteEvent(event.id),
                            },
                          ]}
                        />
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="calendar-details-muted">رویدادی برای این روز ثبت نشده است.</p>
              )}
            </div>
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
          router.refresh();
        }}
      />

      <AddCalendarEventDialog
        open={eventDialogOpen}
        calendarId={calendar.id}
        startDate={calendar.startDate}
        endDate={calendar.endDate}
        defaultDate={selectedDate}
        dayContext={eventDayContext}
        onClose={closeEventDialog}
        onSaved={() => {
          closeEventDialog();
          router.refresh();
        }}
      />

      <DeleteCalendarRangeDialog
        open={deleteShiftsDialogOpen}
        title="حذف بازه‌ای شیفت"
        lead="بازه حذف را انتخاب کنید."
        warning="توجه: تمام شیفت‌های موجود در بازه انتخابی حذف می‌شوند."
        submitLabel="حذف شیفت‌ها"
        calendarBounds={{ startDate: calendar.startDate, endDate: calendar.endDate }}
        defaultDate={selectedDate}
        onClose={() => setDeleteShiftsDialogOpen(false)}
        onConfirm={async (data) => {
          await deleteCalendarShiftsInRangeAction({
            calendarId: calendar.id,
            ...data,
          });
          router.refresh();
        }}
      />

      <DeleteCalendarRangeDialog
        open={deleteEventsDialogOpen}
        title="حذف بازه‌ی رویداد"
        lead="بازه حذف را انتخاب کنید."
        warning="توجه: تمام رویدادهای موجود در بازه انتخابی حذف می‌شوند."
        submitLabel="حذف رویدادها"
        calendarBounds={{ startDate: calendar.startDate, endDate: calendar.endDate }}
        defaultDate={selectedDate}
        onClose={() => setDeleteEventsDialogOpen(false)}
        onConfirm={async (data) => {
          await deleteCalendarEventsInRangeAction({
            calendarId: calendar.id,
            ...data,
          });
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
