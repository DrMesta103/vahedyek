import { NextResponse } from 'next/server';
import { getTaaviaBrandForTenant, updateTaaviaBrandModelPreferences } from '@/app/lib/data';
import { getOptionalSession } from '@/app/lib/session';
import type { TaaviaBrandModelServiceKey } from '@/app/lib/types/domain';

type RouteContext = { params: Promise<{ businessId: string; brandId: string }> };

type UpdateModelSettingsPayload = {
  modelPreferences?: Partial<Record<TaaviaBrandModelServiceKey, string>>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;
  const brand = await getTaaviaBrandForTenant(session.userId, businessId, brandId);
  if (!brand) {
    return NextResponse.json({ message: 'برند پیدا نشد یا دسترسی ندارید.' }, { status: 404 });
  }

  return NextResponse.json({ modelPreferences: brand.modelPreferences ?? {}, brandId: brand.id }, { status: 200 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;
  const body = (await request.json().catch(() => null)) as UpdateModelSettingsPayload | null;
  const modelPreferences = body?.modelPreferences ?? {};

  const brand = await updateTaaviaBrandModelPreferences(session.userId, businessId, brandId, modelPreferences);
  if (!brand) {
    return NextResponse.json({ message: 'ذخیره تنظیمات مدل انجام نشد.' }, { status: 404 });
  }

  return NextResponse.json({ brand, modelPreferences: brand.modelPreferences ?? {} }, { status: 200 });
}
