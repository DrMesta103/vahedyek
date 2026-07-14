import { NextResponse } from 'next/server';
import { createTaaviaBrandForTenant, getTaaviaBrandsForTenant } from '@/app/lib/data';
import { getOptionalSession } from '@/app/lib/session';

type RouteContext = { params: Promise<{ businessId: string }> };

type CreateBrandPayload = {
  name?: string;
  description?: string | null;
  icon?: { extension?: string | null; sizeBytes?: number | null; previewData?: string | null; storageUrl?: string | null } | null;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId } = await context.params;
  const brands = await getTaaviaBrandsForTenant(session.userId, businessId);
  return NextResponse.json({ brands, source: 'database' });
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId } = await context.params;
  const body = (await request.json().catch(() => null)) as CreateBrandPayload | null;
  const name = body?.name?.trim() ?? '';
  if (!name) {
    return NextResponse.json({ message: 'نام برند الزامی است.' }, { status: 400 });
  }

  const brand = await createTaaviaBrandForTenant(session.userId, { tenantId: businessId, name, description: body?.description, icon: body?.icon });
  if (!brand) {
    return NextResponse.json({ message: 'این کسب‌وکار برای شما در دسترس نیست.' }, { status: 404 });
  }

  return NextResponse.json({ brand, source: 'database' }, { status: 201 });
}
