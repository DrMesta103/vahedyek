import { NextResponse } from 'next/server';
import { verifyPlatformAdmin } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type AdminVerifyPayload = { username?: string; password?: string };

export async function POST(request: Request) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as AdminVerifyPayload | null;
  const username = body?.username?.trim() ?? '';
  const password = body?.password ?? '';

  if (!username || !password) {
    return NextResponse.json({ message: 'نام کاربری و رمز عبور الزامی است.' }, { status: 400 });
  }

  try {
    const valid = await verifyPlatformAdmin(username, password);
    if (!valid) {
      return NextResponse.json({ message: 'نام کاربری یا رمز عبور اشتباه است.' }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
