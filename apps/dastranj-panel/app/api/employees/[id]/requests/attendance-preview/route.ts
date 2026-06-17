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
    requestType: 'attendance',
    status: body.status ?? 'pending',
    submissionMode: body.submissionMode ?? 'pending',
    rangeType: 'point',
    attendanceActionType: null,
    startDate: body.startDate ?? null,
    startTime: body.startTime ?? null,
    dateTime: body.dateTime ?? null,
    reasonId: body.reasonId ?? null,
    description: body.description ?? null,
    attachments: body.attachments ?? [],
    id: body.id,
  };

  const preview = await previewEmployeeRequest(payload, session.tenantId);
  return NextResponse.json({
    bases: preview.attendance?.bases ?? null,
    currentTimestamps: preview.attendance?.currentTimestamps ?? [],
    proposedTimestamp: preview.attendance?.proposedTimestamp ?? null,
    before: preview.attendance?.before ?? null,
    after: preview.attendance?.after ?? null,
    warnings: preview.warnings,
    blockingErrors: preview.blockingErrors,
  });
}
