import { redirect } from 'next/navigation';
import { prisma } from './prisma';
import { getSessionContext } from './auth';
import { getEmployee } from './data';
import {
  getCurrentEmployeeContract,
  getEmployeeContractsForMonth,
} from './employee-contracts.server';
import { loadTenantPayrollSettingsForYear } from './attendance-calculation';
import {
  formatPersianYmd,
  getPersianMonthLength,
  getPersianPartsFromDate,
  persianToDate,
  PERSIAN_MONTH_NAMES,
  type PersianYmd,
} from './calendar-dates';
import type { EmployeeCurrentContractSummary } from './employee-contracts';
import type { PayrollPreviewSummary } from './payroll-preview-calculation';
import { buildDualPayrollPreviews, type WorkReportSummaryForPayroll } from './payroll-preview-calculation';
import {
  buildCalendarContextFromRow,
  buildPolicyContextFromRow,
  calculateWorkReportDay,
  requestDays,
  toPlainDate,
  type WorkReportCalendarContext,
  type WorkReportDayResult,
  type WorkReportPolicyContext,
  type WorkReportRawRequest,
  type WorkReportWorkGroupContext,
} from './work-report-calculation';
import type { AttendanceInterval } from './attendance-calculation';

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'canceled';
type RequestType =
  | 'daily_leave'
  | 'hourly_leave'
  | 'reward_leave'
  | 'unpaid_leave'
  | 'sick_leave'
  | 'overtime'
  | 'attendance'
  | 'remote_work'
  | 'mission'
  | 'salary_advance'
  | 'loan';
type RangeType = 'full_day' | 'multi_day' | 'hourly' | 'range' | 'point' | null;
type AttendanceActionType = 'check_in' | 'check_out' | 'correction' | null;

export type WorkReportPeriod = {
  year: number;
  month: number;
  label: string;
};

export type WorkReportEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  personnelCode: string | null;
  jobTitle: string;
  organizationUnits: Array<{ id: string; title: string }>;
  workGroupTitle: string | null;
};

export type WorkReportWorkGroup = {
  id: string;
  title: string;
  description: string | null;
  locationTitle: string | null;
  policyId: string | null;
  policyTitle: string | null;
  calendarId: string | null;
  calendarTitle: string | null;
};

export type WorkReportPolicy = {
  id: string;
  title: string;
  description: string | null;
  calendarId: string | null;
  calendarTitle: string | null;
  sectionValues: Record<string, unknown>;
};

export type WorkReportCalendar = {
  id: string;
  title: string;
  yearLabel: string;
  startDate: string;
  endDate: string;
  weekends: string[];
  shiftCount: number;
};

export type WorkReportRequest = {
  id: string;
  requestType: RequestType;
  status: RequestStatus;
  rangeType: RangeType;
  attendanceActionType: AttendanceActionType;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  dateTime: string | null;
  calculatedDurationMinutes: number | null;
  reasonTitle: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  canceledAt: string | null;
  loanTitle: string | null;
};

export type WorkReportAttendanceRecord = {
  id: string;
  requestId: string;
  status: RequestStatus;
  actionType: AttendanceActionType;
  date: string;
  time: string | null;
  reasonTitle: string | null;
  description: string | null;
};

export type WorkReportShift = WorkReportDayResult['expectedShift'];
export type WorkReportShiftBreak = NonNullable<WorkReportShift>['breaks'][number];

export type WorkReportDay = {
  date: string;
  jalaliDate: string;
  weekday: string;
  weekdayIndex: number;
  isToday: boolean;
  isHoliday: boolean;
  isRestDay: boolean;
  isWorkDay: boolean;
  contractId: string | null;
  contractLabel: string | null;
  workGroupId: string | null;
  workGroupLabel: string | null;
  policyId: string | null;
  policyLabel: string | null;
  calendarId: string | null;
  shiftType: string | null;
  expectedShift: WorkReportShift;
  expectedShifts: NonNullable<WorkReportShift>[];
  expectedShiftWindows: string[];
  requiredMinutes: number;
  deductedBreakMinutes: number;
  attendanceRecords: WorkReportAttendanceRecord[];
  attendanceTimestamps: string[];
  attendanceIntervals: AttendanceInterval[];
  isIncompleteAttendance: boolean;
  incompleteSegments: string[];
  requests: WorkReportRequest[];
  status: WorkReportDayResult['status'];
  statusBadges: WorkReportDayResult['statusBadges'];
  workedMinutes: number;
  payableWorkMinutes: number;
  attendanceMinutes: number;
  absenceMinutes: number;
  delayMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  nightWorkMinutes: number;
  leaveMinutes: number;
  paidLeaveMinutes: number;
  unpaidLeaveMinutes: number;
  sickLeaveMinutes: number;
  encouragementLeaveMinutes: number;
  entitledLeaveMinutes: number;
  missionMinutes: number;
  remoteWorkMinutes: number;
  underworkMinutes: number;
  shortageMinutes: number;
  pendingRequests: WorkReportRequest[];
  approvedRequests: WorkReportRequest[];
  warnings: string[];
  payrollEffect: WorkReportDayResult['payrollEffect'];
  segmentAnalyses?: WorkReportDayResult['segmentAnalyses'];
};

export type WorkReportSummary = {
  requiredMinutes: number;
  workedMinutes: number;
  payableWorkMinutes: number;
  attendanceMinutes: number;
  presenceMinutes: number;
  absenceMinutes: number;
  overtimeMinutes: number;
  nightWorkMinutes: number;
  leaveMinutes: number;
  paidLeaveMinutes: number;
  unpaidLeaveMinutes: number;
  sickLeaveMinutes: number;
  encouragementLeaveMinutes: number;
  entitledLeaveMinutes: number;
  missionMinutes: number;
  remoteWorkMinutes: number;
  delayMinutes: number;
  earlyLeaveMinutes: number;
  underworkMinutes: number;
  shortageMinutes: number;
  incompleteAttendanceCount: number;
  pendingRequestsCount: number;
  approvedRequestsCount: number;
  rejectedRequestsCount: number;
  holidayDays: number;
  workDays: number;
  entitledLeaveBalanceMinutes: number | null;
  loanInstallmentAmount: number;
  salaryAdvanceAmount: number;
};

export type EmployeeWorkReportData = {
  employee: WorkReportEmployee;
  activeContract: EmployeeCurrentContractSummary | null;
  workGroup: WorkReportWorkGroup | null;
  policy: WorkReportPolicy | null;
  calendar: WorkReportCalendar | null;
  period: WorkReportPeriod;
  summary: WorkReportSummary;
  days: WorkReportDay[];
  periodRequests: WorkReportRequest[];
  warnings: string[];
  payrollPreviewWithoutInsuranceTax: PayrollPreviewSummary;
  payrollPreviewWithInsuranceTax: PayrollPreviewSummary;
  exportMetadata: {
    generatedAt: string;
    employeeName: string;
    periodLabel: string;
    contractLabel: string | null;
    policyLabel: string | null;
    calendarLabel: string | null;
  };
};

type RawRequestRow = WorkReportRawRequest & {
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  canceledAt: Date | null;
};

type MembershipRow = {
  id: string;
  joinedAt: Date;
  leftAt: Date | null;
  isCurrent: boolean;
  workGroup: {
    id: string;
    title: string;
    description: string | null;
    location: { title: string } | null;
    policy: {
      id: string;
      title: string;
      description: string | null;
      calendarId: string | null;
      sectionValues: unknown;
    } | null;
  };
};

function serializeRequest(request: RawRequestRow): WorkReportRequest {
  return {
    id: request.id,
    requestType: request.requestType,
    status: request.status,
    rangeType: request.rangeType,
    attendanceActionType: request.attendanceActionType,
    startDate: request.startDate,
    endDate: request.endDate,
    startTime: request.startTime,
    endTime: request.endTime,
    dateTime: request.dateTime,
    calculatedDurationMinutes: request.calculatedDurationMinutes,
    reasonTitle: request.reason?.title ?? null,
    description: request.description,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    approvedAt: request.approvedAt?.toISOString() ?? null,
    rejectedAt: request.rejectedAt?.toISOString() ?? null,
    canceledAt: request.canceledAt?.toISOString() ?? null,
    loanTitle: request.loan?.title ?? null,
  };
}

function buildRequestsByDate(requests: RawRequestRow[]) {
  const map = new Map<string, RawRequestRow[]>();
  for (const request of requests) {
    for (const day of requestDays(request)) {
      const list = map.get(day) ?? [];
      list.push(request);
      map.set(day, list);
    }
  }
  return map;
}

function buildAttendanceRecordsFromIntervals(date: string, intervals: AttendanceInterval[]): WorkReportAttendanceRecord[] {
  return intervals.map((interval, index) => ({
    id: interval.id || `${date}-${index}`,
    requestId: interval.id || `${date}-${index}`,
    status: interval.status === 'approved' ? 'approved' : 'pending',
    actionType: null,
    date,
    time: interval.endTimeLabel ? `${interval.startTimeLabel} تا ${interval.endTimeLabel}` : interval.startTimeLabel,
    reasonTitle: null,
    description: null,
  }));
}

function membershipJoinedPersianDate(membership: MembershipRow) {
  return formatPersianYmd(getPersianPartsFromDate(membership.joinedAt));
}

function membershipLeftPersianDate(membership: MembershipRow) {
  if (!membership.leftAt) return null;
  return formatPersianYmd(getPersianPartsFromDate(membership.leftAt));
}

function membershipActiveOnDate(membership: MembershipRow, persianDate: string) {
  const joined = membershipJoinedPersianDate(membership);
  if (persianDate < joined) return false;
  const left = membershipLeftPersianDate(membership);
  if (left && persianDate > left) return false;
  return true;
}

function buildWorkGroupContextFromMembership(
  membership: MembershipRow,
  calendarContextMap: Map<string, WorkReportCalendarContext>,
): WorkReportWorkGroupContext {
  const policyRow = membership.workGroup.policy;
  const policy = policyRow ? buildPolicyContextFromRow(policyRow) : null;
  const calendar = policyRow?.calendarId ? calendarContextMap.get(policyRow.calendarId) ?? null : null;
  return {
    id: membership.workGroup.id,
    title: membership.workGroup.title,
    policy,
    calendar,
  };
}

function resolveWorkGroupForDate(
  memberships: MembershipRow[],
  persianDate: string,
  calendarContextMap: Map<string, WorkReportCalendarContext>,
): WorkReportWorkGroupContext | null {
  const active = memberships.filter((item) => membershipActiveOnDate(item, persianDate));
  if (active.length === 0) return null;
  const preferred = active.find((item) => item.isCurrent) ?? active.sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime())[0];
  return buildWorkGroupContextFromMembership(preferred, calendarContextMap);
}

function contractActiveOnPersianDate(contract: EmployeeCurrentContractSummary, date: string) {
  const start = contract.startDate ? toPlainDate(contract.startDate) : null;
  const end = contract.endDate ? toPlainDate(contract.endDate) : null;
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

function resolveContractForDate(
  contracts: EmployeeCurrentContractSummary[],
  date: string,
  fallback: EmployeeCurrentContractSummary | null,
) {
  const active = contracts.filter((contract) => contractActiveOnPersianDate(contract, date));
  if (active.length > 0) return active[0];
  return fallback;
}

function persianDateToIso(date: string) {
  const parts = date.split('/').map(Number);
  if (!parts[0] || !parts[1] || !parts[2]) return date;
  try {
    return persianToDate({ year: parts[0], month: parts[1], day: parts[2] }).toISOString().slice(0, 10);
  } catch {
    return date;
  }
}

function mapDayResultToWorkReportDay(
  result: WorkReportDayResult,
  dayRequests: RawRequestRow[],
  currentDate: string,
): WorkReportDay {
  const dayRequestsForStatus = dayRequests.filter((request) => request.requestType !== 'attendance');
  const approvedRequests = dayRequestsForStatus.filter((request) => request.status === 'approved');
  const pendingRequests = dayRequestsForStatus.filter((request) => request.status === 'pending');

  return {
    ...result,
    isToday: result.date === currentDate,
    expectedShift: result.expectedShift,
    expectedShifts: result.expectedShifts,
    attendanceRecords: buildAttendanceRecordsFromIntervals(result.date, result.attendanceIntervals),
    requests: dayRequestsForStatus.map(serializeRequest),
    encouragementLeaveMinutes: result.bonusLeaveMinutes,
    pendingRequests: pendingRequests.map(serializeRequest),
    approvedRequests: approvedRequests.map(serializeRequest),
  };
}

function createEmptySummary(): WorkReportSummary {
  return {
    requiredMinutes: 0,
    workedMinutes: 0,
    payableWorkMinutes: 0,
    attendanceMinutes: 0,
    presenceMinutes: 0,
    absenceMinutes: 0,
    overtimeMinutes: 0,
    nightWorkMinutes: 0,
    leaveMinutes: 0,
    paidLeaveMinutes: 0,
    unpaidLeaveMinutes: 0,
    sickLeaveMinutes: 0,
    encouragementLeaveMinutes: 0,
    entitledLeaveMinutes: 0,
    missionMinutes: 0,
    remoteWorkMinutes: 0,
    delayMinutes: 0,
    earlyLeaveMinutes: 0,
    underworkMinutes: 0,
    shortageMinutes: 0,
    incompleteAttendanceCount: 0,
    pendingRequestsCount: 0,
    approvedRequestsCount: 0,
    rejectedRequestsCount: 0,
    holidayDays: 0,
    workDays: 0,
    entitledLeaveBalanceMinutes: null,
    loanInstallmentAmount: 0,
    salaryAdvanceAmount: 0,
  };
}

function accumulateSummary(summary: WorkReportSummary, day: WorkReportDay, pendingCount: number, approvedCount: number) {
  summary.requiredMinutes += day.requiredMinutes;
  summary.workedMinutes += day.workedMinutes;
  summary.payableWorkMinutes += day.payableWorkMinutes;
  summary.attendanceMinutes += day.attendanceMinutes;
  summary.presenceMinutes += day.isWorkDay ? day.workedMinutes : 0;
  summary.absenceMinutes += day.absenceMinutes;
  summary.overtimeMinutes += day.overtimeMinutes;
  summary.nightWorkMinutes += day.nightWorkMinutes;
  summary.leaveMinutes += day.leaveMinutes;
  summary.paidLeaveMinutes += day.paidLeaveMinutes;
  summary.unpaidLeaveMinutes += day.unpaidLeaveMinutes;
  summary.sickLeaveMinutes += day.sickLeaveMinutes;
  summary.encouragementLeaveMinutes += day.encouragementLeaveMinutes;
  summary.entitledLeaveMinutes += day.entitledLeaveMinutes;
  summary.missionMinutes += day.missionMinutes;
  summary.remoteWorkMinutes += day.remoteWorkMinutes;
  summary.delayMinutes += day.delayMinutes;
  summary.earlyLeaveMinutes += day.earlyLeaveMinutes;
  summary.underworkMinutes += day.underworkMinutes;
  summary.shortageMinutes += day.shortageMinutes;
  summary.incompleteAttendanceCount += day.isIncompleteAttendance ? 1 : 0;
  summary.pendingRequestsCount += pendingCount;
  summary.approvedRequestsCount += approvedCount;
  summary.holidayDays += day.isHoliday ? 1 : 0;
  summary.workDays += day.isWorkDay ? 1 : 0;
}

async function requireTenantId() {
  const session = await getSessionContext();
  if (!session?.tenantId) redirect('/select-tenant');
  return session.tenantId;
}

export async function getEmployeeWorkReportData(
  employeeId: string,
  options?: { year?: number; month?: number },
): Promise<EmployeeWorkReportData | null> {
  const tenantId = await requireTenantId();
  const employee = await getEmployee(employeeId);
  if (!employee) return null;

  const activeContract = await getCurrentEmployeeContract(employeeId, tenantId);
  const today = getPersianPartsFromDate();
  const year = Number.isFinite(options?.year ?? NaN) && (options?.year ?? 0) > 0 ? Number(options?.year) : today.year;
  const month = Number.isFinite(options?.month ?? NaN) && (options?.month ?? 0) >= 1 && (options?.month ?? 0) <= 12 ? Number(options?.month) : today.month;

  const period: WorkReportPeriod = {
    year,
    month,
    label: `${PERSIAN_MONTH_NAMES[month - 1] ?? ''} ${year.toLocaleString('fa-IR')}`,
  };

  const daysInMonth = getPersianMonthLength(year, month);
  const monthDates = Array.from({ length: daysInMonth }, (_, index) => ({ year, month, day: index + 1 } as PersianYmd));
  const monthStart = formatPersianYmd({ year, month, day: 1 });
  const monthEnd = formatPersianYmd({ year, month, day: daysInMonth });
  const currentDate = formatPersianYmd(today);

  const [requests, memberships, monthContracts, tenantPayrollSettings] = await Promise.all([
    prisma.employeeRequest.findMany({
      where: { tenantId, employeeId },
      include: {
        reason: { select: { title: true } },
        loan: { select: { title: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    }) as Promise<RawRequestRow[]>,
    prisma.workGroupMember.findMany({
      where: { employeeId, workGroup: { tenantId } },
      include: {
        workGroup: {
          include: {
            location: { select: { title: true } },
            policy: {
              select: {
                id: true,
                title: true,
                description: true,
                calendarId: true,
                sectionValues: true,
              },
            },
          },
        },
      },
      orderBy: [{ joinedAt: 'desc' }],
    }) as Promise<MembershipRow[]>,
    getEmployeeContractsForMonth(employeeId, monthStart, monthEnd, tenantId),
    loadTenantPayrollSettingsForYear(tenantId, year),
  ]);

  const calendarIds = [
    ...new Set(
      memberships
        .map((item) => item.workGroup.policy?.calendarId)
        .filter((calendarId): calendarId is string => Boolean(calendarId)),
    ),
  ];
  const calendarRows =
    calendarIds.length > 0
      ? await prisma.calendar.findMany({
          where: { id: { in: calendarIds }, tenantId },
        })
      : [];
  const calendarContextMap = new Map<string, WorkReportCalendarContext>(
    calendarRows.map((row) => [row.id, buildCalendarContextFromRow(row)]),
  );

  const currentMembership =
    memberships.find((item) => item.isCurrent) ??
    memberships.find((item) => !item.leftAt) ??
    memberships[0] ??
    null;
  const currentWorkGroupContext = currentMembership
    ? buildWorkGroupContextFromMembership(currentMembership, calendarContextMap)
    : null;
  const requestsByDate = buildRequestsByDate(requests);
  const attendanceRequests = requests.filter((request) => request.requestType === 'attendance');

  const uniqueContractIds = new Set(monthContracts.map((contract) => contract.id));
  const summary = createEmptySummary();
  const days: WorkReportDay[] = [];

  for (const ymd of monthDates) {
    const date = formatPersianYmd(ymd);
    const resolvedContract = resolveContractForDate(monthContracts, date, activeContract);
    const workGroupMembership = resolveWorkGroupForDate(memberships, date, calendarContextMap);
    const isWorkGroupMemberOnDate = workGroupMembership !== null;
    const workGroup = workGroupMembership ?? currentWorkGroupContext;
    const dayRequests = requestsByDate.get(date) ?? [];

    const dayResult = calculateWorkReportDay({
      date,
      isToday: date === currentDate,
      contract: resolvedContract,
      workGroup,
      isWorkGroupMemberOnDate,
      attendanceRequests,
      dayRequests,
      tenantPayrollSettings,
      currentDate,
    });

    const mappedDay = mapDayResultToWorkReportDay(dayResult, dayRequests, currentDate);
    const pendingCount = mappedDay.pendingRequests.length;
    const approvedCount = mappedDay.approvedRequests.length;
    accumulateSummary(summary, mappedDay, pendingCount, approvedCount);
    days.push(mappedDay);
  }

  const periodRequests = requests
    .filter((request) => {
      const span = requestDays(request);
      return span.some((day) => day >= monthStart && day <= monthEnd);
    })
    .map(serializeRequest);

  summary.rejectedRequestsCount = periodRequests.filter((request) => request.status === 'rejected' || request.status === 'canceled').length;

  const loanInstallmentAmount = requests
    .filter((request) => request.requestType === 'loan' && request.status === 'approved')
    .reduce((sum, request) => sum + (request.calculatedDurationMinutes ?? 0), 0);
  const salaryAdvanceAmount = requests
    .filter((request) => request.requestType === 'salary_advance' && request.status === 'approved')
    .reduce((sum, request) => sum + (request.calculatedDurationMinutes ?? 0), 0);
  summary.loanInstallmentAmount = loanInstallmentAmount;
  summary.salaryAdvanceAmount = salaryAdvanceAmount;

  const warnings: string[] = [];
  if (!activeContract) warnings.push('برای محاسبه گزارش کارکرد، قرارداد فعال برای این کارمند وجود ندارد.');
  if (uniqueContractIds.size > 1) {
    warnings.push('این ماه شامل بیش از یک قرارداد فعال در بازه‌های مختلف است؛ محاسبات هر روز بر اساس قرارداد فعال همان روز انجام شده است.');
  }
  if (!currentWorkGroupContext) warnings.push('این کارمند هنوز به گروه کاری متصل نشده است.');
  if (currentWorkGroupContext && !currentWorkGroupContext.policy) warnings.push('برای گروه کاری این کارمند، سیاست کاری تعریف نشده است.');
  if (currentWorkGroupContext?.policy && !currentWorkGroupContext.calendar) {
    warnings.push('برای سیاست کاری این کارمند، تقویم کاری تعریف نشده است.');
  }
  if (!tenantPayrollSettings.workTimePayRules.nightWork.enabled) {
    warnings.push('تنظیمات شب‌کاری سال گزارش فعال نیست یا تکمیل نشده است.');
  }

  const payrollSummary: WorkReportSummaryForPayroll = {
    requiredMinutes: summary.requiredMinutes,
    workedMinutes: summary.workedMinutes,
    payableWorkMinutes: summary.payableWorkMinutes,
    presenceMinutes: summary.presenceMinutes,
    absenceMinutes: summary.absenceMinutes,
    overtimeMinutes: summary.overtimeMinutes,
    nightWorkMinutes: summary.nightWorkMinutes,
    leaveMinutes: summary.leaveMinutes,
    unpaidLeaveMinutes: summary.unpaidLeaveMinutes,
    sickLeaveMinutes: summary.sickLeaveMinutes,
    bonusLeaveMinutes: summary.encouragementLeaveMinutes,
    entitledLeaveMinutes: summary.entitledLeaveMinutes,
    missionMinutes: summary.missionMinutes,
    remoteWorkMinutes: summary.remoteWorkMinutes,
    delayMinutes: summary.delayMinutes,
    earlyLeaveMinutes: summary.earlyLeaveMinutes,
    shortageMinutes: summary.shortageMinutes,
    underworkMinutes: summary.underworkMinutes,
    incompleteAttendanceCount: summary.incompleteAttendanceCount,
    workDays: summary.workDays,
    holidayDays: summary.holidayDays,
    paidLeaveMinutes: summary.paidLeaveMinutes,
    loanInstallmentAmount: summary.loanInstallmentAmount,
    salaryAdvanceAmount: summary.salaryAdvanceAmount,
  };

  const payrollPreviews = buildDualPayrollPreviews({
    contract: activeContract,
    tenantSettings: tenantPayrollSettings,
    summary: payrollSummary,
    days,
    periodLabel: period.label,
  });

  const employeeName = `${employee.firstName} ${employee.lastName}`.trim();
  const employeeData: WorkReportEmployee = {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    avatarUrl: employee.avatarUrl ?? null,
    personnelCode: employee.personnelCode ?? null,
    jobTitle: activeContract?.jobTitle ?? '',
    organizationUnits: employee.organizationUnits.map((item) => ({
      id: item.organizationUnit.id,
      title: item.organizationUnit.title,
    })),
    workGroupTitle: currentWorkGroupContext?.title ?? null,
  };

  return {
    employee: employeeData,
    activeContract,
    workGroup: currentMembership
      ? {
          id: currentMembership.workGroup.id,
          title: currentMembership.workGroup.title,
          description: currentMembership.workGroup.description,
          locationTitle: currentMembership.workGroup.location?.title ?? null,
          policyId: currentWorkGroupContext?.policy?.id ?? null,
          policyTitle: currentWorkGroupContext?.policy?.title ?? null,
          calendarId: currentWorkGroupContext?.calendar?.id ?? null,
          calendarTitle: currentWorkGroupContext?.calendar?.title ?? null,
        }
      : null,
    policy: currentWorkGroupContext?.policy
      ? {
          id: currentWorkGroupContext.policy.id,
          title: currentWorkGroupContext.policy.title,
          description: currentMembership?.workGroup.policy?.description ?? null,
          calendarId: currentWorkGroupContext.calendar?.id ?? null,
          calendarTitle: currentWorkGroupContext.calendar?.title ?? null,
          sectionValues: currentWorkGroupContext.policy.sectionValues,
        }
      : null,
    calendar: currentWorkGroupContext?.calendar
      ? {
          id: currentWorkGroupContext.calendar.id,
          title: currentWorkGroupContext.calendar.title,
          yearLabel: currentWorkGroupContext.calendar.yearLabel,
          startDate: currentWorkGroupContext.calendar.startDate,
          endDate: currentWorkGroupContext.calendar.endDate,
          weekends: currentWorkGroupContext.calendar.weekends,
          shiftCount: currentWorkGroupContext.calendar.shiftConfig.length,
        }
      : null,
    period,
    summary,
    days,
    periodRequests,
    warnings,
    payrollPreviewWithoutInsuranceTax: payrollPreviews.payrollPreviewWithoutInsuranceTax,
    payrollPreviewWithInsuranceTax: payrollPreviews.payrollPreviewWithInsuranceTax,
    exportMetadata: {
      generatedAt: new Date().toISOString(),
      employeeName,
      periodLabel: period.label,
      contractLabel: activeContract?.contractNumber ?? activeContract?.templateName ?? null,
      policyLabel: currentWorkGroupContext?.policy?.title ?? null,
      calendarLabel: currentWorkGroupContext?.calendar?.title ?? null,
    },
  };
}

export async function getEmployeeWorkReportPageData(employeeId: string, options?: { year?: number; month?: number }) {
  return getEmployeeWorkReportData(employeeId, options);
}
