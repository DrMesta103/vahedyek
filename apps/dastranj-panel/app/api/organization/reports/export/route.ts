import { NextRequest } from 'next/server';
import { getOrganizationReports } from '../../../../lib/data';

type ReportKind = 'current' | 'capacity' | 'changes';
const xmlEscape = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pdfEscape = (value: string) => value.replace(/[^\x20-\x7E]/g, '?').replace(/([\\()])/g, '\\$1');
function pdf(lines: string[]) { const stream = `BT /F1 10 Tf 40 800 Td ${lines.slice(0, 55).map((line, index) => `${index ? '0 -14 Td ' : ''}(${pdfEscape(line)}) Tj`).join('\n')} ET`; const objects = [`1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`, `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj`, `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj`, `4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`, `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`]; let body = '%PDF-1.4\n'; const offsets = [0]; for (const object of objects) { offsets.push(body.length); body += `${object}\n`; } const xref = body.length; body += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((value) => `${String(value).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`; return new TextEncoder().encode(body); }
function reportRows(report: NonNullable<Awaited<ReturnType<typeof getOrganizationReports>>>, kind: ReportKind) {
  if (kind === 'current') return [{ Units: report.summary.units, Positions: report.summary.positions, Employees: report.summary.employees, Capacity: report.summary.capacity, Vacancy: report.summary.vacancy }];
  if (kind === 'changes') return report.events.map((event) => ({ Entity: event.entityType, EventType: event.eventType, Date: event.occurredAt.toISOString(), Actor: event.actorUserId ?? 'SYSTEM', PreviousValue: JSON.stringify(event.previousValue ?? null), NewValue: JSON.stringify(event.newValue ?? null) }));
  return report.positionRows.map((row) => ({ Unit: row.unitTitle, Position: row.title, Capacity: row.capacity, Assigned: row.activeAssignments, Remaining: row.vacancy, Status: row.status }));
}
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const kind = (params.get('report') ?? 'capacity') as ReportKind;
  const format = params.get('format');
  if (!['current', 'capacity', 'changes'].includes(kind) || !['excel', 'pdf'].includes(format ?? '')) return new Response('Invalid export request.', { status: 400 });
  try {
    const report = await getOrganizationReports({ from: params.get('from') || undefined, to: params.get('to') || undefined, unitId: params.get('unitId') || undefined, positionId: params.get('positionId') || undefined, employeeId: params.get('employeeId') || undefined, eventType: params.get('eventType') || undefined });
    if (!report?.access.canExportReports) return new Response('Forbidden', { status: 403 });
    const rows = reportRows(report, kind);
    if (format === 'pdf') { const lines = [`Dastaranj ${kind} report`, ...rows.map((row) => Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(' | '))]; return new Response(pdf(lines), { headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="organization-${kind}.pdf"` } }); }
    const headers = Object.keys(rows[0] ?? { Result: '' });
    const table = [headers, ...rows.map((row) => headers.map((header) => row[header as keyof typeof row]))].map((cells) => `<Row>${cells.map((cell) => `<Cell><Data ss:Type="String">${xmlEscape(cell)}</Data></Cell>`).join('')}</Row>`).join('');
    const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="${kind}"><Table>${table}</Table></Worksheet></Workbook>`;
    return new Response(workbook, { headers: { 'content-type': 'application/vnd.ms-excel; charset=utf-8', 'content-disposition': `attachment; filename="organization-${kind}.xls"` } });
  } catch { return new Response('Export failed.', { status: 400 }); }
}
