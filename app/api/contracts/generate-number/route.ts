import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    // آخرین شماره قرارداد این tenant
    const last = await prisma.contractSubject.findFirst({
      where: {
        draft: { tenantId: session.tenantId },
        contractNumber: { not: '' },
      },
      orderBy: { draft: { createdAt: 'desc' } },
      select: { contractNumber: true },
    });

    let next = '1';

    if (last?.contractNumber) {
      // عدد انتهایی رو پیدا می‌کنیم
      const match = last.contractNumber.match(/(\d+)(?!.*\d)/);
      if (match) {
        const num = parseInt(match[1], 10);
        const padded = String(num + 1).padStart(match[1].length, '0');
        next = last.contractNumber.replace(/(\d+)(?!.*\d)/, padded);
      } else {
        next = last.contractNumber + '-1';
      }
    }

    return NextResponse.json({ contractNumber: next });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
