import fs from 'node:fs';
import path from 'node:path';

function readDatabaseUrlFromEnvFile() {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps/vahedyek-panel/.env'),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const line = content
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith('DATABASE_URL='));

    if (!line) continue;

    const rawValue = line.slice('DATABASE_URL='.length).trim();
    return rawValue.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }

  return null;
}

export function getCurrentDatabaseUrl() {
  const envFileUrl = readDatabaseUrlFromEnvFile();
  const runtimeUrl = process.env.DATABASE_URL;

  if (envFileUrl) {
    return envFileUrl;
  }

  if (runtimeUrl) {
    return runtimeUrl;
  }

  throw new Error('Missing DATABASE_URL for vahedyek-panel.');
}

export function applyCurrentDatabaseUrl() {
  const url = getCurrentDatabaseUrl();

  // In local dev we prefer a very small pool to avoid exhausting Postgres connections
  // (Turbopack/fast refresh can otherwise create spikes).
  if (process.env.NODE_ENV === 'development') {
    try {
      const parsed = new URL(url);
      const hasLimit = parsed.searchParams.has('connection_limit');
      if (!hasLimit) parsed.searchParams.set('connection_limit', '1');
      process.env.DATABASE_URL = parsed.toString();
      return;
    } catch {
      // Non-standard connection string; fallback to raw.
    }
  }

  process.env.DATABASE_URL = url;
}

export const databaseIsolationNote = 'vahedyek-panel reads DATABASE_URL from apps/vahedyek-panel/.env first.';
