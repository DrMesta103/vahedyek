'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, FileText, Filter, Plus, X } from 'lucide-react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { AppendixTagPickerDialog } from '../../../../components/contracts/appendices/AppendixTagPickerDialog';
import { AppendixTimelineCard } from '../../../../components/contracts/appendices/AppendixTimelineCard';
import { useAppToast } from '../../../../components/feedback/AppToastProvider';
import { CONTRACT_APPENDIX_TAG_MAP } from '../../../../lib/contractAppendixConfig';
import { deleteContractAppendix, getContractAppendices, getContractDetails } from '../../../../lib/contractDraftClient';
import type { AppendixTagKey, ContractAppendix, ContractAppendixReferenceData } from '../../../../types/contract';
import { filterSupportedAppendixTags } from '../../../../lib/appendixTagSupport';

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
  const parts = [
    subject?.unitName ? `واحد ${subject.unitName}` : '',
    subject?.unitUsage === 'residential' ? 'مسکونی' : '',
    subject?.floorName ? `طبقه ${subject.floorName}` : '',
    subject?.blockName ? `بلوک ${subject.blockName}` : '',
  ];
  return parts.filter(Boolean).join(' • ') || '—';
}

function getValidFilterTags(raw: string | null): AppendixTagKey[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is AppendixTagKey => CONTRACT_APPENDIX_TAG_MAP.has(item as AppendixTagKey))
    .filter((tag, index, arr) => arr.indexOf(tag) === index);
}

export default function ContractAppendicesPage() {
  const params = useParams<{ contractId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const contractId = params?.contractId ? String(params.contractId) : '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [appendices, setAppendices] = useState<ContractAppendix[]>([]);
  const [reference, setReference] = useState<ContractAppendixReferenceData | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedCreateTags, setSelectedCreateTags] = useState<AppendixTagKey[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const { showError, showSuccess } = useAppToast();

  const selectedFilterTags = useMemo(() => getValidFilterTags(searchParams?.get('types') ?? null), [searchParams]);

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

  useEffect(() => {
    if (!filterOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFilterOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [filterOpen]);

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

  const availableFilterTags = useMemo(() => {
    return Array.from(CONTRACT_APPENDIX_TAG_MAP.entries()).map(([key, def]) => ({ key, title: def.title }));
  }, []);

  const directCreateTags = useMemo(() => filterSupportedAppendixTags(selectedFilterTags), [selectedFilterTags]);

  const filteredAppendices = useMemo(() => {
    if (!selectedFilterTags.length) return appendices;
    return appendices.filter((appendix) => appendix.items.some((item) => selectedFilterTags.includes(item.tagKey)));
  }, [appendices, selectedFilterTags]);

  const toggleCreateTag = (tag: AppendixTagKey) => {
    setSelectedCreateTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const goToCreate = () => {
    const supportedTags = filterSupportedAppendixTags(selectedCreateTags);
    if (!contractId || supportedTags.length === 0) return;
    const next = new URLSearchParams();
    next.set('tags', supportedTags.join(','));
    const list = searchParams?.get('list');
    const types = searchParams?.get('types');
    if (list) next.set('list', list);
    if (types) next.set('types', types);
    router.push(`/contracts/${contractId}/appendices/new?${next.toString()}`);
  };

  const goToDirectCreate = (tag: AppendixTagKey) => {
    const next = new URLSearchParams();
    next.set('tags', tag);
    const list = searchParams?.get('list');
    const types = searchParams?.get('types');
    if (list) next.set('list', list);
    if (types) next.set('types', types);
    router.push(`/contracts/${contractId}/appendices/new/${tag}?${next.toString()}`);
  };

  const updateFilterTags = (nextTags: AppendixTagKey[]) => {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    if (nextTags.length) next.set('types', nextTags.join(','));
    else next.delete('types');
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const toggleFilterTag = (tag: AppendixTagKey) => {
    const nextTags = selectedFilterTags.includes(tag)
      ? selectedFilterTags.filter((item) => item !== tag)
      : [...selectedFilterTags, tag];
    updateFilterTags(nextTags);
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
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] hover:bg-slate-50"
          >
            بازگشت به جزئیات قرارداد
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {loading ? (
          <section className="rounded-[8px] border border-white/70 bg-white/95 p-10 text-center text-sm font-bold text-slate-500 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.14)]">
            در حال بارگذاری...
          </section>
        ) : error ? (
          <section className="rounded-[8px] border border-rose-200 bg-rose-50/95 p-8 text-center text-sm font-bold text-rose-800 shadow-sm">
            {error}
          </section>
        ) : (
          <>
            <section className="rounded-[8px] border border-slate-200/80 bg-white/95 px-5 py-5 shadow-sm sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]">
                    <FileText className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1 text-right">
                    <h1 className="text-[20px] font-black text-slate-900">لیست متمم‌ها</h1>
                    <div className="mt-2 text-[14px] font-extrabold text-slate-800">{contractView.buyerName}</div>
                    <div className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">{contractView.subjectMeta}</div>
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
                    {selectedFilterTags.length === 1 && selectedFilterTags[0] === 'material-specs-change' ? (
                      <div className="mt-3 rounded-[8px] border border-cyan-200 bg-cyan-50/80 px-4 py-3 text-[12px] font-semibold leading-7 text-cyan-900">
                        در این بخش پرونده‌های اجرایی تغییرات مشخصات فنی پروژه ثبت می‌شود؛ از همین مسیر می‌توانید مستندات لازم، نتیجه رسیدگی و فعال‌سازی اقدام قراردادی را روی قرارداد نگه دارید.
                      </div>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (directCreateTags.length === 1) {
                      goToDirectCreate(directCreateTags[0]);
                      return;
                    }
                    setPickerOpen(true);
                  }}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[8px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dark-teal)_92%,black),color-mix(in_srgb,var(--dark-teal)_78%,#0f766e))] px-5 py-3 text-[13px] font-black text-white shadow-sm transition hover:brightness-105"
                >
                  {selectedFilterTags.length === 1 && selectedFilterTags[0] === 'material-specs-change' ? 'ثبت پرونده مشخصات فنی' : 'افزودن متمم'}
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedFilterTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFilterTag(tag)}
                      className="inline-flex h-9 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--dark-teal)_28%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_08%,white)] px-3 text-[12px] font-black text-[color-mix(in_srgb,var(--dark-teal)_92%,black)]"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>{CONTRACT_APPENDIX_TAG_MAP.get(tag)?.title ?? tag}</span>
                    </button>
                  ))}
                </div>

                <div ref={filterRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setFilterOpen((current) => !current)}
                    className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <ChevronDown className={`h-4 w-4 transition ${filterOpen ? 'rotate-180' : ''}`} />
                    <span>{selectedFilterTags.length ? `نوع متمم (${selectedFilterTags.length.toLocaleString('fa-IR')})` : 'فیلتر نوع متمم'}</span>
                    <Filter className="h-4 w-4" />
                  </button>

                  {filterOpen ? (
                    <div className="absolute left-0 top-[calc(100%+10px)] z-20 w-[290px] rounded-[8px] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_-26px_rgba(15,23,42,0.28)]">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <button
                          type="button"
                          onClick={() => updateFilterTags([])}
                          className="text-[11px] font-black text-slate-400 transition hover:text-slate-700"
                        >
                          پاک کردن
                        </button>
                        <div className="text-right">
                          <div className="text-[13px] font-black text-slate-900">نوع متمم</div>
                          <div className="text-[11px] font-semibold text-slate-500">چند گزینه را هم‌زمان انتخاب کنید.</div>
                        </div>
                      </div>

                      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                        {availableFilterTags.length === 0 ? (
                          <div className="rounded-[8px] bg-slate-50 px-4 py-6 text-center text-[12px] font-semibold text-slate-500">
                            نوعی برای فیلتر موجود نیست.
                          </div>
                        ) : (
                          availableFilterTags.map((option) => {
                            const active = selectedFilterTags.includes(option.key);
                            return (
                              <button
                                key={option.key}
                                type="button"
                                onClick={() => toggleFilterTag(option.key)}
                                className={`flex min-h-[46px] w-full items-center justify-between rounded-[8px] border px-3 text-right text-[12px] font-bold transition ${
                                  active
                                    ? 'border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_08%,white)] text-slate-900'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${active ? 'bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] text-white' : 'bg-slate-100 text-transparent'}`}>
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                                <span>{option.title}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {filteredAppendices.length === 0 ? (
                <div className="rounded-[8px] border border-dashed border-slate-200 bg-white/80 px-5 py-14 text-center text-[13px] font-semibold text-slate-500">
                  {appendices.length === 0 ? 'هنوز متممی برای این قرارداد ثبت نشده است.' : 'متممی با فیلتر انتخاب‌شده یافت نشد.'}
                </div>
              ) : (
                filteredAppendices.map((appendix) => (
                  <AppendixTimelineCard
                    key={appendix.id}
                    appendix={appendix}
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
          selectedTags={selectedCreateTags}
          onToggleTag={toggleCreateTag}
          onClose={() => setPickerOpen(false)}
          onConfirm={goToCreate}
        />
      </main>
    </PanelLayout>
  );
}


