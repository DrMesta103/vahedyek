import { NextResponse } from 'next/server';

export const AUTH_COOKIE = 'taav_ai_lab_auth';

export type AuthTokenPayload = {
  userId: string;
  email: string;
  fullName: string;
  mobile?: string | null;
  activeTenantId?: string | null;
};

type JwtPayload = AuthTokenPayload & {
  sub: string;
  iat: number;
  exp: number;
};

const secret = process.env.AUTH_JWT_SECRET ?? 'dev-insecure-jwt-secret-taav-ai-lab';
const secretData = new TextEncoder().encode(secret);
const ACTIVE_TTL = 60 * 60 * 24 * 7;

function toBase64Url(input: string | Uint8Array) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getKey() {
  return crypto.subtle.importKey('raw', secretData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(value: string) {
  const key = await getKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
}

async function verify(value: string, signature: string) {
  const key = await getKey();
  return crypto.subtle.verify('HMAC', key, fromBase64Url(signature), new TextEncoder().encode(value));
}

export async function createAuthToken(payload: AuthTokenPayload) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ACTIVE_TTL;
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = toBase64Url(JSON.stringify({ sub: payload.userId, ...payload, iat, exp } satisfies JwtPayload));
  const unsigned = `${header}.${body}`;
  const token = `${unsigned}.${await sign(unsigned)}`;
  return { token, expiresAt: new Date(exp * 1000) };
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    if (!await verify(`${header}.${body}`, signature)) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Partial<JwtPayload>;
    if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (typeof payload.userId !== 'string') return null;
    if (typeof payload.email !== 'string') return null;
    if (typeof payload.fullName !== 'string') return null;
    return {
      userId: payload.userId,
      email: payload.email,
      fullName: payload.fullName,
      mobile: typeof payload.mobile === 'string' ? payload.mobile : null,
      activeTenantId: typeof payload.activeTenantId === 'string' ? payload.activeTenantId : null,
    };
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, session: { token: string; expiresAt: Date }) {
  response.cookies.set(AUTH_COOKIE, session.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    expires: session.expiresAt,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, '', { path: '/', expires: new Date(0) });
}
