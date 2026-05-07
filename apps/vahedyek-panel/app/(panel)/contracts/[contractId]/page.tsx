'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PanelLayout from '../../../components/PanelLayout';
import { ContractApprovalFlowBanner } from '../../../components/contracts/ContractApprovalFlowBanner';
import { getContractDetails, setActiveDraftId } from '../../../lib/contractDraftClient';
import type { ContractStatus } from '../../../types/contract';

function formatMoneyRial(value: number) {
  if (!value) return '—';
  return `${Math.round(value).toLocaleString('fa-IR')} ریال`;
}

function formatMoneyTomanFromRial(valueRial: number) {
  if (!valueRial) return '—';
  const toman = Math.round(valueRial / 10);
  return `${toman.toLocaleString('fa-IR')} تومان`;
}

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

export default function ContractDetailsPage() {
  const params = useParams<{ contractId: string }>();
  const router = useRouter();
  const contractId = params?.contractId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [toast, setToast] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!contractId) return;
      try {
        setLoading(true);
        const data = await getContractDetails(String(contractId));
        if (mounted) setContract(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'دریافت جزئیات قرارداد انجام نشد.');
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
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handleUnderDevelopment = () => {
    setToast('این بخش در حال توسعه است');
  };

  const actions = useMemo(() => {
    const active = new Set(['view-draft', 'edit-draft']);
    return [
      { id: 'annex', title: 'الحاقیه و اظهارنامه', icon: 'fa-solid fa-file-signature' },
      { id: 'build', title: 'ساخت و چاپ قرارداد', icon: 'fa-regular fa-clock', badge: undefined },
      { id: 'build-print', title: 'نسخه ساخت و چاپ قرارداد', icon: 'fa-solid fa-print', badge: undefined },
      { id: 'reports', title: 'گزارشات', icon: 'fa-solid fa-money-bill-transfer', badge: undefined },
      { id: 'transfer', title: 'انتقال قرارداد', icon: 'fa-solid fa-right-left', badge: undefined },
      { id: 'buyer', title: 'مشخصات خریدار', icon: 'fa-solid fa-user-pen', badge: undefined },
      { id: 'unit', title: 'مشخصات واحد', icon: 'fa-solid fa-city', badge: undefined },
      { id: 'docs', title: 'مدارک قرارداد', icon: 'fa-solid fa-folder-open', badge: undefined },
      { id: 'discount', title: 'تخفیف', icon: 'fa-solid fa-tags', badge: undefined },
      { id: 'cancel', title: 'فسخ قرارداد', icon: 'fa-solid fa-file-circle-xmark', badge: undefined },
      { id: 'court', title: 'اقاله/رای قضایی', icon: 'fa-regular fa-file-lines', badge: undefined },
      { id: 'deed', title: 'تحویل سند', icon: 'fa-solid fa-key', badge: undefined },
      { id: 'builder-penalty', title: 'جرائم کارفرما', icon: 'fa-solid fa-gavel', badge: undefined },
      { id: 'dues', title: 'سررسید و فیش واریزی', icon: 'fa-solid fa-calendar-check', badge: undefined },
      { id: 'edit-final', title: 'ویرایش قرارداد نهایی شده', icon: 'fa-solid fa-pen-to-square', badge: undefined },
      { id: 'edit-draft', title: 'ویرایش پیش نویس', icon: 'fa-regular fa-file', badge: undefined },
      { id: 'appendix', title: 'متمم قرارداد', icon: 'fa-solid fa-file-circle-plus', badge: undefined },
      { id: 'view-draft', title: 'مشاهده پیش نویس', icon: 'fa-solid fa-eye', badge: undefined },
      { id: 'unit-move', title: 'سرک واحد', icon: 'fa-solid fa-truck-ramp-box', badge: undefined },
      { id: 'relocation', title: 'جابجایی (فروش)', icon: 'fa-solid fa-map-location-dot', badge: undefined },
      { id: 'loan', title: 'وام', icon: 'fa-solid fa-building-columns', badge: undefined },
      { id: 'adjust', title: 'تعدیل', icon: 'fa-solid fa-sliders', badge: undefined },
    ].map((item) => ({ ...item, enabled: active.has(item.id) }));
  }, []);

  const view = useMemo(() => {
    const subject = contract?.data?.subject ?? null;
    const parties = contract?.data?.parties ?? null;
    const financial = contract?.data?.financial ?? null;

    const partyTwoMembers = Array.isArray(parties?.partyTwo) ? parties.partyTwo.filter((p: any) => p?.name) : [];
    const buyer =
      parties?.partyTwo?.find((p: any) => p.isPrimary) ??
      parties?.partyTwo?.[0] ??
      parties?.partyOne?.find((p: any) => p.isPrimary) ??
      parties?.partyOne?.[0] ??
      null;

    const parkingArea = Number(financial?.parkingArea || 0);
    const unitArea = Number(financial?.unitArea || Math.max(Number(financial?.totalArea || 0) - parkingArea, 0));
    const amount =
      financial?.pricingType === 'metered'
        ? unitArea * Number(financial?.pricePerMeter || 0) + parkingArea * Number(financial?.parkingPricePerMeter || 0)
        : Number(financial?.fixedTotalAmount || 0);

    const unitName = subject?.unitName ?? '—';
    const unitUsageLabel = getUnitUsageLabel(subject?.unitUsage ?? null);

    return {
      subject,
      buyerName: buyer?.name ?? '—',
      buyerNationalCode: '—',
      buyers: partyTwoMembers,
      blockName: subject?.blockName ?? '—',
      floorName: subject?.floorName ?? '—',
      unitLabel: unitUsageLabel && unitUsageLabel !== '—' ? `${unitName} (${unitUsageLabel})` : unitName,
      contractNumber: subject?.contractNumber ?? '—',
      contractDate: subject?.contractDate ?? '—',
      createdAt: contract?.updatedAt ?? '—',
      amount,
      contractTypeLabel: subject?.contractType === 'pre-sale' ? 'پیش فروش' : subject?.contractType === 'sale' ? 'فروش' : '—',
    };
  }, [contract]);

  if (loading) {
    return (
      <PanelLayout>
        <div className="contract-details-page">
          <div className="contract-details-panel contract-details-skeleton">در حال بارگذاری...</div>
        </div>
      </PanelLayout>
    );
  }

  if (error) {
    return (
      <PanelLayout>
        <div className="contract-details-page">
          <div className="contract-details-panel contract-details-error">{error}</div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout>
    <main className="contract-details-page" dir="rtl" lang="fa">
      {contractId ? (
        <Suspense fallback={null}>
          <ContractApprovalFlowBanner
            contractId={String(contractId)}
            canDecide={Boolean(contract?.approvalDecision?.canDecide)}
            contractStatus={(contract?.status as ContractStatus) ?? 'draft'}
          />
        </Suspense>
      ) : null}

      {contract?.approvalReturn?.reason ? (
        <div dir="rtl" className="mb-6 rounded-2xl border border-amber-200/90 bg-[color-mix(in_srgb,var(--theme-warning-bg)_55%,white)] px-4 py-3 text-right shadow-sm">
          <div className="text-[13px] font-black text-[var(--theme-warning-text)]">اصلاح پیش‌نویس پس از عدم تأیید</div>
          <p className="mt-2 text-[12px] font-semibold leading-6 text-[var(--text-body)]">
            <span className="font-bold text-[var(--text-strong)]">آخرین علت ثبت‌شده در سامانه:</span>{' '}
            {String(contract.approvalReturn.reason)}
          </p>
        </div>
      ) : null}

      <section className="contract-details-panel contract-details-profile">
        <div className="min-w-0 flex-1">
          {view.buyers.length ? (
            <div className="flex flex-col items-end" dir="rtl">
              <div className="mb-2 w-full pr-3 text-right text-[12px] font-semibold text-slate-500">طرفین دوم (خریداران)</div>
              <div
                dir="rtl"
                className="flex w-full flex-row justify-start gap-4 overflow-x-auto pb-1 pr-3 scroll-smooth scrollbar-hide snap-x snap-mandatory"
                role="list"
                aria-label="طرفین دوم (خریداران)"
              >
                {view.buyers.map((buyerItem: any) => (
                  <article
                    key={buyerItem.personId ?? buyerItem.name}
                    dir="rtl"
                    className="min-w-[260px] flex-none snap-start rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-3 text-right shadow-sm"
                    role="listitem"
                  >
                    <div className="flex flex-row items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#ff9d72] text-white">
                        <i className="fa-regular fa-user" />
                      </span>
                      <div className="min-w-0 text-right">
                        <div className="truncate text-[18px] font-extrabold text-[#454a52]">{buyerItem.name ?? '—'}</div>
                        <div className="mt-1 flex flex-row items-center justify-between gap-3 text-[13px] text-[color:var(--text-muted)]">
                          <span className="truncate">کد ملی {view.buyerNationalCode}</span>
                          <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <i className="fa-solid fa-phone" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="contract-details-buyer">
              <span className="contract-details-buyer-avatar">
                <i className="fa-regular fa-user" />
              </span>
              <div className="contract-details-buyer-info">
                <div className="contract-details-buyer-name">{view.buyerName}</div>
                <div className="contract-details-buyer-meta">کد ملی {view.buyerNationalCode}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="contract-details-panel contract-details-summary">
        <div dir="rtl" className="rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm">
          <div className="flex w-full flex-row items-stretch justify-start divide-x divide-slate-200/70 divide-x-reverse">
            {(
              [
                { label: 'واحد', value: view.unitLabel || '—' },
                { label: 'طبقه', value: view.floorName || '—' },
                { label: 'بلوک', value: view.blockName || '—' },
                { label: 'شماره قرارداد', value: view.contractNumber || '—' },
                { label: 'تاریخ قرارداد', value: view.contractDate || '—' },
                { label: 'مبلغ قرارداد', value: formatMoneyTomanFromRial(view.amount) },
              ] as const
            ).map((item, idx) => (
              <div
                key={item.label}
                className={`flex min-w-0 flex-1 flex-col items-end px-3 text-right${idx === 0 ? ' border-r border-slate-200/70' : ''}`}
              >
                <div className="text-[12px] font-semibold text-slate-500">{item.label}</div>
                <div className="mt-1 text-[14px] font-extrabold text-slate-800">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4">
        <div dir="rtl" className="max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...actions].sort((a, b) => Number(b.enabled) - Number(a.enabled)).map((item) => {
              const dim = !item.enabled;
              const onClick = () => {
                if (!contractId) return;
                if (!item.enabled) return handleUnderDevelopment();
                if (item.id === 'view-draft') {
                  router.push(`/contracts/${String(contractId)}/preview`);
                  return;
                }
                setActiveDraftId(String(contractId));
                router.push('/contracts/new');
              };

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={onClick}
                  className={`contract-details-action-card text-right${dim ? ' is-dim' : ''}`}
                >
                  <div className="contract-details-action-head">
                    <span className="contract-details-action-illustration">
                      <i className={item.icon} />
                    </span>
                    <span className="contract-details-action-arrow">
                      <i className="fa-solid fa-angle-left" />
                    </span>
                  </div>
                  <h3 className="contract-details-action-title">{item.title}</h3>
                  <p className="contract-details-action-text">{item.enabled ? 'فعال' : 'در حال توسعه'}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {toast ? (
        <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4" dir="rtl">
          <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm font-bold text-slate-700 shadow-lg">
            {toast}
          </div>
        </div>
      ) : null}
    </main>
    </PanelLayout>
  );
}

