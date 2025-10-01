import { NextRequest, NextResponse } from 'next/server';
import { login, createSession, checkRateLimit, recordFailedAttempt, clearFailedAttempts } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Login attempt started');
    }
    const { username, password } = await request.json();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Login attempt for user:', username);
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Verify credentials
    const isValid = await login(username, password);

    if (!isValid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(ip);

    // Create session
    const token = await createSession(username);

    // Set HTTP-only cookie (expires when browser closes)
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      // No maxAge or expires - cookie will be session cookie (expires when browser closes)
    });

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
