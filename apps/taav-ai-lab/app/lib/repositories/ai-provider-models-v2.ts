import { prisma } from '../prisma';
import type { AiProviderModelV2Public, CreateAiProviderModelV2Input, UpdateAiProviderModelV2Input } from '../types/ai-provider-v2';
import {
  mapCapabilityToPrisma,
  mapModelPublic,
  mapModelTypeToPrisma,
} from './ai-provider-v2-mappers';

function assertNonEmpty(value: string, message: string) {
  if (!value.trim()) throw new Error(message);
}

function dedupe<T>(items: T[]) {
  return Array.from(new Set(items));
}

export async function listAiProviderModelsV2(input: { accountId: string }): Promise<AiProviderModelV2Public[] | null> {
  const account = await prisma.aiProviderAccountV2.findUnique({ where: { id: input.accountId } });
  if (!account) return null;

  const rows = await prisma.aiProviderModelV2.findMany({
    where: { aiProviderAccountId: input.accountId },
    include: { capabilities: { select: { capabilityType: true } } },
    orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
  });

  return rows.map(mapModelPublic);
}

export async function getAiProviderModelByIdV2(input: {
  accountId: string;
  modelId: string;
}): Promise<AiProviderModelV2Public | null> {
  const row = await prisma.aiProviderModelV2.findFirst({
    where: { id: input.modelId, aiProviderAccountId: input.accountId },
    include: { capabilities: { select: { capabilityType: true } } },
  });
  if (!row) return null;
  return mapModelPublic(row);
}

export async function createAiProviderModelV2(input: {
  accountId: string;
  data: CreateAiProviderModelV2Input;
  actorUserId: string;
}): Promise<AiProviderModelV2Public | null> {
  const account = await prisma.aiProviderAccountV2.findUnique({ where: { id: input.accountId } });
  if (!account) return null;

  assertNonEmpty(input.data.name, 'نام مدل الزامی است.');
  assertNonEmpty(input.data.providerModelId, 'شناسه مدل در Provider الزامی است.');

  const now = new Date();
  const capabilities = dedupe(input.data.capabilities ?? []);

  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.aiProviderModelV2.create({
      data: {
        id: crypto.randomUUID().replaceAll('-', ''),
        aiProviderAccountId: input.accountId,
        name: input.data.name.trim(),
        providerModelId: input.data.providerModelId.trim(),
        modelType: mapModelTypeToPrisma(input.data.modelType),
        isSystem: false,
        isActive: input.data.isActive,
        createdBy: input.actorUserId,
        updatedBy: input.actorUserId,
        createdAt: now,
        updatedAt: now,
      },
    });

    if (capabilities.length > 0) {
      await tx.aiProviderModelCapabilityV2.createMany({
        data: capabilities.map((cap) => ({
          id: crypto.randomUUID().replaceAll('-', ''),
          aiProviderModelId: created.id,
          capabilityType: mapCapabilityToPrisma(cap),
        })),
      });
    }

    const withCaps = await tx.aiProviderModelV2.findUniqueOrThrow({
      where: { id: created.id },
      include: { capabilities: { select: { capabilityType: true } } },
    });
    return withCaps;
  });

  return mapModelPublic(row);
}

export async function updateAiProviderModelV2(input: {
  accountId: string;
  modelId: string;
  data: UpdateAiProviderModelV2Input;
  actorUserId: string;
}): Promise<AiProviderModelV2Public | null> {
  const existing = await prisma.aiProviderModelV2.findFirst({
    where: { id: input.modelId, aiProviderAccountId: input.accountId },
    include: { capabilities: { select: { capabilityType: true } } },
  });
  if (!existing) return null;

  if (input.data.name !== undefined) assertNonEmpty(input.data.name, 'نام مدل الزامی است.');
  if (input.data.providerModelId !== undefined) assertNonEmpty(input.data.providerModelId, 'شناسه مدل در Provider الزامی است.');

  const now = new Date();
  const row = await prisma.$transaction(async (tx) => {
    await tx.aiProviderModelV2.update({
      where: { id: existing.id },
      data: {
        ...(input.data.name !== undefined ? { name: input.data.name.trim() } : {}),
        ...(input.data.providerModelId !== undefined ? { providerModelId: input.data.providerModelId.trim() } : {}),
        ...(input.data.modelType !== undefined ? { modelType: mapModelTypeToPrisma(input.data.modelType) } : {}),
        ...(input.data.isActive !== undefined ? { isActive: input.data.isActive } : {}),
        updatedBy: input.actorUserId,
        updatedAt: now,
      },
    });

    if (input.data.capabilities !== undefined) {
      const nextCaps = dedupe(input.data.capabilities ?? []);
      await tx.aiProviderModelCapabilityV2.deleteMany({ where: { aiProviderModelId: existing.id } });
      if (nextCaps.length > 0) {
        await tx.aiProviderModelCapabilityV2.createMany({
          data: nextCaps.map((cap) => ({
            id: crypto.randomUUID().replaceAll('-', ''),
            aiProviderModelId: existing.id,
            capabilityType: mapCapabilityToPrisma(cap),
          })),
        });
      }
    }

    const withCaps = await tx.aiProviderModelV2.findUniqueOrThrow({
      where: { id: existing.id },
      include: { capabilities: { select: { capabilityType: true } } },
    });
    return withCaps;
  });

  return mapModelPublic(row);
}

export async function toggleAiProviderModelStatusV2(input: {
  accountId: string;
  modelId: string;
  isActive: boolean;
  actorUserId: string;
}): Promise<AiProviderModelV2Public | null> {
  const existing = await prisma.aiProviderModelV2.findFirst({
    where: { id: input.modelId, aiProviderAccountId: input.accountId },
    include: { capabilities: { select: { capabilityType: true } } },
  });
  if (!existing) return null;

  const now = new Date();
  const row = await prisma.aiProviderModelV2.update({
    where: { id: existing.id },
    data: { isActive: input.isActive, updatedBy: input.actorUserId, updatedAt: now },
    include: { capabilities: { select: { capabilityType: true } } },
  });

  return mapModelPublic(row);
}

export async function deleteAiProviderModelV2(input: { accountId: string; modelId: string }) {
  const existing = await prisma.aiProviderModelV2.findFirst({
    where: { id: input.modelId, aiProviderAccountId: input.accountId },
  });
  if (!existing) return false;
  if (existing.isSystem) throw new Error('مدل سیستمی قابل حذف نیست.');

  // Delete constraints (usage/pricing used/assignments) will be enforced once v2 usage + reporting is wired.
  await prisma.aiProviderModelV2.delete({ where: { id: existing.id } });
  return true;
}

