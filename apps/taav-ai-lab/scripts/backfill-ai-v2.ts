import { prisma } from '@/app/lib/prisma';
import {
  buildV2PriceItemsFromLegacyModel,
  capabilitiesFromLegacyModel,
  mapModelTypeV1ToV2,
  mapProviderTypeV1ToV2,
  seedUuidN,
} from '@/app/lib/ai-provider-v2-seed-helpers';

async function main() {
  const actor = process.env.BACKFILL_ACTOR_USER_ID ?? 'system';
  const now = new Date();

  const legacyAccounts = await prisma.aiProviderAccount.findMany({
    include: { models: true, usageLogs: true },
    orderBy: [{ isSystem: 'desc' }, { updatedAt: 'desc' }],
  });

  const report = {
    totalLegacyAccounts: legacyAccounts.length,
    createdAccounts: 0,
    skippedAccounts: 0,
    createdModels: 0,
    createdPricings: 0,
    createdPriceItems: 0,
    createdUsages: 0,
    createdUsageItems: 0,
  };

  for (const acc of legacyAccounts) {
    const providerType = mapProviderTypeV1ToV2(acc.provider);
    if (!providerType) {
      report.skippedAccounts += 1;
      continue;
    }

    const existing = await prisma.aiProviderAccountV2.findFirst({
      where: { providerType },
      select: { id: true },
    });
    if (existing) {
      report.skippedAccounts += 1;
      continue;
    }

    const accountIdV2 = seedUuidN();

    await prisma.aiProviderAccountV2.create({
      data: {
        id: accountIdV2,
        name: acc.name,
        providerType,
        encryptedApiKey: acc.apiKeyCipherText,
        apiKeyMasked: acc.apiKeyMasked,
        endpoint: null,
        apiVersion: null,
        billingEmail: acc.purchaseEmail,
        isSystem: acc.isSystem,
        isActive: acc.isActive,
        description: acc.notes,
        apiKeyUpdatedAt: acc.updatedAt,
        apiKeyUpdatedBy: actor,
        createdBy: acc.createdByUserId ?? actor,
        updatedBy: actor,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt,
      },
    });
    report.createdAccounts += 1;

    // Convert purchasedCreditUsd into an initial Purchase transaction.
    const purchasedCreditUsd = Number(acc.purchasedCreditUsd);
    if (Number.isFinite(purchasedCreditUsd) && purchasedCreditUsd > 0) {
      await prisma.aiProviderAccountTransactionV2.create({
        data: {
          id: seedUuidN(),
          aiProviderAccountId: accountIdV2,
          transactionType: 'Purchase',
          amountUsd: purchasedCreditUsd,
          amountToman: BigInt(0),
          transactionAt: acc.createdAt,
          description: 'Backfill: legacy purchasedCreditUsd',
          isDeleted: false,
          createdBy: actor,
          createdAt: now,
        },
      });
    }

    // Backfill legacy models -> v2 models + initial pricing.
    for (const model of acc.models) {
      const modelIdV2 = seedUuidN();
      const modelType = mapModelTypeV1ToV2(model.modelType);

      await prisma.aiProviderModelV2.create({
        data: {
          id: modelIdV2,
          aiProviderAccountId: accountIdV2,
          name: model.displayName,
          providerModelId: model.providerModelName,
          modelType,
          isSystem: model.isSystem,
          isActive: model.isActive,
          createdBy: model.createdByUserId ?? actor,
          updatedBy: actor,
          createdAt: model.createdAt,
          updatedAt: model.updatedAt,
        },
      });
      report.createdModels += 1;

      const caps = capabilitiesFromLegacyModel(model);
      await prisma.aiProviderModelCapabilityV2.createMany({
        data: caps.map((cap) => ({
          id: seedUuidN(),
          aiProviderModelId: modelIdV2,
          capabilityType: cap,
        })),
      });

      const pricingId = seedUuidN();
      const priceItems = buildV2PriceItemsFromLegacyModel(model);

      if (priceItems.length > 0) {
        await prisma.aiProviderModelPricingV2.create({
          data: {
            id: pricingId,
            aiProviderModelId: modelIdV2,
            effectiveFrom: model.createdAt,
            effectiveTo: null,
            endedBy: null,
            isDeleted: false,
            createdBy: actor,
            createdAt: now,
            priceItems: {
              createMany: {
                data: priceItems.map((pi) => ({
                  id: seedUuidN(),
                  usageMetricType: pi.usageMetricType,
                  usageUnitType: pi.usageUnitType,
                  unitQuantity: pi.unitQuantity,
                  priceUsd: pi.priceUsd,
                  createdBy: actor,
                  createdAt: now,
                  updatedBy: actor,
                  updatedAt: now,
                  isDeleted: false,
                })),
              },
            },
          },
        });
        report.createdPricings += 1;
        report.createdPriceItems += priceItems.length;
      }
    }

    // Backfill legacy usage logs into a synthetic model under the account (best-effort).
    if (acc.usageLogs.length > 0) {
      const syntheticModel = await prisma.aiProviderModelV2.create({
        data: {
          id: seedUuidN(),
          aiProviderAccountId: accountIdV2,
          name: 'Legacy Usage (Backfill)',
          providerModelId: 'legacy-usage',
          modelType: 'TextGeneration',
          isSystem: true,
          isActive: false,
          createdBy: actor,
          updatedBy: actor,
          createdAt: now,
          updatedAt: now,
        },
      });
      report.createdModels += 1;

      const pricingId = seedUuidN();
      const priceItemInput = seedUuidN();
      const priceItemOutput = seedUuidN();
      const priceItemCached = seedUuidN();

      await prisma.aiProviderModelPricingV2.create({
        data: {
          id: pricingId,
          aiProviderModelId: syntheticModel.id,
          effectiveFrom: new Date(0),
          effectiveTo: null,
          endedBy: null,
          isDeleted: false,
          createdBy: actor,
          createdAt: now,
          priceItems: {
            createMany: {
              data: [
                { id: priceItemInput, usageMetricType: 'InputToken', usageUnitType: 'Token', unitQuantity: 1, priceUsd: 0, createdBy: actor, createdAt: now, updatedBy: actor, updatedAt: now, isDeleted: false },
                { id: priceItemOutput, usageMetricType: 'OutputToken', usageUnitType: 'Token', unitQuantity: 1, priceUsd: 0, createdBy: actor, createdAt: now, updatedBy: actor, updatedAt: now, isDeleted: false },
                { id: priceItemCached, usageMetricType: 'CachedInputToken', usageUnitType: 'Token', unitQuantity: 1, priceUsd: 0, createdBy: actor, createdAt: now, updatedBy: actor, updatedAt: now, isDeleted: false },
              ],
            },
          },
        },
      });
      report.createdPricings += 1;
      report.createdPriceItems += 3;

      for (const log of acc.usageLogs) {
        const usageId = seedUuidN();
        const startedAt = log.createdAt;
        const finishedAt = log.createdAt;

        await prisma.aiProviderModelUsageV2.create({
          data: {
            id: usageId,
            aiProviderModelId: syntheticModel.id,
            usageReferenceId: `legacy-${log.id}`,
            consumerCode: log.serviceName,
            operationCode: log.featureName,
            tenantId: log.tenantId,
            resourceType: null,
            resourceId: null,
            status: 'Succeeded',
            startedAt,
            finishedAt,
            durationMilliseconds: BigInt(0),
            aiProviderModelPricingId: pricingId,
            totalCostUsd: log.totalCostUsd,
            createdAt: log.createdAt,
            usageItems: {
              createMany: {
                data: [
                  {
                    id: seedUuidN(),
                    aiProviderModelUsageId: usageId,
                    aiProviderModelPriceItemId: priceItemInput,
                    usageMetricType: 'InputToken',
                    usageUnitType: 'Token',
                    usageQuantity: log.inputTokens,
                    appliedUnitQuantity: 1,
                    appliedPriceUsd: 0,
                    calculatedCostUsd: log.inputCostUsd,
                  },
                  {
                    id: seedUuidN(),
                    aiProviderModelUsageId: usageId,
                    aiProviderModelPriceItemId: priceItemCached,
                    usageMetricType: 'CachedInputToken',
                    usageUnitType: 'Token',
                    usageQuantity: log.cachedInputTokens,
                    appliedUnitQuantity: 1,
                    appliedPriceUsd: 0,
                    calculatedCostUsd: log.cacheReadCostUsd,
                  },
                  {
                    id: seedUuidN(),
                    aiProviderModelUsageId: usageId,
                    aiProviderModelPriceItemId: priceItemOutput,
                    usageMetricType: 'OutputToken',
                    usageUnitType: 'Token',
                    usageQuantity: log.outputTokens,
                    appliedUnitQuantity: 1,
                    appliedPriceUsd: 0,
                    calculatedCostUsd: log.outputCostUsd,
                  },
                ],
              },
            },
          },
        });

        report.createdUsages += 1;
        report.createdUsageItems += 3;
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

