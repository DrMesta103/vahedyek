import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import {
  createAiProviderAccountTransactionV2,
  listAiProviderAccountTransactionsV2,
} from '@/app/lib/repositories/ai-provider-account-transactions-v2';

type RouteContext = { params: Promise<{ accountId: string }> };

type CreatePayload = {
  transactionType?: 'PURCHASE' | 'MANUAL_ADJUSTMENT';
  amountUsd?: number;
  amountToman?: number;
  transactionAt?: string;
  description?: string | null;
};

export async function GET(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId } = await context.params;
  const url = new URL(request.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const includeDeleted = url.searchParams.get('includeDeleted') === 'true';

  try {
    const transactions = await listAiProviderAccountTransactionsV2({
      accountId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      includeDeleted,
    });
    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId } = await context.params;
  const body = (await request.json().catch(() => null)) as CreatePayload | null;

  if (!body?.transactionType) return NextResponse.json({ message: 'نوع تراکنش الزامی است.' }, { status: 400 });
  if (typeof body.amountUsd !== 'number') return NextResponse.json({ message: 'مبلغ دلار الزامی است.' }, { status: 400 });
  if (typeof body.amountToman !== 'number') return NextResponse.json({ message: 'مبلغ تومان الزامی است.' }, { status: 400 });
  if (!body.transactionAt) return NextResponse.json({ message: 'تاریخ تراکنش الزامی است.' }, { status: 400 });

  try {
    const transaction = await createAiProviderAccountTransactionV2({
      accountId,
      actorUserId: session.userId,
      data: {
        transactionType: body.transactionType,
        amountUsd: body.amountUsd,
        amountToman: body.amountToman,
        transactionAt: body.transactionAt,
        description: body.description ?? null,
      },
    });
    if (!transaction) return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

