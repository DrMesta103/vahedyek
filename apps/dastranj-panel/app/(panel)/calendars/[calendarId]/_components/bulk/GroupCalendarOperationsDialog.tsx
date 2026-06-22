'use client';

import { AlertTriangle, Bell, CalendarDays, Check, ChevronLeft, Clock3, ShieldAlert } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PersianDatePicker } from '@repo/ui';
import { addCalendarEventsAction, addCalendarShiftAction } from '../../../../../lib/actions';
import { expandCalendarEventDates, normalizePersianDateInput } from '../../../../../lib/calendar-events';
import { getDayDetails } from '../../../../../lib/calendar-grid';
import type { CalendarHolidayCoefficients, CalendarHolidayType } from '../../../../../lib/calendar-event-types';
import {
  formatPersianYmd,
  getPersianMonthLength,
  getPersianPartsFromDate,
  parsePersianYmd,
  PERSIAN_WEEKDAY_NAMES,
} from '../../../../../lib/calendar-dates';
import type { ShiftWizardSavePayload } from '../shift/CalendarShiftWizard';
import { CalendarShiftWizard } from '../shift/CalendarShiftWizard';
import { ConfirmDialog } from '../../../../../components/ConfirmDialog';
import { MinimalScroll } from '../../../../../components/MinimalScroll';
import { CalendarHolidayTypeField } from '../event/CalendarHolidayTypeField';
import type { CalendarStoredEvent } from '../../../../../lib/calendar-events';
import type { StoredCalendarShift } from '../../../../../lib/calendar-shifts';
import type { ShiftTemplatePickerItem } from '../../../../../lib/shift-template-picker';

type BulkOperationType = 'shift' | 'event' | null;

type GroupCalendarOperationsCalendar = {
  id: string;
  startDate: string;
  endDate: string;
  weekends: string[];
  weekendOverrideDates: string[];
  singleHolidays: CalendarStoredEvent[];
  shifts: StoredCalendarShift[];
  excludedShiftDates: string[];
  shiftTemplates: ShiftTemplatePickerItem[];
  holidayCoefficients: CalendarHolidayCoefficients;
};

type GroupCalendarOperationsDialogProps = {
  open: boolean;
  calendar: GroupCalendarOperationsCalendar;
  onClose: () => void;
  onCompleted: (message: string) => void;
};

type DayStats = {
  date: string;
  hasShifts: boolean;
  hasEvents: boolean;
  isHoliday: boolean;
};

function toggleDay(list: string[], day: string) {
  return list.includes(day) ? list.filter((item) => item !== day) : [...list, day];
}

function weekdayLabel(weekdays: string[]) {
  return weekdays.length > 0 ? weekdays.join('، ') : 'همه روزهای هفته';
}

function formatHolidayShiftCoefficientHint(coefficients: CalendarHolidayCoefficients) {
  if (!coefficients.isConfigured) {
    return 'اگر روی روزهای تعطیل شیفت ثبت شود، کارکرد آن روزها در حقوق و دستمزد با ضریب تعطیل (بیش از روز عادی) محاسبه می‌شود.';
  }

  return `اگر روی روزهای تعطیل شیفت ثبت شود، کارکرد آن روزها با ضریب بالاتر محاسبه می‌شود: تعطیلات رسمی ${coefficients.officialHoliday.toLocaleString('fa-IR')}، سازمانی ${coefficients.organizationalHoliday.toLocaleString('fa-IR')}، هفتگی ${coefficients.weeklyRestDay.toLocaleString('fa-IR')}.`;
}

function resolvePresetDate(
  preset: 'today' | 'month-start' | 'month-end' | 'year-start' | 'year-end',
  anchor?: { year: number; month: number; day: number },
) {
  const base = anchor ?? getPersianPartsFromDate();

  switch (preset) {
    case 'today':
      return formatPersianYmd(getPersianPartsFromDate());
    case 'month-start':
      return formatPersianYmd({ year: base.year, month: base.month, day: 1 });
    case 'month-end':
      return formatPersianYmd({ year: base.year, month: base.month, day: getPersianMonthLength(base.year, base.month) });
    case 'year-start':
      return formatPersianYmd({ year: base.year, month: 1, day: 1 });
    case 'year-end':
      return formatPersianYmd({ year: base.year, month: 12, day: getPersianMonthLength(base.year, 12) });
  }

  return formatPersianYmd(base);
}

function buildTargetDates(input: {
  startDate: string;
  endDate: string;
  weekdays: string[];
  bounds: { start: string; end: string };
}) {
  const start = parsePersianYmd(normalizePersianDateInput(input.startDate));
  const end = parsePersianYmd(normalizePersianDateInput(input.endDate));
  const boundsStart = parsePersianYmd(normalizePersianDateInput(input.bounds.start));
  const boundsEnd = parsePersianYmd(normalizePersianDateInput(input.bounds.end));
  if (!start || !end || !boundsStart || !boundsEnd) return [];
  return expandCalendarEventDates({
    startDate: input.startDate,
    endDate: input.endDate,
    weekdays: input.weekdays,
    bounds: { start: boundsStart, end: boundsEnd },
  });
}

function getDayStats(calendar: GroupCalendarOperationsCalendar, dates: string[]): DayStats[] {
  return dates.map((date) => {
    const details = getDayDetails({
      date,
      weekends: calendar.weekends,
      singleHolidays: calendar.singleHolidays,
      shifts: calendar.shifts,
      excludedShiftDates: calendar.excludedShiftDates,
      weekendOverrideDates: calendar.weekendOverrideDates,
    });

    return {
      date,
      hasShifts: details.shifts.length > 0,
      hasEvents: details.events.length > 0,
      isHoliday: details.isHoliday,
    };
  });
}

export function GroupCalendarOperationsDialog({ open, calendar, onClose, onCompleted }: GroupCalendarOperationsDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [operationType, setOperationType] = useState<BulkOperationType>(null);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [shiftDraft, setShiftDraft] = useState<ShiftWizardSavePayload | null>(null);
  const [applyShiftOnHolidays, setApplyShiftOnHolidays] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventMode, setEventMode] = useState<'regular' | 'holiday'>('regular');
  const [holidayType, setHolidayType] = useState<CalendarHolidayType | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningTitle, setWarningTitle] = useState('');
  const [warningDescription, setWarningDescription] = useState('');
  const [warningConfirmLabel, setWarningConfirmLabel] = useState('ادامه');
  const [warningCancelLabel, setWarningCancelLabel] = useState('انصراف');
  const [pendingSubmit, setPendingSubmit] = useState<(() => Promise<void>) | null>(null);
  const ignoreBackdropClickRef = useRef(false);

  const startAnchor = useMemo(() => parsePersianYmd(calendar.startDate), [calendar.startDate]);
  const endAnchor = useMemo(() => parsePersianYmd(calendar.endDate), [calendar.endDate]);
  const deferredRangeStart = useDeferredValue(rangeStart);
  const deferredRangeEnd = useDeferredValue(rangeEnd);
  const deferredWeekdays = useDeferredValue(weekdays);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setOperationType(null);
      setRangeStart('');
      setRangeEnd('');
      setWeekdays([]);
      setShiftDraft(null);
      setApplyShiftOnHolidays(false);
      setEventTitle('');
      setEventDescription('');
      setEventMode('regular');
      setHolidayType(null);
      setSaving(false);
      setError(null);
      setWarningOpen(false);
      setPendingSubmit(null);
      return;
    }

    ignoreBackdropClickRef.current = true;
    const timer = window.setTimeout(() => {
      ignoreBackdropClickRef.current = false;
    }, 300);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (warningOpen) {
        setWarningOpen(false);
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
  }, [onClose, open, warningOpen]);

  const targetDates = useMemo(
    () =>
      buildTargetDates({
        startDate: deferredRangeStart,
        endDate: deferredRangeEnd,
        weekdays: deferredWeekdays,
        bounds: { start: calendar.startDate, end: calendar.endDate },
      }),
    [calendar.endDate, calendar.startDate, deferredRangeEnd, deferredRangeStart, deferredWeekdays],
  );
  const parsedRangeStart = useMemo(() => parsePersianYmd(normalizePersianDateInput(rangeStart)), [rangeStart]);
  const parsedRangeEnd = useMemo(() => parsePersianYmd(normalizePersianDateInput(rangeEnd)), [rangeEnd]);
  const isRangeOrderValid = Boolean(
    !parsedRangeStart ||
      !parsedRangeEnd ||
      parsedRangeEnd.year > parsedRangeStart.year ||
      (parsedRangeEnd.year === parsedRangeStart.year &&
        (parsedRangeEnd.month > parsedRangeStart.month ||
          (parsedRangeEnd.month === parsedRangeStart.month && parsedRangeEnd.day >= parsedRangeStart.day))),
  );

  const totalTargetDays = targetDates.length;
  const previewStats = useMemo(() => (step === 4 ? getDayStats(calendar, targetDates) : []), [calendar, step, targetDates]);
  const holidayDayCount = previewStats.filter((item) => item.isHoliday).length;
  const targetDaysWithShifts = previewStats.filter((item) => item.hasShifts).length;
  const targetDaysWithEvents = previewStats.filter((item) => item.hasEvents).length;
  const conflictingShiftDayCount = targetDaysWithShifts;
  const emptyTargetDayCount = previewStats.filter((item) => !item.hasShifts).length;
  const emptyHolidayDayCount = previewStats.filter((item) => !item.hasShifts && item.isHoliday).length;
  const shiftAppliedDates = useMemo(
    () =>
      step === 4 && operationType === 'shift'
        ? previewStats
            .filter((item) => !item.hasShifts)
            .filter((item) => applyShiftOnHolidays || !item.isHoliday)
            .map((item) => item.date)
        : [],
    [applyShiftOnHolidays, operationType, previewStats, step],
  );
  const shiftAppliedHolidayCount = useMemo(
    () =>
      step === 4 && operationType === 'shift'
        ? previewStats.filter((item) => item.isHoliday && shiftAppliedDates.includes(item.date)).length
        : 0,
    [operationType, previewStats, shiftAppliedDates, step],
  );
  const eventAppliedDates = useMemo(
    () => (step === 4 && operationType === 'event' ? previewStats.filter((item) => !item.hasEvents).map((item) => item.date) : []),
    [operationType, previewStats, step],
  );

  const largeOperation = totalTargetDays > 30;
  const canPreview = Boolean(operationType && rangeStart.trim() && rangeEnd.trim() && weekdays.length > 0 && totalTargetDays > 0);

  const resetOperationDraft = () => {
    setShiftDraft(null);
    setEventTitle('');
    setEventDescription('');
    setEventMode('regular');
    setHolidayType(null);
    setApplyShiftOnHolidays(false);
    setError(null);
  };

  const applyPresetToField = (field: 'start' | 'end', preset: 'today' | 'month-start' | 'month-end' | 'year-start' | 'year-end') => {
    const source = field === 'start' ? rangeStart : rangeEnd;
    const anchor = parsePersianYmd(normalizePersianDateInput(source)) ?? startAnchor ?? endAnchor ?? undefined;
    const value = resolvePresetDate(preset, anchor);
    if (field === 'start') setRangeStart(value);
    else setRangeEnd(value);
  };

  const openWarning = (
    title: string,
    description: string,
    confirmLabel: string,
    action: () => Promise<void>,
    cancelLabel = 'انصراف',
  ) => {
    setWarningTitle(title);
    setWarningDescription(description);
    setWarningConfirmLabel(confirmLabel);
    setWarningCancelLabel(cancelLabel);
    setPendingSubmit(() => action);
    setWarningOpen(true);
  };

  const applyShift = async () => {
    if (!shiftDraft) return;
    if (shiftAppliedDates.length === 0) {
      setError('با این بازه و روزهای انتخاب‌شده، هیچ روزی برای اعمال عملیات وجود ندارد.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payloadConfig = {
        ...shiftDraft.shiftConfig,
        includedDates: shiftAppliedDates,
        workingDays: [] as string[],
        floatDayWorkingDays: [] as string[],
        floatAbsWorkingDays: [] as string[],
        splitWorkingDays: [] as string[],
      };

      await addCalendarShiftAction({
        calendarId: calendar.id,
        shiftType: shiftDraft.shiftType,
        shiftTitle: shiftDraft.shiftTitle,
        shiftConfig: payloadConfig,
      });

      onCompleted(`شیفت روی ${shiftAppliedDates.length.toLocaleString('fa-IR')} روز از بازه انتخاب‌شده اعمال شد.`);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'عملیات گروهی انجام نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const applyEvent = async () => {
    if (!operationType || !eventTitle.trim()) {
      setError('عنوان رویداد را وارد کنید.');
      return;
    }

    if (eventMode === 'holiday' && !holidayType) {
      setError('نوع تعطیلی را انتخاب کنید.');
      return;
    }

    if (eventAppliedDates.length === 0) {
      setError('با این بازه و روزهای انتخاب‌شده، هیچ روزی برای اعمال عملیات وجود ندارد.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await addCalendarEventsAction({
        calendarId: calendar.id,
        title: eventTitle.trim(),
        description: eventDescription.trim() || undefined,
        startDate: rangeStart,
        endDate: rangeEnd,
        weekdays,
        isHoliday: eventMode === 'holiday',
        holidayType: eventMode === 'holiday' ? holidayType ?? undefined : undefined,
      });

      onCompleted(`رویداد روی ${eventAppliedDates.length.toLocaleString('fa-IR')} روز از بازه انتخاب‌شده ثبت شد.`);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'عملیات گروهی انجام نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (saving || !canPreview) return;
    if (operationType === 'shift') {
      if (shiftAppliedDates.length === 0) {
        setError('با این بازه و روزهای انتخاب‌شده، هیچ روزی برای اعمال عملیات وجود ندارد.');
        return;
      }

      const shouldWarnHoliday = applyShiftOnHolidays && shiftAppliedHolidayCount > 0;
      if (shouldWarnHoliday) {
        openWarning(
          'ثبت شیفت در روز تعطیل',
          `${shiftAppliedHolidayCount.toLocaleString('fa-IR')} روز تعطیل در فهرست اعمال قرار دارد. ${formatHolidayShiftCoefficientHint(calendar.holidayCoefficients)} آیا ادامه می‌دهید؟`,
          'ادامه و اعمال شیفت',
          applyShift,
        );
        return;
      }

      await applyShift();
      return;
    }

    if (operationType === 'event') {
      if (eventAppliedDates.length === 0) {
        setError('با این بازه و روزهای انتخاب‌شده، هیچ روزی برای اعمال عملیات وجود ندارد.');
        return;
      }

      if (eventMode === 'holiday' && targetDaysWithShifts > 0) {
        openWarning(
          'ثبت رویداد تعطیلی',
          'برخی روزهای انتخاب‌شده دارای شیفت هستند. ثبت رویداد تعطیلی می‌تواند روی محاسبه شیفت، اضافه‌کاری و حقوق و دستمزد اثر بگذارد. آیا ادامه می‌دهید؟',
          'ادامه و ثبت تعطیلی',
          applyEvent,
        );
        return;
      }

      if (eventMode === 'holiday') {
        openWarning(
          'ثبت رویداد تعطیلی',
          'این رویداد باعث تعطیل شدن روزهای انتخاب‌شده می‌شود و ممکن است روی محاسبه حقوق و دستمزد، اضافه‌کاری و گزارش‌های حضور و غیاب اثر بگذارد. آیا ادامه می‌دهید؟',
          'بله، ادامه',
          applyEvent,
        );
        return;
      }

      await applyEvent();
    }
  };

  if (!open || !mounted) return null;

  const renderStepTitle = () => {
    switch (step) {
      case 1:
        return 'عملیات گروهی تقویم';
      case 2:
        return 'انتخاب بازه و روزها';
      case 3:
        return operationType === 'shift' ? 'تعریف شیفت' : 'تعریف رویداد';
      case 4:
        return 'پیش‌نمایش و تایید';
      default:
        return 'عملیات گروهی تقویم';
    }
  };

  const renderStepBody = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <p className="calendar-details-muted">از این بخش برای اعمال شیفت یا رویداد روی چند روز در یک بازه زمانی استفاده کنید.</p>
          <div className="calendar-details-bulk-grid">
            <button
              type="button"
              className="calendar-details-bulk-tile is-blue"
              onClick={() => {
                setOperationType('shift');
                resetOperationDraft();
                setStep(2);
              }}
            >
              <Clock3 className="h-5 w-5" />
              <span>افزودن شیفت به بازه</span>
              <small>یک شیفت را برای چند روز در یک بازه زمانی ثبت کنید.</small>
            </button>
            <button
              type="button"
              className="calendar-details-bulk-tile is-indigo"
              onClick={() => {
                setOperationType('event');
                resetOperationDraft();
                setStep(2);
              }}
            >
              <Bell className="h-5 w-5" />
              <span>افزودن رویداد به بازه</span>
              <small>یک رویداد عادی یا تعطیلی را برای چند روز در یک بازه زمانی ثبت کنید.</small>
            </button>
          </div>
          <p className="calendar-details-bulk-warning">
            عملیات گروهی فقط برای افزودن است و حذف گروهی در این فاز فعال نیست.
          </p>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <div className="calendar-delete-range-date-grid">
            <div className="calendar-delete-range-date-col">
              <label className="calendar-delete-range-field">
                <span>تاریخ شروع بازه</span>
                <div className="contract-timing-date-input">
                  <PersianDatePicker
                    value={rangeStart}
                    onChange={(next) => setRangeStart(normalizePersianDateInput(next))}
                    placeholder="1405/03/01"
                    className="contract-timing-date-picker-control"
                    containerClassName="contract-timing-date-picker"
                    calendarIconAriaLabel="باز کردن تقویم تاریخ شروع بازه"
                  />
                </div>
              </label>
              <div className="calendar-delete-range-presets">
                <button type="button" onClick={() => applyPresetToField('start', 'today')}>امروز</button>
                <button type="button" onClick={() => applyPresetToField('start', 'month-start')}>شروع ماه</button>
                <button type="button" onClick={() => applyPresetToField('start', 'year-start')}>شروع سال</button>
              </div>
            </div>

            <div className="calendar-delete-range-date-col">
              <label className="calendar-delete-range-field">
                <span>تاریخ پایان بازه</span>
                <div className="contract-timing-date-input">
                  <PersianDatePicker
                    value={rangeEnd}
                    onChange={(next) => setRangeEnd(normalizePersianDateInput(next))}
                    placeholder="1405/03/31"
                    className="contract-timing-date-picker-control"
                    containerClassName="contract-timing-date-picker"
                    calendarIconAriaLabel="باز کردن تقویم تاریخ پایان بازه"
                  />
                </div>
              </label>
              <div className="calendar-delete-range-presets">
                <button type="button" onClick={() => applyPresetToField('end', 'month-end')}>پایان ماه</button>
                <button type="button" onClick={() => applyPresetToField('end', 'year-end')}>پایان سال</button>
              </div>
            </div>
          </div>

          {rangeStart.trim() && rangeEnd.trim() && !isRangeOrderValid ? (
            <p className="calendar-delete-range-error">تاریخ پایان بازه نمی‌تواند قبل از تاریخ شروع بازه باشد.</p>
          ) : null}

          <div className="calendar-delete-range-weekdays-block">
            <span className="calendar-delete-range-weekdays-label">روزهای هدف در هفته</span>
            <div className="calendar-delete-range-weekdays">
              {PERSIAN_WEEKDAY_NAMES.map((day) => (
                <button key={day} type="button" className={weekdays.includes(day) ? 'is-active' : ''} onClick={() => setWeekdays((prev) => toggleDay(prev, day))}>
                  {day}
                </button>
              ))}
            </div>
            {weekdays.length === 0 ? <p className="calendar-delete-range-hint">حداقل یک روز هفته را انتخاب کنید.</p> : null}
          </div>

          <p className="calendar-details-bulk-warning">عملیات فقط روی روزهای انتخاب‌شده داخل این بازه اعمال می‌شود.</p>
          <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-7 text-slate-200">
            <div>تعداد روزهای هدف: {totalTargetDays.toLocaleString('fa-IR')}</div>
            <div>جزئیات تداخل و تعطیلی در مرحله پیش‌نمایش محاسبه می‌شود.</div>
          </div>
        </div>
      );
    }

    if (step === 3 && operationType === 'shift') {
      return (
        <div className="space-y-4">
          <p className="calendar-details-muted">این شیفت فقط روی روزهای هدف انتخاب‌شده اعمال خواهد شد.</p>
          <CalendarShiftWizard
            calendar={{
              id: calendar.id,
              title: '',
              description: null,
              yearLabel: '',
              startDate: calendar.startDate,
              endDate: calendar.endDate,
              weekends: calendar.weekends,
              singleHolidays: calendar.singleHolidays,
            }}
            initialShiftType="fixed"
            forcedIncludedDates={targetDates}
            hideWorkingDaysEditor
            persistedTemplates={calendar.shiftTemplates}
            hideTypePicker={false}
            compact
            submitLabel="ادامه به پیش‌نمایش"
            onSaveShift={async (payload) => {
              setShiftDraft(payload);
            }}
            onSaved={() => setStep(4)}
            onCancel={() => setStep(2)}
          />
          <div className="calendar-details-bulk-warning">
            تغییرات این فرم فقط برای عملیات گروهی فعلی استفاده می‌شود و قالب اصلی را تغییر نمی‌دهد.
          </div>
        </div>
      );
    }

    if (step === 3 && operationType === 'event') {
      return (
        <div className="space-y-5">
          <p className="calendar-details-muted">این رویداد فقط روی روزهای هدف انتخاب‌شده اعمال خواهد شد.</p>
          <section className="space-y-4 rounded-[18px] border border-white/10 bg-slate-950/40 p-4 text-right">
            <label className="calendar-event-field">
              <span>عنوان رویداد</span>
              <input
                type="text"
                value={eventTitle}
                onChange={(event) => setEventTitle(event.target.value)}
                placeholder="مثلاً: تعطیلی سازمانی، جلسه آموزشی، مناسبت داخلی"
              />
              <small>عنوانی برای این رویداد وارد کنید.</small>
            </label>
            <label className="calendar-event-field">
              <span>توضیحات رویداد</span>
              <textarea
                value={eventDescription}
                onChange={(event) => setEventDescription(event.target.value)}
                placeholder="توضیحات تکمیلی رویداد"
                rows={2}
              />
              <small>اگر توضیح بیشتری لازم است، اینجا وارد کنید.</small>
            </label>

            <div className="calendar-event-mode-grid" role="radiogroup" aria-label="نوع رویداد">
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
                  <p>رویداد عادی روزهای انتخاب‌شده را تعطیل نمی‌کند و فقط برای اطلاع‌رسانی استفاده می‌شود.</p>
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
                  <p>رویداد تعطیلی روزهای انتخاب‌شده را به‌عنوان تعطیل ثبت می‌کند و ممکن است روی محاسبه حقوق و دستمزد و حضور اثر بگذارد.</p>
                </span>
                <span className="calendar-event-mode-card-check" aria-hidden>
                  {eventMode === 'holiday' ? <Check className="h-4 w-4" strokeWidth={2.6} /> : null}
                </span>
              </button>
            </div>

            {eventMode === 'holiday' ? (
              <CalendarHolidayTypeField value={holidayType} coefficients={calendar.holidayCoefficients} onChange={setHolidayType} />
            ) : null}

            <p className="calendar-details-bulk-warning">این رویداد فقط برای روزهای هدف داخل بازه انتخاب‌شده ثبت می‌شود.</p>
          </section>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="space-y-6">
          <section className="rounded-[18px] border border-indigo-400/20 bg-indigo-950/30 p-4 text-right">
            <div className="text-lg font-black text-white">پیش‌نمایش</div>
            <div className="mt-3 space-y-2 text-sm leading-7 text-slate-100">
              <div>نوع عملیات: {operationType === 'shift' ? 'افزودن شیفت' : 'افزودن رویداد'}</div>
              <div>بازه: {rangeStart} تا {rangeEnd}</div>
              <div>روزهای هدف در هفته: {weekdayLabel(weekdays)}</div>
              <div>تعداد روزهای هدف: {totalTargetDays.toLocaleString('fa-IR')}</div>
              <div>روزهای دارای شیفت: {targetDaysWithShifts.toLocaleString('fa-IR')}</div>
              <div>روزهای دارای رویداد: {targetDaysWithEvents.toLocaleString('fa-IR')}</div>
              <div>روزهای تعطیل در بازه: {holidayDayCount.toLocaleString('fa-IR')}</div>
              <div>
                رفتار با تداخل:{' '}
                {operationType === 'shift'
                  ? `فقط ${shiftAppliedDates.length.toLocaleString('fa-IR')} روز خالی اعمال می‌شود${conflictingShiftDayCount > 0 ? ` و ${conflictingShiftDayCount.toLocaleString('fa-IR')} روز تداخل شیفت دارد` : ''}`
                  : 'رویدادهای تکراری برای همان روز ثبت نمی‌شوند'}
              </div>
              {largeOperation ? <div className="rounded-xl bg-amber-500/15 px-3 py-2 text-amber-100">این عملیات روی {totalTargetDays.toLocaleString('fa-IR')} روز اعمال می‌شود. قبل از ثبت، بازه و روزهای هفته را بررسی کنید.</div> : null}
              {operationType === 'event' && eventMode === 'holiday' && targetDaysWithShifts > 0 ? (
                <div className="rounded-xl bg-rose-500/15 px-3 py-2 text-rose-100">
                  برخی روزهای انتخاب‌شده شیفت دارند و ثبت رویداد تعطیلی می‌تواند روی محاسبات شیفت اثر بگذارد.
                </div>
              ) : null}
              {totalTargetDays === 0 ? <div className="rounded-xl bg-rose-500/15 px-3 py-2 text-rose-100">با این بازه و روزهای انتخاب‌شده، هیچ روزی برای اعمال عملیات وجود ندارد.</div> : null}
            </div>
          </section>

          {operationType === 'shift' && shiftDraft ? (
            <section className="rounded-[18px] border border-white/10 bg-slate-950/40 p-4 text-right">
              <div className="text-base font-black text-white">خلاصه شیفت</div>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
                <div>نوع شیفت: {shiftDraft.shiftType}</div>
                <div>عنوان: {shiftDraft.shiftTitle}</div>
                <div>تاریخ اعمال: فقط روزهای انتخاب‌شده داخل بازه</div>
                <div>روزهای اعمال‌شده: {shiftAppliedDates.length.toLocaleString('fa-IR')}</div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="text-sm font-bold text-white">وضعیت تداخل شیفت</div>

                {conflictingShiftDayCount > 0 ? (
                  <div className="rounded-xl border border-amber-400/25 bg-amber-950/30 px-3 py-3 text-sm leading-7 text-amber-100">
                    <div className="font-bold">{conflictingShiftDayCount.toLocaleString('fa-IR')} روز تداخل شیفت دارد.</div>
                    <p className="mt-1">این روزها از قبل شیفت دارند و شیفت جدید فقط روی روزهای خالی قابل اعمال است.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-950/20 px-3 py-3 text-sm leading-7 text-emerald-100">
                    در این بازه روزی با شیفت قبلی تداخل ندارد.
                  </div>
                )}

                <div className="space-y-1 text-sm leading-7 text-slate-200">
                  <div>روزهای دارای تداخل شیفت: {conflictingShiftDayCount.toLocaleString('fa-IR')}</div>
                  <div>روزهای خالی قابل اعمال: {emptyTargetDayCount.toLocaleString('fa-IR')}</div>
                  <div>روزهای نهایی پس از تنظیمات: {shiftAppliedDates.length.toLocaleString('fa-IR')}</div>
                </div>

                {emptyHolidayDayCount > 0 ? (
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <div className="text-sm font-bold text-white">اعمال روی روزهای تعطیل</div>
                    <p className="text-xs leading-6 text-slate-400">
                      {emptyHolidayDayCount.toLocaleString('fa-IR')} روز تعطیل خالی در این بازه وجود دارد.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={`rounded-full px-3 py-2 text-xs font-bold transition-colors ${!applyShiftOnHolidays ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                        onClick={() => setApplyShiftOnHolidays(false)}
                      >
                        روی روزهای تعطیل اعمال نشود
                      </button>
                      <button
                        type="button"
                        className={`rounded-full px-3 py-2 text-xs font-bold transition-colors ${applyShiftOnHolidays ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                        onClick={() => setApplyShiftOnHolidays(true)}
                      >
                        روی روزهای تعطیل هم اعمال شود
                      </button>
                    </div>
                    {applyShiftOnHolidays ? (
                      <div className="rounded-xl border border-rose-400/20 bg-rose-950/25 px-3 py-3 text-xs leading-6 text-rose-100">
                        {formatHolidayShiftCoefficientHint(calendar.holidayCoefficients)}
                      </div>
                    ) : (
                      <p className="text-xs leading-6 text-slate-400">
                        {emptyHolidayDayCount.toLocaleString('fa-IR')} روز تعطیل خالی از اعمال شیفت خارج می‌شود.
                      </p>
                    )}
                  </div>
                ) : null}

                {emptyTargetDayCount === 0 ? (
                  <div className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs leading-6 text-rose-100">
                    همه روزهای انتخاب‌شده از قبل شیفت دارند و امکان اعمال شیفت جدید وجود ندارد.
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {operationType === 'event' ? (
            <section className="rounded-[18px] border border-white/10 bg-slate-950/40 p-4 text-right">
              <div className="text-base font-black text-white">خلاصه رویداد</div>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
                <div>عنوان: {eventTitle || '-'}</div>
                <div>نوع: {eventMode === 'holiday' ? 'تعطیلی' : 'عادی'}</div>
                {eventMode === 'holiday' && holidayType ? <div>نوع تعطیلی: {holidayType}</div> : null}
                <div>رویدادهای ثبت‌شده: {eventAppliedDates.length.toLocaleString('fa-IR')}</div>
                <div>رفتار با تداخل: رویدادهای تکراری برای همان روز ثبت نمی‌شوند</div>
              </div>
            </section>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <button type="button" className="calendar-create-cancel" onClick={() => setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3 | 4)))}>
              <ChevronLeft className="h-4 w-4" />
              بازگشت
            </button>
            <button
              type="button"
              className="calendar-create-submit"
              disabled={saving || !canPreview || totalTargetDays === 0 || (operationType === 'shift' ? shiftAppliedDates.length === 0 : eventAppliedDates.length === 0)}
              onClick={() => void handleFinalSubmit()}
            >
              {saving
                ? 'در حال اعمال...'
                : operationType === 'shift'
                  ? 'اعمال شیفت روی روزهای انتخاب‌شده'
                  : 'اعمال رویداد روی روزهای انتخاب‌شده'}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const stepValid =
    (step === 1 && Boolean(operationType)) ||
    (step === 2 && Boolean(rangeStart.trim() && rangeEnd.trim() && weekdays.length > 0 && totalTargetDays > 0 && isRangeOrderValid)) ||
    (step === 3 && (operationType === 'shift' ? Boolean(shiftDraft) : Boolean(eventTitle.trim() && (eventMode === 'regular' || holidayType)))) ||
    step === 4;

  return createPortal(
    <>
      <div className="calendar-create-modal-backdrop" role="presentation" dir="rtl" lang="fa" onMouseDown={() => !ignoreBackdropClickRef.current && onClose()}>
        <MinimalScroll className="calendar-create-modal calendar-bulk-modal" role="dialog" aria-modal="true" aria-labelledby="group-calendar-ops-title" onMouseDown={(event) => event.stopPropagation()}>
          <header className="calendar-create-modal-head">
            <div className="flex items-center justify-between gap-3">
              <button type="button" className="calendar-details-back" onClick={() => (step === 1 ? onClose() : setStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4))} aria-label="بازگشت">
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <div className="text-right">
                <h2 id="group-calendar-ops-title">{renderStepTitle()}</h2>
                <p className="calendar-details-muted">از این بخش برای اعمال شیفت یا رویداد روی چند روز در یک بازه زمانی استفاده کنید.</p>
              </div>
            </div>
          </header>

          <div className="calendar-create-modal-body space-y-6">
            <div className="flex flex-wrap gap-2">
              {([1, 2, 3, 4] as const).map((item) => (
                <span key={item} className={`rounded-full px-3 py-1 text-xs font-bold ${step >= item ? 'bg-indigo-500/20 text-indigo-100' : 'bg-slate-800 text-slate-400'}`}>
                  {item}
                </span>
              ))}
            </div>

            {renderStepBody()}
          </div>

          <footer className="calendar-create-modal-footer">
            <button type="button" className="calendar-create-cancel" onClick={onClose}>
              انصراف
            </button>
            {step < 4 && !(step === 3 && operationType === 'shift') ? (
              <button
                type="button"
                className="calendar-create-submit"
                disabled={!stepValid || saving}
                onClick={() => {
                  if (step === 1 && operationType) {
                    setStep(2);
                    return;
                  }

                  if (step === 2) {
                    if (!rangeStart.trim()) {
                      setError('تاریخ شروع بازه را انتخاب کنید.');
                      return;
                    }
                    if (!rangeEnd.trim()) {
                      setError('تاریخ پایان بازه را انتخاب کنید.');
                      return;
                    }
                    if (!isRangeOrderValid) {
                      setError('تاریخ پایان بازه نمی‌تواند قبل از تاریخ شروع بازه باشد.');
                      return;
                    }
                    if (targetDates.length === 0) {
                      setError('با این بازه و روزهای انتخاب‌شده، هیچ روزی برای اعمال عملیات وجود ندارد.');
                      return;
                    }
                    setStep(3);
                    return;
                  }

                  if (step === 3 && operationType === 'event') {
                    if (!eventTitle.trim()) {
                      setError('عنوان رویداد را وارد کنید.');
                      return;
                    }
                    if (eventMode === 'holiday' && !holidayType) {
                      setError('نوع تعطیلی را انتخاب کنید.');
                      return;
                    }
                    setStep(4);
                  }
                }}
              >
                {step === 1 ? 'ادامه' : 'ادامه به پیش‌نمایش'}
              </button>
            ) : null}
          </footer>
        </MinimalScroll>
      </div>

      <ConfirmDialog
        open={warningOpen}
        title={warningTitle}
        description={warningDescription}
        confirmLabel={warningConfirmLabel}
        cancelLabel={warningCancelLabel}
        tone="danger"
        onCancel={() => setWarningOpen(false)}
        onConfirm={() => {
          setWarningOpen(false);
          const action = pendingSubmit;
          setPendingSubmit(null);
          if (action) void action();
        }}
      />

      {error ? <div className="calendar-page-toast">{error}</div> : null}
    </>,
    document.body,
  );
}
