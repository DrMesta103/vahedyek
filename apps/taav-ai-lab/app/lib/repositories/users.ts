import { isValidIranMobile, normalizeEmail, parseAuthIdentifier, sanitizeIranMobileInput } from '../contact';
import { hashPassword } from '../auth';
import { prisma } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type {
  AdminUserRow,
  CreateAdminUserInput,
  CreateSimulatorUserInput,
  SimulatorUser,
  UpdateAdminUserInput,
  UserNotificationEvent,
} from '../types/domain';
import { mapAppUser } from '../auth';

export async function getUserByEmail(email: string) {
  const user = await prisma.appUser.findUnique({ where: { email: normalizeEmail(email) } });
  return user ? mapAppUser(user) : null;
}

export async function getUserById(userId: string): Promise<SimulatorUser | null> {
  const user = await prisma.appUser.findUnique({ where: { id: userId } });
  return user ? mapAppUser(user) : null;
}

export async function getUserByIdentifier(identifier: string): Promise<SimulatorUser | null> {
  const parsed = parseAuthIdentifier(identifier);
  if (parsed.type === 'email') return getUserByEmail(parsed.value);
  if (parsed.type === 'mobile') {
    const user = await prisma.appUser.findUnique({ where: { mobile: parsed.value } });
    return user ? mapAppUser(user) : null;
  }
  return null;
}

export async function createSimulatorUser(input: CreateSimulatorUserInput): Promise<SimulatorUser> {
  const identifier = parseAuthIdentifier(input.identifier);
  const mobile = sanitizeIranMobileInput(input.mobile ?? '');
  const { passwordHash, passwordSalt } = hashPassword(input.password);
  const email = identifier.type === 'email' ? identifier.value : null;
  const normalizedMobile =
    identifier.type === 'mobile' ? identifier.value : isValidIranMobile(mobile) ? mobile : null;

  const user = await prisma.appUser.create({
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      fullName: [input.firstName, input.lastName].filter(Boolean).join(' ').trim(),
      email,
      mobile: normalizedMobile,
      avatarUrl: input.avatarUrl?.trim() || null,
      passwordHash,
      passwordSalt,
    },
  });

  return mapAppUser(user);
}

function mapAdminUserRow(user: {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  memberships: { tenantId: string; tenant: { id: string; name: string; isActive: boolean } }[];
}): AdminUserRow {
  const activeMemberships = user.memberships.filter((membership) => membership.tenant.isActive);

  return {
    id: user.id,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobile: user.mobile,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    tenantIds: activeMemberships.map((membership) => membership.tenant.id),
    tenantNames: activeMemberships.map((membership) => membership.tenant.name),
    membershipCount: activeMemberships.length,
    isSystemUser: activeMemberships.length === 0,
  };
}

export async function listAllUsersForAdmin(): Promise<AdminUserRow[]> {
  const users = await prisma.appUser.findMany({
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      memberships: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return users.map(mapAdminUserRow);
}

export async function createUserForAdmin(input: CreateAdminUserInput): Promise<AdminUserRow> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const mobile = sanitizeIranMobileInput(input.mobile);
  const password = input.password.trim();
  const avatarUrl = input.avatarUrl?.trim() || null;
  const tenantId = input.tenantId?.trim() || null;
  const systemUser = input.systemUser === true;
  const isActive = input.isActive !== false;

  if (!firstName || !lastName) {
    throw new Error('نام و نام خانوادگی الزامی است.');
  }
  if (!isValidIranMobile(mobile)) {
    throw new Error('شماره موبایل معتبر نیست.');
  }
  if (password.length < 6) {
    throw new Error('رمز عبور باید حداقل 6 کاراکتر باشد.');
  }
  if (systemUser && tenantId) {
    throw new Error('کاربر سیستمی نباید کسب‌وکار داشته باشد.');
  }
  if (!systemUser && !tenantId) {
    throw new Error('انتخاب کسب‌وکار یا گزینه سیستم تاو الزامی است.');
  }

  const { passwordHash, passwordSalt } = hashPassword(password);

  try {
    const user = await prisma.$transaction(async (tx) => {
      if (tenantId) {
        const tenant = await tx.tenant.findUnique({
          where: { id: tenantId },
          select: { id: true, isActive: true },
        });
        if (!tenant || !tenant.isActive) {
          throw new Error('کسب‌وکار انتخاب‌شده معتبر نیست.');
        }
      }

      const createdUser = await tx.appUser.create({
        data: {
          firstName,
          lastName,
          fullName: [firstName, lastName].join(' ').trim(),
          email: null,
          mobile,
          avatarUrl,
          isActive,
          passwordHash,
          passwordSalt,
          memberships:
            tenantId && !systemUser
              ? {
                  create: {
                    tenantId,
                    role: 'member',
                  },
                }
              : undefined,
        },
        include: {
          memberships: {
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  isActive: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return createdUser;
    });

    return mapAdminUserRow(user);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('این شماره موبایل قبلاً ثبت شده است.');
    }
    throw error;
  }
}

export async function updateUserForAdmin(input: UpdateAdminUserInput): Promise<AdminUserRow> {
  const userId = input.userId.trim();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const avatarUrl = input.avatarUrl?.trim() || null;
  const tenantId = input.tenantId?.trim() || null;
  const systemUser = input.systemUser === true;
  const isActive = input.isActive !== false;

  if (!userId) {
    throw new Error('شناسه کاربر معتبر نیست.');
  }
  if (!firstName || !lastName) {
    throw new Error('نام و نام خانوادگی الزامی است.');
  }
  if (systemUser && tenantId) {
    throw new Error('کاربر سیستمی نباید کسب‌وکار داشته باشد.');
  }
  if (!systemUser && !tenantId) {
    throw new Error('انتخاب کسب‌وکار یا گزینه سیستم تاو الزامی است.');
  }

  const existing = await prisma.appUser.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) {
    throw new Error('کاربر انتخاب‌شده معتبر نیست.');
  }

  const user = await prisma.$transaction(async (tx) => {
    if (tenantId) {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, isActive: true },
      });
      if (!tenant || !tenant.isActive) {
        throw new Error('کسب‌وکار انتخاب‌شده معتبر نیست.');
      }
    }

    await tx.userTenantMembership.deleteMany({ where: { userId } });

    const updatedUser = await tx.appUser.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        fullName: [firstName, lastName].join(' ').trim(),
        avatarUrl,
        isActive,
        memberships:
          tenantId && !systemUser
            ? {
                create: {
                  tenantId,
                  role: 'member',
                },
              }
            : undefined,
      },
      include: {
        memberships: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return updatedUser;
  });

  return mapAdminUserRow(user);
}

export async function toggleUserActiveStatus(userId: string, isActive: boolean): Promise<AdminUserRow | null> {
  const existing = await prisma.appUser.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) return null;

  const user = await prisma.appUser.update({
    where: { id: userId },
    data: { isActive },
    include: {
      memberships: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return mapAdminUserRow(user);
}

function mapNotificationEvent(row: {
  id: string;
  userId: string;
  title: string;
  message: string;
  kind: string;
  createdAt: Date;
  seenAt: Date | null;
}): UserNotificationEvent {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    message: row.message,
    kind: 'test',
    createdAt: row.createdAt.toISOString(),
    seenAt: row.seenAt ? row.seenAt.toISOString() : null,
  };
}

export async function sendTestNotificationToUser(userId: string): Promise<UserNotificationEvent> {
  const user = await prisma.appUser.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, isActive: true },
  });

  if (!user) {
    throw new Error('کاربر انتخاب‌شده معتبر نیست.');
  }

  const notification = await prisma.userNotification.create({
    data: {
      userId,
      title: 'نوتیفیکیشن تستی تاو',
      message: `این اعلان تستی برای ${user.fullName} ارسال شده است.`,
      kind: 'test',
    },
  });

  return mapNotificationEvent(notification);
}

export async function consumeUnreadNotificationsForUser(userId: string): Promise<UserNotificationEvent[]> {
  const unread = await prisma.userNotification.findMany({
    where: {
      userId,
      seenAt: null,
    },
    orderBy: { createdAt: 'asc' },
    take: 8,
  });

  if (unread.length === 0) return [];

  const ids = unread.map((item) => item.id);
  const seenAt = new Date();

  await prisma.userNotification.updateMany({
    where: { id: { in: ids } },
    data: { seenAt },
  });

  return unread.map((item) => mapNotificationEvent({ ...item, seenAt }));
}
