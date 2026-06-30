import { NextResponse } from 'next/server';
import { getOrCreateAdminAgentConversation, sendAdminAgentMessage } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type RouteContext = { params: Promise<{ businessId: string; brandId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;

  try {
    const conversation = await getOrCreateAdminAgentConversation(session.userId, businessId, brandId);
    if (!conversation) {
      return NextResponse.json({ message: 'برند یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ conversation, source: 'database' });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;
  const body = (await request.json().catch(() => null)) as { content?: string; conversationId?: string } | null;

  try {
    const result = await sendAdminAgentMessage(
      session.userId,
      businessId,
      brandId,
      body?.content ?? '',
      body?.conversationId ?? null,
    );

    if (!result) {
      return NextResponse.json({ message: 'پیام ارسال نشد.' }, { status: 400 });
    }

    return NextResponse.json(
      {
        conversationId: result.conversationId,
        message: result.userMessage,
        userMessage: result.userMessage,
        assistantMessage: result.assistantMessage,
        messages: [result.userMessage, result.assistantMessage],
        source: 'database',
      },
      { status: 201 },
    );
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
