import { generateSimulatedAdminAgentReply } from '../admin-agent-simulator';
import { assertTenantAccess } from '../auth';
import { prisma } from '../prisma';
import { TAAVIA_ALL_USE_CASE_KEYS } from '../taavia-use-cases';
import { INITIAL_ASSISTANT_MESSAGE } from './taavia-brands';
import type { TaaviaBrandSetup, TaaviaChatMessage, TaaviaUseCaseKey } from '../types/domain';

function mapMessage(message: {
  id: string;
  role: string;
  content: string;
  status: string;
  metadata: unknown;
  createdAt: Date;
}): TaaviaChatMessage {
  return {
    id: message.id,
    role: message.role as TaaviaChatMessage['role'],
    content: message.content,
    status: message.status,
    metadata: (message.metadata as Record<string, unknown> | null) ?? null,
    createdAt: message.createdAt.toISOString(),
  };
}

function mapConversation(conversation: {
  id: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    status: string;
    createdAt: Date;
  }>;
}) {
  return {
    id: conversation.id,
    messages: conversation.messages.map(mapMessage),
  };
}

async function findBrandForTenant(tenantId: string, brandId: string) {
  return prisma.taaviaBrand.findFirst({
    where: { id: brandId, tenantId, isActive: true },
  });
}

export async function getAdminAgentConversation(
  userId: string,
  tenantId: string,
  brandId: string,
) {
  if (!(await assertTenantAccess(userId, tenantId))) return null;

  const brand = await findBrandForTenant(tenantId, brandId);
  if (!brand) return null;

  const conversation = await prisma.taaviaConversation.findUnique({
    where: { brandId_type: { brandId, type: 'admin_agent' } },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation) return null;

  return mapConversation(conversation);
}

export async function getOrCreateAdminAgentConversation(
  userId: string,
  tenantId: string,
  brandId: string,
) {
  if (!(await assertTenantAccess(userId, tenantId))) return null;

  const brand = await findBrandForTenant(tenantId, brandId);
  if (!brand) return null;

  let conversation = await prisma.taaviaConversation.findUnique({
    where: { brandId_type: { brandId, type: 'admin_agent' } },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation) {
    conversation = await prisma.taaviaConversation.create({
      data: {
        tenantId,
        brandId,
        type: 'admin_agent',
        createdByUserId: userId,
        messages: {
          create: {
            role: 'assistant',
            content: INITIAL_ASSISTANT_MESSAGE,
            status: 'completed',
            metadata: { setup: { selectedUseCases: TAAVIA_ALL_USE_CASE_KEYS } satisfies TaaviaBrandSetup },
          },
        },
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    return mapConversation(conversation);
  }

  if (conversation.messages.length === 0) {
    await prisma.taaviaMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: INITIAL_ASSISTANT_MESSAGE,
        status: 'completed',
        metadata: { setup: { selectedUseCases: TAAVIA_ALL_USE_CASE_KEYS } satisfies TaaviaBrandSetup },
      },
    });

    conversation = await prisma.taaviaConversation.findUniqueOrThrow({
      where: { id: conversation.id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  return mapConversation(conversation);
}

export async function getAdminAgentSetupState(userId: string, tenantId: string, brandId: string) {
  if (!(await assertTenantAccess(userId, tenantId))) return null;

  const brand = await findBrandForTenant(tenantId, brandId);
  if (!brand) return null;

  const conversation = await prisma.taaviaConversation.findUnique({
    where: { brandId_type: { brandId, type: 'admin_agent' } },
    include: {
      messages: {
        where: { role: 'assistant' },
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
  });

  const setup = (conversation?.messages[0]?.metadata as { setup?: TaaviaBrandSetup } | null | undefined)?.setup;
  return {
    selectedUseCases: setup?.selectedUseCases?.length ? setup.selectedUseCases : TAAVIA_ALL_USE_CASE_KEYS,
    isComplete: true,
  };
}

export async function updateAdminAgentSetupState(
  userId: string,
  tenantId: string,
  brandId: string,
  selectedUseCases: TaaviaUseCaseKey[],
) {
  if (!(await assertTenantAccess(userId, tenantId))) return null;

  const brand = await findBrandForTenant(tenantId, brandId);
  if (!brand) return null;

  const conversation = await prisma.taaviaConversation.findUnique({
    where: { brandId_type: { brandId, type: 'admin_agent' } },
    include: {
      messages: {
        where: { role: 'assistant' },
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
  });

  if (!conversation?.messages[0]) return null;

  const assistantMessage = conversation.messages[0];
  const currentMetadata = (assistantMessage.metadata as { setup?: TaaviaBrandSetup } | null | undefined) ?? {};
  const updatedMetadata = {
    ...currentMetadata,
    setup: {
      selectedUseCases: selectedUseCases.length ? selectedUseCases : TAAVIA_ALL_USE_CASE_KEYS,
    },
  };

  await prisma.taaviaMessage.update({
    where: { id: assistantMessage.id },
    data: {
      metadata: updatedMetadata,
    },
  });

  return {
    selectedUseCases: selectedUseCases.length ? selectedUseCases : TAAVIA_ALL_USE_CASE_KEYS,
    isComplete: true,
  };
}

export async function addAdminAgentUserMessage(
  userId: string,
  tenantId: string,
  brandId: string,
  content: string,
): Promise<TaaviaChatMessage | null> {
  const result = await sendAdminAgentMessage(userId, tenantId, brandId, content);
  return result?.userMessage ?? null;
}

export async function sendAdminAgentMessage(
  userId: string,
  tenantId: string,
  brandId: string,
  content: string,
  conversationId?: string | null,
) {
  if (!(await assertTenantAccess(userId, tenantId))) return null;

  const trimmed = content.trim();
  if (!trimmed) return null;

  const brand = await findBrandForTenant(tenantId, brandId);
  if (!brand) return null;

  const conversation = await prisma.taaviaConversation.findFirst({
    where: {
      brandId,
      tenantId,
      type: 'admin_agent',
      ...(conversationId ? { id: conversationId } : {}),
    },
  });
  if (!conversation) return null;

  const assistantContent = generateSimulatedAdminAgentReply(trimmed);

  const [userMessage, assistantMessage] = await prisma.$transaction(async (tx) => {
    const user = await tx.taaviaMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: trimmed,
        status: 'completed',
      },
    });

    // TODO: Call Python/gRPC AI service here instead of generateSimulatedAdminAgentReply.
    const assistant = await tx.taaviaMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantContent,
        status: 'completed',
      },
    });

    await tx.taaviaConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    await tx.tenant.update({
      where: { id: tenantId },
      data: { lastActivity: new Date() },
    });

    return [user, assistant];
  });

  return {
    conversationId: conversation.id,
    userMessage: mapMessage(userMessage),
    assistantMessage: mapMessage(assistantMessage),
  };
}
