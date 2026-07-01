import { generateSimulatedAdminAgentReply } from '../admin-agent-simulator';
import { assertTenantAccess } from '../auth';
import { prisma } from '../prisma';
import { INITIAL_ASSISTANT_MESSAGE } from './taavia-brands';
import type { TaaviaChatMessage } from '../types/domain';

function mapMessage(message: {
  id: string;
  role: string;
  content: string;
  status: string;
  createdAt: Date;
}): TaaviaChatMessage {
  return {
    id: message.id,
    role: message.role as TaaviaChatMessage['role'],
    content: message.content,
    status: message.status,
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
