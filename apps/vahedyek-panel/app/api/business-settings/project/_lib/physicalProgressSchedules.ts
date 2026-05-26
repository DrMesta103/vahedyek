import { Prisma } from '@/lib/prisma-client';
import {
  buildCreatedScheduleVersions,
  buildNormalizedStages,
  buildScheduleSummaries,
  normalizePersistedScheduleVersion,
  PHYSICAL_PROGRESS_STAGE_LIBRARY,
  validateScheduleInput,
  type PhysicalProgressScheduleInput,
  type PhysicalProgressScheduleStageInput,
  type PhysicalProgressScheduleSummary,
  type PhysicalProgressScheduleVersion,
} from '../../../../lib/physicalProgressScheduleLogic';
import { prisma } from '../../../../lib/prisma';
import { ensureTenantProjectSettingsColumns } from '../../../../lib/tenantProjectSettingsColumns';

type TenantScheduleRow = {
  projectPhysicalProgressSchedules: unknown;
};

export {
  buildCreatedScheduleVersions,
  buildNormalizedStages,
  buildScheduleSummaries,
  PHYSICAL_PROGRESS_STAGE_LIBRARY,
  validateScheduleInput,
  type PhysicalProgressScheduleInput,
  type PhysicalProgressScheduleStageInput,
  type PhysicalProgressScheduleSummary,
  type PhysicalProgressScheduleVersion,
};

export async function ensurePhysicalProgressScheduleColumn() {
  await ensureTenantProjectSettingsColumns();
}

export async function getTenantPhysicalProgressScheduleVersions(tenantId: string) {
  await ensurePhysicalProgressScheduleColumn();
  const rows = await prisma.$queryRaw<TenantScheduleRow[]>(Prisma.sql`
    SELECT "projectPhysicalProgressSchedules"
    FROM "Tenant"
    WHERE "id" = ${tenantId}
    LIMIT 1
  `);

  const rawList = Array.isArray(rows[0]?.projectPhysicalProgressSchedules) ? rows[0]?.projectPhysicalProgressSchedules : [];
  return rawList.map(normalizePersistedScheduleVersion).filter((item): item is PhysicalProgressScheduleVersion => Boolean(item));
}

export async function saveTenantPhysicalProgressScheduleVersions(tenantId: string, versions: PhysicalProgressScheduleVersion[]) {
  await ensurePhysicalProgressScheduleColumn();
  await prisma.$executeRawUnsafe(
    `UPDATE "Tenant" SET "projectPhysicalProgressSchedules" = $1::jsonb, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2`,
    JSON.stringify(versions),
    tenantId,
  );
}

export async function getBlockNameMap(tenantId: string) {
  const blocks = await prisma.block.findMany({
    where: { tenantId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return new Map(blocks.map((block) => [block.id, block.name]));
}
