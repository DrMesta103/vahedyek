import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { isValidIranMobile, normalizeEmail, parseAuthIdentifier, sanitizeIranMobileInput } from './contact';

export type SimulatorUser = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
};

export type Tenant = {
  id: string;
  ownerUserId: string;
  name: string;
  slug?: string;
  brandCode?: string;
  packageKey?: string | null;
  billingCycle?: 'monthly' | 'yearly' | null;
  logoUrl: string;
  tokenLimit: number;
  usedTokens: number;
  ocrTestsCount: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
};

type SimulatorDatabase = {
  users: SimulatorUser[];
  tenants: Tenant[];
};

export type CreateSimulatorUserInput = {
  firstName: string;
  lastName: string;
  identifier: string;
  mobile?: string;
  password: string;
};

export type CreateTenantInput = {
  name: string;
  logoUrl: string;
  tokenLimit: number;
  slug?: string;
  brandCode?: string;
  packageKey?: string | null;
  billingCycle?: 'monthly' | 'yearly' | null;
};

const DB_DIR = path.join(process.cwd(), '.simulator');
const DB_PATH = path.join(DB_DIR, 'taav-ai-lab.json');

function emptyDatabase(): SimulatorDatabase {
  return { users: [], tenants: [] };
}

async function ensureDatabaseFile() {
  await mkdir(DB_DIR, { recursive: true });

  try {
    await readFile(DB_PATH, 'utf8');
  } catch {
    await writeFile(DB_PATH, JSON.stringify(emptyDatabase(), null, 2), 'utf8');
  }
}

async function readDatabase() {
  await ensureDatabaseFile();

  try {
    const raw = await readFile(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SimulatorDatabase>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      tenants: Array.isArray(parsed.tenants) ? parsed.tenants : [],
    } satisfies SimulatorDatabase;
  } catch {
    return emptyDatabase();
  }
}

async function writeDatabase(database: SimulatorDatabase) {
  await ensureDatabaseFile();
  await writeFile(DB_PATH, JSON.stringify(database, null, 2), 'utf8');
}

function createId(prefix: 'user' | 'tenant') {
  return `${prefix}_${randomBytes(8).toString('hex')}`;
}

export function hashPassword(password: string, salt?: string) {
  const passwordSalt = salt ?? randomBytes(16).toString('hex');
  const passwordHash = scryptSync(password, passwordSalt, 64).toString('hex');
  return { passwordHash, passwordSalt };
}

export function verifyPassword(password: string, passwordHash: string, passwordSalt: string) {
  const calculated = scryptSync(password, passwordSalt, 64);
  const existing = Buffer.from(passwordHash, 'hex');
  return existing.length === calculated.length && timingSafeEqual(existing, calculated);
}

export async function getUserByEmail(email: string) {
  const database = await readDatabase();
  const normalizedEmail = normalizeEmail(email);
  return database.users.find((user) => user.email === normalizedEmail) ?? null;
}

export async function getUserById(userId: string) {
  const database = await readDatabase();
  return database.users.find((user) => user.id === userId) ?? null;
}

export async function getUserByIdentifier(identifier: string) {
  const parsed = parseAuthIdentifier(identifier);
  if (parsed.type === 'email') {
    return getUserByEmail(parsed.value);
  }

  if (parsed.type === 'mobile') {
    const database = await readDatabase();
    return database.users.find((user) => user.mobile === parsed.value) ?? null;
  }

  return null;
}

export async function createSimulatorUser(input: CreateSimulatorUserInput) {
  const database = await readDatabase();
  const now = new Date().toISOString();
  const fullName = [input.firstName, input.lastName].filter(Boolean).join(' ').trim();
  const identifier = parseAuthIdentifier(input.identifier);
  const mobile = sanitizeIranMobileInput(input.mobile ?? '');
  const { passwordHash, passwordSalt } = hashPassword(input.password);
  const email = identifier.type === 'email' ? identifier.value : null;
  const normalizedMobile = identifier.type === 'mobile' ? identifier.value : isValidIranMobile(mobile) ? mobile : null;

  const user: SimulatorUser = {
    id: createId('user'),
    fullName,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email,
    mobile: normalizedMobile,
    passwordHash,
    passwordSalt,
    createdAt: now,
    updatedAt: now,
  };

  database.users.push(user);
  await writeDatabase(database);
  return user;
}

export async function getTenantsForUser(userId: string) {
  const database = await readDatabase();
  return database.tenants
    .filter((tenant) => tenant.ownerUserId === userId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getSuggestedBusinessNames(limit = 12) {
  const database = await readDatabase();
  return Array.from(new Set(database.tenants.map((tenant) => tenant.name))).slice(0, limit);
}

export async function getTenantForUser(userId: string, tenantId: string) {
  const tenants = await getTenantsForUser(userId);
  return tenants.find((tenant) => tenant.id === tenantId) ?? null;
}

export async function createTenantForUser(userId: string, input: CreateTenantInput) {
  const database = await readDatabase();
  const now = new Date().toISOString();

  const tenant: Tenant = {
    id: createId('tenant'),
    ownerUserId: userId,
    name: input.name.trim(),
    slug: input.slug?.trim() || undefined,
    brandCode: input.brandCode?.trim() || undefined,
    packageKey: input.packageKey ?? null,
    billingCycle: input.billingCycle ?? null,
    logoUrl: input.logoUrl.trim(),
    tokenLimit: input.tokenLimit,
    usedTokens: 0,
    ocrTestsCount: 0,
    lastActivity: now,
    createdAt: now,
    updatedAt: now,
  };

  database.tenants.push(tenant);
  await writeDatabase(database);
  return tenant;
}
