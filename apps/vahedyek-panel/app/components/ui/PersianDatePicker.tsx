'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

const DatePicker = dynamic(() => import('react-multi-date-picker'), { ssr: false });

interface PersianDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  className = '',
  containerClassName = '',
}: PersianDatePickerProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

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
      inputClass={`app-control text-left text-sm text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 [direction:ltr] ${className}`}
      placeholder={placeholder}
      style={{ width: '100%' }}
      containerClassName={containerClassName}
    />
  );
}
