import { NextResponse } from 'next/server';
import { parseAuthIdentifier } from '@/app/lib/contact';
import { createAuthToken, setAuthCookie } from '@/app/lib/auth-token';
import { getUserByIdentifier, verifyPassword } from '@/app/lib/simulator-store';

type LoginPayload = { identifier?: string; password?: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginPayload | null;
  const identifier = parseAuthIdentifier(body?.identifier ?? '');
  const password = (body?.password ?? '').trim();

  if (!body?.identifier?.trim() || !password) {
    return NextResponse.json({ message: 'ایمیل یا موبایل و رمز عبور الزامی است.' }, { status: 400 });
  }

  if (identifier.type === 'unknown') {
    return NextResponse.json({ message: 'ایمیل یا شماره موبایل صحیح وارد کنید.' }, { status: 400 });
  }

  const user = await getUserByIdentifier(identifier.value);
  if (!user) {
    return NextResponse.json({ message: 'کاربر با این مشخصات پیدا نشد.' }, { status: 404 });
  }

  if (!verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    return NextResponse.json({ message: 'رمز عبور اشتباه است.' }, { status: 401 });
  }

  const session = await createAuthToken({
    userId: user.id,
    email: user.email ?? '',
    fullName: user.fullName,
    mobile: user.mobile,
    activeTenantId: null,
  });

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
    },
  });

  setAuthCookie(response, session);
  return response;
}
