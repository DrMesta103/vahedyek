import { NextResponse } from 'next/server';
import { getActorName, recordAuditLog } from '../../../../../../lib/audit-log';
import { requireSessionContext } from '../../../../../../lib/auth';
import { handlePrismaApiError } from '../../../../../../lib/prismaApiError';
import {
  buildCreatedScheduleVersions,
  buildScheduleSummaries,
  getBlockNameMap,
  getTenantPhysicalProgressScheduleVersions,
  saveTenantPhysicalProgressScheduleVersions,
} from '../../../_lib/physicalProgressSchedules';

type DuplicatePayload = {
  title?: string;
  blockIds?: string[];
};

export async function POST(request: Request, context: { params: Promise<{ scheduleKey: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { scheduleKey } = await context.params;
    const body = (await request.json()) as DuplicatePayload;
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
    const blockIds = Array.isArray(body.blockIds)
      ? Array.from(new Set(body.blockIds.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)))
      : [];

    if (!title) {
      return NextResponse.json({ message: 'عنوان برنامه جدید الزامی است.' }, { status: 400 });
    }
    if (!blockIds.length) {
      return NextResponse.json({ message: 'حداقل یک بلوک مقصد انتخاب شود.' }, { status: 400 });
    }

    const [versions, blockNameMap] = await Promise.all([
      getTenantPhysicalProgressScheduleVersions(session.tenantId),
      getBlockNameMap(session.tenantId),
    ]);

    const lineage = versions.filter((item) => item.scheduleKey === scheduleKey);
    if (!lineage.length) {
      return NextResponse.json({ message: 'برنامه مبدا پیدا نشد.' }, { status: 404 });
    }

    const source = lineage.reduce((acc, item) => (item.version > acc.version ? item : acc));
    if (source.archivedAt) {
      return NextResponse.json({ message: 'برنامه آرشیو شده و قابل دپلیکیت نیست.' }, { status: 400 });
    }

    const clones = buildCreatedScheduleVersions({
      blockIds,
      blockNameMap,
      title,
      stages: source.stages,
      actorUserId: session.userId,
      actorName: getActorName(session),
      sourceVersionId: source.id,
    });

    const merged = [...versions, ...clones];
    await saveTenantPhysicalProgressScheduleVersions(session.tenantId, merged);

    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'project.physical_progress_schedule.duplicate',
      entityType: 'physical_progress_schedule',
      entityId: scheduleKey,
      entityLabel: title,
      summary: `${getActorName(session)} برنامه زمان‌بندی "${source.title}" را برای ${blockIds.length} بلوک دپلیکیت کرد.`,
      details: {
        sourceScheduleKey: scheduleKey,
        sourceVersion: source.version,
        destinationBlockIds: blockIds,
      },
      request,
    });

    return NextResponse.json({ schedules: buildScheduleSummaries(merged) }, { status: 201 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
