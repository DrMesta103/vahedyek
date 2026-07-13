import { NextResponse } from 'next/server';
import {
  DuplicateAiProviderError,
  deleteAiProviderAccount,
  getAiProviderAccountById,
  parseAiAccountProviderType,
  isValidPurchaseEmail,
  updateAiProviderAccount,
  parseNonNegativeDecimal,
} from '@/app/lib/data';
import type { UpdateAiProviderAccountInput } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type RouteContext = { params: Promise<{ accountId: string }> };

type UpdatePayload = {
  name?: string;
  provider?: string;
  apiKey?: string;
  purchaseEmail?: string | null;
  purchasedCreditUsd?: number;
  notes?: string | null;
  isActive?: boolean;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { accountId } = await context.params;

  try {
    const account = await getAiProviderAccountById(accountId);
    if (!account) {
      return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, account });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { accountId } = await context.params;
  const body = (await request.json().catch(() => null)) as UpdatePayload | null;
  const updateData: UpdateAiProviderAccountInput = {};

  if (body?.name !== undefined) {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ message: 'نام اکانت الزامی است.' }, { status: 400 });
    }
    updateData.name = name;
  }

  if (body?.provider !== undefined) {
    const provider = parseAiAccountProviderType(body.provider);
    if (!provider) {
      return NextResponse.json({ message: 'ارائه‌دهنده معتبر نیست.' }, { status: 400 });
    }
    updateData.provider = provider;
  }

  if (body?.apiKey !== undefined) {
    const apiKey = body.apiKey.trim();
    if (apiKey) {
      updateData.apiKey = apiKey;
    }
  }

  if (body?.purchaseEmail !== undefined) {
    const purchaseEmail = body.purchaseEmail?.trim() ?? '';
    if (purchaseEmail && !isValidPurchaseEmail(purchaseEmail)) {
      return NextResponse.json({ message: 'ایمیل خریداری معتبر نیست.' }, { status: 400 });
    }
    updateData.purchaseEmail = purchaseEmail || null;
  }

  if (body?.notes !== undefined) {
    updateData.notes = body.notes?.trim() ? body.notes.trim() : null;
  }

  if (body?.purchasedCreditUsd !== undefined) {
    const purchasedCreditUsd = parseNonNegativeDecimal(body.purchasedCreditUsd);
    if (purchasedCreditUsd === null) {
      return NextResponse.json({ message: 'اعتبار خریداری‌شده باید صفر یا بیشتر باشد.' }, { status: 400 });
    }
    updateData.purchasedCreditUsd = purchasedCreditUsd;
  }

  if (body?.isActive !== undefined) {
    updateData.isActive = Boolean(body.isActive);
  }

  try {
    const account = await updateAiProviderAccount(accountId, updateData);
    if (!account) {
      return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, account });
  } catch (error) {
    if (error instanceof DuplicateAiProviderError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return handlePrismaApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { accountId } = await context.params;

  try {
    const deleted = await deleteAiProviderAccount(accountId);
    if (!deleted) {
      return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
