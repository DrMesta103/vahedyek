'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { getSetupReminderAccess, getTenantSetupHealth, SETUP_HEALTH_ITEMS, type SetupHealthItemKey } from './setup-health';

function assertReminderKey(reminderKey: string): asserts reminderKey is SetupHealthItemKey {
  if (!SETUP_HEALTH_ITEMS.some((item) => item.key === reminderKey)) {
    throw new Error('کلید یادآور معتبر نیست.');
  }
}

async function requireSetupReminderAccess() {
  const access = await getSetupReminderAccess();
  if (!access.allowed || !access.tenantId || !access.userId) {
    throw new Error('unauthorized');
  }
  return access;
}

function isMissingTenantSetupReminderStateTableError(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'P2021',
  );
}

export async function getTenantSetupHealthAction() {
  const access = await getSetupReminderAccess();
  if (!access.allowed || !access.tenantId) return null;
  return getTenantSetupHealth(access.tenantId, access.userId);
}

export async function snoozeTenantSetupReminderAction(reminderKey: string, hours = 24) {
  assertReminderKey(reminderKey);
  const access = await requireSetupReminderAccess();
  const now = new Date();
  const dismissedUntil = new Date(now.getTime() + Math.max(1, hours) * 60 * 60 * 1000);

  try {
    await prisma.tenantSetupReminderState.upsert({
      where: {
        tenantId_userId_reminderKey: {
          tenantId: access.tenantId,
          userId: access.userId,
          reminderKey,
        },
      },
      update: {
        dismissedUntil,
        dismissedCount: { increment: 1 },
        lastActionAt: now,
      },
      create: {
        tenantId: access.tenantId,
        userId: access.userId,
        reminderKey,
        dismissedUntil,
        dismissedCount: 1,
        lastActionAt: now,
      },
    });
  } catch (error) {
    if (!isMissingTenantSetupReminderStateTableError(error)) throw error;
  }

  revalidatePath('/');
  revalidatePath('/business-settings');
}

export async function markReminderShownAction(reminderKey: string) {
  assertReminderKey(reminderKey);
  const access = await requireSetupReminderAccess();
  const now = new Date();

  try {
    await prisma.tenantSetupReminderState.upsert({
      where: {
        tenantId_userId_reminderKey: {
          tenantId: access.tenantId,
          userId: access.userId,
          reminderKey,
        },
      },
      update: {
        lastShownAt: now,
      },
      create: {
        tenantId: access.tenantId,
        userId: access.userId,
        reminderKey,
        lastShownAt: now,
      },
    });
  } catch (error) {
    if (!isMissingTenantSetupReminderStateTableError(error)) throw error;
  }
}
