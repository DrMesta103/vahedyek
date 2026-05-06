'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import {
  ContractDraftPreviewContent,
  EMPTY_PREVIEW_CONTRACT_PAYLOAD,
  mapContractDetailsToPreviewPayload,
  type PreviewContractPayload,
} from '../../../../components/contracts/ContractDraftPreviewContent';
import { getContractDetails } from '../../../../lib/contractDraftClient';

export default function ContractDraftPreviewPage() {
  const params = useParams<{ contractId: string }>();
  const contractId = params?.contractId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState<PreviewContractPayload | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!contractId) return;
      try {
        setLoading(true);
        const data = await getContractDetails(String(contractId));
        if (mounted) setPayload(mapContractDetailsToPreviewPayload(data));
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'دریافت پیش‌نویس انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [contractId]);

  const effectivePayload = payload ?? EMPTY_PREVIEW_CONTRACT_PAYLOAD;

  if (loading) {
    return (
      <PanelLayout>
        <div className="contract-draft-preview-root">
          <div className="mx-auto w-[min(1120px,calc(100%-28px))] py-10">
            <div className="rounded-[28px] border border-white/70 bg-white/95 p-10 text-center text-sm font-bold text-slate-500 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.14)]">
              در حال بارگذاری…
            </div>
          </div>
        </div>
      </PanelLayout>
    );
  }

  if (error || !contractId) {
    return (
      <PanelLayout>
        <div className="contract-draft-preview-root">
          <div className="mx-auto w-[min(1120px,calc(100%-28px))] py-10">
            <div className="rounded-[28px] border border-rose-200 bg-rose-50/95 p-8 text-center text-sm font-bold text-rose-800 shadow-sm">
              {error || 'شناسه قرارداد نامعتبر است.'}
            </div>
          </div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout>
      <ContractDraftPreviewContent layout="standalone" payload={effectivePayload} contractId={contractId} />
    </PanelLayout>
  );
}
