import type { Prisma } from '@/lib/prisma-client';
import { PricingType } from '@/lib/prisma-client';
import {
  BOOTSTRAP_DRAFT_RULE_IDS,
  buildBootstrapDiscountsPayload,
  buildBootstrapFinancialPayload,
  buildBootstrapPenaltiesPayload,
  buildBootstrapRuleState,
} from './contractSettingsBootstrap';
import { CONTRACT_RULE_ITEMS, normalizeRuleState, type ContractRuleId } from './businessContractRules';
import { upsertContractDraftRuleSettingsRow } from './contractDraftRuleSettingsDb';
import { normalizeFinancialCategories, normalizeFinancialDueItems, sortFinancialCategoriesForPersistence } from './financialUtils';
import { prisma } from './prisma';
import { normalizePersistedBuyerRules } from './terminationBuyerRules';
import { upsertTerminationBuyerRulesRow } from './terminationRulesDb';
import { normalizeTerminationPayload } from '../(panel)/contracts/new/_components/termination/terminationDefaults';
import { PENALTY_ITEMS } from '../(panel)/contracts/new/_components/penaltiesConfig';

function toNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim();
    if (!normalized) return 0;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

async function seedFinancial(draftId: string, prepayment: unknown) {
  const payload = buildBootstrapFinancialPayload(
    prepayment && typeof prepayment === 'object'
      ? normalizeRuleState('prepayment', prepayment)
      : null,
  );
  if (!payload) return;

  const categories = normalizeFinancialCategories(payload.categories ?? []);
  const categoryIds = new Set(categories.map((item) => item.id));
  const dueItems = normalizeFinancialDueItems(payload.dueItems ?? [], categoryIds);
  const principal = {
    id: 'principal',
    name: 'مبلغ اصل قرارداد',
    capAmount: 0,
    dueAmount: 0,
    noDueAmount: 0,
    system: true,
    requiresDue: false,
  };
  const categoriesWithPrincipal = sortFinancialCategoriesForPersistence([
    principal,
    ...categories.filter((c) => c.id !== 'principal'),
  ]);

  const financial = await prisma.contractFinancial.upsert({
    where: { draftId },
    update: {
      pricingType: PricingType.fixed,
      fixedTotalAmount: 0,
      activeTab: 'advance',
    },
    create: {
      draftId,
      pricingType: PricingType.fixed,
      fixedTotalAmount: 0,
      activeTab: 'advance',
    },
    select: { id: true },
  });

  await prisma.financialDueItem.deleteMany({ where: { financialId: financial.id } });
  await prisma.financialCategory.deleteMany({ where: { financialId: financial.id } });

  if (categoriesWithPrincipal.length) {
    await prisma.financialCategory.createMany({
      data: categoriesWithPrincipal.map((item) => ({
        id: `${financial.id}:${item.id}`,
        financialId: financial.id,
        name: item.name,
        capAmount: item.capAmount,
        dueAmount: item.dueAmount,
        noDueAmount: item.noDueAmount,
        system: item.system,
        requiresDue: item.requiresDue,
      })),
    });
  }

  if (dueItems.length) {
    await prisma.financialDueItem.createMany({
      data: dueItems.map((item) => ({
        id: `${financial.id}:${item.id}`,
        financialId: financial.id,
        categoryId: `${financial.id}:${item.categoryId}`,
        title: item.title,
        amount: toNumber(item.amount),
        dueDate: item.dueDate,
      })),
    });
  }
}

async function seedPenalties(draftId: string, penaltyRule: unknown) {
  const payload = buildBootstrapPenaltiesPayload(
    penaltyRule && typeof penaltyRule === 'object'
      ? normalizeRuleState('penalty', penaltyRule)
      : null,
  );
  if (!payload) return;

  const penalties = await prisma.contractPenalties.upsert({
    where: { draftId },
    update: {},
    create: { draftId },
    select: { id: true },
  });

  await prisma.contractPenaltyRule.deleteMany({ where: { penaltiesId: penalties.id } });
  await prisma.contractPenaltyType.deleteMany({ where: { penaltiesId: penalties.id } });

  await prisma.contractPenaltyType.createMany({
    data: PENALTY_ITEMS.map((item) => {
      const active = payload.types.find((type) => type.id === item.id)?.active ?? false;
      return {
        id: `${penalties.id}:${item.id}`,
        penaltiesId: penalties.id,
        title: item.title,
        active,
      };
    }),
  });

  if (payload.rules.length) {
    await prisma.contractPenaltyRule.createMany({
      data: payload.rules.map((rule) => ({
        id: `${penalties.id}:${rule.id}`,
        penaltiesId: penalties.id,
        penaltyTypeId: `${penalties.id}:${rule.penaltyTypeId}`,
        mode: rule.mode,
        period: rule.period,
        fixedAmount: toNumber(rule.fixedAmount),
        penaltyPercent: toNumber(rule.penaltyPercent),
        bankInterestPercent: toNumber(rule.bankInterestPercent),
        graceDays: Math.max(0, Math.trunc(toNumber(rule.graceDays))),
        roundRule: rule.roundRule,
        extraFeeEnabled: Boolean(rule.extraFeeEnabled),
        extraFeeType: rule.extraFeeType,
        extraFeeAmount: toNumber(rule.extraFeeAmount),
        extraFeeRoundRule: rule.extraFeeRoundRule,
        progressiveRows: rule.progressiveRows as unknown as Prisma.InputJsonValue,
      })),
    });
  }
}

async function seedTermination(draftId: string, terminationRaw: unknown) {
  const normalized = normalizeTerminationPayload(terminationRaw as never);
  const buyerRules = normalizePersistedBuyerRules({
    buyerTerms: normalized.buyerTerms,
    buyerCompletion: normalized.buyerCompletion,
    terminationBuyerPanel: normalized.terminationBuyerPanel,
  });

  await upsertTerminationBuyerRulesRow(draftId, buyerRules as unknown as Prisma.InputJsonValue);
  await upsertContractDraftRuleSettingsRow(draftId, 'termination', normalized as unknown as Prisma.InputJsonValue);
}

/**
 * Seeds included contract-rule templates into a newly created draft.
 * Excludes: adjustment, additional-costs, loan.
 */
export async function seedDraftFromTenantSettings(tenantId: string, draftId: string) {
  const settings = await prisma.tenantContractRuleSettings.findUnique({
    where: { tenantId },
    select: { rulesPayload: true },
  });

  const payload =
    settings?.rulesPayload && typeof settings.rulesPayload === 'object'
      ? (settings.rulesPayload as Record<string, unknown>)
      : {};

  const rules = Object.fromEntries(
    CONTRACT_RULE_ITEMS.map((item) => [item.id, normalizeRuleState(item.id, payload[item.id])]),
  ) as Record<ContractRuleId, ReturnType<typeof normalizeRuleState>>;

  const terminationRaw = payload['termination-settings'] ?? null;

  await seedFinancial(draftId, rules.prepayment);
  await seedPenalties(draftId, rules.penalty);

  const discounts = buildBootstrapDiscountsPayload(rules.discount);
  if (discounts) {
    await upsertContractDraftRuleSettingsRow(draftId, 'discounts', discounts as unknown as Prisma.InputJsonValue);
  }

  for (const ruleId of BOOTSTRAP_DRAFT_RULE_IDS) {
    const state = buildBootstrapRuleState(ruleId, rules[ruleId]);
    await upsertContractDraftRuleSettingsRow(draftId, ruleId, state as unknown as Prisma.InputJsonValue);
  }

  if (terminationRaw) {
    await seedTermination(draftId, terminationRaw);
  }

  return { seeded: true };
}
