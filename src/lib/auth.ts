'use client';

import { useState, useEffect } from 'react';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_APP_SESSION_SECRET || 'fallback-secret-key');
const APP_USERNAME = process.env.NEXT_PUBLIC_APP_USERNAME || 'admin';
const APP_PASSWORD_HASH = process.env.NEXT_PUBLIC_APP_PASSWORD_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password

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
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }

  try {
    const token = localStorage.getItem('egesu_session_token');
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
    console.error('Session verification failed:', error);
    localStorage.removeItem('egesu_session_token');
    return null;
  }
}

export async function login(username: string, password: string): Promise<boolean> {
  try {
    // Check credentials
    if (username !== APP_USERNAME) {
      return false;
    }

    const isValidPassword = await bcrypt.compare(password, APP_PASSWORD_HASH);
    if (!isValidPassword) {
      return false;
    }

    // Create session token
    const token = await createSession(username);
    
    // Store in localStorage and cookie
    if (typeof window !== 'undefined') {
      localStorage.setItem('egesu_session_token', token);
      
      // Set cookie for middleware
      document.cookie = `egesu_session_token=${token}; path=/; max-age=${8 * 60 * 60}; secure; samesite=lax`;
    }

    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('egesu_session_token');
    
    // Clear cookie for middleware
    document.cookie = 'egesu_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Client-side auth hook

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SessionData | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await verifySession();
      if (session) {
        setIsAuthenticated(true);
        setUser(session);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (username: string, password: string) => {
    const success = await login(username, password);
    if (success) {
      await checkAuth();
    }
    return success;
  };

  const logoutUser = async () => {
    await logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login: loginUser,
    logout: logoutUser,
    checkAuth
  };
}