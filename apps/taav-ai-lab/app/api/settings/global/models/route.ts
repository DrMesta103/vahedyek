import { NextResponse } from 'next/server';
import { createModelSettings } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import { MODEL_CATEGORY_LABELS, PROVIDER_LABELS, type ModelCategory, type Provider } from '@/app/lib/global-settings-mock';

type ModelPayload = {
  id?: string;
  provider?: Provider;
  name?: string;
  category?: ModelCategory;
  pricePer100TokensUsd?: number;
  relatedModelIds?: string[];
};

const PROVIDERS: Provider[] = ['openai', 'google', 'xai', 'deepseek'];
const CATEGORIES: ModelCategory[] = ['chat', 'embedding', 'ocr'];

function slugifyModelId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: Request) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ModelPayload | null;
  const provider = body?.provider;
  const name = body?.name?.trim() ?? '';
  const category = body?.category;
  const pricePer100TokensUsd = Number(body?.pricePer100TokensUsd);
  const relatedModelIds = Array.isArray(body?.relatedModelIds)
    ? body!.relatedModelIds.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : [];

  if (!provider || !PROVIDERS.includes(provider)) {
    return NextResponse.json({ message: 'ارائه‌دهنده معتبر نیست.' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ message: 'نام مدل الزامی است.' }, { status: 400 });
  }
  if (!category || !CATEGORIES.includes(category)) {
    return NextResponse.json({ message: 'دسته مدل معتبر نیست.' }, { status: 400 });
  }
  if (!Number.isFinite(pricePer100TokensUsd) || pricePer100TokensUsd < 0) {
    return NextResponse.json({ message: 'قیمت مدل معتبر نیست.' }, { status: 400 });
  }

  const id = body?.id?.trim() || slugifyModelId(name);

  try {
    const model = await createModelSettings({
      id,
      provider,
      providerLabel: PROVIDER_LABELS[provider],
      name,
      category,
      pricePer100TokensUsd,
      relatedModelIds,
    });

    return NextResponse.json({
      success: true,
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
