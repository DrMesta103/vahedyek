import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionContext } from './auth';
import { requestReasonCategories } from './constants';
import { ensureTenantDefaultRequestReasons } from './request-reason-defaults';
import { getGlobalDefaultCalendarTemplate } from './calendar-defaults';
import { mapShiftTemplateRecord, type ShiftTemplatePickerItem } from './shift-template-picker';
import {
  clampPersianMonth,
  getPersianPartsFromDate,
  isPersianYmdInRange,
  parsePersianYmd,
  PERSIAN_MONTH_NAMES,
  resolveDefaultViewMonth,
} from './calendar-dates';
import { normalizePersianDateInput, parseCalendarStoredEvents } from './calendar-events';
import { buildMonthCells } from './calendar-grid';
import {
  CALENDAR_SHIFT_LEGEND,
  countShiftsByType,
  listCalendarShifts,
  listExcludedShiftDates,
  listWeekendOverrideDates,
  type CalendarShiftType,
  type StoredCalendarShift,
} from './calendar-shifts';
import { prisma } from './prisma';
import { listEmployeeImportJobsForTenant } from './employee-import-jobs';
import { normalizeContractDraftTemplate, type ContractDraftTemplate } from './contract-draft-templates';
import type {
  QuickEmployeeAddMethod,
  QuickEmployeeImportJobSummary,
  QuickEmployeeStatus,
  QuickSetupStep,
} from '../(panel)/quick-setup/_components/quick-setup.types';

type LocationListRow = {
  id: string;
  title: string;
  address: string;
  description: string | null;
  radius: number;
  latitude: { toString(): string } | null;
  longitude: { toString(): string } | null;
  isActive: boolean;
  isPrimaryOnboarding?: boolean;
};

function isMissingPrimaryOnboardingColumn(error: unknown) {
  return error instanceof Error && error.message.includes('The column `Location.isPrimaryOnboarding` does not exist');
}

function isMissingLocationActiveColumn(error: unknown) {
  return error instanceof Error && (error.message.includes('Unknown argument `isActive`') || error.message.includes('The column `Location.isActive` does not exist'));
}

const locationSummarySelect = {
  id: true,
  title: true,
} as const;

const locationListSelect = {
  id: true,
  title: true,
  address: true,
  description: true,
  radius: true,
  latitude: true,
  longitude: true,
  isActive: true,
  isPrimaryOnboarding: true,
  _count: {
    select: {
      workGroups: true,
    },
  },
} as const;

const legacyLocationListSelect = {
  id: true,
  title: true,
  address: true,
  description: true,
  radius: true,
  latitude: true,
  longitude: true,
  isActive: true,
  _count: {
    select: {
      workGroups: true,
    },
  },
} as const;

const minimalLocationListSelect = {
  id: true,
  title: true,
  address: true,
  description: true,
  radius: true,
  latitude: true,
  longitude: true,
  _count: {
    select: {
      workGroups: true,
    },
  },
} as const;

async function listLocationsForTenant(tenantId: string, take?: number) {
  const where = { tenantId };

  try {
    return ((await prisma.location.findMany({
      where,
      orderBy: [{ isPrimaryOnboarding: 'desc' }, { isActive: 'desc' }, { updatedAt: 'desc' }],
      select: locationListSelect,
      ...(typeof take === 'number' ? { take } : {}),
    } as any)) as unknown as Array<LocationListRow & { _count: { workGroups: number } }>).map((item) => ({
      ...item,
      usageCount: item._count?.workGroups ?? 0,
    }));
  } catch (error) {
    if (!isMissingPrimaryOnboardingColumn(error) && !isMissingLocationActiveColumn(error)) throw error;
    const select = isMissingLocationActiveColumn(error) ? minimalLocationListSelect : legacyLocationListSelect;
    const orderBy = isMissingPrimaryOnboardingColumn(error)
      ? [{ updatedAt: 'desc' }]
      : isMissingLocationActiveColumn(error)
        ? [{ updatedAt: 'desc' }]
        : [{ isActive: 'desc' }, { updatedAt: 'desc' }];
    return ((await prisma.location.findMany({
      where,
      select,
      orderBy: orderBy as any,
      ...(typeof take === 'number' ? { take } : {}),
    })) as unknown as Array<
      Omit<LocationListRow, 'isPrimaryOnboarding' | 'isActive'> & { _count?: { workGroups?: number } }
    >).map((item) => ({
      ...item,
      isActive: 'isActive' in item ? item.isActive : true,
      isPrimaryOnboarding: 'isPrimaryOnboarding' in item ? item.isPrimaryOnboarding : false,
      usageCount: item._count?.workGroups ?? 0,
    }));
  }
}

async function getTenantId(): Promise<string | null> {
  const session = await getSessionContext();
  return session?.tenantId ?? null;
}

const QUICK_EMPLOYEE_STATUSES: QuickEmployeeStatus[] = [
  'registered',
  'invite_sent',
  'pending_completion',
  'completed',
  'active',
  'failed_send',
  'error',
];

const QUICK_EMPLOYEE_ADD_METHODS: QuickEmployeeAddMethod[] = [
  'single',
  'excel',
  'invitation_link',
  'email_invite',
  'sms_invite',
];

function normalizeQuickEmployeeStatus(value: unknown): QuickEmployeeStatus | null {
  return typeof value === 'string' && QUICK_EMPLOYEE_STATUSES.includes(value as QuickEmployeeStatus)
    ? (value as QuickEmployeeStatus)
    : null;
}

function normalizeQuickEmployeeAddMethod(value: unknown): QuickEmployeeAddMethod | null {
  return typeof value === 'string' && QUICK_EMPLOYEE_ADD_METHODS.includes(value as QuickEmployeeAddMethod)
    ? (value as QuickEmployeeAddMethod)
    : null;
}

function deriveQuickEmployeeStatus(item: { isActive: boolean; email: string | null; mobile1: string | null }) {
  if (!item.isActive) return 'pending_completion';
  if (item.email || item.mobile1) return 'registered';
  return 'error';
}

function formatEmployeeLastActionAt(value: Date | string | null | undefined) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.toISOString();
}

async function getSelectTenantRedirectTarget() {
  const requestHeaders = await headers();
  const referer = requestHeaders.get('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      const next = `${url.pathname}${url.search}${url.hash}`;
      return `/select-tenant?next=${encodeURIComponent(next)}`;
    } catch {
      // Ignore malformed referer values and fall back to the default selector route.
    }
  }

  return '/select-tenant';
}

async function requireTenantId(): Promise<string> {
  const tenantId = await getTenantId();
  if (!tenantId) redirect(await getSelectTenantRedirectTarget());
  return tenantId;
}

export async function getBusinessProfile() {
  const tenantId = await requireTenantId();
  return prisma.businessProfile.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getDashboardData() {
  const tenantId = await requireTenantId();
  const where = { tenantId };

  const [profile, locations, calendars, policies, employees, workGroups, draftTemplates, requestReasons] = await Promise.all([
    getBusinessProfile(),
    prisma.location.count({ where }),
    prisma.calendar.count({ where }),
    prisma.workPolicy.count({ where }),
    prisma.employee.count({ where }),
    prisma.workGroup.count({ where }),
    prisma.draftTemplate.count({ where }),
    prisma.requestReason.count({ where }),
  ]);

  return {
    profile,
    stats: [
      { label: 'محل کار', value: locations },
      { label: 'تقویم کاری', value: calendars },
      { label: 'سیاست کاری', value: policies },
      { label: 'کارمند', value: employees },
      { label: 'گروه کاری', value: workGroups },
      { label: 'پیش‌نویس', value: draftTemplates },
      { label: 'دلیل درخواست', value: requestReasons },
    ],
  };
}

export async function getQuickSetupChecklist() {
  const tenantId = await requireTenantId();
  const where = { tenantId };

  const [profile, locationList, calendarList, policyList, employeeList, workGroupList, calendars, policies, employees, workGroups, defaultCalendarTemplate] = await Promise.all([
    getBusinessProfile(),
    listLocationsForTenant(tenantId, 10),
    prisma.calendar.findMany({ where, orderBy: { updatedAt: 'desc' }, take: 20 }),
    prisma.workPolicy.findMany({ where, include: { calendar: true }, orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.employee.findMany({ where, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.workGroup.findMany({ where, orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.calendar.count({ where }),
    prisma.workPolicy.count({ where }),
    prisma.employee.count({ where }),
    prisma.workGroup.count({ where }),
    getGlobalDefaultCalendarTemplate(),
  ]);
  const employeeImportJobs = (await listEmployeeImportJobsForTenant(tenantId, 10)) as QuickEmployeeImportJobSummary[];

  const primaryLocation = locationList.find((item) => item.isPrimaryOnboarding) ?? null;

  return {
    profile,
    locationItems: locationList.map((item) => ({
      id: item.id,
      title: item.title,
      address: item.address,
      description: item.description,
      radius: item.radius,
      allowedRadiusMeters: item.radius,
      latitude: item.latitude?.toString() ?? null,
      longitude: item.longitude?.toString() ?? null,
      isPrimaryOnboarding: item.isPrimaryOnboarding,
    })),
    calendarItems: calendarList.map((item) => ({
      id: item.id,
      title: item.title,
      yearLabel: item.yearLabel,
      description: item.description,
      shiftTitle: item.shiftTitle,
      shiftTypeLabel: item.shiftTypeLabel,
      holidayCount: item.holidayCount,
    })),
    policyItems: policyList.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? 'توضیحات ثبت نشده است',
      calendarId: item.calendarId ?? '',
      calendarTitle: item.calendar?.title ?? '-',
      isDefault: item.isDefault,
      templateId: String((item.sectionValues as { templateId?: string } | null)?.templateId ?? 'custom'),
      templateTitle: String((item.sectionValues as { templateTitle?: string } | null)?.templateTitle ?? item.title),
      selectedCalendarId: String((item.sectionValues as { selectedCalendarId?: string } | null)?.selectedCalendarId ?? item.calendarId ?? ''),
      selectedPolicyTemplateId: String((item.sectionValues as { selectedPolicyTemplateId?: string } | null)?.selectedPolicyTemplateId ?? (item.sectionValues as { templateId?: string } | null)?.templateId ?? 'custom'),
      generatedPolicyTitle: String((item.sectionValues as { generatedPolicyTitle?: string } | null)?.generatedPolicyTitle ?? item.title),
      generatedPolicyDescription: String((item.sectionValues as { generatedPolicyDescription?: string } | null)?.generatedPolicyDescription ?? (item.description ?? '')),
      year: item.calendar?.yearLabel ?? '',
    })),
    employeeItems: employeeList.map((item) => {
      const raw = item as unknown as Record<string, unknown>;
      const addMethod =
        normalizeQuickEmployeeAddMethod(raw.addMethod) ??
        normalizeQuickEmployeeAddMethod(raw.creationMethod) ??
        normalizeQuickEmployeeAddMethod(raw.source) ??
        normalizeQuickEmployeeAddMethod(raw.quickSetupAddMethod) ??
        'single';
      const status =
        normalizeQuickEmployeeStatus(raw.status) ??
        normalizeQuickEmployeeStatus(raw.invitationStatus) ??
        normalizeQuickEmployeeStatus(raw.onboardingStatus) ??
        normalizeQuickEmployeeStatus(raw.quickSetupStatus) ??
        deriveQuickEmployeeStatus(item);

      return {
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email ?? null,
        mobile: item.mobile1 ?? null,
        status,
        addMethod,
        invitationStatus: typeof raw.quickSetupInvitationStatus === 'string' ? (raw.quickSetupInvitationStatus as 'sent' | 'failed') : undefined,
        lastActionAt: formatEmployeeLastActionAt((raw.quickSetupLastActionAt as Date | string | null | undefined) ?? item.updatedAt ?? item.createdAt ?? null),
        avatarUrl: item.avatarUrl ?? undefined,
      };
    }),
    workGroupItems: workGroupList.map((item) => ({ id: item.id, title: item.title })),
    employeeImportJobs,
    defaultCalendarTemplate,
    tenantId,
    steps: [
      { key: 'location', title: 'محل کار اصلی', subtitle: 'ثبت محل کار اصلی و شعاع مجاز', done: Boolean(primaryLocation), href: '/locations/new', manageHref: '/locations', count: primaryLocation ? 1 : 0 },
      { key: 'calendar', title: 'تقویم کاری', subtitle: 'تقویم، تعطیلات و شیفت', done: calendars > 0, href: '/calendars?create=1', manageHref: '/calendars', count: calendars },
      { key: 'policy', title: 'سیاست‌های کاری', subtitle: 'قوانین حضور و غیاب', done: policies > 0, href: '/policies', manageHref: '/policies', count: policies },
      { key: 'employee', title: 'مدیریت کارکنان', subtitle: 'ثبت و دعوت اولیه کارکنان', done: employees > 0, href: '/employees/new', manageHref: '/employees', count: employees },
      { key: 'work-group', title: 'گروه‌های کاری', subtitle: 'اتصال افراد، محل و سیاست', done: workGroups > 0, href: '/work-groups/new', manageHref: '/work-groups', count: workGroups },
    ] satisfies QuickSetupStep[],
  };
}

export async function listLocations() {
  const tenantId = await requireTenantId();
  return listLocationsForTenant(tenantId);
}

export async function getLocation(id: string) {
  const tenantId = await requireTenantId();
  try {
    return await prisma.location.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        title: true,
        address: true,
        description: true,
        radius: true,
        latitude: true,
        longitude: true,
        isActive: true,
        isPrimaryOnboarding: true,
      },
    });
  } catch (error) {
    if (!isMissingLocationActiveColumn(error) && !isMissingPrimaryOnboardingColumn(error)) throw error;
    return prisma.location.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        title: true,
        address: true,
        description: true,
        radius: true,
        latitude: true,
        longitude: true,
      },
    });
  }
}

export async function listRequestReasons() {
  const tenantId = await requireTenantId();
  const categoryRows = await prisma.requestReason.groupBy({
    by: ['category'],
    where: { tenantId },
  });
  if (categoryRows.length < requestReasonCategories.length) {
    await ensureTenantDefaultRequestReasons(prisma, tenantId);
  }
  return prisma.requestReason.findMany({ where: { tenantId }, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] });
}

export async function getRequestReason(id: string) {
  const tenantId = await requireTenantId();
  return prisma.requestReason.findFirst({ where: { id, tenantId } });
}

export async function listOrganizationUnits() {
  const tenantId = await requireTenantId();
  return prisma.organizationUnit.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getOrganizationUnit(id: string) {
  const tenantId = await requireTenantId();
  return prisma.organizationUnit.findFirst({
    where: { id, tenantId },
  });
}

export async function listShiftTemplates() {
  const tenantId = await requireTenantId();
  return prisma.shiftTemplate.findMany({ where: { tenantId }, orderBy: { updatedAt: 'desc' } });
}

export async function listCalendars() {
  const tenantId = await requireTenantId();
  return prisma.calendar.findMany({ where: { tenantId }, orderBy: { updatedAt: 'desc' } });
}

function jsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export async function getCalendarDetails(
  calendarId: string,
  options?: { viewYear?: number; viewMonth?: number },
) {
  const tenantId = await requireTenantId();
  const [calendar, shiftTemplateRows] = await Promise.all([
    prisma.calendar.findFirst({ where: { id: calendarId, tenantId } }),
    prisma.shiftTemplate.findMany({ where: { tenantId, isActive: true }, orderBy: { updatedAt: 'desc' } }),
  ]);
  if (!calendar) return null;

  const shiftTemplates: ShiftTemplatePickerItem[] = shiftTemplateRows.map((item) =>
    mapShiftTemplateRecord({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      weekDays: item.weekDays,
      config: item.config,
    }),
  );

  const weekends = jsonArray<string>(calendar.weekends);
  const singleHolidays = parseCalendarStoredEvents(calendar.singleHolidays);
  const shifts = listCalendarShifts(calendar.shiftConfig);
  const excludedShiftDates = listExcludedShiftDates(calendar.shiftConfig).map((date) =>
    normalizePersianDateInput(date),
  );
  const weekendOverrideDates = listWeekendOverrideDates(calendar.shiftConfig).map((date) =>
    normalizePersianDateInput(date),
  );
  const shiftCounts = countShiftsByType(shifts);

  const start = parsePersianYmd(calendar.startDate);
  const end = parsePersianYmd(calendar.endDate);
  if (!start || !end) return null;

  const today = getPersianPartsFromDate();
  const defaultView = resolveDefaultViewMonth({ start, end }, today);
  const requestedYear = options?.viewYear;
  const requestedMonth = options?.viewMonth;
  const viewYear =
    requestedYear && requestedMonth
      ? clampPersianMonth(requestedYear, requestedMonth, { start, end }).year
      : defaultView.year;
  const viewMonth =
    requestedYear && requestedMonth
      ? clampPersianMonth(requestedYear, requestedMonth, { start, end }).month
      : defaultView.month;

  const cells = buildMonthCells({
    year: viewYear,
    month: viewMonth,
    bounds: { start, end },
    weekends,
    singleHolidays,
    shifts,
    excludedShiftDates,
    weekendOverrideDates,
  });

  const yearNumber = Number(calendar.yearLabel.replace(/[^\d]/g, '')) || viewYear;
  const defaultSelectedDay =
    today.year === viewYear && today.month === viewMonth && isPersianYmdInRange(today, start, end)
      ? today.day
      : cells.find((cell) => cell.day !== null)?.day ?? 1;

  const prevMonth =
    viewMonth === 1
      ? { year: viewYear - 1, month: 12 }
      : { year: viewYear, month: viewMonth - 1 };
  const nextMonth =
    viewMonth === 12
      ? { year: viewYear + 1, month: 1 }
      : { year: viewYear, month: viewMonth + 1 };

  const canGoPrev =
    prevMonth.year > start.year ||
    (prevMonth.year === start.year && prevMonth.month >= start.month);
  const canGoNext =
    nextMonth.year < end.year || (nextMonth.year === end.year && nextMonth.month <= end.month);

  return {
    id: calendar.id,
    title: calendar.title,
    description: calendar.description,
    status: calendar.status,
    yearLabel: calendar.yearLabel,
    yearNumber,
    viewYear,
    viewMonth,
    monthName: PERSIAN_MONTH_NAMES[viewMonth - 1] ?? '',
    monthNumber: viewMonth,
    startDate: calendar.startDate,
    endDate: calendar.endDate,
    bounds: { start, end },
    weekends,
    singleHolidays,
    shifts: shifts as StoredCalendarShift[],
    excludedShiftDates,
    weekendOverrideDates,
    shiftCount: shifts.length,
    shiftLegend: CALENDAR_SHIFT_LEGEND.map((item) => ({ ...item, count: shiftCounts[item.key] })),
    eventCount: calendar.totalEventDays,
    holidayCount: calendar.holidayCount,
    otherEventCount: singleHolidays.filter((item) => item.isHoliday === false).length,
    gridLegend: [
      ...CALENDAR_SHIFT_LEGEND.map((item) => ({ label: item.label, color: item.color })),
      { label: 'تعطیلات', color: '#ef4444' },
      { label: 'سایر رویداد ها', color: '#94a3b8' },
    ],
    cells,
    defaultSelectedDay,
    canGoPrev,
    canGoNext,
    prevMonth,
    nextMonth,
    shiftTemplates,
  };
}

export async function listPolicies() {
  const tenantId = await requireTenantId();
  return prisma.workPolicy.findMany({
    where: { tenantId },
    include: { calendar: true, workGroups: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function listDefaultPolicies() {
  const tenantId = await requireTenantId();
  return prisma.workPolicy.findMany({
    where: { tenantId, isDefault: true },
    include: { calendar: true },
    orderBy: { createdAt: 'asc' },
  });
}

type EmployeeListFilters = {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  assignment?: 'all' | 'assigned' | 'unassigned';
  createdFrom?: string;
  createdTo?: string;
};

function normalizeSearchTerm(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function parseDateInput(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function listEmployees(options?: EmployeeListFilters) {
  const tenantId = await requireTenantId();
  const search = options?.search ? normalizeSearchTerm(options.search) : '';
  const createdFrom = parseDateInput(options?.createdFrom);
  const createdTo = parseDateInput(options?.createdTo);
  const andConditions: any[] = [];

  if (options?.status === 'active') {
    andConditions.push({ isActive: true });
  } else if (options?.status === 'inactive') {
    andConditions.push({ isActive: false });
  }

  if (createdFrom || createdTo) {
    andConditions.push({
      createdAt: {
        ...(createdFrom ? { gte: createdFrom } : {}),
        ...(createdTo ? { lte: createdTo } : {}),
      },
    });
  }

  if (options?.assignment === 'assigned') {
    andConditions.push({
      OR: [
        { organizationUnits: { some: { organizationUnit: { tenantId } } } },
        { workGroupMemberships: { some: { isCurrent: true, workGroup: { tenantId } } } },
      ],
    });
  } else if (options?.assignment === 'unassigned') {
    andConditions.push({
      organizationUnits: { none: { organizationUnit: { tenantId } } },
      workGroupMemberships: { none: { isCurrent: true, workGroup: { tenantId } } },
    });
  }

  if (search) {
    andConditions.push({
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile1: { contains: search, mode: 'insensitive' } },
        { mobile2: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search, mode: 'insensitive' } },
        { personnelCode: { contains: search, mode: 'insensitive' } },
        { organizationUnits: { some: { organizationUnit: { title: { contains: search, mode: 'insensitive' } } } } },
        { workGroupMemberships: { some: { workGroup: { title: { contains: search, mode: 'insensitive' } } } } },
      ],
    });
  }

  const where = andConditions.length ? { tenantId, AND: andConditions } : { tenantId };

  return prisma.employee.findMany({
    where,
    include: {
      organizationUnits: {
        where: { organizationUnit: { tenantId } },
        include: { organizationUnit: { select: { id: true, title: true } } },
      },
      workGroupMemberships: {
        where: { workGroup: { tenantId }, isCurrent: true },
        include: { workGroup: { select: { id: true, title: true } } },
      },
    },
    orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getEmployee(id: string) {
  const tenantId = await requireTenantId();
  return prisma.employee.findFirst({
    where: { id, tenantId },
    include: {
      organizationUnits: { where: { organizationUnit: { tenantId } }, include: { organizationUnit: true } },
      workGroupMemberships: { where: { workGroup: { tenantId }, isCurrent: true }, include: { workGroup: true } },
    },
  });
}

export async function listWorkGroups() {
  const tenantId = await requireTenantId();
  return prisma.workGroup.findMany({
    where: { tenantId },
    include: {
      location: { select: locationSummarySelect },
      policy: { include: { calendar: true } },
      members: {
        where: { employee: { tenantId } },
        include: { employee: true },
        orderBy: { joinedAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getWorkGroup(id: string) {
  const tenantId = await requireTenantId();
  return prisma.workGroup.findFirst({
    where: { id, tenantId },
    include: {
      location: { select: locationSummarySelect },
      policy: { include: { calendar: true } },
      members: {
        where: { employee: { tenantId } },
        include: { employee: true },
        orderBy: { joinedAt: 'desc' },
      },
    },
  });
}

function parseDraftTemplateBody(body: string | null | undefined): ContractDraftTemplate | null {
  if (!body) return null;
  try {
    return normalizeContractDraftTemplate(JSON.parse(body));
  } catch {
    return null;
  }
}

export async function listDraftTemplates(): Promise<ContractDraftTemplate[]> {
  const tenantId = await requireTenantId();
  const rows = await prisma.draftTemplate.findMany({ where: { tenantId }, orderBy: { updatedAt: 'desc' } });
  return rows.map((row) => parseDraftTemplateBody(row.body) ?? normalizeContractDraftTemplate({
    id: row.id,
    name: row.title,
    usageType: 'payroll_attendance',
    baseSettingsYear: new Date(row.createdAt).getFullYear(),
    baseSettingsId: '',
    status: 'draft',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    stepsProgress: {
      openedStepIds: [],
      completedStepIds: [],
      currentStepId: 'classification',
      dirtyStepIds: [],
      savedStepIds: [],
    },
    data: {},
  }))
    .filter((item): item is ContractDraftTemplate => Boolean(item));
}

export async function getDraftTemplate(id: string): Promise<ContractDraftTemplate | null> {
  const tenantId = await requireTenantId();
  const row = await prisma.draftTemplate.findFirst({ where: { id, tenantId } });
  if (!row) return null;
  return parseDraftTemplateBody(row.body) ?? null;
}
