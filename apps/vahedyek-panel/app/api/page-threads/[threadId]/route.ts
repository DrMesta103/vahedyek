import { NextResponse } from 'next/server';
import { requireActiveAuthPayload } from '../../../lib/auth';
import { deleteThread, updateThreadMeta } from '../../../lib/page-threads-store';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

type RouteContext = {
  params: Promise<{
    threadId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireActiveAuthPayload();
    if (auth instanceof NextResponse) return auth;

    const { threadId } = await context.params;
    const body = (await request.json()) as {
      title?: unknown;
      docType?: unknown;
      priority?: unknown;
      status?: unknown;
      labels?: unknown;
    };

    await updateThreadMeta({
      threadId,
      actorUserId: auth.userId,
      title: body.title,
      docType: body.docType,
      priority: body.priority,
      status: body.status,
      labels: body.labels,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const auth = await requireActiveAuthPayload();
    if (auth instanceof NextResponse) return auth;

    const { threadId } = await context.params;
    const deleted = await deleteThread({ threadId });

    if (!deleted) {
      return NextResponse.json({ message: 'گفت‌وگو پیدا نشد.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

