'use client';

import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BUSINESS_SETTINGS_CATALOG, filterBusinessSettingsCatalog } from '../../../lib/business-settings';
import { BusinessSettingsCard } from './BusinessSettingsCard';

export function BusinessSettingsPageClient() {
  const [query, setQuery] = useState('');
  const filteredItems = useMemo(() => filterBusinessSettingsCatalog(BUSINESS_SETTINGS_CATALOG, query), [query]);

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-2.5 px-2" dir="rtl" lang="fa">
      <div className="business-settings-search-wrap">
        <div className="business-settings-search-pattern" aria-hidden />
        <label className="business-settings-search">
          <Search className="business-settings-search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو"
            aria-label="جستجو در تنظیمات کسب و کار"
          />
          {query ? (
            <button type="button" className="business-settings-search-clear" onClick={() => setQuery('')} aria-label="پاک کردن جستجو">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
      </div>

      {filteredItems.length ? (
        filteredItems.map((item) => <BusinessSettingsCard key={`${item.href}-${item.icon}-${item.title}`} {...item} />)
      ) : (
        <div className="rounded-[18px] border border-white/10 bg-slate-900/35 px-4 py-8 text-center text-sm text-slate-400 [html[data-theme=light]_&]:border-slate-200/90 [html[data-theme=light]_&]:bg-white/80 [html[data-theme=light]_&]:text-slate-500">
          موردی یافت نشد
        </div>
      )}
    </div>
  );
}
