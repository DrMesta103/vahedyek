import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, ArrowLeft, BarChart3, CalendarRange, ChevronLeft, CircleSlash2, FileSearch, LockKeyhole, Search, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { formatPersianDate } from '../../../../lib/format-date';
import { getEmployeeReports, type EmployeeReportFilters } from '../../../../lib/employee-reports';
import { EmployeeReportsActions } from './_components/EmployeeReportsActions';

const first = (value: string | string[] | undefined) => typeof value === 'string' ? value : '';
const number = (value: number) => value.toLocaleString('fa-IR');

export default async function EmployeeReportsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const raw = await searchParams;
  const filters: EmployeeReportFilters = { report: first(raw.report), q: first(raw.q), status: first(raw.status), from: first(raw.from), to: first(raw.to), source: first(raw.source) };
  const report = await getEmployeeReports(id, filters);
  if (!report) notFound();
  const visible = report.sections.filter(section => !filters.report || filters.report === 'all' || section.type === filters.report);
  const permitted = report.sections.filter(section => section.permission);
  const totalRows = permitted.reduce((sum, section) => sum + section.rows.length, 0);
  const timeline = permitted.flatMap(section => section.rows.map(row => ({ ...row, reportTitle: section.title }))).filter(row => row.date).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 8);
  const sources = [...new Set(report.sections.map(section => section.source))];
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => Boolean(value)) as [string, string][]).toString();

  return <main className="employee-reports-page" dir="rtl" lang="fa">
    <nav className="employee-reports-breadcrumb"><Link href={`/employees/${id}`}>پرونده {report.employee.name}</Link><ChevronLeft aria-hidden /><span>گزارش‌ها و تحلیل‌ها</span></nav>
    <header className="employee-reports-hero">
      <div className="employee-reports-hero-copy"><span className="employee-reports-eyebrow"><BarChart3 aria-hidden />مرکز تحلیل چرخه همکاری</span><h1>گزارش‌ها و تحلیل‌ها</h1><p>مشاهده گزارش‌ها، روندها و تحلیل‌های مرتبط با چرخه همکاری {report.employee.name}؛ تمام داده‌ها به‌صورت زنده از ماژول مرجع خوانده می‌شوند.</p><div className="employee-reports-person"><UserRoundCheck aria-hidden /><span>{report.employee.name}</span><small>{report.employee.personnelCode ? `کد پرسنلی ${report.employee.personnelCode}` : 'بدون کد پرسنلی'} · {report.employee.isActive ? 'همکار فعال' : 'همکاری خاتمه‌یافته'}</small></div></div>
      <EmployeeReportsActions employeeId={id} query={query} />
    </header>

    <section className="employee-reports-summary" aria-label="خلاصه گزارش"><article><span>گزارش‌های در دسترس</span><strong>{number(permitted.length)}</strong><small>از {number(report.sections.length)} دسته</small></article><article><span>رکورد در فیلتر جاری</span><strong>{number(totalRows)}</strong><small>بدون ذخیره‌سازی موازی</small></article><article><span>آخرین به‌روزرسانی</span><strong>{formatPersianDate(report.generatedAt)}</strong><small>داده زنده ماژول‌ها</small></article></section>
    <aside className="employee-reports-warning"><ShieldCheck aria-hidden /><div><strong>نمای خواندنی و کنترل‌شده</strong><p>هیچ عملیات اصلی کسب‌وکار از این صفحه انجام نمی‌شود. داده‌های حساس و خروجی‌ها تابع مجوز ماژول مرجع هستند.</p></div></aside>

    <section className="employee-reports-timeline" aria-labelledby="employee-timeline-title"><header><div><span className="employee-reports-eyebrow"><CalendarRange aria-hidden />خط زمانی یکپارچه</span><h2 id="employee-timeline-title">رویدادهای چرخه همکاری</h2></div><small>جدیدترین رویدادهای مجاز از تمام ماژول‌ها</small></header>{timeline.length ? <ol>{timeline.map(item => <li key={`${item.reportTitle}-${item.id}`}><span className="employee-timeline-dot" aria-hidden/><time>{formatPersianDate(item.date!)}</time><div><strong>{item.title}</strong><p>{item.reportTitle} · {item.description}</p></div><Link href={item.href} aria-label={`مشاهده ${item.title}`}><ArrowLeft aria-hidden /></Link></li>)}</ol> : <div className="employee-report-state"><CircleSlash2 aria-hidden /><strong>برای خط زمانی داده‌ای وجود ندارد.</strong></div>}</section>

    <form className="employee-reports-filters" method="get">
      <label className="employee-reports-search"><span>جستجو در گزارش‌ها</span><div><Search aria-hidden /><input name="q" defaultValue={filters.q} placeholder="عنوان، وضعیت یا ماژول مرجع…" /></div></label>
      <label><span>از تاریخ</span><input type="date" name="from" defaultValue={filters.from} /></label><label><span>تا تاریخ</span><input type="date" name="to" defaultValue={filters.to} /></label>
      <label><span>وضعیت</span><select name="status" defaultValue={filters.status || 'all'}><option value="all">همه وضعیت‌ها</option><option value="active">فعال</option><option value="approved">تأیید شده</option><option value="pending">در انتظار</option><option value="مغایرت">مغایرت</option></select></label>
      <label><span>نوع گزارش</span><select name="report" defaultValue={filters.report || 'all'}><option value="all">همه گزارش‌ها</option>{report.sections.map(section => <option key={section.type} value={section.type}>{section.title}</option>)}</select></label>
      <label><span>ماژول مرجع</span><select name="source" defaultValue={filters.source || 'all'}><option value="all">همه ماژول‌ها</option>{sources.map(source => <option key={source}>{source}</option>)}</select></label>
      <div className="employee-reports-filter-actions"><button type="submit">اعمال فیلتر</button><Link href={`/employees/${id}/reports`}>پاک کردن</Link></div>
    </form>

    <nav className="employee-reports-categories" aria-label="دسته‌بندی گزارش‌ها"><Link className={!filters.report || filters.report === 'all' ? 'is-active' : ''} href={`/employees/${id}/reports`}>همه</Link>{report.sections.map(section => <Link key={section.type} className={filters.report === section.type ? 'is-active' : ''} href={`/employees/${id}/reports?report=${section.type}`}><span>{section.title}</span><small>{section.permission ? number(section.rows.length) : <LockKeyhole aria-label="محدود" />}</small></Link>)}</nav>

    <section className="employee-reports-sections">
      {visible.map(section => <article className="employee-report-card" key={section.type} id={section.type}>
        <header><div><span className="employee-report-source"><FileSearch aria-hidden />{section.source}</span><h2>{section.title}</h2><p>{section.description}</p></div><div className="employee-report-meta"><span>آخرین تغییر</span><strong>{section.lastUpdate ? formatPersianDate(section.lastUpdate) : '—'}</strong></div></header>
        {!section.permission ? <div className="employee-report-state is-locked"><LockKeyhole aria-hidden /><strong>شما اجازه مشاهده این گزارش را ندارید.</strong><p>مجوز این بخش از ماژول مرجع کنترل می‌شود.</p></div>
          : section.error ? <div className="employee-report-state is-error"><AlertTriangle aria-hidden /><strong>اطلاعات گزارش از ماژول مرجع دریافت نشد.</strong><p>سایر بخش‌ها همچنان قابل استفاده هستند.</p></div>
          : section.rows.length === 0 ? <div className="employee-report-state"><CircleSlash2 aria-hidden /><strong>برای این گزارش داده‌ای وجود ندارد.</strong><p>فیلترهای جاری یا ماژول مرجع رکوردی برنگرداند.</p></div>
          : <div className="employee-report-table-wrap"><table><thead><tr><th>عنوان</th><th>شرح</th><th>وضعیت</th><th>تاریخ</th><th>جزئیات</th><th><span className="sr-only">مرجع</span></th></tr></thead><tbody>{section.rows.slice(0, 100).map(row => <tr key={row.id}><td><strong>{row.title}</strong></td><td>{row.description}</td><td><span className="employee-report-status">{row.status}</span></td><td>{row.date ? formatPersianDate(row.date) : '—'}</td><td>{row.details?.map(detail => <span className="employee-report-detail" key={detail.label}>{detail.label}: {detail.value}</span>) ?? '—'}</td><td><Link href={row.href} aria-label={`مشاهده در ${row.source}`}><ArrowLeft aria-hidden /></Link></td></tr>)}</tbody></table></div>}
        <footer><span><CalendarRange aria-hidden />منبع داده: {section.source}</span><Link href={section.href}>مشاهده در ماژول مرجع<ArrowLeft aria-hidden /></Link></footer>
      </article>)}
    </section>
  </main>;
}
