import { NextResponse } from 'next/server';
import { getEmployeeWorkReportPageData } from '../../../../lib/employee-work-report';

function parseMonthParam(value: string | null) {
  if (!value) return null;
  const parsed = Number.parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const year = parseMonthParam(url.searchParams.get('year') ?? url.searchParams.get('jy'));
    const month = parseMonthParam(url.searchParams.get('month') ?? url.searchParams.get('jm'));
    const report = await getEmployeeWorkReportPageData(id, {
      year: year ?? undefined,
      month: month ?? undefined,
    });

    if (!report) {
      return NextResponse.json({ error: 'employee_not_found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'work_report_failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
