import { NextResponse } from 'next/server';
import { createAuthToken, setAuthCookie } from '@/app/lib/auth-token';
import { getOptionalSession } from '@/app/lib/session';
import { getTenantForUser } from '@/app/lib/data';

type SelectTenantPayload = { tenantId?: string };

export async function POST(request: Request) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as SelectTenantPayload | null;
  if (!body?.tenantId) {
    return NextResponse.json({ message: 'tenantId الزامی است.' }, { status: 400 });
  }

  const tenant = await getTenantForUser(session.userId, body.tenantId);
  if (!tenant) {
    return NextResponse.json({ message: 'دسترسی به این کسب‌وکار وجود ندارد.' }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });
  const token = await createAuthToken({
    userId: session.userId,
    email: session.email,
    fullName: session.fullName,
    mobile: session.mobile,
    activeTenantId: tenant.id,
  });
  setAuthCookie(response, token);
  return response;
}
