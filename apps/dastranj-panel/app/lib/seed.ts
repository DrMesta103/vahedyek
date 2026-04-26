'use server';

import type { PrismaClient } from '@prisma/client';

export async function seedSampleData(prisma: PrismaClient) {
  const businessProfileCount = await prisma.businessProfile.count();
  if (businessProfileCount > 0) return;

  const location = await prisma.location.create({
    data: {
      title: 'دفتر مرکزی',
      address: 'تهران، خیابان ولیعصر، پلاک ۲۱',
      radius: 120,
      description: 'مبدا ثبت تردد تیم ستادی',
    },
  });

  const orgUnits = await prisma.$transaction([
    prisma.organizationUnit.create({ data: { title: 'منابع انسانی', description: 'جذب، قراردادها و فرایندهای پرسنلی' } }),
    prisma.organizationUnit.create({ data: { title: 'مالی', description: 'پرداخت و گزارش‌های مالی' } }),
    prisma.organizationUnit.create({ data: { title: 'عملیات', description: 'اجرای روزانه و پشتیبانی' } }),
  ]);

  await prisma.businessProfile.create({
    data: {
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
      { title: 'اصلاح ورود', description: 'ثبت درخواست اصلاح ورود', category: 'attendance', displayOrder: 1 },
      { title: 'دورکاری روزانه', description: 'ثبت دورکاری برای یک روز', category: 'remote_work', displayOrder: 2 },
      { title: 'ماموریت خارج شرکت', description: 'ثبت ماموریت ساعتی یا روزانه', category: 'mission', displayOrder: 3 },
      { title: 'مرخصی ساعتی', description: 'مرخصی ساعتی استحقاقی', category: 'annual_leave', displayOrder: 4 },
    ],
  });

  const shiftTemplate = await prisma.shiftTemplate.create({
    data: {
      title: 'شیفت صبح اداری',
      description: 'شنبه تا چهارشنبه ۸ تا ۱۶:۳۰',
      type: 'fixed',
      weekDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'],
      config: { startTime: '08:00', endTime: '16:30', requiredMinutes: 510 },
      breaks: [{ startTime: '13:00', endTime: '14:00', deducted: true }],
    },
  });

  const calendar = await prisma.calendar.create({
    data: {
      title: 'تقویم کاری ۱۴۰۵',
      description: 'تقویم پایه شرکت برای سال ۱۴۰۵',
      yearLabel: '۱۴۰۵',
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
      title: 'سیاست پایه اداری',
      description: 'الگوی پیش‌فرض تردد و مرخصی',
      calendarId: calendar.id,
      employeeCount: 2,
      sectionValues: { manualAttendance: true, overtimeFromAttendance: true, nightWorkStart: '22:00' },
    },
  });

  const employees = await prisma.$transaction([
    prisma.employee.create({
      data: {
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
      { title: 'پیش‌نویس قرارداد حقوق ماهانه', description: 'نسخه پایه برای قراردادهای ماهانه', category: 'payroll', body: 'حقوق پایه + مزایا + بیمه و مالیات' },
      { title: 'پیش‌نویس سیاست حضور', description: 'قالب اولیه برای سیاست حضور و غیاب', category: 'attendance', body: 'الگوی ورود، خروج، مرخصی و اضافه‌کاری' },
    ],
  });
}
