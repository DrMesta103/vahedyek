import crypto from 'node:crypto';
import { currentAppConfig } from '../config/current';
import { prisma } from './prisma';
import {
  normalizeDocTypeTag,
  normalizeLabels,
  normalizeMessageType,
  normalizePriority,
  normalizeThreadStatus,
  sanitizeDataUrl,
  sanitizeText,
  type MessageType,
  type PageMessageRecord,
  type PageThreadRecord,
  type ThreadPriority,
  type ThreadStatus,
} from './page-threads';
import { normalizePagePath } from './page-docs';

export const THREADS_TABLE = '"DevPageThread"';
export const MESSAGES_TABLE = '"DevPageMessage"';
export const THREAD_READ_STATE_TABLE = '"DevPageThreadReadState"';
const THREAD_PAGE_KEY_INDEX = '"DevPageThread_appId_pageKey_idx"';
const THREAD_UPDATED_AT_INDEX = '"DevPageThread_appId_updatedAt_idx"';
const MESSAGE_THREAD_INDEX = '"DevPageMessage_threadId_createdAt_idx"';
const THREAD_READ_STATE_UNIQUE_INDEX = '"DevPageThreadReadState_tenantId_appId_userId_threadId_key"';
const PAGE_THREADS_SCHEMA_VERSION = 2;

const globalForPageThreads = globalThis as unknown as {
  __pageThreadsTablesReady?: boolean;
  __pageThreadsSchemaVersion?: number;
  __pageThreadsTablesPromise?: Promise<void>;
};

type ThreadRow = {
  id: string;
  tenantId: string | null;
  appId: string;
  pageKey: string;
  pagePathSample: string;
  title: string;
  docType: string;
  priority: string;
  status: string;
  labelsJson: string | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string | null;
  authorFullName: string | null;
  authorEmail: string | null;
  updaterId: string | null;
  updaterFullName: string | null;
  updaterEmail: string | null;
  tenantName: string | null;
  tenantSlug: string | null;
  isOpened: boolean | null;
};

type MessageRow = {
  id: string;
  threadId: string;
  messageType: string;
  text: string | null;
  attachmentDataUrl: string | null;
  attachmentMimeType: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  replyToMessageId: string | null;
  createdAt: Date;
  authorId: string | null;
  authorFullName: string | null;
  authorEmail: string | null;
  replyId: string | null;
  replyType: string | null;
  replyText: string | null;
};

export async function ensurePageThreadsTables() {
  if (
    globalForPageThreads.__pageThreadsTablesReady &&
    globalForPageThreads.__pageThreadsSchemaVersion === PAGE_THREADS_SCHEMA_VERSION
  ) {
    return;
  }
  if (globalForPageThreads.__pageThreadsTablesPromise) {
    await globalForPageThreads.__pageThreadsTablesPromise;
    if (globalForPageThreads.__pageThreadsSchemaVersion !== PAGE_THREADS_SCHEMA_VERSION) {
      globalForPageThreads.__pageThreadsTablesReady = false;
      globalForPageThreads.__pageThreadsTablesPromise = undefined;
      return ensurePageThreadsTables();
    }
    return;
  }

  globalForPageThreads.__pageThreadsTablesPromise = (async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${THREADS_TABLE} (
      "id" TEXT PRIMARY KEY,
      "tenantId" TEXT NOT NULL,
      "appId" TEXT NOT NULL DEFAULT '${currentAppConfig.appId}',
      "pageKey" TEXT NOT NULL,
      "pagePathSample" TEXT NOT NULL DEFAULT '/',
      "title" TEXT NOT NULL,
      "docType" TEXT NOT NULL DEFAULT 'free',
      "priority" TEXT NOT NULL DEFAULT 'p2',
      "status" TEXT NOT NULL DEFAULT 'todo',
      "labelsJson" TEXT NOT NULL DEFAULT '[]',
      "createdById" TEXT NOT NULL,
      "updatedById" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DevPageThread_createdById_fkey"
        FOREIGN KEY ("createdById") REFERENCES "AppUser"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
      CONSTRAINT "DevPageThread_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT "DevPageThread_updatedById_fkey"
        FOREIGN KEY ("updatedById") REFERENCES "AppUser"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`ALTER TABLE ${THREADS_TABLE} ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT '';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${THREADS_TABLE} ADD COLUMN IF NOT EXISTS "appId" TEXT NOT NULL DEFAULT '${currentAppConfig.appId}';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${THREADS_TABLE} ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'p2';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${THREADS_TABLE} ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'todo';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${THREADS_TABLE} ADD COLUMN IF NOT EXISTS "labelsJson" TEXT NOT NULL DEFAULT '[]';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${THREADS_TABLE} ADD COLUMN IF NOT EXISTS "pagePathSample" TEXT NOT NULL DEFAULT '/';`);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS ${THREAD_PAGE_KEY_INDEX}
    ON ${THREADS_TABLE} ("tenantId", "appId", "pageKey");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS ${THREAD_UPDATED_AT_INDEX}
    ON ${THREADS_TABLE} ("tenantId", "appId", "updatedAt" DESC);
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${MESSAGES_TABLE} (
      "id" TEXT PRIMARY KEY,
      "threadId" TEXT NOT NULL,
      "authorUserId" TEXT NOT NULL,
      "replyToMessageId" TEXT,
      "messageType" TEXT NOT NULL DEFAULT 'text',
      "text" TEXT,
      "attachmentDataUrl" TEXT,
      "attachmentMimeType" TEXT,
      "attachmentName" TEXT,
      "attachmentSize" INTEGER,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,



      
      CONSTRAINT "DevPageMessage_threadId_fkey"
        FOREIGN KEY ("threadId") REFERENCES ${THREADS_TABLE}("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT "DevPageMessage_authorUserId_fkey"
        FOREIGN KEY ("authorUserId") REFERENCES "AppUser"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS ${MESSAGE_THREAD_INDEX}
    ON ${MESSAGES_TABLE} ("threadId", "createdAt" ASC);
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${THREAD_READ_STATE_TABLE} (
      "id" TEXT PRIMARY KEY,
      "tenantId" TEXT NOT NULL,
      "appId" TEXT NOT NULL DEFAULT '${currentAppConfig.appId}',
      "userId" TEXT NOT NULL,
      "threadId" TEXT NOT NULL,
      "isOpened" BOOLEAN NOT NULL DEFAULT FALSE,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DevPageThreadReadState_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT "DevPageThreadReadState_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "AppUser"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT "DevPageThreadReadState_threadId_fkey"
        FOREIGN KEY ("threadId") REFERENCES ${THREADS_TABLE}("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`ALTER TABLE ${THREAD_READ_STATE_TABLE} ADD COLUMN IF NOT EXISTS "appId" TEXT NOT NULL DEFAULT '${currentAppConfig.appId}';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${THREAD_READ_STATE_TABLE} ADD COLUMN IF NOT EXISTS "isOpened" BOOLEAN NOT NULL DEFAULT FALSE;`);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS ${THREAD_READ_STATE_UNIQUE_INDEX}
    ON ${THREAD_READ_STATE_TABLE} ("tenantId", "appId", "userId", "threadId");
  `);
  })();

  try {
    await globalForPageThreads.__pageThreadsTablesPromise;
    globalForPageThreads.__pageThreadsTablesReady = true;
    globalForPageThreads.__pageThreadsSchemaVersion = PAGE_THREADS_SCHEMA_VERSION;
  } catch (error) {
    globalForPageThreads.__pageThreadsTablesPromise = undefined;
    throw error;
  }
}

function safeJsonParseStringArray(input: unknown) {
  if (typeof input !== 'string' || !input.trim()) {
    return [] as string[];
  }

  try {
    return normalizeLabels(JSON.parse(input));
  } catch {
    return [] as string[];
  }
}

export function mapThreadRow(row: ThreadRow): PageThreadRecord {
  const priority = normalizePriority(row.priority);
  const status = normalizeThreadStatus(row.status);
  return {
    id: row.id,
    appId: row.appId,
    tenantId: row.tenantId,
    tenantName: row.tenantName,
    tenantSlug: row.tenantSlug,
    pageKey: row.pageKey,
    pagePathSample: row.pagePathSample,
    title: row.title,
    docType: normalizeDocTypeTag(row.docType),
    priority,
    status,
    labels: safeJsonParseStringArray(row.labelsJson),
    isOpened: Boolean(row.isOpened),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.authorId
      ? { id: row.authorId, fullName: row.authorFullName ?? 'کاربر نامشخص', email: row.authorEmail ?? '' }
      : null,
    updatedBy: row.updaterId
      ? { id: row.updaterId, fullName: row.updaterFullName ?? 'کاربر نامشخص', email: row.updaterEmail ?? '' }
      : null,
  };
}

export function mapMessageRow(row: MessageRow): PageMessageRecord {
  const messageType = normalizeMessageType(row.messageType);
  return {
    id: row.id,
    threadId: row.threadId,
    messageType,
    text: row.text,
    attachmentDataUrl: row.attachmentDataUrl,
    attachmentMimeType: row.attachmentMimeType,
    attachmentName: row.attachmentName,
    attachmentSize: row.attachmentSize,
    replyToMessageId: row.replyToMessageId,
    createdAt: row.createdAt.toISOString(),
    author: row.authorId ? { id: row.authorId, fullName: row.authorFullName ?? 'کاربر نامشخص', email: row.authorEmail ?? '' } : null,
    replyTo: row.replyId
      ? {
          id: row.replyId,
          messageType: normalizeMessageType(row.replyType),
          text: row.replyText,
        }
      : null,
  };
}

export async function listThreadsForApp(input: { tenantId: string; userId: string }) {
  await ensurePageThreadsTables();

  const rows = await prisma.$queryRawUnsafe<ThreadRow[]>(
    `
      SELECT
        t."id",
        t."tenantId",
        t."appId",
        t."pageKey",
        t."pagePathSample",
        t."title",
        t."docType",
        t."priority",
        t."status",
        t."labelsJson",
        t."createdAt",
        t."updatedAt",
        author."id" AS "authorId",
        author."fullName" AS "authorFullName",
        author."email" AS "authorEmail",
        updater."id" AS "updaterId",
        updater."fullName" AS "updaterFullName",
        updater."email" AS "updaterEmail",
        tenant."name" AS "tenantName",
        tenant."slug" AS "tenantSlug",
        CASE
          WHEN latest_message."lastMessageAt" IS NULL THEN COALESCE(state."isOpened", FALSE)
          WHEN state."updatedAt" IS NULL THEN FALSE
          WHEN state."updatedAt" >= latest_message."lastMessageAt" THEN TRUE
          ELSE FALSE
        END AS "isOpened"
      FROM ${THREADS_TABLE} t
      LEFT JOIN (
        SELECT "threadId", MAX("createdAt") AS "lastMessageAt"
        FROM ${MESSAGES_TABLE}
        GROUP BY "threadId"
      ) latest_message ON latest_message."threadId" = t."id"
      LEFT JOIN ${THREAD_READ_STATE_TABLE} state
        ON state."threadId" = t."id"
        AND state."appId" = t."appId"
        AND state."tenantId" = $1
        AND state."userId" = $3
      LEFT JOIN "AppUser" author ON author."id" = t."createdById"
      LEFT JOIN "AppUser" updater ON updater."id" = t."updatedById"
      LEFT JOIN "Tenant" tenant ON tenant."id" = t."tenantId"
      WHERE t."appId" = $2
      ORDER BY t."updatedAt" DESC, t."createdAt" DESC
    `,
    input.tenantId,
    currentAppConfig.appId,
    input.userId,
  );

  return {
    pagePath: '/',
    pageKey: '/all-pages',
    threads: rows.map(mapThreadRow),
  };
}

export async function listThreadsForPage(input: { pagePath: string; tenantId: string; userId: string }) {
  const { pagePath, pageKey } = normalizePagePath(input.pagePath);
  await ensurePageThreadsTables();

  const rows = await prisma.$queryRawUnsafe<ThreadRow[]>(
    `
      SELECT
        t."id",
        t."tenantId",
        t."appId",
        t."pageKey",
        t."pagePathSample",
        t."title",
        t."docType",
        t."priority",
        t."status",
        t."labelsJson",
        t."createdAt",
        t."updatedAt",
        author."id" AS "authorId",
        author."fullName" AS "authorFullName",
        author."email" AS "authorEmail",
        updater."id" AS "updaterId",
        updater."fullName" AS "updaterFullName",
        updater."email" AS "updaterEmail",
        tenant."name" AS "tenantName",
        tenant."slug" AS "tenantSlug",
        CASE
          WHEN latest_message."lastMessageAt" IS NULL THEN COALESCE(state."isOpened", FALSE)
          WHEN state."updatedAt" IS NULL THEN FALSE
          WHEN state."updatedAt" >= latest_message."lastMessageAt" THEN TRUE
          ELSE FALSE
        END AS "isOpened"
      FROM ${THREADS_TABLE} t
      LEFT JOIN (
        SELECT "threadId", MAX("createdAt") AS "lastMessageAt"
        FROM ${MESSAGES_TABLE}
        GROUP BY "threadId"
      ) latest_message ON latest_message."threadId" = t."id"
      LEFT JOIN ${THREAD_READ_STATE_TABLE} state
        ON state."threadId" = t."id"
        AND state."appId" = t."appId"
        AND state."tenantId" = $1
        AND state."userId" = $4
      LEFT JOIN "AppUser" author ON author."id" = t."createdById"
      LEFT JOIN "AppUser" updater ON updater."id" = t."updatedById"
      LEFT JOIN "Tenant" tenant ON tenant."id" = t."tenantId"
      WHERE t."appId" = $2 AND t."pageKey" = $3
      ORDER BY t."updatedAt" DESC, t."createdAt" DESC
    `,
    input.tenantId,
    currentAppConfig.appId,
    pageKey,
    input.userId,
  );

  return { pagePath, pageKey, threads: rows.map(mapThreadRow) };
}

export async function upsertThreadOpenState(input: {
  tenantId: string;
  userId: string;
  threadId: string;
  isOpened: boolean;
}) {
  await ensurePageThreadsTables();

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ${THREAD_READ_STATE_TABLE} (
        "id", "tenantId", "appId", "userId", "threadId", "isOpened", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT ("tenantId", "appId", "userId", "threadId")
      DO UPDATE SET
        "isOpened" = EXCLUDED."isOpened",
        "updatedAt" = CURRENT_TIMESTAMP
    `,
    crypto.randomUUID(),
    input.tenantId,
    currentAppConfig.appId,
    input.userId,
    input.threadId,
    input.isOpened,
  );
}

export async function createThread(input: {
  tenantId: string;
  pagePath: string;
  title: string;
  docType?: unknown;
  priority?: unknown;
  labels?: unknown;
  actorUserId: string;
}) {
  const title = input.title.trim();
  if (!title) {
    throw new Error('عنوان گفتگو الزامی است.');
  }

  const { pagePath, pageKey } = normalizePagePath(input.pagePath);
  const docType = normalizeDocTypeTag(input.docType);
  const priority: ThreadPriority = normalizePriority(input.priority);
  const status: ThreadStatus = 'todo';
  const labels = normalizeLabels(input.labels);
  const id = crypto.randomUUID();

  await ensurePageThreadsTables();

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ${THREADS_TABLE} (
        "id","tenantId","appId","pageKey","pagePathSample","title","docType","priority","status","labelsJson","createdById","updatedById"
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `,
    id,
    input.tenantId,
    currentAppConfig.appId,
    pageKey,
    pagePath,
    title,
    docType,
    priority,
    status,
    JSON.stringify(labels),
    input.actorUserId,
    input.actorUserId,
  );

  return { id, pagePath, pageKey };
}

export async function updateThreadMeta(input: {
  tenantId: string;
  threadId: string;
  actorUserId: string;
  title?: unknown;
  docType?: unknown;
  priority?: unknown;
  status?: unknown;
  labels?: unknown;
}) {
  await ensurePageThreadsTables();

  const title = typeof input.title === 'string' ? input.title.trim() : null;
  const docType = input.docType !== undefined ? normalizeDocTypeTag(input.docType) : null;
  const priority = input.priority !== undefined ? normalizePriority(input.priority) : null;
  const status = input.status !== undefined ? normalizeThreadStatus(input.status) : null;
  const labels = input.labels !== undefined ? normalizeLabels(input.labels) : null;

  await prisma.$executeRawUnsafe(
    `
      UPDATE ${THREADS_TABLE}
      SET
        "title" = COALESCE($1, "title"),
        "docType" = COALESCE($2, "docType"),
        "priority" = COALESCE($3, "priority"),
        "status" = COALESCE($4, "status"),
        "labelsJson" = COALESCE($5, "labelsJson"),
        "updatedById" = $6,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $7 AND "appId" = $8
    `,
    title && title.length ? title : null,
    docType,
    priority,
    status,
    labels ? JSON.stringify(labels) : null,
    input.actorUserId,
    input.threadId,
    currentAppConfig.appId,
  );
}

export async function deleteThread(input: { threadId: string }) {
  await ensurePageThreadsTables();

  const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `
      DELETE FROM ${THREADS_TABLE}
      WHERE "id" = $1 AND "appId" = $2
      RETURNING "id"
    `,
    input.threadId,
    currentAppConfig.appId,
  );

  return rows.length > 0;
}

export async function listThreadMessages(input: { threadId: string }) {
  await ensurePageThreadsTables();

  const rows = await prisma.$queryRawUnsafe<MessageRow[]>(
    `
      SELECT
        m."id",
        m."threadId",
        m."messageType",
        m."text",
        m."attachmentDataUrl",
        m."attachmentMimeType",
        m."attachmentName",
        m."attachmentSize",
        m."replyToMessageId",
        m."createdAt",
        author."id" AS "authorId",
        author."fullName" AS "authorFullName",
        author."email" AS "authorEmail",
        reply."id" AS "replyId",
        reply."messageType" AS "replyType",
        reply."text" AS "replyText"
      FROM ${MESSAGES_TABLE} m
      LEFT JOIN "AppUser" author ON author."id" = m."authorUserId"
      LEFT JOIN ${MESSAGES_TABLE} reply ON reply."id" = m."replyToMessageId"
      WHERE m."threadId" = $1
      ORDER BY m."createdAt" ASC
    `,
    input.threadId,
  );

  return rows.map(mapMessageRow);
}

export async function createMessage(input: {
  tenantId: string;
  threadId: string;
  actorUserId: string;
  messageType?: unknown;
  text?: unknown;
  replyToMessageId?: unknown;
  attachment?: {
    dataUrl?: unknown;
    mimeType?: unknown;
    name?: unknown;
    size?: unknown;
  } | null;
}) {
  await ensurePageThreadsTables();

  const messageType: MessageType = normalizeMessageType(input.messageType);
  const text = sanitizeText(input.text);
  const replyToMessageId = typeof input.replyToMessageId === 'string' && input.replyToMessageId.trim() ? input.replyToMessageId.trim() : null;

  const attachmentName = typeof input.attachment?.name === 'string' ? input.attachment?.name.trim().slice(0, 180) : null;
  const attachmentSize = typeof input.attachment?.size === 'number' && Number.isFinite(input.attachment.size) ? Math.max(0, Math.floor(input.attachment.size)) : null;

  let attachmentDataUrl: string | null = null;
  if (messageType === 'image') attachmentDataUrl = sanitizeDataUrl(input.attachment?.dataUrl, 'data:image/');
  if (messageType === 'audio') attachmentDataUrl = sanitizeDataUrl(input.attachment?.dataUrl, 'data:audio/');
  if (messageType === 'pdf') attachmentDataUrl = sanitizeDataUrl(input.attachment?.dataUrl, 'data:application/pdf');

  const attachmentMimeType = typeof input.attachment?.mimeType === 'string' ? input.attachment.mimeType.trim().slice(0, 80) : null;

  if (messageType === 'text' && !text) {
    throw new Error('متن پیام خالی است.');
  }
  if (messageType !== 'text' && !attachmentDataUrl) {
    throw new Error('فایل پیام معتبر نیست یا حجم آن زیاد است.');
  }

  const id = crypto.randomUUID();

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ${MESSAGES_TABLE} (
        "id","threadId","authorUserId","replyToMessageId","messageType","text","attachmentDataUrl","attachmentMimeType","attachmentName","attachmentSize"
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
    id,
    input.threadId,
    input.actorUserId,
    replyToMessageId,
    messageType,
    text,
    attachmentDataUrl,
    attachmentMimeType,
    attachmentName,
    attachmentSize,
  );

  await prisma.$executeRawUnsafe(
    `
      UPDATE ${THREADS_TABLE}
      SET "updatedAt" = CURRENT_TIMESTAMP, "updatedById" = $1
      WHERE "id" = $2 AND "appId" = $3
    `,
    input.actorUserId,
    input.threadId,
    currentAppConfig.appId,
  );

  const rows = await prisma.$queryRawUnsafe<MessageRow[]>(
    `
      SELECT
        m."id",
        m."threadId",
        m."messageType",
        m."text",
        m."attachmentDataUrl",
        m."attachmentMimeType",
        m."attachmentName",
        m."attachmentSize",
        m."replyToMessageId",
        m."createdAt",
        author."id" AS "authorId",
        author."fullName" AS "authorFullName",
        author."email" AS "authorEmail",
        reply."id" AS "replyId",
        reply."messageType" AS "replyType",
        reply."text" AS "replyText"
      FROM ${MESSAGES_TABLE} m
      LEFT JOIN "AppUser" author ON author."id" = m."authorUserId"
      LEFT JOIN ${MESSAGES_TABLE} reply ON reply."id" = m."replyToMessageId"
      WHERE m."id" = $1
      LIMIT 1
    `,
    id,
  );

  return rows[0] ? mapMessageRow(rows[0]) : null;
}

