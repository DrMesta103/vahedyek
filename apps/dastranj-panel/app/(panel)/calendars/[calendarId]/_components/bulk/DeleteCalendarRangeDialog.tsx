'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PERSIAN_WEEKDAY_NAMES, parsePersianYmd } from '../../../../../lib/calendar-dates';
import { MinimalScroll } from '../../../../components/MinimalScroll';
import { buildPersianDatePreset, normalizePersianDateInput } from '../../../../../lib/calendar-events';

type DeleteCalendarRangeDialogProps = {
  open: boolean;
  title: string;
  lead: string;
  warning: string;
  submitLabel: string;
  calendarBounds: { startDate: string; endDate: string };
  defaultDate?: string;
  onClose: () => void;
  onConfirm: (data: { startDate: string; endDate: string; weekdays: string[] }) => Promise<void>;
};

function toggleDay(list: string[], day: string) {
  return list.includes(day) ? list.filter((item) => item !== day) : [...list, day];
}

export function DeleteCalendarRangeDialog({
  open,
  title,
  lead,
  warning,
  submitLabel,
  calendarBounds,
  defaultDate,
  onClose,
  onConfirm,
}: DeleteCalendarRangeDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ignoreBackdropClickRef = useRef(false);

  const anchorDate = useMemo(() => {
    const preferred = defaultDate ? parsePersianYmd(normalizePersianDateInput(defaultDate)) : null;
    if (preferred) return preferred;
    return parsePersianYmd(calendarBounds.startDate);
  }, [calendarBounds.startDate, defaultDate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const initial = defaultDate ? normalizePersianDateInput(defaultDate) : buildPersianDatePreset('today', anchorDate ?? undefined);
    setRangeStart(initial);
    setRangeEnd(initial);
    setWeekdays([]);
    setError(null);

    ignoreBackdropClickRef.current = true;
    const timer = window.setTimeout(() => {
      ignoreBackdropClickRef.current = false;
    }, 300);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [anchorDate, defaultDate, onClose, open]);

  if (!open || !mounted) return null;

  const canSubmit = Boolean(rangeStart.trim() && rangeEnd.trim() && weekdays.length > 0);

  const applyPresetToField = (field: 'start' | 'end', preset: 'today' | 'month-start' | 'month-end' | 'year-start' | 'year-end') => {
    const source = field === 'start' ? rangeStart : rangeEnd;
    const anchor = parsePersianYmd(normalizePersianDateInput(source)) ?? anchorDate ?? undefined;
    const value = buildPersianDatePreset(preset, anchor);
    if (field === 'start') setRangeStart(value);
    else setRangeEnd(value);
  };

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm({ startDate: rangeStart, endDate: rangeEnd, weekdays });
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'عملیات حذف انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="calendar-delete-range-backdrop"
      role="presentation"
      dir="rtl"
      lang="fa"
      onMouseDown={() => {
        if (ignoreBackdropClickRef.current) return;
        onClose();
      }}
    >
      <MinimalScroll
        className="calendar-delete-range-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-delete-range-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="calendar-delete-range-head">
          <h2 id="calendar-delete-range-title">{title}</h2>
          <p>{lead}</p>
        </header>

        <div className="calendar-delete-range-date-grid">
          <div className="calendar-delete-range-date-col">
            <label className="calendar-delete-range-field">
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
            <div className="calendar-delete-range-presets">
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

          <div className="calendar-delete-range-date-col">
            <label className="calendar-delete-range-field">
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
            <div className="calendar-delete-range-presets">
              <button type="button" onClick={() => applyPresetToField('end', 'month-end')}>
                پایان ماه
              </button>
              <button type="button" onClick={() => applyPresetToField('end', 'year-end')}>
                پایان سال
              </button>
            </div>
          </div>
        </div>

        <div className="calendar-delete-range-weekdays-block">
          <span className="calendar-delete-range-weekdays-label">روزهای هفته</span>
          <div className="calendar-delete-range-weekdays">
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
          {weekdays.length === 0 ? <p className="calendar-delete-range-hint">حداقل یک روز هفته را انتخاب کنید.</p> : null}
        </div>

        <div className="calendar-delete-range-warning" role="note">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          <p>{warning}</p>
        </div>

        {error ? <p className="calendar-delete-range-error">{error}</p> : null}

        <footer className="calendar-delete-range-footer">
          <button type="button" className="calendar-delete-range-submit" disabled={!canSubmit || saving} onClick={handleSubmit}>
            {saving ? 'در حال حذف...' : submitLabel}
          </button>
          <button type="button" className="calendar-delete-range-cancel" onClick={onClose}>
            انصراف
          </button>
        </footer>
      </MinimalScroll>
    </div>,
    document.body,
  );
}
