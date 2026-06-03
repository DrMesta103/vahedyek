import { NextResponse } from 'next/server';
import { getSessionContext } from '../../../../../lib/auth';
import { getEmployeeLeaveBalanceSummary } from '../../../../../lib/employee-requests';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionContext();
    if (!session?.tenantId) {
      return NextResponse.json({ error: 'tenant_not_selected' }, { status: 400 });
    }
    const { id } = await params;
    const leaveBalance = await getEmployeeLeaveBalanceSummary(id, session.tenantId);
    return NextResponse.json({ leaveBalance });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'leave_balance_failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
