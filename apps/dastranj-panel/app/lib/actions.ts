'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '../../node_modules/.prisma/client';
import { prisma } from './prisma';
import { getSessionContext } from './auth';
import { ensureGlobalDefaultCalendar } from './calendar-defaults';
import { getPolicyFamilyMeta, getPolicySectionValues } from './policy-workspaces';
import { seedSampleData } from './seed';

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function boolValue(formData: FormData, key: string) {
  return formData.get(key) === 'on';
}

function jsonValue<T extends Prisma.InputJsonValue>(value: T): T {
  return value;
}

function decimalValue(formData: FormData, key: string) {
  const raw = value(formData, key);
  return raw ? new Prisma.Decimal(raw) : null;
}

async function getTenantId() {
  const session = await getSessionContext();
  if (!session?.tenantId) redirect('/select-tenant');
  return session.tenantId;
}

function tenantRelation(tenantId: string) {
  return { tenant: { connect: { id: tenantId } } };
}

function getShiftTypeLabel(shiftType: string) {
  if (shiftType === 'fixed') return 'شیفت ثابت';
  if (shiftType === 'float-day') return 'شیفت شناور (شروع روز)';
  if (shiftType === 'float-abs') return 'شیفت شناور مطلق';
  if (shiftType === 'split') return 'شیفت دو تکه';
  if (shiftType === 'rotate') return 'شیفت چرخشی';
  return shiftType;
}

function getPolicyFamilyKey(sectionValues: Prisma.JsonValue | null | undefined) {
  if (!sectionValues || typeof sectionValues !== 'object' || Array.isArray(sectionValues)) return null;
  const familyKey = (sectionValues as Record<string, unknown>).familyKey;
  return typeof familyKey === 'string' ? familyKey : null;
}

function shouldRetryLocationWithoutCoordinates(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes('Unknown argument `latitude`') ||
      error.message.includes('Unknown argument `longitude`'))
  );
}

function baseLocationData(formData: FormData, tenantId: string) {
  return {
    ...tenantRelation(tenantId),
    title: value(formData, 'title'),
    address: value(formData, 'address'),
    radius: Number(value(formData, 'radius') || '100'),
    description: value(formData, 'description') || null,
  };
}

export async function seedSampleDataAction() {
  const tenantId = await getTenantId();
  await seedSampleData(prisma, tenantId);
  revalidatePath('/');
  redirect('/quick-setup');
}

export async function saveBusinessProfileAction(formData: FormData) {
  const tenantId = await getTenantId();
  const current = await prisma.businessProfile.findFirst({ where: { tenantId } });
  const data = {
    tenantId,
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
  const tenantId = await getTenantId();
  const data = {
    ...baseLocationData(formData, tenantId),
    latitude: decimalValue(formData, 'latitude'),
    longitude: decimalValue(formData, 'longitude'),
  };

  try {
    await prisma.location.create({ data });
  } catch (error) {
    if (!shouldRetryLocationWithoutCoordinates(error)) throw error;
    await prisma.location.create({ data: baseLocationData(formData, tenantId) });
  }

  revalidatePath('/locations');
  revalidatePath('/quick-setup');
  redirect('/locations');
}

export async function createLocationFromQuickSetupAction(formData: FormData) {
  const tenantId = await getTenantId();
  const data = {
    ...baseLocationData(formData, tenantId),
    latitude: decimalValue(formData, 'latitude'),
    longitude: decimalValue(formData, 'longitude'),
  };

  try {
    await prisma.location.create({ data });
  } catch (error) {
    if (!shouldRetryLocationWithoutCoordinates(error)) throw error;
    await prisma.location.create({ data: baseLocationData(formData, tenantId) });
  }

  revalidatePath('/locations');
  revalidatePath('/quick-setup');
  redirect('/quick-setup');
}

export async function saveLocationFromQuickSetupAction(formData: FormData) {
  const tenantId = await getTenantId();
  const data = {
    ...baseLocationData(formData, tenantId),
    latitude: decimalValue(formData, 'latitude'),
    longitude: decimalValue(formData, 'longitude'),
  };

  try {
    const location = await prisma.location.create({ data });
    revalidatePath('/locations');
    revalidatePath('/quick-setup');
    return { id: location.id, title: location.title, radius: location.radius, description: location.description };
  } catch (error) {
    if (!shouldRetryLocationWithoutCoordinates(error)) throw error;
    const location = await prisma.location.create({ data: baseLocationData(formData, tenantId) });
    revalidatePath('/locations');
    revalidatePath('/quick-setup');
    return { id: location.id, title: location.title, radius: location.radius, description: location.description };
  }
}

export async function updateLocationAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const current = await prisma.location.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!current) throw new Error('Location not found for active tenant.');
  const baseData = {
    title: value(formData, 'title'),
    address: value(formData, 'address'),
    radius: Number(value(formData, 'radius') || '100'),
    description: value(formData, 'description') || null,
  };

  try {
    await prisma.location.update({
      where: { id },
      data: {
        ...baseData,
        latitude: decimalValue(formData, 'latitude'),
        longitude: decimalValue(formData, 'longitude'),
      },
    });
  } catch (error) {
    if (!shouldRetryLocationWithoutCoordinates(error)) throw error;
    await prisma.location.update({ where: { id }, data: baseData });
  }

  revalidatePath('/locations');
  revalidatePath(`/locations/${id}/edit`);
  revalidatePath('/quick-setup');
  redirect('/locations');
}

export async function deleteLocationAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  await prisma.location.deleteMany({ where: { id, tenantId } });
  revalidatePath('/locations');
  revalidatePath('/quick-setup');
  redirect('/locations');
}

export async function createRequestReasonAction(formData: FormData) {
  const tenantId = await getTenantId();
  const category = value(formData, 'category') as never;
  const lastOrder = await prisma.requestReason.aggregate({
    where: { tenantId, category },
    _max: { displayOrder: true },
  });
  await prisma.requestReason.create({
    data: {
      tenantId,
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
      category,
      isActive: boolValue(formData, 'isActive'),
      displayOrder: (lastOrder._max.displayOrder ?? 0) + 1,
    },
  });
  revalidatePath('/request-reasons');
  redirect(`/request-reasons?category=${value(formData, 'category')}`);
}

export async function updateRequestReasonAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const category = value(formData, 'category') as never;
  const current = await prisma.requestReason.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!current) throw new Error('Request reason not found for active tenant.');

  await prisma.requestReason.update({
    where: { id },
    data: {
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
      category,
      isActive: boolValue(formData, 'isActive'),
    },
  });
  revalidatePath('/request-reasons');
  redirect(`/request-reasons?category=${category}`);
}

export async function deleteRequestReasonAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const category = value(formData, 'category');
  await prisma.requestReason.deleteMany({ where: { id, tenantId } });
  revalidatePath('/request-reasons');
  redirect(category ? `/request-reasons?category=${category}` : '/request-reasons');
}

export async function toggleRequestReasonActiveAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const isActive = value(formData, 'isActive') === 'true';
  await prisma.requestReason.updateMany({ where: { id, tenantId }, data: { isActive } });
  revalidatePath('/request-reasons');
}

export async function reorderRequestReasonsAction(formData: FormData) {
  const tenantId = await getTenantId();
  const category = value(formData, 'category') as never;
  const orderedIds = JSON.parse(value(formData, 'orderedIds')) as string[];
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return;

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.requestReason.updateMany({
        where: { id, tenantId, category },
        data: { displayOrder: index },
      }),
    ),
  );
  revalidatePath('/request-reasons');
}

export async function createOrganizationUnitAction(formData: FormData) {
  const tenantId = await getTenantId();
  await prisma.organizationUnit.create({
    data: {
      tenantId,
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
    },
  });
  revalidatePath('/organization-units');
  redirect('/organization-units');
}

export async function updateOrganizationUnitAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const current = await prisma.organizationUnit.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!current) throw new Error('Organization unit not found for active tenant.');

  await prisma.organizationUnit.update({
    where: { id },
    data: {
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
    },
  });
  revalidatePath('/organization-units');
  redirect('/organization-units');
}

export async function deleteOrganizationUnitAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  await prisma.organizationUnit.deleteMany({ where: { id, tenantId } });
  revalidatePath('/organization-units');
  redirect('/organization-units');
}

export async function createShiftTemplateAction(formData: FormData) {
  const tenantId = await getTenantId();
  await prisma.shiftTemplate.create({
    data: {
      tenantId,
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
      type: value(formData, 'type') as never,
      weekDays: jsonValue(value(formData, 'weekDays').split(',').map((item) => item.trim()).filter(Boolean)),
      config: jsonValue({
        startTime: value(formData, 'startTime'),
        endTime: value(formData, 'endTime'),
        requiredMinutes: Number(value(formData, 'requiredMinutes') || '0'),
      }),
      breaks: jsonValue([]),
      isActive: boolValue(formData, 'isActive'),
    },
  });
  revalidatePath('/shift-templates');
  redirect('/shift-templates');
}

export async function createCalendarAction(formData: FormData) {
  const tenantId = await getTenantId();
  await prisma.calendar.create({
    data: {
      tenantId,
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

export async function deleteCalendarAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  await prisma.calendar.deleteMany({ where: { id, tenantId } });
  revalidatePath('/calendars');
  revalidatePath('/quick-setup');
  redirect('/calendars');
}

export async function createCalendarWithShiftAction(data: {
  title: string;
  yearLabel: string;
  startDate: string;
  endDate: string;
  weekends: string[];
  singleHolidays: { id: string; title: string; date: string }[];
  shiftType: string;
  shiftTitle: string;
  shiftConfig: Record<string, unknown>;
  breaks: unknown[];
}) {
  const tenantId = await getTenantId();
  const holidayCount = data.weekends.length + data.singleHolidays.length;
  const shiftTypeLabel =
    data.shiftType === 'fixed' ? 'شیفت ثابت' :
    data.shiftType === 'float-day' ? 'شیفت شناور (شروع روز)' :
    data.shiftType === 'float-abs' ? 'شیفت شناور مطلق' :
    data.shiftType === 'split' ? 'شیفت دوتکه' :
    data.shiftType === 'rotate' ? 'شیفت چرخشی' : data.shiftType;

  const calendar = await prisma.calendar.create({
    data: {
      tenantId,
      title: data.title,
      description: null,
      yearLabel: data.yearLabel,
      startDate: data.startDate,
      endDate: data.endDate,
      weekends: jsonValue(data.weekends),
      singleHolidays: jsonValue(data.singleHolidays),
      shiftTitle: data.shiftTitle,
      shiftTypeLabel: getShiftTypeLabel(data.shiftType),
      shiftConfig: jsonValue(data.shiftConfig as Prisma.InputJsonObject),
      holidayCount,
      totalShiftDays: 0,
      totalEventDays: data.singleHolidays.length,
      status: 'active',
    },
  });

  revalidatePath('/calendars');
  revalidatePath('/quick-setup');
  return { id: calendar.id, title: calendar.title, yearLabel: calendar.yearLabel };
}

export async function createCalendarDraftFromDefaultAction(data: {
  title: string;
  description?: string;
  yearLabel: string;
}) {
  const tenantId = await getTenantId();
  const source = await ensureGlobalDefaultCalendar();

  const draft = await prisma.calendar.create({
    data: {
      tenantId,
      title: data.title,
      description: data.description ?? source.description ?? null,
      yearLabel: data.yearLabel,
      startDate: source.startDate,
      endDate: source.endDate,
      weekends: source.weekends,
      singleHolidays: source.singleHolidays,
      shiftTitle: source.shiftTitle,
      shiftTypeLabel: source.shiftTypeLabel,
      shiftConfig: source.shiftConfig,
      holidayCount: source.holidayCount,
      totalShiftDays: source.totalShiftDays,
      totalEventDays: source.totalEventDays,
      status: 'active',
    },
  });

  revalidatePath('/calendars');
  revalidatePath('/quick-setup');
  return {
    id: draft.id,
    title: draft.title,
    yearLabel: draft.yearLabel,
    description: draft.description,
    shiftTitle: draft.shiftTitle,
    shiftTypeLabel: draft.shiftTypeLabel,
    holidayCount: draft.holidayCount,
  };
}

export async function updateCalendarFromQuickSetupAction(data: {
  calendarId: string;
  title: string;
  description?: string;
  yearLabel: string;
  startDate: string;
  endDate: string;
  weekends: string[];
  singleHolidays: { id: string; title: string; date: string }[];
  shiftType: string;
  shiftTitle: string;
  shiftConfig: Record<string, unknown>;
}) {
  const tenantId = await getTenantId();
  const current = await prisma.calendar.findFirst({
    where: { id: data.calendarId, tenantId },
    select: { id: true },
  });
  if (!current) throw new Error('Calendar not found for active tenant.');

  const holidayCount = data.weekends.length + data.singleHolidays.length;
  const shiftTypeLabel =
    data.shiftType === 'fixed' ? 'شیفت ثابت' :
    data.shiftType === 'float-day' ? 'شیفت شناور (شروع روز)' :
    data.shiftType === 'float-abs' ? 'شیفت شناور مطلق' :
    data.shiftType === 'split' ? 'شیفت دوتکه' :
    data.shiftType === 'rotate' ? 'شیفت چرخشی' : data.shiftType;

  const calendar = await prisma.calendar.update({
    where: { id: data.calendarId },
    data: {
      title: data.title,
      description: data.description ?? null,
      yearLabel: data.yearLabel,
      startDate: data.startDate,
      endDate: data.endDate,
      weekends: jsonValue(data.weekends),
      singleHolidays: jsonValue(data.singleHolidays),
      shiftTitle: data.shiftTitle,
      shiftTypeLabel: getShiftTypeLabel(data.shiftType),
      shiftConfig: jsonValue(data.shiftConfig as Prisma.InputJsonObject),
      holidayCount,
      totalEventDays: data.singleHolidays.length,
    },
  });

  revalidatePath('/calendars');
  revalidatePath('/quick-setup');
  return {
    id: calendar.id,
    title: calendar.title,
    yearLabel: calendar.yearLabel,
    description: calendar.description,
    shiftTitle: calendar.shiftTitle,
    shiftTypeLabel: calendar.shiftTypeLabel,
    holidayCount: calendar.holidayCount,
  };
}

export async function createPolicyAction(formData: FormData) {
  const tenantId = await getTenantId();
  const calendarId = value(formData, 'calendarId') || null;
  if (calendarId) {
    const calendar = await prisma.calendar.findFirst({ where: { id: calendarId, tenantId }, select: { id: true } });
    if (!calendar) throw new Error('Calendar not found for active tenant.');
  }
  await prisma.workPolicy.create({
    data: {
      tenantId,
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
      calendarId,
      employeeCount: Number(value(formData, 'employeeCount') || '0'),
      sectionValues: jsonValue({
        manualAttendance: boolValue(formData, 'manualAttendance'),
        overtimeFromAttendance: boolValue(formData, 'overtimeFromAttendance'),
        nightWorkStart: value(formData, 'nightWorkStart') || '22:00',
      }),
    },
  });
  revalidatePath('/policies');
  revalidatePath('/quick-setup');
  redirect('/policies');
}

export async function updatePolicyBasicInfoAction(formData: FormData) {
  const tenantId = await getTenantId();
  const policyId = value(formData, 'policyId');
  const title = value(formData, 'title');
  const description = value(formData, 'description') || null;

  if (!policyId) throw new Error('شناسه سیاست الزامی است.');
  if (!title) throw new Error('عنوان سیاست الزامی است.');

  const existing = await prisma.workPolicy.findFirst({ where: { id: policyId, tenantId } });
  if (!existing) throw new Error('سیاست برای tenant فعال یافت نشد.');

  const sectionValues = getPolicySectionValues(existing);
  const mergedSectionValues = jsonValue({
    ...sectionValues,
    title,
    description,
  });

  await prisma.workPolicy.update({
    where: { id: policyId },
    data: {
      title,
      description,
      sectionValues: mergedSectionValues,
    },
  });

  revalidatePath('/policies');
  revalidatePath('/policies/work');
  redirect(`/policies/work?policyId=${policyId}`);
}

export async function savePolicyWorkspaceAction(formData: FormData) {
  const tenantId = await getTenantId();
  const familyKey = value(formData, 'familyKey');
  const variant = value(formData, 'variant') || 'default';
  const policyId = value(formData, 'policyId') || null;
  const calendarId = value(formData, 'calendarId') || null;

  if (!familyKey) throw new Error('Policy family is required.');
  const family = getPolicyFamilyMeta(familyKey);
  if (!family) throw new Error('Policy family is not supported.');

  if (calendarId) {
    const calendar = await prisma.calendar.findFirst({ where: { id: calendarId, tenantId }, select: { id: true } });
    if (!calendar) throw new Error('Calendar not found for active tenant.');
  }

  const workSection = value(formData, 'workSection');
  const returnPath = value(formData, 'returnPath');

  const existingPolicy = policyId
    ? await prisma.workPolicy.findFirst({
        where: { id: policyId, tenantId },
        select: { id: true, title: true, description: true, sectionValues: true },
      })
    : null;
  const previousSectionValues =
    existingPolicy?.sectionValues &&
    typeof existingPolicy.sectionValues === 'object' &&
    !Array.isArray(existingPolicy.sectionValues)
      ? (existingPolicy.sectionValues as Record<string, unknown>)
      : {};

  const preserveWorkMeta = familyKey === 'work' && workSection === 'overtime' && existingPolicy;
  const title = preserveWorkMeta
    ? existingPolicy.title
    : value(formData, 'title') || family.title;
  const description = preserveWorkMeta ? existingPolicy.description : value(formData, 'description') || null;

  const monthlyLimitInput = value(formData, 'monthlyLimit');
  const monthlyLimit =
    variant === 'annual' || variant === 'unpaid'
      ? Number(monthlyLimitInput || '0')
      : typeof previousSectionValues.monthlyLimit === 'number'
        ? previousSectionValues.monthlyLimit
        : Number(monthlyLimitInput || '0');

  const preservedBool = (key: string) =>
    typeof previousSectionValues[key] === 'boolean' ? (previousSectionValues[key] as boolean) : false;
  const previousCalendarId = typeof previousSectionValues.calendarId === 'string' ? previousSectionValues.calendarId : null;

  const sectionValues =
    familyKey === 'work' && workSection === 'overtime'
      ? jsonValue({
          ...previousSectionValues,
          familyKey,
          variant,
          title,
          description,
          calendarId: calendarId || previousCalendarId,
          overtimeFromAttendance: boolValue(formData, 'overtimeFromAttendance'),
          overtimeRequireAttachment: boolValue(formData, 'overtimeRequireAttachment'),
          overtimeBeforeShift: boolValue(formData, 'overtimeBeforeShift'),
          overtimeAfterShift: boolValue(formData, 'overtimeAfterShift'),
        })
      : familyKey === 'work' && workSection === 'base'
        ? jsonValue({
            ...previousSectionValues,
            familyKey,
            variant,
            title,
            description,
            calendarId: calendarId || previousCalendarId,
            startTime: value(formData, 'startTime') || null,
            endTime: value(formData, 'endTime') || null,
            maxDelayMinutes: Number(value(formData, 'maxDelayMinutes') || '0'),
            requireAttachment: boolValue(formData, 'requireAttachment'),
            allowManualApproval: boolValue(formData, 'allowManualApproval'),
            breakDeduct: boolValue(formData, 'breakDeduct'),
            overtimeFromAttendance: preservedBool('overtimeFromAttendance'),
            overtimeRequireAttachment: preservedBool('overtimeRequireAttachment'),
            overtimeBeforeShift: preservedBool('overtimeBeforeShift'),
            overtimeAfterShift: preservedBool('overtimeAfterShift'),
          })
        : jsonValue({
            familyKey,
            variant,
            title,
            description,
            calendarId,
            startTime: value(formData, 'startTime') || null,
            endTime: value(formData, 'endTime') || null,
            requiredMinutes: Number(value(formData, 'requiredMinutes') || '0'),
            workStartWindow: value(formData, 'workStartWindow') || null,
            workEndWindow: value(formData, 'workEndWindow') || null,
            corePresence: value(formData, 'corePresence') || null,
            maxDelayMinutes: Number(value(formData, 'maxDelayMinutes') || '0'),
            breakMode: value(formData, 'breakMode') || null,
            breakStart: value(formData, 'breakStart') || null,
            breakEnd: value(formData, 'breakEnd') || null,
            breakDuration: Number(value(formData, 'breakDuration') || '0'),
            endsNextDay: boolValue(formData, 'endsNextDay'),
            breakDeduct: boolValue(formData, 'breakDeduct'),
            bufferMinutes: Number(value(formData, 'bufferMinutes') || '0'),
            monthlyLimit,
            approvalMode: value(formData, 'approvalMode') || null,
            requireAttachment: boolValue(formData, 'requireAttachment'),
            geofenceRadius: Number(value(formData, 'geofenceRadius') || '0'),
            allowRemote: boolValue(formData, 'allowRemote'),
            allowManualApproval: boolValue(formData, 'allowManualApproval'),
            allowOutsideShift: boolValue(formData, 'allowOutsideShift'),
            manualEntryEnabled: boolValue(formData, 'manualEntryEnabled'),
            requiresManagerApproval: boolValue(formData, 'requiresManagerApproval'),
            maxMissionHours: Number(value(formData, 'maxMissionHours') || '0'),
            nightEnabled: boolValue(formData, 'nightEnabled'),
            nightStart: boolValue(formData, 'nightEnabled') ? value(formData, 'nightStart') || null : null,
            nightEnd: boolValue(formData, 'nightEnabled') ? value(formData, 'nightEnd') || null : null,
            cycleCount: Number(value(formData, 'cycleCount') || '0'),
            cycleType: value(formData, 'cycleType') || null,
            note: value(formData, 'note') || null,
            entryGraceMinutes: Number(value(formData, 'entryGraceMinutes') || '0'),
            exitGraceMinutes: Number(value(formData, 'exitGraceMinutes') || '0'),
            maxEarlyLeaveMinutes: Number(value(formData, 'maxEarlyLeaveMinutes') || '0'),
            delayCalculationMode: value(formData, 'delayCalculationMode') || null,
            earlyLeaveCalculationMode: value(formData, 'earlyLeaveCalculationMode') || null,
            bufferOverflowPolicy: value(formData, 'bufferOverflowPolicy') || null,
            requiredHours: Number(value(formData, 'requiredHours') || '0'),
            dailyEntryExitLimit: value(formData, 'dailyEntryExitLimit') || null,
            overtimeFromAttendance: boolValue(formData, 'overtimeFromAttendance'),
            overtimeRequireAttachment: boolValue(formData, 'overtimeRequireAttachment'),
            overtimeBeforeShift: boolValue(formData, 'overtimeBeforeShift'),
            overtimeAfterShift: boolValue(formData, 'overtimeAfterShift'),
          });

  const existing = existingPolicy;

  let savedId = existing?.id ?? '';

  if (existing) {
    await prisma.workPolicy.update({
      where: { id: existing.id },
      data: {
        title,
        description,
        calendarId,
        sectionValues,
      },
    });
    savedId = existing.id;
  } else {
    const created = await prisma.workPolicy.create({
      data: {
        tenantId,
        title,
        description,
        calendarId,
        employeeCount: 0,
        sectionValues,
      },
    });
    savedId = created.id;
  }

  revalidatePath('/policies');
  revalidatePath(`/policies/${familyKey}`);
  revalidatePath('/policies/work');
  revalidatePath('/policies/work/base');

  if (returnPath) {
    redirect(returnPath);
  }

  redirect(`/policies/${familyKey}?policyId=${savedId}${variant && variant !== 'default' ? `&variant=${variant}` : ''}`);
}

export async function deletePolicyAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  await prisma.workPolicy.deleteMany({ where: { id, tenantId } });
  revalidatePath('/policies');
  revalidatePath('/quick-setup');
  redirect('/policies');
}

export async function createPolicyFromQuickSetupAction(data: {
  calendarId: string;
  policyTemplateId: string;
  title: string;
  description?: string;
  templateTitle?: string;
  year?: string;
}) {
  const tenantId = await getTenantId();
  const calendar = await prisma.calendar.findFirst({ where: { id: data.calendarId, tenantId }, select: { id: true } });
  if (!calendar) throw new Error('Calendar not found for active tenant.');
  const policy = await prisma.workPolicy.create({
    data: {
      tenantId,
      title: data.title,
      description: data.description ?? null,
      calendarId: data.calendarId,
      sectionValues: jsonValue({
        familyKey: 'work',
        variant: 'default',
        manualAttendance: false,
        overtimeFromAttendance: true,
        nightWorkStart: '22:00',
        templateId: data.policyTemplateId,
        templateTitle: data.templateTitle ?? data.title,
        year: data.year ?? '',
      }),
    },
  });
  revalidatePath('/policies');
  revalidatePath('/quick-setup');
  return { id: policy.id, title: policy.title, description: policy.description ?? '', calendarId: data.calendarId };
}

export async function createEmployeeAction(formData: FormData) {
  const tenantId = await getTenantId();
  const unitIds = formData.getAll('organizationUnitIds').map(String);
  const validUnits = unitIds.length
    ? await prisma.organizationUnit.findMany({ where: { id: { in: unitIds }, tenantId }, select: { id: true } })
    : [];
  if (validUnits.length !== unitIds.length) throw new Error('Organization unit not found for active tenant.');
  await prisma.employee.create({
    data: {
      tenantId,
      firstName: value(formData, 'firstName'),
      lastName: value(formData, 'lastName'),
      nationalId: value(formData, 'nationalId') || null,
      mobile1: value(formData, 'mobile1') || null,
      mobile2: value(formData, 'mobile2') || null,
      email: value(formData, 'email') || null,
      personnelCode: value(formData, 'personnelCode') || null,
      avatarUrl: value(formData, 'avatarUrl') || null,
      identityPhotoUrl: value(formData, 'identityPhotoUrl') || null,
      maritalStatus: (value(formData, 'maritalStatus') || 'single') as never,
      childrenCount: Number(value(formData, 'childrenCount') || '0'),
      isActive: boolValue(formData, 'isActive'),
      canEditIdentityPhoto: boolValue(formData, 'canEditIdentityPhoto'),
      organizationUnits: {
        create: validUnits.map(({ id: organizationUnitId }) => ({ organizationUnitId })),
      },
    },
  });
  revalidatePath('/employees');
  revalidatePath('/quick-setup');
  redirect('/employees');
}

export async function createEmployeeFromQuickSetupAction(data: {
  id?: string;
  firstName: string;
  lastName: string;
  nationalId?: string;
  mobile?: string;
  email?: string;
  avatarUrl?: string;
}) {
  const tenantId = await getTenantId();
  const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      nationalId: data.nationalId || null,
      mobile1: data.mobile || null,
      email: data.email || null,
      avatarUrl: data.avatarUrl || null,
  };
  const employee = data.id
    ? await prisma.employee.update({ where: { id: (await prisma.employee.findFirstOrThrow({ where: { id: data.id, tenantId }, select: { id: true } })).id }, data: payload })
    : await prisma.employee.create({ data: { tenantId, ...payload } });
  revalidatePath('/employees');
  revalidatePath('/quick-setup');
  return { id: employee.id, firstName: employee.firstName, lastName: employee.lastName, nationalId: employee.nationalId ?? '', mobile: employee.mobile1 ?? '', email: employee.email ?? '', avatarUrl: employee.avatarUrl ?? undefined };
}

export async function deleteEmployeeFromQuickSetupAction(id: string) {
  const tenantId = await getTenantId();
  await prisma.employee.deleteMany({ where: { id, tenantId } });
  revalidatePath('/employees');
  revalidatePath('/quick-setup');
}

export async function deleteEmployeeAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  await prisma.employee.deleteMany({ where: { id, tenantId } });
  revalidatePath('/employees');
  redirect('/employees');
}

export async function toggleEmployeeActiveAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const isActive = value(formData, 'isActive') === 'true';
  await prisma.employee.updateMany({ where: { id, tenantId }, data: { isActive } });
  revalidatePath('/employees');
}

export async function saveEmployeeBankAccountsAction(formData: FormData) {
  const tenantId = await getTenantId();
  const employeeId = value(formData, 'employeeId');
  const accounts = JSON.parse(value(formData, 'accounts')) as Prisma.InputJsonValue;
  await prisma.employee.updateMany({
    where: { id: employeeId, tenantId },
    data: { bankAccounts: accounts },
  });
  revalidatePath(`/employees/${employeeId}`);
  revalidatePath(`/employees/${employeeId}/bank-accounts`);
}

export async function saveEmployeeGuaranteesAction(formData: FormData) {
  const tenantId = await getTenantId();
  const employeeId = value(formData, 'employeeId');
  const guarantees = JSON.parse(value(formData, 'guarantees')) as Prisma.InputJsonValue;
  await prisma.employee.updateMany({
    where: { id: employeeId, tenantId },
    data: { guarantees },
  });
  revalidatePath(`/employees/${employeeId}`);
  revalidatePath(`/employees/${employeeId}/guarantee`);
}

export async function createWorkGroupAction(formData: FormData) {
  const tenantId = await getTenantId();
  const employeeIds = formData.getAll('employeeIds').map(String);
  const locationId = value(formData, 'locationId') || null;
  const policyId = value(formData, 'policyId') || null;
  const transferEmployeeIds = formData.getAll('transferEmployeeIds').map(String);
  if (locationId) {
    const location = await prisma.location.findFirst({ where: { id: locationId, tenantId }, select: { id: true } });
    if (!location) throw new Error('Location not found for active tenant.');
  }
  if (policyId) {
    const policy = await prisma.workPolicy.findFirst({ where: { id: policyId, tenantId }, select: { id: true } });
    if (!policy) throw new Error('Policy not found for active tenant.');
  }
  const validEmployees = employeeIds.length
    ? await prisma.employee.findMany({ where: { id: { in: employeeIds }, tenantId }, select: { id: true } })
    : [];
  if (validEmployees.length !== employeeIds.length) throw new Error('Employee not found for active tenant.');
  if (transferEmployeeIds.length) {
    await prisma.workGroupMember.deleteMany({
      where: {
        employeeId: { in: transferEmployeeIds },
        workGroup: { tenantId },
      },
    });
  }
  await prisma.workGroup.create({
    data: {
      tenantId,
      title: value(formData, 'title'),
      description: value(formData, 'description') || null,
      tags: jsonValue(value(formData, 'tags').split(',').map((item) => item.trim()).filter(Boolean)),
      locationId,
      policyId,
      members: {
        create: validEmployees.map(({ id: employeeId }) => ({
          employeeId,
          accessLevel: (value(formData, `accessLevel:${employeeId}`) || 'employee') as never,
          joinedAt: value(formData, `joinedAt:${employeeId}`) ? new Date(value(formData, `joinedAt:${employeeId}`)) : undefined,
        })),
      },
    },
  });
  revalidatePath('/work-groups');
  revalidatePath('/quick-setup');
  redirect('/work-groups');
}

export async function createDraftTemplateAction(formData: FormData) {
  const tenantId = await getTenantId();
  await prisma.draftTemplate.create({
    data: {
      tenantId,
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

export async function createWorkGroupFromQuickSetupAction(data: {
  title: string;
  tags: string[];
  locationId: string;
  employeeIds: string[];
  policyIds: string[];
}) {
  const tenantId = await getTenantId();
  const location = await prisma.location.findFirst({ where: { id: data.locationId, tenantId }, select: { id: true } });
  if (!location) throw new Error('Location not found for active tenant.');
  const employees = await prisma.employee.findMany({ where: { id: { in: data.employeeIds }, tenantId }, select: { id: true } });
  if (employees.length !== data.employeeIds.length) throw new Error('Employee not found for active tenant.');
  const policies = await prisma.workPolicy.findMany({ where: { id: { in: data.policyIds }, tenantId }, select: { id: true } });
  if (policies.length !== data.policyIds.length) throw new Error('Policy not found for active tenant.');

  const workGroup = await prisma.workGroup.create({
    data: {
      tenantId,
      title: data.title,
      tags: jsonValue(data.tags),
      locationId: data.locationId,
      policyId: data.policyIds[0] ?? null,
      members: {
        create: employees.map((employee) => ({ employeeId: employee.id, accessLevel: 'employee' })),
      },
    },
  });

  revalidatePath('/work-groups');
  revalidatePath('/quick-setup');
  return { id: workGroup.id, title: workGroup.title };
}
