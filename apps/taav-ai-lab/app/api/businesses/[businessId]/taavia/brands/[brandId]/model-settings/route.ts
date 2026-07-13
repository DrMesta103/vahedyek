import { NextResponse } from 'next/server';
import {
  getBrandModelSettings,
  parseAiProviderModelType,
  updateTaaviaBrandModelPreferences,
} from '@/app/lib/data';
import { getOptionalSession } from '@/app/lib/session';
import type { BrandToolModelType } from '@/app/lib/types/domain';

type RouteContext = { params: Promise<{ businessId: string; brandId: string }> };

type UpdateModelSettingsPayload = {
  modelPreferences?: Partial<Record<BrandToolModelType, string>>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;
  const payload = await getBrandModelSettings(session.userId, businessId, brandId);
  if (!payload) {
    return NextResponse.json({ message: 'برند پیدا نشد یا دسترسی ندارید.' }, { status: 404 });
  }

  return NextResponse.json(payload, { status: 200 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;
  const body = (await request.json().catch(() => null)) as UpdateModelSettingsPayload | null;
  const modelPreferences = Object.fromEntries(
    Object.entries(body?.modelPreferences ?? {}).flatMap(([key, value]) => {
      const modelType = parseAiProviderModelType(key);
      if (!modelType || typeof value !== 'string') return [];
      const trimmed = value.trim();
      if (!trimmed) return [];
      return [[modelType, trimmed]];
    }),
  ) as Partial<Record<BrandToolModelType, string>>;

  const settings = await getBrandModelSettings(session.userId, businessId, brandId);
  if (!settings) {
    return NextResponse.json({ message: 'برند پیدا نشد یا دسترسی ندارید.' }, { status: 404 });
  }

  const sectionsByType = new Map(settings.sections.map((section) => [section.type, section]));
  for (const [type, modelId] of Object.entries(modelPreferences) as Array<[BrandToolModelType, string]>) {
    const section = sectionsByType.get(type);
    if (!section) {
      return NextResponse.json({ message: `برای ابزار ${type} مدل فعالی در تاو ادمین موجود نیست.` }, { status: 400 });
    }

    const isValidChoice = section.models.some((model) => model.id === modelId);
    if (!isValidChoice) {
      return NextResponse.json({ message: `مدل انتخاب‌شده برای ابزار ${type} معتبر نیست.` }, { status: 400 });
    }
  }

  const brand = await updateTaaviaBrandModelPreferences(session.userId, businessId, brandId, modelPreferences);
  if (!brand) {
    return NextResponse.json({ message: 'ذخیره تنظیمات مدل انجام نشد.' }, { status: 404 });
  }

  const payload = await getBrandModelSettings(session.userId, businessId, brandId);
  if (!payload) {
    return NextResponse.json({ message: 'ذخیره انجام شد اما بارگذاری مجدد تنظیمات ناموفق بود.' }, { status: 500 });
  }

  return NextResponse.json(payload, { status: 200 });
}
