/**
 * حذف همهٔ پیش‌نویس‌های قرارداد (ContractDraft) و دادهٔ وابسته به‌صورت CASCADE در PostgreSQL.
 * پس از migrate deploy روی همان DATABASE_URL اجرا کنید.
 */
import { PrismaClient } from '../node_modules/.prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.contractDraft.deleteMany({});
  console.log(`Deleted ${result.count} contract draft record(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
