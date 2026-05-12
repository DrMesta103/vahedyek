import type { ContractAppendixStatus as PrismaAppendixStatus } from '@/lib/prisma-client';
import { CONTRACT_APPENDIX_TAG_MAP } from './contractAppendixConfig';
import type {
  AppendixSourceKind,
  AppendixStatus,
  AppendixTagKey,
  ContractAppendix,
  ContractAppendixItem,
  ContractPartiesData,
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

export function appendixItemValueText(item: ContractAppendixItem) {
  if (item.tagKey === 'unit-delivery-date') {
    const previousDate = String(item.payload.previousDate ?? '').trim();
    const nextDate = String(item.payload.nextDate ?? '').trim();
    const reason = String(item.payload.reason ?? '').trim();
    return [previousDate ? `تاریخ قبلی: ${previousDate}` : '', nextDate ? `تاریخ جدید: ${nextDate}` : '', reason ? `شرح: ${reason}` : '']
      .filter(Boolean)
      .join(' • ');
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

  return String(item.payload.detailText ?? '').trim() || item.description;
}

export function buildContractBaseline(contract: ContractLike) {
  return {
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
        : { parties: Array.isArray(params.previous.contractValue) ? params.previous.contractValue : [] });

    return {
      tagKey: item.tagKey,
      title: item.title,
      sourceLabel: params.previous.sourceLabel,
      previousPayload,
      currentPayload: item.payload,
    };
  });
}
