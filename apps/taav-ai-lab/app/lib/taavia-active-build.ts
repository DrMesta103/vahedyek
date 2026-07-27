import { prisma } from '@/app/lib/prisma';
import type { TaaviaKnowledgeBaseBuildStatus } from '@/app/lib/prisma-client';

export const ACTIVE_BUILD_STATUSES = ['PENDING', 'PROCESSING', 'RUNNING'] as const satisfies readonly TaaviaKnowledgeBaseBuildStatus[];

export type ActiveBuildStatus = (typeof ACTIVE_BUILD_STATUSES)[number];

export const ACTIVE_BUILD_SOURCE_LOCK_MESSAGE =
  'تا پایان یا خطای بیلد فعال، تغییر منابع مجاز نیست.';

export const ACTIVE_BUILD_EXISTS_MESSAGE = 'یک Build فعال برای این برند وجود دارد.';

export async function findActiveBuild(tenantId: string, brandId: string) {
  return prisma.taaviaKnowledgeBaseBuild.findFirst({
    where: { tenantId, brandId, status: { in: [...ACTIVE_BUILD_STATUSES] } },
    select: { id: true, status: true },
    orderBy: { startedAt: 'desc' },
  });
}

export async function assertNoActiveBuild(tenantId: string, brandId: string) {
  const active = await findActiveBuild(tenantId, brandId);
  if (active) throw new Error(ACTIVE_BUILD_SOURCE_LOCK_MESSAGE);
}
