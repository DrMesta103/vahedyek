import { NextResponse } from 'next/server';
import { createTenantForUser } from '@/app/lib/data';
import { getOptionalSession } from '@/app/lib/session';

// Token limit is managed later from Taav Admin settings; tenant creation stores 0 by default.
const DEFAULT_TOKEN_LIMIT = 0;

type CreateBusinessPayload = {
  name?: string;
  logoUrl?: string;
  firstName?: string;
  lastName?: string;
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
  const ownerFirstName = (body?.firstName ?? '').trim();
  const ownerLastName = (body?.lastName ?? '').trim();
  const tokenLimit = DEFAULT_TOKEN_LIMIT;

  if (!name) {
    return NextResponse.json({ message: 'نام کسب‌وکار الزامی است.' }, { status: 400 });
  }

  if (!ownerFirstName) {
    return NextResponse.json({ message: 'نام صاحب کسب‌وکار الزامی است.' }, { status: 400 });
  }

  if (!ownerLastName) {
    return NextResponse.json({ message: 'نام خانوادگی صاحب کسب‌وکار الزامی است.' }, { status: 400 });
  }

  if (!Number.isFinite(tokenLimit) || tokenLimit < 0) {
    return NextResponse.json({ message: 'مقدار سقف توکن نامعتبر است.' }, { status: 400 });
  }

  const business = await createTenantForUser(session.userId, {
    name,
    logoUrl,
    tokenLimit,
    ownerFirstName,
    ownerLastName,
  });

  return NextResponse.json({ business, source: 'database' }, { status: 201 });
}
