import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import { createAiProviderModelV2, listAiProviderModelsV2 } from '@/app/lib/repositories/ai-provider-models-v2';
import { AI_PROVIDER_MODEL_CAPABILITY_TYPES_V2, AI_PROVIDER_MODEL_TYPES_V2 } from '@/app/lib/types/ai-provider-v2';

type RouteContext = { params: Promise<{ accountId: string }> };

type CreatePayload = {
  name?: string;
  providerModelId?: string;
  modelType?: string;
  isActive?: boolean;
  capabilities?: string[];
};

function parseModelType(value: unknown) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return (AI_PROVIDER_MODEL_TYPES_V2 as readonly string[]).includes(normalized) ? (normalized as any) : null;
}

function parseCapabilities(value: unknown) {
  if (!Array.isArray(value)) return [];
  const normalized = value
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean);
  const allowed = new Set(AI_PROVIDER_MODEL_CAPABILITY_TYPES_V2 as readonly string[]);
  return normalized.filter((v) => allowed.has(v)) as any[];
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId } = await context.params;
  try {
    const models = await listAiProviderModelsV2({ accountId });
    if (!models) return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, models });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId } = await context.params;
  const body = (await request.json().catch(() => null)) as CreatePayload | null;

  const name = body?.name?.trim() ?? '';
  const providerModelId = body?.providerModelId?.trim() ?? '';
  const modelType = parseModelType(body?.modelType);
  const capabilities = parseCapabilities(body?.capabilities);

  if (!name) return NextResponse.json({ message: 'نام مدل الزامی است.' }, { status: 400 });
  if (!providerModelId) return NextResponse.json({ message: 'شناسه مدل در Provider الزامی است.' }, { status: 400 });
  if (!modelType) return NextResponse.json({ message: 'نوع مدل معتبر نیست.' }, { status: 400 });

  try {
    const model = await createAiProviderModelV2({
      accountId,
      actorUserId: session.userId,
      data: {
        name,
        providerModelId,
        modelType,
        isActive: body?.isActive !== false,
        capabilities,
      },
    });
    if (!model) return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, model });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

