import { NextResponse } from 'next/server';
import { getTaaviaManualWorkspace, saveTaaviaManualWorkspace } from '@/app/lib/repositories/taavia-workspace';
import { handlePrismaApiError } from '@/app/lib/prismaApiError';
import { getOptionalSession } from '@/app/lib/session';
import type { TaaviaWorkspaceSnapshot } from '@/app/lib/types/taavia-workspace';

type RouteContext = { params: Promise<{ businessId: string; brandId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;

  try {
    const workspace = await getTaaviaManualWorkspace(session.userId, businessId, brandId);
    return NextResponse.json({ workspace, source: 'database' });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;
  const body = (await request.json().catch(() => null)) as { workspace?: TaaviaWorkspaceSnapshot } | null;

  if (!body?.workspace) {
    return NextResponse.json({ message: 'داده workspace نامعتبر است.' }, { status: 400 });
  }

  try {
    const workspace = await saveTaaviaManualWorkspace(session.userId, businessId, brandId, body.workspace);
    if (!workspace) {
      return NextResponse.json({ message: 'برند پیدا نشد یا دسترسی ندارید.' }, { status: 404 });
    }
    return NextResponse.json({ workspace, source: 'database' });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
