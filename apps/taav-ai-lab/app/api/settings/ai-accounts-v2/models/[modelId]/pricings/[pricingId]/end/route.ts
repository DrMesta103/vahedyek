import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import { endAiProviderModelPricingV2 } from '@/app/lib/repositories/ai-provider-model-pricing-v2';

type RouteContext = { params: Promise<{ modelId: string; pricingId: string }> };
type Payload = { effectiveTo?: string };

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { pricingId } = await context.params;
  const body = (await request.json().catch(() => null)) as Payload | null;
  if (!body?.effectiveTo) return NextResponse.json({ message: 'EffectiveTo الزامی است.' }, { status: 400 });

  try {
    const pricing = await endAiProviderModelPricingV2({
      pricingId,
      actorUserId: session.userId,
      data: { effectiveTo: body.effectiveTo },
    });
    if (!pricing) return NextResponse.json({ message: 'دوره قیمت‌گذاری یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, pricing });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

