'use client';

import { useState, useEffect } from 'react';

export interface SessionData {
  username: string;
  isLoggedIn: boolean;
}

/**
 * Client-side session check - only checks if token exists
 * Actual verification is done server-side by middleware
 */
export async function verifySession(): Promise<SessionData | null> {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }

  try {
    const token = localStorage.getItem('egesu_session_token');
    if (!token) {
      return null;
    }

    // Make an API call to verify the session server-side
    const response = await fetch('/api/verify-session', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    if (response.ok) {
      const data = await response.json();
      return data.session || null;
    }
    
    return null;
  } catch (error) {
    console.error('Session verification failed:', error);
    localStorage.removeItem('egesu_session_token');
    return null;
  }
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('egesu_session_token');
    localStorage.removeItem('egesu_remembered_username');
    localStorage.removeItem('egesu_remember_me');
    
    // Call the logout API to clear the server-side cookie
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
  }
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
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('egesu_session_token', data.token);
        }
        await checkAuth();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
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