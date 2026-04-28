import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import { CONTRACT_RULE_ITEMS, createInitialRuleState, normalizeRuleState, type ContractRuleId } from '../../../../lib/businessContractRules';

function isRuleId(value: string): value is ContractRuleId {
  return CONTRACT_RULE_ITEMS.some((item) => item.id === value);
}

export async function GET(_: Request, { params }: { params: Promise<{ ruleId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { ruleId } = await params;
    if (!isRuleId(ruleId)) {
      return NextResponse.json({ message: 'شناسه تنظیمات معتبر نیست.' }, { status: 404 });
    }

    const settings = await prisma.tenantContractRuleSettings.findUnique({
      where: { tenantId: session.tenantId },
      select: { rulesPayload: true },
    });

    const payload = settings?.rulesPayload && typeof settings.rulesPayload === 'object' ? settings.rulesPayload : {};
    const rule = normalizeRuleState(ruleId, (payload as Record<string, unknown>)[ruleId]);

    return NextResponse.json(rule);
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ ruleId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { ruleId } = await params;
    if (!isRuleId(ruleId)) {
      return NextResponse.json({ message: 'شناسه تنظیمات معتبر نیست.' }, { status: 404 });
    }

    const body = await request.json();
    const normalizedRule = normalizeRuleState(ruleId, body);

    const current = await prisma.tenantContractRuleSettings.findUnique({
      where: { tenantId: session.tenantId },
      select: { rulesPayload: true },
    });

    const existingRules =
      current?.rulesPayload && typeof current.rulesPayload === 'object'
        ? { ...(current.rulesPayload as Record<string, unknown>) }
        : Object.fromEntries(CONTRACT_RULE_ITEMS.map((item) => [item.id, createInitialRuleState(item.id)]));

    existingRules[ruleId] = normalizedRule;

    await prisma.tenantContractRuleSettings.upsert({
      where: { tenantId: session.tenantId },
      update: { rulesPayload: existingRules as Prisma.InputJsonValue },
      create: { tenantId: session.tenantId, rulesPayload: existingRules as Prisma.InputJsonValue },
    });

    return NextResponse.json({ success: true, rule: normalizedRule });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
