import { NextResponse } from 'next/server';
import { getActorName, recordAuditLog } from '@/lib/audit-log';
import { requireSessionContext } from '@/lib/auth';
import { handlePrismaApiError } from '@/lib/prismaApiError';

const MAX_TEXT_LENGTH = 500;

type ActivityPayload = {
  type?: unknown;
  path?: unknown;
  search?: unknown;
  title?: unknown;
  referrer?: unknown;
};

function cleanText(value: unknown, fallback = '') {
  if (typeof value !== 'string') return fallback;
  return value.slice(0, MAX_TEXT_LENGTH);
}

function cleanPath(value: unknown) {
  const path = cleanText(value, '/');
  return path.startsWith('/') ? path : '/';
}

function cleanSearch(value: unknown) {
  const search = cleanText(value);
  return search && search.startsWith('?') ? search : '';
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const payload = (await request.json().catch(() => ({}))) as ActivityPayload;
    const path = cleanPath(payload.path);
    const search = cleanSearch(payload.search);
    const actorName = getActorName(session);

    if (payload.type === 'page.view') {
      const title = cleanText(payload.title, path);
      await recordAuditLog({
        tenantId: session.tenantId,
        actorUserId: session.userId,
        actorName,
        action: 'page.view',
        entityType: 'page',
        entityId: path,
        entityLabel: title || path,
        summary: `${actorName} وارد صفحه ${title || path} شد.`,
        details: {
          path,
          search,
          title,
          referrer: cleanText(payload.referrer),
        },
        metadata: { source: 'client_activity_tracker' },
        request,
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: 'نوع فعالیت نامعتبر است.' }, { status: 400 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
