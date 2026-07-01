import { NextResponse } from 'next/server';
import { updateModelPrice } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type RouteContext = { params: Promise<{ modelId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { modelId } = await context.params;
  const body = (await request.json().catch(() => null)) as { pricePer100TokensUsd?: number } | null;
  const price = Number(body?.pricePer100TokensUsd);

  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ message: 'قیمت معتبر نیست.' }, { status: 400 });
  }

  try {
    await updateModelPrice(modelId, price);
    return NextResponse.json({ success: true, modelId, pricePer100TokensUsd: price });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
