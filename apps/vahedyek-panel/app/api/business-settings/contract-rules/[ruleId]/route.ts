import { Prisma } from '@/lib/prisma-client';
import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { normalizeBuilderPenaltyRuleState, validateBuilderPenaltyRuleState } from '../../../../lib/builderPenalty';
import { CONTRACT_RULE_ITEMS, createInitialRuleState, normalizeRuleState, type ContractRuleId } from '../../../../lib/businessContractRules';
import { prisma } from '../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';

function isRuleId(value: string): value is ContractRuleId {
  return CONTRACT_RULE_ITEMS.some((item) => item.id === value);
}

function parsePercentValue(value: string | boolean | undefined) {
  if (typeof value !== 'string') return 0;
  const normalized = Number(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : 0;
}

function getAdjustmentWeightsTotal(values: Record<string, string | boolean>) {
  return (
    parsePercentValue(values.adjustMultiHousingWeight) +
    parsePercentValue(values.adjustMultiLaborWeight) +
    parsePercentValue(values.adjustMultiMaterialWeight) +
    parsePercentValue(values.adjustMultiMaterialsOtherWeight) +
    parsePercentValue(values.adjustMultiWageWeight) +
    parsePercentValue(values.adjustMultiEnergyWeight) +
    parsePercentValue(values.adjustMultiGeneralPriceWeight)
  );
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

    return NextResponse.json(ruleId === 'builder-penalty' ? normalizeBuilderPenaltyRuleState(rule) : rule);
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
    const normalizedBaseRule = normalizeRuleState(ruleId, body);
    const normalizedRule = ruleId === 'builder-penalty' ? normalizeBuilderPenaltyRuleState(normalizedBaseRule) : normalizedBaseRule;

    if (ruleId === 'adjustment' && normalizedRule.activeTab === 'multi-indicator') {
      const total = getAdjustmentWeightsTotal(normalizedRule.values);
      if (total > 100) {
        return NextResponse.json({ message: `جمع درصد شاخص‌های تعدیل ${total}٪ است و نباید از ۱۰۰٪ بیشتر باشد.` }, { status: 400 });
      }
    }

    if (ruleId === 'builder-penalty') {
      const validation = validateBuilderPenaltyRuleState(normalizedRule);
      if (!validation.ok) {
        return NextResponse.json({ message: validation.message }, { status: 400 });
      }
    }

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
