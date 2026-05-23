'use client';

import { CalendarDays, ChevronDown, MapPin, Search, Shield, UserRound } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type EmployeeItem = {
  id: string;
  name: string;
  nationalId?: string | null;
  personnelCode?: string | null;
};

type LocationItem = {
  id: string;
  title: string;
  description?: string | null;
  radius?: number | null;
};

type CalendarItem = {
  id: string;
  title: string;
  description?: string | null;
  yearLabel?: string | null;
  shiftTitle?: string | null;
};

type PolicyItem = {
  id: string;
  title: string;
  description?: string | null;
  calendarTitle?: string | null;
  calendarYearLabel?: string | null;
};

type FilterKey = 'employee' | 'policy' | 'location' | 'calendar';
type FilterState = { employeeId: string; locationId: string; policyId: string; calendarId: string };

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[يی]/g, 'ی')
    .replace(/[كک]/g, 'ک')
    .trim();
}

function FilterPanel({
  title,
  icon,
  searchPlaceholder,
  items,
  selectedId,
  onSelect,
  emptyLabel,
}: {
  title: string;
  icon: ReactNode;
  searchPlaceholder: string;
  items: Array<{ id: string; title: string; lines: string[] }>;
  selectedId: string;
  onSelect: (value: string) => void;
  emptyLabel: string;
}) {
  const [query, setQuery] = useState('');
  const normalizedQuery = normalize(query);

  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return items;
    return items.filter((item) => normalize([item.title, ...item.lines].join(' ')).includes(normalizedQuery));
  }, [items, normalizedQuery]);

  return (
    <div className="work-groups-filter-panel">
      <div className="work-groups-filter-panel-head">
        <h3>{title}</h3>
      </div>

      <label className="work-groups-filter-search">
        <span>{searchPlaceholder}</span>
        <div className="work-groups-filter-search-input">
          <Search className="work-groups-filter-search-icon" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder={searchPlaceholder} />
        </div>
      </label>

      <div className="work-groups-filter-items">
        {filteredItems.length ? (
          filteredItems.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                className={isSelected ? 'work-groups-filter-card is-selected' : 'work-groups-filter-card'}
                onClick={() => onSelect(item.id)}
              >
                <div className="work-groups-filter-card-copy">
                  <strong>{item.title}</strong>
                  {item.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
                <span className="work-groups-filter-card-icon" aria-hidden>
                  {icon}
                </span>
              </button>
            );
          })
        ) : (
          <div className="work-groups-filter-empty">{emptyLabel}</div>
        )}
      </div>
    </div>
  );
}

export function WorkGroupFiltersSidebar({
  employees,
  locations,
  calendars,
  policies,
  initialFilters,
}: {
  employees: EmployeeItem[];
  locations: LocationItem[];
  calendars: CalendarItem[];
  policies: PolicyItem[];
  initialFilters: Partial<FilterState>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);

  const currentFilters: FilterState = {
    employeeId: initialFilters.employeeId ?? '',
    locationId: initialFilters.locationId ?? '',
    policyId: initialFilters.policyId ?? '',
    calendarId: initialFilters.calendarId ?? '',
  };

  const selectedEmployee = employees.find((item) => item.id === currentFilters.employeeId);
  const selectedPolicy = policies.find((item) => item.id === currentFilters.policyId);
  const selectedLocation = locations.find((item) => item.id === currentFilters.locationId);
  const selectedCalendar = calendars.find((item) => item.id === currentFilters.calendarId);

  const setFilter = (key: keyof FilterState, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    setActiveFilter(null);
    router.replace(`/work-groups${next.toString() ? `?${next.toString()}` : ''}`);
  };

  const clearFilters = () => {
    setActiveFilter(null);
    router.replace('/work-groups');
  };

  return (
    <aside className="work-groups-filter-sidebar" dir="rtl">
      <div className="work-groups-filter-rail">
        <h2 className="work-groups-filter-title">فیلتر</h2>

        <div className="work-groups-filter-group work-groups-filter-group-muted">
          <div className="work-groups-filter-group-label">فهرست کارمندان</div>
          <span className="work-groups-filter-sub-label">کارمند</span>
          <button
            type="button"
            className="work-groups-filter-trigger is-muted"
            onClick={() => setActiveFilter((current) => (current === 'employee' ? null : 'employee'))}
          >
            <span>{selectedEmployee?.name ?? 'نام یا شناسه کارمند'}</span>
            <ChevronDown className={activeFilter === 'employee' ? 'work-groups-filter-trigger-icon is-open' : 'work-groups-filter-trigger-icon'} />
          </button>
          {activeFilter === 'employee' ? (
            <FilterPanel
              title="فهرست کارمندان"
              icon={<UserRound className="h-4 w-4" />}
              searchPlaceholder="جستجو در کارمندان"
              items={employees.map((item) => ({
                id: item.id,
                title: item.name,
                lines: [
                  `شناسه ملی: ${item.nationalId?.trim() || 'ثبت نشده است'}`,
                  `کد پرسنلی: ${item.personnelCode?.trim() || 'ثبت نشده است'}`,
                ],
              }))}
              selectedId={currentFilters.employeeId}
              onSelect={(value) => setFilter('employeeId', value)}
              emptyLabel="آیتمی برای نمایش وجود ندارد."
            />
          ) : null}
        </div>

        <div className="work-groups-filter-group">
          <div className="work-groups-filter-group-label">فهرست سیاست ها</div>
          <button type="button" className="work-groups-filter-trigger" onClick={() => setActiveFilter((current) => (current === 'policy' ? null : 'policy'))}>
            <span>{selectedPolicy?.title ?? 'سیاست های کاری'}</span>
            <ChevronDown className={activeFilter === 'policy' ? 'work-groups-filter-trigger-icon is-open' : 'work-groups-filter-trigger-icon'} />
          </button>
          {activeFilter === 'policy' ? (
            <FilterPanel
              title="سیاست های کاری"
              icon={<Shield className="h-4 w-4" />}
              searchPlaceholder="جستجو در سیاست های کاری"
              items={policies.map((item) => ({
                id: item.id,
                title: item.title,
                lines: [
                  `توضیحات: ${item.description?.trim() || 'ثبت نشده است'}`,
                  `تقویم: ${item.calendarTitle?.trim() || 'ثبت نشده است'}`,
                  `سال کاری: ${item.calendarYearLabel?.trim() || 'نامشخص'}`,
                ],
              }))}
              selectedId={currentFilters.policyId}
              onSelect={(value) => setFilter('policyId', value)}
              emptyLabel="آیتمی برای نمایش وجود ندارد."
            />
          ) : null}
        </div>

        <div className="work-groups-filter-group">
          <div className="work-groups-filter-group-label">موقعیت ها</div>
          <button type="button" className="work-groups-filter-trigger" onClick={() => setActiveFilter((current) => (current === 'location' ? null : 'location'))}>
            <span>{selectedLocation?.title ?? 'محل های کار'}</span>
            <ChevronDown className={activeFilter === 'location' ? 'work-groups-filter-trigger-icon is-open' : 'work-groups-filter-trigger-icon'} />
          </button>
          {activeFilter === 'location' ? (
            <FilterPanel
              title="محل های کار"
              icon={<MapPin className="h-4 w-4" />}
              searchPlaceholder="جستجو در محل های کار"
              items={locations.map((item) => ({
                id: item.id,
                title: item.title,
                lines: [
                  `توضیحات: ${item.description?.trim() || 'ثبت نشده است'}`,
                  `شعاع مجاز: ${typeof item.radius === 'number' ? `${item.radius}` : 'نامشخص'}`,
                ],
              }))}
              selectedId={currentFilters.locationId}
              onSelect={(value) => setFilter('locationId', value)}
              emptyLabel="آیتمی برای نمایش وجود ندارد."
            />
          ) : null}
        </div>

        <div className="work-groups-filter-group">
          <div className="work-groups-filter-group-label">فهرست تقویم ها</div>
          <button type="button" className="work-groups-filter-trigger" onClick={() => setActiveFilter((current) => (current === 'calendar' ? null : 'calendar'))}>
            <span>{selectedCalendar?.title ?? 'تقویم های کاری'}</span>
            <ChevronDown className={activeFilter === 'calendar' ? 'work-groups-filter-trigger-icon is-open' : 'work-groups-filter-trigger-icon'} />
          </button>
          {activeFilter === 'calendar' ? (
            <FilterPanel
              title="تقویم های کاری"
              icon={<CalendarDays className="h-4 w-4" />}
              searchPlaceholder="جستجو در تقویم های کاری"
              items={calendars.map((item) => ({
                id: item.id,
                title: item.title,
                lines: [
                  `توضیحات: ${item.description?.trim() || 'ثبت نشده است'}`,
                  `سال کاری: ${item.yearLabel?.trim() || 'نامشخص'}`,
                  item.shiftTitle?.trim() ? `شیفت: ${item.shiftTitle}` : 'شیفت: ثبت نشده است',
                ],
              }))}
              selectedId={currentFilters.calendarId}
              onSelect={(value) => setFilter('calendarId', value)}
              emptyLabel="آیتمی برای نمایش وجود ندارد."
            />
          ) : null}
        </div>

        <p className="work-groups-filter-note">فیلترها به صورت زنده روی لیست اعمال می‌شوند.</p>
      </div>

      <button type="button" className="work-groups-filter-clear" onClick={clearFilters}>
        حذف فیلتر
      </button>
    </aside>
  );
}
