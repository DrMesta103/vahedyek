'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { PersianDatePicker } from '@repo/ui';
import { TaavChoiceChipGroup } from '@repo/ui/taav/forms';
import { AttachmentManager } from '../../../../../components/AttachmentManager';
import { PanelFormModal, PanelFormModalActions } from '../../../../../components/PanelFormModal';
import { formatFaNumber } from '../../../../../lib/format-fa';
import { formatPersianYmd, getPersianPartsFromDate, parsePersianYmd, persianToDate } from '../../../../../lib/calendar-dates';
import { normalizePersianDateInput } from '../../../../../lib/calendar-events';
import {
  LEAVE_MODE_LABELS,
  LEAVE_TYPE_DESCRIPTIONS,
  LEAVE_TYPE_LABELS,
  LEAVE_TYPE_MODE_TOOLTIPS,
  mapLeaveSelectionToRequestType,
  mapRequestTypeToLeaveIdentity,
  type LeaveModeKey,
  type LeaveTypeKey,
} from '../../../../../lib/leave-policy';
import { previewEmployeeRequestAction } from '../../../../../lib/employee-request-actions';
import type {
  CompanyLoanItem,
  EmployeeLeaveRequestContext,
  EmployeeRemoteWorkRequestContext,
  EmployeeRequestFormPayload,
  EmployeeRequestPreview,
  EmployeeRequestType,
  EmployeeRequestsEmployee,
  LeaveBalanceSummary,
  RequestReasonOption,
} from '../../../../../lib/employee-requests';
import {
  mapRangeTypeToRemoteWorkMode,
  mapRemoteWorkModeToRangeType,
  REMOTE_WORK_MODE_LABELS,
  remotePolicyAllowsMode,
  type RemoteWorkModeKey,
} from '../../../../../lib/remote-work-policy';
import { formatMinutesLabel } from '../../../../../lib/attendance-format';

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

const LEAVE_TYPE_OPTIONS: Array<{ value: LeaveTypeKey; label: string }> = [
  { value: 'entitlement', label: LEAVE_TYPE_LABELS.entitlement },
  { value: 'sick', label: LEAVE_TYPE_LABELS.sick },
  { value: 'unpaid', label: LEAVE_TYPE_LABELS.unpaid },
  { value: 'bonus', label: LEAVE_TYPE_LABELS.bonus },
];

const LEAVE_MODE_OPTIONS: Array<{ value: LeaveModeKey; label: string }> = [
  { value: 'daily', label: LEAVE_MODE_LABELS.daily },
  { value: 'hourly', label: LEAVE_MODE_LABELS.hourly },
];

const LEAVE_RANGE_OPTIONS: Array<{ value: NonNullable<EmployeeRequestFormPayload['rangeType']>; label: string }> = [
  { value: 'full_day', label: 'یک روز کامل' },
  { value: 'multi_day', label: 'چند روز متوالی' },
];

const REMOTE_MODE_OPTIONS: Array<{ value: RemoteWorkModeKey; label: string }> = [
  { value: 'daily', label: REMOTE_WORK_MODE_LABELS.daily },
  { value: 'hourly', label: REMOTE_WORK_MODE_LABELS.hourly },
  { value: 'multi_day', label: REMOTE_WORK_MODE_LABELS.multi_day },
];

function isLeaveRequestType(type: EmployeeRequestType) {
  return LEAVE_REQUEST_TYPES.includes(type as LeaveRequestType);
}

export function requestTitle(type: EmployeeRequestType) {
  return REQUEST_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? REQUEST_TABS.find((tab) => tab.requestTypes.includes(type))?.label ?? type;
}

export function createInitialEmployeeRequestForm(tabKey: EmployeeRequestTabKey, employeeId: string): EmployeeRequestFormPayload {
  const requestType = REQUEST_TABS.find((tab) => tab.key === tabKey)?.createType ?? 'daily_leave';
  return {
    employeeId,
    requestType,
    status: 'pending',
    submissionMode: 'pending',
    rangeType: requestType === 'hourly_leave' ? 'hourly' : isLeaveRequestType(requestType) ? 'full_day' : requestType === 'attendance' ? 'point' : requestType === 'remote_work' ? 'full_day' : 'range',
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
    return {
      ...form,
      requestType: nextType,
      rangeType: nextType === 'hourly_leave' ? 'hourly' : form.rangeType === 'multi_day' ? 'multi_day' : 'full_day',
      attendanceActionType: null,
      amount: null,
      loanId: null,
      installments: null,
      dateTime: '',
      endDate: nextType === 'hourly_leave' ? '' : form.rangeType === 'multi_day' ? form.endDate ?? '' : '',
      startTime: nextType === 'hourly_leave' ? form.startTime ?? '' : '',
      endTime: nextType === 'hourly_leave' ? form.endTime ?? '' : '',
    };
  }

  if (nextType === 'attendance') {
    return { ...form, requestType: nextType, rangeType: 'point', attendanceActionType: null, amount: null, loanId: null, installments: null, dateTime: '' };
  }

  if (nextType === 'salary_advance' || nextType === 'loan') {
    return { ...form, requestType: nextType, rangeType: null, attendanceActionType: null, startDate: '', endDate: '', startTime: '', endTime: '', dateTime: '' };
  }

  if (nextType === 'remote_work') {
    return {
      ...form,
      requestType: nextType,
      rangeType: 'full_day',
      attendanceActionType: null,
      amount: null,
      loanId: null,
      installments: null,
      endDate: '',
      startTime: '',
      endTime: '',
    };
  }

  return { ...form, requestType: nextType, rangeType: nextType === 'overtime' ? 'range' : form.rangeType, attendanceActionType: null, amount: null, loanId: null, installments: null };
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

function durationLabel(minutes?: number | null, emptyLabel = 'در انتظار محاسبه') {
  if (minutes == null || !Number.isFinite(minutes)) return emptyLabel;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${formatFaNumber(hours, { useGrouping: false })} ساعت${mins ? ` و ${formatFaNumber(mins, { useGrouping: false })} دقیقه` : ''}`;
}

function timeToMinutes(value?: string | null) {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

function normalizeRemoteWorkForSubmission(form: EmployeeRequestFormPayload) {
  if (form.requestType !== 'remote_work') return form;
  const mode = mapRangeTypeToRemoteWorkMode(form.rangeType);
  if (mode === 'daily') {
    return { ...form, rangeType: 'full_day' as const, endDate: form.startDate ?? '', startTime: '', endTime: '' };
  }
  if (mode === 'hourly') {
    return { ...form, rangeType: 'hourly' as const, endDate: form.startDate ?? '' };
  }
  return { ...form, rangeType: 'multi_day' as const, startTime: '', endTime: '' };
}

function shouldPreviewRequest(form: EmployeeRequestFormPayload) {
  if (form.requestType === 'loan' || form.requestType === 'salary_advance') return true;
  if (form.requestType === 'attendance') return Boolean(form.startDate && form.startTime);
  if (form.requestType === 'remote_work') {
    const mode = mapRangeTypeToRemoteWorkMode(form.rangeType);
    if (mode === 'daily') return Boolean(form.startDate);
    if (mode === 'hourly') return Boolean(form.startDate && form.startTime && form.endTime);
    if (mode === 'multi_day') return Boolean(form.startDate && form.endDate);
    return false;
  }
  return Boolean(form.startDate) || Boolean(form.dateTime);
}

function normalizeRangeForSubmission(form: EmployeeRequestFormPayload) {
  if (!isLeaveRequestType(form.requestType)) return form;
  if (form.rangeType === 'hourly') return { ...form, rangeType: 'hourly' as const, endDate: '' };
  const rangeType: NonNullable<EmployeeRequestFormPayload['rangeType']> = form.rangeType === 'multi_day' ? 'multi_day' : 'full_day';
  return {
    ...form,
    rangeType,
    startTime: '',
    endTime: '',
    endDate: form.rangeType === 'multi_day' ? form.endDate ?? '' : '',
  };
}

function PreviewWarnings({ preview, previewError }: { preview: EmployeeRequestPreview | null; previewError: string }) {
  const blockingErrors = preview?.blockingErrors ?? [];
  return (
    <>
      {previewError ? <div className="business-payroll-warning">{previewError}</div> : null}
      {blockingErrors.map((item) => <div key={item} className="business-payroll-warning">{item}</div>)}
    </>
  );
}

function AttendancePreviewCard({ preview }: { preview: EmployeeRequestPreview }) {
  const attendance = preview.attendance;
  if (!attendance) return null;

  const renderSegmentAnalyses = (analysis: typeof attendance.before) => {
    if (!analysis.segmentAnalyses?.length) return null;
    return analysis.segmentAnalyses.map((segment) => (
      <div key={segment.segmentId} className="employee-request-balance split-shift-preview-segment">
        <span>{segment.label} ({segment.windowLabel})</span>
        <span>وضعیت: <strong>{segment.status}</strong></span>
        <span>ترددها: <strong>{segment.timestamps.length ? segment.timestamps.join('، ') : '—'}</strong></span>
        {segment.delayMinutes > 0 ? <span>تأخیر: <strong>{formatMinutesLabel(segment.delayMinutes)}</strong></span> : null}
        {segment.earlyLeaveMinutes > 0 ? <span>تعجیل: <strong>{formatMinutesLabel(segment.earlyLeaveMinutes)}</strong></span> : null}
        {segment.incomplete ? <span>ناقص: <strong>بله</strong></span> : null}
      </div>
    ));
  };

  const renderAnalysis = (label: string, analysis: typeof attendance.before) => (
    <div className="employee-request-balance">
      <span>{label}</span>
      <span>وضعیت: <strong>{analysis.status}</strong></span>
      <span>ترددها: <strong>{analysis.timestamps.length ? analysis.timestamps.map((item) => item.timeLabel).join('، ') : '—'}</strong></span>
      <span>حضور محاسبه‌شده: <strong>{formatMinutesLabel(analysis.workedMinutes)}</strong></span>
      {analysis.delayMinutes > 0 ? <span>تأخیر: <strong>{formatMinutesLabel(analysis.delayMinutes)}</strong></span> : null}
      {analysis.earlyLeaveMinutes > 0 ? <span>تعجیل: <strong>{formatMinutesLabel(analysis.earlyLeaveMinutes)}</strong></span> : null}
      {analysis.overtimeMinutes > 0 ? <span>اضافه‌کاری: <strong>{formatMinutesLabel(analysis.overtimeMinutes)}</strong></span> : null}
      {analysis.nightWorkMinutes > 0 ? <span>شب‌کاری: <strong>{formatMinutesLabel(analysis.nightWorkMinutes)}</strong></span> : null}
      {analysis.incompleteSegmentLabels.length ? <span>بخش ناقص: <strong>{analysis.incompleteSegmentLabels.join('، ')}</strong></span> : null}
      {analysis.unassignedTimestampLabels?.length ? (
        <span>خارج از بازه: <strong>{analysis.unassignedTimestampLabels.join('، ')}</strong></span>
      ) : null}
      {renderSegmentAnalyses(analysis)}
    </div>
  );

  return (
    <section className="employee-request-dialog-section">
      <div className="employee-request-section-title">پیش‌نمایش تردد</div>
      <div className="employee-request-balance">
        <span>نوع شیفت: <strong>{attendance.bases.shiftTypeLabel ?? 'نامشخص'}</strong></span>
        <span>بازه شیفت: <strong>{attendance.bases.shiftWindowLabel ?? 'نامشخص'}</strong></span>
        <span>شب‌کاری (سیاست): <strong>{attendance.bases.nightPolicyEnabled ? 'فعال' : 'غیرفعال'}</strong></span>
        {attendance.bases.tenantNightWorkStart && attendance.bases.tenantNightWorkEnd ? (
          <span>بازه شب (سیاست کاری): <strong>{attendance.bases.tenantNightWorkStart} تا {attendance.bases.tenantNightWorkEnd}</strong></span>
        ) : null}
        {attendance.proposedTimestamp ? <span>تردد پیشنهادی: <strong>{attendance.proposedTimestamp}</strong></span> : null}
        {attendance.proposedSegmentLabel ? <span>بخش مرتبط: <strong>{attendance.proposedSegmentLabel}</strong></span> : null}
        {attendance.proposedOutsideSegments ? (
          <span className="is-warning">این تردد خارج از بازه‌های تعریف‌شده شیفت دوتکه است.</span>
        ) : null}
      </div>
      {renderAnalysis('قبل از ثبت', attendance.before)}
      {renderAnalysis('پس از ثبت', attendance.after)}
      {attendance.outcomeMessages.length ? (
        <div className="employee-request-tooltip">{attendance.outcomeMessages.join(' · ')}</div>
      ) : null}
    </section>
  );
}

function RemotePreviewCard({ preview }: { preview: EmployeeRequestPreview }) {
  const remote = preview.remoteWork;
  if (!remote) return null;

  return (
    <section className="employee-request-dialog-section">
      <div className="employee-request-section-title">پیش‌نمایش دورکاری</div>
      <div className="employee-request-balance">
        <span>قرارداد مبنا: <strong>{remote.bases.activeContractLabel ?? 'یافت نشد'}</strong></span>
        <span>گروه کاری: <strong>{remote.bases.workGroupTitle ?? 'یافت نشد'}</strong></span>
        <span>سیاست کاری: <strong>{remote.bases.workPolicyTitle ?? 'یافت نشد'}</strong></span>
        <span>نوع شیفت: <strong>{remote.bases.shiftTypeLabel ?? 'نامشخص'}</strong></span>
        <span>بازه شیفت: <strong>{remote.bases.shiftWindowLabel ?? 'نامشخص'}</strong></span>
        {remote.bases.calendarTitle ? <span>تقویم: <strong>{remote.bases.calendarTitle}</strong></span> : null}
        {remote.bases.workingDayLabel ? <span>روز کاری: <strong>{remote.bases.workingDayLabel}</strong></span> : null}
      </div>
      <div className="employee-request-balance">
        <span>مدت درخواست: <strong>{durationLabel(remote.requestedDurationMinutes)}</strong></span>
        <span>اثر حضور: <strong>{remote.attendanceEffectLabel}</strong></span>
        <span>اثر پرداخت: <strong>{remote.paymentEffectLabel}</strong></span>
        <span>جلوگیری از غیبت: <strong>{remote.preventsAbsence ? 'بله' : 'خیر'}</strong></span>
        <span>نیاز به تردد: <strong>{remote.requiresPunch ? 'بله' : 'خیر'}</strong></span>
        <span>معادل کارکرد: <strong>{remote.countsAsWork ? 'بله' : 'خیر'}</strong></span>
        {remote.payableMinutes != null ? <span>دقیقه قابل پرداخت: <strong>{durationLabel(remote.payableMinutes, '۰')}</strong></span> : null}
        {remote.monthlyLimitLabel ? <span>سقف ماهانه: <strong>{remote.monthlyLimitLabel}</strong></span> : null}
        {remote.monthlyUsedLabel ? <span>مصرف‌شده: <strong>{remote.monthlyUsedLabel}</strong></span> : null}
        {remote.monthlyRemainingLabel ? <span>باقی‌مانده: <strong>{remote.monthlyRemainingLabel}</strong></span> : null}
      </div>
      {remote.outcomeMessages.length ? (
        <div className="employee-request-tooltip">{remote.outcomeMessages.join(' · ')}</div>
      ) : null}
    </section>
  );
}

function RemoteWorkModeField({
  form,
  remoteWorkRequestContext,
  disabled,
  onChange,
}: {
  form: EmployeeRequestFormPayload;
  remoteWorkRequestContext: EmployeeRemoteWorkRequestContext;
  disabled?: boolean;
  onChange: (mode: RemoteWorkModeKey) => void;
}) {
  const currentMode = mapRangeTypeToRemoteWorkMode(form.rangeType) ?? 'daily';
  const options = REMOTE_MODE_OPTIONS.filter((option) => remotePolicyAllowsMode(remoteWorkRequestContext.remotePolicy, option.value));

  return (
    <section className="employee-request-dialog-section">
      <div className="employee-request-section-title">نوع دورکاری مجاز</div>
      <TaavChoiceChipGroup
        ariaLabel="نوع دورکاری مجاز"
        options={options.map((option) => ({ value: option.value, label: option.label, disabled }))}
        value={currentMode}
        onValueChange={(next) => onChange((Array.isArray(next) ? next[0] : next) as RemoteWorkModeKey)}
        tone="brand"
        size="md"
      />
    </section>
  );
}

function RemoteWorkRangeField({
  form,
  disabled,
  onChange,
}: {
  form: EmployeeRequestFormPayload;
  disabled?: boolean;
  onChange: (next: EmployeeRequestFormPayload) => void;
}) {
  const mode = mapRangeTypeToRemoteWorkMode(form.rangeType) ?? 'daily';

  return (
    <>
      <RequestDateField
        label={mode === 'multi_day' ? 'تاریخ شروع' : 'تاریخ'}
        value={form.startDate ?? ''}
        disabled={disabled}
        onChange={(value) => onChange({ ...form, startDate: value, endDate: mode === 'daily' ? value : form.endDate })}
      />
      {mode === 'multi_day' ? (
        <RequestDateField label="تاریخ پایان" value={form.endDate ?? ''} disabled={disabled} onChange={(value) => onChange({ ...form, endDate: value })} />
      ) : null}
      {mode === 'hourly' ? (
        <>
          <RequestTimeField label="ساعت شروع" value={form.startTime ?? ''} disabled={disabled} onChange={(value) => onChange({ ...form, startTime: value })} placeholder="08:00" />
          <RequestTimeField label="ساعت پایان" value={form.endTime ?? ''} disabled={disabled} onChange={(value) => onChange({ ...form, endTime: value })} placeholder="12:00" />
        </>
      ) : null}
    </>
  );
}

function OvertimePreviewCard({ preview }: { preview: EmployeeRequestPreview }) {
  if (!preview.overtime) return null;
  return (
    <section className="employee-request-dialog-section">
      <div className="employee-request-section-title">پیش‌نمایش اضافه‌کاری</div>
      <div className="employee-request-balance">
        <span>مدت درخواست‌شده: <strong>{durationLabel(preview.overtime.requestedMinutes)}</strong></span>
        <span>مدت قابل محاسبه: <strong>{durationLabel(preview.overtime.validMinutes)}</strong></span>
        <span>بخش قبل از شیفت: <strong>{durationLabel(preview.overtime.beforeShiftMinutes, 'ندارد')}</strong></span>
        <span>بخش بعد از شیفت: <strong>{durationLabel(preview.overtime.afterShiftMinutes, 'ندارد')}</strong></span>
        <span>بخش غیرمجاز: <strong>{durationLabel(preview.overtime.invalidMinutes, 'ندارد')}</strong></span>
        <span>ضریب اضافه‌کاری: <strong>{preview.overtime.coefficient != null ? formatFaNumber(preview.overtime.coefficient) : 'نامشخص'}</strong></span>
        <span>سقف روزانه: <strong>{durationLabel(preview.overtime.dailyLimitMinutes, 'نامشخص')}</strong></span>
      </div>
    </section>
  );
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

function RequestDateField({ label, value, disabled, onChange }: { label: string; value: string; disabled?: boolean; onChange: (value: string) => void }) {
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

function RequestTimeField({ label, value, disabled, onChange, placeholder }: { label: string; value: string; disabled?: boolean; placeholder?: string; onChange: (value: string) => void }) {
  return (
    <label className="business-payroll-field">
      <span className="business-payroll-field-label">{label}</span>
      <input disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder ?? '08:30'} dir="ltr" />
    </label>
  );
}

function LeaveSelectionField({
  form,
  leaveRequestContext,
  disabled,
  onChange,
}: {
  form: EmployeeRequestFormPayload;
  leaveRequestContext: EmployeeLeaveRequestContext;
  disabled?: boolean;
  onChange: (next: EmployeeRequestFormPayload) => void;
}) {
  const identity = mapRequestTypeToLeaveIdentity(form.requestType, form.rangeType);
  const leaveType = identity?.leaveType ?? 'entitlement';
  const mode = identity?.leaveMode ?? 'daily';
  const rule = leaveRequestContext.leaveRules[leaveType];
  const selectedMode: LeaveModeKey = mode === 'hourly' ? 'hourly' : 'daily';

  return (
    <section className="employee-request-dialog-section">
      <div className="employee-request-section-title">نوع مرخصی</div>
      <TaavChoiceChipGroup
        ariaLabel="نوع مرخصی"
        options={LEAVE_TYPE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          disabled: disabled || !leaveRequestContext.leaveRules[option.value].enabled,
        }))}
        value={leaveType}
        onValueChange={(next) => {
          const nextLeaveType = (Array.isArray(next) ? next[0] : next) as LeaveTypeKey;
          const nextRequestType = mapLeaveSelectionToRequestType(nextLeaveType, selectedMode) as EmployeeRequestType;
          const nextForm = normalizeRequestFormForType(form, nextRequestType);
          onChange({
            ...nextForm,
            rangeType: selectedMode === 'hourly' ? 'hourly' : form.rangeType === 'multi_day' ? 'multi_day' : 'full_day',
            endDate: selectedMode === 'hourly' ? '' : form.rangeType === 'multi_day' ? nextForm.endDate ?? '' : '',
          });
        }}
        tone="brand"
        size="md"
      />
      <div className="employee-request-tooltip">{LEAVE_TYPE_DESCRIPTIONS[leaveType]}</div>

      <div className="employee-request-section-title">نوع درخواست</div>
      <TaavChoiceChipGroup
        ariaLabel="نوع درخواست"
        options={LEAVE_MODE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          disabled: disabled || (option.value === 'daily' ? !rule.requestModes.daily : !rule.requestModes.hourly),
        }))}
        value={selectedMode}
        onValueChange={(next) => {
          const nextMode = (Array.isArray(next) ? next[0] : next) as LeaveModeKey;
          const nextRequestType = mapLeaveSelectionToRequestType(leaveType, nextMode) as EmployeeRequestType;
          const nextForm = normalizeRequestFormForType(form, nextRequestType);
          onChange({
            ...nextForm,
            rangeType: nextMode === 'hourly' ? 'hourly' : form.rangeType === 'multi_day' ? 'multi_day' : 'full_day',
            endDate: nextMode === 'hourly' ? '' : form.rangeType === 'multi_day' ? nextForm.endDate ?? '' : '',
          });
        }}
        tone="brand"
        size="md"
      />
      <div className="employee-request-tooltip">{LEAVE_TYPE_MODE_TOOLTIPS[leaveType][selectedMode]}</div>
    </section>
  );
}

function LeaveRangeField({
  form,
  leaveRequestContext,
  disabled,
  onChange,
}: {
  form: EmployeeRequestFormPayload;
  leaveRequestContext: EmployeeLeaveRequestContext;
  disabled?: boolean;
  onChange: (next: EmployeeRequestFormPayload['rangeType']) => void;
}) {
  if (!isLeaveRequestType(form.requestType)) return null;
  const identity = mapRequestTypeToLeaveIdentity(form.requestType, form.rangeType);
  const leaveType = identity?.leaveType ?? 'entitlement';
  const rule = leaveRequestContext.leaveRules[leaveType];

  if (form.rangeType === 'hourly') {
    return (
      <section className="employee-request-dialog-section">
        <div className="employee-request-section-title">نوع بازه مرخصی</div>
        <div className="employee-request-tooltip">{LEAVE_TYPE_MODE_TOOLTIPS[leaveType].hourly}</div>
      </section>
    );
  }

  return (
    <section className="employee-request-dialog-section">
      <div className="employee-request-section-title">نوع بازه مرخصی</div>
      <TaavChoiceChipGroup
        ariaLabel="نوع بازه مرخصی"
        options={LEAVE_RANGE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          disabled: disabled || (option.value === 'full_day' ? !rule.requestModes.daily : !rule.requestModes.multiDay),
        }))}
        value={form.rangeType ?? 'full_day'}
        onValueChange={(next) => onChange((Array.isArray(next) ? next[0] : next) as EmployeeRequestFormPayload['rangeType'])}
        tone="brand"
        size="md"
      />
    </section>
  );
}

function ReasonPicker({ reasons, selected, disabled, onChange }: { reasons: RequestReasonOption[]; selected: string | null | undefined; disabled?: boolean; onChange: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? reasons : reasons.slice(0, 6);

  return (
    <section className="employee-request-dialog-section">
      <div className="employee-request-section-title">علت درخواست</div>
      {visible.length ? (
        <TaavChoiceChipGroup
          ariaLabel="علت درخواست"
          options={visible.map((reason) => ({ value: reason.id, label: reason.title, disabled }))}
          value={selected ?? ''}
          onValueChange={(next) => onChange(String(Array.isArray(next) ? next[0] : next))}
          tone="brand"
          size="md"
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

export function EmployeeRequestDialog({
  mode,
  employee,
  form,
  reasons,
  loans,
  leaveBalance,
  leaveRequestContext,
  remoteWorkRequestContext,
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
  leaveRequestContext: EmployeeLeaveRequestContext;
  remoteWorkRequestContext: EmployeeRemoteWorkRequestContext;
  onChange: (next: EmployeeRequestFormPayload) => void;
  onClose: () => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<EmployeeRequestPreview | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [isPreviewPending, startPreviewTransition] = useTransition();
  const readonly = mode === 'view';
  const typeReasons = reasons.filter((reason) => reason.category === form.requestType);
  const selectedLoan = loans.find((loan) => loan.id === form.loanId);
  const isLeave = isLeaveRequestType(form.requestType);
  const isRemote = form.requestType === 'remote_work';
  const normalizedForm = useMemo(
    () => normalizeRemoteWorkForSubmission(normalizeRangeForSubmission(form)),
    [form],
  );

  useEffect(() => {
    if (!shouldPreviewRequest(form)) {
      setPreview(null);
      setPreviewError('');
      return;
    }
    const timeout = setTimeout(() => {
      startPreviewTransition(async () => {
        try {
          const nextPreview = await previewEmployeeRequestAction(normalizedForm);
          setPreview(nextPreview);
          setPreviewError('');
        } catch (nextError) {
          setPreview(null);
          setPreviewError(nextError instanceof Error ? nextError.message : 'پیش‌نمایش قابل دریافت نیست.');
        }
      });
    }, 180);
    return () => clearTimeout(timeout);
  }, [form.requestType, form.rangeType, form.startDate, form.endDate, form.startTime, form.endTime, form.dateTime, form.reasonId, form.loanId, form.amount, form.installments, form.attachments, form.submissionMode, normalizedForm]);

  const submit = () => {
    if (readonly) return onClose();
    if (form.requestType !== 'mission' && !form.reasonId) return setError('علت درخواست الزامی است.');
    if (isLeave && form.rangeType === 'hourly' && (!form.startDate || !form.startTime || !form.endTime)) return setError('تاریخ، ساعت شروع و پایان الزامی است.');
    if (isLeave && form.rangeType !== 'hourly' && !form.startDate) return setError('تاریخ مرخصی الزامی است.');
    if (isLeave && form.rangeType === 'multi_day' && !form.endDate) return setError('تاریخ پایان مرخصی الزامی است.');
    if (isLeave && form.rangeType === 'multi_day' && form.endDate && form.startDate && form.endDate < form.startDate) return setError('تاریخ پایان نباید قبل از تاریخ شروع باشد.');
    if (isLeave && form.rangeType === 'hourly' && form.startTime && form.endTime && form.endTime <= form.startTime) return setError('ساعت پایان باید بعد از ساعت شروع باشد.');
    if (isRemote) {
      const mode = mapRangeTypeToRemoteWorkMode(form.rangeType) ?? 'daily';
      if (mode === 'daily' && !form.startDate) return setError('تاریخ دورکاری الزامی است.');
      if (mode === 'hourly' && (!form.startDate || !form.startTime || !form.endTime)) return setError('تاریخ و بازه ساعتی را کامل وارد کنید.');
      if (mode === 'hourly' && form.startTime && form.endTime && form.endTime <= form.startTime) return setError('ساعت پایان باید بعد از ساعت شروع باشد.');
      if (mode === 'multi_day' && (!form.startDate || !form.endDate)) return setError('بازه چندروزه را کامل وارد کنید.');
      if (mode === 'multi_day' && form.startDate && form.endDate && form.endDate < form.startDate) return setError('تاریخ پایان نباید قبل از تاریخ شروع باشد.');
    }
    if (form.requestType === 'overtime' && (!form.startDate || !form.endDate || !form.startTime || !form.endTime)) return setError('بازه تاریخ و ساعت را کامل وارد کنید.');
    if (form.requestType === 'overtime' && form.startDate && form.endDate && form.endDate < form.startDate) return setError('تاریخ پایان نباید قبل از تاریخ شروع باشد.');
    if (form.requestType === 'overtime' && form.startDate === form.endDate && form.startTime && form.endTime && form.endTime <= form.startTime) return setError('ساعت پایان باید بعد از ساعت شروع باشد.');
    if (form.requestType === 'attendance' && (!form.startDate || !form.startTime)) return setError('تاریخ و ساعت تردد الزامی است.');
    if (form.requestType === 'salary_advance' && (!form.amount || form.amount <= 0)) return setError('مبلغ باید عددی مثبت باشد.');
    if (form.requestType === 'loan') {
      if (!selectedLoan) return setError('انتخاب وام الزامی است.');
      if (!form.amount || form.amount < selectedLoan.minAmount || form.amount > selectedLoan.maxAmount) return setError('مبلغ درخواستی خارج از بازه وام است.');
      if (!form.installments || form.installments < selectedLoan.minInstallments || form.installments > selectedLoan.maxInstallments) return setError('تعداد اقساط خارج از بازه وام است.');
    }
    if (preview?.blockingErrors.length) return setError(preview.blockingErrors[0] ?? 'درخواست قابل ثبت نیست.');
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
      footer={<PanelFormModalActions submitLabel={readonly ? 'بستن' : 'ثبت'} cancelLabel={readonly ? 'بازگشت' : 'انصراف'} saving={saving || isPreviewPending} savingLabel={isPreviewPending ? 'در حال محاسبه...' : 'در حال ثبت...'} onSubmit={submit} onCancel={onClose} />}
    >
      <div className="employee-request-dialog">
        <EmployeeMiniHeader employee={employee} />

        <PreviewWarnings preview={preview} previewError={previewError} />

        {isLeave ? (
          employee.hasActiveContract ? (
            <div className="employee-request-balance">
              <span>مرخصی سالانه (قرارداد جاری): <strong>{durationLabel(leaveBalance.annualMinutes, 'فاقد قرارداد')}</strong></span>
              <span>مانده فعلی صفحه: <strong>{durationLabel(leaveBalance.remainingMinutes, 'فاقد قرارداد')}</strong></span>
            </div>
          ) : (
            <div className="employee-request-balance is-empty">
              <span>مرخصی سالانه: <strong>فاقد قرارداد</strong></span>
              <span>مرخصی باقی‌مانده: <strong>فاقد قرارداد</strong></span>
            </div>
          )
        ) : null}

        {isLeave ? <LeaveSelectionField form={form} leaveRequestContext={leaveRequestContext} disabled={readonly} onChange={onChange} /> : null}
        {isLeave ? <LeaveRangeField form={form} leaveRequestContext={leaveRequestContext} disabled={readonly} onChange={(rangeType) => onChange({ ...form, rangeType })} /> : null}

        {preview && form.requestType === 'attendance' ? <AttendancePreviewCard preview={preview} /> : null}
        {preview && form.requestType === 'remote_work' ? <RemotePreviewCard preview={preview} /> : null}
        {preview && form.requestType === 'overtime' ? <OvertimePreviewCard preview={preview} /> : null}

        {isRemote ? (
          <RemoteWorkModeField
            form={form}
            remoteWorkRequestContext={remoteWorkRequestContext}
            disabled={readonly}
            onChange={(mode) =>
              onChange({
                ...form,
                rangeType: mapRemoteWorkModeToRangeType(mode),
                endDate: mode === 'multi_day' ? form.endDate ?? '' : '',
                startTime: mode === 'hourly' ? form.startTime ?? '' : '',
                endTime: mode === 'hourly' ? form.endTime ?? '' : '',
              })
            }
          />
        ) : null}

        <div className="employee-request-form-grid">
          {form.requestType === 'attendance' ? (
            <>
              <RequestDateField label="تاریخ" value={form.startDate ?? ''} disabled={readonly} onChange={(value) => onChange({ ...form, startDate: value, dateTime: `${value} ${form.startTime ?? ''}`.trim() })} />
              <RequestTimeField label="ساعت" value={form.startTime ?? ''} disabled={readonly} onChange={(value) => onChange({ ...form, startTime: value, dateTime: `${form.startDate ?? ''} ${value}`.trim() })} />
            </>
          ) : null}

          {isLeave ? (
            <>
              <RequestDateField label={form.rangeType === 'multi_day' ? 'تاریخ شروع' : 'تاریخ'} value={form.startDate ?? ''} disabled={readonly} onChange={(value) => onChange({ ...form, startDate: value })} />
              {form.rangeType === 'multi_day' ? <RequestDateField label="تاریخ پایان" value={form.endDate ?? ''} disabled={readonly} onChange={(value) => onChange({ ...form, endDate: value })} /> : null}
              {form.rangeType === 'hourly' ? (
                <>
                  <RequestTimeField label="ساعت شروع" value={form.startTime ?? ''} disabled={readonly} onChange={(value) => onChange({ ...form, startTime: value })} placeholder="08:00" />
                  <RequestTimeField label="ساعت پایان" value={form.endTime ?? ''} disabled={readonly} onChange={(value) => onChange({ ...form, endTime: value })} placeholder="12:00" />
                </>
              ) : null}
            </>
          ) : null}

          {form.requestType === 'overtime' ? (
            <>
              <RequestDateField label="تاریخ شروع" value={form.startDate ?? ''} disabled={readonly} onChange={(value) => onChange({ ...form, startDate: value })} />
              <RequestTimeField label="ساعت شروع" value={form.startTime ?? ''} disabled={readonly} onChange={(value) => onChange({ ...form, startTime: value })} placeholder="17:00" />
              <RequestDateField label="تاریخ پایان" value={form.endDate ?? ''} disabled={readonly} onChange={(value) => onChange({ ...form, endDate: value })} />
              <RequestTimeField label="ساعت پایان" value={form.endTime ?? ''} disabled={readonly} onChange={(value) => onChange({ ...form, endTime: value })} placeholder="20:00" />
            </>
          ) : null}

          {isRemote ? <RemoteWorkRangeField form={form} disabled={readonly} onChange={onChange} /> : null}

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

        <section className="employee-request-dialog-section">
          <div className="employee-request-section-title">نحوه ثبت درخواست</div>
          <TaavChoiceChipGroup
            ariaLabel="نحوه ثبت درخواست"
            options={[
              { value: 'approved', label: 'ثبت نهایی / تأیید شده', disabled: readonly },
              { value: 'pending', label: 'ثبت در انتظار تأیید', disabled: readonly },
            ]}
            value={form.submissionMode}
            onValueChange={(next) => {
              const mode = (Array.isArray(next) ? next[0] : next) as 'approved' | 'pending';
              onChange({ ...normalizedForm, submissionMode: mode, status: mode === 'approved' ? 'approved' : 'pending' });
            }}
            tone="brand"
            size="md"
          />
        </section>
      </div>
    </PanelFormModal>
  );
}
