import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import { changeAiProviderAccountApiKeyV2 } from '@/app/lib/repositories/ai-provider-accounts-v2';

type RouteContext = { params: Promise<{ accountId: string }> };

type Payload = { apiKey?: string };

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId } = await context.params;
  const body = (await request.json().catch(() => null)) as Payload | null;
  const apiKey = body?.apiKey?.trim() ?? '';
  if (!apiKey) return NextResponse.json({ message: 'API Key الزامی است.' }, { status: 400 });

  try {
    const account = await changeAiProviderAccountApiKeyV2({
      accountId,
      apiKey,
      actorUserId: session.userId,
    });
    if (!account) return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, account });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

