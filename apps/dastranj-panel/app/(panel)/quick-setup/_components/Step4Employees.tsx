'use client';

import {
  AlertTriangle,
  ClipboardList,
  Download,
  Eye,
  FileSpreadsheet,
  Link2,
  Loader2,
  Pencil,
  RefreshCcw,
  Search,
  Send,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { CardMenu } from '../../../components/CardMenu';
import {
  createEmployeeFromQuickSetupAction,
  deleteEmployeeFromQuickSetupAction,
  createEmployeeImportJobAction,
  createQuickCompletionInvitesAction,
  searchQuickSetupEmployeeSuggestionsAction,
} from '../../../lib/actions';
import type {
  QuickEmployeeAddMethod,
  QuickEmployeeImportJobSummary,
  QuickEmployeeStatus,
  QuickEmployeeSummary,
} from './quick-setup.types';

type EmployeeFilter = 'all' | 'registered' | 'invited' | 'error';
type ContactMethod = 'mobile' | 'email';
type JobMode = 'excel_import' | 'excel_import_invite' | 'quick_invite';
type JobStatus = 'queued' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';
type JobRowStatus =
  | 'queued'
  | 'processing'
  | 'created'
  | 'invited'
  | 'existing_employee'
  | 'duplicate_in_file'
  | 'invalid'
  | 'failed'
  | 'mock_invited'
  | 'mock_invite_failed';

type Step4EmployeesProps = {
  employees: QuickEmployeeSummary[];
  importJobs: QuickEmployeeImportJobSummary[];
  onChange: (employees: QuickEmployeeSummary[]) => void;
  onBack: () => void;
  onNext: () => void;
  onExit: () => void;
};

type ParsedExcelRow = {
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
};

type QuickInviteItem = {
  raw: string;
  value: string;
  contactMethod: ContactMethod;
  valid: boolean;
};

type QuickInviteEntryStatus = 'ready' | 'existing_employee';

type QuickInviteEntry = {
  id: string;
  contactMethod: ContactMethod;
  contactValue: string;
  normalizedValue: string;
  status: QuickInviteEntryStatus;
  note: string;
};

type JobRow = {
  id: string;
  rowNumber: number;
  firstName: string;
  lastName: string;
  contactValue: string;
  contactMethod: ContactMethod | 'unknown';
  status: JobRowStatus;
  message: string;
  employeeId?: string;
  completionLink?: string;
  invitationStatus?: 'sent' | 'failed' | null;
};

type EmployeeJob = {
  id: string;
  mode: JobMode;
  title: string;
  fileName?: string;
  createdAt: string;
  status: JobStatus;
  note?: string;
  rows: JobRow[];
};

type FutureAction = {
  title: string;
  description: string;
};

type ActionCardProps = {
  title: string;
  shortLabel: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
};

type JobStats = {
  total: number;
  created: number;
  invited: number;
  existing: number;
  duplicate: number;
  invalid: number;
  failed: number;
  emailCount: number;
  smsCount: number;
  estimatedSmsCredits: number;
};

type SingleEmployeeSuggestion = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
  status: string;
  source: 'employee' | 'tenant_user';
};

const SMS_CREDIT_BALANCE = 0;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeHeader(value: string) {
  return normalizeText(value)
    .replace(/[‌-‍]/g, '')
    .replace(/[\s\-_]+/g, '');
}

function normalizeContactValue(value: string, contactMethod: ContactMethod) {
  if (contactMethod === 'mobile') {
    return value
      .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
      .replace(/\D/g, '');
  }
  return normalizeText(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidMobile(value: string) {
  const digits = normalizeContactValue(value, 'mobile');
  return digits.length >= 10;
}

function contactMethodFromValue(value: string): ContactMethod | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes('@')) return isValidEmail(trimmed) ? 'email' : null;
  return isValidMobile(trimmed) ? 'mobile' : null;
}

function employeeStatusLabel(status: QuickEmployeeStatus) {
  switch (status) {
    case 'invite_sent':
      return 'دعوت ارسال شده';
    case 'pending_completion':
      return 'در انتظار تکمیل';
    case 'completed':
      return 'اطلاعات تکمیل شده';
    case 'active':
      return 'فعال';
    case 'failed_send':
      return 'ارسال ناموفق';
    case 'error':
      return 'دارای خطا';
    default:
      return 'ثبت‌شده';
  }
}

function employeeStatusClass(status: QuickEmployeeStatus) {
  switch (status) {
    case 'invite_sent':
      return 'border-amber-400/25 bg-amber-500/10 text-amber-100';
    case 'pending_completion':
      return 'border-violet-400/25 bg-violet-500/10 text-violet-100';
    case 'completed':
      return 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100';
    case 'active':
      return 'border-cyan-400/25 bg-cyan-500/10 text-cyan-100';
    case 'failed_send':
      return 'border-rose-400/25 bg-rose-500/10 text-rose-100';
    case 'error':
      return 'border-red-400/25 bg-red-500/10 text-red-100';
    default:
      return 'border-sky-400/25 bg-sky-500/10 text-sky-100';
  }
}

function addMethodLabel(method: QuickEmployeeAddMethod) {
  switch (method) {
    case 'excel':
      return 'افزودن لیستی با اکسل';
    case 'invitation_link':
      return 'ارسال لینک تکمیل اطلاعات';
    case 'email_invite':
      return 'دعوت ایمیلی';
    case 'sms_invite':
      return 'دعوت پیامکی';
    default:
      return 'افزودن تکی';
  }
}

function quickInviteEntryStatusLabel(status: QuickInviteEntryStatus) {
  return status === 'existing_employee' ? 'قبلاً ثبت شده' : 'آماده ارسال';
}

function quickInviteEntryStatusClass(status: QuickInviteEntryStatus) {
  return status === 'existing_employee'
    ? 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100'
    : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100';
}

function rowStatusLabel(status: JobRowStatus) {
  switch (status) {
    case 'processing':
      return 'در حال پردازش';
    case 'created':
      return 'ثبت شد';
    case 'invited':
      return 'دعوت ارسال شد';
    case 'existing_employee':
      return 'قبلاً ثبت شده';
    case 'duplicate_in_file':
      return 'تکراری در فایل';
    case 'invalid':
      return 'دارای خطا';
    case 'failed':
      return 'ارسال ناموفق';
    case 'mock_invited':
      return 'دعوت آزمایشی';
    case 'mock_invite_failed':
      return 'دعوت آزمایشی ناموفق';
    default:
      return 'در انتظار';
  }
}

function rowStatusClass(status: JobRowStatus) {
  switch (status) {
    case 'processing':
      return 'border-indigo-400/20 bg-indigo-500/10 text-indigo-100';
    case 'created':
      return 'border-sky-400/20 bg-sky-500/10 text-sky-100';
    case 'invited':
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100';
    case 'existing_employee':
      return 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100';
    case 'duplicate_in_file':
      return 'border-amber-400/20 bg-amber-500/10 text-amber-100';
    case 'invalid':
      return 'border-red-400/20 bg-red-500/10 text-red-100';
    case 'failed':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-100';
    case 'mock_invited':
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100';
    case 'mock_invite_failed':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-100';
    default:
      return 'border-white/10 bg-slate-500/10 text-slate-100';
  }
}

function jobStatusLabel(status: JobStatus) {
  switch (status) {
    case 'processing':
      return 'در حال پردازش';
    case 'completed':
      return 'تکمیل شده';
    case 'completed_with_errors':
      return 'تکمیل با خطا';
    case 'failed':
      return 'ناموفق';
    default:
      return 'در صف';
  }
}

function jobStatusClass(status: JobStatus) {
  switch (status) {
    case 'processing':
      return 'border-indigo-400/20 bg-indigo-500/10 text-indigo-100';
    case 'completed':
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100';
    case 'completed_with_errors':
      return 'border-amber-400/20 bg-amber-500/10 text-amber-100';
    case 'failed':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-100';
    default:
      return 'border-slate-400/20 bg-slate-500/10 text-slate-100';
  }
}

function formatLastAction(value: string | null) {
  if (!value) return 'ثبت نشده';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'ثبت نشده';
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'ثبت نشده';
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function contactDisplay(email: string | null, mobile: string | null) {
  return email || mobile || 'ثبت نشده';
}

function createToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getEmployeeContactKey(employee: QuickEmployeeSummary) {
  return employee.email
    ? `email:${normalizeContactValue(employee.email, 'email')}`
    : employee.mobile
      ? `mobile:${normalizeContactValue(employee.mobile, 'mobile')}`
      : `employee:${employee.id}`;
}

function employeeMatchesContact(employee: QuickEmployeeSummary, contactValue: string, contactMethod: ContactMethod) {
  const normalized = normalizeContactValue(contactValue, contactMethod);
  if (!normalized) return false;
  if (contactMethod === 'email' && employee.email) return normalizeContactValue(employee.email, 'email') === normalized;
  if (contactMethod === 'mobile' && employee.mobile) return normalizeContactValue(employee.mobile, 'mobile') === normalized;
  return false;
}

function buildEmployeeSummaryFromResult(result: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}) {
  return {
    id: result.id,
    firstName: result.firstName,
    lastName: result.lastName,
    email: result.email || null,
    mobile: result.mobile || null,
    status: 'registered' as QuickEmployeeStatus,
    addMethod: 'single' as QuickEmployeeAddMethod,
    invitationStatus: null,
    lastActionAt: new Date().toISOString(),
  };
}

function createSampleWorkbookDownload() {
  const worksheet = XLSX.utils.json_to_sheet([
    {
      نام: 'علی',
      'نام خانوادگی': 'رضایی',
      ایمیل: 'ali@example.com',
      'شماره موبایل': '09120000000',
    },
    {
      نام: 'سارا',
      'نام خانوادگی': 'احمدی',
      ایمیل: 'sara@example.com',
      'شماره موبایل': '09120000001',
    },
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'کارکنان');
  const array = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'نمونه-کارکنان.xlsx');
}

function normalizeExcelRow(row: Record<string, unknown>, rowNumber: number): ParsedExcelRow {
  const entries = Object.entries(row).map(([key, value]) => [normalizeHeader(key), String(value ?? '').trim()] as const);
  const findByAliases = (aliases: string[]) => {
    const normalizedAliases = aliases.map((item) => normalizeHeader(item));
    return entries.find(([key]) => normalizedAliases.includes(key))?.[1] ?? '';
  };

  return {
    rowNumber,
    firstName: findByAliases(['نام', 'firstName', 'first name', 'firstname']),
    lastName: findByAliases(['نام خانوادگی', 'lastName', 'last name', 'lastname', 'family']),
    email: findByAliases(['ایمیل', 'email']),
    mobile: findByAliases(['شماره موبایل', 'موبایل', 'mobile', 'phone', 'cell']),
  };
}

function parseQuickInviteInput(rawValue: string) {
  const tokens = rawValue
    .split(/[\n,;]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
  const unique = new Set<string>();
  const parsed: QuickInviteItem[] = [];

  for (const raw of tokens) {
    const contactMethod = contactMethodFromValue(raw);
    const value = contactMethod === 'mobile' ? normalizeContactValue(raw, 'mobile') : normalizeContactValue(raw, 'email');
    const key = `${contactMethod ?? 'invalid'}:${value}`;
    if (unique.has(key)) continue;
    unique.add(key);
    parsed.push({
      raw,
      value,
      contactMethod: contactMethod ?? 'mobile',
      valid: Boolean(contactMethod),
    });
  }

  return parsed;
}

function countInviteChannels(items: QuickInviteItem[]) {
  return items.reduce(
    (acc, item) => {
      if (!item.valid) {
        acc.invalid += 1;
        return acc;
      }
      if (item.contactMethod === 'email') acc.email += 1;
      if (item.contactMethod === 'mobile') acc.sms += 1;
      return acc;
    },
    { email: 0, sms: 0, invalid: 0 },
  );
}

const employeePanelClass =
  'grid gap-2.5 rounded-2xl border border-white/10 bg-slate-950/45 p-3.5 sm:p-4';

function EmployeeActionToolbar({ actions }: { actions: ActionCardProps[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {actions.map((action) => (
        <button
          key={action.title}
          type="button"
          onClick={action.onClick}
          title={action.description}
          className="flex min-h-[42px] w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-right text-slate-200 transition-colors hover:border-indigo-400/35 hover:bg-indigo-500/10 hover:text-white"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-200">
            {action.icon}
          </span>
          <span className="text-xs font-extrabold">{action.shortLabel}</span>
        </button>
      ))}
    </div>
  );
}

function MetricStrip({ items }: { items: Array<{ label: string; value: number }> }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-slate-950/30 px-2.5 py-2 text-right"
        >
          <span className="text-[11px] font-bold text-slate-400">{item.label}</span>
          <strong className="text-base font-black text-white">{item.value.toLocaleString('fa-IR')}</strong>
        </div>
      ))}
    </div>
  );
}

function QuickSetupEmployeeRow({
  employee,
  onView,
  onEdit,
  onResend,
  onDelete,
}: {
  employee: QuickEmployeeSummary;
  onView: () => void;
  onEdit: () => void;
  onResend: () => void;
  onDelete: () => void;
}) {
  const canResend =
    employee.status === 'invite_sent' ||
    employee.status === 'pending_completion' ||
    employee.status === 'failed_send';

  return (
    <article className="flex items-start justify-between gap-2.5 rounded-2xl border border-white/[0.06] bg-slate-900/55 p-3 text-right transition-colors hover:border-indigo-400/30">
      <div className="min-w-0 flex-1 grid gap-1">
        <h3 className="text-sm font-black text-white">{resolveEmployeeName(employee)}</h3>
        <p className="text-[11px] font-semibold text-slate-400">{contactDisplay(employee.email, employee.mobile)}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-bold text-slate-400">
          <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-extrabold', employeeStatusClass(employee.status))}>
            {employeeStatusLabel(employee.status)}
          </span>
          <span>{addMethodLabel(employee.addMethod)}</span>
          <span>{formatLastAction(employee.lastActionAt)}</span>
        </div>
      </div>
      <div className="shrink-0">
        <CardMenu
          items={[
            {
              kind: 'action',
              label: 'مشاهده',
              icon: <Eye className="h-4 w-4" strokeWidth={2.2} />,
              onClick: onView,
            },
            {
              kind: 'action',
              label: 'ویرایش',
              icon: <Pencil className="h-4 w-4" strokeWidth={2.2} />,
              onClick: onEdit,
            },
            ...(canResend
              ? [
                  {
                    kind: 'action' as const,
                    label: 'ارسال مجدد',
                    icon: <RefreshCcw className="h-4 w-4" strokeWidth={2.2} />,
                    onClick: onResend,
                  },
                ]
              : []),
            {
              kind: 'action',
              label: 'حذف از لیست',
              tone: 'danger',
              icon: <Trash2 className="h-4 w-4" strokeWidth={2.2} />,
              onClick: onDelete,
            },
          ]}
        />
      </div>
    </article>
  );
}

function OverlayShell({
  title,
  description,
  children,
  onClose,
  widthClass = 'max-w-md',
}: {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
  widthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className={cn('w-full rounded-2xl border border-white/10 bg-[#0b1228] p-5 text-right text-slate-100 shadow-2xl', widthClass)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <button type="button" onClick={onClose} className="text-2xl leading-none text-slate-400">
            ×
          </button>
          <div className="space-y-2">
            <div className="text-xl font-black text-white">{title}</div>
            <p className="text-sm leading-7 text-slate-300">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function JobBadge({ status }: { status: JobStatus }) {
  return <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', jobStatusClass(status))}>{jobStatusLabel(status)}</span>;
}

function RowBadge({ status }: { status: JobRowStatus }) {
  return <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-bold', rowStatusClass(status))}>{rowStatusLabel(status)}</span>;
}

function sanitizeEmployeeName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function summarizeJob(job: EmployeeJob): JobStats {
  return job.rows.reduce<JobStats>(
    (acc, row) => {
      acc.total += 1;
      if (row.status === 'created') acc.created += 1;
      if (row.status === 'invited') acc.invited += 1;
      if (row.status === 'existing_employee') acc.existing += 1;
      if (row.status === 'duplicate_in_file') acc.duplicate += 1;
      if (row.status === 'invalid') acc.invalid += 1;
      if (row.status === 'failed') acc.failed += 1;
      if (row.contactMethod === 'email') acc.emailCount += 1;
      if (row.contactMethod === 'mobile') acc.smsCount += 1;
      acc.estimatedSmsCredits = acc.smsCount;
      return acc;
    },
    { total: 0, created: 0, invited: 0, existing: 0, duplicate: 0, invalid: 0, failed: 0, emailCount: 0, smsCount: 0, estimatedSmsCredits: 0 },
  );
}

function isFilterMatch(employee: QuickEmployeeSummary, filter: EmployeeFilter) {
  if (filter === 'all') return true;
  if (filter === 'error') return employee.status === 'error' || employee.status === 'failed_send';
  if (filter === 'registered') return employee.addMethod === 'single' || employee.addMethod === 'excel';
  return employee.addMethod === 'invitation_link' || employee.addMethod === 'email_invite' || employee.addMethod === 'sms_invite';
}

function resolveEmployeeName(employee: QuickEmployeeSummary) {
  const name = `${employee.firstName} ${employee.lastName}`.trim();
  return name || 'ثبت نشده';
}

function EmployeeJobDetailsModal({
  job,
  onClose,
}: {
  job: EmployeeJob | null;
  onClose: () => void;
}) {
  if (!job) return null;
  const stats = summarizeJob(job);

  return (
    <OverlayShell
      title={job.title}
      description={`${formatDateTime(job.createdAt)}${job.fileName ? ` · ${job.fileName}` : ''}`}
      onClose={onClose}
      widthClass="max-w-5xl"
    >
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <div className="text-xs text-slate-400">کل ردیف‌ها</div>
          <div className="mt-2 text-2xl font-black text-white">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <div className="text-xs text-slate-400">ثبت‌شده</div>
          <div className="mt-2 text-2xl font-black text-white">{stats.created}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <div className="text-xs text-slate-400">دعوت‌شده</div>
          <div className="mt-2 text-2xl font-black text-white">{stats.invited}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <div className="text-xs text-slate-400">دارای خطا</div>
          <div className="mt-2 text-2xl font-black text-white">{stats.invalid + stats.failed + stats.duplicate}</div>
        </div>
      </div>

      {job.note ? <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">{job.note}</div> : null}

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/25">
        <div className="max-h-[60vh] overflow-auto">
          <table className="min-w-full text-right">
            <thead className="sticky top-0 border-b border-white/10 bg-slate-950/95 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">ردیف</th>
                <th className="px-4 py-3 font-medium">نام و نام خانوادگی</th>
                <th className="px-4 py-3 font-medium">ایمیل / موبایل</th>
                <th className="px-4 py-3 font-medium">وضعیت</th>
                <th className="px-4 py-3 font-medium">توضیح</th>
                <th className="px-4 py-3 font-medium">لینک</th>
              </tr>
            </thead>
            <tbody>
              {job.rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 last:border-b-0">
                  <td className="px-4 py-4 align-top text-sm text-slate-300">{row.rowNumber}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="font-bold text-white">{`${sanitizeEmployeeName(row.firstName)} ${sanitizeEmployeeName(row.lastName)}`.trim() || 'ثبت نشده'}</div>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-slate-300">{row.contactValue || 'ثبت نشده'}</td>
                  <td className="px-4 py-4 align-top">
                    <RowBadge status={row.status} />
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-slate-300">{row.message}</td>
                  <td className="px-4 py-4 align-top">
                    {row.completionLink ? (
                      <div className="space-y-2">
                        <div className="max-w-[18rem] break-all text-xs text-indigo-200">{row.completionLink}</div>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(row.completionLink!);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-400/20 px-3 py-2 text-xs font-bold text-indigo-100 transition-colors hover:bg-indigo-500/10"
                        >
                          کپی لینک
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
        >
          بستن
        </button>
      </div>
    </OverlayShell>
  );
}

function SingleEmployeeDialog({
  open,
  existingEmployees,
  onClose,
  onCreated,
}: {
  open: boolean;
  existingEmployees: QuickEmployeeSummary[];
  onClose: () => void;
  onCreated: (employee: QuickEmployeeSummary) => void;
}) {
  const [contactMethod, setContactMethod] = useState<ContactMethod>('mobile');
  const [contactValue, setContactValue] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [inviteLinkEnabled, setInviteLinkEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState<SingleEmployeeSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SingleEmployeeSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [error, setError] = useState('');
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  const contactError = useMemo(() => {
    if (!contactValue.trim()) return '';
    if (contactMethod === 'email' && !isValidEmail(contactValue)) return 'ایمیل واردشده معتبر نیست.';
    if (contactMethod === 'mobile' && !isValidMobile(contactValue)) return 'شماره موبایل واردشده معتبر نیست.';
    return '';
  }, [contactMethod, contactValue]);
  const contactIsValid = contactError === '';
  const inviteBySmsDisabled = contactMethod === 'mobile' && SMS_CREDIT_BALANCE <= 0;
  const invitationCTAEnabled = inviteLinkEnabled && contactIsValid && !inviteBySmsDisabled;

  useEffect(() => {
    if (!open) return;
    setContactMethod('mobile');
    setContactValue('');
    setFirstName('');
    setLastName('');
    setInviteLinkEnabled(false);
    setSuggestions([]);
    setSelectedSuggestion(null);
    setLoading(false);
    setSearching(false);
    setSearchError('');
    setError('');
    setCloseConfirmOpen(false);
  }, [open]);

  useEffect(() => {
    if (contactMethod === 'mobile' && inviteLinkEnabled && inviteBySmsDisabled) {
      setInviteLinkEnabled(false);
    }
  }, [contactMethod, inviteBySmsDisabled, inviteLinkEnabled]);

  useEffect(() => {
    if (!open) return;
    const query = normalizeContactValue(contactValue, contactMethod);
    if (query.length < 3) {
      setSuggestions([]);
      setSelectedSuggestion(null);
      setFirstName('');
      setLastName('');
      setSearchError('');
      setSearching(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const result = await searchQuickSetupEmployeeSuggestionsAction({ query, contactMethod });
        const nextSuggestions = result.items as SingleEmployeeSuggestion[];
        setSuggestions(nextSuggestions);
        const exactMatch = nextSuggestions.find((item) => {
          const candidate = normalizeContactValue(item.email || item.mobile || '', contactMethod);
          return candidate === query;
        });
        if (exactMatch) {
          setSelectedSuggestion(exactMatch);
          setFirstName(exactMatch.firstName);
          setLastName(exactMatch.lastName);
        } else {
          setSelectedSuggestion(null);
          setFirstName('');
          setLastName('');
        }
      } catch {
        setSuggestions([]);
        setSearchError('جستجو انجام نشد. دوباره تلاش کنید.');
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [contactMethod, contactValue, open]);

  if (!open) return null;

  const duplicateContact = (candidate: SingleEmployeeSuggestion) =>
    existingEmployees.some(
      (employee) =>
        employee.id === candidate.id ||
        (employee.email && candidate.email && normalizeContactValue(employee.email, 'email') === normalizeContactValue(candidate.email, 'email')) ||
        (employee.mobile && candidate.mobile && normalizeContactValue(employee.mobile, 'mobile') === normalizeContactValue(candidate.mobile, 'mobile')),
    );

  const selectSuggestion = (candidate: SingleEmployeeSuggestion) => {
    if (duplicateContact(candidate)) {
      setError('این کارمند قبلاً به لیست کارکنان اضافه شده است.');
      return;
    }
    setSelectedSuggestion(candidate);
    setContactValue(candidate.email || candidate.mobile || '');
    setFirstName(candidate.firstName);
    setLastName(candidate.lastName);
    setError('');
  };

  const submit = async () => {
    const trimmedFirstName = sanitizeEmployeeName(firstName);
    const trimmedLastName = sanitizeEmployeeName(lastName);
    const normalizedContact = normalizeContactValue(contactValue, contactMethod);

    if (!contactValue.trim()) {
      setError(contactMethod === 'mobile' ? 'شماره موبایل کارمند را وارد کنید.' : 'ایمیل کارمند را وارد کنید.');
      return;
    }
    if (contactError) {
      setError(contactError);
      return;
    }
    if (!trimmedFirstName) {
      setError('نام کارمند را وارد کنید.');
      return;
    }
    if (!trimmedLastName) {
      setError('نام خانوادگی کارمند را وارد کنید.');
      return;
    }
    if (selectedSuggestion && duplicateContact(selectedSuggestion)) {
      setError('این کارمند قبلاً به لیست کارکنان اضافه شده است.');
      return;
    }
    if (existingEmployees.some((employee) => employeeMatchesContact(employee, normalizedContact, contactMethod))) {
      setError('این کارمند قبلاً به لیست کارکنان اضافه شده است.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await createEmployeeFromQuickSetupAction({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: contactMethod === 'email' ? normalizedContact : undefined,
        mobile: contactMethod === 'mobile' ? normalizedContact : undefined,
        avatarUrl: undefined,
      });

      const employee: QuickEmployeeSummary = {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email || null,
        mobile: result.mobile || null,
        status: invitationCTAEnabled ? 'invite_sent' : 'registered',
        addMethod: invitationCTAEnabled ? 'email_invite' : 'single',
        invitationStatus: invitationCTAEnabled ? 'sent' : null,
        lastActionAt: new Date().toISOString(),
      };

      onCreated(employee);
      onClose();
    } catch {
      setError(invitationCTAEnabled ? 'کارمند ثبت شد اما ارسال لینک تکمیل اطلاعات ناموفق بود.' : 'کارمند ذخیره نشد. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const requestClose = () => {
    if (contactValue.trim() || firstName.trim() || lastName.trim() || selectedSuggestion) {
      setCloseConfirmOpen(true);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={requestClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b1228] p-5 text-right text-slate-100 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <button type="button" onClick={requestClose} className="text-2xl leading-none text-slate-400">
            ×
          </button>
          <div className="space-y-2">
            <div className="text-xl font-black text-white">افزودن تکی کارمند</div>
            <p className="text-sm leading-7 text-slate-300">
              ابتدا ایمیل یا شماره موبایل کارمند را وارد کنید. اگر کارمند قبلاً در همین کسب‌وکار ثبت شده باشد، اطلاعات پایه او به‌صورت خودکار تکمیل می‌شود.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setContactMethod('mobile');
              setContactValue('');
              setSelectedSuggestion(null);
              setSuggestions([]);
              setError('');
            }}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-bold transition-colors',
              contactMethod === 'mobile'
                ? 'border-indigo-400 bg-indigo-500/15 text-indigo-100'
                : 'border-white/10 bg-slate-950/25 text-slate-300 hover:border-white/20 hover:text-white',
            )}
          >
            شماره موبایل
          </button>
          <button
            type="button"
            onClick={() => {
              setContactMethod('email');
              setContactValue('');
              setSelectedSuggestion(null);
              setSuggestions([]);
              setError('');
            }}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-bold transition-colors',
              contactMethod === 'email'
                ? 'border-indigo-400 bg-indigo-500/15 text-indigo-100'
                : 'border-white/10 bg-slate-950/25 text-slate-300 hover:border-white/20 hover:text-white',
            )}
          >
            ایمیل
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="space-y-2 text-right">
            <span className="text-sm font-bold text-white">{contactMethod === 'mobile' ? 'شماره موبایل کارمند' : 'ایمیل کارمند'}</span>
            <input
              value={contactValue}
              onChange={(event) => {
                setContactValue(event.target.value);
                setError('');
                setSearchError('');
                setSelectedSuggestion(null);
              }}
              placeholder={contactMethod === 'mobile' ? 'مثلاً 09123456789' : 'مثلاً employee@example.com'}
              className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-400"
            />
          </label>
          {contactValue.trim() && contactError ? <div className="text-xs text-rose-300">{contactError}</div> : null}

          <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-white">
                <Search className="h-4 w-4 text-slate-300" />
                پیشنهادهای همین کسب‌وکار
              </div>
              <div className="text-xs text-slate-400">
                {contactValue.trim() && normalizeContactValue(contactValue, contactMethod).length >= 3
                  ? searching
                    ? 'در حال جستجو...'
                    : suggestions.length
                      ? `${suggestions.length} مورد`
                      : 'موردی پیدا نشد.'
                  : 'برای جستجو، حداقل ۳ کاراکتر وارد کنید.'}
              </div>
            </div>
            <div className="mt-3 max-h-48 space-y-2 overflow-auto">
              {searchError ? (
                <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-xs text-rose-100">{searchError}</div>
              ) : !contactValue.trim() || normalizeContactValue(contactValue, contactMethod).length < 3 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/20 p-3 text-xs text-slate-400">برای جستجو، حداقل ۳ کاراکتر وارد کنید.</div>
              ) : searching ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/20 p-3 text-xs text-slate-400">در حال جستجو...</div>
              ) : suggestions.length ? (
                suggestions.map((item) => {
                  const duplicate = duplicateContact(item);
                  return (
                    <button
                      key={`${item.source}-${item.id}`}
                      type="button"
                      onClick={() => selectSuggestion(item)}
                      disabled={duplicate}
                      className={cn(
                        'flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-right transition-colors',
                        duplicate
                          ? 'cursor-not-allowed border-rose-400/20 bg-rose-500/5 opacity-70'
                          : selectedSuggestion?.id === item.id
                            ? 'border-indigo-400 bg-indigo-500/10'
                            : 'border-white/10 bg-slate-900/40 hover:border-white/20',
                      )}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-white">
                          {item.firstName} {item.lastName}
                        </div>
                        <div className="text-xs text-slate-400">{contactDisplay(item.email, item.mobile)}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-300">{item.status}</span>
                        {duplicate ? <span className="text-[11px] text-rose-300">قبلاً اضافه شده</span> : null}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/20 p-3 text-xs text-slate-400">موردی پیدا نشد.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-white">نام و نام خانوادگی</div>
              <div className="text-xs text-slate-400">
                {selectedSuggestion ? 'اطلاعات از کارمند موجود دریافت شد و قابل ویرایش است.' : contactIsValid ? 'برای ایجاد کارمند جدید، نام و نام خانوادگی را وارد کنید.' : 'ابتدا ایمیل یا موبایل معتبر وارد کنید.'}
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-bold text-white">نام *</span>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  disabled={!contactIsValid}
                  placeholder="نام"
                  className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-white">نام خانوادگی *</span>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  disabled={!contactIsValid}
                  placeholder="نام خانوادگی"
                  className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
            <input
              type="checkbox"
              checked={inviteLinkEnabled}
              disabled={!contactIsValid || inviteBySmsDisabled}
              onChange={(event) => {
                if (event.target.checked && (!contactIsValid || inviteBySmsDisabled)) {
                  setInviteLinkEnabled(false);
                  setError('برای ارسال لینک از طریق پیامک، اعتبار پیامکی کافی نیست.');
                  return;
                }
                setInviteLinkEnabled(event.target.checked);
                setError('');
              }}
              className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
            />
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">ارسال لینک تکمیل اطلاعات برای کارمند</div>
              <p className="text-xs leading-6 text-slate-400">
                با فعال کردن این گزینه، لینک اختصاصی تکمیل اطلاعات برای این کارمند ساخته می‌شود. اگر مسیر ارسال پیامکی انتخاب شده باشد، اعتبار پیامک باید کافی باشد.
              </p>
              {contactMethod === 'mobile' ? (
                <div className="space-y-2 text-xs text-amber-200">
                  <div>اعتبار پیامکی فعلی: {SMS_CREDIT_BALANCE} پیامک</div>
                  <div>در حال حاضر ارسال پیامک در این مرحله غیرفعال است.</div>
                </div>
              ) : (
                <div className="text-xs text-emerald-200">برای ایمیل، اعتبار پیامکی تأثیری ندارد.</div>
              )}
            </div>
          </label>
        </div>

        {error ? <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={requestClose}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:border-white/20"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'در حال ثبت...' : invitationCTAEnabled ? 'ثبت و ارسال لینک تکمیل اطلاعات' : 'ثبت کارمند'}
          </button>
        </div>

        {closeConfirmOpen ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={() => setCloseConfirmOpen(false)}>
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1228] p-5 text-right text-slate-100" onClick={(event) => event.stopPropagation()}>
              <div className="text-xl font-black text-white">اطلاعات واردشده ذخیره نشده است. آیا می‌خواهید خارج شوید؟</div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCloseConfirmOpen(false)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:border-white/20"
                >
                  ادامه ویرایش
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-500"
                >
                  خروج بدون ذخیره
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ExcelEmployeesDialog({
  open,
  mode,
  existingEmployees,
  onClose,
  onStart,
}: {
  open: boolean;
  mode: Exclude<JobMode, 'quick_invite'>;
  existingEmployees: QuickEmployeeSummary[];
  onClose: () => void;
  onStart: (payload: { file: File; mode: Exclude<JobMode, 'quick_invite'> }) => Promise<void> | void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedExcelRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedFile(null);
    setFileName('');
    setRows([]);
    setBusy(false);
    setError('');
    setPreviewOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [open]);

  if (!open) return null;

  const rowLookup = new Set(existingEmployees.map((employee) => getEmployeeContactKey(employee)));
  const duplicateContactKeys = new Set<string>();
  const parsedRows = rows.map((row) => {
    const email = row.email.trim();
    const mobile = normalizeContactValue(row.mobile, 'mobile');
    const emailKey = email ? `email:${normalizeContactValue(email, 'email')}` : '';
    const mobileKey = mobile ? `mobile:${mobile}` : '';
    const contactKey = emailKey || mobileKey;
    const duplicateInFile = contactKey ? duplicateContactKeys.has(contactKey) : false;
    if (contactKey) duplicateContactKeys.add(contactKey);
    const existing = contactKey ? rowLookup.has(contactKey) : false;
    const hasContact = Boolean(emailKey || mobileKey);
    const hasNames = Boolean(row.firstName.trim() && row.lastName.trim());
    return {
      ...row,
      email,
      mobile,
      emailKey,
      mobileKey,
      contactKey,
      duplicateInFile,
      existing,
      valid: hasContact && hasNames,
      smsRequired: Boolean(mobileKey && !emailKey),
    };
  });

  const stats = parsedRows.reduce(
    (acc, row) => {
      acc.total += 1;
      if (!row.valid) acc.invalid += 1;
      if (row.duplicateInFile) acc.duplicate += 1;
      if (row.existing) acc.existing += 1;
      if (row.smsRequired) acc.sms += 1;
      if (row.emailKey) acc.email += 1;
      return acc;
    },
    { total: 0, invalid: 0, duplicate: 0, existing: 0, email: 0, sms: 0 },
  );

  const canStart = parsedRows.length > 0 && !busy && !error;
  const blockingReason = '';

  const parseFile = async (file: File) => {
    setBusy(true);
    setError('');
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error('sheet_missing');
      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      if (rawRows.length > 500) {
        throw new Error('row_limit');
      }
      const nextRows = rawRows.map((row, index) => normalizeExcelRow(row, index + 2));
      setRows(nextRows);
      setSelectedFile(file);
      setFileName(file.name);
      setPreviewOpen(true);
    } catch (err) {
      setRows([]);
      setFileName('');
      if (String(err).includes('row_limit')) {
        setError('حداکثر ۵۰۰ ردیف در هر فایل قابل پذیرش است.');
      } else {
        setError('فایل اکسل قابل پردازش نبود. لطفاً قالب نمونه را استفاده کنید.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <OverlayShell
      title={mode === 'excel_import' ? 'افزودن لیستی با اکسل' : 'افزودن لیستی با اکسل و ارسال لینک تکمیل اطلاعات'}
      description="فایل نمونه را دانلود کنید، ستون‌ها را تکمیل کنید و فایل نهایی را بارگذاری کنید. پس از بررسی اولیه، پردازش به‌صورت مرحله‌ای انجام می‌شود."
      onClose={onClose}
      widthClass="max-w-4xl"
    >
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={createSampleWorkbookDownload}
          className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right transition-colors hover:border-indigo-400/40 hover:bg-indigo-500/10"
        >
          <Download className="h-5 w-5 text-indigo-200" />
          <div className="mt-3 text-base font-bold text-white">دانلود فایل نمونه</div>
          <div className="mt-1 text-xs leading-6 text-slate-400">قالب نمونه با ستون‌های مورد نیاز.</div>
        </button>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
          <div className="text-xs text-slate-400">کل ردیف‌ها</div>
          <div className="mt-2 text-2xl font-black text-white">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
          <div className="text-xs text-slate-400">دعوت پیامکی</div>
          <div className="mt-2 text-2xl font-black text-white">{stats.sms}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-right">
          <div className="text-xs text-slate-400">ردیف‌های خطادار</div>
          <div className="mt-2 text-2xl font-black text-white">{stats.invalid + stats.duplicate}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-slate-950/25 p-4 text-right">
        <div className="text-sm font-bold text-white">ستون‌های مورد نیاز</div>
        <div className="mt-2 text-sm leading-7 text-slate-300">نام، نام خانوادگی، ایمیل، شماره موبایل. برای ساخت کارمند جدید، نام و نام خانوادگی همراه با حداقل یکی از ایمیل یا موبایل لازم است.</div>
        {mode === 'excel_import_invite' ? (
          <div className="mt-2 text-xs leading-6 text-amber-200">اگر فایل شامل دعوت پیامکی باشد، پیش از شروع باید اعتبار پیامکی کافی باشد.</div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void parseFile(file);
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
        >
          <Upload className="h-4 w-4" />
          بارگذاری فایل اکسل
        </button>
        <button
          type="button"
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.value = '';
            setSelectedFile(null);
            setFileName('');
            setRows([]);
            setPreviewOpen(false);
            setError('');
          }}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:border-white/20"
        >
          پاک کردن
        </button>
      </div>

      {fileName ? <div className="mt-3 text-xs text-slate-400">فایل انتخاب‌شده: {fileName}</div> : null}
      {error ? <div className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
      {blockingReason ? <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{blockingReason}</div> : null}

      {previewOpen && parsedRows.length ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
              <div className="text-xs text-slate-400">ایمیل</div>
              <div className="mt-2 text-xl font-black text-white">{stats.email}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
              <div className="text-xs text-slate-400">موبایل</div>
              <div className="mt-2 text-xl font-black text-white">{stats.sms}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
              <div className="text-xs text-slate-400">قبلاً ثبت شده</div>
              <div className="mt-2 text-xl font-black text-white">{stats.existing}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
              <div className="text-xs text-slate-400">دارای خطا</div>
              <div className="mt-2 text-xl font-black text-white">{stats.invalid + stats.duplicate}</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/25">
            <div className="max-h-[22rem] overflow-auto">
              <table className="min-w-full text-right">
                <thead className="border-b border-white/10 bg-slate-950/40 text-xs text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">ردیف</th>
                    <th className="px-4 py-3 font-medium">نام و نام خانوادگی</th>
                    <th className="px-4 py-3 font-medium">ایمیل / موبایل</th>
                    <th className="px-4 py-3 font-medium">وضعیت</th>
                    <th className="px-4 py-3 font-medium">توضیح</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row) => {
                    const email = row.email.trim();
                    const mobile = row.mobile.trim();
                    const hasContact = Boolean(email || mobile);
                    const hasName = Boolean(row.firstName.trim() && row.lastName.trim());
                    const status: JobRowStatus = row.duplicateInFile
                      ? 'duplicate_in_file'
                      : !hasContact || !hasName
                        ? 'invalid'
                        : row.existing
                          ? 'existing_employee'
                          : 'created';
                    const note = row.duplicateInFile
                      ? 'تکراری در فایل'
                      : !hasContact
                        ? 'ایمیل یا موبایل باید تکمیل شود'
                        : !hasName
                          ? 'نام و نام خانوادگی برای ثبت کارمند جدید لازم است'
                          : row.existing
                            ? 'این کارمند قبلاً در همین کسب‌وکار ثبت شده است'
                            : mode === 'excel_import_invite'
                              ? 'پس از شروع پردازش، لینک اختصاصی ارسال می‌شود'
                              : 'برای ثبت کارمند آماده است';
                    return (
                      <tr key={row.rowNumber} className="border-b border-white/5 last:border-b-0">
                        <td className="px-4 py-4 align-top text-sm text-slate-300">{row.rowNumber}</td>
                        <td className="px-4 py-4 align-top">
                          <div className="font-bold text-white">{`${row.firstName} ${row.lastName}`.trim() || 'ثبت نشده'}</div>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-slate-300">{contactDisplay(row.email || null, row.mobile || null)}</td>
                        <td className="px-4 py-4 align-top">
                          <RowBadge status={status} />
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-slate-300">{note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:border-white/20"
        >
          انصراف
        </button>
        <button
          type="button"
          disabled={!canStart || !selectedFile}
          onClick={() => {
            if (!canStart || !selectedFile) return;
            setBusy(true);
            void onStart({ file: selectedFile, mode });
            onClose();
          }}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'در حال بررسی...' : mode === 'excel_import' ? 'شروع واردسازی' : 'شروع واردسازی و ارسال لینک'}
        </button>
      </div>
    </OverlayShell>
  );
}

function LegacyQuickInviteDialog({
  open,
  existingEmployees,
  initialValue = '',
  onClose,
  onStart,
}: {
  open: boolean;
  existingEmployees: QuickEmployeeSummary[];
  initialValue?: string;
  onClose: () => void;
  onStart: (payload: { title: string; items: QuickInviteItem[] }) => Promise<void> | void;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValue(initialValue);
    setError('');
    setBusy(false);
    setPreviewOpen(Boolean(initialValue.trim()));
  }, [initialValue, open]);

  if (!open) return null;

  const items = parseQuickInviteInput(value);
  const counts = countInviteChannels(items);
  const duplicatesInInput = new Set<string>();
  const normalizedContacts = new Set<string>();
  const resolved = items.map((item) => {
    if (!item.valid) return { ...item, duplicateInInput: false, existing: false };
    const key = `${item.contactMethod}:${item.value}`;
    const duplicateInInput = normalizedContacts.has(key);
    normalizedContacts.add(key);
    const existing = existingEmployees.some((employee) => employeeMatchesContact(employee, item.value, item.contactMethod));
    return { ...item, duplicateInInput, existing };
  });
  const duplicateCount = resolved.filter((item) => item.duplicateInInput).length;
  const existingCount = resolved.filter((item) => item.existing).length;
  const smsCount = resolved.filter((item) => item.valid && item.contactMethod === 'mobile').length;
  const emailCount = resolved.filter((item) => item.valid && item.contactMethod === 'email').length;
  const invalidCount = resolved.filter((item) => !item.valid).length;
  const canStart = !busy && resolved.length > 0 && smsCount <= SMS_CREDIT_BALANCE && invalidCount === 0;
  const blockingReason = smsCount > SMS_CREDIT_BALANCE ? `برای ارسال ${smsCount} دعوت پیامکی، اعتبار فعلی کافی نیست.` : '';

  return (
    <OverlayShell
      title="ارسال لینک تکمیل اطلاعات سریع"
      description="فهرست ایمیل یا شماره موبایل را وارد کنید تا لینک اختصاصی تکمیل اطلاعات برای هر فرد تولید شود. این لینک عمومی نیست و برای هر گیرنده به‌صورت یکتا ساخته می‌شود."
      onClose={onClose}
      widthClass="max-w-4xl"
    >
      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/25 p-4">
        <label className="space-y-2 text-right">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-white">ایمیل یا شماره موبایل‌ها</span>
            <button
              type="button"
              onClick={() => createSampleWorkbookDownload()}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 transition-colors hover:border-white/20"
            >
              <Download className="h-4 w-4" />
              دانلود نمونه
            </button>
          </div>
          <textarea
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError('');
              setPreviewOpen(true);
            }}
            rows={8}
            placeholder="employee@example.com
09123456789
another@example.com"
            className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-400"
          />
        </label>
        <div className="mt-3 text-xs leading-6 text-slate-400">هر خط یا هر مقدار جداگانه یک گیرنده در نظر گرفته می‌شود. اگر مسیر پیامکی انتخاب شود، اعتبار پیامکی بررسی می‌شود.</div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
          <div className="text-xs text-slate-400">کل ورودی‌ها</div>
          <div className="mt-2 text-2xl font-black text-white">{resolved.length}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
          <div className="text-xs text-slate-400">ایمیل</div>
          <div className="mt-2 text-2xl font-black text-white">{emailCount}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
          <div className="text-xs text-slate-400">موبایل</div>
          <div className="mt-2 text-2xl font-black text-white">{smsCount}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
          <div className="text-xs text-slate-400">دارای خطا</div>
          <div className="mt-2 text-2xl font-black text-white">{invalidCount + duplicateCount}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-slate-950/25 p-4 text-right">
        <div className="text-sm font-bold text-white">پیش‌نمایش</div>
        <div className="mt-2 text-sm leading-7 text-slate-300">
          {counts.email} دعوت ایمیلی، {counts.sms} دعوت پیامکی، {invalidCount} مورد نامعتبر، {existingCount} مورد قبلاً ثبت شده.
        </div>
      </div>

      {blockingReason ? <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{blockingReason}</div> : null}
      {error ? <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

      {previewOpen && resolved.length ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/25">
          <div className="max-h-[20rem] overflow-auto">
            <table className="min-w-full text-right">
              <thead className="border-b border-white/10 bg-slate-950/40 text-xs text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">ورودی</th>
                  <th className="px-4 py-3 font-medium">نوع</th>
                  <th className="px-4 py-3 font-medium">وضعیت</th>
                  <th className="px-4 py-3 font-medium">توضیح</th>
                </tr>
              </thead>
              <tbody>
                {resolved.map((item, index) => {
                  const status: JobRowStatus = !item.valid
                    ? 'invalid'
                    : item.duplicateInInput
                      ? 'duplicate_in_file'
                      : item.existing
                        ? 'existing_employee'
                        : 'queued';
                  const note = !item.valid
                    ? 'مورد نامعتبر است'
                    : item.duplicateInInput
                      ? 'این مقدار در همین فهرست تکرار شده است'
                      : item.existing
                        ? 'کارمند/مخاطب قبلاً در همین کسب‌وکار وجود دارد'
                        : 'برای ارسال آماده است';
                  return (
                    <tr key={`${item.raw}-${index}`} className="border-b border-white/5 last:border-b-0">
                      <td className="px-4 py-4 align-top text-sm text-slate-300">{item.raw}</td>
                      <td className="px-4 py-4 align-top text-sm text-slate-300">{item.contactMethod === 'email' ? 'ایمیل' : 'موبایل'}</td>
                      <td className="px-4 py-4 align-top">
                        <RowBadge status={status} />
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-300">{note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:border-white/20"
        >
          انصراف
        </button>
        <button
          type="button"
          disabled={!canStart}
          onClick={() => {
            if (!canStart) return;
            setBusy(true);
            void onStart({ title: 'ارسال لینک تکمیل اطلاعات سریع', items: resolved.map(({ raw, value, contactMethod, valid }) => ({ raw, value, contactMethod, valid })) });
            onClose();
          }}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'در حال پردازش...' : 'ارسال لینک'}
        </button>
      </div>
    </OverlayShell>
  );
}

function QuickInviteDialog({
  open,
  existingEmployees,
  initialValue = '',
  onClose,
  onStart,
}: {
  open: boolean;
  existingEmployees: QuickEmployeeSummary[];
  initialValue?: string;
  onClose: () => void;
  onStart: (payload: { contacts: Array<{ type: ContactMethod; value: string }> }) => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [contactMethod, setContactMethod] = useState<ContactMethod>(initialValue.includes('@') ? 'email' : 'mobile');
  const [value, setValue] = useState(initialValue);
  const [entries, setEntries] = useState<QuickInviteEntry[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rejectedCounts, setRejectedCounts] = useState({ duplicate: 0, invalid: 0 });

  useEffect(() => {
    if (!open) return;
    setContactMethod(initialValue.includes('@') ? 'email' : 'mobile');
    setValue(initialValue);
    setEntries([]);
    setError('');
    setBusy(false);
    setRejectedCounts({ duplicate: 0, invalid: 0 });
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [initialValue, open]);

  if (!open) return null;

  const summary = entries.reduce(
    (acc, entry) => {
      acc.total += 1;
      if (entry.contactMethod === 'mobile') acc.mobile += 1;
      if (entry.contactMethod === 'email') acc.email += 1;
      if (entry.status === 'existing_employee') acc.existing += 1;
      return acc;
    },
    { total: 0, mobile: 0, email: 0, existing: 0 },
  );

  const addContact = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setRejectedCounts((current) => ({ ...current, invalid: current.invalid + 1 }));
      setError(contactMethod === 'mobile' ? 'شماره موبایل واردشده معتبر نیست.' : 'ایمیل واردشده معتبر نیست.');
      return;
    }
    if (contactMethod === 'mobile' && !isValidMobile(trimmed)) {
      setRejectedCounts((current) => ({ ...current, invalid: current.invalid + 1 }));
      setError('شماره موبایل واردشده معتبر نیست.');
      return;
    }
    if (contactMethod === 'email' && !isValidEmail(trimmed)) {
      setRejectedCounts((current) => ({ ...current, invalid: current.invalid + 1 }));
      setError('ایمیل واردشده معتبر نیست.');
      return;
    }

    const normalized = normalizeContactValue(trimmed, contactMethod);
    if (entries.some((entry) => entry.contactMethod === contactMethod && entry.normalizedValue === normalized)) {
      setRejectedCounts((current) => ({ ...current, duplicate: current.duplicate + 1 }));
      setError('این مخاطب قبلاً به فهرست اضافه شده است.');
      return;
    }

    setBusy(true);
    try {
      const exactMatch = await searchQuickSetupEmployeeSuggestionsAction({ query: normalized, contactMethod });
      const existing = exactMatch.items.find(
        (item) => item.source === 'employee' && normalizeContactValue(item.email || item.mobile || '', contactMethod) === normalized,
      );
      setEntries((current) => [
        ...current,
        {
          id: createToken(),
          contactMethod,
          contactValue: trimmed,
          normalizedValue: normalized,
          status: existing ? 'existing_employee' : 'ready',
          note: existing
            ? 'این کارمند قبلاً در لیست کارکنان وجود دارد.'
            : 'آماده ارسال',
        },
      ]);
      setValue('');
      setError('');
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } catch {
      setError('این مخاطب قبلاً در لیست کارکنان وجود دارد. لینک تکمیل اطلاعات برای همان رکورد ارسال یا مجدداً ارسال می‌شود.');
    } finally {
      setBusy(false);
    }
  };

  const removeEntry = (id: string) => setEntries((current) => current.filter((entry) => entry.id !== id));

  const submit = async () => {
    if (!entries.length) {
      setError('حداقل یک موبایل یا ایمیل برای ارسال لینک وارد کنید.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await onStart({ contacts: entries.map((entry) => ({ type: entry.contactMethod, value: entry.normalizedValue })) });
      onClose();
    } catch {
      setError('عملیات ارسال لینک ثبت نشد. دوباره تلاش کنید.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <OverlayShell
      title="ارسال لینک تکمیل اطلاعات سریع"
      description="شماره موبایل یا ایمیل کارکنان را وارد کنید. برای هر نفر یک لینک اختصاصی تکمیل اطلاعات ساخته می‌شود و همان فرد در فهرست کارکنان ثبت می‌شود."
      onClose={onClose}
      widthClass="max-w-4xl"
    >
      <div className="mt-5 flex flex-wrap gap-2">
        {[
          { value: 'mobile', label: 'شماره موبایل' },
          { value: 'email', label: 'ایمیل' },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setContactMethod(item.value as ContactMethod);
              setValue('');
              setError('');
              window.setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-bold transition-colors',
              contactMethod === item.value
                ? 'border-indigo-400 bg-indigo-500/15 text-indigo-100'
                : 'border-white/10 bg-slate-950/25 text-slate-300 hover:border-white/20 hover:text-white',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/25 p-4">
        <label className="space-y-2 text-right">
          <span className="text-sm font-bold text-white">{contactMethod === 'mobile' ? 'شماره موبایل' : 'ایمیل'}</span>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              ref={inputRef}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError('');
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                void addContact();
              }}
              placeholder={contactMethod === 'mobile' ? 'مثلاً 09123456789' : 'مثلاً employee@example.com'}
              className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={() => void addContact()}
              disabled={busy}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              افزودن به فهرست
            </button>
          </div>
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
          <div className="text-xs text-slate-400">کل دعوت‌ها</div>
          <div className="mt-2 text-2xl font-black text-white">{summary.total}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
          <div className="text-xs text-slate-400">موبایل</div>
          <div className="mt-2 text-2xl font-black text-white">{summary.mobile}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
          <div className="text-xs text-slate-400">ایمیل</div>
          <div className="mt-2 text-2xl font-black text-white">{summary.email}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
          <div className="text-xs text-slate-400">قبلاً ثبت شده</div>
          <div className="mt-2 text-2xl font-black text-white">{summary.existing}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
          <div className="text-xs text-slate-400">تکراری</div>
          <div className="mt-2 text-2xl font-black text-white">{rejectedCounts.duplicate}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4 text-right">
          <div className="text-xs text-slate-400">نامعتبر</div>
          <div className="mt-2 text-2xl font-black text-white">{rejectedCounts.invalid}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-slate-950/25 p-4 text-right">
        <div className="text-sm font-bold text-white">فهرست دعوت‌ها</div>
        <div className="mt-2 text-sm leading-7 text-slate-300">
          {entries.length ? 'مخاطبان آماده هستند و می‌توانید ارسال لینک را نهایی کنید.' : 'هنوز مخاطبی اضافه نشده است.'}
        </div>
      </div>

      <div className="mt-4 max-h-[16rem] space-y-2 overflow-auto rounded-2xl border border-white/10 bg-slate-950/25 p-3">
        {entries.length ? (
          entries.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-right">
                <div className="font-bold text-white">{entry.contactValue}</div>
                <div className="text-xs text-slate-400">{entry.contactMethod === 'mobile' ? 'موبایل' : 'ایمیل'}</div>
                <div className="text-xs text-slate-400">{entry.note}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', quickInviteEntryStatusClass(entry.status))}>
                  {quickInviteEntryStatusLabel(entry.status)}
                </span>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="rounded-full border border-rose-400/20 px-3 py-1 text-xs font-bold text-rose-100 transition-colors hover:bg-rose-500/10"
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-400">هنوز مخاطبی اضافه نشده است.</div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-slate-950/25 p-4 text-right">
        <div className="text-sm font-bold text-white">پیش‌نمایش</div>
        <div className="mt-2 text-sm leading-7 text-slate-300">
          در این نسخه ارسال لینک به‌صورت شبیه‌سازی‌شده ثبت می‌شود.
        </div>
      </div>

      {error ? <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:border-white/20"
        >
          انصراف
        </button>
        <button
          type="button"
          disabled={!entries.length || busy}
          onClick={() => void submit()}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'در حال ثبت...' : 'ثبت و ارسال لینک‌ها'}
        </button>
      </div>
    </OverlayShell>
  );
}

function EmployeeDeleteConfirm({
  employee,
  onClose,
  onConfirm,
}: {
  employee: QuickEmployeeSummary | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!employee) return null;

  return (
    <OverlayShell
      title="حذف از لیست؟"
      description={`آیا می‌خواهید ${resolveEmployeeName(employee)} را از لیست کارکنان این مرحله حذف کنید؟`}
      onClose={onClose}
      widthClass="max-w-md"
    >
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:border-white/20"
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-500"
        >
          حذف
        </button>
      </div>
    </OverlayShell>
  );
}

export default function Step4Employees({ employees, importJobs, onChange, onBack, onNext, onExit }: Step4EmployeesProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<EmployeeFilter>('all');
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [singleEmployeeOpen, setSingleEmployeeOpen] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  const [excelInviteOpen, setExcelInviteOpen] = useState(false);
  const [quickInviteOpen, setQuickInviteOpen] = useState(false);
  const [quickInviteInitialValue, setQuickInviteInitialValue] = useState('');
  const [continueWithoutEmployeesOpen, setContinueWithoutEmployeesOpen] = useState(false);
  const [jobs, setJobs] = useState<EmployeeJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuickEmployeeSummary | null>(null);
  const employeesRef = useRef(employees);

  useEffect(() => {
    employeesRef.current = employees;
  }, [employees]);

  const visibleEmployees = useMemo(() => employees.filter((employee) => isFilterMatch(employee, filter)), [employees, filter]);
  const summary = useMemo(
    () => ({
      total: employees.length,
      inviteSent: employees.filter((employee) => employee.status === 'invite_sent').length,
      pending: employees.filter((employee) => employee.status === 'pending_completion').length,
      error: employees.filter((employee) => employee.status === 'error' || employee.status === 'failed_send').length,
    }),
    [employees],
  );
  const importSummary = useMemo(
    () => ({
      total: importJobs.length,
      processing: importJobs.filter((job) => job.status === 'queued' || job.status === 'processing').length,
      withErrors: importJobs.filter((job) => job.status === 'completed_with_errors' || job.status === 'failed').length,
    }),
    [importJobs],
  );
  const jobSummaries = useMemo(() => jobs.map((job) => ({ job, stats: summarizeJob(job) })), [jobs]);
  const activeJob = useMemo(() => jobs.find((job) => job.id === activeJobId) ?? jobs[0] ?? null, [activeJobId, jobs]);

  useEffect(() => {
    if (!activeJobId && jobs.length) {
      setActiveJobId(jobs[0].id);
    }
  }, [activeJobId, jobs]);

  const replaceEmployees = (nextEmployees: QuickEmployeeSummary[]) => {
    employeesRef.current = nextEmployees;
    onChange(nextEmployees);
  };

  const upsertEmployee = (candidate: QuickEmployeeSummary) => {
    const current = employeesRef.current;
    const next = current.some((employee) => employee.id === candidate.id)
      ? current.map((employee) => (employee.id === candidate.id ? candidate : employee))
      : [candidate, ...current];
    replaceEmployees(next);
  };

  const patchEmployeeById = (employeeId: string, patch: Partial<QuickEmployeeSummary>) => {
    const current = employeesRef.current;
    replaceEmployees(current.map((employee) => (employee.id === employeeId ? { ...employee, ...patch } : employee)));
  };

  const patchJob = (jobId: string, updater: (job: EmployeeJob) => EmployeeJob) => {
    setJobs((current) => current.map((job) => (job.id === jobId ? updater(job) : job)));
  };

  const startJob = (title: string, rows: JobRow[], fileName?: string, mode: JobMode = 'excel_import') => {
    const jobId = createToken();
    const job: EmployeeJob = {
      id: jobId,
      mode,
      title,
      fileName,
      createdAt: new Date().toISOString(),
      status: 'queued',
      rows,
    };
    setJobs((current) => [job, ...current]);
    setActiveJobId(jobId);
    return jobId;
  };

  const setJobStatus = (jobId: string, status: JobStatus, note?: string) => {
    patchJob(jobId, (job) => ({ ...job, status, note }));
  };

  const setJobRow = (jobId: string, rowId: string, patch: Partial<JobRow>) => {
    patchJob(jobId, (job) => ({
      ...job,
      rows: job.rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    }));
  };

  const handleDelete = async (id: string) => {
    await deleteEmployeeFromQuickSetupAction(id);
    replaceEmployees(employeesRef.current.filter((employee) => employee.id !== id));
    setNotice({ tone: 'success', message: 'کارمند از لیست این مرحله حذف شد.' });
  };

  const resolveContactMatch = async (contactValue: string, contactMethod: ContactMethod) => {
    const current = employeesRef.current.find((employee) => employeeMatchesContact(employee, contactValue, contactMethod));
    if (current) {
      return { kind: 'employee' as const, employee: current };
    }

    const query = normalizeContactValue(contactValue, contactMethod);
    if (query.length < 3) return null;

    const result = await searchQuickSetupEmployeeSuggestionsAction({ query, contactMethod });
    const candidate = result.items.find((item) => {
      const candidateValue = normalizeContactValue(item.email || item.mobile || '', contactMethod);
      return candidateValue === query;
    });
    if (!candidate) return null;
    if (candidate.source === 'employee') {
      return {
        kind: 'employee' as const,
        employee: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          mobile: candidate.mobile,
          status: 'registered' as QuickEmployeeStatus,
          addMethod: 'single' as QuickEmployeeAddMethod,
          invitationStatus: null,
          lastActionAt: new Date().toISOString(),
        },
      };
    }
    return { kind: 'tenant_user' as const, candidate };
  };

  const sendInviteToEmployee = (employee: QuickEmployeeSummary, channel: ContactMethod, inviteMethod: QuickEmployeeAddMethod) => {
    const completionLink = `/quick-setup/invite/${createToken()}/${employee.id}?token=${createToken()}`;
    patchEmployeeById(employee.id, {
      status: 'invite_sent',
      addMethod: inviteMethod,
      invitationStatus: 'sent',
      lastActionAt: new Date().toISOString(),
    });
    return completionLink;
  };

  const processExcelJob = async (payload: { file: File; mode: Exclude<JobMode, 'quick_invite'> }) => {
    const formData = new FormData();
    formData.set('file', payload.file);
    formData.set('mode', payload.mode);

    try {
      await createEmployeeImportJobAction(formData);
      setNotice({
        tone: 'success',
        message:
          payload.mode === 'excel_import'
            ? 'واردسازی اکسل در پایگاه داده ثبت شد.'
            : 'واردسازی اکسل و ثبت وضعیت دعوت آزمایشی در پایگاه داده انجام شد.',
      });
      router.refresh();
    } catch {
      setNotice({ tone: 'error', message: 'واردسازی اکسل انجام نشد. دوباره تلاش کنید.' });
    }
  };

  const processQuickInvite = async (payload: { contacts: Array<{ type: ContactMethod; value: string }> }) => {
    const result = await createQuickCompletionInvitesAction({ contacts: payload.contacts });

    result.rows.forEach((row) => {
      upsertEmployee(row.employee);
    });

    setNotice({
      tone: 'success',
      message: `لینک تکمیل اطلاعات برای ${result.sentCount} مخاطب ثبت شد.`,
    });
    router.refresh();
  };

  const actionCards = [
    {
      title: 'افزودن تکی کارمند',
      shortLabel: 'افزودن تکی',
      description: 'برای ثبت سریع یک کارمند با نام، نام خانوادگی و ایمیل یا شماره موبایل.',
      icon: <Users className="h-4 w-4" />,
      onClick: () => setSingleEmployeeOpen(true),
    },
    {
      title: 'افزودن لیستی با اکسل',
      shortLabel: 'اکسل',
      description: 'برای وارد کردن چند کارمند با فایل نمونه اکسل.',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      onClick: () => setExcelOpen(true),
    },
    {
      title: 'افزودن لیستی با اکسل و ارسال لینک تکمیل اطلاعات',
      shortLabel: 'اکسل + دعوت',
      description: 'برای بارگذاری فایل و ایجاد کارمندها همراه با لینک اختصاصی تکمیل اطلاعات.',
      icon: <Link2 className="h-4 w-4" />,
      onClick: () => setExcelInviteOpen(true),
    },
    {
      title: 'ارسال لینک تکمیل اطلاعات سریع',
      shortLabel: 'لینک سریع',
      description: 'برای دعوت مستقیم کارکنان با ایمیل یا شماره موبایل و ایجاد لینک یکتا برای هر نفر.',
      icon: <Send className="h-4 w-4" />,
      onClick: () => setQuickInviteOpen(true),
    },
  ] satisfies ActionCardProps[];

  return (
    <section className="grid gap-3.5 rounded-[28px] border border-white/10 bg-slate-900/60 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-3.5 text-right">
        <div className="min-w-0 grid gap-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-200">
            <AlertTriangle className="h-3.5 w-3.5 text-indigo-300" />
            ثبت و دعوت اولیه کارکنان
          </div>
          <p className="text-[11px] leading-6 text-slate-400">
            فقط اطلاعات حداقلی دریافت می‌شود؛ تکمیل پرونده در مراحل بعدی انجام می‌شود.
          </p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="shrink-0 rounded-[10px] border border-rose-400/30 px-3 py-2 text-[11px] font-extrabold text-rose-100 transition-colors hover:bg-rose-500/10"
        >
          خروج موقت
        </button>
      </div>

      <div className={employeePanelClass}>
        <div className="text-right">
          <strong className="block text-[13px] font-black text-white">افزودن کارمند</strong>
        </div>
        <EmployeeActionToolbar actions={actionCards} />
      </div>

      {importJobs.length ? (
        <div className={employeePanelClass}>
          <div className="flex items-start justify-between gap-2.5 text-right">
            <div>
              <strong className="block text-[13px] font-black text-white">فایل‌های اکسل</strong>
              <p className="mt-1 text-[11px] leading-6 text-slate-400">وضعیت پردازش فایل‌های بارگذاری‌شده</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/quick-setup/employee-imports')}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-1.5 text-[11px] font-extrabold text-indigo-100 transition-colors hover:bg-indigo-500/20"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              مشاهده فهرست
            </button>
          </div>
          <MetricStrip
            items={[
              { label: 'کل فایل‌ها', value: importSummary.total },
              { label: 'در حال پردازش', value: importSummary.processing },
              { label: 'دارای خطا', value: importSummary.withErrors },
            ]}
          />
        </div>
      ) : null}

      {jobs.length ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-bold text-white">عملیات در حال پردازش</div>
              <div className="mt-1 text-xs text-slate-400">وضعیت واردسازی‌ها و دعوت‌ها به‌صورت مرحله‌ای در این بخش نگه‌داری می‌شود.</div>
            </div>
            <div className="rounded-full border border-white/10 bg-slate-950/25 px-3 py-1 text-xs text-slate-300">
              {jobSummaries.length} عملیات
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {jobSummaries.map(({ job, stats }) => (
              <button
                type="button"
                key={job.id}
                onClick={() => setActiveJobId(job.id)}
                className={cn(
                  'rounded-2xl border p-4 text-right transition-colors',
                  activeJob?.id === job.id ? 'border-indigo-400/40 bg-indigo-500/10' : 'border-white/10 bg-slate-950/25 hover:border-white/20',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-bold text-white">{job.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{formatDateTime(job.createdAt)}</div>
                  </div>
                  <JobBadge status={job.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3">
                    <div className="text-slate-400">کل</div>
                    <div className="mt-1 text-lg font-black text-white">{stats.total}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3">
                    <div className="text-slate-400">دعوت‌شده</div>
                    <div className="mt-1 text-lg font-black text-white">{stats.invited}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3">
                    <div className="text-slate-400">ثبت‌شده</div>
                    <div className="mt-1 text-lg font-black text-white">{stats.created}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3">
                    <div className="text-slate-400">خطا</div>
                    <div className="mt-1 text-lg font-black text-white">{stats.invalid + stats.duplicate + stats.failed}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {notice ? (
        <div
          className={cn(
            'rounded-2xl border px-4 py-3 text-right text-sm',
            notice.tone === 'success'
              ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-400/20 bg-rose-500/10 text-rose-100',
          )}
        >
          {notice.message}
        </div>
      ) : null}

      {employees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/25 p-3.5 text-right">
          <strong className="block text-[13px] font-black text-white">هنوز کارمندی اضافه نشده است</strong>
          <p className="mt-1.5 text-[11px] leading-6 text-slate-400">
            از دکمه‌های بالا برای ثبت تکی، واردسازی اکسل یا ارسال لینک دعوت استفاده کنید.
          </p>
        </div>
      ) : (
        <div className={employeePanelClass}>
          <div className="text-right">
            <strong className="block text-[13px] font-black text-white">فهرست کارمندان</strong>
            <p className="mt-1 text-[11px] leading-6 text-slate-400">
              {summary.total.toLocaleString('fa-IR')} نفر در این مرحله ثبت شده‌اند
            </p>
          </div>

          <MetricStrip
            items={[
              { label: 'اضافه‌شده', value: summary.total },
              { label: 'دعوت ارسال‌شده', value: summary.inviteSent },
              { label: 'در انتظار تکمیل', value: summary.pending },
              { label: 'خطادار', value: summary.error },
            ]}
          />

          <div className="flex flex-wrap gap-1.5">
            {[
              { value: 'all', label: 'همه' },
              { value: 'registered', label: 'ثبت‌شده' },
              { value: 'invited', label: 'دعوت‌شده' },
              { value: 'error', label: 'خطادار' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value as EmployeeFilter)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition-colors',
                  filter === item.value
                    ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-100'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-1.5">
            {visibleEmployees.map((employee) => (
              <QuickSetupEmployeeRow
                key={employee.id}
                employee={employee}
                onView={() => setNotice({ tone: 'success', message: 'نمایش جزئیات کامل این کارمند در مرحله بعد تکمیل می‌شود.' })}
                onEdit={() => setNotice({ tone: 'success', message: 'ویرایش کامل کارمند در این مرحله پیاده‌سازی نشده است.' })}
                onResend={() => {
                  setQuickInviteInitialValue(employee.email || employee.mobile || '');
                  setQuickInviteOpen(true);
                }}
                onDelete={() => setDeleteTarget(employee)}
              />
            ))}
          </div>

          {visibleEmployees.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-slate-950/25 px-3 py-2.5 text-right text-xs font-bold text-slate-400">
              موردی با فیلتر انتخاب‌شده پیدا نشد.
            </div>
          ) : null}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2.5 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-right text-[11px] leading-6 text-slate-400">
          پرونده کامل پرسنلی را بعداً در مدیریت کارکنان تکمیل می‌کنید.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[38px] items-center justify-center rounded-[10px] border border-white/10 px-3.5 text-xs font-extrabold text-slate-100 transition-colors hover:border-white/20"
          >
            مرحله قبل
          </button>
          <button
            type="button"
            onClick={() => {
              if (employees.length === 0) {
                setContinueWithoutEmployeesOpen(true);
                return;
              }
              onNext();
            }}
            className="inline-flex min-h-[38px] items-center justify-center rounded-[10px] bg-indigo-600 px-3.5 text-xs font-extrabold text-white transition-colors hover:bg-indigo-500"
          >
            تأیید و ادامه
          </button>
        </div>
      </div>

      <SingleEmployeeDialog
        open={singleEmployeeOpen}
        existingEmployees={employees}
        onClose={() => setSingleEmployeeOpen(false)}
        onCreated={(employee) => {
          upsertEmployee(employee);
          setFilter('all');
          setNotice({ tone: 'success', message: employee.invitationStatus === 'sent' ? 'کارمند اضافه شد و لینک تکمیل اطلاعات ارسال شد.' : 'کارمند با موفقیت اضافه شد.' });
          setSingleEmployeeOpen(false);
        }}
      />

      <ExcelEmployeesDialog
        open={excelOpen}
        mode="excel_import"
        existingEmployees={employees}
        onClose={() => setExcelOpen(false)}
        onStart={async (payload) => {
          await processExcelJob(payload);
          setExcelOpen(false);
        }}
      />

      <ExcelEmployeesDialog
        open={excelInviteOpen}
        mode="excel_import_invite"
        existingEmployees={employees}
        onClose={() => setExcelInviteOpen(false)}
        onStart={async (payload) => {
          await processExcelJob(payload);
          setExcelInviteOpen(false);
        }}
      />

      <QuickInviteDialog
        open={quickInviteOpen}
        existingEmployees={employees}
        initialValue={quickInviteInitialValue}
        onClose={() => {
          setQuickInviteOpen(false);
          setQuickInviteInitialValue('');
        }}
        onStart={async (payload) => {
          await processQuickInvite(payload);
          setQuickInviteOpen(false);
          setQuickInviteInitialValue('');
        }}
      />

      <EmployeeJobDetailsModal job={activeJob} onClose={() => setActiveJobId(null)} />

      <EmployeeDeleteConfirm
        employee={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await handleDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />

      {continueWithoutEmployeesOpen ? (
        <OverlayShell
          title="ادامه بدون افزودن کارمند؟"
          description="هنوز هیچ کارمندی اضافه نشده است. می‌توانید بعداً از بخش مدیریت کارکنان، کارکنان را اضافه یا دعوت کنید. آیا می‌خواهید بدون افزودن کارمند ادامه دهید؟"
          onClose={() => setContinueWithoutEmployeesOpen(false)}
          widthClass="max-w-lg"
        >
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setContinueWithoutEmployeesOpen(false)}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-100 transition-colors hover:border-white/20"
            >
              بازگشت و افزودن کارمند
            </button>
            <button
              type="button"
              onClick={() => {
                setContinueWithoutEmployeesOpen(false);
                onNext();
              }}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
            >
              ادامه بدون افزودن کارمند
            </button>
          </div>
        </OverlayShell>
      ) : null}
    </section>
  );
}
