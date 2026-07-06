import { assertTenantAccess } from '../auth';
import { prisma } from '../prisma';
import type { TaaviaWorkspaceSnapshot } from '../types/taavia-workspace';

async function findBrandForTenant(tenantId: string, brandId: string) {
  return prisma.taaviaBrand.findFirst({
    where: { id: brandId, tenantId, isActive: true },
  });
}

export async function getTaaviaManualWorkspace(
  userId: string,
  tenantId: string,
  brandId: string,
): Promise<TaaviaWorkspaceSnapshot | null> {
  if (!(await assertTenantAccess(userId, tenantId))) return null;

  const brand = await findBrandForTenant(tenantId, brandId);
  if (!brand) return null;

  const conversation = await prisma.taaviaConversation.findUnique({
    where: { brandId_type: { brandId, type: 'manual_workspace' } },
    include: {
      messages: {
        where: { role: 'assistant' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const metadata = conversation?.messages[0]?.metadata as { workspace?: TaaviaWorkspaceSnapshot } | null | undefined;
  return metadata?.workspace ?? null;
}

export async function saveTaaviaManualWorkspace(
  userId: string,
  tenantId: string,
  brandId: string,
  workspace: TaaviaWorkspaceSnapshot,
): Promise<TaaviaWorkspaceSnapshot | null> {
  if (!(await assertTenantAccess(userId, tenantId))) return null;

  const brand = await findBrandForTenant(tenantId, brandId);
  if (!brand) return null;

  let conversation = await prisma.taaviaConversation.findUnique({
    where: { brandId_type: { brandId, type: 'manual_workspace' } },
    include: {
      messages: {
        where: { role: 'assistant' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.taaviaConversation.create({
      data: {
        tenantId,
        brandId,
        type: 'manual_workspace',
        createdByUserId: userId,
        messages: {
          create: {
            role: 'assistant',
            content: 'manual workspace snapshot',
            status: 'completed',
            metadata: { workspace },
          },
        },
      },
      include: {
        messages: {
          where: { role: 'assistant' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    return workspace;
  }

  const assistantMessage = conversation.messages[0];
  if (!assistantMessage) {
    await prisma.taaviaMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: 'manual workspace snapshot',
        status: 'completed',
        metadata: { workspace },
      },
    });
    return workspace;
  }

  await prisma.taaviaMessage.update({
    where: { id: assistantMessage.id },
    data: {
      metadata: { workspace },
      content: 'manual workspace snapshot',
    },
  });

  await prisma.taaviaConversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return workspace;
}
