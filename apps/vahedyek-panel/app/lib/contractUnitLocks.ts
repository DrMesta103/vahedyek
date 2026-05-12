import type { ContractApprovalInstanceStatus, PartySide } from '@/lib/prisma-client';
import { fetchAllDraftApprovalFlagsByTenantRaw } from './contractDraftApprovalRaw';
import { prisma } from './prisma';
import { resolveDisplayedContractStatus } from './contractApprovalStatus';
import { isDraftReadyForApprovalGate } from './draftReadiness';
import type { ContractStatus } from '../types/contract';

type SubjectLockDraftRow = {
  id: string;
  releasedFromApprovedForEdit: boolean;
  subject: {
    unitId: string;
    contractNumber: string;
  } | null;
  parties: {
    members: Array<{ side: PartySide }>;
  } | null;
  financial: unknown;
  penalties: {
    types: Array<{ id: string; title: string; active: boolean }>;
    rules: Array<{ id: string; penaltyTypeId: string }>;
  } | null;
  terminationRules: unknown;
  extraCosts: unknown;
  technicalSpecs: unknown;
  attachments: unknown;
};

export type LockedUnitInfo = {
  unitId: string;
  draftId: string;
  contractNumber: string;
  status: ContractStatus;
};

function toDisplayedStatus(
  draft: SubjectLockDraftRow,
  approvalReturnedPending: boolean,
  instanceStatus: ContractApprovalInstanceStatus | null | undefined,
) {
  return resolveDisplayedContractStatus(
    isDraftReadyForApprovalGate(draft),
    approvalReturnedPending,
    instanceStatus,
    Boolean(draft.releasedFromApprovedForEdit),
  );
}

export async function getLockedUnitMapForTenant(tenantId: string) {
  const drafts = await prisma.contractDraft.findMany({
    where: {
      tenantId,
      subject: {
        isNot: null,
      },
    },
    select: {
      id: true,
      releasedFromApprovedForEdit: true,
      subject: {
        select: {
          unitId: true,
          contractNumber: true,
        },
      },
      parties: {
        select: {
          members: {
            select: {
              side: true,
            },
          },
        },
      },
      financial: {
        select: { id: true },
      },
      penalties: {
        select: {
          types: {
            select: {
              id: true,
              title: true,
              active: true,
            },
          },
          rules: {
            select: {
              id: true,
              penaltyTypeId: true,
            },
          },
        },
      },
      terminationRules: {
        select: { id: true },
      },
      extraCosts: {
        select: { id: true },
      },
      technicalSpecs: {
        select: { id: true },
      },
      attachments: {
        select: { id: true },
      },
    },
  });

  const approvalFlagMap = await fetchAllDraftApprovalFlagsByTenantRaw(tenantId);
  const instanceRows = await prisma.contractApprovalInstance.findMany({
    where: {
      tenantId,
      draftId: {
        in: drafts.map((draft) => draft.id),
      },
    },
    select: {
      draftId: true,
      status: true,
    },
  });
  const instanceStatusByDraft = new Map(instanceRows.map((row) => [row.draftId, row.status]));
  const lockedUnits = new Map<string, LockedUnitInfo>();

  for (const draft of drafts as SubjectLockDraftRow[]) {
    const subject = draft.subject;
    if (!subject?.unitId) continue;

    lockedUnits.set(subject.unitId, {
      unitId: subject.unitId,
      draftId: draft.id,
      contractNumber: subject.contractNumber,
      status: toDisplayedStatus(
        draft,
        Boolean(approvalFlagMap.get(draft.id)?.approvalReturnedPending),
        instanceStatusByDraft.get(draft.id),
      ),
    });
  }

  return lockedUnits;
}

export async function findLockedUnitForTenant(tenantId: string, unitId: string, excludeDraftId?: string) {
  const lockedUnits = await getLockedUnitMapForTenant(tenantId);
  const locked = lockedUnits.get(unitId);
  if (!locked) return null;
  if (excludeDraftId && locked.draftId === excludeDraftId) return null;
  return locked;
}
