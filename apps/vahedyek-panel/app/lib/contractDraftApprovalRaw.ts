import { prisma } from './prisma';

export type DraftApprovalFlags = {
  approvalReturnedPending: boolean;
  approvalLastRejectionReason: string | null;
  approvalLastRejectedAt: Date | null;
};

/** همهٔ پیش‌نویس‌های tenant — یک کوئری برای لیست قراردادها */
export async function fetchAllDraftApprovalFlagsByTenantRaw(tenantId: string): Promise<Map<string, DraftApprovalFlags>> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      approvalReturnedPending: boolean | null;
      approvalLastRejectionReason: string | null;
      approvalLastRejectedAt: Date | null;
    }>
  >`
    SELECT
      id,
      COALESCE("approvalReturnedPending", false) AS "approvalReturnedPending",
      "approvalLastRejectionReason",
      "approvalLastRejectedAt"
    FROM "ContractDraft"
    WHERE "tenantId" = ${tenantId}
  `;
  const map = new Map<string, DraftApprovalFlags>();
  for (const r of rows) {
    map.set(r.id, {
      approvalReturnedPending: Boolean(r.approvalReturnedPending),
      approvalLastRejectionReason: r.approvalLastRejectionReason,
      approvalLastRejectedAt: r.approvalLastRejectedAt,
    });
  }
  return map;
}

export async function fetchDraftApprovalFlagsRaw(tenantId: string, draftId: string): Promise<DraftApprovalFlags | null> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      approvalReturnedPending: boolean | null;
      approvalLastRejectionReason: string | null;
      approvalLastRejectedAt: Date | null;
    }>
  >`
    SELECT
      id,
      COALESCE("approvalReturnedPending", false) AS "approvalReturnedPending",
      "approvalLastRejectionReason",
      "approvalLastRejectedAt"
    FROM "ContractDraft"
    WHERE "tenantId" = ${tenantId} AND id = ${draftId}
    LIMIT 1
  `;
  const r = rows[0];
  if (!r) return null;
  return {
    approvalReturnedPending: Boolean(r.approvalReturnedPending),
    approvalLastRejectionReason: r.approvalLastRejectionReason,
    approvalLastRejectedAt: r.approvalLastRejectedAt,
  };
}

export async function clearContractDraftApprovalReturnRaw(draftId: string, tenantId: string) {
  await prisma.$executeRaw`
    UPDATE "ContractDraft"
    SET "approvalReturnedPending" = false
    WHERE id = ${draftId} AND "tenantId" = ${tenantId}
  `;
}

export async function setContractDraftReturnForRevisionRaw(draftId: string, tenantId: string, reason: string) {
  await prisma.$executeRaw`
    UPDATE "ContractDraft"
    SET
      "approvalReturnedPending" = true,
      "approvalLastRejectionReason" = ${reason},
      "approvalLastRejectedAt" = NOW()
    WHERE id = ${draftId} AND "tenantId" = ${tenantId}
  `;
}
