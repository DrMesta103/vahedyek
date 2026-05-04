import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../../lib/auth';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';
import {
  getTenantProjectSettings,
  normalizeNumber,
  normalizeText,
  normalizeUnitTypes,
  updateTenantProjectSettings,
  type ProjectUnitTypeRecord,
} from '../../_lib/projectSettings';

type UnitTypePayload = {
  title?: string;
  unitCount?: number | string;
  bedroomCount?: number | string;
  balconyCount?: number | string;
  area?: number | string;
  usage?: string;
};

function normalizePayload(input: UnitTypePayload, current: ProjectUnitTypeRecord): ProjectUnitTypeRecord | null {
  const title = normalizeText(input.title, 60);
  const usage = input.usage === 'commercial' || input.usage === 'office' || input.usage === 'parking' ? input.usage : 'residential';
  const area = Math.max(0, normalizeNumber(input.area, 0));
  if (!title || area <= 0) return null;

  return {
    ...current,
    title,
    unitCount: Math.max(0, Math.floor(normalizeNumber(input.unitCount, 0))),
    bedroomCount: Math.max(0, Math.floor(normalizeNumber(input.bedroomCount, 0))),
    balconyCount: Math.max(0, Math.floor(normalizeNumber(input.balconyCount, 0))),
    area,
    usage,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ typeId: string }> }) {
  try {
    const { typeId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const settings = await getTenantProjectSettings(session.tenantId);
    const unitType = normalizeUnitTypes(settings.projectUnitTypes).find((item) => item.id === typeId);
    if (!unitType) return NextResponse.json({ message: 'تیپ واحد پیدا نشد.' }, { status: 404 });

    return NextResponse.json({ unitType });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ typeId: string }> }) {
  try {
    const { typeId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const payload = (await request.json()) as UnitTypePayload;
    const settings = await getTenantProjectSettings(session.tenantId);
    const unitTypes = normalizeUnitTypes(settings.projectUnitTypes);
    const current = unitTypes.find((item) => item.id === typeId);
    if (!current) return NextResponse.json({ message: 'تیپ واحد پیدا نشد.' }, { status: 404 });

    const next = normalizePayload(payload, current);
    if (!next) return NextResponse.json({ message: 'عنوان، کاربری و متراژ تیپ واحد الزامی است.' }, { status: 400 });
    if (unitTypes.some((item) => item.id !== typeId && item.title === next.title)) {
      return NextResponse.json({ message: 'تیپ واحد با این عنوان قبلاً ثبت شده است.' }, { status: 409 });
    }

    const updated = unitTypes.map((item) => (item.id === typeId ? next : item));
    await updateTenantProjectSettings(session.tenantId, 'projectUnitTypes', updated);
    return NextResponse.json({ unitType: next, unitTypes: updated });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ typeId: string }> }) {
  try {
    const { typeId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const settings = await getTenantProjectSettings(session.tenantId);
    const unitTypes = normalizeUnitTypes(settings.projectUnitTypes);
    const next = unitTypes.filter((item) => item.id !== typeId);
    if (next.length === unitTypes.length) return NextResponse.json({ message: 'تیپ واحد پیدا نشد.' }, { status: 404 });

    await updateTenantProjectSettings(session.tenantId, 'projectUnitTypes', next);
    return NextResponse.json({ success: true, unitTypes: next });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
