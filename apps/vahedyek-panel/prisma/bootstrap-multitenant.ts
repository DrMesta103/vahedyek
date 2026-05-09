import { PrismaClient } from '../node_modules/.prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TENANT_ID = 'tenant-default-lind';
const DEFAULT_TENANT_SLUG = 'lind';
const DEFAULT_TENANT_NAME = 'لیند';
const DEFAULT_TENANT_BRAND = 'LIND';

async function ensureTenantTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Tenant" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "brandCode" TEXT NOT NULL DEFAULT 'VN',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_slug_key" ON "Tenant"("slug");
  `);

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "Tenant" ("id", "slug", "name", "brandCode", "updatedAt")
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT ("slug")
      DO UPDATE SET "name" = EXCLUDED."name", "brandCode" = EXCLUDED."brandCode", "updatedAt" = CURRENT_TIMESTAMP;
    `,
    DEFAULT_TENANT_ID,
    DEFAULT_TENANT_SLUG,
    DEFAULT_TENANT_NAME,
    DEFAULT_TENANT_BRAND,
  );
}

async function addTenantColumn(tableName: string) {
  await prisma.$executeRawUnsafe(`ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;`);
  await prisma.$executeRawUnsafe(
    `UPDATE "${tableName}" SET "tenantId" = $1 WHERE "tenantId" IS NULL;`,
    DEFAULT_TENANT_ID,
  );
}

async function main() {
  console.log('Preparing existing database for multi-tenant migration...');

  await ensureTenantTable();

  for (const tableName of ['Block', 'ContractDraft', 'DirectoryPerson', 'Employee', 'Unit']) {
    await addTenantColumn(tableName);
  }

  console.log('Bootstrap finished. Existing rows now have a default tenant.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Multi-tenant bootstrap failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
