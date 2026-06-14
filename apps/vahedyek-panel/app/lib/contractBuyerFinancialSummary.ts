import { buildReceiptAllocation } from './contractReceiptAllocation';
import {
  buildApprovedReceiptTrend,
  buildInstallmentStatusItems,
  type InstallmentChartDatum,
  type PaymentTrendPoint,
} from './contractFinancialChartUtils';
import { computeContractTotalRialFromFinancial } from './contractFinancialPricing';
import { buildContractPenaltyTimeline } from './contractPenaltyEngine';
import type { RegisteredReceiptRecord } from './contractReceipts';
import { toComparableDateFromDueString } from './financialUtils';

type Tone = 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan';

type BuyerFinancialCharts = {
  paymentBreakdown: {
    confirmedPaidRial: number;
    pendingReviewRial: number;
    remainingDebtRial: number;
    settled: boolean;
  };
  installmentStatus: {
    totalCount: number;
    items: InstallmentChartDatum[];
  };
  paymentTrend: {
    points: PaymentTrendPoint[];
    approvedReceiptCount: number;
    missingTimelineCount: number;
  };
  penalties: {
    calculatedRial: number | null;
    appliedRial: number;
    paidRial: number;
    forgivenRial: number | null;
    remainingRial: number;
    totalCount: number;
  };
};

export type BuyerFinancialSummary = {
  contractNumber: string;
  contractDate: string;
  contractTypeLabel: string;
  unitLabel: string;
  totalAmountRial: number | null;
  confirmedPaidRial: number | null;
  pendingReviewRial: number | null;
  remainingDebtRial: number | null;
  overdueDebtRial: number | null;
  futureDebtRial: number | null;
  openPenaltyRial: number | null;
  settlementStatus: { label: string; tone: Tone } | null;
  readinessStatus: { label: string; tone: Tone } | null;
  gaps: string[];
  charts: BuyerFinancialCharts;
  hasFinancialData: boolean;
};

function formatContractTypeLabel(value: unknown) {
  switch (String(value ?? '').trim()) {
    case 'pre-sale':
      return 'پیش‌فروش';
    case 'sale':
      return 'فروش';
    case 'lease':
      return 'اجاره';
    case 'mortgage':
      return 'رهن';
    default:
      return 'نامشخص';
  }
}

function formatUnitLabel(subject: any) {
  const parts = [subject?.blockName, subject?.floorName ? `طبقه ${subject.floorName}` : '', subject?.unitName].filter(Boolean);
  return parts.length ? parts.join(' - ') : 'نامشخص';
}

function buildEmptyCharts(): BuyerFinancialCharts {
  return {
    paymentBreakdown: {
      confirmedPaidRial: 0,
      pendingReviewRial: 0,
      remainingDebtRial: 0,
      settled: false,
    },
    installmentStatus: {
      totalCount: 0,
      items: [],
    },
    paymentTrend: {
      points: [],
      approvedReceiptCount: 0,
      missingTimelineCount: 0,
    },
    penalties: {
      calculatedRial: null,
      appliedRial: 0,
      paidRial: 0,
      forgivenRial: null,
      remainingRial: 0,
      totalCount: 0,
    },
  };
}

export function buildBuyerFinancialSummary(contract: any, receipts: RegisteredReceiptRecord[]): BuyerFinancialSummary {
  const subject = contract?.data?.subject ?? null;
  const financial = contract?.data?.financial ?? null;
  const penalties = contract?.data?.penalties ?? null;
  const terminationRules = contract?.data?.terminationRules ?? null;

  const contractNumber = String(subject?.contractNumber ?? 'نامشخص');
  const contractDate = String(subject?.contractDate ?? 'نامشخص');
  const contractTypeLabel = formatContractTypeLabel(subject?.contractType);
  const unitLabel = formatUnitLabel(subject);

  if (!financial) {
    return {
      contractNumber,
      contractDate,
      contractTypeLabel,
      unitLabel,
      totalAmountRial: null,
      confirmedPaidRial: null,
      pendingReviewRial: null,
      remainingDebtRial: null,
      overdueDebtRial: null,
      futureDebtRial: null,
      openPenaltyRial: null,
      settlementStatus: null,
      readinessStatus: { label: 'نیازمند بررسی مالی', tone: 'slate' },
      gaps: ['اطلاعات مالی قرارداد در داده فعلی موجود نیست.'],
      charts: buildEmptyCharts(),
      hasFinancialData: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const approvedReceipts = receipts.filter((receipt) => receipt.reviewStatus === 'approved');
  const pendingReceipts = receipts.filter((receipt) => receipt.reviewStatus === 'pending');
  const unidentifiedReceipts = receipts.filter((receipt) => !receipt.reviewStatus);

  const approvedPenaltyTimeline = buildContractPenaltyTimeline({
    financial,
    penalties,
    receipts: approvedReceipts,
  });

  const approvedReceiptAllocation = buildReceiptAllocation({
    buckets: approvedPenaltyTimeline.combinedBuckets,
    receipts: approvedReceipts,
  });

  const dueSummaries = Object.values(approvedReceiptAllocation.dueById);
  const principalSummaries = dueSummaries.filter((summary) => summary.row.sourceKind !== 'penalty');
  const penaltySummaries = dueSummaries.filter((summary) => summary.row.sourceKind === 'penalty');

  const totalAmountRial = Math.max(0, Math.round(computeContractTotalRialFromFinancial(financial)));
  const confirmedPaidRial = approvedReceiptAllocation.totalAllocatedRial;
  const confirmedPrincipalPaidRial = principalSummaries.reduce((sum, summary) => sum + Math.max(0, summary.paidAmountRial), 0);
  const pendingReviewRial = pendingReceipts.reduce((sum, receipt) => sum + Number(receipt.paidAmountRial ?? 0), 0);
  const unidentifiedRial = unidentifiedReceipts.reduce((sum, receipt) => sum + Number(receipt.paidAmountRial ?? 0), 0);

  const remainingDebtRial = principalSummaries.reduce((sum, summary) => sum + summary.remainingAmountRial, 0);
  const overdueDebtRial = principalSummaries.reduce((sum, summary) => {
    const dueDate = toComparableDateFromDueString(summary.row.dueDate);
    if (!dueDate || dueDate >= today) return sum;
    return sum + summary.remainingAmountRial;
  }, 0);
  const futureDebtRial = Math.max(0, remainingDebtRial - overdueDebtRial);
  const openPenaltyRial = penaltySummaries.reduce((sum, summary) => sum + summary.remainingAmountRial, 0);
  const hasUnknownDueDates = principalSummaries.some((summary) => !toComparableDateFromDueString(summary.row.dueDate));

  const installmentStatus = buildInstallmentStatusItems(
    principalSummaries.map((summary) => ({
      paidRial: summary.paidAmountRial,
      remainingRial: summary.remainingAmountRial,
      dueDate: summary.row.dueDate,
    })),
  );

  const paymentTrend = buildApprovedReceiptTrend(approvedReceipts);
  const penaltyAppliedRial = approvedPenaltyTimeline.penaltyRows.reduce((sum, row) => sum + Math.max(0, Number(row.amount ?? 0)), 0);
  const penaltyPaidRial = penaltySummaries.reduce((sum, summary) => sum + Math.max(0, summary.paidAmountRial), 0);
  const penaltyRemainingRial = penaltySummaries.reduce((sum, summary) => sum + Math.max(0, summary.remainingAmountRial), 0);

  const settlementStatus = (() => {
    if (
      remainingDebtRial <= 0 &&
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
      remainingDebtRial <= 0 &&
      openPenaltyRial <= 0 &&
      pendingReviewRial <= 0 &&
      unidentifiedRial <= 0 &&
      !hasUnknownDueDates;

    if (financiallySettled) {
      return { label: 'آماده است', tone: 'emerald' as const };
    }
    if (pendingReviewRial > 0 && remainingDebtRial <= 0 && openPenaltyRial <= 0) {
      return { label: 'مشروط است', tone: 'amber' as const };
    }
    if (unidentifiedRial > 0 || hasUnknownDueDates) {
      return { label: 'نیازمند بررسی مالی', tone: 'slate' as const };
    }
    if (terminationRules && (remainingDebtRial > 0 || openPenaltyRial > 0 || pendingReviewRial > 0)) {
      return { label: 'نیازمند بررسی حقوقی', tone: 'rose' as const };
    }
    if (!subject?.deliveryDate) {
      return { label: 'نیازمند بررسی مالی', tone: 'slate' as const };
    }
    return { label: 'آماده نیست', tone: 'rose' as const };
  })();

  const gaps: string[] = [];
  if (!subject?.deliveryDate) {
    gaps.push('تاریخ تحویل در داده فعلی موجود نیست؛ آمادگی مالی با قطعیت کامل قابل محاسبه نیست.');
  }
  if (!Array.isArray(financial?.dueItems) || financial.dueItems.length === 0) {
    gaps.push('اقساط یا تعهدات پرداختی در داده مالی فعلی موجود نیست.');
  }
  if (pendingReviewRial > 0) {
    gaps.push('بخشی از رسیدها هنوز در انتظار بررسی هستند و در تسویه قطعی لحاظ نشده‌اند.');
  }
  if (openPenaltyRial > 0 && !penalties) {
    gaps.push('جریمه باز در داده فعلی قابل محاسبه نیست چون تنظیمات جریمه در دسترس نیست.');
  }

  return {
    contractNumber,
    contractDate,
    contractTypeLabel,
    unitLabel,
    totalAmountRial,
    confirmedPaidRial,
    pendingReviewRial,
    remainingDebtRial,
    overdueDebtRial,
    futureDebtRial,
    openPenaltyRial,
    settlementStatus,
    readinessStatus,
    gaps,
    charts: {
      paymentBreakdown: {
        confirmedPaidRial: confirmedPrincipalPaidRial,
        pendingReviewRial,
        remainingDebtRial,
        settled: settlementStatus?.label === 'تسویه کامل',
      },
      installmentStatus,
      paymentTrend,
      penalties: {
        calculatedRial: null,
        appliedRial: penaltyAppliedRial,
        paidRial: penaltyPaidRial,
        forgivenRial: null,
        remainingRial: penaltyRemainingRial,
        totalCount: approvedPenaltyTimeline.penaltyRows.length,
      },
    },
    hasFinancialData: true,
  };
}
