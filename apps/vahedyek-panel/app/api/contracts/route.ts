import { NextResponse } from 'next/server';
import { PartySide, PersonType, PricingType, ShareMode } from '@prisma/client';
import { requireSessionContext } from '../../lib/auth';
import { serializeContractorType, serializeContractType } from '../../lib/subjectUtils';
import { fetchAllDraftApprovalFlagsByTenantRaw } from '../../lib/contractDraftApprovalRaw';
import { prisma } from '../../lib/prisma';
import { handlePrismaApiError } from '../../lib/prismaApiError';
import { resolveDisplayedContractStatus } from '../../lib/contractApprovalStatus';
import { validatePenaltiesStep } from '../../lib/contractValidation';
import type { ContractStatus } from '../../types/contract';
import {
  mapFinancialCategoriesForClientApi,
  mapFinancialDueItemsForClientApiFiltered,
  resolveFinancialActiveTabForClientApi,
} from '../../lib/financialCategoriesApiSerialize';

function serializeShareMode(value: ShareMode) {
  return value === ShareMode.percent ? 'percent' : 'dang';
}

function serializePricingType(value: PricingType) {
  return value === PricingType.metered ? 'metered' : 'fixed';
}

function isDraftReadyForApproval(draft: Awaited<ReturnType<typeof prisma.contractDraft.findMany>>[number] & any) {
  const hasSubject = Boolean(
    draft.subject?.contractNumber &&
      draft.subject?.contractDate &&
      draft.subject?.blockId &&
      draft.subject?.unitId,
  );
  const hasParties = Boolean(
    draft.parties?.members?.some((member: any) => member.side === PartySide.party_one) &&
      draft.parties?.members?.some((member: any) => member.side === PartySide.party_two),
  );
  const hasFinancial = Boolean(draft.financial);

  const hasPenalties = Boolean(draft.penalties) && validatePenaltiesStep({
    types: Array.isArray(draft.penalties?.types)
      ? draft.penalties.types.map((item: any) => ({ id: String(item.id), title: String(item.title ?? ''), active: Boolean(item.active) }))
      : [],
    rules: Array.isArray(draft.penalties?.rules)
      ? draft.penalties.rules.map((rule: any) => ({ id: String(rule.id), penaltyTypeId: String(rule.penaltyTypeId) }))
      : [],
  }).valid;
  const hasTermination = Boolean(draft.terminationRules);
  const hasExtraCosts = Boolean(draft.extraCosts);
  const hasTechnicalSpecs = Boolean(draft.technicalSpecs);
  const hasAttachments = Boolean(draft.attachments);

  // Only mark "pending approval" once the last step (attachments) is saved.
  return hasSubject && hasParties && hasFinancial && hasPenalties && hasTermination && hasExtraCosts && hasTechnicalSpecs && hasAttachments;
}

export async function GET(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as ContractStatus | null) ?? 'draft';

    const drafts = await prisma.contractDraft.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        releasedFromApprovedForEdit: true,
        createdAt: true,
        updatedAt: true,
        subject: true,
        parties: {
          include: {
            members: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        financial: {
          include: {
            categories: true,
            dueItems: true,
          },
        },
        penalties: {
          include: {
            types: true,
            rules: true,
          },
        },
        terminationRules: true,
        extraCosts: true,
        technicalSpecs: true,
        attachments: true,
      },
    });

    const approvalFlagMap = await fetchAllDraftApprovalFlagsByTenantRaw(session.tenantId);

    const instanceRows = await prisma.contractApprovalInstance.findMany({
      where: { tenantId: session.tenantId, draftId: { in: drafts.map((d) => d.id) } },
      select: { draftId: true, status: true },
    });
    const instanceStatusByDraft = new Map(instanceRows.map((r) => [r.draftId, r.status]));

    const contracts = drafts.map((draft) => ({
      id: draft.id,
      status: resolveDisplayedContractStatus(
        isDraftReadyForApproval(draft),
        Boolean(approvalFlagMap.get(draft.id)?.approvalReturnedPending),
        instanceStatusByDraft.get(draft.id),
        Boolean(draft.releasedFromApprovedForEdit),
      ) as ContractStatus,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
      data: {
        subject: draft.subject
          ? {
              contractor: {
                type: serializeContractorType(draft.subject.contractorType),
                employeeId: draft.subject.contractorEmployeeId ?? undefined,
                formerFirstName: draft.subject.contractorFormerName?.split(' ')[0] ?? '',
                formerLastName: draft.subject.contractorFormerName?.split(' ').slice(1).join(' ') ?? '',
              },
              contractType: serializeContractType(draft.subject.contractType),
              contractDate: draft.subject.contractDate,
              contractNumber: draft.subject.contractNumber,
              deliveryDate: draft.subject.deliveryDate,
              blockId: draft.subject.blockId,
              unitId: draft.subject.unitId,
            }
          : {
              contractor: { type: 'self' },
              contractType: 'pre-sale',
              contractDate: '',
              contractNumber: '',
              deliveryDate: '',
              blockId: '',
              unitId: '',
            },
        parties: {
          partyOneMode: draft.parties ? serializeShareMode(draft.parties.partyOneMode) : 'dang',
          partyTwoMode: draft.parties ? serializeShareMode(draft.parties.partyTwoMode) : 'dang',
          partyOne: draft.parties
            ? draft.parties.members
                .filter((member) => member.side === PartySide.party_one)
                .map((member) => ({
                  personId: member.personId,
                  personType: member.personType === PersonType.legal ? 'legal' : 'natural',
                  name: member.name,
                  isPrimary: member.isPrimary,
                  share: {
                    value: Number(member.shareValue),
                    mode: draft.parties ? serializeShareMode(draft.parties.partyOneMode) : 'dang',
                  },
                }))
            : [],
          partyTwo: draft.parties
            ? draft.parties.members
                .filter((member) => member.side === PartySide.party_two)
                .map((member) => ({
                  personId: member.personId,
                  personType: member.personType === PersonType.legal ? 'legal' : 'natural',
                  name: member.name,
                  isPrimary: member.isPrimary,
                  share: {
                    value: Number(member.shareValue),
                    mode: draft.parties ? serializeShareMode(draft.parties.partyTwoMode) : 'dang',
                  },
                }))
            : [],
        },
        financial: draft.financial
          ? (() => {
              const fid = draft.financial.id;
              const categories = mapFinancialCategoriesForClientApi(fid, draft.financial.categories);
              const categoryLogicalIds = new Set(categories.map((c) => c.id));
              const dueItems = mapFinancialDueItemsForClientApiFiltered(fid, draft.financial.dueItems, categoryLogicalIds);
              const activeTab = resolveFinancialActiveTabForClientApi(
                fid,
                draft.financial.activeTab,
                categoryLogicalIds,
                categories[0]?.id ?? '',
              );

              return {
                pricingType: serializePricingType(draft.financial.pricingType),
                unitArea: draft.financial.unitArea ? String(Number(draft.financial.unitArea)) : '',
                parkingArea: draft.financial.parkingArea ? String(Number(draft.financial.parkingArea)) : '',
                totalArea: draft.financial.totalArea ? String(Number(draft.financial.totalArea)) : '',
                pricePerMeter: draft.financial.pricePerMeter ? String(Number(draft.financial.pricePerMeter)) : '',
                parkingPricePerMeter: draft.financial.parkingPricePerMeter
                  ? String(Number(draft.financial.parkingPricePerMeter))
                  : '',
                fixedTotalAmount: draft.financial.fixedTotalAmount ? String(Number(draft.financial.fixedTotalAmount)) : '',
                activeTab,
                categories,
                dueItems,
              };
            })()
          : undefined,
      },
    }));

    const counts = {
      draft: contracts.filter((contract) => contract.status === 'draft').length,
      pending_approval: contracts.filter((contract) => contract.status === 'pending_approval').length,
      completed: contracts.filter((contract) => contract.status === 'completed').length,
    } satisfies Record<ContractStatus, number>;

    const items = contracts.filter((contract) => contract.status === status);

    return NextResponse.json({ items, counts });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
