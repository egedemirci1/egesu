import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.APP_SESSION_SECRET || 'fallback-secret-key');

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Server-side credential check
    const APP_USERNAME = process.env.APP_USERNAME || 'admin';
    const APP_PASSWORD_HASH = process.env.APP_PASSWORD_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password

    if (username !== APP_USERNAME) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, APP_PASSWORD_HASH);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token on the server (secure)
    const token = await new SignJWT({ 
      username, 
      isLoggedIn: true,
      sessionId: Math.random().toString(36).substring(2, 15),
      createdAt: Date.now()
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(secret);

    // Set the token in a secure HTTP-only cookie
    const response = NextResponse.json({ success: true, token });
    
    // Set cookie with secure settings
    response.cookies.set('egesu_session_token', token, {
      httpOnly: true, // XSS koruması - JavaScript erişemez
      secure: process.env.NODE_ENV === 'production', // Production'da HTTPS zorunlu
      sameSite: 'lax', // CSRF koruması
      maxAge: 8 * 60 * 60, // 8 saat
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}