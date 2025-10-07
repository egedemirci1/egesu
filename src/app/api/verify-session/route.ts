import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.APP_SESSION_SECRET || 'fallback-secret-key');

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('egesu_session_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { session: null },
        { status: 200 }
      );
    }

    const { payload } = await jwtVerify(token, secret);
    
    if (payload.isLoggedIn && payload.username) {
      return NextResponse.json({
        session: {
          username: payload.username,
          isLoggedIn: true,
        }
      });
    }
    
    return NextResponse.json({ session: null }, { status: 200 });
  } catch (error) {
    console.error('Session verification failed:', error);
    return NextResponse.json({ session: null }, { status: 200 });
  }
}

