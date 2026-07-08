import { NextResponse } from 'next/server';
import { consumeUnreadNotificationsForUser } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

export async function GET() {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });
  }

  try {
    const notifications = await consumeUnreadNotificationsForUser(session.userId);
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
