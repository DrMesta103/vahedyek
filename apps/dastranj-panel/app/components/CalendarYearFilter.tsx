'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type CalendarYearFilterProps = {
  value: string;
  options: string[];
};

export function CalendarYearFilter({ value, options }: CalendarYearFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (nextValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', nextValue);
    router.push(`/calendars?${params.toString()}`);
  };

  return (
    <div className="module-year-filter">
      <select value={value} onChange={(event) => handleChange(event.target.value)} aria-label="سال کاری">
        {options.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
