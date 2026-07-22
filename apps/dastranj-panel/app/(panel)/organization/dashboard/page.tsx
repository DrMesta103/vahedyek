import Link from 'next/link';
import { CircleAlert } from 'lucide-react';
import { getOrganizationReports } from '../../../lib/data';
import { ReportFilters } from '../reports/ReportFilters';

function depthOf(id: string, parents: Map<string, string | null>) {
  let depth = 0;
  let cursor = parents.get(id);
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor)) { seen.add(cursor); depth += 1; cursor = parents.get(cursor) ?? null; }
  return depth;
}

export default async function OrganizationDashboardPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const query = await searchParams;
  const report = await getOrganizationReports(query);
  if (!report) return <section className="org-section-empty" dir="rtl"><CircleAlert /><h1>دسترسی داشبورد سازمانی را ندارید</h1></section>;
  const parents = new Map<string, string | null>(report.units.map((item) => [String(item.id), item.parentId ? String(item.parentId) : null]));
  const depth = Math.max(0, ...report.units.map((item) => depthOf(String(item.id), parents)));
  const eventTrend = new Map<string, number>();
  report.events.forEach((event) => { const key = event.occurredAt.toISOString().slice(0, 7); eventTrend.set(key, (eventTrend.get(key) ?? 0) + 1); });
  const kpis = { واحد: report.summary.units, زیرواحد: report.summary.subunits, 'عمق سازمان': depth, سمت: report.summary.positions, 'ظرفیت کل': report.summary.capacity, 'ظرفیت خالی': report.summary.vacancy, 'کارکنان فعال': report.summary.employees, 'کارکنان بدون سمت': report.summary.employeesWithoutPosition, 'تغییرات بازه': report.summary.changes };
  const eventTrendRows = [...eventTrend];
  return <main className="org-profile-page" dir="rtl"><header className="org-profile-header"><div><p>Dashboard خواندنی</p><h1>داشبورد سازمانی</h1><p>همه شاخص‌ها از داده واقعی کسب‌وکار جاری محاسبه شده‌اند.</p></div><Link href="/organization/reports">گزارش‌های تفصیلی</Link></header><ReportFilters><label>از<input type="date" name="from" defaultValue={query.from} /></label><label>تا<input type="date" name="to" defaultValue={query.to} /></label><button>به‌روزرسانی</button></ReportFilters><section className="org-profile-summary">{Object.entries(kpis).map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section><section className="org-profile-grid"><article className="org-profile-card"><h2>روند رشد سازمان</h2>{eventTrendRows.length ? eventTrendRows.map(([month, count]) => <p key={month}>{month}<progress max={Math.max(1, report.summary.changes)} value={count} />{count}</p>) : <div className="org-section-empty"><p>رویدادی در بازه انتخابی ثبت نشده است.</p></div>}</article><article className="org-profile-card"><h2>نمودار ظرفیت سمت</h2>{report.positionRows.length ? report.positionRows.map((row) => <p key={row.id}>{row.title}<progress max={Math.max(1, row.capacity)} value={row.activeAssignments} />{row.activeAssignments}/{row.capacity}</p>) : <div className="org-section-empty"><p>سمتی برای نمایش وجود ندارد.</p></div>}</article><article className="org-profile-card"><h2>Timeline تغییرات</h2>{report.events.length ? report.events.slice(0, 12).map((event) => <p key={event.id}>{new Date(event.occurredAt).toLocaleDateString('fa-IR')} — {event.eventType}</p>) : <div className="org-section-empty"><p>تغییری برای نمایش وجود ندارد.</p></div>}</article></section></main>;
}
