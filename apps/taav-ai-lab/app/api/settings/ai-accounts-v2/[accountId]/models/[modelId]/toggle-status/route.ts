import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import { toggleAiProviderModelStatusV2 } from '@/app/lib/repositories/ai-provider-models-v2';

type RouteContext = { params: Promise<{ accountId: string; modelId: string }> };
type TogglePayload = { isActive?: boolean };

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId, modelId } = await context.params;
  const body = (await request.json().catch(() => null)) as TogglePayload | null;
  if (typeof body?.isActive !== 'boolean') return NextResponse.json({ message: 'وضعیت معتبر نیست.' }, { status: 400 });

  try {
    const model = await toggleAiProviderModelStatusV2({
      accountId,
      modelId,
      isActive: body.isActive,
      actorUserId: session.userId,
    });
    if (!model) return NextResponse.json({ message: 'مدل یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, model });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

