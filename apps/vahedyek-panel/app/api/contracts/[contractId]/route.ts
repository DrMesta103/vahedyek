import { NextResponse } from 'next/server';
import { Prisma, PartySide, PersonType, PricingType, ShareMode } from '@/lib/prisma-client';
import { requireSessionContext } from '../../../lib/auth';
import { serializeContractorType, serializeContractType } from '../../../lib/subjectUtils';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';
import { canViewBuyerContract, getMembershipAccess, hasPermission } from '../../../lib/access-control';
import { userCanDecideApprovalOnContract } from '../../../lib/contractApprovalAccess';
import { resolveDisplayedContractStatus } from '../../../lib/contractApprovalStatus';
import { fetchDraftApprovalFlagsRaw } from '../../../lib/contractDraftApprovalRaw';
import { fetchTenantApprovalProcessConfigRaw } from '../../../lib/tenantApprovalProcessDb';
import type { ContractStatus } from '../../../types/contract';
import { validatePenaltiesStep } from '../../../lib/contractValidation';
import { normalizeAreaPricingMode } from '../../../lib/contractFinancialPricing';
import { normalizeWorkflowSteps } from '../../../lib/workflowTypes';
import { normalizeBuilderPenaltyRuleState } from '../../../lib/builderPenalty';
import { normalizeRuleState } from '../../../lib/businessContractRules';
import {
  mapFinancialCategoriesForClientApi,
  mapFinancialDueItemsForClientApi,
  resolveFinancialActiveTabForClientApi,
} from '../../../lib/financialCategoriesApiSerialize';

const REPORT_RULE_IDS = ['forgiveness', 'interest', 'builder-penalty'] as const;
type ReportRuleId = (typeof REPORT_RULE_IDS)[number];

function serializeShareMode(value: ShareMode) {
  return value === ShareMode.percent ? 'percent' : 'dang';
}

function serializePricingType(value: PricingType) {
  return value === PricingType.metered ? 'metered' : 'fixed';
}

function serializePenalties(penalties: any) {
  if (!penalties) return null;

  return {
    activeTab: '',
    types: Array.isArray(penalties.types)
      ? penalties.types.map((item: any) => ({
          id: String(item.id),
          title: String(item.title ?? ''),
          description: '',
          active: Boolean(item.active),
        }))
      : [],
    rules: Array.isArray(penalties.rules)
      ? penalties.rules.map((rule: any) => ({
          id: String(rule.id),
          penaltyTypeId: String(rule.penaltyTypeId),
          mode: String(rule.mode ?? 'fixed'),
          period: String(rule.period ?? 'daily'),
          fixedAmount: rule.fixedAmount != null ? String(Number(rule.fixedAmount)) : '',
          penaltyPercent: rule.penaltyPercent != null ? String(Number(rule.penaltyPercent)) : '',
          bankInterestPercent: rule.bankInterestPercent != null ? String(Number(rule.bankInterestPercent)) : '',
          graceDays: rule.graceDays != null ? String(Number(rule.graceDays)) : '',
          roundRule: String(rule.roundRule ?? '0'),
          extraFeeEnabled: Boolean(rule.extraFeeEnabled),
          extraFeeType: String(rule.extraFeeType ?? 'fixed'),
          extraFeeAmount: rule.extraFeeAmount != null ? String(Number(rule.extraFeeAmount)) : '',
          extraFeeRoundRule: String(rule.extraFeeRoundRule ?? '0'),
          progressiveRows: Array.isArray(rule.progressiveRows) ? rule.progressiveRows : [],
        }))
      : [],
  };
}

function normalizeContractRuleSnapshot(ruleId: ReportRuleId, payload: unknown) {
  const normalized = normalizeRuleState(ruleId, payload);
  return ruleId === 'builder-penalty' ? normalizeBuilderPenaltyRuleState(normalized) : normalized;
}

function serializeContractRuleSnapshots(
  ruleRows: Array<{ ruleId: string; payload: unknown; updatedAt: Date }>,
  tenantRulesPayload: unknown,
) {
  const tenantRules =
    tenantRulesPayload && typeof tenantRulesPayload === 'object' ? (tenantRulesPayload as Record<string, unknown>) : {};
  const rowByRuleId = new Map(ruleRows.map((row) => [row.ruleId, row]));

  return {
    forgiveness: (() => {
      const row = rowByRuleId.get('forgiveness');
      const tenantPayload = tenantRules['forgiveness'];
      const source = row ? 'contract' : tenantPayload ? 'business-default' : 'default';
      return {
        source,
        updatedAt: row?.updatedAt?.toISOString() ?? null,
        state: normalizeContractRuleSnapshot('forgiveness', row?.payload ?? tenantPayload),
      };
    })(),
    interest: (() => {
      const row = rowByRuleId.get('interest');
      const tenantPayload = tenantRules['interest'];
      const source = row ? 'contract' : tenantPayload ? 'business-default' : 'default';
      return {
        source,
        updatedAt: row?.updatedAt?.toISOString() ?? null,
        state: normalizeContractRuleSnapshot('interest', row?.payload ?? tenantPayload),
      };
    })(),
    builderPenalty: (() => {
      const row = rowByRuleId.get('builder-penalty');
      const tenantPayload = tenantRules['builder-penalty'];
      const source = row ? 'contract' : tenantPayload ? 'business-default' : 'default';
      return {
        source,
        updatedAt: row?.updatedAt?.toISOString() ?? null,
        state: normalizeContractRuleSnapshot('builder-penalty', row?.payload ?? tenantPayload),
      };
    })(),
  };
}

function isFormCompleteForApprovalGate(draft: any): boolean {
  const hasSubject = Boolean(draft.subject?.contractNumber && draft.subject?.contractDate && draft.subject?.blockId && draft.subject?.unitId);
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

  return (
    hasSubject &&
    hasParties &&
    hasFinancial &&
    hasPenalties &&
    hasTermination &&
    hasExtraCosts &&
    hasTechnicalSpecs &&
    hasAttachments
  );
}

export async function GET(request: Request, context: { params: Promise<{ contractId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { contractId } = await context.params;
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    const draft = await prisma.contractDraft.findFirst({
      where: { id: contractId, tenantId: session.tenantId },
      select: {
        id: true,
        releasedFromApprovedForEdit: true,
        createdAt: true,
        updatedAt: true,
        subject: { include: { block: true, unit: true } },
        parties: { include: { members: { orderBy: { createdAt: 'asc' } } } },
        financial: { include: { categories: true, dueItems: true } },
        penalties: { include: { types: true, rules: true } },
        terminationRules: true,
        extraCosts: true,
        technicalSpecs: true,
        attachments: true,
        approvalInstance: { select: { status: true, currentStepIndex: true, stepsSnapshot: true } },
      },
    });

    if (!draft) {
      return NextResponse.json({ message: 'قرارداد یافت نشد.' }, { status: 404 });
    }

    const approvalFlags =
      (await fetchDraftApprovalFlagsRaw(session.tenantId, contractId)) ?? {
        approvalReturnedPending: false,
        approvalLastRejectionReason: null,
        approvalLastRejectedAt: null,
      };
    const formComplete = isFormCompleteForApprovalGate(draft);
    const instanceStatus = draft.approvalInstance?.status ?? null;
    const status = resolveDisplayedContractStatus(
      formComplete,
      approvalFlags.approvalReturnedPending,
      instanceStatus,
      draft.releasedFromApprovedForEdit,
    );

    const membershipAccess = await getMembershipAccess(session.userId, session.tenantId);
    const canViewInternalContract = hasPermission(membershipAccess, 'contracts.view');
    const canViewBuyerSafeContract = await canViewBuyerContract(session.userId, session.tenantId, contractId);

    if (view === 'buyer-safe') {
      if (!canViewBuyerSafeContract && !canViewInternalContract) {
        return NextResponse.json({ message: 'شما به این قرارداد دسترسی ندارید.' }, { status: 403 });
      }
    } else if (!canViewInternalContract) {
      return NextResponse.json({ message: 'شما به مشاهده قراردادها دسترسی ندارید.' }, { status: 403 });
    }

    const approvalProcessConfig = await fetchTenantApprovalProcessConfigRaw(session.tenantId);
    const tenantRuleSettings = await prisma.tenantContractRuleSettings.findUnique({
      where: { tenantId: session.tenantId },
      select: { rulesPayload: true },
    });
    const ruleDraftSettings = await prisma.$queryRaw<
      Array<{ ruleId: string; payload: unknown; updatedAt: Date }>
    >`
      SELECT
        "ruleId",
        "payload",
        "updatedAt"
      FROM "ContractDraftRuleSettings"
      WHERE "draftId" = ${contractId}
        AND "ruleId" IN (${Prisma.join([...REPORT_RULE_IDS])})
    `;

    const stepsSnap = normalizeWorkflowSteps(draft.approvalInstance?.stepsSnapshot);
    const workflowCurrentStep =
      draft.approvalInstance && instanceStatus === 'IN_REVIEW'
        ? stepsSnap[draft.approvalInstance.currentStepIndex] ?? null
        : null;

    const approvalDecision = {
      canDecide: userCanDecideApprovalOnContract({
        userId: session.userId,
        access: membershipAccess,
        unitUsage: draft.subject?.unit?.usage ?? null,
        approvalProcessConfig,
        workflowCurrentStep,
        instanceStatus,
      }),
    };

    const fullResponse = {
      id: draft.id,
      status,
      approvalDecision,
      approvalInstance: draft.approvalInstance
        ? {
            status: draft.approvalInstance.status,
            currentStepIndex: draft.approvalInstance.currentStepIndex,
          }
        : null,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
      approvalReturn:
        approvalFlags.approvalReturnedPending && approvalFlags.approvalLastRejectionReason
          ? {
              reason: approvalFlags.approvalLastRejectionReason,
              rejectedAt: approvalFlags.approvalLastRejectedAt?.toISOString() ?? null,
            }
          : null,
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
          ? (() => {
              const fid = draft.financial.id;
              const categories = mapFinancialCategoriesForClientApi(fid, draft.financial.categories);
              const categoryLogicalIds = new Set(categories.map((c) => c.id));
              // گزارش و تاریخچه پرداخت: همهٔ سررسیدهای ذخیره‌شده (حتی در صورت ناهماهنگی موقت categoryId با لیست دسته‌ها)
              const dueItems = mapFinancialDueItemsForClientApi(fid, draft.financial.dueItems);
              const activeTab = resolveFinancialActiveTabForClientApi(
                fid,
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
                parkingPricePerMeter: draft.financial.parkingPricePerMeter
                  ? String(Number(draft.financial.parkingPricePerMeter))
                  : '',
                storagePricePerMeter: draft.financial.storagePricePerMeter
                  ? String(Number(draft.financial.storagePricePerMeter))
                  : '',
                fixedTotalAmount: draft.financial.fixedTotalAmount ? String(Number(draft.financial.fixedTotalAmount)) : '',
                parkingFixedAmount: draft.financial.parkingFixedAmount ? String(Number(draft.financial.parkingFixedAmount)) : '',
                storageFixedAmount: draft.financial.storageFixedAmount ? String(Number(draft.financial.storageFixedAmount)) : '',
                activeTab,
                categories,
                dueItems,
              };
            })()
          : null,
        penalties: serializePenalties(draft.penalties),
        ruleSettings: serializeContractRuleSnapshots(ruleDraftSettings, tenantRuleSettings?.rulesPayload),
        terminationRules: draft.terminationRules ? { buyerRules: draft.terminationRules.buyerRules ?? {} } : null,
        extraCosts: draft.extraCosts ? { payload: draft.extraCosts.payload ?? [] } : null,
        technicalSpecs: draft.technicalSpecs ? { specs: draft.technicalSpecs.specs ?? [] } : null,
        attachments: draft.attachments ? { documents: draft.attachments.documents ?? [], notes: draft.attachments.notes ?? '' } : null,
      },
    };

    if (view === 'buyer-safe') {
      return NextResponse.json({
        id: fullResponse.id,
        status: fullResponse.status,
        createdAt: fullResponse.createdAt,
        updatedAt: fullResponse.updatedAt,
        data: {
          subject: fullResponse.data.subject,
          parties: fullResponse.data.parties,
          financial: fullResponse.data.financial,
          penalties: fullResponse.data.penalties,
          terminationRules: fullResponse.data.terminationRules,
        },
      });
    }

    return NextResponse.json(fullResponse);
  } catch (error) {
    void request;
    return handlePrismaApiError(error);
  }
}

