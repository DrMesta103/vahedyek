import { prisma } from './prisma';

function isMissingColumnError(error: unknown) {
  return error instanceof Error && /does not exist in the current database|column .* does not exist/i.test(error.message);
}

/** خواندن JSON تنظیمات مسیر تأیید بدون اتکا به فیلدهای نوگنِریت‌شدهٔ Prisma (هم‌سو با migration). */
export async function fetchTenantApprovalProcessConfigRaw(tenantId: string): Promise<unknown> {
  let rows: Array<{ approvalProcessConfig: unknown }> = [];
  try {
    rows = await prisma.$queryRaw<Array<{ approvalProcessConfig: unknown }>>`
      SELECT COALESCE("approvalProcessConfig", '{}'::jsonb) AS "approvalProcessConfig"
      FROM "Tenant"
      WHERE "id" = ${tenantId}
      LIMIT 1
    `;
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    console.warn('Tenant approval process config column is missing in the current database. Falling back to empty config.');
  }
  return rows[0]?.approvalProcessConfig ?? {};
}

/** به‌روزرسانی کل ستون JSON (پس از merge در لایهٔ اپلیکیشن). */
export async function replaceTenantApprovalProcessConfigRaw(tenantId: string, jsonValue: unknown) {
  const serialized = JSON.stringify(jsonValue ?? {});
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "Tenant" SET "approvalProcessConfig" = $1::jsonb WHERE "id" = $2`,
      serialized,
      tenantId,
    );
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    console.warn('Skipping tenant approval config update because the column is missing in the current database.');
  }
}
