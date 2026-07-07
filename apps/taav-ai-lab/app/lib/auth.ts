import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import {
  AUTH_COOKIE,
  type AuthTokenPayload,
  clearAuthCookie,
  createAuthToken,
  setAuthCookie,
  verifyAuthToken,
} from './auth-token';

export { AUTH_COOKIE, clearAuthCookie, createAuthToken, setAuthCookie, verifyAuthToken };

export function hashPassword(password: string, salt?: string) {
  const passwordSalt = salt ?? randomBytes(16).toString('hex');
  const passwordHash = scryptSync(password, passwordSalt, 64).toString('hex');
  return { passwordHash, passwordSalt };
}

export function verifyPassword(password: string, passwordHash: string, passwordSalt: string) {
  const calculated = scryptSync(password, passwordSalt, 64);
  const existing = Buffer.from(passwordHash, 'hex');
  return existing.length === calculated.length && timingSafeEqual(existing, calculated);
}

export async function assertTenantAccess(userId: string, tenantId: string) {
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
  });
  return membership !== null;
}

export async function getTokenPayloadFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export async function getSessionContext() {
  const payload = await getTokenPayloadFromCookies();
  if (!payload) return null;

  const user = await prisma.appUser.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) return null;

  const tenant = payload.activeTenantId
    ? await prisma.tenant.findFirst({
        where: {
          id: payload.activeTenantId,
          isActive: true,
          memberships: { some: { userId: payload.userId } },
        },
      })
    : null;

  return { payload, user, tenant };
}

export async function requireSessionContext() {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ message: 'برای ادامه باید وارد شوید.' }, { status: 401 });
  }
  return session;
}

export async function createAuthSessionForUser(
  user: { id: string; email: string | null; fullName: string; mobile: string | null },
  activeTenantId?: string | null,
) {
  return createAuthToken({
    userId: user.id,
    email: user.email ?? '',
    fullName: user.fullName,
    mobile: user.mobile,
    activeTenantId: activeTenantId ?? null,
  });
}

export function mapAppUser(user: {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  passwordHash: string;
  passwordSalt: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobile: user.mobile,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    passwordHash: user.passwordHash,
    passwordSalt: user.passwordSalt,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
