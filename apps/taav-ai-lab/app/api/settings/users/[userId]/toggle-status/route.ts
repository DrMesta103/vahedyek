import { NextResponse } from 'next/server';
import { toggleUserActiveStatus } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type TogglePayload = { isActive?: boolean };

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { userId } = await params;
  const body = (await request.json().catch(() => null)) as TogglePayload | null;

  if (typeof body?.isActive !== 'boolean') {
    return NextResponse.json({ message: 'وضعیت کاربر معتبر نیست.' }, { status: 400 });
  }

  try {
    const user = await toggleUserActiveStatus(userId, body.isActive);
    if (!user) {
      return NextResponse.json({ message: 'کاربر پیدا نشد.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
