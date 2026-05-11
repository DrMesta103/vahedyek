'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, FileText, ReceiptText, Upload } from 'lucide-react';
import { useParams } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { getContractDetails } from '../../../../lib/contractDraftClient';
import { computeContractTotalRialFromFinancial } from '../../../../lib/contractFinancialPricing';
import {
  isFinancialLineHeaderCategoryId,
  isFinancialLineSubtreeCategoryId,
  parseDueDateFlexible,
  toComparableDateFromDueString,
} from '../../../../lib/financialUtils';

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

function formatMoneyTomanFromRial(valueRial: number) {
  if (!valueRial) return '—';
  const toman = Math.round(valueRial / 10);
  return `${toman.toLocaleString('fa-IR')} تومان`;
}

function formatMoneyRial(valueRial: number) {
  if (!valueRial) return '۰ ریال';
  return `${Math.round(valueRial).toLocaleString('fa-IR')} ریال`;
}

const JALALI_MONTH_NAMES_FA = [
  '',
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

function jalaliYearMonthHeading(year: number, month: number) {
  const name = JALALI_MONTH_NAMES_FA[month] ?? '—';
  /** سال را بدون گروه‌بندی هزار تا چهار رقم پیوسته (مثل ۱۴۰۵) نمایش بدهیم */
  return `${name} ${year.toLocaleString('fa-IR', { useGrouping: false })}`;
}

const PAYMENT_HISTORY_UNKNOWN_MONTH_KEY = '__UNKNOWN_DUE_MONTH__';

function paymentHistoryUnknownMonthHeading() {
  return 'بدون تاریخ سررسید قابل دسته‌بندی';
}

type PaymentHistoryDueRow = {
  id: string;
  categoryId: string;
  categoryTitle: string;
  title: string;
  amount: number;
  dueDate: string;
  isOverdueUnpaid: boolean;
};

type PaymentHistoryMonthBucket = {
  key: string;
  sortKey: number;
  jalaliYear: number;
  jalaliMonth: number;
  heading: string;
  items: PaymentHistoryDueRow[];
  totalRial: number;
  overdueRial: number;
  penaltyEstimateRial: number;
};

function buildPaymentHistoryMonthBuckets(params: {
  dueItems: any[];
  categoryById: Map<string, string>;
  contractTotalRial: number;
  penaltyPoolRial: number;
}): PaymentHistoryMonthBucket[] {
  const { dueItems, categoryById, contractTotalRial, penaltyPoolRial } = params;
  type Acc = {
    jalaliYear: number;
    jalaliMonth: number;
    sortKey: number;
    items: PaymentHistoryDueRow[];
    totalRial: number;
    overdueRial: number;
  };

  const byKey = new Map<string, Acc>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const raw of dueItems) {
    if (!raw || typeof raw !== 'object') continue;

    const amountNum = Number((raw as any).amount ?? 0);
    const amount = Number.isFinite(amountNum) ? Math.round(amountNum) : 0;

    const dueDateRaw = String((raw as any).dueDate ?? '').trim();
    const parsedYm = dueDateRaw ? parseDueDateFlexible(dueDateRaw) : null;

    const key = parsedYm
      ? `${parsedYm.year}-${String(parsedYm.month).padStart(2, '0')}`
      : PAYMENT_HISTORY_UNKNOWN_MONTH_KEY;

    const dueEnd = dueDateRaw ? toComparableDateFromDueString(dueDateRaw) : null;
    const isOverdue = Boolean(dueEnd && dueEnd < today);

    let acc = byKey.get(key);
    if (!acc) {
      acc = parsedYm
        ? {
            jalaliYear: parsedYm.year,
            jalaliMonth: parsedYm.month,
            sortKey: parsedYm.year * 100 + parsedYm.month,
            items: [],
            totalRial: 0,
            overdueRial: 0,
          }
        : {
            jalaliYear: 0,
            jalaliMonth: 0,
            sortKey: 9_999_999,
            items: [],
            totalRial: 0,
            overdueRial: 0,
          };
      byKey.set(key, acc);
    }

    acc.totalRial += amount;
    if (isOverdue) acc.overdueRial += Math.max(amount, 0);

    acc.items.push({
      id: String((raw as any).id ?? ''),
      categoryId: String((raw as any).categoryId ?? ''),
      categoryTitle: categoryById.get(String((raw as any).categoryId ?? '')) ?? String((raw as any).categoryId ?? '—'),
      title: String((raw as any).title ?? '').trim() || '—',
      amount,
      dueDate: dueDateRaw || '—',
      isOverdueUnpaid: isOverdue,
    });
  }

  const sorted = [...byKey.entries()].sort((a, b) => {
    if (a[0] === PAYMENT_HISTORY_UNKNOWN_MONTH_KEY) return 1;
    if (b[0] === PAYMENT_HISTORY_UNKNOWN_MONTH_KEY) return -1;
    return a[1].sortKey - b[1].sortKey;
  });

  return sorted.map(([key, acc]) => {
    const penaltyEstimateRial =
      contractTotalRial > 0 && penaltyPoolRial > 0
        ? Math.round((penaltyPoolRial * acc.totalRial) / contractTotalRial)
        : 0;

    acc.items.sort((a, b) => {
      const da = toComparableDateFromDueString(a.dueDate)?.getTime() ?? 9e12;
      const db = toComparableDateFromDueString(b.dueDate)?.getTime() ?? 9e12;
      return da - db;
    });

    return {
      key,
      sortKey: acc.sortKey,
      jalaliYear: acc.jalaliYear,
      jalaliMonth: acc.jalaliMonth,
      heading:
        key === PAYMENT_HISTORY_UNKNOWN_MONTH_KEY
          ? paymentHistoryUnknownMonthHeading()
          : jalaliYearMonthHeading(acc.jalaliYear, acc.jalaliMonth),
      items: acc.items,
      totalRial: acc.totalRial,
      overdueRial: acc.overdueRial,
      penaltyEstimateRial,
    };
  });
}

function DueMonthAccordionList({
  buckets,
  collapsedMonths,
  toggleMonth,
}: {
  buckets: PaymentHistoryMonthBucket[];
  collapsedMonths: Set<string>;
  toggleMonth: (monthKey: string) => void;
}) {
  return (
    <>
      {buckets.map((bucket) => {
        const isOpen = !collapsedMonths.has(bucket.key);
        const debtRial = bucket.totalRial;
        const showPenalty = bucket.penaltyEstimateRial > 0;
        return (
          <div
            key={bucket.key}
            className="overflow-hidden rounded-[18px] border border-slate-200/90 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.12)]"
          >
            <button
              type="button"
              onClick={() => toggleMonth(bucket.key)}
              aria-expanded={isOpen}
              className="flex w-full items-start gap-3 px-4 py-3.5 text-right transition hover:bg-slate-50/80 sm:items-center sm:px-5 sm:py-4"
            >
              <div className="order-1 flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex shrink-0 items-center gap-2">
                  <CalendarDays
                    className="h-5 w-5 shrink-0 text-[color-mix(in_srgb,var(--dark-teal)_85%,black)]"
                    aria-hidden
                  />
                  <span className="text-[14px] font-black text-slate-900 sm:text-[15px]">{bucket.heading}</span>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-bold text-slate-600 sm:gap-x-4 sm:text-[12px]">
                  <span>
                    مبلغ کل: <span className="font-black text-slate-900">{formatMoneyRial(bucket.totalRial)}</span>
                  </span>
                  <span>
                    بدهی: <span className="font-black text-slate-900">{formatMoneyRial(debtRial)}</span>
                  </span>
                  <span>
                    جریمه:{' '}
                    <span className="font-black text-slate-900">
                      {showPenalty ? formatMoneyRial(bucket.penaltyEstimateRial) : '—'}
                    </span>
                  </span>
                  <span>
                    بدهی معوق:{' '}
                    <span className={`font-black ${bucket.overdueRial > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {bucket.overdueRial > 0 ? formatMoneyRial(bucket.overdueRial) : '—'}
                    </span>
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`order-2 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden
              />
            </button>

            {isOpen ? (
              <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-4 sm:px-5">
                <div className="text-[11px] font-black uppercase tracking-wide text-slate-500">فیش‌ها و سررسید</div>
                <div className="mt-3 space-y-2.5">
                  {bucket.items.map((row, rowIdx) => (
                    <div
                      key={row.id.trim() ? row.id : `${bucket.key}-${rowIdx}-${row.dueDate}`}
                      className="rounded-2xl border border-slate-200/90 bg-white px-3.5 py-3 shadow-sm sm:px-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-black text-slate-900">{row.title}</div>
                          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-500">
                            <span>{row.categoryTitle}</span>
                            <span className="text-slate-300">·</span>
                            <span>سررسید: {row.dueDate}</span>
                            {row.isOverdueUnpaid ? (
                              <>
                                <span className="text-slate-300">·</span>
                                <span className="font-bold text-rose-600">سررسید گذشته</span>
                              </>
                            ) : null}
                          </div>
                          <div className="mt-2 text-[11px] font-semibold text-slate-500">
                            فیش واریزی ثبت‌شده: <span className="font-bold text-slate-400">—</span>{' '}
                            <span className="font-normal text-slate-400">(اتصال به ماژول پرداخت)</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-left sm:text-right">
                          <div className="text-[10px] font-bold text-slate-500">مبلغ سررسید</div>
                          <div className="mt-0.5 text-[14px] font-black tabular-nums text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]">
                            {formatMoneyRial(row.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

const TOOLTIP_LINE_BASE =
  'مبلغ این ردیف بر اساس سقف زیربخش‌ها؛ بدون لحاظ جریمه‌ها و تخفیف قرارداد.';

/** تخمین ناخالص جریمه از روی قرارداد (قوانین فعال؛ تقسیط واقعی هر ردیف در سیستم پرداخت بعداً ثبت می‌شود). */
function estimateContractPenaltiesTotalRial(contractTotal: number, penalties: any): number {
  if (!(contractTotal > 0) || !penalties?.rules?.length) return 0;
  const activeTypes = new Set(
    (Array.isArray(penalties.types) ? penalties.types : [])
      .filter((t: any) => Boolean(t.active))
      .map((t: any) => String(t.id)),
  );

  let sum = 0;
  for (const rule of penalties.rules) {
    const typeId = String(rule.penaltyTypeId ?? '');
    if (activeTypes.size && typeId && !activeTypes.has(typeId)) continue;
    const pct = Number(rule.penaltyPercent ?? 0);
    const fixed = Number(String(rule.fixedAmount ?? '').replace(/,/g, '') || 0);
    const bankPct = Number(rule.bankInterestPercent ?? 0);

    if (pct > 0) sum += Math.round((contractTotal * pct) / 100);
    if (bankPct > 0) sum += Math.round((contractTotal * bankPct) / 100);
    if (fixed > 0) sum += fixed;
  }

  return Math.max(0, sum);
}

function reportGroupLineBaseRial(group: FinancialReportGroup): number {
  const subSum = group.subRows.reduce((s, r) => s + Math.max(0, r.capRial), 0);
  return subSum > 0 ? subSum : Math.max(0, group.umbrellaCapRial);
}

type SummaryFinancialRowMetrics = {
  id: string;
  title: string;
  lineBaseRial: number;
  penaltyTotalRial: number;
  penaltyPaidRial: number;
  paidTotalRial: number;
};

function buildSummaryFinancialRows(
  groups: FinancialReportGroup[],
  contractTotalForPenaltyEstimate: number,
  penalties: any,
  globalPaidPlaceholder: number,
): SummaryFinancialRowMetrics[] {
  const penaltyPool = estimateContractPenaltiesTotalRial(contractTotalForPenaltyEstimate, penalties);

  const bases = groups.map((g) => ({
    id: g.id,
    title: g.title,
    lineBaseRial: reportGroupLineBaseRial(g),
  }));

  const totalBase = bases.reduce((s, b) => s + b.lineBaseRial, 0);

  const rows = bases.map((b) => {
    const penaltyTotalRial =
      totalBase > 0 ? Math.round((penaltyPool * b.lineBaseRial) / totalBase) : 0;
    const paidShare =
      totalBase > 0 && globalPaidPlaceholder > 0
        ? Math.round((globalPaidPlaceholder * b.lineBaseRial) / totalBase)
        : 0;
    return {
      id: b.id,
      title: b.title,
      lineBaseRial: b.lineBaseRial,
      penaltyTotalRial,
      penaltyPaidRial: 0,
      paidTotalRial: paidShare,
    };
  });

  if (rows.length && penaltyPool > 0) {
    const alloc = rows.reduce((s, r) => s + r.penaltyTotalRial, 0);
    const drift = penaltyPool - alloc;
    if (drift !== 0) rows[rows.length - 1].penaltyTotalRial += drift;
  }

  if (rows.length && globalPaidPlaceholder > 0) {
    const paidAlloc = rows.reduce((s, r) => s + r.paidTotalRial, 0);
    const driftP = globalPaidPlaceholder - paidAlloc;
    if (driftP !== 0) rows[rows.length - 1].paidTotalRial += driftP;
  }

  return rows;
}

type SubgroupDetailRow = {
  id: string;
  label: string;
  lineBaseRial: number;
  penaltyTotalRial: number;
  penaltyPaidRial: number;
  paidTotalRial: number;
};

/** تقسیم جریمه و پرداخت سطح گروه بین زیربخش‌ها به‌نسبت سقف هر زیربخش */
function buildSubgroupDetailRows(
  group: FinancialReportGroup,
  groupMetrics: SummaryFinancialRowMetrics | undefined,
): SubgroupDetailRow[] {
  const penaltyPool = groupMetrics?.penaltyTotalRial ?? 0;
  const penaltyPaidPool = groupMetrics?.penaltyPaidRial ?? 0;
  const paidPool = groupMetrics?.paidTotalRial ?? 0;

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

  const fixDrift = (key: keyof Pick<SubgroupDetailRow, 'penaltyTotalRial' | 'penaltyPaidRial' | 'paidTotalRial'>, pool: number) => {
    if (!rows.length || pool <= 0) return;
    const alloc = rows.reduce((s, r) => s + r[key], 0);
    const drift = pool - alloc;
    if (drift !== 0) rows[rows.length - 1][key] += drift;
  };

  fixDrift('penaltyTotalRial', penaltyPool);
  fixDrift('penaltyPaidRial', penaltyPaidPool);
  fixDrift('paidTotalRial', paidPool);

  return rows;
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

    const amountRial = computeContractTotalRialFromFinancial(financial);

    return {
      contractNumber: subject?.contractNumber ?? '—',
      contractDate: subject?.contractDate ?? '—',
      unitName: subject?.unitName ?? '—',
      unitMeta: formatSubjectUnitLocation(subject),
      buyerName: buyer?.name ?? '—',
      amountLabel: formatMoneyTomanFromRial(amountRial),
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
    const paid = 0; // اتصال به فیش‌ها/پرداخت‌ها مرحله بعد
    const principal = financialCategories.find((c: any) => c.id === 'principal');
    const rows = financialCategories.filter((c: any) => c.id !== 'principal');
    const rowsTotal = rows.reduce((sum: number, c: any) => sum + Number(c.capAmount || 0), 0);
    const contractTotal = principal ? Number(principal.capAmount || 0) : view.amountRial;
    return { paid, rowsTotal, contractTotal };
  }, [financialCategories, view.amountRial]);

  const reportGroups = useMemo(() => buildFinancialReportGroups(financialCategories), [financialCategories]);

  const penaltiesData = contract?.data?.penalties ?? null;
  const summaryFinancialRows = useMemo(
    () =>
      buildSummaryFinancialRows(
        reportGroups,
        totals.contractTotal > 0 ? totals.contractTotal : view.amountRial,
        penaltiesData,
        totals.paid,
      ),
    [reportGroups, totals.contractTotal, totals.paid, view.amountRial, penaltiesData],
  );

  const summaryFooter = useMemo(() => {
    if (!summaryFinancialRows.length) return null;
    return {
      lineBase: summaryFinancialRows.reduce((s, r) => s + r.lineBaseRial, 0),
      penaltyTotal: summaryFinancialRows.reduce((s, r) => s + r.penaltyTotalRial, 0),
      penaltyPaid: summaryFinancialRows.reduce((s, r) => s + r.penaltyPaidRial, 0),
      paidTotal: summaryFinancialRows.reduce((s, r) => s + r.paidTotalRial, 0),
    };
  }, [summaryFinancialRows]);

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
      penaltyTotal: subgroupDetailRows.reduce((s, r) => s + r.penaltyTotalRial, 0),
      penaltyPaid: subgroupDetailRows.reduce((s, r) => s + r.penaltyPaidRial, 0),
      paidTotal: subgroupDetailRows.reduce((s, r) => s + r.paidTotalRial, 0),
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

  const contractTotalForPenalty = totals.contractTotal > 0 ? totals.contractTotal : Math.max(Math.round(view.amountRial), 0);
  const penaltyPoolForPaymentHistory = estimateContractPenaltiesTotalRial(contractTotalForPenalty, penaltiesData);

  const paymentMonthBuckets = useMemo(
    () =>
      buildPaymentHistoryMonthBuckets({
        dueItems: financialDueItems,
        categoryById: categoryTitleById,
        contractTotalRial: Math.max(contractTotalForPenalty, 1),
        penaltyPoolRial: penaltyPoolForPaymentHistory,
      }),
    [financialDueItems, categoryTitleById, contractTotalForPenalty, penaltyPoolForPaymentHistory],
  );

  /** سررسیدهای همان گروه مالی انتخاب‌شده در خلاصه (برای ستون جزئیات) */
  const summaryDetailMonthBuckets = useMemo(
    () =>
      buildPaymentHistoryMonthBuckets({
        dueItems: selectedGroupDueMeta.dues,
        categoryById: categoryTitleById,
        contractTotalRial: Math.max(contractTotalForPenalty, 1),
        penaltyPoolRial: penaltyPoolForPaymentHistory,
      }),
    [selectedGroupDueMeta.dues, categoryTitleById, contractTotalForPenalty, penaltyPoolForPaymentHistory],
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
              {/* ردیف اول: ستون راست (RTL) خریدار و قرارداد */}
              <div className="grid gap-4 text-right lg:grid-cols-2 lg:gap-6">
                <section className="rounded-[18px] border border-slate-200/80 bg-white/90 px-5 py-4 shadow-sm lg:py-5">
                  <div className="text-[11px] font-black uppercase tracking-wide text-[color-mix(in_srgb,var(--dark-teal)_70%,black)]">
                    خریدار و قرارداد
                  </div>
                  <div className="mt-3 flex flex-col gap-3 text-[13px] font-black text-slate-800">
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <i className="fa-regular fa-user" aria-hidden />
                      </span>
                      <span>خریدار: {view.buyerName}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[13px]">
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      شماره قرارداد: {view.contractNumber}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[13px]">
                      <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      تاریخ قرارداد: {view.contractDate}
                    </div>
                  </div>
                </section>
                <section className="rounded-[18px] border border-slate-200/80 bg-white/90 px-5 py-4 text-center shadow-sm lg:py-5 lg:text-right">
                  <div className="inline-block text-[12px] font-bold text-amber-700 lg:block">{view.contractTypeLabel}</div>
                  <div className="mt-3 text-[11px] font-bold tracking-wide text-slate-500">موقعیت واحد</div>
                  <div className="mt-1 text-[14px] font-black leading-7 text-slate-900">{view.unitMeta}</div>
                  <div className="mt-3 text-[12px] font-semibold text-slate-600">
                    مبلغ در قرارداد: <span className="font-black text-slate-800">{view.amountLabel}</span>
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

              <div className="mt-4 flex justify-center px-3" dir="rtl">
                <div className="flex w-full max-w-2xl flex-wrap items-center justify-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    title="اتصال به فرم ثبت فیش — به‌زودی"
                    className="inline-flex min-h-[44px] flex-1 basis-[min(100%,280px)] items-center justify-center gap-2 rounded-full border-2 border-[color-mix(in_srgb,var(--dark-teal)_45%,transparent)] bg-white px-5 py-2.5 text-[13px] font-black leading-snug text-[color-mix(in_srgb,var(--dark-teal)_88%,black)] shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] focus-visible:ring-offset-2 sm:flex-none sm:basis-auto"
                  >
                    ثبت فیش های واریزی
                    <ReceiptText className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
                  </button>
                  <button
                    type="button"
                    title="بارگذاری فایل برای استخراج فیش‌ها — به‌زودی"
                    className="inline-flex min-h-[44px] flex-1 basis-[min(100%,280px)] items-center justify-center gap-2 rounded-full border-2 border-[color-mix(in_srgb,var(--dark-teal)_45%,transparent)] bg-white px-5 py-2.5 text-[13px] font-black leading-snug text-[color-mix(in_srgb,var(--dark-teal)_88%,black)] shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] focus-visible:ring-offset-2 sm:flex-none sm:basis-auto"
                  >
                    استخراج فیش پرداختی از فایل
                    <Upload className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
                  </button>
                </div>
              </div>

              {tab === 'payments' ? (
                <section className="mt-6 rounded-[22px] border border-slate-200/80 bg-white/90 p-5 text-right shadow-sm md:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="text-[15px] font-black text-slate-900">تاریخچه پرداخت</div>
                      <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500">
                        به‌ترتیب تاریخ، بر اساس ماه سررسید. فقرات زیر هر ماه شامل سررسیدهای ثبت‌شده است؛ فیش واقعی با اتصال ماژول
                        پرداخت نمایش داده می‌شود.
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
                        روی هر ردیف کلیک کنید تا همان بخش در «جزئیات مالی» باز شود. جریمه تخمینی است؛ پرداخت با اتصال فیش
                        تکمیل می‌شود.
                      </p>

                      {summaryFinancialRows.length === 0 ? (
                        <p className="mt-4 text-[12px] font-semibold text-slate-500">ردیف مالی برای نمایش وجود ندارد.</p>
                      ) : (
                        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200/90">
                          <table className="w-full min-w-[340px] border-collapse text-[10px] sm:min-w-[380px] sm:text-[11px]" dir="rtl">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-500">
                                <th className="min-w-[7rem] px-2 py-2 text-right font-bold">عنوان ردیف</th>
                                <th className="px-1 py-2 text-center font-bold" title={TOOLTIP_LINE_BASE}>
                                  مبلغ کل
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
                                    <td
                                      className="px-1 py-2 text-center tabular-nums font-black text-slate-900 align-middle underline decoration-dotted decoration-slate-300 underline-offset-2"
                                      title={TOOLTIP_LINE_BASE}
                                    >
                                      {formatMoneyRial(row.lineBaseRial)}
                                    </td>
                                    <td className="px-1 py-2 text-center tabular-nums font-bold text-slate-800 align-middle">
                                      {formatMoneyRial(row.penaltyTotalRial)}
                                    </td>
                                    <td className="px-1 py-2 text-center tabular-nums font-bold text-slate-800 align-middle">
                                      {formatMoneyRial(row.penaltyPaidRial)}
                                    </td>
                                    <td className="px-1 py-2 text-center tabular-nums font-bold text-emerald-900 align-middle">
                                      {formatMoneyRial(row.paidTotalRial)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            {summaryFooter ? (
                              <tfoot>
                                <tr className="border-t-2 border-dashed border-slate-300 bg-slate-50/80">
                                  <td className="px-2 py-2 font-black text-slate-900">جمع کل</td>
                                  <td className="px-1 py-2 text-center tabular-nums font-black text-slate-900" title={TOOLTIP_LINE_BASE}>
                                    {formatMoneyRial(summaryFooter.lineBase)}
                                  </td>
                                  <td className="px-1 py-2 text-center tabular-nums font-black text-slate-900">
                                    {formatMoneyRial(summaryFooter.penaltyTotal)}
                                  </td>
                                  <td className="px-1 py-2 text-center tabular-nums font-black text-slate-900">
                                    {formatMoneyRial(summaryFooter.penaltyPaid)}
                                  </td>
                                  <td className="px-1 py-2 text-center tabular-nums font-black text-emerald-950">
                                    {formatMoneyRial(summaryFooter.paidTotal)}
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
                          <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200/90 bg-[linear-gradient(135deg,rgba(14,152,157,0.06),rgba(15,23,42,0.02))] px-4 py-4 md:px-5">
                            <div>
                              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">ردیف انتخاب‌شده</div>
                              <div className="mt-1 text-[18px] font-black text-slate-900">{selectedReportGroup.title}</div>
                            </div>
                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-600">
                              <span>
                                سقف چتری:{' '}
                                <span className="font-black text-slate-900">{formatMoneyRial(selectedReportGroup.umbrellaCapRial)}</span>
                              </span>
                              <span aria-hidden className="hidden text-slate-300 sm:inline">
                                |
                              </span>
                              <span>
                                سررسیدها:{' '}
                                <span className="font-black text-slate-900">{selectedGroupDueMeta.dues.length}</span> مورد ، جمع{' '}
                                <span className="font-black text-[color-mix(in_srgb,var(--dark-teal)_85%,black)]">
                                  {formatMoneyRial(selectedGroupDueMeta.sum)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </section>

                        <section className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 text-right shadow-sm md:p-6 lg:p-8">
                          <h3 className="text-[13px] font-black text-slate-800">خلاصه مالی</h3>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">
                            جمع و جریمهٔ تخمینی همان ردیف انتخاب‌شده مطابق جدول «خلاصه گزارشات».
                          </p>
                          {selectedGroupSummary ? (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 px-3 py-3">
                                <div className="text-[10px] font-bold text-slate-500" title={TOOLTIP_LINE_BASE}>
                                  مبلغ کل (سقف ردیف)
                                </div>
                                <div className="mt-1 text-[14px] font-black tabular-nums text-slate-900">
                                  {formatMoneyRial(selectedGroupSummary.lineBaseRial)}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 px-3 py-3">
                                <div className="text-[10px] font-bold text-slate-500">مبلغ کل جریمه (تخمین)</div>
                                <div className="mt-1 text-[14px] font-black tabular-nums text-slate-900">
                                  {formatMoneyRial(selectedGroupSummary.penaltyTotalRial)}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 px-3 py-3">
                                <div className="text-[10px] font-bold text-slate-500">جریمه پرداخت‌شده</div>
                                <div className="mt-1 text-[14px] font-black tabular-nums text-slate-800">
                                  {formatMoneyRial(selectedGroupSummary.penaltyPaidRial)}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 px-3 py-3">
                                <div className="text-[10px] font-bold text-slate-500">پرداخت‌شده</div>
                                <div className="mt-1 text-[14px] font-black tabular-nums text-emerald-900">
                                  {formatMoneyRial(selectedGroupSummary.paidTotalRial)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-3 text-[12px] font-semibold text-slate-500">داده‌ای برای این ردیف در خلاصه نیست.</p>
                          )}
                        </section>

                        <section className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 text-right shadow-sm md:p-6 lg:p-8">
                          <h3 className="text-[13px] font-black text-slate-800">تفکیک زیربخش‌ها</h3>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">
                            جریمه هر زیربخش از سهم تخمینی همان ردیف در خلاصه، به‌نسبت سقف زیربخش تقسیم شده است.
                          </p>
                          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                            <table className="w-full min-w-[640px] border-collapse text-[11px] md:min-w-[720px] md:text-[12px]" dir="rtl">
                              <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                  <th className="min-w-[8rem] px-3 py-3 text-right font-black">عنوان</th>
                                  <th className="px-2 py-3 text-center font-black" title={TOOLTIP_LINE_BASE}>
                                    مبلغ کل
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
                                      {formatMoneyRial(row.penaltyTotalRial)}
                                    </td>
                                    <td className="px-2 py-2.5 text-center tabular-nums font-bold text-slate-700">
                                      {formatMoneyRial(row.penaltyPaidRial)}
                                    </td>
                                    <td className="px-2 py-2.5 text-center tabular-nums font-bold text-emerald-900">
                                      {formatMoneyRial(row.paidTotalRial)}
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
                                      {formatMoneyRial(subgroupDetailFooter.penaltyTotal)}
                                    </td>
                                    <td className="px-2 py-3 text-center tabular-nums font-black text-slate-900">
                                      {formatMoneyRial(subgroupDetailFooter.penaltyPaid)}
                                    </td>
                                    <td className="px-2 py-3 text-center tabular-nums font-black text-emerald-950">
                                      {formatMoneyRial(subgroupDetailFooter.paidTotal)}
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

