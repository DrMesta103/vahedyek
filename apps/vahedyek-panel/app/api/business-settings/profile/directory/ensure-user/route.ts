import { NextResponse } from 'next/server';
import { hashPassword, requireSessionContext } from '../../../../../lib/auth';
import { normalizeEmail, sanitizeIranMobileInput, splitFullName } from '../../../../../lib/contact';
import { prisma } from '../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';

const DEFAULT_PASSWORD = '123456';

function formatStoredMobile(value: string | null) {
  return value ? `+98${value}` : '';
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      fullName?: string;
      mobile?: string;
      email?: string;
    };

    const normalizedEmailValue = normalizeEmail(body.email ?? '');
    const normalizedMobileValue = sanitizeIranMobileInput(body.mobile ?? '');
    const providedFullName = body.fullName?.trim() || [body.firstName?.trim(), body.lastName?.trim()].filter(Boolean).join(' ').trim();
    const splitName = splitFullName(providedFullName);
    const hasExplicitName = Boolean(body.firstName?.trim() || body.lastName?.trim() || providedFullName);
    const firstName = body.firstName?.trim() || splitName.firstName || '';
    const lastName = body.lastName?.trim() || splitName.lastName || '';

    if (!normalizedEmailValue && !normalizedMobileValue) {
      return NextResponse.json({ message: 'ایمیل یا شماره موبایل برای ساخت کاربر الزامی است.' }, { status: 400 });
    }

    const [emailOwner, mobileOwner] = await Promise.all([
      normalizedEmailValue ? prisma.appUser.findUnique({ where: { email: normalizedEmailValue } }) : Promise.resolve(null),
      normalizedMobileValue ? prisma.appUser.findUnique({ where: { mobile: normalizedMobileValue } }) : Promise.resolve(null),
    ]);

    if (emailOwner && mobileOwner && emailOwner.id !== mobileOwner.id) {
      return NextResponse.json({ message: 'ایمیل و شماره موبایل به دو کاربر متفاوت تعلق دارند.' }, { status: 409 });
    }

    let user = emailOwner ?? mobileOwner;

    if (!user) {
      const { passwordHash, passwordSalt } = hashPassword(DEFAULT_PASSWORD);
      user = await prisma.appUser.create({
        data: {
          firstName,
          lastName,
          fullName: hasExplicitName ? [firstName, lastName].join(' ').trim() : '',
          email: normalizedEmailValue || null,
          mobile: normalizedMobileValue || null,
          passwordHash,
          passwordSalt,
        },
      });
    } else {
      user = await prisma.appUser.update({
        where: { id: user.id },
        data: {
          firstName: hasExplicitName ? firstName : user.firstName,
          lastName: hasExplicitName ? lastName : user.lastName,
          fullName: hasExplicitName ? [firstName, lastName].join(' ').trim() : user.fullName,
          email: normalizedEmailValue || user.email,
          mobile: normalizedMobileValue || user.mobile,
        },
      });
    }

    await prisma.userTenantMembership.upsert({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId: session.tenantId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        tenantId: session.tenantId,
        role: 'member',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: formatStoredMobile(user.mobile),
      },
      password: DEFAULT_PASSWORD,
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
