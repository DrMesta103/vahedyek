import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { createMessage, listThreadMessages } from '../../../../lib/page-threads-store';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';

type RouteContext = {
  params: Promise<{
    threadId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { threadId } = await context.params;
    const messages = await listThreadMessages({ threadId });
    return NextResponse.json({ messages });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

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
      actorUserId: session.user.id,
      messageType: body.messageType,
      text: body.text,
      replyToMessageId: body.replyToMessageId,
      attachment: body.attachment ?? null,
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

