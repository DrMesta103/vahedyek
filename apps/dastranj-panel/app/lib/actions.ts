'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'node:crypto';
import { Prisma, WorkGroupAccessLevel } from './prisma-client';
import { prisma } from './prisma';
import {
  toWorkplaceLocationDraft,
  validateWorkplaceLocationDraft,
} from './workplace-location';
import { getSessionContext } from './auth';
import { isValidIranMobile, normalizeEmail, sanitizeIranMobileInput } from './contact';
import { getEmployeeImportJobDetailsForTenant, listEmployeeImportJobsForTenant } from './employee-import-jobs';
import { isPersianYmdInRange, parsePersianYmd, persianToDate } from './calendar-dates';
import { ensureGlobalDefaultCalendar } from './calendar-defaults';
import { getOfficialHolidaysForYear } from './calendar-official-holidays';
import { expandCalendarEventDates, normalizePersianDateInput, parseCalendarStoredEvents } from './calendar-events';
import {
  CALENDAR_FRIDAY_HOLIDAY_TYPE,
  getCalendarHolidayTypeLabel,
  isPersianFridayDate,
  resolveCalendarEventTitle,
  resolveHolidayTypeForDate,
  type CalendarHolidayType,
} from './calendar-event-types';
import { countCalendarHolidayDays } from './calendar-grid';
import type { CalendarShiftType } from './calendar-shifts';
import {
  getCalendarShiftTypeLabel,
  listExcludedShiftDates,
  parseCalendarShiftConfig,
  resolveCalendarShiftTitle,
} from './calendar-shifts';
import { serializeShiftTemplateFromWizard } from './shift-template-map';
import { getPolicyFamilyMeta, getPolicySectionValues } from './policy-workspaces';
import { applyVariantRule, getDefaultLeaveRule, LEAVE_VARIANT_TO_TYPE } from './leave-policy';
import {
  buildSplitShiftSegmentsPayload,
  validateSplitShiftSegmentRules,
} from './split-shift-policy';
import { buildRemoteWorkPolicyPayload } from './remote-work-policy';
import { seedSampleData } from './seed';
import type { ContractDraftTemplate } from './contract-draft-templates';
import { normalizeContractDraftTemplate } from './contract-draft-templates';
import * as XLSX from 'xlsx';
import type {
  QuickEmployeeImportJobDetails,
  QuickEmployeeImportJobInvitationChannel,
  QuickEmployeeImportJobMockInvitationStatus,
  QuickEmployeeImportJobRowStatus,
  QuickEmployeeImportJobStatus,
  QuickEmployeeImportJobSummary,
  QuickEmployeeImportJobType,
} from '../(panel)/quick-setup/_components/quick-setup.types';

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function boolValue(formData: FormData, key: string) {
  return formData.get(key) === 'on';
}

function digitsOnlyValue(formData: FormData, key: string) {
  return value(formData, key)
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/\D/g, '');
}

function jsonValue(value: unknown): any {
  return value;
}

function decimalStringValue(formData: FormData, key: string) {
  const latin = value(formData, key)
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[^\d.]/g, '');
  const [whole, ...rest] = latin.split('.');
  return rest.length ? `${whole}.${rest.join('')}` : whole;
}

function parseJsonRecord(value: string | null | undefined) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

const EMPLOYEE_CONTRACT_DRAFTS_STORAGE_KEY = 'dastranj-employee-contract-drafts-v1';

const DELETE_GUARD_MESSAGES = {
  locationUsed:
    '\u0627\u06cc\u0646 \u0645\u062d\u0644 \u06a9\u0627\u0631 \u0628\u0647 \u06af\u0631\u0648\u0647 \u06a9\u0627\u0631\u06cc \u0645\u062a\u0635\u0644 \u0627\u0633\u062a \u0648 \u0642\u0627\u0628\u0644 \u062d\u0630\u0641 \u0646\u06cc\u0633\u062a. \u062f\u0631 \u0635\u0648\u0631\u062a \u0646\u06cc\u0627\u0632 \u0622\u0646 \u0631\u0627 \u063a\u06cc\u0631\u0641\u0639\u0627\u0644 \u06a9\u0646\u06cc\u062f.',
  calendarUsed:
    '\u0627\u06cc\u0646 \u062a\u0642\u0648\u06cc\u0645 \u0628\u0647 \u06cc\u06a9 \u0633\u06cc\u0627\u0633\u062a \u06a9\u0627\u0631\u06cc \u0645\u062a\u0635\u0644 \u0627\u0633\u062a \u0648 \u062a\u0627 \u0632\u0645\u0627\u0646 \u062c\u062f\u0627\u0633\u0627\u0632\u06cc \u0622\u0646 \u0642\u0627\u0628\u0644 \u062d\u0630\u0641 \u0646\u06cc\u0633\u062a.',
  policyUsed:
    '\u0627\u06cc\u0646 \u0633\u06cc\u0627\u0633\u062a \u06a9\u0627\u0631\u06cc \u0628\u0647 \u06af\u0631\u0648\u0647 \u06a9\u0627\u0631\u06cc \u0645\u062a\u0635\u0644 \u0627\u0633\u062a \u0648 \u062a\u0627 \u0632\u0645\u0627\u0646 \u062c\u062f\u0627\u0633\u0627\u0632\u06cc \u0622\u0646 \u0642\u0627\u0628\u0644 \u062d\u0630\u0641 \u0646\u06cc\u0633\u062a.',
  draftTemplateUsed:
    '\u0627\u0632 \u0627\u06cc\u0646 \u0642\u0627\u0644\u0628 \u0628\u0631\u0627\u06cc \u0633\u0627\u062e\u062a \u067e\u06cc\u0634\u200c\u0646\u0648\u06cc\u0633 \u0642\u0631\u0627\u0631\u062f\u0627\u062f \u06a9\u0627\u0631\u0645\u0646\u062f \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u0634\u062f\u0647 \u0627\u0633\u062a \u0648 \u0642\u0627\u0628\u0644 \u062d\u0630\u0641 \u0646\u06cc\u0633\u062a.',
  requestReasonUsed:
    '\u0627\u06cc\u0646 \u062f\u0644\u06cc\u0644 \u062f\u0631\u062e\u0648\u0627\u0633\u062a \u0642\u0628\u0644\u0627\u064b \u062f\u0631 \u062f\u0631\u062e\u0648\u0627\u0633\u062a\u200c\u0647\u0627\u06cc \u06a9\u0627\u0631\u06a9\u0646\u0627\u0646 \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u0634\u062f\u0647 \u0627\u0633\u062a \u0648 \u0642\u0627\u0628\u0644 \u062d\u0630\u0641 \u0646\u06cc\u0633\u062a. \u062f\u0631 \u0635\u0648\u0631\u062a \u0646\u06cc\u0627\u0632 \u0641\u0642\u0637 \u0622\u0646 \u0631\u0627 \u063a\u06cc\u0631\u0641\u0639\u0627\u0644 \u06a9\u0646\u06cc\u062f.',
  organizationUnitUsed:
    '\u0627\u06cc\u0646 \u0648\u0627\u062d\u062f \u0633\u0627\u0632\u0645\u0627\u0646\u06cc \u0628\u0647 \u06a9\u0627\u0631\u0645\u0646\u062f \u0645\u062a\u0635\u0644 \u0627\u0633\u062a \u0648 \u0642\u0627\u0628\u0644 \u062d\u0630\u0641 \u0646\u06cc\u0633\u062a.',
} as const;

function decimalValue(formData: FormData, key: string) {
  const raw = value(formData, key);
  return raw ? new Decimal(raw) : null;
}

async function getTenantId() {
  const session = await getSessionContext();
  if (!session?.tenantId) redirect('/select-tenant');
  return session.tenantId;
}

function tenantRelation(tenantId: string) {
  return { tenant: { connect: { id: tenantId } } };
}

function getPolicyFamilyKey(sectionValues: unknown) {
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

function shouldRetryLocationWithoutPrimaryOnboarding(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes('Unknown argument `isPrimaryOnboarding`') ||
      error.message.includes('The column `Location.isPrimaryOnboarding` does not exist'))
  );
}

function readWorkplaceLocationDraft(formData: FormData) {
  return toWorkplaceLocationDraft({
    title: value(formData, 'title'),
    address: value(formData, 'address'),
    description: value(formData, 'description'),
    radius: value(formData, 'radius'),
    latitude: value(formData, 'latitude'),
    longitude: value(formData, 'longitude'),
  });
}

function buildLocationData(formData: FormData, tenantId: string, isPrimaryOnboarding = false) {
  const draft = readWorkplaceLocationDraft(formData);
  const validation = validateWorkplaceLocationDraft(draft);
  if (!validation.valid) {
    const message =
      validation.errors.title ??
      validation.errors.address ??
      validation.errors.radius ??
      validation.errors.latitude ??
      validation.errors.general ??
      'محل کار ذخیره نشد. دوباره تلاش کنید.';
    throw new Error(message);
  }

  return {
    ...tenantRelation(tenantId),
    title: validation.values.title,
    address: validation.values.address,
    radius: validation.values.radius,
    description: validation.values.description,
    latitude: new Decimal(validation.values.latitude),
    longitude: new Decimal(validation.values.longitude),
    isPrimaryOnboarding,
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
  revalidatePath('/business-settings/profile');
  revalidatePath('/');
}

export async function createLocationAction(formData: FormData) {
  const tenantId = await getTenantId();
  const data = buildLocationData(formData, tenantId);

  try {
    await prisma.location.create({ data: data as any });
  } catch (error) {
    if (!shouldRetryLocationWithoutCoordinates(error) && !shouldRetryLocationWithoutPrimaryOnboarding(error)) throw error;
    await prisma.location.create({
      data: {
        ...tenantRelation(tenantId),
        title: data.title,
        address: data.address,
        radius: data.radius,
        description: data.description,
        ...(shouldRetryLocationWithoutCoordinates(error) ? {} : { latitude: data.latitude, longitude: data.longitude }),
      } as any,
    });
  }

  revalidatePath('/locations');
  revalidatePath('/quick-setup');
  redirect('/locations');
}

export async function createLocationFromQuickSetupAction(formData: FormData) {
  const tenantId = await getTenantId();
  const data = buildLocationData(formData, tenantId);

  try {
    await prisma.location.create({ data: data as any });
  } catch (error) {
    if (!shouldRetryLocationWithoutCoordinates(error) && !shouldRetryLocationWithoutPrimaryOnboarding(error)) throw error;
    await prisma.location.create({
      data: {
        ...tenantRelation(tenantId),
        title: data.title,
        address: data.address,
        radius: data.radius,
        description: data.description,
        ...(shouldRetryLocationWithoutCoordinates(error) ? {} : { latitude: data.latitude, longitude: data.longitude }),
      } as any,
    });
  }

  revalidatePath('/locations');
  revalidatePath('/quick-setup');
  redirect('/quick-setup');
}

export async function saveLocationFromQuickSetupAction(formData: FormData) {
  const tenantId = await getTenantId();
  const draft = readWorkplaceLocationDraft(formData);
  const validation = validateWorkplaceLocationDraft(draft);
  if (!validation.valid) {
    return {
      ok: false as const,
      message: 'محل کار ذخیره نشد. دوباره تلاش کنید.',
      errors: validation.errors,
    };
  }

  const data = {
    ...tenantRelation(tenantId),
    title: validation.values.title,
    address: validation.values.address,
    radius: validation.values.radius,
    description: validation.values.description,
    latitude: new Decimal(validation.values.latitude),
    longitude: new Decimal(validation.values.longitude),
    isPrimaryOnboarding: true,
  };

  let location: unknown;
  try {
    location = await prisma.$transaction(async (tx) => {
      const existingPrimary = (await tx.location.findFirst({
        where: { tenantId, isPrimaryOnboarding: true } as any,
        select: { id: true } as any,
      })) as unknown as { id: string } | null;

      await tx.location.updateMany({
        where: { tenantId, isPrimaryOnboarding: true, ...(existingPrimary ? { id: { not: existingPrimary.id } } : {}) } as any,
        data: { isPrimaryOnboarding: false },
      });

      const saved = existingPrimary
        ? await tx.location.update({
            where: { id: existingPrimary.id },
            data: data as any,
          })
        : await tx.location.create({ data: data as any });

      await tx.businessProfile.updateMany({
        where: { tenantId, quickSetupStatus: 'pending' },
        data: { quickSetupStatus: 'in_progress' },
      });

      return saved;
    });
  } catch (error) {
    if (!shouldRetryLocationWithoutPrimaryOnboarding(error)) throw error;

    location = await prisma.$transaction(async (tx) => {
      const existingLocation = await tx.location.findFirst({
        where: { tenantId },
        orderBy: { updatedAt: 'desc' },
      });

      const saved = existingLocation
        ? await tx.location.update({
            where: { id: existingLocation.id },
            data: {
              ...tenantRelation(tenantId),
              title: data.title,
              address: data.address,
              radius: data.radius,
              description: data.description,
              latitude: data.latitude,
              longitude: data.longitude,
            } as any,
          })
        : await tx.location.create({
            data: {
              ...tenantRelation(tenantId),
              title: data.title,
              address: data.address,
              radius: data.radius,
              description: data.description,
              latitude: data.latitude,
              longitude: data.longitude,
            } as any,
          });

      await tx.businessProfile.updateMany({
        where: { tenantId, quickSetupStatus: 'pending' },
        data: { quickSetupStatus: 'in_progress' },
      });

      return saved;
    });
  }

  const savedLocation = location as {
    id: string;
    title: string;
    address: string;
    description: string | null;
    radius: number;
    latitude: { toString(): string } | null;
    longitude: { toString(): string } | null;
    isPrimaryOnboarding?: boolean;
  };

  revalidatePath('/locations');
  revalidatePath('/quick-setup');
  return {
    ok: true as const,
    message: 'محل کار اصلی با موفقیت ثبت شد.',
    location: {
      id: savedLocation.id,
      title: savedLocation.title,
      address: savedLocation.address,
      description: savedLocation.description,
      radius: savedLocation.radius,
      allowedRadiusMeters: savedLocation.radius,
      latitude: savedLocation.latitude?.toString() ?? null,
      longitude: savedLocation.longitude?.toString() ?? null,
      isPrimaryOnboarding: Boolean(savedLocation.isPrimaryOnboarding),
    },
  };
}

export async function updateLocationAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const current = (await prisma.location.findFirst({ where: { id, tenantId }, select: { id: true } })) as { id: string } | null;
  if (!current) throw new Error('Location not found for active tenant.');
  const data = buildLocationData(formData, tenantId, false);

  try {
    await prisma.location.update({
      where: { id },
      data: {
        title: data.title,
        address: data.address,
        radius: data.radius,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
      } as any,
    });
  } catch (error) {
    if (!shouldRetryLocationWithoutCoordinates(error) && !shouldRetryLocationWithoutPrimaryOnboarding(error)) throw error;
    await prisma.location.update({
      where: { id },
      data: {
        title: data.title,
        address: data.address,
        radius: data.radius,
        description: data.description,
        ...(shouldRetryLocationWithoutCoordinates(error) ? {} : { latitude: data.latitude, longitude: data.longitude }),
      } as any,
    });
  }

  revalidatePath('/locations');
  revalidatePath(`/locations/${id}/edit`);
  revalidatePath('/quick-setup');
  redirect('/locations');
}

export async function deleteLocationAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const current = await prisma.location.findFirst({
    where: { id, tenantId },
    select: { id: true, isPrimaryOnboarding: true, _count: { select: { workGroups: true } } },
  });
  if (!current) throw new Error('Location not found for active tenant.');
  if (current._count.workGroups > 0) {
    throw new Error(DELETE_GUARD_MESSAGES.locationUsed);
  }

  const replacement = current.isPrimaryOnboarding
    ? await prisma.location.findFirst({
        where: { tenantId, id: { not: id } },
        orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
        select: { id: true },
      })
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.location.delete({ where: { id } });
    if (replacement) {
      await tx.location.updateMany({
        where: { id: replacement.id, tenantId },
        data: { isPrimaryOnboarding: true, isActive: true },
      });
    }
  });
  revalidatePath('/locations');
  revalidatePath('/quick-setup');
  redirect('/locations');
}

export async function setPrimaryLocationAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const current = await prisma.location.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!current) throw new Error('Location not found for active tenant.');

  await prisma.$transaction(async (tx) => {
    await tx.location.updateMany({
      where: { tenantId, isPrimaryOnboarding: true, id: { not: id } } as any,
      data: { isPrimaryOnboarding: false },
    });
    await tx.location.update({
      where: { id },
      data: { isPrimaryOnboarding: true, isActive: true } as any,
    });
  });

  revalidatePath('/locations');
  revalidatePath('/quick-setup');
  redirect('/locations');
}

export async function toggleLocationActiveAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const nextIsActive = value(formData, 'isActive') === 'true';
  const current = await prisma.location.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!current) throw new Error('Location not found for active tenant.');

  await prisma.location.update({
    where: { id },
    data: { isActive: nextIsActive } as any,
  });

  revalidatePath('/locations');
  revalidatePath('/quick-setup');
  redirect('/locations');
}

export async function createRequestReasonFromDialogAction(data: {
  title: string;
  description?: string;
  category: string;
  isActive: boolean;
}) {
  const tenantId = await getTenantId();
  const category = data.category as never;
  const lastOrder = await prisma.requestReason.aggregate({
    where: { tenantId, category },
    _max: { displayOrder: true },
  });

  await prisma.requestReason.create({
    data: {
      tenantId,
      title: data.title,
      description: data.description?.trim() || null,
      category,
      isActive: data.isActive,
      displayOrder: (lastOrder._max.displayOrder ?? 0) + 1,
    },
  });

  revalidatePath('/request-reasons');
  return { ok: true as const };
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
  const current = await prisma.requestReason.findFirst({
    where: { id, tenantId },
    select: { id: true, _count: { select: { employeeRequests: true } } },
  });
  if (!current) throw new Error('Request reason not found for active tenant.');
  if (current._count.employeeRequests > 0) {
    throw new Error(DELETE_GUARD_MESSAGES.requestReasonUsed);
  }
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

export async function createOrganizationUnitFromDialogAction(data: { title: string; description?: string }) {
  const tenantId = await getTenantId();
  await prisma.organizationUnit.create({
    data: {
      tenantId,
      title: data.title,
      description: data.description?.trim() || null,
    },
  });
  revalidatePath('/organization-units');
  return { ok: true as const };
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
  const current = await prisma.organizationUnit.findFirst({
    where: { id, tenantId },
    select: { id: true, _count: { select: { employees: true } } },
  });
  if (!current) throw new Error('Organization unit not found for active tenant.');
  if (current._count.employees > 0) {
    throw new Error(DELETE_GUARD_MESSAGES.organizationUnitUsed);
  }
  await prisma.organizationUnit.deleteMany({ where: { id, tenantId } });
  revalidatePath('/organization-units');
  redirect('/organization-units');
}

export async function createShiftTemplateFromDialogAction(data: {
  shiftType: string;
  shiftTitle: string;
  description?: string;
  shiftConfig: Record<string, unknown>;
}) {
  const tenantId = await getTenantId();
  const payload = serializeShiftTemplateFromWizard({
    shiftType: data.shiftType as CalendarShiftType,
    shiftTitle: data.shiftTitle,
    description: data.description,
    shiftConfig: data.shiftConfig,
  });

  await prisma.shiftTemplate.create({
    data: {
      tenantId,
      title: payload.title,
      description: payload.description,
      type: payload.type,
      weekDays: jsonValue(payload.weekDays as any),
      config: jsonValue(payload.config as any),
      breaks: jsonValue(payload.breaks as any),
      isActive: payload.isActive,
    },
  });

  revalidatePath('/shift-templates');
  return { ok: true as const };
}

export async function deleteShiftTemplateAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  await prisma.shiftTemplate.deleteMany({ where: { id, tenantId } });
  revalidatePath('/shift-templates');
}

export async function toggleShiftTemplateActiveAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const isActive = boolValue(formData, 'isActive');
  const current = await prisma.shiftTemplate.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!current) throw new Error('Shift template not found for active tenant.');

  await prisma.shiftTemplate.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath('/shift-templates');
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
  const current = await prisma.calendar.findFirst({
    where: { id, tenantId },
    select: { id: true, _count: { select: { policies: true } } },
  });
  if (!current) throw new Error('Calendar not found for active tenant.');
  if (current._count.policies > 0) {
    throw new Error(DELETE_GUARD_MESSAGES.calendarUsed);
  }
  await prisma.calendar.deleteMany({ where: { id, tenantId } });
  revalidatePath('/calendars');
  revalidatePath('/quick-setup');
  redirect('/calendars');
}

export async function addCalendarShiftAction(data: {
  calendarId: string;
  shiftType: string;
  shiftTitle: string;
  shiftConfig: Record<string, unknown>;
}) {
  const tenantId = await getTenantId();
  const calendar = await prisma.calendar.findFirst({
    where: { id: data.calendarId, tenantId },
    select: { id: true, shiftConfig: true },
  });
  if (!calendar) throw new Error('Calendar not found for active tenant.');

  const root =
    calendar.shiftConfig && typeof calendar.shiftConfig === 'object' && !Array.isArray(calendar.shiftConfig)
      ? { ...(calendar.shiftConfig as Record<string, unknown>) }
      : {};

  const existingShifts = Array.isArray(root.shifts) ? [...(root.shifts as Array<Record<string, unknown>>)] : [];

  if (existingShifts.length === 0 && typeof root.shiftType === 'string' && root.shiftType) {
    existingShifts.push({
      id: crypto.randomUUID(),
      shiftType: root.shiftType,
      title: String(root.title ?? ''),
      config: root,
      createdAt: new Date().toISOString(),
    });
  }

  const resolvedShiftTitle = resolveCalendarShiftTitle(data.shiftTitle, data.shiftType);

  const newShift = {
    id: crypto.randomUUID(),
    shiftType: data.shiftType,
    title: resolvedShiftTitle,
    config: { ...data.shiftConfig, shiftType: data.shiftType, title: resolvedShiftTitle },
    createdAt: new Date().toISOString(),
  };

  existingShifts.push(newShift);

  const excludedDates = listExcludedShiftDates(calendar.shiftConfig).map((date) => normalizePersianDateInput(date));

  await prisma.calendar.update({
    where: { id: data.calendarId },
    data: {
      shiftTitle: resolvedShiftTitle,
      shiftTypeLabel: getCalendarShiftTypeLabel(data.shiftType),
      shiftConfig: jsonValue({ ...root, shifts: existingShifts, excludedDates } as any),
      totalShiftDays: existingShifts.length,
    },
  });

  revalidatePath('/calendars');
  revalidatePath(`/calendars/${data.calendarId}`);
  revalidatePath('/quick-setup');

  return { id: newShift.id };
}

export async function addCalendarEventsAction(data: {
  calendarId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  weekdays?: string[];
  singleDate?: string;
  isHoliday: boolean;
  holidayType?: CalendarHolidayType;
}) {
  const tenantId = await getTenantId();
  const calendar = await prisma.calendar.findFirst({
    where: { id: data.calendarId, tenantId },
    select: { id: true, weekends: true, singleHolidays: true, startDate: true, endDate: true, shiftConfig: true },
  });
  if (!calendar) throw new Error('Calendar not found for active tenant.');

  const boundsStart = parsePersianYmd(calendar.startDate);
  const boundsEnd = parsePersianYmd(calendar.endDate);
  if (!boundsStart || !boundsEnd) throw new Error('Calendar date range is invalid.');

  const dates = data.singleDate
    ? (() => {
        const normalized = normalizePersianDateInput(data.singleDate);
        const parts = parsePersianYmd(normalized);
        if (!parts || !isPersianYmdInRange(parts, boundsStart, boundsEnd)) return [];
        return [normalized];
      })()
    : expandCalendarEventDates({
        startDate: data.startDate ?? '',
        endDate: data.endDate ?? '',
        weekdays: data.weekdays ?? [],
        bounds: { start: boundsStart, end: boundsEnd },
      });

  if (dates.length === 0) {
    throw new Error('No valid dates were found for this event range.');
  }

  if (data.isHoliday) {
    if (!data.holidayType) {
      throw new Error('نوع تعطیلی را انتخاب کنید.');
    }

    if (data.singleDate) {
      const norm = normalizePersianDateInput(data.singleDate);
      if (isPersianFridayDate(norm)) {
        if (data.holidayType !== 'friday') {
          throw new Error('برای روز جمعه فقط «تعطیلی جمعه» مجاز است؛ رسمی یا سازمانی انتخاب نشود.');
        }
      } else if (data.holidayType !== 'official' && data.holidayType !== 'organizational') {
        throw new Error('برای این روز باید نوع تعطیلی «رسمی» یا «سازمانی» را مشخص کنید.');
      }
    } else {
      if (data.holidayType === 'friday') {
        const allFriday = dates.every((d) => isPersianFridayDate(normalizePersianDateInput(d)));
        if (!allFriday) {
          throw new Error('نوع «تعطیلی جمعه» فقط وقتی مجاز است که همهٔ روزهای انتخاب‌شده جمعه باشند.');
        }
      } else if (data.holidayType !== 'official' && data.holidayType !== 'organizational') {
        throw new Error('نوع تعطیلی را مشخص کنید.');
      }
    }
  }

  const existing = parseCalendarStoredEvents(calendar.singleHolidays);
  const existingDates = new Set(existing.map((item) => item.date));
  const createdAt = new Date().toISOString();
  const description = data.description?.trim() || undefined;

  const newEvents = dates
    .filter((date) => !existingDates.has(date))
    .map((date) => {
      const normalizedDate = normalizePersianDateInput(date);
      const baseHolidayType: 'official' | 'organizational' =
        data.holidayType === 'organizational' ? 'organizational' : 'official';
      const resolvedHolidayType = data.isHoliday
        ? data.holidayType === 'friday'
          ? 'friday'
          : resolveHolidayTypeForDate(normalizedDate, baseHolidayType)
        : undefined;

      const resolvedTitle = resolveCalendarEventTitle({
        title: data.title,
        isHoliday: data.isHoliday,
        holidayType: resolvedHolidayType,
      });

      return {
        id: crypto.randomUUID(),
        title: resolvedTitle,
        date: normalizedDate,
        description,
        category: resolvedHolidayType ? getCalendarHolidayTypeLabel(resolvedHolidayType) : undefined,
        isHoliday: data.isHoliday,
        holidayType: resolvedHolidayType,
        createdAt,
      };
    });

  const merged = [...existing, ...newEvents];
  const weekends = Array.isArray(calendar.weekends) ? (calendar.weekends as string[]) : [];
  const holidayEvents = merged.filter((item) => item.isHoliday !== false);

  await prisma.calendar.update({
    where: { id: data.calendarId },
    data: {
      singleHolidays: jsonValue(merged as any),
      holidayCount: weekends.length + holidayEvents.length,
      totalEventDays: merged.length,
    },
  });

  revalidatePath('/calendars');
  revalidatePath(`/calendars/${data.calendarId}`);
  revalidatePath('/quick-setup');

  return { createdCount: newEvents.length, skippedCount: dates.length - newEvents.length };
}

export async function removeCalendarWeekendDayAction(data: { calendarId: string; weekdayName: string }) {
  const tenantId = await getTenantId();
  const calendar = await prisma.calendar.findFirst({
    where: { id: data.calendarId, tenantId },
    select: { id: true, weekends: true, singleHolidays: true },
  });
  if (!calendar) throw new Error('Calendar not found for active tenant.');

  const weekends = Array.isArray(calendar.weekends) ? (calendar.weekends as string[]) : [];
  const nextWeekends = weekends.filter((day) => day.trim() !== data.weekdayName.trim());
  if (nextWeekends.length === weekends.length) {
    throw new Error('Weekend day not found.');
  }

  const remaining = parseCalendarStoredEvents(calendar.singleHolidays);
  const holidayEvents = remaining.filter((item) => item.isHoliday !== false);

  await prisma.calendar.update({
    where: { id: data.calendarId },
    data: {
      weekends: jsonValue(nextWeekends as any),
      holidayCount: nextWeekends.length + holidayEvents.length,
    },
  });

  revalidatePath('/calendars');
  revalidatePath(`/calendars/${data.calendarId}`);
  revalidatePath('/quick-setup');

  return { removedWeekday: data.weekdayName };
}

export async function addCalendarWeekendOverrideAction(data: { calendarId: string; date: string }) {
  const tenantId = await getTenantId();
  const calendar = await prisma.calendar.findFirst({
    where: { id: data.calendarId, tenantId },
    select: { id: true, shiftConfig: true },
  });
  if (!calendar) throw new Error('Calendar not found for active tenant.');

  const root = parseCalendarShiftConfig(calendar.shiftConfig);
  const normalizedDate = normalizePersianDateInput(data.date);
  const existing = Array.isArray(root.weekendOverrides) ? (root.weekendOverrides as string[]) : [];
  const weekendOverrides = new Set(existing.map((item) => normalizePersianDateInput(String(item))));
  weekendOverrides.add(normalizedDate);

  await prisma.calendar.update({
    where: { id: data.calendarId },
    data: {
      shiftConfig: jsonValue({ ...root, weekendOverrides: [...weekendOverrides] } as any),
    },
  });

  revalidatePath('/calendars');
  revalidatePath(`/calendars/${data.calendarId}`);
  revalidatePath('/quick-setup');

  return { date: normalizedDate };
}

export async function deleteCalendarStoredEventAction(data: { calendarId: string; eventId: string }) {
  const tenantId = await getTenantId();
  const calendar = await prisma.calendar.findFirst({
    where: { id: data.calendarId, tenantId },
    select: { id: true, weekends: true, singleHolidays: true },
  });
  if (!calendar) throw new Error('Calendar not found for active tenant.');

  const existing = parseCalendarStoredEvents(calendar.singleHolidays);
  const remaining = existing.filter((item) => item.id !== data.eventId);
  if (remaining.length === existing.length) {
    throw new Error('Event not found.');
  }

  const weekends = Array.isArray(calendar.weekends) ? (calendar.weekends as string[]) : [];
  const holidayEvents = remaining.filter((item) => item.isHoliday !== false);

  await prisma.calendar.update({
    where: { id: data.calendarId },
    data: {
      singleHolidays: jsonValue(remaining as any),
      holidayCount: weekends.length + holidayEvents.length,
      totalEventDays: remaining.length,
    },
  });

  revalidatePath('/calendars');
  revalidatePath(`/calendars/${data.calendarId}`);
  revalidatePath('/quick-setup');

  return { removedCount: existing.length - remaining.length };
}

export async function deleteCalendarEventsInRangeAction(data: {
  calendarId: string;
  startDate: string;
  endDate: string;
  weekdays: string[];
}) {
  const tenantId = await getTenantId();
  const calendar = await prisma.calendar.findFirst({
    where: { id: data.calendarId, tenantId },
    select: { id: true, weekends: true, singleHolidays: true, startDate: true, endDate: true },
  });
  if (!calendar) throw new Error('Calendar not found for active tenant.');

  const boundsStart = parsePersianYmd(calendar.startDate);
  const boundsEnd = parsePersianYmd(calendar.endDate);
  if (!boundsStart || !boundsEnd) throw new Error('Calendar date range is invalid.');

  const dates = new Set(
    expandCalendarEventDates({
      startDate: data.startDate,
      endDate: data.endDate,
      weekdays: data.weekdays,
      bounds: { start: boundsStart, end: boundsEnd },
    }),
  );

  if (dates.size === 0) {
    throw new Error('No valid dates were found for this deletion range.');
  }

  const existing = parseCalendarStoredEvents(calendar.singleHolidays);
  const remaining = existing.filter((item) => !dates.has(item.date));
  const removedCount = existing.length - remaining.length;
  const weekends = Array.isArray(calendar.weekends) ? (calendar.weekends as string[]) : [];
  const holidayEvents = remaining.filter((item) => item.isHoliday !== false);

  await prisma.calendar.update({
    where: { id: data.calendarId },
    data: {
      singleHolidays: jsonValue(remaining as any),
      holidayCount: weekends.length + holidayEvents.length,
      totalEventDays: remaining.length,
    },
  });

  revalidatePath('/calendars');
  revalidatePath(`/calendars/${data.calendarId}`);
  revalidatePath('/quick-setup');

  return { removedCount };
}

export async function deleteCalendarShiftsInRangeAction(data: {
  calendarId: string;
  startDate: string;
  endDate: string;
  weekdays: string[];
}) {
  const tenantId = await getTenantId();
  const calendar = await prisma.calendar.findFirst({
    where: { id: data.calendarId, tenantId },
    select: { id: true, shiftConfig: true, startDate: true, endDate: true },
  });
  if (!calendar) throw new Error('Calendar not found for active tenant.');

  const boundsStart = parsePersianYmd(calendar.startDate);
  const boundsEnd = parsePersianYmd(calendar.endDate);
  if (!boundsStart || !boundsEnd) throw new Error('Calendar date range is invalid.');

  const dates = expandCalendarEventDates({
    startDate: data.startDate,
    endDate: data.endDate,
    weekdays: data.weekdays,
    bounds: { start: boundsStart, end: boundsEnd },
  });

  if (dates.length === 0) {
    throw new Error('No valid dates were found for this deletion range.');
  }

  const shiftRoot = parseCalendarShiftConfig(calendar.shiftConfig);
  const excludedDates = new Set(listExcludedShiftDates(calendar.shiftConfig).map((date) => normalizePersianDateInput(date)));
  const beforeCount = excludedDates.size;
  for (const date of dates) {
    excludedDates.add(normalizePersianDateInput(date));
  }

  await prisma.calendar.update({
    where: { id: data.calendarId },
    data: {
      shiftConfig: jsonValue({ ...shiftRoot, excludedDates: [...excludedDates] } as any),
    },
  });

  revalidatePath('/calendars');
  revalidatePath(`/calendars/${data.calendarId}`);
  revalidatePath('/quick-setup');

  return { removedCount: excludedDates.size - beforeCount };
}

export async function toggleCalendarStatusAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const isActive = value(formData, 'isActive') === 'true';
  await prisma.calendar.updateMany({
    where: { id, tenantId },
    data: { status: isActive ? 'active' : 'inactive' },
  });
  revalidatePath('/calendars');
  revalidatePath('/quick-setup');
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
      shiftTypeLabel: getCalendarShiftTypeLabel(data.shiftType),
      shiftConfig: jsonValue(data.shiftConfig as any),
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
  includeOfficialEvents?: boolean;
}) {
  const tenantId = await getTenantId();
  const source = await ensureGlobalDefaultCalendar(data.yearLabel);
  const includeOfficialEvents = data.includeOfficialEvents === true;
  const templateWeekends = Array.isArray(source.weekends) ? (source.weekends as string[]) : ['جمعه'];
  const templateHolidays = Array.isArray(source.singleHolidays)
    ? (source.singleHolidays as Array<{ id: string; title: string; date: string }>)
    : [];
  const weekends = includeOfficialEvents ? templateWeekends : [];
  const singleHolidays = includeOfficialEvents
    ? templateHolidays.length > 0
      ? templateHolidays
      : getOfficialHolidaysForYear(data.yearLabel)
    : [];
  const holidayCount = weekends.length + singleHolidays.length;

  const draft = await prisma.calendar.create({
    data: {
      tenantId,
      title: data.title,
      description: data.description?.trim() || null,
      yearLabel: data.yearLabel,
      startDate: source.startDate,
      endDate: source.endDate,
      weekends: jsonValue(weekends as any),
      singleHolidays: jsonValue(singleHolidays as any),
      shiftTitle: '',
      shiftTypeLabel: '',
      shiftConfig: '{}',
      holidayCount,
      totalShiftDays: 0,
      totalEventDays: singleHolidays.length,
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

function resolveCalendarHolidayCount(input: {
  startDate: string;
  endDate: string;
  weekends: string[];
  singleHolidays: Array<{ date: string; isHoliday?: boolean }>;
  weekendOverrideDates?: string[];
}) {
  return countCalendarHolidayDays({
    startDate: input.startDate,
    endDate: input.endDate,
    weekends: input.weekends,
    singleHolidayDates: input.singleHolidays
      .filter((item) => item.isHoliday !== false)
      .map((item) => item.date),
    weekendOverrideDates: input.weekendOverrideDates,
  });
}

export async function updateCalendarHolidaysFromQuickSetupAction(data: {
  calendarId: string;
  startDate: string;
  endDate: string;
  weekends: string[];
  singleHolidays: { id: string; title: string; date: string }[];
}) {
  const tenantId = await getTenantId();
  const current = await prisma.calendar.findFirst({
    where: { id: data.calendarId, tenantId },
    select: { id: true, shiftConfig: true },
  });
  if (!current) throw new Error('Calendar not found for active tenant.');

  const shiftRoot = parseCalendarShiftConfig(current.shiftConfig);
  const holidayCount = resolveCalendarHolidayCount({
    startDate: data.startDate,
    endDate: data.endDate,
    weekends: data.weekends,
    singleHolidays: data.singleHolidays,
    weekendOverrideDates: Array.isArray(shiftRoot.weekendOverrides)
      ? (shiftRoot.weekendOverrides as string[])
      : [],
  });

  await prisma.calendar.update({
    where: { id: data.calendarId },
    data: {
      weekends: jsonValue(data.weekends),
      singleHolidays: jsonValue(data.singleHolidays),
      holidayCount,
      totalEventDays: data.singleHolidays.length,
    },
  });

  revalidatePath('/calendars');
  revalidatePath('/quick-setup');
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
    select: { id: true, shiftConfig: true },
  });
  if (!current) throw new Error('Calendar not found for active tenant.');

  const shiftRoot = parseCalendarShiftConfig(current.shiftConfig);
  const holidayCount = resolveCalendarHolidayCount({
    startDate: data.startDate,
    endDate: data.endDate,
    weekends: data.weekends,
    singleHolidays: data.singleHolidays,
    weekendOverrideDates: Array.isArray(shiftRoot.weekendOverrides)
      ? (shiftRoot.weekendOverrides as string[])
      : [],
  });
  const resolvedShiftTitle = resolveCalendarShiftTitle(data.shiftTitle, data.shiftType);
  const shiftConfig = {
    ...data.shiftConfig,
    shiftType: data.shiftType,
    title: resolvedShiftTitle,
  };

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
      shiftTitle: resolvedShiftTitle,
      shiftTypeLabel: getCalendarShiftTypeLabel(data.shiftType),
      shiftConfig: jsonValue(shiftConfig as any),
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

  const preserveWorkMeta = familyKey === 'work' && (workSection === 'overtime' || workSection === 'other') && existingPolicy;
  const preserveManualWorkMeta =
    familyKey === 'manual' && existingPolicy && previousSectionValues.familyKey === 'work';
  const preserveNightWorkMeta =
    familyKey === 'night' && existingPolicy && previousSectionValues.familyKey === 'work';
  const preserveRemoteWorkMeta =
    familyKey === 'remote' && existingPolicy && previousSectionValues.familyKey === 'work';
  const title = preserveWorkMeta || preserveManualWorkMeta || preserveNightWorkMeta || preserveRemoteWorkMeta
    ? existingPolicy.title
    : value(formData, 'title') || family.title;
  const description =
    preserveWorkMeta || preserveManualWorkMeta || preserveNightWorkMeta || preserveRemoteWorkMeta
      ? existingPolicy.description
      : value(formData, 'description') || null;

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
  const effectiveCalendarId = calendarId || previousCalendarId;
  const previousLeavePolicy =
    previousSectionValues.leavePolicy &&
    typeof previousSectionValues.leavePolicy === 'object' &&
    !Array.isArray(previousSectionValues.leavePolicy)
      ? (previousSectionValues.leavePolicy as Record<string, unknown>)
      : null;
  const leaveType = LEAVE_VARIANT_TO_TYPE[variant];
  const leaveRuleDefaults = leaveType ? getDefaultLeaveRule(leaveType) : null;
  const leaveMonthlyLimitMinutes = Number(value(formData, 'monthlyLimit') || '0');
  const leaveMaxUsageMinutes = Number(value(formData, 'maxUsageHours') || '0');

  const sectionValues =
    familyKey === 'work' && workSection === 'overtime'
      ? jsonValue({
          ...previousSectionValues,
          familyKey,
          variant,
          title,
          description,
          calendarId: effectiveCalendarId,
          overtimeFromAttendance: boolValue(formData, 'overtimeFromAttendance'),
          overtimeRequireAttachment: boolValue(formData, 'overtimeRequireAttachment'),
          overtimeBeforeShift: boolValue(formData, 'overtimeBeforeShift'),
          overtimeAfterShift: boolValue(formData, 'overtimeAfterShift'),
        })
      : familyKey === 'work' && workSection === 'other'
        ? jsonValue({
            ...previousSectionValues,
            familyKey,
            variant,
            title,
            description,
            calendarId: effectiveCalendarId,
            requireGeofence: boolValue(formData, 'requireGeofence'),
            faceRecognitionInFlow: boolValue(formData, 'faceRecognitionInFlow'),
            consecutiveAbsenceWarning: boolValue(formData, 'consecutiveAbsenceWarning'),
            maxConsecutiveAbsenceDays: Number(value(formData, 'maxConsecutiveAbsenceDays') || '0'),
          })
      : familyKey === 'work' && workSection === 'base'
        ? jsonValue({
            ...previousSectionValues,
            familyKey,
            variant,
            title,
            description,
            calendarId: effectiveCalendarId,
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
      : familyKey === 'leave' && leaveType && leaveRuleDefaults
        ? jsonValue({
            ...previousSectionValues,
            familyKey,
            variant,
            title,
            description,
            calendarId: effectiveCalendarId,
            enabled: boolValue(formData, 'enabled'),
            paid: boolValue(formData, 'paid'),
            deductsFromEntitlementBalance: boolValue(formData, 'deductsFromEntitlementBalance'),
            requireAttachment: boolValue(formData, 'requireAttachment'),
            dailyModeEnabled: boolValue(formData, 'dailyModeEnabled'),
            hourlyModeEnabled: boolValue(formData, 'hourlyModeEnabled'),
            multiDayModeEnabled: boolValue(formData, 'multiDayModeEnabled'),
            monthlyLimit:
              leaveMonthlyLimitMinutes > 0 ? Math.round(leaveMonthlyLimitMinutes / 60) : null,
            maxUsageHours:
              leaveMaxUsageMinutes > 0 ? Math.round(leaveMaxUsageMinutes / 60) : null,
            leavePolicy: applyVariantRule(previousLeavePolicy as any, leaveType, {
              enabled: boolValue(formData, 'enabled'),
              paid: boolValue(formData, 'paid'),
              deductsFromEntitlementBalance: boolValue(formData, 'deductsFromEntitlementBalance'),
              requiresAttachment: boolValue(formData, 'requireAttachment'),
              requestModes: {
                daily: boolValue(formData, 'dailyModeEnabled'),
                hourly:
                  leaveType === 'entitlement'
                    ? boolValue(formData, 'hourlyModeEnabled')
                    : leaveRuleDefaults.requestModes.hourly,
                multiDay: boolValue(formData, 'multiDayModeEnabled'),
              },
              monthlyUsageCapHours:
                leaveMonthlyLimitMinutes > 0 ? Math.round(leaveMonthlyLimitMinutes / 60) : null,
              maxUsageHours:
                leaveMaxUsageMinutes > 0 ? Math.round(leaveMaxUsageMinutes / 60) : null,
            }),
            rule: {
              enabled: boolValue(formData, 'enabled'),
              paid: boolValue(formData, 'paid'),
              deductsFromEntitlementBalance: boolValue(formData, 'deductsFromEntitlementBalance'),
              requiresAttachment: boolValue(formData, 'requireAttachment'),
              requestModes: {
                daily: boolValue(formData, 'dailyModeEnabled'),
                hourly:
                  leaveType === 'entitlement'
                    ? boolValue(formData, 'hourlyModeEnabled')
                    : leaveRuleDefaults.requestModes.hourly,
                multiDay: boolValue(formData, 'multiDayModeEnabled'),
              },
              monthlyUsageCapHours:
                leaveMonthlyLimitMinutes > 0 ? Math.round(leaveMonthlyLimitMinutes / 60) : null,
              maxUsageHours:
                leaveMaxUsageMinutes > 0 ? Math.round(leaveMaxUsageMinutes / 60) : null,
            },
          })
        : familyKey === 'night'
          ? jsonValue({
              ...previousSectionValues,
              familyKey: preserveNightWorkMeta ? 'work' : 'night',
              variant,
              title,
              description,
              calendarId: effectiveCalendarId,
              nightEnabled: boolValue(formData, 'nightEnabled'),
              nightStart: null,
              nightEnd: null,
            })
        : familyKey === 'manual'
          ? jsonValue({
              ...previousSectionValues,
              familyKey: preserveManualWorkMeta ? 'work' : 'manual',
              variant,
              title,
              description,
              calendarId: effectiveCalendarId,
              manualEntryEnabled: boolValue(formData, 'manualEntryEnabled'),
              manualRequireReason: boolValue(formData, 'manualRequireReason'),
              requireAttachment: boolValue(formData, 'requireAttachment'),
              manualPastDaysEnabled: boolValue(formData, 'manualPastDaysEnabled'),
              manualMaxPastDays: Number(value(formData, 'manualMaxPastDays') || '0'),
              manualMonthlyCapPerUser: Number(value(formData, 'manualMonthlyCapPerUser') || '0'),
            })
        : familyKey === 'remote'
          ? jsonValue({
              ...previousSectionValues,
              familyKey: preserveRemoteWorkMeta ? 'work' : 'remote',
              variant,
              title,
              description,
              calendarId: effectiveCalendarId,
              ...buildRemoteWorkPolicyPayload(formData, previousSectionValues),
            })
        : familyKey === 'shift' && variant === 'split'
          ? (() => {
              const splitPayload = buildSplitShiftSegmentsPayload(formData, previousSectionValues);
              const segments = splitPayload.splitShiftSegments;
              const validationErrors = validateSplitShiftSegmentRules(segments);
              if (validationErrors.length) throw new Error(validationErrors[0]);
              return jsonValue({
                ...previousSectionValues,
                familyKey,
                variant,
                title,
                description,
                calendarId,
                ...splitPayload,
                startTime: segments[0]?.startTime ?? null,
                endTime: segments[0]?.endTime ?? null,
                workStartWindow: segments[1]?.startTime ?? null,
                workEndWindow: segments[1]?.endTime ?? null,
              });
            })()
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
        calendarId: effectiveCalendarId,
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
        calendarId: effectiveCalendarId,
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
  const current = await prisma.workPolicy.findFirst({
    where: { id, tenantId },
    select: { id: true, _count: { select: { workGroups: true } } },
  });
  if (!current) throw new Error('Policy not found for active tenant.');
  if (current._count.workGroups > 0) {
    throw new Error(DELETE_GUARD_MESSAGES.policyUsed);
  }
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
      isDefault: true,
      sectionValues: jsonValue({
        familyKey: 'work',
        variant: 'default',
        manualAttendance: false,
        overtimeFromAttendance: true,
        nightWorkStart: '22:00',
        templateType: 'quick-setup',
        templateId: data.policyTemplateId,
        templateTitle: data.templateTitle ?? data.title,
        selectedCalendarId: data.calendarId,
        selectedPolicyTemplateId: data.policyTemplateId,
        generatedPolicyTitle: data.title,
        generatedPolicyDescription: data.description ?? '',
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

type QuickCompletionInviteContact = {
  type: 'mobile' | 'email';
  value: string;
};

type QuickCompletionInviteRow = {
  contactType: 'mobile' | 'email';
  contactValue: string;
  employeeId: string;
  completionLink: string;
  created: boolean;
  existingEmployee: boolean;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    mobile: string | null;
    status: 'registered' | 'invite_sent' | 'pending_completion' | 'completed' | 'active' | 'failed_send' | 'error';
    addMethod: 'single' | 'excel' | 'invitation_link' | 'email_invite' | 'sms_invite';
    invitationStatus: 'sent' | 'failed' | null;
    lastActionAt: string | null;
    avatarUrl?: string;
  };
};

function normalizeQuickInviteContact(value: string, type: QuickCompletionInviteContact['type']) {
  return type === 'mobile' ? sanitizeIranMobileInput(value) : normalizeEmail(value);
}

function buildQuickInviteCompletionLink(employeeId: string) {
  return `/quick-setup/invite/${employeeId}?token=${randomUUID()}`;
}

export async function createQuickCompletionInvitesAction(data: { contacts: QuickCompletionInviteContact[] }) {
  const tenantId = await getTenantId();
  const now = new Date();
  const seen = new Set<string>();
  const rows: QuickCompletionInviteRow[] = [];
  let createdCount = 0;
  let existingCount = 0;
  let sentCount = 0;
  let failedCount = 0;

  for (const contact of data.contacts) {
    const normalized = normalizeQuickInviteContact(contact.value, contact.type);
    if (!normalized) {
      failedCount += 1;
      continue;
    }

    const key = `${contact.type}:${normalized}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    const where =
      contact.type === 'email'
        ? { tenantId, email: { contains: normalized, mode: 'insensitive' as const } }
        : {
            tenantId,
            OR: [
              { mobile1: normalized },
              { mobile2: normalized },
              { mobile1: { contains: normalized } },
              { mobile2: { contains: normalized } },
            ],
          };

    const existing = await prisma.employee.findFirst({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile1: true,
        avatarUrl: true,
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    } as any);

    const quickSetupStatus = 'invite_sent' as const;
    const quickSetupAddMethod = 'invitation_link' as const;

    if (existing) {
      existingCount += 1;
      const employee = await prisma.employee.update({
        where: { id: existing.id },
        data: {
          ...(contact.type === 'email' ? { email: normalized } : { mobile1: normalized }),
          quickSetupStatus,
          quickSetupAddMethod,
          quickSetupInvitationStatus: 'sent',
          quickSetupLastActionAt: now,
        } as any,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile1: true,
          avatarUrl: true,
        },
      } as any);

      rows.push({
        contactType: contact.type,
        contactValue: normalized,
        employeeId: employee.id,
        created: false,
        existingEmployee: true,
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email ?? null,
          mobile: employee.mobile1 ?? null,
          status: quickSetupStatus,
          addMethod: quickSetupAddMethod,
          invitationStatus: 'sent',
          lastActionAt: now.toISOString(),
          avatarUrl: employee.avatarUrl ?? undefined,
        },
        completionLink: buildQuickInviteCompletionLink(employee.id),
      });
      sentCount += 1;
      continue;
    }

    const employee = await prisma.employee.create({
      data: {
        tenantId,
        firstName: 'کارمند',
        lastName: 'جدید',
        email: contact.type === 'email' ? normalized : null,
        mobile1: contact.type === 'mobile' ? normalized : null,
        quickSetupStatus,
        quickSetupAddMethod,
        quickSetupInvitationStatus: 'sent',
        quickSetupLastActionAt: now,
      } as any,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile1: true,
        avatarUrl: true,
      },
    } as any);

    createdCount += 1;
    sentCount += 1;
    rows.push({
      contactType: contact.type,
      contactValue: normalized,
      employeeId: employee.id,
      created: true,
      existingEmployee: false,
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email ?? null,
        mobile: employee.mobile1 ?? null,
        status: quickSetupStatus,
        addMethod: quickSetupAddMethod,
        invitationStatus: 'sent',
        lastActionAt: now.toISOString(),
        avatarUrl: employee.avatarUrl ?? undefined,
      },
      completionLink: buildQuickInviteCompletionLink(employee.id),
    });
  }

  revalidatePath('/employees');
  revalidatePath('/quick-setup');

  return {
    total: data.contacts.length,
    processedCount: rows.length,
    createdCount,
    existingCount,
    sentCount,
    failedCount,
    rows,
  };
}

function normalizeExcelHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u200c\u200d]/g, '')
    .replace(/[\s\-_]+/g, '');
}

function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function parseExcelImportRow(row: Record<string, unknown>, rowNumber: number) {
  const entries = Object.entries(row).map(([key, value]) => [normalizeExcelHeader(key), String(value ?? '').trim()] as const);
  const findByAliases = (aliases: string[]) => {
    const normalizedAliases = aliases.map((item) => normalizeExcelHeader(item));
    return entries.find(([key]) => normalizedAliases.includes(key))?.[1] ?? '';
  };

  return {
    rowNumber,
    firstName: findByAliases(['نام', 'firstName', 'first name', 'firstname']).trim(),
    lastName: findByAliases(['نام خانوادگی', 'lastName', 'last name', 'lastname', 'family']).trim(),
    email: findByAliases(['ایمیل', 'email']).trim(),
    mobile: findByAliases(['شماره موبایل', 'موبایل', 'mobile', 'phone', 'cell']).trim(),
  };
}

function getContactCandidatesForImport(row: { email: string; mobile: string }) {
  const candidates: Array<{ channel: QuickEmployeeImportJobInvitationChannel; value: string }> = [];

  if (row.email) {
    const email = normalizeEmail(row.email);
    if (isValidEmailAddress(email)) candidates.push({ channel: 'email', value: email });
  }

  if (row.mobile) {
    const mobile = sanitizeIranMobileInput(row.mobile);
    if (isValidIranMobile(mobile)) candidates.push({ channel: 'sms', value: mobile });
  }

  return candidates;
}

function buildContactWhereClause(candidates: Array<{ channel: QuickEmployeeImportJobInvitationChannel; value: string }>) {
  const orClauses: Array<Record<string, string>> = [];
  for (const candidate of candidates) {
    if (candidate.channel === 'email') {
      orClauses.push({ email: candidate.value });
      continue;
    }
    orClauses.push({ mobile1: candidate.value });
    orClauses.push({ mobile2: candidate.value });
  }
  return orClauses;
}

function mapImportModeToJobType(mode: string): QuickEmployeeImportJobType {
  return mode === 'excel_import_invite' ? 'excel_add_and_invite' : 'excel_add';
}

function mapImportModeToInvitationStatus(mode: string, hasContact: boolean): QuickEmployeeImportJobMockInvitationStatus {
  if (mode !== 'excel_import_invite') return 'not_required';
  return hasContact ? 'mock_sent' : 'mock_failed';
}

function mapImportModeToRowStatus(mode: string, created: boolean, existing: boolean, invalid: boolean, duplicate: boolean, failed: boolean) {
  if (failed) return 'failed' satisfies QuickEmployeeImportJobRowStatus;
  if (duplicate) return 'duplicate_in_file' satisfies QuickEmployeeImportJobRowStatus;
  if (invalid) return 'invalid' satisfies QuickEmployeeImportJobRowStatus;
  if (existing) return 'existing_employee' satisfies QuickEmployeeImportJobRowStatus;
  if (mode === 'excel_import_invite' && created) return 'mock_invited' satisfies QuickEmployeeImportJobRowStatus;
  if (created) return 'created' satisfies QuickEmployeeImportJobRowStatus;
  return 'invalid' satisfies QuickEmployeeImportJobRowStatus;
}

function importRowMessage(status: QuickEmployeeImportJobRowStatus, mode: string) {
  switch (status) {
    case 'created':
      return 'کارمند با موفقیت ثبت شد.';
    case 'mock_invited':
      return mode === 'excel_import_invite' ? 'کارمند ثبت شد و دعوت آزمایشی برای تکمیل اطلاعات ثبت شد.' : 'کارمند ثبت شد.';
    case 'existing_employee':
      return 'این کارمند قبلاً در همین کسب‌وکار ثبت شده است.';
    case 'duplicate_in_file':
      return 'این ردیف در فایل تکرار شده است.';
    case 'invalid':
      return 'ردیف دارای اطلاعات نامعتبر است.';
    case 'failed':
      return 'ثبت این ردیف ناموفق بود.';
    default:
      return 'در انتظار پردازش';
  }
}

export async function listEmployeeImportJobsAction() {
  const tenantId = await getTenantId();
  return listEmployeeImportJobsForTenant(tenantId, 10);
}

export async function getEmployeeImportJobDetailsAction(jobId: string) {
  const tenantId = await getTenantId();
  return getEmployeeImportJobDetailsForTenant(tenantId, jobId);
}

export async function createEmployeeImportJobAction(formData: FormData): Promise<QuickEmployeeImportJobDetails> {
  const tenantId = await getTenantId();
  const session = await getSessionContext();
  const file = formData.get('file');
  const mode = String(formData.get('mode') ?? 'excel_import');
  if (!(file instanceof File)) {
    throw new Error('Excel file is required.');
  }

  const workbookBuffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(workbookBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Excel sheet is missing.');
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
  const jobType = mapImportModeToJobType(mode);

  const job = await prisma.employeeImportJob.create({
    data: {
      tenantId,
      type: jobType,
      fileName: file.name || 'employees.xlsx',
      status: 'processing',
      totalCount: rawRows.length,
      createdById: session?.userId ?? null,
    },
  });

  try {
    if (!rawRows.length) {
      throw new Error('Excel file does not contain any rows.');
    }
    if (rawRows.length > 500) {
      throw new Error('Maximum 500 rows are supported.');
    }

    const headerKeys = new Set(Object.keys(rawRows[0] ?? {}).map((value) => normalizeExcelHeader(value)));
    const requiredHeaderGroups = [
      ['نام', 'firstName', 'first name', 'firstname'],
      ['نام خانوادگی', 'lastName', 'last name', 'lastname', 'family'],
      ['ایمیل', 'email'],
      ['شماره موبایل', 'موبایل', 'mobile', 'phone', 'cell'],
    ];
    const hasRequiredHeaders = requiredHeaderGroups.every((aliases, index) => {
      if (index < 2) return aliases.some((alias) => headerKeys.has(normalizeExcelHeader(alias)));
      return aliases.some((alias) => headerKeys.has(normalizeExcelHeader(alias)));
    });
    if (!hasRequiredHeaders) {
      throw new Error('Required columns are missing from the Excel file.');
    }

    const seenKeys = new Set<string>();
    let createdCount = 0;
    let existingCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;
    let failedCount = 0;
    let mockInvitedCount = 0;
    const now = new Date();

    for (let index = 0; index < rawRows.length; index += 1) {
      const row = parseExcelImportRow(rawRows[index], index + 2);
      const contactCandidates = getContactCandidatesForImport(row);
      const contactKeys = contactCandidates.map((candidate) => `${candidate.channel}:${candidate.value}`);
      const duplicateInFile = contactKeys.some((key) => seenKeys.has(key));
      contactKeys.forEach((key) => seenKeys.add(key));

      const hasName = Boolean(row.firstName.trim() && row.lastName.trim());
      const hasContact = contactCandidates.length > 0;
      const invalid = !hasName || !hasContact;

      let employeeId: string | null = null;
      let status: QuickEmployeeImportJobRowStatus = 'invalid';
      let message = '';
      let mockInvitationStatus: QuickEmployeeImportJobMockInvitationStatus = mapImportModeToInvitationStatus(mode, hasContact);
      let invitationChannel: QuickEmployeeImportJobInvitationChannel | null = contactCandidates[0]?.channel ?? null;

      if (duplicateInFile) {
        duplicateCount += 1;
        status = 'duplicate_in_file';
        message = importRowMessage(status, mode);
        mockInvitationStatus = 'not_required';
        invitationChannel = null;
      } else if (invalid) {
        invalidCount += 1;
        status = 'invalid';
        message = !hasName ? 'نام و نام خانوادگی برای ثبت کارمند جدید لازم است.' : 'ایمیل یا شماره موبایل معتبر لازم است.';
        mockInvitationStatus = 'not_required';
        invitationChannel = null;
      } else {
        const existingEmployee = await prisma.employee.findFirst({
          where: {
            tenantId,
            OR: buildContactWhereClause(contactCandidates) as any,
          },
          select: { id: true },
        });

        if (existingEmployee) {
          existingCount += 1;
          status = 'existing_employee';
          message = importRowMessage(status, mode);
          employeeId = existingEmployee.id;
          mockInvitationStatus = 'not_required';
          invitationChannel = null;
        } else {
          try {
            const employee = await prisma.employee.create({
              data: {
                tenantId,
                firstName: row.firstName,
                lastName: row.lastName,
                email: contactCandidates.find((candidate) => candidate.channel === 'email')?.value ?? null,
                mobile1: contactCandidates.find((candidate) => candidate.channel === 'sms')?.value ?? null,
                isActive: true,
              },
              select: { id: true },
            });

            employeeId = employee.id;
            createdCount += 1;
            if (mode === 'excel_import_invite') {
              mockInvitedCount += 1;
            }
            status = mapImportModeToRowStatus(mode, true, false, false, false, false);
            message = importRowMessage(status, mode);
          } catch {
            failedCount += 1;
            status = 'failed';
            message = importRowMessage(status, mode);
            mockInvitationStatus = 'mock_failed';
          }
        }
      }

      await prisma.employeeImportJobRow.create({
        data: {
          jobId: job.id,
          rowNumber: row.rowNumber,
          firstName: row.firstName,
          lastName: row.lastName,
          email: contactCandidates.find((candidate) => candidate.channel === 'email')?.value ?? null,
          mobile: contactCandidates.find((candidate) => candidate.channel === 'sms')?.value ?? null,
          employeeId,
          status,
          message,
          mockInvitationStatus,
          invitationChannel,
          processedAt: now,
        },
      });
    }

    const processedCount = createdCount + existingCount + duplicateCount + invalidCount + failedCount;
    const finalStatus: QuickEmployeeImportJobStatus = failedCount > 0 || invalidCount > 0 || duplicateCount > 0 || existingCount > 0
      ? 'completed_with_errors'
      : 'completed';

    await prisma.employeeImportJob.update({
      where: { id: job.id },
      data: {
        status: finalStatus,
        processedCount,
        createdCount,
        existingCount,
        duplicateCount,
        invalidCount,
        failedCount,
        mockInvitedCount,
      },
    });
  } catch (error) {
    await prisma.employeeImportJob.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        processedCount: 0,
      },
    });
    throw error;
  }

  revalidatePath('/employees');
  revalidatePath('/quick-setup');

  const details = await getEmployeeImportJobDetailsForTenant(tenantId, job.id);
  if (!details) {
    throw new Error('Import job was saved but could not be loaded.');
  }
  return details;
}

function normalizeQuickSetupSearchQuery(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function digitsOnlyText(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/\D/g, '');
}

export async function searchQuickSetupEmployeeSuggestionsAction(data: {
  query: string;
  contactMethod: 'mobile' | 'email';
}) {
  const tenantId = await getTenantId();
  const query = normalizeQuickSetupSearchQuery(data.query);
  if (query.length < 3) return { items: [] as Array<{ id: string; firstName: string; lastName: string; email: string | null; mobile: string | null; status: string; source: 'employee' | 'tenant_user' }> };

  const mobileDigits = data.contactMethod === 'mobile' ? digitsOnlyText(query) : '';
  const employeeWhere = {
    tenantId,
    OR: [
      { firstName: { contains: query, mode: 'insensitive' as const } },
      { lastName: { contains: query, mode: 'insensitive' as const } },
      { email: { contains: query, mode: 'insensitive' as const } },
      { mobile1: { contains: query, mode: 'insensitive' as const } },
      ...(mobileDigits ? [{ mobile1: { contains: mobileDigits, mode: 'insensitive' as const } }] : []),
    ],
  };

  const [employees, memberships] = await Promise.all([
    prisma.employee.findMany({
      where: employeeWhere as any,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile1: true,
        isActive: true,
        updatedAt: true,
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take: 6,
    }),
    prisma.userTenantMembership.findMany({
      where: {
        tenantId,
        user: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' as const } },
            { lastName: { contains: query, mode: 'insensitive' as const } },
            { fullName: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
            { mobile: { contains: query, mode: 'insensitive' as const } },
            ...(mobileDigits ? [{ mobile: { contains: mobileDigits, mode: 'insensitive' as const } }] : []),
          ],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ]);

  const employeeItems = employees.map((item) => ({
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    email: item.email ?? null,
    mobile: item.mobile1 ?? null,
    status: item.isActive ? 'ثبت‌شده' : 'در انتظار تکمیل',
    source: 'employee' as const,
  }));

  const userItems = memberships
    .map((item) => item.user)
    .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index)
    .filter((user) => !employeeItems.some((employee) => employee.email && user.email && employee.email === user.email) && !employeeItems.some((employee) => employee.mobile && user.mobile && employee.mobile === user.mobile))
    .map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email ?? null,
      mobile: user.mobile ?? null,
      status: 'عضو کسب‌وکار',
      source: 'tenant_user' as const,
    }));

  return { items: [...employeeItems, ...userItems].slice(0, 6) };
}

export async function updateEmployeeAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  await prisma.employee.updateMany({
    where: { id, tenantId },
    data: {
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
      canEditIdentityPhoto: boolValue(formData, 'canEditIdentityPhoto'),
    },
  });
  revalidatePath('/employees');
  revalidatePath(`/employees/${id}`);
  redirect(`/employees/${id}`);
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
  const accounts = JSON.parse(value(formData, 'accounts')) as any;
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
  const guarantees = JSON.parse(value(formData, 'guarantees')) as any;
  await prisma.employee.updateMany({
    where: { id: employeeId, tenantId },
    data: { guarantees },
  });
  revalidatePath(`/employees/${employeeId}`);
  revalidatePath(`/employees/${employeeId}/guarantee`);
}

type WorkGroupMemberAssignment = {
  employeeId: string;
  accessLevel: WorkGroupAccessLevel;
  joinedAt: Date;
};

function normalizeWorkGroupAccessLevel(raw: string | null | undefined): WorkGroupAccessLevel {
  if (raw === 'employee' || raw === 'lead' || raw === 'manager') return raw;
  return 'employee';
}

function parseTagList(raw: string) {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseJoinDate(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return new Date();

  const persianParts = parsePersianYmd(normalizePersianDateInput(trimmed));
  if (persianParts) {
    try {
      const iso = persianToDate(persianParts).toISOString().slice(0, 10);
      return new Date(`${iso}T12:00:00.000Z`);
    } catch {
      // fall through to ISO parsing
    }
  }

  const isoCandidate = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T12:00:00.000Z` : trimmed;
  const parsed = new Date(isoCandidate);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function archiveCurrentMembershipsForEmployee(
  tx: Prisma.TransactionClient,
  employeeId: string,
  leftAt: Date,
  excludeWorkGroupId?: string,
) {
  const memberships = await tx.workGroupMember.findMany({
    where: {
      employeeId,
      isCurrent: true,
      ...(excludeWorkGroupId ? { workGroupId: { not: excludeWorkGroupId } } : {}),
    },
    select: { id: true },
  });

  if (!memberships.length) return;

  await tx.workGroupMember.updateMany({
    where: { id: { in: memberships.map((membership) => membership.id) } },
    data: {
      isCurrent: false,
      leftAt,
    },
  });
}

async function syncWorkGroupMembers(
  tx: Prisma.TransactionClient,
  params: {
    workGroupId: string;
    assignments: WorkGroupMemberAssignment[];
    archiveRemovedMembers: boolean;
  },
) {
  const now = new Date();
  const currentRows = await tx.workGroupMember.findMany({
    where: {
      workGroupId: params.workGroupId,
      isCurrent: true,
    },
    select: {
      id: true,
      employeeId: true,
    },
  });

  const currentEmployeeIds = new Set(currentRows.map((row) => row.employeeId));
  const selectedEmployeeIds = new Set(params.assignments.map((assignment) => assignment.employeeId));

  for (const assignment of params.assignments) {
    await archiveCurrentMembershipsForEmployee(tx, assignment.employeeId, assignment.joinedAt, params.workGroupId);
  }

  for (const assignment of params.assignments) {
    const isCurrentMember = currentEmployeeIds.has(assignment.employeeId);

    if (isCurrentMember) {
      await tx.workGroupMember.updateMany({
        where: {
          workGroupId: params.workGroupId,
          employeeId: assignment.employeeId,
          isCurrent: true,
        },
        data: {
          accessLevel: assignment.accessLevel,
          joinedAt: assignment.joinedAt,
          leftAt: null,
          isCurrent: true,
        },
      });
      continue;
    }

    const archivedInGroup = await tx.workGroupMember.findFirst({
      where: {
        workGroupId: params.workGroupId,
        employeeId: assignment.employeeId,
        isCurrent: false,
      },
      orderBy: { joinedAt: 'desc' },
      select: { id: true },
    });

    if (archivedInGroup) {
      await tx.workGroupMember.update({
        where: { id: archivedInGroup.id },
        data: {
          accessLevel: assignment.accessLevel,
          joinedAt: assignment.joinedAt,
          leftAt: null,
          isCurrent: true,
        },
      });
      continue;
    }

    await tx.workGroupMember.create({
      data: {
        workGroupId: params.workGroupId,
        employeeId: assignment.employeeId,
        accessLevel: assignment.accessLevel,
        joinedAt: assignment.joinedAt,
        isCurrent: true,
      },
    });
  }

  if (!params.archiveRemovedMembers) return;

  const removedRows = currentRows.filter((row) => !selectedEmployeeIds.has(row.employeeId));
  if (!removedRows.length) return;

  await tx.workGroupMember.updateMany({
    where: {
      id: { in: removedRows.map((row) => row.id) },
    },
    data: {
      isCurrent: false,
      leftAt: now,
    },
  });
}

async function persistWorkGroupUpdate(
  tenantId: string,
  workGroupId: string | null,
  formData: FormData,
  archiveRemovedMembers: boolean,
) {
  const employeeIds = formData.getAll('employeeIds').map(String);
  const locationId = value(formData, 'locationId') || null;
  const policyId = value(formData, 'policyId') || null;

  const title = value(formData, 'title');
  if (!title.trim()) throw new Error('Work group title is required.');

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

  const description = value(formData, 'description') || null;
  const tags = parseTagList(value(formData, 'tags'));
  const assignments = validEmployees.map(({ id: employeeId }) => ({
    employeeId,
    accessLevel: normalizeWorkGroupAccessLevel(value(formData, `accessLevel:${employeeId}`)),
    joinedAt: value(formData, `joinedAt:${employeeId}`) ? parseJoinDate(value(formData, `joinedAt:${employeeId}`)) : new Date(),
  }));

  const workGroup = await prisma.$transaction(async (tx) => {
    if (workGroupId) {
      const current = await tx.workGroup.findFirst({
        where: { id: workGroupId, tenantId },
        select: { id: true },
      });
      if (!current) throw new Error('Work group not found for active tenant.');

      await tx.workGroup.update({
        where: { id: workGroupId },
        data: {
          title,
          description,
          tags: jsonValue(tags),
          locationId,
          policyId,
        },
      });

      await syncWorkGroupMembers(tx, {
        workGroupId,
        assignments,
        archiveRemovedMembers,
      });

      return { id: workGroupId, title };
    }

    const created = await tx.workGroup.create({
      data: {
        tenantId,
        title,
        description,
        tags: jsonValue(tags),
        locationId,
        policyId,
      },
    });

    await syncWorkGroupMembers(tx, {
      workGroupId: created.id,
      assignments,
      archiveRemovedMembers: false,
    });

    return { id: created.id, title: created.title };
  });

  revalidatePath('/work-groups');
  revalidatePath('/quick-setup');
  if (workGroupId) {
    revalidatePath(`/work-groups/${workGroup.id}/edit`);
  }
  for (const assignment of assignments) {
    revalidatePath(`/employees/${assignment.employeeId}/work-report`);
  }

  return workGroup;
}

export async function createWorkGroupAction(formData: FormData) {
  const tenantId = await getTenantId();
  const employeeIds = formData.getAll('employeeIds').map(String);
  const locationId = value(formData, 'locationId') || null;
  const policyId = value(formData, 'policyId') || null;
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
  const title = value(formData, 'title');
  const description = value(formData, 'description') || null;
  const tags = parseTagList(value(formData, 'tags'));
  const assignments = validEmployees.map(({ id: employeeId }) => ({
    employeeId,
    accessLevel: normalizeWorkGroupAccessLevel(value(formData, `accessLevel:${employeeId}`)),
    joinedAt: value(formData, `joinedAt:${employeeId}`) ? parseJoinDate(value(formData, `joinedAt:${employeeId}`)) : new Date(),
  }));

  await prisma.$transaction(async (tx) => {
    const workGroup = await tx.workGroup.create({
      data: {
        tenantId,
        title,
        description,
        tags: jsonValue(tags),
        locationId,
        policyId,
      },
    });

    await syncWorkGroupMembers(tx, {
      workGroupId: workGroup.id,
      assignments,
      archiveRemovedMembers: false,
    });
  });
  revalidatePath('/work-groups');
  revalidatePath('/quick-setup');
  redirect('/work-groups');
}

export async function updateWorkGroupAction(formData: FormData) {
  const tenantId = await getTenantId();
  const workGroupId = value(formData, 'id');
  await persistWorkGroupUpdate(tenantId, workGroupId, formData, true);
  redirect('/work-groups');
}

export async function saveWorkGroupDraftAction(formData: FormData) {
  const tenantId = await getTenantId();
  const workGroupId = value(formData, 'id');
  return persistWorkGroupUpdate(tenantId, workGroupId, formData, true);
}

export async function deleteWorkGroupAction(formData: FormData) {
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const current = await prisma.workGroup.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!current) throw new Error('Work group not found for active tenant.');
  await prisma.workGroup.delete({ where: { id } });
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

export async function upsertContractDraftTemplateAction(template: ContractDraftTemplate) {
  const tenantId = await getTenantId();
  const normalized = normalizeContractDraftTemplate(template);
  if (!normalized) throw new Error('Draft template is invalid.');

  const data = {
    tenantId,
    title: normalized.name,
    description: null,
    category: 'hr' as const,
    body: JSON.stringify(normalized),
    version: 1,
    isActive: true,
  };

  const current = await prisma.draftTemplate.findFirst({ where: { id: normalized.id, tenantId }, select: { id: true } });
  if (current) {
    await prisma.draftTemplate.update({
      where: { id: normalized.id },
      data,
    });
  } else {
    await prisma.draftTemplate.create({
      data: {
        id: normalized.id,
        ...data,
      },
    });
  }

  revalidatePath('/draft-templates');
  revalidatePath('/draft-templates/builder');
  return { ok: true as const, id: normalized.id };
}

export async function deleteDraftTemplateAction(templateId: string) {
  const tenantId = await getTenantId();
  const current = await prisma.draftTemplate.findFirst({ where: { id: templateId, tenantId }, select: { id: true } });
  if (!current) throw new Error('Draft template not found for the active tenant.');
  const [contractUsageCount, clientDraftUsageCount] = await Promise.all([
    prisma.employeeContract.count({
      where: {
        tenantId,
        templateId,
      },
    }),
    prisma.clientStorageState.count({
      where: {
        tenantId,
        storageKey: {
          startsWith: EMPLOYEE_CONTRACT_DRAFTS_STORAGE_KEY,
        },
        value: {
          contains: `"templateId":"${templateId}"`,
        },
      },
    }),
  ]);
  if (contractUsageCount > 0 || clientDraftUsageCount > 0) {
    throw new Error(DELETE_GUARD_MESSAGES.draftTemplateUsed);
  }
  await prisma.draftTemplate.delete({ where: { id: templateId } });
  revalidatePath('/draft-templates');
  revalidatePath('/draft-templates/builder');
  return { ok: true as const };
}

export async function saveDraftTemplateStepAction(formData: FormData) {
  const tenantId = await getTenantId();
  const step = value(formData, 'step');
  const id = value(formData, 'id');

  if (step === 'base') {
    const title = value(formData, 'title').trim();
    const current = id
      ? await prisma.draftTemplate.findFirst({ where: { id, tenantId }, select: { id: true, body: true } })
      : null;
    if (id && !current) throw new Error('قالب پیش‌نویس پیدا نشد.');
    const existingBody = parseJsonRecord(current?.body);

    const data = {
      tenantId,
      title,
      description: value(formData, 'description') || null,
      category: 'hr' as const,
      version: 1,
      isActive: true,
      body: JSON.stringify({
        ...existingBody,
        version: 1,
        base: {
          title,
          description: value(formData, 'description') || '',
          workReference: value(formData, 'workReference') || 'none',
        },
        attendance: existingBody.attendance ?? null,
      }),
    };

    let saved;
    if (id) {
      saved = await prisma.draftTemplate.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          version: data.version,
          isActive: data.isActive,
          body: data.body,
        },
      });
    } else {
      saved = await prisma.draftTemplate.create({ data });
    }

    revalidatePath('/draft-templates');
    revalidatePath('/draft-templates/new');
    return { ok: true as const, id: saved.id };
  }

  if (step === 'attendance') {
    if (!id) throw new Error('ابتدا اطلاعات پایه قالب را ذخیره کنید.');
    const current = await prisma.draftTemplate.findFirst({ where: { id, tenantId } });
    if (!current) throw new Error('قالب پیش‌نویس پیدا نشد.');

    const body = parseJsonRecord(current.body);

    const saved = await prisma.draftTemplate.update({
      where: { id },
      data: {
        body: JSON.stringify({
          ...body,
          version: 1,
          attendance: {
            monthlyLeaveLimit: digitsOnlyValue(formData, 'monthlyLeaveLimit'),
            leaveTransferLimit: digitsOnlyValue(formData, 'leaveTransferLimit'),
            monthlyOvertimeLimit: digitsOnlyValue(formData, 'monthlyOvertimeLimit'),
          },
        }),
      },
    });

    revalidatePath('/draft-templates');
    revalidatePath('/draft-templates/new');
    return { ok: true as const, id: saved.id };
  }

  if (step === 'payroll') {
    if (!id) throw new Error('ابتدا مراحل قبلی قالب را ذخیره کنید.');
    const current = await prisma.draftTemplate.findFirst({ where: { id, tenantId } });
    if (!current) throw new Error('قالب پیش‌نویس پیدا نشد.');

    const body = parseJsonRecord(current.body);

    const payrollEnabled = value(formData, 'payrollEnabled');
    if (payrollEnabled !== 'yes' && payrollEnabled !== 'no') {
      throw new Error('وضعیت محاسبات حقوق و دستمزد را مشخص کنید.');
    }
    const existingPayroll =
      body.payroll && typeof body.payroll === 'object' && !Array.isArray(body.payroll)
        ? (body.payroll as Record<string, unknown>)
        : {};

    const saved = await prisma.draftTemplate.update({
      where: { id },
      data: {
        body: JSON.stringify({
          ...body,
          version: 1,
          payroll: {
            ...existingPayroll,
            enabled: payrollEnabled === 'yes',
            type: 'monthly_fixed',
            entryMode: value(formData, 'payrollEntryMode') || null,
            includeInsurance: boolValue(formData, 'includeInsurance'),
            includeTax: boolValue(formData, 'includeTax'),
            ...(value(formData, 'payrollEntryMode') === 'manual'
              ? {
                  monthlyDutyHours: digitsOnlyValue(formData, 'monthlyDutyHours'),
                  hourlyRateFormula: digitsOnlyValue(formData, 'hourlyRateFormula'),
                }
              : {}),
          },
        }),
      },
    });

    revalidatePath('/draft-templates');
    revalidatePath('/draft-templates/new');
    return { ok: true as const, id: saved.id };
  }

  if (step === 'components') {
    if (!id) throw new Error('ابتدا مراحل قبلی قالب را ذخیره کنید.');
    const current = await prisma.draftTemplate.findFirst({ where: { id, tenantId } });
    if (!current) throw new Error('قالب پیش‌نویس پیدا نشد.');

    const body = parseJsonRecord(current.body);
    const existingPayroll =
      body.payroll && typeof body.payroll === 'object' && !Array.isArray(body.payroll)
        ? (body.payroll as Record<string, unknown>)
        : {};
    if (existingPayroll.enabled !== true || existingPayroll.entryMode !== 'manual') {
      throw new Error('برای ثبت مولفه‌های حکمی ابتدا ورود دستی حقوق و دستمزد را ذخیره کنید.');
    }

    const saved = await prisma.draftTemplate.update({
      where: { id },
      data: {
        body: JSON.stringify({
          ...body,
          version: 1,
          payroll: {
            ...existingPayroll,
            components: {
              baseSalary: {
                amount: digitsOnlyValue(formData, 'baseSalary'),
                insurance: boolValue(formData, 'baseSalaryInsurance'),
                tax: boolValue(formData, 'baseSalaryTax'),
                inBase: boolValue(formData, 'baseSalaryInBase'),
              },
              monthlyBenefitsBase: {
                amount: digitsOnlyValue(formData, 'monthlyBenefitsBase'),
                insurance: boolValue(formData, 'monthlyBenefitsBaseInsurance'),
                tax: boolValue(formData, 'monthlyBenefitsBaseTax'),
                inBase: boolValue(formData, 'monthlyBenefitsBaseInBase'),
              },
              housingAllowance: {
                amount: digitsOnlyValue(formData, 'housingAllowance'),
                insurance: boolValue(formData, 'housingAllowanceInsurance'),
                tax: boolValue(formData, 'housingAllowanceTax'),
                inBase: boolValue(formData, 'housingAllowanceInBase'),
              },
              foodAllowance: {
                amount: digitsOnlyValue(formData, 'foodAllowance'),
                insurance: boolValue(formData, 'foodAllowanceInsurance'),
                tax: boolValue(formData, 'foodAllowanceTax'),
                inBase: boolValue(formData, 'foodAllowanceInBase'),
              },
              childAllowance: {
                amount: digitsOnlyValue(formData, 'childAllowance'),
                insurance: boolValue(formData, 'childAllowanceInsurance'),
                tax: boolValue(formData, 'childAllowanceTax'),
                inBase: boolValue(formData, 'childAllowanceInBase'),
              },
              seniorityAllowance: {
                amount: digitsOnlyValue(formData, 'seniorityAllowance'),
                insurance: boolValue(formData, 'seniorityAllowanceInsurance'),
                tax: boolValue(formData, 'seniorityAllowanceTax'),
                inBase: boolValue(formData, 'seniorityAllowanceInBase'),
              },
            },
          },
        }),
      },
    });

    revalidatePath('/draft-templates');
    revalidatePath('/draft-templates/new');
    return { ok: true as const, id: saved.id };
  }

  if (step === 'jobBenefits') {
    if (!id) throw new Error('ابتدا مراحل قبلی قالب را ذخیره کنید.');
    const current = await prisma.draftTemplate.findFirst({ where: { id, tenantId } });
    if (!current) throw new Error('قالب پیش‌نویس پیدا نشد.');

    const body = parseJsonRecord(current.body);
    const existingPayroll =
      body.payroll && typeof body.payroll === 'object' && !Array.isArray(body.payroll)
        ? (body.payroll as Record<string, unknown>)
        : {};
    if (existingPayroll.enabled !== true || existingPayroll.entryMode !== 'manual') {
      throw new Error('برای ثبت مزایای به تبع شغل ابتدا ورود دستی حقوق و دستمزد را ذخیره کنید.');
    }
    if (!existingPayroll.components) {
      throw new Error('ابتدا مولفه‌های اصلی حکمی را ذخیره کنید.');
    }

    const saved = await prisma.draftTemplate.update({
      where: { id },
      data: {
        body: JSON.stringify({
          ...body,
          version: 1,
          payroll: {
            ...existingPayroll,
            jobBenefits: {
              attractionAllowance: {
                amount: digitsOnlyValue(formData, 'attractionAllowance'),
                insurance: boolValue(formData, 'attractionAllowanceInsurance'),
                tax: boolValue(formData, 'attractionAllowanceTax'),
                inBase: boolValue(formData, 'attractionAllowanceInBase'),
              },
              managementAllowance: {
                amount: digitsOnlyValue(formData, 'managementAllowance'),
                insurance: boolValue(formData, 'managementAllowanceInsurance'),
                tax: boolValue(formData, 'managementAllowanceTax'),
                inBase: boolValue(formData, 'managementAllowanceInBase'),
              },
              commuteAllowance: {
                amount: digitsOnlyValue(formData, 'commuteAllowance'),
                insurance: boolValue(formData, 'commuteAllowanceInsurance'),
                tax: boolValue(formData, 'commuteAllowanceTax'),
                inBase: boolValue(formData, 'commuteAllowanceInBase'),
              },
              hardshipAllowance: {
                amount: digitsOnlyValue(formData, 'hardshipAllowance'),
                insurance: boolValue(formData, 'hardshipAllowanceInsurance'),
                tax: boolValue(formData, 'hardshipAllowanceTax'),
                inBase: boolValue(formData, 'hardshipAllowanceInBase'),
              },
            },
          },
        }),
      },
    });

    revalidatePath('/draft-templates');
    revalidatePath('/draft-templates/new');
    return { ok: true as const, id: saved.id };
  }

  if (step === 'otherBenefits') {
    if (!id) throw new Error('ابتدا مراحل قبلی قالب را ذخیره کنید.');
    const current = await prisma.draftTemplate.findFirst({ where: { id, tenantId } });
    if (!current) throw new Error('قالب پیش‌نویس پیدا نشد.');

    const body = parseJsonRecord(current.body);
    const existingPayroll =
      body.payroll && typeof body.payroll === 'object' && !Array.isArray(body.payroll)
        ? (body.payroll as Record<string, unknown>)
        : {};
    if (existingPayroll.enabled !== true || existingPayroll.entryMode !== 'manual') {
      throw new Error('برای ثبت سایر مزایا ابتدا ورود دستی حقوق و دستمزد را ذخیره کنید.');
    }
    if (!existingPayroll.jobBenefits) {
      throw new Error('ابتدا مزایای به تبع شغل را ذخیره کنید.');
    }

    const saved = await prisma.draftTemplate.update({
      where: { id },
      data: {
        body: JSON.stringify({
          ...body,
          version: 1,
          payroll: {
            ...existingPayroll,
            otherBenefits: {
              miscBenefit: {
                amount: digitsOnlyValue(formData, 'miscBenefit'),
                insurance: boolValue(formData, 'miscBenefitInsurance'),
                inBase: boolValue(formData, 'miscBenefitInBase'),
              },
            },
          },
        }),
      },
    });

    revalidatePath('/draft-templates');
    revalidatePath('/draft-templates/new');
    return { ok: true as const, id: saved.id };
  }

  if (step === 'fixedAdjustments') {
    if (!id) throw new Error('ابتدا مراحل قبلی قالب را ذخیره کنید.');
    const current = await prisma.draftTemplate.findFirst({ where: { id, tenantId } });
    if (!current) throw new Error('قالب پیش‌نویس پیدا نشد.');

    const body = parseJsonRecord(current.body);
    const existingPayroll =
      body.payroll && typeof body.payroll === 'object' && !Array.isArray(body.payroll)
        ? (body.payroll as Record<string, unknown>)
        : {};
    if (existingPayroll.enabled !== true || existingPayroll.entryMode !== 'manual') {
      throw new Error('برای ثبت اضافات و کسورات ثابت ابتدا ورود دستی حقوق و دستمزد را ذخیره کنید.');
    }
    if (!existingPayroll.otherBenefits) {
      throw new Error('ابتدا سایر مزایا را ذخیره کنید.');
    }

    const rawJson = value(formData, 'fixedAdjustmentsJson');
    let fixedAdjustments: unknown[] = [];
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        if (!Array.isArray(parsed)) throw new Error('فرمت اضافات و کسورات ثابت معتبر نیست.');
        fixedAdjustments = parsed;
      } catch {
        throw new Error('فرمت اضافات و کسورات ثابت معتبر نیست.');
      }
    }

    const saved = await prisma.draftTemplate.update({
      where: { id },
      data: {
        body: JSON.stringify({
          ...body,
          version: 1,
          payroll: {
            ...existingPayroll,
            fixedAdjustments,
          },
        }),
      },
    });

    revalidatePath('/draft-templates');
    revalidatePath('/draft-templates/new');
    return { ok: true as const, id: saved.id };
  }

  if (step === 'timeCoefficients') {
    if (!id) throw new Error('ابتدا مراحل قبلی قالب را ذخیره کنید.');
    const current = await prisma.draftTemplate.findFirst({ where: { id, tenantId } });
    if (!current) throw new Error('قالب پیش‌نویس پیدا نشد.');

    const body = parseJsonRecord(current.body);
    const existingPayroll =
      body.payroll && typeof body.payroll === 'object' && !Array.isArray(body.payroll)
        ? (body.payroll as Record<string, unknown>)
        : {};
    if (existingPayroll.enabled !== true || existingPayroll.entryMode !== 'manual') {
      throw new Error('برای ثبت ضرایب زمانی ابتدا ورود دستی حقوق و دستمزد را ذخیره کنید.');
    }
    if (!Array.isArray(existingPayroll.fixedAdjustments)) {
      throw new Error('ابتدا اضافات و کسورات ثابت را ذخیره کنید.');
    }

    const timeCoefficients = {
      overtimeCoefficient: {
        value: decimalStringValue(formData, 'overtimeCoefficient'),
        insurance: boolValue(formData, 'overtimeCoefficientInsurance'),
        tax: boolValue(formData, 'overtimeCoefficientTax'),
      },
      nightWorkCoefficient: {
        value: decimalStringValue(formData, 'nightWorkCoefficient'),
        insurance: boolValue(formData, 'nightWorkCoefficientInsurance'),
        tax: boolValue(formData, 'nightWorkCoefficientTax'),
      },
      holidayWorkCoefficient: {
        value: decimalStringValue(formData, 'holidayWorkCoefficient'),
        insurance: boolValue(formData, 'holidayWorkCoefficientInsurance'),
        tax: boolValue(formData, 'holidayWorkCoefficientTax'),
      },
      fridayWorkCoefficient: {
        value: decimalStringValue(formData, 'fridayWorkCoefficient'),
        insurance: boolValue(formData, 'fridayWorkCoefficientInsurance'),
        tax: boolValue(formData, 'fridayWorkCoefficientTax'),
      },
      fridayWorkNoOvertimeCoefficient: {
        value: decimalStringValue(formData, 'fridayWorkNoOvertimeCoefficient'),
        insurance: boolValue(formData, 'fridayWorkNoOvertimeCoefficientInsurance'),
        tax: boolValue(formData, 'fridayWorkNoOvertimeCoefficientTax'),
      },
    };

    const saved = await prisma.draftTemplate.update({
      where: { id },
      data: {
        body: JSON.stringify({
          ...body,
          version: 1,
          payroll: {
            ...existingPayroll,
            timeCoefficients,
          },
        }),
      },
    });

    revalidatePath('/draft-templates');
    revalidatePath('/draft-templates/new');
    return { ok: true as const, id: saved.id };
  }

  if (step === 'nightShiftRules') {
    if (!id) throw new Error('ابتدا مراحل قبلی قالب را ذخیره کنید.');
    const current = await prisma.draftTemplate.findFirst({ where: { id, tenantId } });
    if (!current) throw new Error('قالب پیش‌نویس پیدا نشد.');

    const body = parseJsonRecord(current.body);
    const existingPayroll =
      body.payroll && typeof body.payroll === 'object' && !Array.isArray(body.payroll)
        ? (body.payroll as Record<string, unknown>)
        : {};
    if (existingPayroll.enabled !== true || existingPayroll.entryMode !== 'manual') {
      throw new Error('برای ثبت نوبت‌کاری ابتدا ورود دستی حقوق و دستمزد را ذخیره کنید.');
    }
    if (!existingPayroll.timeCoefficients) {
      throw new Error('ابتدا ضرایب زمانی را ذخیره کنید.');
    }

    const nightShiftRules = {
      insurance: boolValue(formData, 'nightShiftInsurance'),
      tax: boolValue(formData, 'nightShiftTax'),
      morningEveningPercent: decimalStringValue(formData, 'morningEveningPercent'),
      morningNightPercent: decimalStringValue(formData, 'morningNightPercent'),
      morningEveningNightPercent: decimalStringValue(formData, 'morningEveningNightPercent'),
      eveningNightPercent: decimalStringValue(formData, 'eveningNightPercent'),
    };

    const saved = await prisma.draftTemplate.update({
      where: { id },
      data: {
        body: JSON.stringify({
          ...body,
          version: 1,
          payroll: {
            ...existingPayroll,
            nightShiftRules,
          },
        }),
      },
    });

    revalidatePath('/draft-templates');
    revalidatePath('/draft-templates/new');
    return { ok: true as const, id: saved.id };
  }

  if (step === 'legalLimits') {
    if (!id) throw new Error('ابتدا مراحل قبلی قالب را ذخیره کنید.');
    const current = await prisma.draftTemplate.findFirst({ where: { id, tenantId } });
    if (!current) throw new Error('قالب پیش‌نویس پیدا نشد.');

    const body = parseJsonRecord(current.body);
    const existingPayroll =
      body.payroll && typeof body.payroll === 'object' && !Array.isArray(body.payroll)
        ? (body.payroll as Record<string, unknown>)
        : {};
    if (existingPayroll.enabled !== true || existingPayroll.entryMode !== 'manual') {
      throw new Error('برای ثبت کسورات قانونی ابتدا ورود دستی حقوق و دستمزد را ذخیره کنید.');
    }
    if (!existingPayroll.nightShiftRules) {
      throw new Error('ابتدا فوق‌العاده نوبت کاری را ذخیره کنید.');
    }

    const rawTaxBracketsJson = value(formData, 'taxBracketsJson');
    let taxBrackets: unknown[] = [];
    if (rawTaxBracketsJson) {
      try {
        const parsed = JSON.parse(rawTaxBracketsJson);
        if (!Array.isArray(parsed)) throw new Error('فرمت پله‌های مالیات معتبر نیست.');
        taxBrackets = parsed
          .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object' && !Array.isArray(item))
          .map((item) => ({
            id: typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID(),
            startAmount: typeof item.startAmount === 'string' ? item.startAmount.replace(/[^\d.]/g, '') : '',
            endAmount: typeof item.endAmount === 'string' ? item.endAmount.replace(/[^\d.]/g, '') : '',
            percent: typeof item.percent === 'string' ? item.percent.replace(/[^\d.]/g, '') : '',
          }))
          .filter((item) => item.startAmount || item.endAmount || item.percent);
      } catch {
        throw new Error('فرمت پله‌های مالیات معتبر نیست.');
      }
    }

    const legalLimits = {
      employeeInsuranceShare: decimalStringValue(formData, 'employeeInsuranceShare'),
      employerInsuranceShare: decimalStringValue(formData, 'employerInsuranceShare'),
      unemploymentInsuranceShare: decimalStringValue(formData, 'unemploymentInsuranceShare'),
      insuranceCeilingCoefficient: decimalStringValue(formData, 'insuranceCeilingCoefficient'),
      monthlyTaxExemption: decimalStringValue(formData, 'monthlyTaxExemption'),
      taxBrackets,
    };

    const saved = await prisma.draftTemplate.update({
      where: { id },
      data: {
        body: JSON.stringify({
          ...body,
          version: 1,
          payroll: {
            ...existingPayroll,
            legalLimits,
          },
        }),
      },
    });

    revalidatePath('/draft-templates');
    revalidatePath('/draft-templates/new');
    return { ok: true as const, id: saved.id };
  }

  throw new Error('مرحله ذخیره‌سازی معتبر نیست.');
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

  const workGroup = await prisma.$transaction(async (tx) => {
    const created = await tx.workGroup.create({
      data: {
        tenantId,
        title: data.title,
        tags: jsonValue(data.tags),
        locationId: data.locationId,
        policyId: data.policyIds[0] ?? null,
      },
    });

    await syncWorkGroupMembers(tx, {
      workGroupId: created.id,
      assignments: employees.map((employee) => ({
        employeeId: employee.id,
        accessLevel: 'employee',
        joinedAt: new Date(),
      })),
      archiveRemovedMembers: false,
    });

    return created;
  });

  revalidatePath('/work-groups');
  revalidatePath('/quick-setup');
  return { id: workGroup.id, title: workGroup.title };
}
