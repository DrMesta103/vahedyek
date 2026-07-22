import { maskApiKey } from './api-key-mask';
import {
  AI_PROVIDER_SEED_ACCOUNTS,
  buildModelSeedPrices,
  getSeedModelsForProvider,
} from './ai-provider-seed-data';
import { prisma } from './prisma';
import { encryptSecret } from './secret-encryption';
import type { AiProviderType } from './types/ai-accounts';

let ensurePromise: Promise<void> | null = null;

export async function ensureAiProviderSeedData(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = runEnsureAiProviderSeedData().finally(() => {
      ensurePromise = null;
    });
  }
  return ensurePromise;
}

async function runEnsureAiProviderSeedData(): Promise<void> {
  let accountsCreated = 0;
  let modelsCreated = 0;

  for (const seedAccount of AI_PROVIDER_SEED_ACCOUNTS) {
    let account = await prisma.aiProviderAccount.findFirst({
      where: { provider: seedAccount.provider, isSystem: true },
    });

    if (!account) {
      account = await prisma.aiProviderAccount.create({
        data: {
          id: seedAccount.id,
          name: seedAccount.name,
          provider: seedAccount.provider,
          apiKeyCipherText: encryptSecret(seedAccount.apiKey),
          apiKeyMasked: maskApiKey(seedAccount.apiKey),
          purchasedCreditUsd: seedAccount.purchasedCreditUsd,
          usedCreditUsd: 0,
          isSystem: true,
          isActive: true,
          notes: 'Seed account — created automatically on app startup.',
        },
      });
      accountsCreated += 1;
    } else if (!account.isSystem) {
      await prisma.aiProviderAccount.update({
        where: { id: account.id },
        data: { isSystem: true },
      });
    }

    const seedModels = getSeedModelsForProvider(seedAccount.provider as AiProviderType);
    for (const seedModel of seedModels) {
      const prices = buildModelSeedPrices({
        pricingModelId: seedModel.pricingModelId,
        modelType: seedModel.modelType,
        inputRatio: seedModel.inputRatio,
        pricingUnit: seedModel.pricingUnit,
        pagePriceUsd: seedModel.pagePriceUsd,
      });

      const existingModel = await prisma.aiProviderModel.findUnique({
        where: {
          accountId_providerModelName: {
            accountId: account.id,
            providerModelName: seedModel.providerModelName,
          },
        },
      });

      if (!existingModel) {
        await prisma.aiProviderModel.create({
          data: {
            id: seedModel.id,
            accountId: account.id,
            displayName: seedModel.displayName,
            providerModelName: seedModel.providerModelName,
            modelType: seedModel.modelType,
            pricingUnit: prices.pricingUnit,
            inputTokenPriceUsd: prices.inputTokenPriceUsd,
            outputTokenPriceUsd: prices.outputTokenPriceUsd,
            pagePriceUsd: prices.pagePriceUsd,
            supportsPersian: seedModel.supportsPersian ?? false,
            supportsEnglish: seedModel.supportsEnglish ?? false,
            supportsVision: seedModel.supportsVision ?? false,
            supportsPdf: seedModel.supportsPdf ?? false,
            supportsImage: seedModel.supportsImage ?? false,
            supportsStructuredExtraction: seedModel.supportsStructuredExtraction ?? false,
            supportsEmbedding: seedModel.supportsEmbedding ?? false,
            supportsFunctionCalling: seedModel.supportsFunctionCalling ?? false,
            isDefaultForChat: seedModel.isDefaultForChat ?? false,
            isDefaultForOcr: seedModel.isDefaultForOcr ?? false,
            isDefaultForEmbedding: seedModel.isDefaultForEmbedding ?? false,
            isDefaultForVision: seedModel.isDefaultForVision ?? false,
            isSystem: true,
            isActive: true,
            notes: 'Seed model — created automatically on app startup.',
          },
        });
        modelsCreated += 1;
      } else if (!existingModel.isSystem) {
        await prisma.aiProviderModel.update({
          where: { id: existingModel.id },
          data: { isSystem: true },
        });
      }
    }
  }

  if (accountsCreated > 0 || modelsCreated > 0) {
    console.log(
      `[ai-provider-seed] ensured system providers (accounts created: ${accountsCreated}, models created: ${modelsCreated})`,
    );
  }
}
