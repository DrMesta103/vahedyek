export function getCurrentDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL for vahedyek-panel.');
  }

  return process.env.DATABASE_URL;
}

export function applyCurrentDatabaseUrl() {
  process.env.DATABASE_URL = getCurrentDatabaseUrl();
}

export const databaseIsolationNote = 'vahedyek-panel reads DATABASE_URL from apps/vahedyek-panel/.env only.';
