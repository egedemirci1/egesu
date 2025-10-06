import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { securityHeaders } from './middleware-security';

const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_APP_SESSION_SECRET || 'fallback-secret-key');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and login page
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/') ||
    pathname === '/login'
  ) {
    const response = NextResponse.next();
    return securityHeaders(response);
  }

  // Check session from cookie
  const token = request.cookies.get('egesu_session_token')?.value;

  if (!token) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return securityHeaders(response);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.isLoggedIn || !payload.username) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      return securityHeaders(response);
    }

    // Session is valid, continue
    const response = NextResponse.next();
    return securityHeaders(response);
  } catch (error) {
    console.error('Session verification failed in middleware:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    return securityHeaders(response);
  }
}

export const config = {
  matcher: [
    // Temporarily disable middleware to fix API issues
    // '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};