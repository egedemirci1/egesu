import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { securityHeaders } from './middleware-security';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and API routes
  if (pathname === '/login' || pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    return securityHeaders(response);
  }

  // Check session
  const session = await verifySession();

  if (!session?.isLoggedIn) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return securityHeaders(response);
  }

  const response = NextResponse.next();
  return securityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
