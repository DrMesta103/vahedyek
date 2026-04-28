import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';
import { CONTRACT_RULE_ITEMS, createInitialRuleState, normalizeRuleState } from '../../../lib/businessContractRules';

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const settings = await prisma.tenantContractRuleSettings.findUnique({
      where: { tenantId: session.tenantId },
      select: { rulesPayload: true },
    });

    const payload = settings?.rulesPayload && typeof settings.rulesPayload === 'object' ? settings.rulesPayload : {};

    const rules = Object.fromEntries(
      CONTRACT_RULE_ITEMS.map((item) => [item.id, normalizeRuleState(item.id, (payload as Record<string, unknown>)[item.id])]),
    );

    return NextResponse.json({ rules });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as { rules?: Record<string, unknown> };
    const inputRules = body.rules && typeof body.rules === 'object' ? body.rules : {};
    const rulesPayload = Object.fromEntries(
      CONTRACT_RULE_ITEMS.map((item) => [item.id, normalizeRuleState(item.id, inputRules[item.id] ?? createInitialRuleState(item.id))]),
    );

    await prisma.tenantContractRuleSettings.upsert({
      where: { tenantId: session.tenantId },
      update: { rulesPayload },
      create: { tenantId: session.tenantId, rulesPayload },
    });

    return NextResponse.json({ success: true, rules: rulesPayload });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
