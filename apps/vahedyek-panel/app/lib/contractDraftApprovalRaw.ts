import { prisma } from './prisma';

export type DraftApprovalFlags = {
  approvalReturnedPending: boolean;
  approvalLastRejectionReason: string | null;
  approvalLastRejectedAt: Date | null;
};

function isMissingColumnError(error: unknown) {
  return error instanceof Error && /does not exist in the current database|column .* does not exist/i.test(error.message);
}

/** همهٔ پیش‌نویس‌های tenant — یک کوئری برای لیست قراردادها */
export async function fetchAllDraftApprovalFlagsByTenantRaw(tenantId: string): Promise<Map<string, DraftApprovalFlags>> {
  let rows: Array<{
    id: string;
    approvalReturnedPending: boolean | null;
    approvalLastRejectionReason: string | null;
    approvalLastRejectedAt: Date | null;
  }> = [];
  try {
    rows = await prisma.$queryRaw<
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
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    console.warn('ContractDraft approval columns are missing in the current database. Falling back to default approval flags.');
  }
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
  let rows: Array<{
    id: string;
    approvalReturnedPending: boolean | null;
    approvalLastRejectionReason: string | null;
    approvalLastRejectedAt: Date | null;
  }> = [];
  try {
    rows = await prisma.$queryRaw<
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
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    console.warn('ContractDraft approval columns are missing in the current database. Falling back to default approval flags.');
    return null;
  }
  const r = rows[0];
  if (!r) return null;
  return {
    approvalReturnedPending: Boolean(r.approvalReturnedPending),
    approvalLastRejectionReason: r.approvalLastRejectionReason,
    approvalLastRejectedAt: r.approvalLastRejectedAt,
  };
}

export async function clearContractDraftApprovalReturnRaw(draftId: string, tenantId: string) {
  try {
    await prisma.$executeRaw`
      UPDATE "ContractDraft"
      SET "approvalReturnedPending" = false
      WHERE id = ${draftId} AND "tenantId" = ${tenantId}
    `;
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    console.warn('Skipping approval return reset because ContractDraft approval columns are missing in the current database.');
  }
}

export async function setContractDraftReturnForRevisionRaw(draftId: string, tenantId: string, reason: string) {
  try {
    await prisma.$executeRaw`
      UPDATE "ContractDraft"
      SET
        "approvalReturnedPending" = true,
        "approvalLastRejectionReason" = ${reason},
        "approvalLastRejectedAt" = NOW()
      WHERE id = ${draftId} AND "tenantId" = ${tenantId}
    `;
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    console.warn('Skipping approval return update because ContractDraft approval columns are missing in the current database.');
  }
}
