import { redirect } from 'next/navigation';
import { getSessionContext } from './auth';
import type { AuthTokenPayload } from './auth-token';
import { getTenantForUser, getUserById } from './data';

export async function getOptionalSession(): Promise<AuthTokenPayload | null> {
  const session = await getSessionContext();
  return session?.payload ?? null;
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
