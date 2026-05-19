'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { reopenApprovedContractForEditAction } from '../../../actions/contractApprovalActions';
import PanelLayout from '../../../components/PanelLayout';
import { ContractApprovalFlowBanner } from '../../../components/contracts/ContractApprovalFlowBanner';
import { useAppToast } from '../../../components/feedback/AppToastProvider';
import { getContractDetails, setActiveDraftId } from '../../../lib/contractDraftClient';
import { computeContractTotalRialFromFinancial } from '../../../lib/contractFinancialPricing';
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

function contractListCategoryLabel(status: ContractStatus): string {
  switch (status) {
    case 'draft':
      return 'پیش نویس';
    case 'pending_approval':
      return 'در انتظار تایید';
    case 'completed':
      return 'تکمیل شده';
    default:
      return '—';
  }
}

function contractListBadgeClass(status: ContractStatus): string {
  switch (status) {
    case 'draft':
      return 'is-draft';
    case 'pending_approval':
      return 'is-pending';
    case 'completed':
      return 'is-finalized';
    default:
      return 'is-draft';
  }
}

function ContractListContextSection({ status }: { status: ContractStatus }) {
  const searchParams = useSearchParams();
  const raw = searchParams.get('list');
  const entryList: ContractStatus | null =
    raw === 'draft' || raw === 'appendix_draft' || raw === 'pending_approval' || raw === 'completed' ? raw : null;

  const badgeClass = contractListBadgeClass(status);
  const label = contractListCategoryLabel(status);

  let hint: string;
  if (entryList && entryList === status) {
    hint = `از فهرست قراردادهای «${contractListCategoryLabel(entryList)}» به این صفحه آمده‌اید.`;
  } else if (entryList && entryList !== status) {
    hint = `از فهرست «${contractListCategoryLabel(entryList)}» وارد شده‌اید؛ با توجه به آخرین وضعیت، این قرارداد اکنون در بخش «${label}» طبقه‌بندی می‌شود.`;
  } else {
    hint = `طبق آخرین وضعیت، این قرارداد در فهرست قراردادها کنار دیگر موارد همین بخش «${label}» دیده می‌شود (تب‌های پیش نویس، در انتظار تایید، تکمیل شده).`;
  }

  return (
    <section
      dir="rtl"
      lang="fa"
      className="contract-details-panel rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-3.5 shadow-sm"
      aria-label="دستهٔ فهرست قراردادها"
    >
      {/* ترتیب DOM با dir=rtl: اول سمت راست (عنوان + تگ)، دوم سمت چپ (توضیح) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-row flex-wrap items-center gap-2 sm:shrink-0">
          <span className="text-[13px] font-semibold text-slate-600">دستهٔ فهرست قراردادها</span>
          <span className={`contract-status-badge ${badgeClass}`}>{label}</span>
        </div>
        <p className="m-0 min-w-0 flex-1 text-right text-[12px] leading-relaxed text-slate-500 sm:max-w-[min(520px,100%)]">
          {hint}
        </p>
      </div>
    </section>
  );
}

function ContractDetailsBackToListRow({ fallbackStatus }: { fallbackStatus: ContractStatus }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const list = searchParams.get('list');
  const tab: ContractStatus =
    list === 'draft' || list === 'appendix_draft' || list === 'pending_approval' || list === 'completed' ? list : fallbackStatus;
  const href = `/contracts?tab=${encodeURIComponent(tab)}`;

  return (
    <div className="mb-3 flex justify-end px-1" dir="rtl" lang="fa">
      <button
        type="button"
        onClick={() => router.push(href)}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] hover:bg-slate-50"
      >
        بازگشت به فهرست قراردادها
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
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
  const searchParams = useSearchParams();
  const contractId = params?.contractId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [reopenEditDialogOpen, setReopenEditDialogOpen] = useState(false);
  const [reopenEditBusy, setReopenEditBusy] = useState(false);
  const { showError } = useAppToast();

  const reloadContract = useCallback(async () => {
    if (!contractId) return;
    setError('');
    try {
      setLoading(true);
      const data = await getContractDetails(String(contractId));
      setContract(data);
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
    const onUpdated = () => {
      void reloadContract();
    };
    window.addEventListener('contract-approval-updated', onUpdated);
    return () => window.removeEventListener('contract-approval-updated', onUpdated);
  }, [reloadContract]);

  const handleUnderDevelopment = () => {
    showError('این بخش در حال توسعه است و به‌زودی اضافه می‌شود.');
  };

  const actions = useMemo(() => {
    const lockedForApproval = contract?.approvalInstance?.status === 'IN_REVIEW';
    const isFinalizedUi = contract?.status === 'completed';
    /** در قرارداد تکمیل‌شده فقط این موارد فعال می‌مانند؛ بقیه پیام «در حال توسعه». */
    const enabledWhenCompleted = new Set(['reports', 'dues', 'appendix', 'history']);

    const enabled = (id: string) => {
      if (id === 'view-draft') return true;
      if (id === 'edit-draft') return !lockedForApproval;
      if (id === 'docs') return !isFinalizedUi;
      return isFinalizedUi && enabledWhenCompleted.has(id);
    };

    const hint = (id: string) => {
      if (id === 'view-draft') {
        return isFinalizedUi
          ? 'مشاهدهٔ نسخهٔ تأییدشدهٔ قرارداد و اطلاعات ثبت‌شده.'
          : 'مشاهدهٔ نسخهٔ فعلی پیش‌نویس و اطلاعات ثبت‌شده.'
      }
      if (id === 'edit-draft') {
        if (lockedForApproval) return 'در فرایند تأیید، امکان ویرایش وجود ندارد و فقط می‌توانید مشاهده کنید.'
        return isFinalizedUi
          ? 'با ورود به ویرایش، قرارداد از حالت تأیید نهایی خارج می‌شود و دوباره باید به فرایند تأیید ارسال شود.'
          : 'ویرایش پیش‌نویس و ادامهٔ تکمیل مراحل قرارداد.'
      }
      if (id === 'reports') return 'گزارش‌های مربوط به قرارداد (مالی/عملکردی/وضعیت).'
      if (id === 'dues') return 'مدیریت سررسیدها و فیش‌های پرداختی/واریزی مرتبط با قرارداد.'
      if (id === 'appendix') return 'ثبت و مدیریت متمم‌های قرارداد پس از نهایی شدن.'
      if (id === 'history') return 'مشاهده سیر تغییرات قرارداد از نسخه اصلی تا آخرین متمم تاییدشده.'
      if (id === 'docs') return 'بارگذاری و مدیریت مدارک و پیوست‌های قرارداد.'
      if (id === 'court') return 'ثبت و مدیریت اقاله و تغییر وضعیت‌های مرتبط.'
      if (id === 'cancel') return 'ثبت فرآیند فسخ و مستندات/رویدادهای مرتبط با آن.'
      if (id === 'unit-handover') return 'ثبت تحویل واحد و پیگیری وضعیت تحویل.'
      if (id === 'deed') return 'ثبت تحویل سند و پیگیری مراحل مربوط به آن.'
      if (id === 'transfer') return 'مدیریت انتقال قرارداد و ثبت رویدادهای مرتبط.'
      if (id === 'build') return 'ساخت متن قرارداد و چاپ. (این قابلیت به زودی اضافه میشه)'
      if (id === 'annex') return 'مکاتبات و اظهارنامه. (این قابلیت به زودی اضافه میشه)'
      return '—'
    };

    const disabledReason = (id: string) => {
      if (id === 'edit-draft' && lockedForApproval) return 'قفل در فرایند تأیید';
      if (id === 'docs' && isFinalizedUi) return 'به‌زودی';
      if (id === 'build' || id === 'annex') return 'به زودی';
      if (!isFinalizedUi && enabledWhenCompleted.has(id)) return 'فقط در حالت تکمیل شده';
      if (isFinalizedUi && !enabled(id)) return 'به‌زودی';
      return 'در حال توسعه';
    };

    return [
      // 1-2: view/edit
      { id: 'view-draft', title: isFinalizedUi ? 'مشاهده قرارداد' : 'مشاهده پیش نویس', icon: 'fa-solid fa-eye' },
      { id: 'edit-draft', title: isFinalizedUi ? 'ویرایش قرارداد' : 'ویرایش پیش نویس', icon: 'fa-regular fa-file' },
      // 3-6: completed-only
      { id: 'reports', title: 'گزارشات', icon: 'fa-solid fa-money-bill-transfer' },
      { id: 'dues', title: 'سر رسید ها و فیش ها', icon: 'fa-solid fa-calendar-check' },
      { id: 'appendix', title: 'متمم ها', icon: 'fa-solid fa-file-circle-plus' },
      { id: 'history', title: 'تاریخچه ی قرارداد', icon: 'fa-solid fa-clock-rotate-left' },
      // 7: always visible (click shows toast until implemented)
      { id: 'docs', title: 'مدارک قرارداد', icon: 'fa-solid fa-folder-open' },
      // 8-12: completed-only
      { id: 'court', title: 'القاله', icon: 'fa-regular fa-file-lines' },
      { id: 'cancel', title: 'فسخ', icon: 'fa-solid fa-file-circle-xmark' },
      { id: 'unit-handover', title: 'تحویل واحد', icon: 'fa-solid fa-truck-ramp-box' },
      { id: 'deed', title: 'تحویل سند', icon: 'fa-solid fa-key' },
      { id: 'transfer', title: 'انتقال', icon: 'fa-solid fa-right-left' },
      // 13-14: coming soon
      { id: 'build', title: 'ساخت متن قرارداد و چاپ', icon: 'fa-solid fa-print' },
      { id: 'annex', title: 'مکاتبات و اظهارنامه', icon: 'fa-solid fa-file-signature' },
    ].map((item) => ({
      ...item,
      enabled: enabled(item.id),
      hint: hint(item.id),
      disabledReason: disabledReason(item.id),
    }));
  }, [contract?.approvalInstance?.status, contract?.status]);

  const isFinalizedContract = contract?.status === 'completed';

  const confirmReopenApprovedAndEdit = useCallback(async () => {
    if (!contractId) return;
    setReopenEditBusy(true);
    try {
      const r = await reopenApprovedContractForEditAction(String(contractId));
      if (!r.ok) {
        showError(r.message);
        return;
      }
      setReopenEditDialogOpen(false);
      window.dispatchEvent(new Event('contract-approval-updated'));
      setActiveDraftId(String(contractId));
      router.push(`/contracts/${encodeURIComponent(String(contractId))}/edit`);
    } finally {
      setReopenEditBusy(false);
    }
  }, [contractId, router]);

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

    const amount = computeContractTotalRialFromFinancial(financial);

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
      <Suspense fallback={null}>
        <ContractDetailsBackToListRow fallbackStatus={(contract?.status as ContractStatus) ?? 'draft'} />
      </Suspense>
      {contractId ? (
        <Suspense fallback={null}>
          <ContractApprovalFlowBanner
            key={String(contractId)}
            contractId={String(contractId)}
            contractStatus={(contract?.status as ContractStatus) ?? 'draft'}
          />
        </Suspense>
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
            {actions.map((item) => {
              const dim = !item.enabled;
              const onClick = () => {
                if (!contractId) return;
                if (item.id === 'edit-draft' && contract?.approvalInstance?.status === 'IN_REVIEW') {
                  showError('در فرایند تأیید فقط امکان مشاهدهٔ پیش‌نویس وجود دارد.');
                  router.push(`/contracts/${String(contractId)}/preview`);
                  return;
                }
                if (!item.enabled) return handleUnderDevelopment();
                if (item.id === 'view-draft') {
                  router.push(`/contracts/${String(contractId)}/preview`);
                  return;
                }
                if (item.id === 'edit-draft' && isFinalizedContract) {
                  setReopenEditDialogOpen(true);
                  return;
                }
                if (item.id === 'reports') {
                  const q = searchParams?.toString();
                  router.push(`/contracts/${String(contractId)}/reports${q ? `?${q}` : ''}`);
                  return;
                }
                if (item.id === 'dues') {
                  const q = searchParams?.toString();
                  router.push(`/contracts/${String(contractId)}/dues${q ? `?${q}` : ''}`);
                  return;
                }
                if (item.id === 'appendix') {
                  const q = searchParams?.toString();
                  router.push(`/contracts/${String(contractId)}/appendices${q ? `?${q}` : ''}`);
                  return;
                }
                if (item.id === 'history') {
                  const q = searchParams?.toString();
                  router.push(`/contracts/${String(contractId)}/history${q ? `?${q}` : ''}`);
                  return;
                }
                setActiveDraftId(String(contractId));
                router.push(`/contracts/${encodeURIComponent(String(contractId))}/edit`);
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
                  <p className="contract-details-action-text">
                    {item.hint}
                    {!item.enabled ? (
                      <span className="mt-1 block text-[12px] font-semibold text-slate-500">
                        {item.disabledReason}
                      </span>
                    ) : null}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {reopenEditDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          dir="rtl"
          lang="fa"
          role="presentation"
          onClick={() => !reopenEditBusy && setReopenEditDialogOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reopen-approved-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-100 bg-gradient-to-br from-amber-50/90 to-white px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-amber-800">
                    <AlertTriangle className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 text-right">
                    <h2 id="reopen-approved-dialog-title" className="text-base font-black text-slate-900">
                      ویرایش قرارداد تأییدشده
                    </h2>
                    <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">
                      با ورود به ویرایش، این قرارداد از حالت تأیید نهایی خارج می‌شود تا بتوانید تغییر دهید.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={reopenEditBusy}
                  className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                  aria-label="بستن"
                  onClick={() => setReopenEditDialogOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <ul className="space-y-2.5 px-5 py-4 text-right text-[13px] leading-6 text-slate-700">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden />
                <span>
                  قرارداد در فهرست به‌عنوان <strong className="text-slate-900">پیش‌نویس</strong> دیده می‌شود؛ وضعیت «تأیید
                  نهایی» قبلی برای همین نسخه از بین می‌رود.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden />
                <span>
                  پس از ثبت تغییرات، برای <strong className="text-slate-900">نهایی شدن مجدد</strong> باید دوباره قرارداد
                  را به <strong className="text-slate-900">فرایند تأیید</strong> بفرستید.
                </span>
              </li>
            </ul>
            <div className="flex flex-wrap-reverse items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                disabled={reopenEditBusy}
                onClick={() => setReopenEditDialogOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={reopenEditBusy}
                onClick={() => void confirmReopenApprovedAndEdit()}
                className="rounded-xl bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
              >
                {reopenEditBusy ? 'در حال آماده‌سازی…' : 'تأیید و رفتن به ویرایش'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
    </PanelLayout>
  );
}

