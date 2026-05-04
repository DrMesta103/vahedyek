import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import {
  getTenantProjectSettings,
  normalizeProjectAddress,
  updateTenantProjectSettings,
} from '../_lib/projectSettings';

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const settings = await getTenantProjectSettings(session.tenantId);
    return NextResponse.json({ address: normalizeProjectAddress(settings.projectAddressData) });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const payload = normalizeProjectAddress(await request.json());
    await updateTenantProjectSettings(session.tenantId, 'projectAddressData', payload);
    return NextResponse.json({ address: payload });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
