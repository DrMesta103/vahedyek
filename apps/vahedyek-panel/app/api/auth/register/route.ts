import { NextResponse } from 'next/server';
import { isValidIranMobile, parseAuthIdentifier, sanitizeIranMobileInput } from '../../../lib/contact';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function POST(request: Request) {
  try {
    const [{ hashPassword }, { prisma }] = await Promise.all([
      import('../../../lib/auth'),
      import('../../../lib/prisma'),
    ]);

    const body = (await request.json()) as { firstName?: string; lastName?: string; identifier?: string; mobile?: string; password?: string };

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const identifier = parseAuthIdentifier(body.identifier ?? '');
    const providedMobile = sanitizeIranMobileInput(body.mobile ?? '');
    const password = body.password ?? '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

    if (!firstName || !lastName || !body.identifier?.trim() || !password) {
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

    const existingIdentity =
      identifier.type === 'email'
        ? await prisma.appUser.findUnique({ where: { email: identifier.value } })
        : await prisma.appUser.findUnique({ where: { mobile: identifier.value } });
    const existingMobile =
      identifier.type === 'email' && providedMobile
        ? await prisma.appUser.findUnique({ where: { mobile: providedMobile } })
        : null;

    if (existingIdentity || existingMobile) {
      return NextResponse.json({ message: 'این ایمیل یا شماره موبایل قبلا ثبت شده است.' }, { status: 409 });
    }

    const { passwordHash, passwordSalt } = hashPassword(password);
    const user = await prisma.appUser.create({
      data: {
        firstName,
        lastName,
        fullName,
        email: identifier.type === 'email' ? identifier.value : null,
        mobile: identifier.type === 'mobile' ? identifier.value : providedMobile,
        passwordHash,
        passwordSalt,
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, fullName: user.fullName, email: user.email, mobile: user.mobile },
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
