import { NextResponse } from 'next/server';
import { createTenantForUser } from '@/app/lib/simulator-store';
import { getOptionalSession } from '@/app/lib/session';

type CreateBusinessPayload = {
  name?: string;
  logoUrl?: string;
  tokenLimit?: number | string;
};

export async function POST(request: Request) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as CreateBusinessPayload | null;
  const name = (body?.name ?? '').trim();
  const logoUrl = (body?.logoUrl ?? '').trim();
  const tokenLimit = Number(body?.tokenLimit);

  if (!name) {
    return NextResponse.json({ message: 'نام کسب‌وکار الزامی است.' }, { status: 400 });
  }

  if (!Number.isFinite(tokenLimit) || tokenLimit <= 0) {
    return NextResponse.json({ message: 'سقف توکن باید عددی بیشتر از صفر باشد.' }, { status: 400 });
  }

  const business = await createTenantForUser(session.userId, {
    name,
    logoUrl,
    tokenLimit,
  });

  return NextResponse.json({ business, simulator: true }, { status: 201 });
}
