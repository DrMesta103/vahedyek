import type { DefaultHolidayItem } from './calendar-defaults';

const OFFICIAL_HOLIDAYS_BY_YEAR: Record<string, DefaultHolidayItem[]> = {
  '1404': [
    { id: '1404-nowruz-1', title: 'آغاز نوروز', date: '1404/01/01' },
    { id: '1404-nowruz-2', title: 'نوروز', date: '1404/01/02' },
    { id: '1404-nowruz-3', title: 'نوروز', date: '1404/01/03' },
    { id: '1404-nowruz-4', title: 'نوروز', date: '1404/01/04' },
    { id: '1404-sizdah', title: 'سیزده‌به‌در', date: '1404/01/13' },
    { id: '1404-rahbari', title: 'رحلت امام خمینی (ره)', date: '1404/03/14' },
    { id: '1404-15khordad', title: 'قیام ۱۵ خرداد', date: '1404/03/15' },
    { id: '1404-tashriq-1', title: 'تعطیلات تشریق', date: '1404/12/11' },
    { id: '1404-tashriq-2', title: 'تعطیلات تشریق', date: '1404/12/12' },
    { id: '1404-tashriq-3', title: 'تعطیلات تشریق', date: '1404/12/13' },
  ],
  '1405': [
    { id: '1405-nowruz-1', title: 'آغاز نوروز', date: '1405/01/01' },
    { id: '1405-nowruz-2', title: 'نوروز', date: '1405/01/02' },
    { id: '1405-nowruz-3', title: 'نوروز', date: '1405/01/03' },
    { id: '1405-nowruz-4', title: 'نوروز', date: '1405/01/04' },
    { id: '1405-sizdah', title: 'سیزده‌به‌در', date: '1405/01/13' },
    { id: '1405-rahbari', title: 'رحلت امام خمینی (ره)', date: '1405/03/14' },
    { id: '1405-15khordad', title: 'قیام ۱۵ خرداد', date: '1405/03/15' },
    { id: '1405-tashriq-1', title: 'تعطیلات تشریق', date: '1405/12/11' },
    { id: '1405-tashriq-2', title: 'تعطیلات تشریق', date: '1405/12/12' },
    { id: '1405-tashriq-3', title: 'تعطیلات تشریق', date: '1405/12/13' },
  ],
};

export function getOfficialHolidaysForYear(yearLabel: string): DefaultHolidayItem[] {
  const year = yearLabel.replace(/[^\d]/g, '');
  return OFFICIAL_HOLIDAYS_BY_YEAR[year] ?? [];
}
