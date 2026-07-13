import { prisma } from '../prisma';
import type {
  AiProviderAccountTransactionV2Public,
  CreateAiProviderAccountTransactionV2Input,
} from '../types/ai-provider-v2';
import { mapTransactionTypeFromPrisma, mapTransactionTypeToPrisma } from './ai-provider-v2-mappers';
import { validateAccountTransactionV2 } from '../ai-provider-v2-rules';

function toNumber(value: { toString(): string } | number) {
  return Number(value);
}

function mapRow(row: {
  id: string;
  aiProviderAccountId: string;
  transactionType: any;
  amountUsd: any;
  amountToman: bigint;
  transactionAt: Date;
  description: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdBy: string;
  createdAt: Date;
}): AiProviderAccountTransactionV2Public {
  return {
    id: row.id,
    aiProviderAccountId: row.aiProviderAccountId,
    transactionType: mapTransactionTypeFromPrisma(row.transactionType),
    amountUsd: toNumber(row.amountUsd),
    amountToman: Number(row.amountToman),
    transactionAt: row.transactionAt.toISOString(),
    description: row.description,
    isDeleted: row.isDeleted,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    deletedBy: row.deletedBy,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
  };
}

function assertTransactionRules(input: CreateAiProviderAccountTransactionV2Input) {
  const error = validateAccountTransactionV2(input);
  if (error) throw new Error(error);
}

export async function listAiProviderAccountTransactionsV2(input: {
  accountId: string;
  from?: Date;
  to?: Date;
  includeDeleted?: boolean;
}) {
  const rows = await prisma.aiProviderAccountTransactionV2.findMany({
    where: {
      aiProviderAccountId: input.accountId,
      ...(input.includeDeleted ? {} : { isDeleted: false }),
      ...(input.from || input.to
        ? {
            transactionAt: {
              ...(input.from ? { gte: input.from } : {}),
              ...(input.to ? { lte: input.to } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ transactionAt: 'desc' }, { createdAt: 'desc' }],
  });

  return rows.map(mapRow);
}

export async function createAiProviderAccountTransactionV2(input: {
  accountId: string;
  data: CreateAiProviderAccountTransactionV2Input;
  actorUserId: string;
}) {
  assertTransactionRules(input.data);

  const account = await prisma.aiProviderAccountV2.findUnique({ where: { id: input.accountId } });
  if (!account) return null;

  const transactionAt = new Date(input.data.transactionAt);
  if (Number.isNaN(transactionAt.getTime())) {
    throw new Error('تاریخ تراکنش معتبر نیست.');
  }

  const now = new Date();
  const row = await prisma.aiProviderAccountTransactionV2.create({
    data: {
      id: crypto.randomUUID().replaceAll('-', ''),
      aiProviderAccountId: input.accountId,
      transactionType: mapTransactionTypeToPrisma(input.data.transactionType),
      amountUsd: input.data.amountUsd,
      amountToman: BigInt(input.data.amountToman),
      transactionAt,
      description: input.data.description?.trim() ? input.data.description.trim() : null,
      isDeleted: false,
      createdBy: input.actorUserId,
      createdAt: now,
    },
  });

  return mapRow(row as any);
}

export async function deleteAiProviderAccountTransactionV2(input: {
  accountId: string;
  transactionId: string;
  actorUserId: string;
}) {
  const row = await prisma.aiProviderAccountTransactionV2.findFirst({
    where: { id: input.transactionId, aiProviderAccountId: input.accountId },
  });
  if (!row) return false;
  if (row.isDeleted) return true;

  const now = new Date();
  await prisma.aiProviderAccountTransactionV2.update({
    where: { id: row.id },
    data: { isDeleted: true, deletedAt: now, deletedBy: input.actorUserId },
  });

  return true;
}

