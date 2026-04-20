import { NextResponse } from 'next/server';
import { createSession, getSessionContext, setAuthCookie } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });
    }

    const body = (await request.json()) as { name?: string; slug?: string; brandCode?: string };
    const { name, slug, brandCode } = body;

    if (!name || !slug) {
      return NextResponse.json({ message: 'نام و شناسه کسب‌وکار الزامی است.' }, { status: 400 });
    }

    const slugClean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const existing = await prisma.tenant.findUnique({ where: { slug: slugClean } });
    if (existing) {
      return NextResponse.json({ message: 'این شناسه قبلاً استفاده شده است.' }, { status: 409 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        slug: slugClean,
        name: name.trim(),
        brandCode: brandCode?.trim().toUpperCase() || 'VN',
        memberships: { create: { userId: session.userId, role: 'owner' } },
      },
    });

    const newSession = await createSession(session.userId, tenant.id);

    const response = NextResponse.json({ success: true });
    setAuthCookie(response, newSession);

    return response;
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
