import { NextResponse } from 'next/server';
import { getActorName, recordAuditLog } from '../../../../../lib/audit-log';
import { requireSessionContext } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';
import {
  normalizeProgressiveRows as normalizeProgressivePenaltyRows,
  validateProgressiveRows,
} from '../../../../../lib/progressivePenalty';
import { PENALTY_ITEMS } from '../../../../../(panel)/contracts/new/_components/penaltiesConfig';

type PenaltyMode = 'fixed' | 'overdue' | 'contract' | 'progressive';
type PenaltyPeriod = 'daily' | 'monthly' | 'yearly';
type ExtraFeeType = 'percent' | 'fixed';
type RoundRule = '00' | '0' | '100' | '1000';

type ProgressiveRow = {
  id: string;
  fromDay: string;
  toDay: string;
  rate: string;
  openEnded?: boolean;
};

function buildScopedId(penaltiesId: string, rawId: string) {
  return `${penaltiesId}:${rawId}`;
}

function unwrapScopedId(penaltiesId: string, rawId: string) {
  const prefix = `${penaltiesId}:`;
  return rawId.startsWith(prefix) ? rawId.slice(prefix.length) : rawId;
}

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

function toInteger(value: unknown) {
  return Math.max(0, Math.trunc(toNumber(value)));
}

function normalizeMode(value: unknown): PenaltyMode {
  return value === 'overdue' || value === 'contract' || value === 'progressive' ? value : 'fixed';
}

function normalizePeriod(value: unknown): PenaltyPeriod {
  return value === 'daily' || value === 'yearly' ? value : 'monthly';
}

function normalizeExtraFeeType(value: unknown): ExtraFeeType {
  return value === 'fixed' ? 'fixed' : 'percent';
}

function normalizeRoundRule(value: unknown): RoundRule {
  if (value === '00' || value === '0' || value === '100' || value === '1000') return value;
  if (value === '0.5') return '00';
  if (value === '5') return '0';
  return '100';
}

function normalizeProgressiveRows(rows: unknown): ProgressiveRow[] {
  if (!Array.isArray(rows)) return [];

  return normalizeProgressivePenaltyRows(
    rows.map((row, index) => {
      const current = row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
      return {
        id: typeof current.id === 'string' && current.id.trim() ? current.id : `row-${index + 1}`,
        fromDay: String(current.fromDay ?? ''),
        toDay: String(current.toDay ?? ''),
        rate: String(current.rate ?? ''),
        openEnded: Boolean(current.openEnded),
      };
    }),
  );
}

function normalizeTypes(rawTypes: unknown) {
  const input = Array.isArray(rawTypes) ? rawTypes : [];
  const inputMap = new Map(
    input
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && typeof item.id === 'string')
      .map((item) => [item.id as string, item]),
  );

  return PENALTY_ITEMS.map((item) => {
    const inputItem = inputMap.get(item.id) as { active?: unknown } | undefined;

    return ({
    id: item.id,
    title: item.title,
    description: item.description,
    active: Boolean(inputItem?.active),
  });
  });
}

function normalizeRules(rawRules: unknown, validTypeIds: Set<string>) {
  const input = Array.isArray(rawRules) ? rawRules : [];

  return input
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item, index) => {
      const penaltyTypeId = typeof item.penaltyTypeId === 'string' ? item.penaltyTypeId : '';
      return {
        id: typeof item.id === 'string' && item.id.trim() ? item.id : `rule-${index + 1}`,
        penaltyTypeId,
        mode: normalizeMode(item.mode),
        period: normalizePeriod(item.period),
        fixedAmount: toNumber(item.fixedAmount),
        penaltyPercent: toNumber(item.penaltyPercent),
        bankInterestPercent: toNumber(item.bankInterestPercent),
        graceDays: toInteger(item.graceDays),
        roundRule: normalizeRoundRule(item.roundRule),
        extraFeeEnabled: Boolean(item.extraFeeEnabled),
        extraFeeType: normalizeExtraFeeType(item.extraFeeType),
        extraFeeAmount: toNumber(item.extraFeeAmount),
        extraFeeRoundRule: normalizeRoundRule(item.extraFeeRoundRule),
        progressiveRows: normalizeProgressiveRows(item.progressiveRows),
      };
    })
    .filter((item) => validTypeIds.has(item.penaltyTypeId));
}

export async function GET(_: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.findFirst({
      where: { id: draftId, tenantId: session.tenantId },
      select: { id: true },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این تننت پیدا نشد.' }, { status: 404 });
    }

    const penalties = await prisma.contractPenalties.findUnique({
      where: { draftId },
      include: {
        types: { orderBy: { title: 'asc' } },
        rules: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
      },
    });

    if (!penalties) {
      return NextResponse.json({
        activeTab: PENALTY_ITEMS[0]?.id ?? '',
        types: PENALTY_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          active: false,
        })),
        rules: [],
      });
    }

    const storedTypes = new Map(
      penalties.types.map((item) => [
        unwrapScopedId(penalties.id, item.id),
        { active: item.active, title: item.title },
      ]),
    );

    const types = PENALTY_ITEMS.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      active: storedTypes.get(item.id)?.active ?? false,
    }));

    const validTypeIds = new Set(types.map((item) => item.id));
    const rules = penalties.rules
      .map((item) => ({
        id: unwrapScopedId(penalties.id, item.id),
        penaltyTypeId: unwrapScopedId(penalties.id, item.penaltyTypeId),
        mode: normalizeMode(item.mode),
        period: normalizePeriod(item.period),
        fixedAmount: String(Number(item.fixedAmount ?? 0)),
        penaltyPercent: String(Number(item.penaltyPercent ?? 0)),
        bankInterestPercent: String(Number(item.bankInterestPercent ?? 0)),
        graceDays: String(item.graceDays ?? 0),
        roundRule: normalizeRoundRule(item.roundRule),
        extraFeeEnabled: item.extraFeeEnabled,
        extraFeeType: normalizeExtraFeeType(item.extraFeeType),
        extraFeeAmount: String(Number(item.extraFeeAmount ?? 0)),
        extraFeeRoundRule: normalizeRoundRule(item.extraFeeRoundRule),
        progressiveRows: normalizeProgressiveRows(item.progressiveRows),
      }))
      .filter((item) => validTypeIds.has(item.penaltyTypeId));

    const firstActiveTypeId = types.find((item) => item.active)?.id ?? PENALTY_ITEMS[0]?.id ?? '';

    return NextResponse.json({
      activeTab: firstActiveTypeId,
      types,
      rules,
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.findFirst({
      where: { id: draftId, tenantId: session.tenantId },
      select: { id: true, approvalInstance: { select: { status: true } } },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این تننت پیدا نشد.' }, { status: 404 });
    }

    if (draft.approvalInstance?.status === 'IN_REVIEW') {
      return NextResponse.json({ message: 'این پیش‌نویس در فرایند تأیید است و امکان ویرایش ندارد.' }, { status: 409 });
    }

    const body = await request.json();
    const types = normalizeTypes(body.types);
    const validTypeIds = new Set(types.map((item) => item.id));
    const rules = normalizeRules(body.rules, validTypeIds);
    const activeTypes = types.filter((item) => item.active);

    for (const type of activeTypes) {
      if (!rules.some((item) => item.penaltyTypeId === type.id)) {
        return NextResponse.json(
          { message: `برای «${type.title}» باید حداقل یک جریمه ثبت شود.` },
          { status: 400 },
        );
      }
    }

    for (const rule of rules) {
      if (rule.mode !== 'progressive') continue;
      const validation = validateProgressiveRows(rule.progressiveRows);
      if (!validation.ok) {
        return NextResponse.json({ message: validation.message }, { status: 400 });
      }
      rule.progressiveRows = validation.rows;
    }

    const penalties = await prisma.contractPenalties.upsert({
      where: { draftId },
      update: {},
      create: { draftId },
      select: { id: true },
    });

    await prisma.contractPenaltyRule.deleteMany({
      where: { penaltiesId: penalties.id },
    });

    await prisma.contractPenaltyType.deleteMany({
      where: { penaltiesId: penalties.id },
    });

    if (types.length) {
      await prisma.contractPenaltyType.createMany({
        data: types.map((item) => ({
          id: buildScopedId(penalties.id, item.id),
          penaltiesId: penalties.id,
          title: item.title,
          active: item.active,
        })),
      });
    }

    if (rules.length) {
      await prisma.contractPenaltyRule.createMany({
        data: rules.map((item) => ({
          id: buildScopedId(penalties.id, item.id),
          penaltiesId: penalties.id,
          penaltyTypeId: buildScopedId(penalties.id, item.penaltyTypeId),
          mode: item.mode,
          period: item.period,
          fixedAmount: item.fixedAmount,
          penaltyPercent: item.penaltyPercent,
          bankInterestPercent: item.bankInterestPercent,
          graceDays: item.graceDays,
          roundRule: item.roundRule,
          extraFeeEnabled: item.extraFeeEnabled,
          extraFeeType: item.extraFeeType,
          extraFeeAmount: item.extraFeeAmount,
          extraFeeRoundRule: item.extraFeeRoundRule,
          progressiveRows: item.progressiveRows,
        })),
      });
    }
    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'contract.penalties.update',
      entityType: 'contract_draft',
      entityId: draftId,
      entityLabel: `پیش‌نویس ${draftId}`,
      summary: `${getActorName(session)} جرائم قرارداد را ویرایش کرد.`,
      details: { typesCount: types.length, rulesCount: rules.length },
      diff: [
        { field: 'typesCount', label: 'تعداد انواع جریمه', before: 'نامشخص', after: String(types.length) },
        { field: 'rulesCount', label: 'تعداد قواعد جریمه', before: 'نامشخص', after: String(rules.length) },
      ],
      request,
    });

    return NextResponse.json({
      success: true,
      meta: {
        typesCount: types.length,
        rulesCount: rules.length,
      },
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
