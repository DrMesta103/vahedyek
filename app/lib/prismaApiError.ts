import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

const SETUP_MESSAGE =
  'جدول‌های دیتابیس هنوز ساخته نشده‌اند. این دستورها را اجرا کنید: npm run prisma:generate سپس npm run prisma:push و در آخر npm run db:seed';

export function handlePrismaApiError(error: unknown) {
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

  return NextResponse.json(
    {
      error: 'internal_server_error',
      message: 'خطایی در ارتباط با دیتابیس رخ داده است.',
    },
    { status: 500 },
  );
}
