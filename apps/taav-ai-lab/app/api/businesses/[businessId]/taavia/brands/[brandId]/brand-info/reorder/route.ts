import { NextResponse } from 'next/server';
import { getOptionalSession } from '@/app/lib/session';
import { reorderBrandInfo } from '@/app/lib/brand-info/service';
import { BrandInfoError } from '@/app/lib/brand-info/errors';

export async function PUT(request: Request, context: { params: Promise<{ businessId: string; brandId: string }> }) {
  const session = await getOptionalSession(); if (!session) return NextResponse.json({ message: 'ورود الزامی است.' }, { status: 401 });
  try { const p = await context.params; const body = await request.json(); return NextResponse.json({ items: await reorderBrandInfo(session.userId, { tenantId: p.businessId, brandId: p.brandId, ids: Array.isArray(body.ids) ? body.ids : [] }) }); } catch (error) { return error instanceof BrandInfoError ? NextResponse.json({ code: error.code, message: error.message }, { status: error.status }) : NextResponse.json({ message: 'خطای داخلی رخ داد.' }, { status: 500 }); }
}
