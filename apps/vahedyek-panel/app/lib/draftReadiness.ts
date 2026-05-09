import { PartySide } from '@/lib/prisma-client';
import type { ContractPenaltiesData } from '../types/contract';
import { validatePenaltiesStep } from './contractValidation';

/** آیا پیش‌نویس از نظر مراحل فرم آمادهٔ ارسال به فرایند تأیید است؟ */
export function isDraftReadyForApprovalGate(draft: {
  subject?: {
    contractNumber?: string | null;
    contractDate?: string | null;
    blockId?: string | null;
    unitId?: string | null;
  } | null;
  parties?: {
    members?: Array<{ side: PartySide }>;
  } | null;
  financial?: unknown;
  penalties?: {
    types?: Array<{ id: string; title?: string | null; active?: boolean }>;
    rules?: Array<{ id: string; penaltyTypeId: string }>;
  } | null;
  terminationRules?: unknown;
  extraCosts?: unknown;
  technicalSpecs?: unknown;
  attachments?: unknown;
}): boolean {
  const hasSubject = Boolean(
    draft.subject?.contractNumber &&
      draft.subject?.contractDate &&
      draft.subject?.blockId &&
      draft.subject?.unitId,
  );
  const hasParties = Boolean(
    draft.parties?.members?.some((m) => m.side === PartySide.party_one) &&
      draft.parties?.members?.some((m) => m.side === PartySide.party_two),
  );
  const hasFinancial = Boolean(draft.financial);
  const hasPenalties =
    Boolean(draft.penalties) &&
    validatePenaltiesStep({
      types: Array.isArray(draft.penalties?.types)
        ? draft.penalties!.types!.map((item) => ({
            id: String(item.id),
            title: String(item.title ?? ''),
            description: '',
            active: Boolean(item.active),
          }))
        : [],
      rules: Array.isArray(draft.penalties?.rules)
        ? draft.penalties!.rules!.map((rule) => ({
            id: String(rule.id),
            penaltyTypeId: String(rule.penaltyTypeId),
          }))
        : [],
    } as Partial<ContractPenaltiesData>).valid;
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
