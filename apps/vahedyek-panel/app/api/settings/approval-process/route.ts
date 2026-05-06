import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { requireBusinessOwner } from '../../../lib/access-control';
import { handlePrismaApiError } from '../../../lib/prismaApiError';
import { fetchTenantApprovalProcessConfigRaw, replaceTenantApprovalProcessConfigRaw } from '../../../lib/tenantApprovalProcessDb';
import {
  APPROVAL_USAGE_KEYS,
  type ApprovalUsageKey,
  type TenantApprovalProcessConfig,
  type TenantApprovalStage,
} from '../../../lib/contractApprovalAccess';

function sanitizeStage(raw: unknown, index: number): TenantApprovalStage | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const employeeId = String(o.employeeId ?? '').trim();
  const title = String(o.title ?? '').trim();
  const id = String(o.id ?? '').trim() || `stage-${index}-${Date.now().toString(36)}`;
  const roleRaw = String(o.role ?? 'controller');
  const role =
    roleRaw === 'intermediate' || roleRaw === 'final' || roleRaw === 'controller' ? roleRaw : ('controller' as const);

  if (!employeeId || !title) return null;
  return { id, title, role, employeeId };
}

function sanitizeUsageBlock(raw: unknown): { buyerShouldApprove: boolean; stages: TenantApprovalStage[] } {
  if (!raw || typeof raw !== 'object') {
    return { buyerShouldApprove: true, stages: [] };
  }
  const o = raw as Record<string, unknown>;
  const buyerShouldApprove = Boolean(o.buyerShouldApprove);
  const stagesRaw = Array.isArray(o.stages) ? o.stages : [];
  const stages = stagesRaw.slice(0, 40).map((s, i) => sanitizeStage(s, i)).filter(Boolean) as TenantApprovalStage[];
  return { buyerShouldApprove, stages };
}

function sanitizeFullConfig(input: unknown): TenantApprovalProcessConfig {
  const out: TenantApprovalProcessConfig = {};
  if (!input || typeof input !== 'object') return out;
  const src = input as Record<string, unknown>;
  for (const key of APPROVAL_USAGE_KEYS) {
    if (key in src) {
      const block = sanitizeUsageBlock(src[key]);
      out[key] = block;
    }
  }
  return out;
}

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const rawCfg = await fetchTenantApprovalProcessConfigRaw(session.tenantId);
    const cfg = sanitizeFullConfig(rawCfg ?? {});
    return NextResponse.json({ config: cfg });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const ok = await requireBusinessOwner(session.userId, session.tenantId);
    if (!ok) {
      return NextResponse.json({ message: 'تنها مالک کسب‌وکار می‌تواند مسیر تأیید را ویرایش کند.' }, { status: 403 });
    }

    const body = (await request.json()) as { usageType?: string; block?: unknown };
    const usageType = body.usageType?.trim() as ApprovalUsageKey | undefined;
    if (!usageType || !(APPROVAL_USAGE_KEYS as readonly string[]).includes(usageType)) {
      return NextResponse.json({ message: 'نوع کاربری نامعتبر است.' }, { status: 400 });
    }

    const rawPrev = await fetchTenantApprovalProcessConfigRaw(session.tenantId);
    const prev = (rawPrev as TenantApprovalProcessConfig | null) ?? {};
    const next: TenantApprovalProcessConfig = {
      ...(typeof prev === 'object' && prev ? prev : {}),
      [usageType]: sanitizeUsageBlock(body.block),
    };

    await replaceTenantApprovalProcessConfigRaw(session.tenantId, next);

    return NextResponse.json({ ok: true, config: next });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
