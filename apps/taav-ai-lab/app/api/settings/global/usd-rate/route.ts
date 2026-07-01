import { NextResponse } from 'next/server';
import { updateUsdToToman } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

export async function PATCH(request: Request) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { usdToToman?: number } | null;
  const usdToToman = Number(body?.usdToToman);

  if (!Number.isFinite(usdToToman) || usdToToman <= 0) {
    return NextResponse.json({ message: 'نرخ دلار معتبر نیست.' }, { status: 400 });
  }

  try {
    await updateUsdToToman(Math.round(usdToToman));
    return NextResponse.json({ success: true, usdToToman: Math.round(usdToToman) });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
