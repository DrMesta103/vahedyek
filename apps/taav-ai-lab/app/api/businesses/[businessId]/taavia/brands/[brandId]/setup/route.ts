import { NextResponse } from 'next/server';
import { getAdminAgentSetupState, updateAdminAgentSetupState } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import type { TaaviaUseCaseKey } from '@/app/lib/types/domain';

type RouteContext = { params: Promise<{ businessId: string; brandId: string }> };

type SetupPayload = {
  selectedUseCases?: TaaviaUseCaseKey[];
};

const VALID_USE_CASES = new Set<TaaviaUseCaseKey>([
  'support',
  'sales',
  'marketing',
  'operations',
  'finance',
  'hr',
  'product',
  'management',
  'it',
  'all',
]);

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
    (value): value is TaaviaUseCaseKey => VALID_USE_CASES.has(value),
  );

  try {
    const setup = await updateAdminAgentSetupState(session.userId, businessId, brandId, selectedUseCases);
    if (!setup) {
      return NextResponse.json({ message: 'برند پیدا نشد یا دسترسی ندارید.' }, { status: 404 });
    }
    return NextResponse.json({ setup, source: 'database' });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
