'use client';

import dynamic from 'next/dynamic';
import { AlertTriangle, Bell, Check, ChevronLeft, Clock3, ShieldAlert, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  addCalendarEventsAction,
  addCalendarShiftAction,
  createShiftTemplateFromDialogAction,
  deleteCalendarEventsInRangeAction,
  deleteCalendarShiftsInRangeAction,
} from '../../../../../lib/actions';
import { buildPersianDatePreset, expandCalendarEventDates, normalizePersianDateInput } from '../../../../../lib/calendar-events';
import { getDayDetails } from '../../../../../lib/calendar-grid';
import type { CalendarHolidayCoefficients, CalendarHolidayType } from '../../../../../lib/calendar-event-types';
import {
  getPersianPartsFromDate,
  parsePersianYmd,
  PERSIAN_WEEKDAY_NAMES,
} from '../../../../../lib/calendar-dates';
import type { ShiftWizardSavePayload, CalendarShiftWizardSubmitHandle } from '../shift/CalendarShiftWizard';
import { ConfirmDialog } from '../../../../../components/ConfirmDialog';
import { MinimalScroll } from '../../../../../components/MinimalScroll';
import { CalendarHolidayTypeField } from '../event/CalendarHolidayTypeField';
import type { CalendarStoredEvent } from '../../../../../lib/calendar-events';
import type { StoredCalendarShift } from '../../../../../lib/calendar-shifts';
import type { ShiftTemplatePickerItem } from '../../../../../lib/shift-template-picker';

const CalendarShiftWizard = dynamic(
  () => import('../shift/CalendarShiftWizard').then((module) => ({ default: module.CalendarShiftWizard })),
  {
    ssr: false,
    loading: () => (
      <div className="calendar-shift-wizard-loading" role="status">
        در حال بارگذاری فرم شیفت...
      </div>
    ),
  },
);

type BulkView = 'picker' | 'add-shift' | 'add-event' | 'delete-shift' | 'delete-event';

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

function toggleDay(list: string[], day: string) {
  return list.includes(day) ? list.filter((item) => item !== day) : [...list, day];
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

function isRangeOrderValid(startDate: string, endDate: string) {
  const parsedRangeStart = parsePersianYmd(normalizePersianDateInput(startDate));
  const parsedRangeEnd = parsePersianYmd(normalizePersianDateInput(endDate));
  if (!parsedRangeStart || !parsedRangeEnd) return true;
  return (
    parsedRangeEnd.year > parsedRangeStart.year ||
    (parsedRangeEnd.year === parsedRangeStart.year &&
      (parsedRangeEnd.month > parsedRangeStart.month ||
        (parsedRangeEnd.month === parsedRangeStart.month && parsedRangeEnd.day >= parsedRangeStart.day)))
  );
}

function formatHolidayShiftCoefficientHint(coefficients: CalendarHolidayCoefficients) {
  if (!coefficients.isConfigured) {
    return 'اگر روی روزهای تعطیل شیفت ثبت شود، کارکرد آن روزها در حقوق و دستمزد با ضریب تعطیل (بیش از روز عادی) محاسبه می‌شود.';
  }

  return `اگر روی روزهای تعطیل شیفت ثبت شود، کارکرد آن روزها با ضریب بالاتر محاسبه می‌شود: تعطیلات رسمی ${coefficients.officialHoliday.toLocaleString('fa-IR')}، سازمانی ${coefficients.organizationalHoliday.toLocaleString('fa-IR')}، هفتگی ${coefficients.weeklyRestDay.toLocaleString('fa-IR')}.`;
}

function filterShiftTargetDates(
  calendar: GroupCalendarOperationsCalendar,
  dates: string[],
  applyShiftOnHolidays: boolean,
) {
  return dates.filter((date) => {
    const details = getDayDetails({
      date,
      weekends: calendar.weekends,
      singleHolidays: calendar.singleHolidays,
      shifts: calendar.shifts,
      excludedShiftDates: calendar.excludedShiftDates,
      weekendOverrideDates: calendar.weekendOverrideDates,
    });
    if (details.shifts.length > 0) return false;
    if (!applyShiftOnHolidays && details.isHoliday) return false;
    return true;
  });
}

function buildTemplateShiftConfig(payload: ShiftWizardSavePayload, weekdays: string[]) {
  const { includedDates: _includedDates, ...rest } = payload.shiftConfig;
  return {
    ...rest,
    workingDays: weekdays,
    floatDayWorkingDays: weekdays,
    floatAbsWorkingDays: weekdays,
    splitWorkingDays: weekdays,
  };
}

function countDaysWithShifts(calendar: GroupCalendarOperationsCalendar, dates: string[]) {
  let count = 0;
  for (const date of dates) {
    const details = getDayDetails({
      date,
      weekends: calendar.weekends,
      singleHolidays: calendar.singleHolidays,
      shifts: calendar.shifts,
      excludedShiftDates: calendar.excludedShiftDates,
      weekendOverrideDates: calendar.weekendOverrideDates,
    });
    if (details.shifts.length > 0) count += 1;
  }
  return count;
}

type BulkRangeFieldsProps = {
  rangeStart: string;
  rangeEnd: string;
  weekdays: string[];
  isRangeOrderValid: boolean;
  totalTargetDays: number;
  onRangeStartChange: (value: string) => void;
  onRangeEndChange: (value: string) => void;
  onToggleWeekday: (day: string) => void;
  onApplyPreset: (field: 'start' | 'end', preset: 'today' | 'month-start' | 'month-end' | 'year-start' | 'year-end') => void;
  showLargeOperationWarning?: boolean;
};

function BulkRangeFields({
  rangeStart,
  rangeEnd,
  weekdays,
  isRangeOrderValid,
  totalTargetDays,
  onRangeStartChange,
  onRangeEndChange,
  onToggleWeekday,
  onApplyPreset,
  showLargeOperationWarning = false,
}: BulkRangeFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="calendar-delete-range-date-grid">
        <div className="calendar-delete-range-date-col">
          <label className="calendar-delete-range-field">
            <span>تاریخ شروع بازه</span>
            <input
              type="text"
              value={rangeStart}
              onChange={(event) => onRangeStartChange(normalizePersianDateInput(event.target.value))}
              placeholder="1405/03/01"
              dir="ltr"
              className="is-ltr"
            />
          </label>
          <div className="calendar-delete-range-presets">
            <button type="button" onClick={() => onApplyPreset('start', 'today')}>
              امروز
            </button>
            <button type="button" onClick={() => onApplyPreset('start', 'month-start')}>
              شروع ماه
            </button>
            <button type="button" onClick={() => onApplyPreset('start', 'year-start')}>
              شروع سال
            </button>
          </div>
        </div>

        <div className="calendar-delete-range-date-col">
          <label className="calendar-delete-range-field">
            <span>تاریخ پایان بازه</span>
            <input
              type="text"
              value={rangeEnd}
              onChange={(event) => onRangeEndChange(normalizePersianDateInput(event.target.value))}
              placeholder="1405/03/31"
              dir="ltr"
              className="is-ltr"
            />
          </label>
          <div className="calendar-delete-range-presets">
            <button type="button" onClick={() => onApplyPreset('end', 'month-end')}>
              پایان ماه
            </button>
            <button type="button" onClick={() => onApplyPreset('end', 'year-end')}>
              پایان سال
            </button>
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
            <button
              key={day}
              type="button"
              className={weekdays.includes(day) ? 'is-active' : ''}
              onClick={() => onToggleWeekday(day)}
            >
              {day}
            </button>
          ))}
        </div>
        {weekdays.length === 0 ? <p className="calendar-delete-range-hint">حداقل یک روز هفته را انتخاب کنید.</p> : null}
      </div>

      {rangeStart.trim() && rangeEnd.trim() && weekdays.length > 0 && isRangeOrderValid ? (
        <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-7 text-slate-200">
          <div>تعداد روزهای هدف: {totalTargetDays.toLocaleString('fa-IR')}</div>
          {totalTargetDays === 0 ? (
            <div className="text-rose-200">با این بازه و روزهای انتخاب‌شده، هیچ روزی برای اعمال عملیات وجود ندارد.</div>
          ) : null}
        </div>
      ) : null}

      {showLargeOperationWarning && totalTargetDays > 30 ? (
        <div className="rounded-xl border border-amber-400/25 bg-amber-950/30 px-4 py-3 text-sm leading-7 text-amber-100">
          این عملیات روی {totalTargetDays.toLocaleString('fa-IR')} روز اعمال می‌شود. قبل از ثبت، بازه و روزهای هفته را بررسی کنید.
        </div>
      ) : null}
    </div>
  );
}

const VIEW_TITLES: Record<BulkView, string> = {
  picker: 'عملیات گروهی تقویم',
  'add-shift': 'افزودن شیفت بازه‌ای',
  'add-event': 'افزودن رویداد بازه‌ای',
  'delete-shift': 'حذف شیفت بازه‌ای',
  'delete-event': 'حذف رویداد بازه‌ای',
};

const VIEW_LEADS: Record<Exclude<BulkView, 'picker'>, string> = {
  'add-shift': 'یک شیفت را برای چند روز در یک بازه زمانی ثبت کنید.',
  'add-event': 'یک رویداد عادی یا تعطیلی را برای چند روز در یک بازه زمانی ثبت کنید.',
  'delete-shift': 'شیفت‌های ثبت‌شده روی روزهای هدف در بازه انتخاب‌شده حذف می‌شوند.',
  'delete-event': 'رویدادهای ثبت‌شده روی روزهای هدف در بازه انتخاب‌شده حذف می‌شوند.',
};

export function GroupCalendarOperationsDialog({ open, calendar, onClose, onCompleted }: GroupCalendarOperationsDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<BulkView>('picker');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [weekdays, setWeekdays] = useState<string[]>([]);
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
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [shiftWizardSubmit, setShiftWizardSubmit] = useState<CalendarShiftWizardSubmitHandle | null>(null);
  const ignoreBackdropClickRef = useRef(false);

  const rangeOrderValid = useMemo(() => isRangeOrderValid(rangeStart, rangeEnd), [rangeEnd, rangeStart]);

  const targetDates = useMemo(
    () =>
      rangeStart.trim() && rangeEnd.trim() && weekdays.length > 0 && rangeOrderValid
        ? buildTargetDates({
            startDate: rangeStart,
            endDate: rangeEnd,
            weekdays,
            bounds: { start: calendar.startDate, end: calendar.endDate },
          })
        : [],
    [calendar.endDate, calendar.startDate, rangeEnd, rangeOrderValid, rangeStart, weekdays],
  );

  const totalTargetDays = targetDates.length;
  const rangeReady = Boolean(rangeStart.trim() && rangeEnd.trim() && weekdays.length > 0 && rangeOrderValid && totalTargetDays > 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetFormState = useCallback(() => {
    setRangeStart('');
    setRangeEnd('');
    setWeekdays([]);
    setApplyShiftOnHolidays(false);
    setEventTitle('');
    setEventDescription('');
    setEventMode('regular');
    setHolidayType(null);
    setError(null);
  }, []);

  const initializeOperationDefaults = useCallback(() => {
    const currentMonth = getPersianPartsFromDate();
    setRangeStart(buildPersianDatePreset('month-start', currentMonth));
    setRangeEnd(buildPersianDatePreset('month-end', currentMonth));
    setWeekdays([...PERSIAN_WEEKDAY_NAMES]);
    setApplyShiftOnHolidays(false);
    setEventTitle('');
    setEventDescription('');
    setEventMode('regular');
    setHolidayType(null);
    setError(null);
    setSaveAsTemplate(false);
    setTemplateName('');
    setShiftWizardSubmit(null);
  }, []);

  useEffect(() => {
    if (!open) {
      setView('picker');
      resetFormState();
      setSaving(false);
      setWarningOpen(false);
      setPendingSubmit(null);
      setSaveAsTemplate(false);
      setTemplateName('');
      setShiftWizardSubmit(null);
    }
  }, [open, resetFormState]);

  useEffect(() => {
    if (!open) return;

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

  const applyPresetToField = (field: 'start' | 'end', preset: 'today' | 'month-start' | 'month-end' | 'year-start' | 'year-end') => {
    const currentMonth = getPersianPartsFromDate();
    const value = buildPersianDatePreset(preset, currentMonth);
    if (field === 'start') setRangeStart(value);
    else setRangeEnd(value);
  };

  const toggleWeekday = useCallback((day: string) => {
    setWeekdays((prev) => toggleDay(prev, day));
  }, []);

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

  const selectView = (nextView: Exclude<BulkView, 'picker'>) => {
    initializeOperationDefaults();
    setView(nextView);
  };

  const goBack = () => {
    resetFormState();
    setView('picker');
  };

  const applyShift = async (payload: ShiftWizardSavePayload) => {
    const shiftAppliedDates = filterShiftTargetDates(calendar, targetDates, applyShiftOnHolidays);
    if (shiftAppliedDates.length === 0) {
      setError('با این بازه و روزهای انتخاب‌شده، هیچ روزی برای اعمال عملیات وجود ندارد.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (saveAsTemplate) {
        await createShiftTemplateFromDialogAction({
          shiftType: payload.shiftType,
          shiftTitle: templateName.trim(),
          shiftConfig: buildTemplateShiftConfig(payload, weekdays),
        });
      }

      const payloadConfig = {
        ...payload.shiftConfig,
        includedDates: shiftAppliedDates,
        workingDays: [] as string[],
        floatDayWorkingDays: [] as string[],
        floatAbsWorkingDays: [] as string[],
        splitWorkingDays: [] as string[],
      };

      await addCalendarShiftAction({
        calendarId: calendar.id,
        shiftType: payload.shiftType,
        shiftTitle: payload.shiftTitle,
        shiftConfig: payloadConfig,
      });

      onCompleted(
        saveAsTemplate
          ? `شیفت روی ${shiftAppliedDates.length.toLocaleString('fa-IR')} روز اعمال شد و قالب «${templateName.trim()}» ذخیره شد.`
          : `شیفت روی ${shiftAppliedDates.length.toLocaleString('fa-IR')} روز از بازه انتخاب‌شده اعمال شد.`,
      );
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'عملیات گروهی انجام نشد. دوباره تلاش کنید.');
      throw submitError;
    } finally {
      setSaving(false);
    }
  };

  const handleShiftSave = async (payload: ShiftWizardSavePayload) => {
    if (!rangeReady) {
      setError('بازه و روزهای هدف را کامل کنید.');
      throw new Error('range-not-ready');
    }

    if (saveAsTemplate && !templateName.trim()) {
      setError('نام قالب شیفت را وارد کنید.');
      throw new Error('template-name-required');
    }

    const shiftAppliedDates = filterShiftTargetDates(calendar, targetDates, applyShiftOnHolidays);
    if (shiftAppliedDates.length === 0) {
      setError('با این بازه و روزهای انتخاب‌شده، هیچ روزی برای اعمال عملیات وجود ندارد.');
      throw new Error('no-target-dates');
    }

    if (applyShiftOnHolidays) {
      let holidayCount = 0;
      for (const date of shiftAppliedDates) {
        const details = getDayDetails({
          date,
          weekends: calendar.weekends,
          singleHolidays: calendar.singleHolidays,
          shifts: calendar.shifts,
          excludedShiftDates: calendar.excludedShiftDates,
          weekendOverrideDates: calendar.weekendOverrideDates,
        });
        if (details.isHoliday) holidayCount += 1;
      }

      if (holidayCount > 0) {
        openWarning(
          'ثبت شیفت در روز تعطیل',
          `${holidayCount.toLocaleString('fa-IR')} روز تعطیل در فهرست اعمال قرار دارد. ${formatHolidayShiftCoefficientHint(calendar.holidayCoefficients)} آیا ادامه می‌دهید؟`,
          'ادامه و اعمال شیفت',
          () => applyShift(payload),
        );
        return;
      }
    }

    await applyShift(payload);
  };

  const applyEvent = async () => {
    if (!eventTitle.trim()) {
      setError('عنوان رویداد را وارد کنید.');
      return;
    }

    if (eventMode === 'holiday' && !holidayType) {
      setError('نوع تعطیلی را انتخاب کنید.');
      return;
    }

    if (!rangeReady) {
      setError('بازه و روزهای هدف را کامل کنید.');
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

      onCompleted(`رویداد روی ${totalTargetDays.toLocaleString('fa-IR')} روز از بازه انتخاب‌شده ثبت شد.`);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'عملیات گروهی انجام نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const handleEventSubmit = async () => {
    if (saving || !rangeReady) {
      if (!eventTitle.trim()) setError('عنوان رویداد را وارد کنید.');
      else if (eventMode === 'holiday' && !holidayType) setError('نوع تعطیلی را انتخاب کنید.');
      else if (!rangeReady) setError('بازه و روزهای هدف را کامل کنید.');
      return;
    }

    if (eventMode === 'holiday') {
      const daysWithShifts = countDaysWithShifts(calendar, targetDates);
      if (daysWithShifts > 0) {
        openWarning(
          'ثبت رویداد تعطیلی',
          'برخی روزهای انتخاب‌شده دارای شیفت هستند. ثبت رویداد تعطیلی می‌تواند روی محاسبه شیفت، اضافه‌کاری و حقوق و دستمزد اثر بگذارد. آیا ادامه می‌دهید؟',
          'ادامه و ثبت تعطیلی',
          applyEvent,
        );
        return;
      }

      openWarning(
        'ثبت رویداد تعطیلی',
        'این رویداد باعث تعطیل شدن روزهای انتخاب‌شده می‌شود و ممکن است روی محاسبه حقوق و دستمزد، اضافه‌کاری و گزارش‌های حضور و غیاب اثر بگذارد. آیا ادامه می‌دهید؟',
        'بله، ادامه',
        applyEvent,
      );
      return;
    }

    await applyEvent();
  };

  const applyDeleteShift = async () => {
    setSaving(true);
    setError(null);
    try {
      await deleteCalendarShiftsInRangeAction({
        calendarId: calendar.id,
        startDate: rangeStart,
        endDate: rangeEnd,
        weekdays,
      });
      onCompleted('شیفت‌های بازه انتخاب‌شده حذف شدند.');
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'عملیات حذف انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  const applyDeleteEvent = async () => {
    setSaving(true);
    setError(null);
    try {
      await deleteCalendarEventsInRangeAction({
        calendarId: calendar.id,
        startDate: rangeStart,
        endDate: rangeEnd,
        weekdays,
      });
      onCompleted('رویدادهای بازه انتخاب‌شده حذف شدند.');
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'عملیات حذف انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubmit = () => {
    if (!rangeReady || saving) return;

    if (view === 'delete-shift') {
      openWarning(
        'حذف شیفت بازه‌ای',
        `آیا از حذف شیفت‌های ${totalTargetDays.toLocaleString('fa-IR')} روز هدف در این بازه مطمئن هستید؟ این عمل قابل بازگشت نیست.`,
        'حذف شیفت‌ها',
        applyDeleteShift,
      );
      return;
    }

    if (view === 'delete-event') {
      openWarning(
        'حذف رویداد بازه‌ای',
        `آیا از حذف رویدادهای ${totalTargetDays.toLocaleString('fa-IR')} روز هدف در این بازه مطمئن هستید؟ این عمل قابل بازگشت نیست.`,
        'حذف رویدادها',
        applyDeleteEvent,
      );
    }
  };

  const eventCanSubmit = Boolean(eventTitle.trim() && (eventMode === 'regular' || holidayType) && rangeReady);
  const shiftCanSubmit = Boolean(
    rangeReady && shiftWizardSubmit?.canSave && (!saveAsTemplate || templateName.trim()),
  );
  const shiftSaving = saving || Boolean(shiftWizardSubmit?.saving);

  const templateSaveSlot = (
    <div className="space-y-4 rounded-[18px] border border-white/10 bg-slate-950/40 p-4 text-right">
      <div className="calendar-event-toggle-row">
        <span>ذخیره به عنوان قالب شیفت</span>
        <button
          type="button"
          className={`calendar-event-toggle${saveAsTemplate ? ' is-on' : ''}`}
          aria-pressed={saveAsTemplate}
          onClick={() => {
            setSaveAsTemplate((prev) => {
              const next = !prev;
              if (!next) setTemplateName('');
              return next;
            });
          }}
        >
          <span />
        </button>
      </div>
      {saveAsTemplate ? (
        <label className="calendar-event-field">
          <span>نام قالب شیفت</span>
          <input
            type="text"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
            placeholder="مثلاً: شیفت اداری صبح"
          />
          <small>این قالب در فهرست قالب‌های شیفت ذخیره می‌شود و برای ثبت‌های بعدی قابل استفاده است.</small>
        </label>
      ) : null}
    </div>
  );

  if (!open || !mounted) return null;

  const renderBody = () => {
    if (view === 'picker') {
      return (
        <div className="space-y-6">
          <p className="calendar-details-muted">از این بخش برای اعمال شیفت یا رویداد روی چند روز در یک بازه زمانی استفاده کنید.</p>
          <div className="calendar-details-bulk-grid">
            <button type="button" className="calendar-details-bulk-tile is-blue" onClick={() => selectView('add-shift')}>
              <Clock3 className="h-5 w-5" />
              <span>افزودن شیفت بازه‌ای</span>
              <small>یک شیفت را برای چند روز در یک بازه زمانی ثبت کنید.</small>
            </button>
            <button type="button" className="calendar-details-bulk-tile is-indigo" onClick={() => selectView('add-event')}>
              <Bell className="h-5 w-5" />
              <span>افزودن رویداد بازه‌ای</span>
              <small>یک رویداد عادی یا تعطیلی را برای چند روز در یک بازه زمانی ثبت کنید.</small>
            </button>
            <button type="button" className="calendar-details-bulk-tile is-danger" onClick={() => selectView('delete-shift')}>
              <Trash2 className="h-5 w-5" />
              <span>حذف شیفت بازه‌ای</span>
              <small>شیفت‌های ثبت‌شده روی روزهای هدف در بازه انتخاب‌شده حذف می‌شوند.</small>
            </button>
            <button type="button" className="calendar-details-bulk-tile is-danger" onClick={() => selectView('delete-event')}>
              <Trash2 className="h-5 w-5" />
              <span>حذف رویداد بازه‌ای</span>
              <small>رویدادهای ثبت‌شده روی روزهای هدف در بازه انتخاب‌شده حذف می‌شوند.</small>
            </button>
          </div>
        </div>
      );
    }

    const rangeFields = (
      <BulkRangeFields
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        weekdays={weekdays}
        isRangeOrderValid={rangeOrderValid}
        totalTargetDays={totalTargetDays}
        onRangeStartChange={setRangeStart}
        onRangeEndChange={setRangeEnd}
        onToggleWeekday={toggleWeekday}
        onApplyPreset={applyPresetToField}
        showLargeOperationWarning={view === 'add-shift' || view === 'add-event' || view === 'delete-shift' || view === 'delete-event'}
      />
    );

    if (view === 'add-shift') {
      return (
        <div className="space-y-6">
          {rangeFields}

          <div className="space-y-3 rounded-[18px] border border-white/10 bg-slate-950/40 p-4 text-right">
            <div className="text-sm font-bold text-white">اعمال روی روزهای تعطیل</div>
            <p className="text-xs leading-6 text-slate-400">
              شیفت جدید فقط روی روزهای بدون شیفت قبلی اعمال می‌شود. روزهایی که از قبل شیفت دارند نادیده گرفته می‌شوند.
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
            ) : null}
          </div>

          <div className="space-y-4">
            <p className="calendar-details-muted">این شیفت فقط روی روزهای هدف انتخاب‌شده اعمال خواهد شد.</p>
            {!rangeReady ? (
              <p className="calendar-details-bulk-warning">برای ثبت شیفت، بازه و حداقل یک روز هفته معتبر انتخاب کنید.</p>
            ) : null}
            <CalendarShiftWizard
              key="bulk-shift-wizard"
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
              hideFooter
              beforeSummarySlot={templateSaveSlot}
              onRegisterSubmit={setShiftWizardSubmit}
              onSaveShift={handleShiftSave}
              onSaved={() => undefined}
              onCancel={onClose}
            />
          </div>
        </div>
      );
    }

    if (view === 'add-event') {
      return (
        <div className="space-y-6">
          {rangeFields}

          <section className="space-y-4 rounded-[18px] border border-white/10 bg-slate-950/40 p-4 text-right">
            <p className="calendar-details-muted">این رویداد فقط روی روزهای هدف انتخاب‌شده اعمال خواهد شد.</p>

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

    if (view === 'delete-shift' || view === 'delete-event') {
      return (
        <div className="space-y-6">
          {rangeFields}
          <div className="calendar-delete-range-warning" role="note">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            <p>
              {view === 'delete-shift'
                ? 'شیفت‌های روزهای هدف در این بازه حذف می‌شوند. این عمل قابل بازگشت نیست.'
                : 'رویدادهای روزهای هدف در این بازه حذف می‌شوند. این عمل قابل بازگشت نیست.'}
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  const showMainFooter = view === 'add-shift' || view === 'add-event' || view === 'delete-shift' || view === 'delete-event';

  return createPortal(
    <>
      <div className="calendar-create-modal-backdrop" role="presentation" dir="rtl" lang="fa" onMouseDown={() => !ignoreBackdropClickRef.current && onClose()}>
        <MinimalScroll className="calendar-create-modal calendar-bulk-modal" role="dialog" aria-modal="true" aria-labelledby="group-calendar-ops-title" onMouseDown={(event) => event.stopPropagation()}>
          <header className="calendar-create-modal-head">
            <div className="flex items-center justify-between gap-3">
              <button type="button" className="calendar-details-back" onClick={() => (view === 'picker' ? onClose() : goBack())} aria-label="بازگشت">
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <div className="text-right">
                <h2 id="group-calendar-ops-title">{VIEW_TITLES[view]}</h2>
                <p className="calendar-details-muted">
                  {view === 'picker' ? 'از این بخش برای اعمال شیفت یا رویداد روی چند روز در یک بازه زمانی استفاده کنید.' : VIEW_LEADS[view]}
                </p>
              </div>
            </div>
          </header>

          <div className="calendar-create-modal-body space-y-6">
            {renderBody()}
            {error ? <p className="calendar-delete-range-error">{error}</p> : null}
          </div>

          {showMainFooter ? (
            <footer className="calendar-create-modal-footer">
              <button type="button" className="calendar-create-cancel" onClick={onClose}>
                انصراف
              </button>
              <button
                type="button"
                className={view === 'delete-shift' || view === 'delete-event' ? 'calendar-delete-range-submit' : 'calendar-create-submit'}
                disabled={
                  shiftSaving ||
                  (view === 'add-shift'
                    ? !shiftCanSubmit
                    : view === 'add-event'
                      ? !eventCanSubmit
                      : !rangeReady)
                }
                onClick={() => {
                  if (view === 'add-shift') {
                    void shiftWizardSubmit?.submit();
                    return;
                  }
                  if (view === 'add-event') void handleEventSubmit();
                  else handleDeleteSubmit();
                }}
              >
                {shiftSaving
                  ? 'در حال ذخیره...'
                  : view === 'add-shift'
                    ? 'ذخیره'
                    : view === 'add-event'
                      ? 'ثبت رویداد'
                      : view === 'delete-shift'
                        ? 'حذف شیفت‌ها'
                        : 'حذف رویدادها'}
              </button>
            </footer>
          ) : (
            <footer className="calendar-create-modal-footer">
              <button type="button" className="calendar-create-cancel" onClick={onClose}>
                انصراف
              </button>
            </footer>
          )}
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
    </>,
    document.body,
  );
}
