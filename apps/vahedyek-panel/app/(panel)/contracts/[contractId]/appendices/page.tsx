'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileText, Plus } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { AppendixTagPickerDialog } from '../../../../components/contracts/appendices/AppendixTagPickerDialog';
import { AppendixTimelineCard } from '../../../../components/contracts/appendices/AppendixTimelineCard';
import { useAppToast } from '../../../../components/feedback/AppToastProvider';
import { deleteContractAppendix, getContractAppendices, getContractDetails } from '../../../../lib/contractDraftClient';
import { filterSupportedAppendixTags } from '../../../../lib/appendixTagSupport';
import type { AppendixTagKey, ContractAppendix, ContractAppendixReferenceData } from '../../../../types/contract';

function getBuyerName(parties: any) {
  return (
    parties?.partyTwo?.find((person: any) => person?.isPrimary)?.name ??
    parties?.partyTwo?.[0]?.name ??
    parties?.partyOne?.find((person: any) => person?.isPrimary)?.name ??
    parties?.partyOne?.[0]?.name ??
    '—'
  );
}

function formatContractHeader(subject: any) {
  const parts = [subject?.unitName ? `واحد ${subject.unitName}` : '', subject?.unitUsage === 'residential' ? 'مسکونی' : '', subject?.floorName ? `طبقه ${subject.floorName}` : '', subject?.blockName ? `بلوک ${subject.blockName}` : ''];
  return parts.filter(Boolean).join(' • ') || '—';
}

export default function ContractAppendicesPage() {
  const params = useParams<{ contractId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = params?.contractId ? String(params.contractId) : '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [appendices, setAppendices] = useState<ContractAppendix[]>([]);
  const [reference, setReference] = useState<ContractAppendixReferenceData | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<AppendixTagKey[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { showError, showSuccess } = useAppToast();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!contractId) return;
      try {
        setLoading(true);
        setError('');
        const [contractData, appendixData] = await Promise.all([getContractDetails(contractId), getContractAppendices(contractId)]);
        if (!mounted) return;
        setContract(contractData);
        setAppendices(appendixData.items);
        setReference(appendixData.reference);
        setExpandedIds(new Set(appendixData.items[0]?.id ? [appendixData.items[0].id] : []));
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'دریافت اطلاعات الحاقیه‌ها انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [contractId]);

  const listQuery = searchParams?.toString() ?? '';
  const backHref = contractId ? `/contracts/${contractId}${listQuery ? `?${listQuery}` : ''}` : '/contracts';

  const contractView = useMemo(() => {
    const subject = contract?.data?.subject ?? null;
    const parties = contract?.data?.parties ?? null;
    return {
      buyerName: getBuyerName(parties),
      contractNumber: subject?.contractNumber ?? '—',
      contractDate: subject?.contractDate ?? '—',
      subjectMeta: formatContractHeader(subject),
    };
  }, [contract]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTag = (tag: AppendixTagKey) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const goToCreate = () => {
    const supportedTags = filterSupportedAppendixTags(selectedTags);
    if (!contractId || supportedTags.length === 0) return;
    const next = new URLSearchParams();
    next.set('tags', supportedTags.join(','));
    const list = searchParams?.get('list');
    if (list) next.set('list', list);
    router.push(`/contracts/${contractId}/appendices/new?${next.toString()}`);
  };

  const handleDelete = async (appendixId: string) => {
    try {
      await deleteContractAppendix(appendixId);
      setAppendices((current) => current.filter((item) => item.id !== appendixId));
      showSuccess('پیش‌نویس متمم حذف شد.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'حذف متمم انجام نشد.');
    }
  };

  return (
    <PanelLayout>
      <main className="contract-details-page w-full max-w-none min-w-0 space-y-5" dir="rtl" lang="fa">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] hover:bg-slate-50"
          >
            بازگشت به جزئیات قرارداد
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {loading ? (
          <section className="rounded-[28px] border border-white/70 bg-white/95 p-10 text-center text-sm font-bold text-slate-500 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.14)]">
            در حال بارگذاری...
          </section>
        ) : error ? (
          <section className="rounded-[28px] border border-rose-200 bg-rose-50/95 p-8 text-center text-sm font-bold text-rose-800 shadow-sm">
            {error}
          </section>
        ) : (
          <>
            <section className="rounded-[28px] border border-slate-200/80 bg-white/95 px-5 py-5 shadow-sm sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]">
                    <FileText className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1 text-right">
                    <h1 className="text-[20px] font-black text-slate-900">لیست الحاقیه ها</h1>
                    <div className="mt-2 text-[14px] font-extrabold text-slate-800">{contractView.buyerName}</div>
                    <div className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">
                      {contractView.subjectMeta}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2 text-[12px] font-semibold text-slate-500">
                      <span>قرارداد {contractView.contractNumber}</span>
                      <span>•</span>
                      <span>{contractView.contractDate}</span>
                      {reference?.currentUserName ? (
                        <>
                          <span>•</span>
                          <span>ثبت در سامانه توسط {reference.currentUserName}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dark-teal)_92%,black),color-mix(in_srgb,var(--dark-teal)_78%,#0f766e))] px-5 py-3 text-[13px] font-black text-white shadow-sm transition hover:brightness-105"
                >
                  افزودن الحاقیه
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </section>

            <section className="space-y-4">
              {appendices.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/80 px-5 py-14 text-center text-[13px] font-semibold text-slate-500">
                  هنوز الحاقیه‌ای برای این قرارداد ثبت نشده است.
                </div>
              ) : (
                appendices.map((appendix) => (
                  <AppendixTimelineCard
                    key={appendix.id}
                    appendix={appendix}
                    expanded={expandedIds.has(appendix.id)}
                    onToggle={() => toggleExpanded(appendix.id)}
                    onView={() => router.push(`/contracts/${contractId}/appendices/${appendix.id}${listQuery ? `?${listQuery}` : ''}`)}
                    onCompare={() => router.push(`/contracts/${contractId}/appendices/${appendix.id}/compare${listQuery ? `?${listQuery}` : ''}`)}
                    onDelete={() => void handleDelete(appendix.id)}
                  />
                ))
              )}
            </section>
          </>
        )}

        <AppendixTagPickerDialog
          open={pickerOpen}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          onClose={() => setPickerOpen(false)}
          onConfirm={goToCreate}
        />
      </main>
    </PanelLayout>
  );
}
