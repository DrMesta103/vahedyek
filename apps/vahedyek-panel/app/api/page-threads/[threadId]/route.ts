import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { updateThreadMeta } from '../../../lib/page-threads-store';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

type RouteContext = {
  params: Promise<{
    threadId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { threadId } = await context.params;
    const body = (await request.json()) as {
      title?: unknown;
      docType?: unknown;
      priority?: unknown;
      labels?: unknown;
    };

    await updateThreadMeta({
      threadId,
      actorUserId: session.user.id,
      title: body.title,
      docType: body.docType,
      priority: body.priority,
      labels: body.labels,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

