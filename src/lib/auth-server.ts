import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_APP_SESSION_SECRET || 'fallback-secret-key');

export interface SessionData {
  username: string;
  isLoggedIn: boolean;
}

export async function verifySessionServer(request: NextRequest): Promise<SessionData | null> {
  try {
    const token = request.cookies.get('egesu_session_token')?.value;
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);
    
    if (payload.isLoggedIn && payload.username) {
      return {
        username: payload.username as string,
        isLoggedIn: true
      };
    }
    
    return null;
  } catch (error) {
    console.error('Server session verification failed:', error);
    return null;
  }
}
