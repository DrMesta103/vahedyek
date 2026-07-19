import { NextResponse } from 'next/server';
import { getOptionalSession } from '@/app/lib/session';
import { BrandInfoError } from '@/app/lib/brand-info/errors';
import { getBrandInfo, updateBrandInfo } from '@/app/lib/brand-info/service';

type Context = { params: Promise<{ businessId: string; brandId: string; brandInfoId: string }> };

function fail(error: unknown) {
  if (error instanceof BrandInfoError) return NextResponse.json({ code: error.code, message: error.message, ...('current' in error ? { current: (error as { current: unknown }).current } : {}) }, { status: error.status });
  console.error(error); return NextResponse.json({ message: 'خطای داخلی رخ داد.' }, { status: 500 });
}

export async function GET(_request: Request, context: Context) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'ورود الزامی است.' }, { status: 401 });
  try { const p = await context.params; return NextResponse.json({ item: await getBrandInfo(session.userId, p.businessId, p.brandId, p.brandInfoId) }); } catch (error) { return fail(error); }
}

export async function PATCH(request: Request, context: Context) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ message: 'ورود الزامی است.' }, { status: 401 });
  try {
    const p = await context.params;
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      const result = await updateBrandInfo(session.userId, { tenantId: p.businessId, brandId: p.brandId, id: p.brandInfoId, expectedRevision: form.get('expectedRevision'), title: String(form.get('title') ?? ''), file: file instanceof File ? file : null });
      return NextResponse.json(result);
    }
    const body = await request.json();
    const result = await updateBrandInfo(session.userId, { tenantId: p.businessId, brandId: p.brandId, id: p.brandInfoId, expectedRevision: body.expectedRevision, title: body.title, textContent: body.textContent });
    return NextResponse.json(result);
  } catch (error) { return fail(error); }
}
