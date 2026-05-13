import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { normalizeEmail as normalizeAuthEmail, parseAuthIdentifier, sanitizeIranMobileInput } from '../../../../lib/contact';
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
    .replace(/[\u06f0-\u06f9]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[\u0660-\u0669]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
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
    const tenantMembers = await prisma.userTenantMembership.findMany({
      where: { tenantId: session.tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            mobile: true,
          },
        },
      },
    });
    const tenantUserIds = new Set(tenantMembers.map((membership) => membership.userId));
    const tenantUserEmails = new Set(tenantMembers.map((membership) => normalizeAuthEmail(membership.user.email ?? '')).filter(Boolean));
    const tenantUserMobiles = new Set(tenantMembers.map((membership) => normalizePhone(membership.user.mobile ? `+98${membership.user.mobile}` : '')).filter(Boolean));
    const isTenantDirectoryCandidate = (item: DirectoryCandidate) => {
      if (!item.linkedUser) return true;
      if (tenantUserIds.has(item.id)) return true;
      if (item.email && tenantUserEmails.has(normalizeAuthEmail(item.email))) return true;
      return Boolean(item.mobile && tenantUserMobiles.has(normalizePhone(item.mobile)));
    };

    const items = directory
      .filter(isTenantDirectoryCandidate)
      .filter((item) => {
        const phoneMatch =
          Boolean(normalizedPhoneQuery) &&
          (normalizePhone(item.mobile).includes(normalizedPhoneQuery) || normalizePhone(item.secondaryMobile ?? '').includes(normalizedPhoneQuery));
        const emailMatch = Boolean(normalizedEmailQuery) && normalizeEmail(item.email).includes(normalizedEmailQuery);
        const nameMatch = item.fullName.includes(query);
        return phoneMatch || emailMatch || nameMatch;
      })
      .slice(0, 5);

    const identifier = parseAuthIdentifier(query);
    const appUsers =
      identifier.type === 'email'
        ? await prisma.appUser.findMany({
            where: {
              email: identifier.value,
              memberships: {
                some: {
                  tenantId: session.tenantId,
                },
              },
            },
            select: { id: true, firstName: true, lastName: true, fullName: true, email: true, mobile: true },
            take: 5,
          })
        : identifier.type === 'mobile'
          ? await prisma.appUser.findMany({
              where: {
                mobile: sanitizeIranMobileInput(identifier.value),
                memberships: {
                  some: {
                    tenantId: session.tenantId,
                  },
                },
              },
              select: { id: true, firstName: true, lastName: true, fullName: true, email: true, mobile: true },
              take: 5,
            })
          : [];

    for (const user of appUsers) {
      const formattedMobile = user.mobile ? `+98${user.mobile}` : '';
      const matchesExisting = items.some(
        (item) =>
          item.id === user.id ||
          normalizeEmail(item.email) === normalizeAuthEmail(user.email ?? '') ||
          normalizePhone(item.mobile) === normalizePhone(formattedMobile),
      );
      if (matchesExisting) continue;

      items.push({
        id: user.id,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: formattedMobile,
        secondaryMobile: '',
        email: user.email ?? '',
        avatarMode: 'ghost',
        avatarText: user.firstName.trim().slice(0, 1) || user.lastName.trim().slice(0, 1) || user.fullName.trim().slice(0, 1) || 'U',
        avatarImage: '',
        isPrimary: false,
        linkedUser: true,
        canEmail: Boolean(user.email),
      });
    }

    return NextResponse.json({ items });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
