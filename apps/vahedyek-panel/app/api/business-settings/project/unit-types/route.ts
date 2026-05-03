import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import {
  getTenantProjectSettings,
  normalizeNumber,
  normalizeText,
  normalizeUnitTypes,
  updateTenantProjectSettings,
  type ProjectUnitTypeRecord,
} from '../_lib/projectSettings';

type UnitTypePayload = {
  title?: string;
  unitCount?: number | string;
  bedroomCount?: number | string;
  balconyCount?: number | string;
  area?: number | string;
  usage?: string;
};

function normalizePayload(input: UnitTypePayload, current?: ProjectUnitTypeRecord): ProjectUnitTypeRecord | null {
  const title = normalizeText(input.title, 60);
  const usage = input.usage === 'commercial' || input.usage === 'office' || input.usage === 'parking' ? input.usage : 'residential';
  const area = Math.max(0, normalizeNumber(input.area, 0));
  if (!title || area <= 0) return null;

  return {
    id: current?.id ?? crypto.randomUUID(),
    title,
    unitCount: Math.max(0, Math.floor(normalizeNumber(input.unitCount, 0))),
    bedroomCount: Math.max(0, Math.floor(normalizeNumber(input.bedroomCount, 0))),
    balconyCount: Math.max(0, Math.floor(normalizeNumber(input.balconyCount, 0))),
    area,
    usage,
    createdAt: current?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const settings = await getTenantProjectSettings(session.tenantId);
    return NextResponse.json({ unitTypes: normalizeUnitTypes(settings.projectUnitTypes) });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const payload = (await request.json()) as UnitTypePayload;
    const settings = await getTenantProjectSettings(session.tenantId);
    const unitTypes = normalizeUnitTypes(settings.projectUnitTypes);
    const record = normalizePayload(payload);
    if (!record) return NextResponse.json({ message: 'عنوان، کاربری و متراژ تیپ واحد الزامی است.' }, { status: 400 });

    if (unitTypes.some((item) => item.title === record.title)) {
      return NextResponse.json({ message: 'تیپ واحد با این عنوان قبلاً ثبت شده است.' }, { status: 409 });
    }

    unitTypes.push(record);
    await updateTenantProjectSettings(session.tenantId, 'projectUnitTypes', unitTypes);
    return NextResponse.json({ unitType: record, unitTypes }, { status: 201 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
