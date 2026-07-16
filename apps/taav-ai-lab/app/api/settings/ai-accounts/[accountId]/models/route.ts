import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';
import {
  createAiProviderModel,
  hasAnyPositivePrice,
  listAiProviderModels,
  parseAiProviderModelBrandTag,
  parseAiProviderModelType,
  parseAiProviderPricingUnit,
} from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type RouteContext = { params: Promise<{ accountId: string }> };

type ModelPayload = {
  displayName?: string;
  providerModelName?: string;
  modelType?: string;
  pricingUnit?: string;
  inputTokenPriceUsd?: number;
  outputTokenPriceUsd?: number;
  cacheReadTokenPriceUsd?: number;
  cacheWriteTokenPriceUsd?: number;
  requestPriceUsd?: number;
  pagePriceUsd?: number;
  imagePriceUsd?: number;
  minutePriceUsd?: number;
  supportsPersian?: boolean;
  supportsEnglish?: boolean;
  supportsVision?: boolean;
  supportsPdf?: boolean;
  supportsImage?: boolean;
  supportsStructuredExtraction?: boolean;
  supportsEmbedding?: boolean;
  supportsFunctionCalling?: boolean;
  maxInputTokens?: number | null;
  maxOutputTokens?: number | null;
  isDefaultForChat?: boolean;
  isDefaultForOcr?: boolean;
  isDefaultForEmbedding?: boolean;
  isDefaultForVision?: boolean;
  isActive?: boolean;
  brandTag?: string | null;
  notes?: string | null;
};

function parseNonNegativeNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parsePositiveInteger(value: unknown) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function validateModelPayload(body: ModelPayload | null, requireAll: boolean) {
  const displayName = body?.displayName?.trim() ?? '';
  const providerModelName = body?.providerModelName?.trim() ?? '';
  const modelType = parseAiProviderModelType(body?.modelType);
  const pricingUnit = parseAiProviderPricingUnit(body?.pricingUnit);

  if (requireAll && !displayName) {
    return { error: 'نام نمایشی مدل الزامی است.' };
  }
  if (requireAll && !providerModelName) {
    return { error: 'نام مدل در Provider الزامی است.' };
  }
  if (requireAll && !modelType) {
    return { error: 'نوع مدل معتبر نیست.' };
  }
  if (requireAll && !pricingUnit) {
    return { error: 'واحد قیمت‌گذاری معتبر نیست.' };
  }
  if (body?.modelType !== undefined && body.modelType !== null && body.modelType !== '' && !modelType) {
    return { error: 'نوع مدل معتبر نیست.' };
  }
  if (body?.pricingUnit !== undefined && body.pricingUnit !== null && body.pricingUnit !== '' && !pricingUnit) {
    return { error: 'واحد قیمت‌گذاری معتبر نیست.' };
  }

  let brandTag: ReturnType<typeof parseAiProviderModelBrandTag> | undefined;
  if (body?.brandTag !== undefined) {
    if (body.brandTag === null || body.brandTag === '') {
      brandTag = null;
    } else {
      const parsedBrandTag = parseAiProviderModelBrandTag(body.brandTag);
      if (!parsedBrandTag) {
        return { error: 'تگ برند معتبر نیست.' };
      }
      brandTag = parsedBrandTag;
    }
  }

  const prices = {
    inputTokenPriceUsd: parseNonNegativeNumber(body?.inputTokenPriceUsd),
    outputTokenPriceUsd: parseNonNegativeNumber(body?.outputTokenPriceUsd),
    cacheReadTokenPriceUsd: parseNonNegativeNumber(body?.cacheReadTokenPriceUsd),
    cacheWriteTokenPriceUsd: parseNonNegativeNumber(body?.cacheWriteTokenPriceUsd),
    requestPriceUsd: parseNonNegativeNumber(body?.requestPriceUsd),
    pagePriceUsd: parseNonNegativeNumber(body?.pagePriceUsd),
    imagePriceUsd: parseNonNegativeNumber(body?.imagePriceUsd),
    minutePriceUsd: parseNonNegativeNumber(body?.minutePriceUsd),
  };

  if (Object.values(prices).some((value) => value === null)) {
    return { error: 'قیمت‌ها باید صفر یا بیشتر باشند.' };
  }

  const maxInputTokens =
    body?.maxInputTokens === undefined ? undefined : parsePositiveInteger(body.maxInputTokens);
  const maxOutputTokens =
    body?.maxOutputTokens === undefined ? undefined : parsePositiveInteger(body.maxOutputTokens);

  if (body?.maxInputTokens !== undefined && maxInputTokens === null) {
    return { error: 'حداکثر توکن ورودی معتبر نیست.' };
  }
  if (body?.maxOutputTokens !== undefined && maxOutputTokens === null) {
    return { error: 'حداکثر توکن خروجی معتبر نیست.' };
  }

  if (
    requireAll &&
    !hasAnyPositivePrice({
      inputTokenPriceUsd: prices.inputTokenPriceUsd ?? 0,
      outputTokenPriceUsd: prices.outputTokenPriceUsd ?? 0,
      requestPriceUsd: prices.requestPriceUsd ?? 0,
      pagePriceUsd: prices.pagePriceUsd ?? 0,
      imagePriceUsd: prices.imagePriceUsd ?? 0,
      minutePriceUsd: prices.minutePriceUsd ?? 0,
    })
  ) {
    return { error: 'حداقل یکی از فیلدهای قیمت باید بیشتر از صفر باشد.' };
  }

  return {
    data: {
      ...(displayName ? { displayName } : {}),
      ...(providerModelName ? { providerModelName } : {}),
      ...(modelType ? { modelType } : {}),
      ...(pricingUnit ? { pricingUnit } : {}),
      ...(body?.inputTokenPriceUsd !== undefined ? { inputTokenPriceUsd: prices.inputTokenPriceUsd ?? 0 } : {}),
      ...(body?.outputTokenPriceUsd !== undefined ? { outputTokenPriceUsd: prices.outputTokenPriceUsd ?? 0 } : {}),
      ...(body?.cacheReadTokenPriceUsd !== undefined
        ? { cacheReadTokenPriceUsd: prices.cacheReadTokenPriceUsd ?? 0 }
        : {}),
      ...(body?.cacheWriteTokenPriceUsd !== undefined
        ? { cacheWriteTokenPriceUsd: prices.cacheWriteTokenPriceUsd ?? 0 }
        : {}),
      ...(body?.requestPriceUsd !== undefined ? { requestPriceUsd: prices.requestPriceUsd ?? 0 } : {}),
      ...(body?.pagePriceUsd !== undefined ? { pagePriceUsd: prices.pagePriceUsd ?? 0 } : {}),
      ...(body?.imagePriceUsd !== undefined ? { imagePriceUsd: prices.imagePriceUsd ?? 0 } : {}),
      ...(body?.minutePriceUsd !== undefined ? { minutePriceUsd: prices.minutePriceUsd ?? 0 } : {}),
      ...(body?.supportsPersian !== undefined ? { supportsPersian: Boolean(body.supportsPersian) } : {}),
      ...(body?.supportsEnglish !== undefined ? { supportsEnglish: Boolean(body.supportsEnglish) } : {}),
      ...(body?.supportsVision !== undefined ? { supportsVision: Boolean(body.supportsVision) } : {}),
      ...(body?.supportsPdf !== undefined ? { supportsPdf: Boolean(body.supportsPdf) } : {}),
      ...(body?.supportsImage !== undefined ? { supportsImage: Boolean(body.supportsImage) } : {}),
      ...(body?.supportsStructuredExtraction !== undefined
        ? { supportsStructuredExtraction: Boolean(body.supportsStructuredExtraction) }
        : {}),
      ...(body?.supportsEmbedding !== undefined ? { supportsEmbedding: Boolean(body.supportsEmbedding) } : {}),
      ...(body?.supportsFunctionCalling !== undefined
        ? { supportsFunctionCalling: Boolean(body.supportsFunctionCalling) }
        : {}),
      ...(body?.maxInputTokens !== undefined ? { maxInputTokens } : {}),
      ...(body?.maxOutputTokens !== undefined ? { maxOutputTokens } : {}),
      ...(body?.isDefaultForChat !== undefined ? { isDefaultForChat: Boolean(body.isDefaultForChat) } : {}),
      ...(body?.isDefaultForOcr !== undefined ? { isDefaultForOcr: Boolean(body.isDefaultForOcr) } : {}),
      ...(body?.isDefaultForEmbedding !== undefined ? { isDefaultForEmbedding: Boolean(body.isDefaultForEmbedding) } : {}),
      ...(body?.isDefaultForVision !== undefined ? { isDefaultForVision: Boolean(body.isDefaultForVision) } : {}),
      ...(body?.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      ...(brandTag !== undefined ? { brandTag } : {}),
      ...(body?.notes !== undefined ? { notes: body.notes?.trim() ? body.notes.trim() : null } : {}),
    },
  };
}

function handleModelWriteError(error: unknown) {
  if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
    const target = Array.isArray(error.meta?.target) ? error.meta.target.join(',') : '';
    if (target.includes('brandTag')) {
      return NextResponse.json(
        { message: 'این تگ برای نوع مدل انتخاب‌شده قبلاً به مدل فعال دیگری اختصاص داده شده است.' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: 'این نام مدل در Provider قبلاً برای این اکانت ثبت شده است.' },
      { status: 409 },
    );
  }
  return handlePrismaApiError(error);
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { accountId } = await context.params;

  try {
    const models = await listAiProviderModels(accountId);
    if (!models) {
      return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, models });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { accountId } = await context.params;
  const body = (await request.json().catch(() => null)) as ModelPayload | null;
  const validation = validateModelPayload(body, true);
  if ('error' in validation) {
    return NextResponse.json({ message: validation.error }, { status: 400 });
  }

  try {
    const model = await createAiProviderModel(accountId, {
      ...validation.data,
      displayName: validation.data.displayName!,
      providerModelName: validation.data.providerModelName!,
      modelType: validation.data.modelType!,
      pricingUnit: validation.data.pricingUnit!,
      isActive: body?.isActive !== false,
      createdByUserId: session.userId,
    });

    if (!model) {
      return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, model });
  } catch (error) {
    return handleModelWriteError(error);
  }
}
