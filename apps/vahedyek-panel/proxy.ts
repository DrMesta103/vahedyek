import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE, verifyAuthToken } from './app/lib/auth-token';

export async function proxy(request: NextRequest)  {
  const { pathname } = request.nextUrl;

  if  (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('.') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/select-tenant' ||
    pathname.startsWith('/api/auth/')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (payload.state !== 'active' || !payload.tenantId) {
    const selectTenantUrl = new URL('/select-tenant', request.url);
    selectTenantUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(selectTenantUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
