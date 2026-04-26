import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function POST(request: Request) {
  try {
    const [{ createPendingSession, setAuthCookie, verifyPassword }, { prisma }] = await Promise.all([
      import('../../../lib/auth'),
      import('../../../lib/prisma'),
    ]);

    const body = (await request.json()) as { email?: string; password?: string };

    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? '';

    if (!email || !password) {
      return NextResponse.json({ message: 'ایمیل و رمز عبور الزامی است.' }, { status: 400 });
    }

    const user = await prisma.appUser.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'کاربر با این مشخصات پیدا نشد.' }, { status: 404 });
    }

    const valid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!valid) {
      return NextResponse.json({ message: 'رمز عبور اشتباه است.' }, { status: 401 });
    }

    // Create a short-lived pending session (no tenant yet)
    const session = await createPendingSession(user.id);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, fullName: user.fullName, email: user.email },
    });
    setAuthCookie(response, session);

    return response;
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
