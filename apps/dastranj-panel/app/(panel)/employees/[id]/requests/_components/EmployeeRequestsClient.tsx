'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Eye,
  FileText,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  User,
} from 'lucide-react';
import { PanelFormModal, PanelFormModalActions } from '../../../../../components/PanelFormModal';
import { ConfirmDialog } from '../../../../../components/ConfirmDialog';
import { AttachmentManager } from '../../../../../components/AttachmentManager';
import { AdaptiveChipGroup } from '../../../../../components/AdaptiveChipGroup';
import { formatFaNumber } from '../../../../../lib/format-fa';
import {
  changeEmployeeRequestStatusAction,
  deleteEmployeeRequestAction,
  saveEmployeeRequestAction,
} from '../../../../../lib/employee-request-actions';
import type {
  CompanyLoanItem,
  EmployeeRequestFormPayload,
  EmployeeRequestItem,
  EmployeeRequestStatus,
  EmployeeRequestType,
  EmployeeRequestsEmployee,
  LeaveBalanceSummary,
  RequestReasonOption,
} from '../../../../../lib/employee-requests';

const REQUEST_TABS: Array<{ type: EmployeeRequestType; label: string }> = [
  { type: 'daily_leave', label: 'مرخصی روزانه' },
  { type: 'hourly_leave', label: 'مرخصی ساعتی' },
  { type: 'reward_leave', label: 'مرخصی تشویقی' },
  { type: 'unpaid_leave', label: 'مرخصی بدون حقوق' },
  { type: 'sick_leave', label: 'مرخصی استعلاجی' },
  { type: 'overtime', label: 'اضافه‌کاری' },
  { type: 'attendance', label: 'حضور و غیاب / تردد' },
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

function normalizeNumber(value: string) {
  const latin = value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[^\d.]/g, '');
  return latin ? Number(latin) : Number.NaN;
}

function money(value: number | null | undefined) {
  return `${formatFaNumber(Math.round(value ?? 0))} ریال`;
}

function durationLabel(minutes?: number | null) {
  if (!minutes) return 'محاسبه نشده';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${formatFaNumber(hours, { useGrouping: false })} ساعت${mins ? ` و ${formatFaNumber(mins, { useGrouping: false })} دقیقه` : ''}`;
}

function requestTitle(type: EmployeeRequestType) {
  return REQUEST_TABS.find((tab) => tab.type === type)?.label ?? type;
}

function fullName(employee: EmployeeRequestsEmployee) {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

function compactDate(request: EmployeeRequestItem) {
  if (request.dateTime) return request.dateTime;
  if (request.startDate && request.endDate && request.startDate !== request.endDate) {
    return `${request.startDate} تا ${request.endDate}`;
  }
  if (request.startDate && request.startTime && request.endTime) return `${request.startDate}، ${request.startTime} تا ${request.endTime}`;
  if (request.startDate) return request.startDate;
  return 'تاریخ ثبت نشده';
}

function initialForm(type: EmployeeRequestType, employeeId: string): EmployeeRequestFormPayload {
  const rangeType = type === 'hourly_leave' ? 'hourly' : LEAVE_TYPES.includes(type) ? 'full_day' : type === 'attendance' ? 'point' : 'range';
  return {
    employeeId,
    requestType: type,
    status: 'pending',
    submissionMode: 'pending',
    rangeType,
    attendanceActionType: type === 'attendance' ? 'correction' : null,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    dateTime: '',
    amount: null,
    loanId: null,
    installments: null,
    reasonId: null,
    description: '',
    attachments: [],
  };
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

function EmployeeMiniHeader({ employee }: { employee: EmployeeRequestsEmployee }) {
  return (
    <div className="employee-request-person">
      <div className="employee-request-avatar">
        {employee.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={employee.avatarUrl} alt="" />
        ) : (
          <User className="h-5 w-5" />
        )}
      </div>
      <div>
        <strong>{fullName(employee) || 'کارمند بدون نام'}</strong>
        <span>{employee.jobTitle || employee.organizationUnitTitle || employee.workGroupTitle || 'عنوان شغلی ثبت نشده'}</span>
      </div>
      <b className={employee.hasActiveContract ? 'is-approved' : 'is-muted'}>
        {employee.hasActiveContract ? 'دارای قرارداد فعال' : 'فاقد قرارداد'}
      </b>
    </div>
  );
}

function ReasonPicker({
  reasons,
  selected,
  disabled,
  onChange,
}: {
  reasons: RequestReasonOption[];
  selected: string | null | undefined;
  disabled?: boolean;
  onChange: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? reasons : reasons.slice(0, 6);

  return (
    <section className="employee-request-dialog-section">
      <div className="employee-request-section-title">علت درخواست</div>
      {visible.length ? (
        <AdaptiveChipGroup
          className="employee-request-chip-grid"
          selected={selected ?? ''}
          items={visible.map((reason) => ({ value: reason.id, label: reason.title, disabled }))}
          onChange={(value) => onChange(String(value))}
        />
      ) : (
        <p className="employee-request-empty-note">برای این نوع درخواست علتی تعریف نشده است.</p>
      )}
      {reasons.length > 6 ? (
        <button type="button" className="employee-request-more-btn" disabled={disabled} onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'نمایش کمتر' : 'موارد بیشتر'}
        </button>
      ) : null}
    </section>
  );
}

function SubmissionModePicker({
  value,
  disabled,
  onChange,
}: {
  value: 'approved' | 'pending';
  disabled?: boolean;
  onChange: (value: 'approved' | 'pending') => void;
}) {
  return (
    <section className="employee-request-dialog-section">
      <div className="employee-request-section-title">نحوه ثبت درخواست</div>
      <AdaptiveChipGroup
        className="employee-request-chip-grid"
        selected={value}
        items={[
          { value: 'approved', label: 'ثبت نهایی / تأیید شده', disabled },
          { value: 'pending', label: 'ثبت در انتظار تأیید', disabled },
        ]}
        onChange={(next) => onChange(next as 'approved' | 'pending')}
      />
    </section>
  );
}

function RequestDialog({
  mode,
  employee,
  form,
  reasons,
  loans,
  leaveBalance,
  onChange,
  onClose,
  onSubmit,
  saving,
}: {
  mode: 'create' | 'edit' | 'view';
  employee: EmployeeRequestsEmployee;
  form: EmployeeRequestFormPayload;
  reasons: RequestReasonOption[];
  loans: CompanyLoanItem[];
  leaveBalance: LeaveBalanceSummary;
  onChange: (next: EmployeeRequestFormPayload) => void;
  onClose: () => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  const [error, setError] = useState('');
  const readonly = mode === 'view';
  const typeReasons = reasons.filter((reason) => reason.category === form.requestType);
  const selectedLoan = loans.find((loan) => loan.id === form.loanId);
  const isLeave = LEAVE_TYPES.includes(form.requestType);

  const submit = () => {
    if (readonly) return onClose();
    if (form.requestType !== 'mission' && !form.reasonId) return setError('علت درخواست الزامی است.');
    if (isLeave && form.rangeType === 'hourly' && (!form.startTime || !form.endTime)) return setError('ساعت شروع و پایان الزامی است.');
    if (isLeave && !form.startDate) return setError('تاریخ مرخصی الزامی است.');
    if (isLeave && form.rangeType === 'multi_day' && !form.endDate) return setError('تاریخ پایان مرخصی الزامی است.');
    if (isLeave && form.rangeType === 'multi_day' && form.endDate && form.startDate && form.endDate < form.startDate) return setError('تاریخ پایان نباید قبل از تاریخ شروع باشد.');
    if (isLeave && form.rangeType === 'hourly' && form.startTime && form.endTime && form.endTime <= form.startTime) return setError('ساعت پایان باید بعد از ساعت شروع باشد.');
    if (['overtime', 'remote_work'].includes(form.requestType) && (!form.startDate || !form.endDate || !form.startTime || !form.endTime)) {
      return setError('بازه تاریخ و ساعت را کامل وارد کنید.');
    }
    if (['overtime', 'remote_work'].includes(form.requestType) && form.startDate && form.endDate && form.endDate < form.startDate) return setError('تاریخ پایان نباید قبل از تاریخ شروع باشد.');
    if (['overtime', 'remote_work'].includes(form.requestType) && form.startDate === form.endDate && form.startTime && form.endTime && form.endTime <= form.startTime) return setError('ساعت پایان باید بعد از ساعت شروع باشد.');
    if (form.requestType === 'attendance' && (!form.startDate || !form.startTime)) return setError('تاریخ و ساعت تردد الزامی است.');
    if (form.requestType === 'salary_advance' && (!form.amount || form.amount <= 0)) return setError('مبلغ باید عددی مثبت باشد.');
    if (form.requestType === 'loan') {
      if (!selectedLoan) return setError('انتخاب وام الزامی است.');
      if (!form.amount || form.amount < selectedLoan.minAmount || form.amount > selectedLoan.maxAmount) return setError('مبلغ درخواستی خارج از بازه وام است.');
      if (!form.installments || form.installments < selectedLoan.minInstallments || form.installments > selectedLoan.maxInstallments) return setError('تعداد اقساط خارج از بازه وام است.');
    }
    setError('');
    onSubmit();
  };

  return (
    <PanelFormModal
      open
      title={requestTitle(form.requestType)}
      lead={mode === 'view' ? 'مشاهده جزئیات درخواست ثبت‌شده' : 'اطلاعات درخواست را تکمیل کنید.'}
      error={error}
      onClose={onClose}
      footer={
        <PanelFormModalActions
          submitLabel={readonly ? 'بستن' : 'ذخیره'}
          cancelLabel={readonly ? 'بازگشت' : 'انصراف'}
          saving={saving}
          onSubmit={submit}
          onCancel={onClose}
        />
      }
    >
      <div className="employee-request-dialog">
        <EmployeeMiniHeader employee={employee} />

        {isLeave ? (
          <>
            <div className="employee-request-balance">
              <span>مرخصی سالانه: <strong>{durationLabel(leaveBalance.annualMinutes)}</strong></span>
              <span>مرخصی باقی‌مانده: <strong>{durationLabel(leaveBalance.remainingMinutes)}</strong></span>
            </div>
            <section className="employee-request-dialog-section">
              <div className="employee-request-section-title">نوع بازه مرخصی</div>
              <AdaptiveChipGroup
                className="employee-request-chip-grid"
                selected={form.rangeType ?? 'full_day'}
                items={[
                  { value: 'full_day', label: 'یک روز کامل' },
                  { value: 'multi_day', label: 'چند روز متوالی' },
                  { value: 'hourly', label: 'چند ساعت از یک روز' },
                ].map((item) => ({ ...item, disabled: readonly }))}
                onChange={(value) => onChange({ ...form, rangeType: value as EmployeeRequestFormPayload['rangeType'] })}
              />
              <p className="employee-request-tooltip">
                {form.rangeType === 'multi_day'
                  ? 'فقط روزهای کاری/شیفت‌های قابل محاسبه در بازه لحاظ می‌شود.'
                  : form.rangeType === 'hourly'
                    ? 'ساعت شروع و پایان باید معتبر باشد.'
                    : 'کل شیفت‌های کاری کارمند در آن روز محاسبه می‌شود.'}
              </p>
            </section>
          </>
        ) : null}

        <div className="employee-request-form-grid">
          {form.requestType === 'attendance' ? (
            <>
              <label className="business-payroll-field">
                <span className="business-payroll-field-label">نوع تردد</span>
                <select disabled={readonly} value={form.attendanceActionType ?? 'correction'} onChange={(event) => onChange({ ...form, attendanceActionType: event.target.value as never })}>
                  <option value="check_in">ورود</option>
                  <option value="check_out">خروج</option>
                  <option value="correction">اصلاح تردد</option>
                </select>
              </label>
              <label className="business-payroll-field">
                <span className="business-payroll-field-label">تاریخ</span>
                <input disabled={readonly} value={form.startDate ?? ''} onChange={(event) => onChange({ ...form, startDate: event.target.value, dateTime: `${event.target.value} ${form.startTime ?? ''}`.trim() })} placeholder="۱۴۰۵/۰۱/۰۱" />
              </label>
              <label className="business-payroll-field">
                <span className="business-payroll-field-label">ساعت</span>
                <input disabled={readonly} value={form.startTime ?? ''} onChange={(event) => onChange({ ...form, startTime: event.target.value, dateTime: `${form.startDate ?? ''} ${event.target.value}`.trim() })} placeholder="08:30" />
              </label>
            </>
          ) : null}

          {isLeave ? (
            <>
              <label className="business-payroll-field">
                <span className="business-payroll-field-label">{form.rangeType === 'multi_day' ? 'تاریخ شروع' : 'تاریخ'}</span>
                <input disabled={readonly} value={form.startDate ?? ''} onChange={(event) => onChange({ ...form, startDate: event.target.value })} placeholder="۱۴۰۵/۰۱/۰۱" />
              </label>
              {form.rangeType === 'multi_day' ? (
                <label className="business-payroll-field">
                  <span className="business-payroll-field-label">تاریخ پایان</span>
                  <input disabled={readonly} value={form.endDate ?? ''} onChange={(event) => onChange({ ...form, endDate: event.target.value })} placeholder="۱۴۰۵/۰۱/۰۳" />
                </label>
              ) : null}
              {form.rangeType === 'hourly' ? (
                <>
                  <label className="business-payroll-field">
                    <span className="business-payroll-field-label">ساعت شروع</span>
                    <input disabled={readonly} value={form.startTime ?? ''} onChange={(event) => onChange({ ...form, startTime: event.target.value })} placeholder="08:00" />
                  </label>
                  <label className="business-payroll-field">
                    <span className="business-payroll-field-label">ساعت پایان</span>
                    <input disabled={readonly} value={form.endTime ?? ''} onChange={(event) => onChange({ ...form, endTime: event.target.value })} placeholder="12:00" />
                  </label>
                </>
              ) : null}
            </>
          ) : null}

          {['overtime', 'remote_work'].includes(form.requestType) ? (
            <>
              <label className="business-payroll-field">
                <span className="business-payroll-field-label">تاریخ شروع</span>
                <input disabled={readonly} value={form.startDate ?? ''} onChange={(event) => onChange({ ...form, startDate: event.target.value })} placeholder="۱۴۰۵/۰۱/۰۱" />
              </label>
              <label className="business-payroll-field">
                <span className="business-payroll-field-label">ساعت شروع</span>
                <input disabled={readonly} value={form.startTime ?? ''} onChange={(event) => onChange({ ...form, startTime: event.target.value })} placeholder="17:00" />
              </label>
              <label className="business-payroll-field">
                <span className="business-payroll-field-label">تاریخ پایان</span>
                <input disabled={readonly} value={form.endDate ?? ''} onChange={(event) => onChange({ ...form, endDate: event.target.value })} placeholder="۱۴۰۵/۰۱/۰۱" />
              </label>
              <label className="business-payroll-field">
                <span className="business-payroll-field-label">ساعت پایان</span>
                <input disabled={readonly} value={form.endTime ?? ''} onChange={(event) => onChange({ ...form, endTime: event.target.value })} placeholder="20:00" />
              </label>
            </>
          ) : null}

          {form.requestType === 'salary_advance' ? (
            <label className="business-payroll-field">
              <span className="business-payroll-field-label">مبلغ</span>
              <input disabled={readonly} value={form.amount ? String(form.amount) : ''} onChange={(event) => onChange({ ...form, amount: normalizeNumber(event.target.value) })} />
            </label>
          ) : null}

          {form.requestType === 'loan' ? (
            loans.length ? (
              <>
                <label className="business-payroll-field">
                  <span className="business-payroll-field-label">وام سازمانی</span>
                  <select disabled={readonly} value={form.loanId ?? ''} onChange={(event) => onChange({ ...form, loanId: event.target.value || null })}>
                    <option value="">انتخاب کنید</option>
                    {loans.filter((loan) => loan.isActive).map((loan) => <option key={loan.id} value={loan.id}>{loan.title}</option>)}
                  </select>
                </label>
                <label className="business-payroll-field">
                  <span className="business-payroll-field-label">مبلغ درخواستی</span>
                  <input disabled={readonly} value={form.amount ? String(form.amount) : ''} onChange={(event) => onChange({ ...form, amount: normalizeNumber(event.target.value) })} />
                </label>
                <label className="business-payroll-field">
                  <span className="business-payroll-field-label">تعداد اقساط</span>
                  <input disabled={readonly} value={form.installments ? String(form.installments) : ''} onChange={(event) => onChange({ ...form, installments: Math.floor(normalizeNumber(event.target.value)) })} />
                </label>
                {selectedLoan ? (
                  <div className="employee-request-loan-summary">
                    <span>حداقل مبلغ: {money(selectedLoan.minAmount)}</span>
                    <span>حداکثر مبلغ: {money(selectedLoan.maxAmount)}</span>
                    <span>اقساط: {formatFaNumber(selectedLoan.minInstallments)} تا {formatFaNumber(selectedLoan.maxInstallments)}</span>
                    <span>ضامن: {formatFaNumber(selectedLoan.guarantorCount)}</span>
                    <span>کارمزد: {formatFaNumber(selectedLoan.feeRate)}٪</span>
                    <span>سود: {formatFaNumber(selectedLoan.interestRate)}٪</span>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="employee-request-empty-loan">
                <strong>هنوز وامی در تنظیمات کسب و کار تعریف نشده است</strong>
                <Link href="/business-settings/company-loans">رفتن به تنظیمات وام‌های سازمانی</Link>
              </div>
            )
          ) : null}

          <label className="business-payroll-field employee-request-description">
            <span className="business-payroll-field-label">توضیحات</span>
            <textarea disabled={readonly} value={form.description ?? ''} onChange={(event) => onChange({ ...form, description: event.target.value })} rows={3} />
          </label>
        </div>

        <ReasonPicker reasons={typeReasons} selected={form.reasonId} disabled={readonly} onChange={(reasonId) => onChange({ ...form, reasonId })} />
        <AttachmentManager value={form.attachments ?? []} ownerType="employee_request" ownerId={form.id ?? 'draft'} readonly={readonly} onChange={(attachments) => onChange({ ...form, attachments })} />
        <SubmissionModePicker value={form.submissionMode} disabled={readonly} onChange={(submissionMode) => onChange({ ...form, submissionMode, status: submissionMode === 'approved' ? 'approved' : 'pending' })} />
      </div>
    </PanelFormModal>
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
  return (
    <article className="employee-request-card">
      <div className="employee-request-card-main">
        <div className="employee-request-card-head">
          <div>
            <strong>{requestTitle(request.requestType)}</strong>
            <span>{compactDate(request)}</span>
          </div>
          <span className={`employee-request-status is-${request.status}`}>{STATUS_LABELS[request.status]}</span>
        </div>
        <EmployeeMiniHeader employee={employee} />
        <div className="employee-request-meta-grid">
          <span><CalendarDays className="h-4 w-4" /> {compactDate(request)}</span>
          <span><Clock3 className="h-4 w-4" /> {durationLabel(request.calculatedDurationMinutes)}</span>
          <span><FileText className="h-4 w-4" /> {request.reasonTitle ?? 'علت ثبت نشده'}</span>
          <span><BadgeCheck className="h-4 w-4" /> {formatFaNumber(request.attachmentCount, { useGrouping: false })} پیوست</span>
        </div>
        {request.description ? <p className="employee-request-description-text">{request.description}</p> : null}
        <div className="employee-request-card-foot">
          <span>ثبت‌کننده: {request.createdBy ?? 'نامشخص'}</span>
          <span>ایجاد: {new Date(request.createdAt).toLocaleDateString('fa-IR')}</span>
        </div>
      </div>
      <div className="employee-request-actions">
        <button type="button" onClick={onView}><Eye className="h-4 w-4" /> مشاهده</button>
        <button type="button" onClick={onEdit}><Pencil className="h-4 w-4" /> ویرایش</button>
        {request.status === 'pending' ? (
          <>
            <button type="button" onClick={() => onStatus('approved')}>تأیید</button>
            <button type="button" onClick={() => onStatus('rejected')}>رد</button>
          </>
        ) : null}
        {request.status === 'approved' ? (
          <>
            <button type="button" onClick={() => onStatus('pending')}><RotateCcw className="h-4 w-4" /> بازگرداندن</button>
            <button type="button" onClick={() => onStatus('rejected')}>رد</button>
          </>
        ) : null}
        {request.status !== 'canceled' ? <button type="button" onClick={() => onStatus('canceled')}>لغو</button> : null}
        <button type="button" className="is-danger" onClick={onDelete}><Trash2 className="h-4 w-4" /> حذف</button>
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
}: {
  employee: EmployeeRequestsEmployee;
  requests: EmployeeRequestItem[];
  reasons: RequestReasonOption[];
  loans: CompanyLoanItem[];
  leaveBalance: LeaveBalanceSummary;
}) {
  const router = useRouter();
  const [activeType, setActiveType] = useState<EmployeeRequestType>('daily_leave');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [statuses, setStatuses] = useState<EmployeeRequestStatus[]>([]);
  const [year, setYear] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [form, setForm] = useState<EmployeeRequestFormPayload | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRequestItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentRequests = useMemo(() => {
    const filtered = requests
      .filter((request) => request.requestType === activeType)
      .filter((request) => !statuses.length || statuses.includes(request.status))
      .filter((request) => !year || (request.startDate ?? request.dateTime ?? '').startsWith(year))
      .filter((request) => !dateFrom || (request.startDate ?? request.dateTime ?? '') >= dateFrom)
      .filter((request) => !dateTo || (request.startDate ?? request.dateTime ?? '') <= dateTo);
    return filtered.sort((a, b) => sort === 'newest' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt));
  }, [activeType, dateFrom, dateTo, requests, sort, statuses, year]);

  const openCreate = () => {
    setForm(initialForm(activeType, employee.id));
    setDialogMode('create');
  };

  const openRequest = (request: EmployeeRequestItem, mode: 'edit' | 'view') => {
    setForm(formFromRequest(request));
    setDialogMode(mode);
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

  const setQuickDate = (kind: 'today' | 'yesterday' | 'week') => {
    const today = new Date();
    const toFa = (date: Date) => date.toLocaleDateString('fa-IR-u-nu-latn').replace(/-/g, '/');
    if (kind === 'today') {
      const value = toFa(today);
      setDateFrom(value);
      setDateTo(value);
    }
    if (kind === 'yesterday') {
      const date = new Date(today);
      date.setDate(date.getDate() - 1);
      const value = toFa(date);
      setDateFrom(value);
      setDateTo(value);
    }
    if (kind === 'week') {
      const date = new Date(today);
      date.setDate(date.getDate() - 7);
      setDateFrom(toFa(date));
      setDateTo(toFa(today));
    }
  };

  return (
    <div className="employee-requests-layout" dir="rtl" lang="fa">
      <aside className="employee-requests-filter">
        <strong>فیلترها</strong>
        <div className="employee-filter-block">
          <span>مرتب‌سازی</span>
          <AdaptiveChipGroup
            selected={sort}
            items={[
              { value: 'newest', label: 'جدیدترین درخواست‌ها' },
              { value: 'oldest', label: 'قدیمی‌ترین درخواست‌ها' },
            ]}
            onChange={(value) => setSort(value as 'newest' | 'oldest')}
          />
        </div>
        <div className="employee-filter-block">
          <span>کارمند</span>
          <div className="employee-filter-readonly">{fullName(employee)}</div>
        </div>
        <div className="employee-filter-block">
          <span>وضعیت</span>
          <AdaptiveChipGroup
            multi
            selected={statuses}
            items={(Object.keys(STATUS_LABELS) as EmployeeRequestStatus[]).map((status) => ({ value: status, label: STATUS_LABELS[status] }))}
            onChange={(value) => setStatuses(value as EmployeeRequestStatus[])}
          />
        </div>
        <div className="employee-filter-block">
          <span>سال</span>
          <AdaptiveChipGroup selected={year} items={YEARS.map((item) => ({ value: item, label: formatFaNumber(Number(item), { useGrouping: false }) }))} onChange={(value) => setYear(String(value))} />
        </div>
        <div className="employee-filter-block">
          <span>تاریخ</span>
          <input value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} placeholder="از تاریخ" />
          <input value={dateTo} onChange={(event) => setDateTo(event.target.value)} placeholder="تا تاریخ" />
          <div className="employee-filter-quick">
            <button type="button" onClick={() => setQuickDate('today')}>درخواست‌های امروز</button>
            <button type="button" onClick={() => setQuickDate('yesterday')}>درخواست‌های دیروز</button>
            <button type="button" onClick={() => setQuickDate('week')}>درخواست‌های هفته اخیر</button>
          </div>
        </div>
      </aside>

      <main className="employee-requests-main">
        <section className="employee-requests-hero">
          <EmployeeMiniHeader employee={employee} />
          <Link href={`/employees/${employee.id}`} className="employee-request-back-link">
            بازگشت به جزئیات کارمند
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </section>

        <div className="employee-request-tabs" role="tablist">
          {REQUEST_TABS.map((tab) => (
            <button key={tab.type} type="button" className={activeType === tab.type ? 'is-active' : ''} onClick={() => setActiveType(tab.type)}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeType === 'mission' ? (
          <section className="employee-request-placeholder">
            <strong>در حال توسعه</strong>
            <p>ثبت و مدیریت درخواست‌های ماموریت در نسخه‌های بعدی اضافه خواهد شد.</p>
          </section>
        ) : (
          <>
            <div className="employee-requests-toolbar">
              <div>
                <strong>{requestTitle(activeType)}</strong>
                <span>{formatFaNumber(currentRequests.length, { useGrouping: false })} درخواست</span>
              </div>
              <button type="button" className="module-page-add-btn" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                ثبت درخواست جدید
              </button>
            </div>

            <div className="employee-request-list">
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
                  <strong>درخواستی برای این تب ثبت نشده است.</strong>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {dialogMode && form ? (
        <RequestDialog
          mode={dialogMode}
          employee={employee}
          form={form}
          reasons={reasons}
          loans={loans}
          leaveBalance={leaveBalance}
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
