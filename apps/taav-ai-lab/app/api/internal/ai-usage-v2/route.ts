import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import { recordAiProviderModelUsageV2, type RecordAiProviderModelUsageV2Input } from '@/app/lib/repositories/ai-provider-model-usage-v2';

export async function POST(request: Request) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as RecordAiProviderModelUsageV2Input | null;
  if (!body) return NextResponse.json({ message: 'بدنه درخواست معتبر نیست.' }, { status: 400 });

  try {
    const result = await recordAiProviderModelUsageV2({ data: body });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

