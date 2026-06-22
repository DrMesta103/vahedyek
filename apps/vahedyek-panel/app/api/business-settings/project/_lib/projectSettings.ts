import { Prisma } from '@/lib/prisma-client';
import { prisma } from '../../../../lib/prisma';
import { ensureTenantProjectSettingsColumns } from '../../../../lib/tenantProjectSettingsColumns';
import type { TechnicalSpecItem } from '../../../../actions/contractSteps789';

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

export type ProjectTechnicalSpecsPayload = TechnicalSpecItem[];

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

export const ensureProjectSettingsColumns = ensureTenantProjectSettingsColumns;

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

const technicalSpecNoneValue = 'ندارد';

function normalizeTechnicalSpecChoice(value: unknown) {
  return normalizeText(value, 80) || technicalSpecNoneValue;
}

type LegacyProjectTechnicalSpecs = {
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
  items?: unknown;
  specs?: unknown;
};

function normalizeTechnicalSpecItem(input: unknown, index: number): TechnicalSpecItem | null {
  const raw = typeof input === 'object' && input ? (input as Partial<TechnicalSpecItem> & { description?: unknown }) : {};
  const title = normalizeText(raw.title, 100);
  const standard = normalizeText((raw.standard ?? raw.description) as unknown, 240);
  const location = normalizeText(raw.location, 120);
  const normalizedTitle = title || standard || `مشخصه ${index + 1}`;
  if (!normalizedTitle && !standard) return null;

  return {
    id: normalizeText(raw.id, 80) || crypto.randomUUID(),
    title: normalizedTitle,
    standard,
    location,
    systemKey: normalizeText(raw.systemKey, 80) || undefined,
  };
}

function legacyProjectTechnicalSpecsToItems(raw: LegacyProjectTechnicalSpecs): TechnicalSpecItem[] {
  const items: TechnicalSpecItem[] = [];

  const push = (key: string, title: string, standard: unknown, location: string) => {
    const text = normalizeText(standard, 240);
    if (!text || text === technicalSpecNoneValue) return;
    items.push({
      id: `legacy-${key}`,
      title,
      standard: text,
      location,
      systemKey: `legacy-${key}`,
    });
  };

  push('structureSystem', 'سیستم سازه', raw.structureSystem, 'اسکلت و سازه');
  push('facadeMaterial', 'نمای پروژه', raw.facadeMaterial, 'نما');
  push('cabinetType', 'کابینت', raw.cabinetType, 'آشپزخانه');
  push('floorMaterial', 'کف واحد', raw.floorMaterial, 'کف');
  push('coolingSystem', 'سیستم سرمایش', raw.coolingSystem, 'تأسیسات مکانیکی');
  push('heatingSystem', 'سیستم گرمایش', raw.heatingSystem, 'تأسیسات مکانیکی');
  push('windowType', 'پنجره‌ها', raw.windowType, 'بازشوها');
  if (Number(raw.elevatorCount ?? 0) > 0) {
    items.push({
      id: 'legacy-elevatorCount',
      title: 'آسانسور',
      standard: `${Math.max(0, Math.floor(Number(raw.elevatorCount ?? 0)))} دستگاه`,
      location: 'مشاعات',
      systemKey: 'legacy-elevatorCount',
    });
  }
  push('securitySystem', 'سیستم امنیتی', raw.securitySystem, 'مشاعات و امنیت');
  push('fireSystem', 'سیستم حریق', raw.fireSystem, 'ایمنی');
  push('internetStatus', 'زیرساخت اینترنت', raw.internetStatus, 'زیرساخت ارتباطی');
  push('parkingAccess', 'دسترسی پارکینگ', raw.parkingAccess, 'پارکینگ');
  push('technicalNotes', 'توضیحات فنی پروژه', raw.technicalNotes, 'عمومی');

  return items;
}

export function normalizeTechnicalSpecs(input: unknown): ProjectTechnicalSpecsPayload {
  if (Array.isArray(input)) {
    return input.map((item, index) => normalizeTechnicalSpecItem(item, index)).filter((item): item is TechnicalSpecItem => Boolean(item));
  }

  const raw = typeof input === 'object' && input ? (input as LegacyProjectTechnicalSpecs) : {};
  const directItems = Array.isArray(raw.items) ? raw.items : Array.isArray(raw.specs) ? raw.specs : null;
  if (directItems?.length) {
    return directItems.map((item, index) => normalizeTechnicalSpecItem(item, index)).filter((item): item is TechnicalSpecItem => Boolean(item));
  }

  return legacyProjectTechnicalSpecsToItems(raw);
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
