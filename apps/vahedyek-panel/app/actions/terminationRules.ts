'use server';

import type { Prisma } from '@prisma/client';
import { getSessionContext } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { buyerRulesPersistedFromTerminationPayload, normalizePersistedBuyerRules } from '../lib/terminationBuyerRules';
import { upsertTerminationBuyerRulesRow } from '../lib/terminationRulesDb';
import type { BuyerRulesPersisted, ContractTerminationData } from '../types/contract';

export async function upsertTerminationBuyerRules(
  draftId: string,
  input: BuyerRulesPersisted,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await getSessionContext();
  if (!session?.tenantId) {
    return { ok: false, message: 'برای ذخیره باید وارد شوید.' };
  }

  const draft = await prisma.contractDraft.findFirst({
    where: { id: draftId, tenantId: session.tenantId },
    select: { id: true },
  });

  if (!draft) {
    return { ok: false, message: 'پیش‌نویس یافت نشد.' };
  }

  const normalized = normalizePersistedBuyerRules(input);
  const buyerRules = (normalized ?? input) as unknown as Prisma.InputJsonValue;

  // Prisma client may not include the model yet (generate/drift),
  // so we upsert with SQL to avoid runtime crashes.
  await upsertTerminationBuyerRulesRow(draftId, buyerRules);

  return { ok: true };
}

/** هم‌تراز با payload کامل مرحلهٔ فسخ (برای فراخوانی از فرم). */
export async function upsertTerminationBuyerRulesFromStepPayload(
  draftId: string,
  payload: Pick<ContractTerminationData, 'buyerTerms' | 'buyerCompletion' | 'terminationBuyerPanel'>,
): Promise<{ ok: true } | { ok: false; message: string }> {
  return upsertTerminationBuyerRules(draftId, buyerRulesPersistedFromTerminationPayload(payload));
}
