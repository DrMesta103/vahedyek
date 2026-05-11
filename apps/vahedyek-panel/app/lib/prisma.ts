import { PrismaClient } from '@/lib/prisma-client';
import { applyCurrentDatabaseUrl } from '../config/database';

applyCurrentDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

function isCompatiblePrismaClient(client: PrismaClient | undefined): client is PrismaClient {
  if (!client) return false;
  return 'approvalWorkflow' in client && 'contractApprovalInstance' in client;
}

export const prisma = isCompatiblePrismaClient(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
