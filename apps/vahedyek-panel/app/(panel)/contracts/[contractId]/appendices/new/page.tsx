'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Eye, FileText, Save, Send } from 'lucide-react';
import { PersianDatePicker } from '@repo/ui';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PanelLayout from '../../../../../components/PanelLayout';
import { AppendixDeliveryDateEditor } from '../../../../../components/contracts/appendices/AppendixDeliveryDateEditor';
import { AppendixPartiesEditor } from '../../../../../components/contracts/appendices/AppendixPartiesEditor';
import { AppendixPreviousValueDialog } from '../../../../../components/contracts/appendices/AppendixPreviousValueDialog';
import { AppendixSectionTabs } from '../../../../../components/contracts/appendices/AppendixSectionTabs';
import { useAppToast } from '../../../../../components/feedback/AppToastProvider';
import { Button } from '../../../../../components/ui/button';
import { Select } from '../../../../../components/ui/select';
import { CONTRACT_APPENDIX_TAG_MAP } from '../../../../../lib/contractAppendixConfig';
import { validateShares } from '../../../../../lib/contractValidation';
import {
  createContractAppendix,
  getAppendixDetails,
  getContractAppendices,
  getContractDetails,
  updateContractAppendix,
} from '../../../../../lib/contractDraftClient';
import type { AppendixIssuerType, AppendixTagKey, ContractPartiesData, CreateContractAppendixInput } from '../../../../../types/contract';

type PartiesAppendixPayload = {
  shareMode: 'dang' | 'percent';
  parties: ContractPartiesData['partyOne'];
};

type ItemPayloadState = Record<string, Record<string, unknown> | PartiesAppendixPayload>;
type BaselineData = { sourceLabel: string; payload: Record<string, unknown> };
type PreviousDialogState = { title: string; sourceLabel: string; payload: Record<string, unknown> };

function getValidSelectedTags(raw: string | null): AppendixTagKey[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is AppendixTagKey => Boolean(item) && CONTRACT_APPENDIX_TAG_MAP.has(item as AppendixTagKey))
    .filter((tag, index, arr) => arr.indexOf(tag) === index);
}

function buildInitialPayloads(tags: AppendixTagKey[]): ItemPayloadState {
  return Object.fromEntries(
    tags.map((tag) => [
      tag,
      tag === 'unit-delivery-date'
        ? { previousDate: '', nextDate: '', reason: '' }
        : tag === 'first-party' || tag === 'second-party'
          ? { shareMode: 'dang', parties: [] }
          : { detailText: '' },
    ]),
  );
}

function getBuyerName(parties: any) {
  return (
    parties?.partyTwo?.find((person: any) => person?.isPrimary)?.name ??
    parties?.partyTwo?.[0]?.name ??
    parties?.partyOne?.find((person: any) => person?.isPrimary)?.name ??
    parties?.partyOne?.[0]?.name ??
    '—'
  );
}

function getSubjectMeta(subject: any) {
  return [
    subject?.contractDate ?? '',
    subject?.unitName ? `واحد ${subject.unitName}` : '',
    subject?.floorName ? `طبقه ${subject.floorName}` : '',
    subject?.blockName ? `بلوک ${subject.blockName}` : '',
  ]
    .filter(Boolean)
    .join(' • ');
}

function getContractBaseline(tag: AppendixTagKey, contract: any): BaselineData {
  const contractNumber = contract?.data?.subject?.contractNumber ?? '—';
  if (tag === 'unit-delivery-date') {
    return {
      sourceLabel: `اصل قرارداد شماره ${contractNumber}`,
      payload: { deliveryDate: contract?.data?.subject?.deliveryDate ?? '—' },
    };
  }

  const parties = tag === 'first-party' ? contract?.data?.parties?.partyOne ?? [] : contract?.data?.parties?.partyTwo ?? [];
  return {
    sourceLabel: `اصل قرارداد شماره ${contractNumber}`,
    payload: { parties },
  };
}

function getAppendixBaseline(tag: AppendixTagKey, appendix: any): BaselineData | null {
  const item = appendix?.items?.find((entry: any) => entry.tagKey === tag);
  if (!item) return null;

  if (tag === 'unit-delivery-date') {
    return {
      sourceLabel: `متمم شماره ${appendix.appendixNumber?.toLocaleString('fa-IR') ?? '—'}`,
      payload: {
        deliveryDate: String(item.payload?.nextDate ?? item.payload?.deliveryDate ?? item.payload?.previousDate ?? '—'),
      },
    };
  }

  return {
    sourceLabel: `متمم شماره ${appendix.appendixNumber?.toLocaleString('fa-IR') ?? '—'}`,
    payload: { parties: Array.isArray(item.payload?.parties) ? item.payload.parties : [] },
  };
}

function buildPayloadFromAppendixItems(items: Array<{ tagKey: string; payload: Record<string, unknown> }>) {
  return Object.fromEntries(items.map((item) => [item.tagKey, item.payload])) as ItemPayloadState;
}

export default function ContractAppendixNewPage() {
  const params = useParams<{ contractId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = String(params?.contractId ?? '');
  const appendixId = searchParams?.get('appendixId') ?? '';
  const requestedTags = useMemo(() => getValidSelectedTags(searchParams?.get('tags') ?? null), [searchParams]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [previousDialogOpen, setPreviousDialogOpen] = useState(false);
  const [previousDialogData, setPreviousDialogData] = useState<PreviousDialogState | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [reference, setReference] = useState<any>(null);
  const [appendixNumber, setAppendixNumber] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<AppendixTagKey[]>(requestedTags);
  const [activeTag, setActiveTag] = useState<AppendixTagKey | null>(requestedTags[0] ?? null);
  const [payloads, setPayloads] = useState<ItemPayloadState>(() => buildInitialPayloads(requestedTags));
  const [effectiveDate, setEffectiveDate] = useState('');
  const [issuerType, setIssuerType] = useState<AppendixIssuerType>('self');
  const [issuerEmployeeId, setIssuerEmployeeId] = useState('');
  const [issuerFormerEmployeeId, setIssuerFormerEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [baselineByTag, setBaselineByTag] = useState<Partial<Record<AppendixTagKey, BaselineData>>>({});
  const [dialogSignal, setDialogSignal] = useState<{ side: 'first-party' | 'second-party'; nonce: number } | null>(null);
  const { showError } = useAppToast();

  useEffect(() => {
    const load = async () => {
      if (!contractId) return;
      try {
        setLoading(true);
        const [contractData, appendixData] = await Promise.all([getContractDetails(contractId), getContractAppendices(contractId)]);
        setContract(contractData);
        setReference(appendixData.reference);

        const approvedAppendices = appendixData.items.filter((item: any) => item.status === 'completed');
        const nextBaselineMap: Partial<Record<AppendixTagKey, BaselineData>> = {};

        if (appendixId) {
          const detail = await getAppendixDetails(appendixId);
          const detailTags = detail.item.items.map((item) => item.tagKey as AppendixTagKey);
          setSelectedTags(detailTags);
          setActiveTag(detailTags[0] ?? null);
          setAppendixNumber(detail.item.appendixNumber);
          setEffectiveDate(detail.item.effectiveDate);
          setIssuerType(detail.item.issuerType);
          setNotes(detail.item.notes);
          setPayloads(buildPayloadFromAppendixItems(detail.item.items));

          for (const tag of detailTags) {
            const previousApproved = approvedAppendices.find(
              (item: any) => item.id !== detail.item.id && item.items.some((entry: any) => entry.tagKey === tag),
            );
            nextBaselineMap[tag] = previousApproved ? getAppendixBaseline(tag, previousApproved) ?? getContractBaseline(tag, contractData) : getContractBaseline(tag, contractData);
          }
        } else {
          setAppendixNumber(appendixData.nextAppendixNumber);
          setSelectedTags(requestedTags);
          setActiveTag(requestedTags[0] ?? null);
          setPayloads(buildInitialPayloads(requestedTags));

          for (const tag of requestedTags) {
            const previousApproved = approvedAppendices.find((item: any) => item.items.some((entry: any) => entry.tagKey === tag));
            nextBaselineMap[tag] = previousApproved ? getAppendixBaseline(tag, previousApproved) ?? getContractBaseline(tag, contractData) : getContractBaseline(tag, contractData);
          }
        }

        setBaselineByTag(nextBaselineMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'دریافت اطلاعات متمم انجام نشد.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [appendixId, contractId, requestedTags]);

  useEffect(() => {
    const buyerDialog = searchParams?.get('buyerDialog') === '1';
    const partnerDialog = searchParams?.get('partnerDialog') === '1';
    if (!buyerDialog && !partnerDialog) return;

    const side = partnerDialog ? 'first-party' : 'second-party';
    setActiveTag(side);
    setDialogSignal({ side, nonce: Date.now() });

    const next = new URLSearchParams(searchParams?.toString() ?? '');
    next.delete('buyerDialog');
    next.delete('partnerDialog');
    router.replace(`?${next.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const contractView = useMemo(() => {
    const subject = contract?.data?.subject ?? null;
    const parties = (contract?.data?.parties ?? null) as ContractPartiesData | null;

    return {
      buyerName: getBuyerName(parties),
      contractNumber: subject?.contractNumber ?? '—',
      contractDate: subject?.contractDate ?? '—',
      subjectMeta: getSubjectMeta(subject),
      deliveryDate: subject?.deliveryDate ?? '—',
      parties,
    };
  }, [contract]);

  useEffect(() => {
    if (!contractView.parties) return;

    setPayloads((current) => {
      let changed = false;
      const next = { ...current };

      for (const tag of selectedTags) {
        if (tag !== 'first-party' && tag !== 'second-party') continue;

        const existing = current[tag] as PartiesAppendixPayload | undefined;
        const existingParties = Array.isArray(existing?.parties) ? existing.parties : [];

        if (existingParties.length > 0) continue;

        changed = true;
        next[tag] = {
          shareMode: tag === 'first-party' ? contractView.parties.partyOneMode : contractView.parties.partyTwoMode,
          parties: tag === 'first-party' ? contractView.parties.partyOne : contractView.parties.partyTwo,
        };
      }

      return changed ? next : current;
    });
  }, [contractView.parties, selectedTags]);

  useEffect(() => {
    if (!selectedTags.includes('unit-delivery-date')) return;
    const raw = String(contract?.data?.subject?.deliveryDate ?? '').trim();
    if (!raw || raw === '—') return;

    setPayloads((current) => {
      const row = current['unit-delivery-date'] as Record<string, unknown> | undefined;
      const previousDate = String(row?.previousDate ?? '').trim();
      if (previousDate) return current;

      return {
        ...current,
        'unit-delivery-date': {
          ...(row ?? {}),
          previousDate: raw,
          nextDate: String(row?.nextDate ?? ''),
          reason: String(row?.reason ?? ''),
        },
      };
    });
  }, [contract, selectedTags]);

  const backHref = useMemo(() => {
    const next = new URLSearchParams();
    const list = searchParams?.get('list');
    if (list) next.set('list', list);
    return `/contracts/${contractId}/appendices${next.toString() ? `?${next.toString()}` : ''}`;
  }, [contractId, searchParams]);

  const activeDefinition = activeTag ? CONTRACT_APPENDIX_TAG_MAP.get(activeTag) ?? null : null;

  const updatePayloadField = (tag: AppendixTagKey, field: string, value: string) => {
    setPayloads((current) => ({ ...current, [tag]: { ...(current[tag] ?? {}), [field]: value } }));
  };

  const validate = () => {
    if (!effectiveDate.trim()) return 'زمان متمم الزامی است.';
    if (issuerType === 'employee' && !issuerEmployeeId) return 'کارمند منعقدکننده را انتخاب کنید.';
    if (issuerType === 'former-employee' && !issuerFormerEmployeeId) return 'کارمند سابق منعقدکننده را انتخاب کنید.';

    for (const tag of selectedTags) {
      const payload = payloads[tag] ?? {};
      if (tag === 'unit-delivery-date') {
        if (!String((payload as any).previousDate ?? '').trim() || !String((payload as any).nextDate ?? '').trim()) {
          return 'برای تاریخ تحویل واحد، تاریخ قبلی و تاریخ جدید را کامل کنید.';
        }
      }

      if (tag === 'first-party' || tag === 'second-party') {
        const shareMode = ((payload as any).shareMode ?? 'dang') as 'dang' | 'percent';
        const parties = Array.isArray((payload as any).parties) ? (payload as any).parties : [];
        if (!parties.length || !validateShares(parties, shareMode).valid) {
          return 'اطلاعات طرفین متمم کامل یا معتبر نیست.';
        }
      }
    }

    return '';
  };

  const saveAppendix = async (submitMode: 'draft' | 'pending_approval') => {
    const validationMessage = validate();
    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    const payload: CreateContractAppendixInput = {
      appendixNumber: appendixNumber!,
      effectiveDate,
      issuerType,
      issuerEmployeeId: issuerType === 'employee' ? issuerEmployeeId : null,
      issuerFormerEmployeeId: issuerType === 'former-employee' ? issuerFormerEmployeeId : null,
      notes,
      submitMode,
      items: selectedTags.map((tag) => ({ tagKey: tag, payload: payloads[tag] ?? {} })),
    };

    try {
      setSaving(true);
      const result = appendixId ? await updateContractAppendix(appendixId, payload) : await createContractAppendix(contractId, payload);
      router.push(`/contracts/${contractId}/appendices/${result.id}${searchParams?.get('list') ? `?list=${encodeURIComponent(searchParams.get('list') as string)}` : ''}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'ثبت متمم انجام نشد.');
    } finally {
      setSaving(false);
      setSubmitDialogOpen(false);
    }
  };

  const openPreviousDialog = () => {
    if (!activeTag) return;
    const baseline = baselineByTag[activeTag] ?? getContractBaseline(activeTag, contract);
    setPreviousDialogData({
      title: CONTRACT_APPENDIX_TAG_MAP.get(activeTag)?.title ?? activeTag,
      sourceLabel: baseline.sourceLabel,
      payload: baseline.payload,
    });
    setPreviousDialogOpen(true);
  };

  const buildPartyReturnTo = (side: 'first-party' | 'second-party') => {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    next.set('activeTag', side);
    if (appendixId) next.set('appendixId', appendixId);
    next.set(side === 'first-party' ? 'partnerDialog' : 'buyerDialog', '1');
    return `/contracts/${contractId}/appendices/new?${next.toString()}`;
  };

  return (
    <PanelLayout>
      <main className="contract-details-page w-full max-w-none min-w-0 space-y-5" dir="rtl" lang="fa">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
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
            <section className="rounded-[30px] border border-slate-200/80 bg-white/95 px-5 py-5 shadow-sm sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]">
                    <FileText className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1 text-right">
                    <h1 className="text-[22px] font-black text-slate-900">{appendixId ? 'ویرایش متمم' : 'متمم'}</h1>
                    <div className="mt-2 text-[18px] font-extrabold text-slate-800">{contractView.buyerName}</div>
                    <div className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">{contractView.subjectMeta}</div>
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2 text-[12px] font-semibold text-slate-500">
                      <span>شماره قرارداد {contractView.contractNumber}</span>
                      <span>•</span>
                      <span>تاریخ عقد قرارداد {contractView.contractDate}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-right">
                    <div className="text-[11px] font-bold text-slate-500">شماره متمم</div>
                    <div className="mt-1 text-[18px] font-black text-slate-900">{appendixNumber != null ? appendixNumber.toLocaleString('fa-IR') : ''}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-right">
                    <div className="text-[11px] font-bold text-slate-500">تاریخ تحویل فعلی</div>
                    <div className="mt-1 text-[18px] font-black text-slate-900">{contractView.deliveryDate}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-[18px] font-black text-slate-900">اطلاعات پایه متمم</h2>
                  <span className="inline-flex items-center rounded-full border border-orange-300 px-3 py-1 text-[11px] font-black text-orange-600">مرحله ۱</span>
                </div>

                <div className="mt-6 flex flex-col gap-6">
                  <label className="grid gap-2 text-right">
                    <span className="text-[12px] font-black text-slate-700">منعقدکننده متمم</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'self', label: 'خودم' },
                        { value: 'former-employee', label: 'کارمند سابق' },
                        { value: 'employee', label: 'سایر کارکنان' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setIssuerType(item.value as AppendixIssuerType)}
                          className={`rounded-full border px-4 py-2 text-[12px] font-black ${
                            issuerType === item.value ? 'border-cyan-300 bg-cyan-50 text-cyan-900' : 'border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </label>

                  {issuerType === 'employee' ? (
                    <Select
                      options={(reference?.employees ?? []).map((item: any) => ({ value: item.id, label: item.label }))}
                      value={issuerEmployeeId || null}
                      onValueChange={setIssuerEmployeeId}
                      placeholder="کارمند را انتخاب کنید"
                    />
                  ) : null}

                  {issuerType === 'former-employee' ? (
                    <Select
                      options={(reference?.formerEmployees ?? []).map((item: any) => ({ value: item.id, label: item.label }))}
                      value={issuerFormerEmployeeId || null}
                      onValueChange={setIssuerFormerEmployeeId}
                      placeholder="کارمند سابق را انتخاب کنید"
                    />
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input value={appendixNumber != null ? appendixNumber.toLocaleString('fa-IR') : ''} readOnly className="app-control bg-slate-50" />
                    <PersianDatePicker value={effectiveDate} onChange={setEffectiveDate} placeholder="انتخاب تاریخ" containerClassName="w-full" />
                  </div>

                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="app-textarea min-h-[140px]" placeholder="یادداشت تکمیلی درباره این متمم" />
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-[18px] font-black text-slate-900">بخش‌های الحاقیه</h2>
                </div>

                <AppendixSectionTabs tags={selectedTags} activeTag={activeTag} onChange={setActiveTag} />

                {activeDefinition && activeTag ? (
                  <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/50 p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="text-right">
                        <div className="text-[18px] font-black text-slate-900">{activeDefinition.title}</div>
                        {activeTag !== 'unit-delivery-date' ? (
                          <p className="mt-1 text-[12px] font-semibold leading-7 text-slate-500">{activeDefinition.description}</p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={openPreviousDialog}
                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-700"
                      >
                        <Eye className="h-4 w-4" />
                        مشاهده داده قبلی
                      </button>
                    </div>

                    {activeTag === 'unit-delivery-date' ? (
                      <AppendixDeliveryDateEditor
                        nextDate={String((payloads[activeTag] as any)?.nextDate ?? '')}
                        reason={String((payloads[activeTag] as any)?.reason ?? '')}
                        onNextDateChange={(value) => updatePayloadField(activeTag, 'nextDate', value)}
                        onReasonChange={(value) => updatePayloadField(activeTag, 'reason', value)}
                      />
                    ) : activeTag === 'first-party' || activeTag === 'second-party' ? (
                      <div className="mt-6">
                        <AppendixPartiesEditor
                          side={activeTag}
                          value={(payloads[activeTag] as PartiesAppendixPayload) ?? null}
                          initialParties={contractView.parties}
                          returnTo={buildPartyReturnTo(activeTag)}
                          onChange={(value) => setPayloads((current) => ({ ...current, [activeTag]: value }))}
                          openDialogSignal={dialogSignal?.side === activeTag ? dialogSignal.nonce : undefined}
                          onDialogSignalConsumed={() => setDialogSignal(null)}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex justify-start">
                <Button type="button" variant="primary" onClick={() => setSubmitDialogOpen(true)} disabled={saving} className="min-w-[180px] rounded-2xl">
                  {saving ? 'در حال ثبت...' : appendixId ? 'ذخیره متمم' : 'ثبت متمم'}
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </section>
          </>
        )}

        {submitDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSubmitDialogOpen(false)}>
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="text-right text-[18px] font-black text-slate-900">ثبت متمم</div>
              <p className="mt-2 text-right text-[13px] font-semibold leading-7 text-slate-600">
                مشخص کنید این متمم در پیش‌نویس باقی بماند یا مستقیم وارد فرایند تایید شود.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <button type="button" onClick={() => void saveAppendix('draft')} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-[13px] font-extrabold text-slate-800">
                  <Save className="h-4 w-4" />
                  ذخیره در پیش‌نویس
                </button>
                <button type="button" onClick={() => void saveAppendix('pending_approval')} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] text-[13px] font-extrabold text-white">
                  <Send className="h-4 w-4" />
                  ارسال به فرایند تایید
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <AppendixPreviousValueDialog open={previousDialogOpen} tag={activeTag} data={previousDialogData} onClose={() => setPreviousDialogOpen(false)} />

      </main>
    </PanelLayout>
  );
}
