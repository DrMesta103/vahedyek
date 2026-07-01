import { applyCurrentDatabaseUrl } from '../app/config/database';
import { hashPassword } from '../app/lib/auth';
import { GLOBAL_SETTINGS_MOCK } from '../app/lib/global-settings-mock';
import { prisma } from '../app/lib/prisma';

applyCurrentDatabaseUrl();

async function seedGlobalSettings() {
  await prisma.platformUsdRate.upsert({
    where: { id: 'global' },
    update: { usdToToman: GLOBAL_SETTINGS_MOCK.usdToToman },
    create: { id: 'global', usdToToman: GLOBAL_SETTINGS_MOCK.usdToToman },
  });

  for (const model of GLOBAL_SETTINGS_MOCK.models) {
    await prisma.aiPricingModel.upsert({
      where: { id: model.id },
      update: {
        provider: model.provider,
        providerLabel: model.providerLabel,
        name: model.name,
        category: model.category,
        pricePer100TokensUsd: model.pricePer100TokensUsd,
        isActive: true,
      },
      create: {
        id: model.id,
        provider: model.provider,
        providerLabel: model.providerLabel,
        name: model.name,
        category: model.category,
        pricePer100TokensUsd: model.pricePer100TokensUsd,
      },
    });
  }

  const existingKeys = await prisma.aiProviderApiKey.count();
  if (existingKeys === 0) {
    for (const key of GLOBAL_SETTINGS_MOCK.apiKeys) {
      await prisma.aiProviderApiKey.create({
        data: {
          id: key.id,
          provider: key.provider,
          label: key.label,
          maskedKey: key.maskedKey,
          fullKey: key.fullKey,
          modelIds: key.modelIds,
        },
      });
    }
  }

  const { passwordHash, passwordSalt } = hashPassword('123456');
  await prisma.platformAdminCredential.upsert({
    where: { id: 'settings-admin' },
    update: { username: 'admin', passwordHash, passwordSalt },
    create: { id: 'settings-admin', username: 'admin', passwordHash, passwordSalt },
  });
}

async function seedDemoUser() {
  const { passwordHash, passwordSalt } = hashPassword('123456');
  await prisma.appUser.upsert({
    where: { email: 'admin@local.dev' },
    update: {
      firstName: 'Admin',
      lastName: 'Local',
      fullName: 'Admin Local',
      passwordHash,
      passwordSalt,
      isActive: true,
    },
    create: {
      firstName: 'Admin',
      lastName: 'Local',
      fullName: 'Admin Local',
      email: 'admin@local.dev',
      passwordHash,
      passwordSalt,
    },
  });
}

async function main() {
  await seedGlobalSettings();
  await seedDemoUser();
  console.log('Seed completed: global settings, platform admin credential, and demo app user.');
  console.log('App login: admin@local.dev / 123456');
  console.log('Settings admin gate: admin / 123456');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
