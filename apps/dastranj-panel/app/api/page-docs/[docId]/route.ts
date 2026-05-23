import { NextResponse } from 'next/server';
import { currentAppConfig } from '../../../config/current';
import { requireSessionContext } from '../../../lib/auth';
import {
  normalizeDocType,
  normalizeLabels,
  safeJsonParseStringArray,
  sanitizeAudioDataUrl,
  sanitizeDocumentHtml,
} from '../../../lib/page-docs';
import { DOCS_TABLE, ensurePageDocsTables, logPageDocEvent, upsertDocReadState } from '../../../lib/page-docs-store';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

type RouteContext = {
  params: Promise<{
    docId: string;
  }>;
};

type ExistingDocRow = {
  id: string;
  title: string;
  docType: string;
  labelsJson: string | null;
  pagePath: string;
  pageKey: string;
};

async function fetchExistingDoc(docId: string, tenantId: string) {
  const rows = await prisma.$queryRawUnsafe<ExistingDocRow[]>(
    `
      SELECT "id", "title", "docType", "labelsJson", "pagePath", "pageKey"
      FROM ${DOCS_TABLE}
      WHERE "id" = $1 AND "tenantId" = $2 AND "appId" = $3
      LIMIT 1
    `,
    docId,
    tenantId,
    currentAppConfig.appId,
  );

  return rows[0] ?? null;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { docId } = await context.params;
    const body = (await request.json()) as {
      title?: string;
      docType?: string;
      contentHtml?: string;
      labels?: string[];
      audioDataUrl?: string | null;
      audioMimeType?: string | null;
    };

    const title = body.title?.trim() || '';
    if (!title) {
      return NextResponse.json({ message: 'عنوان مستند الزامی است.' }, { status: 400 });
    }

    await ensurePageDocsTables();

    const existing = await fetchExistingDoc(docId, session.tenantId);
    if (!existing) {
      return NextResponse.json({ message: 'مستند موردنظر پیدا نشد.' }, { status: 404 });
    }

    const docType = normalizeDocType(body.docType);
    const labels = normalizeLabels(body.labels);
    const audioDataUrl = sanitizeAudioDataUrl(body.audioDataUrl);
    const audioMimeType = audioDataUrl ? body.audioMimeType?.trim() || 'audio/webm' : null;

    await prisma.$executeRawUnsafe(
      `
        UPDATE ${DOCS_TABLE}
        SET
          "title" = $1,
          "docType" = $2,
          "contentHtml" = $3,
          "labelsJson" = $4,
          "audioDataUrl" = $5,
          "audioMimeType" = $6,
          "updatedById" = $7,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = $8 AND "tenantId" = $9 AND "appId" = $10
      `,
      title,
      docType,
      sanitizeDocumentHtml(body.contentHtml?.trim() || ''),
      JSON.stringify(labels),
      audioDataUrl,
      audioMimeType,
      session.user.id,
      docId,
      session.tenantId,
      currentAppConfig.appId,
    );

    await logPageDocEvent({
      tenantId: session.tenantId,
      actorUserId: session.user.id,
      pagePath: existing.pagePath,
      pageKey: existing.pageKey,
      docId: existing.id,
      docTitle: title,
      eventType: 'update',
      docType,
      labels,
      details: 'ویرایش مستند',
    });

    await upsertDocReadState({
      tenantId: session.tenantId,
      userId: session.user.id,
      documentId: docId,
      isRead: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { docId } = await context.params;
    const body = (await request.json()) as {
      isRead?: boolean;
    };

    await ensurePageDocsTables();

    const existing = await fetchExistingDoc(docId, session.tenantId);
    if (!existing) {
      return NextResponse.json({ message: 'مستند موردنظر پیدا نشد.' }, { status: 404 });
    }

    await upsertDocReadState({
      tenantId: session.tenantId,
      userId: session.user.id,
      documentId: docId,
      isRead: body.isRead !== false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { docId } = await context.params;
    await ensurePageDocsTables();

    const existing = await fetchExistingDoc(docId, session.tenantId);
    if (!existing) {
      return NextResponse.json({ message: 'مستند موردنظر پیدا نشد.' }, { status: 404 });
    }

    const labels = safeJsonParseStringArray(existing.labelsJson);

    await prisma.$executeRawUnsafe(
      `DELETE FROM ${DOCS_TABLE} WHERE "id" = $1 AND "tenantId" = $2 AND "appId" = $3`,
      docId,
      session.tenantId,
      currentAppConfig.appId,
    );

    await logPageDocEvent({
      tenantId: session.tenantId,
      actorUserId: session.user.id,
      pagePath: existing.pagePath,
      pageKey: existing.pageKey,
      docId: existing.id,
      docTitle: existing.title,
      eventType: 'delete',
      docType: normalizeDocType(existing.docType),
      labels,
      details: 'حذف مستند',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
