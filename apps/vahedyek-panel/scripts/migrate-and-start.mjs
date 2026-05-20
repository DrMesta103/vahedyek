import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadLocalEnv() {
  if (process.env.DATABASE_URL) return;
  const envPath = join(appRoot, '.env');
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^DATABASE_URL=(.*)$/);
    if (!match) continue;
    process.env.DATABASE_URL = match[1].trim().replace(/^"|"$/g, '');
    return;
  }
}

function run(command) {
  return spawnSync(command, {
    cwd: appRoot,
    shell: true,
    stdio: 'inherit',
    env: process.env,
  });
}

async function assertMigrationHistoryIsClean() {
  loadLocalEnv();
  const prisma = new PrismaClient();

  try {
    const migrationsDir = join(appRoot, 'prisma', 'migrations');
    const localMigrations = readdirSync(migrationsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    const failed = await prisma.$queryRawUnsafe(`
      SELECT migration_name
      FROM "_prisma_migrations"
      WHERE finished_at IS NULL AND rolled_back_at IS NULL
      ORDER BY started_at
    `);

    if (failed.length > 0) {
      throw new Error(`Prisma migration history has failed migrations: ${failed.map((row) => row.migration_name).join(', ')}`);
    }

    const finished = await prisma.$queryRawUnsafe(
      `
        SELECT DISTINCT migration_name
        FROM "_prisma_migrations"
        WHERE finished_at IS NOT NULL
          AND migration_name = ANY($1)
      `,
      localMigrations,
    );

    const finishedNames = new Set(finished.map((row) => row.migration_name));
    const missing = localMigrations.filter((name) => !finishedNames.has(name));
    if (missing.length > 0) {
      throw new Error(`Prisma migration history is missing local migrations: ${missing.join(', ')}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

const migrate = run('prisma migrate deploy');
if (migrate.status !== 0) {
  console.warn('prisma migrate deploy failed; checking migration history before starting Next.js.');
  try {
    await assertMigrationHistoryIsClean();
    console.warn('Migration history is clean, continuing with next start.');
  } catch (error) {
    console.error(error);
    process.exit(migrate.status ?? 1);
  }
}

const next = run('next start --hostname 0.0.0.0');
process.exit(next.status ?? 1);
