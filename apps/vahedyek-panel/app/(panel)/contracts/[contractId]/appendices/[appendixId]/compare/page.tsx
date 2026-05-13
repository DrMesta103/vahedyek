'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PanelLayout from '../../../../../../components/PanelLayout';
import { getAppendixCompare } from '../../../../../../lib/contractDraftClient';

function stringifyPayload(payload: any) {
  if (!payload) return '—';
  if (payload.deliveryDate) return String(payload.deliveryDate);
  if (payload.nextDate) return String(payload.nextDate);
  if (Array.isArray(payload.parties)) {
    return payload.parties.map((item: any) => `${item.name} (${item.share?.value ?? 0} ${item.share?.mode === 'percent' ? 'درصد' : 'دانگ'})`).join(' • ') || '—';
  }
  return JSON.stringify(payload, null, 2);
}

export default function AppendixComparePage() {
  const params = useParams<{ contractId: string; appendixId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setData(await getAppendixCompare(String(params.appendixId)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'دریافت مقایسه متمم انجام نشد.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.appendixId]);

  return (
    <PanelLayout>
      <main className="contract-details-page w-full max-w-none min-w-0 space-y-5" dir="rtl" lang="fa">
        <div className="flex justify-end">
          <button type="button" onClick={() => router.push(`/contracts/${params.contractId}/appendices/${params.appendixId}${searchParams?.get('list') ? `?list=${encodeURIComponent(searchParams.get('list') as string)}` : ''}`)} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm">
            بازگشت به جزئیات متمم
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <section className="rounded-[28px] border border-white/70 bg-white/95 p-10 text-center text-sm font-bold text-slate-500 shadow-sm">در حال بارگذاری...</section>
        ) : error ? (
          <section className="rounded-[28px] border border-rose-200 bg-rose-50/95 p-8 text-center text-sm font-bold text-rose-800 shadow-sm">{error}</section>
        ) : (
          <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="text-right">
              <h1 className="text-[22px] font-black text-slate-900">مقایسه متمم</h1>
              <p className="mt-2 text-[13px] font-semibold text-slate-500">مبنای مقایسه: {data.compareBase.sourceLabel}</p>
            </div>
            <div className="mt-5 space-y-4">
              {data.rows.map((row: any) => (
                <div key={row.tagKey} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="text-[14px] font-black text-slate-900">{row.title}</div>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-right">
                      <div className="text-[11px] font-black text-slate-500">{data.compareBase.sourceLabel}</div>
                      <div className="mt-2 text-[12px] font-semibold leading-7 text-slate-700">{stringifyPayload(row.previousPayload)}</div>
                    </div>
                    <div className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4 text-right">
                      <div className="text-[11px] font-black text-cyan-700">متمم فعلی</div>
                      <div className="mt-2 text-[12px] font-semibold leading-7 text-slate-700">{stringifyPayload(row.currentPayload)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </PanelLayout>
  );
}
