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
  const token = await new SignJWT({ username, isLoggedIn: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // 24 hours max (but cookie expires when browser closes)
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
  console.log('Login function called with:', { username, password: '***' });
  console.log('Expected username:', APP_USERNAME);
  console.log('Username match:', username === APP_USERNAME);
  console.log('Stored hash:', APP_PASSWORD_HASH);
  console.log('Input password:', password);
  
  if (username !== APP_USERNAME) {
    console.log('Username mismatch');
    return false;
  }

  const result = await bcrypt.compare(password, APP_PASSWORD_HASH);
  console.log('Password match:', result);
  return result;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Rate limiting
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = failedAttempts.get(ip);

  if (!attempt) {
    return true;
  }

  if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
    failedAttempts.delete(ip);
    return true;
  }

  return attempt.count < MAX_ATTEMPTS;
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const attempt = failedAttempts.get(ip);

  if (!attempt) {
    failedAttempts.set(ip, { count: 1, lastAttempt: now });
  } else {
    attempt.count++;
    attempt.lastAttempt = now;
  }
}

export function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}
