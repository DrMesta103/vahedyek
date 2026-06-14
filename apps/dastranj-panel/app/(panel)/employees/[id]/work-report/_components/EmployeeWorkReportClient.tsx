'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CalendarDays, ChevronLeft, Filter, ListChecks, User } from 'lucide-react';
import { PersianMonthCalendarEmptyDay, PersianMonthCalendarGrid } from '../../../../../components/PersianMonthCalendarGrid';
import { WorkReportCalendarDayCell } from '../../../../../components/WorkReportCalendarDayCell';
import type { EmployeeWorkReportData, WorkReportDay } from '../../../../../lib/employee-work-report';
import { formatFaNumber } from '../../../../../lib/format-fa';
import { PERSIAN_MONTH_NAMES } from '../../../../../lib/calendar-dates';
import { WorkReportMonthlySummaryCard } from './WorkReportMonthlySummaryCard';
import { WorkReportPayrollPreviewPanel } from './WorkReportPayrollPreviewPanel';

function formatDuration(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  if (safe <= 0) return '۰ دقیقه';
  if (hours <= 0) return `${formatFaNumber(rest, { useGrouping: false })} دقیقه`;
  if (rest <= 0) return `${formatFaNumber(hours, { useGrouping: false })} ساعت`;
  return `${formatFaNumber(hours, { useGrouping: false })} ساعت و ${formatFaNumber(rest, { useGrouping: false })} دقیقه`;
}

function yesNoLabel(value: boolean) {
  return value ? 'بله' : 'خیر';
}

function requestTypeLabel(type: string) {
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
      return 'ماموریت';
    default:
      return type;
  }
}

function statusTone(status: WorkReportDay['status']) {
  switch (status) {
    case 'غیبت':
    case 'تردد ناقص':
      return 'is-danger';
    case 'مرخصی':
    case 'تأخیر مجاز':
      return 'is-warn';
    case 'اضافه‌کاری':
      return 'is-success';
    case 'مأموریت':
      return 'is-violet';
    case 'دورکاری':
      return 'is-blue';
    default:
      return 'is-neutral';
  }
}

function dayTypeLabel(day: WorkReportDay) {
  switch (day.status) {
    case 'مرخصی':
      return 'مرخصی';
    case 'مأموریت':
      return 'مأموریت';
    case 'دورکاری':
      return 'دورکاری';
    case 'غیبت':
      return 'غیبت';
    case 'تعطیل مجاز':
      return 'تعطیل';
    default:
      return day.status;
  }
}

type WorkReportFilterKey =
  | 'all'
  | 'attendance'
  | 'absence'
  | 'leave'
  | 'overtime'
  | 'incomplete_attendance'
  | 'holiday'
  | 'remote'
  | 'mission';

function filterLabel(key: WorkReportFilterKey) {
  switch (key) {
    case 'all':
      return 'همه';
    case 'attendance':
      return 'حضور';
    case 'absence':
      return 'غیبت';
    case 'leave':
      return 'مرخصی';
    case 'overtime':
      return 'اضافه‌کاری';
    case 'incomplete_attendance':
      return 'تردد ناقص';
    case 'holiday':
      return 'تعطیل';
    case 'remote':
      return 'دورکاری';
    case 'mission':
      return 'مأموریت';
    default:
      return key;
  }
}

function matchesFilter(day: WorkReportDay, key: WorkReportFilterKey) {
  switch (key) {
    case 'all':
      return true;
    case 'attendance':
      return day.status === 'حضور' || day.attendanceMinutes > 0;
    case 'absence':
      return day.status === 'غیبت';
    case 'leave':
      return day.leaveMinutes > 0 || day.status === 'مرخصی';
    case 'overtime':
      return day.overtimeMinutes > 0 || day.status === 'اضافه‌کاری';
    case 'incomplete_attendance':
      return day.isIncompleteAttendance || day.status === 'تردد ناقص';
    case 'holiday':
      return day.isHoliday;
    case 'remote':
      return day.remoteWorkMinutes > 0 || day.status === 'دورکاری';
    case 'mission':
      return day.missionMinutes > 0 || day.status === 'مأموریت';
    default:
      return false;
  }
}

function formatAttendanceStatus(status: WorkReportDay['attendanceRecords'][number]['status']) {
  switch (status) {
    case 'approved':
      return 'تأیید شده';
    case 'pending':
      return 'در انتظار';
    case 'rejected':
      return 'رد شده';
    case 'canceled':
      return 'لغو شده';
    default:
      return status;
  }
}

export function EmployeeWorkReportClient({
  employeeId,
  report,
}: {
  employeeId: string;
  report: EmployeeWorkReportData;
}) {
  const router = useRouter();
  const todayDay = useMemo(() => report.days.find((day) => day.isToday) ?? report.days[0] ?? null, [report.days]);
  const [selectedDate, setSelectedDate] = useState(todayDay?.date ?? report.days[0]?.date ?? '');
  const [activeFilters, setActiveFilters] = useState<WorkReportFilterKey[]>([]);

  const selectedDay = useMemo(
    () => report.days.find((day) => day.date === selectedDate) ?? report.days[0] ?? null,
    [report.days, selectedDate],
  );

  const monthGrid = useMemo(() => {
    const firstWeekday = report.days[0]?.weekdayIndex ?? 0;
    return [
      ...Array.from({ length: firstWeekday }, (_, index) => ({ key: `pad-${index}`, day: null as WorkReportDay | null })),
      ...report.days.map((day) => ({ key: day.date, day })),
    ];
  }, [report.days]);

  const filterCounts = useMemo(() => {
    const keys: WorkReportFilterKey[] = [
      'attendance',
      'absence',
      'leave',
      'overtime',
      'incomplete_attendance',
      'holiday',
      'remote',
      'mission',
    ];
    const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<WorkReportFilterKey, number>;
    for (const day of report.days) {
      for (const key of keys) {
        if (matchesFilter(day, key)) counts[key] += 1;
      }
    }
    return counts;
  }, [report.days]);

  const filteredDays = useMemo(() => {
    if (activeFilters.length === 0) return report.days;
    return report.days.filter((day) => activeFilters.some((key) => matchesFilter(day, key)));
  }, [activeFilters, report.days]);

  const filteredSet = useMemo(() => new Set(filteredDays.map((day) => day.date)), [filteredDays]);
  const showDimmed = activeFilters.length > 0;

  const navigateMonth = (nextYear: number, nextMonth: number) => {
    router.push(`/employees/${employeeId}/work-report?year=${nextYear}&month=${nextMonth}`, { scroll: false });
  };

  const employeeName = `${report.employee.firstName} ${report.employee.lastName}`.trim() || 'بدون نام';
  const orgLabel = report.employee.organizationUnits.length
    ? report.employee.organizationUnits.map((item) => item.title).join('، ')
    : 'واحد سازمانی ثبت نشده';

  return (
    <div className="employee-work-report-shell" dir="rtl" lang="fa">
      <header className="employee-work-report-header">
        <div className="employee-work-report-title-row">
          <Link href={`/employees/${employeeId}`} className="calendar-details-back" aria-label="بازگشت به کارمند">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div className="employee-work-report-avatar">
            {report.employee.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={report.employee.avatarUrl} alt="" />
            ) : (
              <User className="h-5 w-5" strokeWidth={1.7} />
            )}
          </div>
          <div className="calendar-details-title-copy">
            <div className="calendar-details-title-line">
              <h1>{employeeName}</h1>
              <span className="employee-work-report-period-pill">{report.period.label}</span>
            </div>
            <p>
              {report.employee.jobTitle || 'عنوان شغلی ثبت نشده'} · {orgLabel}
            </p>
          </div>
        </div>

        <div className="employee-work-report-meta-row">
          <span className={report.activeContract ? 'is-ok' : 'is-warn'}>
            {report.activeContract ? 'قرارداد فعال' : 'فاقد قرارداد'}
          </span>
          <span>{report.workGroup?.title ?? 'بدون گروه کاری'}</span>
          <span>{report.policy?.title ?? 'بدون سیاست'}</span>
          <span>{report.calendar?.title ?? 'بدون تقویم'}</span>
        </div>
      </header>

      {report.warnings.length > 0 ? (
        <section className="employee-work-report-warnings">
          {report.warnings.map((warning) => (
            <div key={warning} className="employee-work-report-warning">
              <AlertTriangle className="h-4 w-4" />
              <span>{warning}</span>
            </div>
          ))}
        </section>
      ) : null}

      <WorkReportMonthlySummaryCard
        periodLabel={report.period.label}
        summary={report.summary}
        periodRequests={report.periodRequests}
      />

      <WorkReportPayrollPreviewPanel report={report} />

      <div className="employee-work-report-panels calendar-details-body">
        <section className="calendar-details-main employee-work-report-calendar-panel">
          <PersianMonthCalendarGrid
            monthTitle={`گزارش کارکرد ${PERSIAN_MONTH_NAMES[report.period.month - 1] ?? ''} ${formatFaNumber(report.period.year, { useGrouping: false })}`}
            onPrev={() => navigateMonth(report.period.year, report.period.month === 1 ? 12 : report.period.month - 1)}
            onNext={() => navigateMonth(report.period.year, report.period.month === 12 ? 1 : report.period.month + 1)}
            toolbarExtra={
              <div className="employee-work-report-toolbar-extra">
                <div className="employee-work-report-filter-row" aria-label="فیلتر روزها">
                  <button
                    type="button"
                    className={['employee-work-report-filter', activeFilters.length === 0 ? 'is-active' : ''].filter(Boolean).join(' ')}
                    onClick={() => setActiveFilters([])}
                  >
                    <Filter className="h-4 w-4" aria-hidden />
                    <span>همه</span>
                    <strong>{formatFaNumber(report.days.length, { useGrouping: false })}</strong>
                  </button>
                  {(
                    [
                      'attendance',
                      'absence',
                      'leave',
                      'overtime',
                      'incomplete_attendance',
                      'holiday',
                      'remote',
                      'mission',
                    ] as const
                  ).map((key) => {
                    const isActive = activeFilters.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={['employee-work-report-filter', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
                        onClick={() =>
                          setActiveFilters((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]))
                        }
                      >
                        <span>{filterLabel(key)}</span>
                        <strong>{formatFaNumber(filterCounts[key], { useGrouping: false })}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>
            }
          >
            {monthGrid.map((cell) =>
              cell.day ? (
                <WorkReportCalendarDayCell
                  key={cell.key}
                  day={cell.day}
                  isSelected={selectedDate === cell.day.date}
                  isDimmed={showDimmed ? !filteredSet.has(cell.day.date) : false}
                  onSelect={() => setSelectedDate(cell.day.date)}
                />
              ) : (
                <PersianMonthCalendarEmptyDay key={cell.key} />
              ),
            )}
          </PersianMonthCalendarGrid>

          {activeFilters.length > 0 ? (
            <div className="employee-work-report-matches-card" aria-label="روزهای مطابق فیلتر">
              <header className="employee-work-report-matches-head">
                <div>
                  <strong>روزهای مطابق</strong>
                  <span>
                    {activeFilters.map(filterLabel).join('، ')} · {formatFaNumber(filteredDays.length, { useGrouping: false })} روز
                  </span>
                </div>
                <ListChecks className="h-4 w-4 opacity-70" aria-hidden />
              </header>
              <div className="employee-work-report-matches-list" role="list">
                {filteredDays.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    className={[
                      'employee-work-report-matches-item',
                      day.date === selectedDate ? 'is-selected' : '',
                      day.isHoliday ? 'is-holiday' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className="employee-work-report-matches-item-main">
                      <strong>{day.jalaliDate}</strong>
                      <span>{day.weekday}</span>
                    </div>
                    <div className="employee-work-report-matches-item-meta">
                      <span className={`employee-work-report-status-pill ${statusTone(day.status)}`}>{dayTypeLabel(day)}</span>
                      <span className="employee-work-report-matches-item-mini">
                        کارکرد {formatDuration(day.workedMinutes)}
                      </span>
                    </div>
                  </button>
                ))}
                {filteredDays.length === 0 ? <p className="calendar-details-muted">روزی مطابق این فیلترها پیدا نشد.</p> : null}
              </div>
            </div>
          ) : null}
        </section>

        <aside className="calendar-details-sidebar employee-work-report-sidebar">
          {selectedDay ? (
            <section className="calendar-details-side-card">
              <header className="calendar-details-day-panel-head">
                <div>
                  <h2>جزئیات روز</h2>
                  <p>
                    {selectedDay.jalaliDate} · {selectedDay.weekday}
                  </p>
                </div>
                <span className={`employee-work-report-status-pill ${statusTone(selectedDay.status)}`}>
                  {dayTypeLabel(selectedDay)}
                </span>
              </header>

              <div className="employee-work-report-day-quick">
                <div className="employee-work-report-day-quick-item">
                  <span>شیفت</span>
                  <strong>{selectedDay.expectedShift?.timeRange ?? (selectedDay.isHoliday ? 'تعطیل' : 'ثبت نشده')}</strong>
                </div>
                <div className="employee-work-report-day-quick-item">
                  <span>موظفی</span>
                  <strong>{formatDuration(selectedDay.requiredMinutes)}</strong>
                </div>
                <div className="employee-work-report-day-quick-item">
                  <span>تردد</span>
                  <strong>{formatDuration(selectedDay.attendanceMinutes)}</strong>
                </div>
                <div className="employee-work-report-day-quick-item">
                  <span>استراحت کسرشده</span>
                  <strong>{formatDuration(selectedDay.deductedBreakMinutes)}</strong>
                </div>
                <div className="employee-work-report-day-quick-item">
                  <span>شب‌کاری</span>
                  <strong>{formatDuration(selectedDay.nightWorkMinutes)}</strong>
                </div>
                <div className="employee-work-report-day-quick-item">
                  <span>قرارداد</span>
                  <strong>{selectedDay.contractLabel ?? 'ثبت نشده'}</strong>
                </div>
              </div>

              {selectedDay.approvedRequests.length > 0 || selectedDay.pendingRequests.length > 0 ? (
                <div className="calendar-details-day-block">
                  <div className="calendar-details-day-block-head">
                    <h3>
                      درخواست‌ها{' '}
                      <span>({selectedDay.approvedRequests.length + selectedDay.pendingRequests.length})</span>
                    </h3>
                  </div>
                  {selectedDay.approvedRequests.length > 0 ? (
                    <div className="calendar-details-event-list">
                      {selectedDay.approvedRequests.map((request) => (
                        <article key={request.id} className="calendar-details-event-item is-other">
                          <div className="calendar-details-event-item-body">
                            <h4>{requestTypeLabel(request.requestType)}</h4>
                            <p>{request.reasonTitle ?? 'بدون علت'}</p>
                            <span>
                              {request.calculatedDurationMinutes
                                ? formatDuration(request.calculatedDurationMinutes)
                                : 'تأیید شده'}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                  {selectedDay.pendingRequests.length > 0 ? (
                    <div className="employee-work-report-pending-list">
                      <strong>در انتظار تأیید</strong>
                      {selectedDay.pendingRequests.map((request) => (
                        <span key={request.id}>{requestTypeLabel(request.requestType)}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="calendar-details-day-block">
                <div className="calendar-details-day-block-head">
                  <h3>
                    شیفت مورد انتظار <span>({selectedDay.expectedShifts.length})</span>
                  </h3>
                </div>
                {selectedDay.expectedShifts.length > 0 ? (
                  <div className="calendar-details-shift-list">
                    {selectedDay.expectedShifts.map((shift) => (
                      <article key={shift.id} className="calendar-details-shift-item">
                        <span className="calendar-details-shift-item-dot" style={{ background: '#6366f1' }} aria-hidden />
                        <div className="calendar-details-shift-item-body">
                          <h4>{shift.title}</h4>
                          <p>{shift.timeRange}</p>
                          <span>{shift.requiredMinutes ? formatDuration(shift.requiredMinutes) : 'بدون دقایق موظفی'}</span>
                        </div>
                        {shift.breaks.length > 0 ? (
                          <div className="employee-work-report-detail-grid">
                            {shift.breaks.map((breakItem) => (
                              <div key={breakItem.id}>
                                <span>{breakItem.typeLabel}</span>
                                <strong>{breakItem.timeRange}</strong>
                                <span>مدت {formatDuration(breakItem.durationMinutes)}</span>
                                <span>کسر از کار: {yesNoLabel(breakItem.deductFromWork)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="employee-work-report-muted">استراحتی برای این شیفت ثبت نشده است.</p>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="calendar-details-muted">شیفت برای این روز تعریف نشده است.</p>
                )}
              </div>

              <div className="calendar-details-day-block">
                <div className="calendar-details-day-block-head">
                  <h3>کارکرد روز</h3>
                </div>
                <div className="employee-work-report-day-metrics">
                  <span>
                    موظفی <em>{formatDuration(selectedDay.requiredMinutes)}</em>
                  </span>
                  <span>
                    شب‌کاری <em>{formatDuration(selectedDay.nightWorkMinutes)}</em>
                  </span>
                  <span>
                    کارکرد <em>{formatDuration(selectedDay.workedMinutes)}</em>
                  </span>
                  <span>
                    مرخصی <em>{formatDuration(selectedDay.leaveMinutes)}</em>
                  </span>
                  <span>
                    تردد <em>{formatDuration(selectedDay.attendanceMinutes)}</em>
                  </span>
                  <span>
                    استراحت کسرشده <em>{formatDuration(selectedDay.deductedBreakMinutes)}</em>
                  </span>
                  <span>
                    تأخیر <em>{formatDuration(selectedDay.delayMinutes)}</em>
                  </span>
                  <span>
                    تعجیل <em>{formatDuration(selectedDay.earlyLeaveMinutes)}</em>
                  </span>
                  <span>
                    اضافه‌کاری <em>{formatDuration(selectedDay.overtimeMinutes)}</em>
                  </span>
                  <span>
                    کسرکارکرد <em>{yesNoLabel(selectedDay.underworkMinutes > 0)}</em>
                  </span>
                  <span>
                    کسری <em>{formatDuration(selectedDay.underworkMinutes)}</em>
                  </span>
                </div>
              </div>

              <div className="calendar-details-day-block">
                <div className="calendar-details-day-block-head">
                  <h3>
                    ترددها <span>({selectedDay.attendanceRecords.length})</span>
                  </h3>
                </div>
                {selectedDay.attendanceRecords.length > 0 ? (
                  <div className="calendar-details-event-list">
                    {selectedDay.attendanceRecords.map((record) => (
                      <article key={record.id} className="calendar-details-event-item is-other">
                        <div className="calendar-details-event-item-body">
                          <h4>تردد</h4>
                          <p>{record.time ?? 'بدون ساعت'}</p>
                          <span>{formatAttendanceStatus(record.status)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="calendar-details-muted">رکورد ترددی برای این روز ثبت نشده است.</p>
                )}
              </div>

              {selectedDay.incompleteSegments.length > 0 ? (
                <div className="calendar-details-day-block">
                  <div className="calendar-details-day-block-head">
                    <h3>بخش‌های ناقص شیفت</h3>
                  </div>
                  <div className="employee-work-report-pending-list">
                    {selectedDay.incompleteSegments.map((segment) => (
                      <span key={segment}>{segment}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedDay.payrollEffect ? (
                <div className="calendar-details-day-block">
                  <div className="calendar-details-day-block-head">
                    <h3>اثر مالی روز</h3>
                  </div>
                  <div className="employee-work-report-day-metrics">
                    <span>
                      حقوق پایه <em>{formatFaNumber(selectedDay.payrollEffect.baseSalaryPortion)} ریال</em>
                    </span>
                    <span>
                      اضافه‌کاری <em>{formatFaNumber(selectedDay.payrollEffect.overtimePortion)} ریال</em>
                    </span>
                    <span>
                      شب‌کاری <em>{formatFaNumber(selectedDay.payrollEffect.nightWorkPortion)} ریال</em>
                    </span>
                  </div>
                </div>
              ) : null}

              {selectedDay.warnings.length > 0 ? (
                <div className="calendar-details-day-block">
                  <div className="calendar-details-day-block-head">
                    <h3>هشدارها</h3>
                  </div>
                  <div className="employee-work-report-inline-warnings">
                    {selectedDay.warnings.map((warning) => (
                      <div key={warning} className="employee-work-report-warning is-inline">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : (
            <section className="calendar-details-side-card employee-work-report-empty">
              <CalendarDays className="h-8 w-8" />
              <strong>روزی انتخاب نشده است.</strong>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
