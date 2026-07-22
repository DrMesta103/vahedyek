import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getEmployeeCompensationAccess } from '../../../../../lib/employee-compensation-access';
import { createEmployeeAuditLog } from '../../../../../lib/employee-audit';

const csv = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const access = await getEmployeeCompensationAccess(id);
  if (!access.tenantId || !access.canExport) return NextResponse.json({ error: 'دسترسی خروجی مالی ندارید.' }, { status: 403 });
  const employee = await prisma.employee.findFirst({ where: { id, tenantId: access.tenantId }, select: { firstName: true, lastName: true, financialItems: { orderBy: { effectiveDate: 'desc' } }, damages: { orderBy: { incidentDate: 'desc' }, include: { objections: true } } } });
  if (!employee) return NextResponse.json({ error: 'کارمند یافت نشد.' }, { status: 404 });
  const rows: unknown[][] = [['Section','Title','Type','Amount','Effective Date','Status','Description','Objection Count','Open Objections']];
  employee.financialItems.forEach((item) => rows.push(['Financial Item', item.title, item.type, item.amount.toString(), item.effectiveDate.toISOString(), item.status, item.description, '', '']));
  employee.damages.forEach((damage) => rows.push(['Damage', damage.title, 'DAMAGE', damage.amount.toString(), damage.effectiveDate.toISOString(), damage.status, damage.description, damage.objections.length, damage.objections.filter((item) => !['REJECTED','CLOSED'].includes(item.status)).length]));
  employee.damages.flatMap((damage) => damage.objections.map((objection) => rows.push(['Objection', damage.title, 'OBJECTION', '', objection.createdAt.toISOString(), objection.status, objection.description, '', ''])));
  await createEmployeeAuditLog({ tenantId: access.tenantId, employeeId: id, action: 'EXPORT_COMPENSATION', newValue: JSON.stringify({ financialItems: employee.financialItems.length, damages: employee.damages.length }), source: 'employee_compensation' });
  const body = `\uFEFF${rows.map((row) => row.map(csv).join(',')).join('\r\n')}`;
  return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="compensation-${id}.csv"`, 'Cache-Control': 'no-store' } });
}
