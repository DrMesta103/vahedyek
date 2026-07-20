import { NextResponse } from 'next/server';
import { Readable } from 'node:stream';
import { getOptionalSession } from '@/app/lib/session';
import { BrandInfoError } from '@/app/lib/brand-info/errors';
import { getBrandInfoMedia } from '@/app/lib/brand-info/service';
import { openBrandInfoMedia } from '@/app/lib/brand-info/storage';

export async function GET(request: Request, context: { params: Promise<{ businessId: string; brandId: string; brandInfoId: string }> }) {
  const session = await getOptionalSession(); if (!session) return NextResponse.json({ message: 'ورود الزامی است.' }, { status: 401 });
  try {
    const p = await context.params; const media = await getBrandInfoMedia(session.userId, p.businessId, p.brandId, p.brandInfoId);
    const stream = openBrandInfoMedia(media.streamKey);
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, { headers: { 'Content-Type': media.mimeType, 'Content-Length': String(media.size), 'Content-Disposition': `${new URL(request.url).searchParams.get('mode') === 'preview' ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(media.name)}`, 'Cache-Control': 'private, no-store' } });
  } catch (error) { return error instanceof BrandInfoError ? NextResponse.json({ code: error.code, message: error.message }, { status: error.status }) : NextResponse.json({ message: 'فایل پیدا نشد.' }, { status: 404 }); }
}
