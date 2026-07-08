import { NextResponse } from 'next/server';
import { sendTestNotificationToUser } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

export async function POST(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const notification = await sendTestNotificationToUser(userId);
    return NextResponse.json({ success: true, notification });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return handlePrismaApiError(error);
  }
}
