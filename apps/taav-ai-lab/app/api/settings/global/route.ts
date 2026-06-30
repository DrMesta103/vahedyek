import { NextResponse } from 'next/server';
import { getGlobalSettings } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

export async function GET() {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  try {
    const settings = await getGlobalSettings();
    return NextResponse.json({ settings, source: 'database' });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
