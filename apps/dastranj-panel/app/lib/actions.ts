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
import { isNationalIdValid } from './parse-contact';
import { getNamingPatternsFromStorage, getNamingPatternsStorageKey, generateNamingPattern, generateUniqueNamingPattern } from './naming-patterns';
import { listClientStorageStates, upsertClientStorageState } from './client-storage-persistence';
import { getEmployeeImportJobDetailsForTenant, listEmployeeImportJobsForTenant } from './employee-import-jobs';
import { isPersianYmdInRange, parsePersianYmd, persianToDate } from './calendar-dates';
import { ensureGlobalDefaultCalendar } from './calendar-defaults';
import { getOfficialHolidaysForYear } from './calendar-official-holidays';
import { expandCalendarEventDates, normalizePersianDateInput, parseCalendarStoredEvents } from './calendar-events';
import {
  getCalendarHolidayTypeLabel,
  resolveCalendarEventTitle,
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
import { templateTypeToCalendarShiftType } from './shift-template-map';
import { getShiftTemplateAccess } from './shift-template-access';
import { validateShiftTemplateInput } from './shift-template-validation';
import { getPolicyFamilyMeta, getPolicySectionValues } from './policy-workspaces';
import { requirePolicyManagement } from './policy-access';
import { validatePolicyInput } from './policy-validation';
import { getPolicyBlueprint, isAvailablePolicyBlueprintKey } from './policy-blueprints';
import { applyVariantRule, getDefaultLeaveRule, LEAVE_VARIANT_TO_TYPE } from './leave-policy';
import {
  buildSplitShiftSegmentsPayload,
  validateSplitShiftSegmentRules,
} from './split-shift-policy';
import { buildRemoteWorkPolicyPayload } from './remote-work-policy';
import { seedSampleData } from './seed';
import type { ContractDraftTemplate } from './contract-draft-templates';
import { normalizeContractDraftTemplate } from './contract-draft-templates';
import { requireEmployeeAccess, requireOrganizationUnitAccess } from './organization-unit-access';
import { createEmployeeAuditLog } from './employee-audit';
import * as XLSX from './xlsx';
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

async function requireShiftTemplatePermission() {
  const access = await getShiftTemplateAccess();
  if (!access.canManage || !access.tenantId) {
    throw new Error('برای مدیریت قالب‌های شیفت دسترسی کافی ندارید.');
  }
  return access.tenantId;
}

async function validateAndResolveShiftTemplate(input: {
  title: string;
  type: string;
  weekDays: unknown;
  config: Record<string, unknown>;
  breaks: unknown;
  excludeId?: string;
}) {
  const result = validateShiftTemplateInput(input);
  if (!result.valid) throw new Error(result.errors.join(' '));
  const duplicate = await prisma.shiftTemplate.findFirst({
    where: { tenantId: await getTenantId(), title: input.title.trim(), ...(input.excludeId ? { id: { not: input.excludeId } } : {}) },
    select: { id: true },
  });
  if (duplicate) throw new Error('قالبی با این عنوان قبلاً ثبت شده است.');
  return duplicate;
}

async function ensureUniquePolicyTitle(tenantId: string, title: string, excludeId?: string) {
  const duplicate = await prisma.workPolicy.findFirst({
    where: { tenantId, title: title.trim(), ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  if (duplicate) throw new Error('سیاست کاری دیگری با همین عنوان در این کسب‌وکار وجود دارد.');
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

export type OrganizationUnitCreatePayload = {
  source: 'custom' | 'template';
  templateIds?: string[];
  units: Array<{
    clientId: string; templateUnitId?: string; title: string; description?: string; codeMode: 'MANUAL' | 'AUTO'; code?: string; type: string; status: 'ACTIVE' | 'INACTIVE';
    parent: { kind: 'root' } | { kind: 'existing'; id: string } | { kind: 'internal'; clientId: string };
    managerId?: string;
    positions: Array<{ title: string; code?: string; capacity: number; status: 'ACTIVE' | 'INACTIVE' }>;
  }>;
};

export async function createOrganizationUnitFromDialogAction(data: OrganizationUnitCreatePayload) {
  const { tenantId } = await requireOrganizationUnitAccess('create');
  if (!data.units.length) throw new Error('حداقل یک واحد سازمانی برای ایجاد انتخاب کنید.');
  const allowedTypes = new Set(['DEPARTMENT', 'DIVISION', 'TEAM', 'BRANCH']);
  const clientIds = new Set(data.units.map((unit) => unit.clientId));
  if (clientIds.size !== data.units.length) throw new Error('شناسه واحدهای پیشنهادی تکراری است.');
  const templateIds = [...new Set(data.templateIds ?? [])];
  if (data.source === 'template') {
    if (!templateIds.length) throw new Error('حداقل یک قالب فعال انتخاب کنید.');
    const templates = await prisma.organizationStructureTemplate.findMany({
      where: { id: { in: templateIds }, tenantId, status: 'ACTIVE' },
      include: { units: { select: { id: true } } },
    });
    if (templates.length !== templateIds.length) throw new Error('یکی از قالب‌های انتخاب‌شده معتبر یا فعال نیست.');
    const allowedTemplateUnitIds = new Set(templates.flatMap((template) => template.units.map((unit) => unit.id)));
    if (data.units.some((unit) => !unit.templateUnitId || !allowedTemplateUnitIds.has(unit.templateUnitId))) throw new Error('واحد پیشنهادی متعلق به قالب‌های انتخاب‌شده نیست.');
  }
  if (data.source === 'custom' && data.units.length !== 1) throw new Error('در مسیر سفارشی فقط یک واحد ایجاد می‌شود.');

  const existingParentIds = data.units.flatMap((unit) => unit.parent.kind === 'existing' ? [unit.parent.id] : []);
  const managerIds = data.units.flatMap((unit) => unit.managerId ? [unit.managerId] : []);
  const [parents, managers] = await Promise.all([
    prisma.organizationUnit.findMany({ where: { id: { in: existingParentIds }, tenantId, status: 'ACTIVE' }, select: { id: true } }),
    prisma.employee.findMany({ where: { id: { in: managerIds }, tenantId, isActive: true }, select: { id: true } }),
  ]);
  const validParents = new Set(parents.map((item) => item.id));
  const validManagers = new Set(managers.map((item) => item.id));
  if (new Set(existingParentIds).size !== validParents.size) throw new Error('یکی از واحدهای بالادست معتبر یا فعال نیست.');
  if (new Set(managerIds).size !== validManagers.size) throw new Error('یکی از مدیران انتخاب‌شده معتبر یا فعال نیست.');

  for (const unit of data.units) {
    if (!unit.title.trim()) throw new Error('نام واحد سازمانی را وارد کنید.');
    if (!allowedTypes.has(unit.type)) throw new Error(`نوع واحد «${unit.title}» معتبر نیست.`);
    if (!['ACTIVE', 'INACTIVE'].includes(unit.status)) throw new Error(`وضعیت واحد «${unit.title}» معتبر نیست.`);
    if (unit.parent.kind === 'internal' && (!clientIds.has(unit.parent.clientId) || unit.parent.clientId === unit.clientId)) throw new Error(`والد داخلی واحد «${unit.title}» معتبر نیست.`);
    const seen = new Set<string>(); let cursor = unit;
    while (cursor.parent.kind === 'internal') {
      if (seen.has(cursor.clientId)) throw new Error('ساختار پیشنهادی قالب دارای چرخه است.');
      seen.add(cursor.clientId);
      const parentClientId = cursor.parent.clientId;
      cursor = data.units.find((item) => item.clientId === parentClientId)!;
    }
    const positionTitles = new Set<string>(); const positionCodes = new Set<string>();
    for (const position of unit.positions) {
      const normalizedTitle = position.title.trim().toLocaleLowerCase('fa');
      const normalizedCode = position.code?.trim().toLocaleLowerCase('en-US') || '';
      if (!normalizedTitle) throw new Error(`عنوان سمت‌های واحد «${unit.title}» را وارد کنید.`);
      if (!Number.isInteger(position.capacity) || position.capacity < 0) throw new Error(`ظرفیت سمت در واحد «${unit.title}» صحیح نیست.`);
      if (!['ACTIVE', 'INACTIVE'].includes(position.status)) throw new Error('وضعیت سمت معتبر نیست.');
      if (positionTitles.has(normalizedTitle) || (normalizedCode && positionCodes.has(normalizedCode))) throw new Error(`سمت تکراری در واحد «${unit.title}» وجود دارد.`);
      positionTitles.add(normalizedTitle); if (normalizedCode) positionCodes.add(normalizedCode);
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    const namingKey = getNamingPatternsStorageKey(tenantId);
    const namingScope = `tenant:${tenantId}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${namingKey}))`;
    const namingRows = await tx.clientStorageState.findMany({ where: { scope: namingScope, storageKey: namingKey }, select: { id: true, value: true } });
    const patterns = getNamingPatternsFromStorage(namingRows[0]?.value);
    let autoPattern = patterns.find((pattern) => pattern.usageType === 'organization_unit' && pattern.isActive) ?? null;
    const existingCodes: string[] = (await tx.organizationUnit.findMany({ where: { tenantId, code: { not: null } }, select: { code: true } })).map((item) => item.code).filter((code): code is string => Boolean(code));
    const usedCodes = [...existingCodes];
    const reservedCodes = new Set(existingCodes.map((code) => code.toLocaleLowerCase('en-US')));
    const resolvedCodes = new Map<string, string | null>();
    for (const unit of data.units) {
      if (unit.codeMode === 'AUTO') {
        if (!autoPattern) throw new Error('الگوی شماره‌گذاری فعال برای کد واحد وجود ندارد؛ حالت دستی را انتخاب کنید.');
        const generated = generateUniqueNamingPattern({ pattern: autoPattern, context: { date: new Date() }, existingOutputs: usedCodes });
        if (!generated.output) throw new Error('تولید کد یکتای واحد سازمانی انجام نشد.');
        autoPattern = generated.pattern; resolvedCodes.set(unit.clientId, generated.output); usedCodes.push(generated.output); reservedCodes.add(generated.output.toLocaleLowerCase('en-US'));
      } else {
        const code = unit.code?.trim() || null;
        if (code && reservedCodes.has(code.toLocaleLowerCase('en-US'))) throw new Error(`کد واحد «${code}» تکراری است.`);
        resolvedCodes.set(unit.clientId, code); if (code) reservedCodes.add(code.toLocaleLowerCase('en-US'));
      }
    }
    if (autoPattern) {
      const nextPatterns = patterns.map((pattern) => pattern.id === autoPattern!.id ? autoPattern! : pattern);
      const value = JSON.stringify(nextPatterns);
      if (namingRows[0]) await tx.clientStorageState.update({ where: { id: namingRows[0].id }, data: { value } });
      else await tx.clientStorageState.create({ data: { scope: namingScope, tenantId, storageKey: namingKey, value } });
    }
    const createdIds = new Map<string, string>(); let positionCount = 0;
    const pending = [...data.units];
    while (pending.length) {
      const index = pending.findIndex((unit) => unit.parent.kind !== 'internal' || createdIds.has(unit.parent.clientId));
      if (index < 0) throw new Error('نگاشت Parent/Child واحدهای پیشنهادی انجام نشد.');
      const unit = pending.splice(index, 1)[0];
      const parentId = unit.parent.kind === 'existing' ? unit.parent.id : unit.parent.kind === 'internal' ? createdIds.get(unit.parent.clientId)! : null;
      if (await tx.organizationUnit.findFirst({ where: { tenantId, parentId, title: { equals: unit.title.trim(), mode: 'insensitive' } }, select: { id: true } })) throw new Error(`واحد «${unit.title.trim()}» در همین سطح وجود دارد.`);
      const createdUnit = await tx.organizationUnit.create({ data: { tenantId, title: unit.title.trim(), code: resolvedCodes.get(unit.clientId), type: unit.type, status: unit.status, parentId, managerId: unit.managerId || null, description: unit.description?.trim() || null }, select: { id: true } });
      createdIds.set(unit.clientId, createdUnit.id);
      if (unit.positions.length) await tx.position.createMany({ data: unit.positions.map((position) => ({ organizationUnitId: createdUnit.id, title: position.title.trim(), code: position.code?.trim() || null, capacity: position.capacity, status: position.status })) });
      positionCount += unit.positions.length;
    }
    return { firstUnitId: createdIds.get(data.units[0].clientId)!, unitCount: data.units.length, positionCount };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  revalidatePath('/organization-units');
  return { ok: true as const, unitId: created.firstUnitId, unitCount: created.unitCount, positionCount: created.positionCount };
}

export async function createOrganizationUnitAction(formData: FormData) {
  const { tenantId } = await requireOrganizationUnitAccess('create');
  const code = value(formData, 'code') || null;
  if (code && await prisma.organizationUnit.findFirst({ where: { tenantId, code: { equals: code, mode: 'insensitive' } }, select: { id: true } })) throw new Error('کد واحد در این کسب‌وکار قبلاً استفاده شده است.');
  await prisma.organizationUnit.create({
    data: {
      tenantId,
      title: value(formData, 'title'),
      code,
      description: value(formData, 'description') || null,
    },
  });
  revalidatePath('/organization-units');
  redirect('/organization-units');
}

export async function updateOrganizationUnitAction(formData: FormData) {
  const { tenantId } = await requireOrganizationUnitAccess('update');
  const id = value(formData, 'id');
  const current = await prisma.organizationUnit.findFirst({ where: { id, tenantId }, select: { id: true, status: true } });
  if (!current) throw new Error('Organization unit not found for active tenant.');
  if (current.status === 'ARCHIVED') throw new Error('واحد آرشیوی فقط قابل مشاهده است و امکان ویرایش ندارد.');
  const code = value(formData, 'code') || null;
  if (code && await prisma.organizationUnit.findFirst({ where: { tenantId, id: { not: id }, code: { equals: code, mode: 'insensitive' } }, select: { id: true } })) throw new Error('کد واحد در این کسب‌وکار قبلاً استفاده شده است.');
  const parentId = value(formData, 'parentId') || null;
  const managerId = value(formData, 'managerId') || null;
  if (parentId === id) throw new Error('یک واحد نمی‌تواند بالادست خودش باشد.');
  if (parentId) {
    let cursor: string | null = parentId;
    const visited = new Set<string>();
    while (cursor) {
      if (cursor === id || visited.has(cursor)) throw new Error('انتخاب این واحد بالادست، چرخه سازمانی ایجاد می‌کند.');
      visited.add(cursor);
      const parent: { parentId: string | null } | null = await prisma.organizationUnit.findFirst({ where: { id: cursor, tenantId }, select: { parentId: true } });
      if (!parent) throw new Error('واحد بالادست در کسب‌وکار فعال پیدا نشد.');
      cursor = parent.parentId;
    }
  }
  if (managerId && !(await prisma.employee.findFirst({ where: { id: managerId, tenantId }, select: { id: true } }))) throw new Error('مدیر انتخاب‌شده در کسب‌وکار فعال پیدا نشد.');

  await prisma.organizationUnit.update({
    where: { id },
    data: {
      title: value(formData, 'title'),
      code,
      type: value(formData, 'type') || 'DEPARTMENT',
      parentId,
      managerId,
      description: value(formData, 'description') || null,
    },
  });
  revalidatePath('/organization-units');
  redirect('/organization-units');
}

export async function deleteOrganizationUnitAction(formData: FormData) {
  const { tenantId } = await requireOrganizationUnitAccess('delete');
  const id = value(formData, 'id');
  const current = await prisma.organizationUnit.findFirst({
    where: { id, tenantId },
    select: { id: true, status: true, _count: { select: { employees: true, children: true, positions: true } } },
  });
  if (!current) throw new Error('Organization unit not found for active tenant.');
  if (current.status === 'ARCHIVED') throw new Error('واحد آرشیوی فقط قابل مشاهده است و حذف دائمی آن مجاز نیست.');
  if (current._count.employees > 0 || current._count.children > 0 || current._count.positions > 0) {
    throw new Error('این واحد در سوابق سازمانی استفاده شده و قابل حذف دائمی نیست. می‌توانید آن را غیرفعال یا آرشیو کنید.');
  }
  await prisma.organizationUnit.deleteMany({ where: { id, tenantId } });
  revalidatePath('/organization-units');
  redirect('/organization-units');
}

export type OrganizationTemplateEditorPayload = {
  id?: string; name: string; description?: string; status: 'ACTIVE' | 'INACTIVE';
  units: Array<{ clientId: string; parentClientId?: string; name: string; type: string; description?: string; status: 'ACTIVE' | 'INACTIVE'; positions: Array<{ title: string; code?: string; capacity: number; status: 'ACTIVE' | 'INACTIVE' }> }>;
};

export async function saveOrganizationStructureTemplateAction(data: OrganizationTemplateEditorPayload) {
  const { tenantId } = await requireOrganizationUnitAccess(data.id ? 'update' : 'create');
  const name = data.name.trim();
  if (!name) throw new Error('نام قالب ساختار سازمانی را وارد کنید.');
  if (!data.units.length) throw new Error('حداقل یک واحد به قالب اضافه کنید.');
  if (await prisma.organizationStructureTemplate.findFirst({ where: { tenantId, id: data.id ? { not: data.id } : undefined, name: { equals: name, mode: 'insensitive' } }, select: { id: true } })) throw new Error('قالبی با این نام در کسب‌وکار وجود دارد.');
  const ids = new Set(data.units.map((unit) => unit.clientId));
  if (ids.size !== data.units.length) throw new Error('شناسه واحدهای قالب تکراری است.');
  const allowedTypes = new Set(['DEPARTMENT', 'DIVISION', 'TEAM', 'BRANCH']);
  for (const unit of data.units) {
    if (!unit.name.trim() || !allowedTypes.has(unit.type)) throw new Error('نام یا نوع یکی از واحدهای قالب معتبر نیست.');
    if (unit.parentClientId && (!ids.has(unit.parentClientId) || unit.parentClientId === unit.clientId)) throw new Error(`والد واحد «${unit.name}» معتبر نیست.`);
    const visited = new Set<string>(); let cursor: typeof unit | undefined = unit;
    while (cursor?.parentClientId) { if (visited.has(cursor.clientId)) throw new Error('ساختار داخلی قالب دارای چرخه است.'); visited.add(cursor.clientId); cursor = data.units.find((item) => item.clientId === cursor!.parentClientId); }
    const titles = new Set<string>(); const codes = new Set<string>();
    for (const position of unit.positions) {
      const title = position.title.trim().toLocaleLowerCase('fa'); const code = position.code?.trim().toLocaleLowerCase('en-US') || '';
      if (!title || !Number.isInteger(position.capacity) || position.capacity < 0) throw new Error(`اطلاعات سمت‌های واحد «${unit.name}» معتبر نیست.`);
      if (titles.has(title) || (code && codes.has(code))) throw new Error(`سمت تکراری در واحد «${unit.name}» وجود دارد.`);
      titles.add(title); if (code) codes.add(code);
    }
  }
  const template = await prisma.$transaction(async (tx) => {
    const current = data.id ? await tx.organizationStructureTemplate.findFirst({ where: { id: data.id, tenantId, status: { not: 'ARCHIVED' } }, select: { id: true, version: true } }) : null;
    if (data.id && !current) throw new Error('قالب قابل ویرایش در کسب‌وکار جاری پیدا نشد.');
    const saved = current
      ? await tx.organizationStructureTemplate.update({ where: { id: current.id }, data: { name, description: data.description?.trim() || null, status: data.status, version: { increment: 1 } } })
      : await tx.organizationStructureTemplate.create({ data: { tenantId, name, description: data.description?.trim() || null, status: data.status } });
    if (current) await tx.organizationStructureTemplateUnit.deleteMany({ where: { templateId: saved.id } });
    const createdIds = new Map<string, string>(); const pending = [...data.units];
    while (pending.length) {
      const index = pending.findIndex((unit) => !unit.parentClientId || createdIds.has(unit.parentClientId));
      if (index < 0) throw new Error('نگاشت ساختار داخلی قالب انجام نشد.');
      const unit = pending.splice(index, 1)[0];
      const savedUnit = await tx.organizationStructureTemplateUnit.create({ data: { templateId: saved.id, parentTemplateUnitId: unit.parentClientId ? createdIds.get(unit.parentClientId) : null, name: unit.name.trim(), type: unit.type, description: unit.description?.trim() || null, displayOrder: data.units.indexOf(unit), status: unit.status } });
      createdIds.set(unit.clientId, savedUnit.id);
      if (unit.positions.length) await tx.organizationStructureTemplatePosition.createMany({ data: unit.positions.map((position, displayOrder) => ({ templateUnitId: savedUnit.id, title: position.title.trim(), code: position.code?.trim() || null, capacity: position.capacity, status: position.status, displayOrder })) });
    }
    return saved;
  });
  revalidatePath('/business-settings/organization-templates'); revalidatePath('/organization-units');
  return { ok: true as const, id: template.id };
}

export async function setOrganizationStructureTemplateStatusAction(data: { id: string; status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' }) {
  const { tenantId } = await requireOrganizationUnitAccess('update');
  const updated = await prisma.organizationStructureTemplate.updateMany({ where: { id: data.id, tenantId, status: { not: 'ARCHIVED' } }, data: { status: data.status } });
  if (!updated.count) throw new Error('قالب قابل تغییر در کسب‌وکار جاری پیدا نشد.');
  revalidatePath('/business-settings/organization-templates'); revalidatePath('/organization-units');
  return { ok: true as const };
}

export async function setOrganizationUnitStatusAction(formData: FormData) {
  const { tenantId } = await requireOrganizationUnitAccess('update');
  const id = value(formData, 'id');
  const status = value(formData, 'status');
  if (!['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(status)) throw new Error('وضعیت واحد معتبر نیست.');
  const current = await prisma.organizationUnit.findFirst({ where: { id, tenantId }, select: { status: true } });
  if (!current) throw new Error('واحد سازمانی در کسب‌وکار فعال پیدا نشد.');
  if (current.status === 'ARCHIVED') throw new Error('وضعیت واحد آرشیوی قابل تغییر نیست.');
  const updated = await prisma.organizationUnit.updateMany({ where: { id, tenantId, status: { not: 'ARCHIVED' } }, data: { status: status as never } });
  if (!updated.count) throw new Error('واحد سازمانی در کسب‌وکار فعال پیدا نشد.');
  revalidatePath('/organization-units');
}

export async function createPositionAction(data: { organizationUnitId: string; title: string; code?: string; capacity: number }) {
  const { tenantId } = await requireOrganizationUnitAccess('update');
  const unit = await prisma.organizationUnit.findFirst({ where: { id: data.organizationUnitId, tenantId, status: { not: 'ARCHIVED' } }, select: { id: true } });
  if (!unit) throw new Error('واحد سازمانی قابل ویرایش پیدا نشد.');
  if (!data.title.trim()) throw new Error('عنوان سمت الزامی است.');
  if (!Number.isInteger(data.capacity) || data.capacity < 0) throw new Error('ظرفیت سمت باید عدد صحیح و نامنفی باشد.');
  const code = data.code?.trim() || null;
  if (code && await prisma.position.findFirst({ where: { organizationUnitId: unit.id, code: { equals: code, mode: 'insensitive' } }, select: { id: true } })) throw new Error('کد سمت در این واحد قبلاً استفاده شده است.');
  await prisma.position.create({ data: { organizationUnitId: unit.id, title: data.title.trim(), code, capacity: data.capacity } });
  revalidatePath('/organization-units');
  return { ok: true as const };
}

export async function setPositionStatusAction(formData: FormData) {
  const { tenantId } = await requireOrganizationUnitAccess('update');
  const id = value(formData, 'id');
  const status = value(formData, 'status');
  if (!['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(status)) throw new Error('وضعیت سمت معتبر نیست.');
  const position = await prisma.position.findFirst({ where: { id, organizationUnit: { tenantId } }, select: { status: true } });
  if (!position) throw new Error('سمت سازمانی در کسب‌وکار فعال پیدا نشد.');
  if (position.status === 'ARCHIVED') throw new Error('وضعیت سمت آرشیوی قابل تغییر نیست.');
  await prisma.position.update({ where: { id }, data: { status: status as never } });
  revalidatePath('/organization-units');
}

export async function createShiftTemplateFromDialogAction(data: {
  shiftType: string;
  shiftTitle: string;
  description?: string;
  shiftConfig: Record<string, unknown>;
  sourceTemplateId?: string;
  isActive?: boolean;
}) {
  const tenantId = await requireShiftTemplatePermission();
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') throw new Error('وضعیت قالب معتبر نیست.');
  const payload = serializeShiftTemplateFromWizard({
    shiftType: data.shiftType as CalendarShiftType,
    shiftTitle: data.shiftTitle,
    description: data.description,
    shiftConfig: data.shiftConfig,
    isActive: data.isActive,
  });

  await validateAndResolveShiftTemplate({ title: payload.title, type: payload.type, weekDays: payload.weekDays, config: payload.config, breaks: payload.breaks });

  const created = await prisma.shiftTemplate.create({
    data: {
      tenantId,
      title: payload.title,
      description: payload.description,
      type: payload.type,
      weekDays: jsonValue(payload.weekDays as any),
      config: jsonValue(data.sourceTemplateId ? { ...payload.config, sourceTemplateId: data.sourceTemplateId } : payload.config as any),
      breaks: jsonValue(payload.breaks as any),
      isActive: payload.isActive,
    },
  });

  revalidatePath('/shift-templates');
  return { ok: true as const, templateId: created.id };
}

export async function updateShiftTemplateFromDialogAction(data: {
  id: string;
  shiftType: string;
  shiftTitle: string;
  description?: string;
  shiftConfig: Record<string, unknown>;
}) {
  const tenantId = await requireShiftTemplatePermission();
  const current = await prisma.shiftTemplate.findFirst({ where: { id: data.id, tenantId } });
  if (!current) throw new Error('قالب شیفت پیدا نشد.');
  const payload = serializeShiftTemplateFromWizard({ shiftType: data.shiftType as CalendarShiftType, shiftTitle: data.shiftTitle, description: data.description, shiftConfig: data.shiftConfig });
  if (payload.type !== current.type) throw new Error('نوع قالب هنگام ویرایش قابل تغییر نیست.');
  await validateAndResolveShiftTemplate({ title: payload.title, type: payload.type, weekDays: payload.weekDays, config: payload.config, breaks: payload.breaks, excludeId: data.id });
  await prisma.shiftTemplate.update({ where: { id: data.id }, data: { title: payload.title, description: payload.description, weekDays: jsonValue(payload.weekDays), config: jsonValue(payload.config), breaks: jsonValue(payload.breaks) } });
  revalidatePath('/shift-templates');
  return { ok: true as const };
}

export async function cloneShiftTemplateAction(data: { id: string; title: string; description?: string; shiftConfig: Record<string, unknown>; shiftType: string }) {
  const tenantId = await requireShiftTemplatePermission();
  const source = await prisma.shiftTemplate.findFirst({ where: { id: data.id, tenantId } });
  if (!source) throw new Error('قالب مبدأ پیدا نشد.');
  const payload = serializeShiftTemplateFromWizard({ shiftType: data.shiftType as CalendarShiftType, shiftTitle: data.title, description: data.description, shiftConfig: data.shiftConfig });
  await validateAndResolveShiftTemplate({ title: payload.title, type: payload.type, weekDays: payload.weekDays, config: payload.config, breaks: payload.breaks });
  await prisma.shiftTemplate.create({ data: { tenantId, title: payload.title, description: payload.description, type: payload.type, weekDays: jsonValue(payload.weekDays), config: jsonValue({ ...payload.config, sourceTemplateId: source.id }), breaks: jsonValue(payload.breaks), isActive: true } });
  revalidatePath('/shift-templates');
  return { ok: true as const };
}

export async function deleteShiftTemplateAction(formData: FormData) {
  const tenantId = await requireShiftTemplatePermission();
  const id = value(formData, 'id');
  const calendars = await prisma.calendar.findMany({ where: { tenantId }, select: { shiftConfig: true } });
  let used = false;
  let legacyUncertain = false;
  calendars.forEach((calendar) => {
    const root = parseCalendarShiftConfig(calendar.shiftConfig);
    const shifts = Array.isArray(root.shifts) ? root.shifts : root.shiftType ? [root] : [];
    shifts.forEach((shift) => {
      const record = shift && typeof shift === 'object' ? shift as Record<string, unknown> : {};
      const config = record.config && typeof record.config === 'object' && !Array.isArray(record.config) ? record.config as Record<string, unknown> : record;
      const sourceId = record.sourceShiftTemplateId ?? config.sourceShiftTemplateId ?? config.templateId;
      if (sourceId === id) used = true;
      if (!sourceId) legacyUncertain = true;
    });
  });
  if (used) throw new Error('این قالب در بخش‌های عملیاتی استفاده شده است و حذف مستقیم آن ممکن نیست. ابتدا قالب را غیرفعال کنید.');
  if (legacyUncertain) throw new Error('داده قدیمی بدون منبع قالب شناسایی شد و حذف ایمن قابل اثبات نیست. ابتدا قالب را غیرفعال کنید.');
  await prisma.shiftTemplate.deleteMany({ where: { id, tenantId } });
  revalidatePath('/shift-templates');
}

export async function toggleShiftTemplateActiveAction(formData: FormData) {
  const tenantId = await requireShiftTemplatePermission();
  const id = value(formData, 'id');
  const isActive = boolValue(formData, 'isActive');
  const current = await prisma.shiftTemplate.findFirst({ where: { id, tenantId }, select: { id: true, title: true, type: true, weekDays: true, config: true, breaks: true } });
  if (!current) throw new Error('Shift template not found for active tenant.');

  if (isActive) {
    const validation = validateShiftTemplateInput({
      title: current.title,
      type: templateTypeToCalendarShiftType(current.type),
      weekDays: current.weekDays,
      config: current.config,
      breaks: current.breaks,
    });
    if (!validation.valid) throw new Error('تنظیمات این قالب معتبر نیست و پیش از فعال‌سازی باید اصلاح شود.');
  }

  await prisma.shiftTemplate.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath('/shift-templates');
}

export async function createShiftTemplateAction(formData: FormData) {
  const tenantId = await requireShiftTemplatePermission();
  const title = value(formData, 'title');
  const rawType = value(formData, 'type');
  const weekDays = value(formData, 'weekDays').split(',').map((item) => item.trim()).filter(Boolean);
  const startTime = value(formData, 'startTime');
  const endTime = value(formData, 'endTime');
  const requiredMinutes = Number(value(formData, 'requiredMinutes') || '0');
  const calendarType = templateTypeToCalendarShiftType(rawType as never);
  const validation = validateShiftTemplateInput({
    title,
    type: calendarType,
    weekDays,
    config: calendarType === 'fixed'
      ? { fixedShift: { startTime, endTime } }
      : { floatingShiftStartOfDay: { entryWindowStart: startTime, entryWindowEnd: endTime, requiredMinutes } },
    breaks: [],
  });
  if (!validation.valid) throw new Error(validation.errors.join(' '));
  await prisma.shiftTemplate.create({
    data: {
      tenantId,
      title,
      description: value(formData, 'description') || null,
      type: rawType as never,
      weekDays: jsonValue(weekDays),
      config: jsonValue({
        startTime,
        endTime,
        requiredMinutes,
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
    select: {
      id: true,
      _count: { select: { policies: true } },
      policies: {
        select: {
          _count: {
            select: {
              workGroups: true,
            },
          },
        },
      },
    },
  });
  if (!current) throw new Error('Calendar not found for active tenant.');
  const workGroupCount = current.policies.reduce((total, policy) => total + policy._count.workGroups, 0);
  if (current._count.policies > 0 || workGroupCount > 0) {
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
    ...(typeof data.shiftConfig.sourceShiftTemplateId === 'string' ? { sourceShiftTemplateId: data.shiftConfig.sourceShiftTemplateId } : {}),
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

    if (
      data.holidayType !== 'official' &&
      data.holidayType !== 'organizational' &&
      data.holidayType !== 'friday'
    ) {
      throw new Error('نوع تعطیلی را مشخص کنید.');
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
      const resolvedHolidayType = data.isHoliday ? data.holidayType : undefined;

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
  const title = data.title.trim();
  const yearLabel = data.yearLabel.trim();

  if (!title) {
    throw new Error('عنوان تقویم را وارد کنید.');
  }

  if (!yearLabel) {
    throw new Error('سال تقویم را انتخاب کنید.');
  }

  const duplicate = await prisma.calendar.findFirst({
    where: {
      tenantId,
      title,
      yearLabel,
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error('تقویمی با این عنوان یا سال قبلاً ثبت شده است.');
  }

  const source = await ensureGlobalDefaultCalendar(yearLabel);
  const includeOfficialEvents = data.includeOfficialEvents === true;
  const templateWeekends = Array.isArray(source.weekends) ? (source.weekends as string[]) : ['جمعه'];
  const templateHolidays = Array.isArray(source.singleHolidays)
    ? (source.singleHolidays as Array<{ id: string; title: string; date: string }>)
    : [];
  const weekends = includeOfficialEvents ? templateWeekends : [];
  const singleHolidays = includeOfficialEvents
    ? templateHolidays.length > 0
      ? templateHolidays
      : getOfficialHolidaysForYear(yearLabel)
    : [];
  const holidayCount = weekends.length + singleHolidays.length;

  const draft = await prisma.calendar.create({
    data: {
      tenantId,
      title,
      description: data.description?.trim() || null,
      yearLabel,
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
  const tenantId = await requirePolicyManagement();
  const calendarId = value(formData, 'calendarId') || null;
  if (calendarId) {
    const calendar = await prisma.calendar.findFirst({ where: { id: calendarId, tenantId, status: 'active' }, select: { id: true } });
    if (!calendar) throw new Error('Calendar not found for active tenant.');
  }
  const blueprintKey = value(formData, 'blueprintKey') || 'custom';
  const blueprint = getPolicyBlueprint(blueprintKey);
  if (!blueprint || !blueprint.defaults || !isAvailablePolicyBlueprintKey(blueprintKey)) throw new Error('Blueprint سیاست کاری معتبر نیست.');
  const locationRule = value(formData, 'locationRule') || blueprint.defaults.locationRule;
  const incompleteAttendanceRule = value(formData, 'incompleteAttendanceRule') || blueprint.defaults.incompleteAttendanceRule;
  const overtimeRule = value(formData, 'overtimeRule') || blueprint.defaults.overtimeRule;
  const requestRule = value(formData, 'requestRule') || blueprint.defaults.requestRule;
  const entryGraceMinutes = Number(value(formData, 'entryGraceMinutes') || blueprint.defaults.entryGraceMinutes);
  const sectionValues = {
    blueprintKey,
    blueprintTitle: blueprint.title,
    entryRequired: value(formData, 'entryRequired') === 'true',
    exitRequired: value(formData, 'exitRequired') === 'true',
    locationRule,
    requireGeofence: locationRule === 'workplace_only',
    entryGraceMinutes,
    incompleteAttendanceRule,
    incompleteAttendance: incompleteAttendanceRule === 'correction_required',
    overtimeRule,
    overtimeFromAttendance: overtimeRule === 'automatic',
    requestRule,
    requestEnabled: requestRule !== 'none',
    manualAttendance: boolValue(formData, 'manualAttendance'),
    nightWorkStart: value(formData, 'nightWorkStart') || '22:00',
    familyKey: 'work',
    variant: 'default',
  };
  const validation = validatePolicyInput({ title: value(formData, 'title'), description: value(formData, 'description'), calendarId, blueprintKey, sectionValues });
  if (!validation.valid) throw new Error(validation.errors[0]);
  await ensureUniquePolicyTitle(tenantId, validation.values.title);
  const created = await prisma.workPolicy.create({
    data: {
      tenantId,
      title: validation.values.title,
      description: validation.values.description,
      calendarId,
      employeeCount: 0,
      isActive: true,
      sectionValues: jsonValue(sectionValues),
    },
  });
  revalidatePath('/policies');
  revalidatePath('/quick-setup');
  redirect(`/policies/work?policyId=${created.id}&created=1`);
}

export async function updatePolicyBasicInfoAction(formData: FormData) {
  const tenantId = await requirePolicyManagement();
  const policyId = value(formData, 'policyId');
  const title = value(formData, 'title');
  const description = value(formData, 'description') || null;
  const calendarId = value(formData, 'calendarId') || null;

  if (!policyId) throw new Error('شناسه سیاست الزامی است.');
  if (!title) throw new Error('عنوان سیاست الزامی است.');

  const existing = await prisma.workPolicy.findFirst({ where: { id: policyId, tenantId } });
  if (!existing) throw new Error('سیاست برای tenant فعال یافت نشد.');

  if (!calendarId) throw new Error('تقویم کاری را انتخاب کنید.');
  const calendar = await prisma.calendar.findFirst({ where: { id: calendarId, tenantId, OR: [{ status: 'active' }, { id: existing.calendarId ?? '' }] }, select: { id: true } });
  if (!calendar) throw new Error('تقویم کاری فعال برای tenant جاری پیدا نشد.');

  const sectionValues = getPolicySectionValues(existing);
  const validation = validatePolicyInput({ title, description, calendarId, sectionValues });
  if (!validation.valid) throw new Error(validation.errors[0]);
  await ensureUniquePolicyTitle(tenantId, validation.values.title, existing.id);
  const mergedSectionValues = jsonValue({
    ...sectionValues,
    title,
    description,
    calendarId,
  });

  await prisma.workPolicy.update({
    where: { id: policyId },
    data: {
      title,
      description,
      calendarId,
      sectionValues: mergedSectionValues,
    },
  });

  revalidatePath('/policies');
  revalidatePath('/policies/work');
  redirect(`/policies/work?policyId=${policyId}`);
}

export async function savePolicyWorkspaceAction(formData: FormData) {
  const tenantId = await requirePolicyManagement();
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
        select: { id: true, title: true, description: true, calendarId: true, sectionValues: true },
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
  const preserveLeaveWorkMeta =
    familyKey === 'leave' && existingPolicy && previousSectionValues.familyKey === 'work';
  const title = preserveWorkMeta || preserveLeaveWorkMeta || preserveManualWorkMeta || preserveNightWorkMeta || preserveRemoteWorkMeta
    ? existingPolicy.title
    : value(formData, 'title') || family.title;
  const description =
    preserveWorkMeta || preserveLeaveWorkMeta || preserveManualWorkMeta || preserveNightWorkMeta || preserveRemoteWorkMeta
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
            familyKey: preserveLeaveWorkMeta ? 'work' : 'leave',
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
              nightStart: boolValue(formData, 'nightEnabled') ? value(formData, 'nightStart') || null : null,
              nightEnd: boolValue(formData, 'nightEnabled') ? value(formData, 'nightEnd') || null : null,
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

  const sectionRecord = sectionValues as unknown as Record<string, unknown>;
  const validation = validatePolicyInput({
    title,
    description,
    calendarId: effectiveCalendarId,
    familyKey,
    variant,
    sectionValues: sectionRecord,
  });
  if (!validation.valid) throw new Error(validation.errors[0]);
  if (!existingPolicy) await ensureUniquePolicyTitle(tenantId, validation.values.title);
  else if (validation.values.title !== existingPolicy.title) await ensureUniquePolicyTitle(tenantId, validation.values.title, existingPolicy.id);

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
  const tenantId = await requirePolicyManagement();
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

export async function togglePolicyActiveAction(formData: FormData) {
  const tenantId = await requirePolicyManagement();
  const id = value(formData, 'id');
  const isActive = value(formData, 'isActive') === 'true';
  const current = await prisma.workPolicy.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!current) throw new Error('سیاست کاری برای tenant فعال پیدا نشد.');
  await prisma.workPolicy.update({ where: { id }, data: { isActive } });
  revalidatePath('/policies');
  revalidatePath('/work-groups');
}

export async function clonePolicyAction(data: { id: string; title: string }) {
  const tenantId = await requirePolicyManagement();
  const source = await prisma.workPolicy.findFirst({ where: { id: data.id, tenantId } });
  if (!source) throw new Error('سیاست کاری برای tenant فعال پیدا نشد.');
  const sectionValues = getPolicySectionValues(source);
  const validation = validatePolicyInput({
    title: data.title,
    description: source.description,
    calendarId: source.calendarId,
    familyKey: getPolicyFamilyKey(sectionValues),
    variant: typeof sectionValues.variant === 'string' ? sectionValues.variant : null,
    sectionValues,
  });
  if (!validation.valid) throw new Error(validation.errors[0]);
  await ensureUniquePolicyTitle(tenantId, validation.values.title);
  const clone = await prisma.workPolicy.create({
    data: {
      tenantId,
      title: validation.values.title,
      description: validation.values.description,
      calendarId: source.calendarId,
      employeeCount: 0,
      isDefault: false,
      isActive: true,
      sectionValues: jsonValue({ ...sectionValues, clonedFromPolicyId: source.id }),
    },
  });
  revalidatePath('/policies');
  return { id: clone.id };
}

export async function createPolicyFromQuickSetupAction(data: {
  calendarId: string;
  policyTemplateId: string;
  title: string;
  description?: string;
  templateTitle?: string;
  year?: string;
}) {
  const tenantId = await requirePolicyManagement();
  const calendar = await prisma.calendar.findFirst({ where: { id: data.calendarId, tenantId }, select: { id: true } });
  if (!calendar) throw new Error('Calendar not found for active tenant.');
  const blueprint = getPolicyBlueprint(data.policyTemplateId);
  if (!blueprint?.defaults || !isAvailablePolicyBlueprintKey(data.policyTemplateId)) throw new Error('Blueprint سیاست کاری معتبر نیست.');
  const sectionValues = {
    familyKey: 'work',
    variant: 'default',
    blueprintKey: blueprint.key,
    blueprintTitle: blueprint.title,
    ...blueprint.defaults,
    requireGeofence: blueprint.defaults.locationRule === 'workplace_only',
    incompleteAttendance: blueprint.defaults.incompleteAttendanceRule === 'correction_required',
    requestEnabled: blueprint.defaults.requestRule !== 'none',
    manualAttendance: false,
    overtimeFromAttendance: blueprint.defaults.overtimeRule === 'automatic',
    nightWorkStart: '22:00',
    templateType: 'quick-setup',
  };
  const validation = validatePolicyInput({ title: data.title, description: data.description, calendarId: data.calendarId, blueprintKey: blueprint.key, sectionValues });
  if (!validation.valid) throw new Error(validation.errors[0]);
  await ensureUniquePolicyTitle(tenantId, validation.values.title);
  const policy = await prisma.workPolicy.create({
    data: {
      tenantId,
      title: validation.values.title,
      description: validation.values.description,
      calendarId: data.calendarId,
      isDefault: true,
      isActive: true,
      sectionValues: jsonValue({
        ...sectionValues,
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

type EmployeeCreationIdentityCheck = {
  valid: boolean;
  error?: string;
  duplicateEmployee?: { firstName: string; lastName: string };
  existingUser?: { firstName: string; lastName: string; email: string | null; mobile: string | null };
  existingMembership?: boolean;
};

function parseChildrenCount(formData: FormData) {
  const raw = value(formData, 'childrenCount');
  if (!raw) return 0;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) throw new Error('تعداد فرزندان باید عدد صحیح و غیرمنفی باشد.');
  return parsed;
}

function validateImageDataUrl(raw: string, label: string) {
  if (!raw) return;
  const match = raw.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error(`${label} باید از نوع تصویر معتبر باشد.`);
  if (match[2].length > 7_000_000) throw new Error(`${label} نباید بیشتر از ۵ مگابایت باشد.`);
}

async function getEmployeeCreationPattern(tenantId: string) {
  const storageStates = await listClientStorageStates(tenantId);
  const raw = storageStates.find((item) => item.storageKey === getNamingPatternsStorageKey(tenantId))?.value ?? null;
  return getNamingPatternsFromStorage(raw).find((item) => item.usageType === 'employee_number') ?? null;
}

async function canEnterEmployeePersonnelCode(tenantId: string) {
  const session = await getSessionContext();
  if (!session?.userId) return false;
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId } },
    include: { roles: { include: { role: true } } },
  });
  const roleKeys = new Set([
    membership?.role?.toLowerCase(),
    ...(membership?.roles.map((item) => item.role.key.toLowerCase()) ?? []),
  ].filter(Boolean));
  return ['owner', 'admin', 'hr_manager'].some((role) => roleKeys.has(role));
}

async function resolveEmployeePersonnelCode(tenantId: string, requestedCode: string) {
  const pattern = await getEmployeeCreationPattern(tenantId);
  if (pattern) {
    const generated = generateNamingPattern({ pattern, mode: 'commit', context: { date: new Date() } });
    await upsertClientStorageState(getNamingPatternsStorageKey(tenantId), JSON.stringify([generated.pattern]), tenantId);
    return generated.output;
  }
  if (requestedCode && !(await canEnterEmployeePersonnelCode(tenantId))) {
    throw new Error('ورود کد پرسنلی برای نقش فعلی مجاز نیست.');
  }
  return requestedCode || null;
}

export async function getEmployeePersonnelCodePolicyAction() {
  const tenantId = await getTenantId();
  const pattern = await getEmployeeCreationPattern(tenantId);
  return { hasPattern: Boolean(pattern), canEnter: await canEnterEmployeePersonnelCode(tenantId) };
}

async function findEmployeeCreationIdentity(tenantId: string, contact: string) {
  const trimmed = contact.trim();
  const isEmail = trimmed.includes('@');
  const normalizedEmail = isEmail ? normalizeEmail(trimmed) : null;
  const normalizedMobile = isEmail ? null : sanitizeIranMobileInput(trimmed);
  const employee = await prisma.employee.findFirst({
    where: {
      tenantId,
      OR: normalizedEmail
        ? [{ email: { equals: normalizedEmail, mode: 'insensitive' as const } }]
        : [{ mobile1: { contains: normalizedMobile } }, { mobile2: { contains: normalizedMobile } }],
    },
    select: { firstName: true, lastName: true },
  });
  const user = await prisma.appUser.findFirst({
    where: normalizedEmail
      ? { email: { equals: normalizedEmail, mode: 'insensitive' as const } }
      : { mobile: { contains: normalizedMobile } },
    select: { id: true, firstName: true, lastName: true, email: true, mobile: true },
  });
  const membership = user
    ? await prisma.userTenantMembership.findUnique({ where: { userId_tenantId: { userId: user.id, tenantId } }, select: { id: true } })
    : null;
  return { employee, user, membership };
}

export async function checkEmployeeCreationIdentityAction(data: { contact: string }): Promise<EmployeeCreationIdentityCheck> {
  const contact = data.contact?.trim() ?? '';
  const tenantId = await getTenantId();
  if (!contact) return { valid: false, error: 'موبایل یا ایمیل کارمند را وارد کنید.' };
  if (contact.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return { valid: false, error: 'ایمیل واردشده معتبر نیست.' };
  } else if (!isValidIranMobile(contact)) {
    return { valid: false, error: 'موبایل واردشده معتبر نیست.' };
  }
  const result = await findEmployeeCreationIdentity(tenantId, contact);
  return {
    valid: true,
    duplicateEmployee: result.employee ?? undefined,
    existingUser: result.user
      ? { firstName: result.user.firstName, lastName: result.user.lastName, email: result.user.email, mobile: result.user.mobile }
      : undefined,
    existingMembership: Boolean(result.membership),
  };
}

export async function createEmployeeAction(formData: FormData) {
  const tenantId = await getTenantId();
  const firstName = value(formData, 'firstName');
  const lastName = value(formData, 'lastName');
  const nationalId = digitsOnlyValue(formData, 'nationalId');
  const mobile1 = value(formData, 'mobile1');
  const mobile2 = value(formData, 'mobile2');
  const email = value(formData, 'email');
  if (!firstName || !lastName) throw new Error('نام و نام خانوادگی کارمند الزامی است.');
  if (!nationalId || !isNationalIdValid(nationalId)) throw new Error('کد ملی واردشده معتبر نیست.');
  if (!mobile1 && !mobile2 && !email) throw new Error('حداقل یک موبایل یا ایمیل معتبر وارد کنید.');
  if (mobile1 && !isValidIranMobile(mobile1)) throw new Error('موبایل اصلی واردشده معتبر نیست.');
  if (mobile2 && !isValidIranMobile(mobile2)) throw new Error('موبایل اضافی واردشده معتبر نیست.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('ایمیل واردشده معتبر نیست.');
  validateImageDataUrl(value(formData, 'avatarUrl'), 'عکس پروفایل');
  validateImageDataUrl(value(formData, 'identityPhotoUrl'), 'عکس احراز هویت');

  const normalizedMobile1 = mobile1 ? sanitizeIranMobileInput(mobile1) : null;
  const normalizedMobile2 = mobile2 ? sanitizeIranMobileInput(mobile2) : null;
  const normalizedEmail = email ? normalizeEmail(email) : null;
  const primaryContact = normalizedEmail ?? normalizedMobile1 ?? normalizedMobile2;
  const existingIdentity = primaryContact ? await findEmployeeCreationIdentity(tenantId, primaryContact) : null;
  const duplicate = await prisma.employee.findFirst({
    where: {
      tenantId,
      OR: [
        { nationalId },
        ...(normalizedEmail ? [{ email: { equals: normalizedEmail, mode: 'insensitive' as const } }] : []),
        ...(normalizedMobile1 ? [{ mobile1: { contains: normalizedMobile1 } }, { mobile2: { contains: normalizedMobile1 } }] : []),
        ...(normalizedMobile2 ? [{ mobile1: { contains: normalizedMobile2 } }, { mobile2: { contains: normalizedMobile2 } }] : []),
      ],
    },
    select: { id: true, firstName: true, lastName: true },
  });
  if (duplicate) throw new Error('این کارمند یا یکی از اطلاعات تماس او قبلاً در این کسب‌وکار ثبت شده است.');

  const unitIds = formData.getAll('organizationUnitIds').map(String);
  const validUnits = unitIds.length
    ? await prisma.organizationUnit.findMany({ where: { id: { in: unitIds }, tenantId }, select: { id: true } })
    : [];
  if (validUnits.length !== unitIds.length) throw new Error('Organization unit not found for active tenant.');
  const personnelCode = await resolveEmployeePersonnelCode(tenantId, value(formData, 'personnelCode'));
  if (personnelCode) {
    const duplicatePersonnelCode = await prisma.employee.findFirst({
      where: { tenantId, personnelCode },
      select: { id: true },
    });
    if (duplicatePersonnelCode) throw new Error('این کد پرسنلی قبلاً در این کسب‌وکار استفاده شده است.');
  }
  const employee = await prisma.$transaction(async (tx) => {
    let userTenantMembershipId = existingIdentity?.membership?.id ?? null;
    if (!userTenantMembershipId && existingIdentity?.user) {
      const membership = await tx.userTenantMembership.create({
        data: { userId: existingIdentity.user.id, tenantId, role: 'member' },
        select: { id: true },
      });
      userTenantMembershipId = membership.id;
    }

    return tx.employee.create({
      data: {
        tenantId,
        userTenantMembershipId,
        firstName,
        lastName,
        nationalId,
        mobile1: normalizedMobile1,
        mobile2: normalizedMobile2,
        email: normalizedEmail,
        personnelCode,
        avatarUrl: value(formData, 'avatarUrl') || null,
        identityPhotoUrl: value(formData, 'identityPhotoUrl') || null,
        maritalStatus: (value(formData, 'maritalStatus') || 'single') as never,
        childrenCount: parseChildrenCount(formData),
        isActive: boolValue(formData, 'isActive'),
        canEditIdentityPhoto: boolValue(formData, 'canEditIdentityPhoto'),
        quickSetupStatus: 'pending_completion',
        organizationUnits: {
          create: validUnits.map(({ id: organizationUnitId }) => ({ organizationUnitId })),
        },
      },
    });
  });
  revalidatePath('/employees');
  revalidatePath('/quick-setup');
  return { id: employee.id };
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
  const employee = await prisma.employee.findFirst({ where: { id, tenantId }, select: { id: true, isActive: true } });
  if (!employee) throw new Error('کارمند در کسب‌وکار فعال پیدا نشد.');
  await prisma.employee.update({
    where: { id: employee.id },
    data: { isActive: false, quickSetupStatus: 'excluded', quickSetupLastActionAt: new Date() },
  });
  await createEmployeeAuditLog({
    tenantId,
    employeeId: employee.id,
    action: 'quick_setup_excluded',
    fieldKey: 'isActive',
    oldValue: String(employee.isActive),
    newValue: 'false',
    source: 'quick_setup',
  });
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
  await requireEmployeeAccess('update');
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const current = await prisma.employee.findFirst({ where: { id, tenantId } });
  if (!current) throw new Error('کارمند در کسب‌وکار فعال پیدا نشد.');
  const expectedUpdatedAt = value(formData, 'expectedUpdatedAt');
  if (expectedUpdatedAt && current.updatedAt.toISOString() !== expectedUpdatedAt) throw new Error('اطلاعات کارمند هم‌زمان توسط کاربر دیگری تغییر کرده است.');
  const hasSensitiveInput = ['nationalId', 'email', 'mobile1', 'mobile2'].some((key) => formData.has(key));
  if (hasSensitiveInput) await requireEmployeeAccess('sensitiveUpdate');
  const hasIdentityPhotoInput = formData.has('identityPhotoUrl');
  if (hasIdentityPhotoInput) await requireEmployeeAccess('identityPhotoUpdate');
  const nationalId = formData.has('nationalId') ? value(formData, 'nationalId') : (current.nationalId ?? '');
  const email = formData.has('email') ? value(formData, 'email') : (current.email ?? '');
  const mobile1 = formData.has('mobile1') ? value(formData, 'mobile1') : (current.mobile1 ?? '');
  const mobile2 = formData.has('mobile2') ? value(formData, 'mobile2') : (current.mobile2 ?? '');
  const personnelCode = value(formData, 'personnelCode');
  const childrenCount = parseChildrenCount(formData);
  if (nationalId && !isNationalIdValid(nationalId)) throw new Error('کد ملی معتبر نیست.');
  if (email && normalizeEmail(email) !== email.toLowerCase()) throw new Error('فرمت ایمیل معتبر نیست.');
  if (mobile1 && !isValidIranMobile(sanitizeIranMobileInput(mobile1))) throw new Error('موبایل اصلی معتبر نیست.');
  if (mobile2 && !isValidIranMobile(sanitizeIranMobileInput(mobile2))) throw new Error('موبایل دوم معتبر نیست.');
  validateImageDataUrl(value(formData, 'avatarUrl'), 'تصویر پروفایل');
  validateImageDataUrl(value(formData, 'identityPhotoUrl'), 'تصویر احراز هویت');
  const duplicate = await prisma.employee.findFirst({
    where: {
      tenantId,
      id: { not: id },
      OR: [
        ...(nationalId ? [{ nationalId }] : []),
        ...(personnelCode ? [{ personnelCode }] : []),
        ...(email ? [{ email: { equals: normalizeEmail(email), mode: 'insensitive' as const } }] : []),
        ...(mobile1 ? [{ mobile1 }, { mobile2: mobile1 }] : []),
        ...(mobile2 ? [{ mobile1: mobile2 }, { mobile2 }] : []),
      ],
    },
    select: { id: true },
  });
  if (duplicate) throw new Error('کد ملی، کد پرسنلی یا اطلاعات تماس با کارمند دیگری تکراری است.');
  await prisma.employee.update({
    where: { id: current.id },
    data: {
      firstName: value(formData, 'firstName'),
      lastName: value(formData, 'lastName'),
      nationalId: nationalId || null,
      mobile1: mobile1 ? sanitizeIranMobileInput(mobile1) : null,
      mobile2: mobile2 ? sanitizeIranMobileInput(mobile2) : null,
      email: email ? normalizeEmail(email) : null,
      personnelCode: personnelCode || null,
      avatarUrl: value(formData, 'avatarUrl') || null,
      identityPhotoUrl: hasIdentityPhotoInput ? (value(formData, 'identityPhotoUrl') || null) : current.identityPhotoUrl,
      maritalStatus: (value(formData, 'maritalStatus') || 'single') as never,
      childrenCount,
      canEditIdentityPhoto: boolValue(formData, 'canEditIdentityPhoto'),
    },
  });
  await Promise.all([
    ['nationalId', current.nationalId, nationalId || null],
    ['mobile1', current.mobile1, mobile1 ? sanitizeIranMobileInput(mobile1) : null],
    ['mobile2', current.mobile2, mobile2 ? sanitizeIranMobileInput(mobile2) : null],
    ['email', current.email, email ? normalizeEmail(email) : null],
    ['identityPhotoUrl', current.identityPhotoUrl, hasIdentityPhotoInput ? (value(formData, 'identityPhotoUrl') || null) : current.identityPhotoUrl],
  ].filter(([, before, after]) => before !== after).map(([fieldKey, oldValue, newValue]) =>
    createEmployeeAuditLog({ tenantId, employeeId: id, action: 'employee_updated', fieldKey, oldValue, newValue }),
  ));
  revalidatePath('/employees');
  revalidatePath(`/employees/${id}`);
  redirect(`/employees/${id}`);
}

export async function deleteEmployeeAction(formData: FormData) {
  void formData;
  throw new Error('حذف کارمند از مسیر عملیاتی سیستم مجاز نیست؛ ابتدا وضعیت همکاری را غیرفعال یا خاتمه‌یافته کنید.');
}

export async function toggleEmployeeActiveAction(formData: FormData) {
  await requireEmployeeAccess('disable');
  const tenantId = await getTenantId();
  const id = value(formData, 'id');
  const isActive = value(formData, 'isActive') === 'true';
  const employee = await prisma.employee.findFirst({ where: { id, tenantId }, select: { id: true, isActive: true } });
  if (!employee) throw new Error('کارمند در کسب‌وکار فعال پیدا نشد.');
  await prisma.employee.update({ where: { id: employee.id }, data: { isActive } });
  await createEmployeeAuditLog({ tenantId, employeeId: id, action: isActive ? 'employee_reactivated' : 'employee_disabled', fieldKey: 'isActive', oldValue: String(employee.isActive), newValue: String(isActive) });
  revalidatePath('/employees');
}

export async function saveEmployeeBankAccountsAction(formData: FormData) {
  await requireEmployeeAccess('bankUpdate');
  const tenantId = await getTenantId();
  const employeeId = value(formData, 'employeeId');
  const accounts = JSON.parse(value(formData, 'accounts')) as any;
  const employee = await prisma.employee.findFirst({ where: { id: employeeId, tenantId }, select: { id: true, bankAccounts: true } });
  if (!employee) throw new Error('کارمند در کسب‌وکار فعال پیدا نشد.');
  await prisma.employee.update({
    where: { id: employee.id },
    data: { bankAccounts: accounts },
  });
  await createEmployeeAuditLog({ tenantId, employeeId, action: 'bank_accounts_updated', fieldKey: 'bankAccounts', oldValue: JSON.stringify(employee.bankAccounts), newValue: JSON.stringify(accounts) });
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
    const policy = await prisma.workPolicy.findFirst({ where: { id: policyId, tenantId }, select: { id: true, isActive: true } });
    if (!policy) throw new Error('Policy not found for active tenant.');
    if (!policy.isActive) {
      const current = workGroupId ? await prisma.workGroup.findFirst({ where: { id: workGroupId, tenantId }, select: { policyId: true } }) : null;
      if (current?.policyId !== policyId) throw new Error('سیاست غیرفعال فقط برای حفظ اتصال فعلی قابل مشاهده است و برای تخصیص جدید قابل انتخاب نیست.');
    }
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
    const policy = await prisma.workPolicy.findFirst({ where: { id: policyId, tenantId }, select: { id: true, isActive: true } });
    if (!policy) throw new Error('Policy not found for active tenant.');
    if (!policy.isActive) throw new Error('سیاست غیرفعال برای تخصیص جدید قابل انتخاب نیست.');
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
  const policies = await prisma.workPolicy.findMany({ where: { id: { in: data.policyIds }, tenantId, isActive: true }, select: { id: true } });
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
