'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getContractHistory } from '../../../lib/contractDraftClient';
import type { ContractHistoryResponse } from '../../../lib/contractHistory';
import { HistoryTimelineView } from './HistoryTimelineView';

export function ContractHistoryPanel({ contractId, embedded = true }: { contractId: string; embedded?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<ContractHistoryResponse | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!contractId) return;
    setError('');
    try {
      setLoading(true);
      const history = await getContractHistory(contractId);
      setData(history);
      setSelectedVersionId(history.currentVersionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'دریافت تاریخچه قرارداد انجام نشد.');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onUpdated = () => {
      void load();
    };
    window.addEventListener('contract-approval-updated', onUpdated);
    return () => window.removeEventListener('contract-approval-updated', onUpdated);
  }, [load]);

  const meta = useMemo(() => {
    if (!data) return null;
    const current = data.versions.find((v) => v.id === data.currentVersionId);
    return {
      title: 'تاریخچه قرارداد',
      description: 'سیر تغییرات قرارداد از نسخه اصلی تا آخرین متمم تاییدشده را در بخش‌های مختلف مشاهده کنید.',
      currentLabel: current ? `وضعیت فعلی: ${current.title}` : undefined,
      stats: [
        { label: 'تعداد نسخه‌ها', value: data.stats.versionCount.toLocaleString('fa-IR') },
        { label: 'تعداد بخش‌ها', value: data.stats.sectionCount.toLocaleString('fa-IR') },
        { label: 'بخش‌های دارای تغییر', value: data.stats.changedSectionCount.toLocaleString('fa-IR'), accent: true },
        { label: 'شماره قرارداد', value: data.contractNumber ?? '—' },
      ],
    };
  }, [data]);

  if (loading) {
    return (
      <section className="contract-details-panel mt-4 rounded-[28px] border border-slate-200/80 bg-white/95 px-5 py-10 text-center text-sm font-bold text-slate-500 shadow-sm">
        در حال بارگذاری تاریخچه قرارداد...
      </section>
    );
  }

  if (error) {
    return (
      <section className="contract-details-panel mt-4 rounded-[28px] border border-rose-200 bg-rose-50/95 px-5 py-8 text-center text-sm font-bold text-rose-800 shadow-sm">
        {error}
      </section>
    );
  }

  if (!data || !meta) return null;

  return (
    <div className="mt-4">
      <HistoryTimelineView
        embedded={embedded}
        meta={meta}
        sections={data.sections}
        versions={data.versions}
        selectedVersionId={selectedVersionId}
        onSelectVersion={setSelectedVersionId}
      />
    </div>
  );
}
