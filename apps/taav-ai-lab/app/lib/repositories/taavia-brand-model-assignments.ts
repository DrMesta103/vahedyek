import { randomUUID } from 'node:crypto';
import type { Prisma } from '../prisma-client';
import { assertTenantManagementAccess } from '../auth';
import { prisma } from '../prisma';
import {
  assertValidPurpose,
  getPurposeCompatibility,
  TAAVIA_BRAND_AI_MODEL_PURPOSES,
  TAAVIA_PURPOSE_DESCRIPTIONS,
  TAAVIA_PURPOSE_LABELS,
  type TaaviaBrandAiModelPurpose,
} from '../taavia-ai-models';

function id() {
  return randomUUID().replaceAll('-', '');
}

function mapAssignment(row: {
  id: string;
  tenantId: string;
  brandId: string;
  aiProviderAccountId: string;
  aiProviderModelId: string;
  purpose: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  assignedBy: string;
  endedBy: string | null;
  createdAt: Date;
  aiProviderAccount: { name: string; providerType: string; isActive: boolean };
  aiProviderModel: { name: string; providerModelId: string; modelType: string; isActive: boolean; capabilities: Array<{ capabilityType: string }> };
}) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    brandId: row.brandId,
    aiProviderAccountId: row.aiProviderAccountId,
    aiProviderModelId: row.aiProviderModelId,
    purpose: row.purpose,
    effectiveFrom: row.effectiveFrom.toISOString(),
    effectiveTo: row.effectiveTo?.toISOString() ?? null,
    assignedBy: row.assignedBy,
    endedBy: row.endedBy,
    createdAt: row.createdAt.toISOString(),
    account: row.aiProviderAccount,
    model: { ...row.aiProviderModel, capabilities: row.aiProviderModel.capabilities.map((item) => item.capabilityType) },
  };
}

const assignmentInclude = {
  aiProviderAccount: { select: { name: true, providerType: true, isActive: true } },
  aiProviderModel: { include: { capabilities: { select: { capabilityType: true } } } },
} as const;

async function assertTenantAndBrand(userId: string, tenantId: string, brandId: string) {
  if (!(await assertTenantManagementAccess(userId, tenantId))) throw new Error('برای مدیریت تنظیمات مدل دسترسی ندارید.');
  const tenant = await prisma.tenant.findFirst({ where: { id: tenantId, isActive: true }, select: { id: true } });
  if (!tenant) throw new Error('کسب‌وکار فعال پیدا نشد.');
  const brand = await prisma.taaviaBrand.findFirst({ where: { id: brandId, tenantId } });
  if (!brand) throw new Error('برند پیدا نشد.');
  if (brand.status !== 'ACTIVE') throw new Error('برای برند غیرفعال یا آرشیوشده امکان تخصیص مدل وجود ندارد.');
  return brand;
}

function purposeEnum(purpose: TaaviaBrandAiModelPurpose) {
  return purpose as TaaviaBrandAiModelPurpose;
}

async function createOutbox(tx: Prisma.TransactionClient, eventType: string, aggregateId: string, payload: Record<string, unknown>, occurredAt: Date) {
  await tx.integrationOutbox.create({
    data: { id: id(), eventType, aggregateId, payload: payload as Prisma.InputJsonValue, version: 1, occurredAt, createdAt: occurredAt },
  });
}

function currentPricing(model: { pricings?: Array<{ effectiveFrom: Date; effectiveTo: Date | null; priceItems: Array<{ usageMetricType: string; usageUnitType: string; unitQuantity: { toString(): string }; priceUsd: { toString(): string } }> }> }) {
  const pricing = model.pricings?.find((item) => !item.effectiveTo || item.effectiveTo > new Date());
  return pricing?.priceItems.map((item) => ({ metric: item.usageMetricType, unit: item.usageUnitType, unitQuantity: Number(item.unitQuantity), priceUsd: Number(item.priceUsd) })) ?? [];
}

export async function getTaaviaBrandModelAssignments(userId: string, tenantId: string, brandId: string) {
  await assertTenantAndBrand(userId, tenantId, brandId);
  const [brand, assignments, accounts] = await Promise.all([
    prisma.taaviaBrand.findUniqueOrThrow({ where: { id: brandId }, include: { mediaAsset: true } }),
    prisma.taaviaBrandAiModelAssignment.findMany({ where: { tenantId, brandId, effectiveTo: null }, include: assignmentInclude, orderBy: { purpose: 'asc' } }),
    prisma.aiProviderAccountV2.findMany({
      where: { isActive: true },
      orderBy: [{ providerType: 'asc' }, { name: 'asc' }],
      include: {
        models: {
          where: { isActive: true },
          include: {
            capabilities: { select: { capabilityType: true } },
            pricings: { where: { isDeleted: false, effectiveTo: null }, include: { priceItems: { where: { isDeleted: false } } }, orderBy: { effectiveFrom: 'desc' }, take: 1 },
          },
          orderBy: { name: 'asc' },
        },
      },
    }),
  ]);

  return {
    brand: { id: brand.id, tenantId: brand.tenantId, name: brand.name, description: brand.description, status: brand.status, setupMode: brand.setupMode, icon: brand.mediaAsset },
    purposes: TAAVIA_BRAND_AI_MODEL_PURPOSES.map((purpose) => ({ code: purpose, label: TAAVIA_PURPOSE_LABELS[purpose], description: TAAVIA_PURPOSE_DESCRIPTIONS[purpose] })),
    assignments: assignments.map(mapAssignment),
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      providerType: account.providerType,
      isActive: account.isActive,
      models: account.models.map((model) => ({
        id: model.id,
        name: model.name,
        providerModelId: model.providerModelId,
        modelType: model.modelType,
        isActive: model.isActive,
        capabilities: model.capabilities.map((item) => item.capabilityType),
        pricing: currentPricing(model),
      })),
    })),
    lastAssignmentChange: assignments[0]?.effectiveFrom.toISOString() ?? null,
  };
}

export async function getTaaviaBrandModelAssignmentHistory(userId: string, tenantId: string, brandId: string, purpose?: string) {
  await assertTenantAndBrand(userId, tenantId, brandId);
  const validPurpose = purpose;
  if (validPurpose) assertValidPurpose(validPurpose);
  const typedPurpose = validPurpose as TaaviaBrandAiModelPurpose | undefined;
  const rows = await prisma.taaviaBrandAiModelAssignment.findMany({
    where: { tenantId, brandId, ...(typedPurpose ? { purpose: purposeEnum(typedPurpose) } : {}) },
    include: assignmentInclude,
    orderBy: [{ purpose: 'asc' }, { effectiveFrom: 'desc' }],
  });
  return rows.map(mapAssignment);
}

export async function assignTaaviaBrandModel(input: {
  userId: string;
  tenantId: string;
  brandId: string;
  purpose: string;
  aiProviderAccountId: string;
  aiProviderModelId: string;
}) {
  const requestedPurpose = input.purpose;
  assertValidPurpose(requestedPurpose);
  const brand = await assertTenantAndBrand(input.userId, input.tenantId, input.brandId);
  const purpose = purposeEnum(requestedPurpose);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.aiProviderAccountV2.findFirst({ where: { id: input.aiProviderAccountId, isActive: true } });
      if (!account) throw new Error('حساب ارائه‌دهنده فعال پیدا نشد.');
      const model = await tx.aiProviderModelV2.findFirst({ where: { id: input.aiProviderModelId, aiProviderAccountId: account.id, isActive: true }, include: { capabilities: { select: { capabilityType: true } } } });
      if (!model) throw new Error('مدل فعال متعلق به حساب انتخاب‌شده پیدا نشد.');
      const compatibility = getPurposeCompatibility(requestedPurpose, { modelType: model.modelType, capabilities: model.capabilities.map((item) => item.capabilityType) });
      if (!compatibility.compatible) throw new Error(compatibility.reason);

      const existing = await tx.taaviaBrandAiModelAssignment.findFirst({ where: { tenantId: input.tenantId, brandId: input.brandId, purpose, effectiveTo: null }, include: assignmentInclude });
      if (existing && existing.aiProviderAccountId === account.id && existing.aiProviderModelId === model.id) return mapAssignment(existing);

      const now = new Date();
      if (existing) {
        await tx.taaviaBrandAiModelAssignment.update({ where: { id: existing.id }, data: { effectiveTo: now, endedBy: input.userId } });
        await tx.aiProviderModelAssignment.updateMany({ where: { externalAssignmentId: existing.id, effectiveTo: null }, data: { effectiveTo: now, endedBy: input.userId } });
        await createOutbox(tx, 'taavia.brand-model-assignment-ended', existing.id, { assignmentId: existing.id, brandId: input.brandId, purpose: requestedPurpose, effectiveTo: now.toISOString(), endedBy: input.userId }, now);
      }

      const assignment = await tx.taaviaBrandAiModelAssignment.create({
        data: {
          id: id(), tenantId: input.tenantId, brandId: brand.id, aiProviderAccountId: account.id, aiProviderModelId: model.id, purpose, effectiveFrom: now, effectiveTo: null, assignedBy: input.userId, endedBy: null, createdAt: now,
        },
        include: assignmentInclude,
      });
      await tx.aiProviderModelAssignment.create({ data: { id: id(), externalAssignmentId: assignment.id, consumerCode: 'taavia', tenantId: input.tenantId, resourceType: 'brand', resourceId: input.brandId, aiProviderAccountId: account.id, aiProviderModelId: model.id, purposeCode: requestedPurpose, effectiveFrom: now, effectiveTo: null, assignedBy: input.userId, endedBy: null, createdAt: now } });
      await createOutbox(tx, 'taavia.brand-model-assignment-created', assignment.id, { assignmentId: assignment.id, brandId: input.brandId, purpose: requestedPurpose, accountId: account.id, modelId: model.id, effectiveFrom: now.toISOString(), assignedBy: input.userId }, now);
      await tx.taaviaBrand.update({ where: { id: input.brandId }, data: { updatedAt: now } });
      return mapAssignment(assignment);
    }, { isolationLevel: 'Serializable' });
    return result;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('ذخیره تخصیص مدل انجام نشد.');
  }
}
