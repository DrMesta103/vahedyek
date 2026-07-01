'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PanelLayout from '../../../../../../components/PanelLayout';
import { HistoryTimelineView } from '../../../../../../components/contracts/history/HistoryTimelineView';
import { getAppendixCompare } from '../../../../../../lib/contractDraftClient';
import type { AppendixHistorySection } from '../../../../../../lib/appendixLifecycle';

type CompareResponse = {
  current: {
    title: string;
    appendixNumber: number;
  };
  sections: AppendixHistorySection[];
};

export default function AppendixComparePage() {
  const params = useParams<{ contractId: string; appendixId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<CompareResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setData(await getAppendixCompare(String(params.appendixId)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'دریافت مقایسه متمم انجام نشد.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.appendixId]);

  const backHref = useMemo(
    () =>
      `/contracts/${params.contractId}/appendices/${params.appendixId}${
        searchParams?.get('list') ? `?list=${encodeURIComponent(searchParams.get('list') as string)}` : ''
      }`,
    [params.appendixId, params.contractId, searchParams],
  );

  const meta = useMemo(() => {
    if (!data) return null;
    return {
      title: 'تاریخچه متمم',
      description: 'در این صفحه سیر تغییرات هر بخش از اصل قرارداد تا نسخه فعلی این متمم نمایش داده می‌شود.',
      currentLabel: `متمم فعلی: ${data.current.title}`,
      stats: [
        { label: 'متمم فعلی', value: data.current.title, accent: true },
        { label: 'شماره متمم', value: Number(data.current.appendixNumber).toLocaleString('fa-IR') },
        { label: 'تعداد بخش‌ها', value: data.sections.length.toLocaleString('fa-IR') },
        { label: 'نوع نمایش', value: 'تایم‌لاین تفکیک‌شده' },
      ],
    };
  }, [data]);

  return (
    <PanelLayout>
      <main className="contract-details-page w-full max-w-none min-w-0 space-y-5" dir="rtl" lang="fa">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            بازگشت به جزئیات متمم
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <section className="rounded-[8px] border border-white/70 bg-white/95 p-10 text-center text-sm font-bold text-slate-500 shadow-sm">
            در حال بارگذاری...
          </section>
        ) : error ? (
          <section className="rounded-[8px] border border-rose-200 bg-rose-50/95 p-8 text-center text-sm font-bold text-rose-800 shadow-sm">
            {error}
          </section>
        ) : data && meta ? (
          <HistoryTimelineView meta={meta} sections={data.sections} />
        ) : null}
      </main>
    </PanelLayout>
  );
}


