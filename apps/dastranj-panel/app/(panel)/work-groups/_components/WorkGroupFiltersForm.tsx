'use client';

import { Search } from 'lucide-react';

export function WorkGroupFiltersForm({ query, status }: { query: string; status: string }) {
  return (
    <form className="flex gap-2" method="get">
      <Search className="work-groups-list-search-icon" aria-hidden />
      <input name="q" defaultValue={query} placeholder="جست‌وجوی عنوان گروه کاری" />
      <select name="status" defaultValue={status || 'ALL'} onChange={(event) => event.currentTarget.form?.requestSubmit()}>
        <option value="ALL">همه وضعیت‌ها</option>
        <option value="ACTIVE">فعال</option>
        <option value="INACTIVE">غیرفعال</option>
      </select>
    </form>
  );
}
