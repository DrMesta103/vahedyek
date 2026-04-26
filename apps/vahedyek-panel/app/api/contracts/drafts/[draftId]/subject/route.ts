import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireSessionContext } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';
import { parseContractorType, parseContractType, serializeContractorType, serializeContractType } from '../../../../../lib/subjectUtils';

function normalizeFormerEmployeeName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
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
      select: { id: true },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این تننت پیدا نشد.' }, { status: 404 });
    }

    const body = await request.json();
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
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
