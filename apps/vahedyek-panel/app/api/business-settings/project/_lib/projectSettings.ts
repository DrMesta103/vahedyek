import { Prisma } from '@prisma/client';
import { prisma } from '../../../../lib/prisma';

export type ProjectUnitTypeRecord = {
  id: string;
  title: string;
  unitCount: number;
  bedroomCount: number;
  balconyCount: number;
  area: number;
  usage: 'residential' | 'commercial' | 'office' | 'parking';
  createdAt: string;
  updatedAt: string;
};

export type ProjectReportPayload = {
  projectStatus?: string;
  permitStatus?: string;
  physicalProgressPercent?: number;
  financialProgressPercent?: number;
  startDate?: string;
  expectedDeliveryDate?: string;
  activeWorkers?: number;
  soldUnits?: number;
  reservedUnits?: number;
  reportNotes?: string;
};

export type ProjectTechnicalSpecsPayload = {
  structureSystem?: string;
  facadeMaterial?: string;
  cabinetType?: string;
  floorMaterial?: string;
  coolingSystem?: string;
  heatingSystem?: string;
  windowType?: string;
  elevatorCount?: number;
  securitySystem?: string;
  fireSystem?: string;
  internetStatus?: string;
  parkingAccess?: string;
  technicalNotes?: string;
};

export type ProjectAddressPayload = {
  province?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  street?: string;
  alley?: string;
  plaque?: string;
  postalCode?: string;
  addressNotes?: string;
  latitude?: number | string;
  longitude?: number | string;
};

type TenantProjectSettingsRow = {
  projectUnitTypes: unknown;
  projectReportData: unknown;
  projectTechnicalSpecs: unknown;
  projectAddressData: unknown;
};

export async function ensureProjectSettingsColumns() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Tenant"
    ADD COLUMN IF NOT EXISTS "projectUnitTypes" JSONB NOT NULL DEFAULT '[]'::jsonb
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Tenant"
    ADD COLUMN IF NOT EXISTS "projectReportData" JSONB NOT NULL DEFAULT '{}'::jsonb
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Tenant"
    ADD COLUMN IF NOT EXISTS "projectTechnicalSpecs" JSONB NOT NULL DEFAULT '{}'::jsonb
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Tenant"
    ADD COLUMN IF NOT EXISTS "projectAddressData" JSONB NOT NULL DEFAULT '{}'::jsonb
  `);
}

export async function getTenantProjectSettings(tenantId: string) {
  await ensureProjectSettingsColumns();
  const rows = await prisma.$queryRaw<TenantProjectSettingsRow[]>(Prisma.sql`
    SELECT
      "projectUnitTypes",
      "projectReportData",
      "projectTechnicalSpecs",
      "projectAddressData"
    FROM "Tenant"
    WHERE "id" = ${tenantId}
    LIMIT 1
  `);

  return rows[0] ?? {
    projectUnitTypes: [],
    projectReportData: {},
    projectTechnicalSpecs: {},
    projectAddressData: {},
  };
}

export async function updateTenantProjectSettings(
  tenantId: string,
  field: 'projectUnitTypes' | 'projectReportData' | 'projectTechnicalSpecs' | 'projectAddressData',
  value: unknown,
) {
  await ensureProjectSettingsColumns();
  const payload = JSON.stringify(value ?? (field === 'projectUnitTypes' ? [] : {}));
  await prisma.$executeRawUnsafe(
    `UPDATE "Tenant" SET "${field}" = $1::jsonb, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2`,
    payload,
    tenantId,
  );
}

export function normalizeText(value: unknown, max = 120) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function normalizeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeCoordinate(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (Math.abs(parsed) > 180) return null;
  return Number(parsed.toFixed(6));
}

export function normalizeNullableDate(value: unknown) {
  const text = normalizeText(value, 20);
  return text || '';
}

export function normalizeUnitTypes(input: unknown): ProjectUnitTypeRecord[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const raw = item as Partial<ProjectUnitTypeRecord>;
      const usage = raw.usage === 'commercial' || raw.usage === 'office' || raw.usage === 'parking' ? raw.usage : 'residential';
      const title = normalizeText(raw.title, 60);
      if (!title) return null;
      return {
        id: normalizeText(raw.id, 80) || crypto.randomUUID(),
        title,
        unitCount: Math.max(0, Math.floor(normalizeNumber(raw.unitCount, 0))),
        bedroomCount: Math.max(0, Math.floor(normalizeNumber(raw.bedroomCount, 0))),
        balconyCount: Math.max(0, Math.floor(normalizeNumber(raw.balconyCount, 0))),
        area: Math.max(0, normalizeNumber(raw.area, 0)),
        usage,
        createdAt: normalizeText(raw.createdAt, 40) || new Date().toISOString(),
        updatedAt: normalizeText(raw.updatedAt, 40) || new Date().toISOString(),
      } satisfies ProjectUnitTypeRecord;
    })
    .filter((item): item is ProjectUnitTypeRecord => Boolean(item));
}

export function normalizeProjectReport(input: unknown): Required<ProjectReportPayload> {
  const raw = typeof input === 'object' && input ? (input as ProjectReportPayload) : {};
  return {
    projectStatus: normalizeText(raw.projectStatus, 80),
    permitStatus: normalizeText(raw.permitStatus, 80),
    physicalProgressPercent: Math.max(0, Math.min(100, normalizeNumber(raw.physicalProgressPercent, 0))),
    financialProgressPercent: Math.max(0, Math.min(100, normalizeNumber(raw.financialProgressPercent, 0))),
    startDate: normalizeNullableDate(raw.startDate),
    expectedDeliveryDate: normalizeNullableDate(raw.expectedDeliveryDate),
    activeWorkers: Math.max(0, Math.floor(normalizeNumber(raw.activeWorkers, 0))),
    soldUnits: Math.max(0, Math.floor(normalizeNumber(raw.soldUnits, 0))),
    reservedUnits: Math.max(0, Math.floor(normalizeNumber(raw.reservedUnits, 0))),
    reportNotes: normalizeText(raw.reportNotes, 800),
  };
}

export function normalizeTechnicalSpecs(input: unknown): Required<ProjectTechnicalSpecsPayload> {
  const raw = typeof input === 'object' && input ? (input as ProjectTechnicalSpecsPayload) : {};
  return {
    structureSystem: normalizeText(raw.structureSystem, 80),
    facadeMaterial: normalizeText(raw.facadeMaterial, 80),
    cabinetType: normalizeText(raw.cabinetType, 80),
    floorMaterial: normalizeText(raw.floorMaterial, 80),
    coolingSystem: normalizeText(raw.coolingSystem, 80),
    heatingSystem: normalizeText(raw.heatingSystem, 80),
    windowType: normalizeText(raw.windowType, 80),
    elevatorCount: Math.max(0, Math.floor(normalizeNumber(raw.elevatorCount, 0))),
    securitySystem: normalizeText(raw.securitySystem, 80),
    fireSystem: normalizeText(raw.fireSystem, 80),
    internetStatus: normalizeText(raw.internetStatus, 80),
    parkingAccess: normalizeText(raw.parkingAccess, 80),
    technicalNotes: normalizeText(raw.technicalNotes, 800),
  };
}

export function normalizeProjectAddress(input: unknown): Required<ProjectAddressPayload> {
  const raw = typeof input === 'object' && input ? (input as ProjectAddressPayload) : {};
  return {
    province: normalizeText(raw.province, 80),
    city: normalizeText(raw.city, 80),
    district: normalizeText(raw.district, 80),
    neighborhood: normalizeText(raw.neighborhood, 80),
    street: normalizeText(raw.street, 120),
    alley: normalizeText(raw.alley, 120),
    plaque: normalizeText(raw.plaque, 30),
    postalCode: normalizeText(raw.postalCode, 20),
    addressNotes: normalizeText(raw.addressNotes, 800),
    latitude: normalizeCoordinate(raw.latitude) ?? 0,
    longitude: normalizeCoordinate(raw.longitude) ?? 0,
  };
}
