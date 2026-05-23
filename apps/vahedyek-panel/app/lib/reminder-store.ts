import crypto from 'node:crypto';
import { normalizeEmail } from './contact';
import { prisma } from './prisma';
import {
  DEFAULT_REMINDER_SETTINGS,
  REMINDER_TARGET_MOBILE,
  chooseReminderPresentation,
  formatReminderDateTime,
  isReminderTrackablePagePath,
  normalizeActionSummaryForReminder,
  normalizeReminderEmail,
  normalizeMobileForReminder,
  normalizePagePathForReminder,
  normalizePageTitleForReminder,
  normalizeReminderSettings,
  type ReminderAuditItem,
  type ReminderCustomNotice,
  type ReminderDigest,
  type ReminderRecipient,
  type ReminderSettings,
} from './reminder';
import { THREADS_TABLE, ensurePageThreadsTables } from './page-threads-store';
import { currentAppConfig } from '../config/current';

const SETTINGS_TABLE = '"TenantReminderSettings"';
const ACTIVITY_TABLE = '"UserReminderActivity"';
const PAGE_ACTIVITY_TABLE = '"UserReminderPageActivity"';
const NOTICE_TABLE = '"TenantReminderNotification"';
const SETTINGS_TENANT_INDEX = '"TenantReminderSettings_tenantId_key"';
const ACTIVITY_UNIQUE_INDEX = '"UserReminderActivity_tenantId_userId_key"';
const ACTIVITY_USER_INDEX = '"UserReminderActivity_userId_idx"';
const PAGE_ACTIVITY_UNIQUE_INDEX = '"UserReminderPageActivity_tenantId_userId_pagePath_key"';
const PAGE_ACTIVITY_USER_INDEX = '"UserReminderPageActivity_userId_lastVisitedAt_idx"';
const NOTICE_TENANT_USER_INDEX = '"TenantReminderNotification_tenantId_userId_ack_idx"';
const RECENT_LIMIT = 5;
const REMINDER_SCHEMA_VERSION = 5;

const globalForReminder = globalThis as unknown as {
  __reminderTablesReady?: boolean;
  __reminderSchemaVersion?: number;
  __reminderTablesPromise?: Promise<void>;
};

function isMissingReminderRelationError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes('42P01') &&
    error.message.includes('TenantReminderNotification')
  );
}

async function withReminderNoticeTableRetry<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (!isMissingReminderRelationError(error)) throw error;
    globalForReminder.__reminderTablesReady = false;
    globalForReminder.__reminderSchemaVersion = undefined;
    globalForReminder.__reminderTablesPromise = undefined;
    await ensureReminderTables();
    return operation();
  }
}

type ActivityRow = {
  tenantId: string;
  userId: string;
  previousPath: string | null;
  lastPath: string;
  lastSeenAt: Date;
  lastInputAt: Date | null;
  lastReminderShownAt: Date | null;
  lastTourAcknowledgedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type PageActivityRow = {
  tenantId: string;
  userId: string;
  pagePath: string;
  pageTitle: string | null;
  firstVisitedAt: Date;
  lastVisitedAt: Date;
  lastInputAt: Date | null;
  inputCount: number;
  lastMeaningfulActionAt: Date | null;
  meaningfulActionCount: number;
  lastActionSummary: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type AuditRow = {
  summary: string;
  action: string;
  entityId: string | null;
  entityLabel: string | null;
  details: unknown;
  metadata: unknown;
  createdAt: Date;
};

type ThreadRow = {
  title: string;
  docType: string;
  priority: string;
  status: string;
  pagePathSample: string;
  updatedAt: Date;
  lastMessageText: string | null;
  lastMessageType: string | null;
  lastMessageAt: Date | null;
};

type ThreadCountRow = {
  total: bigint | number;
};

type ReminderNotificationRow = {
  id: string;
  tenantId: string;
  userId: string;
  createdByUserId: string;
  title: string;
  messageText: string;
  targetEmail: string | null;
  emailStatus: string;
  pushStatus: string;
  acknowledgedAt: Date | null;
  createdAt: Date;
  actorName: string | null;
};

export async function ensureReminderTables() {
  if (
    globalForReminder.__reminderTablesReady &&
    globalForReminder.__reminderSchemaVersion === REMINDER_SCHEMA_VERSION
  ) {
    return;
  }
  if (globalForReminder.__reminderTablesPromise) {
    await globalForReminder.__reminderTablesPromise;
    if (globalForReminder.__reminderSchemaVersion !== REMINDER_SCHEMA_VERSION) {
      globalForReminder.__reminderTablesReady = false;
      globalForReminder.__reminderTablesPromise = undefined;
      return ensureReminderTables();
    }
    return;
  }

  globalForReminder.__reminderTablesPromise = (async () => {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ${SETTINGS_TABLE} (
        "id" TEXT PRIMARY KEY,
        "tenantId" TEXT NOT NULL,
        "settingsJson" TEXT NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TenantReminderSettings_tenantId_fkey"
          FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
          ON DELETE CASCADE
          ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS ${SETTINGS_TENANT_INDEX}
      ON ${SETTINGS_TABLE} ("tenantId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ${ACTIVITY_TABLE} (
        "id" TEXT PRIMARY KEY,
        "tenantId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "previousPath" TEXT,
        "lastPath" TEXT NOT NULL DEFAULT '/',
        "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastInputAt" TIMESTAMP(3),
        "lastReminderShownAt" TIMESTAMP(3),
        "lastTourAcknowledgedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UserReminderActivity_tenantId_fkey"
          FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT "UserReminderActivity_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "AppUser"("id")
          ON DELETE CASCADE
          ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE ${ACTIVITY_TABLE}
      ADD COLUMN IF NOT EXISTS "previousPath" TEXT;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS ${ACTIVITY_UNIQUE_INDEX}
      ON ${ACTIVITY_TABLE} ("tenantId", "userId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS ${ACTIVITY_USER_INDEX}
      ON ${ACTIVITY_TABLE} ("userId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ${PAGE_ACTIVITY_TABLE} (
        "id" TEXT PRIMARY KEY,
        "tenantId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "pagePath" TEXT NOT NULL,
        "pageTitle" TEXT,
        "firstVisitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastVisitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastInputAt" TIMESTAMP(3),
        "inputCount" INTEGER NOT NULL DEFAULT 0,
        "lastMeaningfulActionAt" TIMESTAMP(3),
        "meaningfulActionCount" INTEGER NOT NULL DEFAULT 0,
        "lastActionSummary" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UserReminderPageActivity_tenantId_fkey"
          FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT "UserReminderPageActivity_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "AppUser"("id")
          ON DELETE CASCADE
          ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE ${PAGE_ACTIVITY_TABLE}
      ADD COLUMN IF NOT EXISTS "lastMeaningfulActionAt" TIMESTAMP(3);
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE ${PAGE_ACTIVITY_TABLE}
      ADD COLUMN IF NOT EXISTS "meaningfulActionCount" INTEGER NOT NULL DEFAULT 0;
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE ${PAGE_ACTIVITY_TABLE}
      ADD COLUMN IF NOT EXISTS "lastActionSummary" TEXT;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS ${PAGE_ACTIVITY_UNIQUE_INDEX}
      ON ${PAGE_ACTIVITY_TABLE} ("tenantId", "userId", "pagePath");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS ${PAGE_ACTIVITY_USER_INDEX}
      ON ${PAGE_ACTIVITY_TABLE} ("userId", "lastVisitedAt" DESC);
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ${NOTICE_TABLE} (
        "id" TEXT PRIMARY KEY,
        "tenantId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdByUserId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "messageText" TEXT NOT NULL,
        "targetEmail" TEXT,
        "emailStatus" TEXT NOT NULL DEFAULT 'missing',
        "pushStatus" TEXT NOT NULL DEFAULT 'queued',
        "acknowledgedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TenantReminderNotification_tenantId_fkey"
          FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT "TenantReminderNotification_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "AppUser"("id")
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT "TenantReminderNotification_createdByUserId_fkey"
          FOREIGN KEY ("createdByUserId") REFERENCES "AppUser"("id")
          ON DELETE CASCADE
          ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS ${NOTICE_TENANT_USER_INDEX}
      ON ${NOTICE_TABLE} ("tenantId", "userId", "acknowledgedAt", "createdAt" DESC);
    `);
  })();

  try {
    await globalForReminder.__reminderTablesPromise;
    globalForReminder.__reminderTablesReady = true;
    globalForReminder.__reminderSchemaVersion = REMINDER_SCHEMA_VERSION;
  } catch (error) {
    globalForReminder.__reminderTablesPromise = undefined;
    throw error;
  }
}

function parseSettingsJson(input: string | null | undefined) {
  if (!input) return DEFAULT_REMINDER_SETTINGS;
  try {
    return normalizeReminderSettings(JSON.parse(input));
  } catch {
    return DEFAULT_REMINDER_SETTINGS;
  }
}

export async function getReminderSettings(tenantId: string): Promise<ReminderSettings> {
  await ensureReminderTables();
  const rows = await prisma.$queryRawUnsafe<Array<{ settingsJson: string }>>(
    `SELECT "settingsJson" FROM ${SETTINGS_TABLE} WHERE "tenantId" = $1 LIMIT 1`,
    tenantId,
  );
  return parseSettingsJson(rows[0]?.settingsJson);
}

export async function saveReminderSettings(tenantId: string, settingsInput: unknown) {
  await ensureReminderTables();
  const settings = normalizeReminderSettings(settingsInput);
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ${SETTINGS_TABLE} ("id", "tenantId", "settingsJson", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("tenantId")
      DO UPDATE SET
        "settingsJson" = EXCLUDED."settingsJson",
        "updatedAt" = CURRENT_TIMESTAMP
    `,
    crypto.randomUUID(),
    tenantId,
    JSON.stringify(settings),
  );
  return settings;
}

function normalizeReminderNoticeTitle(input: unknown) {
  if (typeof input !== 'string') return 'یادآور مدیر';
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return 'یادآور مدیر';
  return trimmed.length > 120 ? trimmed.slice(0, 120) : trimmed;
}

function normalizeReminderNoticeMessage(input: unknown) {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim().replace(/\s+/g, ' ');
  return trimmed.length > 1200 ? trimmed.slice(0, 1200) : trimmed;
}

export async function getReminderRecipient(tenantId: string): Promise<ReminderRecipient | null> {
  const targetMobile = normalizeMobileForReminder(REMINDER_TARGET_MOBILE);
  const memberships = await prisma.userTenantMembership.findMany({
    where: {
      tenantId,
    },
    select: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          mobile: true,
        },
      },
    },
  });

  const membership = memberships.find((item) => normalizeMobileForReminder(item.user.mobile) === targetMobile);
  if (!membership?.user) return null;
  return {
    userId: membership.user.id,
    fullName: membership.user.fullName,
    email: membership.user.email,
    mobile: membership.user.mobile,
  };
}

export async function createReminderNotification(input: {
  tenantId: string;
  actorUserId: string;
  actorName: string;
  title?: unknown;
  message: unknown;
}) {
  await ensureReminderTables();

  const recipient = await getReminderRecipient(input.tenantId);
  if (!recipient) {
    throw new Error('کاربر هدف یادآور در این کسب‌وکار پیدا نشد.');
  }

  const settings = await getReminderSettings(input.tenantId);

  const messageText = normalizeReminderNoticeMessage(input.message);
  if (!messageText) {
    throw new Error('متن یادآور را وارد کنید.');
  }

  const title = normalizeReminderNoticeTitle(input.title);
  const targetEmail = normalizeEmail(normalizeReminderEmail(settings.notificationEmail) || recipient.email || '');
  const emailStatus = targetEmail ? 'sent' : 'missing';

  const id = crypto.randomUUID();
  await withReminderNoticeTableRetry(() =>
    prisma.$executeRawUnsafe(
      `
        INSERT INTO ${NOTICE_TABLE} (
          "id", "tenantId", "userId", "createdByUserId", "title", "messageText",
          "targetEmail", "emailStatus", "pushStatus", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'queued', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      id,
      input.tenantId,
      recipient.userId,
      input.actorUserId,
      title,
      messageText,
      targetEmail || null,
      emailStatus,
    ),
  );

  return {
    id,
    recipient,
    title,
    messageText,
    targetEmail: targetEmail || null,
    emailStatus: emailStatus as 'sent' | 'missing',
    pushStatus: 'queued' as const,
  };
}

export async function updateReminderNotificationEmailStatus(input: {
  id: string;
  emailStatus: 'sent' | 'missing' | 'config_missing' | 'failed';
}) {
  await ensureReminderTables();
  await withReminderNoticeTableRetry(() =>
    prisma.$executeRawUnsafe(
      `
        UPDATE ${NOTICE_TABLE}
        SET "emailStatus" = $2, "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = $1
      `,
      input.id,
      input.emailStatus,
    ),
  );
}

export async function recordReminderActivity(input: {
  tenantId: string;
  userId: string;
  path: unknown;
  pageTitle?: unknown;
  actionSummary?: unknown;
  hasInput: boolean;
  hasInteraction?: boolean;
}) {
  await ensureReminderTables();
  const path = normalizePagePathForReminder(input.path);
  const pageTitle = normalizePageTitleForReminder(input.pageTitle);
  const actionSummary = normalizeActionSummaryForReminder(input.actionSummary);
  const trackLastPath = isReminderTrackablePagePath(path);
  const hasInteraction = Boolean(input.hasInput || input.hasInteraction);
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ${ACTIVITY_TABLE} (
        "id", "tenantId", "userId", "lastPath", "lastSeenAt", "lastInputAt", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, CASE WHEN $6 THEN $4 ELSE '/' END, CURRENT_TIMESTAMP, CASE WHEN $7 THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("tenantId", "userId")
      DO UPDATE SET
        "previousPath" = CASE
          WHEN $6 AND ${ACTIVITY_TABLE}."lastPath" <> EXCLUDED."lastPath" THEN ${ACTIVITY_TABLE}."lastPath"
          ELSE ${ACTIVITY_TABLE}."previousPath"
        END,
        "lastPath" = CASE WHEN $6 THEN EXCLUDED."lastPath" ELSE ${ACTIVITY_TABLE}."lastPath" END,
        "lastSeenAt" = CURRENT_TIMESTAMP,
        "lastInputAt" = CASE WHEN $7 THEN CURRENT_TIMESTAMP ELSE ${ACTIVITY_TABLE}."lastInputAt" END,
        "updatedAt" = CURRENT_TIMESTAMP
    `,
    crypto.randomUUID(),
    input.tenantId,
    input.userId,
    path,
    input.hasInput,
    trackLastPath,
    hasInteraction,
  );

  if (trackLastPath) {
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO ${PAGE_ACTIVITY_TABLE} (
          "id", "tenantId", "userId", "pagePath", "pageTitle", "firstVisitedAt", "lastVisitedAt", "lastInputAt", "inputCount", "lastMeaningfulActionAt", "meaningfulActionCount", "lastActionSummary", "createdAt", "updatedAt"
        )
        VALUES (
          $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
          CASE WHEN $6 THEN CURRENT_TIMESTAMP ELSE NULL END,
          CASE WHEN $6 THEN 1 ELSE 0 END,
          CASE WHEN $6 THEN CURRENT_TIMESTAMP ELSE NULL END,
          CASE WHEN $6 THEN 1 ELSE 0 END,
          CASE WHEN $6 THEN $7 ELSE NULL END,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        ON CONFLICT ("tenantId", "userId", "pagePath")
        DO UPDATE SET
          "pageTitle" = COALESCE(EXCLUDED."pageTitle", ${PAGE_ACTIVITY_TABLE}."pageTitle"),
          "lastVisitedAt" = CURRENT_TIMESTAMP,
          "lastInputAt" = CASE WHEN $6 THEN CURRENT_TIMESTAMP ELSE ${PAGE_ACTIVITY_TABLE}."lastInputAt" END,
          "inputCount" = ${PAGE_ACTIVITY_TABLE}."inputCount" + CASE WHEN $6 THEN 1 ELSE 0 END,
          "lastMeaningfulActionAt" = CASE WHEN $6 THEN CURRENT_TIMESTAMP ELSE ${PAGE_ACTIVITY_TABLE}."lastMeaningfulActionAt" END,
          "meaningfulActionCount" = ${PAGE_ACTIVITY_TABLE}."meaningfulActionCount" + CASE WHEN $6 THEN 1 ELSE 0 END,
          "lastActionSummary" = CASE WHEN $6 THEN COALESCE($7, ${PAGE_ACTIVITY_TABLE}."lastActionSummary") ELSE ${PAGE_ACTIVITY_TABLE}."lastActionSummary" END,
          "updatedAt" = CURRENT_TIMESTAMP
      `,
      crypto.randomUUID(),
      input.tenantId,
      input.userId,
      path,
      pageTitle,
      input.hasInput,
      actionSummary,
    );
  }
}

export async function markReminderShown(input: {
  tenantId: string;
  userId: string;
  acknowledgedTour?: boolean;
}) {
  await ensureReminderTables();
  await prisma.$executeRawUnsafe(
    `
      UPDATE ${ACTIVITY_TABLE}
      SET
        "lastReminderShownAt" = CURRENT_TIMESTAMP,
        "lastTourAcknowledgedAt" = CASE WHEN $3 THEN CURRENT_TIMESTAMP ELSE "lastTourAcknowledgedAt" END,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "tenantId" = $1 AND "userId" = $2
    `,
    input.tenantId,
    input.userId,
    Boolean(input.acknowledgedTour),
  );
}

async function getActivity(tenantId: string, userId: string) {
  await ensureReminderTables();
  const rows = await prisma.$queryRawUnsafe<ActivityRow[]>(
    `SELECT * FROM ${ACTIVITY_TABLE} WHERE "tenantId" = $1 AND "userId" = $2 LIMIT 1`,
    tenantId,
    userId,
  );
  return rows[0] ?? null;
}

async function getPageActivity(input: {
  tenantId: string;
  userId: string;
  pagePath: string;
  pageTitle?: string | null;
}) {
  await ensureReminderTables();
  const pagePath = normalizePagePathForReminder(input.pagePath);

  const rows = await prisma.$queryRawUnsafe<PageActivityRow[]>(
    `
      SELECT *
      FROM ${PAGE_ACTIVITY_TABLE}
      WHERE "tenantId" = $1 AND "userId" = $2 AND "pagePath" = $3
      LIMIT 1
    `,
    input.tenantId,
    input.userId,
    pagePath,
  );

  return rows[0] ?? null;
}

async function getLatestPageActivity(input: {
  tenantId: string;
  userId: string;
  excludePagePath?: string | null;
}) {
  await ensureReminderTables();
  const excludePagePath = input.excludePagePath ? normalizePagePathForReminder(input.excludePagePath) : null;
  const filters = [`"tenantId" = $1`, `"userId" = $2`];
  const params: unknown[] = [input.tenantId, input.userId];
  if (excludePagePath) {
    params.push(excludePagePath);
    filters.push(`"pagePath" <> $${params.length}`);
  }

  const rows = await prisma.$queryRawUnsafe<PageActivityRow[]>(
    `
      SELECT *
      FROM ${PAGE_ACTIVITY_TABLE}
      WHERE ${filters.join(' AND ')}
      ORDER BY "lastVisitedAt" DESC
      LIMIT 1
    `,
    ...params,
  );

  return rows[0] ?? null;
}

function sanitizeSummary(input: string | null | undefined) {
  const value = String(input ?? '').trim();
  return value.length > 180 ? `${value.slice(0, 180)}...` : value;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function readReminderHref(item: AuditRow) {
  if (item.action === 'page.view') {
    const details = asRecord(item.details);
    const path = typeof details.path === 'string' && details.path.startsWith('/') ? details.path : item.entityId;
    const search = typeof details.search === 'string' && details.search.startsWith('?') ? details.search : '';
    return path ? `${path}${search}` : null;
  }

  const metadata = asRecord(item.metadata);
  const pageContext = asRecord(metadata.pageContext);
  const path = typeof pageContext.path === 'string' && pageContext.path.startsWith('/') ? pageContext.path : null;
  const search = typeof pageContext.search === 'string' && pageContext.search.startsWith('?') ? pageContext.search : '';
  return path ? `${path}${search}` : null;
}

async function listRecentAuditItems(input: { tenantId: string }) {
  const rows = await prisma.auditLog.findMany({
    where: {
      tenantId: input.tenantId,
    },
    select: {
      summary: true,
      action: true,
      entityId: true,
      entityLabel: true,
      details: true,
      metadata: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: RECENT_LIMIT,
  });

  return rows.map((item: AuditRow): ReminderAuditItem => {
    const when = formatReminderDateTime(item.createdAt);
    return {
      label: sanitizeSummary(`${item.summary}${when ? ` (${when})` : ''}`),
      href: readReminderHref(item),
    };
  });
}

async function listRecentThreadItems(input: {
  lastPath: string | null;
  includeNeedsTesting: boolean;
  includeCompletedDiscussions: boolean;
}) {
  await ensurePageThreadsTables();

  const filters: string[] = [`t."appId" = $1`];
  const params: unknown[] = [currentAppConfig.appId];

  if (input.lastPath) {
    params.push(input.lastPath);
    filters.push(`t."pagePathSample" = $${params.length}`);
  }

  const statusConditions: string[] = [];
  if (input.includeNeedsTesting) statusConditions.push(`t."status" IN ('todo', 'in_progress')`);
  if (input.includeCompletedDiscussions) statusConditions.push(`t."status" = 'done'`);
  if (statusConditions.length) filters.push(`(${statusConditions.join(' OR ')})`);

  const rows = await prisma.$queryRawUnsafe<ThreadRow[]>(
    `
      SELECT
        t."title",
        t."docType",
        t."priority",
        t."status",
        t."pagePathSample",
        t."updatedAt",
        latest_message."text" AS "lastMessageText",
        latest_message."messageType" AS "lastMessageType",
        latest_message."createdAt" AS "lastMessageAt"
      FROM ${THREADS_TABLE} t
      LEFT JOIN LATERAL (
        SELECT m."text", m."messageType", m."createdAt"
        FROM "DevPageMessage" m
        WHERE m."threadId" = t."id"
        ORDER BY m."createdAt" DESC
        LIMIT 1
      ) latest_message ON TRUE
      WHERE ${filters.join(' AND ')}
      ORDER BY t."updatedAt" DESC
      LIMIT ${RECENT_LIMIT}
    `,
    ...params,
  );

  return rows.map((item) => {
    const statusLabel = item.status === 'done' ? 'انجام شده' : item.status === 'in_progress' ? 'در حال انجام' : 'نیازمند بررسی';
    const when = formatReminderDateTime(item.lastMessageAt ?? item.updatedAt);
    const message =
      item.lastMessageText?.trim() ||
      (item.lastMessageType && item.lastMessageType !== 'text' ? `آخرین پیام: ${item.lastMessageType}` : '');
    return sanitizeSummary(`${item.title} - ${statusLabel}${message ? ` - ${message}` : ''}${when ? ` (${when})` : ''}`);
  });
}

async function hasRegisteredThreadForPage(pagePath: string | null) {
  if (!pagePath) return false;
  await ensurePageThreadsTables();

  const rows = await prisma.$queryRawUnsafe<ThreadCountRow[]>(
    `
      SELECT COUNT(*) AS "total"
      FROM ${THREADS_TABLE} t
      WHERE t."appId" = $1 AND t."pagePathSample" = $2
    `,
    currentAppConfig.appId,
    pagePath,
  );

  const total = rows[0]?.total;
  return typeof total === 'bigint' ? total.toString() !== '0' : Number(total ?? 0) > 0;
}

async function getPendingReminderNotification(input: { tenantId: string; userId: string }): Promise<ReminderNotificationRow | null> {
  await ensureReminderTables();

  const rows = await withReminderNoticeTableRetry(() =>
    prisma.$queryRawUnsafe<ReminderNotificationRow[]>(
      `
        SELECT notice.*, actor."fullName" AS "actorName"
        FROM ${NOTICE_TABLE} notice
        LEFT JOIN "AppUser" actor ON actor."id" = notice."createdByUserId"
        WHERE notice."tenantId" = $1
          AND notice."userId" = $2
          AND notice."acknowledgedAt" IS NULL
        ORDER BY notice."createdAt" DESC
        LIMIT 1
      `,
      input.tenantId,
      input.userId,
    ),
  );

  return rows[0] ?? null;
}

function mapReminderCustomNotice(row: ReminderNotificationRow | null): ReminderCustomNotice | null {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    message: row.messageText,
    actorName: row.actorName ?? 'مدیر',
    createdAt: row.createdAt.toISOString(),
    emailStatus:
      row.emailStatus === 'sent' || row.emailStatus === 'config_missing' || row.emailStatus === 'failed'
        ? row.emailStatus
        : 'missing',
    pushStatus: 'queued',
    targetEmail: row.targetEmail,
  };
}

export async function acknowledgeReminderNotification(input: {
  tenantId: string;
  userId: string;
  noticeId?: string | null;
}) {
  await ensureReminderTables();
  if (input.noticeId) {
    await withReminderNoticeTableRetry(() =>
      prisma.$executeRawUnsafe(
        `
          UPDATE ${NOTICE_TABLE}
          SET "acknowledgedAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
          WHERE "tenantId" = $1 AND "userId" = $2 AND "id" = $3 AND "acknowledgedAt" IS NULL
        `,
        input.tenantId,
        input.userId,
        input.noticeId,
      ),
    );
    return;
  }

  await withReminderNoticeTableRetry(() =>
    prisma.$executeRawUnsafe(
      `
        UPDATE ${NOTICE_TABLE}
        SET "acknowledgedAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
        WHERE "tenantId" = $1 AND "userId" = $2 AND "acknowledgedAt" IS NULL
      `,
      input.tenantId,
      input.userId,
    ),
  );
}

export async function buildReminderDigest(input: {
  tenantId: string;
  userId: string;
  hadPageReload: boolean;
  currentPath?: string;
  currentTitle?: string | null;
}): Promise<ReminderDigest> {
  await ensureReminderTables();
  const [settings, activity] = await Promise.all([
    getReminderSettings(input.tenantId),
    getActivity(input.tenantId, input.userId),
  ]);

  const currentPath = normalizePagePathForReminder(input.currentPath);
  const currentTrackable = isReminderTrackablePagePath(currentPath);
  const explicitPreviousPath =
    activity?.previousPath && activity.previousPath !== currentPath
      ? normalizePagePathForReminder(activity.previousPath)
      : null;
  const previousPageActivity = await getLatestPageActivity({
    tenantId: input.tenantId,
    userId: input.userId,
    excludePagePath: currentTrackable ? currentPath : null,
  });
  const explicitPreviousActivity = explicitPreviousPath
    ? await getPageActivity({
        tenantId: input.tenantId,
        userId: input.userId,
        pagePath: explicitPreviousPath,
      })
    : null;
  const effectivePath = explicitPreviousActivity?.pagePath || previousPageActivity?.pagePath || activity?.lastPath || (currentTrackable ? currentPath : '/');
  const pageActivity =
    explicitPreviousActivity ??
    previousPageActivity ??
    (currentTrackable
      ? await getPageActivity({
          tenantId: input.tenantId,
          userId: input.userId,
          pagePath: effectivePath,
          pageTitle: input.currentTitle,
        })
      : null);
  const lastPath = settings.includeLastVisitedPage ? pageActivity?.pagePath ?? effectivePath : effectivePath;
  const digestLastPath = settings.includeLastVisitedPage ? lastPath : null;
  const pageTitle = pageActivity?.pageTitle ?? normalizePageTitleForReminder(input.currentTitle);
  const didWorkOnPage = Boolean(pageActivity?.lastMeaningfulActionAt && pageActivity.meaningfulActionCount > 0);
  const [auditItems, threadItems, lastVisitedPageReviewed, pendingCustomNotice] = await Promise.all([
    settings.includeRecentlyDeveloped
      ? listRecentAuditItems({
          tenantId: input.tenantId,
        })
      : Promise.resolve([]),
    settings.includeNeedsTesting || settings.includeCompletedDiscussions
      ? listRecentThreadItems({
          lastPath: digestLastPath,
          includeNeedsTesting: settings.includeNeedsTesting,
          includeCompletedDiscussions: settings.includeCompletedDiscussions,
        })
      : Promise.resolve([]),
    hasRegisteredThreadForPage(digestLastPath),
    getPendingReminderNotification({
      tenantId: input.tenantId,
      userId: input.userId,
    }),
  ]);

  const lastInputText = formatReminderDateTime(pageActivity?.lastMeaningfulActionAt);
  const lastSeenText = formatReminderDateTime(pageActivity?.lastVisitedAt ?? activity?.lastSeenAt);
  const pageName = settings.includeLastVisitedPage ? pageTitle || lastPath : 'یادآور تست';
  const actionSummary = pageActivity?.lastActionSummary || 'کاری در این صفحه انجام داده‌اید.';
  const activitySummary = settings.includeLastVisitedPage
    ? didWorkOnPage && lastInputText
      ? `در ${pageName} بوده‌اید و آخرین کار شما: ${actionSummary} (${lastInputText}).`
      : `در ${pageName} بوده‌اید و هنوز کاری در این صفحه انجام نداده‌اید.`
    : `آخرین بخش کاربر طبق تنظیمات مدیریتی در این یادآور نمایش داده نمی‌شود${lastSeenText ? `؛ آخرین حضور ثبت‌شده: ${lastSeenText}.` : '.'}`;
  const presentation = chooseReminderPresentation({
    previousActivityExists: Boolean(activity),
    hadPageReload: input.hadPageReload,
    lastInputAt: activity?.lastInputAt ?? null,
  });
  const customNotice = mapReminderCustomNotice(pendingCustomNotice);

  return {
    enabled: true,
    title: customNotice?.title || (pageName ? `یادآور ${pageName}` : 'یادآور'),
    lastVisitedPage: digestLastPath,
    lastVisitedPageTitle: settings.includeLastVisitedPage ? pageTitle : null,
    lastVisitedPageReviewed,
    didWorkOnPage,
    activitySummary: customNotice?.message || activitySummary,
    auditItems,
    threadItems,
    customNotice,
    generatedAt: new Date().toISOString(),
    presentation: customNotice ? 'tour' : presentation,
  };
}
