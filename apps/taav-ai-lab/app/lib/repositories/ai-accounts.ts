import { maskApiKey } from '../api-key-mask';
import { encryptSecret } from '../secret-encryption';
import { prisma } from '../prisma';
import type { AiProviderModelPublic } from '../types/ai-provider-models';
import { getModelCountsByAccountIds, listModelsGroupedByAccountIds } from './ai-provider-models';
import {
  AI_PROVIDER_LABELS,
  AI_PROVIDER_TYPES,
  isAiAccountProviderType,
  DuplicateAiProviderError,
  SystemAiProviderError,
  type AiProviderAccountPublic,
  type AiProviderAccountSummary,
  type AiProviderType,
  type CreateAiProviderAccountInput,
  type UpdateAiProviderAccountInput,
} from '../types/ai-accounts';

function isAiProviderType(value: string): value is AiProviderType {
  return (AI_PROVIDER_TYPES as readonly string[]).includes(value);
}

function toNumber(value: { toString(): string } | number) {
  return Number(value);
}

type AccountRow = Awaited<ReturnType<typeof prisma.aiProviderAccount.findMany>>[number];

function mapAccount(
  account: AccountRow,
  modelCounts?: { total: number; active: number },
  models?: AiProviderModelPublic[],
): AiProviderAccountPublic {
  const purchasedCreditUsd = toNumber(account.purchasedCreditUsd);
  const usedCreditUsd = toNumber(account.usedCreditUsd);
  const remainingCreditUsd = Math.max(0, purchasedCreditUsd - usedCreditUsd);
  const provider = isAiProviderType(account.provider) ? account.provider : 'OTHER';

  return {
    id: account.id,
    name: account.name,
    provider,
    providerLabel: AI_PROVIDER_LABELS[provider],
    apiKeyMasked: account.apiKeyMasked,
    purchaseEmail: account.purchaseEmail,
    purchasedCreditUsd,
    usedCreditUsd,
    remainingCreditUsd,
    isSystem: account.isSystem,
    isActive: account.isActive,
    totalModelCount: modelCounts?.total ?? models?.length ?? 0,
    activeModelCount: modelCounts?.active ?? models?.filter((model) => model.isActive).length ?? 0,
    ...(models ? { models } : {}),
    notes: account.notes,
    createdByUserId: account.createdByUserId,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

async function getAccountByProvider(provider: AiProviderType, excludeAccountId?: string) {
  return prisma.aiProviderAccount.findFirst({
    where: {
      provider,
      ...(excludeAccountId ? { id: { not: excludeAccountId } } : {}),
    },
    select: {
      id: true,
      name: true,
      provider: true,
    },
  });
}

function buildSummary(accounts: AiProviderAccountPublic[]): AiProviderAccountSummary {
  const activeAccounts = accounts.filter((account) => account.isActive).length;
  const totalPurchasedCreditUsd = accounts.reduce((sum, account) => sum + account.purchasedCreditUsd, 0);
  const totalUsedCreditUsd = accounts.reduce((sum, account) => sum + account.usedCreditUsd, 0);

  return {
    totalAccounts: accounts.length,
    activeAccounts,
    totalPurchasedCreditUsd,
    totalUsedCreditUsd,
    totalRemainingCreditUsd: Math.max(0, totalPurchasedCreditUsd - totalUsedCreditUsd),
  };
}

export async function listAiProviderAccounts(options?: { includeModels?: boolean }) {
  const rows = await prisma.aiProviderAccount.findMany({
    orderBy: [{ isSystem: 'desc' }, { updatedAt: 'desc' }, { name: 'asc' }],
  });
  const accountIds = rows.map((row) => row.id);
  const [modelCounts, modelsByAccount] = await Promise.all([
    getModelCountsByAccountIds(accountIds),
    options?.includeModels ? listModelsGroupedByAccountIds(accountIds) : Promise.resolve(null),
  ]);
  const accounts = rows.map((row) =>
    mapAccount(
      row,
      modelCounts.get(row.id),
      modelsByAccount ? modelsByAccount.get(row.id) : undefined,
    ),
  );
  return {
    accounts,
    summary: buildSummary(accounts),
  };
}

export async function getAiProviderAccountById(accountId: string) {
  const row = await prisma.aiProviderAccount.findUnique({ where: { id: accountId } });
  if (!row) return null;
  const modelCounts = await getModelCountsByAccountIds([row.id]);
  return mapAccount(row, modelCounts.get(row.id));
}

export async function createAiProviderAccount(input: CreateAiProviderAccountInput) {
  const existing = await getAccountByProvider(input.provider);
  if (existing) {
    throw new DuplicateAiProviderError(`هر Provider فقط یک‌بار قابل ثبت است. Provider «${AI_PROVIDER_LABELS[input.provider]}» قبلاً در اکانت «${existing.name}» ثبت شده است.`);
  }

  const row = await prisma.aiProviderAccount.create({
    data: {
      name: input.name,
      provider: input.provider,
      apiKeyCipherText: encryptSecret(input.apiKey),
      apiKeyMasked: maskApiKey(input.apiKey),
      purchaseEmail: input.purchaseEmail ?? null,
      purchasedCreditUsd: input.purchasedCreditUsd,
      usedCreditUsd: 0,
      isSystem: false,
      isActive: input.isActive,
      notes: input.notes ?? null,
      createdByUserId: input.createdByUserId ?? null,
    },
  });

  return mapAccount(row, { total: 0, active: 0 });
}

export async function updateAiProviderAccount(accountId: string, input: UpdateAiProviderAccountInput) {
  const existing = await prisma.aiProviderAccount.findUnique({ where: { id: accountId } });
  if (!existing) return null;

  if (existing.isSystem && input.provider !== undefined && input.provider !== existing.provider) {
    throw new SystemAiProviderError('تغییر Provider برای اکانت سیستمی مجاز نیست.');
  }

  if (input.provider !== undefined && input.provider !== existing.provider) {
    const duplicate = await getAccountByProvider(input.provider, accountId);
    if (duplicate) {
      throw new DuplicateAiProviderError(
        `هر Provider فقط یک‌بار قابل ثبت است. Provider «${AI_PROVIDER_LABELS[input.provider]}» قبلاً در اکانت «${duplicate.name}» ثبت شده است.`,
      );
    }
  }

  const row = await prisma.aiProviderAccount.update({
    where: { id: accountId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.provider !== undefined && !existing.isSystem ? { provider: input.provider } : {}),
      ...(input.apiKey !== undefined
        ? {
            apiKeyCipherText: encryptSecret(input.apiKey),
            apiKeyMasked: maskApiKey(input.apiKey),
          }
        : {}),
      ...(input.purchaseEmail !== undefined ? { purchaseEmail: input.purchaseEmail } : {}),
      ...(input.purchasedCreditUsd !== undefined ? { purchasedCreditUsd: input.purchasedCreditUsd } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  const modelCounts = await getModelCountsByAccountIds([row.id]);
  return mapAccount(row, modelCounts.get(row.id));
}

export async function toggleAiProviderAccountStatus(accountId: string, isActive: boolean) {
  const existing = await prisma.aiProviderAccount.findUnique({ where: { id: accountId } });
  if (!existing) return null;

  const row = await prisma.aiProviderAccount.update({
    where: { id: accountId },
    data: { isActive },
  });

  const modelCounts = await getModelCountsByAccountIds([row.id]);
  return mapAccount(row, modelCounts.get(row.id));
}

export async function deleteAiProviderAccount(accountId: string) {
  const existing = await prisma.aiProviderAccount.findUnique({ where: { id: accountId } });
  if (!existing) return false;

  if (existing.isSystem) {
    throw new SystemAiProviderError('اکانت سیستمی قابل حذف نیست.');
  }

  await prisma.aiProviderAccount.delete({ where: { id: accountId } });
  return true;
}

export function parseAiProviderType(value: unknown): AiProviderType | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return isAiProviderType(normalized) ? normalized : null;
}

export function parseAiAccountProviderType(value: unknown): AiProviderType | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return isAiAccountProviderType(normalized) ? normalized : null;
}

export function isValidPurchaseEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
