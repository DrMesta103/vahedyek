import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import { normalizeTerminationPayload } from '../../../../(panel)/contracts/new/_components/termination/terminationDefaults';

const TERMINATION_SETTINGS_KEY = 'termination-settings';

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const settings = await prisma.tenantContractRuleSettings.findUnique({
      where: { tenantId: session.tenantId },
      select: { rulesPayload: true },
    });

    const payload = settings?.rulesPayload && typeof settings.rulesPayload === 'object' ? settings.rulesPayload : {};
    const terminationSettings = normalizeTerminationPayload((payload as Record<string, unknown>)[TERMINATION_SETTINGS_KEY] as Record<string, unknown> | null);

    return NextResponse.json(terminationSettings);
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const normalizedTerminationSettings = normalizeTerminationPayload(body as Record<string, unknown>);

    const current = await prisma.tenantContractRuleSettings.findUnique({
      where: { tenantId: session.tenantId },
      select: { rulesPayload: true },
    });

    const existingRules =
      current?.rulesPayload && typeof current.rulesPayload === 'object' ? { ...(current.rulesPayload as Record<string, unknown>) } : {};

    existingRules[TERMINATION_SETTINGS_KEY] = normalizedTerminationSettings;

    await prisma.tenantContractRuleSettings.upsert({
      where: { tenantId: session.tenantId },
      update: { rulesPayload: existingRules as Prisma.InputJsonValue },
      create: { tenantId: session.tenantId, rulesPayload: existingRules as Prisma.InputJsonValue },
    });

    return NextResponse.json({ success: true, terminationSettings: normalizedTerminationSettings });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
