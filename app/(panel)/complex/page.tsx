'use client';

import { useEffect, useState } from 'react';
import PanelLayout from '../../components/PanelLayout';
import { getReferenceData } from '../../lib/contractDraftClient';

type BlockWithUnits = {
  id: string;
  name: string;
  units: Array<{
    id: string;
    floorName: string;
    name: string;
    title: string;
  }>;
};

export default function ComplexPage() {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [blocks, setBlocks] = useState<BlockWithUnits[]>([]);

  const loadBlocks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReferenceData();
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
        throw new Error(data?.message ?? 'ساخت بلوک نمونه انجام نشد.');
      }

      setMessage(`${data.blocksCreated} بلوک و ${data.unitsCreated} واحد برای tenant فعال ساخته شد.`);
      await loadBlocks();
    } catch (seedError) {
      setError(seedError instanceof Error ? seedError.message : 'ساخت داده نمونه انجام نشد.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <PanelLayout>
      <div className="space-y-5">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">جزئیات مجتمع</h1>
              <p className="mt-2 text-sm text-gray-500">بلوک‌ها و واحدهای tenant فعال را در این بخش می‌بینید و می‌توانید داده نمونه بسازید.</p>
            </div>

            <button
              type="button"
              onClick={handleSeedSample}
              disabled={seeding}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {seeding ? 'در حال ساخت داده نمونه...' : 'ساخت 3 بلوک نمونه'}
            </button>
          </div>

          {message ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
          {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        </section>

        {loading ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">در حال دریافت بلوک‌ها و واحدها...</div>
        ) : blocks.length ? (
          <section className="grid gap-4 xl:grid-cols-3">
            {blocks.map((block) => (
              <article key={block.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{block.name}</h2>
                    <p className="mt-1 text-xs text-gray-400">{block.units.length} واحد ثبت شده</p>
                  </div>
                  <div className="rounded-2xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">بلوک</div>
                </div>

                <div className="mt-4 max-h-[440px] space-y-3 overflow-y-auto pl-1">
                  {block.units.map((unit) => (
                    <div key={unit.id} className="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3">
                      <div className="text-sm font-semibold text-gray-800">{unit.name}</div>
                      <div className="mt-1 text-xs text-gray-500">{unit.floorName}</div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
            هنوز برای tenant فعال بلوکی ثبت نشده است. از دکمه بالا برای ساخت داده نمونه استفاده کنید.
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
