'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Home, Search } from 'lucide-react';
import PanelLayout from '../../components/PanelLayout';

type UnitCategory = 'unit' | 'parking' | 'storage' | 'amenity';

type UnitRow = {
  id: string;
  blockName: string;
  floorName: string;
  name: string;
  category: UnitCategory;
  usage: string;
  unitType: string | null;
  saleEnabled: boolean;
  deliveryStatus: string;
  area: number | null;
  bedroomCount: number;
  balconyCount: number;
};

type ComplexResponse = {
  blocks: Array<{
    id: string;
    name: string;
    units: Array<Omit<UnitRow, 'blockName'>>;
  }>;
};

const categoryLabels: Record<UnitCategory, string> = {
  unit: 'واحد',
  parking: 'پارکینگ',
  storage: 'انباری',
  amenity: 'فضای رفاهی',
};

function formatArea(area: number | null) {
  return area ? `${Number(area).toLocaleString('fa-IR')} متر` : '—';
}

export default function UnitsPage() {
  const [rows, setRows] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<UnitCategory | 'all'>('all');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/complex', { cache: 'no-store' });
        const payload = (await response.json()) as ComplexResponse & { message?: string };
        if (!response.ok) throw new Error(payload.message || 'دریافت فهرست واحدها انجام نشد.');
        if (!mounted) return;
        setRows(
          payload.blocks.flatMap((block) =>
            block.units.map((unit) => ({
              ...unit,
              blockName: block.name,
            })),
          ),
        );
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'دریافت فهرست واحدها انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (category !== 'all' && row.category !== category) return false;
      if (!needle) return true;
      return [row.name, row.blockName, row.floorName, row.unitType, row.usage].join(' ').toLowerCase().includes(needle);
    });
  }, [category, query, rows]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      unit: rows.filter((row) => row.category === 'unit').length,
      parking: rows.filter((row) => row.category === 'parking').length,
      storage: rows.filter((row) => row.category === 'storage').length,
      amenity: rows.filter((row) => row.category === 'amenity').length,
    }),
    [rows],
  );

  return (
    <PanelLayout>
      <main className="space-y-5" dir="rtl">
        <section className="rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] p-5 shadow-[0_18px_45px_var(--shadow-soft)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_85%,black)]">
                <Building2 className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-black text-[color:var(--text-strong)]">فهرست واحدها</h1>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">نمای عملیاتی واحدها، پارکینگ‌ها، انباری‌ها و فضاهای ثبت‌شده برای کسب و کار فعال.</p>
              </div>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pr-10 pl-4 text-sm outline-none focus:border-[color:var(--theme-action-border)]"
                placeholder="جستجو در واحدها..."
              />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'unit', 'parking', 'storage', 'amenity'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                  category === item ? 'border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item === 'all' ? 'همه' : categoryLabels[item]} ({counts[item].toLocaleString('fa-IR')})
              </button>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm font-bold text-slate-500">در حال بارگذاری...</div>
          ) : error ? (
            <div className="p-10 text-center text-sm font-bold text-rose-700">{error}</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-10 text-center text-sm font-bold text-slate-500">واحدی یافت نشد.</div>
          ) : (
            <>
            <table className="mobile-data-table-desktop w-full min-w-[760px] text-right text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">واحد</th>
                  <th className="px-4 py-3">موقعیت</th>
                  <th className="px-4 py-3">نوع</th>
                  <th className="px-4 py-3">متراژ</th>
                  <th className="px-4 py-3">وضعیت فروش</th>
                  <th className="px-4 py-3">جزئیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-black text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        <Home className="h-4 w-4 text-[color-mix(in_srgb,var(--dark-teal)_80%,black)]" />
                        {row.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.blockName}، {row.floorName}</td>
                    <td className="px-4 py-3 text-slate-700">{categoryLabels[row.category]}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">{formatArea(row.area)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.saleEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {row.saleEnabled ? 'قابل فروش' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.category === 'unit' ? `${row.bedroomCount} خواب، ${row.balconyCount} تراس` : row.unitType || row.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mobile-data-card-list">
              {filteredRows.map((row) => (
                <article key={row.id} className="mobile-data-card">
                  <div className="mobile-data-card-head">
                    <strong className="inline-flex items-center gap-2">
                      <Home className="h-4 w-4 text-[color:var(--dark-teal)]" />
                      {row.name}
                    </strong>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.saleEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {row.saleEnabled ? 'قابل فروش' : 'غیرفعال'}
                    </span>
                  </div>
                  <dl className="mobile-data-card-grid">
                    <div><dt>موقعیت</dt><dd>{row.blockName}، {row.floorName}</dd></div>
                    <div><dt>نوع</dt><dd>{categoryLabels[row.category]}</dd></div>
                    <div><dt>متراژ</dt><dd>{formatArea(row.area)}</dd></div>
                    <div><dt>جزئیات</dt><dd>{row.category === 'unit' ? `${row.bedroomCount} خواب، ${row.balconyCount} تراس` : row.unitType || row.usage}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
            </>
          )}
        </section>
      </main>
    </PanelLayout>
  );
}
