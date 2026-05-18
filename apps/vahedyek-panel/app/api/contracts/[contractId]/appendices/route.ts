import { NextResponse } from 'next/server';
import type { Prisma } from '@/lib/prisma-client';
import { requireSessionContext } from '../../../../lib/auth';
import { getAppendixTagDefinition } from '../../../../lib/contractAppendixConfig';
import { prisma } from '../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import type { CreateContractAppendixInput } from '../../../../types/contract';
import { buildAppendixSummary } from '../../../../lib/appendixLifecycle';
import { fetchContractViewForAppendix, findPreviousApprovedAppendix, sanitizeAppendixPayload, serializeAppendixRecord } from '../../../../lib/appendixServer';
import { submitAppendixApprovalWorkflow } from '../../../../lib/appendixApprovalCore';
import { isSupportedAppendixPayloadTag, normalizeAppendixPayload, validateAppendixPayload } from '../../../../lib/appendixPayloads';

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

export async function GET(request: Request, context: { params: Promise<{ contractId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { contractId } = await context.params;
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const whereStatus =
      status === 'draft' ? 'DRAFT' : status === 'pending_approval' ? 'IN_REVIEW' : status === 'completed' ? 'APPROVED' : undefined;

    const contract = await prisma.contractDraft.findFirst({
      where: { id: contractId, tenantId: session.tenantId },
      select: {
        id: true,
        appendices: {
          where: whereStatus ? { status: whereStatus } : undefined,
          orderBy: [{ appendixNumber: 'desc' }],
          include: {
            items: { orderBy: [{ groupKey: 'asc' }, { createdAt: 'asc' }] },
            approvalInstance: { select: { currentStepIndex: true } },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ message: 'قرارداد یافت نشد.' }, { status: 404 });
    }

    const [employees, formerEmployees] = await Promise.all([
      prisma.employee.findMany({
        where: { tenantId: session.tenantId, isActive: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        select: { id: true, firstName: true, lastName: true },
      }),
      prisma.formerEmployee.findMany({
        where: { tenantId: session.tenantId },
        orderBy: { fullName: 'asc' },
        select: { id: true, fullName: true },
      }),
    ]);

    return NextResponse.json({
      items: contract.appendices.map(serializeAppendixRecord),
      nextAppendixNumber: (contract.appendices[0]?.appendixNumber ?? 0) + 1,
      reference: {
        currentUserName: session.user.fullName,
        employees: employees.map((item) => ({ id: item.id, label: `${item.firstName} ${item.lastName}`.trim() })),
        formerEmployees: formerEmployees.map((item) => ({ id: item.id, label: item.fullName })),
      },
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ contractId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { contractId } = await context.params;
    const payload = (await request.json()) as CreateContractAppendixInput;
    if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
      return NextResponse.json({ message: 'حداقل یک نوع متمم باید انتخاب شود.' }, { status: 400 });
    }
    if (payload.submitMode === 'pending_approval' && !String(payload.effectiveDate ?? '').trim()) {
      return NextResponse.json({ message: 'زمان متمم الزامی است.' }, { status: 400 });
    }

    const contract = await fetchContractViewForAppendix(session.tenantId, contractId);
    if (!contract) {
      return NextResponse.json({ message: 'قرارداد یافت نشد.' }, { status: 404 });
    }

    const [employees, formerEmployees, latestAppendix] = await Promise.all([
      prisma.employee.findMany({
        where: { tenantId: session.tenantId, isActive: true },
        select: { id: true, firstName: true, lastName: true },
      }),
      prisma.formerEmployee.findMany({
        where: { tenantId: session.tenantId },
        select: { id: true, fullName: true },
      }),
      prisma.contractAppendix.findFirst({
        where: { draftId: contractId, tenantId: session.tenantId },
        orderBy: { appendixNumber: 'desc' },
        select: { appendixNumber: true },
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

    const nextExpectedNumber = (latestAppendix?.appendixNumber ?? 0) + 1;
    if (payload.appendixNumber !== nextExpectedNumber) {
      return NextResponse.json({ message: 'شماره متمم معتبر نیست. صفحه را یک‌بار تازه‌سازی کنید.' }, { status: 409 });
    }

    const seen = new Set<string>();
    const items = payload.items.map((item) => {
      const def = getAppendixTagDefinition(item.tagKey);
      if (!def) throw new Error('INVALID_APPENDIX_TAG');
      if (seen.has(item.tagKey)) throw new Error('DUPLICATE_APPENDIX_TAG');
      seen.add(item.tagKey);

      const cleanPayload = item.payload && typeof item.payload === 'object' ? item.payload : {};
      let payloadToStore = cleanPayload;
      if (isSupportedAppendixPayloadTag(item.tagKey)) {
        const normalizedPayload = normalizeAppendixPayload(item.tagKey, cleanPayload);
        if (payload.submitMode === 'pending_approval') {
          const validationMessage = validateAppendixPayload(item.tagKey, normalizedPayload);
          if (validationMessage) {
            if (item.tagKey === 'unit-delivery-date') throw new Error('INVALID_DELIVERY_DATE_PAYLOAD');
            if (item.tagKey === 'loan') throw new Error('INVALID_LOAN_APPENDIX_PAYLOAD');
            if (item.tagKey === 'first-party' || item.tagKey === 'second-party') throw new Error('INVALID_PARTIES_APPENDIX_PAYLOAD');
            if (item.tagKey === 'adjustment') throw new Error('INVALID_ADJUSTMENT_APPENDIX_PAYLOAD');
            if (item.tagKey === 'contract-base-costs') throw new Error('INVALID_CONTRACT_BASE_COSTS_APPENDIX_PAYLOAD');
            if (item.tagKey === 'side-costs') throw new Error('INVALID_SIDE_COSTS_APPENDIX_PAYLOAD');
          }
        }
        payloadToStore = normalizedPayload as unknown as Record<string, unknown>;
      }

      return {
        tagKey: def.key,
        groupKey: def.groupKey,
        title: def.title,
        description: def.description,
        payload: sanitizeAppendixPayload(payloadToStore) as Prisma.InputJsonValue,
      };
    });

    const previousApproved = await findPreviousApprovedAppendix(session.tenantId, contractId, payload.appendixNumber);
    const created = await prisma.contractAppendix.create({
      data: {
        tenantId: session.tenantId,
        draftId: contractId,
        previousAppendixId: previousApproved?.id ?? null,
        sourceKind: previousApproved ? 'appendix' : 'contract',
        sourceId: previousApproved?.id ?? contractId,
        status: payload.submitMode === 'pending_approval' ? 'IN_REVIEW' : 'DRAFT',
        appendixNumber: payload.appendixNumber,
        title: `متمم ${payload.appendixNumber}`,
        summary: buildAppendixSummary(items.map((item) => item.tagKey as any)),
        effectiveDate: String(payload.effectiveDate ?? '').trim(),
        issuerType: payload.issuerType,
        issuerName,
        notes: String(payload.notes ?? '').trim() || null,
        createdByUserId: session.userId,
        items: { create: items },
      },
      select: { id: true },
    });

    if (payload.submitMode === 'pending_approval') {
      const submitRes = await submitAppendixApprovalWorkflow({
        tenantId: session.tenantId,
        userId: session.userId,
        actorName: session.user.fullName,
        appendixId: created.id,
      });
      if (!submitRes.ok) {
        return NextResponse.json({ message: submitRes.message }, { status: 400 });
      }
    }

    return NextResponse.json({ id: created.id });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'INVALID_APPENDIX_TAG') return NextResponse.json({ message: 'یکی از تگ‌های متمم معتبر نیست.' }, { status: 400 });
      if (error.message === 'DUPLICATE_APPENDIX_TAG') return NextResponse.json({ message: 'تگ تکراری برای متمم ارسال شده است.' }, { status: 400 });
      if (error.message === 'INVALID_DELIVERY_DATE_PAYLOAD') return NextResponse.json({ message: 'برای متمم تاریخ تحویل واحد باید تاریخ جدید ثبت شود.' }, { status: 400 });
      if (error.message === 'INVALID_LOAN_APPENDIX_PAYLOAD') return NextResponse.json({ message: 'اطلاعات الحاقیه وام کامل یا معتبر نیست.' }, { status: 400 });
      if (error.message === 'INVALID_PARTIES_APPENDIX_PAYLOAD') return NextResponse.json({ message: 'اطلاعات طرفین متمم کامل یا معتبر نیست.' }, { status: 400 });
      if (error.message === 'INVALID_ADJUSTMENT_APPENDIX_PAYLOAD') return NextResponse.json({ message: 'اطلاعات ردیف مالی تعدیل معتبر نیست.' }, { status: 400 });
      if (error.message === 'INVALID_CONTRACT_BASE_COSTS_APPENDIX_PAYLOAD') return NextResponse.json({ message: 'اطلاعات ردیف مالی اصل قرارداد معتبر نیست.' }, { status: 400 });
      if (error.message === 'INVALID_SIDE_COSTS_APPENDIX_PAYLOAD') return NextResponse.json({ message: 'اطلاعات ردیف های مالی جانبی معتبر نیست.' }, { status: 400 });
    }
    return handlePrismaApiError(error);
  }
}
