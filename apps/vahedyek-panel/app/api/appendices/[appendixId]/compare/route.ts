import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import { prisma } from '../../../../lib/prisma';
import { fetchContractViewForAppendix, resolveAppendixCompareBase, serializeAppendixRecord } from '../../../../lib/appendixServer';
import { buildAppendixCompareRows, getContractComparePayload } from '../../../../lib/appendixLifecycle';
import type { SupportedAppendixTagKey } from '../../../../types/contract';

export async function GET(_: Request, context: { params: Promise<{ appendixId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;
    const { appendixId } = await context.params;

    const appendix = await prisma.contractAppendix.findFirst({
      where: { id: appendixId, tenantId: session.tenantId },
      include: { items: { orderBy: [{ groupKey: 'asc' }, { createdAt: 'asc' }] }, approvalInstance: { select: { currentStepIndex: true } } },
    });
    if (!appendix) return NextResponse.json({ message: 'متمم یافت نشد.' }, { status: 404 });

    const contract = await fetchContractViewForAppendix(session.tenantId, appendix.draftId);
    if (!contract) return NextResponse.json({ message: 'قرارداد پایه یافت نشد.' }, { status: 404 });

    const compareBase = await resolveAppendixCompareBase(session.tenantId, appendix, contract);
    const current = serializeAppendixRecord(appendix);
    const rows = buildAppendixCompareRows({
      current,
      previous: compareBase.appendix
        ? {
            sourceKind: 'appendix',
            sourceLabel: compareBase.sourceLabel,
            sourceItem: null,
          }
        : {
            sourceKind: 'contract',
            sourceLabel: compareBase.sourceLabel,
            contractValue: null,
          },
    }).map((row) => {
      if (compareBase.appendix) {
        const previousItem = compareBase.appendix.items.find((item: any) => item.tagKey === row.tagKey) ?? null;
        return {
          ...row,
          previousPayload: previousItem?.payload ?? {},
        };
      }

      return {
        ...row,
        previousPayload: getContractComparePayload(contract, row.tagKey as SupportedAppendixTagKey),
      };
    });

    return NextResponse.json({
      current,
      compareBase: {
        sourceKind: compareBase.sourceKind,
        sourceId: compareBase.sourceId,
        sourceLabel: compareBase.sourceLabel,
      },
      rows,
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
