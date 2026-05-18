import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import { prisma } from '../../../../lib/prisma';
import { fetchContractViewForAppendix, serializeAppendixRecord } from '../../../../lib/appendixServer';
import { buildContractHistoryResponse } from '../../../../lib/contractHistory';

export async function GET(_: Request, context: { params: Promise<{ contractId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;
    const { contractId } = await context.params;

    const contract = await fetchContractViewForAppendix(session.tenantId, contractId);
    if (!contract) return NextResponse.json({ message: 'قرارداد یافت نشد.' }, { status: 404 });

    const appendicesRaw = await prisma.contractAppendix.findMany({
      where: {
        tenantId: session.tenantId,
        draftId: contractId,
        status: 'APPROVED',
      },
      orderBy: { appendixNumber: 'asc' },
      include: {
        items: { orderBy: [{ groupKey: 'asc' }, { createdAt: 'asc' }] },
        approvalInstance: { select: { currentStepIndex: true } },
      },
    });

    const appendices = appendicesRaw.map(serializeAppendixRecord);
    const history = buildContractHistoryResponse({ contractId, contract, appendices });

    return NextResponse.json(history);
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
