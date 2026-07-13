import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import {
  deleteAiProviderModelV2,
  getAiProviderModelByIdV2,
  updateAiProviderModelV2,
} from '@/app/lib/repositories/ai-provider-models-v2';
import { AI_PROVIDER_MODEL_CAPABILITY_TYPES_V2, AI_PROVIDER_MODEL_TYPES_V2 } from '@/app/lib/types/ai-provider-v2';

type RouteContext = { params: Promise<{ accountId: string; modelId: string }> };

type UpdatePayload = {
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
  if (!Array.isArray(value)) return undefined;
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

  const { accountId, modelId } = await context.params;
  try {
    const model = await getAiProviderModelByIdV2({ accountId, modelId });
    if (!model) return NextResponse.json({ message: 'مدل یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, model });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId, modelId } = await context.params;
  const body = (await request.json().catch(() => null)) as UpdatePayload | null;

  const modelType = body?.modelType !== undefined ? parseModelType(body.modelType) : undefined;
  if (body?.modelType !== undefined && !modelType) {
    return NextResponse.json({ message: 'نوع مدل معتبر نیست.' }, { status: 400 });
  }

  try {
    const model = await updateAiProviderModelV2({
      accountId,
      modelId,
      actorUserId: session.userId,
      data: {
        ...(body?.name !== undefined ? { name: body.name } : {}),
        ...(body?.providerModelId !== undefined ? { providerModelId: body.providerModelId } : {}),
        ...(modelType !== undefined ? { modelType } : {}),
        ...(body?.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
        ...(body?.capabilities !== undefined ? { capabilities: parseCapabilities(body.capabilities) } : {}),
      } as any,
    });
    if (!model) return NextResponse.json({ message: 'مدل یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, model });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId, modelId } = await context.params;
  try {
    const deleted = await deleteAiProviderModelV2({ accountId, modelId });
    if (!deleted) return NextResponse.json({ message: 'مدل یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

