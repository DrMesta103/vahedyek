import { NextResponse } from 'next/server';
import type { Prisma } from '@/lib/prisma-client';
import { requireSessionContext } from '../../../lib/auth';
import { handlePrismaApiError } from '../../../lib/prismaApiError';
import { prisma } from '../../../lib/prisma';
import { getAppendixTagDefinition } from '../../../lib/contractAppendixConfig';
import { fetchContractViewForAppendix, resolveAppendixCompareBase, sanitizeAppendixPayload, serializeAppendixRecord } from '../../../lib/appendixServer';
import type { CreateContractAppendixInput } from '../../../types/contract';
import { isSupportedAppendixPayloadTag, normalizeAppendixPayload, validateAppendixPayload } from '../../../lib/appendixPayloads';

function resolveIssuerName(params: {
  issuerType: string;
  currentUserName: string;
  employees: Array<{ id: string; firstName: string; lastName: string }>;
  formerEmployees: Array<{ id: string; fullName: string }>;
  issuerEmployeeId?: string | null;
  issuerFormerEmployeeId?: string | null;
}) {
  if (params.issuerType === 'self') return params.currentUserName;
  if (params.issuerType === 'employee') {
    const employee = params.employees.find((item) => item.id === params.issuerEmployeeId);
    return employee ? `${employee.firstName} ${employee.lastName}`.trim() : '';
  }
  const formerEmployee = params.formerEmployees.find((item) => item.id === params.issuerFormerEmployeeId);
  return formerEmployee?.fullName ?? '';
}

function validationMessageByTag(tagKey: string) {
  if (tagKey === 'unit-delivery-date') return 'برای متمم تاریخ تحویل واحد باید تاریخ قبلی و جدید ثبت شود.';
  if (tagKey === 'first-party' || tagKey === 'second-party') return 'اطلاعات طرفین متمم معتبر نیست.';
  if (tagKey === 'adjustment') return 'اطلاعات ردیف مالی تعدیل معتبر نیست.';
  if (tagKey === 'contract-base-costs') return 'اطلاعات ردیف مالی اصل قرارداد معتبر نیست.';
  if (tagKey === 'side-costs') return 'اطلاعات ردیف های مالی جانبی معتبر نیست.';
  return 'اطلاعات متمم معتبر نیست.';
}

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
    if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
      return NextResponse.json({ message: 'حداقل یک نوع متمم باید انتخاب شود.' }, { status: 400 });
    }

    const [employees, formerEmployees] = await Promise.all([
      prisma.employee.findMany({
        where: { tenantId: session.tenantId, isActive: true },
        select: { id: true, firstName: true, lastName: true },
      }),
      prisma.formerEmployee.findMany({
        where: { tenantId: session.tenantId },
        select: { id: true, fullName: true },
      }),
    ]);

    const issuerName = resolveIssuerName({
      issuerType: payload.issuerType,
      currentUserName: session.user.fullName,
      employees,
      formerEmployees,
      issuerEmployeeId: payload.issuerEmployeeId,
      issuerFormerEmployeeId: payload.issuerFormerEmployeeId,
    });
    if (!issuerName) return NextResponse.json({ message: 'منعقدکننده متمم معتبر انتخاب نشده است.' }, { status: 400 });

    const normalizedItemPayloads = new Map<string, unknown>();

    for (const item of payload.items) {
      const def = getAppendixTagDefinition(item.tagKey);
      if (!def) return NextResponse.json({ message: 'تگ متمم معتبر نیست.' }, { status: 400 });
      if (!isSupportedAppendixPayloadTag(item.tagKey)) continue;

      const normalizedPayload = normalizeAppendixPayload(item.tagKey, item.payload);
      const validationMessage = validateAppendixPayload(item.tagKey, normalizedPayload);
      if (validationMessage) {
        return NextResponse.json({ message: validationMessageByTag(item.tagKey) }, { status: 400 });
      }

      normalizedItemPayloads.set(item.tagKey, normalizedPayload);
    }

    await prisma.$transaction(async (tx) => {
      await tx.contractAppendix.update({
        where: { id: appendix.id },
        data: {
          effectiveDate: String(payload.effectiveDate ?? '').trim(),
          issuerType: payload.issuerType,
          issuerName,
          notes: String(payload.notes ?? '').trim() || null,
        },
      });

      for (const currentItem of appendix.items) {
        const nextItem = payload.items.find((item) => item.tagKey === currentItem.tagKey);
        if (!nextItem) continue;
        await tx.contractAppendixItem.update({
          where: { id: currentItem.id },
          data: {
            payload: sanitizeAppendixPayload(normalizedItemPayloads.get(nextItem.tagKey) ?? nextItem.payload) as Prisma.InputJsonValue,
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
