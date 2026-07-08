import { assertTenantAccess } from '../auth';
import { prisma } from '../prisma';
import type {
  CreateTaaviaBrandInput,
  TaaviaBrand,
  TaaviaBrandModelServiceKey,
  UpdateTaaviaBrandInput,
} from '../types/domain';

const INITIAL_ASSISTANT_MESSAGE =
  'سلام، من کمک می‌کنم برند شما را برای ساخت چت‌بات پشتیبانی هوشمند آماده کنیم. لطفاً ابتدا برند خودتان را معرفی کنید و بگویید این برند چه کاری انجام می‌دهد.';

type BrandAssistantMetadata = {
  intake?: {
    description?: string;
    iconName?: string;
    iconDataUrl?: string;
  };
  modelPreferences?: Partial<Record<TaaviaBrandModelServiceKey, string>>;
};

function mapBrand(row: {
  id: string;
  tenantId: string;
  name: string;
  createdByUserId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  intake?: {
    description?: string;
    iconName?: string;
    iconDataUrl?: string;
  } | null;
  modelPreferences?: Partial<Record<TaaviaBrandModelServiceKey, string>> | null;
}): TaaviaBrand {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    createdByUserId: row.createdByUserId,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    intake: row.intake ?? undefined,
    modelPreferences: row.modelPreferences ?? undefined,
  };
}

function buildBrandAssistantMessage(intake?: {
  description?: string;
  iconName?: string;
  iconDataUrl?: string;
}) {
  const hasIntake = intake && Object.values(intake).some((value) => value.trim());
  if (!hasIntake) return INITIAL_ASSISTANT_MESSAGE;

  return `${INITIAL_ASSISTANT_MESSAGE}\n\nخلاصه اطلاعات اولیه برند:\n- توضیحات: ${intake?.description?.trim() || 'ثبت نشده'}\n- آیکون: ${intake?.iconName?.trim() || 'ثبت نشده'}`;
}

function buildAssistantMetadata(input: {
  intake?: {
    description?: string;
    iconName?: string;
    iconDataUrl?: string;
  };
  modelPreferences?: Partial<Record<TaaviaBrandModelServiceKey, string>>;
  currentMetadata?: BrandAssistantMetadata | null;
}) {
  const hasIntake = input.intake && Object.values(input.intake).some((value) => value.trim());
  const nextModelPreferences = input.modelPreferences ?? input.currentMetadata?.modelPreferences;

  const metadata: BrandAssistantMetadata = {
    ...(hasIntake
      ? { intake: input.intake }
      : input.currentMetadata?.intake
        ? { intake: input.currentMetadata.intake }
        : {}),
    ...(nextModelPreferences ? { modelPreferences: nextModelPreferences } : {}),
  };

  return Object.keys(metadata).length > 0 ? metadata : null;
}

export async function getTaaviaBrandsForTenant(userId: string, tenantId: string): Promise<TaaviaBrand[]> {
  if (!(await assertTenantAccess(userId, tenantId))) return [];

  const brands = await prisma.taaviaBrand.findMany({
    where: { tenantId, isActive: true },
    include: {
      conversations: {
        where: { type: 'admin_agent' },
        select: {
          messages: {
            where: { role: 'assistant' },
            orderBy: { createdAt: 'asc' },
            take: 1,
            select: { metadata: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return brands.map((brand) => {
    const metadata = (brand.conversations[0]?.messages[0]?.metadata as BrandAssistantMetadata | null | undefined) ?? undefined;

    return mapBrand({
      ...brand,
      intake: metadata?.intake,
      modelPreferences: metadata?.modelPreferences,
    });
  });
}

export async function getTaaviaBrandForTenant(
  userId: string,
  tenantId: string,
  brandId: string,
): Promise<TaaviaBrand | null> {
  if (!(await assertTenantAccess(userId, tenantId))) return null;

  const brand = await prisma.taaviaBrand.findFirst({
    where: { id: brandId, tenantId, isActive: true },
    include: {
      conversations: {
        where: { type: 'admin_agent' },
        select: {
          messages: {
            where: { role: 'assistant' },
            orderBy: { createdAt: 'asc' },
            take: 1,
            select: { metadata: true },
          },
        },
      },
    },
  });

  if (!brand) return null;

  const metadata = (brand.conversations[0]?.messages[0]?.metadata as BrandAssistantMetadata | null | undefined) ?? undefined;

  return mapBrand({
    ...brand,
    intake: metadata?.intake,
    modelPreferences: metadata?.modelPreferences,
  });
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

    await tx.taaviaConversation.create({
      data: {
        tenantId: input.tenantId,
        brandId: created.id,
        type: 'admin_agent',
        createdByUserId: userId,
        messages: {
          create: {
            role: 'assistant',
            content: buildBrandAssistantMessage(input.intake),
            status: 'completed',
            metadata: buildAssistantMetadata({
              intake: input.intake,
              modelPreferences: input.modelPreferences,
            }),
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

  return mapBrand({
    ...brand,
    intake: input.intake,
    modelPreferences: input.modelPreferences,
  });
}

export async function updateTaaviaBrandForTenant(
  userId: string,
  input: UpdateTaaviaBrandInput,
): Promise<TaaviaBrand | null> {
  if (!(await assertTenantAccess(userId, input.tenantId))) return null;

  const name = input.name.trim();
  if (!name) return null;

  const brand = await prisma.taaviaBrand.findFirst({
    where: { id: input.brandId, tenantId: input.tenantId, isActive: true },
  });
  if (!brand) return null;

  const updatedAt = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.taaviaBrand.update({
      where: { id: input.brandId },
      data: {
        name,
        updatedAt,
      },
    });

    const conversation = await tx.taaviaConversation.findUnique({
      where: {
        brandId_type: {
          brandId: input.brandId,
          type: 'admin_agent',
        },
      },
      include: {
        messages: {
          where: { role: 'assistant' },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    if (conversation?.messages[0]) {
      const assistantMessage = conversation.messages[0];
      const currentMetadata = (assistantMessage.metadata as BrandAssistantMetadata | null | undefined) ?? undefined;

      await tx.taaviaMessage.update({
        where: { id: assistantMessage.id },
        data: {
          content: buildBrandAssistantMessage(input.intake ?? currentMetadata?.intake),
          metadata: buildAssistantMetadata({
            intake: input.intake,
            modelPreferences: input.modelPreferences,
            currentMetadata,
          }),
        },
      });
    }

    await tx.tenant.update({
      where: { id: input.tenantId },
      data: { lastActivity: updatedAt },
    });
  });

  return getTaaviaBrandForTenant(userId, input.tenantId, input.brandId);
}

export async function updateTaaviaBrandModelPreferences(
  userId: string,
  tenantId: string,
  brandId: string,
  modelPreferences: Partial<Record<TaaviaBrandModelServiceKey, string>>,
): Promise<TaaviaBrand | null> {
  if (!(await assertTenantAccess(userId, tenantId))) return null;

  const brand = await prisma.taaviaBrand.findFirst({
    where: { id: brandId, tenantId, isActive: true },
  });
  if (!brand) return null;

  const updatedAt = new Date();
  await prisma.$transaction(async (tx) => {
    const conversation = await tx.taaviaConversation.findUnique({
      where: {
        brandId_type: {
          brandId,
          type: 'admin_agent',
        },
      },
      include: {
        messages: {
          where: { role: 'assistant' },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    if (conversation?.messages[0]) {
      const assistantMessage = conversation.messages[0];
      const currentMetadata = (assistantMessage.metadata as BrandAssistantMetadata | null | undefined) ?? undefined;

      await tx.taaviaMessage.update({
        where: { id: assistantMessage.id },
        data: {
          metadata: buildAssistantMetadata({
            intake: currentMetadata?.intake,
            modelPreferences,
            currentMetadata,
          }),
        },
      });
    }

    await tx.tenant.update({
      where: { id: tenantId },
      data: { lastActivity: updatedAt },
    });
  });

  return getTaaviaBrandForTenant(userId, tenantId, brandId);
}

export async function deleteTaaviaBrandForTenant(
  userId: string,
  tenantId: string,
  brandId: string,
): Promise<boolean> {
  if (!(await assertTenantAccess(userId, tenantId))) return false;

  const brand = await prisma.taaviaBrand.findFirst({
    where: { id: brandId, tenantId, isActive: true },
    select: { id: true },
  });

  if (!brand) return false;

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.taaviaBrand.update({
      where: { id: brandId },
      data: {
        isActive: false,
        updatedAt: now,
      },
    });

    await tx.tenant.update({
      where: { id: tenantId },
      data: { lastActivity: now },
    });
  });

  return true;
}

export { INITIAL_ASSISTANT_MESSAGE };
