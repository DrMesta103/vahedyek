import crypto from 'node:crypto';
import { currentAppConfig } from '../app/config/current';
import { prisma } from '../app/lib/prisma';
import { normalizePagePath } from '../app/lib/page-docs';
import { ensurePageDocsTables, DOCS_TABLE } from '../app/lib/page-docs-store';
import { ensurePageThreadsTables, MESSAGES_TABLE, THREADS_TABLE } from '../app/lib/page-threads-store';

type DocRow = {
  id: string;
  pagePath: string;
  pageKey: string;
  title: string;
  docType: string;
  contentHtml: string;
  labelsJson: string | null;
  audioDataUrl: string | null;
  audioMimeType: string | null;
  createdById: string;
  updatedById: string;
  createdAt: Date;
  updatedAt: Date;
};

function htmlToPlainText(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

async function main() {
  const limit = Number(process.env.MIGRATE_LIMIT || '200');
  console.log(`Migrating up to ${limit} legacy docs...`);

  await ensurePageDocsTables();
  await ensurePageThreadsTables();

  const docs = await prisma.$queryRawUnsafe<DocRow[]>(
    `
      SELECT
        "id","pagePath","pageKey","title","docType","contentHtml","labelsJson","audioDataUrl","audioMimeType","createdById","updatedById","createdAt","updatedAt"
      FROM ${DOCS_TABLE}
      WHERE "appId" = $1
      ORDER BY "createdAt" ASC
      LIMIT $2
    `,
    currentAppConfig.appId,
    limit,
  );

  let migrated = 0;
  for (const doc of docs) {
    const threadId = crypto.randomUUID();
    const normalized = normalizePagePath(doc.pagePath || '/');

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO ${THREADS_TABLE} (
          "id","appId","pageKey","pagePathSample","title","docType","priority","labelsJson","createdById","updatedById","createdAt","updatedAt"
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `,
      threadId,
      currentAppConfig.appId,
      normalized.pageKey,
      normalized.pagePath,
      doc.title,
      doc.docType || 'free',
      'p2',
      doc.labelsJson || '[]',
      doc.createdById,
      doc.updatedById,
      doc.createdAt,
      doc.updatedAt,
    );

    const text = htmlToPlainText(doc.contentHtml || '');
    if (text) {
      await prisma.$executeRawUnsafe(
        `
          INSERT INTO ${MESSAGES_TABLE} (
            "id","threadId","authorUserId","messageType","text","createdAt"
          )
          VALUES ($1,$2,$3,$4,$5,$6)
        `,
        crypto.randomUUID(),
        threadId,
        doc.createdById,
        'text',
        text.slice(0, 10_000),
        doc.createdAt,
      );
    }

    if (doc.audioDataUrl) {
      await prisma.$executeRawUnsafe(
        `
          INSERT INTO ${MESSAGES_TABLE} (
            "id","threadId","authorUserId","messageType","attachmentDataUrl","attachmentMimeType","attachmentName","createdAt"
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        `,
        crypto.randomUUID(),
        threadId,
        doc.createdById,
        'audio',
        doc.audioDataUrl,
        doc.audioMimeType || 'audio/webm',
        'legacy-voice.webm',
        doc.createdAt,
      );
    }

    migrated += 1;
  }

  console.log(`Done. Migrated ${migrated} docs -> threads.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

