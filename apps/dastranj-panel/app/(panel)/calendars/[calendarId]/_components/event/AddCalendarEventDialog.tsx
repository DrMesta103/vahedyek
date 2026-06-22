'use client';

import { AlertTriangle, Bell, CalendarDays, Check, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { addCalendarEventsAction } from '../../../../../lib/actions';
import { PERSIAN_WEEKDAY_NAMES, parsePersianYmd } from '../../../../../lib/calendar-dates';
import {
  type CalendarHolidayCoefficients,
  type CalendarHolidayType,
} from '../../../../../lib/calendar-event-types';
import { buildPersianDatePreset, normalizePersianDateInput } from '../../../../../lib/calendar-events';
import { ConfirmDialog } from '../../../../../components/ConfirmDialog';
import { MinimalScroll } from '../../../../../components/MinimalScroll';
import { CalendarHolidayTypeField } from './CalendarHolidayTypeField';
import type { CalendarEventDayContext } from './types';

type AddCalendarEventDialogProps = {
  open: boolean;
  calendarId: string;
  startDate: string;
  endDate: string;
  defaultDate?: string;
  dayContext?: CalendarEventDayContext;
  holidayCoefficients: CalendarHolidayCoefficients;
  onClose: () => void;
  onSaved: () => void;
};

type EventMode = 'regular' | 'holiday';

function LockedEventDayField({ dayContext }: { dayContext: CalendarEventDayContext }) {
  return (
    <div className="calendar-shift-locked-day text-right">
      <div className="flex flex-row-reverse items-center justify-end gap-2 text-base font-black text-white">
        <span>تاریخ رویداد</span>
        <CalendarDays className="h-5 w-5 text-slate-300" />
      </div>
      <div className="calendar-shift-locked-day-value">
        <strong>{dayContext.date}</strong>
        <span>{dayContext.weekdayName}</span>
      </div>
      <p className="calendar-shift-locked-day-hint">این رویداد فقط برای تاریخ انتخاب‌شده ثبت می‌شود.</p>
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
  holidayCoefficients,
  onClose,
  onSaved,
}: AddCalendarEventDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [eventMode, setEventMode] = useState<EventMode>('regular');
  const [holidayType, setHolidayType] = useState<CalendarHolidayType | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ignoreBackdropClickRef = useRef(false);

  const anchorDate = useMemo(() => {
    const preferred = defaultDate ? parsePersianYmd(normalizePersianDateInput(defaultDate)) : null;
    if (preferred) return preferred;
    const start = parsePersianYmd(startDate);
    if (start) return start;
    return null;
  }, [defaultDate, startDate]);

  const isSingleDay = Boolean(dayContext);
  const requiresHolidayType = eventMode === 'holiday';
  const holidayWarningDescription =
    dayContext && (dayContext.shiftCount ?? 0) > 0
      ? 'این روز دارای شیفت ثبت‌شده است. با ثبت رویداد تعطیلی، این روز به‌عنوان تعطیل شناخته می‌شود و ممکن است شیفت‌های آن روی محاسبات حقوق و دستمزد اثر متفاوت داشته باشند. آیا ادامه می‌دهید؟'
      : 'این رویداد باعث تعطیل شدن روز انتخاب‌شده می‌شود و ممکن است روی محاسبه حقوق و دستمزد، اضافه‌کاری و گزارش‌های حضور و غیاب اثر بگذارد. آیا ادامه می‌دهید؟';
  const holidayWarningConfirmLabel = dayContext && (dayContext.shiftCount ?? 0) > 0 ? 'ادامه و ثبت تعطیلی' : 'بله، ادامه';

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
    setEventMode('regular');
    setHolidayType(null);
    setConfirmOpen(false);
    setError(null);

    ignoreBackdropClickRef.current = true;
    const timer = window.setTimeout(() => {
      ignoreBackdropClickRef.current = false;
    }, 300);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (confirmOpen) {
          setConfirmOpen(false);
          return;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [anchorDate, confirmOpen, defaultDate, onClose, open]);

  useEffect(() => {
    if (eventMode !== 'holiday') {
      setHolidayType(null);
    }
  }, [eventMode]);

  const validationError = useMemo(() => {
    if (!title.trim()) return 'عنوان رویداد را وارد کنید.';
    if (!eventMode) return 'نوع رویداد را مشخص کنید.';
    if (requiresHolidayType && holidayType !== 'official' && holidayType !== 'organizational' && holidayType !== 'friday') {
      return 'نوع تعطیلی را انتخاب کنید.';
    }
    if (!isSingleDay && (!rangeStart.trim() || !rangeEnd.trim() || weekdays.length === 0)) {
      return 'نوع رویداد را مشخص کنید.';
    }
    return null;
  }, [eventMode, holidayType, isSingleDay, rangeEnd, rangeStart, requiresHolidayType, title, weekdays.length]);

  const canSave = validationError === null;

  const applyPresetToField = (field: 'start' | 'end', preset: 'today' | 'month-start' | 'month-end' | 'year-start' | 'year-end') => {
    const source = field === 'start' ? rangeStart : rangeEnd;
    const anchor = parsePersianYmd(normalizePersianDateInput(source)) ?? anchorDate ?? undefined;
    const value = buildPersianDatePreset(preset, anchor);
    if (field === 'start') setRangeStart(value);
    else setRangeEnd(value);
  };

  const persistEvent = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);

    const isHoliday = eventMode === 'holiday';
    const resolvedHolidayType = isHoliday ? holidayType ?? undefined : undefined;

    try {
      await addCalendarEventsAction({
        calendarId,
        title: title.trim(),
        description: description.trim() || undefined,
        ...(dayContext ? { singleDate: dayContext.date } : { startDate: rangeStart, endDate: rangeEnd, weekdays }),
        isHoliday,
        holidayType: resolvedHolidayType,
      });
      onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'رویداد ثبت نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!canSave || saving) {
      if (validationError) setError(validationError);
      return;
    }
    if (eventMode === 'holiday') {
      setConfirmOpen(true);
      return;
    }
    await persistEvent();
  };

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <div
        className="calendar-event-modal-backdrop"
        role="presentation"
        dir="rtl"
        lang="fa"
        onMouseDown={() => {
          if (ignoreBackdropClickRef.current || confirmOpen) return;
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
            <h2 id="calendar-event-modal-title">{dayContext ? 'افزودن رویداد برای روز انتخاب‌شده' : 'افزودن رویداد'}</h2>
            {dayContext ? <p className="calendar-event-modal-lead">این رویداد فقط برای تاریخ انتخاب‌شده ثبت می‌شود.</p> : null}
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
                <span>عنوان رویداد</span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="مثلاً: جلسه عمومی، تعطیلی سازمانی، مناسبت داخلی"
                />
                <small>عنوانی برای این رویداد وارد کنید؛ مثل تعطیلی سازمانی یا جلسه عمومی.</small>
              </label>

              <label className="calendar-event-field">
                <span>توضیحات رویداد</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="توضیحات تکمیلی رویداد"
                  rows={2}
                />
                <small>اگر توضیح بیشتری درباره این رویداد لازم است، اینجا وارد کنید.</small>
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
                </section>
              </>
            ) : null}

            <section className="calendar-event-modal-section">
              <header className="calendar-event-section-head">
                <h3 id="calendar-event-mode-heading">نوع رویداد</h3>
                <CalendarDays className="h-4 w-4" aria-hidden />
              </header>
              <p className="calendar-event-mode-intro">نوع را انتخاب کنید تا اثر این ثبت روی روز انتخاب‌شده روشن باشد.</p>

              <div className="calendar-event-mode-grid" role="radiogroup" aria-labelledby="calendar-event-mode-heading">
                <button
                  type="button"
                  role="radio"
                  aria-checked={eventMode === 'regular'}
                  className={`calendar-event-mode-card is-regular${eventMode === 'regular' ? ' is-active' : ''}`}
                  onClick={() => setEventMode('regular')}
                >
                  <span className="calendar-event-mode-card-icon" aria-hidden>
                    <Bell className="h-5 w-5" strokeWidth={2.1} />
                  </span>
                  <span className="calendar-event-mode-card-body">
                    <span className="calendar-event-mode-card-title">
                      <strong>رویداد عادی</strong>
                      <span className="calendar-event-mode-card-badge is-muted">یادآوری</span>
                    </span>
                    <p>رویداد عادی فقط برای یادآوری یا اطلاع‌رسانی است و روز را تعطیل نمی‌کند.</p>
                  </span>
                  <span className="calendar-event-mode-card-check" aria-hidden>
                    {eventMode === 'regular' ? <Check className="h-4 w-4" strokeWidth={2.6} /> : null}
                  </span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={eventMode === 'holiday'}
                  className={`calendar-event-mode-card is-holiday${eventMode === 'holiday' ? ' is-active' : ''}`}
                  onClick={() => setEventMode('holiday')}
                >
                  <span className="calendar-event-mode-card-icon" aria-hidden>
                    <ShieldAlert className="h-5 w-5" strokeWidth={2.1} />
                  </span>
                  <span className="calendar-event-mode-card-body">
                    <span className="calendar-event-mode-card-title">
                      <strong>رویداد تعطیلی</strong>
                      <span className="calendar-event-mode-card-badge is-payroll">حقوق و دستمزد</span>
                    </span>
                    <p>رویداد تعطیلی باعث می‌شود این روز به‌عنوان تعطیل شناخته شود و می‌تواند روی محاسبه حقوق و دستمزد، اضافه‌کاری و گزارش‌های حضور و غیاب اثر بگذارد.</p>
                  </span>
                  <span className="calendar-event-mode-card-check" aria-hidden>
                    {eventMode === 'holiday' ? <Check className="h-4 w-4" strokeWidth={2.6} /> : null}
                  </span>
                </button>
              </div>

              {eventMode === 'holiday' ? (
                <CalendarHolidayTypeField value={holidayType} coefficients={holidayCoefficients} onChange={setHolidayType} />
              ) : null}
            </section>

            {eventMode === 'holiday' ? (
              <section className="calendar-event-modal-section is-warning">
                <header className="calendar-event-section-head is-danger">
                  <h3>نکته حقوق و دستمزد</h3>
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                </header>
                <p className="calendar-event-hint">
                  ثبت رویداد تعطیلی می‌تواند در گزارش‌ها و محاسبات مرتبط با کار در تعطیل اثر بگذارد. این هشدار فقط برای شفاف‌سازی است و در این فاز منطق جدیدی برای حقوق و دستمزد اضافه نمی‌شود.
                </p>
              </section>
            ) : null}
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

      <ConfirmDialog
        open={confirmOpen}
        title="ثبت رویداد تعطیلی"
        description={holidayWarningDescription}
        confirmLabel={holidayWarningConfirmLabel}
        cancelLabel="انصراف"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          void persistEvent();
        }}
      />
    </>,
    document.body,
  );
}
