import { NextResponse } from 'next/server';
import {
  createAiProviderAccount,
  listAiProviderAccounts,
  parseAiProviderType,
  isValidPurchaseEmail,
  parseNonNegativeDecimal,
} from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type CreatePayload = {
  name?: string;
  provider?: string;
  apiKey?: string;
  purchaseEmail?: string | null;
  purchasedCreditUsd?: number;
  inputTokenPriceUsd?: number;
  outputTokenPriceUsd?: number;
  notes?: string | null;
  isActive?: boolean;
};

export async function GET() {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  try {
    const data = await listAiProviderAccounts();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as CreatePayload | null;
  const name = body?.name?.trim() ?? '';
  const provider = parseAiProviderType(body?.provider);
  const apiKey = body?.apiKey?.trim() ?? '';
  const purchaseEmailRaw = body?.purchaseEmail?.trim() ?? '';
  const notes = body?.notes?.trim() ?? '';
  const purchasedCreditUsd = parseNonNegativeDecimal(body?.purchasedCreditUsd);
  const inputTokenPriceUsd = parseNonNegativeDecimal(body?.inputTokenPriceUsd);
  const outputTokenPriceUsd = parseNonNegativeDecimal(body?.outputTokenPriceUsd);
  const isActive = body?.isActive !== false;

  if (!name) {
    return NextResponse.json({ message: 'نام اکانت الزامی است.' }, { status: 400 });
  }
  if (!provider) {
    return NextResponse.json({ message: 'ارائه‌دهنده معتبر نیست.' }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ message: 'API Key الزامی است.' }, { status: 400 });
  }
  if (purchasedCreditUsd === null) {
    return NextResponse.json({ message: 'اعتبار خریداری‌شده باید صفر یا بیشتر باشد.' }, { status: 400 });
  }
  if (inputTokenPriceUsd === null) {
    return NextResponse.json({ message: 'قیمت توکن ورودی باید صفر یا بیشتر باشد.' }, { status: 400 });
  }
  if (outputTokenPriceUsd === null) {
    return NextResponse.json({ message: 'قیمت توکن خروجی باید صفر یا بیشتر باشد.' }, { status: 400 });
  }
  if (purchaseEmailRaw && !isValidPurchaseEmail(purchaseEmailRaw)) {
    return NextResponse.json({ message: 'ایمیل خریداری معتبر نیست.' }, { status: 400 });
  }

  try {
    const account = await createAiProviderAccount({
      name,
      provider,
      apiKey,
      purchaseEmail: purchaseEmailRaw || null,
      purchasedCreditUsd,
      inputTokenPriceUsd,
      outputTokenPriceUsd,
      notes: notes || null,
      isActive,
      createdByUserId: session.userId,
    });

    return NextResponse.json({ success: true, account });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
