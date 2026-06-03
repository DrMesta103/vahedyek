import { Suspense } from 'react';
import { currentJalaliYearLabel } from '../../lib/calendar-defaults';
import { listCalendars } from '../../lib/data';
import { CalendarsPageClient } from './_components/CalendarsPageClient';

type CalendarsPageProps = {
  searchParams?: Promise<{
    year?: string;
  }>;
};

export default async function CalendarsPage({ searchParams }: CalendarsPageProps) {
  const items = await listCalendars();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const yearOptions: string[] = Array.from(
    new Set(items.map((item) => item.yearLabel).filter((year): year is string => Boolean(year))),
  );
  const fallbackYear = yearOptions[0] ?? 'all';
  const selectedYear = resolvedSearchParams?.year ?? fallbackYear;
  const defaultYearLabel = currentJalaliYearLabel();

  const cardItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status as 'active' | 'inactive',
    yearLabel: item.yearLabel,
    totalShiftDays: item.totalShiftDays,
    totalEventDays: item.totalEventDays,
  }));

  return (
    <div className="page-stack module-page" dir="rtl" lang="fa">
      <Suspense fallback={null}>
        <CalendarsPageClient
          items={cardItems}
          yearOptions={yearOptions}
          selectedYear={selectedYear}
          defaultYearLabel={defaultYearLabel}
        />
      </Suspense>
    </div>
  );
}
