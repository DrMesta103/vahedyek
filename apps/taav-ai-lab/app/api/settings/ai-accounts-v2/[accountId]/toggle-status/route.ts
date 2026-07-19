import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import { toggleAiProviderAccountStatusV2 } from '@/app/lib/repositories/ai-provider-accounts-v2';

type RouteContext = { params: Promise<{ accountId: string }> };

type TogglePayload = { isActive?: boolean };

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId } = await context.params;
  const body = (await request.json().catch(() => null)) as TogglePayload | null;
  if (typeof body?.isActive !== 'boolean') {
    return NextResponse.json({ message: 'وضعیت معتبر نیست.' }, { status: 400 });
  }

  try {
    const account = await toggleAiProviderAccountStatusV2({
      accountId,
      isActive: body.isActive,
      actorUserId: session.userId,
    });
    if (!account) return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, account });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

