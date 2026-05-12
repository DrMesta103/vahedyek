import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import { prisma } from '../../../../lib/prisma';
import { fetchContractViewForAppendix, resolveAppendixCompareBase, serializeAppendixRecord } from '../../../../lib/appendixServer';
import type { AppendixTagKey } from '../../../../types/contract';
import { CONTRACT_APPENDIX_TAG_MAP } from '../../../../lib/contractAppendixConfig';

export async function GET(request: Request, context: { params: Promise<{ appendixId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;
    const { appendixId } = await context.params;
    const tag = new URL(request.url).searchParams.get('tag') as AppendixTagKey | null;
    if (!tag || !CONTRACT_APPENDIX_TAG_MAP.has(tag)) {
      return NextResponse.json({ message: 'تگ متمم معتبر نیست.' }, { status: 400 });
    }

    const appendix = await prisma.contractAppendix.findFirst({
      where: { id: appendixId, tenantId: session.tenantId },
      include: { items: { orderBy: [{ groupKey: 'asc' }, { createdAt: 'asc' }] } },
    });
    if (!appendix) return NextResponse.json({ message: 'متمم یافت نشد.' }, { status: 404 });
    const contract = await fetchContractViewForAppendix(session.tenantId, appendix.draftId);
    if (!contract) return NextResponse.json({ message: 'قرارداد پایه یافت نشد.' }, { status: 404 });
    const compareBase = await resolveAppendixCompareBase(session.tenantId, appendix, contract);

    if (compareBase.appendix) {
      const item = serializeAppendixRecord(compareBase.appendix).items.find((entry) => entry.tagKey === tag) ?? null;
      return NextResponse.json({
        sourceKind: 'appendix',
        sourceLabel: compareBase.sourceLabel,
        item,
      });
    }

    const payload =
      tag === 'unit-delivery-date'
        ? { deliveryDate: contract.data.subject.deliveryDate ?? '' }
        : tag === 'first-party'
          ? { parties: contract.data.parties.partyOne ?? [] }
          : { parties: contract.data.parties.partyTwo ?? [] };

    return NextResponse.json({
      sourceKind: 'contract',
      sourceLabel: compareBase.sourceLabel,
      item: {
        tagKey: tag,
        title: CONTRACT_APPENDIX_TAG_MAP.get(tag)?.title ?? tag,
        payload,
      },
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
