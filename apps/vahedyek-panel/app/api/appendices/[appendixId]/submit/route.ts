import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import { submitAppendixApprovalWorkflow } from '../../../../lib/appendixApprovalCore';

export async function POST(_: Request, context: { params: Promise<{ appendixId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;
    const { appendixId } = await context.params;
    const result = await submitAppendixApprovalWorkflow({
      tenantId: session.tenantId,
      userId: session.userId,
      actorName: session.user.fullName,
      appendixId,
    });
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
