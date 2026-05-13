import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { buildFieldDiffs, getActorName, recordAuditLog } from '../../lib/audit-log';
import { getSessionContext, hashPassword } from '../../lib/auth';
import { ensureMembershipRoleByKey, ensureTenantDefaultRoles } from '../../lib/access-control';
import { normalizeEmail, sanitizeIranMobileInput } from '../../lib/contact';
import { buildTenantEmployeeId, getEmployeeIdsForUser } from '../../lib/employeeIdentity';
import { handlePrismaApiError } from '../../lib/prismaApiError';

const DEFAULT_EMPLOYEE_PASSWORD = '123456';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionContext();
    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      id?: string;
      mobile?: string;
      firstName?: string;
      lastName?: string;
      nationalCode?: string;
      email?: string;
      avatarUrl?: string;
    };
    const normalizedMobile = sanitizeIranMobileInput(body.mobile ?? '');
    const normalizedEmail = normalizeEmail(body.email ?? '');
    const nationalCode = (body.nationalCode ?? '').replace(/\D/g, '');

    if (!body.firstName?.trim() || !body.lastName?.trim() || nationalCode.length !== 10 || (!normalizedMobile && !normalizedEmail)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await ensureTenantDefaultRoles(session.tenantId);

    const requestedUserId = body.id?.trim();
    const [requestedUser, emailOwner, mobileOwner] = await Promise.all([
      requestedUserId ? prisma.appUser.findUnique({ where: { id: requestedUserId } }) : Promise.resolve(null),
      normalizedEmail ? prisma.appUser.findUnique({ where: { email: normalizedEmail } }) : Promise.resolve(null),
      normalizedMobile ? prisma.appUser.findUnique({ where: { mobile: normalizedMobile } }) : Promise.resolve(null),
    ]);

    const userIds = new Set([requestedUser?.id, emailOwner?.id, mobileOwner?.id].filter(Boolean));
    if (userIds.size > 1) {
      return NextResponse.json({ error: 'Contact information belongs to different users' }, { status: 409 });
    }

    const firstName = body.firstName.trim();
    const lastName = body.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    let user = requestedUser ?? emailOwner ?? mobileOwner;

    if (!user) {
      const { passwordHash, passwordSalt } = hashPassword(DEFAULT_EMPLOYEE_PASSWORD);
      user = await prisma.appUser.create({
        data: {
          firstName,
          lastName,
          fullName,
          email: normalizedEmail || null,
          mobile: normalizedMobile || null,
          passwordHash,
          passwordSalt,
        },
      });
    } else {
      user = await prisma.appUser.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName,
          fullName,
          email: normalizedEmail || user.email,
          mobile: normalizedMobile || user.mobile,
        },
      });
    }

    const membership = await prisma.userTenantMembership.upsert({
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

    await ensureMembershipRoleByKey(membership.id, session.tenantId, 'employee');

    const employeeIdsForUser = getEmployeeIdsForUser(session.tenantId, user.id);
    const existingUserEmployeeInCurrentTenant = await prisma.employee.findFirst({
      where: {
        tenantId: session.tenantId,
        id: { in: employeeIdsForUser },
      },
    });
    const existingUserEmployeeInOtherTenant = await prisma.employee.findFirst({
      where: {
        tenantId: { not: session.tenantId },
        id: user.id,
      },
      select: { id: true },
    });
    const employeeId = existingUserEmployeeInCurrentTenant?.id ?? (existingUserEmployeeInOtherTenant ? buildTenantEmployeeId(session.tenantId, user.id) : user.id);

    const [existingById, existingByNationalCode] = await Promise.all([
      prisma.employee.findFirst({
        where: {
          tenantId: session.tenantId,
          id: employeeId,
        },
      }),
      prisma.employee.findFirst({
        where: {
          tenantId: session.tenantId,
          nationalCode,
        },
      }),
    ]);

    if (existingByNationalCode && existingByNationalCode.id !== employeeId) {
      return NextResponse.json({ error: 'Employee already exists' }, { status: 409 });
    }

    const existing = existingById ?? existingByNationalCode;
    const employee = await prisma.employee.upsert({
      where: { id: employeeId },
      update: {
        firstName,
        lastName,
        nationalCode,
        isActive: true,
      },
      create: {
        id: employeeId,
        tenantId: session.tenantId,
        firstName,
        lastName,
        nationalCode,
        isActive: true,
      },
    });
    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: existing ? 'employee.update' : 'employee.create',
      entityType: 'employee',
      entityId: employee.id,
      entityLabel: `${employee.firstName} ${employee.lastName}`.trim(),
      summary: `${getActorName(session)} کارمند ${`${employee.firstName} ${employee.lastName}`.trim()} را ${existing ? 'ویرایش' : 'ثبت'} کرد.`,
      diff: buildFieldDiffs(existing, employee, {
        firstName: 'نام',
        lastName: 'نام خانوادگی',
        nationalCode: 'کد ملی',
        isActive: 'وضعیت فعال',
      }),
      request,
    });

    return NextResponse.json(
      {
        ...employee,
        mobile: normalizedMobile ? `+98${normalizedMobile}` : '',
        email: normalizedEmail,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating employee:', error);
    return handlePrismaApiError(error);
  }
}
