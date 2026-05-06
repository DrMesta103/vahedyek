import { prisma } from './prisma';

/** خواندن JSON تنظیمات مسیر تأیید بدون اتکا به فیلدهای نوگنِریت‌شدهٔ Prisma (هم‌سو با migration). */
export async function fetchTenantApprovalProcessConfigRaw(tenantId: string): Promise<unknown> {
  const rows = await prisma.$queryRaw<Array<{ approvalProcessConfig: unknown }>>`
    SELECT COALESCE("approvalProcessConfig", '{}'::jsonb) AS "approvalProcessConfig"
    FROM "Tenant"
    WHERE "id" = ${tenantId}
    LIMIT 1
  `;
  return rows[0]?.approvalProcessConfig ?? {};
}

/** به‌روزرسانی کل ستون JSON (پس از merge در لایهٔ اپلیکیشن). */
export async function replaceTenantApprovalProcessConfigRaw(tenantId: string, jsonValue: unknown) {
  const serialized = JSON.stringify(jsonValue ?? {});
  await prisma.$executeRawUnsafe(
    `UPDATE "Tenant" SET "approvalProcessConfig" = $1::jsonb WHERE "id" = $2`,
    serialized,
    tenantId,
  );
}
