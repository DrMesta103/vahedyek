import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';

const TABLE_NAME = '"TenantBusinessProfileSettings"';

type DirectoryCandidate = {
  id: string;
  fullName: string;
  mobile: string;
  secondaryMobile?: string;
  email: string;
  avatarMode: 'image' | 'badge' | 'ghost';
  avatarText: string;
  avatarImage?: string;
  isPrimary: boolean;
  linkedUser: boolean;
  canEmail: boolean;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female';
  nationalId?: string;
};

function normalizePhone(value: string) {
  return value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[^\d+]/g, '');
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function GET(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() ?? '';
    if (!query) {
      return NextResponse.json({ items: [] satisfies DirectoryCandidate[] });
    }

    const rows = await prisma.$queryRawUnsafe<Array<{ profilePayload: { directory?: DirectoryCandidate[] } | null }>>(
      `SELECT "profilePayload" FROM ${TABLE_NAME} WHERE "tenantId" = $1 LIMIT 1`,
      session.tenantId,
    );

    const directory = Array.isArray(rows[0]?.profilePayload?.directory) ? rows[0]?.profilePayload?.directory ?? [] : [];
    const normalizedPhoneQuery = normalizePhone(query);
    const normalizedEmailQuery = normalizeEmail(query);

    const items = directory
      .filter((item) => {
        const phoneMatch =
          Boolean(normalizedPhoneQuery) &&
          (normalizePhone(item.mobile).includes(normalizedPhoneQuery) || normalizePhone(item.secondaryMobile ?? '').includes(normalizedPhoneQuery));
        const emailMatch = Boolean(normalizedEmailQuery) && normalizeEmail(item.email).includes(normalizedEmailQuery);
        const nameMatch = item.fullName.includes(query);
        return phoneMatch || emailMatch || nameMatch;
      })
      .slice(0, 5);

    return NextResponse.json({ items });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
