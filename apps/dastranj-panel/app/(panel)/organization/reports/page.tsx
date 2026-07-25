import Link from 'next/link';
import { CircleAlert } from 'lucide-react';
import { getOrganizationReports } from '../../../lib/data';
import { PrintButton } from './PrintButton';
import { ExportButtons } from './ExportButtons';
import { ReportFilters } from './ReportFilters';

type Query = { from?: string; to?: string; unitId?: string; positionId?: string; employeeId?: string; eventType?: string };
const queryString = (query: Query) => new URLSearchParams(Object.entries(query).filter((entry): entry is [string, string] => Boolean(entry[1]))).toString();

export default async function OrganizationReportsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const report = await getOrganizationReports(query);
  if (!report) return <section className="org-section-empty" dir="rtl"><CircleAlert /><h1>دسترسی مشاهده گزارش‌های سازمانی را ندارید</h1></section>;
  const qs = queryString(query);
  return <main className="org-profile-page" dir="rtl" lang="fa">
    <header className="org-profile-header"><div><p>فضای کاری گزارش</p><h1>گزارش‌های سازمانی</h1><p>گزارش جاری، ظرفیت سمت و تغییرات ثبت‌شده در حافظه سازمانی</p></div><div className="org-profile-actions"><Link href="/organization/dashboard">داشبورد سازمان</Link>{report.access.canExportReports && <><ExportButtons query={qs}/><PrintButton /></>}</div></header>
    <ReportFilters><label>از<input type="date" name="from" defaultValue={query.from}/></label><label>تا<input type="date" name="to" defaultValue={query.to}/></label><label>واحد<select name="unitId" defaultValue={query.unitId || ''}><option value="">همه</option>{report.units.map((item)=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>سمت<select name="positionId" defaultValue={query.positionId || ''}><option value="">همه</option>{report.positions.map((item)=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>کارمند<input name="employeeId" defaultValue={query.employeeId || ''} placeholder="شناسه کارمند"/></label><label>رویداد<select name="eventType" defaultValue={query.eventType || ''}><option value="">همه</option>{report.eventTypes.map((item)=><option key={item} value={item}>{item}</option>)}</select></label><button>اعمال فیلتر</button></ReportFilters>
    <section className="org-profile-card"><h2>گزارش جاری سازمان</h2><div className="org-profile-summary">{Object.entries({واحد:report.summary.units,زیرواحد:report.summary.subunits,سمت:report.summary.positions,کارمند:report.summary.employees,ظرفیت:report.summary.capacity,خالی:report.summary.vacancy,تغییر:report.summary.changes}).map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div></section>
    <section className="org-profile-card"><h2>گزارش ظرفیت سمت</h2>{report.positionRows.length ? <div className="org-memory-table">{report.positionRows.map((row)=><div key={row.id}><strong>{row.title}</strong><span>{row.unitTitle}</span><span>ظرفیت {row.capacity}</span><span>فعال {row.activeAssignments}</span><span>خالی {row.vacancy}</span></div>)}</div> : <div className="org-section-empty"><p>سمتی مطابق فیلترها یافت نشد.</p></div>}</section>
    <section className="org-profile-card"><h2>گزارش تغییرات</h2>{report.events.length?<div className="org-memory-table">{report.events.map((event)=><div key={event.id}><strong>{event.entityType}</strong><span>{event.eventType}</span><span>{new Date(event.occurredAt).toLocaleDateString('fa-IR')}</span><span>{event.actorUserId || 'سیستم'}</span><details><summary>قبل/بعد</summary><pre>{JSON.stringify({old:event.previousValue,new:event.newValue},null,2)}</pre></details></div>)}</div>:<div className="org-section-empty"><p>تغییری مطابق فیلتر ثبت نشده است.</p></div>}</section>
  </main>;
}
