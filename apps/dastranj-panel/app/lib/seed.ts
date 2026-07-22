'use server';

import { Decimal } from '@prisma/client/runtime/library';
import { Prisma, type PrismaClient } from './prisma-client';
import { ensureTenantDefaultRequestReasons } from './request-reason-defaults';

const demoCalendars1404 = [
  {
    title: 'تقویم عمومی ۱۴۰۴',
    description: 'تقویم پایه سازمان با تعطیلات رسمی',
    status: 'active' as const,
    holidayCount: 27,
    totalShiftDays: 261,
    totalEventDays: 27,
  },
  {
    title: 'تقویم پروژه نیروگاه',
    description: 'تقویم مخصوص تیم پروژه با تعطیلات اختصاصی',
    status: 'inactive' as const,
    holidayCount: 18,
    totalShiftDays: 289,
    totalEventDays: 18,
  },
];

export async function ensureDemoCalendars(prisma: PrismaClient, tenantId: string) {
  const existing = await prisma.calendar.findMany({
    where: { tenantId, title: { in: demoCalendars1404.map((item) => item.title) } },
    select: { title: true },
  });
  const existingTitles = new Set(existing.map((item) => item.title));
  const shiftTemplate = await prisma.shiftTemplate.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'asc' },
  });

  for (const item of demoCalendars1404) {
    if (existingTitles.has(item.title)) continue;

    await prisma.calendar.create({
      data: {
        tenantId,
        title: item.title,
        description: item.description,
        yearLabel: '1404',
        startDate: '2025-03-21',
        endDate: '2026-03-20',
        shiftTitle: shiftTemplate?.title ?? '',
        shiftTypeLabel: 'ثابت',
        status: item.status,
        holidayCount: item.holidayCount,
        totalShiftDays: item.totalShiftDays,
        totalEventDays: item.totalEventDays,
      },
    });
  }
}

const organizationTemplateSeeds = [
  { name: 'ساختار پایه شرکت خدماتی', root: 'عملیات خدمات', child: 'پشتیبانی مشتریان', positions: ['مدیر عملیات', 'کارشناس پشتیبانی'] },
  { name: 'ساختار پایه شرکت ساختمانی', root: 'مدیریت پروژه', child: 'کارگاه و اجرا', positions: ['مدیر پروژه', 'سرپرست کارگاه'] },
  { name: 'ساختار پایه شرکت فروشگاهی', root: 'عملیات فروشگاه', child: 'فروش و صندوق', positions: ['مدیر فروشگاه', 'کارشناس فروش'] },
  { name: 'ساختار پایه شرکت تولیدی', root: 'مدیریت تولید', child: 'کنترل کیفیت', positions: ['مدیر تولید', 'کارشناس کنترل کیفیت'] },
  { name: 'ساختار پایه شرکت فناوری', root: 'فناوری و محصول', child: 'توسعه نرم‌افزار', positions: ['مدیر فناوری', 'توسعه‌دهنده نرم‌افزار'] },
  { name: 'ساختار پایه سازمان عمومی', root: 'مدیریت اداری', child: 'منابع انسانی', positions: ['مدیر اداری', 'کارشناس منابع انسانی'] },
];

export async function ensureTenantOrganizationTemplates(prisma: PrismaClient, tenantId: string) {
  for (const seed of organizationTemplateSeeds) {
    const template = await prisma.organizationStructureTemplate.upsert({
      where: { tenantId_name: { tenantId, name: seed.name } },
      create: { tenantId, name: seed.name, description: `قالب پیشنهادی قابل سفارشی‌سازی برای ${seed.name.replace('ساختار پایه ', '')}`, status: 'ACTIVE' },
      update: {},
      include: { units: { select: { id: true } } },
    });
    if (template.units.length) continue;
    const root = await prisma.organizationStructureTemplateUnit.create({ data: { templateId: template.id, name: seed.root, type: 'DIVISION', displayOrder: 0, status: 'ACTIVE' } });
    const child = await prisma.organizationStructureTemplateUnit.create({ data: { templateId: template.id, parentTemplateUnitId: root.id, name: seed.child, type: 'DEPARTMENT', displayOrder: 1, status: 'ACTIVE' } });
    await prisma.organizationStructureTemplatePosition.createMany({ data: [
      { templateUnitId: root.id, title: seed.positions[0], capacity: 1, status: 'ACTIVE', displayOrder: 0 },
      { templateUnitId: child.id, title: seed.positions[1], capacity: 2, status: 'ACTIVE', displayOrder: 0 },
    ] });
  }
}

export async function seedSampleData(prisma: PrismaClient, tenantId: string) {
  await ensureDemoCalendars(prisma, tenantId);
  await ensureTenantDefaultRequestReasons(prisma, tenantId);
  await ensureTenantOrganizationTemplates(prisma, tenantId);

  const businessProfileCount = await prisma.businessProfile.count({ where: { tenantId } });
  if (businessProfileCount > 0) return;

  const location = await prisma.location.create({
    data: {
      tenantId,
      title: 'دفتر مرکزی',
      address: 'تهران، خیابان ولیعصر، پلاک 21',
      radius: 120,
      latitude: new Decimal('35.725221'),
      longitude: new Decimal('51.391588'),
      description: 'مبدا ثبت تردد تیم ستادی',
    },
  });

  const orgUnits = await prisma.$transaction([
    prisma.organizationUnit.create({ data: { tenantId, title: 'برنامه نویسی', description: null } }),
    prisma.organizationUnit.create({
      data: {
        tenantId,
        title: 'منابع انسانی',
        description: 'مدیریت امور پرسنلی، جذب و فرآیندهای منابع انسانی',
      },
    }),
    prisma.organizationUnit.create({
      data: {
        tenantId,
        title: 'مالی',
        description: 'رسیدگی به امور مالی، پرداخت‌ها و گزارش‌های مالی سازمان',
      },
    }),
  ]);

  await prisma.businessProfile.create({
    data: {
      tenantId,
      brandName: 'دسترنج',
      legalName: 'دسترنج پلاس',
      phone: '02188550000',
      contactEmail: 'hello@dastranj.local',
      address: 'تهران، خیابان ولیعصر',
      payrollPackageEnabled: true,
      quickSetupStatus: 'in_progress',
    },
  });

  const shiftTemplate = await prisma.shiftTemplate.create({
    data: {
      tenantId,
      title: 'شیفت صبح اداری',
      description: 'شنبه تا چهارشنبه 8 تا 16:30',
      type: 'fixed',
      weekDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه'],
      config: { startTime: '08:00', endTime: '16:30', requiredMinutes: 510 },
      breaks: [{ startTime: '13:00', endTime: '14:00', deducted: true }],
    },
  });

  await prisma.calendar.updateMany({
    where: { tenantId, yearLabel: '1404' },
    data: { shiftTitle: shiftTemplate.title, shiftTypeLabel: 'ثابت' },
  });

  const calendar = await prisma.calendar.findFirst({
    where: { tenantId, title: 'تقویم عمومی ۱۴۰۴' },
  });

  if (!calendar) {
    throw new Error('Demo calendars for 1404 were not created.');
  }

  await prisma.calendar.create({
    data: {
      tenantId,
      title: 'تقویم کاری 1405',
      description: 'تقویم پایه شرکت برای سال 1405',
      yearLabel: '1405',
      startDate: '2026-03-21',
      endDate: '2027-03-20',
      shiftTitle: shiftTemplate.title,
      shiftTypeLabel: 'ثابت',
      holidayCount: 26,
      totalShiftDays: 286,
      totalEventDays: 26,
    },
  });

  const policy = await prisma.workPolicy.create({
    data: {
      tenantId,
      title: 'سیاست پایه اداری',
      description: 'الگوی پیش فرض تردد و مرخصی',
      calendarId: calendar.id,
      employeeCount: 2,
      sectionValues: { manualAttendance: true, overtimeFromAttendance: true, nightWorkStart: '22:00' },
    },
  });

  const employees = await prisma.$transaction([
    prisma.employee.create({
      data: {
        tenantId,
        firstName: 'طاها',
        lastName: 'علینقی',
        nationalId: '1234567890',
        mobile1: '09120000001',
        email: 'taha@example.com',
        personnelCode: 'HR-101',
        bankAccounts: [{ bankName: 'ملت', cardNumber: '6037991234567890', sheba: 'IR820540102680020817909002', isPrimary: true }],
        guarantees: [{ kind: 'check', referenceNumber: '100245', amount: '50000000' }],
      },
    }),
    prisma.employee.create({
      data: {
        tenantId,
        firstName: 'علی',
        lastName: 'محمدی',
        nationalId: '1234567891',
        mobile1: '09120000002',
        maritalStatus: 'married',
        childrenCount: 1,
        personnelCode: 'FN-204',
      },
    }),
  ]);

  await prisma.employeeOrganizationUnit.createMany({
    data: [
      { employeeId: employees[0].id, organizationUnitId: orgUnits[1].id },
      { employeeId: employees[1].id, organizationUnitId: orgUnits[2].id },
    ],
  });

  const workGroup = await prisma.workGroup.create({
    data: {
      tenantId,
      title: 'تیم ستادی',
      description: 'تیم مرکزی عملیات و منابع انسانی',
      tags: ['ستاد', 'اداری'],
      locationId: location.id,
      policyId: policy.id,
    },
  });

  await prisma.workGroupMember.createMany({
    data: [
      { workGroupId: workGroup.id, employeeId: employees[0].id, accessLevel: 'manager' },
      { workGroupId: workGroup.id, employeeId: employees[1].id, accessLevel: 'employee' },
    ],
  });

  await prisma.draftTemplate.createMany({
    data: [
      { tenantId, title: 'پیش نویس قرارداد حقوق ماهانه', description: 'نسخه پایه برای قراردادهای ماهانه', category: 'payroll', body: 'حقوق پایه + مزایا + بیمه و مالیات' },
      { tenantId, title: 'پیش نویس سیاست حضور', description: 'قالب اولیه برای سیاست حضور و غیاب', category: 'attendance', body: 'الگوی ورود، خروج، مرخصی و اضافه کاری' },
    ],
  });
}
