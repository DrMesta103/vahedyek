import { NextResponse } from 'next/server';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import {
  deleteAiProviderAccountV2,
  getAiProviderAccountByIdV2,
  updateAiProviderAccountV2,
} from '@/app/lib/repositories/ai-provider-accounts-v2';

type RouteContext = { params: Promise<{ accountId: string }> };

type UpdatePayload = {
  name?: string;
  endpoint?: string | null;
  apiVersion?: string | null;
  billingEmail?: string | null;
  description?: string | null;
  isActive?: boolean;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId } = await context.params;
  try {
    const account = await getAiProviderAccountByIdV2(accountId);
    if (!account) return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, account });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId } = await context.params;
  const body = (await request.json().catch(() => null)) as UpdatePayload | null;

  try {
    const account = await updateAiProviderAccountV2({
      accountId,
      actorUserId: session.userId,
      data: {
        ...(body?.name !== undefined ? { name: body.name } : {}),
        ...(body?.endpoint !== undefined ? { endpoint: body.endpoint } : {}),
        ...(body?.apiVersion !== undefined ? { apiVersion: body.apiVersion } : {}),
        ...(body?.billingEmail !== undefined ? { billingEmail: body.billingEmail } : {}),
        ...(body?.description !== undefined ? { description: body.description } : {}),
        ...(body?.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      },
    });
    if (!account) return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true, account });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });

  const { accountId } = await context.params;
  try {
    const deleted = await deleteAiProviderAccountV2({ accountId });
    if (!deleted) return NextResponse.json({ message: 'اکانت یافت نشد.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

