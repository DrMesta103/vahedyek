import { NextResponse } from 'next/server';
import { createSession, ensureOwnerMembershipRole, ensureTenantDefaultRoles, getSessionContext, setAuthCookie } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session) return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });

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
        brandCode: brandCode?.trim().toUpperCase() || 'DS',
        memberships: { create: { userId: session.userId, role: 'owner' } },
      },
    });

    await ensureTenantDefaultRoles(tenant.id);
    const membership = await prisma.userTenantMembership.findUnique({
      where: { userId_tenantId: { userId: session.userId, tenantId: tenant.id } },
    });
    if (membership) await ensureOwnerMembershipRole(membership.id, tenant.id);

    // Seed default work policies
    await prisma.workPolicy.createMany({
      data: [
        { tenantId: tenant.id, title: 'سیاست استاندارد اداری', description: 'مناسب برای کارمندان اداری با ساعت کاری ثابت', isDefault: true, sectionValues: { manualAttendance: false, overtimeFromAttendance: true, nightWorkStart: '22:00' } },
        { tenantId: tenant.id, title: 'سیاست شیفتی', description: 'مناسب برای کارمندان با شیفت‌های متغیر', isDefault: true, sectionValues: { manualAttendance: false, overtimeFromAttendance: true, nightWorkStart: '22:00' } },
        { tenantId: tenant.id, title: 'سیاست دورکاری', description: 'مناسب برای کارمندان دورکار', isDefault: true, sectionValues: { manualAttendance: true, overtimeFromAttendance: false, nightWorkStart: '22:00' } },
      ],
    });

    const newSession = await createSession(session.userId, tenant.id);
    const response = NextResponse.json({ success: true, tenant: { id: tenant.id, name: tenant.name } });
    setAuthCookie(response, newSession);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'خطای سرور' }, { status: 500 });
  }
}
