import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAuthSessionForUser, setAuthCookie } from '@/app/lib/auth';
import { getOptionalSession } from '@/app/lib/session';
import { createTenantForUser } from '@/app/lib/data';

const ALLOWED_PACKAGES = new Set(['starter', 'growth', 'enterprise']);
const ALLOWED_BILLING_CYCLES = new Set(['monthly', 'yearly']);

const PACKAGE_TOKEN_LIMITS: Record<string, number> = {
  starter: 250000,
  growth: 500000,
  enterprise: 1000000,
};

function buildBrandCode(name: string) {
  const cleaned = name.replace(/\s+/g, ' ').trim();
  return cleaned.slice(0, 2).toUpperCase() || 'TA';
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

function createUniqueSlug(name: string) {
  return `${slugifyBusinessName(name)}-${randomUUID().slice(0, 6)}`;
}

export async function POST(request: Request) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    businessName?: string;
    packageId?: string;
    billingCycle?: string;
  } | null;
  const businessName = (body?.businessName ?? '').trim();
  const packageId = (body?.packageId ?? '').trim();
  const billingCycle = (body?.billingCycle ?? '').trim();

  if (!businessName || !packageId || !billingCycle) {
    return NextResponse.json({ message: 'نام کسب‌وکار، پکیج و دوره پرداخت الزامی است.' }, { status: 400 });
  }

  if (!ALLOWED_PACKAGES.has(packageId) || !ALLOWED_BILLING_CYCLES.has(billingCycle)) {
    return NextResponse.json({ message: 'اطلاعات پکیج یا دوره پرداخت معتبر نیست.' }, { status: 400 });
  }

  const tenant = await createTenantForUser(session.userId, {
    name: businessName,
    logoUrl: '',
    tokenLimit: PACKAGE_TOKEN_LIMITS[packageId] ?? PACKAGE_TOKEN_LIMITS.growth,
    slug: createUniqueSlug(businessName),
    brandCode: buildBrandCode(businessName),
    packageKey: packageId,
    billingCycle: billingCycle as 'monthly' | 'yearly',
  });

  const response = NextResponse.json({
    success: true,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug ?? null,
      brandCode: tenant.brandCode ?? null,
      packageKey: tenant.packageKey ?? null,
      billingCycle: tenant.billingCycle ?? null,
    },
  });

  const token = await createAuthSessionForUser(
    {
      id: session.userId,
      email: session.email,
      fullName: session.fullName,
      mobile: session.mobile ?? null,
    },
    tenant.id,
  );
  setAuthCookie(response, token);
  return response;
}
