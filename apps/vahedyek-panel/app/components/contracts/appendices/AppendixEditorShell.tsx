'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileText, Save, Send } from 'lucide-react';
import { PersianDatePicker } from '@repo/ui';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select } from '../../ui/select';
import { Button } from '../../ui/button';
import { useAppToast } from '../../feedback/AppToastProvider';
import { CONTRACT_APPENDIX_TAG_MAP } from '../../../lib/contractAppendixConfig';
import { createInitialAppendixPayload, getAppendixBaselinePayload, getContractBaselinePayload, normalizeAppendixPayload, validateAppendixPayload, type SupportedAppendixPayload } from '../../../lib/appendixPayloads';
import { filterSupportedAppendixTags, isSupportedAppendixTag } from '../../../lib/appendixTagSupport';
import { createContractAppendix, getAppendixDetails, getContractAppendices, getContractDetails, updateContractAppendix } from '../../../lib/contractDraftClient';
import type { AppendixIssuerType, Contract, ContractAppendixReferenceData, CreateContractAppendixInput, SupportedAppendixTagKey } from '../../../types/contract';
import { AppendixPreviousValueDialog } from './AppendixPreviousValueDialog';
import { AppendixEditorContextProvider, type AppendixBaselineData } from './AppendixEditorContext';

function getBuyerName(contract: Contract | null) {
  const parties = contract?.data?.parties;
  return (
    parties?.partyTwo?.find((person) => person?.isPrimary)?.name ??
    parties?.partyTwo?.[0]?.name ??
    parties?.partyOne?.find((person) => person?.isPrimary)?.name ??
    parties?.partyOne?.[0]?.name ??
    '—'
  );
}

function getSubjectMeta(contract: Contract | null) {
  const subject = contract?.data?.subject;
  return [
    subject?.contractDate ?? '',
    subject?.unitName ? `واحد ${subject.unitName}` : '',
    subject?.floorName ? `طبقه ${subject.floorName}` : '',
    subject?.blockName ? `بلوک ${subject.blockName}` : '',
  ]
    .filter(Boolean)
    .join(' • ');
}

function getValidSelectedTags(raw: string | null) {
  if (!raw) return [];
  return filterSupportedAppendixTags(
    raw
      .split(',')
      .map((item) => item.trim())
      .filter((item): item is SupportedAppendixTagKey => isSupportedAppendixTag(item))
      .filter((tag, index, arr) => arr.indexOf(tag) === index),
  );
}

export function AppendixEditorShell({ children }: { children: React.ReactNode }) {
  const params = useParams<{ contractId: string }>();
  const contractId = String(params?.contractId ?? '');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appendixId = searchParams?.get('appendixId') ?? '';
  const requestedTagsQuery = searchParams?.get('tags') ?? '';
  const requestedTags = useMemo(() => getValidSelectedTags(requestedTagsQuery || null), [requestedTagsQuery]);
  const list = searchParams?.get('list') ?? '';
  const { showError } = useAppToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [previousDialogOpen, setPreviousDialogOpen] = useState(false);
  const [previousDialogData, setPreviousDialogData] = useState<{ title: string; sourceLabel: string; payload: Record<string, unknown> } | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [reference, setReference] = useState<ContractAppendixReferenceData | null>(null);
  const [appendixNumber, setAppendixNumber] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<SupportedAppendixTagKey[]>(requestedTags);
  const [payloads, setPayloads] = useState<Partial<Record<SupportedAppendixTagKey, SupportedAppendixPayload>>>({});
  const [effectiveDate, setEffectiveDate] = useState('');
  const [issuerType, setIssuerType] = useState<AppendixIssuerType>('self');
  const [issuerEmployeeId, setIssuerEmployeeId] = useState('');
  const [issuerFormerEmployeeId, setIssuerFormerEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [baselineByTag, setBaselineByTag] = useState<Partial<Record<SupportedAppendixTagKey, AppendixBaselineData>>>({});
  const [dialogSignal, setDialogSignal] = useState<{ side: 'first-party' | 'second-party'; nonce: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!contractId) return;
      try {
        setLoading(true);
        setError('');

        const [contractData, appendixData] = await Promise.all([getContractDetails(contractId), getContractAppendices(contractId)]);
        const approvedAppendices = appendixData.items.filter((item) => item.status === 'completed');
        const nextBaselineByTag: Partial<Record<SupportedAppendixTagKey, AppendixBaselineData>> = {};
        let nextSelectedTags = requestedTags;
        let nextPayloads: Partial<Record<SupportedAppendixTagKey, SupportedAppendixPayload>> = {};
        let nextAppendixNumber = appendixData.nextAppendixNumber;
        let nextEffectiveDate = '';
        let nextIssuerType: AppendixIssuerType = 'self';
        let nextIssuerEmployeeId = '';
        let nextIssuerFormerEmployeeId = '';
        let nextNotes = '';

        if (appendixId) {
          const detail = await getAppendixDetails(appendixId);
          nextSelectedTags = filterSupportedAppendixTags(detail.item.items.map((item) => item.tagKey));
          nextPayloads = Object.fromEntries(
            nextSelectedTags.map((tag) => {
              const item = detail.item.items.find((entry) => entry.tagKey === tag);
              return [tag, normalizeAppendixPayload(tag, item?.payload ?? createInitialAppendixPayload(tag))];
            }),
          ) as Partial<Record<SupportedAppendixTagKey, SupportedAppendixPayload>>;
          nextAppendixNumber = detail.item.appendixNumber;
          nextEffectiveDate = detail.item.effectiveDate;
          nextIssuerType = detail.item.issuerType;
          nextNotes = detail.item.notes;
          if (detail.item.issuerType === 'employee') {
            nextIssuerEmployeeId = appendixData.reference.employees.find((item) => item.label === detail.item.issuerName)?.id ?? '';
          }
          if (detail.item.issuerType === 'former-employee') {
            nextIssuerFormerEmployeeId = appendixData.reference.formerEmployees.find((item) => item.label === detail.item.issuerName)?.id ?? '';
          }

          for (const tag of nextSelectedTags) {
            const previousApproved = approvedAppendices.find(
              (item) => item.id !== detail.item.id && item.items.some((entry) => entry.tagKey === tag),
            );
            nextBaselineByTag[tag] = {
              sourceLabel:
                previousApproved?.sourceKind === 'appendix'
                  ? `متمم شماره ${previousApproved.appendixNumber?.toLocaleString('fa-IR') ?? '—'}`
                  : `اصل قرارداد شماره ${contractData.data.subject?.contractNumber ?? '—'}`,
              payload: previousApproved ? getAppendixBaselinePayload(tag, previousApproved) ?? getContractBaselinePayload(tag, contractData) : getContractBaselinePayload(tag, contractData),
            };
          }
        } else {
          nextPayloads = Object.fromEntries(
            nextSelectedTags.map((tag) => {
              const baselinePayload = getContractBaselinePayload(tag, contractData);
              const initialPayload = createInitialAppendixPayload(tag);
              if (tag === 'unit-delivery-date') return [tag, baselinePayload];
              if (tag === 'first-party' || tag === 'second-party') return [tag, baselinePayload];
              if (tag === 'contract-base-costs' || tag === 'side-costs') return [tag, baselinePayload];
              return [tag, initialPayload];
            }),
          ) as Partial<Record<SupportedAppendixTagKey, SupportedAppendixPayload>>;

          for (const tag of nextSelectedTags) {
            const previousApproved = approvedAppendices.find((item) => item.items.some((entry) => entry.tagKey === tag));
            nextBaselineByTag[tag] = {
              sourceLabel:
                previousApproved?.sourceKind === 'appendix'
                  ? `متمم شماره ${previousApproved.appendixNumber?.toLocaleString('fa-IR') ?? '—'}`
                  : `اصل قرارداد شماره ${contractData.data.subject?.contractNumber ?? '—'}`,
              payload: previousApproved ? getAppendixBaselinePayload(tag, previousApproved) ?? getContractBaselinePayload(tag, contractData) : getContractBaselinePayload(tag, contractData),
            };
          }
        }

        setContract(contractData);
        setReference(appendixData.reference);
        setSelectedTags(nextSelectedTags);
        setPayloads(nextPayloads);
        setAppendixNumber(nextAppendixNumber);
        setEffectiveDate(nextEffectiveDate);
        setIssuerType(nextIssuerType);
        setIssuerEmployeeId(nextIssuerEmployeeId);
        setIssuerFormerEmployeeId(nextIssuerFormerEmployeeId);
        setNotes(nextNotes);
        setBaselineByTag(nextBaselineByTag);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'دریافت اطلاعات متمم انجام نشد.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [appendixId, contractId, requestedTagsQuery, requestedTags]);

  useEffect(() => {
    const buyerDialog = searchParams?.get('buyerDialog') === '1';
    const partnerDialog = searchParams?.get('partnerDialog') === '1';
    if (!buyerDialog && !partnerDialog) return;

    const side = partnerDialog ? 'first-party' : 'second-party';
    setDialogSignal({ side, nonce: Date.now() });

    const next = new URLSearchParams(searchParams?.toString() ?? '');
    next.delete('buyerDialog');
    next.delete('partnerDialog');
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const contractView = useMemo(
    () => ({
      buyerName: getBuyerName(contract),
      contractNumber: contract?.data.subject?.contractNumber ?? '—',
      contractDate: contract?.data.subject?.contractDate ?? '—',
      subjectMeta: getSubjectMeta(contract),
      deliveryDate: contract?.data.subject?.deliveryDate ?? '—',
    }),
    [contract],
  );

  const backHref = useMemo(() => `/contracts/${contractId}/appendices${list ? `?list=${encodeURIComponent(list)}` : ''}`, [contractId, list]);

  const buildTagHref = (tag: SupportedAppendixTagKey) => {
    const next = new URLSearchParams();
    if (appendixId) next.set('appendixId', appendixId);
    if (!appendixId && selectedTags.length) next.set('tags', selectedTags.join(','));
    if (list) next.set('list', list);
    const query = next.toString();
    return `/contracts/${contractId}/appendices/new/${tag}${query ? `?${query}` : ''}`;
  };

  const buildPartyReturnTo = (side: 'first-party' | 'second-party') => {
    const next = new URLSearchParams();
    if (appendixId) next.set('appendixId', appendixId);
    if (!appendixId && selectedTags.length) next.set('tags', selectedTags.join(','));
    if (list) next.set('list', list);
    next.set(side === 'first-party' ? 'partnerDialog' : 'buyerDialog', '1');
    return `/contracts/${contractId}/appendices/new/${side}?${next.toString()}`;
  };

  const updateTagPayload = useCallback((tag: SupportedAppendixTagKey, payload: SupportedAppendixPayload) => {
    setPayloads((current) => ({ ...current, [tag]: payload }));
  }, []);

  const openPreviousDialog = (tag: SupportedAppendixTagKey) => {
    const baseline = baselineByTag[tag];
    if (!baseline) return;
    setPreviousDialogData({
      title: CONTRACT_APPENDIX_TAG_MAP.get(tag)?.title ?? tag,
      sourceLabel: baseline.sourceLabel,
      payload: baseline.payload as unknown as Record<string, unknown>,
    });
    setPreviousDialogOpen(true);
  };

  const saveAppendix = async (submitMode: 'draft' | 'pending_approval') => {
    if (!appendixNumber) return;
    if (!effectiveDate.trim()) {
      showError('زمان متمم الزامی است.');
      return;
    }
    if (issuerType === 'employee' && !issuerEmployeeId) {
      showError('کارمند منعقدکننده را انتخاب کنید.');
      return;
    }
    if (issuerType === 'former-employee' && !issuerFormerEmployeeId) {
      showError('کارمند سابق منعقدکننده را انتخاب کنید.');
      return;
    }

    for (const tag of selectedTags) {
      const payload = payloads[tag];
      if (!payload) {
        showError('داده یکی از بخش‌های الحاقیه کامل نیست.');
        return;
      }
      const validationMessage = validateAppendixPayload(tag, payload);
      if (validationMessage) {
        showError(validationMessage);
        return;
      }
    }

    const requestPayload: CreateContractAppendixInput = {
      appendixNumber,
      effectiveDate,
      issuerType,
      issuerEmployeeId: issuerType === 'employee' ? issuerEmployeeId : null,
      issuerFormerEmployeeId: issuerType === 'former-employee' ? issuerFormerEmployeeId : null,
      notes,
      submitMode,
      items: selectedTags.map((tag) => ({
        tagKey: tag,
        payload: (payloads[tag] ?? createInitialAppendixPayload(tag)) as unknown as Record<string, unknown>,
      })),
    };

    try {
      setSaving(true);
      const result = appendixId
        ? await updateContractAppendix(appendixId, requestPayload)
        : await createContractAppendix(contractId, requestPayload);
      router.push(`/contracts/${contractId}/appendices/${result.id}${list ? `?list=${encodeURIComponent(list)}` : ''}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'ثبت متمم انجام نشد.');
    } finally {
      setSaving(false);
      setSubmitDialogOpen(false);
    }
  };

  return (
    <AppendixEditorContextProvider
      value={{
        contractId,
        appendixId,
        loading,
        error,
        contract,
        reference,
        appendixNumber,
        selectedTags,
        payloads,
        baselineByTag,
        effectiveDate,
        issuerType,
        issuerEmployeeId,
        issuerFormerEmployeeId,
        notes,
        dialogSignal,
        setDialogSignal,
        setEffectiveDate,
        setIssuerType,
        setIssuerEmployeeId,
        setIssuerFormerEmployeeId,
        setNotes,
        updateTagPayload,
        buildTagHref,
        buildPartyReturnTo,
        openPreviousDialog,
        saveAppendix,
      }}
    >
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
                      options={(reference?.employees ?? []).map((item) => ({ value: item.id, label: item.label }))}
                      value={issuerEmployeeId || null}
                      onValueChange={setIssuerEmployeeId}
                      placeholder="کارمند را انتخاب کنید"
                    />
                  ) : null}

                  {issuerType === 'former-employee' ? (
                    <Select
                      options={(reference?.formerEmployees ?? []).map((item) => ({ value: item.id, label: item.label }))}
                      value={issuerFormerEmployeeId || null}
                      onValueChange={setIssuerFormerEmployeeId}
                      placeholder="کارمند سابق را انتخاب کنید"
                    />
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input value={appendixNumber != null ? appendixNumber.toLocaleString('fa-IR') : ''} readOnly className="app-control bg-slate-50" />
                    <PersianDatePicker value={effectiveDate} onChange={setEffectiveDate} placeholder="انتخاب تاریخ" containerClassName="w-full" />
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-[18px] font-black text-slate-900">بخش‌های الحاقیه</h2>
                  <div className="text-[11px] font-semibold text-slate-500">{selectedTags.length.toLocaleString('fa-IR')} بخش انتخاب شده</div>
                </div>

                {selectedTags.length > 1 ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {selectedTags.map((tag) => {
                      const active = pathname?.endsWith(`/${tag}`);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => router.push(buildTagHref(tag), { scroll: false })}
                          className={`rounded-2xl border px-4 py-3 text-[13px] font-black transition ${
                            active
                              ? 'border-cyan-300 bg-cyan-50 text-cyan-900 shadow-[0_0_0_1px_rgba(34,211,238,0.14)]'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {CONTRACT_APPENDIX_TAG_MAP.get(tag)?.title ?? tag}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <div className="mt-6">{children}</div>
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
                مشخص کنید این متمم در پیش‌نویس باقی بماند یا مستقیم وارد فرآیند تأیید شود.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <button type="button" onClick={() => void saveAppendix('draft')} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-[13px] font-extrabold text-slate-800">
                  <Save className="h-4 w-4" />
                  ذخیره در پیش‌نویس
                </button>
                <button type="button" onClick={() => void saveAppendix('pending_approval')} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] text-[13px] font-extrabold text-white">
                  <Send className="h-4 w-4" />
                  ارسال به فرآیند تأیید
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <AppendixPreviousValueDialog
          open={previousDialogOpen}
          tag={(pathname?.split('/').pop() as SupportedAppendixTagKey | null) ?? null}
          data={previousDialogData}
          onClose={() => setPreviousDialogOpen(false)}
        />
      </main>
    </AppendixEditorContextProvider>
  );
}
