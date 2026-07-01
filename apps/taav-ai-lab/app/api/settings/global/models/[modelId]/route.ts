import { NextResponse } from 'next/server';
import { updateModelSettings } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import type { ModelCategory, Provider } from '@/app/lib/global-settings-mock';

type RouteContext = { params: Promise<{ modelId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { modelId } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    pricePer100TokensUsd?: number;
    relatedModelIds?: string[];
    name?: string;
    provider?: Provider;
    providerLabel?: string;
    category?: ModelCategory;
  } | null;
  const price = Number(body?.pricePer100TokensUsd);

  if (body?.pricePer100TokensUsd !== undefined && (!Number.isFinite(price) || price < 0)) {
    return NextResponse.json({ message: 'قیمت معتبر نیست.' }, { status: 400 });
  }

  try {
    const model = await updateModelSettings(modelId, {
      ...(body?.pricePer100TokensUsd !== undefined ? { pricePer100TokensUsd: price } : {}),
      ...(body?.relatedModelIds !== undefined
        ? {
            relatedModelIds: body.relatedModelIds.filter((item): item is string => typeof item === 'string'),
          }
        : {}),
      ...(body?.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body?.provider !== undefined ? { provider: body.provider } : {}),
      ...(body?.providerLabel !== undefined ? { providerLabel: body.providerLabel } : {}),
      ...(body?.category !== undefined ? { category: body.category } : {}),
    });
    return NextResponse.json({
      success: true,
      modelId,
      model: {
        id: model.id,
        provider: model.provider,
        providerLabel: model.providerLabel,
        name: model.name,
        category: model.category,
        pricePer100TokensUsd: Number(model.pricePer100TokensUsd),
        relatedModelIds: model.relatedModelIds,
      },
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
