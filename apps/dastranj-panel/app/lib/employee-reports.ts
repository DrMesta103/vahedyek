import { getEmployee } from './data';
import { getEmployeeAccess, getOrganizationMemoryAccess } from './organization-unit-access';
import { getEmployeeDocumentAccess, listEmployeeDocuments } from './employee-documents';
import { getEmployeeWorkReportData } from './employee-work-report';
import { getEmployeeContractAccess } from './employee-contract-lifecycle';
import { getWorkGroupAccess } from './work-group-access';
import { prisma } from './prisma';

export type EmployeeReportType = 'attendance' | 'requests' | 'contracts' | 'documents' | 'changes' | 'organization' | 'termination' | 'financial';
export type EmployeeReportFilters = { report?: string; q?: string; status?: string; from?: string; to?: string; source?: string };

export type EmployeeReportRow = {
  id: string; title: string; description: string; status: string; date: string | null; source: string; href: string;
  details?: Array<{ label: string; value: string }>;
};

export type EmployeeReportSection = {
  type: EmployeeReportType; title: string; description: string; source: string; href: string; sensitive?: boolean;
  permission: boolean; rows: EmployeeReportRow[]; error?: boolean; lastUpdate: string | null;
};

const REPORT_META: Record<EmployeeReportType, Omit<EmployeeReportSection, 'permission' | 'rows' | 'lastUpdate'>> = {
  attendance: { type: 'attendance', title: 'حضور و غیاب', description: 'حضور، غیبت، تأخیر، تعجیل، اضافه‌کاری و مغایرت', source: 'گزارش کارکرد', href: 'work-report' },
  requests: { type: 'requests', title: 'مرخصی و مأموریت', description: 'نوع، مدت، وضعیت و نتیجه تأیید درخواست‌ها', source: 'درخواست‌های کارمند', href: 'requests' },
  contracts: { type: 'contracts', title: 'قراردادها', description: 'قرارداد فعال، نسخه‌ها، تمدید و وضعیت', source: 'قرارداد کارمند', href: 'contracts' },
  documents: { type: 'documents', title: 'اسناد و مدارک', description: 'تعداد، وضعیت تکمیل، سطح دسترسی و نسخه‌ها', source: 'مرکز اسناد', href: 'documents' },
  changes: { type: 'changes', title: 'تغییرات اطلاعات فردی', description: 'مقادیر قبلی و جدید، ثبت‌کننده و تاریخ اثر', source: 'تاریخچه تغییرات', href: 'history', sensitive: true },
  organization: { type: 'organization', title: 'جایگاه سازمانی', description: 'واحد، سمت، گروه کاری و سوابق عضویت', source: 'ساختار سازمان', href: '' },
  termination: { type: 'termination', title: 'خاتمه همکاری', description: 'وضعیت و تاریخ فرایند خروج', source: 'پرونده کارمند', href: '' },
  financial: { type: 'financial', title: 'حقوق، مزایا و تعهدات مالی', description: 'اطلاعات مالی قرارداد و درخواست‌های مالی', source: 'قرارداد و درخواست', href: 'contracts', sensitive: true },
};

function inDateRange(date: string | null, filters: EmployeeReportFilters) {
  if (!date) return !filters.from && !filters.to;
  const day = date.slice(0, 10);
  return (!filters.from || day >= filters.from) && (!filters.to || day <= filters.to);
}

function applyFilters(section: EmployeeReportSection, filters: EmployeeReportFilters) {
  const q = filters.q?.trim().toLocaleLowerCase('fa') ?? '';
  const rows = section.rows.filter((row) => {
    if (filters.status && filters.status !== 'all' && row.status !== filters.status) return false;
    if (filters.source && filters.source !== 'all' && row.source !== filters.source) return false;
    if (!inDateRange(row.date, filters)) return false;
    return !q || `${row.title} ${row.description} ${row.status} ${row.source}`.toLocaleLowerCase('fa').includes(q);
  });
  return { ...section, rows };
}

const text = (value: unknown, fallback = 'ثبت نشده') => value === null || value === undefined || value === '' ? fallback : String(value);
const json = (value: unknown) => (value && typeof value === 'object' ? value as Record<string, unknown> : {});

export async function getEmployeeReports(employeeId: string, filters: EmployeeReportFilters = {}) {
  const access = await getEmployeeAccess();
  if (!access.tenantId || !access.canView) return null;
  const employee = await getEmployee(employeeId);
  if (!employee || employee.tenantId !== access.tenantId) return null;
  const tenantId = access.tenantId;
  const [orgAccess, workGroupAccess, documentAccess, contractAccess] = await Promise.all([
    getOrganizationMemoryAccess(), getWorkGroupAccess(), getEmployeeDocumentAccess(employeeId), getEmployeeContractAccess(employeeId),
  ]);
  const canViewFinancial = access.canSensitiveView;
  const canViewContracts = contractAccess.canView;
  const [requestsResult, financialRequestsResult, contractsResult, documentsResult, auditResult, changesResult, terminationResult, organizationResult] = await Promise.all([
    prisma.employeeRequest.findMany({ where: { tenantId, employeeId, requestType: { in: ['daily_leave','hourly_leave','reward_leave','unpaid_leave','sick_leave','mission','remote_work'] } }, select: { id: true, requestType: true, status: true, startDate: true, endDate: true, dateTime: true, calculatedDurationMinutes: true, approvedAt: true, createdAt: true, reason: { select: { title: true } } }, orderBy: { createdAt: 'desc' } }).then(value => ({ value })).catch(() => ({ value: null })),
    canViewFinancial ? prisma.employeeRequest.findMany({ where: { tenantId, employeeId, requestType: { in: ['loan','salary_advance'] } }, select: { id: true, requestType: true, status: true, amount: true, createdAt: true, loan: { select: { title: true } } }, orderBy: { createdAt: 'desc' } }).then(value => ({ value })).catch(() => ({ value: null })) : Promise.resolve({ value: [] }),
    canViewContracts ? prisma.employeeContract.findMany({ where: { tenantId, employeeId }, orderBy: [{ version: 'desc' }, { createdAt: 'desc' }] }).then(value => ({ value })).catch(() => ({ value: null })) : Promise.resolve({ value: [] }),
    documentAccess?.canView ? listEmployeeDocuments(employeeId).then(result => ({ value: result.documents })).catch(() => ({ value: null })) : Promise.resolve({ value: [] }),
    prisma.employeeAuditLog.findMany({ where: { tenantId, employeeId }, orderBy: { createdAt: 'desc' }, take: 200 }).then(value => ({ value })).catch(() => ({ value: null })),
    prisma.employeeChangeRequest.findMany({ where: { tenantId, employeeId }, orderBy: { requestedAt: 'desc' }, take: 200 }).then(value => ({ value })).catch(() => ({ value: null })),
    prisma.employeeTerminationIntent.findMany({ where: { tenantId, employeeId }, orderBy: { createdAt: 'desc' } }).then(value => ({ value })).catch(() => ({ value: null })),
    Promise.all([
      orgAccess.canViewHistory ? prisma.employeeOrganizationUnit.findMany({ where: { employeeId, organizationUnit: { tenantId } }, include: { organizationUnit: true, position: true } }) : Promise.resolve([]),
      workGroupAccess.canView ? prisma.workGroupMember.findMany({ where: { employeeId, workGroup: { tenantId } }, include: { workGroup: { select: { title: true } } }, orderBy: { effectiveDate: 'desc' } }) : Promise.resolve([]),
    ]).then(([assignments, memberships]) => ({ value: { assignments, memberships } })).catch(() => ({ value: null })),
  ]);

  const baseHref = `/employees/${employeeId}`;
  const section = (type: EmployeeReportType, permission: boolean, rows: EmployeeReportRow[], error = false): EmployeeReportSection => {
    const meta = REPORT_META[type];
    return { ...meta, href: meta.href ? `${baseHref}/${meta.href}` : baseHref, permission, rows, error, lastUpdate: rows[0]?.date ?? null };
  };
  const requests = requestsResult.value;
  const financialRequests = financialRequestsResult.value;
  const contracts = contractsResult.value;
  const documents = documentsResult.value;
  const audits = auditResult.value;
  const changes = changesResult.value;
  const terminations = terminationResult.value;
  const assignments = organizationResult.value?.assignments ?? null;
  const memberships = organizationResult.value?.memberships ?? null;

  const requestRows: EmployeeReportRow[] = (requests ?? []).filter(r => ['daily_leave','hourly_leave','reward_leave','unpaid_leave','sick_leave','mission','remote_work'].includes(r.requestType)).map(r => ({
    id: r.id, title: r.reason?.title ?? text(r.requestType), description: `${text(r.startDate ?? r.dateTime)} تا ${text(r.endDate ?? r.startDate ?? r.dateTime)}`, status: r.status, date: r.startDate ?? r.dateTime ?? r.createdAt.toISOString(), source: 'درخواست‌های کارمند', href: `${baseHref}/requests`, details: [{ label: 'مدت', value: r.calculatedDurationMinutes ? `${r.calculatedDurationMinutes} دقیقه` : 'محاسبه نشده' }, { label: 'تأیید', value: r.approvedAt ? 'تأیید شده' : 'ثبت نشده' }],
  }));
  const contractRows: EmployeeReportRow[] = (contracts ?? []).map(c => ({ id: c.id, title: `نسخه ${c.version} · ${text(c.contractNumber, 'بدون شماره')}`, description: `${text(c.startDate)} تا ${text(c.endDate, 'نامحدود')}`, status: c.status, date: c.effectiveDate ?? c.createdAt.toISOString(), source: 'قرارداد کارمند', href: `${baseHref}/contracts`, details: [{ label: 'عملیات', value: c.operationType }, { label: 'تمدید', value: c.operationType === 'RENEW_CONTRACT' ? 'بله' : 'خیر' }] }));
  const documentRows: EmployeeReportRow[] = (documents ?? []).map(d => ({ id: d.id, title: d.title, description: `${d.category} · نسخه ${d.versionNumber}`, status: d.status, date: d.documentDate || d.createdAt.toISOString(), source: 'مرکز اسناد', href: `${baseHref}/documents/${d.id}`, details: [{ label: 'سطح دسترسی', value: d.accessLevel }, { label: 'ماژول', value: d.sourceModule }] }));
  const changeRows: EmployeeReportRow[] = [
    ...(audits ?? []).map(a => ({ id: `audit-${a.id}`, title: a.action, description: `${a.oldValue ?? '—'} ← ${a.newValue ?? '—'}`, status: 'ثبت‌شده', date: a.createdAt.toISOString(), source: 'تاریخچه تغییرات', href: `${baseHref}/history`, details: [{ label: 'فیلد', value: text(a.fieldKey, 'رویداد پرونده') }, { label: 'ثبت‌کننده', value: text(a.actorRole, 'سیستم') }] })),
    ...(changes ?? []).map(c => ({ id: `change-${c.id}`, title: c.fieldKey, description: `${JSON.stringify(c.oldValue ?? '—')} ← ${JSON.stringify(c.newValue)}`, status: c.status, date: c.effectiveDate ?? c.requestedAt.toISOString(), source: 'تاریخچه تغییرات', href: `${baseHref}/change-requests/${c.id}`, details: [{ label: 'ثبت‌کننده', value: text(c.requestedBy, 'سیستم') }, { label: 'تأییدکننده', value: text(c.reviewedBy) }] })),
  ].sort((a, b) => text(b.date, '').localeCompare(text(a.date, '')));
  const organizationRows: EmployeeReportRow[] = (assignments ?? []).map(a => ({ id: a.id, title: a.organizationUnit.title, description: a.position?.title ?? 'بدون سمت', status: a.status, date: a.startDate, source: 'ساختار سازمان', href: baseHref, details: [{ label: 'سمت', value: text(a.position?.title) }, { label: 'پایان', value: text(a.endDate, 'ادامه دارد') }] }));
  (memberships ?? []).forEach(m => organizationRows.push({ id: `wg-${m.id}`, title: m.workGroup.title, description: m.reason ?? (m.isCurrent ? 'عضویت جاری در گروه کاری' : 'سابقه عضویت در گروه کاری'), status: m.status, date: m.effectiveDate.toISOString(), source: 'ساختار سازمان', href: '/work-groups', details: [{ label: 'پایان', value: m.leftAt?.toISOString().slice(0, 10) ?? 'ادامه دارد' }] }));
  const terminationRows: EmployeeReportRow[] = (terminations ?? []).map(t => ({ id: t.id, title: 'فرایند خاتمه همکاری', description: text(t.reason), status: t.status, date: t.createdAt.toISOString(), source: 'پرونده کارمند', href: baseHref }));
  if (!employee.isActive && !terminationRows.length) terminationRows.push({ id: 'employee-inactive', title: 'همکاری غیرفعال', description: 'رکورد خاتمه مستقلی ثبت نشده است.', status: 'INACTIVE', date: employee.updatedAt.toISOString(), source: 'پرونده کارمند', href: baseHref });
  const financialRows: EmployeeReportRow[] = (contracts ?? []).map(c => { const data = json(c.data); return { id: `financial-${c.id}`, title: `اطلاعات مالی قرارداد نسخه ${c.version}`, description: `حقوق پایه: ${text(data.dailyBaseSalary ?? data.baseSalary)}`, status: c.status, date: c.effectiveDate ?? c.createdAt.toISOString(), source: 'قرارداد و درخواست', href: `${baseHref}/contracts`, details: [{ label: 'مزایا', value: text(data.benefits) }, { label: 'کسورات', value: text(data.deductions) }] }; });
  (financialRequests ?? []).forEach(r => financialRows.push({ id: `financial-request-${r.id}`, title: r.loan?.title ?? (r.requestType === 'loan' ? 'وام' : 'مساعده'), description: r.amount ? `${r.amount.toString()} ریال` : 'مبلغ ثبت نشده', status: r.status, date: r.createdAt.toISOString(), source: 'قرارداد و درخواست', href: `${baseHref}/requests` }));

  let attendanceRows: EmployeeReportRow[] = [];
  let attendanceError = false;
  try {
    const work = await getEmployeeWorkReportData(employeeId);
    if (work) attendanceRows = work.days.filter(d => d.workedMinutes || d.absenceMinutes || d.delayMinutes || d.earlyLeaveMinutes || d.overtimeMinutes || d.isIncompleteAttendance).map(d => ({ id: d.date, title: d.jalaliDate, description: `کارکرد ${d.workedMinutes} · غیبت ${d.absenceMinutes} · تأخیر ${d.delayMinutes} دقیقه`, status: d.isIncompleteAttendance ? 'مغایرت' : d.status, date: d.date, source: 'گزارش کارکرد', href: `${baseHref}/work-report`, details: [{ label: 'اضافه‌کاری', value: `${d.overtimeMinutes} دقیقه` }, { label: 'تعجیل', value: `${d.earlyLeaveMinutes} دقیقه` }] }));
  } catch { attendanceError = true; }

  const sections = [
    ...(canViewFinancial ? [section('financial', true, financialRows, (canViewContracts && contracts === null) || financialRequests === null)] : []),
    section('attendance', true, attendanceRows, attendanceError), section('requests', true, requestRows, requests === null),
    ...(canViewContracts ? [section('contracts', true, contractRows, contracts === null)] : []), section('documents', Boolean(documentAccess?.canView), documentRows, documents === null),
    section('changes', access.canHistoryView, changeRows, audits === null || changes === null),
    section('termination', true, terminationRows, terminations === null), ...((orgAccess.canViewHistory || workGroupAccess.canView) ? [section('organization', true, organizationRows, organizationResult.value === null)] : []),
  ].map(item => applyFilters(item, filters));
  return { tenantId, employee: { id: employee.id, name: `${employee.firstName} ${employee.lastName}`.trim(), personnelCode: employee.personnelCode, isActive: employee.isActive }, sections, canExport: true, generatedAt: new Date().toISOString() };
}
