'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PanelLayout from '../../../../components/PanelLayout';
import { getContractDetails, getContractHistory } from '../../../../lib/contractDraftClient';
import { computeContractTotalRialFromFinancial } from '../../../../lib/contractFinancialPricing';
import { getReceiptsStorageKey, normalizeReceiptRecords, type RegisteredReceiptRecord } from '../../../../lib/contractReceipts';
import type { ContractStatus } from '../../../../types/contract';
import { ModernContractSummarySection } from '../_components/ModernContractSummarySection';

function getUnitUsageLabel(usage: string | null | undefined) {
  switch (usage) {
    case 'residential':
      return 'مسکونی';
    case 'commercial':
      return 'تجاری';
    case 'office':
      return 'اداری';
    case 'parking':
      return 'پارکینگ';
    case 'storage':
      return 'انباری';
    case 'amenity':
      return 'مشاعات';
    default:
      return '—';
  }
}

function getContractSummaryStatusLabel(status: ContractStatus | null | undefined, approvalStatus: string | null | undefined) {
  if (approvalStatus === 'IN_REVIEW') return 'در انتظار تایید';
  if (status === 'completed') return 'تکمیل شده';
  if (status === 'pending_approval') return 'در انتظار تایید';
  if (status === 'draft') return 'پیش‌نویس';
  return 'نامشخص';
}


export default function ContractModernSummaryPage() {
  const pageClassName = 'contract-details-page contract-details-page-modern flex h-full min-h-0 flex-1 flex-col gap-4';

  const params = useParams<{ contractId: string }>();
  const contractId = params?.contractId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [contractHistory, setContractHistory] = useState<any>(null);
  const [registeredReceipts, setRegisteredReceipts] = useState<RegisteredReceiptRecord[]>([]);

  const reloadContract = useCallback(async () => {
    if (!contractId) return;
    setError('');
    try {
      setLoading(true);
      const [data, history] = await Promise.all([
        getContractDetails(String(contractId)),
        getContractHistory(String(contractId)).catch(() => null),
      ]);
      setContract(data);
      setContractHistory(history);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'دریافت جزئیات قرارداد انجام نشد.');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void reloadContract();
  }, [reloadContract]);

  useEffect(() => {
    if (!contractId || typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(getReceiptsStorageKey(String(contractId)));
      setRegisteredReceipts(normalizeReceiptRecords(raw ? JSON.parse(raw) : []));
    } catch {
      setRegisteredReceipts([]);
    }
  }, [contractId]);

  const view = useMemo(() => {
    const subject = contract?.data?.subject ?? null;
    const parties = contract?.data?.parties ?? null;
    const financial = contract?.data?.financial ?? null;
    const buyer =
      parties?.partyTwo?.find((p: any) => p.isPrimary) ??
      parties?.partyTwo?.[0] ??
      parties?.partyOne?.find((p: any) => p.isPrimary) ??
      parties?.partyOne?.[0] ??
      null;

    const amount = computeContractTotalRialFromFinancial(financial);
    const unitName = subject?.unitName ?? '—';
    const unitUsageLabel = getUnitUsageLabel(subject?.unitUsage ?? null);

    return {
      buyerName: buyer?.name ?? '—',
      blockName: subject?.blockName ?? '—',
      floorName: subject?.floorName ?? '—',
      unitLabel: unitUsageLabel && unitUsageLabel !== '—' ? `${unitName} (${unitUsageLabel})` : unitName,
      contractNumber: subject?.contractNumber ?? '—',
      contractDate: subject?.contractDate ?? '—',
      contractTypeLabel: subject?.contractType === 'pre-sale' ? 'پیش‌فروش' : subject?.contractType === 'sale' ? 'فروش' : '—',
      amount,
    };
  }, [contract]);

  const paidAmountRial = useMemo(
    () => registeredReceipts.reduce((sum, receipt) => sum + Number(receipt.paidAmountRial || 0), 0),
    [registeredReceipts],
  );

  const pendingReceiptAmountRial = useMemo(
    () =>
      registeredReceipts
        .filter((receipt) => (receipt.reviewStatus ?? 'pending') === 'pending')
        .reduce((sum, receipt) => sum + Number(receipt.paidAmountRial || 0), 0),
    [registeredReceipts],
  );

  if (loading) {
    return (
      <PanelLayout>
        <div className={pageClassName}>
          <div className="contract-details-panel contract-details-skeleton">در حال بارگذاری...</div>
        </div>
      </PanelLayout>
    );
  }

  if (error) {
    return (
      <PanelLayout>
        <div className={pageClassName}>
          <div className="contract-details-panel contract-details-error">{error}</div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout>
      <main className={pageClassName} dir="rtl" lang="fa">
        <ModernContractSummarySection
          buyerName={view.buyerName}
          blockName={view.blockName}
          contractDate={view.contractDate}
          contractNumber={view.contractNumber}
          contractStatusLabel={getContractSummaryStatusLabel((contract?.status as ContractStatus) ?? null, contract?.approvalInstance?.status ?? null)}
          contractTypeLabel={view.contractTypeLabel}
          floorName={view.floorName}
          contractHistory={contractHistory}
          receiptCount={registeredReceipts.length}
          unitLabel={view.unitLabel}
          amountRial={view.amount}
        />
      </main>
    </PanelLayout>
  );
}

