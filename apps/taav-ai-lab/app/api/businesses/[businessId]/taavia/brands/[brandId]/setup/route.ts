import { NextResponse } from 'next/server';
import { getAdminAgentSetupState, updateAdminAgentSetupState } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import { TAAVIA_ALL_USE_CASE_KEYS, TAAVIA_VALID_USE_CASES } from '@/app/lib/taavia-use-cases';
import type { TaaviaUseCaseKey } from '@/app/lib/types/domain';

type RouteContext = { params: Promise<{ businessId: string; brandId: string }> };

type SetupPayload = {
  selectedUseCases?: TaaviaUseCaseKey[];
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;

  try {
    const setup = await getAdminAgentSetupState(session.userId, businessId, brandId);
    if (!setup) {
      return NextResponse.json({ message: 'برند پیدا نشد.' }, { status: 404 });
    }
    return NextResponse.json({ setup, source: 'database' });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;
  const body = (await request.json().catch(() => null)) as SetupPayload | null;
  const selectedUseCases = Array.from(new Set(body?.selectedUseCases ?? [])).filter(
    (value): value is TaaviaUseCaseKey => TAAVIA_VALID_USE_CASES.has(value),
  );
  const normalizedUseCases = selectedUseCases.length ? selectedUseCases : TAAVIA_ALL_USE_CASE_KEYS;

  try {
    const setup = await updateAdminAgentSetupState(session.userId, businessId, brandId, normalizedUseCases);
    if (!setup) {
      return NextResponse.json({ message: 'برند پیدا نشد یا دسترسی ندارید.' }, { status: 404 });
    }
    return NextResponse.json({ setup, source: 'database' });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
