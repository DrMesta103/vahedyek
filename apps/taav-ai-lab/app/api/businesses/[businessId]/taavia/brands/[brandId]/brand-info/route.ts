import { NextResponse } from 'next/server';
import { getOptionalSession } from '@/app/lib/session';
import { BrandInfoError } from '@/app/lib/brand-info/errors';
import { createMediaBrandInfo, createTextBrandInfo, listBrandInfo } from '@/app/lib/brand-info/service';
import { isBrandInfoType } from '@/app/lib/brand-info/validation';
import type { BrandInfoStatus, BrandInfoType } from '@/app/lib/brand-info/types';

type Context = { params: Promise<{ businessId: string; brandId: string }> };

function errorResponse(error: unknown) {
  if (error instanceof BrandInfoError) return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
  console.error(error);
  return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'خطای داخلی رخ داد.' }, { status: 500 });
}

export async function GET(request: Request, context: Context) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'ورود الزامی است.' }, { status: 401 });
  try {
    const { businessId, brandId } = await context.params;
    const url = new URL(request.url);
    const rawStatus = url.searchParams.get('status');
    const rawType = url.searchParams.get('type');
    const status = rawStatus === 'ACTIVE' || rawStatus === 'ARCHIVED' ? rawStatus as BrandInfoStatus : undefined;
    const type = isBrandInfoType(rawType) ? rawType as BrandInfoType : undefined;
    const items = await listBrandInfo(session.userId, businessId, brandId, { status: status ?? undefined, type: type ?? undefined, search: url.searchParams.get('search') ?? undefined });
    return NextResponse.json({ items });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request, context: Context) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'ورود الزامی است.' }, { status: 401 });
  try {
    const { businessId, brandId } = await context.params;
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const type = String(form.get('type') ?? '') as Exclude<BrandInfoType, 'TEXT'>;
      const file = form.get('file');
      if (!(file instanceof File)) throw new BrandInfoError('VALIDATION', 'فایل الزامی است.');
      const result = await createMediaBrandInfo(session.userId, { tenantId: businessId, brandId, type, title: String(form.get('title') ?? ''), file });
      return NextResponse.json(result, { status: 201 });
    }
    const body = await request.json();
    const result = await createTextBrandInfo(session.userId, { tenantId: businessId, brandId, title: body.title, textContent: body.textContent });
    return NextResponse.json(result, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
