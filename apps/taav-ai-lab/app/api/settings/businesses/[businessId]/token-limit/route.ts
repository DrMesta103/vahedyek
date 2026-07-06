import { NextResponse } from 'next/server';
import { updateTenantTokenLimit } from '@/app/lib/data';
import { prisma } from '@/app/lib/prisma';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type RouteContext = {
  params: Promise<{ businessId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId } = await context.params;
  const body = (await request.json().catch(() => null)) as { tokenLimit?: number | string } | null;
  const tokenLimit = Number(body?.tokenLimit);

  if (!businessId) {
    return NextResponse.json({ message: 'شناسه کسب‌وکار نامعتبر است.' }, { status: 400 });
  }

  if (!Number.isFinite(tokenLimit) || tokenLimit < 0 || !Number.isInteger(tokenLimit)) {
    return NextResponse.json({ message: 'مقدار سقف توکن نامعتبر است.' }, { status: 400 });
  }

  try {
    const existing = await prisma.tenant.findUnique({ where: { id: businessId }, select: { usedTokens: true } });
    if (!existing) {
      return NextResponse.json({ message: 'کسب‌وکار یافت نشد.' }, { status: 404 });
    }

    if (tokenLimit > 0 && tokenLimit < existing.usedTokens) {
      return NextResponse.json(
        { message: 'سقف جدید نمی‌تواند کمتر از میزان مصرف‌شده باشد.' },
        { status: 400 },
      );
    }

    const business = await updateTenantTokenLimit(businessId, tokenLimit);
    if (!business) {
      return NextResponse.json({ message: 'کسب‌وکار یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json({ business });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
