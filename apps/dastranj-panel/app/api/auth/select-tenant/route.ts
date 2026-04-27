import { NextResponse } from 'next/server';
import { createSession, getSessionContext, setAuthCookie } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session) return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });

    const body = (await request.json()) as { tenantId?: string };
    if (!body.tenantId) return NextResponse.json({ message: 'tenantId الزامی است.' }, { status: 400 });

    const membership = await prisma.userTenantMembership.findUnique({
      where: { userId_tenantId: { userId: session.userId, tenantId: body.tenantId } },
    });
    if (!membership) return NextResponse.json({ message: 'دسترسی به این کسب‌وکار وجود ندارد.' }, { status: 403 });

    const newSession = await createSession(session.userId, body.tenantId);
    const response = NextResponse.json({ success: true });
    setAuthCookie(response, newSession);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'خطای سرور' }, { status: 500 });
  }
}
