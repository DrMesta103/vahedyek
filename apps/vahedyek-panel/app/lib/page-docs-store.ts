import crypto from 'node:crypto';
import { currentAppConfig } from '../config/current';
import { prisma } from './prisma';
import {
  normalizeDocType,
  safeJsonParseStringArray,
  type PageDocEventRecord,
  type PageDocEventType,
  type PageDocRecord,
} from './page-docs';

export const DOCS_TABLE = '"DevPageDocument"';
export const EVENTS_TABLE = '"DevPageDocumentEvent"';
export const READ_STATE_TABLE = '"DevPageDocumentReadState"';
const PAGE_KEY_INDEX = '"DevPageDocument_tenantId_appId_pageKey_idx"';
const UPDATED_AT_INDEX = '"DevPageDocument_tenantId_appId_updatedAt_idx"';
const EVENTS_INDEX = '"DevPageDocumentEvent_tenantId_appId_createdAt_idx"';
const READ_STATE_UNIQUE_INDEX = '"DevPageDocumentReadState_tenantId_appId_userId_documentId_key"';

type PageDocRow = {
  id: string;
  title: string;
  docType: string;
  contentHtml: string;
  labelsJson: string | null;
  audioDataUrl: string | null;
  audioMimeType: string | null;
  pagePath: string;
  pageKey: string;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean | null;
  authorId: string | null;
  authorFullName: string | null;
  authorEmail: string | null;
  updatedById: string | null;
  updatedByFullName: string | null;
  updatedByEmail: string | null;
};

export type PageDocEventRow = {
  id: string;
  eventType: PageDocEventType;
  docId: string | null;
  docTitle: string | null;
  docType: string | null;
  labelsJson: string | null;
  pagePath: string;
  pageKey: string;
  appId: string;
  details: string | null;
  createdAt: Date;
  isRead: boolean | null;
  actorId: string | null;
  actorFullName: string | null;
  actorEmail: string | null;
};

export async function ensurePageDocsTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${DOCS_TABLE} (
      "id" TEXT PRIMARY KEY,
      "tenantId" TEXT NOT NULL,
      "appId" TEXT NOT NULL DEFAULT '${currentAppConfig.appId}',
      "pagePath" TEXT NOT NULL,
      "pageKey" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "docType" TEXT NOT NULL DEFAULT 'free',
      "contentHtml" TEXT NOT NULL DEFAULT '',
      "labelsJson" TEXT NOT NULL DEFAULT '[]',
      "audioDataUrl" TEXT,
      "audioMimeType" TEXT,
      "createdById" TEXT NOT NULL,
      "updatedById" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DevPageDocument_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT "DevPageDocument_createdById_fkey"
        FOREIGN KEY ("createdById") REFERENCES "AppUser"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
      CONSTRAINT "DevPageDocument_updatedById_fkey"
        FOREIGN KEY ("updatedById") REFERENCES "AppUser"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`ALTER TABLE ${DOCS_TABLE} ADD COLUMN IF NOT EXISTS "appId" TEXT NOT NULL DEFAULT '${currentAppConfig.appId}';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${DOCS_TABLE} ADD COLUMN IF NOT EXISTS "labelsJson" TEXT NOT NULL DEFAULT '[]';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${DOCS_TABLE} ADD COLUMN IF NOT EXISTS "audioDataUrl" TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${DOCS_TABLE} ADD COLUMN IF NOT EXISTS "audioMimeType" TEXT;`);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS ${PAGE_KEY_INDEX}
    ON ${DOCS_TABLE} ("tenantId", "appId", "pageKey");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS ${UPDATED_AT_INDEX}
    ON ${DOCS_TABLE} ("tenantId", "appId", "updatedAt" DESC);
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${EVENTS_TABLE} (
      "id" TEXT PRIMARY KEY,
      "tenantId" TEXT NOT NULL,
      "appId" TEXT NOT NULL DEFAULT '${currentAppConfig.appId}',
      "pagePath" TEXT NOT NULL,
      "pageKey" TEXT NOT NULL,
      "docId" TEXT,
      "docTitle" TEXT,
      "eventType" TEXT NOT NULL,
      "docType" TEXT,
      "labelsJson" TEXT NOT NULL DEFAULT '[]',
      "details" TEXT,
      "actorUserId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DevPageDocumentEvent_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT "DevPageDocumentEvent_actorUserId_fkey"
        FOREIGN KEY ("actorUserId") REFERENCES "AppUser"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`ALTER TABLE ${EVENTS_TABLE} ADD COLUMN IF NOT EXISTS "appId" TEXT NOT NULL DEFAULT '${currentAppConfig.appId}';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${EVENTS_TABLE} ADD COLUMN IF NOT EXISTS "docType" TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${EVENTS_TABLE} ADD COLUMN IF NOT EXISTS "labelsJson" TEXT NOT NULL DEFAULT '[]';`);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS ${EVENTS_INDEX}
    ON ${EVENTS_TABLE} ("tenantId", "appId", "createdAt" DESC);
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${READ_STATE_TABLE} (
      "id" TEXT PRIMARY KEY,
      "tenantId" TEXT NOT NULL,
      "appId" TEXT NOT NULL DEFAULT '${currentAppConfig.appId}',
      "userId" TEXT NOT NULL,
      "documentId" TEXT NOT NULL,
      "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DevPageDocumentReadState_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT "DevPageDocumentReadState_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "AppUser"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`ALTER TABLE ${READ_STATE_TABLE} ADD COLUMN IF NOT EXISTS "appId" TEXT NOT NULL DEFAULT '${currentAppConfig.appId}';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE ${READ_STATE_TABLE} ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT FALSE;`);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS ${READ_STATE_UNIQUE_INDEX}
    ON ${READ_STATE_TABLE} ("tenantId", "appId", "userId", "documentId");
  `);
}

export async function logPageDocEvent(input: {
  tenantId: string;
  actorUserId: string;
  pagePath: string;
  pageKey: string;
  docId?: string | null;
  docTitle?: string | null;
  eventType: PageDocEventType;
  docType?: string | null;
  labels?: string[];
  details?: string | null;
}) {
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ${EVENTS_TABLE} (
        "id", "tenantId", "appId", "pagePath", "pageKey", "docId", "docTitle", "eventType", "docType", "labelsJson", "details", "actorUserId"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `,
    crypto.randomUUID(),
    input.tenantId,
    currentAppConfig.appId,
    input.pagePath,
    input.pageKey,
    input.docId ?? null,
    input.docTitle ?? null,
    input.eventType,
    input.docType ?? null,
    JSON.stringify(input.labels ?? []),
    input.details ?? null,
    input.actorUserId,
  );
}

export async function upsertDocReadState(input: {
  tenantId: string;
  userId: string;
  documentId: string;
  isRead: boolean;
}) {
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ${READ_STATE_TABLE} (
        "id", "tenantId", "appId", "userId", "documentId", "isRead", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT ("tenantId", "appId", "userId", "documentId")
      DO UPDATE SET
        "isRead" = EXCLUDED."isRead",
        "updatedAt" = CURRENT_TIMESTAMP
    `,
    crypto.randomUUID(),
    input.tenantId,
    currentAppConfig.appId,
    input.userId,
    input.documentId,
    input.isRead,
  );
}

export function mapRowToRecord(row: PageDocRow): PageDocRecord {
  return {
    id: row.id,
    title: row.title,
    docType: normalizeDocType(row.docType),
    contentHtml: row.contentHtml,
    labels: safeJsonParseStringArray(row.labelsJson),
    audioDataUrl: row.audioDataUrl,
    audioMimeType: row.audioMimeType,
    pagePath: row.pagePath,
    pageKey: row.pageKey,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    isRead: Boolean(row.isRead),
    author: row.authorId
      ? {
          id: row.authorId,
          fullName: row.authorFullName ?? 'کاربر نامشخص',
          email: row.authorEmail ?? '',
        }
      : null,
    updatedBy: row.updatedById
      ? {
          id: row.updatedById,
          fullName: row.updatedByFullName ?? 'کاربر نامشخص',
          email: row.updatedByEmail ?? '',
        }
      : null,
  };
}

export function mapEventRowToRecord(row: PageDocEventRow): PageDocEventRecord {
  return {
    id: row.id,
    eventType: row.eventType,
    docId: row.docId,
    docTitle: row.docTitle,
    docType: row.docType ? normalizeDocType(row.docType) : null,
    labels: safeJsonParseStringArray(row.labelsJson),
    pagePath: row.pagePath,
    pageKey: row.pageKey,
    appId: row.appId,
    details: row.details,
    createdAt: row.createdAt.toISOString(),
    isRead: row.docId ? Boolean(row.isRead) : null,
    actor: row.actorId
      ? {
          id: row.actorId,
          fullName: row.actorFullName ?? 'کاربر نامشخص',
          email: row.actorEmail ?? '',
        }
      : null,
  };
}
