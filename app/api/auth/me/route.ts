import { NextResponse } from 'next/server';
import { getMembershipAccess } from '../../../lib/access-control';
import { getSessionContext } from '../../../lib/auth';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function GET() {
  try {
    const session = await getSessionContext();

    if (!session) {
      return NextResponse.json(null);
    }

    let access: Awaited<ReturnType<typeof getMembershipAccess>> = null;

    if (session.tenantId) {
      try {
        access = await getMembershipAccess(session.user.id, session.tenantId);
      } catch (accessError) {
        console.error('Access control lookup failed. Run Prisma migration for RBAC tables.', accessError);
      }
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        fullName: session.user.fullName,
        email: session.user.email,
      },
      membership: access
        ? {
            id: access.membership.id,
            role: access.membership.role,
            roleLabels: access.roleLabels,
          }
        : null,
      access: access
        ? {
            isOwner: access.isOwner,
            allowedMenuItemIds: access.allowedMenuItemIds,
          }
        : null,
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
