import { NextResponse } from 'next/server';
import { sendAdminAgentMessage } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type RouteContext = { params: Promise<{ businessId: string; brandId: string }> };

type SendMessagePayload = {
  content?: string;
  conversationId?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;
  const body = (await request.json().catch(() => null)) as SendMessagePayload | null;

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
