import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

const SETUP_MESSAGE =
  'جدول‌های دیتابیس هنوز ساخته نشده‌اند. این دستورها را اجرا کنید: npm run prisma:generate سپس npm run prisma:migrate و در آخر npm run db:seed';

export function handlePrismaApiError(error: unknown) {
  if (error instanceof Error && error.message.includes('Missing DATABASE_URL')) {
    return NextResponse.json(
      {
        error: 'missing_database_url',
        message: 'فایل apps/taav-ai-lab/.env ساخته نشده یا DATABASE_URL داخل آن تنظیم نشده است.',
      },
      { status: 500 },
    );
  }

  if (error instanceof Error && error.message.includes("Can't reach database server")) {
    return NextResponse.json(
      {
        error: 'database_unreachable',
        message: 'اتصال به دیتابیس برقرار نشد. آدرس یا پورت DATABASE_URL را بررسی کنید.',
      },
      { status: 500 },
    );
  }

  if (error instanceof PrismaClientKnownRequestError && error.code === 'P2021') {
    return NextResponse.json(
      { error: 'database_not_initialized', message: SETUP_MESSAGE },
      { status: 500 },
    );
  }

  if (process.env.NODE_ENV === 'development') {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'internal_server_error', message: 'خطایی در ارتباط با دیتابیس رخ داده است.', debug: message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { error: 'internal_server_error', message: 'خطایی در ارتباط با دیتابیس رخ داده است.' },
    { status: 500 },
  );
}
