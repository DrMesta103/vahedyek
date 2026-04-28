import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import { createInitialLoanSettingsState, normalizeLoanSettingsState } from '../../../../lib/businessContractRules';

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const settings = await prisma.tenantContractRuleSettings.findUnique({
      where: { tenantId: session.tenantId },
      select: { loanPayload: true },
    });

    return NextResponse.json(normalizeLoanSettingsState(settings?.loanPayload));
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const loanPayload = normalizeLoanSettingsState(body ?? createInitialLoanSettingsState());

    await prisma.tenantContractRuleSettings.upsert({
      where: { tenantId: session.tenantId },
      update: { loanPayload },
      create: { tenantId: session.tenantId, loanPayload },
    });

    return NextResponse.json({ success: true, loan: loanPayload });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
