import { NextResponse } from 'next/server';
import { Prisma } from '@/lib/prisma-client';
import { getActorName, recordAuditLog } from '../../../../../lib/audit-log';
import { buildContractSubjectAuditDiff } from '../../../../../lib/audit-log-presenters';
import { requireSessionContext } from '../../../../../lib/auth';
import { findLockedUnitForTenant } from '../../../../../lib/contractUnitLocks';
import { prisma } from '../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';
import { parseContractorType, parseContractType, serializeContractorType, serializeContractType } from '../../../../../lib/subjectUtils';

function normalizeFormerEmployeeName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

async function buildSubjectAuditLookup(
  tenantId: string,
  tenantName: string,
  before: { contractorEmployeeId?: string | null; blockId?: string | null; unitId?: string | null } | null,
  after: { contractorEmployeeId?: string | null; blockId?: string | null; unitId?: string | null } | null,
) {
  const employeeIds = Array.from(new Set([before?.contractorEmployeeId, after?.contractorEmployeeId].filter((id): id is string => Boolean(id))));
  const blockIds = Array.from(new Set([before?.blockId, after?.blockId].filter((id): id is string => Boolean(id))));
  const unitIds = Array.from(new Set([before?.unitId, after?.unitId].filter((id): id is string => Boolean(id))));

  const [employees, blocks, units] = await Promise.all([
    employeeIds.length
      ? prisma.employee.findMany({
          where: { tenantId, id: { in: employeeIds } },
          select: { id: true, firstName: true, lastName: true, nationalCode: true },
        })
      : Promise.resolve([]),
    blockIds.length
      ? prisma.block.findMany({
          where: { tenantId, id: { in: blockIds } },
          select: { id: true, name: true, mainPlate: true, subPlate: true },
        })
      : Promise.resolve([]),
    unitIds.length
      ? prisma.unit.findMany({
          where: { tenantId, id: { in: unitIds } },
          select: {
            id: true,
            name: true,
            floorName: true,
            blockId: true,
            block: { select: { id: true, name: true, mainPlate: true, subPlate: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  return {
    tenantName,
    employeesById: new Map(employees.map((employee) => [employee.id, employee])),
    blocksById: new Map([...blocks, ...units.map((unit) => unit.block)].filter(Boolean).map((block) => [block.id, block])),
    unitsById: new Map(units.map((unit) => [unit.id, unit])),
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.findFirst({
      where: { id: draftId, tenantId: session.tenantId },
      select: { id: true },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این تننت پیدا نشد.' }, { status: 404 });
    }

    const subject = await prisma.contractSubject.findUnique({
      where: { draftId },
    });

    if (!subject) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      contractor: {
        type: serializeContractorType(subject.contractorType),
        employeeId: subject.contractorEmployeeId ?? undefined,
        formerFirstName: subject.contractorFormerName?.split(' ')[0] ?? '',
        formerLastName: subject.contractorFormerName?.split(' ').slice(1).join(' ') ?? '',
      },
      contractType: serializeContractType(subject.contractType),
      contractDate: subject.contractDate,
      contractNumber: subject.contractNumber,
      deliveryDate: subject.deliveryDate,
      blockId: subject.blockId,
      unitId: subject.unitId,
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.findFirst({
      where: { id: draftId, tenantId: session.tenantId },
      select: { id: true, approvalInstance: { select: { status: true } } },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این تننت پیدا نشد.' }, { status: 404 });
    }

    if (draft.approvalInstance?.status === 'IN_REVIEW') {
      return NextResponse.json({ message: 'این پیش‌نویس در فرایند تأیید است و امکان ویرایش ندارد.' }, { status: 409 });
    }

    const body = await request.json();
    const previous = await prisma.contractSubject.findUnique({ where: { draftId } });
    const lockedUnit = body.unitId ? await findLockedUnitForTenant(session.tenantId, String(body.unitId), draftId) : null;

    if (lockedUnit) {
      return NextResponse.json(
        {
          message: `این واحد برای قرارداد شماره ${lockedUnit.contractNumber} ثبت شده است.`,
          contractNumber: lockedUnit.contractNumber,
          existingDraftId: lockedUnit.draftId,
          status: lockedUnit.status,
        },
        { status: 409 },
      );
    }

    const contractor = body.contractor ?? {};
    const formerEmployeeName =
      contractor.type === 'former-employee'
        ? normalizeFormerEmployeeName([contractor.formerFirstName, contractor.formerLastName].filter(Boolean).join(' '))
        : '';

    if (contractor.type === 'former-employee' && formerEmployeeName) {
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "FormerEmployee" ("id", "tenantId", "fullName", "normalizedName", "createdAt", "updatedAt")
        VALUES (
          ${crypto.randomUUID()},
          ${session.tenantId},
          ${formerEmployeeName},
          ${formerEmployeeName.toLocaleLowerCase('fa-IR')},
          NOW(),
          NOW()
        )
        ON CONFLICT ("tenantId", "normalizedName")
        DO UPDATE SET
          "fullName" = EXCLUDED."fullName",
          "updatedAt" = NOW()
      `);
    }

    const result = await prisma.contractSubject.upsert({
      where: { draftId },
      update: {
        contractorType: parseContractorType(contractor.type),
        contractorEmployeeId: contractor.employeeId || null,
        contractorFormerName: contractor.type === 'former-employee' ? formerEmployeeName : null,
        contractType: parseContractType(body.contractType),
        contractDate: body.contractDate,
        contractNumber: body.contractNumber,
        deliveryDate: body.deliveryDate,
        blockId: body.blockId,
        unitId: body.unitId,
      },
      create: {
        draftId,
        contractorType: parseContractorType(contractor.type),
        contractorEmployeeId: contractor.employeeId || null,
        contractorFormerName: contractor.type === 'former-employee' ? formerEmployeeName : null,
        contractType: parseContractType(body.contractType),
        contractDate: body.contractDate,
        contractNumber: body.contractNumber,
        deliveryDate: body.deliveryDate,
        blockId: body.blockId,
        unitId: body.unitId,
      },
      select: {
        id: true,
        contractorType: true,
        contractorEmployeeId: true,
        contractorFormerName: true,
        contractType: true,
        contractDate: true,
        contractNumber: true,
        deliveryDate: true,
        blockId: true,
        unitId: true,
      },
    });
    const lookup = await buildSubjectAuditLookup(session.tenantId, session.tenant?.name ?? 'سازنده اصلی', previous, result);
    const diff = buildContractSubjectAuditDiff(previous, result, lookup);
    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'contract.subject.update',
      entityType: 'contract_draft',
      entityId: draftId,
      entityLabel: result.contractNumber || `پیش‌نویس ${draftId}`,
      summary: `${getActorName(session)} اطلاعات پایه قرارداد را ویرایش کرد.`,
      diff,
      request,
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
