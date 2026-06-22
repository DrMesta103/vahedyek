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
  const selectedYear = resolvedSearchParams?.year ?? 'all';
  const defaultYearLabel = currentJalaliYearLabel();
  const defaultYearNumber = Number(defaultYearLabel.replace(/[^\d]/g, '')) || 1405;
  const createYearOptions = Array.from(
    new Set([
      ...yearOptions,
      ...Array.from({ length: 5 }, (_, index) => String(defaultYearNumber - 1 + index)),
    ]),
  ).sort();

  const cardItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status as 'active' | 'inactive',
    isIncomplete: item.isIncomplete,
    yearLabel: item.yearLabel,
    shiftCount: item.shiftCount,
    shiftTypes: item.shiftTypes,
    totalShiftDays: item.totalShiftDays,
    eventCount: item.eventCount,
    holidayCount: item.holidayCount,
    otherEventCount: item.otherEventCount,
    policyCount: item.policyCount,
    workGroupCount: item.workGroupCount,
  }));

  return (
    <div className="page-stack module-page" dir="rtl" lang="fa">
      <Suspense fallback={null}>
        <CalendarsPageClient
          items={cardItems}
          yearOptions={yearOptions}
          selectedYear={selectedYear}
          defaultYearLabel={defaultYearLabel}
          createYearOptions={createYearOptions}
        />
      </Suspense>
    </div>
  );
}
