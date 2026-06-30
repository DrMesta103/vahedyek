import { verifyPassword } from '../auth';
import { GLOBAL_SETTINGS_MOCK } from '../global-settings-mock';
import { prisma } from '../prisma';
import type { GlobalSettingsData } from '../global-settings-mock';

export async function getGlobalSettings(): Promise<GlobalSettingsData> {
  const [usdRate, models, apiKeys] = await Promise.all([
    prisma.platformUsdRate.findUnique({ where: { id: 'global' } }),
    prisma.aiPricingModel.findMany({ where: { isActive: true }, orderBy: { id: 'asc' } }),
    prisma.aiProviderApiKey.findMany({ where: { isActive: true }, orderBy: { label: 'asc' } }),
  ]);

  if (!usdRate && models.length === 0 && apiKeys.length === 0) {
    return GLOBAL_SETTINGS_MOCK;
  }

  return {
    usdToToman: usdRate?.usdToToman ?? GLOBAL_SETTINGS_MOCK.usdToToman,
    models:
      models.length > 0
        ? models.map((model) => ({
            id: model.id,
            provider: model.provider as GlobalSettingsData['models'][number]['provider'],
            providerLabel: model.providerLabel,
            name: model.name,
            category: model.category as GlobalSettingsData['models'][number]['category'],
            pricePer100TokensUsd: Number(model.pricePer100TokensUsd),
          }))
        : GLOBAL_SETTINGS_MOCK.models,
    apiKeys:
      apiKeys.length > 0
        ? apiKeys.map((key) => ({
            id: key.id,
            provider: key.provider as GlobalSettingsData['apiKeys'][number]['provider'],
            label: key.label,
            maskedKey: key.maskedKey,
            fullKey: key.fullKey,
            modelIds: key.modelIds,
          }))
        : GLOBAL_SETTINGS_MOCK.apiKeys,
  };
}

export async function updateUsdToToman(usdToToman: number) {
  return prisma.platformUsdRate.upsert({
    where: { id: 'global' },
    update: { usdToToman },
    create: { id: 'global', usdToToman },
  });
}

export async function updateModelPrice(modelId: string, pricePer100TokensUsd: number) {
  return prisma.aiPricingModel.update({
    where: { id: modelId },
    data: { pricePer100TokensUsd },
  });
}

export async function verifyPlatformAdmin(username: string, password: string) {
  const credential = await prisma.platformAdminCredential.findUnique({
    where: { id: 'settings-admin' },
  });
  if (!credential) return false;
  if (username.trim() !== credential.username) return false;
  return verifyPassword(password, credential.passwordHash, credential.passwordSalt);
}
