import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSessionContext } from '../../../lib/auth';
import { sanitizeIranMobileInput } from '../../../lib/contact';
import { getEmployeeIdsForUser } from '../../../lib/employeeIdentity';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionContext();
    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mobile } = await request.json();
    const normalizedMobile = sanitizeIranMobileInput(mobile ?? '');

    if (!normalizedMobile) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const existingUser = await prisma.appUser.findUnique({
      where: { mobile: normalizedMobile },
      select: { id: true },
    });

    const existing = existingUser
      ? await prisma.employee.findFirst({
          where: {
            tenantId: session.tenantId,
            id: { in: getEmployeeIdsForUser(session.tenantId, existingUser.id) },
          },
        })
      : null;

    return NextResponse.json({ exists: !!existing });
  } catch (error) {
    console.error('Error checking mobile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
