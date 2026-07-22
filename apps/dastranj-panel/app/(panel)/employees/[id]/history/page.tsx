import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '../../../../lib/prisma';
import { getSessionContext } from '../../../../lib/auth';
import { requireEmployeeAccess } from '../../../../lib/organization-unit-access';
import { formatPersianDate } from '../../../../lib/format-date';

export default async function EmployeeHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireEmployeeAccess('historyView');
  const session = await getSessionContext();
  if (!session?.tenantId) notFound();
  const employee = await prisma.employee.findFirst({ where: { id, tenantId: session.tenantId }, select: { id: true, firstName: true, lastName: true } });
  if (!employee) notFound();
  const entries = await prisma.employeeAuditLog.findMany({ where: { employeeId: id, tenantId: session.tenantId }, orderBy: { createdAt: 'desc' }, take: 100 });
  return <main className="page-stack module-page" dir="rtl" lang="fa">
    <Link href={`/employees/${id}`} className="employee-detail-back-link">بازگشت به پرونده</Link>
    <section className="employee-detail-section"><div className="employee-detail-section-head"><h2>تاریخچه تغییرات {employee.firstName} {employee.lastName}</h2></div>
      {entries.length ? <div className="employee-detail-grid employee-detail-grid--single">{entries.map((entry) => <article key={entry.id} className="employee-detail-tile"><div className="employee-detail-tile-copy"><h3>{entry.action}</h3><p>{entry.fieldKey ? `فیلد: ${entry.fieldKey}` : 'رویداد پرونده'} · {formatPersianDate(entry.createdAt.toISOString())}</p><p>{entry.oldValue ?? '—'} ← {entry.newValue ?? '—'}</p></div></article>)}</div> : <p className="employee-detail-empty-note">هنوز رویدادی برای این پرونده ثبت نشده است.</p>}
    </section>
  </main>;
}
