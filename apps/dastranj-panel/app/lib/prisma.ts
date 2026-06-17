import { PrismaClient } from './prisma-client';
import { applyCurrentDatabaseUrl } from '../config/database';

applyCurrentDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: any };

function createPrismaClient(): any {
  const options = {
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    __internal: {
      configOverride: (config) => ({ ...config, copyEngine: true }),
    },
  };

  return new (PrismaClient as any)(options);
}

function isCompatiblePrismaClient(client: any): client is any {
  if (!client) return false;

  const requiredDelegates = [
    'appUser',
    'tenant',
    'userTenantMembership',
    'tenantRole',
    'tenantRolePermission',
    'userTenantMembershipRole',
    'businessProfile',
    'location',
    'calendar',
    'workPolicy',
    'employee',
    'organizationUnit',
    'requestReason',
    'shiftTemplate',
    'workGroup',
    'workGroupMember',
    'draftTemplate',
    'tenantSetupReminderState',
  ] as const;

  return requiredDelegates.every((delegate) => delegate in client);
}

export const prisma: any = isCompatiblePrismaClient(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
