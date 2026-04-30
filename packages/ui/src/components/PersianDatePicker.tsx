'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

const DatePicker = dynamic(() => import('react-multi-date-picker').then((mod: any) => mod?.default ?? mod), { ssr: false });

export interface PersianDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  withCalendarIcon?: boolean;
  calendarIconAriaLabel?: string;
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  className = '',
  containerClassName = '',
  withCalendarIcon = true,
  calendarIconAriaLabel = 'باز کردن تقویم',
}: PersianDatePickerProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const inputClassName = useMemo(() => {
    const base =
      'app-control text-left text-sm text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 [direction:ltr]';
    const iconPadding = withCalendarIcon ? 'pr-10' : '';
    return `${base} ${iconPadding} ${className}`.trim();
  }, [className, withCalendarIcon]);

  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      portal={Boolean(portalTarget)}
      portalTarget={portalTarget ?? undefined}
      zIndex={1200}
      value={value}
      onChange={(date: any) => {
        if (date) onChange(date.format('YYYY/MM/DD'));
        else onChange('');
      }}
      inputClass={inputClassName}
      placeholder={placeholder}
      style={{ width: '100%' }}
      containerClassName={containerClassName}
      render={(displayValue: string, openCalendar: () => void) => {
        if (!withCalendarIcon) {
          return (
            <input
              value={displayValue}
              readOnly
              onFocus={openCalendar}
              onClick={openCalendar}
              placeholder={placeholder}
              className={inputClassName}
              style={{ width: '100%' }}
            />
          );
        }

        return (
          <div className="relative w-full">
            <input
              value={displayValue}
              readOnly
              onFocus={openCalendar}
              onClick={openCalendar}
              placeholder={placeholder}
              className={inputClassName}
              style={{ width: '100%' }}
            />
            <button
              type="button"
              aria-label={calendarIconAriaLabel}
              onClick={openCalendar}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M8 3v3M16 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        );
      }}
    />
  );
}

