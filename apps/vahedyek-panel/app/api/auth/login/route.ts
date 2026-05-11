import { NextResponse } from 'next/server';
import { recordAuditLog } from '../../../lib/audit-log';
import { parseAuthIdentifier } from '../../../lib/contact';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function POST(request: Request) {
  try {
    const [{ createPendingSession, setAuthCookie, verifyPassword }, { prisma }] = await Promise.all([
      import('../../../lib/auth'),
      import('../../../lib/prisma'),
    ]);

    const body = (await request.json()) as { identifier?: string; password?: string };

    const identifier = parseAuthIdentifier(body.identifier ?? '');
    const password = body.password ?? '';

    if (!body.identifier?.trim() || !password) {
      return NextResponse.json({ message: 'ایمیل یا موبایل و رمز عبور الزامی است.' }, { status: 400 });
    }

    if (identifier.type === 'unknown') {
      return NextResponse.json({ message: 'ایمیل یا شماره موبایل صحیح وارد کنید.' }, { status: 400 });
    }

    const user =
      identifier.type === 'email'
        ? await prisma.appUser.findUnique({ where: { email: identifier.value } })
        : await prisma.appUser.findUnique({ where: { mobile: identifier.value } });

    if (!user) {
      return NextResponse.json({ message: 'کاربر با این مشخصات پیدا نشد.' }, { status: 404 });
    }

    const valid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!valid) {
      return NextResponse.json({ message: 'رمز عبور اشتباه است.' }, { status: 401 });
    }

    const session = await createPendingSession(user.id);
    const membership = await prisma.userTenantMembership.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      select: { tenantId: true },
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, fullName: user.fullName, email: user.email, mobile: user.mobile },
    });
    setAuthCookie(response, session);
    if (membership?.tenantId) {
      await recordAuditLog({
        tenantId: membership.tenantId,
        actorUserId: user.id,
        actorName: user.fullName,
        action: 'auth.login',
        entityType: 'auth',
        entityId: user.id,
        entityLabel: user.fullName,
        summary: `${user.fullName} وارد سامانه شد.`,
        details: { identifierType: identifier.type },
        request,
      });
    }

    return response;
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
