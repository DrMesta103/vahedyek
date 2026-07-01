import { randomUUID } from 'node:crypto';
import { prisma } from '../prisma';
import type { CreateTenantInput, Tenant } from '../types/domain';
import { assertTenantAccess } from '../auth';

const DEFAULT_PRODUCTS = ['ocr', 'taavia'] as const;

function mapTenantRow(
  tenant: {
    id: string;
    slug: string;
    name: string;
    brandCode: string | null;
    packageKey: string | null;
    billingCycle: string | null;
    logoUrl: string;
    tokenLimit: number;
    usedTokens: number;
    ocrTestsCount: number;
    lastActivity: Date | null;
    createdAt: Date;
    updatedAt: Date;
  },
  ownerUserId: string,
): Tenant {
  return {
    id: tenant.id,
    ownerUserId,
    name: tenant.name,
    slug: tenant.slug,
    brandCode: tenant.brandCode ?? undefined,
    packageKey: tenant.packageKey,
    billingCycle: (tenant.billingCycle as Tenant['billingCycle']) ?? null,
    logoUrl: tenant.logoUrl,
    tokenLimit: tenant.tokenLimit,
    usedTokens: tenant.usedTokens,
    ocrTestsCount: tenant.ocrTestsCount,
    lastActivity: (tenant.lastActivity ?? tenant.updatedAt).toISOString(),
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString(),
  };
}

async function getOwnerUserId(tenantId: string) {
  const membership = await prisma.userTenantMembership.findFirst({
    where: { tenantId, role: 'owner' },
    orderBy: { createdAt: 'asc' },
  });
  return membership?.userId ?? '';
}

export async function getTenantsForUser(userId: string): Promise<Tenant[]> {
  const memberships = await prisma.userTenantMembership.findMany({
    where: { userId, tenant: { isActive: true } },
    include: { tenant: true },
    orderBy: { tenant: { updatedAt: 'desc' } },
  });

  return memberships.map((membership) => mapTenantRow(membership.tenant, userId));
}

export async function getSuggestedBusinessNames(limit = 12) {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    select: { name: true },
    take: limit * 2,
  });
  return Array.from(new Set(tenants.map((tenant) => tenant.name))).slice(0, limit);
}

export async function getTenantForUser(userId: string, tenantId: string): Promise<Tenant | null> {
  const hasAccess = await assertTenantAccess(userId, tenantId);
  if (!hasAccess) return null;

  const tenant = await prisma.tenant.findFirst({ where: { id: tenantId, isActive: true } });
  if (!tenant) return null;

  const ownerUserId = await getOwnerUserId(tenantId);
  return mapTenantRow(tenant, ownerUserId || userId);
}

export async function createTenantForUser(userId: string, input: CreateTenantInput): Promise<Tenant> {
  const slug =
    input.slug?.trim() ||
    `tenant-${input.name.trim().toLowerCase().replace(/\s+/g, '-')}-${randomUUID().slice(0, 6)}`;

  const tenant = await prisma.$transaction(async (tx) => {
    const created = await tx.tenant.create({
      data: {
        slug,
        name: input.name.trim(),
        brandCode: input.brandCode?.trim() || null,
        packageKey: input.packageKey ?? null,
        billingCycle: input.billingCycle ?? null,
        logoUrl: input.logoUrl.trim(),
        tokenLimit: input.tokenLimit,
        lastActivity: new Date(),
        memberships: {
          create: { userId, role: 'owner' },
        },
        products: {
          create: DEFAULT_PRODUCTS.map((productKey) => ({ productKey, status: 'active' })),
        },
      },
    });
    return created;
  });

  return mapTenantRow(tenant, userId);
}
