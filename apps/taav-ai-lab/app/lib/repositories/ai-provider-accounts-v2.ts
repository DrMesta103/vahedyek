import { maskApiKey } from '../api-key-mask';
import { encryptSecret } from '../secret-encryption';
import { prisma } from '../prisma';
import type {
  AiProviderAccountV2ListResponse,
  AiProviderAccountV2Public,
  CreateAiProviderAccountV2Input,
  UpdateAiProviderAccountV2Input,
} from '../types/ai-provider-v2';
import { buildCreditSummary, mapAccountPublic, mapProviderTypeToPrisma } from './ai-provider-v2-mappers';

function assertNonEmpty(value: string, message: string) {
  if (!value.trim()) throw new Error(message);
}

export async function listAiProviderAccountsV2(): Promise<AiProviderAccountV2ListResponse> {
  const accounts = await prisma.aiProviderAccountV2.findMany({
    orderBy: [{ isSystem: 'desc' }, { updatedAt: 'desc' }, { name: 'asc' }],
    include: {
      _count: { select: { models: true } },
      models: { select: { id: true, isActive: true } },
      transactions: { where: { isDeleted: false }, select: { transactionType: true, amountUsd: true } },
    },
  });

  const mapped = accounts.map((row) => {
    const purchasedCreditUsd = row.transactions
      .filter((t) => t.transactionType === 'Purchase')
      .reduce((sum, t) => sum + Number(t.amountUsd), 0);
    const manualAdjustmentUsd = row.transactions
      .filter((t) => t.transactionType === 'ManualAdjustment')
      .reduce((sum, t) => sum + Number(t.amountUsd), 0);

    // Until UsageV2 is fully wired, usedCreditUsd is computed as 0 here.
    const usedCreditUsd = 0;

    const activeModelCount = row.models.filter((m) => m.isActive).length;
    return {
      ...mapAccountPublic(row),
      credit: buildCreditSummary({ purchasedCreditUsd, manualAdjustmentUsd, usedCreditUsd }),
      totalModelCount: row._count.models,
      activeModelCount,
    };
  });

  const summary = {
    totalAccounts: mapped.length,
    activeAccounts: mapped.filter((a) => a.isActive).length,
    totalCreditUsd: mapped.reduce((sum, a) => sum + a.credit.totalCreditUsd, 0),
    totalUsedCreditUsd: mapped.reduce((sum, a) => sum + a.credit.usedCreditUsd, 0),
    totalRemainingCreditUsd: mapped.reduce((sum, a) => sum + a.credit.remainingCreditUsd, 0),
  };

  return { accounts: mapped, summary };
}

export async function getAiProviderAccountByIdV2(accountId: string): Promise<AiProviderAccountV2Public | null> {
  const row = await prisma.aiProviderAccountV2.findUnique({ where: { id: accountId } });
  if (!row) return null;
  return mapAccountPublic(row);
}

export async function createAiProviderAccountV2(input: {
  data: CreateAiProviderAccountV2Input;
  actorUserId: string;
}): Promise<AiProviderAccountV2Public> {
  assertNonEmpty(input.data.name, 'نام اکانت الزامی است.');
  assertNonEmpty(input.data.apiKey, 'API Key الزامی است.');
  assertNonEmpty(input.actorUserId, 'Actor الزامی است.');

  const now = new Date();

  const row = await prisma.aiProviderAccountV2.create({
    data: {
      id: crypto.randomUUID().replaceAll('-', ''),
      name: input.data.name.trim(),
      providerType: mapProviderTypeToPrisma(input.data.providerType),
      encryptedApiKey: encryptSecret(input.data.apiKey.trim()),
      apiKeyMasked: maskApiKey(input.data.apiKey.trim()),
      endpoint: input.data.endpoint ?? null,
      apiVersion: input.data.apiVersion ?? null,
      billingEmail: input.data.billingEmail ?? null,
      isSystem: false,
      isActive: input.data.isActive,
      isRecommended: input.data.isRecommended ?? false,
      description: input.data.description ?? null,
      apiKeyUpdatedAt: now,
      apiKeyUpdatedBy: input.actorUserId,
      createdBy: input.actorUserId,
      updatedBy: input.actorUserId,
      createdAt: now,
      updatedAt: now,
    },
  });

  return mapAccountPublic(row);
}

export async function updateAiProviderAccountV2(input: {
  accountId: string;
  data: UpdateAiProviderAccountV2Input;
  actorUserId: string;
}): Promise<AiProviderAccountV2Public | null> {
  const existing = await prisma.aiProviderAccountV2.findUnique({ where: { id: input.accountId } });
  if (!existing) return null;

  const now = new Date();

  const row = await prisma.aiProviderAccountV2.update({
    where: { id: input.accountId },
    data: {
      ...(input.data.name !== undefined ? { name: input.data.name.trim() } : {}),
      ...(input.data.endpoint !== undefined ? { endpoint: input.data.endpoint } : {}),
      ...(input.data.apiVersion !== undefined ? { apiVersion: input.data.apiVersion } : {}),
      ...(input.data.billingEmail !== undefined ? { billingEmail: input.data.billingEmail } : {}),
      ...(input.data.description !== undefined ? { description: input.data.description } : {}),
      ...(input.data.isActive !== undefined ? { isActive: input.data.isActive } : {}),
      ...(input.data.isRecommended !== undefined ? { isRecommended: input.data.isRecommended } : {}),
      updatedBy: input.actorUserId,
      updatedAt: now,
    },
  });

  return mapAccountPublic(row);
}

export async function changeAiProviderAccountApiKeyV2(input: {
  accountId: string;
  apiKey: string;
  actorUserId: string;
}): Promise<AiProviderAccountV2Public | null> {
  const existing = await prisma.aiProviderAccountV2.findUnique({ where: { id: input.accountId } });
  if (!existing) return null;
  if (!input.apiKey.trim()) throw new Error('API Key الزامی است.');

  const now = new Date();
  const row = await prisma.aiProviderAccountV2.update({
    where: { id: input.accountId },
    data: {
      encryptedApiKey: encryptSecret(input.apiKey.trim()),
      apiKeyMasked: maskApiKey(input.apiKey.trim()),
      apiKeyUpdatedAt: now,
      apiKeyUpdatedBy: input.actorUserId,
      updatedBy: input.actorUserId,
      updatedAt: now,
    },
  });

  return mapAccountPublic(row);
}

export async function toggleAiProviderAccountStatusV2(input: {
  accountId: string;
  isActive: boolean;
  actorUserId: string;
}): Promise<AiProviderAccountV2Public | null> {
  const existing = await prisma.aiProviderAccountV2.findUnique({ where: { id: input.accountId } });
  if (!existing) return null;

  const now = new Date();
  const row = await prisma.aiProviderAccountV2.update({
    where: { id: input.accountId },
    data: { isActive: input.isActive, updatedBy: input.actorUserId, updatedAt: now },
  });

  return mapAccountPublic(row);
}

export async function deleteAiProviderAccountV2(input: { accountId: string }): Promise<boolean> {
  const existing = await prisma.aiProviderAccountV2.findUnique({ where: { id: input.accountId } });
  if (!existing) return false;
  if (existing.isSystem) throw new Error('اکانت سیستمی قابل حذف نیست.');

  // Guards from doc (transactions, usage, assignments) will be enforced once v2 usage + model assignments exist.
  await prisma.aiProviderAccountV2.delete({ where: { id: input.accountId } });
  return true;
}

