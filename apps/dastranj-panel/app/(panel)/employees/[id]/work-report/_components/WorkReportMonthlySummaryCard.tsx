'use client';

import type { EmployeeWorkReportData, WorkReportRequest } from '../../../../../lib/employee-work-report';
import { formatFaNumber, toPersianDigits } from '../../../../../lib/format-fa';

function formatClockHours(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  const hourText = toPersianDigits(String(hours).padStart(2, '0'));
  const minuteText = toPersianDigits(String(rest).padStart(2, '0'));
  return `${hourText}:${minuteText}`;
}

function requestTypeLabel(type: WorkReportRequest['requestType']) {
  switch (type) {
    case 'daily_leave':
      return 'مرخصی روزانه';
    case 'hourly_leave':
      return 'مرخصی ساعتی';
    case 'reward_leave':
      return 'مرخصی تشویقی';
    case 'unpaid_leave':
      return 'مرخصی بدون حقوق';
    case 'sick_leave':
      return 'مرخصی استعلاجی';
    case 'overtime':
      return 'اضافه‌کاری';
    case 'attendance':
      return 'تردد';
    case 'remote_work':
      return 'دورکاری';
    case 'mission':
      return 'مأموریت';
    default:
      return type;
  }
}

function SummaryMetric({
  label,
  minutes,
  tone,
}: {
  label: string;
  minutes: number;
  tone: 'green' | 'red' | 'orange' | 'cyan' | 'yellow' | 'pink' | 'blue';
}) {
  return (
    <div className={`employee-work-report-summary-metric is-${tone}`}>
      <span className="employee-work-report-summary-metric-label">{label}</span>
      <span className="employee-work-report-summary-metric-value">
        <strong>{formatClockHours(minutes)}</strong>
        <em>ساعت</em>
      </span>
    </div>
  );
}

export function WorkReportMonthlySummaryCard({
  periodLabel,
  summary,
  periodRequests,
}: {
  periodLabel: string;
  summary: EmployeeWorkReportData['summary'];
  periodRequests: WorkReportRequest[];
}) {
  const approvedLeaveRequests = periodRequests.filter(
    (request) =>
      request.status === 'approved' &&
      ['daily_leave', 'hourly_leave', 'reward_leave', 'unpaid_leave', 'sick_leave'].includes(request.requestType),
  );
  const pendingLeaveRequests = periodRequests.filter(
    (request) =>
      request.status === 'pending' &&
      ['daily_leave', 'hourly_leave', 'reward_leave', 'unpaid_leave', 'sick_leave'].includes(request.requestType),
  );

  return (
    <section className="employee-work-report-monthly-card" aria-label={`گزارش کارکرد ${periodLabel}`}>
      <h2 className="employee-work-report-monthly-card-title">گزارش کارکرد {periodLabel}</h2>

      <div className="employee-work-report-summary-section">
        <div className="employee-work-report-summary-grid-metrics is-work">
          <SummaryMetric label="موظفی کل" minutes={summary.requiredMinutes} tone="blue" />
          <SummaryMetric label="کارکرد واقعی" minutes={summary.workedMinutes} tone="green" />
          <SummaryMetric label="حضور" minutes={summary.presenceMinutes} tone="green" />
          <SummaryMetric label="غیبت" minutes={summary.absenceMinutes} tone="red" />
          <SummaryMetric label="کسرکار" minutes={summary.shortageMinutes} tone="red" />
          <SummaryMetric label="اضافه‌کاری" minutes={summary.overtimeMinutes} tone="orange" />
          <SummaryMetric label="شب‌کاری" minutes={summary.nightWorkMinutes} tone="cyan" />
          <SummaryMetric label="مأموریت" minutes={summary.missionMinutes} tone="cyan" />
          <SummaryMetric label="دورکاری" minutes={summary.remoteWorkMinutes} tone="blue" />
          <SummaryMetric label="تأخیر" minutes={summary.delayMinutes} tone="pink" />
          <SummaryMetric label="تعجیل" minutes={summary.earlyLeaveMinutes} tone="yellow" />
        </div>

        <div className="employee-work-report-summary-divider">
          <span>مرخصی</span>
        </div>

        <div className="employee-work-report-summary-grid-metrics is-leave">
          <SummaryMetric label="مرخصی استحقاقی" minutes={summary.entitledLeaveMinutes} tone="blue" />
          <SummaryMetric label="مرخصی بدون حقوق" minutes={summary.unpaidLeaveMinutes} tone="blue" />
          <SummaryMetric label="مرخصی تشویقی" minutes={summary.encouragementLeaveMinutes} tone="blue" />
          <SummaryMetric label="مرخصی استعلاجی" minutes={summary.sickLeaveMinutes} tone="blue" />
        </div>

        <div className="employee-work-report-summary-divider">
          <span>درخواست‌ها</span>
        </div>
        <div className="employee-work-report-summary-request-stats">
          <span>تأییدشده: {formatFaNumber(summary.approvedRequestsCount, { useGrouping: false })}</span>
          <span>در انتظار: {formatFaNumber(summary.pendingRequestsCount, { useGrouping: false })}</span>
          <span>تردد ناقص: {formatFaNumber(summary.incompleteAttendanceCount, { useGrouping: false })} روز</span>
        </div>
      </div>

      {approvedLeaveRequests.length > 0 || pendingLeaveRequests.length > 0 ? (
        <div className="employee-work-report-summary-requests">
          {approvedLeaveRequests.length > 0 ? (
            <div className="employee-work-report-summary-request-group">
              <strong>درخواست‌های تأیید‌شده</strong>
              <ul>
                {approvedLeaveRequests.map((request) => (
                  <li key={request.id}>
                    <span>{requestTypeLabel(request.requestType)}</span>
                    <span>
                      {request.startDate ?? request.dateTime ?? '—'}
                      {request.endDate && request.endDate !== request.startDate ? ` تا ${request.endDate}` : ''}
                    </span>
                    {request.calculatedDurationMinutes ? (
                      <span>{formatClockHours(request.calculatedDurationMinutes)} ساعت</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {pendingLeaveRequests.length > 0 ? (
            <div className="employee-work-report-summary-request-group is-pending">
              <strong>در انتظار تأیید</strong>
              <ul>
                {pendingLeaveRequests.map((request) => (
                  <li key={request.id}>
                    <span>{requestTypeLabel(request.requestType)}</span>
                    <span>{request.startDate ?? request.dateTime ?? '—'}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
