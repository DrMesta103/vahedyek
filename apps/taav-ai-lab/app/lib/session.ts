import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE, type AuthTokenPayload, verifyAuthToken } from './auth-token';
import { getTenantForUser, getUserById } from './simulator-store';

export async function getOptionalSession(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export async function requireSession() {
  const session = await getOptionalSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function getCurrentUser() {
  const session = await getOptionalSession();
  if (!session) return null;
  return getUserById(session.userId);
}

export async function getCurrentTenant() {
  const session = await getOptionalSession();
  if (!session?.activeTenantId) return null;
  return getTenantForUser(session.userId, session.activeTenantId);
}
