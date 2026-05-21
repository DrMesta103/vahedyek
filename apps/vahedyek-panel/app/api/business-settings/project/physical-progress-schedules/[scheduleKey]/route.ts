import { NextResponse } from 'next/server';
import { getActorName, recordAuditLog } from '../../../../../lib/audit-log';
import { requireSessionContext } from '../../../../../lib/auth';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';
import {
  buildScheduleSummaries,
  buildNormalizedStages,
  getTenantPhysicalProgressScheduleVersions,
  saveTenantPhysicalProgressScheduleVersions,
} from '../../_lib/physicalProgressSchedules';

type UpdatePayload = {
  title?: string;
  stages?: Array<{
    title?: string;
    customTitle?: string;
    weight?: number | string;
    plannedStartDate?: string;
    plannedEndDate?: string;
    description?: string;
    order?: number;
  }>;
};

export async function PUT(request: Request, context: { params: Promise<{ scheduleKey: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { scheduleKey } = await context.params;
    const body = (await request.json()) as UpdatePayload;
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
    if (!title) {
      return NextResponse.json({ message: 'عنوان برنامه الزامی است.' }, { status: 400 });
    }

    const { stages, validationError } = buildNormalizedStages(Array.isArray(body.stages) ? body.stages : []);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const versions = await getTenantPhysicalProgressScheduleVersions(session.tenantId);
    const lineage = versions.filter((item) => item.scheduleKey === scheduleKey);
    if (!lineage.length) {
      return NextResponse.json({ message: 'برنامه زمان‌بندی پیدا نشد.' }, { status: 404 });
    }

    const latest = lineage.reduce((acc, item) => (item.version > acc.version ? item : acc));
    if (latest.archivedAt) {
      return NextResponse.json({ message: 'برنامه آرشیو شده و قابل ویرایش نیست.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const nextVersion = {
      ...latest,
      id: crypto.randomUUID(),
      title,
      version: latest.version + 1,
      stages: stages.map((stage, index) => ({
        ...stage,
        id: crypto.randomUUID(),
        order: index,
      })),
      createdAt: now,
      updatedAt: now,
      createdByUserId: session.userId,
      createdByName: getActorName(session),
      sourceVersionId: latest.id,
    };

    const merged = [...versions, nextVersion];
    await saveTenantPhysicalProgressScheduleVersions(session.tenantId, merged);

    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'project.physical_progress_schedule.version',
      entityType: 'physical_progress_schedule',
      entityId: scheduleKey,
      entityLabel: title,
      summary: `${getActorName(session)} نسخه ${nextVersion.version} برنامه زمان‌بندی "${title}" را ثبت کرد.`,
      details: {
        blockId: latest.blockId,
        previousVersion: latest.version,
        nextVersion: nextVersion.version,
      },
      request,
    });

    return NextResponse.json({ schedules: buildScheduleSummaries(merged) });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ scheduleKey: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { scheduleKey } = await context.params;
    const versions = await getTenantPhysicalProgressScheduleVersions(session.tenantId);
    const lineage = versions.filter((item) => item.scheduleKey === scheduleKey);
    if (!lineage.length) {
      return NextResponse.json({ message: 'برنامه زمان‌بندی پیدا نشد.' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const actorName = getActorName(session);
    const nextVersions = versions.map((item) =>
      item.scheduleKey === scheduleKey
        ? {
            ...item,
            archivedAt: now,
            archivedByUserId: session.userId,
            archivedByName: actorName,
            updatedAt: now,
          }
        : item,
    );

    await saveTenantPhysicalProgressScheduleVersions(session.tenantId, nextVersions);

    const latest = lineage.reduce((acc, item) => (item.version > acc.version ? item : acc));
    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName,
      action: 'project.physical_progress_schedule.archive',
      entityType: 'physical_progress_schedule',
      entityId: scheduleKey,
      entityLabel: latest.title,
      summary: `${actorName} برنامه زمان‌بندی "${latest.title}" را آرشیو کرد.`,
      details: { blockId: latest.blockId, version: latest.version },
      request,
    });

    return NextResponse.json({ schedules: buildScheduleSummaries(nextVersions) });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
