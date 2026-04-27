import { NextResponse } from 'next/server';
import { hashPassword } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { fullName?: string; email?: string; password?: string };
    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? '';

    if (!fullName || !email || !password) {
      return NextResponse.json({ message: 'نام، ایمیل و رمز عبور الزامی است.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' }, { status: 400 });
    }

    const existing = await prisma.appUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'این ایمیل قبلاً ثبت شده است.' }, { status: 409 });
    }

    const { passwordHash, passwordSalt } = hashPassword(password);
    const user = await prisma.appUser.create({ data: { fullName, email, passwordHash, passwordSalt } });

    return NextResponse.json({ success: true, user: { id: user.id, fullName: user.fullName, email: user.email } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'خطای سرور' }, { status: 500 });
  }
}
