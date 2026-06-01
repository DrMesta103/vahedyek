import { NextResponse } from 'next/server';
import { requireActiveAuthPayload } from '../../../../lib/auth';
import { createMessage, listThreadMessages, upsertThreadOpenState } from '../../../../lib/page-threads-store';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';

type RouteContext = {
  params: Promise<{
    threadId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const auth = await requireActiveAuthPayload();
    if (auth instanceof NextResponse) return auth;

    const { threadId } = await context.params;
    await upsertThreadOpenState({
      userId: auth.userId,
      threadId,
      isOpened: true,
    });
    const messages = await listThreadMessages({ threadId });
    return NextResponse.json({ messages });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireActiveAuthPayload();
    if (auth instanceof NextResponse) return auth;

    const { threadId } = await context.params;
    const body = (await request.json()) as {
      messageType?: unknown;
      text?: unknown;
      replyToMessageId?: unknown;
      attachment?: {
        dataUrl?: unknown;
        mimeType?: unknown;
        name?: unknown;
        size?: unknown;
      } | null;
    };

    const message = await createMessage({
      threadId,
      actorUserId: auth.userId,
      messageType: body.messageType,
      text: body.text,
      replyToMessageId: body.replyToMessageId,
      attachment: body.attachment ?? null,
    });

    await upsertThreadOpenState({
      userId: auth.userId,
      threadId,
      isOpened: true,
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

