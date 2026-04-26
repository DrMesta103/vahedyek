import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import { AUTH_COOKIE, AuthTokenPayload, clearAuthCookie, createAuthToken, setAuthCookie, verifyAuthToken } from './auth-token';

export { AUTH_COOKIE, clearAuthCookie, createAuthToken, setAuthCookie, verifyAuthToken } from './auth-token';

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

export async function createPendingSession(userId: string) {
  return createAuthToken({
    userId,
    tenantId: null,
    state: 'pending',
  });
}

export async function createSession(userId: string, tenantId: string) {
  return createAuthToken({
    userId,
    tenantId,
    state: 'active',
  });
}

export async function destroySession(_: string) {
  return;
}

export async function getAuthContextFromPayload(payload: AuthTokenPayload) {
  const user = await prisma.appUser.findUnique({
    where: { id: payload.userId },
  });

  if (!user) return null;

  const tenant = payload.tenantId
    ? await prisma.tenant.findUnique({
        where: { id: payload.tenantId },
      })
    : null;

  return {
    userId: user.id,
    tenantId: tenant?.id ?? null,
    state: payload.state,
    user,
    tenant,
  };
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
  return getAuthContextFromPayload(payload);
}

export async function requireSessionContext() {
  const session = await getSessionContext();
  if (!session || !session.tenantId || !session.tenant || session.state !== 'active') {
    return NextResponse.json({ message: 'برای استفاده از سامانه باید وارد شوید.' }, { status: 401 });
  }

  return session as typeof session & { tenantId: string; tenant: NonNullable<typeof session.tenant> };
}
