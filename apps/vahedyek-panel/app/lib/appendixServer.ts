import { ContractType, PartySide, PersonType, PricingType, ShareMode, type Prisma } from '@/lib/prisma-client';
import { prisma } from './prisma';
import { buildAppendixSummary, getAppendixPreviousSourceLabel, serializeAppendixStatus } from './appendixLifecycle';
import { normalizeAreaPricingMode } from './contractFinancialPricing';
import {
  mapFinancialCategoriesForClientApi,
  mapFinancialDueItemsForClientApi,
  resolveFinancialActiveTabForClientApi,
} from './financialCategoriesApiSerialize';
import type { AppendixSourceKind, AppendixTagKey, ContractAppendix, ContractPartiesData } from '../types/contract';

function serializeShareMode(value: ShareMode) {
  return value === ShareMode.percent ? 'percent' : 'dang';
}

function serializePricingType(value: PricingType) {
  return value === PricingType.metered ? 'metered' : 'fixed';
}

export async function fetchContractViewForAppendix(tenantId: string, contractId: string) {
  const draft = await prisma.contractDraft.findFirst({
    where: { id: contractId, tenantId },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      subject: { include: { block: true, unit: true } },
      parties: { include: { members: { orderBy: { createdAt: 'asc' } } } },
      financial: { include: { categories: true, dueItems: true } },
      appendices: {
        where: { status: 'APPROVED' },
        orderBy: { appendixNumber: 'desc' },
        select: { id: true, appendixNumber: true },
        take: 1,
      },
    },
  });

  if (!draft) return null;

  const parties: ContractPartiesData | null = draft.parties
    ? {
        partyOneMode: serializeShareMode(draft.parties.partyOneMode),
        partyTwoMode: serializeShareMode(draft.parties.partyTwoMode),
        partyOne: draft.parties.members
          .filter((member) => member.side === PartySide.party_one)
          .map((member) => ({
            personId: member.personId,
            directoryId: member.directoryId ?? null,
            personType: member.personType === PersonType.legal ? 'legal' : 'natural',
            name: member.name,
            isPrimary: member.isPrimary,
            share: { value: Number(member.shareValue), mode: serializeShareMode(draft.parties.partyOneMode) },
          })),
        partyTwo: draft.parties.members
          .filter((member) => member.side === PartySide.party_two)
          .map((member) => ({
            personId: member.personId,
            directoryId: member.directoryId ?? null,
            personType: member.personType === PersonType.legal ? 'legal' : 'natural',
            name: member.name,
            isPrimary: member.isPrimary,
            share: { value: Number(member.shareValue), mode: serializeShareMode(draft.parties.partyTwoMode) },
          })),
      }
    : null;

  const financial = draft.financial
    ? (() => {
        const financialId = draft.financial.id;
        const categories = mapFinancialCategoriesForClientApi(financialId, draft.financial.categories);
        const categoryLogicalIds = new Set(categories.map((item) => item.id));
        const dueItems = mapFinancialDueItemsForClientApi(financialId, draft.financial.dueItems);
        const activeTab = resolveFinancialActiveTabForClientApi(
          financialId,
          draft.financial.activeTab,
          categoryLogicalIds,
          categories[0]?.id ?? '',
        );

        return {
          pricingType: serializePricingType(draft.financial.pricingType),
          areaPricingMode: normalizeAreaPricingMode(draft.financial.areaPricingMode),
          unitArea: draft.financial.unitArea ? String(Number(draft.financial.unitArea)) : '',
          parkingArea: draft.financial.parkingArea ? String(Number(draft.financial.parkingArea)) : '',
          storageArea: draft.financial.storageArea ? String(Number(draft.financial.storageArea)) : '',
          totalArea: draft.financial.totalArea ? String(Number(draft.financial.totalArea)) : '',
          pricePerMeter: draft.financial.pricePerMeter ? String(Number(draft.financial.pricePerMeter)) : '',
          parkingPricePerMeter: draft.financial.parkingPricePerMeter ? String(Number(draft.financial.parkingPricePerMeter)) : '',
          storagePricePerMeter: draft.financial.storagePricePerMeter ? String(Number(draft.financial.storagePricePerMeter)) : '',
          fixedTotalAmount: draft.financial.fixedTotalAmount ? String(Number(draft.financial.fixedTotalAmount)) : '',
          parkingFixedAmount: draft.financial.parkingFixedAmount ? String(Number(draft.financial.parkingFixedAmount)) : '',
          storageFixedAmount: draft.financial.storageFixedAmount ? String(Number(draft.financial.storageFixedAmount)) : '',
          activeTab,
          categories,
          dueItems,
        };
      })()
    : null;

  return {
    id: draft.id,
    status: 'completed' as const,
    entityKind: 'contract' as const,
    hasApprovedAppendix: Boolean(draft.appendices[0]),
    latestApprovedAppendixId: draft.appendices[0]?.id ?? null,
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
    data: {
      subject: draft.subject
        ? {
            contractor: { type: 'self' as const },
            contractType: draft.subject.contractType === ContractType.pre_sale ? 'pre-sale' : 'sale',
            contractDate: draft.subject.contractDate,
            contractNumber: draft.subject.contractNumber,
            deliveryDate: draft.subject.deliveryDate,
            blockId: draft.subject.blockId,
            unitId: draft.subject.unitId,
            blockName: draft.subject.block?.name ?? null,
            unitName: draft.subject.unit?.name ?? null,
            floorName: draft.subject.unit?.floorName ?? null,
            unitUsage: draft.subject.unit?.usage ?? null,
          }
        : null,
      parties,
      financial,
    },
  };
}

export function serializeAppendixRecord(appendix: any): ContractAppendix {
  return {
    id: appendix.id,
    draftId: appendix.draftId,
    status: serializeAppendixStatus(appendix.status),
    appendixNumber: appendix.appendixNumber,
    title: appendix.title,
    summary: appendix.summary ?? buildAppendixSummary(Array.isArray(appendix.items) ? appendix.items.map((item: any) => item.tagKey) : []),
    effectiveDate: appendix.effectiveDate,
    issuerType: appendix.issuerType,
    issuerName: appendix.issuerName,
    notes: appendix.notes ?? '',
    previousAppendixId: appendix.previousAppendixId ?? null,
    sourceKind: (appendix.sourceKind ?? 'contract') as AppendixSourceKind,
    sourceId: appendix.sourceId ?? null,
    canEdit: appendix.status === 'DRAFT',
    canDelete: appendix.status === 'DRAFT',
    canSubmit: appendix.status === 'DRAFT',
    approvalSummary: appendix.approvalInstance
      ? {
          status: serializeAppendixStatus(appendix.status),
          currentStepIndex: appendix.approvalInstance.currentStepIndex,
        }
      : null,
    createdAt: appendix.createdAt.toISOString(),
    updatedAt: appendix.updatedAt.toISOString(),
    items: Array.isArray(appendix.items)
      ? appendix.items.map((item: any) => ({
          id: item.id,
          tagKey: item.tagKey,
          groupKey: item.groupKey,
          title: item.title,
          description: item.description ?? '',
          payload: (item.payload ?? {}) as Record<string, unknown>,
        }))
      : [],
  };
}

export async function findPreviousApprovedAppendix(tenantId: string, draftId: string, appendixNumber: number) {
  return prisma.contractAppendix.findFirst({
    where: {
      tenantId,
      draftId,
      status: 'APPROVED',
      appendixNumber: { lt: appendixNumber },
    },
    orderBy: { appendixNumber: 'desc' },
    include: {
      items: { orderBy: [{ groupKey: 'asc' }, { createdAt: 'asc' }] },
      approvalInstance: { select: { currentStepIndex: true } },
    },
  });
}

export async function resolveAppendixCompareBase(tenantId: string, appendix: any, contractView: any) {
  const previous =
    appendix.previousAppendixId
      ? await prisma.contractAppendix.findFirst({
          where: { id: appendix.previousAppendixId, tenantId },
          include: { items: { orderBy: [{ groupKey: 'asc' }, { createdAt: 'asc' }] } },
        })
      : null;

  if (previous) {
    return {
      sourceKind: 'appendix' as const,
      sourceId: previous.id,
      sourceLabel: getAppendixPreviousSourceLabel({
        sourceKind: 'appendix',
        sourceAppendixNumber: previous.appendixNumber,
      }),
      appendix: serializeAppendixRecord(previous),
    };
  }

  return {
    sourceKind: 'contract' as const,
    sourceId: contractView.id,
    sourceLabel: getAppendixPreviousSourceLabel({
      sourceKind: 'contract',
      contractNumber: contractView.data?.subject?.contractNumber ?? null,
    }),
    appendix: null,
  };
}

export function sanitizeAppendixPayload(input: unknown) {
  return input && typeof input === 'object' ? (input as Prisma.InputJsonValue) : ({} as Prisma.InputJsonValue);
}
