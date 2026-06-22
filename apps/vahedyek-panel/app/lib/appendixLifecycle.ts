import type { ContractAppendixStatus as PrismaAppendixStatus } from '@/lib/prisma-client';
import { CONTRACT_APPENDIX_TAG_MAP } from './contractAppendixConfig';
import {
  GENERIC_CONDITION_APPENDIX_TAGS,
  GENERIC_DATE_APPENDIX_TAGS,
  GENERIC_FINANCIAL_APPENDIX_TAGS,
  normalizeTechnicalSpecGroups,
} from './appendixPayloads';
import {
  APPENDIX_ADJUSTMENT_LINE_ID,
  APPENDIX_ADJUSTMENT_TITLE,
  APPENDIX_CONTRACT_BASE_TITLE,
  createInitialAppendixPayload,
  getContractBaselinePayload,
} from './appendixPayloads';
import type {
  AppendixSourceKind,
  AppendixStatus,
  AppendixTagKey,
  ContractAppendix,
  ContractAppendixItem,
  ContractPartiesData,
  ContractTerminationData,
  SupportedAppendixTagKey,
} from '../types/contract';

type ContractLike = {
  id: string;
  data?: {
    subject?: { contractNumber?: string | null; deliveryDate?: string | null } | null;
    parties?: ContractPartiesData | null;
  } | null;
};

export function serializeAppendixStatus(status: PrismaAppendixStatus | string): AppendixStatus {
  if (status === 'APPROVED') return 'completed';
  if (status === 'IN_REVIEW') return 'pending_approval';
  return 'draft';
}

export function appendixStatusLabel(status: AppendixStatus) {
  switch (status) {
    case 'draft':
      return 'پیش‌نویس متمم';
    case 'pending_approval':
      return 'در انتظار تایید';
    case 'completed':
      return 'تکمیل شده';
    default:
      return 'پیش‌نویس متمم';
  }
}

export function getAppendixPreviousSourceLabel(params: {
  sourceKind: AppendixSourceKind;
  sourceId?: string | null;
  sourceAppendixNumber?: number | null;
  contractNumber?: string | null;
}) {
  if (params.sourceKind === 'appendix') {
    return `متمم شماره ${params.sourceAppendixNumber?.toLocaleString('fa-IR') ?? '—'}`;
  }

  return `اصل قرارداد شماره ${params.contractNumber ?? '—'}`;
}

export function buildAppendixSummary(tagKeys: AppendixTagKey[]) {
  const titles = tagKeys.map((key) => CONTRACT_APPENDIX_TAG_MAP.get(key)?.title ?? key);
  if (titles.length === 0) return 'متمم جدید ثبت شد.';
  if (titles.length === 1) return `این متمم برای ${titles[0]} ثبت شده است.`;
  return `این متمم برای ${titles.slice(0, -1).join('، ')} و ${titles[titles.length - 1]} ثبت شده است.`;
}

function summarizeFinancialPayload(item: ContractAppendixItem, headerId: string, defaultTitle: string) {
  const categories = Array.isArray(item.payload.categories) ? item.payload.categories : [];
  const dueItems = Array.isArray(item.payload.dueItems) ? item.payload.dueItems : [];
  const header = categories.find((entry: any) => entry?.id === headerId);
  const amount = Number(header?.capAmount ?? 0);
  return [
    `ردیف مالی ${String(header?.name ?? defaultTitle)}`,
    amount > 0 ? `سقف مبلغ: ${Math.round(amount).toLocaleString('fa-IR')} تومان` : '',
    dueItems.length ? `${dueItems.length.toLocaleString('fa-IR')} سررسید ثبت شده` : 'بدون سررسید ثبت‌شده',
  ]
    .filter(Boolean)
    .join(' • ');
}

function summarizeSideCostsPayload(item: ContractAppendixItem) {
  const categories = Array.isArray(item.payload.categories) ? item.payload.categories : [];
  const dueItems = Array.isArray(item.payload.dueItems) ? item.payload.dueItems : [];
  const roots = categories.filter((entry: any) => typeof entry?.id === 'string' && !String(entry.id).includes(':'));
  return [
    `${roots.length.toLocaleString('fa-IR')} ردیف مالی جانبی`,
    dueItems.length ? `${dueItems.length.toLocaleString('fa-IR')} سررسید ثبت شده` : 'بدون سررسید ثبت‌شده',
  ].join(' • ');
}

function summarizeLoanPayload(item: ContractAppendixItem) {
  const status = String(item.payload.paymentStatus ?? 'unselected');
  const amount = Number(item.payload.loanAmount ?? 0);
  const bank = String(item.payload.selectedBank ?? '').trim();
  const statusLabel =
    status === 'full'
      ? 'پرداخت کامل'
      : status === 'less'
        ? 'پرداخت کمتر از مبلغ قرارداد'
        : status === 'more'
          ? 'پرداخت بیشتر از مبلغ قرارداد'
          : status === 'none'
            ? 'بدون پرداخت'
            : 'وضعیت نامشخص';

  return [
    `وضعیت: ${statusLabel}`,
    amount > 0 ? `مبلغ وام: ${Math.round(amount).toLocaleString('fa-IR')} ریال` : '',
    bank ? `بانک عامل: ${bank}` : '',
  ]
    .filter(Boolean)
    .join(' • ');
}

function summarizePenaltyWaiverPayload(item: ContractAppendixItem) {
  const mode = String(item.payload.mode ?? 'fixed');
  const period = String(item.payload.period ?? 'monthly');
  const fixedAmount = String(item.payload.fixedAmount ?? item.payload.amount ?? '').trim();
  const penaltyPercent = String(item.payload.penaltyPercent ?? '').trim();
  const bankInterestPercent = String(item.payload.bankInterestPercent ?? '').trim();
  const graceDays = String(item.payload.graceDays ?? '').trim();
  const roundRule = String(item.payload.roundRule ?? '').trim();
  const extraFeeEnabled = Boolean(item.payload.extraFeeEnabled);
  const extraFeeType = String(item.payload.extraFeeType ?? 'percent');
  const extraFeeAmount = String(item.payload.extraFeeAmount ?? '').trim();
  const progressiveRows = Array.isArray(item.payload.progressiveRows) ? item.payload.progressiveRows : [];

  return [
    `روش: ${
      mode === 'fixed'
        ? 'مبلغ ثابت'
        : mode === 'overdue'
          ? 'درصدی از مانده بدهی معوق'
          : mode === 'contract'
            ? 'درصدی از کل قرارداد'
            : 'جریمه تصاعدی'
    }`,
    `دوره: ${period === 'daily' ? 'روزانه' : period === 'yearly' ? 'سالانه' : 'ماهانه'}`,
    fixedAmount ? `مبلغ ثابت: ${fixedAmount} تومان` : '',
    penaltyPercent ? `درصد جریمه: ${penaltyPercent}%` : '',
    bankInterestPercent ? `درصد سود بانکی: ${bankInterestPercent}%` : '',
    mode === 'progressive' ? `${progressiveRows.length.toLocaleString('fa-IR')} بازه تصاعدی` : '',
    graceDays ? `مهلت تنفس: ${graceDays} روز` : '',
    roundRule ? `قاعده گرد کردن: ${roundRule}` : '',
    extraFeeEnabled ? `هزینه دیرکرد: ${extraFeeType === 'fixed' ? 'مبلغ ثابت' : 'درصدی'}${extraFeeAmount ? ` ${extraFeeAmount}` : ''}` : '',
  ]
    .filter(Boolean)
    .join(' â€¢ ');
}

function summarizeMaterialSpecsChangePayload(item: ContractAppendixItem) {
  const specs = normalizeTechnicalSpecGroups(item.payload.specs ?? item.payload.groups);
  if (specs.length) {
    const groupCount = specs.length.toLocaleString('fa-IR');
    const selectedCount = specs.reduce((sum, group) => sum + group.selectedSpecIds.length, 0).toLocaleString('fa-IR');
    const titles = specs.map((group) => group.title).filter(Boolean);

    return [
      `گروه‌ها: ${groupCount}`,
      `مشخصه‌های انتخاب‌شده: ${selectedCount}`,
      titles.length ? titles.slice(0, 3).join('، ') : '',
    ]
      .filter(Boolean)
      .join(' • ');
  }

  const changeTypes = Array.isArray(item.payload.changeTypes) ? item.payload.changeTypes.map((entry) => String(entry).trim()).filter(Boolean) : [];
  const outcomes = Array.isArray(item.payload.selectedOutcomes) ? item.payload.selectedOutcomes.map((entry) => String(entry).trim()).filter(Boolean) : [];
  const importanceLevel = String(item.payload.importanceLevel ?? '').trim();
  const enforcementEnabled = Boolean(item.payload.enforcementEnabled);

  return [
    changeTypes.length ? `دامنه تغییر: ${changeTypes.join('، ')}` : '',
    importanceLevel ? `سطح اهمیت: ${importanceLevel}` : '',
    outcomes.length ? `خروجی: ${outcomes.join('، ')}` : '',
    enforcementEnabled ? 'اقدام قراردادی فعال شده است' : 'ثبت پرونده بدون اقدام قراردادی',
  ]
    .filter(Boolean)
    .join(' • ');
}

function builderModeLabel(mode: string) {
  switch (mode) {
    case 'fixed':
      return 'مبلغ ثابت';
    case 'percent':
      return 'درصدی';
    case 'progressive':
      return 'تصاعدی';
    default:
      return '—';
  }
}

function builderPeriodLabel(period: string) {
  switch (period) {
    case 'روزانه':
      return 'روزانه';
    case 'ماهانه':
      return 'ماهانه';
    case 'سالانه':
      return 'سالانه';
    default:
      return '—';
  }
}

function summarizeBuilderPenaltyPayload(item: ContractAppendixItem) {
  const unitEnabled = Boolean(item.payload.unitDeliveryDelayEnabled);
  const materialEnabled = Boolean(item.payload.materialSpecsChangeEnabled);
  const unitMode = String(item.payload.unitDeliveryDelayMode ?? 'fixed');
  const materialMode = String(item.payload.materialSpecsChangeMode ?? 'fixed');
  const unitPeriod = String(item.payload.unitDeliveryDelayPeriod ?? 'روزانه');
  const materialPeriod = String(item.payload.materialSpecsChangePeriod ?? 'روزانه');
  const includedTypes = Array.isArray(item.payload.materialSpecsChangeIncludedTypes) ? item.payload.materialSpecsChangeIncludedTypes : [];
  const importanceLevel = String(item.payload.materialSpecsChangeImportanceLevel ?? '').trim();

  return [
    unitEnabled ? `تأخیر در تحویل واحد: ${builderModeLabel(unitMode)} • ${builderPeriodLabel(unitPeriod)}` : '',
    materialEnabled ? `تغییرات مشخصات فنی پروژه: ${builderModeLabel(materialMode)} • ${builderPeriodLabel(materialPeriod)}` : '',
    includedTypes.length ? `حوزه تغییرات: ${includedTypes.length.toLocaleString('fa-IR')} مورد` : '',
    importanceLevel ? `سطح اهمیت: ${importanceLevel}` : '',
  ]
    .filter(Boolean)
    .join(' • ');
}

const BUILDER_TERMINATION_SECTION_LABELS: Record<string, string> = {
  lateInstallment: 'تاخیر در پرداخت اقساط',
  financialObligations: 'عدم انجام تعهدات مالی',
  documentDeficiencies: 'نقص مدارک / تعهدات',
  otherBreach: 'نقض سایر تعهدات قراردادی',
  notifications: 'اطلاع‌رسانی',
};

const BUYER_TERMINATION_SECTION_LABELS: Record<string, string> = {
  lateDelivery: 'تاخیر در تحویل واحد',
  specificationChanges: 'تغییر مشخصات',
  breachOfObligations: 'نقض تعهدات سازنده',
  physicalProgressDelay: 'تاخیر در تحقق مراحل پیشرفت پروژه',
  areaDiscrepancy: 'اختلاف متراژ واحد',
  notification: 'اطلاع‌رسانی',
};

function summarizeTerminationPayload(item: ContractAppendixItem, side: 'builder' | 'buyer') {
  const payload = item.payload as unknown as ContractTerminationData;
  const enabledSections =
    side === 'builder'
      ? Object.entries(payload.constructorTerms ?? {}).filter(([, section]) => Boolean(section?.ruleEnabled))
      : Object.entries(payload.buyerTerms ?? {}).filter(([, section]) => Boolean(section?.ruleEnabled));
  const labels = enabledSections
    .map(([key]) => (side === 'builder' ? BUILDER_TERMINATION_SECTION_LABELS[key] : BUYER_TERMINATION_SECTION_LABELS[key]) ?? key)
    .filter(Boolean);
  const rootEnabled =
    side === 'builder'
      ? Boolean(payload.terminationEnabled && payload.sellerTerminationEngaged)
      : Boolean(payload.terminationEnabled && payload.buyerTerminationEngaged);

  return [
    rootEnabled ? 'فعال' : 'غیرفعال',
    `${enabledSections.length.toLocaleString('fa-IR')} بخش فعال`,
    labels.length ? labels.slice(0, 3).join('، ') : 'بدون بخش فعال',
  ].join(' • ');
}

function summarizeGenericPayload(item: ContractAppendixItem) {
  const title = String(item.payload.title ?? item.description ?? '').trim();
  const detailText = String(item.payload.detailText ?? '').trim();
  const amount = String(item.payload.amount ?? '').trim();
  const previousDate = String(item.payload.previousDate ?? '').trim();
  const nextDate = String(item.payload.nextDate ?? '').trim();
  const notes = String(item.payload.notes ?? '').trim();

  return [
    title ? `عنوان: ${title}` : '',
    detailText ? detailText : '',
    amount ? `مبلغ: ${Math.round(Number(amount)).toLocaleString('fa-IR')} تومان` : '',
    previousDate ? `تاریخ قبلی: ${previousDate}` : '',
    nextDate ? `تاریخ جدید: ${nextDate}` : '',
    notes ? `یادداشت: ${notes}` : '',
  ]
    .filter(Boolean)
    .join(' • ');
}

export function appendixItemValueText(item: ContractAppendixItem) {
  if (item.tagKey === 'loan') {
    return summarizeLoanPayload(item);
  }

  if (item.tagKey === 'unit-delivery-date') {
    const previousDate = String(item.payload.previousDate ?? '').trim();
    const nextDate = String(item.payload.nextDate ?? '').trim();
    return [previousDate ? `تاریخ قبلی: ${previousDate}` : '', nextDate ? `تاریخ جدید: ${nextDate}` : ''].filter(Boolean).join(' • ');
  }

  if (item.tagKey === 'first-party' || item.tagKey === 'second-party') {
    const parties = Array.isArray(item.payload.parties) ? (item.payload.parties as any[]) : [];
    if (!parties.length) return item.description;
    return parties
      .map((party) => {
        const share = party?.share?.value ?? 0;
        const mode = party?.share?.mode === 'percent' ? 'درصد' : 'دانگ';
        return `${party?.name ?? '—'} (${String(share).replace(/\.0$/, '')} ${mode})`;
      })
      .join(' • ');
  }

  if (item.tagKey === 'adjustment') {
    return summarizeFinancialPayload(item, APPENDIX_ADJUSTMENT_LINE_ID, APPENDIX_ADJUSTMENT_TITLE);
  }

  if (item.tagKey === 'contract-base-costs') {
    return summarizeFinancialPayload(item, 'principal', APPENDIX_CONTRACT_BASE_TITLE);
  }

  if (item.tagKey === 'side-costs') {
    return summarizeSideCostsPayload(item);
  }

  if (item.tagKey === 'material-specs-change') {
    return summarizeMaterialSpecsChangePayload(item);
  }

  if (item.tagKey === 'penalty-waiver') {
    return summarizePenaltyWaiverPayload(item);
  }

  if (item.tagKey === 'builder-penalty') {
    return summarizeBuilderPenaltyPayload(item);
  }

  if (item.tagKey === 'builder-cancellation') {
    return summarizeTerminationPayload(item, 'builder');
  }

  if (item.tagKey === 'buyer-cancellation') {
    return summarizeTerminationPayload(item, 'buyer');
  }

  if (
    GENERIC_FINANCIAL_APPENDIX_TAGS.includes(item.tagKey as (typeof GENERIC_FINANCIAL_APPENDIX_TAGS)[number]) ||
    GENERIC_CONDITION_APPENDIX_TAGS.includes(item.tagKey as (typeof GENERIC_CONDITION_APPENDIX_TAGS)[number]) ||
    GENERIC_DATE_APPENDIX_TAGS.includes(item.tagKey as (typeof GENERIC_DATE_APPENDIX_TAGS)[number])
  ) {
    return summarizeGenericPayload(item);
  }

  return String(item.payload.detailText ?? '').trim() || item.description;
}

export function buildContractBaseline(contract: ContractLike) {
  return {
    loan: {
      sourceKind: 'contract' as const,
      sourceId: contract.id,
      sourceLabel: getAppendixPreviousSourceLabel({
        sourceKind: 'contract',
        contractNumber: contract.data?.subject?.contractNumber ?? null,
      }),
      value: null,
    },
    'unit-delivery-date': {
      sourceKind: 'contract' as const,
      sourceId: contract.id,
      sourceLabel: getAppendixPreviousSourceLabel({
        sourceKind: 'contract',
        contractNumber: contract.data?.subject?.contractNumber ?? null,
      }),
      value: contract.data?.subject?.deliveryDate ?? '',
    },
    'first-party': {
      sourceKind: 'contract' as const,
      sourceId: contract.id,
      sourceLabel: getAppendixPreviousSourceLabel({
        sourceKind: 'contract',
        contractNumber: contract.data?.subject?.contractNumber ?? null,
      }),
      value: contract.data?.parties?.partyOne ?? [],
    },
    'second-party': {
      sourceKind: 'contract' as const,
      sourceId: contract.id,
      sourceLabel: getAppendixPreviousSourceLabel({
        sourceKind: 'contract',
        contractNumber: contract.data?.subject?.contractNumber ?? null,
      }),
      value: contract.data?.parties?.partyTwo ?? [],
    },
    adjustment: {
      sourceKind: 'contract' as const,
      sourceId: contract.id,
      sourceLabel: getAppendixPreviousSourceLabel({
        sourceKind: 'contract',
        contractNumber: contract.data?.subject?.contractNumber ?? null,
      }),
      value: null,
    },
    'contract-base-costs': {
      sourceKind: 'contract' as const,
      sourceId: contract.id,
      sourceLabel: getAppendixPreviousSourceLabel({
        sourceKind: 'contract',
        contractNumber: contract.data?.subject?.contractNumber ?? null,
      }),
      value: null,
    },
    'side-costs': {
      sourceKind: 'contract' as const,
      sourceId: contract.id,
      sourceLabel: getAppendixPreviousSourceLabel({
        sourceKind: 'contract',
        contractNumber: contract.data?.subject?.contractNumber ?? null,
      }),
      value: null,
    },
  };
}

export function createAppendixSnapshotMap(items: ContractAppendixItem[]) {
  const map = new Map<AppendixTagKey, ContractAppendixItem>();
  for (const item of items) {
    map.set(item.tagKey, item);
  }
  return map;
}

export function buildAppendixCompareRows(params: {
  current: ContractAppendix;
  previous: {
    sourceKind: AppendixSourceKind;
    sourceLabel: string;
    sourceItem?: ContractAppendixItem | null;
    contractValue?: unknown;
  };
}) {
  return params.current.items.map((item) => {
    const previousPayload =
      params.previous.sourceItem?.payload ??
      (item.tagKey === 'unit-delivery-date'
        ? { deliveryDate: params.previous.contractValue ?? '' }
        : item.tagKey === 'first-party' || item.tagKey === 'second-party'
          ? { parties: Array.isArray(params.previous.contractValue) ? params.previous.contractValue : [] }
          : createInitialAppendixPayload(item.tagKey as SupportedAppendixTagKey));

    return {
      tagKey: item.tagKey,
      title: item.title,
      sourceLabel: params.previous.sourceLabel,
      previousPayload,
      currentPayload: item.payload,
    };
  });
}

export function getContractComparePayload(contract: any, tagKey: SupportedAppendixTagKey) {
  const payload = getContractBaselinePayload(tagKey, contract);
  if (tagKey === 'unit-delivery-date') {
    return { deliveryDate: (payload as any).previousDate ?? '' };
  }
  if (tagKey === 'first-party' || tagKey === 'second-party') {
    return { parties: (payload as any).parties ?? [] };
  }
  if (tagKey === 'builder-cancellation' || tagKey === 'buyer-cancellation') {
    return payload;
  }
  return payload;
}

export type AppendixHistoryEntry = {
  sourceType: 'contract' | 'appendix';
  sourceLabel: string;
  appendixNumber: number | null;
  effectiveDate: string | null;
  createdAt: string | null;
  isCurrent: boolean;
  status: AppendixStatus | 'completed';
  payload: Record<string, unknown>;
};

export type AppendixHistorySection = {
  tagKey: AppendixTagKey;
  title: string;
  entries: AppendixHistoryEntry[];
};

function cloneHistoryPayload(payload: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(payload ?? {})) as Record<string, unknown>;
}

export function buildAppendixHistorySections(params: {
  current: ContractAppendix;
  approvedAppendices: ContractAppendix[];
  contract: any;
}): AppendixHistorySection[] {
  const contractLabel = getAppendixPreviousSourceLabel({
    sourceKind: 'contract',
    contractNumber: params.contract?.data?.subject?.contractNumber ?? null,
  });

  return params.current.items.map((currentItem) => {
    const tagKey = currentItem.tagKey;
    const title = currentItem.title || CONTRACT_APPENDIX_TAG_MAP.get(tagKey)?.title || tagKey;
    const contractPayload = getContractComparePayload(params.contract, tagKey as SupportedAppendixTagKey) as Record<string, unknown>;
    const entries: AppendixHistoryEntry[] = [
      {
        sourceType: 'contract',
        sourceLabel: contractLabel,
        appendixNumber: null,
        effectiveDate: null,
        createdAt: params.contract?.createdAt ?? null,
        isCurrent: false,
        status: 'completed',
        payload: cloneHistoryPayload(contractPayload),
      },
    ];
    let lastPayload = cloneHistoryPayload(contractPayload);

    for (const appendix of params.approvedAppendices) {
      const appendixItem = appendix.items.find((item) => item.tagKey === tagKey);
      const payload =
        appendix.id === params.current.id
          ? cloneHistoryPayload(currentItem.payload)
          : appendixItem
            ? cloneHistoryPayload(appendixItem.payload)
            : cloneHistoryPayload(lastPayload);

      entries.push({
        sourceType: 'appendix',
        sourceLabel: `متمم شماره ${appendix.appendixNumber.toLocaleString('fa-IR')}`,
        appendixNumber: appendix.appendixNumber,
        effectiveDate: appendix.effectiveDate || null,
        createdAt: appendix.createdAt || null,
        isCurrent: appendix.id === params.current.id,
        status: appendix.status,
        payload,
      });
      lastPayload = cloneHistoryPayload(payload);
    }

    if (!entries.some((entry) => entry.sourceType === 'appendix' && entry.appendixNumber === params.current.appendixNumber)) {
      entries.push({
        sourceType: 'appendix',
        sourceLabel: `متمم شماره ${params.current.appendixNumber.toLocaleString('fa-IR')}`,
        appendixNumber: params.current.appendixNumber,
        effectiveDate: params.current.effectiveDate || null,
        createdAt: params.current.createdAt || null,
        isCurrent: true,
        status: params.current.status,
        payload: cloneHistoryPayload(currentItem.payload),
      });
    }

    return { tagKey, title, entries };
  });
}
