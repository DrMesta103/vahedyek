import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import { prisma } from '../../../../lib/prisma';
import { fetchContractViewForAppendix, serializeAppendixRecord } from '../../../../lib/appendixServer';
import { buildAppendixHistorySections } from '../../../../lib/appendixLifecycle';

export async function GET(_: Request, context: { params: Promise<{ appendixId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;
    const { appendixId } = await context.params;

    const appendix = await prisma.contractAppendix.findFirst({
      where: { id: appendixId, tenantId: session.tenantId },
      include: {
        items: { orderBy: [{ groupKey: 'asc' }, { createdAt: 'asc' }] },
        approvalInstance: { select: { currentStepIndex: true } },
      },
    });
    if (!appendix) return NextResponse.json({ message: 'متمم یافت نشد.' }, { status: 404 });

    const contract = await fetchContractViewForAppendix(session.tenantId, appendix.draftId);
    if (!contract) return NextResponse.json({ message: 'قرارداد پایه یافت نشد.' }, { status: 404 });

    const approvedAppendicesRaw = await prisma.contractAppendix.findMany({
      where: {
        tenantId: session.tenantId,
        draftId: appendix.draftId,
        status: 'APPROVED',
        appendixNumber: { lte: appendix.appendixNumber },
      },
      orderBy: { appendixNumber: 'asc' },
      include: {
        items: { orderBy: [{ groupKey: 'asc' }, { createdAt: 'asc' }] },
        approvalInstance: { select: { currentStepIndex: true } },
      },
    });

    const current = serializeAppendixRecord(appendix);
    const approvedAppendices = approvedAppendicesRaw.map(serializeAppendixRecord);
    const sections = buildAppendixHistorySections({
      current,
      approvedAppendices,
      contract,
    });

    return NextResponse.json({
      current,
      sections,
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
