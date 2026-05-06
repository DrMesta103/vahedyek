import { NextResponse } from 'next/server';
import { PartySide, PersonType, PricingType, ShareMode } from '@prisma/client';
import { requireSessionContext } from '../../../lib/auth';
import { serializeContractorType, serializeContractType } from '../../../lib/subjectUtils';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';
import type { ContractStatus } from '../../../types/contract';

function serializeShareMode(value: ShareMode) {
  return value === ShareMode.percent ? 'percent' : 'dang';
}

function serializePricingType(value: PricingType) {
  return value === PricingType.metered ? 'metered' : 'fixed';
}

function computeStatus(draft: any): ContractStatus {
  const hasSubject = Boolean(draft.subject?.contractNumber && draft.subject?.contractDate && draft.subject?.blockId && draft.subject?.unitId);
  const hasParties = Boolean(
    draft.parties?.members?.some((member: any) => member.side === PartySide.party_one) &&
      draft.parties?.members?.some((member: any) => member.side === PartySide.party_two),
  );
  const hasFinancial = Boolean(draft.financial);
  const hasPenalties = Boolean(draft.penalties?.rules?.length);
  const hasTermination = Boolean(draft.terminationRules);
  const hasExtraCosts = Boolean(draft.extraCosts);
  const hasTechnicalSpecs = Boolean(draft.technicalSpecs);
  const hasAttachments = Boolean(draft.attachments);

  return hasSubject && hasParties && hasFinancial && hasPenalties && hasTermination && hasExtraCosts && hasTechnicalSpecs && hasAttachments
    ? 'pending_approval'
    : 'draft';
}

export async function GET(request: Request, context: { params: Promise<{ contractId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { contractId } = await context.params;
    const draft = await prisma.contractDraft.findFirst({
      where: { id: contractId, tenantId: session.tenantId },
      include: {
        subject: { include: { block: true, unit: true } },
        parties: { include: { members: { orderBy: { createdAt: 'asc' } } } },
        financial: { include: { categories: true, dueItems: true } },
        penalties: { include: { types: true, rules: true } },
        terminationRules: true,
        extraCosts: true,
        technicalSpecs: true,
        attachments: true,
      },
    });

    if (!draft) {
      return NextResponse.json({ message: 'قرارداد یافت نشد.' }, { status: 404 });
    }

    const status = computeStatus(draft);

    return NextResponse.json({
      id: draft.id,
      status,
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
              blockName: draft.subject.block?.name ?? null,
              unitName: draft.subject.unit?.name ?? null,
              floorName: draft.subject.unit?.floorName ?? null,
              unitUsage: draft.subject.unit?.usage ?? null,
            }
          : null,
        parties: draft.parties
          ? {
              partyOneMode: serializeShareMode(draft.parties.partyOneMode),
              partyTwoMode: serializeShareMode(draft.parties.partyTwoMode),
              partyOne: draft.parties.members
                .filter((member) => member.side === PartySide.party_one)
                .map((member) => ({
                  personId: member.personId,
                  personType: member.personType === PersonType.legal ? 'legal' : 'natural',
                  name: member.name,
                  isPrimary: member.isPrimary,
                  share: { value: Number(member.shareValue), mode: serializeShareMode(draft.parties.partyOneMode) },
                })),
              partyTwo: draft.parties.members
                .filter((member) => member.side === PartySide.party_two)
                .map((member) => ({
                  personId: member.personId,
                  personType: member.personType === PersonType.legal ? 'legal' : 'natural',
                  name: member.name,
                  isPrimary: member.isPrimary,
                  share: { value: Number(member.shareValue), mode: serializeShareMode(draft.parties.partyTwoMode) },
                })),
            }
          : null,
        financial: draft.financial
          ? {
              pricingType: serializePricingType(draft.financial.pricingType),
              unitArea: draft.financial.unitArea ? String(Number(draft.financial.unitArea)) : '',
              parkingArea: draft.financial.parkingArea ? String(Number(draft.financial.parkingArea)) : '',
              totalArea: draft.financial.totalArea ? String(Number(draft.financial.totalArea)) : '',
              pricePerMeter: draft.financial.pricePerMeter ? String(Number(draft.financial.pricePerMeter)) : '',
              parkingPricePerMeter: draft.financial.parkingPricePerMeter ? String(Number(draft.financial.parkingPricePerMeter)) : '',
              fixedTotalAmount: draft.financial.fixedTotalAmount ? String(Number(draft.financial.fixedTotalAmount)) : '',
              activeTab: draft.financial.activeTab ?? '',
              categories: draft.financial.categories.map((item) => ({
                id: item.id,
                name: item.name,
                capAmount: Number(item.capAmount),
                dueAmount: Number(item.dueAmount),
                noDueAmount: Number(item.noDueAmount),
                system: item.system,
                requiresDue: item.requiresDue,
              })),
              dueItems: draft.financial.dueItems.map((item) => ({
                id: item.id,
                categoryId: item.categoryId,
                title: item.title,
                amount: Number(item.amount),
                dueDate: item.dueDate,
              })),
            }
          : null,
      },
    });
  } catch (error) {
    void request;
    return handlePrismaApiError(error);
  }
}

