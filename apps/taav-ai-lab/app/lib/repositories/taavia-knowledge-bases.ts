import { assertTenantAccess } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function listTaaviaKnowledgeBasesForBrand(userId: string, tenantId: string, brandId: string) {
  if (!(await assertTenantAccess(userId, tenantId))) return [];
  return prisma.taaviaKnowledgeBase.findMany({ where: { tenantId, brandId }, include: { build: true, _count: { select: { categories: true, snapshots: true } } }, orderBy: { versionNumber: 'desc' } });
}

export async function getActiveTaaviaKnowledgeBaseForBrand(userId: string, tenantId: string, brandId: string) {
  if (!(await assertTenantAccess(userId, tenantId))) return null;
  return prisma.taaviaKnowledgeBase.findFirst({ where: { tenantId, brandId, isActive: true }, include: { build: true, _count: { select: { categories: true, snapshots: true } } } });
}
