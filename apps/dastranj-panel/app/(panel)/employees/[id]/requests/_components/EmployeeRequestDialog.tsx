'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PersianDatePicker } from '@repo/ui';
import { AdaptiveChipGroup } from '../../../../../components/AdaptiveChipGroup';
import { AttachmentManager } from '../../../../../components/AttachmentManager';
import { PanelFormModal, PanelFormModalActions } from '../../../../../components/PanelFormModal';
import { formatFaNumber } from '../../../../../lib/format-fa';
import { formatPersianYmd, getPersianPartsFromDate, parsePersianYmd, persianToDate } from '../../../../../lib/calendar-dates';
import { normalizePersianDateInput } from '../../../../../lib/calendar-events';
import type {
  CompanyLoanItem,
  EmployeeRequestFormPayload,
  EmployeeRequestStatus,
  EmployeeRequestType,
  EmployeeRequestsEmployee,
  LeaveBalanceSummary,
  RequestReasonOption,
} from '../../../../../lib/employee-requests';

type EmployeeRequestTabKey =
  | 'leave'
  | 'overtime'
  | 'attendance'
  | 'remote_work'
  | 'mission'
  | 'salary_advance'
  | 'loan';

type LeaveRequestType = Extract<EmployeeRequestType, 'daily_leave' | 'hourly_leave' | 'reward_leave' | 'unpaid_leave' | 'sick_leave'>;

type RequestTab = {
  key: EmployeeRequestTabKey;
  label: string;
  requestTypes: EmployeeRequestType[];
  createType: EmployeeRequestType;
};

const LEAVE_REQUEST_TYPES: LeaveRequestType[] = ['daily_leave', 'hourly_leave', 'reward_leave', 'unpaid_leave', 'sick_leave'];

export const REQUEST_TABS: RequestTab[] = [
  { key: 'leave', label: 'مرخصی', requestTypes: LEAVE_REQUEST_TYPES, createType: 'daily_leave' },
  { key: 'overtime', label: 'اضافه کاری', requestTypes: ['overtime'], createType: 'overtime' },
  { key: 'attendance', label: 'حضور و غیاب', requestTypes: ['attendance'], createType: 'attendance' },
  { key: 'remote_work', label: 'دورکاری', requestTypes: ['remote_work'], createType: 'remote_work' },
  { key: 'mission', label: 'ماموریت', requestTypes: ['mission'], createType: 'mission' },
  { key: 'salary_advance', label: 'مساعده', requestTypes: ['salary_advance'], createType: 'salary_advance' },
  { key: 'loan', label: 'وام', requestTypes: ['loan'], createType: 'loan' },
];

const REQUEST_TYPE_OPTIONS: Array<{ value: EmployeeRequestType; label: string }> = [
  { value: 'daily_leave', label: 'مرخصی روزانه' },
  { value: 'hourly_leave', label: 'مرخصی ساعتی' },
  { value: 'reward_leave', label: 'مرخصی تشویقی' },
  { value: 'unpaid_leave', label: 'مرخصی بدون حقوق' },
  { value: 'sick_leave', label: 'مرخصی استعلاجی' },
];

const LEAVE_RANGE_OPTIONS: Array<{ value: NonNullable<EmployeeRequestFormPayload['rangeType']>; label: string }> = [
  { value: 'full_day', label: 'یک روز کامل' },
  { value: 'multi_day', label: 'چند روز متوالی' },
];

function isLeaveRequestType(type: EmployeeRequestType) {
  return LEAVE_REQUEST_TYPES.includes(type as LeaveRequestType);
}

export function requestTitle(type: EmployeeRequestType) {
  return (
    REQUEST_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    REQUEST_TABS.flatMap((tab) =>
      tab.requestTypes.map((requestType) => ({ requestType, label: tab.label })),
    ).find((item) => item.requestType === type)?.label ??
    type
  );
}

function requestTabLabel(tabKey: EmployeeRequestTabKey) {
  return REQUEST_TABS.find((tab) => tab.key === tabKey)?.label ?? tabKey;
}

export function createInitialEmployeeRequestForm(tabKey: EmployeeRequestTabKey, employeeId: string): EmployeeRequestFormPayload {
  const requestType = REQUEST_TABS.find((tab) => tab.key === tabKey)?.createType ?? 'daily_leave';
  return {
    employeeId,
    requestType,
    status: 'pending',
    submissionMode: 'pending',
    rangeType: requestType === 'hourly_leave' ? 'hourly' : isLeaveRequestType(requestType) ? 'full_day' : requestType === 'attendance' ? 'point' : 'range',
    attendanceActionType: null,
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

export function normalizeRequestFormForType(form: EmployeeRequestFormPayload, nextType: EmployeeRequestType): EmployeeRequestFormPayload {
  if (nextType === form.requestType) return form;

  if (isLeaveRequestType(nextType)) {
    const rangeType: EmployeeRequestFormPayload['rangeType'] =
      nextType === 'hourly_leave' ? 'hourly' : form.rangeType === 'multi_day' ? 'multi_day' : 'full_day';
    return {
      ...form,
      requestType: nextType,
      rangeType,
      attendanceActionType: null,
      amount: null,
      loanId: null,
      installments: null,
      dateTime: '',
      endDate: nextType === 'hourly_leave' ? '' : rangeType === 'multi_day' ? form.endDate ?? '' : '',
      startTime: nextType === 'hourly_leave' ? form.startTime ?? '' : '',
      endTime: nextType === 'hourly_leave' ? form.endTime ?? '' : '',
    };
  }

  if (nextType === 'attendance') {
    return {
      ...form,
      requestType: nextType,
      rangeType: 'point',
      attendanceActionType: null,
      amount: null,
      loanId: null,
      installments: null,
      dateTime: '',
    };
  }

  if (nextType === 'salary_advance') {
    return {
      ...form,
      requestType: nextType,
      rangeType: null,
      attendanceActionType: null,
      loanId: null,
      installments: null,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      dateTime: '',
    };
  }

  if (nextType === 'loan') {
    return {
      ...form,
      requestType: nextType,
      rangeType: null,
      attendanceActionType: null,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      dateTime: '',
    };
  }

  return {
    ...form,
    requestType: nextType,
    rangeType: nextType === 'overtime' || nextType === 'remote_work' ? 'range' : form.rangeType,
    attendanceActionType: null,
    amount: null,
    loanId: null,
    installments: null,
  };
}

function isoDateToPickerValue(value?: string | null) {
  const trimmed = value?.trim().slice(0, 10) ?? '';
  if (!trimmed) return '';
  const parsed = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return '';
  return formatPersianYmd(getPersianPartsFromDate(parsed));
}

function pickerValueToIsoDate(value: string) {
  const parts = parsePersianYmd(normalizePersianDateInput(value));
  if (!parts) return '';
  try {
    return persianToDate(parts).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function durationLabel(minutes?: number | null, emptyLabel = 'ثبت نشده در قرارداد') {
  if (minutes == null || !Number.isFinite(minutes)) return emptyLabel;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${formatFaNumber(hours, { useGrouping: false })} ساعت${mins ? ` و ${formatFaNumber(mins, { useGrouping: false })} دقیقه` : ''}`;
}

function EmployeeMiniHeader({ employee }: { employee: EmployeeRequestsEmployee }) {
  return (
    <div className="employee-request-person">
      <div className="employee-request-avatar">
        {employee.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={employee.avatarUrl} alt="" />
        ) : (
          <span>{employee.firstName?.[0] ?? 'ک'}</span>
        )}
      </div>
      <div>
        <strong>{`${employee.firstName} ${employee.lastName}`.trim() || 'کارمند بدون نام'}</strong>
        <span>{employee.jobTitle || employee.organizationUnitTitle || employee.workGroupTitle || 'عنوان شغلی ثبت نشده'}</span>
      </div>
      <b className={employee.hasActiveContract ? 'is-approved' : 'is-muted'}>
        {employee.hasActiveContract ? 'دارای قرارداد فعال' : 'فاقد قرارداد'}
      </b>
    </div>
  );
}

function RequestDateField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="contract-timing-date-field">
      <span className="contract-timing-date-label">{label}</span>
      <div className="contract-timing-date-input">
        <PersianDatePicker
          value={isoDateToPickerValue(value)}
          onChange={disabled ? () => undefined : (next) => onChange(pickerValueToIsoDate(next))}
          placeholder="1404/01/01"
          className="contract-timing-date-picker-control"
          containerClassName={`contract-timing-date-picker${disabled ? ' pointer-events-none opacity-60' : ''}`}
          calendarIconAriaLabel={`باز کردن تقویم ${label}`}
        />
      </div>
    </div>
  );
}

function RequestTimeField({
  label,
  value,
  disabled,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="business-payroll-field">
      <span className="business-payroll-field-label">{label}</span>
      <input
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? '08:30'}
        dir="ltr"
      />
    </label>
  );
}

function RequestTypeField({
  value,
  disabled,
  onChange,
}: {
  value: EmployeeRequestType;
  disabled?: boolean;
  onChange: (value: EmployeeRequestType) => void;
}) {
  return (
    <section className="employee-request-dialog-section">
      <div className="employee-request-section-title">نوع مرخصی</div>
      <AdaptiveChipGroup
        className="employee-request-chip-grid"
        selected={value}
        items={REQUEST_TYPE_OPTIONS.map((option) => ({ ...option, disabled }))}
        onChange={(next) => onChange(next as EmployeeRequestType)}
      />
    </section>
  );
}

function LeaveRangeField({
  value,
  requestType,
  disabled,
  onChange,
}: {
  value: EmployeeRequestFormPayload['rangeType'];
  requestType: EmployeeRequestType;
  disabled?: boolean;
  onChange: (value: EmployeeRequestFormPayload['rangeType']) => void;
}) {
  if (!isLeaveRequestType(requestType)) return null;

  if (requestType === 'hourly_leave') {
    return (
      <section className="employee-request-dialog-section">
        <div className="employee-request-section-title">نوع بازه مرخصی</div>
        <div className="employee-request-tooltip">مرخصی ساعتی به صورت پیش‌فرض چند ساعت از یک روز ثبت می‌شود و قابل تغییر نیست.</div>
      </section>
    );
  }

  return (
    <section className="employee-request-dialog-section">
      <div className="employee-request-section-title">نوع بازه مرخصی</div>
      <AdaptiveChipGroup
        className="employee-request-chip-grid"
        selected={value ?? 'full_day'}
        items={LEAVE_RANGE_OPTIONS.map((option) => ({ ...option, disabled }))}
        onChange={(next) => onChange(next as EmployeeRequestFormPayload['rangeType'])}
      />
    </section>
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
          { value: 'approved', label: 'ثبت نهایی / تایید شده', disabled },
          { value: 'pending', label: 'ثبت در انتظار تایید', disabled },
        ]}
        onChange={(next) => onChange(next as 'approved' | 'pending')}
      />
    </section>
  );
}

function normalizeRangeForSubmission(form: EmployeeRequestFormPayload) {
  if (!isLeaveRequestType(form.requestType)) return form;

  if (form.requestType === 'hourly_leave') {
    return {
      ...form,
      rangeType: 'hourly',
      endDate: '',
    };
  }

  return {
    ...form,
    rangeType: form.rangeType === 'multi_day' ? 'multi_day' : 'full_day',
    startTime: '',
    endTime: '',
    endDate: form.rangeType === 'multi_day' ? form.endDate ?? '' : '',
  };
}

export function EmployeeRequestDialog({
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
  const isLeave = isLeaveRequestType(form.requestType);

  const submit = () => {
    if (readonly) return onClose();
    if (form.requestType !== 'mission' && !form.reasonId) return setError('علت درخواست الزامی است.');
    if (isLeave && form.requestType === 'hourly_leave' && (!form.startDate || !form.startTime || !form.endTime)) return setError('تاریخ، ساعت شروع و پایان الزامی است.');
    if (isLeave && form.requestType !== 'hourly_leave' && !form.startDate) return setError('تاریخ مرخصی الزامی است.');
    if (isLeave && form.rangeType === 'multi_day' && !form.endDate) return setError('تاریخ پایان مرخصی الزامی است.');
    if (isLeave && form.rangeType === 'multi_day' && form.endDate && form.startDate && form.endDate < form.startDate) return setError('تاریخ پایان نباید قبل از تاریخ شروع باشد.');
    if (isLeave && form.requestType === 'hourly_leave' && form.startTime && form.endTime && form.endTime <= form.startTime) return setError('ساعت پایان باید بعد از ساعت شروع باشد.');
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

  const updateForm = (next: EmployeeRequestFormPayload) => {
    if (next.requestType !== form.requestType) {
      const normalized = normalizeRequestFormForType(next, next.requestType);
      const nextReasonId = reasons.some((reason) => reason.id === normalized.reasonId && reason.category === next.requestType)
        ? normalized.reasonId
        : null;
      onChange({ ...normalized, reasonId: nextReasonId });
      return;
    }
    onChange(next);
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
          submitLabel={readonly ? 'بستن' : 'ثبت'}
          cancelLabel={readonly ? 'بازگشت' : 'انصراف'}
          saving={saving}
          savingLabel="در حال ثبت..."
          onSubmit={submit}
          onCancel={onClose}
        />
      }
    >
      <div className="employee-request-dialog">
        <EmployeeMiniHeader employee={employee} />

        {isLeave ? (
          employee.hasActiveContract ? (
            <div className="employee-request-balance">
              <span>مرخصی سالانه (قرارداد فعال): <strong>{durationLabel(leaveBalance.annualMinutes)}</strong></span>
              <span>مرخصی باقی‌مانده: <strong>{durationLabel(leaveBalance.remainingMinutes)}</strong></span>
            </div>
          ) : (
            <div className="employee-request-balance is-empty">
              <span>مرخصی سالانه: <strong>فاقد قرارداد</strong></span>
              <span>مرخصی باقی‌مانده: <strong>فاقد قرارداد</strong></span>
            </div>
          )
        ) : null}

        {isLeave ? (
          <RequestTypeField
            value={form.requestType}
            disabled={readonly}
            onChange={(nextType) => updateForm(normalizeRequestFormForType(form, nextType))}
          />
        ) : null}

        {isLeave ? (
          <LeaveRangeField
            value={form.rangeType}
            requestType={form.requestType}
            disabled={readonly}
            onChange={(nextRange) => onChange({ ...form, rangeType: nextRange as EmployeeRequestFormPayload['rangeType'] })}
          />
        ) : null}

        <div className="employee-request-form-grid">
          {form.requestType === 'attendance' ? (
            <>
              <p className="employee-request-tooltip" style={{ gridColumn: '1 / -1' }}>
                سیستم بر اساس ترتیب ثبت، ترددهای متوالی را به‌صورت خودکار به «تردد کامل» زوج می‌کند.
              </p>
              <RequestDateField
                label="تاریخ"
                value={form.startDate ?? ''}
                disabled={readonly}
                onChange={(value) => onChange({ ...form, startDate: value, dateTime: `${value} ${form.startTime ?? ''}`.trim() })}
              />
              <RequestTimeField
                label="ساعت"
                value={form.startTime ?? ''}
                disabled={readonly}
                onChange={(value) => onChange({ ...form, startTime: value, dateTime: `${form.startDate ?? ''} ${value}`.trim() })}
                placeholder="08:30"
              />
            </>
          ) : null}

          {isLeave ? (
            <>
              <RequestDateField
                label={form.rangeType === 'multi_day' ? 'تاریخ شروع' : 'تاریخ'}
                value={form.startDate ?? ''}
                disabled={readonly}
                onChange={(value) => onChange({ ...form, startDate: value })}
              />
              {form.rangeType === 'multi_day' ? (
                <RequestDateField
                  label="تاریخ پایان"
                  value={form.endDate ?? ''}
                  disabled={readonly}
                  onChange={(value) => onChange({ ...form, endDate: value })}
                />
              ) : null}
              {form.requestType === 'hourly_leave' ? (
                <>
                  <RequestTimeField
                    label="ساعت شروع"
                    value={form.startTime ?? ''}
                    disabled={readonly}
                    onChange={(value) => onChange({ ...form, startTime: value })}
                    placeholder="08:00"
                  />
                  <RequestTimeField
                    label="ساعت پایان"
                    value={form.endTime ?? ''}
                    disabled={readonly}
                    onChange={(value) => onChange({ ...form, endTime: value })}
                    placeholder="12:00"
                  />
                </>
              ) : null}
            </>
          ) : null}

          {['overtime', 'remote_work'].includes(form.requestType) ? (
            <>
              <RequestDateField
                label="تاریخ شروع"
                value={form.startDate ?? ''}
                disabled={readonly}
                onChange={(value) => onChange({ ...form, startDate: value })}
              />
              <RequestTimeField
                label="ساعت شروع"
                value={form.startTime ?? ''}
                disabled={readonly}
                onChange={(value) => onChange({ ...form, startTime: value })}
                placeholder="17:00"
              />
              <RequestDateField
                label="تاریخ پایان"
                value={form.endDate ?? ''}
                disabled={readonly}
                onChange={(value) => onChange({ ...form, endDate: value })}
              />
              <RequestTimeField
                label="ساعت پایان"
                value={form.endTime ?? ''}
                disabled={readonly}
                onChange={(value) => onChange({ ...form, endTime: value })}
                placeholder="20:00"
              />
            </>
          ) : null}

          {form.requestType === 'salary_advance' ? (
            <label className="business-payroll-field">
              <span className="business-payroll-field-label">مبلغ</span>
              <input disabled={readonly} value={form.amount ? String(form.amount) : ''} onChange={(event) => onChange({ ...form, amount: Number(event.target.value) })} />
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
                  <input disabled={readonly} value={form.amount ? String(form.amount) : ''} onChange={(event) => onChange({ ...form, amount: Number(event.target.value) })} />
                </label>
                <label className="business-payroll-field">
                  <span className="business-payroll-field-label">تعداد اقساط</span>
                  <input disabled={readonly} value={form.installments ? String(form.installments) : ''} onChange={(event) => onChange({ ...form, installments: Math.floor(Number(event.target.value)) })} />
                </label>
                {selectedLoan ? (
                  <div className="employee-request-loan-summary">
                    <span>حداقل مبلغ: {formatFaNumber(selectedLoan.minAmount)} ریال</span>
                    <span>حداکثر مبلغ: {formatFaNumber(selectedLoan.maxAmount)} ریال</span>
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
