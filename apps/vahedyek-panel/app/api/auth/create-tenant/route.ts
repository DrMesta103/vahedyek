import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ensureOwnerMembershipRole, ensureTenantDefaultRoles } from '../../../lib/access-control';
import { createSession, getSessionContext, setAuthCookie } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

const ALLOWED_PACKAGES = new Set(['starter', 'growth', 'enterprise']);
const ALLOWED_BILLING_CYCLES = new Set(['monthly', 'yearly']);

function buildBrandCode(name: string) {
  const cleaned = name.replace(/\s+/g, ' ').trim();
  return cleaned.slice(0, 2).toUpperCase() || 'VN';
}

function slugifyBusinessName(name: string) {
  const ascii = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return ascii || `tenant-${randomUUID().slice(0, 8)}`;
}

async function createUniqueSlug(name: string) {
  const baseSlug = slugifyBusinessName(name);
  const existing = await prisma.tenant.findFirst({ where: { slug: baseSlug }, select: { id: true } });
  if (!existing) return baseSlug;
  return `${baseSlug}-${randomUUID().slice(0, 6)}`;
}

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      businessName?: string;
      packageId?: string;
      billingCycle?: string;
    };

    const businessName = body.businessName?.trim();
    const packageId = body.packageId?.trim();
    const billingCycle = body.billingCycle?.trim();

    if (!businessName || !packageId || !billingCycle) {
      return NextResponse.json({ message: 'نام کسب‌وکار، پکیج و دوره پرداخت الزامی است.' }, { status: 400 });
    }

    if (!ALLOWED_PACKAGES.has(packageId) || !ALLOWED_BILLING_CYCLES.has(billingCycle)) {
      return NextResponse.json({ message: 'اطلاعات پکیج یا دوره پرداخت معتبر نیست.' }, { status: 400 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        slug: await createUniqueSlug(businessName),
        name: businessName,
        brandCode: buildBrandCode(businessName),
        packageKey: packageId,
        billingCycle,
        memberships: { create: { userId: session.userId, role: 'owner' } },
      },
    });

    await ensureTenantDefaultRoles(tenant.id);
    const membership = await prisma.userTenantMembership.findUnique({
      where: { userId_tenantId: { userId: session.userId, tenantId: tenant.id } },
    });
    if (membership) {
      await ensureOwnerMembershipRole(membership.id, tenant.id);
    }

    const newSession = await createSession(session.userId, tenant.id);

    const response = NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        brandCode: tenant.brandCode,
        packageKey: tenant.packageKey,
        billingCycle: tenant.billingCycle,
      },
    });
    setAuthCookie(response, newSession);

    return response;
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
