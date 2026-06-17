import { NextResponse } from 'next/server';
import { getSessionContext } from '../../../../../lib/auth';
import { previewEmployeeRequest, type EmployeeRequestFormPayload } from '../../../../../lib/employee-requests';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSessionContext();
  if (!session?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: employeeId } = await context.params;
  const body = (await request.json()) as Partial<EmployeeRequestFormPayload>;

  const payload: EmployeeRequestFormPayload = {
    employeeId,
    requestType: 'remote_work',
    status: body.status ?? 'pending',
    submissionMode: body.submissionMode ?? 'pending',
    rangeType: body.rangeType ?? 'full_day',
    startDate: body.startDate ?? null,
    endDate: body.endDate ?? null,
    startTime: body.startTime ?? null,
    endTime: body.endTime ?? null,
    reasonId: body.reasonId ?? null,
    description: body.description ?? null,
    attachments: body.attachments ?? [],
    id: body.id,
  };

  const preview = await previewEmployeeRequest(payload, session.tenantId);
  return NextResponse.json({
    bases: preview.remoteWork?.bases ?? null,
    mode: preview.remoteWork?.mode ?? null,
    requestedDurationMinutes: preview.remoteWork?.requestedDurationMinutes ?? preview.requestedDurationMinutes,
    effect: preview.remoteWork?.effect ?? null,
    before: null,
    after: preview.remoteWork,
    warnings: [...preview.warnings, ...(preview.remoteWork?.warnings ?? [])],
    blockingErrors: [...preview.blockingErrors, ...(preview.remoteWork?.blockingErrors ?? [])],
  });
}
