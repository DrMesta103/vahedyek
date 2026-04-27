import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE, verifyAuthToken } from './app/lib/auth-token';

const PUBLIC_PATHS = ['/login', '/register', '/select-tenant'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and API routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Pending session (no tenant) → redirect to select-tenant
  if (payload.state === 'pending' || !payload.tenantId) {
    return NextResponse.redirect(new URL('/select-tenant', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts).*)'],
};
