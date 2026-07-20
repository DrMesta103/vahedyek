import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import { parseAiProviderTypeV2 } from './utils';
import { listAiProviderAccountsV2, createAiProviderAccountV2 } from '@/app/lib/repositories/ai-provider-accounts-v2';

type CreatePayload = {
  name?: string;
  providerType?: string;
  apiKey?: string;
  endpoint?: string | null;
  apiVersion?: string | null;
  billingEmail?: string | null;
  description?: string | null;
  isActive?: boolean;
};

export async function GET() {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  try {
    const data = await listAiProviderAccountsV2();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as CreatePayload | null;
  const name = body?.name?.trim() ?? '';
  const providerType = parseAiProviderTypeV2(body?.providerType);
  const apiKey = body?.apiKey?.trim() ?? '';

  if (!name) return NextResponse.json({ message: 'نام اکانت الزامی است.' }, { status: 400 });
  if (!providerType) return NextResponse.json({ message: 'ارائه‌دهنده معتبر نیست.' }, { status: 400 });
  if (!apiKey) return NextResponse.json({ message: 'API Key الزامی است.' }, { status: 400 });

  try {
    const account = await createAiProviderAccountV2({
      data: {
        name,
        providerType,
        apiKey,
        endpoint: body?.endpoint ?? null,
        apiVersion: body?.apiVersion ?? null,
        billingEmail: body?.billingEmail ?? null,
        description: body?.description ?? null,
        isActive: body?.isActive !== false,
      },
      actorUserId: session.userId,
    });
    return NextResponse.json({ success: true, account });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

