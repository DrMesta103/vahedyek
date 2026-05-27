import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { handlePrismaApiError } from '../../../lib/prismaApiError';
import { deleteThread, updateThreadMeta } from '../../../lib/page-threads-store';

export async function PATCH(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { threadId } = await params;
    const body = (await request.json().catch(() => ({}))) as { status?: unknown };

    await updateThreadMeta({
      tenantId: session.tenantId,
      threadId,
      actorUserId: session.userId,
      status: body.status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ threadId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { threadId } = await params;
    const deleted = await deleteThread({ threadId });

    if (!deleted) {
      return NextResponse.json({ message: 'گفت‌وگو پیدا نشد.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
