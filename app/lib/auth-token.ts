import { NextResponse } from 'next/server';

export const AUTH_COOKIE = 'vahedyek_auth';

export type AuthTokenState = 'pending' | 'active';

export type AuthTokenPayload = {
  userId: string;
  tenantId: string | null;
  state: AuthTokenState;
};

type JwtPayload = AuthTokenPayload & {
  sub: string;
  iat: number;
  exp: number;
};

const secret = process.env.AUTH_JWT_SECRET ?? process.env.JWT_SECRET ?? 'dev-insecure-jwt-secret-change-me';
const secretData = new TextEncoder().encode(secret);

const PENDING_TTL_SECONDS = 60 * 30;
const ACTIVE_TTL_SECONDS = 60 * 60 * 24 * 7;

function getTtl(state: AuthTokenState) {
  return state === 'active' ? ACTIVE_TTL_SECONDS : PENDING_TTL_SECONDS;
}

function toBase64Url(input: string | Uint8Array) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    'raw',
    secretData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function sign(value: string) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
}

async function verify(value: string, signature: string) {
  const key = await getSigningKey();
  return crypto.subtle.verify('HMAC', key, fromBase64Url(signature), new TextEncoder().encode(value));
}

export async function createAuthToken(payload: AuthTokenPayload) {
  const ttl = getTtl(payload.state);
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = new Date((issuedAt + ttl) * 1000);

  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = toBase64Url(
    JSON.stringify({
      sub: payload.userId,
      userId: payload.userId,
      tenantId: payload.tenantId,
      state: payload.state,
      iat: issuedAt,
      exp: issuedAt + ttl,
    } satisfies JwtPayload),
  );

  const unsigned = `${header}.${body}`;
  const token = `${unsigned}.${await sign(unsigned)}`;

  return { token, expiresAt };
}

export async function verifyAuthToken(token: string) {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;

    const valid = await verify(`${header}.${body}`, signature);
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Partial<JwtPayload>;
    if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (typeof payload.userId !== 'string') return null;
    if (payload.state !== 'active' && payload.state !== 'pending') return null;

    return {
      userId: payload.userId,
      tenantId: typeof payload.tenantId === 'string' ? payload.tenantId : null,
      state: payload.state,
    } satisfies AuthTokenPayload;
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
  response.cookies.set(AUTH_COOKIE, '', {
    path: '/',
    expires: new Date(0),
  });
}
