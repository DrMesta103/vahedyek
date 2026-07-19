import { maskApiKey } from './api-key-mask';
import {
  AI_PROVIDER_SEED_ACCOUNTS,
  buildModelSeedPrices,
  getSeedModelsForProvider,
} from './ai-provider-seed-data';
import {
  buildV2PriceItemsFromTokenPrices,
  capabilitiesFromSeedModel,
  mapModelTypeV1ToV2,
  mapProviderTypeV1ToV2,
  seedUuidN,
} from './ai-provider-v2-seed-helpers';
import { GLOBAL_SETTINGS_MOCK } from './global-settings-mock';
import { prisma } from './prisma';
import { encryptSecret } from './secret-encryption';
import type { AiProviderType } from './types/ai-accounts';

const SEED_ACTOR = 'system';

let ensurePromise: Promise<void> | null = null;

export async function ensureAiProviderV2SeedData(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = runEnsureAiProviderV2SeedData().finally(() => {
      ensurePromise = null;
    });
  }
  return ensurePromise;
}

async function runEnsureAiProviderV2SeedData(): Promise<void> {
  const now = new Date();
  let accountsCreated = 0;
  let transactionsCreated = 0;
  let modelsCreated = 0;
  let pricingsCreated = 0;

  for (const seedAccount of AI_PROVIDER_SEED_ACCOUNTS) {
    const providerType = mapProviderTypeV1ToV2(seedAccount.provider);
    if (!providerType) continue;

    let account = await prisma.aiProviderAccountV2.findFirst({
      where: { providerType },
    });

    if (!account) {
      account = await prisma.aiProviderAccountV2.create({
        data: {
          id: seedAccount.id,
          name: seedAccount.name,
          providerType,
          encryptedApiKey: encryptSecret(seedAccount.apiKey),
          apiKeyMasked: maskApiKey(seedAccount.apiKey),
          endpoint: null,
          apiVersion: null,
          billingEmail: null,
          isSystem: true,
          isActive: true,
          description: 'Seed account — created automatically on app startup.',
          apiKeyUpdatedAt: now,
          apiKeyUpdatedBy: SEED_ACTOR,
          createdBy: SEED_ACTOR,
          updatedBy: SEED_ACTOR,
          createdAt: now,
          updatedAt: now,
        },
      });
      accountsCreated += 1;
    } else if (!account.isSystem) {
      account = await prisma.aiProviderAccountV2.update({
        where: { id: account.id },
        data: { isSystem: true, updatedBy: SEED_ACTOR, updatedAt: now },
      });
    }

    const existingPurchase = await prisma.aiProviderAccountTransactionV2.findFirst({
      where: {
        aiProviderAccountId: account.id,
        transactionType: 'Purchase',
        isDeleted: false,
      },
      select: { id: true },
    });

    if (!existingPurchase && seedAccount.purchasedCreditUsd > 0) {
      const amountToman = BigInt(
        Math.round(seedAccount.purchasedCreditUsd * GLOBAL_SETTINGS_MOCK.usdToToman),
      );

      await prisma.aiProviderAccountTransactionV2.create({
        data: {
          id: seedUuidN(),
          aiProviderAccountId: account.id,
          transactionType: 'Purchase',
          amountUsd: seedAccount.purchasedCreditUsd,
          amountToman,
          transactionAt: now,
          description: 'Seed: initial purchased credit',
          isDeleted: false,
          createdBy: SEED_ACTOR,
          createdAt: now,
        },
      });
      transactionsCreated += 1;
    }

    const seedModels = getSeedModelsForProvider(seedAccount.provider as AiProviderType);
    for (const seedModel of seedModels) {
      let model = await prisma.aiProviderModelV2.findUnique({
        where: {
          aiProviderAccountId_providerModelId: {
            aiProviderAccountId: account.id,
            providerModelId: seedModel.providerModelName,
          },
        },
        include: {
          pricings: {
            where: { isDeleted: false },
            select: { id: true },
            take: 1,
          },
        },
      });

      if (!model) {
        const modelId = seedModel.id;
        const modelType = mapModelTypeV1ToV2(seedModel.modelType);
        const capabilities = capabilitiesFromSeedModel(seedModel);

        model = await prisma.aiProviderModelV2.create({
          data: {
            id: modelId,
            aiProviderAccountId: account.id,
            name: seedModel.displayName,
            providerModelId: seedModel.providerModelName,
            modelType,
            isSystem: true,
            isActive: true,
            createdBy: SEED_ACTOR,
            updatedBy: SEED_ACTOR,
            createdAt: now,
            updatedAt: now,
            capabilities: {
              createMany: {
                data: capabilities.map((capabilityType) => ({
                  id: seedUuidN(),
                  capabilityType,
                })),
              },
            },
          },
          include: {
            pricings: {
              where: { isDeleted: false },
              select: { id: true },
              take: 1,
            },
          },
        });
        modelsCreated += 1;
      } else if (!model.isSystem) {
        await prisma.aiProviderModelV2.update({
          where: { id: model.id },
          data: { isSystem: true, updatedBy: SEED_ACTOR, updatedAt: now },
        });
      }

      if (model.pricings.length === 0) {
        const prices = buildModelSeedPrices({
          pricingModelId: seedModel.pricingModelId,
          modelType: seedModel.modelType,
          inputRatio: seedModel.inputRatio,
        });
        const priceItems = buildV2PriceItemsFromTokenPrices(prices);

        if (priceItems.length > 0) {
          await prisma.aiProviderModelPricingV2.create({
            data: {
              id: seedUuidN(),
              aiProviderModelId: model.id,
              effectiveFrom: now,
              effectiveTo: null,
              endedBy: null,
              isDeleted: false,
              createdBy: SEED_ACTOR,
              createdAt: now,
              priceItems: {
                createMany: {
                  data: priceItems.map((item) => ({
                    id: seedUuidN(),
                    usageMetricType: item.usageMetricType,
                    usageUnitType: item.usageUnitType,
                    unitQuantity: item.unitQuantity,
                    priceUsd: item.priceUsd,
                    createdBy: SEED_ACTOR,
                    createdAt: now,
                    updatedBy: SEED_ACTOR,
                    updatedAt: now,
                    isDeleted: false,
                  })),
                },
              },
            },
          });
          pricingsCreated += 1;
        }
      }
    }
  }

  if (accountsCreated > 0 || transactionsCreated > 0 || modelsCreated > 0 || pricingsCreated > 0) {
    console.log(
      `[ai-provider-v2-seed] ensured system providers (accounts: ${accountsCreated}, transactions: ${transactionsCreated}, models: ${modelsCreated}, pricings: ${pricingsCreated})`,
    );
  }
}
