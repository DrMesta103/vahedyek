import { getSessionContext } from './auth';
import { getGlobalDefaultCalendarTemplate } from './calendar-defaults';
import { prisma } from './prisma';
import type { QuickSetupStep } from '../(panel)/quick-setup/_components/quick-setup.types';

async function getTenantId(): Promise<string | null> {
  const session = await getSessionContext();
  return session?.tenantId ?? null;
}

async function requireTenantId(): Promise<string> {
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error('Active tenant is required for panel data access.');
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
    prisma.location.findMany({ where, orderBy: { createdAt: 'desc' }, take: 10 }),
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

  const locations = locationList.length;

  return {
    profile,
    locationItems: locationList.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      radius: item.radius,
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
      templateId: String((item.sectionValues as { templateId?: string } | null)?.templateId ?? 'custom'),
      templateTitle: String((item.sectionValues as { templateTitle?: string } | null)?.templateTitle ?? item.title),
      year: item.calendar?.yearLabel ?? '',
    })),
    employeeItems: employeeList.map((item) => ({
      id: item.id,
      firstName: item.firstName,
      lastName: item.lastName,
      nationalId: item.nationalId ?? '',
      contact: item.email
        ? { type: 'email' as const, value: item.email }
        : { type: 'phone' as const, value: item.mobile1 ?? '' },
      avatarUrl: item.avatarUrl ?? undefined,
    })),
    workGroupItems: workGroupList.map((item) => ({ id: item.id, title: item.title })),
    defaultCalendarTemplate,
    tenantId,
    steps: [
      { key: 'location', title: 'محل کار', subtitle: 'ثبت محل کار و شعاع مجاز', done: locations > 0, href: '/locations/new', manageHref: '/locations', count: locations },
      { key: 'calendar', title: 'تقویم کاری', subtitle: 'تقویم، تعطیلات و شیفت', done: calendars > 0, href: '/calendars/new', manageHref: '/calendars', count: calendars },
      { key: 'policy', title: 'سیاست‌های کاری', subtitle: 'قوانین حضور و غیاب', done: policies > 0, href: '/policies', manageHref: '/policies', count: policies },
      { key: 'employee', title: 'مدیریت کارکنان', subtitle: 'ساخت پرونده پرسنلی', done: employees > 0, href: '/employees/new', manageHref: '/employees', count: employees },
      { key: 'work-group', title: 'گروه‌های کاری', subtitle: 'اتصال افراد، محل و سیاست', done: workGroups > 0, href: '/work-groups/new', manageHref: '/work-groups', count: workGroups },
    ] satisfies QuickSetupStep[],
  };
}

export async function listLocations() {
  const tenantId = await requireTenantId();
  return prisma.location.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
}

export async function getLocation(id: string) {
  const tenantId = await requireTenantId();
  return prisma.location.findFirst({ where: { id, tenantId } });
}

export async function listRequestReasons() {
  const tenantId = await requireTenantId();
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

export async function listEmployees() {
  const tenantId = await requireTenantId();
  return prisma.employee.findMany({
    where: { tenantId },
    include: {
      organizationUnits: { where: { organizationUnit: { tenantId } }, include: { organizationUnit: true } },
      workGroupMemberships: { where: { workGroup: { tenantId } }, include: { workGroup: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEmployee(id: string) {
  const tenantId = await requireTenantId();
  return prisma.employee.findFirst({
    where: { id, tenantId },
    include: {
      organizationUnits: { where: { organizationUnit: { tenantId } }, include: { organizationUnit: true } },
      workGroupMemberships: { where: { workGroup: { tenantId } }, include: { workGroup: true } },
    },
  });
}

export async function listWorkGroups() {
  const tenantId = await requireTenantId();
  return prisma.workGroup.findMany({
    where: { tenantId },
    include: {
      location: true,
      policy: { include: { calendar: true } },
      members: { where: { employee: { tenantId } }, include: { employee: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function listDraftTemplates() {
  const tenantId = await requireTenantId();
  return prisma.draftTemplate.findMany({ where: { tenantId }, orderBy: { updatedAt: 'desc' } });
}
