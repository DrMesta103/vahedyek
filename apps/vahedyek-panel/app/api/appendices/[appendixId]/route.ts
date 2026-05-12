import { NextResponse } from 'next/server';
import type { Prisma } from '@/lib/prisma-client';
import { requireSessionContext } from '../../../lib/auth';
import { handlePrismaApiError } from '../../../lib/prismaApiError';
import { prisma } from '../../../lib/prisma';
import { getAppendixTagDefinition } from '../../../lib/contractAppendixConfig';
import { validateShares } from '../../../lib/contractValidation';
import { buildContractBaseline } from '../../../lib/appendixLifecycle';
import { fetchContractViewForAppendix, resolveAppendixCompareBase, sanitizeAppendixPayload, serializeAppendixRecord } from '../../../lib/appendixServer';
import type { CreateContractAppendixInput } from '../../../types/contract';

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
    const compareBase = await resolveAppendixCompareBase(session.tenantId, appendix, contract);

    return NextResponse.json({
      item: serializeAppendixRecord(appendix),
      contract,
      compareBase: {
        sourceKind: compareBase.sourceKind,
        sourceId: compareBase.sourceId,
        sourceLabel: compareBase.sourceLabel,
      },
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ appendixId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;
    const { appendixId } = await context.params;
    const payload = (await request.json()) as CreateContractAppendixInput;

    const appendix = await prisma.contractAppendix.findFirst({
      where: { id: appendixId, tenantId: session.tenantId },
      include: { items: true },
    });
    if (!appendix) return NextResponse.json({ message: 'متمم یافت نشد.' }, { status: 404 });
    if (appendix.status !== 'DRAFT') return NextResponse.json({ message: 'فقط پیش‌نویس متمم قابل ویرایش است.' }, { status: 409 });

    for (const item of payload.items) {
      const def = getAppendixTagDefinition(item.tagKey);
      if (!def) return NextResponse.json({ message: 'تگ متمم معتبر نیست.' }, { status: 400 });
      if (item.tagKey === 'unit-delivery-date') {
        const previousDate = String((item.payload as any)?.previousDate ?? '').trim();
        const nextDate = String((item.payload as any)?.nextDate ?? '').trim();
        if (!previousDate || !nextDate) return NextResponse.json({ message: 'برای متمم تاریخ تحویل واحد باید تاریخ قبلی و جدید ثبت شود.' }, { status: 400 });
      }
      if (item.tagKey === 'first-party' || item.tagKey === 'second-party') {
        const shareMode = (((item.payload as any)?.shareMode ?? 'dang') as 'dang' | 'percent');
        const parties = Array.isArray((item.payload as any)?.parties) ? (item.payload as any).parties : [];
        if (!parties.length || !validateShares(parties, shareMode).valid) {
          return NextResponse.json({ message: 'اطلاعات طرفین متمم معتبر نیست.' }, { status: 400 });
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.contractAppendix.update({
        where: { id: appendix.id },
        data: {
          effectiveDate: String(payload.effectiveDate ?? '').trim(),
          issuerType: payload.issuerType,
          notes: String(payload.notes ?? '').trim() || null,
        },
      });
      for (const currentItem of appendix.items) {
        const nextItem = payload.items.find((item) => item.tagKey === currentItem.tagKey);
        if (!nextItem) continue;
        await tx.contractAppendixItem.update({
          where: { id: currentItem.id },
          data: {
            payload: sanitizeAppendixPayload(nextItem.payload) as Prisma.InputJsonValue,
          },
        });
      }
    });

    return NextResponse.json({ id: appendix.id });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ appendixId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;
    const { appendixId } = await context.params;
    const appendix = await prisma.contractAppendix.findFirst({
      where: { id: appendixId, tenantId: session.tenantId },
      select: { id: true, status: true },
    });
    if (!appendix) return NextResponse.json({ message: 'متمم یافت نشد.' }, { status: 404 });
    if (appendix.status !== 'DRAFT') return NextResponse.json({ message: 'فقط پیش‌نویس متمم قابل حذف است.' }, { status: 409 });
    await prisma.contractAppendix.delete({ where: { id: appendix.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
