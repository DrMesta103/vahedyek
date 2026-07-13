import { prisma } from '../app/lib/prisma';

async function main() {
  const [accounts, models, pricings, transactions, priceItems, capabilities] = await Promise.all([
    prisma.aiProviderAccountV2.count(),
    prisma.aiProviderModelV2.count(),
    prisma.aiProviderModelPricingV2.count(),
    prisma.aiProviderAccountTransactionV2.count(),
    prisma.aiProviderModelPriceItemV2.count(),
    prisma.aiProviderModelCapabilityV2.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        accounts,
        models,
        pricings,
        transactions,
        priceItems,
        capabilities,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
