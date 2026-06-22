import { CONTRACT_APPENDIX_TAG_GROUPS, getAppendixTagTitle } from './contractAppendixConfig';
import {
  buildAppendixHistorySections,
  getAppendixPreviousSourceLabel,
  getContractComparePayload,
  type AppendixHistoryEntry,
  type AppendixHistorySection,
} from './appendixLifecycle';
import type { ContractAppendix, SupportedAppendixTagKey } from '../types/contract';
import { isSupportedAppendixTag } from './appendixTagSupport';

export type ContractHistoryVersion = {
  id: string;
  kind: 'contract' | 'appendix';
  order: number;
  title: string;
  subtitle: string;
  tags: string[];
  appendixId?: string;
  href?: string;
  compareHref?: string;
  effectiveDate: string | null;
  createdAt: string | null;
  isCurrent: boolean;
  status?: ContractAppendix['status'];
};

export type ContractHistoryResponse = {
  contractId: string;
  contractNumber: string | null;
  currentVersionId: string;
  versions: ContractHistoryVersion[];
  sections: AppendixHistorySection[];
  stats: {
    versionCount: number;
    sectionCount: number;
    changedSectionCount: number;
  };
};

const BASELINE_TAGS: SupportedAppendixTagKey[] = [
  'unit-delivery-date',
  'first-party',
  'second-party',
  'contract-base-costs',
  'side-costs',
  'loan',
  'adjustment',
  'builder-cancellation',
  'buyer-cancellation',
];

function cloneHistoryPayload(payload: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(payload ?? {})) as Record<string, unknown>;
}

function sectionHasChanges(section: AppendixHistorySection) {
  return section.entries.some((entry, index) => {
    if (index === 0) return false;
    const prev = section.entries[index - 1];
    return stableSerialize(prev.payload) !== stableSerialize(entry.payload);
  });
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, val]) => `${key}:${stableSerialize(val)}`).join(',')}}`;
  }
  return String(value ?? '');
}

function hasVisibleFinancialPayload(payload: Record<string, unknown>) {
  const categories = Array.isArray(payload.categories) ? payload.categories : [];
  return categories.some(
    (item: any) => Number(item?.capAmount ?? 0) > 0 || Number(item?.dueAmount ?? 0) > 0 || Number(item?.noDueAmount ?? 0) > 0,
  );
}

function hasVisibleTerminationPayload(payload: Record<string, unknown>, side: 'builder' | 'buyer') {
  if (side === 'builder') {
    return Object.values((payload as any).constructorTerms ?? {}).some((section: any) => Boolean(section?.ruleEnabled));
  }

  return Object.values((payload as any).buyerTerms ?? {}).some((section: any) => Boolean(section?.ruleEnabled));
}

function hasVisibleBaselinePayload(tagKey: SupportedAppendixTagKey, payload: Record<string, unknown>) {
  if (tagKey === 'first-party' || tagKey === 'second-party') {
    return Array.isArray(payload.parties) && payload.parties.length > 0;
  }
  if (tagKey === 'unit-delivery-date') {
    return Boolean(String(payload.previousDate ?? payload.deliveryDate ?? '').trim());
  }
  if (tagKey === 'loan') {
    return String(payload.paymentStatus ?? 'unselected') !== 'unselected';
  }
  if (tagKey === 'adjustment' || tagKey === 'contract-base-costs' || tagKey === 'side-costs') {
    return hasVisibleFinancialPayload(payload);
  }
  if (tagKey === 'builder-cancellation') {
    return hasVisibleTerminationPayload(payload, 'builder');
  }
  if (tagKey === 'buyer-cancellation') {
    return hasVisibleTerminationPayload(payload, 'buyer');
  }
  return Object.keys(payload).length > 0;
}

function buildContractBaselineHistorySections(contract: any): AppendixHistorySection[] {
  const contractLabel = getAppendixPreviousSourceLabel({
    sourceKind: 'contract',
    contractNumber: contract?.data?.subject?.contractNumber ?? null,
  });

  return BASELINE_TAGS.filter((tagKey) => isSupportedAppendixTag(tagKey))
    .map((tagKey) => {
      const payload = cloneHistoryPayload(getContractComparePayload(contract, tagKey) as Record<string, unknown>);
      if (!hasVisibleBaselinePayload(tagKey, payload)) return null;

      const entry: AppendixHistoryEntry = {
        sourceType: 'contract',
        sourceLabel: contractLabel,
        appendixNumber: null,
        effectiveDate: contract?.data?.subject?.contractDate ?? null,
        createdAt: contract?.createdAt ?? contract?.updatedAt ?? null,
        isCurrent: true,
        status: 'completed',
        payload,
      };

      return {
        tagKey,
        title: getAppendixTagTitle(tagKey),
        entries: [entry],
      };
    })
    .filter(Boolean) as AppendixHistorySection[];
}

export function getAppendixTagGroupKey(tagKey: string) {
  for (const group of CONTRACT_APPENDIX_TAG_GROUPS) {
    if (group.tags.some((tag) => tag.key === tagKey)) {
      return group.key;
    }
  }
  return 'other';
}

export function getAppendixTagGroupTitle(groupKey: string) {
  const group = CONTRACT_APPENDIX_TAG_GROUPS.find((entry) => entry.key === groupKey);
  return group?.title ?? 'سایر بخش‌ها';
}

export function buildContractHistoryResponse(params: {
  contractId: string;
  contract: any;
  appendices: ContractAppendix[];
}): ContractHistoryResponse {
  const contractNumber = params.contract?.data?.subject?.contractNumber ?? null;
  const completed = params.appendices
    .filter((item) => item.status === 'completed')
    .sort((a, b) => Number(a.appendixNumber ?? 0) - Number(b.appendixNumber ?? 0));

  const contractStageId = `contract-${params.contractId}`;
  const versions: ContractHistoryVersion[] = [
    {
      id: contractStageId,
      kind: 'contract',
      order: 1,
      title: 'اصل قرارداد',
      subtitle: 'نسخه اولیه و اصلی قرارداد',
      tags: ['قرارداد پایه'],
      href: `/contracts/${params.contractId}/preview`,
      effectiveDate: params.contract?.data?.subject?.contractDate ?? null,
      createdAt: params.contract?.createdAt ?? params.contract?.updatedAt ?? null,
      isCurrent: completed.length === 0,
    },
  ];

  completed.forEach((appendix, index) => {
    const tagTitles = appendix.items.map((item) => item.title).filter(Boolean);
    versions.push({
      id: appendix.id,
      kind: 'appendix',
      order: index + 2,
      title: `متمم ${Number(appendix.appendixNumber ?? index + 1).toLocaleString('fa-IR')}`,
      subtitle: String(appendix.summary ?? 'نسخه الحاقیه تاییدشده'),
      tags: tagTitles.length ? tagTitles : ['متمم'],
      appendixId: appendix.id,
      href: `/contracts/${params.contractId}/appendices/${appendix.id}`,
      compareHref: `/contracts/${params.contractId}/appendices/${appendix.id}/compare`,
      effectiveDate: appendix.effectiveDate || null,
      createdAt: appendix.createdAt || null,
      isCurrent: index === completed.length - 1,
      status: appendix.status,
    });
  });

  const latestAppendix = completed[completed.length - 1] ?? null;
  const sections = latestAppendix
    ? buildAppendixHistorySections({
        current: latestAppendix,
        approvedAppendices: completed,
        contract: params.contract,
      })
    : buildContractBaselineHistorySections(params.contract);

  const changedSectionCount = sections.filter(sectionHasChanges).length;

  return {
    contractId: params.contractId,
    contractNumber: contractNumber ? String(contractNumber) : null,
    currentVersionId: versions[versions.length - 1]?.id ?? contractStageId,
    versions,
    sections,
    stats: {
      versionCount: versions.length,
      sectionCount: sections.length,
      changedSectionCount,
    },
  };
}

export function isSameHistoryPayload(a: Record<string, unknown>, b: Record<string, unknown>) {
  return stableSerialize(a) === stableSerialize(b);
}

export { sectionHasChanges, stableSerialize };
