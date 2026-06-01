import { prisma } from '../app/lib/prisma';
import { ensureTenantDefaultRequestReasons } from '../app/lib/request-reason-defaults';

async function main() {
  const tenants = await prisma.tenant.findMany({ select: { id: true } });

  for (const tenant of tenants) {
    await ensureTenantDefaultRequestReasons(prisma, tenant.id);
  }

  console.log(`Backfilled default request reasons for ${tenants.length} tenant(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
