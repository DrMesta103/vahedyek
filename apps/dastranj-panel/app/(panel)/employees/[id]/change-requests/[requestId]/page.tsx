import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionContext } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { getEmployeeAccess, requireEmployeeAccess } from '../../../../../lib/organization-unit-access';
import { maskEmployeeAuditValue } from '../../../../../lib/employee-audit';
import { formatPersianDate } from '../../../../../lib/format-date';
import { EmployeeChangeRequestActions } from '../_components/EmployeeChangeRequestActions';

export default async function EmployeeChangeRequestDetailPage({ params }: { params: Promise<{ id: string; requestId: string }> }) {
  await requireEmployeeAccess('view');
  const employeeAccess = await getEmployeeAccess();
  const { id, requestId } = await params; const session = await getSessionContext(); if (!session?.tenantId) notFound();
  const request = await prisma.employeeChangeRequest.findFirst({ where: { id: requestId, employeeId: id, tenantId: session.tenantId } }); if (!request) notFound();
  const oldValue = maskEmployeeAuditValue(JSON.stringify(request.oldValue), request.fieldKey) ?? 'ثبت نشده';
  const newValue = maskEmployeeAuditValue(JSON.stringify(request.newValue), request.fieldKey) ?? 'ثبت نشده';
  return <main className="page-stack module-page" dir="rtl" lang="fa"><Link href={`/employees/${id}/change-requests`} className="employee-detail-back-link">بازگشت به درخواست‌ها</Link><section className="employee-detail-section"><div className="employee-detail-section-head"><h2>جزئیات درخواست تغییر</h2><p>{request.fieldKey} · {request.status}</p></div><div className="employee-detail-grid"><article className="employee-detail-tile"><div className="employee-detail-tile-copy"><h3>مقدار قبلی</h3><p>{oldValue}</p></div></article><article className="employee-detail-tile"><div className="employee-detail-tile-copy"><h3>مقدار جدید</h3><p>{newValue}</p></div></article><article className="employee-detail-tile"><div className="employee-detail-tile-copy"><h3>دلیل و زمان</h3><p>{request.reasonCode} · {formatPersianDate(request.requestedAt.toISOString())}</p><p>{request.reasonText ?? 'بدون توضیح'}</p></div></article></div><EmployeeChangeRequestActions requestId={request.id} status={request.status} canManage={employeeAccess.canChangeRequestManage} /></section></main>;
}
