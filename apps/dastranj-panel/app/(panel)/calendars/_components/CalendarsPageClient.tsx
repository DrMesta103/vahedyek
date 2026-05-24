'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarYearFilter } from '../../../components/CalendarYearFilter';
import { ModuleAddTile } from '../../../components/module-page/ModuleAddTile';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../../components/module-page/module-breadcrumbs';
import { CalendarCard, type CalendarCardItem } from './CalendarCard';
import { CreateCalendarDialog } from './CreateCalendarDialog';

type CalendarsPageClientProps = {
  items: CalendarCardItem[];
  yearOptions: string[];
  selectedYear: string;
  defaultYearLabel: string;
};

export function CalendarsPageClient({
  items,
  yearOptions,
  selectedYear,
  defaultYearLabel,
}: CalendarsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredItems = selectedYear === 'all' ? items : items.filter((item) => item.yearLabel === selectedYear);

  const openCreateDialog = () => setCreateDialogOpen(true);

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    if (searchParams.get('create') === '1') {
      router.replace('/calendars');
    }
  };

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setCreateDialogOpen(true);
    }
  }, [searchParams]);

  return (
    <>
      <ModulePageHeader
        breadcrumbs={panelBreadcrumbs('تقویم')}
        title="تقویم‌های کاری"
        subtitle="مدیریت شیفت‌ها و رویدادها برای سازمان شما."
        addLabel="افزودن تقویم کاری"
        onAddClick={openCreateDialog}
      />

      {yearOptions.length > 0 ? (
        <div className="module-page-toolbar">
          <CalendarYearFilter value={selectedYear} options={yearOptions} />
        </div>
      ) : null}

      <div className="module-page-grid">
        {filteredItems.map((item) => (
          <CalendarCard key={item.id} item={item} onCreateCalendar={openCreateDialog} />
        ))}
        <ModuleAddTile onClick={openCreateDialog} label="برای افزودن تقویم کاری کلیک کنید." />
      </div>

      <CreateCalendarDialog open={createDialogOpen} yearLabel={defaultYearLabel} onClose={closeCreateDialog} />
    </>
  );
}
