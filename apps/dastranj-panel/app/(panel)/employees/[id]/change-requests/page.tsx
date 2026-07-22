import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionContext } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { requireEmployeeAccess } from '../../../../lib/organization-unit-access';
import { formatPersianDate } from '../../../../lib/format-date';

export default async function EmployeeChangeRequestsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireEmployeeAccess('update');
  const { id } = await params; const session = await getSessionContext(); if (!session?.tenantId) notFound();
  const employee = await prisma.employee.findFirst({ where: { id, tenantId: session.tenantId }, select: { firstName: true, lastName: true } }); if (!employee) notFound();
  const requests = await prisma.employeeChangeRequest.findMany({ where: { employeeId: id, tenantId: session.tenantId }, orderBy: { requestedAt: 'desc' } });
  return <main className="page-stack module-page" dir="rtl" lang="fa"><Link href={`/employees/${id}`} className="employee-detail-back-link">بازگشت به پرونده</Link><section className="employee-detail-section"><div className="employee-detail-section-head"><h2>درخواست‌های تغییر {employee.firstName} {employee.lastName}</h2></div>{requests.length ? <div className="employee-detail-grid employee-detail-grid--single">{requests.map((request) => <Link key={request.id} href={`/employees/${id}/change-requests/${request.id}`} className="employee-detail-tile"><div className="employee-detail-tile-copy"><h3>{request.fieldKey} · {request.status}</h3><p>دلیل: {request.reasonCode} · درخواست: {formatPersianDate(request.requestedAt.toISOString())}</p></div></Link>)}</div> : <p className="employee-detail-empty-note">درخواست تغییری ثبت نشده است.</p>}</section></main>;
}
