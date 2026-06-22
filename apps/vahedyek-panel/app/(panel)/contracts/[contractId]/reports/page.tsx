'use client';

import {
  type CSSProperties,
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
import { FileText, Layers, Wallet, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useAuthContext } from '../../../../hooks/useAuthContext';
import PanelLayout from '../../../../components/PanelLayout';
import { DueMonthAccordionList, type DueRegisterReceiptPayload } from '../../../../components/contracts/DueMonthAccordionList';
import ContractFinancialCharts from '../../../../components/contracts/financial-report/ContractFinancialCharts';
import { HistoryTimelineView } from '../../../../components/contracts/history/HistoryTimelineView';
import { FieldHint } from '../../../../components/ui/field-hint';
import { getContractDetails, getContractHistory } from '../../../../lib/contractDraftClient';
import { buildApprovedReceiptTrend, buildInstallmentStatusItems } from '../../../../lib/contractFinancialChartUtils';
import {
  buildReceiptAllocation,
  type ContractReceiptAllocationResult,
  type DueReceiptAllocationSummary,
} from '../../../../lib/contractReceiptAllocation';
import { computeContractTotalRialFromFinancial } from '../../../../lib/contractFinancialPricing';
import { getReceiptsStorageKey, normalizeReceiptRecords, type RegisteredReceiptRecord } from '../../../../lib/contractReceipts';
import { buildPaymentHistoryMonthBucketsFromRows } from '../../../../lib/contractPaymentMonthBuckets';
import { buildContractPenaltyTimeline } from '../../../../lib/contractPenaltyEngine';
import type { ContractHistoryResponse } from '../../../../lib/contractHistory';
import {
  isFinancialLineHeaderCategoryId,
  isFinancialLineSubtreeCategoryId,
  toComparableDateFromDueString,
} from '../../../../lib/financialUtils';

type ReceiptDetailsState = {
  payload: DueRegisterReceiptPayload;
  receipts: RegisteredReceiptRecord[];
  summary?: DueReceiptAllocationSummary;
} | null;

const SUMMARY_TOTAL_GROUP_ID = '__summary-total__';

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

function formatMoneyRialOrUnknown(valueRial: number | null | undefined) {
  if (valueRial == null) return 'نامشخص';
  return formatMoneyRial(valueRial);
}

const TOOLTIP_LINE_BASE =
  'مبلغ این ردیف بر اساس سقف زیربخش‌ها؛ بدون لحاظ جریمه‌ها و تخفیف قرارداد.';

const TT_LEDGER_PAID_TOTAL =
  'جمع پرداخت اصل بر اساس فیش‌های ثبت‌شده و تخصیص به سررسیدها، به‌علاوهٔ پرداخت جریمه در صورت وجود در داده دریافتی است؛ اگر جریمهٔ پرداختی ثبت نشده باشد، همان پرداخت اصل در مجموع لحاظ می‌شود.';

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

function buildDashboardLinePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  const segments = [`M ${points[0].x} ${points[0].y}`];
  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const curr = points[index];
    segments.push(`Q ${prev.x} ${prev.y} ${curr.x} ${curr.y}`);
  }
  return segments.join(' ');
}

type SummaryFinancialRowMetrics = {
  id: string;
  title: string;
  lineBaseRial: number;
  /** جریمه از API؛ پرداخت از تخصیص فیش‌های ثبت‌شده روی سررسیدها */
  penaltyTotalRial: number | null;
  penaltyPaidRial: number | null;
  paidTotalRial: number | null;
};

type PenaltyReportRow = {
  id: string;
  causeLabel: string;
  relatedDueLabel: string;
  startDelayDateLabel: string;
  startDelayDateValue: string | null;
  delayDays: number | null;
  delayDaysLabel: string;
  amountRial: number;
  amountLabel: string;
  statusLabel: string;
  statusTone: 'emerald' | 'amber' | 'rose' | 'slate';
  paidRial: number;
  paidLabel: string;
  forgivenRial: number | null;
  forgivenLabel: string;
  claimableRial: number;
  remainingRial: number;
  remainingLabel: string;
};

type ContractRuleSnapshotSource = 'contract' | 'business-default' | 'default';

type ContractRuleSnapshot = {
  source: ContractRuleSnapshotSource;
  updatedAt: string | null;
  state: {
    active: boolean;
    activeTab: string;
    values: Record<string, string | boolean>;
  };
};

type ContractRuleSummaryCard = {
  id: string;
  title: string;
  tone: 'emerald' | 'amber' | 'slate';
  isActive: boolean;
  statusLabel: string;
  sourceLabel: string;
  updatedAtLabel: string;
  details: Array<{ label: string; value: string }>;
  note: string;
};

type DueStatusFilter = 'all' | 'overdue' | 'future' | 'paid' | 'partial';
type ReceiptStatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type PenaltyStatusFilter = 'all' | 'open' | 'paid' | 'forgiven';
type SortMode = 'due-asc' | 'due-desc' | 'amount-asc' | 'amount-desc';

function toNumberOrZero(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function compareByAmount(a: number, b: number, mode: SortMode) {
  const diff = a - b;
  return mode === 'amount-desc' ? -diff : diff;
}

function buildPaidByCategoryIdFromAllocation(
  allocation: ContractReceiptAllocationResult,
  sourceKind: 'principal' | 'penalty',
): Map<string, number> {
  const m = new Map<string, number>();
  for (const ds of allocation.dueSummaries) {
    if ((ds.row.sourceKind ?? 'principal') !== sourceKind) continue;
    const cid = String(ds.row.categoryId ?? '').trim();
    if (!cid) continue;
    const normalizedCid = normalizeSummaryCategoryKey(cid);
    m.set(normalizedCid, (m.get(normalizedCid) ?? 0) + ds.paidAmountRial);
    m.set(cid, (m.get(cid) ?? 0) + ds.paidAmountRial);
  }
  return m;
}

function normalizeSummaryCategoryKey(categoryId: string) {
  const trimmed = String(categoryId ?? '').trim();
  const suffix = trimmed.includes(':') ? trimmed.slice(trimmed.lastIndexOf(':') + 1) : trimmed;
  if (suffix.startsWith('advance')) return 'advance';
  if (suffix.startsWith('installment')) return 'installment';
  if (suffix.startsWith('loan')) return 'loan';
  if (suffix.startsWith('handover')) return 'handover';
  if (suffix.startsWith('document')) return 'document';
  return suffix;
}

function computePaidTotalForGroup(group: FinancialReportGroup, paidByCategoryId: Map<string, number>): number {
  let sum = 0;
  for (const cid of group.dueCategoryIds) {
    sum += paidByCategoryId.get(String(cid)) ?? 0;
  }
  return Math.round(sum);
}

function buildSummaryFinancialRows(
  groups: FinancialReportGroup[],
  paidPrincipalByCategoryId: Map<string, number>,
  penaltyTotalByCategoryId: Map<string, number>,
  penaltyPaidByCategoryId: Map<string, number>,
): SummaryFinancialRowMetrics[] {
  return groups.map((g) => ({
    id: g.id,
    title: g.title,
    lineBaseRial: reportGroupLineBaseRial(g),
    penaltyTotalRial: computePaidTotalForGroup(g, penaltyTotalByCategoryId),
    penaltyPaidRial: computePaidTotalForGroup(g, penaltyPaidByCategoryId),
    paidTotalRial: computePaidTotalForGroup(g, paidPrincipalByCategoryId),
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

function buildSubgroupDetailRows(group: FinancialReportGroup, summaryByCategoryId: Map<string, SummaryFinancialRowMetrics>): SubgroupDetailRow[] {
  if (!group.subRows.length) {
    const base = reportGroupLineBaseRial(group);
    const metrics = summaryByCategoryId.get(group.dueCategoryIds[0] ?? group.id);
    return [
      {
        id: `${group.id}-aggregate`,
        label: group.title,
        lineBaseRial: base,
        penaltyTotalRial: metrics?.penaltyTotalRial ?? null,
        penaltyPaidRial: metrics?.penaltyPaidRial ?? null,
        paidTotalRial: metrics?.paidTotalRial ?? null,
      },
    ];
  }

  return group.subRows.map((s) => {
    const metrics = summaryByCategoryId.get(s.id);
    return {
      id: s.id,
      label: s.label,
      lineBaseRial: Math.max(0, s.capRial),
      penaltyTotalRial: metrics?.penaltyTotalRial ?? null,
      penaltyPaidRial: metrics?.penaltyPaidRial ?? null,
      paidTotalRial: metrics?.paidTotalRial ?? null,
    };
  });
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

function formatDateFa(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fa-IR');
}

function countDelayDays(fromDate: Date | null, toDate: Date) {
  if (!fromDate) return null;
  const start = new Date(fromDate);
  const end = new Date(toDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - start.getTime();
  if (diff < 0) return null;
  return Math.floor(diff / 86_400_000) + 1;
}

function formatRuleSourceLabel(source: ContractRuleSnapshotSource) {
  if (source === 'contract') return 'ذخیره‌شده روی همین قرارداد';
  if (source === 'business-default') return 'برداشته‌شده از تنظیمات کسب‌وکار';
  return 'مقدار پیش‌فرض سیستم';
}

function formatRuleSourceNote(source: ContractRuleSnapshotSource) {
  if (source === 'contract') return 'این مقدار از داده ذخیره‌شده همین قرارداد خوانده شده است.';
  if (source === 'business-default') return 'برای این قرارداد تنظیم اختصاصی پیدا نشد و نمایش از تنظیمات کسب‌وکار پر شده است.';
  return 'هیچ تنظیم ذخیره‌شده‌ای پیدا نشد و مقدار پیش‌فرض سیستم نمایش داده می‌شود.';
}

function formatRuleBoolean(value: string | boolean | undefined) {
  return value ? 'بله' : 'خیر';
}

function formatRuleText(value: string | boolean | undefined, fallback = 'ثبت نشده') {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim();
  return normalized ? normalized : fallback;
}

function formatRuleAmount(value: string | boolean | undefined, suffix: 'ریال' | '٪') {
  const normalized = formatRuleText(value, '');
  return normalized ? `${normalized} ${suffix}` : 'ثبت نشده';
}

function parseRuleJsonArray(value: string | boolean | undefined) {
  if (typeof value !== 'string' || !value.trim()) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item ?? '').trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function getInterestModeMeta(activeTab: string) {
  if (activeTab === 'compound-interest') {
    return {
      label: 'سود مرکب',
      aprKey: 'interestAprCompound',
      penaltyKey: 'interestPenaltyEnabledCompound',
      togetherKey: 'interestTogetherPaymentCompound',
      endKey: 'interestPrincipalAtEndCompound',
      reducingKey: 'interestReducingPrincipalCompound',
      extraLabel: 'دوره محاسبه',
      extraValueKey: 'interestCompoundPeriod',
    };
  }
  if (activeTab === 'remaining-debt-interest') {
    return {
      label: 'سود بر مانده بدهی',
      aprKey: 'interestAprRemaining',
      penaltyKey: 'interestPenaltyEnabledRemaining',
      togetherKey: 'interestTogetherPaymentRemaining',
      endKey: 'interestPrincipalAtEndRemaining',
      reducingKey: 'interestReducingPrincipalRemaining',
      extraLabel: null,
      extraValueKey: null,
    };
  }
  return {
    label: 'سود ساده',
    aprKey: 'interestApr',
    penaltyKey: 'interestPenaltyEnabled',
    togetherKey: 'interestTogetherPayment',
    endKey: 'interestPrincipalAtEnd',
    reducingKey: 'interestReducingPrincipal',
    extraLabel: null,
    extraValueKey: null,
  };
}

function describeInterestPaymentPattern(values: Record<string, string | boolean>, activeTab: string) {
  const meta = getInterestModeMeta(activeTab);
  if (values[meta.endKey]) return 'فقط سود در دوره و تسویه اصل در پایان';
  if (values[meta.togetherKey]) return 'پرداخت همزمان اصل و سود';
  if (values[meta.reducingKey]) return 'سود کاهشی بر مبنای اصل';
  return 'الگوی ویژه‌ای ثبت نشده';
}

function describeBuilderPenaltyMode(mode: string | boolean | undefined) {
  if (mode === 'percent') return 'درصدی';
  if (mode === 'progressive') return 'تصاعدی';
  return 'ثابت';
}

function describeBuilderPenaltySection(
  values: Record<string, string | boolean>,
  {
    enabledKey,
    modeKey,
    periodKey,
    fixedKey,
    percentKey,
  }: {
    enabledKey: string;
    modeKey: string;
    periodKey: string;
    fixedKey: string;
    percentKey: string;
  },
) {
  if (!values[enabledKey]) return 'غیرفعال';
  const mode = String(values[modeKey] ?? 'fixed');
  const period = formatRuleText(values[periodKey], 'بدون دوره');
  if (mode === 'percent') {
    return `${describeBuilderPenaltyMode(mode)} · ${formatRuleAmount(values[percentKey], '٪')} · ${period}`;
  }
  if (mode === 'progressive') {
    return `${describeBuilderPenaltyMode(mode)} · ${period}`;
  }
  return `${describeBuilderPenaltyMode(mode)} · ${formatRuleAmount(values[fixedKey], 'ریال')} · ${period}`;
}

function buildForgivenessRuleCard(snapshot: ContractRuleSnapshot | null | undefined): ContractRuleSummaryCard {
  const state = snapshot?.state ?? { active: false, activeTab: '', values: {} };
  const values = state.values;
  const enabledEntries = parseRuleJsonArray(values.forgiveEnabledEntryIds);
  const scopeLabel = values.forgiveScope === 'itemized' ? 'موردی' : 'کل قرارداد';
  const modeLabel = values.forgiveValueMode === 'percent' ? 'درصدی' : 'مبلغی';
  const statusActive = state.active || Boolean(values.forgiveAllowed);
  const statusPending = statusActive && Boolean(values.forgiveManagerApproval);

  return {
    id: 'forgiveness',
    title: 'بخشودگی',
    tone: statusPending ? 'amber' : statusActive ? 'emerald' : 'slate',
    isActive: statusActive,
    statusLabel: statusPending ? 'در انتظار تایید' : statusActive ? 'فعال' : 'غیرفعال',
    sourceLabel: formatRuleSourceLabel(snapshot?.source ?? 'default'),
    updatedAtLabel: formatDateFa(snapshot?.updatedAt),
    details: [
      { label: 'دامنه اعمال', value: scopeLabel },
      { label: 'نوع مقدار', value: modeLabel },
      {
        label: 'پوشش آیتم‌ها',
        value: scopeLabel === 'موردی' ? `${enabledEntries.length.toLocaleString('fa-IR')} مورد` : 'کل قرارداد',
      },
      { label: 'نیاز به تایید مدیر', value: formatRuleBoolean(values.forgiveManagerApproval) },
    ],
    note: `${formatRuleSourceNote(snapshot?.source ?? 'default')} مبلغ بخشودگیِ اعمال‌شده روی جریمه‌ها فقط وقتی در گزارش مالی دیده می‌شود که داده واقعی آن ثبت شده باشد.`,
  };
}

function buildInterestRuleCard(snapshot: ContractRuleSnapshot | null | undefined): ContractRuleSummaryCard {
  const state = snapshot?.state ?? { active: false, activeTab: '', values: {} };
  const values = state.values;
  const meta = getInterestModeMeta(state.activeTab);
  const details: Array<{ label: string; value: string }> = [
    { label: 'مدل محاسبه', value: meta.label },
    { label: 'نرخ APR', value: formatRuleAmount(values[meta.aprKey], '٪') },
    { label: 'جریمه سود معوق', value: formatRuleBoolean(values[meta.penaltyKey]) },
    { label: 'الگوی بازپرداخت', value: describeInterestPaymentPattern(values, state.activeTab) },
  ];

  if (meta.extraLabel && meta.extraValueKey) {
    details.splice(2, 0, { label: meta.extraLabel, value: formatRuleText(values[meta.extraValueKey]) });
  }

  return {
    id: 'interest',
    title: 'سود دریافتی',
    tone: state.active ? 'emerald' : 'slate',
    isActive: state.active,
    statusLabel: state.active ? 'فعال' : 'غیرفعال',
    sourceLabel: formatRuleSourceLabel(snapshot?.source ?? 'default'),
    updatedAtLabel: formatDateFa(snapshot?.updatedAt),
    details,
    note: `${formatRuleSourceNote(snapshot?.source ?? 'default')} موتور اعمال خودکار سود در جدول timeline این صفحه فقط به اندازه داده فعلی قرارداد قابل تفسیر است.`,
  };
}

function buildBuilderPenaltyRuleCard(snapshot: ContractRuleSnapshot | null | undefined): ContractRuleSummaryCard {
  const state = snapshot?.state ?? { active: false, activeTab: '', values: {} };
  const values = state.values;
  const enabledCount = [values.unitDeliveryDelayEnabled, values.materialSpecsChangeEnabled, values.areaDifferenceEnabled].filter(Boolean).length;

  return {
    id: 'builder-penalty',
    title: 'جریمه سازنده',
    tone: state.active && enabledCount > 0 ? 'amber' : 'slate',
    isActive: Boolean(state.active),
    statusLabel: state.active ? (enabledCount > 0 ? 'فعال' : 'بدون سناریوی فعال') : 'غیرفعال',
    sourceLabel: formatRuleSourceLabel(snapshot?.source ?? 'default'),
    updatedAtLabel: formatDateFa(snapshot?.updatedAt),
    details: [
      { label: 'موارد فعال', value: enabledCount > 0 ? `${enabledCount.toLocaleString('fa-IR')} مورد` : 'هیچ‌کدام' },
      {
        label: 'تاخیر تحویل واحد',
        value: describeBuilderPenaltySection(values, {
          enabledKey: 'unitDeliveryDelayEnabled',
          modeKey: 'unitDeliveryDelayMode',
          periodKey: 'unitDeliveryDelayPeriod',
          fixedKey: 'unitDeliveryDelayFixedAmount',
          percentKey: 'unitDeliveryDelayPercentAmount',
        }),
      },
      {
        label: 'تغییر مصالح/مشخصات',
        value: describeBuilderPenaltySection(values, {
          enabledKey: 'materialSpecsChangeEnabled',
          modeKey: 'materialSpecsChangeMode',
          periodKey: 'materialSpecsChangePeriod',
          fixedKey: 'materialSpecsChangeFixedAmount',
          percentKey: 'materialSpecsChangePercentAmount',
        }),
      },
      {
        label: 'اختلاف متراژ',
        value: describeBuilderPenaltySection(values, {
          enabledKey: 'areaDifferenceEnabled',
          modeKey: 'areaDifferenceMode',
          periodKey: 'areaDifferencePeriod',
          fixedKey: 'areaDifferenceFixedAmount',
          percentKey: 'areaDifferencePercentAmount',
        }),
      },
    ],
    note: `${formatRuleSourceNote(snapshot?.source ?? 'default')} اجرای کامل مالی این سناریوها در گزارش فقط در حد داده عملیاتی ثبت‌شده قابل نمایش است.`,
  };
}

function formatDaysFa(days: number | null | undefined) {
  if (days == null) return '—';
  return `${days.toLocaleString('fa-IR')} روز`;
}

type FinancialHistoryEventTone = 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan';

type FinancialHistoryEventDetail = {
  label: string;
  value: string;
};

type FinancialHistoryEventRow = {
  id: string;
  kind: 'receipt-created' | 'receipt-reviewed' | 'receipt-partial' | 'penalty-applied';
  title: string;
  tone: FinancialHistoryEventTone;
  sourceLabel: string;
  happenedAtValue: string | null;
  happenedAtLabel: string;
  details: FinancialHistoryEventDetail[];
};

function resolveTimelineTimestamp(value?: string | null) {
  if (!value) return null;
  const fromDueString = toComparableDateFromDueString(value);
  if (fromDueString) return fromDueString.getTime();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function getReceiptReviewLabel(status: RegisteredReceiptRecord['reviewStatus'] | undefined) {
  if (status === 'approved') return 'تأیید شده';
  if (status === 'rejected') return 'رد شده';
  if (status === 'pending') return 'در انتظار بررسی';
  return 'ثبت‌شده / نامشخص';
}

function getReceiptReviewTone(status: RegisteredReceiptRecord['reviewStatus'] | undefined): FinancialHistoryEventTone {
  if (status === 'approved') return 'emerald';
  if (status === 'rejected') return 'rose';
  if (status === 'pending') return 'amber';
  return 'slate';
}

function getFinancialHistoryToneClasses(tone: FinancialHistoryEventTone) {
  if (tone === 'emerald') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (tone === 'rose') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (tone === 'amber') return 'border-amber-200 bg-amber-50 text-amber-800';
  if (tone === 'cyan') return 'border-cyan-200 bg-cyan-50 text-cyan-800';
  return 'border-slate-200 bg-slate-100 text-slate-700';
}

function getStatusToneClasses(tone: 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan') {
  return getFinancialHistoryToneClasses(tone);
}

function getStatusToneTextClasses(tone: 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan') {
  if (tone === 'emerald') return 'text-emerald-800';
  if (tone === 'amber') return 'text-amber-800';
  if (tone === 'rose') return 'text-rose-700';
  if (tone === 'cyan') return 'text-cyan-800';
  return 'text-slate-700';
}

export default function ContractReportsPage() {
  const params = useParams<{ contractId: string }>();
  const contractId = params?.contractId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [financialHistory, setFinancialHistory] = useState<ContractHistoryResponse | null>(null);
  const [financialHistoryError, setFinancialHistoryError] = useState('');

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!contractId) return;
      try {
        setFinancialHistoryError('');
        const data = await getContractHistory(String(contractId));
        if (mounted) setFinancialHistory(data as ContractHistoryResponse);
      } catch (e) {
        if (mounted) {
          setFinancialHistory(null);
          setFinancialHistoryError(e instanceof Error ? e.message : 'بازیابی تاریخچه مالی انجام نشد.');
        }
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
      amountRial,
      status: contract?.status ?? '—',
      contractTypeLabel,
      financial,
    };
  }, [contract]);

  const [tab, setTab] = useState<'summary' | 'payments'>('summary');
  const [selectedSummaryGroupId, setSelectedSummaryGroupId] = useState<string | null>(null);
  const [registeredReceipts, setRegisteredReceipts] = useState<RegisteredReceiptRecord[]>([]);
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetailsState>(null);
  const [dueStatusFilter, setDueStatusFilter] = useState<DueStatusFilter>('all');
  const [receiptStatusFilter, setReceiptStatusFilter] = useState<ReceiptStatusFilter>('all');
  const [penaltyStatusFilter, setPenaltyStatusFilter] = useState<PenaltyStatusFilter>('all');
  const [dueSortMode, setDueSortMode] = useState<SortMode>('due-asc');
  const [receiptSortMode, setReceiptSortMode] = useState<SortMode>('due-desc');
  const [penaltySortMode, setPenaltySortMode] = useState<SortMode>('due-asc');

  useEffect(() => {
    if (!contractId || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(getReceiptsStorageKey(String(contractId)));
      setRegisteredReceipts(normalizeReceiptRecords(raw ? JSON.parse(raw) : []));
    } catch {
      setRegisteredReceipts([]);
    }
  }, [contractId]);

  const canUseCompletedOnly = contract?.status === 'completed';
  const financialCategories = Array.isArray(view.financial?.categories) ? view.financial.categories : [];
  const reportGroups = useMemo(() => buildFinancialReportGroups(financialCategories), [financialCategories]);

  const penaltyTimeline = useMemo(
    () =>
      buildContractPenaltyTimeline({
        financial: view.financial,
        penalties: contract?.data?.penalties ?? null,
        receipts: registeredReceipts,
        forgiveness: contract?.data?.ruleSettings?.forgiveness ?? null,
      }),
    [view.financial, contract?.data?.penalties, contract?.data?.ruleSettings?.forgiveness, registeredReceipts],
  );

  const paymentMonthBuckets = penaltyTimeline.combinedBuckets;

  const receiptAllocation = useMemo(
    () => buildReceiptAllocation({ buckets: paymentMonthBuckets, receipts: registeredReceipts }),
    [paymentMonthBuckets, registeredReceipts],
  );

  const receiptReportRows = useMemo(
    () =>
      registeredReceipts.map((receipt) => {
        const allocation = receiptAllocation.receiptById[receipt.id];
        const allocatedAmountRial = allocation?.allocatedAmountRial ?? 0;
        const dueAmountRial = Number(receipt.dueAmount ?? 0) > 0 ? Number(receipt.dueAmount) : null;
        const shortageRial = dueAmountRial != null && receipt.paidAmountRial < dueAmountRial ? dueAmountRial - receipt.paidAmountRial : null;
        const overpaymentRial =
          dueAmountRial != null
            ? receipt.paidAmountRial > dueAmountRial
              ? receipt.paidAmountRial - dueAmountRial
              : allocation?.walletAmountRial ?? null
            : allocation?.walletAmountRial ?? null;
        const reviewStatus = receipt.reviewStatus ?? null;
        const statusLabel =
          reviewStatus === 'approved'
            ? 'تأییدشده'
            : reviewStatus === 'rejected'
              ? 'ردشده'
              : reviewStatus === 'pending'
                ? 'در انتظار بررسی'
                : 'ثبت‌شده / نامشخص';
        const reviewStatusTone =
          reviewStatus === 'approved'
            ? 'emerald'
            : reviewStatus === 'rejected'
              ? 'rose'
              : reviewStatus === 'pending'
                ? 'amber'
                : 'slate';

        return {
          id: receipt.id,
          receipt,
          createdAtLabel: formatDateFa(receipt.createdAt),
          amountLabel: formatMoneyRial(receipt.paidAmountRial),
          depositorLabel: receipt.depositorName.trim() || '—',
          statusLabel,
          reviewStatusTone,
          reviewedByLabel: receipt.reviewedBy?.trim() || '—',
          rejectionReasonLabel:
            reviewStatus === 'rejected' ? receipt.rejectionReason?.trim() || 'اطلاعات علت رد در داده موجود نیست' : '—',
          allocatedAmountRial,
          allocatedAmountLabel: formatMoneyRial(allocatedAmountRial),
          discrepancyLabel:
            shortageRial != null
              ? `کسری: ${formatMoneyRial(shortageRial)}`
              : overpaymentRial != null && overpaymentRial > 0
                ? `اضافه‌پرداخت: ${formatMoneyRial(overpaymentRial)}`
                : '—',
          shortageRial,
          overpaymentRial,
          dueAmountRial,
        };
      }),
    [receiptAllocation.receiptById, registeredReceipts],
  );

  const receiptReportGaps = useMemo(() => {
    const gaps: string[] = [];
    if (registeredReceipts.length === 0) return gaps;
    const hasReviewMeta = registeredReceipts.some((receipt) => Boolean(receipt.reviewStatus));
    const hasReviewerName = registeredReceipts.some((receipt) => Boolean(receipt.reviewedBy?.trim()));
    const hasRejectionReason = registeredReceipts.some(
      (receipt) => receipt.reviewStatus !== 'rejected' || Boolean(receipt.rejectionReason?.trim()),
    );
    const hasCreatorName = registeredReceipts.some((receipt) => Boolean(receipt.depositorName?.trim()));
    const hasAllocationInfo = receiptReportRows.some(
      (row) => row.allocatedAmountRial > 0 || row.shortageRial != null || (row.overpaymentRial ?? 0) > 0,
    );

    if (!hasReviewMeta) {
      gaps.push('وضعیت بررسی برخی رسیدها در داده فعلی ثبت نمی‌شود؛ برای بیشتر رسیدها فقط «ثبت‌شده / نامشخص» قابل نمایش است.');
    }
    if (!hasReviewerName) {
      gaps.push('نام تأییدکننده یا ردکننده در داده فعلی ذخیره نشده است.');
    }
    if (!hasRejectionReason) {
      gaps.push('علت رد برای رسیدهای ردشده در همه داده‌ها موجود نیست.');
    }
    if (!hasCreatorName) {
      gaps.push('نام ثبت‌کننده یا واریزکننده برای برخی رسیدها خالی است.');
    }
    if (!hasAllocationInfo && receiptReportRows.length > 0) {
      gaps.push('مبلغ تخصیص‌یافته هنوز برای این قرارداد از داده موجود پر نشده است.');
    }

    return gaps;
  }, [receiptReportRows, registeredReceipts]);

  const penaltyReportRows = useMemo(() => {
    const penalties = contract?.data?.penalties ?? null;
    const penaltyTypes = Array.isArray(penalties?.types) ? penalties.types : [];
    const penaltyTypeById = new Map<string, { title?: string }>(
      penaltyTypes.map((type: any) => [String(type?.id ?? ''), { title: String(type?.title ?? '') }]),
    );
    const principalById = new Map(penaltyTimeline.principalRows.map((row) => [row.id, row]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return penaltyTimeline.penaltyRows.map((row) => {
      const allocation = receiptAllocation.dueById[row.id];
      const paidRial = allocation?.paidAmountRial ?? 0;
      const claimableRial = Math.max(0, Number(row.claimableAmountRial ?? row.amount ?? 0));
      const remainingRial = allocation?.remainingAmountRial ?? Math.max(0, claimableRial - paidRial);
      const forgivenRial = row.forgivenRial ?? null;
      const principalRow = principalById.get(String(row.principalDueRowId ?? '').trim()) ?? null;
      const penaltyType = penaltyTypeById.get(String(row.penaltyTypeId ?? '').trim()) ?? null;
      const causeLabel = String(penaltyType?.title ?? '').trim() || 'جریمه تأخیر';
      const relatedDueLabel = principalRow
        ? `${principalRow.title}${principalRow.categoryTitle ? ` · ${principalRow.categoryTitle}` : ''}`
        : row.principalDueRowId || '—';
      const delayDays = countDelayDays(toComparableDateFromDueString(row.dueDate), today);
      const statusLabel =
        forgivenRial != null && forgivenRial > 0
          ? 'بخشوده‌شده'
          : row.forgivenessStatus === 'pending'
            ? 'در انتظار تایید'
            : remainingRial <= 0 && paidRial > 0
              ? 'پرداخت‌شده'
              : paidRial > 0
                ? 'باقی‌مانده'
                : 'اعمال‌شده';
      const statusTone =
        statusLabel === 'پرداخت‌شده'
          ? 'emerald'
          : statusLabel === 'در انتظار تایید'
            ? 'amber'
          : statusLabel === 'بخشوده‌شده'
            ? 'slate'
            : statusLabel === 'باقی‌مانده'
              ? 'amber'
              : 'rose';

        return {
        id: row.id,
        causeLabel,
        relatedDueLabel,
        startDelayDateLabel: formatDateFa(row.dueDate),
        startDelayDateValue: String(row.dueDate ?? '').trim() || null,
        delayDays,
        delayDaysLabel: formatDaysFa(delayDays),
        amountRial: Math.max(0, Number(row.amount ?? 0)),
        amountLabel: formatMoneyRial(Math.max(0, Number(row.amount ?? 0))),
        statusLabel,
        statusTone,
        paidRial,
        paidLabel: formatMoneyRial(paidRial),
        forgivenRial,
        forgivenLabel: formatMoneyRialNullable(forgivenRial),
        claimableRial,
        remainingRial,
        remainingLabel: formatMoneyRial(remainingRial),
      } satisfies PenaltyReportRow;
    });
  }, [contract?.data?.penalties, penaltyTimeline.penaltyRows, penaltyTimeline.principalRows, receiptAllocation.dueById]);

  const penaltyReportGaps = useMemo(() => {
    const gaps: string[] = [];
    if (penaltyTimeline.penaltyRows.length === 0) return gaps;
    const penalties = contract?.data?.penalties ?? null;
    const penaltyTypes = Array.isArray(penalties?.types) ? penalties.types : [];
    const hasPenaltyTypes = penaltyTypes.length > 0;
    const hasForgivenessData = penaltyTimeline.penaltyRows.some((row) => (row.forgivenRial ?? 0) > 0);
    const hasMissingRelatedDue = penaltyTimeline.penaltyRows.some((row) => !String(row.principalDueRowId ?? '').trim());

    if (!hasPenaltyTypes) {
      gaps.push('عنوان و علت برخی جریمه‌ها در اطلاعات نوع جریمه کامل نیست و بخشی از ردیف‌ها با عنوان عمومی نمایش داده می‌شوند.');
    }
    if (hasMissingRelatedDue) {
      gaps.push('برای برخی جریمه‌ها، اتصال مستقیم به قسط یا تعهد اصلی در داده فعلی موجود نیست.');
    }
    if (!hasForgivenessData) {
      gaps.push('مبلغ بخشودگی اعمال‌شده روی جریمه‌ها در داده فعلی این قرارداد ثبت نشده است؛ ستون بخشودگی فقط با داده واقعی پر می‌شود.');
    }
    gaps.push('در مدل فعلی، جریمه‌های محاسبه‌شده و اعمال‌شده به‌صورت جداگانه ذخیره نمی‌شوند و این جدول آن‌ها را بر اساس اطلاعات فعلی نمایش می‌دهد.');

    return gaps;
  }, [contract?.data?.penalties, penaltyTimeline.penaltyRows]);

  const financialHistorySections = useMemo(() => {
    const allowedTags = new Set(['contract-base-costs', 'side-costs', 'loan', 'adjustment']);
    return (financialHistory?.sections ?? []).filter((section) => allowedTags.has(section.tagKey));
  }, [financialHistory]);

  const financialHistoryEvents = useMemo<FinancialHistoryEventRow[]>(() => {
    const receiptEvents = receiptReportRows.flatMap((row) => {
      const receipt = row.receipt;
      const createdAtValue = String(receipt.createdAt ?? receipt.depositDate ?? '').trim() || null;
      const reviewedAtValue = String(receipt.reviewedAt ?? '').trim() || null;
      const reviewStatus = receipt.reviewStatus ?? undefined;
      const receiptLabel =
        receipt.receiptNumber?.trim() || receipt.trackingNumber?.trim() || receipt.referenceNumber?.trim() || row.depositorLabel;
      const allocatedLabel = row.allocatedAmountLabel;
      const discrepancyLabel = row.discrepancyLabel;
      const baseDetails: FinancialHistoryEventDetail[] = [
        { label: 'مبلغ رسید', value: row.amountLabel },
        { label: 'ثبت‌کننده', value: row.depositorLabel },
        { label: 'وضعیت رسید', value: getReceiptReviewLabel(reviewStatus) },
        { label: 'مبلغ تخصیص‌یافته', value: allocatedLabel },
        { label: 'کسری / اضافه', value: discrepancyLabel },
      ];

      const events: FinancialHistoryEventRow[] = [
        {
          id: `receipt-${row.id}-created`,
          kind: 'receipt-created',
          title: 'ثبت رسید',
          tone: getReceiptReviewTone(reviewStatus),
          sourceLabel: receiptLabel,
          happenedAtValue: createdAtValue,
          happenedAtLabel: formatDateFa(createdAtValue),
          details: [
            ...baseDetails,
            { label: 'تاریخ ثبت', value: formatDateFa(createdAtValue) },
            { label: 'تاریخ واریز', value: formatDateFa(receipt.depositDate) },
          ],
        },
      ];

      if (reviewStatus === 'pending') {
        events.push({
          id: `receipt-${row.id}-pending`,
          kind: 'receipt-reviewed',
          title: 'رسید در انتظار بررسی',
          tone: 'amber',
          sourceLabel: receiptLabel,
          happenedAtValue: createdAtValue,
          happenedAtLabel: formatDateFa(createdAtValue),
          details: [
            { label: 'وضعیت', value: 'در انتظار بررسی' },
            { label: 'مبلغ تخصیص‌یافته', value: allocatedLabel },
            { label: 'کسری / اضافه', value: discrepancyLabel },
          ],
        });
      } else if (reviewStatus === 'approved') {
        events.push({
          id: `receipt-${row.id}-approved`,
          kind: 'receipt-reviewed',
          title: 'تأیید پرداخت',
          tone: 'emerald',
          sourceLabel: receiptLabel,
          happenedAtValue: reviewedAtValue ?? createdAtValue,
          happenedAtLabel: formatDateFa(reviewedAtValue ?? createdAtValue),
          details: [
            { label: 'تأییدکننده', value: row.reviewedByLabel },
            { label: 'تاریخ تأیید', value: formatDateFa(reviewedAtValue ?? createdAtValue) },
            { label: 'مبلغ تخصیص‌یافته', value: allocatedLabel },
            { label: 'کسری / اضافه', value: discrepancyLabel },
          ],
        });
      } else if (reviewStatus === 'rejected') {
        events.push({
          id: `receipt-${row.id}-rejected`,
          kind: 'receipt-reviewed',
          title: 'رد پرداخت',
          tone: 'rose',
          sourceLabel: receiptLabel,
          happenedAtValue: reviewedAtValue ?? createdAtValue,
          happenedAtLabel: formatDateFa(reviewedAtValue ?? createdAtValue),
          details: [
            { label: 'ردکننده', value: row.reviewedByLabel },
            { label: 'علت رد', value: row.rejectionReasonLabel },
            { label: 'تاریخ رد', value: formatDateFa(reviewedAtValue ?? createdAtValue) },
          ],
        });
      }

      if (row.shortageRial != null && row.shortageRial > 0 && reviewStatus !== 'rejected') {
        events.push({
          id: `receipt-${row.id}-partial`,
          kind: 'receipt-partial',
          title: 'پرداخت ناقص',
          tone: 'amber',
          sourceLabel: receiptLabel,
          happenedAtValue: createdAtValue,
          happenedAtLabel: formatDateFa(createdAtValue),
          details: [
            { label: 'مبلغ مورد انتظار', value: row.dueAmountRial != null ? formatMoneyRial(row.dueAmountRial) : '—' },
            { label: 'مبلغ پرداختی', value: row.amountLabel },
            { label: 'مانده', value: formatMoneyRial(row.shortageRial) },
          ],
        });
      }

      return events;
    });

    const penaltyEvents = penaltyReportRows.map((row) => ({
      id: `penalty-${row.id}`,
      kind: 'penalty-applied' as const,
      title: 'اعمال جریمه',
      tone: (row.statusTone === 'emerald' ? 'emerald' : row.statusTone === 'rose' ? 'rose' : row.statusTone === 'amber' ? 'amber' : 'slate') as FinancialHistoryEventTone,
      sourceLabel: row.relatedDueLabel,
      happenedAtValue: row.startDelayDateValue,
      happenedAtLabel: formatDateFa(row.startDelayDateValue),
      details: [
        { label: 'علت جریمه', value: row.causeLabel },
        { label: 'قسط / تعهد مرتبط', value: row.relatedDueLabel },
        { label: 'تاریخ شروع تأخیر', value: row.startDelayDateLabel },
        { label: 'تعداد روز تأخیر', value: row.delayDaysLabel },
        { label: 'مبلغ جریمه', value: row.amountLabel },
        { label: 'وضعیت جریمه', value: row.statusLabel },
        { label: 'پرداخت‌شده', value: row.paidLabel },
        { label: 'بخشوده‌شده', value: row.forgivenLabel },
        { label: 'باقی‌مانده', value: row.remainingLabel },
      ],
    }));

    return [...receiptEvents, ...penaltyEvents].sort((a, b) => {
      const at = resolveTimelineTimestamp(a.happenedAtValue);
      const bt = resolveTimelineTimestamp(b.happenedAtValue);
      if (at == null && bt == null) return a.title.localeCompare(b.title, 'fa-IR');
      if (at == null) return 1;
      if (bt == null) return -1;
      if (at !== bt) return at - bt;
      return a.title.localeCompare(b.title, 'fa-IR');
    });
  }, [penaltyReportRows, receiptReportRows]);

  const financialHistoryGaps = useMemo(() => {
    const gaps: string[] = [];

    if (financialHistoryError) {
      gaps.push(`تاریخچه مالی قرارداد از داده‌های موجود بازگردانده نشد: ${financialHistoryError}`);
    }

    if (!financialHistory?.sections.length) {
      gaps.push('در تاریخچه قرارداد، بخش مالی قابل نمایش از متمم‌ها یا نسخه‌های قبلی یافت نشد.');
    } else if (!financialHistorySections.length) {
      gaps.push('تغییر مالی قابل نمایش در بخش‌های مبلغ پایه قرارداد، هزینه‌های جانبی، تسهیلات یا تعدیلات یافت نشد.');
    }

    const hasReceiptStatusGap = registeredReceipts.some((receipt) => !receipt.reviewStatus);
    const hasReviewedAtGap = registeredReceipts.some(
      (receipt) => (receipt.reviewStatus === 'approved' || receipt.reviewStatus === 'rejected') && !receipt.reviewedAt,
    );
    const hasRejectedReasonGap = registeredReceipts.some(
      (receipt) => receipt.reviewStatus === 'rejected' && !receipt.rejectionReason?.trim(),
    );
    const hasForgivenessData = penaltyReportRows.some((row) => row.forgivenRial != null && row.forgivenRial > 0);

    if (hasReceiptStatusGap) {
      gaps.push('برای بخشی از رسیدهای ثبت‌شده، وضعیت بررسی در داده فعلی کامل نیست و همه موارد به‌صورت «در انتظار بررسی»، «تأییدشده» یا «ردشده» قابل تشخیص نیستند.');
    }
    if (hasReviewedAtGap) {
      gaps.push('زمان تأیید یا رد برای بخشی از رسیدهای بررسی‌شده در داده فعلی ذخیره نشده است.');
    }
    if (hasRejectedReasonGap) {
      gaps.push('علت رد برای بخشی از رسیدهای ردشده در داده فعلی موجود نیست.');
    }
    if (!hasForgivenessData) {
      gaps.push('مبلغ بخشودگی اعمال‌شده روی جریمه‌ها در داده فعلی قرارداد ذخیره نشده است؛ فقط در صورت وجود مقدار واقعی نمایش داده می‌شود.');
    }

    gaps.push('در سوابق فعلی، امکان تفکیک تاریخچه مالی اختصاصی این قرارداد بر اساس شناسه قرارداد یا شناسه رخداد وجود ندارد.');
    gaps.push('رویداد مستقلِ مالی برای انتقال، فسخ یا اقاله در داده فعلی این قرارداد پیدا نشد.');

    return gaps;
  }, [financialHistory?.sections.length, financialHistoryError, financialHistorySections.length, penaltyReportRows, registeredReceipts]);

  const specialFinancialStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const approvedReceipts = registeredReceipts.filter((receipt) => receipt.reviewStatus === 'approved');
    const pendingReceipts = registeredReceipts.filter((receipt) => receipt.reviewStatus === 'pending');
    const rejectedReceipts = registeredReceipts.filter((receipt) => receipt.reviewStatus === 'rejected');
    const unidentifiedReceipts = registeredReceipts.filter((receipt) => !receipt.reviewStatus);

    const approvedPenaltyTimeline = buildContractPenaltyTimeline({
      financial: view.financial,
      penalties: contract?.data?.penalties ?? null,
      receipts: approvedReceipts,
      forgiveness: contract?.data?.ruleSettings?.forgiveness ?? null,
    });
    const approvedReceiptAllocation = buildReceiptAllocation({
      buckets: approvedPenaltyTimeline.combinedBuckets,
      receipts: approvedReceipts,
    });

    const dueSummaries = Object.values(approvedReceiptAllocation.dueById);
    const principalSummaries = dueSummaries.filter((summary) => summary.row.sourceKind !== 'penalty');
    const penaltySummaries = dueSummaries.filter((summary) => summary.row.sourceKind === 'penalty');

    const confirmedPaidRial = approvedReceiptAllocation.totalAllocatedRial;
    const pendingReviewRial = pendingReceipts.reduce((sum, receipt) => sum + Number(receipt.paidAmountRial ?? 0), 0);
    const unidentifiedRial = unidentifiedReceipts.reduce((sum, receipt) => sum + Number(receipt.paidAmountRial ?? 0), 0);
    const rejectedRial = rejectedReceipts.reduce((sum, receipt) => sum + Number(receipt.paidAmountRial ?? 0), 0);

    const principalRemainingRial = principalSummaries.reduce((sum, summary) => sum + summary.remainingAmountRial, 0);
    const overdueDebtRial = principalSummaries.reduce((sum, summary) => {
      const dueDate = toComparableDateFromDueString(summary.row.dueDate);
      if (!dueDate || dueDate >= today) return sum;
      return sum + summary.remainingAmountRial;
    }, 0);
    const futureDebtRial = Math.max(0, principalRemainingRial - overdueDebtRial);
    const openPenaltyRial = penaltySummaries.reduce((sum, summary) => sum + summary.remainingAmountRial, 0);
    const hasUnknownDueDates = principalSummaries.some((summary) => !toComparableDateFromDueString(summary.row.dueDate));
    const hasFinancialAppendix = financialHistorySections.length > 0;
    const terminationEnabled = Boolean(contract?.data?.termination?.terminationEnabled);
    const hasDeliveryDate = Boolean(contract?.data?.subject?.deliveryDate);

    const settlementStatus = (() => {
      if (
        principalRemainingRial <= 0 &&
        openPenaltyRial <= 0 &&
        pendingReviewRial <= 0 &&
        unidentifiedRial <= 0 &&
        !hasUnknownDueDates
      ) {
        return { label: 'تسویه کامل', tone: 'emerald' as const };
      }
      if (overdueDebtRial > 0) {
        return { label: 'دارای معوقه', tone: 'rose' as const };
      }
      if (futureDebtRial > 0) {
        return { label: 'دارای بدهی آینده', tone: 'amber' as const };
      }
      if (openPenaltyRial > 0) {
        return { label: 'دارای جریمه باز', tone: 'amber' as const };
      }
      if (pendingReviewRial > 0) {
        return { label: 'دارای رسید در انتظار بررسی', tone: 'amber' as const };
      }
      if (unidentifiedRial > 0 || hasUnknownDueDates) {
        return { label: 'نیازمند بررسی مالی', tone: 'slate' as const };
      }
      return { label: 'تسویه مشروط', tone: 'amber' as const };
    })();

    const readinessStatus = (() => {
      const financiallySettled =
        principalRemainingRial <= 0 &&
        openPenaltyRial <= 0 &&
        pendingReviewRial <= 0 &&
        unidentifiedRial <= 0 &&
        !hasUnknownDueDates;

      if (!view.financial) {
        return { label: 'نیازمند بررسی مالی', tone: 'slate' as const };
      }
      if (financiallySettled) {
        return { label: 'آماده است', tone: 'emerald' as const };
      }
      if (pendingReviewRial > 0 && principalRemainingRial <= 0 && openPenaltyRial <= 0) {
        return { label: 'مشروط است', tone: 'amber' as const };
      }
      if (unidentifiedRial > 0 || hasUnknownDueDates) {
        return { label: 'نیازمند بررسی مالی', tone: 'slate' as const };
      }
      if (terminationEnabled && (principalRemainingRial > 0 || openPenaltyRial > 0 || pendingReviewRial > 0)) {
        return { label: 'نیازمند بررسی حقوقی', tone: 'rose' as const };
      }
      return { label: 'آماده نیست', tone: 'rose' as const };
    })();

    const stateCards = [
      {
        label: 'پرداخت‌شده قطعی',
        value: formatMoneyRialOrUnknown(confirmedPaidRial),
        tone: 'emerald',
        note: 'فقط رسیدهای تاییدشده در این عدد لحاظ شده‌اند.',
      },
      {
        label: 'وضعیت تسویه',
        value: settlementStatus.label,
        tone: settlementStatus.tone,
        note: 'فقط رسیدهای تأییدشده در محاسبه این وضعیت لحاظ می‌شوند.',
      },
      {
        label: 'بدهی آینده',
        value: formatMoneyRialOrUnknown(futureDebtRial),
        tone: futureDebtRial > 0 ? 'amber' : 'emerald',
        note: 'بدهیِ سررسیدنشده از معوقه جدا شده است.',
      },
      {
        label: 'معوقه',
        value: formatMoneyRialOrUnknown(overdueDebtRial),
        tone: overdueDebtRial > 0 ? 'rose' : 'emerald',
        note: 'فقط بخش سررسید گذشته در این عدد می‌آید.',
      },
      {
        label: 'رسید در انتظار بررسی',
        value: formatMoneyRialOrUnknown(pendingReviewRial),
        tone: pendingReviewRial > 0 ? 'amber' : 'emerald',
        note: 'این مبلغ در تسویه قطعی حساب نمی‌شود.',
      },
      {
        label: 'جریمه باز',
        value: formatMoneyRialOrUnknown(openPenaltyRial),
        tone: openPenaltyRial > 0 ? 'amber' : 'emerald',
        note: 'جریمه با اصل بدهی قاطی نشده است.',
      },
      {
        label: 'آمادگی مالی',
        value: readinessStatus.label,
        tone: readinessStatus.tone,
        note: hasDeliveryDate ? 'تاریخ تحویل در داده موجود است.' : 'برای تحویل یا سند، سیاست اجرایی صریحی در داده فعلی پیدا نشد.',
      },
      {
        label: 'متمم مالی',
        value: hasFinancialAppendix ? 'دارد' : 'نامشخص',
        tone: hasFinancialAppendix ? 'cyan' : 'slate',
        note: hasFinancialAppendix ? 'اثر متمم‌ها در تاریخچه مالی دیده می‌شود.' : 'منشأ مالی ناشی از متمم در داده فعلی پیدا نشد.',
      },
      {
        label: 'قواعد فسخ',
        value: terminationEnabled ? 'فعال' : 'نامشخص',
        tone: terminationEnabled ? 'amber' : 'slate',
        note: terminationEnabled ? 'تنظیمات فسخ موجود است، اما اجرای آن ثبت نشده است.' : 'تنظیمات فسخ در داده فعلی پیدا نشد.',
      },
      {
        label: 'وضعیت اجرایی فسخ/اقاله',
        value: 'نامشخص',
        tone: 'slate',
        note: 'در داده فعلی، رخداد اجراییِ فسخ یا اقاله برای همین قرارداد ثبت نشده است.',
      },
      {
        label: 'وضعیت انتقال',
        value: 'نامشخص',
        tone: 'slate',
        note: 'شناسه یا رخداد انتقال برای همین قرارداد در جزئیات فعلی قرارداد در دسترس نیست.',
      },
    ] as const;

    const gaps: string[] = [];
    if (rejectedRial > 0 && rejectedReceipts.some((receipt) => !receipt.rejectionReason?.trim())) {
      gaps.push('علت رد برای بخشی از رسیدهای ردشده در داده فعلی موجود نیست.');
    }
    if (unidentifiedRial > 0) {
      gaps.push('برای بخشی از رسیدها، وضعیت بررسی در داده فعلی ثبت نشده است؛ این رسیدها در تسویه قطعی لحاظ نشده‌اند.');
    }
    if (terminationEnabled) {
      gaps.push('تنظیمات فسخ در داده فعلی موجود است، اما وضعیت اجرای فسخ/اقاله برای همین قرارداد ثبت نشده است.');
    } else {
      gaps.push('وضعیت اجرایی فسخ/اقاله برای همین قرارداد در داده فعلی موجود نیست.');
    }
    gaps.push('در جزئیات فعلی قرارداد، امکان تفکیک وضعیت مالی قبل و بعد از انتقال قرارداد وجود ندارد.');
    if (!hasFinancialAppendix) {
      gaps.push('متمم مالی قابل تشخیص در تاریخچه فعلی پیدا نشد؛ منشأ بدهی ناشی از متمم قابل تأیید نیست.');
    }

    return {
      confirmedPaidRial,
      pendingReviewRial,
      unidentifiedRial,
      rejectedRial,
      principalRemainingRial,
      overdueDebtRial,
      futureDebtRial,
      openPenaltyRial,
      settlementStatus,
      readinessStatus,
      stateCards,
      gaps,
      hasFinancialAppendix,
      terminationEnabled,
    };
  }, [contract?.data?.penalties, contract?.data?.subject?.deliveryDate, contract?.data?.termination?.terminationEnabled, financialHistorySections.length, registeredReceipts, view.financial]);

  const paidPrincipalByCategoryId = useMemo(
    () => buildPaidByCategoryIdFromAllocation(receiptAllocation, 'principal'),
    [receiptAllocation],
  );

  const paidPenaltyByCategoryId = useMemo(
    () => buildPaidByCategoryIdFromAllocation(receiptAllocation, 'penalty'),
    [receiptAllocation],
  );

  const penaltyTotalByCategoryId = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of penaltyTimeline.penaltyRows) {
      const categoryId = String(row.categoryId ?? '').trim();
      if (!categoryId) continue;
      const normalizedCategoryId = normalizeSummaryCategoryKey(categoryId);
      const amount = Math.max(0, Number(row.claimableAmountRial ?? row.amount ?? 0));
      map.set(normalizedCategoryId, (map.get(normalizedCategoryId) ?? 0) + amount);
      map.set(categoryId, (map.get(categoryId) ?? 0) + amount);
    }
    return map;
  }, [penaltyTimeline.penaltyRows]);

  const summaryFinancialRows = useMemo(
    () => buildSummaryFinancialRows(reportGroups, paidPrincipalByCategoryId, penaltyTotalByCategoryId, paidPenaltyByCategoryId),
    [reportGroups, paidPrincipalByCategoryId, penaltyTotalByCategoryId, paidPenaltyByCategoryId],
  );

  const summaryByCategoryId = useMemo(() => {
    const map = new Map<string, SummaryFinancialRowMetrics>();
    for (const group of reportGroups) {
      for (const subRow of group.subRows) {
        map.set(subRow.id, {
          id: subRow.id,
          title: subRow.label,
          lineBaseRial: Math.max(0, subRow.capRial),
          penaltyTotalRial: penaltyTotalByCategoryId.get(subRow.id) ?? 0,
          penaltyPaidRial: paidPenaltyByCategoryId.get(subRow.id) ?? 0,
          paidTotalRial: paidPrincipalByCategoryId.get(subRow.id) ?? 0,
        });
      }
      if (!group.subRows.length && group.dueCategoryIds[0]) {
        const categoryId = group.dueCategoryIds[0];
        map.set(categoryId, {
          id: categoryId,
          title: group.title,
          lineBaseRial: reportGroupLineBaseRial(group),
          penaltyTotalRial: penaltyTotalByCategoryId.get(categoryId) ?? 0,
          penaltyPaidRial: paidPenaltyByCategoryId.get(categoryId) ?? 0,
          paidTotalRial: paidPrincipalByCategoryId.get(categoryId) ?? 0,
        });
      }
    }
    return map;
  }, [reportGroups, penaltyTotalByCategoryId, paidPenaltyByCategoryId, paidPrincipalByCategoryId]);

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
    const contractTotalRial = penaltyTimeline.contractBaseTotalRial;
    const penaltyTotalRial = penaltyTimeline.penaltyRows.reduce(
      (sum, row) => sum + Math.max(0, Number(row.claimableAmountRial ?? row.amount ?? 0)),
      0,
    );
    const paidPrincipalRial = summaryFooter?.paidTotal;
    const paidPenaltyRial = summaryFooter?.penaltyPaid;

    const paidCombinedRial =
      typeof paidPrincipalRial === 'number'
        ? paidPrincipalRial + (typeof paidPenaltyRial === 'number' ? paidPenaltyRial : 0)
        : null;

    const liabilityTotalRial = contractTotalRial + penaltyTotalRial;

    return {
      contractTotalRial,
      penaltyTotalRial,
      liabilityTotalRial,
      paidPrincipalRial: typeof paidPrincipalRial === 'number' ? paidPrincipalRial : null,
      paidPenaltyRial: typeof paidPenaltyRial === 'number' ? paidPenaltyRial : null,
      paidCombinedRial,
    };
  }, [penaltyTimeline, summaryFooter]);

  const hasSpecialStateGaps = specialFinancialStatus.gaps.length > 0;
  const { data: authContext, loading: authLoading } = useAuthContext();
  const canSeeInternalTrace = useMemo(() => {
    if (authLoading) return false;
    const access = authContext?.access;
    if (!access) return false;
    if (access.isOwner) return true;
    return (
      access.permissionKeys.includes('audit.logs.view') ||
      access.permissionKeys.includes('platform.reports.view') ||
      access.permissionKeys.includes('contracts.update')
    );
  }, [authContext?.access, authLoading]);

  const defaultSummaryGroupId = useMemo(
    () => reportGroups.find((g) => g.id === 'group-principal')?.id ?? reportGroups[0]?.id ?? null,
    [reportGroups],
  );

  const activeSummaryGroupId =
    selectedSummaryGroupId === SUMMARY_TOTAL_GROUP_ID
      ? SUMMARY_TOTAL_GROUP_ID
      : selectedSummaryGroupId && reportGroups.some((g) => g.id === selectedSummaryGroupId)
        ? selectedSummaryGroupId
        : defaultSummaryGroupId;

  const aggregateSummaryGroup = useMemo<FinancialReportGroup | null>(() => {
    if (!summaryFooter) return null;
    const dueCategoryIds = Array.from(
      new Set(reportGroups.flatMap((group) => group.dueCategoryIds.map(String)).filter(Boolean)),
    );

    return {
      id: SUMMARY_TOTAL_GROUP_ID,
      title: 'جمع کل',
      umbrellaCapRial: summaryFooter.lineBase,
      dueCategoryIds,
      subRows: [],
    };
  }, [reportGroups, summaryFooter]);

  const selectedReportGroup = useMemo(
    () => {
      if (!activeSummaryGroupId) return null;
      if (activeSummaryGroupId === SUMMARY_TOTAL_GROUP_ID) return aggregateSummaryGroup;
      return reportGroups.find((g) => g.id === activeSummaryGroupId) ?? null;
    },
    [aggregateSummaryGroup, reportGroups, activeSummaryGroupId],
  );

  const subgroupDetailRows = useMemo(
    () => {
      if (!selectedReportGroup) return [];
      if (selectedReportGroup.id === SUMMARY_TOTAL_GROUP_ID) {
        return summaryFinancialRows.map((row) => ({
          id: row.id,
          label: row.title,
          lineBaseRial: row.lineBaseRial,
          penaltyTotalRial: row.penaltyTotalRial,
          penaltyPaidRial: row.penaltyPaidRial,
          paidTotalRial: row.paidTotalRial,
        }));
      }
      return buildSubgroupDetailRows(selectedReportGroup, summaryByCategoryId);
    },
    [selectedReportGroup, summaryByCategoryId, summaryFinancialRows],
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
    if (!selectedReportGroup) return { dues: [] as typeof penaltyTimeline.combinedRows, sum: 0 };
    if (selectedReportGroup.id === SUMMARY_TOTAL_GROUP_ID) {
      const dues = penaltyTimeline.combinedRows.filter((d) => (d.sourceKind ?? 'principal') !== 'penalty');
      const sum = dues.reduce((s: number, d) => s + Number(d?.amount ?? 0), 0);
      return { dues, sum };
    }
    const idSet = new Set(selectedReportGroup.dueCategoryIds.map(String));
    const dues = penaltyTimeline.combinedRows.filter((d) => idSet.has(String(d.categoryId)));
    const sum = dues.reduce((s: number, d) => s + Number(d?.amount ?? 0), 0);
    return { dues, sum };
  }, [selectedReportGroup, penaltyTimeline.combinedRows]);

  const paymentDueRowsWithStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return penaltyTimeline.combinedRows
      .filter((row) => row.sourceKind !== 'penalty')
      .map((row) => {
        const summary = receiptAllocation.dueById[row.id];
        const paidRial = summary?.paidAmountRial ?? 0;
        const remainingRial = summary?.remainingAmountRial ?? Math.max(0, Number(row.amount ?? 0));
        const dueDate = toComparableDateFromDueString(row.dueDate);
        const overdue = Boolean(dueDate && dueDate < today && remainingRial > 0);
        const status: DueStatusFilter =
          remainingRial <= 0 ? 'paid' : paidRial > 0 ? 'partial' : overdue ? 'overdue' : 'future';

        return { row, summary, paidRial, remainingRial, overdue, status };
      });
  }, [penaltyTimeline.combinedRows, receiptAllocation.dueById]);

  const [collapsedPaymentMonths, setCollapsedPaymentMonths] = useState<Set<string>>(() => new Set());
  const [collapsedSummaryDueMonths, setCollapsedSummaryDueMonths] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setCollapsedPaymentMonths(new Set());
    setCollapsedSummaryDueMonths(new Set());
    setSelectedSummaryGroupId(null);
    setDueStatusFilter('all');
    setReceiptStatusFilter('all');
    setPenaltyStatusFilter('all');
    setDueSortMode('due-asc');
    setReceiptSortMode('due-desc');
    setPenaltySortMode('due-asc');
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

  const dueRowsWithStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedGroupDueMeta.dues
      .filter((row) => row.sourceKind !== 'penalty')
      .map((row) => {
        const summary = receiptAllocation.dueById[row.id];
        const paidRial = summary?.paidAmountRial ?? 0;
        const remainingRial = summary?.remainingAmountRial ?? Math.max(0, Number(row.amount ?? 0));
        const dueDate = toComparableDateFromDueString(row.dueDate);
        const overdue = Boolean(dueDate && dueDate < today && remainingRial > 0);
        const status: DueStatusFilter =
          remainingRial <= 0 ? 'paid' : paidRial > 0 ? 'partial' : overdue ? 'overdue' : 'future';

        return { row, summary, paidRial, remainingRial, overdue, status };
      });
  }, [receiptAllocation.dueById, selectedGroupDueMeta.dues]);

  const filteredDueRows = useMemo(
    () =>
      dueRowsWithStatus.filter((item) => {
        if (dueStatusFilter === 'all') return true;
        return item.status === dueStatusFilter;
      }),
    [dueRowsWithStatus, dueStatusFilter],
  );

  const filteredDueBuckets = useMemo(() => {
    const buckets = buildPaymentHistoryMonthBucketsFromRows(filteredDueRows.map((item) => item.row));
    const bucketsWithOrder = buckets.map((bucket) => {
      const sourceOrder = new Map(filteredDueRows.map((item, index) => [item.row.id, index]));
      const sortedItems = [...bucket.items].sort((a, b) => {
        if (dueSortMode === 'amount-asc' || dueSortMode === 'amount-desc') {
          const amountDiff = compareByAmount(a.amount, b.amount, dueSortMode);
          if (amountDiff !== 0) return amountDiff;
        } else {
          const da = toComparableDateFromDueString(a.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
          const db = toComparableDateFromDueString(b.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
          if (dueSortMode === 'due-desc' && da !== db) return db - da;
          if (dueSortMode === 'due-asc' && da !== db) return da - db;
        }
        return (sourceOrder.get(a.id) ?? 0) - (sourceOrder.get(b.id) ?? 0);
      });
      return { ...bucket, items: sortedItems };
    });

    if (dueSortMode === 'amount-asc' || dueSortMode === 'amount-desc') {
      return bucketsWithOrder.sort((a, b) => compareByAmount(a.totalRial, b.totalRial, dueSortMode));
    }

    return bucketsWithOrder;
  }, [dueSortMode, filteredDueRows]);

  const filteredPaymentDueRows = useMemo(
    () =>
      paymentDueRowsWithStatus.filter((item) => {
        if (dueStatusFilter === 'all') return true;
        return item.status === dueStatusFilter;
      }),
    [dueStatusFilter, paymentDueRowsWithStatus],
  );

  const filteredPaymentDueBuckets = useMemo(() => {
    const buckets = buildPaymentHistoryMonthBucketsFromRows(filteredPaymentDueRows.map((item) => item.row));
    const bucketsWithOrder = buckets.map((bucket) => {
      const sourceOrder = new Map(filteredPaymentDueRows.map((item, index) => [item.row.id, index]));
      const sortedItems = [...bucket.items].sort((a, b) => {
        if (dueSortMode === 'amount-asc' || dueSortMode === 'amount-desc') {
          const amountDiff = compareByAmount(toNumberOrZero(a.amount), toNumberOrZero(b.amount), dueSortMode);
          if (amountDiff !== 0) return amountDiff;
        } else {
          const da = toComparableDateFromDueString(a.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
          const db = toComparableDateFromDueString(b.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
          if (dueSortMode === 'due-desc' && da !== db) return db - da;
          if (dueSortMode === 'due-asc' && da !== db) return da - db;
        }
        return (sourceOrder.get(a.id) ?? 0) - (sourceOrder.get(b.id) ?? 0);
      });
      return { ...bucket, items: sortedItems };
    });

    if (dueSortMode === 'amount-asc' || dueSortMode === 'amount-desc') {
      return bucketsWithOrder.sort((a, b) => compareByAmount(a.totalRial, b.totalRial, dueSortMode));
    }

    return bucketsWithOrder;
  }, [dueSortMode, filteredPaymentDueRows]);

  const filteredReceiptRows = useMemo(
    () =>
      receiptReportRows
        .filter((row) => {
          if (receiptStatusFilter === 'all') return true;
          const receiptStatus = row.receipt.reviewStatus ?? 'unidentified';
          return receiptStatus === receiptStatusFilter;
        })
        .sort((a, b) => {
          if (receiptSortMode === 'amount-asc' || receiptSortMode === 'amount-desc') {
            return compareByAmount(a.receipt.paidAmountRial, b.receipt.paidAmountRial, receiptSortMode);
          }
          const at = new Date(a.receipt.createdAt).getTime();
          const bt = new Date(b.receipt.createdAt).getTime();
          return receiptSortMode === 'due-desc' ? bt - at : at - bt;
        }),
    [receiptReportRows, receiptSortMode, receiptStatusFilter],
  );

  const visibleReceiptReportRows = useMemo(
    () =>
      canSeeInternalTrace
        ? filteredReceiptRows
        : filteredReceiptRows.map((row) => ({
            ...row,
            reviewedByLabel: '—',
            rejectionReasonLabel: '—',
          })),
    [canSeeInternalTrace, filteredReceiptRows],
  );

  const visibleReceiptReportGaps = canSeeInternalTrace ? receiptReportGaps : [];
  const visiblePenaltyReportGaps = canSeeInternalTrace ? penaltyReportGaps : [];
  const visibleFinancialHistorySections = canSeeInternalTrace ? financialHistorySections : [];
  const visibleFinancialHistoryEvents = canSeeInternalTrace ? financialHistoryEvents : [];
  const visibleFinancialHistoryGaps = canSeeInternalTrace ? financialHistoryGaps : [];
  const visibleSpecialStateGaps = canSeeInternalTrace ? specialFinancialStatus.gaps : [];

  const filteredPenaltyRows = useMemo(
    () =>
      penaltyReportRows
        .filter((row) => {
          if (penaltyStatusFilter === 'all') return true;
          if (penaltyStatusFilter === 'forgiven') return row.forgivenRial != null && row.forgivenRial > 0;
          if (penaltyStatusFilter === 'paid') return row.remainingRial <= 0 && row.paidRial > 0;
          return row.remainingRial > 0;
        })
        .sort((a, b) => {
          if (penaltySortMode === 'amount-asc' || penaltySortMode === 'amount-desc') {
            return compareByAmount(a.amountRial, b.amountRial, penaltySortMode);
          }
          const at = toComparableDateFromDueString(a.startDelayDateValue ?? '')?.getTime() ?? Number.POSITIVE_INFINITY;
          const bt = toComparableDateFromDueString(b.startDelayDateValue ?? '')?.getTime() ?? Number.POSITIVE_INFINITY;
          return penaltySortMode === 'due-desc' ? bt - at : at - bt;
        }),
    [penaltyReportRows, penaltySortMode, penaltyStatusFilter],
  );

  const businessAlerts = useMemo(() => {
    const overdueInstallments = paymentDueRowsWithStatus.filter((item) => item.status === 'overdue').length;
    const partialInstallments = paymentDueRowsWithStatus.filter((item) => item.status === 'partial').length;
    const pendingReceipts = receiptReportRows.filter((row) => row.receipt.reviewStatus === 'pending').length;
    const openPenalties = penaltyReportRows.filter((row) => row.remainingRial > 0).length;
    const readiness = specialFinancialStatus.readinessStatus?.label ?? 'نامشخص';

    return [
      overdueInstallments > 0 ? `قسط معوق: ${overdueInstallments.toLocaleString('fa-IR')}` : null,
      partialInstallments > 0 ? `پرداخت ناقص: ${partialInstallments.toLocaleString('fa-IR')}` : null,
      pendingReceipts > 0 ? `رسید در انتظار بررسی: ${pendingReceipts.toLocaleString('fa-IR')}` : null,
      openPenalties > 0 ? `جریمه باز: ${openPenalties.toLocaleString('fa-IR')}` : null,
      readiness !== 'آماده است' ? `آمادگی مالی: ${readiness}` : null,
    ].filter((item): item is string => Boolean(item));
  }, [paymentDueRowsWithStatus, penaltyReportRows, receiptReportRows, specialFinancialStatus.readinessStatus]);

  const financialCharts = useMemo(() => {
    const installmentStatus = buildInstallmentStatusItems(
      paymentDueRowsWithStatus.map((item) => ({
        paidRial: item.paidRial,
        remainingRial: item.remainingRial,
        dueDate: item.row.dueDate,
      })),
    );

    const paymentTrend = buildApprovedReceiptTrend(registeredReceipts);
    const penaltyCalculatedRial = penaltyTimeline.penaltyRows.reduce((sum, row) => sum + Math.max(0, Number(row.amount ?? 0)), 0);
    const penaltyAppliedRial = penaltyReportRows.reduce((sum, row) => sum + Math.max(0, row.claimableRial), 0);
    const penaltyPaidRial = penaltyReportRows.reduce((sum, row) => sum + Math.max(0, row.paidRial), 0);
    const penaltyRemainingRial = penaltyReportRows.reduce((sum, row) => sum + Math.max(0, row.remainingRial), 0);
    const hasForgivenessData = penaltyReportRows.some((row) => (row.forgivenRial ?? 0) > 0);

    return {
      payment: {
        confirmedPaidRial: Math.max(0, specialFinancialStatus.confirmedPaidRial ?? 0),
        pendingReviewRial: Math.max(0, specialFinancialStatus.pendingReviewRial ?? 0),
        remainingDebtRial: Math.max(0, specialFinancialStatus.principalRemainingRial ?? 0),
        settled: specialFinancialStatus.settlementStatus?.label === 'تسویه کامل',
        note: 'رسیدهای در انتظار بررسی از پرداخت قطعی جدا نگه داشته می‌شوند و در تسویه حساب ادغام نمی‌شوند.',
      },
      installments: {
        totalCount: installmentStatus.totalCount,
        items: installmentStatus.items,
        emptyMessage: 'برای این قرارداد هنوز برنامه اقساط قابل نمایش ثبت نشده است.',
        note: 'اقساط تغییریافته با متمم فقط زمانی جدا نشان داده می‌شوند که در داده فعلی قابل تشخیص باشند.',
      },
      trend: {
        points: paymentTrend.points,
        approvedReceiptCount: paymentTrend.approvedReceiptCount,
        missingTimelineCount: paymentTrend.missingTimelineCount,
        emptyMessage: 'هنوز پرداخت تأییدشده‌ای برای این قرارداد ثبت نشده است.',
        note:
          paymentTrend.points.length > 0
            ? 'در این نسخه فعلا فقط روند پرداخت‌های تأییدشده نمایش داده می‌شود و مقایسه با برنامه پرداخت به داده معتبر بیشتر نیاز دارد.'
            : 'در این نسخه فقط روند پرداخت‌های تأییدشده نمایش داده می‌شود.',
      },
      penalties: {
        calculatedRial: penaltyCalculatedRial,
        appliedRial: penaltyAppliedRial,
        paidRial: penaltyPaidRial,
        forgivenRial: hasForgivenessData
          ? penaltyReportRows.reduce((sum, row) => sum + Math.max(0, row.forgivenRial ?? 0), 0)
          : null,
        remainingRial: penaltyRemainingRial,
        totalCount: penaltyReportRows.length,
        emptyMessage: 'برای این قرارداد جریمه‌ای ثبت یا اعمال نشده است.',
        note: hasForgivenessData
          ? 'جریمه بخشوده‌شده جدا از جریمه پرداخت‌شده نمایش داده می‌شود.'
          : 'مبلغ بخشودگی اعمال‌شده روی جریمه‌ها در داده فعلی به‌صورت معتبر در دسترس نیست.',
      },
    };
  }, [paymentDueRowsWithStatus, penaltyReportRows, registeredReceipts, specialFinancialStatus]);

  const dashboardClone = useMemo(() => {
    const trendPoints = financialCharts.trend.points.slice(-6);
    const graphWidth = 300;
    const graphHeight = 105;
    const paddingX = 18;
    const paddingTop = 10;
    const paddingBottom = 14;
    const maxAmount = Math.max(...trendPoints.map((point) => point.amountRial), 0);
    const coords = trendPoints.map((point, index) => {
      const usableWidth = graphWidth - paddingX * 2;
      const x = trendPoints.length <= 1 ? graphWidth / 2 : paddingX + (usableWidth * index) / (trendPoints.length - 1);
      const ratio = maxAmount > 0 ? point.amountRial / maxAmount : 0;
      const y = graphHeight - paddingBottom - ratio * (graphHeight - paddingTop - paddingBottom);
      return { ...point, x, y };
    });

    const linePath = buildDashboardLinePath(coords);
    const areaPath = coords.length
      ? `${linePath} L ${coords[coords.length - 1].x} ${graphHeight - 2} L ${coords[0].x} ${graphHeight - 2} Z`
      : '';

    const paymentMonthBuckets = buildPaymentHistoryMonthBucketsFromRows(paymentDueRowsWithStatus.map((item) => item.row));
    const rowMonthKeyById = new Map<string, string>();
    for (const bucket of paymentMonthBuckets) {
      for (const row of bucket.items) {
        rowMonthKeyById.set(row.id, bucket.key);
      }
    }

    const paidByMonth = new Map<string, number>();
    for (const item of paymentDueRowsWithStatus) {
      const monthKey = rowMonthKeyById.get(item.row.id) ?? '__UNKNOWN_DUE_MONTH__';
      paidByMonth.set(monthKey, (paidByMonth.get(monthKey) ?? 0) + Math.max(0, item.paidRial));
    }

    const barSource = paymentMonthBuckets.slice(-12);
    const barMax = Math.max(
      0,
      ...barSource.flatMap((bucket) => [bucket.totalRial, paidByMonth.get(bucket.key) ?? 0]),
    );
    const bars = barSource.map((bucket) => {
      const plannedRial = bucket.totalRial;
      const paidRial = paidByMonth.get(bucket.key) ?? 0;
      const paidRatio = barMax > 0 ? paidRial / barMax : 0;
      const plannedRatio = barMax > 0 ? plannedRial / barMax : 0;
      return {
        key: bucket.key,
        label: bucket.heading,
        paidHeight: 26 + paidRatio * 60,
        plannedHeight: 22 + plannedRatio * 64,
        paidRial,
        plannedRial,
      };
    });

    const totalRial = Math.max(1, ledgerSnapshot.liabilityTotalRial);
    const paidPercent = Math.max(0, Math.min(99, Math.round((specialFinancialStatus.confirmedPaidRial / totalRial) * 100)));
    const duePercent = Math.max(0, Math.min(99, Math.round((specialFinancialStatus.principalRemainingRial / totalRial) * 100)));
    const overduePercent = Math.max(0, Math.min(99, Math.round((specialFinancialStatus.overdueDebtRial / totalRial) * 100)));
    const penaltyPercent = Math.max(0, Math.min(99, Math.round((specialFinancialStatus.openPenaltyRial / totalRial) * 100)));
    const growthPercent = Math.max(10, Math.min(99, paidPercent - overduePercent + 12));
    const score = Math.max(680, Math.min(920, 680 + paidPercent * 2 - overduePercent));

    return {
      score,
      growthPercent,
      paidPercent,
      duePercent,
      overduePercent,
      penaltyPercent,
      coords,
      linePath,
      areaPath,
      bars,
    };
  }, [financialCharts.trend.points, ledgerSnapshot.liabilityTotalRial, paymentDueRowsWithStatus, specialFinancialStatus.confirmedPaidRial, specialFinancialStatus.overdueDebtRial, specialFinancialStatus.openPenaltyRial, specialFinancialStatus.principalRemainingRial]);

  const specialStatusTotalRial = Math.max(1, ledgerSnapshot.liabilityTotalRial);
  const specialStatusDebtRial = Math.max(0, specialFinancialStatus.principalRemainingRial);
  const specialStatusPaidPercent = Math.max(
    0,
    Math.min(99, Math.round((specialFinancialStatus.confirmedPaidRial / specialStatusTotalRial) * 100)),
  );
  const specialStatusDebtPercent = Math.max(0, Math.min(100, Math.round((specialStatusDebtRial / specialStatusTotalRial) * 100)));
  const specialStatusHasDebt = specialStatusDebtRial > 0;
  const specialStatusPenaltyCard = specialFinancialStatus.stateCards.find((card) => card.label === 'جریمه باز') ?? null;
  const specialStatusPendingReviewCard = specialFinancialStatus.stateCards.find((card) => card.label === 'رسید در انتظار بررسی') ?? null;
  const specialStatusTopCards = specialStatusPenaltyCard
    ? [
        ...specialFinancialStatus.stateCards.slice(0, 4),
        specialStatusPenaltyCard,
        ...(specialStatusPendingReviewCard ? [specialStatusPendingReviewCard] : []),
      ]
    : specialFinancialStatus.stateCards.slice(0, 4);
  const specialStatusExtraCards = specialFinancialStatus.stateCards
    .slice(4)
    .filter((card) => card.label !== 'جریمه باز' && card.label !== 'رسید در انتظار بررسی');
  const specialStatusTopCardRows = useMemo(() => {
    const rows: typeof specialStatusTopCards[] = [];
    for (let index = 0; index < specialStatusTopCards.length; index += 2) {
      rows.push(specialStatusTopCards.slice(index, index + 2));
    }
    return rows;
  }, [specialStatusTopCards]);

  const ruleSettingsCards = useMemo(() => {
    const ruleSettings = contract?.data?.ruleSettings ?? null;
    return [
      buildForgivenessRuleCard(ruleSettings?.forgiveness),
      buildInterestRuleCard(ruleSettings?.interest),
      buildBuilderPenaltyRuleCard(ruleSettings?.builderPenalty),
    ];
  }, [contract?.data?.ruleSettings]);
  const ruleSettingsActiveCount = useMemo(
    () => ruleSettingsCards.filter((card) => card.isActive).length,
    [ruleSettingsCards],
  );

  return (
    <PanelLayout>
      <main className="w-full max-w-none min-w-0" dir="rtl" lang="fa">
        <div className="business-report-page w-full max-w-none py-6 sm:py-8">
          {loading ? (
            <section className="rounded-[28px] border border-white/70 bg-white/95 p-10 text-center text-sm font-bold text-slate-500 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.14)]">
              در حال دریافت اطلاعات مالی قرارداد...
            </section>
          ) : error || !contractId ? (
            <section className="rounded-[28px] border border-rose-200 bg-rose-50/95 p-8 text-center shadow-sm">
              <div className="text-sm font-bold text-rose-800">
                امکان نمایش نمودار مالی قرارداد در حال حاضر وجود ندارد. لطفاً بعداً دوباره بررسی کنید.
              </div>
              {error ? <div className="mt-2 text-[11px] font-semibold text-rose-700/90">{error}</div> : null}
            </section>
          ) : (
            <>
              <section className="report-clone-scene mt-2" aria-label="Animated reporting dashboard" dir="ltr">
                <div className="report-clone-ground-shadow" />
                <section className="report-clone-shell">
                  <aside className="report-clone-sidebar">
                    <div className="report-clone-brand">
                      <span className="report-clone-brand-mark" />
                      <span>Vahed1</span>
                    </div>
                    <div className="report-clone-menu-section">
                      <div className="report-clone-menu-label">Main</div>
                      <div className="report-clone-menu-item active">
                        <span className="report-clone-ico dot" />
                        Dashboard
                      </div>
                      <div className="report-clone-menu-item">
                        <span className="report-clone-ico" />
                        Contracts
                      </div>
                      <div className="report-clone-menu-item">
                        <span className="report-clone-ico" />
                        Payments
                      </div>
                      <div className="report-clone-menu-item">
                        <span className="report-clone-ico line" />
                        Reports
                      </div>
                    </div>
                    <div className="report-clone-menu-section">
                      <div className="report-clone-menu-label">Management</div>
                      <div className="report-clone-menu-item">
                        <span className="report-clone-ico" />
                        Projects
                      </div>
                      <div className="report-clone-menu-item">
                        <span className="report-clone-ico dot" />
                        Buyers
                      </div>
                      <div className="report-clone-menu-item">
                        <span className="report-clone-ico" />
                        Units
                      </div>
                      <div className="report-clone-menu-item">
                        <span className="report-clone-ico line" />
                        Settings
                      </div>
                    </div>
                    <div className="report-clone-sidebar-footer">
                      <div className="report-clone-mini-row">
                        <span />
                      </div>
                      <div className="report-clone-mini-row">
                        <span />
                      </div>
                      <div className="report-clone-mini-row">
                        <span />
                      </div>
                    </div>
                  </aside>

                  <section className="report-clone-main">
                    <header className="report-clone-topbar">
                      <div className="report-clone-title">
                        <h1>Reporting Dashboard</h1>
                        <p>Financial overview · Current contracts</p>
                      </div>
                      <nav className="report-clone-tabs" aria-label="Dashboard tabs">
                        <span className="report-clone-tab active">Overview</span>
                        <span className="report-clone-tab">Analytics</span>
                        <span className="report-clone-tab">Reports</span>
                      </nav>
                      <div className="report-clone-actions">
                        <span className="report-clone-pill">+{dashboardClone.growthPercent.toLocaleString('fa-IR')}% Growth</span>
                        <span className="report-clone-search" aria-hidden />
                        <span className="report-clone-avatar" aria-hidden />
                      </div>
                    </header>

                    <div className="report-clone-content-grid">
                      <article className="report-clone-card report-clone-kpi">
                        <div className="report-clone-card-title">Total Performance</div>
                        <div className="report-clone-score-wrap">
                          <div className="report-clone-score">
                            <svg viewBox="0 0 84 84" aria-hidden="true">
                              <defs>
                                <linearGradient id="reportScoreGradient" x1="0" y1="0" x2="1" y2="1">
                                  <stop stopColor="#93c5fd" offset="0" />
                                  <stop stopColor="#2563eb" offset="1" />
                                </linearGradient>
                              </defs>
                              <circle className="bg" cx="42" cy="42" r="36" />
                              <circle className="fg" cx="42" cy="42" r="36" />
                            </svg>
                            <strong>{dashboardClone.score.toLocaleString('fa-IR')}</strong>
                            <small>score</small>
                          </div>
                        </div>
                        <div className="report-clone-stat-list">
                          <div className="report-clone-stat">
                            <span className="report-clone-stat-left">
                              <i className="report-clone-bullet" />
                              Paid
                            </span>
                            <b>{dashboardClone.paidPercent.toLocaleString('fa-IR')}%</b>
                          </div>
                          <div className="report-clone-stat">
                            <span className="report-clone-stat-left">
                              <i className="report-clone-bullet" />
                              Due
                            </span>
                            <b>{dashboardClone.duePercent.toLocaleString('fa-IR')}%</b>
                          </div>
                          <div className="report-clone-stat">
                            <span className="report-clone-stat-left">
                              <i className="report-clone-bullet" />
                              Overdue
                            </span>
                            <b>{dashboardClone.overduePercent.toLocaleString('fa-IR')}%</b>
                          </div>
                          <div className="report-clone-stat">
                            <span className="report-clone-stat-left">
                              <i className="report-clone-bullet" />
                              Penalty
                            </span>
                            <b>{dashboardClone.penaltyPercent.toLocaleString('fa-IR')}%</b>
                          </div>
                        </div>
                      </article>

                      <article className="report-clone-card report-clone-line-card">
                        <div className="report-clone-trend-header">
                          <span className="report-clone-trend-dot" aria-hidden />
                          <div className="report-clone-trend-title">Trend Overview</div>
                        </div>
                        <div className="report-clone-line-chart report-clone-line-chart--hero">
                          <span className="report-clone-grid-line" />
                          <span className="report-clone-grid-line" />
                          <span className="report-clone-grid-line" />
                          <span className="report-clone-grid-line" />
                          <svg viewBox="0 0 300 128" preserveAspectRatio="none" aria-hidden="true">
                            <defs>
                              <linearGradient id="reportAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#b8dbff" stopOpacity=".78" />
                                <stop offset="1" stopColor="#eaf4ff" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {dashboardClone.areaPath ? <path className="report-clone-area" d={dashboardClone.areaPath} /> : null}
                            {dashboardClone.linePath ? <path className="report-clone-trend-line" d={dashboardClone.linePath} /> : null}
                            {dashboardClone.coords.map((point, index) => (
                              <circle
                                key={point.key ?? `${point.label}-${index}`}
                                className={`report-clone-dot-point d${Math.min(index + 1, 6)}`}
                                cx={point.x}
                                cy={point.y}
                                r="4.5"
                              />
                            ))}
                          </svg>
                          <div className="report-clone-tooltip">
                            <span className="report-clone-tooltip-label">Current</span>
                            <b>+{dashboardClone.growthPercent.toLocaleString('fa-IR')}%</b>
                            <span className="report-clone-tooltip-bar">
                              <i />
                            </span>
                          </div>
                        </div>
                      </article>

                      <article className="report-clone-card report-clone-bar-card">
                        <div className="report-clone-bar-head">
                          <div className="report-clone-card-title" style={{ margin: 0 }}>
                            Revenue Reports
                          </div>
                          <div className="report-clone-legend">
                            <span>Paid</span>
                            <span>Planned</span>
                          </div>
                        </div>
                        <div className="report-clone-bar-chart">
                          {dashboardClone.bars.map((bar) => (
                            <div key={bar.key} className="report-clone-bar-group">
                              <i className="report-clone-bar a" style={{ height: `${bar.paidHeight}%` }} />
                              <i className="report-clone-bar b" style={{ height: `${bar.plannedHeight}%` }} />
                            </div>
                          ))}
                          <div className="report-clone-months">
                            <span>{dashboardClone.bars[0]?.label ?? 'Jan'}</span>
                            <span>{dashboardClone.bars[2]?.label ?? 'Mar'}</span>
                            <span>{dashboardClone.bars[4]?.label ?? 'May'}</span>
                            <span>{dashboardClone.bars[6]?.label ?? 'Jul'}</span>
                            <span>{dashboardClone.bars[8]?.label ?? 'Sep'}</span>
                            <span>{dashboardClone.bars[10]?.label ?? 'Nov'}</span>
                          </div>
                        </div>
                      </article>
                    </div>
                    <div className="report-clone-cursor-glow" />
                  </section>
                </section>
              </section>

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

              <section className="report-clone-section-card mt-5 px-4 py-4 text-right md:px-5 md:py-5">
                <div className="report-clone-section-head flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="report-clone-section-title text-[15px] font-black text-slate-900">وضعیت‌های خاص قرارداد</div>
                    <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500">
                      این بخش فقط بر اساس داده‌های موجود قرارداد تفسیر می‌شود و برای رسیدهای تاییدنشده، انتقال، فسخ و اقاله از وضعیت‌های قطعی استفاده نمی‌کند.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4">
                  <article className="report-clone-card report-clone-status-main p-4 sm:p-5 md:p-6">
                    <div className="report-clone-card-title">Status Overview</div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-4">
                      <div className="flex shrink-0 justify-center lg:w-[360px]">
                        <div className="flex w-full max-w-[360px] flex-col items-center rounded-[28px] bg-gradient-to-b from-slate-50/90 to-white px-4 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                          <div className="report-clone-score-wrap report-clone-score-wrap--hero">
                            <div className="report-clone-score report-clone-score--debt report-clone-score--hero">
                              <svg viewBox="0 0 84 84" aria-hidden="true">
                                <defs>
                                  <linearGradient id="reportSpecialDebtGradientRed" x1="0" y1="0" x2="1" y2="1">
                                    <stop stopColor="#fca5a5" offset="0" />
                                    <stop stopColor="#ef4444" offset="0.55" />
                                    <stop stopColor="#b91c1c" offset="1" />
                                  </linearGradient>
                                  <linearGradient id="reportSpecialDebtGradientGreen" x1="0" y1="0" x2="1" y2="1">
                                    <stop stopColor="#86efac" offset="0" />
                                    <stop stopColor="#34d399" offset="0.55" />
                                    <stop stopColor="#0f766e" offset="1" />
                                  </linearGradient>
                                </defs>
                                <circle className="bg" cx="42" cy="42" r="36" />
                                <circle
                                  className="fg"
                                  cx="42"
                                  cy="42"
                                  r="36"
                                  style={
                                    {
                                      stroke: `url(#${specialStatusHasDebt ? 'reportSpecialDebtGradientRed' : 'reportSpecialDebtGradientGreen'})`,
                                      strokeDashoffset: 226,
                                      '--report-score-target': `${226 - (226 * specialStatusDebtPercent) / 100}`,
                                    } as CSSProperties & Record<'--report-score-target', string>
                                  }
                                />
                              </svg>
                              <strong>{formatMoneyRial(specialStatusDebtRial)}</strong>
                              <small>بدهی</small>
                            </div>
                          </div>
                          <p className="mt-2 text-center text-[11px] font-semibold leading-6 text-slate-500">
                            این نمودار مقدار بدهی خالص قرارداد را نشان می‌دهد و رنگ آن بر اساس وجود بدهی تغییر می‌کند.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-white/60">
                        {specialStatusTopCardRows.map((row, rowIndex) => (
                          <div key={row.map((card) => card.label).join('|')} className="relative flex flex-col">
                            <div className="grid grid-cols-1 sm:grid-cols-2">
                              {row.map((card) => (
                                <article
                                  key={card.label}
                                  className={`report-clone-mini-surface report-clone-mini-surface--flat report-clone-top-card px-4 py-3 ${getStatusToneTextClasses(card.tone)}`}
                                >
                                  <div className="text-[11px] font-bold opacity-80">{card.label}</div>
                                  <div className="mt-1 text-[15px] font-black leading-6">{card.value}</div>
                                  <p className="mt-2 text-[10px] font-semibold leading-5 opacity-80">{card.note}</p>
                                </article>
                              ))}
                            </div>
                            {row.length > 1 ? (
                              <div
                                className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-slate-200/80 sm:block"
                                aria-hidden="true"
                              />
                            ) : null}
                            {rowIndex < specialStatusTopCardRows.length - 1 ? <div className="h-px bg-slate-200/70" aria-hidden="true" /> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                </div>

                {specialStatusExtraCards.length > 0 ? (
                  <div className="mt-3 grid gap-3 px-2 lg:grid-cols-2 lg:px-3 xl:grid-cols-5">
                    {specialStatusExtraCards.map((card) => (
                      <div
                        key={card.label}
                        className={`report-clone-mini-surface report-clone-mini-surface--borderless report-clone-glass-card rounded-2xl px-4 py-3 ${getStatusToneClasses(card.tone)}`}
                      >
                        <div className="text-[11px] font-bold opacity-80">{card.label}</div>
                        <div className="mt-1 text-[14px] font-black leading-6">{card.value}</div>
                        <p className="mt-2 text-[10px] font-semibold leading-5 opacity-80">{card.note}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {canSeeInternalTrace && hasSpecialStateGaps ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 px-4 py-3">
                    <div className="text-[12px] font-black text-amber-900">موارد ناقص در تشخیص وضعیت قرارداد</div>
                    <ul className="mt-2 space-y-1 text-[11px] font-semibold leading-6 text-amber-900/90">
                      {specialFinancialStatus.gaps.map((gap) => (
                        <li key={gap}>• {gap}</li>
                      ))}
                    </ul>
                  </div>
                ) : !canSeeInternalTrace ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-[11px] font-semibold leading-6 text-slate-600">
                    این نسخه برای سطح دسترسی فعلی محدود شده است و جزئیات داخلی موارد ناقص و یادداشت‌های محرمانه نمایش داده نمی‌شود.
                  </div>
                ) : null}
              </section>

              {tab === 'summary' ? (
                <section className="report-clone-lower-stack mt-6">
                  <section className="report-clone-section-card mb-6 p-5 text-right md:p-6">
                    <div className="report-clone-section-head flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="report-clone-section-title text-[15px] font-black text-slate-900">تنظیمات سود، بخشودگی و جریمه سازنده</div>
                        <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500">
                          این بخش snapshot تنظیمات موجود در داده فعلی قرارداد را نشان می‌دهد و اگر تنظیم اختصاصی قرارداد ثبت نشده باشد، منبع آن را از تنظیمات کسب‌وکار مشخص می‌کند.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-800">
                          فعال: {ruleSettingsActiveCount.toLocaleString('fa-IR')} از {ruleSettingsCards.length.toLocaleString('fa-IR')}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black text-slate-600">
                          فقط داده واقعی نمایش داده می‌شود
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-3">
                      {ruleSettingsCards.map((card) => (
                        <article
                          key={card.id}
                          className="report-clone-rule-card relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)] backdrop-blur-sm md:px-5 md:py-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black ${getStatusToneClasses(card.tone)}`}>
                                  {card.statusLabel}
                                </span>
                                <div className={`text-[14px] font-black leading-5 ${getStatusToneTextClasses(card.tone)}`}>{card.title}</div>
                              </div>
                              <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">
                                تنظیمات اختصاصی یا کسب‌وکاریِ این بخش در داده فعلی به‌صورت snapshot خوانده می‌شود.
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-600">
                              منبع: {card.sourceLabel}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold text-slate-500">
                              به‌روزرسانی: {card.updatedAtLabel}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {card.details.map((detail) => (
                              <div
                                key={`${card.id}-${detail.label}`}
                                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                              >
                                <div className="text-[10px] font-bold text-slate-500">{detail.label}</div>
                                <div className={`mt-1 text-[13px] font-black leading-6 ${getStatusToneTextClasses(card.tone)}`}>{detail.value}</div>
                              </div>
                            ))}
                          </div>

                          <p className="mt-4 border-t border-dashed border-slate-200 pt-3 text-[10px] font-semibold leading-5 text-slate-500">
                            {card.note}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <ContractFinancialCharts
                    payment={financialCharts.payment}
                    installments={financialCharts.installments}
                    trend={financialCharts.trend}
                    penalties={financialCharts.penalties}
                    paymentBars={dashboardClone.bars}
                  />
                </section>
              ) : null}

              {tab === 'payments' ? (
                <section className="report-clone-section-card mt-6 p-5 text-right md:p-7">
                  <div className="report-clone-section-head flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <div className="report-clone-section-title text-[15px] font-black text-slate-900">تاریخچه پرداخت</div>
                      <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500">
                        به‌ترتیب تاریخ، بر اساس ماه سررسید؛ ردیف‌های سررسید از دادهٔ مالی قرارداد (سرور) بارگذاری می‌شوند و مبالغ
                        پرداختی از فیش‌های ثبت‌شده همین قرارداد (مرورگر) روی هر سررسید محاسبه می‌شود.
                      </p>
                    </div>
                  </div>

                  {businessAlerts.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {businessAlerts.map((alert) => (
                        <span
                          key={alert}
                          className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-900"
                        >
                          {alert}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-3 xl:grid-cols-3">
                    <div className="report-clone-mini-surface rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                      <div className="text-[12px] font-black text-slate-900">فیلتر اقساط</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          ['all', 'همه'],
                          ['overdue', 'معوق'],
                          ['future', 'آینده'],
                          ['partial', 'پرداخت ناقص'],
                          ['paid', 'پرداخت‌شده'],
                        ].map(([value, label]) => {
                          const active = dueStatusFilter === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setDueStatusFilter(value as DueStatusFilter)}
                              className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition ${
                                active
                                  ? 'border-[color-mix(in_srgb,var(--dark-teal)_38%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <label className="mt-3 block text-[11px] font-bold text-slate-500">
                        مرتب‌سازی
                        <select
                          value={dueSortMode}
                          onChange={(event) => setDueSortMode(event.target.value as SortMode)}
                          className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-800 outline-none focus:border-[color-mix(in_srgb,var(--dark-teal)_38%,transparent)]"
                        >
                          <option value="due-asc">نزدیک‌ترین سررسید</option>
                          <option value="due-desc">دورترین سررسید</option>
                          <option value="amount-asc">مبلغ کم به زیاد</option>
                          <option value="amount-desc">مبلغ زیاد به کم</option>
                        </select>
                      </label>
                    </div>

                    <div className="report-clone-mini-surface rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                      <div className="text-[12px] font-black text-slate-900">فیلتر رسیدها</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          ['all', 'همه'],
                          ['pending', 'در انتظار بررسی'],
                          ['approved', 'تأییدشده'],
                          ['rejected', 'ردشده'],
                        ].map(([value, label]) => {
                          const active = receiptStatusFilter === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setReceiptStatusFilter(value as ReceiptStatusFilter)}
                              className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition ${
                                active
                                  ? 'border-[color-mix(in_srgb,var(--dark-teal)_38%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <label className="mt-3 block text-[11px] font-bold text-slate-500">
                        مرتب‌سازی
                        <select
                          value={receiptSortMode}
                          onChange={(event) => setReceiptSortMode(event.target.value as SortMode)}
                          className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-800 outline-none focus:border-[color-mix(in_srgb,var(--dark-teal)_38%,transparent)]"
                        >
                          <option value="due-desc">جدیدترین ثبت</option>
                          <option value="due-asc">قدیمی‌ترین ثبت</option>
                          <option value="amount-asc">مبلغ کم به زیاد</option>
                          <option value="amount-desc">مبلغ زیاد به کم</option>
                        </select>
                      </label>
                    </div>

                    <div className="report-clone-mini-surface rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                      <div className="text-[12px] font-black text-slate-900">فیلتر جریمه‌ها</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          ['all', 'همه'],
                          ['open', 'باز'],
                          ['paid', 'پرداخت‌شده'],
                          ['forgiven', 'بخشوده‌شده'],
                        ].map(([value, label]) => {
                          const active = penaltyStatusFilter === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setPenaltyStatusFilter(value as PenaltyStatusFilter)}
                              className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition ${
                                active
                                  ? 'border-[color-mix(in_srgb,var(--dark-teal)_38%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)]'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <label className="mt-3 block text-[11px] font-bold text-slate-500">
                        مرتب‌سازی
                        <select
                          value={penaltySortMode}
                          onChange={(event) => setPenaltySortMode(event.target.value as SortMode)}
                          className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-800 outline-none focus:border-[color-mix(in_srgb,var(--dark-teal)_38%,transparent)]"
                        >
                          <option value="due-asc">قدیمی‌ترین شروع تأخیر</option>
                          <option value="due-desc">جدیدترین شروع تأخیر</option>
                          <option value="amount-asc">مبلغ کم به زیاد</option>
                          <option value="amount-desc">مبلغ زیاد به کم</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {filteredPaymentDueBuckets.length === 0 ? (
                    <div className="report-clone-empty-surface mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-10 text-center text-[13px] font-semibold text-slate-500">
                      برای این قرارداد هیچ ردیف سررسیدی در دادهٔ مالی ثبت نشده است.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      <DueMonthAccordionList
                        buckets={filteredPaymentDueBuckets}
                        collapsedMonths={collapsedPaymentMonths}
                        toggleMonth={togglePaymentMonth}
                        allocationByDueId={receiptAllocation.dueById}
                        penaltyDetailsByPrincipalDueId={penaltyTimeline.penaltyDetailsByPrincipalDueId}
                      />
                    </div>
                  )}

                  <section className="report-clone-section-card mt-6 p-5 text-right md:p-7">
                    <div className="report-clone-section-head flex flex-wrap items-start justify-between gap-3 pb-4">
                      <div>
                        <div className="report-clone-section-title text-[15px] font-black text-slate-900">جدول رسیدهای پرداخت همین قرارداد</div>
                        <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500">
                          فقط رسیدهایی که در همین قرارداد ثبت شده‌اند نمایش داده می‌شوند. اگر وضعیت بررسی، علت رد یا اطلاعات
                          تخصیص در داده فعلی موجود نباشد، به‌جای حدس‌زدن به‌عنوان مورد نیازمند تکمیل نمایش داده می‌شود.
                        </p>
                      </div>
                    </div>

                    {visibleReceiptReportRows.length === 0 ? (
                      <div className="report-clone-empty-surface mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-10 text-center text-[13px] font-semibold text-slate-500">
                        برای این قرارداد هیچ رسیدی ثبت نشده است.
                      </div>
                    ) : (
                      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200/90">
                        <table className="w-full min-w-[1100px] border-collapse text-[10px] sm:text-[11px]" dir="rtl">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-500">
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">تاریخ ثبت رسید</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">مبلغ رسید</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">ثبت‌کننده</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">وضعیت رسید</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">تأییدکننده / ردکننده</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">علت رد</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">مبلغ تخصیص‌یافته</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">کسری / اضافه‌پرداخت</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleReceiptReportRows.map((row, idx) => (
                              <tr
                                key={row.id}
                                className={`border-b border-slate-100 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}
                              >
                                <td className="px-2 py-3 text-center font-semibold text-slate-800">{row.createdAtLabel}</td>
                                <td className="px-2 py-3 text-center tabular-nums font-black text-slate-900">
                                  {row.amountLabel}
                                </td>
                                <td className="px-2 py-3 text-center font-semibold text-slate-800">{row.depositorLabel}</td>
                                <td className="px-2 py-3 text-center">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${
                                      row.reviewStatusTone === 'emerald'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : row.reviewStatusTone === 'rose'
                                          ? 'bg-rose-50 text-rose-700'
                                          : row.reviewStatusTone === 'amber'
                                            ? 'bg-amber-50 text-amber-800'
                                            : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {row.statusLabel}
                                  </span>
                                </td>
                                <td className="px-2 py-3 text-center font-semibold text-slate-800">{row.reviewedByLabel}</td>
                                <td className="px-2 py-3 text-center font-semibold text-slate-800">
                                  {row.rejectionReasonLabel === '—' ? (
                                    '—'
                                  ) : (
                                    <span className="inline-flex rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-bold leading-5 text-rose-700">
                                      {row.rejectionReasonLabel}
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-3 text-center tabular-nums font-bold text-emerald-900">
                                  {row.allocatedAmountLabel}
                                </td>
                                <td className="px-2 py-3 text-center font-bold text-slate-800">
                                  {row.discrepancyLabel}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-[11px] font-semibold leading-6 text-slate-600">
                      <div className="font-black text-slate-800">موارد ناقص در اطلاعات رسیدها</div>
                      {visibleReceiptReportGaps.length > 0 ? (
                        <ul className="mt-1 space-y-1">
                          {visibleReceiptReportGaps.map((gap) => (
                            <li key={gap}>• {gap}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-1 text-emerald-700">برای این قرارداد، اطلاعات پایه رسیدها کامل‌تر از مدل فعلی در دسترس بود.</div>
                      )}
                    </div>
                  </section>

                  <section className="report-clone-section-card mt-6 p-5 text-right md:p-7">
                    <div className="report-clone-section-head flex flex-wrap items-start justify-between gap-3 pb-4">
                      <div>
                        <div className="report-clone-section-title text-[15px] font-black text-slate-900">جدول جریمه‌های همین قرارداد</div>
                        <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500">
                          جریمه‌ها بر اساس اطلاعات جریمه فعلی ساخته می‌شوند و جدا از اصل بدهی و اقساط نمایش داده می‌شوند. یادداشت‌های داخلی یا سیاست‌های
                          ناموجود در داده فعلی نمایش داده نمی‌شوند.
                        </p>
                      </div>
                    </div>

                    {filteredPenaltyRows.length === 0 ? (
                      <div className="report-clone-empty-surface mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-10 text-center text-[13px] font-semibold text-slate-500">
                        برای این قرارداد جریمه فعالی در داده فعلی شناسایی نشده است.
                      </div>
                    ) : (
                      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200/90">
                        <table className="w-full min-w-[1320px] border-collapse text-[10px] sm:text-[11px]" dir="rtl">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-500">
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">علت جریمه</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">قسط / تعهد مرتبط</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">تاریخ شروع تأخیر</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">تعداد روز تأخیر</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">مبلغ جریمه</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">وضعیت جریمه</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">پرداخت‌شده</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">بخشوده‌شده</th>
                              <th className="px-2 py-3 text-center font-black whitespace-nowrap">باقی‌مانده</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPenaltyRows.map((row, idx) => (
                              <tr
                                key={row.id}
                                className={`border-b border-slate-100 ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}
                              >
                                <td className="px-2 py-3 text-center font-semibold text-slate-800">{row.causeLabel}</td>
                                <td className="px-2 py-3 text-center font-semibold text-slate-800">{row.relatedDueLabel}</td>
                                <td className="px-2 py-3 text-center font-semibold text-slate-800">{row.startDelayDateLabel}</td>
                                <td className="px-2 py-3 text-center font-bold text-slate-800">{row.delayDaysLabel}</td>
                                <td className="px-2 py-3 text-center tabular-nums font-black text-slate-900">
                                  {row.amountLabel}
                                </td>
                                <td className="px-2 py-3 text-center">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${
                                      row.statusTone === 'emerald'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : row.statusTone === 'amber'
                                          ? 'bg-amber-50 text-amber-800'
                                          : row.statusTone === 'rose'
                                            ? 'bg-rose-50 text-rose-700'
                                            : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {row.statusLabel}
                                  </span>
                                </td>
                                <td className="px-2 py-3 text-center tabular-nums font-bold text-emerald-900">
                                  {row.paidLabel}
                                </td>
                                <td className="px-2 py-3 text-center text-slate-700">
                                  {row.forgivenRial == null ? (
                                    '—'
                                  ) : (
                                    <span className="tabular-nums font-bold text-slate-700">{row.forgivenLabel}</span>
                                  )}
                                </td>
                                <td className="px-2 py-3 text-center tabular-nums font-bold text-slate-900">
                                  {row.remainingLabel}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-[11px] font-semibold leading-6 text-slate-600">
                      <div className="font-black text-slate-800">موارد ناقص در اطلاعات جریمه</div>
                      {visiblePenaltyReportGaps.length > 0 ? (
                        <ul className="mt-1 space-y-1">
                          {visiblePenaltyReportGaps.map((gap) => (
                            <li key={gap}>• {gap}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-1 text-emerald-700">برای این قرارداد، اطلاعات جریمه بدون مورد ناقص قابل نمایش بود.</div>
                      )}
                    </div>

                    <section className="mt-6 rounded-[22px] border border-slate-200/80 bg-white/90 p-5 text-right shadow-sm md:p-7">
                      <div className="report-clone-section-head flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <div className="text-[15px] font-black text-slate-900">تاریخچه مالی قرارداد</div>
                          <p className="mt-1.5 text-[11px] font-semibold leading-5 text-slate-500">
                            فقط تغییرات مالی همین قرارداد از متمم‌ها، ثبت و بررسی رسیدها، و جریمه‌های تولیدشده در داده فعلی نمایش داده می‌شوند.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="report-clone-section-title mb-3 text-[13px] font-black text-slate-900">تغییرات مالی ناشی از متمم‌ها</div>
                        {visibleFinancialHistorySections.length > 0 ? (
                          <HistoryTimelineView
                            meta={{
                              title: 'تغییرات مالی ناشی از متمم‌ها',
                              description: 'این نما فقط بخش‌های مالی قرارداد را از تاریخچه متمم‌های تأییدشده نشان می‌دهد.',
                              currentLabel: financialHistory ? 'نسخه مالی فعلی' : undefined,
                              stats: financialHistory
                                ? [
                                    {
                                      label: 'نسخه‌ها',
                                      value: financialHistory.stats.versionCount.toLocaleString('fa-IR'),
                                      accent: true,
                                    },
                                    {
                                      label: 'بخش‌ها',
                                      value: financialHistory.stats.sectionCount.toLocaleString('fa-IR'),
                                    },
                                    {
                                      label: 'بخش‌های دارای تغییر',
                                      value: financialHistory.stats.changedSectionCount.toLocaleString('fa-IR'),
                                    },
                                  ]
                                : undefined,
                            }}
                            sections={visibleFinancialHistorySections}
                            versions={financialHistory?.versions ?? []}
                            embedded
                          />
                        ) : (
                          <div className="report-clone-empty-surface rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-[12px] font-semibold text-slate-500">
                            دادهٔ قابل نمایش برای تغییرات مالی ناشی از متمم‌ها در تاریخچه فعلی پیدا نشد.
                          </div>
                        )}
                      </div>

                      <div className="mt-6 border-t border-slate-100 pt-5">
                        <div className="report-clone-section-title text-[13px] font-black text-slate-900">رویدادهای مالی زمان‌مند</div>
                        <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">
                          این بخش رویدادهای ثبت رسید، تأیید یا رد پرداخت، پرداخت ناقص و اعمال جریمه را به ترتیب زمان نشان می‌دهد.
                        </p>

                        {visibleFinancialHistoryEvents.length > 0 ? (
                          <div className="mt-4 space-y-3">
                            {visibleFinancialHistoryEvents.map((event) => (
                              <article
                                key={event.id}
                                className="report-clone-history-card rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-4 shadow-sm"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`inline-flex min-h-[30px] items-center rounded-full border px-3 py-1 text-[11px] font-black ${getFinancialHistoryToneClasses(
                                          event.tone,
                                        )}`}
                                      >
                                        {event.title}
                                      </span>
                                      <span className="text-[11px] font-semibold text-slate-500">{event.happenedAtLabel}</span>
                                    </div>
                                    <div className="mt-2 text-[14px] font-black text-slate-900">{event.sourceLabel}</div>
                                  </div>
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-600">
                                    {event.kind === 'receipt-created'
                                      ? 'ثبت رسید'
                                      : event.kind === 'receipt-reviewed'
                                        ? 'بررسی رسید'
                                        : event.kind === 'receipt-partial'
                                          ? 'اختلاف مبلغ'
                                          : 'جریمه'}
                                  </span>
                                </div>

                                <div className="mt-4 grid gap-2 md:grid-cols-2">
                                  {event.details.map((detail) => (
                                    <div key={`${event.id}-${detail.label}`} className="rounded-2xl border border-slate-100 bg-white px-4 py-2.5">
                                      <div className="text-[10px] font-bold text-slate-400">{detail.label}</div>
                                      <div className="mt-0.5 text-[12px] font-semibold leading-6 text-slate-800">{detail.value}</div>
                                    </div>
                                  ))}
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : canSeeInternalTrace ? (
                          <div className="report-clone-empty-surface mt-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-[12px] font-semibold text-slate-500">
                            برای این قرارداد رویداد زمان‌مند مالی قابل نمایش پیدا نشد.
                          </div>
                        ) : (
                          <div className="report-clone-empty-surface mt-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-[12px] font-semibold text-slate-500">
                            این نسخه، تاریخچه مالی داخلی را نمایش نمی‌دهد.
                          </div>
                        )}
                      </div>

                      <div className="mt-6 border-t border-slate-100 pt-5">
                        <div className="report-clone-section-title text-[13px] font-black text-slate-900">موارد ناقص در تاریخچه مالی</div>
                        {visibleFinancialHistoryGaps.length > 0 ? (
                          <ul className="report-clone-empty-surface mt-3 space-y-2 rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-4 text-[11px] font-semibold leading-6 text-slate-600">
                            {visibleFinancialHistoryGaps.map((gap) => (
                              <li key={gap}>• {gap}</li>
                            ))}
                          </ul>
                        ) : canSeeInternalTrace ? (
                          <div className="mt-3 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-[11px] font-semibold leading-6 text-emerald-700">
                            در دادهٔ فعلی، مورد ناقص آشکاری برای تاریخچه مالی این قرارداد ثبت نشده است.
                          </div>
                        ) : (
                          <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-[11px] font-semibold leading-6 text-slate-600">
                            این نسخه، گپ‌های داخلی تاریخچه مالی را نمایش نمی‌دهد.
                          </div>
                        )}
                      </div>
                    </section>
                  </section>
                </section>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-5 2xl:gap-6">
                  {/* موبایل: جزئیات، خلاصه؛ دسکتاپ: دو ستون مساوی + ردیف تمام‌عرض فقط برای سررسیدها */}
                  <aside className="order-2 grid w-full content-start gap-4 xl:order-1 xl:self-start">
                    <section className="rounded-[22px] border border-slate-200/80 bg-white/95 p-4 text-right shadow-sm md:p-5">
                      <div className="report-clone-section-title text-[13px] font-black text-slate-900">خلاصه گزارش‌ها</div>
                      <p className="mt-2 text-[10px] font-semibold leading-5 text-slate-500">
                        روی هر ردیف کلیک کنید تا همان بخش در «جزئیات مالی» باز شود. ستون پرداخت‌شده از فیش‌های ثبت‌شده و تخصیص به
                        سررسید پر می‌شود؛ مبلغ جریمه تا زمان دریافت اطلاعات از سرور به‌صورت «—» نمایش داده می‌شود.
                        برای نمایش همهٔ ردیف‌های مالی، روی «جمع کل» در سطر پایانی بزنید.
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
                                <tr
                                  role="button"
                                  tabIndex={0}
                                  aria-pressed={activeSummaryGroupId === SUMMARY_TOTAL_GROUP_ID}
                                  title="نمایش جمع کل همه ردیف‌های مالی"
                                  onClick={() => setSelectedSummaryGroupId(SUMMARY_TOTAL_GROUP_ID)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setSelectedSummaryGroupId(SUMMARY_TOTAL_GROUP_ID);
                                    }
                                  }}
                                  className={`border-t-2 border-dashed border-slate-300 transition hover:bg-slate-100/80 focus-visible:outline-none ${
                                    activeSummaryGroupId === SUMMARY_TOTAL_GROUP_ID
                                      ? 'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--dark-teal)_14%,white),color-mix(in_srgb,var(--dark-teal)_08%,white))] ring-2 ring-inset ring-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)]'
                                      : 'bg-slate-50/80'
                                  }`}
                                >
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
                          <h3 className="report-clone-section-title text-[13px] font-black text-slate-800">تفکیک زیربخش‌ها</h3>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">
                            مبالغ کل زیربخش از قرارداد است؛ جریمه و پرداخت زیربخش تنها با دادهٔ برگشتی از سرور پر می‌شود.
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
                        className="report-clone-section-card order-3 min-w-0 w-full p-4 text-right md:p-6 lg:p-8 xl:col-span-2"
                        aria-label="فهرست رسیدها و فیش‌ها"
                      >
                      <div className="flex flex-wrap items-start gap-3 border-b border-slate-100 pb-4">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_85%,black)]">
                          <FileText className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="report-clone-section-title text-[15px] font-black text-slate-900 md:text-[16px]">فهرست رسیدها و فیش‌ها</h3>
                          <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">
                            نمای ماهانه سررسیدهای مرتبط با «{selectedReportGroup.title}»؛ پرداختی هر ردیف از فیش‌های ثبت‌شده همین
                            قرارداد محاسبه شده است. با «مشاهده فیش‌ها» جزئیات همان سررسید را ببینید.
                          </p>
                        </div>
                      </div>
                      {filteredDueBuckets.length === 0 ? (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] font-semibold text-amber-900">
                          سررسید ثبت‌شده تشخیص داده نشد؛ اگر تاریخ سررسید خارج از فرمت معمول ذخیره شده، در بخش تاریخچه پرداخت بررسی
                          کنید.
                        </div>
                      ) : (
                        <div className="mt-5 space-y-3">
                          <DueMonthAccordionList
                            buckets={filteredDueBuckets}
                            collapsedMonths={collapsedSummaryDueMonths}
                            toggleMonth={toggleSummaryDueMonth}
                            allocationByDueId={receiptAllocation.dueById}
                            penaltyDetailsByPrincipalDueId={penaltyTimeline.penaltyDetailsByPrincipalDueId}
                            onViewReceipts={(payload, summary) =>
                              setReceiptDetails({
                                payload,
                                receipts: summary?.receipts ?? [],
                                summary,
                              })
                            }
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

        <ReceiptDetailsDialog state={receiptDetails} onClose={() => setReceiptDetails(null)} />
      </main>
    </PanelLayout>
  );
}

function transferKindLabel(kind: RegisteredReceiptRecord['transferKind']) {
  switch (kind) {
    case 'card_to_card':
      return 'کارت به کارت';
    case 'account_transfer':
      return 'حساب به حساب';
    case 'remittance':
      return 'حواله';
    case 'cheque':
      return 'چک';
    case 'cash':
      return 'نقد';
    default:
      return 'پرداخت';
  }
}

function ReceiptSummaryCard({ label, value, tone }: { label: string; value: string; tone?: 'teal' }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 shadow-sm ${
        tone === 'teal'
          ? 'border-[color-mix(in_srgb,var(--dark-teal)_22%,#cbd5e1)] bg-[color-mix(in_srgb,var(--dark-teal)_06%,white)]'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1.5 text-[15px] font-black tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

function ReceiptDetailsDialog({
  state,
  onClose,
}: {
  state: ReceiptDetailsState;
  onClose: () => void;
}) {
  if (!state) return null;
  const allocatedPaid = state.summary?.paidAmountRial ?? 0;
  const remaining =
    state.summary?.remainingAmountRial ?? Math.max(0, Number(state.payload.row.amount || 0) - allocatedPaid);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[min(860px,calc(100vh-42px))] w-full max-w-3xl flex-col overflow-hidden rounded-t-[26px] border border-white/75 bg-white shadow-2xl sm:rounded-[26px]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-[15px] font-black text-slate-900">جزئیات فیش‌های سررسید</div>
            <div className="mt-1 text-[12px] font-semibold text-slate-500">
              {state.payload.row.title} · سررسید {state.payload.row.dueDate}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50/70 px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <ReceiptSummaryCard label="مبلغ سررسید" value={formatMoneyRial(state.payload.row.amount)} />
            <ReceiptSummaryCard label="پرداختی تخصیص‌یافته" value={formatMoneyRial(allocatedPaid)} tone="teal" />
            <ReceiptSummaryCard label="مانده" value={formatMoneyRial(remaining)} />
          </div>
          <div className="mt-4 space-y-3">
            {state.receipts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
                <div className="text-[13px] font-black text-slate-700">برای این سررسید هنوز فیشی ثبت نشده است.</div>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  از صفحه سررسیدها و فیش‌ها می‌توانید فیش واریزی ثبت کنید.
                </p>
              </div>
            ) : (
              state.receipts.map((receipt, index) => {
                const allocatedToDue =
                  state.summary?.allocations
                    .filter((allocation) => allocation.receiptId === receipt.id)
                    .reduce((sum, allocation) => sum + allocation.amountRial, 0) ?? receipt.paidAmountRial;
                return (
                  <article key={receipt.id} className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-[13px] font-black text-slate-900">
                          فیش {Number(index + 1).toLocaleString('fa-IR')} · {transferKindLabel(receipt.transferKind)}
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-slate-500">
                          ثبت: {new Date(receipt.createdAt).toLocaleDateString('fa-IR')} · واریز:{' '}
                          {receipt.depositDate || '-'}
                        </div>
                      </div>
                      <div className="text-[15px] font-black text-emerald-700">{formatMoneyRial(allocatedToDue)}</div>
                    </div>
                    <div className="mt-3 grid gap-2 text-[11px] font-semibold text-slate-600 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 px-3 py-2">واریزکننده: {receipt.depositorName || '-'}</div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2">
                        دارنده مقصد: {receipt.destinationHolders.join('، ') || receipt.destinationHolder || '-'}
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2">مقصد: {receipt.destinationValue || '-'}</div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2">
                        شماره پیگیری/مرجع: {receipt.trackingNumber || receipt.referenceNumber || receipt.receiptNumber || '-'}
                      </div>
                    </div>
                    {receipt.documents?.length ? (
                      <div className="mt-3">
                        <div className="text-[11px] font-black text-slate-700">مدارک</div>
                        <div className="mt-2 space-y-2">
                          {receipt.documents.map((doc) => (
                            <div key={doc.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                              <div className="text-[12px] font-black text-slate-800">{doc.title}</div>
                              <div className="mt-1 text-[11px] font-semibold text-slate-500">
                                {doc.category || 'بدون دسته‌بندی'} · {doc.files.length.toLocaleString('fa-IR')} فایل
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

