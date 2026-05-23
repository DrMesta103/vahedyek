import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { handlePrismaApiError } from '../../lib/prismaApiError';
import { createThread, listThreadsForApp, listThreadsForPage } from '../../lib/page-threads-store';
import { ensureDevDocThreads } from '../../lib/seed';

export async function GET(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');
    const pagePath = searchParams.get('pagePath') || '/';
    const payload =
      scope === 'app'
        ? await listThreadsForApp({ tenantId: session.tenantId, userId: session.userId })
        : await listThreadsForPage({ pagePath, tenantId: session.tenantId, userId: session.userId });
    if (process.env.NODE_ENV !== 'production' && payload.threads.length === 0) {
      await ensureDevDocThreads(prisma, session.tenantId);
      const seededPayload =
        scope === 'app'
          ? await listThreadsForApp({ tenantId: session.tenantId, userId: session.userId })
          : await listThreadsForPage({ pagePath, tenantId: session.tenantId, userId: session.userId });
      return NextResponse.json(seededPayload);
    }

    return NextResponse.json(payload);
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as {
      pagePath?: string;
      title?: string;
      docType?: unknown;
      priority?: unknown;
      labels?: unknown;
    };

    const title = body.title?.trim() || '';
    if (!title) {
      return NextResponse.json({ message: 'عنوان گفتگو الزامی است.' }, { status: 400 });
    }

    const created = await createThread({
      tenantId: session.tenantId,
      pagePath: body.pagePath || '/',
      title,
      docType: body.docType,
      priority: body.priority,
      labels: body.labels,
      actorUserId: session.userId,
    });

    return NextResponse.json({ success: true, threadId: created.id, pageKey: created.pageKey, pagePath: created.pagePath });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
