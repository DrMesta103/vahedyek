'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { ContractHistoryPanel } from '../../../../components/contracts/history/ContractHistoryPanel';

export default function ContractHistoryPage() {
  const params = useParams<{ contractId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = params?.contractId ? String(params.contractId) : '';

  const backHref = useMemo(() => {
    const q = searchParams?.toString();
    return `/contracts/${contractId}${q ? `?${q}` : ''}`;
  }, [contractId, searchParams]);

  return (
    <PanelLayout>
      <main className="contract-details-page w-full max-w-none min-w-0 space-y-5" dir="rtl" lang="fa">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            بازگشت به جزئیات قرارداد
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {contractId ? <ContractHistoryPanel contractId={contractId} embedded={false} /> : null}
      </main>
    </PanelLayout>
  );
}

