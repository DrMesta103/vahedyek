import { NextResponse } from 'next/server';
import { getOptionalSession } from '@/app/lib/session';
import { getSuggestedBusinessNames, getTenantsForUser } from '@/app/lib/simulator-store';

export async function GET() {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });
  }

  const [tenants, suggestedBusinessNames] = await Promise.all([
    getTenantsForUser(session.userId),
    getSuggestedBusinessNames(),
  ]);

  return NextResponse.json({
    tenants: tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug ?? '',
      brandCode: tenant.brandCode ?? tenant.name.slice(0, 2).toUpperCase(),
      role: 'owner',
    })),
    suggestedBusinessNames,
  });
}
