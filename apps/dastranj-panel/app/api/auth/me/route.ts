import { NextResponse } from 'next/server';
import { getSessionContext } from '../../../lib/auth';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function GET() {
  try {
    const session = await getSessionContext();
    if (!session) return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });

    return NextResponse.json({
      user: {
        id: session.userId,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        fullName: session.user.fullName,
        email: session.user.email,
        mobile: session.user.mobile,
      },
      membership: null,
      access: null,
      tenant: session.tenant
        ? {
            id: session.tenant.id,
            name: session.tenant.name,
            slug: session.tenant.slug,
            brandCode: session.tenant.brandCode,
          }
        : null,
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
