import fs from 'node:fs';
import path from 'node:path';

function readDatabaseUrlFromEnvFile() {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps/taav-ai-lab/.env'),
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

  if (envFileUrl) return envFileUrl;
  if (runtimeUrl) return runtimeUrl;

  throw new Error('Missing DATABASE_URL for taav-ai-lab.');
}

export function applyCurrentDatabaseUrl() {
  process.env.DATABASE_URL = getCurrentDatabaseUrl();
}
