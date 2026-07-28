import { randomUUID } from 'node:crypto';
import { assertTenantAccess, assertTenantManagementAccess } from '../auth';
import { prisma } from '../prisma';
import { ACTIVE_BUILD_STATUSES } from '../taavia-active-build';
import type { CreateTaaviaBrandInput, TaaviaBrand, TaaviaBrandListItem, UpdateTaaviaBrandInput } from '../types/domain';

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
export const INITIAL_ASSISTANT_MESSAGE = 'سلام، من برای آماده‌سازی برند شما در تاویا کمک می‌کنم.';

function id() {
  return randomUUID().replaceAll('-', '');
}

function normalizeText(value: string | null | undefined, max: number) {
  const normalized = value?.trim() ?? '';
  return normalized ? normalized.slice(0, max) : null;
}

function mapBrand(row: {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  mediaAsset: { id: string; extension: string | null; sizeBytes: number | null; previewData: string | null; storageUrl: string | null } | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  setupMode: 'NOT_SELECTED' | 'MANUAL' | 'AI_ASSISTED';
  createdAt: Date;
  updatedAt: Date;
}): TaaviaBrand {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    description: row.description,
    icon: row.mediaAsset,
    status: row.status,
    setupMode: row.setupMode,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const brandInclude = {
  mediaAsset: {
    select: { id: true, extension: true, sizeBytes: true, previewData: true, storageUrl: true },
  },
} as const;

async function findAuthorizedTenant(userId: string, tenantId: string) {
  if (!(await assertTenantAccess(userId, tenantId))) return null;
  return prisma.tenant.findFirst({ where: { id: tenantId, isActive: true }, select: { id: true } });
}

async function findAuthorizedManager(userId: string, tenantId: string) {
  if (!(await assertTenantManagementAccess(userId, tenantId))) return null;
  return findAuthorizedTenant(userId, tenantId);
}

function validateBrandInput(name: string) {
  const normalizedName = name.trim();
  if (!normalizedName) throw new Error('نام برند الزامی است.');
  if (normalizedName.length > MAX_NAME_LENGTH) throw new Error(`نام برند نمی‌تواند بیشتر از ${MAX_NAME_LENGTH} کاراکتر باشد.`);
  return normalizedName;
}

export async function getTaaviaBrandsForTenant(userId: string, tenantId: string): Promise<TaaviaBrand[]> {
  if (!(await findAuthorizedTenant(userId, tenantId))) return [];
  const brands = await prisma.taaviaBrand.findMany({
    where: { tenantId },
    include: brandInclude,
    orderBy: { updatedAt: 'desc' },
  });
  return brands.map(mapBrand);
}

const activeSourceCountSelect = {
  brandInfos: { where: { status: 'ACTIVE' as const } },
  knowledgeSources: { where: { status: 'ACTIVE' as const } },
  products: { where: { status: 'ACTIVE' as const } },
  faqs: { where: { status: 'ACTIVE' as const } },
} as const;

function sumActiveSourceCounts(counts: {
  brandInfos: number;
  knowledgeSources: number;
  products: number;
  faqs: number;
}) {
  return counts.brandInfos + counts.knowledgeSources + counts.products + counts.faqs;
}

export async function getTaaviaBrandListItemsForTenant(userId: string, tenantId: string): Promise<TaaviaBrandListItem[]> {
  if (!(await findAuthorizedTenant(userId, tenantId))) return [];
  const brands = await prisma.taaviaBrand.findMany({
    where: { tenantId },
    include: {
      ...brandInclude,
      _count: {
        select: {
          knowledgeBases: true,
          ...activeSourceCountSelect,
        },
      },
      knowledgeBases: {
        where: { isActive: true },
        select: { id: true },
        take: 1,
      },
      knowledgeBuilds: {
        where: { status: { in: [...ACTIVE_BUILD_STATUSES] } },
        select: { id: true },
        take: 1,
        orderBy: { startedAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return brands.map((row) => ({
    ...mapBrand(row),
    sourceCount: sumActiveSourceCounts(row._count),
    knowledgeBaseVersionCount: row._count.knowledgeBases,
    activeKnowledgeBaseId: row.knowledgeBases[0]?.id ?? null,
    hasActiveBuild: row.knowledgeBuilds.length > 0,
    activeBuildId: row.knowledgeBuilds[0]?.id ?? null,
  }));
}

/** Dashboard requires at least one active source and at least one knowledge base version. */
export async function canOpenTaaviaBrandDashboard(userId: string, tenantId: string, brandId: string): Promise<boolean> {
  if (!(await findAuthorizedTenant(userId, tenantId))) return false;
  const brand = await prisma.taaviaBrand.findFirst({
    where: { id: brandId, tenantId },
    select: {
      _count: {
        select: {
          knowledgeBases: true,
          ...activeSourceCountSelect,
        },
      },
    },
  });
  if (!brand) return false;
  return sumActiveSourceCounts(brand._count) > 0 && brand._count.knowledgeBases > 0;
}

export async function getTaaviaBrandForTenant(userId: string, tenantId: string, brandId: string): Promise<TaaviaBrand | null> {
  if (!(await findAuthorizedTenant(userId, tenantId))) return null;
  const brand = await prisma.taaviaBrand.findFirst({ where: { id: brandId, tenantId }, include: brandInclude });
  return brand ? mapBrand(brand) : null;
}

export async function createTaaviaBrandForTenant(userId: string, input: CreateTaaviaBrandInput): Promise<TaaviaBrand | null> {
  if (!(await findAuthorizedManager(userId, input.tenantId))) return null;

  const name = validateBrandInput(input.name);
  const description = normalizeText(input.description, MAX_DESCRIPTION_LENGTH);
  const now = new Date();
  const brandId = id();

  const created = await prisma.$transaction(async (tx) => {
    let mediaAssetId: string | null = null;
    if (input.icon?.previewData) {
      mediaAssetId = id();
      await tx.mediaAsset.create({
        data: {
          id: mediaAssetId,
          extension: input.icon.extension ?? null,
          sizeBytes: input.icon.sizeBytes ?? null,
          previewData: input.icon.previewData,
          storageUrl: input.icon.storageUrl ?? null,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    const brand = await tx.taaviaBrand.create({
      data: {
        id: brandId,
        tenantId: input.tenantId,
        name,
        description,
        mediaAssetId,
        status: 'ACTIVE',
        setupMode: 'NOT_SELECTED',
        createdByUserId: userId,
        createdAt: now,
        updatedAt: now,
      },
      include: brandInclude,
    });

    await tx.taaviaConversation.create({
      data: {
        tenantId: input.tenantId,
        brandId,
        type: 'admin_agent',
        createdByUserId: userId,
        messages: { create: { role: 'assistant', content: 'برند ایجاد شد. برای تکمیل راه‌اندازی، یکی از مسیرهای آماده‌سازی را انتخاب کنید.', status: 'completed' } },
      },
    });

    await tx.tenant.update({ where: { id: input.tenantId }, data: { lastActivity: now } });
    return brand;
  });

  return mapBrand(created);
}

export async function updateTaaviaBrandForTenant(userId: string, input: UpdateTaaviaBrandInput): Promise<TaaviaBrand | null> {
  if (!(await findAuthorizedManager(userId, input.tenantId))) return null;
  const existing = await prisma.taaviaBrand.findFirst({ where: { id: input.brandId, tenantId: input.tenantId } });
  if (!existing) return null;

  const name = validateBrandInput(input.name);
  const description = normalizeText(input.description, MAX_DESCRIPTION_LENGTH);
  const now = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    let mediaAssetId = existing.mediaAssetId;
    if (input.icon?.previewData) {
      mediaAssetId = id();
      await tx.mediaAsset.create({
        data: {
          id: mediaAssetId,
          extension: input.icon.extension ?? null,
          sizeBytes: input.icon.sizeBytes ?? null,
          previewData: input.icon.previewData,
          storageUrl: input.icon.storageUrl ?? null,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    return tx.taaviaBrand.update({
      where: { id: input.brandId },
      data: { name, description, mediaAssetId, updatedAt: now },
      include: brandInclude,
    });
  });

  return mapBrand(updated);
}

export async function setTaaviaBrandStatus(userId: string, tenantId: string, brandId: string, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
  if (!(await findAuthorizedManager(userId, tenantId))) return null;
  const existing = await prisma.taaviaBrand.findFirst({ where: { id: brandId, tenantId } });
  if (!existing) return null;
  const updated = await prisma.taaviaBrand.update({ where: { id: brandId }, data: { status, updatedAt: new Date() }, include: brandInclude });
  return mapBrand(updated);
}

export async function deleteTaaviaBrandForTenant(userId: string, tenantId: string, brandId: string) {
  return Boolean(await setTaaviaBrandStatus(userId, tenantId, brandId, 'ARCHIVED'));
}
