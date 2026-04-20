import { NextResponse } from 'next/server';
import { PartySide, PersonType, PricingType, ShareMode } from '@prisma/client';
import { requireSessionContext } from '../../lib/auth';
import { serializeContractorType, serializeContractType } from '../../lib/subjectUtils';
import { prisma } from '../../lib/prisma';
import { handlePrismaApiError } from '../../lib/prismaApiError';

function serializeShareMode(value: ShareMode) {
  return value === ShareMode.percent ? 'percent' : 'dang';
}

function serializePricingType(value: PricingType) {
  return value === PricingType.metered ? 'metered' : 'fixed';
}

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const drafts = await prisma.contractDraft.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { updatedAt: 'desc' },
      include: {
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
      },
    });

    const contracts = drafts.map((draft) => ({
      id: draft.id,
      status: 'draft',
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
          ? {
              pricingType: serializePricingType(draft.financial.pricingType),
              totalArea: draft.financial.totalArea ? String(Number(draft.financial.totalArea)) : '',
              pricePerMeter: draft.financial.pricePerMeter ? String(Number(draft.financial.pricePerMeter)) : '',
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
          : undefined,
      },
    }));

    return NextResponse.json(contracts);
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
