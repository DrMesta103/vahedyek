import { NextResponse } from 'next/server';
import { isValidIranMobile, parseAuthIdentifier, sanitizeIranMobileInput } from '@/app/lib/contact';
import { createAuthToken, setAuthCookie } from '@/app/lib/auth-token';
import { createSimulatorUser, getUserByIdentifier } from '@/app/lib/simulator-store';

type RegisterPayload = {
  firstName?: string;
  lastName?: string;
  identifier?: string;
  mobile?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RegisterPayload | null;
  const firstName = (body?.firstName ?? '').trim();
  const lastName = (body?.lastName ?? '').trim();
  const identifier = parseAuthIdentifier(body?.identifier ?? '');
  const providedMobile = sanitizeIranMobileInput(body?.mobile ?? '');
  const password = body?.password ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  if (!firstName || !lastName || !body?.identifier?.trim() || !password) {
    return NextResponse.json({ message: 'نام، نام خانوادگی، ایمیل یا موبایل و رمز عبور الزامی است.' }, { status: 400 });
  }

  if (identifier.type === 'unknown') {
    return NextResponse.json({ message: 'ایمیل یا شماره موبایل صحیح وارد کنید.' }, { status: 400 });
  }

  if (identifier.type === 'email' && !isValidIranMobile(providedMobile)) {
    return NextResponse.json({ message: 'برای ثبت‌نام با ایمیل، شماره موبایل ۱۰ رقمی معتبر هم الزامی است.' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' }, { status: 400 });
  }

  const existingIdentity = await getUserByIdentifier(identifier.value);
  const existingMobile = identifier.type === 'email' && providedMobile ? await getUserByIdentifier(providedMobile) : null;

  if (existingIdentity || existingMobile) {
    return NextResponse.json({ message: 'این ایمیل یا شماره موبایل قبلا ثبت شده است.' }, { status: 409 });
  }

  const user = await createSimulatorUser({
    firstName,
    lastName,
    identifier: identifier.value,
    mobile: identifier.type === 'email' ? providedMobile : undefined,
    password,
  });

  const session = await createAuthToken({
    userId: user.id,
    email: user.email ?? '',
    fullName: user.fullName,
    mobile: user.mobile,
    activeTenantId: null,
  });

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, fullName: user.fullName, email: user.email, mobile: user.mobile },
  });

  setAuthCookie(response, session);
  return response;
}
