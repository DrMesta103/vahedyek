'use client';

import dynamic from 'next/dynamic';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

// dynamic import برای جلوگیری از SSR مشکل
const DatePicker = dynamic(() => import('react-multi-date-picker'), { ssr: false });

interface PersianDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
}

export function PersianDatePicker({ value, onChange, placeholder = 'انتخاب تاریخ', className = '', containerClassName = '' }: PersianDatePickerProps) {
  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      value={value}
      onChange={(date: any) => {
        if (date) onChange(date.format('YYYY/MM/DD'));
        else onChange('');
      }}
      inputClass={`app-control text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 [direction:ltr] text-left ${className}`}
      placeholder={placeholder}
      style={{ width: '100%' }}
      containerClassName={containerClassName}
    />
  );
}
