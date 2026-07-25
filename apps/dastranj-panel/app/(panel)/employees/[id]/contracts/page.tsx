import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, CalendarClock, CheckCircle2, FileClock, FilePlus2, History, ShieldCheck } from 'lucide-react';
import { getEmployee } from '../../../../lib/data';
import { formatPersianDate } from '../../../../lib/format-date';
import { createEmployeeContractVersionAction, transitionEmployeeContractAction } from '../../../../lib/employee-contract-actions';
import { getEmployeeContractLifecycle } from '../../../../lib/employee-contract-lifecycle';

const STATUS_LABELS: Record<string, string> = {
  draft: 'پیش‌نویس', DRAFT: 'پیش‌نویس', SUBMITTED: 'ارسال‌شده', PENDING_APPROVAL: 'در انتظار تأیید', APPROVED: 'تأییدشده', active: 'فعال',
  EXPIRED: 'منقضی', SUSPENDED: 'معلق', TERMINATED: 'خاتمه‌یافته', CANCELLED: 'لغوشده', ended: 'تاریخی', canceled: 'لغوشده',
};
const OPERATION_LABELS: Record<string, string> = { CREATE_CONTRACT: 'ایجاد قرارداد', RENEW_CONTRACT: 'تمدید قرارداد', AMEND_CONTRACT: 'اصلاح قرارداد', TERMINATE_CONTRACT: 'پایان قرارداد' };

function nextActions(status: string, permission: Awaited<ReturnType<typeof getEmployeeContractLifecycle>>['permission']) {
  if (status === 'draft' || status === 'DRAFT') return [{ target: 'SUBMITTED', label: 'ارسال برای بررسی' }];
  if (status === 'SUBMITTED') return permission.canCreate ? [{ target: 'PENDING_APPROVAL', label: 'ارجاع برای تأیید' }] : [];
  if (status === 'PENDING_APPROVAL') return permission.canApprove ? [{ target: 'APPROVED', label: 'تأیید' }, { target: 'DRAFT', label: 'رد و بازگشت' }] : [];
  if (status === 'APPROVED') return permission.canApprove ? [{ target: 'active', label: 'اعمال و فعال‌سازی' }] : [];
  if (status === 'SUSPENDED') return permission.canApprove ? [{ target: 'active', label: 'رفع تعلیق' }] : [];
  if (status === 'active' && permission.canTerminate) return [{ target: 'SUSPENDED', label: 'تعلیق' }, { target: 'TERMINATED', label: 'خاتمه' }];
  return [];
}

export default async function EmployeeContractsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [employee, lifecycle] = await Promise.all([getEmployee(id), getEmployeeContractLifecycle(id)]);
  if (!employee) notFound();
  const active = lifecycle.contracts.find((contract) => contract.status === 'active' && contract.isCurrent) ?? null;
  const latest = lifecycle.contracts[0] ?? null;
  const canStartOperation = lifecycle.permission.canCreate || lifecycle.permission.canRenew || lifecycle.permission.canAmend || lifecycle.permission.canTerminate;

  return <main className="page-stack" dir="rtl" lang="fa">
    <nav className="text-sm text-slate-500"><Link href={`/employees/${id}`}>پروفایل {employee.firstName} {employee.lastName}</Link> / قراردادها</nav>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-slate-900">مدیریت قراردادهای کارمند</h1><p className="mt-2 text-sm text-slate-600">چرخه عمر، تأیید، نسخه‌ها و سوابق غیرقابل حذف قرارداد</p></div>
      <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm text-emerald-800"><ShieldCheck className="h-4 w-4"/>کنترل دسترسی سمت سرور فعال است</span>
    </header>

    <section className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3"><h2 className="font-bold text-slate-900">قرارداد فعال</h2>{active && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">فعال · نسخه {active.version}</span>}</div>
        {active ? <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-xs text-slate-500">نوع قرارداد</dt><dd className="mt-1 font-medium">{String((active.data as { contractType?: string }).contractType ?? 'ثبت نشده')}</dd></div>
          <div><dt className="text-xs text-slate-500">شروع</dt><dd className="mt-1 font-medium">{active.startDate ? formatPersianDate(active.startDate) : '—'}</dd></div>
          <div><dt className="text-xs text-slate-500">پایان</dt><dd className="mt-1 font-medium">{active.endDate ? formatPersianDate(active.endDate) : 'نامحدود'}</dd></div>
          <div><dt className="text-xs text-slate-500">اثرگذاری</dt><dd className="mt-1 font-medium">{active.effectiveDate ? formatPersianDate(active.effectiveDate) : '—'}</dd></div>
        </dl> : <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600"><FileClock className="mx-auto mb-2 h-7 w-7 text-slate-400"/>قرارداد فعالی برای این کارمند وجود ندارد.</div>}
      </article>
      <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700"/><div><h2 className="font-bold text-amber-950">هشدار اثر بین‌ماژولی</h2><p className="mt-2 text-sm leading-7 text-amber-900">تغییر قرارداد می‌تواند بر حقوق، حضور و غیاب، بیمه، مزایا و گزارش‌ها اثر بگذارد. محاسبات این موارد در این فاز اعمال نمی‌شود.</p></div></div></aside>
    </section>

    {canStartOperation && <details className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" open={!latest}>
      <summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-slate-900"><FilePlus2 className="h-5 w-5"/>ثبت عملیات جدید قرارداد</summary>
      <form action={createEmployeeContractVersionAction} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <input type="hidden" name="employeeId" value={id}/><input type="hidden" name="parentContractId" value={latest?.id ?? ''}/>
        <label className="grid gap-1.5 text-sm">نوع عملیات<select name="operationType" required className="min-h-11 rounded-xl border border-slate-300 bg-white px-3">
          {lifecycle.permission.canCreate && <option value="CREATE_CONTRACT">ایجاد قرارداد</option>}{lifecycle.permission.canRenew && active && <option value="RENEW_CONTRACT">تمدید قرارداد</option>}{lifecycle.permission.canAmend && latest && <option value="AMEND_CONTRACT">اصلاح قرارداد</option>}{lifecycle.permission.canTerminate && active && <option value="TERMINATE_CONTRACT">پایان قرارداد</option>}
        </select></label>
        <label className="grid gap-1.5 text-sm">نوع قرارداد<input name="contractType" required placeholder="مثلاً تمام‌وقت" className="min-h-11 rounded-xl border border-slate-300 px-3"/></label>
        <label className="grid gap-1.5 text-sm">شماره قرارداد<input name="contractNumber" className="min-h-11 rounded-xl border border-slate-300 px-3"/></label>
        <label className="grid gap-1.5 text-sm">تاریخ شروع<input type="date" name="startDate" required className="min-h-11 rounded-xl border border-slate-300 px-3"/></label>
        <label className="grid gap-1.5 text-sm">تاریخ پایان<input type="date" name="endDate" className="min-h-11 rounded-xl border border-slate-300 px-3"/></label>
        <label className="grid gap-1.5 text-sm">تاریخ اثرگذاری<input type="date" name="effectiveDate" required className="min-h-11 rounded-xl border border-slate-300 px-3"/></label>
        <label className="grid gap-1.5 text-sm md:col-span-2">دلیل عملیات<textarea name="reason" required minLength={5} className="min-h-24 rounded-xl border border-slate-300 p-3"/></label>
        <label className="grid gap-1.5 text-sm">نشانی پیوست<input type="url" name="attachmentUrl" className="min-h-11 rounded-xl border border-slate-300 px-3"/></label>
        <div className="md:col-span-2 xl:col-span-3"><button className="min-h-11 rounded-xl bg-slate-900 px-5 font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">ایجاد پیش‌نویس نسخه جدید</button></div>
      </form>
    </details>}

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><History className="h-5 w-5"/><h2 className="font-bold">تاریخچه قرارداد</h2></div>
      <div className="mt-5 space-y-4">{lifecycle.contracts.length === 0 ? <p className="text-sm text-slate-500">هنوز سابقه‌ای ثبت نشده است.</p> : lifecycle.contracts.map((contract) => {
        const actions = nextActions(contract.status, lifecycle.permission);
        return <article key={contract.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-slate-400"/><div><h3 className="font-semibold">نسخه {contract.version} · {OPERATION_LABELS[contract.operationType]}</h3><p className="mt-1 text-xs text-slate-500">{contract.contractNumber || 'بدون شماره'} · ایجاد {formatPersianDate(contract.createdAt)}</p></div></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{STATUS_LABELS[contract.status] ?? contract.status}</span></div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600"><span><CalendarClock className="ml-1 inline h-4 w-4"/>اثرگذاری: {contract.effectiveDate ? formatPersianDate(contract.effectiveDate) : '—'}</span><span>دلیل: {contract.reason || '—'}</span><span>رویداد Audit: {contract.auditLogs.length}</span></div>
          {actions.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{actions.map((action) => <form action={transitionEmployeeContractAction} key={action.target} className="flex flex-wrap items-center gap-2"><input type="hidden" name="employeeId" value={id}/><input type="hidden" name="contractId" value={contract.id}/><input type="hidden" name="target" value={action.target}/><input name="reason" required aria-label={`دلیل ${action.label}`} placeholder="دلیل اقدام" className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm"/><button className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50">{action.label}</button></form>)}</div>}
        </article>;
      })}</div>
    </section>
  </main>;
}
