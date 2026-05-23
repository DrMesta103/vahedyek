import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { currentAppConfig } from '../../config/current';
import { requireSessionContext } from '../../lib/auth';
import {
  normalizeDocType,
  normalizeLabels,
  normalizePagePath,
  sanitizeAudioDataUrl,
  sanitizeDocumentHtml,
} from '../../lib/page-docs';
import { DOCS_TABLE, ensurePageDocsTables, logPageDocEvent, mapRowToRecord, READ_STATE_TABLE, upsertDocReadState } from '../../lib/page-docs-store';
import { prisma } from '../../lib/prisma';
import { handlePrismaApiError } from '../../lib/prismaApiError';

type PageDocRow = Parameters<typeof mapRowToRecord>[0];

export async function GET(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const { pagePath, pageKey } = normalizePagePath(searchParams.get('pagePath') || '/');

    await ensurePageDocsTables();

    const rows = await prisma.$queryRawUnsafe<PageDocRow[]>(
      `
        SELECT
          doc."id",
          doc."title",
          doc."docType",
          doc."contentHtml",
          doc."labelsJson",
          doc."audioDataUrl",
          doc."audioMimeType",
          doc."pagePath",
          doc."pageKey",
          doc."createdAt",
          doc."updatedAt",
          state."isRead" AS "isRead",
          author."id" AS "authorId",
          author."fullName" AS "authorFullName",
          author."email" AS "authorEmail",
          updater."id" AS "updatedById",
          updater."fullName" AS "updatedByFullName",
          updater."email" AS "updatedByEmail"
        FROM ${DOCS_TABLE} doc
        LEFT JOIN ${READ_STATE_TABLE} state
          ON state."documentId" = doc."id"
          AND state."tenantId" = doc."tenantId"
          AND state."appId" = doc."appId"
          AND state."userId" = $4
        LEFT JOIN "AppUser" author ON author."id" = doc."createdById"
        LEFT JOIN "AppUser" updater ON updater."id" = doc."updatedById"
        WHERE doc."tenantId" = $1 AND doc."appId" = $2 AND doc."pageKey" = $3
        ORDER BY doc."updatedAt" DESC, doc."createdAt" DESC
      `,
      session.tenantId,
      currentAppConfig.appId,
      pageKey,
      session.user.id,
    );

    return NextResponse.json({
      pagePath,
      pageKey,
      docs: rows.map(mapRowToRecord),
    });
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

    const { pagePath, pageKey } = normalizePagePath(body.pagePath || '/');
    const docType = normalizeDocType(body.docType);
    const contentHtml = sanitizeDocumentHtml(body.contentHtml?.trim() || '');
    const labels = normalizeLabels(body.labels);
    const audioDataUrl = sanitizeAudioDataUrl(body.audioDataUrl);
    const audioMimeType = audioDataUrl ? body.audioMimeType?.trim() || 'audio/webm' : null;
    const docId = crypto.randomUUID();

    await ensurePageDocsTables();

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO ${DOCS_TABLE} (
          "id", "tenantId", "appId", "pagePath", "pageKey", "title", "docType", "contentHtml", "labelsJson", "audioDataUrl", "audioMimeType", "createdById", "updatedById"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `,
      docId,
      session.tenantId,
      currentAppConfig.appId,
      pagePath,
      pageKey,
      title,
      docType,
      contentHtml,
      JSON.stringify(labels),
      audioDataUrl,
      audioMimeType,
      session.user.id,
      session.user.id,
    );

    await logPageDocEvent({
      tenantId: session.tenantId,
      actorUserId: session.user.id,
      pagePath,
      pageKey,
      docId,
      docTitle: title,
      eventType: 'create',
      docType,
      labels,
      details: `ایجاد مستند از نوع ${docType}`,
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
