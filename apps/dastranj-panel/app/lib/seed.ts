'use server';

import { Prisma, type PrismaClient } from '../../node_modules/.prisma/client';

export async function seedSampleData(prisma: PrismaClient, tenantId: string) {
  const businessProfileCount = await prisma.businessProfile.count({ where: { tenantId } });
  if (businessProfileCount > 0) return;

  const location = await prisma.location.create({
    data: {
      tenantId,
      title: 'دفتر مرکزی',
      address: 'تهران، خیابان ولیعصر، پلاک 21',
      radius: 120,
      latitude: new Prisma.Decimal('35.725221'),
      longitude: new Prisma.Decimal('51.391588'),
      description: 'مبدا ثبت تردد تیم ستادی',
    },
  });

  const orgUnits = await prisma.$transaction([
    prisma.organizationUnit.create({ data: { tenantId, title: 'منابع انسانی', description: 'جذب، قراردادها و فرایندهای پرسنلی' } }),
    prisma.organizationUnit.create({ data: { tenantId, title: 'مالی', description: 'پرداخت و گزارش های مالی' } }),
    prisma.organizationUnit.create({ data: { tenantId, title: 'عملیات', description: 'اجرای روزانه و پشتیبانی' } }),
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

  await prisma.requestReason.createMany({
    data: [
      { tenantId, title: 'اصلاح ورود', description: 'ثبت درخواست اصلاح ورود', category: 'attendance', displayOrder: 1 },
      { tenantId, title: 'دورکاری روزانه', description: 'ثبت دورکاری برای یک روز', category: 'remote_work', displayOrder: 2 },
      { tenantId, title: 'ماموریت خارج شرکت', description: 'ثبت ماموریت ساعتی یا روزانه', category: 'mission', displayOrder: 3 },
      { tenantId, title: 'مرخصی ساعتی', description: 'مرخصی ساعتی استحقاقی', category: 'annual_leave', displayOrder: 4 },
    ],
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

  const calendar = await prisma.calendar.create({
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
      { employeeId: employees[0].id, organizationUnitId: orgUnits[0].id },
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
