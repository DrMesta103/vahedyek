import { NextResponse } from 'next/server';
import {
  deleteAiProviderModel,
  getAiProviderModelById,
  updateAiProviderModel,
} from '@/app/lib/data';
import type { UpdateAiProviderModelInput } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  parseAiProviderModelType,
  parseAiProviderPricingUnit,
} from '@/app/lib/data';

type RouteContext = { params: Promise<{ accountId: string; modelId: string }> };

type ModelPayload = {
  displayName?: string;
  providerModelName?: string;
  modelType?: string;
  pricingUnit?: string;
  inputTokenPriceUsd?: number;
  outputTokenPriceUsd?: number;
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

function handleModelWriteError(error: unknown) {
  if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
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

  const { accountId, modelId } = await context.params;

  try {
    const model = await getAiProviderModelById(accountId, modelId);
    if (!model) {
      return NextResponse.json({ message: 'مدل یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, model });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { accountId, modelId } = await context.params;
  const body = (await request.json().catch(() => null)) as ModelPayload | null;
  const updateData: UpdateAiProviderModelInput = {};

  if (body?.displayName !== undefined) {
    const displayName = body.displayName.trim();
    if (!displayName) {
      return NextResponse.json({ message: 'نام نمایشی مدل الزامی است.' }, { status: 400 });
    }
    updateData.displayName = displayName;
  }

  if (body?.providerModelName !== undefined) {
    const providerModelName = body.providerModelName.trim();
    if (!providerModelName) {
      return NextResponse.json({ message: 'نام مدل در Provider الزامی است.' }, { status: 400 });
    }
    updateData.providerModelName = providerModelName;
  }

  if (body?.modelType !== undefined) {
    const modelType = parseAiProviderModelType(body.modelType);
    if (!modelType) {
      return NextResponse.json({ message: 'نوع مدل معتبر نیست.' }, { status: 400 });
    }
    updateData.modelType = modelType;
  }

  if (body?.pricingUnit !== undefined) {
    const pricingUnit = parseAiProviderPricingUnit(body.pricingUnit);
    if (!pricingUnit) {
      return NextResponse.json({ message: 'واحد قیمت‌گذاری معتبر نیست.' }, { status: 400 });
    }
    updateData.pricingUnit = pricingUnit;
  }

  const priceFields = [
    ['inputTokenPriceUsd', body?.inputTokenPriceUsd],
    ['outputTokenPriceUsd', body?.outputTokenPriceUsd],
    ['requestPriceUsd', body?.requestPriceUsd],
    ['pagePriceUsd', body?.pagePriceUsd],
    ['imagePriceUsd', body?.imagePriceUsd],
    ['minutePriceUsd', body?.minutePriceUsd],
  ] as const;

  for (const [key, value] of priceFields) {
    if (value !== undefined) {
      const parsed = parseNonNegativeNumber(value);
      if (parsed === null) {
        return NextResponse.json({ message: 'قیمت‌ها باید صفر یا بیشتر باشند.' }, { status: 400 });
      }
      updateData[key] = parsed;
    }
  }

  if (body?.maxInputTokens !== undefined) {
    const maxInputTokens = parsePositiveInteger(body.maxInputTokens);
    if (maxInputTokens === null) {
      return NextResponse.json({ message: 'حداکثر توکن ورودی معتبر نیست.' }, { status: 400 });
    }
    updateData.maxInputTokens = maxInputTokens;
  }

  if (body?.maxOutputTokens !== undefined) {
    const maxOutputTokens = parsePositiveInteger(body.maxOutputTokens);
    if (maxOutputTokens === null) {
      return NextResponse.json({ message: 'حداکثر توکن خروجی معتبر نیست.' }, { status: 400 });
    }
    updateData.maxOutputTokens = maxOutputTokens;
  }

  if (body?.supportsPersian !== undefined) updateData.supportsPersian = Boolean(body.supportsPersian);
  if (body?.supportsEnglish !== undefined) updateData.supportsEnglish = Boolean(body.supportsEnglish);
  if (body?.supportsVision !== undefined) updateData.supportsVision = Boolean(body.supportsVision);
  if (body?.supportsPdf !== undefined) updateData.supportsPdf = Boolean(body.supportsPdf);
  if (body?.supportsImage !== undefined) updateData.supportsImage = Boolean(body.supportsImage);
  if (body?.supportsStructuredExtraction !== undefined) {
    updateData.supportsStructuredExtraction = Boolean(body.supportsStructuredExtraction);
  }
  if (body?.supportsEmbedding !== undefined) updateData.supportsEmbedding = Boolean(body.supportsEmbedding);
  if (body?.supportsFunctionCalling !== undefined) {
    updateData.supportsFunctionCalling = Boolean(body.supportsFunctionCalling);
  }
  if (body?.isDefaultForChat !== undefined) updateData.isDefaultForChat = Boolean(body.isDefaultForChat);
  if (body?.isDefaultForOcr !== undefined) updateData.isDefaultForOcr = Boolean(body.isDefaultForOcr);
  if (body?.isDefaultForEmbedding !== undefined) updateData.isDefaultForEmbedding = Boolean(body.isDefaultForEmbedding);
  if (body?.isDefaultForVision !== undefined) updateData.isDefaultForVision = Boolean(body.isDefaultForVision);
  if (body?.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
  if (body?.notes !== undefined) updateData.notes = body.notes?.trim() ? body.notes.trim() : null;

  try {
    const model = await updateAiProviderModel(accountId, modelId, updateData);
    if (!model) {
      return NextResponse.json({ message: 'مدل یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, model });
  } catch (error) {
    return handleModelWriteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { accountId, modelId } = await context.params;

  try {
    const deleted = await deleteAiProviderModel(accountId, modelId);
    if (!deleted) {
      return NextResponse.json({ message: 'مدل یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
