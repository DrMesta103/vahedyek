import { NextResponse } from 'next/server';
import { getOptionalSession } from '@/app/lib/session';
import { reactivateBrandInfo } from '@/app/lib/brand-info/service';
import { BrandInfoError } from '@/app/lib/brand-info/errors';

export async function POST(request: Request, context: { params: Promise<{ businessId: string; brandId: string; brandInfoId: string }> }) {
  const session = await getOptionalSession(); if (!session) return NextResponse.json({ message: 'ورود الزامی است.' }, { status: 401 });
  try { const p = await context.params; const body = await request.json(); return NextResponse.json(await reactivateBrandInfo(session.userId, { tenantId: p.businessId, brandId: p.brandId, id: p.brandInfoId, expectedRevision: body.expectedRevision })); } catch (error) { return error instanceof BrandInfoError ? NextResponse.json({ code: error.code, message: error.message, ...('current' in error ? { current: (error as { current: unknown }).current } : {}) }, { status: error.status }) : NextResponse.json({ message: 'خطای داخلی رخ داد.' }, { status: 500 }); }
}
