'use client';

import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { LucideIcon } from 'lucide-react';
import { Layers, Wallet } from 'lucide-react';
import { useParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { DueMonthAccordionList } from '../../../../components/contracts/DueMonthAccordionList';
import { FieldHint } from '../../../../components/ui/field-hint';
import { getContractDetails } from '../../../../lib/contractDraftClient';
import { buildPaymentHistoryMonthBuckets } from '../../../../lib/contractPaymentMonthBuckets';
import { estimateContractPenaltiesTotalRial } from '../../../../lib/estimateContractPenalties';
import { isFinancialLineHeaderCategoryId, isFinancialLineSubtreeCategoryId } from '../../../../lib/financialUtils';

const PRINCIPAL_SUB_IDS = ['advance', 'installment', 'loan', 'handover', 'document'] as const;

type FinancialReportGroup = {
  id: string;
  title: string;
  umbrellaCapRial: number;
  dueCategoryIds: string[];
  subRows: { id: string; label: string; capRial: number }[];
};

function buildFinancialReportGroups(categoriesRaw: unknown[]): FinancialReportGroup[] {
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
  const byId = new Map(categories.map((c: any) => [String(c?.id ?? ''), c]));
  const groups: FinancialReportGroup[] = [];

  const principal = byId.get('principal');
  if (principal) {
    const childIds = PRINCIPAL_SUB_IDS.filter((sid) => byId.has(sid));
    groups.push({
      id: 'group-principal',
      title: String(principal.name ?? 'مبلغ اصل قرارداد'),
      umbrellaCapRial: Number(principal.capAmount ?? 0),
      dueCategoryIds: [...childIds],
      subRows: childIds.map((sid) => {
        const row = byId.get(sid);
        return {
          id: sid,
          label: String(row?.name ?? sid),
          capRial: Number(row?.capAmount ?? 0),
        };
      }),
    });
  }

  for (const c of categories as any[]) {
    const cid = String(c?.id ?? '');
    if (!isFinancialLineHeaderCategoryId(cid)) continue;
    const childIds = PRINCIPAL_SUB_IDS.map((s) => `${cid}:${s}`).filter((id) => byId.has(id));
    groups.push({
      id: cid,
      title: String(c.name ?? 'ردیف مالی'),
      umbrellaCapRial: Number(c.capAmount ?? 0),
      dueCategoryIds: [...childIds],
      subRows: childIds.map((id) => {
        const row = byId.get(id);
        return { id, label: String(row?.name ?? id), capRial: Number(row?.capAmount ?? 0) };
      }),
    });
  }

  for (const c of categories as any[]) {
    const cid = String(c?.id ?? '');
    if (!cid || cid === 'principal') continue;
    if ((PRINCIPAL_SUB_IDS as readonly string[]).includes(cid)) continue;
    if (isFinancialLineSubtreeCategoryId(cid)) continue;
    if (isFinancialLineHeaderCategoryId(cid)) continue;
    groups.push({
      id: cid,
      title: String(c.name ?? 'ردیف مالی'),
      umbrellaCapRial: Number(c.capAmount ?? 0),
      dueCategoryIds: [cid],
      subRows: [],
    });
  }

  return groups;
}

function formatMoneyRial(valueRial: number) {
  if (!valueRial) return '۰ ریال';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ریال`;
}

/** مقدار تهی یعنی سرور هنوز این فیلد را برنمی‌گرداند؛ صفر معتبر است. */
function formatMoneyRialNullable(valueRial: number | null | undefined) {
  if (valueRial == null) return '—';
  return formatMoneyRial(valueRial);
}

const TOOLTIP_LINE_BASE =
  'مبلغ این ردیف بر اساس سقف زیربخش‌ها؛ بدون لحاظ جریمه‌ها و تخفیف قرارداد.';

const TT_LEDGER_PAID_TOTAL =
  'جمع پرداخت اصل و پرداخت جریمه؛ فقط وقتی هر دو مقدار از API موجود باشد محاسبه می‌شود؛ در غیر این صورت «—».';

function LedgerDetailPopover({
  icon: Icon,
  ariaLabel,
  children,
}: {
  icon: LucideIcon;
  ariaLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const syncPos = useCallback(() => {
    const el = btnRef.current;
    if (!el || typeof window === 'undefined') return;
    const r = el.getBoundingClientRect();
    const width = 280;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    setPos({ top: r.bottom + 8, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    syncPos();
    const onMove = () => syncPos();
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open, syncPos]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[color-mix(in_srgb,var(--dark-teal)_85%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)]"
      >
        <Icon className="h-4 w-4" aria-hidden />
      </button>
      {open && pos && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={ariaLabel}
              className="fixed z-[120] w-[min(280px,calc(100vw-16px))] rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2.5 text-[var(--text-body)] shadow-lg"
              style={{ top: pos.top, left: pos.left }}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function reportGroupLineBaseRial(group: FinancialReportGroup): number {
  const subSum = group.subRows.reduce((s, r) => s + Math.max(0, r.capRial), 0);
  return subSum > 0 ? subSum : Math.max(0, group.umbrellaCapRial);
}

type SummaryFinancialRowMetrics = {
  id: string;
  title: string;
  lineBaseRial: number;
  /** تا وقتی API جمع جریمه/پرداخت به‌تفکیک ردیف را برنگرداند، تهی است. */
  penaltyTotalRial: number | null;
  penaltyPaidRial: number | null;
  paidTotalRial: number | null;
};

function buildSummaryFinancialRows(groups: FinancialReportGroup[]): SummaryFinancialRowMetrics[] {
  return groups.map((g) => ({
    id: g.id,
    title: g.title,
    lineBaseRial: reportGroupLineBaseRial(g),
    penaltyTotalRial: null,
    penaltyPaidRial: null,
    paidTotalRial: null,
  }));
}

type SubgroupDetailRow = {
  id: string;
  label: string;
  lineBaseRial: number;
  penaltyTotalRial: number | null;
  penaltyPaidRial: number | null;
  paidTotalRial: number | null;
};

function buildSubgroupDetailRows(
  group: FinancialReportGroup,
  groupMetrics: SummaryFinancialRowMetrics | undefined,
): SubgroupDetailRow[] {
  const penaltyPool = groupMetrics?.penaltyTotalRial ?? null;
  const penaltyPaidPool = groupMetrics?.penaltyPaidRial ?? null;
  const paidPool = groupMetrics?.paidTotalRial ?? null;
  const canSplit =
    typeof penaltyPool === 'number' &&
    typeof penaltyPaidPool === 'number' &&
    typeof paidPool === 'number';

  if (!group.subRows.length) {
    const base = reportGroupLineBaseRial(group);
    return [
      {
        id: `${group.id}-aggregate`,
        label: group.title,
        lineBaseRial: base,
        penaltyTotalRial: penaltyPool,
        penaltyPaidRial: penaltyPaidPool,
        paidTotalRial: paidPool,
      },
    ];
  }

  if (!canSplit) {
    return group.subRows.map((s) => ({
      id: s.id,
      label: s.label,
      lineBaseRial: Math.max(0, s.capRial),
      penaltyTotalRial: null,
      penaltyPaidRial: null,
      paidTotalRial: null,
    }));
  }

  const caps = group.subRows.map((s) => Math.max(0, s.capRial));
  const sumCap = caps.reduce((a, b) => a + b, 0);
  const n = group.subRows.length;
  const weights = caps.map((c) => (sumCap > 0 ? c / sumCap : n > 0 ? 1 / n : 0));

  const rows: SubgroupDetailRow[] = group.subRows.map((s, idx) => ({
    id: s.id,
    label: s.label,
    lineBaseRial: Math.max(0, s.capRial),
    penaltyTotalRial: Math.round(penaltyPool * (weights[idx] ?? 0)),
    penaltyPaidRial: Math.round(penaltyPaidPool * (weights[idx] ?? 0)),
    paidTotalRial: Math.round(paidPool * (weights[idx] ?? 0)),
  }));

  const fixDrift = (
    key: keyof Pick<SubgroupDetailRow, 'penaltyTotalRial' | 'penaltyPaidRial' | 'paidTotalRial'>,
    pool: number,
  ) => {
    if (!rows.length || pool <= 0) return;
    const alloc = rows.reduce((s, r) => {
      const v = r[key];
      return s + (typeof v === 'number' ? v : 0);
    }, 0);
    const drift = pool - alloc;
    if (drift !== 0) {
      const last = rows[rows.length - 1]![key];
      if (typeof last === 'number') (rows[rows.length - 1]![key] as number) = last + drift;
    }
  };

  fixDrift('penaltyTotalRial', penaltyPool);
  fixDrift('penaltyPaidRial', penaltyPaidPool);
  fixDrift('paidTotalRial', paidPool);

  return rows;
}

function sumFinancialNullableColumn<
  T extends { penaltyTotalRial?: number | null; penaltyPaidRial?: number | null; paidTotalRial?: number | null },
>(
  rows: readonly T[],
  key: 'penaltyTotalRial' | 'penaltyPaidRial' | 'paidTotalRial',
): number | null {
  const nums = rows.map((r) => r[key]).filter((v): v is number => typeof v === 'number');
  return nums.length ? nums.reduce((a, b) => a + b, 0) : null;
}

function formatSubjectUnitLocation(subject: { unitName?: string; floorName?: string; blockName?: string } | null) {
  if (!subject) return '—';
  const unit = String(subject.unitName ?? '').trim() || '—';
  const floor = String(subject.floorName ?? '').trim();
  const block = String(subject.blockName ?? '').trim();

  const parts: string[] = [`واحد ${unit}`];
  if (floor) parts.push(`طبقه ${floor}`);
  if (block) parts.push(`بلوک ${block}`);
  return parts.join(' ، ');
}

export default function ContractReportsPage() {
  const params = useParams<{ contractId: string }>();
  const contractId = params?.contractId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!contractId) return;
      try {
        setLoading(true);
        setError('');
        const data = await getContractDetails(String(contractId));
        if (mounted) setContract(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'دریافت گزارشات انجام نشد.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [contractId]);

  const view = useMemo(() => {
    const subject = contract?.data?.subject ?? null;
    const financial = contract?.data?.financial ?? null;
    const parties = contract?.data?.parties ?? null;
    const contractTypeLabel =
      subject?.contractType === 'pre-sale' ? 'پیش فروش' : subject?.contractType === 'sale' ? 'فروش' : '—';
    const buyer =
      parties?.partyTwo?.find((p: any) => p?.isPrimary) ??
      parties?.partyTwo?.[0] ??
      parties?.partyOne?.find((p: any) => p?.isPrimary) ??
      parties?.partyOne?.[0] ??
      null;

    const parkingArea = Number(financial?.parkingArea || 0);
    const unitArea = Number(financial?.unitArea || Math.max(Number(financial?.totalArea || 0) - parkingArea, 0));
    const amountRial =
      financial?.pricingType === 'metered'
        ? unitArea * Number(financial?.pricePerMeter || 0) + parkingArea * Number(financial?.parkingPricePerMeter || 0)
        : Number(financial?.fixedTotalAmount || 0);

    return {
      contractNumber: subject?.contractNumber ?? '—',
      contractDate: subject?.contractDate ?? '—',
      unitName: subject?.unitName ?? '—',
      unitMeta: formatSubjectUnitLocation(subject),
      buyerName: buyer?.name ?? '—',
      amountRial,
      status: contract?.status ?? '—',
      contractTypeLabel,
      financial,
    };
  }, [contract]);

  const [tab, setTab] = useState<'summary' | 'payments'>('summary');
  const [selectedSummaryGroupId, setSelectedSummaryGroupId] = useState<string | null>(null);

  const canUseCompletedOnly = contract?.status === 'completed';
  const financialCategories = Array.isArray(view.financial?.categories) ? view.financial.categories : [];
  const financialDueItems = Array.isArray(view.financial?.dueItems) ? view.financial.dueItems : [];

  const totals = useMemo(() => {
    const principal = financialCategories.find((c: any) => c.id === 'principal');
    const contractTotal = principal ? Number(principal.capAmount || 0) : view.amountRial;
    return { contractTotal };
  }, [financialCategories, view.amountRial]);

  const reportGroups = useMemo(() => buildFinancialReportGroups(financialCategories), [financialCategories]);

  const summaryFinancialRows = useMemo(() => buildSummaryFinancialRows(reportGroups), [reportGroups]);

  const summaryFooter = useMemo(() => {
    if (!summaryFinancialRows.length) return null;
    return {
      lineBase: summaryFinancialRows.reduce((s, r) => s + r.lineBaseRial, 0),
      penaltyTotal: sumFinancialNullableColumn(summaryFinancialRows, 'penaltyTotalRial'),
      penaltyPaid: sumFinancialNullableColumn(summaryFinancialRows, 'penaltyPaidRial'),
      paidTotal: sumFinancialNullableColumn(summaryFinancialRows, 'paidTotalRial'),
    };
  }, [summaryFinancialRows]);

  const ledgerSnapshot = useMemo(() => {
    const contractTotalRial = totals.contractTotal;
    const penaltiesPayload = contract?.data?.penalties ?? null;
    const apiPenaltyTotal = summaryFooter?.penaltyTotal;

    const penaltyTotalRial =
      typeof apiPenaltyTotal === 'number'
        ? apiPenaltyTotal
        : estimateContractPenaltiesTotalRial(
            contractTotalRial > 0 ? contractTotalRial : 1,
            penaltiesPayload,
          );
    const penaltyFromApi = typeof apiPenaltyTotal === 'number';

    const paidPrincipalRial = summaryFooter?.paidTotal;
    const paidPenaltyRial = summaryFooter?.penaltyPaid;

    const paidCombinedRial =
      typeof paidPrincipalRial === 'number' && typeof paidPenaltyRial === 'number'
        ? paidPrincipalRial + paidPenaltyRial
        : null;

    const liabilityTotalRial = contractTotalRial + penaltyTotalRial;

    return {
      contractTotalRial,
      penaltyTotalRial,
      penaltyFromApi,
      liabilityTotalRial,
      paidPrincipalRial: typeof paidPrincipalRial === 'number' ? paidPrincipalRial : null,
      paidPenaltyRial: typeof paidPenaltyRial === 'number' ? paidPenaltyRial : null,
      paidCombinedRial,
    };
  }, [totals.contractTotal, summaryFooter, contract?.data?.penalties]);

  const defaultSummaryGroupId = useMemo(
    () => reportGroups.find((g) => g.id === 'group-principal')?.id ?? reportGroups[0]?.id ?? null,
    [reportGroups],
  );

  const activeSummaryGroupId =
    selectedSummaryGroupId && reportGroups.some((g) => g.id === selectedSummaryGroupId)
      ? selectedSummaryGroupId
      : defaultSummaryGroupId;

  const selectedReportGroup = useMemo(
    () => (activeSummaryGroupId ? reportGroups.find((g) => g.id === activeSummaryGroupId) ?? null : null),
    [reportGroups, activeSummaryGroupId],
  );

  const selectedGroupSummary = useMemo(
    () =>
      activeSummaryGroupId ? summaryFinancialRows.find((r) => r.id === activeSummaryGroupId) : undefined,
    [summaryFinancialRows, activeSummaryGroupId],
  );

  const subgroupDetailRows = useMemo(
    () => (selectedReportGroup ? buildSubgroupDetailRows(selectedReportGroup, selectedGroupSummary) : []),
    [selectedReportGroup, selectedGroupSummary],
  );

  const subgroupDetailFooter = useMemo(() => {
    if (!subgroupDetailRows.length) return null;
    return {
      lineBase: subgroupDetailRows.reduce((s, r) => s + r.lineBaseRial, 0),
      penaltyTotal: sumFinancialNullableColumn(subgroupDetailRows, 'penaltyTotalRial'),
      penaltyPaid: sumFinancialNullableColumn(subgroupDetailRows, 'penaltyPaidRial'),
      paidTotal: sumFinancialNullableColumn(subgroupDetailRows, 'paidTotalRial'),
    };
  }, [subgroupDetailRows]);

  const selectedGroupDueMeta = useMemo(() => {
    if (!selectedReportGroup) return { dues: [] as typeof financialDueItems, sum: 0 };
    const idSet = new Set(selectedReportGroup.dueCategoryIds.map(String));
    const dues = financialDueItems.filter((d: any) => idSet.has(String(d.categoryId)));
    const sum = dues.reduce((s: number, d: any) => s + Number(d?.amount ?? 0), 0);
    return { dues, sum };
  }, [selectedReportGroup, financialDueItems]);

  const categoryTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of financialCategories as any[]) {
      m.set(String(c.id), String(c.name ?? c.id));
    }
    return m;
  }, [financialCategories]);

  const paymentMonthBuckets = useMemo(
    () => buildPaymentHistoryMonthBuckets({ dueItems: financialDueItems, categoryById: categoryTitleById }),
    [financialDueItems, categoryTitleById],
  );

  /** سررسیدهای همان گروه مالی انتخاب‌شده در خلاصه (برای ستون جزئیات) */
  const summaryDetailMonthBuckets = useMemo(
    () =>
      buildPaymentHistoryMonthBuckets({ dueItems: selectedGroupDueMeta.dues, categoryById: categoryTitleById }),
    [selectedGroupDueMeta.dues, categoryTitleById],
  );

  const [collapsedPaymentMonths, setCollapsedPaymentMonths] = useState<Set<string>>(() => new Set());
  const [collapsedSummaryDueMonths, setCollapsedSummaryDueMonths] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setCollapsedPaymentMonths(new Set());
    setCollapsedSummaryDueMonths(new Set());
  }, [contractId]);

  const togglePaymentMonth = (monthKey: string) => {
    setCollapsedPaymentMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) next.delete(monthKey);
      else next.add(monthKey);
      return next;
    });
  };

  const toggleSummaryDueMonth = (monthKey: string) => {
    setCollapsedSummaryDueMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) next.delete(monthKey);
      else next.add(monthKey);
      return next;
    });
  };

  return (
    <PanelLayout>
      <main className="w-full max-w-none min-w-0" dir="rtl" lang="fa">
        <div className="w-full max-w-none py-6 sm:py-8">
          {loading ? (
            <section className="rounded-[28px] border border-white/70 bg-white/95 p-10 text-center text-sm font-bold text-slate-500 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.14)]">
              در حال بارگذاری…
            </section>
          ) : error || !contractId ? (
            <section className="rounded-[28px] border border-rose-200 bg-rose-50/95 p-8 text-center text-sm font-bold text-rose-800 shadow-sm">
              {error || 'شناسه قرارداد نامعتبر است.'}
            </section>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-start gap-3">
                <section className="w-fit max-w-full rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 shadow-sm sm:px-5 sm:py-3.5">
                  <div className="flex flex-col gap-2.5 text-right">
                    <div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-[12px] leading-relaxed text-slate-700">
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-900">
                        {view.contractTypeLabel}
                      </span>
                      <span className="text-[13px] font-black text-slate-900">{view.unitMeta}</span>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex flex-wrap items-center justify-start gap-x-3 gap-y-1 text-[12px] text-slate-600">
                      <span>
                        خریدار: <span className="font-bold text-slate-900">{view.buyerName}</span>
                      </span>
                      <span className="text-slate-300" aria-hidden>
                        ·
                      </span>
                      <span className="tabular-nums">
                        شماره قرارداد: <span className="font-bold text-slate-900">{view.contractNumber}</span>
                      </span>
                      <span className="text-slate-300" aria-hidden>
                        ·
                      </span>
                      <span className="tabular-nums">
                        تاریخ قرارداد: <span className="font-bold text-slate-900">{view.contractDate}</span>
                      </span>
                    </div>
                  </div>
                </section>

                <section className="w-fit max-w-full rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-2 shadow-sm sm:px-4 sm:py-2.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-[11px] font-black text-slate-800">خلاصه مالی</span>
                      <FieldHint
                        label="خلاصه مالی"
                        text="دو عدد اصلی: جمع تعهد (اصل قرارداد + جریمه) و جمع پرداخت ثبت‌شده. برای جزئیات روی آیکن‌ها بزنید."
                      />
                      <span className="text-[10px] font-semibold text-slate-400">ریال</span>
                    </div>

                    <div className="flex flex-wrap items-stretch gap-3 sm:gap-4">
                      <div className="grid min-w-[7.5rem] gap-0.5 text-right">
                        <span className="text-[10px] font-semibold leading-tight text-slate-500">تعهد کل (اصل + جریمه)</span>
                        <span className="text-[13px] font-black tabular-nums leading-tight text-slate-900">
                          {formatMoneyRial(ledgerSnapshot.liabilityTotalRial)}
                        </span>
                      </div>

                      <div className="hidden w-px shrink-0 bg-slate-200 sm:block" aria-hidden />

                      <div className="grid min-w-[7.5rem] gap-0.5 text-right">
                        <span className="text-[10px] font-semibold leading-tight text-slate-500">پرداختی کل (با جریمه)</span>
                        <span className="text-[13px] font-black tabular-nums leading-tight text-[color-mix(in_srgb,var(--dark-teal)_88%,black)]">
                          {ledgerSnapshot.paidCombinedRial != null
                            ? formatMoneyRial(ledgerSnapshot.paidCombinedRial)
                            : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5 border-s border-slate-200 ps-2">
                      <LedgerDetailPopover icon={Layers} ariaLabel="جزئیات تعهد (قرارداد و جریمه)">
                        <div className="space-y-2 text-[11px] leading-relaxed">
                          <div className="border-b border-slate-100 pb-2 font-black text-slate-900">تفکیک تعهد</div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">قرارداد (بدون جریمه)</span>
                            <span className="tabular-nums font-black text-slate-900">
                              {formatMoneyRial(ledgerSnapshot.contractTotalRial)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">
                              جریمه
                              {!ledgerSnapshot.penaltyFromApi ? (
                                <span className="ms-1 text-[10px] font-bold text-amber-800">(تخمین)</span>
                              ) : null}
                            </span>
                            <span className="tabular-nums font-black text-slate-900">
                              {formatMoneyRial(ledgerSnapshot.penaltyTotalRial)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 border-t border-slate-100 pt-2 font-black text-slate-900">
                            <span>جمع تعهد</span>
                            <span className="tabular-nums">{formatMoneyRial(ledgerSnapshot.liabilityTotalRial)}</span>
                          </div>
                        </div>
                      </LedgerDetailPopover>

                      <LedgerDetailPopover icon={Wallet} ariaLabel="جزئیات پرداخت‌ها">
                        <div className="space-y-2 text-[11px] leading-relaxed">
                          <div className="border-b border-slate-100 pb-2 font-black text-slate-900">تفکیک پرداخت</div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">پرداخت اصل</span>
                            <span className="tabular-nums font-black text-slate-900">
                              {formatMoneyRialNullable(ledgerSnapshot.paidPrincipalRial)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-slate-500">پرداخت جریمه</span>
                            <span className="tabular-nums font-black text-slate-900">
                              {formatMoneyRialNullable(ledgerSnapshot.paidPenaltyRial)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3 border-t border-slate-100 pt-2 font-black text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]">
                            <span>جمع پرداخت</span>
                            <span className="tabular-nums">
                              {ledgerSnapshot.paidCombinedRial != null
                                ? formatMoneyRial(ledgerSnapshot.paidCombinedRial)
                                : '—'}
                            </span>
                          </div>
                          <p className="border-t border-slate-100 pt-2 text-[10px] font-semibold leading-snug text-slate-500">
                            {TT_LEDGER_PAID_TOTAL}
                          </p>
                        </div>
                      </LedgerDetailPopover>
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-6 flex justify-center px-3" dir="ltr">
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setTab('payments')}
                    aria-pressed={tab === 'payments'}
                    className={`min-h-[42px] min-w-[11rem] rounded-full px-6 py-2.5 text-[13px] font-black tracking-tight text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_50%,transparent)] focus-visible:ring-offset-2 sm:min-w-[12.5rem] sm:px-8 ${
                      tab === 'payments'
                        ? 'bg-[color-mix(in_srgb,var(--dark-teal)_88%,black)]'
                        : 'bg-[#26a69a]'
                    }`}
                  >
                    تاریخچه پرداخت
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('summary')}
                    aria-pressed={tab === 'summary'}
                    className={`min-h-[42px] min-w-[9.5rem] rounded-full px-6 py-2.5 text-[13px] font-black tracking-tight text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_50%,transparent)] focus-visible:ring-offset-2 sm:min-w-[10.5rem] sm:px-8 ${
                      tab === 'summary'
                        ? 'bg-[color-mix(in_srgb,var(--dark-teal)_88%,black)]'
                        : 'bg-[#26a69a]'
                    }`}
                  >
                    خلاصه
                  </button>
                </div>
              </div>

              {tab === 'payments' ? (
                <section className="mt-6 rounded-[22px] border border-slate-200/80 bg-white/90 p-5 text-right shadow-sm md:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="text-[15px] font-black text-slate-900">تاریخچه پرداخت</div>
                      <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500">
                        به‌ترتیب تاریخ، بر اساس ماه سررسید؛ فقط ردیف‌های سررسید ذخیره‌شده در قرارداد از سرور بارگذاری شده‌اند.
                      </p>
                    </div>
                  </div>

                  {paymentMonthBuckets.length === 0 ? (
                    <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-10 text-center text-[13px] font-semibold text-slate-500">
                      برای این قرارداد هیچ ردیف سررسیدی در دادهٔ مالی ثبت نشده است.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      <DueMonthAccordionList
                        buckets={paymentMonthBuckets}
                        collapsedMonths={collapsedPaymentMonths}
                        toggleMonth={togglePaymentMonth}
                      />
                    </div>
                  )}
                </section>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-5 2xl:gap-6">
                  {/* موبایل: جزئیات، خلاصه؛ دسکتاپ: دو ستون مساوی + ردیف تمام‌عرض فقط برای سررسیدها */}
                  <aside className="order-2 grid w-full content-start gap-4 xl:order-1 xl:sticky xl:top-4 xl:self-start">
                    <section className="rounded-[22px] border border-slate-200/80 bg-white/95 p-4 text-right shadow-sm md:p-5">
                      <div className="text-[13px] font-black text-slate-900">خلاصه گزارشات</div>
                      <p className="mt-2 text-[10px] font-semibold leading-5 text-slate-500">
                        روی هر ردیف کلیک کنید تا همان بخش در «جزئیات مالی» باز شود. ستون‌های جریمه و پرداخت فقط وقتی مقدار دارند که API
                        قرارداد آن‌ها را برگرداند.
                      </p>

                      {summaryFinancialRows.length === 0 ? (
                        <p className="mt-4 text-[12px] font-semibold text-slate-500">ردیف مالی برای نمایش وجود ندارد.</p>
                      ) : (
                        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200/90">
                          <table className="w-full min-w-[340px] border-collapse text-[10px] sm:min-w-[380px] sm:text-[11px]" dir="rtl">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-500">
                                <th className="min-w-[7rem] px-2 py-2 text-right font-bold">عنوان ردیف</th>
                                <th className="px-1 py-2 text-center font-bold">
                                  <div className="flex items-center justify-center gap-1">
                                    <span>مبلغ کل</span>
                                    <FieldHint label="مبلغ کل" text={TOOLTIP_LINE_BASE} />
                                  </div>
                                </th>
                                <th className="px-1 py-2 text-center font-bold whitespace-nowrap">مبلغ کل جریمه</th>
                                <th className="px-1 py-2 text-center font-bold whitespace-nowrap">جریمه پرداخت‌شده</th>
                                <th className="min-w-[5.5rem] px-1 py-2 text-center font-bold whitespace-nowrap">
                                  پرداخت‌شده
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {summaryFinancialRows.map((row, idx) => {
                                const isPrincipal = row.id === 'group-principal';
                                const isActive = activeSummaryGroupId === row.id;
                                return (
                                  <tr
                                    key={row.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isActive}
                                    title="نمایش جزئیات این ردیف در کادر کنار"
                                    onClick={() => setSelectedSummaryGroupId(row.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedSummaryGroupId(row.id);
                                      }
                                    }}
                                    className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-100/70 focus-visible:bg-slate-100/80 focus-visible:outline-none ${
                                      isActive
                                        ? 'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--dark-teal)_14%,white),color-mix(in_srgb,var(--dark-teal)_08%,white))] ring-2 ring-inset ring-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)]'
                                        : isPrincipal
                                          ? 'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--dark-teal)_08%,transparent),color-mix(in_srgb,var(--dark-teal)_04%,transparent))]'
                                          : idx % 2 === 1
                                            ? 'bg-slate-50/40'
                                            : ''
                                    }`}
                                  >
                                    <td className={`max-w-[9rem] px-2 py-2 align-middle ${isPrincipal ? 'font-black text-slate-900' : 'font-semibold text-slate-800'}`}>
                                      <span className="line-clamp-2" title={row.title}>
                                        {row.title}
                                      </span>
                                    </td>
                                    <td className="px-1 py-2 text-center tabular-nums font-black text-slate-900 align-middle">
                                      {formatMoneyRial(row.lineBaseRial)}
                                    </td>
                                    <td className="px-1 py-2 text-center tabular-nums font-bold text-slate-800 align-middle">
                                      {formatMoneyRialNullable(row.penaltyTotalRial)}
                                    </td>
                                    <td className="px-1 py-2 text-center tabular-nums font-bold text-slate-800 align-middle">
                                      {formatMoneyRialNullable(row.penaltyPaidRial)}
                                    </td>
                                    <td className="px-1 py-2 text-center tabular-nums font-bold text-emerald-900 align-middle">
                                      {formatMoneyRialNullable(row.paidTotalRial)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            {summaryFooter ? (
                              <tfoot>
                                <tr className="border-t-2 border-dashed border-slate-300 bg-slate-50/80">
                                  <td className="px-2 py-2 font-black text-slate-900">جمع کل</td>
                                  <td className="px-1 py-2 text-center tabular-nums font-black text-slate-900">
                                    {formatMoneyRial(summaryFooter.lineBase)}
                                  </td>
                                  <td className="px-1 py-2 text-center tabular-nums font-black text-slate-900">
                                    {formatMoneyRialNullable(summaryFooter.penaltyTotal)}
                                  </td>
                                  <td className="px-1 py-2 text-center tabular-nums font-black text-slate-900">
                                    {formatMoneyRialNullable(summaryFooter.penaltyPaid)}
                                  </td>
                                  <td className="px-1 py-2 text-center tabular-nums font-black text-emerald-950">
                                    {formatMoneyRialNullable(summaryFooter.paidTotal)}
                                  </td>
                                </tr>
                              </tfoot>
                            ) : null}
                          </table>
                        </div>
                      )}

                      {!canUseCompletedOnly ? (
                        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-900">
                          برای قراردادهای تکمیل‌شده این گزارش کامل‌تر خواهد بود.
                        </p>
                      ) : null}
                    </section>
                  </aside>

                  <div className="order-1 min-w-0 space-y-6 xl:order-2">
                    {!selectedReportGroup ? (
                      <section className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 text-right shadow-sm md:p-6 lg:p-8">
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center text-[13px] font-semibold text-slate-500">
                          ردیف مالی برای نمایش وجود ندارد.
                        </div>
                      </section>
                    ) : (
                      <div className="space-y-5">
                        <section className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 text-right shadow-sm md:p-6 lg:p-8">
                          <h3 className="text-[13px] font-black text-slate-800">تفکیک زیربخش‌ها</h3>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">
                            مبالغ کل زیربخش از قرارداد است؛ جریمه و پرداخت زیربخش تنها با دادهٔ برگشتی از API پر می‌شود.
                          </p>
                          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                            <table className="w-full min-w-[640px] border-collapse text-[11px] md:min-w-[720px] md:text-[12px]" dir="rtl">
                              <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                  <th className="min-w-[8rem] px-3 py-3 text-right font-black">عنوان</th>
                                  <th className="px-2 py-3 text-center font-black">
                                    <div className="flex items-center justify-center gap-1">
                                      <span>مبلغ کل</span>
                                      <FieldHint label="مبلغ کل" text={TOOLTIP_LINE_BASE} />
                                    </div>
                                  </th>
                                  <th className="px-2 py-3 text-center font-black whitespace-nowrap">مبلغ جریمه</th>
                                  <th className="px-2 py-3 text-center font-black whitespace-nowrap">مبلغ پرداختی جریمه</th>
                                  <th className="min-w-[6.5rem] px-2 py-3 text-center font-black whitespace-nowrap">
                                    مبلغ کل پرداختی
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {subgroupDetailRows.map((row, idx) => (
                                  <tr
                                    key={row.id}
                                    className={`border-b border-slate-100 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                                  >
                                    <td className="px-3 py-2.5 font-bold text-slate-800">{row.label}</td>
                                    <td className="px-2 py-2.5 text-center tabular-nums font-black text-slate-900">
                                      {formatMoneyRial(row.lineBaseRial)}
                                    </td>
                                    <td className="px-2 py-2.5 text-center tabular-nums font-bold text-slate-800">
                                      {formatMoneyRialNullable(row.penaltyTotalRial)}
                                    </td>
                                    <td className="px-2 py-2.5 text-center tabular-nums font-bold text-slate-700">
                                      {formatMoneyRialNullable(row.penaltyPaidRial)}
                                    </td>
                                    <td className="px-2 py-2.5 text-center tabular-nums font-bold text-emerald-900">
                                      {formatMoneyRialNullable(row.paidTotalRial)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              {subgroupDetailFooter ? (
                                <tfoot>
                                  <tr className="border-t-2 border-dashed border-slate-300 bg-[color-mix(in_srgb,var(--dark-teal)_06%,white)]">
                                    <td className="px-3 py-3 font-black text-slate-900">جمع کل</td>
                                    <td className="px-2 py-3 text-center tabular-nums font-black text-slate-900">
                                      {formatMoneyRial(subgroupDetailFooter.lineBase)}
                                    </td>
                                    <td className="px-2 py-3 text-center tabular-nums font-black text-slate-900">
                                      {formatMoneyRialNullable(subgroupDetailFooter.penaltyTotal)}
                                    </td>
                                    <td className="px-2 py-3 text-center tabular-nums font-black text-slate-900">
                                      {formatMoneyRialNullable(subgroupDetailFooter.penaltyPaid)}
                                    </td>
                                    <td className="px-2 py-3 text-center tabular-nums font-black text-emerald-950">
                                      {formatMoneyRialNullable(subgroupDetailFooter.paidTotal)}
                                    </td>
                                  </tr>
                                </tfoot>
                              ) : null}
                            </table>
                          </div>
                        </section>
                      </div>
                    )}

                    {!canUseCompletedOnly ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-right text-[12px] font-semibold text-amber-900">
                        این گزارشات برای قراردادهای «تکمیل شده» قابل اتکا و کامل است. در حالت‌های دیگر، برخی بخش‌ها به‌مرور فعال می‌شوند.
                      </div>
                    ) : null}
                  </div>

                  {selectedReportGroup && selectedGroupDueMeta.dues.length > 0 ? (
                    <section
                      className="order-3 min-w-0 w-full rounded-[22px] border border-slate-200/80 bg-white/90 p-4 text-right shadow-sm md:p-6 lg:p-8 xl:col-span-2"
                      aria-label="سررسیدها به تفکیک ماه"
                    >
                      <h3 className="text-[13px] font-black text-slate-800">سررسیدها به‌تفکیک ماه</h3>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        فقط سررسیدهای مرتبط با «{selectedReportGroup.title}». این بخش از تفکیک زیربخش جدا است و به‌عرض کامل همین
                        شبکه نشان داده می‌شود؛ پیش‌فرض باز است.
                      </p>
                      {summaryDetailMonthBuckets.length === 0 ? (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] font-semibold text-amber-900">
                          سررسید ثبت‌شده تشخیص داده نشد؛ اگر تاریخ سررسید خارج از فرمت معمول ذخیره شده، در بخش تاریخچه پرداخت بررسی
                          کنید.
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <DueMonthAccordionList
                            buckets={summaryDetailMonthBuckets}
                            collapsedMonths={collapsedSummaryDueMonths}
                            toggleMonth={toggleSummaryDueMonth}
                          />
                        </div>
                      )}
                    </section>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </PanelLayout>
  );
}

