'use client';

import { AlertTriangle, CalendarDays } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { addCalendarEventsAction } from '../../../../../lib/actions';
import { PERSIAN_WEEKDAY_NAMES, parsePersianYmd } from '../../../../../lib/calendar-dates';
import { MinimalScroll } from '../../../../components/MinimalScroll';
import {
  buildPersianDatePreset,
  CALENDAR_EVENT_PRESETS,
  normalizePersianDateInput,
} from '../../../../../lib/calendar-events';
import type { CalendarEventDayContext } from './types';

type AddCalendarEventDialogProps = {
  open: boolean;
  calendarId: string;
  startDate: string;
  endDate: string;
  defaultDate?: string;
  dayContext?: CalendarEventDayContext;
  onClose: () => void;
  onSaved: () => void;
};

function LockedEventDayField({ dayContext }: { dayContext: CalendarEventDayContext }) {
  return (
    <div className="calendar-shift-locked-day text-right">
      <div className="flex flex-row-reverse items-center justify-end gap-2 text-base font-black text-white">
        <span>تاریخ رویداد</span>
        <CalendarDays className="h-5 w-5 text-slate-300" />
      </div>
      <div className="calendar-shift-locked-day-value">
        <strong>{dayContext.date}</strong>
      </div>
      <p className="calendar-shift-locked-day-hint">این رویداد فقط برای همین روز ثبت می‌شود.</p>
    </div>
  );
}

function toggleDay(list: string[], day: string) {
  return list.includes(day) ? list.filter((item) => item !== day) : [...list, day];
}

export function AddCalendarEventDialog({
  open,
  calendarId,
  startDate,
  endDate,
  defaultDate,
  dayContext,
  onClose,
  onSaved,
}: AddCalendarEventDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayConfirmOpen, setHolidayConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ignoreBackdropClickRef = useRef(false);
  const holidayConfirmOpenRef = useRef(false);
  holidayConfirmOpenRef.current = holidayConfirmOpen;

  const anchorDate = useMemo(() => {
    const preferred = defaultDate ? parsePersianYmd(normalizePersianDateInput(defaultDate)) : null;
    if (preferred) return preferred;
    const start = parsePersianYmd(startDate);
    if (start) return start;
    return null;
  }, [defaultDate, startDate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const initial = defaultDate ? normalizePersianDateInput(defaultDate) : buildPersianDatePreset('today', anchorDate ?? undefined);
    setTitle('');
    setDescription('');
    setRangeStart(initial);
    setRangeEnd(initial);
    setWeekdays([]);
    setIsHoliday(false);
    setHolidayConfirmOpen(false);
    setError(null);

    ignoreBackdropClickRef.current = true;
    const timer = window.setTimeout(() => {
      ignoreBackdropClickRef.current = false;
    }, 300);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (holidayConfirmOpenRef.current) {
        setHolidayConfirmOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [anchorDate, defaultDate, onClose, open]);

  if (!open || !mounted) return null;

  const isSingleDay = Boolean(dayContext);
  const canSave = isSingleDay
    ? Boolean(title.trim())
    : Boolean(title.trim() && rangeStart.trim() && rangeEnd.trim() && weekdays.length > 0);

  const applyPresetToField = (field: 'start' | 'end', preset: 'today' | 'month-start' | 'month-end' | 'year-start' | 'year-end') => {
    const source = field === 'start' ? rangeStart : rangeEnd;
    const anchor = parsePersianYmd(normalizePersianDateInput(source)) ?? anchorDate ?? undefined;
    const value = buildPersianDatePreset(preset, anchor);
    if (field === 'start') setRangeStart(value);
    else setRangeEnd(value);
  };

  const handleHolidayToggle = () => {
    if (isHoliday) {
      setIsHoliday(false);
      return;
    }
    setHolidayConfirmOpen(true);
  };

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);

    try {
      await addCalendarEventsAction({
        calendarId,
        title: title.trim(),
        description: description.trim() || undefined,
        category: (CALENDAR_EVENT_PRESETS as readonly string[]).includes(title.trim()) ? title.trim() : undefined,
        ...(dayContext
          ? { singleDate: dayContext.date }
          : { startDate: rangeStart, endDate: rangeEnd, weekdays }),
        isHoliday,
      });
      onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ثبت رویداد انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <>
      <div
        className="calendar-event-modal-backdrop"
        role="presentation"
        dir="rtl"
        lang="fa"
        onMouseDown={() => {
          if (ignoreBackdropClickRef.current || holidayConfirmOpen) return;
          onClose();
        }}
      >
        <MinimalScroll
          className="calendar-event-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-event-modal-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="calendar-event-modal-head">
            <h2 id="calendar-event-modal-title">{dayContext ? 'افزودن رویداد برای روز' : 'افزودن رویداد'}</h2>
            {dayContext ? (
              <p className="calendar-event-modal-lead">رویداد فقط برای {dayContext.date} ثبت می‌شود.</p>
            ) : null}
          </header>

          <div className="calendar-event-modal-sections">
            {dayContext ? (
              <section className="calendar-event-modal-section">
                <LockedEventDayField dayContext={dayContext} />
              </section>
            ) : null}

            <section className="calendar-event-modal-section">
              <header className="calendar-event-section-head">
                <h3>اطلاعات رویداد</h3>
                <CalendarDays className="h-4 w-4" aria-hidden />
              </header>

              <label className="calendar-event-field">
                <span>
                  عنوان <em>*</em>
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="عنوان رویداد را وارد کنید"
                />
              </label>

              <div className="calendar-event-presets">
                {CALENDAR_EVENT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={title === preset ? 'is-active' : ''}
                    onClick={() => setTitle(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <label className="calendar-event-field">
                <span>توضیحات</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="توضیحات رویداد (اختیاری)"
                  rows={2}
                />
              </label>
            </section>

            {!dayContext ? (
              <>
                <section className="calendar-event-modal-section">
                  <header className="calendar-event-section-head">
                    <h3>بازه ثبت رویداد</h3>
                    <CalendarDays className="h-4 w-4" aria-hidden />
                  </header>

                  <div className="calendar-event-date-grid">
                    <div className="calendar-event-date-col">
                      <label className="calendar-event-field">
                        <span>تاریخ شروع</span>
                        <input
                          type="text"
                          value={rangeStart}
                          onChange={(event) => setRangeStart(event.target.value)}
                          placeholder="1405/03/01"
                          dir="ltr"
                          className="is-ltr"
                        />
                      </label>
                      <div className="calendar-event-date-presets">
                        <button type="button" onClick={() => applyPresetToField('start', 'today')}>
                          امروز
                        </button>
                        <button type="button" onClick={() => applyPresetToField('start', 'month-start')}>
                          شروع ماه
                        </button>
                        <button type="button" onClick={() => applyPresetToField('start', 'year-start')}>
                          شروع سال
                        </button>
                      </div>
                    </div>

                    <div className="calendar-event-date-col">
                      <label className="calendar-event-field">
                        <span>تاریخ پایان</span>
                        <input
                          type="text"
                          value={rangeEnd}
                          onChange={(event) => setRangeEnd(event.target.value)}
                          placeholder="1405/03/31"
                          dir="ltr"
                          className="is-ltr"
                        />
                      </label>
                      <div className="calendar-event-date-presets">
                        <button type="button" onClick={() => applyPresetToField('end', 'month-end')}>
                          پایان ماه
                        </button>
                        <button type="button" onClick={() => applyPresetToField('end', 'year-end')}>
                          پایان سال
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="calendar-event-modal-section">
                  <header className="calendar-event-section-head">
                    <h3>روزهای هفته</h3>
                    <CalendarDays className="h-4 w-4" aria-hidden />
                  </header>

                  <div className="calendar-event-weekdays">
                    {PERSIAN_WEEKDAY_NAMES.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={weekdays.includes(day) ? 'is-active' : ''}
                        onClick={() => setWeekdays((prev) => toggleDay(prev, day))}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {weekdays.length === 0 ? (
                    <p className="calendar-event-hint">حداقل یک روز هفته را انتخاب کنید.</p>
                  ) : null}
                </section>
              </>
            ) : null}

            <section className="calendar-event-modal-section is-warning">
              <header className="calendar-event-section-head is-danger">
                <h3>اخطار</h3>
                <AlertTriangle className="h-4 w-4" aria-hidden />
              </header>

              <div className="calendar-event-toggle-row">
                <span>این رویداد تعطیل است</span>
                <button
                  type="button"
                  className={`calendar-event-toggle${isHoliday ? ' is-on' : ''}`}
                  role="switch"
                  aria-checked={isHoliday}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleHolidayToggle();
                  }}
                >
                  <span />
                </button>
              </div>
            </section>
          </div>

          {error ? <p className="calendar-event-error">{error}</p> : null}

          <footer className="calendar-event-modal-footer">
            <button type="button" className="calendar-event-submit" disabled={!canSave || saving} onClick={handleSave}>
              {saving ? 'در حال ثبت...' : 'ثبت رویداد'}
            </button>
            <button type="button" className="calendar-event-cancel" onClick={onClose}>
              انصراف
            </button>
          </footer>
        </MinimalScroll>
      </div>

      {holidayConfirmOpen ? (
        <div
          className="calendar-event-confirm-backdrop"
          role="presentation"
          dir="rtl"
          lang="fa"
          onMouseDown={(event) => {
            event.stopPropagation();
            setHolidayConfirmOpen(false);
          }}
        >
          <div
            className="calendar-event-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="calendar-event-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="calendar-event-confirm-head">
              <h3 id="calendar-event-confirm-title">فعال‌سازی تعطیلی</h3>
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </header>
            <p>
              {dayContext
                ? 'با فعال‌کردن تعطیلی، اگر برای این روز شیفت تعریف شده باشد، آن شیفت‌ها از تقویم حذف می‌شوند و دیگر امکان ثبت شیفت برای این روز وجود ندارد. آیا مطمئن هستید؟'
                : 'با فعال‌کردن تعطیلی، اگر برای روزهای انتخاب‌شده در بازه ثبت شیفت تعریف شده باشد، آن شیفت‌ها از تقویم حذف می‌شوند و دیگر امکان ثبت شیفت برای این روزها وجود ندارد. آیا مطمئن هستید؟'}
            </p>
            <footer className="calendar-event-confirm-actions">
              <button
                type="button"
                className="calendar-event-confirm-accept"
                onClick={() => {
                  setIsHoliday(true);
                  setHolidayConfirmOpen(false);
                }}
              >
                بله، تعطیل شود
              </button>
              <button type="button" className="calendar-event-confirm-decline" onClick={() => setHolidayConfirmOpen(false)}>
                انصراف
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>,
    document.body,
  );
}
