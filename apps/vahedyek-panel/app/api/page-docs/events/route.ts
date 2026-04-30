import { NextResponse } from 'next/server';
import { currentAppConfig } from '../../../config/current';
import { requireSessionContext } from '../../../lib/auth';
import { type PageDocEventRecord } from '../../../lib/page-docs';
import { ensurePageDocsTables, EVENTS_TABLE, mapEventRowToRecord, type PageDocEventRow, READ_STATE_TABLE } from '../../../lib/page-docs-store';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    await ensurePageDocsTables();

    const rows = await prisma.$queryRawUnsafe<PageDocEventRow[]>(
      `
        SELECT
          event."id",
          event."eventType",
          event."docId",
          event."docTitle",
          event."docType",
          event."labelsJson",
          event."pagePath",
          event."pageKey",
          event."appId",
          event."details",
          event."createdAt",
          state."isRead" AS "isRead",
          actor."id" AS "actorId",
          actor."fullName" AS "actorFullName",
          actor."email" AS "actorEmail"
        FROM ${EVENTS_TABLE} event
        LEFT JOIN ${READ_STATE_TABLE} state
          ON state."documentId" = event."docId"
          AND state."tenantId" = event."tenantId"
          AND state."appId" = event."appId"
          AND state."userId" = $3
        LEFT JOIN "AppUser" actor ON actor."id" = event."actorUserId"
        WHERE event."tenantId" = $1 AND event."appId" = $2
        ORDER BY event."createdAt" DESC
        LIMIT 500
      `,
      session.tenantId,
      currentAppConfig.appId,
      session.user.id,
    );

    return NextResponse.json({
      appId: currentAppConfig.appId,
      events: rows.map(mapEventRowToRecord) as PageDocEventRecord[],
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
