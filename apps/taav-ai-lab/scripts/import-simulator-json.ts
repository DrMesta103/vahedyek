/**
 * One-time import from .simulator/taav-ai-lab.json into PostgreSQL.
 * PostgreSQL is the runtime source of truth after import.
 *
 * Usage: npm run db:import-simulator
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { applyCurrentDatabaseUrl } from '../app/config/database';
import { mapOcrJobToDbData } from '../app/lib/ocr-job-builder';
import { prisma } from '../app/lib/prisma';
import { INITIAL_ASSISTANT_MESSAGE } from '../app/lib/repositories/taavia-brands';
import type { OcrSimulationJob, SimulatorUser, TaaviaBrand, Tenant } from '../app/lib/types/domain';

applyCurrentDatabaseUrl();

type SimulatorDatabase = {
  users: SimulatorUser[];
  tenants: Tenant[];
  ocrJobs: OcrSimulationJob[];
  taaviaBrands: TaaviaBrand[];
};

async function loadSimulatorJson(): Promise<SimulatorDatabase> {
  const dbPath = path.join(process.cwd(), '.simulator', 'taav-ai-lab.json');
  const raw = await readFile(dbPath, 'utf8');
  return JSON.parse(raw) as SimulatorDatabase;
}

async function importUsers(users: SimulatorUser[]) {
  for (const user of users) {
    await prisma.appUser.upsert({
      where: { id: user.id },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        passwordHash: user.passwordHash,
        passwordSalt: user.passwordSalt,
      },
      create: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        passwordHash: user.passwordHash,
        passwordSalt: user.passwordSalt,
      },
    });
  }
}

async function importTenants(tenants: Tenant[]) {
  for (const tenant of tenants) {
    const slug = tenant.slug ?? `tenant-${tenant.id}`;
    await prisma.tenant.upsert({
      where: { id: tenant.id },
      update: {
        slug,
        name: tenant.name,
        brandCode: tenant.brandCode ?? null,
        packageKey: tenant.packageKey ?? null,
        billingCycle: tenant.billingCycle ?? null,
        logoUrl: tenant.logoUrl,
        tokenLimit: tenant.tokenLimit,
        usedTokens: tenant.usedTokens,
        ocrTestsCount: tenant.ocrTestsCount,
        lastActivity: tenant.lastActivity ? new Date(tenant.lastActivity) : null,
        createdAt: new Date(tenant.createdAt),
        updatedAt: new Date(tenant.updatedAt),
      },
      create: {
        id: tenant.id,
        slug,
        name: tenant.name,
        brandCode: tenant.brandCode ?? null,
        packageKey: tenant.packageKey ?? null,
        billingCycle: tenant.billingCycle ?? null,
        logoUrl: tenant.logoUrl,
        tokenLimit: tenant.tokenLimit,
        usedTokens: tenant.usedTokens,
        ocrTestsCount: tenant.ocrTestsCount,
        lastActivity: tenant.lastActivity ? new Date(tenant.lastActivity) : null,
        createdAt: new Date(tenant.createdAt),
        updatedAt: new Date(tenant.updatedAt),
        memberships: {
          create: { userId: tenant.ownerUserId, role: 'owner' },
        },
        products: {
          create: [
            { productKey: 'ocr', status: 'active' },
            { productKey: 'taavia', status: 'active' },
          ],
        },
      },
    });

    await prisma.userTenantMembership.upsert({
      where: { userId_tenantId: { userId: tenant.ownerUserId, tenantId: tenant.id } },
      update: { role: 'owner' },
      create: { userId: tenant.ownerUserId, tenantId: tenant.id, role: 'owner' },
    });
  }
}

async function importOcrJobs(jobs: OcrSimulationJob[]) {
  for (const job of jobs) {
    const data = mapOcrJobToDbData(job);
    await prisma.ocrJob.upsert({
      where: { id: job.id },
      update: data,
      create: data,
    });
  }
}

async function importTaaviaBrands(brands: TaaviaBrand[]) {
  for (const brand of brands) {
    await prisma.taaviaBrand.upsert({
      where: { id: brand.id },
      update: {
        tenantId: brand.tenantId,
        name: brand.name,
        description: brand.description,
        status: brand.status,
        setupMode: brand.setupMode,
        createdAt: new Date(brand.createdAt),
        updatedAt: new Date(brand.updatedAt),
      },
      create: {
        id: brand.id,
        tenantId: brand.tenantId,
        name: brand.name,
        description: brand.description,
        status: brand.status,
        setupMode: brand.setupMode,
        createdAt: new Date(brand.createdAt),
        updatedAt: new Date(brand.updatedAt),
      },
    });

    const existingConversation = await prisma.taaviaConversation.findUnique({
      where: { brandId_type: { brandId: brand.id, type: 'admin_agent' } },
    });

    if (!existingConversation) {
      await prisma.taaviaConversation.create({
        data: {
          tenantId: brand.tenantId,
          brandId: brand.id,
          type: 'admin_agent',
          createdByUserId: 'import',
          messages: {
            create: {
              role: 'assistant',
              content: INITIAL_ASSISTANT_MESSAGE,
              status: 'completed',
            },
          },
        },
      });
    }
  }
}

async function main() {
  const database = await loadSimulatorJson();
  await importUsers(database.users);
  await importTenants(database.tenants);
  await importOcrJobs(database.ocrJobs);
  await importTaaviaBrands(database.taaviaBrands);
  console.log('Simulator JSON import completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
