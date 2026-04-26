import { prisma } from './prisma';

export async function getBusinessProfile() {
  return prisma.businessProfile.findFirst({ orderBy: { createdAt: 'asc' } });
}

export async function getDashboardData() {
  const [profile, locations, calendars, policies, employees, workGroups, draftTemplates, requestReasons] = await Promise.all([
    getBusinessProfile(),
    prisma.location.count(),
    prisma.calendar.count(),
    prisma.workPolicy.count(),
    prisma.employee.count(),
    prisma.workGroup.count(),
    prisma.draftTemplate.count(),
    prisma.requestReason.count(),
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
  const [profile, locations, calendars, policies, employees, workGroups] = await Promise.all([
    getBusinessProfile(),
    prisma.location.count(),
    prisma.calendar.count(),
    prisma.workPolicy.count(),
    prisma.employee.count(),
    prisma.workGroup.count(),
  ]);

  return {
    profile,
    steps: [
      { key: 'location', title: 'محل کار', subtitle: 'ثبت محل کار و شعاع مجاز', done: locations > 0, href: '/locations/new', manageHref: '/locations', count: locations },
      { key: 'calendar', title: 'تقویم کاری', subtitle: 'تقویم، تعطیلات و شیفت', done: calendars > 0, href: '/calendars/new', manageHref: '/calendars', count: calendars },
      { key: 'policy', title: 'سیاست‌های کاری', subtitle: 'قوانین حضور و غیاب', done: policies > 0, href: '/policies/new', manageHref: '/policies', count: policies },
      { key: 'employee', title: 'مدیریت کارکنان', subtitle: 'ساخت پرونده پرسنلی', done: employees > 0, href: '/employees/new', manageHref: '/employees', count: employees },
      { key: 'work-group', title: 'گروه‌های کاری', subtitle: 'اتصال افراد، محل و سیاست', done: workGroups > 0, href: '/work-groups/new', manageHref: '/work-groups', count: workGroups },
    ],
  };
}

export async function getBusinessSettingsData() {
  const [locations, requestReasons, organizationUnits, shiftTemplates, calendars, policies, draftTemplates, employees] = await Promise.all([
    prisma.location.count(),
    prisma.requestReason.count(),
    prisma.organizationUnit.count(),
    prisma.shiftTemplate.count(),
    prisma.calendar.count(),
    prisma.workPolicy.count(),
    prisma.draftTemplate.count(),
    prisma.employee.count(),
  ]);

  return [
    { title: 'محل کار', description: 'مدیریت موقعیت‌ها و شعاع مجاز', href: '/locations', count: locations },
    { title: 'دلایل درخواست', description: 'مدیریت درخواست‌های سازمانی', href: '/request-reasons', count: requestReasons },
    { title: 'واحدهای سازمانی', description: 'تعریف ساختار سازمان', href: '/organization-units', count: organizationUnits },
    { title: 'قالب شیفت', description: 'مدیریت الگوهای شیفت', href: '/shift-templates', count: shiftTemplates },
    { title: 'تقویم کاری', description: 'تقویم‌ها و تعطیلات', href: '/calendars', count: calendars },
    { title: 'سیاست کاری', description: 'قوانین حضور و غیاب', href: '/policies', count: policies },
    { title: 'کارمندان', description: 'مدیریت تیم و اطلاعات پرسنلی', href: '/employees', count: employees },
    { title: 'پیش‌نویس قرارداد', description: 'قالب‌های قرارداد و حقوق', href: '/draft-templates', count: draftTemplates },
  ];
}

export async function listLocations() {
  return prisma.location.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function listRequestReasons() {
  return prisma.requestReason.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] });
}

export async function listOrganizationUnits() {
  return prisma.organizationUnit.findMany({
    include: { employees: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listShiftTemplates() {
  return prisma.shiftTemplate.findMany({ orderBy: { updatedAt: 'desc' } });
}

export async function listCalendars() {
  return prisma.calendar.findMany({ orderBy: { updatedAt: 'desc' } });
}

export async function listPolicies() {
  return prisma.workPolicy.findMany({
    include: { calendar: true, workGroups: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function listEmployees() {
  return prisma.employee.findMany({
    include: {
      organizationUnits: {
        include: { organizationUnit: true },
      },
      workGroupMemberships: {
        include: { workGroup: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEmployee(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      organizationUnits: {
        include: { organizationUnit: true },
      },
      workGroupMemberships: {
        include: { workGroup: true },
      },
    },
  });
}

export async function listWorkGroups() {
  return prisma.workGroup.findMany({
    include: {
      location: true,
      policy: { include: { calendar: true } },
      members: {
        include: { employee: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function listDraftTemplates() {
  return prisma.draftTemplate.findMany({ orderBy: { updatedAt: 'desc' } });
}
