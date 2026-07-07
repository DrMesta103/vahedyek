import { NextResponse } from 'next/server';
import { createUserForAdmin, updateUserForAdmin } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type UserPayload = {
  userId?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  password?: string;
  avatarUrl?: string | null;
  tenantId?: string | null;
  systemUser?: boolean;
  isActive?: boolean;
};

const VALIDATION_MESSAGES = new Set([
  'نام و نام خانوادگی الزامی است.',
  'شماره موبایل معتبر نیست.',
  'رمز عبور باید حداقل 6 کاراکتر باشد.',
  'کاربر سیستمی نباید کسب‌وکار داشته باشد.',
  'انتخاب کسب‌وکار یا گزینه سیستم تاو الزامی است.',
  'کسب‌وکار انتخاب‌شده معتبر نیست.',
  'این شماره موبایل قبلاً ثبت شده است.',
  'شناسه کاربر معتبر نیست.',
  'کاربر انتخاب‌شده معتبر نیست.',
]);

export async function POST(request: Request) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as UserPayload | null;

  try {
    const user = await createUserForAdmin({
      firstName: body?.firstName ?? '',
      lastName: body?.lastName ?? '',
      mobile: body?.mobile ?? '',
      password: body?.password ?? '',
      avatarUrl: body?.avatarUrl ?? null,
      tenantId: body?.tenantId ?? null,
      systemUser: body?.systemUser === true,
      isActive: body?.isActive !== false,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    if (error instanceof Error && VALIDATION_MESSAGES.has(error.message)) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return handlePrismaApiError(error);
  }
}

export async function PATCH(request: Request) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as UserPayload | null;

  try {
    const user = await updateUserForAdmin({
      userId: body?.userId ?? '',
      firstName: body?.firstName ?? '',
      lastName: body?.lastName ?? '',
      avatarUrl: body?.avatarUrl ?? null,
      tenantId: body?.tenantId ?? null,
      systemUser: body?.systemUser === true,
      isActive: body?.isActive !== false,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    if (error instanceof Error && VALIDATION_MESSAGES.has(error.message)) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return handlePrismaApiError(error);
  }
}
