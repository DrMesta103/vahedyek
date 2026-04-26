'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';
import { seedSampleData } from './seed';

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function boolValue(formData: FormData, key: string) {
  return formData.get(key) === 'on';
}

export async function seedSampleDataAction() {
  await seedSampleData(prisma);
  revalidatePath('/');
  redirect('/quick-setup');
}

export async function saveBusinessProfileAction(formData: FormData) {
  const current = await prisma.businessProfile.findFirst();
  const data = {
    brandName: value(formData, 'brandName'),
    legalName: value(formData, 'legalName') || null,
    contactEmail: value(formData, 'contactEmail') || null,
    phone: value(formData, 'phone') || null,
    address: value(formData, 'address') || null,
    payrollPackageEnabled: boolValue(formData, 'payrollPackageEnabled'),
    quickSetupStatus: (value(formData, 'quickSetupStatus') || 'in_progress') as 'pending' | 'in_progress' | 'completed',
  };

  if (current) {
    await prisma.businessProfile.update({ where: { id: current.id }, data });
  } else {
    await prisma.businessProfile.create({ data });
  }
  revalidatePath('/account');
  revalidatePath('/');
}

export async function createLocationAction(formData: FormData) {
  await prisma.location.create({
    data: {
      title: value(formData, 'title'),
      address: value(formData, 'address'),
      radius: Number(value(formData, 'radius') || '100'),
      description: value(formData, 'description') || null,
    },
  });
  revalidatePath('/locations');
  revalidatePath('/quick-setup');
  redirect('/locations');
}

export async function createRequestReasonAction(formData: FormData) {
  const lastOrder = await prisma.requestReason.aggregate({ _max: { displayOrder: true } });
  await prisma.requestReason.create({
    data: {
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
      category: value(formData, 'category') as never,
      isActive: boolValue(formData, 'isActive'),
      displayOrder: (lastOrder._max.displayOrder ?? 0) + 1,
    },
  });
  revalidatePath('/request-reasons');
  redirect('/request-reasons');
}

export async function createOrganizationUnitAction(formData: FormData) {
  await prisma.organizationUnit.create({
    data: {
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
    },
  });
  revalidatePath('/organization-units');
  redirect('/organization-units');
}

export async function createShiftTemplateAction(formData: FormData) {
  await prisma.shiftTemplate.create({
    data: {
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
      type: value(formData, 'type') as never,
      weekDays: value(formData, 'weekDays').split(',').map((item) => item.trim()).filter(Boolean),
      config: {
        startTime: value(formData, 'startTime'),
        endTime: value(formData, 'endTime'),
        requiredMinutes: Number(value(formData, 'requiredMinutes') || '0'),
      },
      breaks: [],
      isActive: boolValue(formData, 'isActive'),
    },
  });
  revalidatePath('/shift-templates');
  redirect('/shift-templates');
}

export async function createCalendarAction(formData: FormData) {
  await prisma.calendar.create({
    data: {
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
      yearLabel: value(formData, 'yearLabel'),
      startDate: value(formData, 'startDate'),
      endDate: value(formData, 'endDate'),
      shiftTitle: value(formData, 'shiftTitle'),
      shiftTypeLabel: value(formData, 'shiftTypeLabel'),
      holidayCount: Number(value(formData, 'holidayCount') || '0'),
      totalShiftDays: Number(value(formData, 'totalShiftDays') || '0'),
      totalEventDays: Number(value(formData, 'totalEventDays') || '0'),
      status: value(formData, 'status') as never,
    },
  });
  revalidatePath('/calendars');
  revalidatePath('/quick-setup');
  redirect('/calendars');
}

export async function createPolicyAction(formData: FormData) {
  const calendarId = value(formData, 'calendarId') || null;
  await prisma.workPolicy.create({
    data: {
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
      calendarId,
      employeeCount: Number(value(formData, 'employeeCount') || '0'),
      sectionValues: {
        manualAttendance: boolValue(formData, 'manualAttendance'),
        overtimeFromAttendance: boolValue(formData, 'overtimeFromAttendance'),
        nightWorkStart: value(formData, 'nightWorkStart') || '22:00',
      },
    },
  });
  revalidatePath('/policies');
  revalidatePath('/quick-setup');
  redirect('/policies');
}

export async function createEmployeeAction(formData: FormData) {
  const unitIds = formData.getAll('organizationUnitIds').map(String);
  await prisma.employee.create({
    data: {
      firstName: value(formData, 'firstName'),
      lastName: value(formData, 'lastName'),
      nationalId: value(formData, 'nationalId') || null,
      mobile1: value(formData, 'mobile1') || null,
      mobile2: value(formData, 'mobile2') || null,
      email: value(formData, 'email') || null,
      personnelCode: value(formData, 'personnelCode') || null,
      maritalStatus: (value(formData, 'maritalStatus') || 'single') as never,
      childrenCount: Number(value(formData, 'childrenCount') || '0'),
      isActive: boolValue(formData, 'isActive'),
      canEditIdentityPhoto: boolValue(formData, 'canEditIdentityPhoto'),
      organizationUnits: {
        create: unitIds.map((organizationUnitId) => ({ organizationUnitId })),
      },
    },
  });
  revalidatePath('/employees');
  revalidatePath('/quick-setup');
  redirect('/employees');
}

export async function createWorkGroupAction(formData: FormData) {
  const employeeIds = formData.getAll('employeeIds').map(String);
  await prisma.workGroup.create({
    data: {
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
      tags: value(formData, 'tags').split(',').map((item) => item.trim()).filter(Boolean),
      locationId: value(formData, 'locationId') || null,
      policyId: value(formData, 'policyId') || null,
      members: {
        create: employeeIds.map((employeeId) => ({
          employeeId,
          accessLevel: (value(formData, `accessLevel:${employeeId}`) || 'employee') as never,
        })),
      },
    },
  });
  revalidatePath('/work-groups');
  revalidatePath('/quick-setup');
  redirect('/work-groups');
}

export async function createDraftTemplateAction(formData: FormData) {
  await prisma.draftTemplate.create({
    data: {
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
      category: (value(formData, 'category') || 'hr') as never,
      body: value(formData, 'body'),
      version: Number(value(formData, 'version') || '1'),
      isActive: boolValue(formData, 'isActive'),
    },
  });
  revalidatePath('/draft-templates');
  redirect('/draft-templates');
}
