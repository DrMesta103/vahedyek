import { PrismaClient } from '@prisma/client';
import { seedSampleData } from '../app/lib/seed';

const prisma = new PrismaClient();

async function main() {
  await seedSampleData(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
