import { NextResponse } from 'next/server';
import { deleteTaaviaBrandForTenant, setTaaviaBrandStatus, updateTaaviaBrandForTenant } from '@/app/lib/data';
import { getOptionalSession } from '@/app/lib/session';

type RouteContext = { params: Promise<{ businessId: string; brandId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;
  const deleted = await deleteTaaviaBrandForTenant(session.userId, businessId, brandId);

  if (!deleted) {
    return NextResponse.json({ message: 'برند پیدا نشد یا دسترسی ندارید.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

type UpdateBrandPayload = {
  name?: string;
  description?: string | null;
  icon?: { extension?: string | null; sizeBytes?: number | null; previewData?: string | null; storageUrl?: string | null } | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }

  const { businessId, brandId } = await context.params;
  const body = (await request.json().catch(() => null)) as UpdateBrandPayload | null;
  if (body?.status) {
    const status = await setTaaviaBrandStatus(session.userId, businessId, brandId, body.status);
    if (!status) return NextResponse.json({ message: 'برند پیدا نشد یا دسترسی ندارید.' }, { status: 404 });
    return NextResponse.json({ brand: status, source: 'database' }, { status: 200 });
  }

  const name = body?.name?.trim() ?? '';
  if (!name) return NextResponse.json({ message: 'نام برند الزامی است.' }, { status: 400 });

  const brand = await updateTaaviaBrandForTenant(session.userId, {
    tenantId: businessId,
    brandId,
    name,
    description: body?.description,
    icon: body?.icon,
  });

  if (!brand) {
    return NextResponse.json({ message: 'برند پیدا نشد یا دسترسی ندارید.' }, { status: 404 });
  }

  return NextResponse.json({ brand, source: 'database' }, { status: 200 });
}
