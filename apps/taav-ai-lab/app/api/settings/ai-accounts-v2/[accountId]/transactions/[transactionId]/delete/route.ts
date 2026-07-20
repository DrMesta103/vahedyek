import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import { deleteAiProviderAccountTransactionV2 } from '@/app/lib/repositories/ai-provider-account-transactions-v2';

type RouteContext = { params: Promise<{ accountId: string; transactionId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId, transactionId } = await context.params;

  try {
    const deleted = await deleteAiProviderAccountTransactionV2({
      accountId,
      transactionId,
      actorUserId: session.userId,
    });
    if (!deleted) return NextResponse.json({ message: 'تراکنش یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

