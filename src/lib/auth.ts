import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(process.env.APP_SESSION_SECRET!);
const APP_USERNAME = process.env.APP_USERNAME!;
const APP_PASSWORD_HASH = process.env.APP_PASSWORD_HASH!;

export interface SessionData {
  username: string;
  isLoggedIn: boolean;
}

export async function createSession(username: string): Promise<string> {
  const token = await new SignJWT({ 
    username, 
    isLoggedIn: true,
    sessionId: Math.random().toString(36).substring(2, 15), // Unique session ID
    createdAt: Date.now()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h') // Reduced to 8 hours for better security
    .sign(secret);

  return token;
}

export async function verifySession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      username: payload.username as string,
      isLoggedIn: payload.isLoggedIn as boolean
    };
  } catch {
    return null;
  }
}

export async function login(username: string, password: string): Promise<boolean> {
  // Only log in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('Login attempt for user:', username);
  }
  
  if (username !== APP_USERNAME) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Username mismatch');
    }
    return false;
  }

  const result = await bcrypt.compare(password, APP_PASSWORD_HASH);
  if (process.env.NODE_ENV === 'development') {
    console.log('Password verification result:', result ? 'success' : 'failed');
  }
  return result;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Rate limiting with improved security
const failedAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>();
const MAX_ATTEMPTS = 3; // Reduced from 5 to 3
const LOCKOUT_DURATION = 30 * 60 * 1000; // Increased to 30 minutes
const MAX_DAILY_ATTEMPTS = 10; // Daily limit per IP
const DAILY_RESET_TIME = 24 * 60 * 60 * 1000; // 24 hours

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = failedAttempts.get(ip);

  if (!attempt) {
    return true;
  }

  // Check if IP is permanently blocked
  if (attempt.blocked) {
    return false;
  }

  // Check if lockout period has expired
  if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
    failedAttempts.delete(ip);
    return true;
  }

  // Check if daily limit exceeded
  if (attempt.count >= MAX_DAILY_ATTEMPTS) {
    attempt.blocked = true;
    return false;
  }

  return attempt.count < MAX_ATTEMPTS;
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const attempt = failedAttempts.get(ip);

  if (!attempt) {
    failedAttempts.set(ip, { count: 1, lastAttempt: now, blocked: false });
  } else {
    attempt.count++;
    attempt.lastAttempt = now;
    
    // Block IP if too many attempts
    if (attempt.count >= MAX_DAILY_ATTEMPTS) {
      attempt.blocked = true;
    }
  }
}

export function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}
