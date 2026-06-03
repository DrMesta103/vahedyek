'use client';

import { AlertTriangle, Bell, CalendarDays, Check, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { addCalendarEventsAction } from '../../../../../lib/actions';
import { PERSIAN_WEEKDAY_NAMES, parsePersianYmd } from '../../../../../lib/calendar-dates';
import {
  CALENDAR_FRIDAY_HOLIDAY_TYPE,
  isPersianFridayDate,
  type CalendarHolidayType,
} from '../../../../../lib/calendar-event-types';
import { MinimalScroll } from '../../../../components/MinimalScroll';
import { buildPersianDatePreset, normalizePersianDateInput } from '../../../../../lib/calendar-events';
import { CalendarHolidayTypeField } from './CalendarHolidayTypeField';
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
  const [eventMode, setEventMode] = useState<EventMode>('regular');
  const [holidayType, setHolidayType] = useState<CalendarHolidayType | null>(null);
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

  const isSingleDay = Boolean(dayContext);
  const isFridayDay = dayContext?.weekdayName === 'جمعه' || (dayContext ? isPersianFridayDate(dayContext.date) : false);
  const onlyFridayInRange = !isSingleDay && weekdays.length > 0 && weekdays.every((day) => day === 'جمعه');
  const rangeIncludesFriday = !isSingleDay && weekdays.includes('جمعه');
  /** جمعه بودن روز / بازه؛ مستقل از eventMode (برای تأیید قبل از سوییچ مود) */
  const fridayOnlySelection = isFridayDay || onlyFridayInRange;
  const lockedFridayHoliday = eventMode === 'holiday' && fridayOnlySelection;

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

  useEffect(() => {
    if (eventMode !== 'holiday') {
      setHolidayType(null);
      return;
    }

    if (lockedFridayHoliday) {
      setHolidayType('friday');
      return;
    }

    setHolidayType((current) =>
      current === 'friday' ? null : current === 'official' || current === 'organizational' ? current : null,
    );
  }, [eventMode, lockedFridayHoliday]);

  const canSave = useMemo(() => {
    if (eventMode === 'holiday') {
      if (lockedFridayHoliday) {
        if (holidayType !== 'friday') return false;
      } else if (holidayType !== 'official' && holidayType !== 'organizational') {
        return false;
      }
    }
    if (isSingleDay) return true;
    return Boolean(rangeStart.trim() && rangeEnd.trim() && weekdays.length > 0);
  }, [eventMode, holidayType, isSingleDay, lockedFridayHoliday, rangeEnd, rangeStart, weekdays.length]);

  const applyPresetToField = (field: 'start' | 'end', preset: 'today' | 'month-start' | 'month-end' | 'year-start' | 'year-end') => {
    const source = field === 'start' ? rangeStart : rangeEnd;
    const anchor = parsePersianYmd(normalizePersianDateInput(source)) ?? anchorDate ?? undefined;
    const value = buildPersianDatePreset(preset, anchor);
    if (field === 'start') setRangeStart(value);
    else setRangeEnd(value);
  };

  const handleEventModeChange = (mode: EventMode) => {
    if (mode === 'holiday' && eventMode !== 'holiday') {
      setHolidayConfirmOpen(true);
      return;
    }
    setEventMode(mode);
  };

  const handleSave = async () => {
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
      setError(saveError instanceof Error ? saveError.message : 'ثبت رویداد انجام نشد.');
    } finally {
      setSaving(false);
    }
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
                <span>عنوان</span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="عنوان رویداد (اختیاری)"
                />
              </label>

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

            <section className="calendar-event-modal-section">
              <header className="calendar-event-section-head">
                <h3 id="calendar-event-mode-heading">نوع رویداد</h3>
                <CalendarDays className="h-4 w-4" aria-hidden />
              </header>
              <p className="calendar-event-mode-intro">نوع را انتخاب کنید؛ تعطیلی روی محاسبه حقوق و دستمزد اثر دارد.</p>

              <div
                className="calendar-event-mode-grid"
                role="radiogroup"
                aria-labelledby="calendar-event-mode-heading"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={eventMode === 'regular'}
                  className={`calendar-event-mode-card is-regular${eventMode === 'regular' ? ' is-active' : ''}`}
                  onClick={() => handleEventModeChange('regular')}
                >
                  <span className="calendar-event-mode-card-icon" aria-hidden>
                    <Bell className="h-5 w-5" strokeWidth={2.1} />
                  </span>
                  <span className="calendar-event-mode-card-body">
                    <span className="calendar-event-mode-card-title">
                      <strong>رویداد عادی</strong>
                      <span className="calendar-event-mode-card-badge is-muted">یادآوری</span>
                    </span>
                    <p>برای یادآوری یا رویدادهای غیرتعطیلی که در محاسبه حقوق به‌عنوان تعطیل محسوب نمی‌شوند.</p>
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
                  onClick={() => handleEventModeChange('holiday')}
                >
                  <span className="calendar-event-mode-card-icon" aria-hidden>
                    <ShieldAlert className="h-5 w-5" strokeWidth={2.1} />
                  </span>
                  <span className="calendar-event-mode-card-body">
                    <span className="calendar-event-mode-card-title">
                      <strong>رویداد تعطیلی</strong>
                      <span className="calendar-event-mode-card-badge is-payroll">حقوق و دستمزد</span>
                    </span>
                    <p>برای ثبت تعطیل با نوع مشخص (رسمی، سازمانی یا جمعه) که در سیستم حقوق و دستمزد اعمال می‌شود.</p>
                  </span>
                  <span className="calendar-event-mode-card-check" aria-hidden>
                    {eventMode === 'holiday' ? <Check className="h-4 w-4" strokeWidth={2.6} /> : null}
                  </span>
                </button>
              </div>

              {eventMode === 'holiday' ? (
                <CalendarHolidayTypeField
                  value={holidayType}
                  lockedFriday={lockedFridayHoliday}
                  rangeIncludesFriday={rangeIncludesFriday && !onlyFridayInRange}
                  onChange={setHolidayType}
                />
              ) : null}
            </section>

            {eventMode === 'holiday' ? (
              <section className="calendar-event-modal-section is-warning">
                <header className="calendar-event-section-head is-danger">
                  <h3>نکته حقوق و دستمزد</h3>
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                </header>
                <p className="calendar-event-hint">
                  انتخاب نوع تعطیلی (رسمی، سازمانی یا جمعه) مستقیماً در محاسبه حقوق و دستمزد اثر دارد. در روز تعطیل
                  همچنان می‌توانید شیفت ثبت کنید؛ در صورت کارکرد، ضریب مربوطه اعمال می‌شود.
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
              <h3 id="calendar-event-confirm-title">ثبت رویداد تعطیلی</h3>
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </header>
            <p>
              {fridayOnlySelection
                ? `برای این روزها فقط «${CALENDAR_FRIDAY_HOLIDAY_TYPE.label}» ثبت می‌شود و امکان انتخاب رسمی/سازمانی وجود ندارد. در صورت کارکرد، ضریب تعطیل هفتگی اعمال می‌شود. ادامه می‌دهید؟`
                : 'برای روزهای غیرتعطیل هفتگی باید یکی از دو نوع «تعطیلات رسمی» یا «تعطیلات سازمانی» را انتخاب کنید؛ ضرایب حقوق و دستمزد متفاوت است. در روز تعطیل هم می‌توانید شیفت ثبت کنید. ادامه می‌دهید؟'}
            </p>
            <footer className="calendar-event-confirm-actions">
              <button
                type="button"
                className="calendar-event-confirm-accept"
                onClick={() => {
                  setEventMode('holiday');
                  if (fridayOnlySelection) {
                    setHolidayType('friday');
                  } else {
                    setHolidayType(null);
                  }
                  setHolidayConfirmOpen(false);
                }}
              >
                بله، ادامه
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
