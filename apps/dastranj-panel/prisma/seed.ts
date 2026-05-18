import { PrismaClient } from '../node_modules/.prisma/client';
import { seedSampleData } from '../app/lib/seed';

const prisma = new PrismaClient();

async function main() {
  const tenantId = process.env.SEED_TENANT_ID;
  if (!tenantId) throw new Error('SEED_TENANT_ID is required for tenant-scoped seed data.');
  await seedSampleData(prisma, tenantId);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
