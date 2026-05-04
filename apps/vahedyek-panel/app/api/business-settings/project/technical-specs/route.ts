import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import {
  getTenantProjectSettings,
  normalizeTechnicalSpecs,
  updateTenantProjectSettings,
} from '../_lib/projectSettings';

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const settings = await getTenantProjectSettings(session.tenantId);
    return NextResponse.json({ technicalSpecs: normalizeTechnicalSpecs(settings.projectTechnicalSpecs) });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const payload = normalizeTechnicalSpecs(await request.json());
    await updateTenantProjectSettings(session.tenantId, 'projectTechnicalSpecs', payload);
    return NextResponse.json({ technicalSpecs: payload });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
