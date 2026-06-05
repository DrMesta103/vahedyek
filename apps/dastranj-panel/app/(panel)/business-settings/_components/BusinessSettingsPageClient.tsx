'use client';

import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BUSINESS_SETTINGS_CATEGORIES, filterBusinessSettingsCategories } from '../../../lib/business-settings';
import type { TenantSetupHealth } from '../../../lib/setup-health';
import { BusinessSettingsCard } from './BusinessSettingsCard';

type BusinessSettingsPageClientProps = {
  setupHealth: TenantSetupHealth | null;
};

const STATUS_BADGE_BY_ROUTE = {
  '/locations': 'workplace',
  '/calendars': 'calendar',
  '/shift-templates': 'shift_template',
  '/policies': 'work_policy',
  '/employees': 'employees',
  '/work-groups': 'work_groups',
} as const;

export function BusinessSettingsPageClient({ setupHealth }: BusinessSettingsPageClientProps) {
  const [query, setQuery] = useState('');
  const filteredCategories = useMemo(() => filterBusinessSettingsCategories(BUSINESS_SETTINGS_CATEGORIES, query), [query]);
  const criticalStatusMap = useMemo(
    () => new Map(setupHealth?.criticalItems.map((item) => [item.key, item.status]) ?? []),
    [setupHealth],
  );

  return (
    <div className="business-settings-page-shell" dir="rtl" lang="fa">
      <header className="business-settings-page-intro">
        <p>مرکز کنترل تنظیمات</p>
        <h1>تنظیمات کسب‌وکار</h1>
        <span>تنظیمات پایه، عملیاتی، منابع انسانی، تردد، قراردادها و حقوق و دستمزد کسب‌وکار را از اینجا مدیریت کنید.</span>
      </header>

      <div className="business-settings-search-wrap">
        <div className="business-settings-search-pattern" aria-hidden />
        <label className="business-settings-search">
          <Search className="business-settings-search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جست‌وجو در تنظیمات کسب‌وکار"
            aria-label="جست‌وجو در تنظیمات کسب‌وکار"
          />
          {query ? (
            <button type="button" className="business-settings-search-clear" onClick={() => setQuery('')} aria-label="پاک کردن جست‌وجو">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
      </div>

      {filteredCategories.length ? (
        <div className="business-settings-sections">
          {filteredCategories.map((category) => (
            <section key={category.id} className="business-settings-section-card" aria-label={category.title}>
              <div className="business-settings-section-head">
                <div>
                  <h2>{category.title}</h2>
                  <p>{category.description}</p>
                </div>
                <span className="business-settings-section-count">{category.items.length} مورد</span>
              </div>
              <div className="business-settings-section-items">
                {category.items.map((item) => {
                  const statusKey = STATUS_BADGE_BY_ROUTE[item.href as keyof typeof STATUS_BADGE_BY_ROUTE];
                  const status = statusKey ? criticalStatusMap.get(statusKey) : null;

                  return (
                    <BusinessSettingsCard
                      key={`${item.href}-${item.icon}-${item.title}`}
                      {...item}
                      badges={[
                        ...(item.badges ?? []),
                        ...(status === 'completed' ? [{ label: 'تکمیل‌شده', tone: 'success' as const }] : []),
                        ...(status === 'incomplete' ? [{ label: 'ناقص', tone: 'important' as const }] : []),
                      ]}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="business-settings-empty-state">موردی یافت نشد</div>
      )}
    </div>
  );
}
