/**
 * @deprecated Runtime persistence moved to PostgreSQL via app/lib/data.ts and repositories.
 * This file is kept for reference and the optional import script (scripts/import-simulator-json.ts).
 * The .simulator/taav-ai-lab.json file is a dev backup only.
 */
import path from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isValidIranMobile, normalizeEmail, parseAuthIdentifier, sanitizeIranMobileInput } from './contact';
import {
  getOcrSampleById,
  type OcrSampleDocument,
  type OcrSampleLane,
  type OcrSimulationStatus,
  type OcrTemplateScenario,
  type OcrTemplateScenarioResult,
  type OcrTemplateOutputField,
  type OcrTemplateOutputResult,
  type OcrTemplateInputSchema,
} from './ocr-simulator-data';

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

export type OcrSimulationSourceType = 'sample' | 'upload';

export type OcrSimulationField = {
  key: string;
  label: string;
  value: string;
};

export type {
  OcrSampleDocument,
  OcrSampleLane,
  OcrSimulationStatus,
  OcrTemplateScenario,
} from './ocr-simulator-data';

export { OCR_SAMPLE_LIBRARY, getOcrSampleById, getOcrSamplesByLane } from './ocr-simulator-data';

export type TaaviaBrand = {
  id: string;
  tenantId: string;
  name: string;
  createdByUserId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OcrSimulationJob = {
  id: string;
  tenantId: string;
  sourceType: OcrSimulationSourceType;
  sourceName: string;
  sourceLabel: string;
  fileType: string;
  fileSize: number | null;
  sampleId: string | null;
  templateId: string | null;
  templateLabel: string | null;
  scenario: OcrTemplateScenario | null;
  status: OcrSimulationStatus;
  progress: number;
  confidence: number;
  pageCount: number;
  tokensUsed: number;
  summary: string;
  previewText: string;
  templateSchema: OcrTemplateInputSchema | null;
  resultJson: OcrTemplateOutputResult | null;
  extractedJson: Record<string, string>;
  extractedFields: OcrSimulationField[];
  warnings: string[];
  error: string | null;
  terminalStatus: 'completed' | 'failed';
  createdAt: string;
  startedAt: string;
  readyAt: string;
  completedAt: string | null;
  updatedAt: string;
};

type SimulatorDatabase = {
  users: SimulatorUser[];
  tenants: Tenant[];
  ocrJobs: OcrSimulationJob[];
  taaviaBrands: TaaviaBrand[];
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

export type CreateTaaviaBrandInput = {
  tenantId: string;
  name: string;
};

export type CreateOcrSimulationInput = {
  tenantId: string;
  sourceType: OcrSimulationSourceType;
  sourceName: string;
  fileType?: string | null;
  fileSize?: number | null;
  sampleId?: string | null;
  templateId?: string | null;
  scenario?: OcrTemplateScenario | null;
  sampleText?: string | null;
};

const DB_DIR = path.join(process.cwd(), '.simulator');
const DB_PATH = path.join(DB_DIR, 'taav-ai-lab.json');

function emptyDatabase(): SimulatorDatabase {
  return { users: [], tenants: [], ocrJobs: [], taaviaBrands: [] };
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
    const ocrJobs: OcrSimulationJob[] = Array.isArray(parsed.ocrJobs)
      ? parsed.ocrJobs.map((job) => ({
          ...job,
          templateSchema: job.templateSchema ?? null,
          resultJson: job.resultJson ?? null,
          extractedJson: job.extractedJson ?? {},
          extractedFields: Array.isArray(job.extractedFields) ? job.extractedFields : [],
          warnings: Array.isArray(job.warnings) ? job.warnings : [],
          error: typeof job.error === 'string' ? job.error : null,
          terminalStatus: job.terminalStatus === 'failed' ? 'failed' : 'completed',
        }) as OcrSimulationJob)
      : [];
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      tenants: Array.isArray(parsed.tenants) ? parsed.tenants : [],
      ocrJobs,
      taaviaBrands: Array.isArray(parsed.taaviaBrands) ? parsed.taaviaBrands : [],
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

function createTaaviaBrandId() {
  return `brand_${randomBytes(8).toString('hex')}`;
}

function createOcrId() {
  return `ocr_${randomBytes(8).toString('hex')}`;
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

function lookupOcrTemplateDocument(templateId?: string | null) {
  if (!templateId) return null;
  return getOcrSampleById(templateId);
}

function classifyUploadedDocument(sourceName: string, contentSnippet?: string | null) {
  const text = `${sourceName} ${contentSnippet ?? ''}`.toLowerCase();

  if (/invoice|factor|فاکتور/.test(text)) return 'invoice';
  if (/contract|agreement|قرارداد/.test(text)) return 'contract';
  if (/id|melli|identity|کارت ملی|شناسنامه/.test(text)) return 'id-card';
  if (/receipt|payment|رسید|پرداخت/.test(text)) return 'receipt';

  return null;
}

function buildGenericOcrPayload(sourceName: string, fileType: string, contentSnippet?: string | null) {
  const trimmedSnippet = (contentSnippet ?? '').trim();
  const previewLines = trimmedSnippet ? trimmedSnippet.split(/\r?\n/).filter(Boolean).slice(0, 5) : [];

  return {
    summary: trimmedSnippet
      ? `نسخه‌ی شبیه‌سازی شده از فایل «${sourceName}» با خواندن متن ورودی ساخته شد.`
      : `فایل «${sourceName}» در حالت شبیه‌سازی OCR پردازش شد و خروجی ساختارمند تولید شد.`,
    previewText: previewLines.length ? previewLines.join('\n') : `Document: ${sourceName}\nType: ${fileType}\nMode: simulated OCR`,
    extractedFields: [
      { key: 'fileName', label: 'نام فایل', value: sourceName },
      { key: 'fileType', label: 'نوع فایل', value: fileType || 'نامشخص' },
      { key: 'mode', label: 'حالت', value: 'شبیه‌سازی Next.js' },
      { key: 'result', label: 'نتیجه', value: 'استخراج ساختارمند' },
    ],
    confidence: trimmedSnippet ? 84 : 74,
    pageCount: 1,
    tokensUsed: trimmedSnippet ? 2600 : 1800,
  };
}

function buildResultFields(template: OcrSampleDocument, result: OcrTemplateOutputResult) {
  const labelByKey = new Map(template.inputSchema.fields.map((field) => [field.key, field.label] as const));
  return result.fields.map<OcrSimulationField>((field: OcrTemplateOutputField) => ({
    key: field.key,
    label: labelByKey.get(field.key) ?? field.key,
    value: field.normalized_value || field.value || '—',
  }));
}

function buildExtractedJson(result: OcrTemplateOutputResult) {
  return Object.fromEntries(result.fields.map((field) => [field.key, field.normalized_value || field.value]));
}

function resolveScenarioResult(template: OcrSampleDocument, scenario: OcrTemplateScenario): OcrTemplateScenarioResult {
  return template.scenarios[scenario] ?? template.scenarios.recognize;
}

function canUseMissScenario(template: OcrSampleDocument, scenario?: OcrTemplateScenario | null) {
  return scenario === 'miss' && Boolean(template.scenarios.miss);
}

function buildOcrJobFromScenario(
  tenantId: string,
  input: CreateOcrSimulationInput,
  sample: OcrSampleDocument,
  sourceType: OcrSimulationSourceType,
  scenario: OcrTemplateScenario,
): OcrSimulationJob {
  const scenarioResult = resolveScenarioResult(sample, scenario);
  const isMiss = canUseMissScenario(sample, scenario);
  const terminalStatus: 'completed' | 'failed' = scenarioResult.result.overall_status === 'failed' || isMiss ? 'failed' : 'completed';
  const now = new Date().toISOString();
  const readyAt = new Date(
    Date.now() + (sourceType === 'sample' ? 2800 : 3200) + Math.round(Math.random() * (isMiss ? 800 : 1200)),
  ).toISOString();
  const fileType = input.fileType?.trim() || sample.fileType;
  const extractedFields = buildResultFields(sample, scenarioResult.result);
  const extractedJson = buildExtractedJson(scenarioResult.result);

  return {
    id: createOcrId(),
    tenantId,
    sourceType,
    sourceName: sourceType === 'sample' ? sample.fileName : input.sourceName || sample.fileName,
    sourceLabel: sourceType === 'sample' ? sample.title : input.sourceName || sample.title,
    fileType,
    fileSize: input.fileSize ?? null,
    sampleId: sample.id,
    templateId: sample.id,
    templateLabel: sample.title,
    scenario: isMiss ? 'miss' : 'recognize',
    status: 'processing',
    progress: sourceType === 'sample' ? 14 : 18,
    confidence: scenarioResult.confidence,
    pageCount: sample.pageCount,
    tokensUsed: scenarioResult.tokensUsed,
    summary: scenarioResult.summary,
    previewText: scenarioResult.previewLines.join('\n'),
    templateSchema: sample.inputSchema,
    resultJson: scenarioResult.result,
    extractedJson,
    extractedFields,
    warnings:
      scenarioResult.warnings.length > 0
        ? scenarioResult.warnings
        : scenarioResult.result.fields.flatMap((field) => field.warnings),
    error: terminalStatus === 'failed' ? scenarioResult.error ?? scenarioResult.result.message ?? 'سند با اطمینان کافی تشخیص داده نشد.' : null,
    terminalStatus,
    createdAt: now,
    startedAt: now,
    readyAt,
    completedAt: null,
    updatedAt: now,
  };
}

function buildOcrJobFromSample(tenantId: string, sample: OcrSampleDocument): OcrSimulationJob {
  return buildOcrJobFromScenario(
    tenantId,
    {
      tenantId,
      sourceType: 'sample',
      sourceName: sample.fileName,
      fileType: sample.fileType,
      sampleId: sample.id,
      templateId: sample.id,
      scenario: 'recognize',
      sampleText: sample.sampleText,
    },
    sample,
    'sample',
    'recognize',
  );
}

function buildOcrJobFromUpload(tenantId: string, input: CreateOcrSimulationInput): OcrSimulationJob {
  const explicitTemplate = lookupOcrTemplateDocument(input.templateId);
  const derivedSampleId = classifyUploadedDocument(input.sourceName, input.sampleText);
  const fallbackTemplate = lookupOcrTemplateDocument(derivedSampleId);
  const template = explicitTemplate ?? fallbackTemplate;

  if (template) {
    const scenario = canUseMissScenario(template, input.scenario) ? 'miss' : 'recognize';
    return buildOcrJobFromScenario(tenantId, input, template, 'upload', scenario);
  }

  const now = new Date().toISOString();
  const readyAt = new Date(Date.now() + 3200 + Math.round(Math.random() * 1400)).toISOString();
  const generic = buildGenericOcrPayload(input.sourceName, input.fileType?.trim() || 'application/octet-stream', input.sampleText);

  return {
    id: createOcrId(),
    tenantId,
    sourceType: 'upload',
    sourceName: input.sourceName,
    sourceLabel: input.sourceName,
    fileType: input.fileType?.trim() || 'application/octet-stream',
    fileSize: input.fileSize ?? null,
    sampleId: null,
    templateId: null,
    templateLabel: null,
    scenario: null,
    status: 'processing',
    progress: 16,
    confidence: generic.confidence,
    pageCount: generic.pageCount,
    tokensUsed: generic.tokensUsed,
    summary: generic.summary,
    previewText: generic.previewText,
    templateSchema: null,
    resultJson: null,
    extractedJson: {
      fileName: input.sourceName,
      fileType: input.fileType?.trim() || 'application/octet-stream',
      mode: 'simulated OCR',
      source: 'upload',
    },
    extractedFields: generic.extractedFields,
    warnings: ['خروجی با منطق شبیه‌سازی تولید شده است.'],
    error: null,
    terminalStatus: 'completed',
    createdAt: now,
    startedAt: now,
    readyAt,
    completedAt: null,
    updatedAt: now,
  };
}

function materializeOcrJob(job: OcrSimulationJob) {
  if (job.status !== 'processing') return false;

  if (Date.now() < new Date(job.readyAt).getTime()) {
    const started = new Date(job.startedAt).getTime();
    const ready = new Date(job.readyAt).getTime();
    const ratio = Math.max(0.1, Math.min(0.95, (Date.now() - started) / Math.max(1, ready - started)));
    job.progress = Math.round(12 + ratio * 80);
    job.updatedAt = new Date().toISOString();
    return true;
  }

  const now = new Date().toISOString();
  job.status = job.terminalStatus;
  job.progress = 100;
  job.completedAt = now;
  job.updatedAt = now;
  return true;
}

function updateTenantFromJob(tenant: Tenant, job: OcrSimulationJob) {
  tenant.ocrTestsCount += 1;
  tenant.usedTokens += job.tokensUsed;
  tenant.lastActivity = job.completedAt ?? job.updatedAt;
  tenant.updatedAt = job.updatedAt;
}

export async function getOcrJobsForTenant(userId: string, tenantId: string): Promise<OcrSimulationJob[]> {
  const database = await readDatabase();
  const ownsTenant = database.tenants.some((tenant) => tenant.id === tenantId && tenant.ownerUserId === userId);
  if (!ownsTenant) return [];

  let changed = false;
  const jobs = database.ocrJobs
    .filter((job) => job.tenantId === tenantId)
    .map((job) => {
      const didChange = materializeOcrJob(job);
      changed = changed || didChange;
      return job;
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (changed) {
    const tenant = database.tenants.find((item) => item.id === tenantId);
    if (tenant) {
      const latestCompleted = jobs.find((job) => job.status === 'completed');
      if (latestCompleted) {
        tenant.lastActivity = latestCompleted.completedAt ?? latestCompleted.updatedAt;
        tenant.updatedAt = latestCompleted.updatedAt;
      }
    }
    await writeDatabase(database);
  }

  return jobs;
}

export async function getOcrJobForTenant(userId: string, tenantId: string, jobId: string): Promise<OcrSimulationJob | null> {
  const jobs = await getOcrJobsForTenant(userId, tenantId);
  return jobs.find((job) => job.id === jobId) ?? null;
}

export async function createOcrJobForTenant(userId: string, input: CreateOcrSimulationInput): Promise<OcrSimulationJob | null> {
  const database = await readDatabase();
  const tenant = database.tenants.find((item) => item.id === input.tenantId && item.ownerUserId === userId);
  if (!tenant) return null;

  const sample = input.sourceType === 'sample' ? lookupOcrTemplateDocument(input.sampleId) : null;
  const job = sample ? buildOcrJobFromSample(input.tenantId, sample) : buildOcrJobFromUpload(input.tenantId, input);

  database.ocrJobs.push(job);
  updateTenantFromJob(tenant, job);
  await writeDatabase(database);
  return job;
}

function userOwnsTenant(database: SimulatorDatabase, userId: string, tenantId: string) {
  return database.tenants.some((tenant) => tenant.id === tenantId && tenant.ownerUserId === userId);
}

export async function getTaaviaBrandsForTenant(userId: string, tenantId: string) {
  const database = await readDatabase();
  if (!userOwnsTenant(database, userId, tenantId)) return [];

  return database.taaviaBrands
    .filter((brand) => brand.tenantId === tenantId && brand.isActive)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getTaaviaBrandForTenant(userId: string, tenantId: string, brandId: string) {
  const database = await readDatabase();
  if (!userOwnsTenant(database, userId, tenantId)) return null;

  return (
    database.taaviaBrands.find(
      (brand) => brand.id === brandId && brand.tenantId === tenantId && brand.isActive,
    ) ?? null
  );
}

export async function createTaaviaBrandForTenant(userId: string, input: CreateTaaviaBrandInput) {
  const database = await readDatabase();
  const tenant = database.tenants.find(
    (item) => item.id === input.tenantId && item.ownerUserId === userId,
  );
  if (!tenant) return null;

  const name = input.name.trim();
  if (!name) return null;

  const now = new Date().toISOString();
  const brand: TaaviaBrand = {
    id: createTaaviaBrandId(),
    tenantId: input.tenantId,
    name,
    createdByUserId: userId,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  database.taaviaBrands.push(brand);
  tenant.lastActivity = now;
  tenant.updatedAt = now;
  await writeDatabase(database);
  return brand;
}
