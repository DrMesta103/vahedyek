import { NextResponse } from 'next/server';
import { getActorName, recordAuditLog } from '../../../../lib/audit-log';
import { requireSessionContext } from '../../../../lib/auth';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import {
  buildCreatedScheduleVersions,
  buildScheduleSummaries,
  getBlockNameMap,
  getTenantPhysicalProgressScheduleVersions,
  PHYSICAL_PROGRESS_STAGE_LIBRARY,
  saveTenantPhysicalProgressScheduleVersions,
  validateScheduleInput,
  type PhysicalProgressScheduleInput,
} from '../_lib/physicalProgressSchedules';

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const versions = await getTenantPhysicalProgressScheduleVersions(session.tenantId);
    return NextResponse.json({
      schedules: buildScheduleSummaries(versions),
      stageLibrary: PHYSICAL_PROGRESS_STAGE_LIBRARY,
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as PhysicalProgressScheduleInput;
    const validated = validateScheduleInput(body);
    if ('error' in validated) {
      return NextResponse.json({ message: validated.error }, { status: 400 });
    }

    const [versions, blockNameMap] = await Promise.all([
      getTenantPhysicalProgressScheduleVersions(session.tenantId),
      getBlockNameMap(session.tenantId),
    ]);

    const nextVersions = buildCreatedScheduleVersions({
      blockIds: validated.blockIds,
      blockNameMap,
      title: validated.title,
      stages: validated.stages,
      actorUserId: session.userId,
      actorName: getActorName(session),
    });

    const merged = [...versions, ...nextVersions];
    await saveTenantPhysicalProgressScheduleVersions(session.tenantId, merged);

    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'project.physical_progress_schedule.create',
      entityType: 'physical_progress_schedule',
      entityLabel: validated.title,
      summary: `${getActorName(session)} برنامه زمان‌بندی پیشرفت فیزیکی "${validated.title}" را برای ${validated.blockIds.length} بلوک ثبت کرد.`,
      details: {
        blockIds: validated.blockIds,
        stageCount: validated.stages.length,
      },
      request,
    });

    return NextResponse.json(
      {
        schedules: buildScheduleSummaries(merged),
        stageLibrary: PHYSICAL_PROGRESS_STAGE_LIBRARY,
      },
      { status: 201 },
    );
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
