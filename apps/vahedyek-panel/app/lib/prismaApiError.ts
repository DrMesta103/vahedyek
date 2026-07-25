import { Prisma } from '@/lib/prisma-client';
import { NextResponse } from 'next/server';

const SETUP_MESSAGE =
  'جدول‌های دیتابیس هنوز ساخته نشده‌اند. در ریشه پروژه اجرا کنید: npm --workspace @apps/vahedyek-panel run prisma:generate سپس npm --workspace @apps/vahedyek-panel run prisma:push و در آخر npm --workspace @apps/vahedyek-panel run db:seed';

export const DATABASE_UNREACHABLE_MESSAGE =
  'اتصال به دیتابیس برقرار نشد. آدرس، پورت و دسترسی شبکه DATABASE_URL را بررسی کنید. تا وقتی دیتابیس از این محیط در دسترس نباشد، prisma:push و db:seed قابل اجرا نیستند.';

export function isDatabaseUnreachableError(error: unknown) {
  if (
    error instanceof Error &&
    (error.message.includes("Can't reach database server") ||
      error.message.includes('Timed out fetching a new connection') ||
      error.message.includes('connect ETIMEDOUT') ||
      error.message.includes('ECONNREFUSED'))
  ) {
    return true;
  }

  return (
    error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P1001' || error.code === 'P1002')
  );
}

export function handlePrismaApiError(error: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[prisma-api-error]', error);
  }

  if (error instanceof Error && error.message.includes('Missing DATABASE_URL')) {
    return NextResponse.json(
      {
        error: 'missing_database_url',
        message: 'فایل apps/vahedyek-panel/.env ساخته نشده یا DATABASE_URL داخل آن تنظیم نشده است.',
      },
      { status: 500 },
    );
  }

  if (isDatabaseUnreachableError(error)) {
    return NextResponse.json(
      {
        error: 'database_unreachable',
        message: DATABASE_UNREACHABLE_MESSAGE,
      },
      { status: 500 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2021') {
      return NextResponse.json(
        {
          error: 'database_not_initialized',
          message: SETUP_MESSAGE,
        },
        { status: 500 },
      );
    }
  }

  if (process.env.NODE_ENV === 'development') {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'internal_server_error',
        message: 'خطایی در ارتباط با دیتابیس رخ داده است.',
        debug: message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      error: 'internal_server_error',
      message: 'خطایی در ارتباط با دیتابیس رخ داده است.',
    },
    { status: 500 },
  );
}
