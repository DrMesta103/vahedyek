import { NextResponse } from 'next/server';
import { getSessionContext } from '../../../lib/auth';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function GET() {
  try {
    const session = await getSessionContext();

    if (!session) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        fullName: session.user.fullName,
        email: session.user.email,
      },
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
