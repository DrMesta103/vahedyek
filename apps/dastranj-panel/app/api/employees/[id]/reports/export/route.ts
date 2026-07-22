import { NextRequest } from 'next/server';
import { createEmployeeAuditLog } from '../../../../../lib/employee-audit';
import { getEmployeeReports, type EmployeeReportFilters } from '../../../../../lib/employee-reports';

const xmlEscape = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get('format');
  if (format !== 'excel' && format !== 'pdf') return new Response('Invalid export format.', { status: 400 });
  const filters: EmployeeReportFilters = Object.fromEntries(['report','q','status','from','to','source'].map(key => [key, request.nextUrl.searchParams.get(key) ?? '']));
  try {
    const report = await getEmployeeReports(id, filters);
    if (!report?.canExport) return new Response('Forbidden', { status: 403 });
    const selected = report.sections.filter(section => !filters.report || filters.report === 'all' || section.type === filters.report);
    if (filters.report && filters.report !== 'all' && selected.length === 0) return new Response('Forbidden', { status: 403 });
    if (filters.report && filters.report !== 'all' && selected.some(section => !section.permission)) return new Response('Forbidden', { status: 403 });
    const rows = selected.flatMap(section => section.permission ? section.rows.map(row => ({ Report: section.title, Title: row.title, Description: row.description, Status: row.status, Date: row.date ?? '', Source: row.source, Details: row.details?.map(item => `${item.label}: ${item.value}`).join(' | ') ?? '' })) : []);
    try {
      await createEmployeeAuditLog({ tenantId: report.tenantId, employeeId: id, action: 'EMPLOYEE_REPORT_EXPORT', source: 'employee_reports', reason: `${format}:${filters.report || 'all'}` });
    } catch (auditError) {
      console.error('[employee-reports] export audit failed', { employeeId: id, format, report: filters.report || 'all', auditError });
    }
    if (format === 'pdf') return Response.json({ employeeName: report.employee.name, generatedAt: report.generatedAt, rows });
    const headers = Object.keys(rows[0] ?? { Result: '' });
    const table = [headers, ...rows.map(row => headers.map(header => row[header as keyof typeof row]))].map(cells => `<Row>${cells.map(cell => `<Cell><Data ss:Type="String">${xmlEscape(cell)}</Data></Cell>`).join('')}</Row>`).join('');
    const workbook = `<?xml version="1.0" encoding="UTF-8"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Reports"><Table>${table}</Table></Worksheet></Workbook>`;
    return new Response(`\uFEFF${workbook}`, { headers: { 'content-type': 'application/vnd.ms-excel; charset=utf-8', 'content-disposition': `attachment; filename="employee-report-${id}.xls"` } });
  } catch (exportError) {
    console.error('[employee-reports] export failed', { employeeId: id, format, exportError });
    return new Response('فایل خروجی تولید نشد.', { status: 400 });
  }
}
