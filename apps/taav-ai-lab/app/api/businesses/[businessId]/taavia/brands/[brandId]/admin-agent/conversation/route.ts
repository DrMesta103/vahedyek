import { NextResponse } from 'next/server';
import { getOrCreateAdminAgentConversation } from '@/app/lib/data';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';

type RouteContext = { params: Promise<{ businessId: string; brandId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;

  try {
    const conversation = await getOrCreateAdminAgentConversation(session.userId, businessId, brandId);
    if (!conversation) {
      return NextResponse.json({ message: 'برند یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ conversation, source: 'database' });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
