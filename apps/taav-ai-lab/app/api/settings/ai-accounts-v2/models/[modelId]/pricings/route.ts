import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import {
  createAiProviderModelPricingV2,
  getCurrentAiProviderModelPricingV2,
  listAiProviderModelPricingsV2,
} from '@/app/lib/repositories/ai-provider-model-pricing-v2';

type RouteContext = { params: Promise<{ modelId: string }> };

type CreatePayload = {
  effectiveFrom?: string;
  priceItems?: Array<{
    usageMetricType: any;
    usageUnitType: any;
    unitQuantity: number;
    priceUsd: number;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { modelId } = await context.params;
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode');

  try {
    if (mode === 'current') {
      const pricing = await getCurrentAiProviderModelPricingV2({ modelId });
      return NextResponse.json({ success: true, pricing });
    }
    const pricings = await listAiProviderModelPricingsV2({ modelId });
    return NextResponse.json({ success: true, pricings });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { modelId } = await context.params;
  const body = (await request.json().catch(() => null)) as CreatePayload | null;
  if (!body?.effectiveFrom) return NextResponse.json({ message: 'تاریخ شروع دوره الزامی است.' }, { status: 400 });

  try {
    const pricing = await createAiProviderModelPricingV2({
      modelId,
      actorUserId: session.userId,
      data: { effectiveFrom: body.effectiveFrom, priceItems: body.priceItems ?? [] },
    });
    if (!pricing) return NextResponse.json({ message: 'مدل یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, pricing });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

