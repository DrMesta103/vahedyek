import { assertTenantAccess } from '../auth';
import { prisma } from '../prisma';
import type { CreateTaaviaBrandInput, TaaviaBrand } from '../types/domain';

const INITIAL_ASSISTANT_MESSAGE =
  'سلام، من کمک می‌کنم برند شما را برای ساخت چت‌بات پشتیبانی هوشمند آماده کنیم. لطفاً ابتدا برند خودتان را معرفی کنید و بگویید این برند چه کاری انجام می‌دهد.';

function mapBrand(row: {
  id: string;
  tenantId: string;
  name: string;
  createdByUserId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): TaaviaBrand {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    createdByUserId: row.createdByUserId,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getTaaviaBrandsForTenant(userId: string, tenantId: string): Promise<TaaviaBrand[]> {
  if (!(await assertTenantAccess(userId, tenantId))) return [];

  const brands = await prisma.taaviaBrand.findMany({
    where: { tenantId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return brands.map(mapBrand);
}

export async function getTaaviaBrandForTenant(
  userId: string,
  tenantId: string,
  brandId: string,
): Promise<TaaviaBrand | null> {
  if (!(await assertTenantAccess(userId, tenantId))) return null;

  const brand = await prisma.taaviaBrand.findFirst({
    where: { id: brandId, tenantId, isActive: true },
  });

  return brand ? mapBrand(brand) : null;
}

export async function createTaaviaBrandForTenant(
  userId: string,
  input: CreateTaaviaBrandInput,
): Promise<TaaviaBrand | null> {
  if (!(await assertTenantAccess(userId, input.tenantId))) return null;

  const name = input.name.trim();
  if (!name) return null;

  const brand = await prisma.$transaction(async (tx) => {
    const created = await tx.taaviaBrand.create({
      data: {
        tenantId: input.tenantId,
        name,
        createdByUserId: userId,
      },
    });

    const conversation = await tx.taaviaConversation.create({
      data: {
        tenantId: input.tenantId,
        brandId: created.id,
        type: 'admin_agent',
        createdByUserId: userId,
        messages: {
          create: {
            role: 'assistant',
            content: INITIAL_ASSISTANT_MESSAGE,
            status: 'completed',
          },
        },
      },
    });

    await tx.tenant.update({
      where: { id: input.tenantId },
      data: { lastActivity: new Date() },
    });

    return created;
  });

  return mapBrand(brand);
}

export { INITIAL_ASSISTANT_MESSAGE };
