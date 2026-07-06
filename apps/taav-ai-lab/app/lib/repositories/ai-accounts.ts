import { maskApiKey } from '../api-key-mask';
import { encryptSecret } from '../secret-encryption';
import { prisma } from '../prisma';
import {
  AI_PROVIDER_LABELS,
  AI_PROVIDER_TYPES,
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

function mapAccount(
  account: Awaited<ReturnType<typeof prisma.aiProviderAccount.findMany>>[number],
): AiProviderAccountPublic {
  const purchasedCreditUsd = toNumber(account.purchasedCreditUsd);
  // TODO: Replace with real usage aggregation from AiUsageLog when implemented.
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
    inputTokenPriceUsd: toNumber(account.inputTokenPriceUsd),
    outputTokenPriceUsd: toNumber(account.outputTokenPriceUsd),
    isActive: account.isActive,
    notes: account.notes,
    createdByUserId: account.createdByUserId,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
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

export async function listAiProviderAccounts() {
  const rows = await prisma.aiProviderAccount.findMany({
    orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
  });
  const accounts = rows.map(mapAccount);
  return {
    accounts,
    summary: buildSummary(accounts),
  };
}

export async function getAiProviderAccountById(accountId: string) {
  const row = await prisma.aiProviderAccount.findUnique({ where: { id: accountId } });
  if (!row) return null;
  return mapAccount(row);
}

export async function createAiProviderAccount(input: CreateAiProviderAccountInput) {
  const row = await prisma.aiProviderAccount.create({
    data: {
      name: input.name,
      provider: input.provider,
      apiKeyCipherText: encryptSecret(input.apiKey),
      apiKeyMasked: maskApiKey(input.apiKey),
      purchaseEmail: input.purchaseEmail ?? null,
      purchasedCreditUsd: input.purchasedCreditUsd,
      usedCreditUsd: 0,
      inputTokenPriceUsd: input.inputTokenPriceUsd,
      outputTokenPriceUsd: input.outputTokenPriceUsd,
      isActive: input.isActive,
      notes: input.notes ?? null,
      createdByUserId: input.createdByUserId ?? null,
    },
  });

  return mapAccount(row);
}

export async function updateAiProviderAccount(accountId: string, input: UpdateAiProviderAccountInput) {
  const existing = await prisma.aiProviderAccount.findUnique({ where: { id: accountId } });
  if (!existing) return null;

  const row = await prisma.aiProviderAccount.update({
    where: { id: accountId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.provider !== undefined ? { provider: input.provider } : {}),
      ...(input.apiKey !== undefined
        ? {
            apiKeyCipherText: encryptSecret(input.apiKey),
            apiKeyMasked: maskApiKey(input.apiKey),
          }
        : {}),
      ...(input.purchaseEmail !== undefined ? { purchaseEmail: input.purchaseEmail } : {}),
      ...(input.purchasedCreditUsd !== undefined ? { purchasedCreditUsd: input.purchasedCreditUsd } : {}),
      ...(input.inputTokenPriceUsd !== undefined ? { inputTokenPriceUsd: input.inputTokenPriceUsd } : {}),
      ...(input.outputTokenPriceUsd !== undefined ? { outputTokenPriceUsd: input.outputTokenPriceUsd } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return mapAccount(row);
}

export async function toggleAiProviderAccountStatus(accountId: string, isActive: boolean) {
  const existing = await prisma.aiProviderAccount.findUnique({ where: { id: accountId } });
  if (!existing) return null;

  const row = await prisma.aiProviderAccount.update({
    where: { id: accountId },
    data: { isActive },
  });

  return mapAccount(row);
}

export async function deleteAiProviderAccount(accountId: string) {
  const existing = await prisma.aiProviderAccount.findUnique({ where: { id: accountId } });
  if (!existing) return false;

  await prisma.aiProviderAccount.delete({ where: { id: accountId } });
  return true;
}

export function parseAiProviderType(value: unknown): AiProviderType | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return isAiProviderType(normalized) ? normalized : null;
}

export function isValidPurchaseEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
