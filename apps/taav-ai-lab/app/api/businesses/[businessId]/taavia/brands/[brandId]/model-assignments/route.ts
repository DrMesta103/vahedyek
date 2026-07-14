import { NextResponse } from 'next/server';
import { getOptionalSession } from '@/app/lib/session';
import { assignTaaviaBrandModel, getTaaviaBrandModelAssignments } from '@/app/lib/repositories/taavia-brand-model-assignments';

type Context = { params: Promise<{ businessId: string; brandId: string }> };

export async function GET(_request: Request, context: Context) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  const { businessId, brandId } = await context.params;
  try {
    return NextResponse.json(await getTaaviaBrandModelAssignments(session.userId, businessId, brandId));
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'بارگذاری تنظیمات انجام نشد.' }, { status: 404 });
  }
}

export async function POST(request: Request, context: Context) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  const { businessId, brandId } = await context.params;
  const body = (await request.json().catch(() => null)) as { purpose?: string; aiProviderAccountId?: string; aiProviderModelId?: string } | null;
  if (!body?.purpose || !body.aiProviderAccountId || !body.aiProviderModelId) return NextResponse.json({ message: 'Purpose، حساب و مدل الزامی هستند.' }, { status: 400 });
  try {
    const assignment = await assignTaaviaBrandModel({ userId: session.userId, tenantId: businessId, brandId, purpose: body.purpose, aiProviderAccountId: body.aiProviderAccountId, aiProviderModelId: body.aiProviderModelId });
    return NextResponse.json({ assignment }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'ذخیره تخصیص انجام نشد.' }, { status: 400 });
  }
}
