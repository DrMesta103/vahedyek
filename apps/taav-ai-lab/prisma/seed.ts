import { applyCurrentDatabaseUrl } from '../app/config/database';
import { hashPassword } from '../app/lib/auth';
import { ensureAiProviderSeedData } from '../app/lib/ai-provider-runtime-seed';
import { ensureAiProviderV2SeedData } from '../app/lib/ai-provider-v2-runtime-seed';
import { GLOBAL_SETTINGS_MOCK } from '../app/lib/global-settings-mock';
import { prisma } from '../app/lib/prisma';
import { calculateBrandInfoHash } from '../app/lib/brand-info/hash';
import { storeBrandInfoMedia } from '../app/lib/brand-info/storage';

applyCurrentDatabaseUrl();

const DEMO_TENANT_SLUG = 'azmayeshgah-kharidar';
const DEMO_TENANT_NAME = 'آزمایشگاه نام و نام خانوادگی خریدار';
const DEFAULT_PRODUCTS = ['ocr', 'taavia'] as const;

async function seedGlobalSettings() {
  await prisma.platformUsdRate.upsert({
    where: { id: 'global' },
    update: {},
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
        relatedModelIds: model.relatedModelIds,
        isActive: true,
      },
      create: {
        id: model.id,
        provider: model.provider,
        providerLabel: model.providerLabel,
        name: model.name,
        category: model.category,
        pricePer100TokensUsd: model.pricePer100TokensUsd,
        relatedModelIds: model.relatedModelIds,
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
  return prisma.appUser.upsert({
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

async function seedDemoTenant(ownerUserId: string) {
  const now = new Date();

  const tenant = await prisma.tenant.upsert({
    where: { slug: DEMO_TENANT_SLUG },
    update: {
      name: DEMO_TENANT_NAME,
      brandCode: 'AZ',
      packageKey: 'starter',
      billingCycle: 'monthly',
      logoUrl: '',
      tokenLimit: 250000,
      usedTokens: 0,
      ocrTestsCount: 0,
      lastActivity: now,
      isActive: true,
    },
    create: {
      slug: DEMO_TENANT_SLUG,
      name: DEMO_TENANT_NAME,
      brandCode: 'AZ',
      packageKey: 'starter',
      billingCycle: 'monthly',
      logoUrl: '',
      tokenLimit: 250000,
      usedTokens: 0,
      ocrTestsCount: 0,
      lastActivity: now,
      memberships: {
        create: { userId: ownerUserId, role: 'owner' },
      },
      products: {
        create: DEFAULT_PRODUCTS.map((productKey) => ({ productKey, status: 'active' })),
      },
    },
  });

  await prisma.userTenantMembership.upsert({
    where: {
      userId_tenantId: {
        userId: ownerUserId,
        tenantId: tenant.id,
      },
    },
    update: { role: 'owner' },
    create: { userId: ownerUserId, tenantId: tenant.id, role: 'owner' },
  });

  for (const productKey of DEFAULT_PRODUCTS) {
    await prisma.tenantProduct.upsert({
      where: {
        tenantId_productKey: {
          tenantId: tenant.id,
          productKey,
        },
      },
      update: { status: 'active' },
      create: { tenantId: tenant.id, productKey, status: 'active' },
    });
  }
}

async function seedTaaviaBrandsAndAssignments(ownerUserId: string) {
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { slug: DEMO_TENANT_SLUG } });
  const now = new Date();
  const brands = [
    { id: 'taavia-demo-brand-primary-000000000000', name: 'برند آزمایشی اصلی', description: 'برند نمونه برای بررسی جریان‌های تاویا.' },
    { id: 'taavia-demo-brand-secondary-000000000000', name: 'برند خدمات سازمانی', description: 'نمونه دوم برای تست فیلترها و تاریخچه.' },
  ];

  for (const seedBrand of brands) {
    await prisma.taaviaBrand.upsert({
      where: { id: seedBrand.id },
      update: { name: seedBrand.name, description: seedBrand.description, status: 'ACTIVE', setupMode: 'NOT_SELECTED', updatedAt: now },
      create: { id: seedBrand.id, tenantId: tenant.id, name: seedBrand.name, description: seedBrand.description, status: 'ACTIVE', setupMode: 'NOT_SELECTED', createdByUserId: ownerUserId, createdAt: now, updatedAt: now },
    });
    await prisma.taaviaConversation.upsert({
      where: { brandId_type: { brandId: seedBrand.id, type: 'admin_agent' } },
      update: {},
      create: { tenantId: tenant.id, brandId: seedBrand.id, type: 'admin_agent', createdByUserId: ownerUserId, messages: { create: { role: 'assistant', content: 'برند نمونه برای تست تاویا آماده است.', status: 'completed' } } },
    });
  }

  const primaryBrandId = brands[0].id;
  const existingBrandInfo = await prisma.taaviaBrandInfo.count({ where: { tenantId: tenant.id, brandId: primaryBrandId } });
  if (existingBrandInfo === 0) {
    const imageFile = new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')], 'brand.png', { type: 'image/png' });
    const pdfFile = new File([Buffer.from('%PDF-1.4 taavia seed')], 'brand-brief.pdf', { type: 'application/pdf' });
    const imageStorage = await storeBrandInfoMedia(imageFile);
    const pdfStorage = await storeBrandInfoMedia(pdfFile);
    const imageMediaId = 'taavia-seed-media-image-000000000000';
    const pdfMediaId = 'taavia-seed-media-pdf-0000000000000';
    await prisma.mediaAsset.createMany({ data: [
      { id: imageMediaId, tenantId: tenant.id, extension: 'png', sizeBytes: imageFile.size, mimeType: imageFile.type, storageKey: imageStorage.key, originalName: imageFile.name, createdAt: now, updatedAt: now },
      { id: pdfMediaId, tenantId: tenant.id, extension: 'pdf', sizeBytes: pdfFile.size, mimeType: pdfFile.type, storageKey: pdfStorage.key, originalName: pdfFile.name, createdAt: now, updatedAt: now },
    ] });
    await prisma.taaviaBrandInfo.createMany({ data: [
      { id: 'taavia-seed-info-text-000000000000', tenantId: tenant.id, brandId: primaryBrandId, type: 'TEXT', title: 'درباره برند', textContent: 'این یک منبع متنی نمونه برای معرفی برند است.', mediaAssetId: null, status: 'ACTIVE', displayOrder: 0, revision: BigInt(1), contentHash: calculateBrandInfoHash({ type: 'TEXT', title: 'درباره برند', textContent: 'این یک منبع متنی نمونه برای معرفی برند است.' }), createdBy: ownerUserId, updatedBy: ownerUserId, createdAt: now, updatedAt: now },
      { id: 'taavia-seed-info-image-0000000000', tenantId: tenant.id, brandId: primaryBrandId, type: 'IMAGE', title: 'تصویر برند', textContent: null, mediaAssetId: imageMediaId, status: 'ACTIVE', displayOrder: 1, revision: BigInt(2), contentHash: calculateBrandInfoHash({ type: 'IMAGE', title: 'تصویر برند', mediaId: imageMediaId, extension: 'png', size: imageFile.size }), createdBy: ownerUserId, updatedBy: ownerUserId, createdAt: new Date(now.getTime() - 86_400_000), updatedAt: now },
      { id: 'taavia-seed-info-file-00000000000', tenantId: tenant.id, brandId: primaryBrandId, type: 'FILE', title: 'راهنمای برند', textContent: null, mediaAssetId: pdfMediaId, status: 'ACTIVE', displayOrder: 2, revision: BigInt(1), contentHash: calculateBrandInfoHash({ type: 'FILE', title: 'راهنمای برند', mediaId: pdfMediaId, extension: 'pdf', size: pdfFile.size }), createdBy: ownerUserId, updatedBy: ownerUserId, createdAt: now, updatedAt: now },
      { id: 'taavia-seed-info-archived-00', tenantId: tenant.id, brandId: primaryBrandId, type: 'TEXT', title: 'منبع قدیمی', textContent: 'منبع آرشیوشده نمونه.', mediaAssetId: null, status: 'ARCHIVED', displayOrder: 3, revision: BigInt(3), contentHash: calculateBrandInfoHash({ type: 'TEXT', title: 'منبع قدیمی', textContent: 'منبع آرشیوشده نمونه.' }), createdBy: ownerUserId, updatedBy: ownerUserId, archivedAt: now, archivedBy: ownerUserId, createdAt: now, updatedAt: now },
    ] });
  }

  const models = await prisma.aiProviderModelV2.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
  const accounts = await prisma.aiProviderAccountV2.findMany({ where: { isActive: true } });
  const accountById = new Map(accounts.map((account) => [account.id, account]));
  const firstModel = models[0];
  if (!firstModel) return;
  const existing = await prisma.taaviaBrandAiModelAssignment.findFirst({ where: { brandId: brands[0].id, purpose: 'ADMIN_AGENT_CHAT', effectiveTo: null } });
  if (existing) return;
  const previousId = 'taavia-demo-assignment-history-000000';
  await prisma.taaviaBrandAiModelAssignment.create({ data: { id: previousId, tenantId: tenant.id, brandId: brands[0].id, aiProviderAccountId: firstModel.aiProviderAccountId, aiProviderModelId: firstModel.id, purpose: 'ADMIN_AGENT_CHAT', effectiveFrom: new Date(now.getTime() - 86400000 * 5), effectiveTo: new Date(now.getTime() - 86400000), assignedBy: ownerUserId, endedBy: ownerUserId, createdAt: new Date(now.getTime() - 86400000 * 5) } });
  await prisma.taaviaBrandAiModelAssignment.create({ data: { id: 'taavia-demo-assignment-active-000000', tenantId: tenant.id, brandId: brands[0].id, aiProviderAccountId: firstModel.aiProviderAccountId, aiProviderModelId: firstModel.id, purpose: 'ADMIN_AGENT_CHAT', effectiveFrom: new Date(now.getTime() - 86400000), effectiveTo: null, assignedBy: ownerUserId, endedBy: null, createdAt: new Date(now.getTime() - 86400000) } });
  const account = accountById.get(firstModel.aiProviderAccountId);
  if (account) {
    await prisma.aiProviderModelAssignment.createMany({ data: [
      { id: 'taavia-demo-registry-history-000000', externalAssignmentId: previousId, consumerCode: 'taavia', tenantId: tenant.id, resourceType: 'brand', resourceId: brands[0].id, aiProviderAccountId: account.id, aiProviderModelId: firstModel.id, purposeCode: 'ADMIN_AGENT_CHAT', effectiveFrom: new Date(now.getTime() - 86400000 * 5), effectiveTo: new Date(now.getTime() - 86400000), assignedBy: ownerUserId, endedBy: ownerUserId, createdAt: new Date(now.getTime() - 86400000 * 5) },
      { id: 'taavia-demo-registry-active-000000', externalAssignmentId: 'taavia-demo-assignment-active-000000', consumerCode: 'taavia', tenantId: tenant.id, resourceType: 'brand', resourceId: brands[0].id, aiProviderAccountId: account.id, aiProviderModelId: firstModel.id, purposeCode: 'ADMIN_AGENT_CHAT', effectiveFrom: new Date(now.getTime() - 86400000), effectiveTo: null, assignedBy: ownerUserId, endedBy: null, createdAt: new Date(now.getTime() - 86400000) },
    ], skipDuplicates: true });
  }
}

async function main() {
  await seedGlobalSettings();
  await ensureAiProviderSeedData();
  await ensureAiProviderV2SeedData();
  const demoUser = await seedDemoUser();
  await seedDemoTenant(demoUser.id);
  await seedTaaviaBrandsAndAssignments(demoUser.id);
  console.log('Seed completed: global settings, AI provider accounts/models (v1 + v2), platform admin credential, and demo app user.');
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
