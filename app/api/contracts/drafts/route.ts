import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function POST() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.create({
      data: {
        tenantId: session.tenantId,
      },
      select: { id: true },
    });

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
