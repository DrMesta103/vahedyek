'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PanelLayout from '../../../../../components/PanelLayout';
import { AppendixApprovalFlowBanner } from '../../../../../components/contracts/appendices/AppendixApprovalFlowBanner';
import { appendixItemValueText, appendixStatusLabel } from '../../../../../lib/appendixLifecycle';
import { filterSupportedAppendixTags } from '../../../../../lib/appendixTagSupport';
import { getAppendixDetails } from '../../../../../lib/contractDraftClient';

export default function AppendixDetailsPage() {
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
        setData(await getAppendixDetails(String(params.appendixId)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'دریافت جزئیات متمم انجام نشد.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.appendixId]);

  const backHref = `/contracts/${params.contractId}/appendices${searchParams?.get('list') ? `?list=${encodeURIComponent(searchParams.get('list') as string)}` : ''}`;

  return (
    <PanelLayout>
      <main className="contract-details-page w-full max-w-none min-w-0 space-y-5" dir="rtl" lang="fa">
        <div className="flex justify-end">
          <button type="button" onClick={() => router.push(backHref)} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm">
            بازگشت به فهرست متمم‌ها
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <section className="rounded-[28px] border border-white/70 bg-white/95 p-10 text-center text-sm font-bold text-slate-500 shadow-sm">در حال بارگذاری...</section>
        ) : error ? (
          <section className="rounded-[28px] border border-rose-200 bg-rose-50/95 p-8 text-center text-sm font-bold text-rose-800 shadow-sm">{error}</section>
        ) : (
          <>
            <AppendixApprovalFlowBanner appendixId={String(params.appendixId)} appendixStatus={data.item.status} />

            <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="text-right">
                  <h1 className="text-[22px] font-black text-slate-900">{data.item.title}</h1>
                  <div className="mt-2 text-[13px] font-semibold text-slate-500">{appendixStatusLabel(data.item.status)}</div>
                  <div className="mt-1 text-[12px] font-semibold text-slate-500">{data.item.summary}</div>
                </div>
                <div className="text-right text-[13px] font-semibold text-slate-600">
                  <div>منبع مقایسه: {data.compareBase.sourceLabel}</div>
                  <div className="mt-1">ثبت توسط: {data.item.issuerName}</div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap justify-end gap-2">
                {data.item.canEdit ? (
                  <button
                    type="button"
                    onClick={() => {
                      const firstTag = filterSupportedAppendixTags(data.item.items.map((item: any) => item.tagKey))[0];
                      if (!firstTag) return;
                      router.push(`/contracts/${params.contractId}/appendices/new/${firstTag}?appendixId=${encodeURIComponent(String(params.appendixId))}${searchParams?.get('list') ? `&list=${encodeURIComponent(searchParams.get('list') as string)}` : ''}`);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-extrabold text-slate-700"
                  >
                    ویرایش پیش‌نویس
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => router.push(`/contracts/${params.contractId}/appendices/${params.appendixId}/compare${searchParams?.get('list') ? `?list=${encodeURIComponent(searchParams.get('list') as string)}` : ''}`)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-extrabold text-slate-700"
                >
                  مشاهده تاریخچه / مقایسه
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {data.item.items.map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="text-[14px] font-black text-slate-800">{item.title}</div>
                    <div className="mt-2 text-[12px] font-semibold leading-7 text-slate-600">{appendixItemValueText(item)}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </PanelLayout>
  );
}
