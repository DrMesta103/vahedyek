'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Eye,
  FileText,
  MoreVertical,
  Pencil,
  PieChart,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { TaavChoiceChipGroup } from '@repo/ui/taav/forms';
import { ConfirmDialog } from '../../../../../components/ConfirmDialog';
import { formatFaNumber } from '../../../../../lib/format-fa';
import {
  EmployeeRequestDialog,
  REQUEST_TABS as REQUEST_TAB_CONFIG,
  createInitialEmployeeRequestForm,
} from './EmployeeRequestDialog';
import {
  changeEmployeeRequestStatusAction,
  deleteEmployeeRequestAction,
  saveEmployeeRequestAction,
} from '../../../../../lib/employee-request-actions';
import type {
  CompanyLoanItem,
  EmployeeLeaveRequestContext,
  EmployeeRemoteWorkRequestContext,
  EmployeeRequestFormPayload,
  EmployeeRequestItem,
  EmployeeRequestStatus,
  EmployeeRequestType,
  EmployeeRequestsEmployee,
  LeaveBalanceSummary,
  RequestReasonOption,
} from '../../../../../lib/employee-requests';
import {
  mapRangeTypeToRemoteWorkMode,
  REMOTE_WORK_ATTENDANCE_EFFECT_LABELS,
  REMOTE_WORK_MODE_LABELS,
  REMOTE_WORK_PAYMENT_EFFECT_LABELS,
} from '../../../../../lib/remote-work-policy';

const CATEGORY_TABS = REQUEST_TAB_CONFIG.filter((tab) =>
  ['leave', 'overtime', 'attendance', 'remote_work', 'mission'].includes(tab.key),
);

const CATEGORY_TAB_LABELS: Partial<Record<(typeof REQUEST_TAB_CONFIG)[number]['key'], string>> = {
  attendance: 'تردد',
};

const REQUEST_TABS: Array<{ type: EmployeeRequestType; label: string }> = [
  { type: 'daily_leave', label: 'مرخصی روزانه' },
  { type: 'hourly_leave', label: 'مرخصی ساعتی' },
  { type: 'reward_leave', label: 'مرخصی تشویقی' },
  { type: 'unpaid_leave', label: 'مرخصی بدون حقوق' },
  { type: 'sick_leave', label: 'مرخصی استعلاجی' },
  { type: 'overtime', label: 'اضافه‌کاری' },
  { type: 'attendance', label: 'تردد' },
  { type: 'remote_work', label: 'دورکاری' },
  { type: 'mission', label: 'ماموریت' },
  { type: 'salary_advance', label: 'مساعده' },
  { type: 'loan', label: 'وام' },
];

const LEAVE_TYPES: EmployeeRequestType[] = ['daily_leave', 'hourly_leave', 'reward_leave', 'unpaid_leave', 'sick_leave'];

const STATUS_LABELS: Record<EmployeeRequestStatus, string> = {
  pending: 'در انتظار بررسی',
  approved: 'تأیید شده',
  rejected: 'رد شده',
  canceled: 'لغو شده',
};

const RANGE_LABELS: Record<string, string> = {
  full_day: 'یک روز کامل',
  multi_day: 'چند روز متوالی',
  hourly: 'چند ساعت از یک روز',
  range: 'بازه زمانی',
  point: 'تردد',
};

const YEARS = ['1400', '1401', '1402', '1403', '1404', '1405', '1406', '1407'];

function durationLabel(minutes?: number | null) {
  if (!minutes) return 'محاسبه نشده';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${formatFaNumber(hours, { useGrouping: false })} ساعت${mins ? ` و ${formatFaNumber(mins, { useGrouping: false })} دقیقه` : ''}`;
}

function requestTitle(type: EmployeeRequestType) {
  return REQUEST_TABS.find((tab) => tab.type === type)?.label ?? type;
}

function categoryTabLabel(key: (typeof REQUEST_TAB_CONFIG)[number]['key']) {
  return CATEGORY_TAB_LABELS[key] ?? REQUEST_TAB_CONFIG.find((tab) => tab.key === key)?.label ?? key;
}

function contractDurationSummary(employee: EmployeeRequestsEmployee) {
  if (!employee.hasActiveContract || !employee.contractStartDate || !employee.contractEndDate) return null;
  const start = new Date(`${employee.contractStartDate.slice(0, 10)}T12:00:00`);
  const end = new Date(`${employee.contractEndDate.slice(0, 10)}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const elapsedDays = Math.min(totalDays, Math.max(0, Math.ceil((today.getTime() - start.getTime()) / 86400000)));
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const progressPercent = Math.round((elapsedDays / totalDays) * 100);
  return { totalDays, elapsedDays, remainingDays, progressPercent };
}

function formatPersianTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const time = date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const day = date.toLocaleDateString('fa-IR');
  return `${time} - ${day}`;
}

function requestDetailLines(request: EmployeeRequestItem) {
  const meta = request.calculationMeta ?? {};
  const lines: Array<{ label: string; value: string }> = [];

  if (request.startDate && request.startTime) {
    lines.push({ label: 'ساعت', value: request.startTime });
    lines.push({ label: 'تاریخ', value: request.startDate });
  } else if (request.startDate && request.endDate && request.startDate !== request.endDate) {
    lines.push({ label: 'بازه', value: `${request.startDate} تا ${request.endDate}` });
  } else if (request.startDate) {
    lines.push({ label: 'تاریخ', value: request.startDate });
  } else if (request.dateTime) {
    lines.push({ label: 'زمان', value: request.dateTime });
  }

  const shiftWindow = typeof meta.shiftWindowLabel === 'string' ? meta.shiftWindowLabel : null;
  if (shiftWindow) {
    lines.push({ label: 'شیفت کاری از ساعت', value: shiftWindow.replace(' تا ', ' - ') });
  }

  const delayMinutes = typeof meta.delayMinutes === 'number' ? meta.delayMinutes : null;
  if (delayMinutes != null) {
    lines.push({ label: 'تاخیر', value: `${formatFaNumber(delayMinutes, { useGrouping: false })} دقیقه` });
  }

  if (request.reasonTitle) {
    lines.push({ label: 'علت', value: request.reasonTitle });
  }

  if (request.calculatedDurationMinutes) {
    lines.push({ label: 'مدت', value: durationLabel(request.calculatedDurationMinutes) });
  }

  return lines;
}

function fullName(employee: EmployeeRequestsEmployee) {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

function formFromRequest(request: EmployeeRequestItem): EmployeeRequestFormPayload {
  return {
    id: request.id,
    employeeId: request.employeeId,
    requestType: request.requestType,
    status: request.status,
    submissionMode: request.submissionMode,
    rangeType: request.rangeType,
    attendanceActionType: request.attendanceActionType,
    startDate: request.startDate ?? '',
    endDate: request.endDate ?? '',
    startTime: request.startTime ?? '',
    endTime: request.endTime ?? '',
    dateTime: request.dateTime ?? '',
    amount: request.amount,
    loanId: request.loanId,
    installments: request.installments,
    reasonId: request.reasonId,
    description: request.description ?? '',
    attachments: request.attachments,
  };
}

function remoteWorkMetaBadges(request: EmployeeRequestItem) {
  if (request.requestType !== 'remote_work') return null;
  const meta = request.calculationMeta ?? {};
  const mode = mapRangeTypeToRemoteWorkMode(request.rangeType);
  const attendanceEffect =
    typeof meta.attendanceEffect === 'string' ? REMOTE_WORK_ATTENDANCE_EFFECT_LABELS[meta.attendanceEffect as keyof typeof REMOTE_WORK_ATTENDANCE_EFFECT_LABELS] : null;
  const paymentEffect =
    typeof meta.paymentEffect === 'string' ? REMOTE_WORK_PAYMENT_EFFECT_LABELS[meta.paymentEffect as keyof typeof REMOTE_WORK_PAYMENT_EFFECT_LABELS] : null;
  return (
    <div className="employee-request-meta-badges">
      {mode ? <span className="employee-request-badge">{REMOTE_WORK_MODE_LABELS[mode]}</span> : null}
      {attendanceEffect ? <span className="employee-request-badge is-blue">{attendanceEffect}</span> : null}
      {paymentEffect ? <span className="employee-request-badge is-green">{paymentEffect}</span> : null}
    </div>
  );
}

function RequestCard({
  request,
  employee,
  onView,
  onEdit,
  onStatus,
  onDelete,
}: {
  request: EmployeeRequestItem;
  employee: EmployeeRequestsEmployee;
  onView: () => void;
  onEdit: () => void;
  onStatus: (status: EmployeeRequestStatus) => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const contractSummary = contractDurationSummary(employee);
  const details = requestDetailLines(request);

  return (
    <article className="employee-request-card-v2">
      <div className="employee-request-card-v2-contract">
        <div className="employee-request-card-v2-menu-wrap">
          <button
            type="button"
            className="employee-request-card-v2-menu-btn"
            aria-label="عملیات درخواست"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <div className="employee-request-card-v2-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onView(); }}><Eye className="h-4 w-4" /> مشاهده</button>
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onEdit(); }}><Pencil className="h-4 w-4" /> ویرایش</button>
              {request.status === 'pending' ? (
                <>
                  <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onStatus('approved'); }}>تأیید</button>
                  <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onStatus('rejected'); }}>رد</button>
                </>
              ) : null}
              {request.status === 'approved' ? (
                <>
                  <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onStatus('pending'); }}><RotateCcw className="h-4 w-4" /> بازگرداندن</button>
                  <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onStatus('rejected'); }}>رد</button>
                </>
              ) : null}
              {request.status !== 'canceled' ? (
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onStatus('canceled'); }}>لغو</button>
              ) : null}
              <button type="button" role="menuitem" className="is-danger" onClick={() => { setMenuOpen(false); onDelete(); }}><Trash2 className="h-4 w-4" /> حذف</button>
            </div>
          ) : null}
        </div>

        <span className={`employee-request-contract-badge${employee.hasActiveContract ? '' : ' is-empty'}`}>
          {employee.hasActiveContract ? 'دارای قرارداد' : 'فاقد قرارداد'}
        </span>

        <div className="employee-request-card-v2-gauge-block">
          <div className="employee-request-section-title">وضعیت قرارداد</div>
          {contractSummary ? (
            <>
              <div className="employee-request-card-arc-gauge" style={{ ['--progress' as never]: `${contractSummary.progressPercent}%` }} aria-hidden>
                <div className="employee-request-card-arc-gauge-track" />
                <div className="employee-request-card-arc-gauge-fill" />
                <div className="employee-request-card-arc-gauge-value">
                  <span>باقیمانده:</span>
                  <strong>{formatFaNumber(contractSummary.remainingDays, { useGrouping: false })} روز</strong>
                </div>
              </div>
              <div className="employee-request-card-v2-gauge-meta">
                <span>مدت کل قرارداد: <strong>{formatFaNumber(contractSummary.totalDays, { useGrouping: false })} روز</strong></span>
                <span>سپری شده: <strong>{formatFaNumber(contractSummary.elapsedDays, { useGrouping: false })} روز</strong></span>
              </div>
            </>
          ) : (
            <p className="employee-request-card-v2-empty-contract">قرارداد فعالی برای نمایش وضعیت ثبت نشده است.</p>
          )}
        </div>
      </div>

      <div className="employee-request-card-v2-details">
        <span className={`employee-request-status-v2 is-${request.status}`}>{STATUS_LABELS[request.status]}</span>
        <div className="employee-request-card-v2-detail-lines">
          {details.map((line) => (
            <p key={`${line.label}-${line.value}`}>
              <span>{line.label}:</span> {line.value}
            </p>
          ))}
          {request.description ? <p className="employee-request-card-v2-description">{request.description}</p> : null}
        </div>
        <p className="employee-request-card-v2-created-at">
          تاریخ ثبت درخواست {formatPersianTimestamp(request.createdAt)}
        </p>
        {remoteWorkMetaBadges(request)}
      </div>

      <div className="employee-request-card-v2-profile">
        <span className="employee-request-type-badge">{requestTitle(request.requestType)}</span>
        <div className="employee-request-card-v2-avatar">
          {employee.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={employee.avatarUrl} alt="" />
          ) : (
            <User className="h-6 w-6" />
          )}
        </div>
        <strong>{fullName(employee) || 'کارمند بدون نام'}</strong>
      </div>
    </article>
  );
}

export function EmployeeRequestsClient({
  employee,
  requests,
  reasons,
  loans,
  leaveBalance,
  leaveRequestContext,
  remoteWorkRequestContext,
}: {
  employee: EmployeeRequestsEmployee;
  requests: EmployeeRequestItem[];
  reasons: RequestReasonOption[];
  loans: CompanyLoanItem[];
  leaveBalance: LeaveBalanceSummary;
  leaveRequestContext: EmployeeLeaveRequestContext;
  remoteWorkRequestContext: EmployeeRemoteWorkRequestContext;
}) {
  const router = useRouter();
  const [activeType, setActiveType] = useState<(typeof REQUEST_TAB_CONFIG)[number]['key']>('leave');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [statuses, setStatuses] = useState<EmployeeRequestStatus[]>([]);
  const [year, setYear] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [form, setForm] = useState<EmployeeRequestFormPayload | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRequestItem | null>(null);
  const [liveLeaveBalance, setLiveLeaveBalance] = useState(leaveBalance);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLiveLeaveBalance(leaveBalance);
  }, [leaveBalance]);

  const refreshLeaveBalance = useCallback(async () => {
    try {
      const response = await fetch(`/api/employees/${employee.id}/requests/leave-balance`);
      if (!response.ok) return;
      const payload = (await response.json()) as { leaveBalance: LeaveBalanceSummary };
      setLiveLeaveBalance(payload.leaveBalance);
    } catch {
      // keep previous balance
    }
  }, [employee.id]);

  const activeTab = REQUEST_TAB_CONFIG.find((tab) => tab.key === activeType) ?? REQUEST_TAB_CONFIG[0];

  const currentRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = requests
      .filter((request) => activeTab.requestTypes.includes(request.requestType))
      .filter((request) => !statuses.length || statuses.includes(request.status))
      .filter((request) => !year || (request.startDate ?? request.dateTime ?? request.createdAt ?? '').includes(year))
      .filter((request) => !dateFrom || (request.startDate ?? request.dateTime ?? request.createdAt ?? '') >= dateFrom)
      .filter((request) => !dateTo || (request.startDate ?? request.dateTime ?? request.createdAt ?? '') <= dateTo)
      .filter((request) => {
        if (!query) return true;
        const haystack = [
          requestTitle(request.requestType),
          request.reasonTitle,
          request.description,
          request.startDate,
          request.dateTime,
          STATUS_LABELS[request.status],
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    return filtered.sort((a, b) => sort === 'newest' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt));
  }, [activeTab.requestTypes, dateFrom, dateTo, requests, searchQuery, sort, statuses, year]);

  const openCreate = () => {
    setForm(createInitialEmployeeRequestForm(activeType, employee.id));
    setDialogMode('create');
    if (activeType === 'leave') void refreshLeaveBalance();
  };

  const openRequest = (request: EmployeeRequestItem, mode: 'edit' | 'view') => {
    setForm(formFromRequest(request));
    setDialogMode(mode);
    if (LEAVE_TYPES.includes(request.requestType)) void refreshLeaveBalance();
  };

  const save = () => {
    if (!form) return;
    startTransition(async () => {
      await saveEmployeeRequestAction(form);
      setDialogMode(null);
      setForm(null);
      router.refresh();
    });
  };

  const changeStatus = (request: EmployeeRequestItem, status: EmployeeRequestStatus) => {
    startTransition(async () => {
      await changeEmployeeRequestStatusAction(request.id, employee.id, status);
      router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteEmployeeRequestAction(deleteTarget.id, employee.id);
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const toggleStatus = (status: EmployeeRequestStatus) => {
    setStatuses((current) => (current.includes(status) ? current.filter((item) => item !== status) : [...current, status]));
  };

  return (
    <div className="employee-requests-layout employee-requests-layout-v2" dir="rtl" lang="fa">
      <aside className="employee-requests-filter employee-requests-filter-v2">
        <div className="employee-filter-block">
          <button
            type="button"
            className={`employee-filter-sort-btn${sort === 'newest' ? ' is-active' : ''}`}
            onClick={() => setSort('newest')}
          >
            جدیدترین درخواست‌ها
          </button>
          <button
            type="button"
            className={`employee-filter-sort-btn${sort === 'oldest' ? ' is-active' : ''}`}
            onClick={() => setSort('oldest')}
          >
            قدیمی‌ترین درخواست‌ها
          </button>
        </div>

        <div className="employee-filter-block">
          <span className="employee-filter-block-label">کارمند</span>
          <div className="employee-filter-employee-field">
            <span>{fullName(employee) || 'انتخاب کارمند'}</span>
            <ChevronDown className="h-4 w-4" aria-hidden />
          </div>
        </div>

        <div className="employee-filter-block">
          <span className="employee-filter-block-label">وضعیت</span>
          <div className="employee-filter-status-stack">
            {(Object.keys(STATUS_LABELS) as EmployeeRequestStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                className={`employee-filter-status-btn${statuses.includes(status) ? ' is-active' : ''}`}
                onClick={() => toggleStatus(status)}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        <div className="employee-filter-block">
          <span className="employee-filter-block-label">تاریخ</span>
          <div className="employee-filter-year-grid">
            {YEARS.map((item) => (
              <button
                key={item}
                type="button"
                className={`employee-filter-year-btn${year === item ? ' is-active' : ''}`}
                onClick={() => setYear((current) => (current === item ? '' : item))}
              >
                {formatFaNumber(Number(item), { useGrouping: false })}
              </button>
            ))}
          </div>
          <div className="employee-filter-date-row">
            <label className="employee-filter-date-field">
              <span>از</span>
              <div className="employee-filter-date-input">
                <CalendarDays className="h-4 w-4" aria-hidden />
                <input value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} placeholder="۱۴۰۵/۰۱/۰۱" />
              </div>
            </label>
            <label className="employee-filter-date-field">
              <span>تا</span>
              <div className="employee-filter-date-input">
                <CalendarDays className="h-4 w-4" aria-hidden />
                <input value={dateTo} onChange={(event) => setDateTo(event.target.value)} placeholder="۱۴۰۵/۱۲/۲۹" />
              </div>
            </label>
          </div>
        </div>
      </aside>

      <main className="employee-requests-main employee-requests-main-v2">
        <div className="employee-requests-category-row">
          <TaavChoiceChipGroup
            ariaLabel="نوع درخواست"
            options={CATEGORY_TABS.map((tab) => ({ value: tab.key, label: categoryTabLabel(tab.key) }))}
            value={activeType}
            onValueChange={(next) => setActiveType((Array.isArray(next) ? next[0] : next) as (typeof REQUEST_TAB_CONFIG)[number]['key'])}
            tone="brand"
            size="md"
            wrap
          />
        </div>

        <div className="employee-requests-toolbar-v2">
          <label className="employee-requests-search">
            <Search className="h-4 w-4" aria-hidden />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="جستجو"
              aria-label="جستجو در درخواست‌ها"
            />
            {searchQuery ? (
              <button type="button" className="employee-requests-search-clear" aria-label="پاک کردن جستجو" onClick={() => setSearchQuery('')}>
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>
          <button type="button" className="employee-requests-add-btn" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            افزودن درخواست
          </button>
        </div>

        <div className="employee-requests-reports-bar">
          <PieChart className="h-4 w-4" aria-hidden />
          <span>گزارشات</span>
        </div>

        {!employee.hasActiveContract ? (
          <div className="business-payroll-warning employee-requests-inline-warning">
            برای محاسبه مرخصی و اضافه‌کاری، قرارداد فعال وجود ندارد.
          </div>
        ) : null}

        {activeType === 'mission' ? (
          <section className="employee-request-placeholder">
            <strong>در حال توسعه</strong>
            <p>ثبت و مدیریت درخواست‌های ماموریت در نسخه‌های بعدی اضافه خواهد شد.</p>
          </section>
        ) : (
          <div className="employee-request-list employee-request-list-v2">
            {currentRequests.length ? (
              currentRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  employee={employee}
                  onView={() => openRequest(request, 'view')}
                  onEdit={() => openRequest(request, 'edit')}
                  onStatus={(status) => changeStatus(request, status)}
                  onDelete={() => setDeleteTarget(request)}
                />
              ))
            ) : (
              <div className="employee-request-empty-state">
                <FileText className="h-8 w-8" />
                <strong>درخواستی برای این فیلتر ثبت نشده است.</strong>
              </div>
            )}
          </div>
        )}

        <Link href={`/employees/${employee.id}`} className="employee-request-back-link employee-request-back-link-v2">
          بازگشت به جزئیات کارمند
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </main>

      {dialogMode && form ? (
        <EmployeeRequestDialog
          mode={dialogMode}
          employee={employee}
          form={form}
          reasons={reasons}
          loans={loans}
          leaveBalance={liveLeaveBalance}
          leaveRequestContext={leaveRequestContext}
          remoteWorkRequestContext={remoteWorkRequestContext}
          saving={isPending}
          onChange={setForm}
          onClose={() => {
            setDialogMode(null);
            setForm(null);
          }}
          onSubmit={save}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف درخواست"
        description={deleteTarget ? `درخواست «${requestTitle(deleteTarget.requestType)}» حذف شود؟` : ''}
        confirmLabel="حذف"
        cancelLabel="انصراف"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {isPending ? <div className="employee-request-saving">در حال ذخیره...</div> : null}
    </div>
  );
}
