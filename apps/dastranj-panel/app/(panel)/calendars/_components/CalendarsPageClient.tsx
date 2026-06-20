'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarYearFilter } from '../../../components/CalendarYearFilter';
import { ModuleAddTile } from '../../../components/module-page/ModuleAddTile';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { CalendarCard, type CalendarCardItem } from './CalendarCard';
import { CreateCalendarDialog } from './CreateCalendarDialog';

type CalendarsPageClientProps = {
  items: CalendarCardItem[];
  yearOptions: string[];
  selectedYear: string;
  defaultYearLabel: string;
  createYearOptions: string[];
};

export function CalendarsPageClient({
  items,
  yearOptions,
  selectedYear,
  defaultYearLabel,
  createYearOptions,
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
        title="تقویم‌های کاری"
        subtitle="تقویم‌های کاری مبنای تشخیص روزهای کاری، تعطیلات، شیفت‌ها و رویدادهای سازمان هستند."
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
          <CalendarCard key={item.id} item={item} />
        ))}
        <ModuleAddTile onClick={openCreateDialog} label="افزودن تقویم کاری جدید" />
      </div>

      <CreateCalendarDialog
        open={createDialogOpen}
        yearLabel={defaultYearLabel}
        yearOptions={createYearOptions}
        onClose={closeCreateDialog}
      />
    </>
  );
}
