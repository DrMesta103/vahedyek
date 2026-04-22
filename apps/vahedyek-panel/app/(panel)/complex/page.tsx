'use client';

import { useEffect, useMemo, useState } from 'react';
import PanelLayout from '../../components/PanelLayout';

type UnitCategory = 'unit' | 'parking' | 'storage' | 'amenity';

type ComplexUnit = {
  id: string;
  floorName: string;
  name: string;
  category: UnitCategory;
  unitType: string | null;
  usage: string;
  saleEnabled: boolean;
  deliveryStatus: string;
  area: number | null;
  balconyCount: number;
  bedroomCount: number;
  postalCode: string | null;
  amenities: Array<{ title: string; count: number }>;
  baseInfo: string | null;
  direction: string;
  assignedToUnitId: string | null;
};

type ComplexBlock = {
  id: string;
  name: string;
  mainPlate: string | null;
  subPlate: string | null;
  status: string;
  floors: Array<{ id: string; name: string }>;
  units: ComplexUnit[];
};

type ComplexResponse = {
  blocks: ComplexBlock[];
};

const categoryLabels: Record<UnitCategory, string> = {
  unit: 'واحد',
  parking: 'پارکینگ',
  storage: 'انباری',
  amenity: 'رفاهی',
};

const usageLabels: Record<string, string> = {
  residential: 'مسکونی',
  commercial: 'تجاری',
  office: 'اداری',
};

const deliveryLabels: Record<string, string> = {
  ready: 'آماده تحویل',
  presale: 'پیش فروش',
};

const directionLabels: Record<string, string> = {
  unknown: 'نامشخص',
  north: 'شمالی',
  south: 'جنوبی',
  east: 'شرقی',
  west: 'غربی',
  'north-east': 'شمال شرقی',
  'north-west': 'شمال غربی',
  'south-east': 'جنوب شرقی',
  'south-west': 'جنوب غربی',
};

async function readComplex() {
  const response = await fetch('/api/complex', { cache: 'no-store' });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? 'دریافت اطلاعات مجتمع انجام نشد.');
  }

  return data as ComplexResponse;
}

function categoryClass(category: UnitCategory) {
  if (category === 'parking') return 'bg-sky-50 text-sky-700 ring-sky-100';
  if (category === 'storage') return 'bg-amber-50 text-amber-700 ring-amber-100';
  if (category === 'amenity') return 'bg-violet-50 text-violet-700 ring-violet-100';
  return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
}

function BlockSummary({ block }: { block: ComplexBlock }) {
  const counts = useMemo(
    () => ({
      unit: block.units.filter((unit) => unit.category === 'unit').length,
      parking: block.units.filter((unit) => unit.category === 'parking').length,
      storage: block.units.filter((unit) => unit.category === 'storage').length,
      amenity: block.units.filter((unit) => unit.category === 'amenity').length,
    }),
    [block.units],
  );

  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {Object.entries(counts).map(([key, value]) => (
        <div key={key} className="border-b border-gray-100 py-2">
          <div className="text-xs text-gray-400">{categoryLabels[key as UnitCategory]}</div>
          <div className="mt-1 text-base font-bold text-gray-900">{value}</div>
        </div>
      ))}
    </div>
  );
}

function BlockUnits({ block }: { block: ComplexBlock }) {
  const unitNameById = useMemo(() => new Map(block.units.map((unit) => [unit.id, unit.name])), [block.units]);
  const floorNames = block.floors.length ? block.floors.map((floor) => floor.name) : Array.from(new Set(block.units.map((unit) => unit.floorName)));

  return (
    <div className="mt-5 space-y-5">
      {floorNames.map((floorName) => {
        const units = block.units.filter((unit) => unit.floorName === floorName);
        if (!units.length) return null;

        return (
          <section key={floorName} className="border-t border-gray-100 pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-800">{floorName}</h3>
              <span className="text-xs text-gray-400">{units.length} مورد</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full table-fixed text-right text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="w-24 px-3 py-2 font-medium">نوع</th>
                    <th className="px-3 py-2 font-medium">مشخصه</th>
                    <th className="w-28 px-3 py-2 font-medium">متراژ</th>
                    <th className="hidden px-3 py-2 font-medium md:table-cell">جزئیات</th>
                    <th className="hidden w-32 px-3 py-2 font-medium lg:table-cell">اتصال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {units.map((unit) => (
                    <tr key={unit.id}>
                      <td className="px-3 py-3 align-top">
                        <span className={`inline-flex rounded-full px-2.5 py-1 font-medium ring-1 ${categoryClass(unit.category)}`}>
                          {categoryLabels[unit.category]}
                        </span>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="font-semibold text-gray-900">{unit.name}</div>
                        <div className="mt-1 text-gray-400">{unit.unitType ?? usageLabels[unit.usage] ?? unit.usage}</div>
                      </td>
                      <td className="px-3 py-3 align-top text-gray-700">{unit.area ? `${unit.area} متر` : '—'}</td>
                      <td className="hidden px-3 py-3 align-top text-gray-500 md:table-cell">
                        {unit.category === 'unit'
                          ? `${deliveryLabels[unit.deliveryStatus] ?? unit.deliveryStatus}، ${unit.bedroomCount} خواب، ${unit.balconyCount} تراس، ${directionLabels[unit.direction] ?? unit.direction}`
                          : unit.baseInfo ?? '—'}
                      </td>
                      <td className="hidden px-3 py-3 align-top text-gray-500 lg:table-cell">
                        {unit.assignedToUnitId ? unitNameById.get(unit.assignedToUnitId) ?? 'واحد مرتبط' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function ComplexPage() {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [blocks, setBlocks] = useState<ComplexBlock[]>([]);

  const loadBlocks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await readComplex();
      setBlocks(data.blocks);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'دریافت اطلاعات مجتمع انجام نشد.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBlocks();
  }, []);

  const handleSeedSample = async () => {
    setSeeding(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/complex/seed-sample', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? 'ساخت داده مجتمع انجام نشد.');
      }

      setMessage(
        `داده‌های قبلی حذف شد و ${data.blocksCreated} بلوک، ${data.floorsCreated} طبقه/بخش و ${data.unitsCreated} رکورد واحد، پارکینگ، انباری و رفاهی ساخته شد.`,
      );
      await loadBlocks();
    } catch (seedError) {
      setError(seedError instanceof Error ? seedError.message : 'ساخت داده مجتمع انجام نشد.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <PanelLayout>
      <div className="space-y-5">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">جزئیات مجتمع</h1>
              <p className="mt-2 text-sm text-gray-500">نمایش اطلاعات بلوک‌ها، طبقات، واحدها، پارکینگ، انباری و فضاهای رفاهی tenant فعال.</p>
            </div>

            <button
              type="button"
              onClick={handleSeedSample}
              disabled={seeding}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-600 px-5 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {seeding ? 'در حال ساخت داده کامل...' : 'ساخت 3 بلوک کامل'}
            </button>
          </div>

          {message ? <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
          {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        </section>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">در حال دریافت اطلاعات مجتمع...</div>
        ) : blocks.length ? (
          <section className="space-y-4">
            {blocks.map((block) => (
              <article key={block.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{block.name}</h2>
                    <p className="mt-1 text-xs text-gray-400">
                      پلاک اصلی {block.mainPlate ?? '—'}، فرعی {block.subPlate ?? '—'}، {block.floors.length} طبقه/بخش ثبت شده
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">فقط نمایش</div>
                </div>

                <BlockSummary block={block} />
                <BlockUnits block={block} />
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
            هنوز داده‌ای برای مجتمع ثبت نشده است. از دکمه بالا برای ساخت ۳ بلوک کامل استفاده کنید.
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
