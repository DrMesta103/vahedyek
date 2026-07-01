import { NextResponse } from 'next/server';
import { getCurrentTenant, getOptionalSession } from '@/app/lib/session';
import { getUserById } from '@/app/lib/data';

export async function GET() {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ message: 'کاربر پیدا نشد.' }, { status: 404 });
  }

  const tenant = await getCurrentTenant();

  return NextResponse.json({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
    },
    membership: null,
    tenant: tenant
      ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug ?? null,
          brandCode: tenant.brandCode ?? null,
        }
      : null,
  });
}
