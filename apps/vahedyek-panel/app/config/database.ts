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

  // In local dev we still keep the pool small, but `1` is too restrictive for
  // concurrent page widgets plus route handlers and causes frequent timeouts.
  if (process.env.NODE_ENV === 'development') {
    try {
      const parsed = new URL(url);
      const currentLimit = Number(parsed.searchParams.get('connection_limit') || '0');
      if (!Number.isFinite(currentLimit) || currentLimit < 5) {
        parsed.searchParams.set('connection_limit', '5');
      }
      process.env.DATABASE_URL = parsed.toString();
      return;
    } catch {
      // Non-standard connection string; fallback to raw.
    }
  }

  process.env.DATABASE_URL = url;
}

export const databaseIsolationNote = 'vahedyek-panel reads DATABASE_URL from apps/vahedyek-panel/.env first.';
